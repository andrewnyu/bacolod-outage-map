# Bacolod Outage Map

Live: **https://bacolod-outage-map.vercel.app**

A one-page map of Negros Power feeder outages across the Bacolod metro. Drag the
time scrubber from 2PM to 11PM and watch zones turn red as their feeders drop;
tap a zone, search your subdivision, or hit locate to find which feeder is yours.

**This is unofficial.** It is not operated by or affiliated with Negros Power.

## What the data is

Scraped on **6 September 2026** from the official
[Negros Power Facebook page](https://www.facebook.com/negrospowerph) — the
scheduled-outage posts plus the NGCP red-alert rotation graphics. It covers:

- **Sun 6 Sep 2026** planned works across Mountain View feeders MF1–MF6 (restored 6:37PM)
- **Tue 8 Sep 2026** scheduled outage on Murcia Feeder 3 (Kumaliskis / Don Salvador Benedicto)
- **Sat 5 Sep 2026** rotational brownout (manual load dropping) rotation — 33 feeder
  slots, used as the working pattern for the next red-alert evening

The rotation exists because Visayas coal plants TVI 1 and PEDC 3 were unavailable
with limited or zero import from the Mindanao grid — 2,255MW available against
2,432MW peak demand.

## Honest limits

**It is a frozen snapshot.** It does not update itself. `negrospower.ph/power-advisories`
is stale (last entries 2024) and defers to Facebook, and Facebook serves only the
2 newest posts and 8 newest photos to logged-out visitors — so a refresh is real
work, not a cron one-liner.

**The circles are approximations, not service boundaries.** Negros Power does not
publish feeder boundary polygons. Every zone *centre* is geocoded against a real
OpenStreetMap place, but the radii are estimates. A circle means "roughly this
area." Zones overlap, and the app says so when your location falls in more than one.

**Four feeder families are deliberately not drawn.** Asdes-Gonzaga, Hilangban,
Lopez and Panaogao appear in the published rotation but could not be tied to any
real place — they are substation names OSM does not know. Rather than place a
shape in a plausible-looking but wrong spot, they are listed with their times
under "feeders we could not put on the map." An honest gap beats a confident error.

**Always confirm before planning around it.** Rotation schedules change at short
notice with grid conditions and NGCP directives.
Hotline (034) 705-6372 · 0917 683 7250 · customercare@negrospower.ph

## Structure

No build step, no dependencies to install.

| file | what |
|---|---|
| `index.html` | the whole app — markup, styles, logic |
| `data.js` | the scraped snapshot: zones, coordinates, rotation slots |

Leaflet is loaded from a CDN; tiles are standard OpenStreetMap, inverted in CSS
for dark mode.

Run it locally with any static server:

```bash
python3 -m http.server 8931
```

## Deploying

Pushes to `main` deploy automatically to Vercel.
