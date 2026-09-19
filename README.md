# Bacolod Outage Map

Live: **https://bacolod-outage-map.vercel.app**

A one-page map of Negros Power feeder outages across the Bacolod metro. Drag the
time scrubber from 2PM to 11PM and watch zones turn red as their feeders drop;
tap a zone, search your subdivision, or hit locate to find which feeder is yours.

**This is unofficial.** It is not operated by or affiliated with Negros Power.

## What the data is

Two sources:

### Current advisories

Automatically checked twice daily from the official
[Negros Power Facebook page](https://www.facebook.com/negrospowerph). The
pipeline reads scheduled-outage posts and OCRs NGCP red-alert rotation
graphics. Production loads the latest checked-in JSON snapshot at runtime, so
new outage data does not require a Vercel redeploy.

The original September 2026 snapshot covered:

- **Sun 6 Sep 2026** planned works across Mountain View feeders MF1–MF6 (restored 6:37PM)
- **Tue 8 Sep 2026** scheduled outage on Murcia Feeder 3 (Kumaliskis / Don Salvador Benedicto)
- **Sat 5 Sep 2026** rotational brownout (manual load dropping) rotation — 33 feeder
  slots, used as the working pattern for the next red-alert evening

The rotation exists because Visayas coal plants TVI 1 and PEDC 3 were unavailable
with limited or zero import from the Mindanao grid — 2,255MW available against
2,432MW peak demand.

### Feeder coverage album (March 2025)

Transcribed from the Negros Power
[Feeder Coverage Update as of March 5, 2025](https://www.facebook.com/share/p/1GxSiuTSTE/)
Facebook post. Contains published area lists for **30 feeders** across 10 substation
families: Alijis (AF1–AF8), Asdes-Gonzaga (AGF1–7), Reclamation (RF1–5), Burgos
(BF1–4), Mountain View (MF1–5), Talisay (TF1–3), Murcia (MUF1–4), Hilangban
(HF1–4), Lopez (LF1–3), and a handful of individual cards. The app shows this text
when you tap any feeder — tap "Published coverage" to expand it.

Coverage lists are historical (early 2025) and feeder assignments may have changed.
Use the most recent Negros Power advisory when they conflict.

## Honest limits

**It is an automated, best-effort snapshot.** GitHub Actions checks at 1PM and
5PM Philippine time. Facebook can change its logged-out markup or block a data
center runner, so the app displays both the latest page-check time and the
advisory-data time. Expired rotation slots are cleared rather than presented as
current. Always verify important plans with Negros Power.

The **Check updates** button loads the newest automatic snapshot immediately.
If production has a fine-grained `GITHUB_TOKEN` with Actions write access, it
also starts an on-demand scrape (limited to once per 30 minutes) and waits for
the new check. Without that optional token, the button remains a read-only
latest-data check instead of failing.

**The map draws three kinds of claim, deliberately styled apart.**

*Shaded areas* exist only where Negros Power published a street-level list. Each
polygon is the convex hull of the named places in that list, geocoded against
OpenStreetMap and buffered ~320m, with points more than 3km from the median
dropped as bad geocodes. They come from the utility's own text.

*Filled circular pins* are real OpenStreetMap `power=substation` features operated
by CENECO / Negros Power. A pin marks where those feeders **originate**. It is not
a coverage area — the streets they serve extend far from the substation point.

*Hollow/dashed pins* mark feeder families that have published coverage lists but
whose substation is not in OpenStreetMap. The position is approximate (Alijis,
Talisay) or uncertain (Burgos, Lopez, Hilangban).

**How accurate are the polygons?** Of 18 landmarks whose true feeder is known from
the advisory text, the MF1–MF6 polygons place **14 unambiguously, 4 in overlapping
pairs, and none wrong**. Adjacent feeders genuinely interleave, so some overlap is
real rather than error.

**Locate never guesses.** If your position falls inside more than one feeder
area, the app lists every candidate and says it cannot tell which is yours,
rather than picking the nearest and presenting it as fact. The area lists are the
authority; the outlines are an aid.

**Always confirm before planning around it.** Rotation schedules change at short
notice with grid conditions and NGCP directives.
Hotline (034) 705-6372 · 0917 683 7250 · customercare@negrospower.ph

## Structure

No build step, no dependencies to install.

| file | what |
|---|---|
| `index.html` | the whole app — markup, styles, logic |
| `geo.js` | geometry: polygons (published areas), substation pins, approximate pins |
| `coverage.js` | feeder area lists from the March 2025 album |
| `schedule.js` | rotation slots, scheduled outages, completed works |
| `data/coverage-2025/` | saved card images from the coverage album |

Leaflet is loaded from a CDN; tiles are standard OpenStreetMap, inverted in CSS
for dark mode.

Run it locally with any static server:

```bash
python3 -m http.server 8931
```

### Scripts

| script | what |
|---|---|
| `scripts/scrape.mjs` | fetch latest posts & photos from the Negros Power FB page (needs Playwright) |
| `scripts/parse.mjs` | parse rotation slots from the raw scrape into `schedule.js` |
| `scripts/export-schedule.mjs` | export `data/schedule.json` for production runtime loading |
| `scripts/geocode-coverage.mjs` | geocode coverage text via Nominatim → hull polygon candidates |
| `scripts/geocode-streets.mjs` | improved geocoder with street-name extraction (for downtown feeders) |

## Deploying

Pushes to `main` deploy automatically to Vercel.
