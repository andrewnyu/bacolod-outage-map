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

function parseSlots(texts) {
  const byDate = new Map(), unknown = new Set(), undated = [];
  for (const t of texts) {
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
    if (!byDate.has(date.key)) byDate.set(date.key, { date, slots: {} });
    Object.assign(byDate.get(date.key).slots, Object.fromEntries(found));
  }
  return { byDate, unknown: [...unknown], undated };
}

function parseScheduled(texts) {
  const out = [];
  for (const t of texts) {
    const m = t.match(/SCHEDULED\s+POWER\s+INTERRUPTION\s*:?\s*([A-Z]+\s+\d{1,2},\s*\d{4})/i);
    if (m) out.push({ headline: m[1], text: t });
  }
  return out;
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

const texts = [...raw.posts, ...raw.photos.map(p => p.alt), ...ocrTexts]
  .filter(Boolean).map(fixOcr);
if (!texts.length) {
  console.error('FAILED: raw capture contained no text. schedule.js left untouched.');
  process.exit(1);
}

const { byDate, unknown, undated } = parseSlots(texts);
const scheduled = parseScheduled(raw.posts);

const days = [...byDate.values()].sort((a, b) => b.date.ts - a.date.ts);
console.log(`read ${texts.length} texts; rotations found for ` +
  (days.length ? days.map(d => `${d.date.pretty} (${Object.keys(d.slots).length})`).join(', ')
               : 'no dated advisory'));
if (undated.length) console.log(`ignored ${undated.length} undated block(s) — cannot attribute to a day`);
if (unknown.length) console.log('unrecognised feeder families: ' + unknown.join(', '));
scheduled.forEach(s => console.log('scheduled interruption headline: ' + s.headline));

const newest = days[0] || null;
const slots = newest ? newest.slots : {};
if (newest) console.log(`publishing ${newest.date.pretty} only`);

// Refuse to publish a rotation that looks broken. A real red-alert rotation is
// dozens of slots; a handful means the markup changed and we half-read it.
const MIN_SLOTS = 8;
const prev = readFileSync(OUT, 'utf8');
const prevCount = (prev.match(/^\s{4}"/gm) || []).length;

if (Object.keys(slots).length < MIN_SLOTS) {
  console.error(
    `FAILED: only ${Object.keys(slots).length} slots parsed (need >= ${MIN_SLOTS}). ` +
    `Keeping the existing ${prevCount}. This usually means no rotation was published ` +
    `today, or Facebook changed its markup — check data/raw-latest.json.`
  );
  process.exit(2);          // 2 = nothing usable, distinct from a crash
}

const cur = JSON.parse(JSON.stringify({
  fetchedAt: raw.fetchedAt,
  slots,
}));

// keep whatever the previous file declared for the things we cannot parse
const keep = k => (prev.match(new RegExp(`${k}:\\s*("[^"]*")`)) || [])[1] || '""';

const lines = [];
lines.push('/* Bacolod outage map — SCHEDULE (rewritten by .github/workflows/refresh.yml).');
lines.push(' * Do not hand-edit; the refresh job overwrites this file.');
lines.push(' * Geometry lives in geo.js and is never touched by the job.');
lines.push(' */');
lines.push('');
lines.push('const SCHEDULE = {');
lines.push(`  fetchedAt: "${cur.fetchedAt}",`);
lines.push(`  sourceDate: ${keep('sourceDate')},`);
lines.push('  rotation: {');
const rotDate = newest
  ? `"${new Date(newest.date.ts).toLocaleDateString('en-US',
      { weekday:'long', year:'numeric', month:'long', day:'numeric', timeZone:'UTC' })}"`
  : keep('date');
lines.push(`    date: ${rotDate},`);
['redAlert', 'yellowAlert', 'available', 'demand'].forEach(k =>
  lines.push(`    ${k}: ${keep(k)},`));
lines.push('    reason:');
lines.push('      "Visayas coal plants TVI 1 and PEDC 3 are unavailable, with limited or zero " +');
lines.push('      "power import from the Mindanao grid.",');
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

// carry the previous scheduled / completed blocks through verbatim — the parser
// is not confident enough to rewrite prose and street lists
const carry = name => {
  const m = prev.match(new RegExp(`  ${name}: ([\\s\\S]*?\\n  \\},?)\\n`));
  return m ? `  ${name}: ${m[1]}` : null;
};
[carry('scheduled'), carry('completed')].forEach(b => { if (b) lines.push(b); });
lines.push('};');

const next = lines.join('\n') + '\n';
if (next === prev) { console.log('no change'); process.exit(0); }
writeFileSync(OUT, next);
console.log(`wrote ${OUT} — ${Object.keys(cur.slots).length} slots (was ${prevCount})`);
