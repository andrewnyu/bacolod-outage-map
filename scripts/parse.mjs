/* Turn raw scraped Facebook content into schedule.js.
 *
 * Deliberately conservative. It only rewrites schedule.js when it is confident,
 * and it never touches geo.js — the hand-verified polygons and substations are
 * not derived from this pipeline and must survive a bad scrape.
 *
 * What it can parse reliably:
 *   - rotational brownout slots, e.g. "Alijis Feeder 2  2PM TO 4PM"
 *   - scheduled interruption headline dates
 * What it cannot: free-form Hiligaynon/English advisory prose and the long
 * street lists. Those still need a human, and the job says so rather than
 * silently dropping them.
 *
 * Usage: node scripts/parse.mjs data/raw-latest.json schedule.js
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const RAW = process.argv[2] || 'data/raw-latest.json';
const OUT = process.argv[3] || 'schedule.js';

const FAMILIES = ['Mountain View', 'Alijis', 'Asdes-Gonzaga', 'Hilangban', 'Lopez',
                  'Murcia', 'Panaogao', 'Reclamation', 'Sum-ag', 'Talisay'];

// "Asdes-Gonzaga" also appears as "Asdes Gonzaga" / "Asbes Gonzaga"; "Sum-ag" as "Sumag".
function canonFamily(s) {
  const n = s.toLowerCase().replace(/[^a-z]/g, '');
  for (const f of FAMILIES) {
    const c = f.toLowerCase().replace(/[^a-z]/g, '');
    if (n === c) return f;
  }
  if (n === 'asbesgonzaga' || n === 'asdesgonzaga') return 'Asdes-Gonzaga';
  if (n === 'sumag') return 'Sum-ag';
  if (n === 'mountainview' || n === 'mtview') return 'Mountain View';
  return null;
}

// Tesseract reads the advisory tables cleanly but reliably mangles "11PM".
function fixOcr(s) {
  return s
    .replace(/\b[TIl1]{2}\s*PM\b/g, '11PM')
    .replace(/\bTO\s*PM\b/g, 'TO 11PM')
    .replace(/\u00a0/g, ' ');
}

// Facebook's own alt-text scrambles the feeder/time pairing, so OCR the saved
// image instead. Falls back silently if tesseract is unavailable.
function ocr(file) {
  try {
    return execFileSync('tesseract', [file, '-', '--psm', '6'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 60000 });
  } catch { return ''; }
}

const to24 = (h, ap) => (parseInt(h, 10) % 12) + (/pm/i.test(ap) ? 12 : 0);
const label = (h1, a1, h2, a2) =>
  `${parseInt(h1,10)}:00${a1.toUpperCase()} – ${parseInt(h2,10)}:00${a2.toUpperCase()}`;

const FEEDER_TIME = new RegExp(
  '(Mountain\\s*View|Alijis|As[bd]es[\\s-]*Gonzaga|Hilangban|Lopez|Murcia|Panaogao|' +
  'Reclamation|Sum[\\s-]?ag|Talisay)\\s*Feeder\\s*(\\d+)\\s*[^0-9A-Za-z]{0,6}' +
  '(\\d{1,2})\\s*(?::00)?\\s*(AM|PM)\\s*(?:TO|to|–|—|-)\\s*(\\d{1,2})\\s*(?::00)?\\s*(AM|PM)',
  'gi');

const MONTHS = ['january','february','march','april','may','june','july',
                'august','september','october','november','december'];

// The photos tab holds SEVERAL days of advisories at once. Merging them silently
// blends one day's times into another's, so every rotation must be attributed to
// the date printed on its own graphic and only the newest day may be published.
function advisoryDate(text) {
  const m = text.match(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s*(\d{4})/i);
  if (!m) return null;
  const mo = MONTHS.indexOf(m[1].toLowerCase());
  if (mo < 0) return null;
  const d = new Date(Date.UTC(+m[3], mo, +m[2]));
  return { key: d.toISOString().slice(0, 10), ts: d.getTime(),
           pretty: `${m[1]} ${+m[2]}, ${m[3]}` };
}

function parseSlots(entries) {
  const byDate = new Map(), unknown = new Set(), undated = [];
  for (const { text: t, src } of entries) {
    const date = advisoryDate(t);
    const found = [];
    let m;
    FEEDER_TIME.lastIndex = 0;
    while ((m = FEEDER_TIME.exec(t))) {
      const fam = canonFamily(m[1]);
      if (!fam) { unknown.add(m[1]); continue; }
      const s = to24(m[3], m[4]), e = to24(m[5], m[6]);
      if (e <= s) continue;                      // never wraps midnight in practice
      found.push([`${fam} Feeder ${parseInt(m[2], 10)}`,
                  { s, e, label: label(m[3], m[4], m[5], m[6]) }]);
    }
    if (!found.length) continue;
    if (!date) { undated.push(found.length); continue; }   // cannot attribute — drop
    if (!byDate.has(date.key)) byDate.set(date.key, { date, slots: {}, sources: [] });
    var entry = byDate.get(date.key);
    Object.assign(entry.slots, Object.fromEntries(found));
    if (src && !entry.sources.some(function(s2){ return s2.kind === src.kind && s2.fbid === src.fbid; })) {
      entry.sources.push(src);
    }
  }
  return { byDate, unknown: [...unknown], undated };
}

function parseScheduled(texts) {
  const out = [];
  for (const t of texts) {
    const dateMatch = t.match(
      /SCHEDULED\s+POWER\s+INTERRUPTION\s*:?\s*(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s*(\d{4})/i);
    if (!dateMatch) continue;

    const month = MONTHS.indexOf(dateMatch[1].toLowerCase());
    const date = new Date(Date.UTC(+dateMatch[3], month, +dateMatch[2]));
    const key = date.toISOString().slice(0, 10);
    const pretty = date.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
    });

    const reasonMatch = t.match(/Reason\s*:\s*([\s\S]*?)\s*Time\s*&\s*Affected\s+Areas\s*:/i);
    const cause = reasonMatch
      ? reasonMatch[1].replace(/^[\s●•-]+/gm, '').replace(/\s*;\s*\n/g, '; ')
          .replace(/\s*\n\s*/g, '; ').replace(/;\s*and\s*;/gi, '; ')
          .replace(/\s+/g, ' ').trim().replace(/;$/, '')
      : 'See the Negros Power advisory for the stated reason';

    const bodyMatch = t.match(/Time\s*&\s*Affected\s+Areas\s*:\s*([\s\S]*)/i);
    if (!bodyMatch) continue;

    let current = null;
    for (const rawLine of bodyMatch[1].split(/\n+/)) {
      const line = rawLine.trim();
      const time = line.match(
        /^(\d{1,2}:\d{2}\s*(?:AM|PM)\s+to\s+\d{1,2}:\d{2}\s*(?:AM|PM)(?:\s*&\s*\d{1,2}:\d{2}\s*(?:AM|PM)\s+to\s+\d{1,2}:\d{2}\s*(?:AM|PM))?)/i);
      if (time) {
        current = { key, date: pretty, window: time[1].replace(/\s+/g, ' '), feeders: [], cause, areas: [] };
        out.push(current);
        continue;
      }
      if (!current) continue;

      const area = line.match(/^(?:Whole|Portion)\s+of\s+([A-Z-]+\s*\d+)\s*-\s*(.+)$/i);
      if (!area) continue;
      const feeder = feederNameFromCode(area[1]);
      if (feeder && !current.feeders.includes(feeder)) current.feeders.push(feeder);
      current.areas.push(area[2].trim());
    }
  }
  return out.filter(s => s.feeders.length);
}

