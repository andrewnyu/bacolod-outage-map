// Return the latest schedule snapshot committed by the GitHub Actions scraper.
// Production calls this at page load and from the refresh button, so data can
// advance independently from Vercel deployments.

const OWNER = process.env.GH_OWNER || 'andrewnyu';
const REPO = process.env.GH_REPO || 'bacolod-outage-map';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/data/schedule.json`;

  try {
    const upstream = await fetch(url, {
      cache: 'no-store',
      headers: { 'User-Agent': 'bacolod-outage-map' },
    });
    if (!upstream.ok) {
      return res.status(502).json({
        ok: false,
        error: `Schedule source returned ${upstream.status}`,
      });
    }

    const snapshot = await upstream.json();
    if (!snapshot || !snapshot.fetchedAt || !snapshot.checkedAt || !snapshot.slots) {
      return res.status(502).json({ ok: false, error: 'Schedule snapshot is invalid' });
    }

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(200).json(snapshot);
  } catch (error) {
    return res.status(502).json({
      ok: false,
      error: `Could not load the latest schedule: ${error.message}`,
    });
  }
}
