// Triggers the GitHub Actions "Refresh outage data" workflow via workflow_dispatch.
// The client-side refresh button calls this endpoint. It checks the last page
// check (data/schedule.json's checkedAt) and only fires if more than 30 minutes
// have passed, to avoid hammering the scraper. Without a token, it degrades to
// a read-only "check latest snapshot" response instead of returning a 500.
//
// Environment variables (set in Vercel project settings):
//   GITHUB_TOKEN  — a fine-grained PAT with "Actions: write" on the repo
//   GH_OWNER      — GitHub repo owner (default: andrewnyu)
//   GH_REPO       — GitHub repo name  (default: bacolod-outage-map)
//   GH_WORKFLOW   — workflow file     (default: refresh.yml)

const OWNER    = process.env.GH_OWNER    || 'andrewnyu';
const REPO     = process.env.GH_REPO     || 'bacolod-outage-map';
const WORKFLOW = process.env.GH_WORKFLOW || 'refresh.yml';
const TOKEN    = process.env.GITHUB_TOKEN || '';

const THIRTY_MIN = 30 * 60 * 1000;

function json(status, body){
  return {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body),
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // Read the runtime snapshot from the repo's default branch. This is public,
  // so checking for fresh data does not require a GitHub credential.
  let snapshot = null;
  try {
    const rawRes = await fetch(
      `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/data/schedule.json`,
      { cache: 'no-store', headers: { 'User-Agent': 'bacolod-outage-map' } }
    );
    if (rawRes.ok) {
      snapshot = await rawRes.json();
    }
  } catch (e) {
    // fall through — we'll attempt the trigger anyway
  }

  const checkedAt = snapshot && (snapshot.checkedAt || snapshot.fetchedAt);
  if (checkedAt) {
    const age = Date.now() - new Date(checkedAt).getTime();
    if (age < THIRTY_MIN) {
      const mins = Math.floor(age / 60000);
      return res.status(200).json({
        ok: true,
        throttled: true,
        snapshot,
        message: `Negros Power was checked ${mins} min ago. Skipping another scrape (30-min cooldown).`,
        checkedAt,
      });
    }
  }

  if (!TOKEN) {
    return res.status(200).json({
      ok: true,
      triggered: false,
      snapshot,
      message: snapshot
        ? 'Loaded the latest automatic check. On-demand scraping is not configured.'
        : 'On-demand scraping is not configured and the latest snapshot could not be loaded.',
    });
  }

  // Trigger workflow_dispatch
  const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW}/dispatches`;
  const apiRes = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ref: 'main' }),
  });

  if (!apiRes.ok) {
    const errText = await apiRes.text().catch(() => '');
    return res.status(502).json({
      ok: false,
      error: `GitHub API returned ${apiRes.status}: ${errText}`,
    });
  }

  return res.status(200).json({
    ok: true,
    triggered: true,
    message: 'Refresh started. This page will update when the new check is ready.',
    checkedAt,
  });
}
