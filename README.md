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

**It is a frozen snapshot.** There is no cron job and no automatic refresh — the
data is fixed at the 6 September scrape. `negrospower.ph/power-advisories` is
stale (last entries 2024) and defers to Facebook, and Facebook serves only the
2 newest posts and 8 newest photos to logged-out visitors, so a refresh is real
work rather than a scheduled one-liner.

**The map draws two different kinds of claim, deliberately styled apart.**

*Shaded areas* exist only where Negros Power published a street-level list. Each
polygon is the convex hull of the named places in that list, geocoded against
OpenStreetMap and buffered ~320m, with points more than 3km from the median
dropped as bad geocodes. They come from the utility's own text.

*Circular pins* are real OpenStreetMap `power=substation` features operated by
CENECO / Negros Power. A pin marks where those feeders **originate**. It is not a
coverage area — Negros Power has not published which streets they serve, so no
shape is drawn for them.

**How accurate is it?** Of 18 landmarks whose true feeder is known from the
advisory text, the polygons place **14 unambiguously, 4 in overlapping pairs, and
none wrong**. Adjacent feeders genuinely interleave, so some overlap is real
rather than error. An earlier circle-based version scored 7 / 11 / 0 on the same
test, and returned an outright wrong feeder for Lopue's Mandalagan and the
Redemptorist Church.

**Locate never guesses.** If your position falls inside more than one feeder
area, the app lists every candidate and says it cannot tell which is yours,
rather than picking the nearest and presenting it as fact. The area lists are the
authority; the outlines are an aid.

**Alijis, Talisay, Lopez and Hilangban are not on the map at all.** They appear
in the published rotation but have no area list and no substation in
OpenStreetMap. Nothing grounds them, so they are listed with their times and left
off — 14 of the 33 published feeder slots. An honest gap beats a confident error.

**Always confirm before planning around it.** Rotation schedules change at short
notice with grid conditions and NGCP directives.
Hotline (034) 705-6372 · 0917 683 7250 · customercare@negrospower.ph

## Structure

No build step, no dependencies to install.

| file | what |
|---|---|
| `index.html` | the whole app — markup, styles, logic |
| `data.js` | the scraped snapshot: polygons, substations, rotation slots |

Leaflet is loaded from a CDN; tiles are standard OpenStreetMap, inverted in CSS
for dark mode.

Run it locally with any static server:

```bash
python3 -m http.server 8931
```

## Deploying

Pushes to `main` deploy automatically to Vercel.
