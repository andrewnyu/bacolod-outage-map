#!/usr/bin/env node
/**
 * Geocode feeder coverage areas from coverage.js → candidate ZONES entries.
 *
 * For each feeder in COVERAGE.feeders that has a published text list:
 *   1. Extract individual place tokens from the comma/semicolon-delimited text.
 *   2. Query the Nominatim OSM geocoder (search.openstreetmap.org) for each
 *      place within the Negros Occidental viewbox.
 *   3. Discard points > OUTLIER_KM from the feeder's median.
 *   4. Compute the convex hull and buffer ~320 m.
 *   5. Emit a JSON block suitable for copy-pasting into geo.js.
 *
 * Usage:
 *   node scripts/geocode-coverage.mjs [feeder-name-pattern]
 *
 * Examples:
 *   node scripts/geocode-coverage.mjs                      # all feeders
 *   node scripts/geocode-coverage.mjs "Burgos"             # Burgos feeders only
 *   node scripts/geocode-coverage.mjs "Alijis Feeder 1"    # one feeder
 *
 * Output: stdout (JSON array of zone objects) + progress on stderr.
 * Nominatim rate-limit: 1 req/s. ~30 places × N feeders takes a few minutes.
 *
 * Requires: Node ≥ 18 (native fetch).
 */
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');

// ── Load coverage.js by eval (it declares a const COVERAGE = {...})
const coverageSrc = readFileSync(join(ROOT, 'coverage.js'), 'utf8');
let COVERAGE;
{ const fn = new Function('', coverageSrc + '; return COVERAGE;'); COVERAGE = fn(); }

// ── Load existing geo.js to avoid re-geocoding feeders that already have
// published polygons in ZONES
const geoSrc = readFileSync(join(ROOT, 'geo.js'), 'utf8');
let ZONES;
{ const fn = new Function('', geoSrc + '; return ZONES;'); ZONES = fn(); }

const existingPublished = new Set(
  ZONES.filter(z => z.confidence === 'published' && z.kind === 'area')
       .flatMap(z => z.feeders)
);

// ── Config
const VIEWBOX = '122.80,10.40,123.10,10.90'; // lon_min,lat_min,lon_max,lat_max (Negros Occ)
const OUTLIER_KM = 8;    // drop geocodes this far from median
const BUFFER_DEG = 0.003; // ~330 m buffer applied to hull points
const RATE_MS = 1100;    // Nominatim asks for max 1 req/s

// ── Filter pattern from argv
const pattern = process.argv[2] ? process.argv[2].toLowerCase() : '';

// ── Helpers
const sleep = ms => new Promise(r => setTimeout(r, ms));

function median(arr) {
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function haversineKm(a, b) {
  const R = 6371, dLat = (b[0] - a[0]) * Math.PI / 180,
        dLon = (b[1] - a[1]) * Math.PI / 180,
        la = a[0] * Math.PI / 180, lb = b[0] * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(la) * Math.cos(lb) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/** Cross product of vectors OA and OB */
function cross(O, A, B) {
  return (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0]);
}

/** Andrew's monotone chain convex hull. pts = [[lat,lon], ...] */
function convexHull(pts) {
  if (pts.length < 3) return pts;
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const lower = [];
  for (const pt of p) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], pt) <= 0)
      lower.pop();
    lower.push(pt);
  }
  const upper = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const pt = p[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], pt) <= 0)
      upper.pop();
    upper.push(pt);
  }
  upper.pop(); lower.pop();
  return lower.concat(upper);
}

/** Offset each hull vertex outward by BUFFER_DEG (crude flat-earth buffer) */
function bufferHull(hull) {
  if (hull.length < 3) return hull;
  const cx = hull.reduce((s, p) => s + p[0], 0) / hull.length;
  const cy = hull.reduce((s, p) => s + p[1], 0) / hull.length;
  return hull.map(([lat, lon]) => {
    const dlat = lat - cx, dlon = lon - cy;
    const dist = Math.sqrt(dlat * dlat + dlon * dlon) || 1e-9;
    return [+(lat + BUFFER_DEG * dlat / dist).toFixed(5),
            +(lon + BUFFER_DEG * dlon / dist).toFixed(5)];
  });
}

