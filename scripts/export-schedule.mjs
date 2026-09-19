/* Export the generated JavaScript schedule as JSON for the production app.
 *
 * schedule.js remains the checked-in/offline fallback. The JSON snapshot is
 * what production reads at runtime, so a successful scraper run is visible
 * without waiting for another Vercel deployment.
 *
 * Usage: node scripts/export-schedule.mjs [schedule.js] [raw.json] [out.json]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const SCHEDULE_FILE = process.argv[2] || 'schedule.js';
const RAW_FILE = process.argv[3] || 'data/raw-latest.json';
const OUT_FILE = process.argv[4] || 'data/schedule.json';

const scheduleSource = readFileSync(SCHEDULE_FILE, 'utf8');
const raw = JSON.parse(readFileSync(RAW_FILE, 'utf8'));
const schedule = Function(`"use strict";\n${scheduleSource}\nreturn SCHEDULE;`)();

const snapshot = {
  ...schedule,
  // checkedAt advances even when Negros Power has not published a newer
  // parsable rotation. fetchedAt continues to identify the advisory data.
  checkedAt: raw.fetchedAt,
  capture: {
    posts: Array.isArray(raw.posts) ? raw.posts.length : 0,
    photos: Array.isArray(raw.photos) ? raw.photos.length : 0,
  },
};

mkdirSync(dirname(OUT_FILE), { recursive: true });
writeFileSync(OUT_FILE, JSON.stringify(snapshot, null, 2) + '\n');
console.log(`wrote ${OUT_FILE} — checked ${snapshot.checkedAt}, advisory ${snapshot.fetchedAt}`);
