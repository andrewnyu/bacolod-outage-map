#!/usr/bin/env node
/**
 * Improved geocoder focused on street-name-rich feeders (Asdes-Gonzaga,
 * Reclamation, etc.) where OSM has good street coverage of Bacolod City.
 *
 * Improvements over geocode-coverage.mjs:
 *  - Parses street references like "Gonzaga St (Substation - Lacson St)" → "Gonzaga Street, Bacolod"
 *  - Adds building/institution names as alternative queries
 *  - Uses city-scoped search (Bacolod or Bago or Silay depending on feeder family)
 *  - Emits detailed per-point commentary for manual review
 *
 * Usage: node scripts/geocode-streets.mjs [feeder-name-pattern]
 * Output: stdout = JSON zone array, stderr = progress
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');

const coverageSrc = readFileSync(join(ROOT, 'coverage.js'), 'utf8');
let COVERAGE; { const fn = new Function('', coverageSrc + '; return COVERAGE;'); COVERAGE = fn(); }
const geoSrc = readFileSync(join(ROOT, 'geo.js'), 'utf8');
let ZONES; { const fn = new Function('', geoSrc + '; return ZONES;'); ZONES = fn(); }

const existingPublished = new Set(
  ZONES.filter(z => z.confidence === 'published' && z.kind === 'area').flatMap(z => z.feeders)
);

// Negros Occidental bounding box [lat_min, lat_max, lon_min, lon_max]
const BBOX = { latMin: 10.30, latMax: 10.95, lonMin: 122.70, lonMax: 123.20 };
const VIEWBOX = `${BBOX.lonMin},${BBOX.latMin},${BBOX.lonMax},${BBOX.latMax}`;
const OUTLIER_KM = 5;
const BUFFER_DEG = 0.003;
const RATE_MS = 1500;

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Determine city context from feeder family
function cityFor(feederName) {
  if (/Lopez/i.test(feederName)) return 'Silay City, Negros Occidental, Philippines';
  if (/Hilangban/i.test(feederName)) return 'Bago City, Negros Occidental, Philippines';
  if (/Murcia/i.test(feederName) && !/Feeder [12]/.test(feederName)) return 'Murcia, Negros Occidental, Philippines';
  return 'Bacolod City, Negros Occidental, Philippines';
}

// Extract candidate geocoding queries from coverage text.
// Prioritises named streets ("Gonzaga St", "Lacson St"), then institutions,
// then strips down to the bare name.
function extractQueries(text) {
  const queries = new Set();
  const city = ''; // we'll add city when geocoding

  // 1. Street-name patterns: "Gonzaga St.", "Mabini Street", etc.
  const streetRe = /\b([\w\s-]+?)\s+(?:St\.?|Street|Ave\.?|Avenue|Road|Rd\.?|Drive|Dr\.?|Blvd|Boulevard|Highway|Hwy|Lane)\b/gi;
  let m;
  while ((m = streetRe.exec(text))) {
    const name = m[0].trim().replace(/[,;]$/, '');
    if (name.length > 4 && name.length < 50) queries.add(name);
  }

  // 2. Known landmark types: hospitals, malls, schools, churches, hotels
  const landmarkRe = /\b([\w\s'-]+?)\s+(?:Hospital|Mall|University|College|Church|School|Elem(?:entary)?\s*Sch|High\s*Sch|Hotel|Academy|Complex|Center|Centre|Port|Market|Terminal|Stadium|Resort|Building|Bldg|Plaza)/gi;
  while ((m = landmarkRe.exec(text))) {
    const name = m[0].trim().replace(/[,;]$/, '');
    if (name.length > 4 && name.length < 60) queries.add(name);
  }

  // 3. Named places after splitting on commas/semicolons
  text.split(/[,;]/)
    .map(s => s.trim().replace(/^portion\s+of\s*/i, '').replace(/\s*\([^)]*\)/g, '').trim())
    .filter(s => s.length > 4 && s.length < 60)
    .filter(s => !/^(from|prk\.|purok|hda\.|brgy\.\s*\d|zone\s*\d|ph\s*(i+|\d)|portion)/i.test(s))
    .forEach(s => queries.add(s));

  return [...queries].filter((v, i, a) => a.indexOf(v) === i);
}

function median(arr) {
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m-1] + s[m]) / 2;
}

function haversineKm(a, b) {
  const R = 6371, dLat = (b[0]-a[0])*Math.PI/180, dLon = (b[1]-a[1])*Math.PI/180;
  const la = a[0]*Math.PI/180, lb = b[0]*Math.PI/180;
  const x = Math.sin(dLat/2)**2 + Math.cos(la)*Math.cos(lb)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}

function cross(O, A, B) {
  return (A[0]-O[0])*(B[1]-O[1]) - (A[1]-O[1])*(B[0]-O[0]);
}

function convexHull(pts) {
  if (pts.length < 3) return pts;
  const p = [...pts].sort((a, b) => a[0]-b[0] || a[1]-b[1]);
  const lower = [];
  for (const pt of p) {
    while (lower.length >= 2 && cross(lower[lower.length-2], lower[lower.length-1], pt) <= 0) lower.pop();
    lower.push(pt);
  }
  const upper = [];
  for (let i = p.length-1; i >= 0; i--) {
    const pt = p[i];
    while (upper.length >= 2 && cross(upper[upper.length-2], upper[upper.length-1], pt) <= 0) upper.pop();
    upper.push(pt);
  }
  upper.pop(); lower.pop();
  return lower.concat(upper);
}