/** Parse comma/semicolon text into candidate place queries */
function parsePlaces(text) {
  return text
    .split(/[,;]/)
    .map(s => s.trim())
    // drop short noise and pure parenthetical qualifiers
    .filter(s => s.length > 4 && !/^\(/.test(s))
    // strip inline qualifiers like "from X to Y", "portion of"
    .map(s => s.replace(/\bfrom\b.*/i, '').replace(/\bportion\s+of\b/i, '').trim())
    .filter(s => s.length > 3)
    // drop generic tokens unlikely to geocode
    .filter(s => !/^(prk\.|purok|hda\.|brgy\.?\s*\d|zone\s*\d|ph\s*(i+|\d))/i.test(s) || s.length > 10)
    // remove duplicates
    .filter((v, i, a) => a.indexOf(v) === i);
}

async function nominatim(query) {
  const url = `https://nominatim.openstreetmap.org/search?` +
    `q=${encodeURIComponent(query + ', Negros Occidental, Philippines')}` +
    `&format=json&limit=1&viewbox=${VIEWBOX}&bounded=1` +
    `&accept-language=en`;
  const res = await fetch(url, { headers: { 'User-Agent': 'BacolodOutageMap/1.0 (https://github.com/andrewnyu/bacolod-outage)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data[0] ? { lat: +data[0].lat, lon: +data[0].lon, display: data[0].display_name } : null;
}

// ── Main
const results = [];
const feeders = Object.entries(COVERAGE.feeders)
  .filter(([name]) => !pattern || name.toLowerCase().includes(pattern));

for (const [feederName, fc] of feeders) {
  if (existingPublished.has(feederName)) {
    process.stderr.write(`[skip] ${feederName} — already has a published polygon\n`);
    continue;
  }

  process.stderr.write(`\n[geocode] ${feederName}\n`);
  const places = parsePlaces(fc.text);
  process.stderr.write(`  ${places.length} place tokens\n`);

  const points = [];
  for (const place of places) {
    await sleep(RATE_MS);
    try {
      const r = await nominatim(place);
      if (r) {
        process.stderr.write(`  ✓ ${place} → ${r.lat.toFixed(4)},${r.lon.toFixed(4)}\n`);
        points.push([r.lat, r.lon]);
      } else {
        process.stderr.write(`  ✗ ${place} — no result\n`);
      }
    } catch (e) {
      process.stderr.write(`  ! ${place} — ${e.message}\n`);
    }
  }

  if (points.length < 3) {
    process.stderr.write(`  → only ${points.length} points, skipping (need ≥ 3)\n`);
    continue;
  }

  // Remove outliers beyond OUTLIER_KM from median
  const medLat = median(points.map(p => p[0]));
  const medLon = median(points.map(p => p[1]));
  const filtered = points.filter(p => haversineKm([medLat, medLon], p) <= OUTLIER_KM);
  const dropped = points.length - filtered.length;
  if (dropped) process.stderr.write(`  dropped ${dropped} outlier(s)\n`);

  if (filtered.length < 3) {
    process.stderr.write(`  → only ${filtered.length} points after filtering, skipping\n`);
    continue;
  }

  const hull = convexHull(filtered);
  const buffered = bufferHull(hull);
  const center = [
    +(filtered.reduce((s, p) => s + p[0], 0) / filtered.length).toFixed(5),
    +(filtered.reduce((s, p) => s + p[1], 0) / filtered.length).toFixed(5),
  ];
  // close the ring
  const poly = [...buffered, buffered[0]];

  // Derive a short ID from the feeder name, e.g. "Alijis Feeder 1" → "af1"
  const id = feederName.toLowerCase()
    .replace(/\s+feeder\s+/, 'f').replace(/[^a-z0-9]/g, '').replace(/feeder/, 'f');

  // Family name for short display
  const familyMatch = feederName.match(/^(.+)\s+Feeder\s+(\d+)$/);
  const short = familyMatch
    ? familyMatch[1].split(' ').map(w => w[0]).join('') + 'F' + familyMatch[2]
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
  process.stderr.write(`  → hull ${hull.length} vertices, center ${center}\n`);
}

process.stdout.write(JSON.stringify(results, null, 2) + '\n');
process.stderr.write(`\nDone. ${results.length} new zone(s) emitted to stdout.\n`);
process.stderr.write('Review the JSON, then paste the relevant entries into geo.js.\n');
