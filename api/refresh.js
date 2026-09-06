// Triggers the GitHub Actions "Refresh outage data" workflow via workflow_dispatch.
// The client-side refresh button calls this endpoint. It checks how long ago
// the data was last fetched (from schedule.js's fetchedAt) and only fires if
// more than 30 minutes have passed, to avoid hammering the scraper.
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

  if (!TOKEN) {
    return res.status(500).json({
      ok: false,
      error: 'Server missing GITHUB_TOKEN. Set it in Vercel env vars.',
    });
  }

  // Read the current schedule.js fetchedAt from the repo's default branch
  // via the GitHub raw-content API (no auth needed for public repos).
  let fetchedAt = null;
  try {
    const rawRes = await fetch(
      `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/schedule.js`
    );
    if (rawRes.ok) {
      const text = await rawRes.text();
      const m = text.match(/fetchedAt:\s*"([^"]+)"/);
      if (m) fetchedAt = m[1];
    }
  } catch (e) {
    // fall through — we'll attempt the trigger anyway
  }

  if (fetchedAt) {
    const age = Date.now() - new Date(fetchedAt).getTime();
    if (age < THIRTY_MIN) {
      const mins = Math.floor(age / 60000);
      return res.status(200).json({
        ok: true,
        throttled: true,
        message: `Data was updated ${mins} min ago. Skipping refresh (30-min cooldown).`,
        fetchedAt,
      });
    }
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
    message: 'Refresh triggered. New data should be live in 2-5 minutes.',
    fetchedAt,
  });
}