function bufferHull(hull) {
  if (hull.length < 3) return hull;
  const cx = hull.reduce((s,p) => s+p[0], 0)/hull.length;
  const cy = hull.reduce((s,p) => s+p[1], 0)/hull.length;
  return hull.map(([lat, lon]) => {
    const dlat = lat-cx, dlon = lon-cy;
    const dist = Math.sqrt(dlat*dlat + dlon*dlon) || 1e-9;
    return [+(lat + BUFFER_DEG*dlat/dist).toFixed(5), +(lon + BUFFER_DEG*dlon/dist).toFixed(5)];
  });
}

async function nominatim(query, city) {
  const q = encodeURIComponent(`${query}, ${city}`);
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`
            + `&viewbox=${VIEWBOX}&bounded=1&accept-language=en`;
  // Retry once on 429 with backoff
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await sleep(3000);
    const res = await fetch(url, { headers: { 'User-Agent': 'BacolodOutageMap/1.0 geocode-streets' }});
    if (res.status === 429) {
      process.stderr.write('  [rate limited — waiting 5s]\n');
      await sleep(5000);
      continue;
    }
    if (!res.ok) return null;
    const data = await res.json();
    if (data[0]) return { lat: +data[0].lat, lon: +data[0].lon, display: data[0].display_name };
    break;
  }

  // Retry without bounding box if bounded search returned nothing
  await sleep(300);
  const url2 = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&accept-language=en`;
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await sleep(3000);
    const res2 = await fetch(url2, { headers: { 'User-Agent': 'BacolodOutageMap/1.0 geocode-streets' }});
    if (res2.status === 429) { await sleep(5000); continue; }
    if (!res2.ok) return null;
    const data2 = await res2.json();
    if (!data2[0]) return null;
    const lat = +data2[0].lat, lon = +data2[0].lon;
    if (lat < BBOX.latMin || lat > BBOX.latMax || lon < BBOX.lonMin || lon > BBOX.lonMax) return null;
    return { lat, lon, display: data2[0].display_name };
  }
  return null;
}

const pattern = process.argv[2] ? process.argv[2].toLowerCase() : '';
const results = [];

const feeders = Object.entries(COVERAGE.feeders)
  .filter(([name]) => !pattern || name.toLowerCase().includes(pattern));

for (const [feederName, fc] of feeders) {
  if (existingPublished.has(feederName)) {
    process.stderr.write(`[skip] ${feederName} — already has a published polygon\n`);
    continue;
  }

  const city = cityFor(feederName);
  process.stderr.write(`\n[geocode] ${feederName} (city: ${city})\n`);
  const queries = extractQueries(fc.text);
  process.stderr.write(`  ${queries.length} queries\n`);

  const points = [];
  for (const q of queries) {
    await sleep(RATE_MS);
    try {
      const r = await nominatim(q, city);
      if (r) {
        process.stderr.write(`  ✓ ${q.substring(0, 40).padEnd(40)} → ${r.lat.toFixed(4)},${r.lon.toFixed(4)}\n`);
        points.push([r.lat, r.lon]);
      } else {
        process.stderr.write(`  ✗ ${q.substring(0, 60)}\n`);
      }
    } catch(e) {
      process.stderr.write(`  ! ${q} — ${e.message}\n`);
    }
  }

  if (points.length < 3) {
    process.stderr.write(`  → only ${points.length} points, skipping\n`);
    continue;
  }

  const medLat = median(points.map(p => p[0]));
  const medLon = median(points.map(p => p[1]));
  const filtered = points.filter(p => haversineKm([medLat, medLon], p) <= OUTLIER_KM);
  const dropped = points.length - filtered.length;
  if (dropped) process.stderr.write(`  dropped ${dropped} outlier(s)\n`);

  if (filtered.length < 3) {
    process.stderr.write(`  → only ${filtered.length} after filtering, skipping\n`);
    continue;
  }

  const hull = convexHull(filtered);
  const buffered = bufferHull(hull);
  const center = [
    +(filtered.reduce((s,p) => s+p[0], 0)/filtered.length).toFixed(5),
    +(filtered.reduce((s,p) => s+p[1], 0)/filtered.length).toFixed(5),
  ];
  const poly = [...buffered, buffered[0]];

  const id = feederName.toLowerCase()
    .replace(/\s+feeder\s+/, 'f').replace(/[^a-z0-9]/g, '');

  const familyMatch = feederName.match(/^(.+)\s+Feeder\s+(\d+)$/);
  const short = familyMatch
    ? familyMatch[1].split(/[\s-]/).map(w => w[0].toUpperCase()).join('') + 'F' + familyMatch[2]
    : feederName;

  const zone = {
    id,
    name: feederName,
    short,
    kind: 'area',
    confidence: 'published',
    hullPoints: filtered.length,
    feeders: [feederName],
    center,
    poly,
    areas: fc.text.split(/[,;]/).map(s => s.trim()).filter(s => s.length > 3),
  };

  results.push(zone);
  process.stderr.write(`  → hull ${hull.length} pts, buffered, center [${center}]\n`);
}

process.stdout.write(JSON.stringify(results, null, 2) + '\n');
process.stderr.write(`\nDone. ${results.length} new zone(s) emitted.\n`);
