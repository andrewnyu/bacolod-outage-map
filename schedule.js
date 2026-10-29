/* Bacolod outage map — SCHEDULE (rewritten by .github/workflows/refresh.yml).
 * Do not hand-edit; the refresh job overwrites this file.
 * Geometry lives in geo.js and is never touched by the job.
 */

const SCHEDULE = {
  fetchedAt: "2026-10-29T11:10:18.032Z",
  sourceDate: "29 October 2026",
  source: { url: "https://www.facebook.com/photo.php?fbid=122237585174048473", label: "View the source post on Facebook" },
  rotation: {
    date: "Thursday, October 29, 2026",
    redAlert: "5:00PM – 8:00PM",
    yellowAlert: "8:00PM – 10:00PM",
    available: "2,255 MW",
    demand: "2,432 MW",
    reason:
      "Visayas coal plants TVI 1 and PEDC 3 are unavailable, with limited or zero power import from the Mindanao grid.",
  },
  window: { start: 14, end: 23 },
  // canonical feeder name -> rotational brownout slot
  slots: {
    "Sum-ag Feeder 2": { s: 16, e: 18, label: "4:00PM – 6:00PM" },
    "Talisay Feeder 3": { s: 16, e: 18, label: "4:00PM – 6:00PM" },
    "Alijis Feeder 4": { s: 17, e: 19, label: "5:00PM – 7:00PM" },
    "Reclamation Feeder 1": { s: 17, e: 19, label: "5:00PM – 7:00PM" },
    "Reclamation Feeder 3": { s: 17, e: 19, label: "5:00PM – 7:00PM" },
    "Talisay Feeder 2": { s: 17, e: 19, label: "5:00PM – 7:00PM" },
    "Alijis Feeder 3": { s: 18, e: 20, label: "6:00PM – 8:00PM" },
    "Asdes-Gonzaga Feeder 3": { s: 18, e: 20, label: "6:00PM – 8:00PM" },
    "Alijis Feeder 8": { s: 19, e: 21, label: "7:00PM – 9:00PM" },
    "Asdes-Gonzaga Feeder 2": { s: 19, e: 21, label: "7:00PM – 9:00PM" },
    "Asdes-Gonzaga Feeder 6": { s: 19, e: 21, label: "7:00PM – 9:00PM" },
  },
  scheduled: [],
  completed: {
    "date": "Sunday, 6 September 2026",
    "restoredAt": "6:37 PM",
    "feeders": [
      "Mountain View Feeder 1",
      "Mountain View Feeder 2",
      "Mountain View Feeder 3",
      "Mountain View Feeder 4",
      "Mountain View Feeder 5",
      "Mountain View Feeder 6"
    ],
    "cause": [
      "Mt. View Substation preventive maintenance & old relay isolation",
      "69kV pole (2) replacement along Buri Rd. near Villa Estanzia & Magdalene Ville",
      "Primary pole replacement along GM Cordova, Buri & Lacson Sts. (6 double-circuit poles)",
      "Primary pole (4) relocation from Citadines to North Tourist-Inn",
      "Massive tree clearing along Aguinaldo St."
    ]
  },
};