function feederNameFromCode(value) {
  const m = value.toUpperCase().replace(/\s+/g, '').match(/^([A-Z-]+?)(\d+)$/);
  if (!m) return null;
  const families = {
    AF: 'Alijis', AGF: 'Asdes-Gonzaga', BF: 'Burgos', HF: 'Hilangban',
    LF: 'Lopez', MF: 'Mountain View', MUF: 'Murcia', PF: 'Panaogao',
    RF: 'Reclamation', SF: 'Sum-ag', TF: 'Talisay',
  };
  return families[m[1]] ? `${families[m[1]]} Feeder ${parseInt(m[2], 10)}` : null;
}

function phtDateKey(value) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(value));
  const get = type => parts.find(p => p.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

// ---------------------------------------------------------------------------
const raw = JSON.parse(readFileSync(RAW, 'utf8'));

let ocrCount = 0;
const ocrTexts = (raw.photos || []).map(p => {
  if (!p.file || !existsSync(p.file)) return '';
  const t = ocr(p.file);
  if (t.trim()) ocrCount++;
  return t;
});
console.log(`OCR: ${ocrCount}/${(raw.photos || []).length} images read`);

// Tag every text with where it came from, so whichever date's rotation wins
// can link straight back to the Facebook post or photo that stated it.
const entries = [
  ...raw.posts.map(t => ({ text: t, src: { kind: 'post' } })),
  ...raw.photos.map(p => ({ text: p.alt, src: { kind: 'photo', fbid: p.fbid } })),
  ...raw.photos.map((p, i) => ({ text: ocrTexts[i], src: { kind: 'photo', fbid: p.fbid } })),
].filter(e => e.text).map(e => ({ ...e, text: fixOcr(e.text) }));

if (!entries.length) {
  console.error('FAILED: raw capture contained no text. schedule.js left untouched.');
  process.exit(1);
}

const { byDate, unknown, undated } = parseSlots(entries);
const scheduled = parseScheduled(raw.posts);

const days = [...byDate.values()].sort((a, b) => b.date.ts - a.date.ts);
console.log(`read ${entries.length} texts; rotations found for ` +
  (days.length ? days.map(d => `${d.date.pretty} (${Object.keys(d.slots).length})`).join(', ')
               : 'no dated advisory'));
if (undated.length) console.log(`ignored ${undated.length} undated block(s) — cannot attribute to a day`);
if (unknown.length) console.log('unrecognised feeder families: ' + unknown.join(', '));
scheduled.forEach(s => console.log(`scheduled interruption: ${s.date}, ${s.window}`));

const newest = days[0] || null;
const checkDate = phtDateKey(raw.fetchedAt);
const activeRotation = newest && newest.date.key >= checkDate ? newest : null;
const slots = activeRotation ? activeRotation.slots : {};
if (activeRotation) {
  console.log(`publishing ${activeRotation.date.pretty} only`);
} else if (newest) {
  console.log(`latest rotation (${newest.date.pretty}) is expired on ${checkDate}; publishing no active slots`);
} else {
  console.log(`no rotation published for ${checkDate}; publishing no active slots`);
}

// Prefer a link straight to the specific photo that stated this rotation;
// fall back to the page itself if it only ever showed up in plain post text.
function sourceFor(day) {
  if (!day) return null;
  var photo = (day.sources || []).find(function(s){ return s.kind === 'photo' && s.fbid; });
  if (photo) {
    return { url: `https://www.facebook.com/photo.php?fbid=${photo.fbid}`,
             label: 'View the source post on Facebook' };
  }
  if ((day.sources || []).length) {
    return { url: raw.url, label: 'View the Negros Power Facebook page' };
  }
  return null;
}
const source = sourceFor(activeRotation) || (scheduled.length
  ? { url: raw.url, label: 'View the Negros Power Facebook page' }
  : null);
if (source) console.log('source: ' + source.url);

// Refuse to publish a rotation that looks broken. A real red-alert rotation is
// dozens of slots; a handful means the markup changed and we half-read it.
const MIN_SLOTS = 8;
const prev = readFileSync(OUT, 'utf8');
const prevCount = (prev.match(/^\s{4}"/gm) || []).length;
let prevSchedule = {};
try {
  prevSchedule = Function(`"use strict";\n${prev}\nreturn SCHEDULE;`)();
} catch (error) {
  console.error(`FAILED: could not read existing schedule.js: ${error.message}`);
  process.exit(1);
}

if (Object.keys(slots).length > 0 && Object.keys(slots).length < MIN_SLOTS) {
  console.error(
    `FAILED: only ${Object.keys(slots).length} slots parsed (need >= ${MIN_SLOTS}). ` +
    `Keeping the existing ${prevCount}. This usually means no rotation was published ` +
    `today, or Facebook changed its markup — check data/raw-latest.json.`
  );
  process.exit(2);          // 2 = nothing usable, distinct from a crash
}

function displayDateKey(value) {
  return advisoryDate(value)?.key || '';
}

// Keep future scheduled interruptions that may have scrolled off Facebook's
// two-post logged-out view, replace dates found in the new scrape, and drop
// anything already in the past.
const newScheduledDates = new Set(scheduled.map(s => s.key));
const scheduledToPublish = [
  ...(prevSchedule.scheduled || [])
    .map(s => ({ ...s, key: displayDateKey(s.date) }))
    .filter(s => s.key >= checkDate && !newScheduledDates.has(s.key)),
  ...scheduled.filter(s => s.key >= checkDate),
].map(({ key, ...s }) => s);

const cur = JSON.parse(JSON.stringify({
  fetchedAt: raw.fetchedAt,
  slots,
  source,
}));

// Fall back to whatever the previous file already had if this run found no
// usable source (e.g. a re-parse of an old capture) -- never regress to nothing.
const sourceLiteral = cur.source
  ? `{ url: ${JSON.stringify(cur.source.url)}, label: ${JSON.stringify(cur.source.label)} }`
  : JSON.stringify(prevSchedule.source || null);

const lines = [];
lines.push('/* Bacolod outage map — SCHEDULE (rewritten by .github/workflows/refresh.yml).');
lines.push(' * Do not hand-edit; the refresh job overwrites this file.');
lines.push(' * Geometry lives in geo.js and is never touched by the job.');
lines.push(' */');
lines.push('');
lines.push('const SCHEDULE = {');
lines.push(`  fetchedAt: "${cur.fetchedAt}",`);
const sourceDate = activeRotation
  ? new Date(activeRotation.date.ts).toLocaleDateString('en-GB',
      { year:'numeric', month:'long', day:'numeric', timeZone:'UTC' })
  : scheduled.length
    ? new Date(`${scheduled[0].key}T00:00:00Z`).toLocaleDateString('en-GB',
        { year:'numeric', month:'long', day:'numeric', timeZone:'UTC' })
  : (prevSchedule.sourceDate || '');
lines.push(`  sourceDate: ${JSON.stringify(sourceDate)},`);
lines.push(`  source: ${sourceLiteral},`);
lines.push('  rotation: {');
const rotDate = activeRotation
  ? `"${new Date(activeRotation.date.ts).toLocaleDateString('en-US',
      { weekday:'long', year:'numeric', month:'long', day:'numeric', timeZone:'UTC' })}"`
  : JSON.stringify(prevSchedule.rotation?.date || 'No current rotation published');
lines.push(`    date: ${rotDate},`);
['redAlert', 'yellowAlert', 'available', 'demand'].forEach(k =>
  lines.push(`    ${k}: ${JSON.stringify(prevSchedule.rotation?.[k] || '')},`));
lines.push('    reason:');
lines.push(`      ${JSON.stringify(prevSchedule.rotation?.reason || '')},`);
lines.push('  },');
lines.push('  window: { start: 14, end: 23 },');
lines.push('  // canonical feeder name -> rotational brownout slot');
lines.push('  slots: {');
Object.keys(cur.slots)
  .sort((a, b) => cur.slots[a].s - cur.slots[b].s || a.localeCompare(b))
  .forEach(k => {
    const v = cur.slots[k];
    lines.push(`    "${k}": { s: ${v.s}, e: ${v.e}, label: "${v.label}" },`);
  });
lines.push('  },');

// Serialize structured values instead of slicing JavaScript with a regex. The
// old regex could swallow the following property and duplicate `completed`.
const scheduledValue = JSON.stringify(scheduledToPublish, null, 2).replace(/\n/g, '\n  ');
lines.push(`  scheduled: ${scheduledValue},`);
if (prevSchedule.completed !== undefined) {
  const completedValue = JSON.stringify(prevSchedule.completed, null, 2).replace(/\n/g, '\n  ');
  lines.push(`  completed: ${completedValue},`);
}
lines.push('};');

const next = lines.join('\n') + '\n';
if (next === prev) { console.log('no change'); process.exit(0); }
writeFileSync(OUT, next);
console.log(`wrote ${OUT} — ${Object.keys(cur.slots).length} slots (was ${prevCount})`);
