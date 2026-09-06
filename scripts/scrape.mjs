/* Fetch the latest public content from the Negros Power Facebook page.
 *
 * Facebook shows logged-out visitors a login wall and serves only the 2 newest
 * posts plus the 8 newest photos. We do NOT log in. We dismiss the overlay in
 * the DOM and read what was already served publicly.
 *
 * This is inherently fragile: Facebook changes its markup often and frequently
 * challenges datacenter IPs like GitHub Actions runners. That is why this script
 * writes raw output and exits non-zero when it captures nothing — a failed run
 * is loud and leaves the previous good data untouched. It must never write an
 * empty or partial snapshot over data that is currently correct.
 *
 * Usage: node scripts/scrape.mjs [outfile]
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const URL = 'https://www.facebook.com/negrospowerph';
const OUT = process.argv[2] || 'data/raw-latest.json';
const IMGDIR = process.argv[3] || 'data/img';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Strip the login dialog and unlock scrolling. Re-run on mutation: Facebook
// re-inserts the wall as you scroll.
const NUKE = `(() => {
  const kill = () => {
    document.querySelectorAll('div[role="dialog"]').forEach(d => d.remove());
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    document.body.style.position = 'static';
  };
  kill();
  if (!window.__nuking) {
    window.__nuking = true;
    new MutationObserver(kill).observe(document.body, { childList: true, subtree: true });
  }
  let n = 0;
  document.querySelectorAll('div[role="button"],span[role="button"]').forEach(b => {
    if (/^see more$/i.test((b.innerText || '').trim())) { b.click(); n++; }
  });
  return n;
})()`;

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function grab(page, url, scrolls) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(3500);
  for (let i = 0; i < scrolls; i++) {
    await page.evaluate(NUKE).catch(() => {});
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)).catch(() => {});
    await sleep(1600);
  }
  await page.evaluate(NUKE).catch(() => {});
  await sleep(800);
}

const main = async () => {
  const browser = await chromium.launch({ args: ['--disable-blink-features=AutomationControlled'] });
  const ctx = await browser.newContext({
    userAgent: UA,
    locale: 'en-PH',
    viewport: { width: 1280, height: 2200 },
  });
  const page = await ctx.newPage();
  const result = { fetchedAt: new Date().toISOString(), url: URL, posts: [], photos: [], notes: [] };

  try {
    // ---- posts -------------------------------------------------------------
    await grab(page, URL, 4);
    result.posts = await page.evaluate(() => {
      const sel = 'div[data-ad-comet-preview="message"],div[data-ad-preview="message"]';
      return Array.from(document.querySelectorAll(sel))
        .map(e => (e.innerText || '').replace(/\s*See less\s*$/i, '').trim())
        .filter(t => t.length > 40);
    });

    // ---- photo advisories --------------------------------------------------
    // Most outage graphics are images; Facebook's own auto alt-text OCRs them.
    await grab(page, URL + '/photos', 5);
    result.photos = await page.evaluate(() => {
      const out = [], seen = new Set();
      document.querySelectorAll('a[href*="fbid"]').forEach(a => {
        const img = a.querySelector('img');
        if (!img) return;
        const fbid = (a.href.match(/fbid=(\d+)/) || [])[1];
        if (!fbid || seen.has(fbid)) return;
        seen.add(fbid);
        // drop the thumbnail crop so we fetch the largest version offered
        out.push({ fbid, alt: img.alt || '', src: (img.src || '').replace(/&ctp=s\d+x\d+/, '') });
      });
      return out;
    });

    // Download the graphics. Facebook's own alt-text OCR scrambles the
    // feeder/time table ("Murcia Feeder 6PM 6PM"); running tesseract over the
    // real image recovers it cleanly, so the files matter more than the alt.
    mkdirSync(IMGDIR, { recursive: true });
    for (const p of result.photos) {
      if (!p.src) continue;
      try {
        const buf = await (await ctx.request.get(p.src, { timeout: 30000 })).body();
        const file = join(IMGDIR, p.fbid + '.jpg');
        writeFileSync(file, buf);
        p.file = file;
      } catch (e) { result.notes.push(`image ${p.fbid}: ${e.message}`); }
    }
  } catch (err) {
    result.notes.push('capture error: ' + err.message);
  } finally {
    await browser.close();
  }

  const loggedOut = result.posts.length === 0 && result.photos.length === 0;
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(result, null, 1));

  const got = result.photos.filter(p => p.file).length;
  console.log(`posts: ${result.posts.length}  photos: ${result.photos.length}  images saved: ${got}`);
  result.notes.forEach(n => console.log('note: ' + n));

  if (loggedOut) {
    console.error(
      'FAILED: captured nothing. Facebook most likely blocked this runner or ' +
      'changed its markup. Existing data has been left untouched.'
    );
    process.exit(1);
  }
  console.log('wrote ' + OUT);
};

main().catch(e => { console.error('FATAL: ' + e.stack); process.exit(1); });
