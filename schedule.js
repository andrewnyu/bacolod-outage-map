/* Bacolod outage map — SCHEDULE (rewritten by .github/workflows/refresh.yml).
 * Do not hand-edit; the refresh job overwrites this file.
 * Geometry lives in geo.js and is never touched by the job.
 */

const SCHEDULE = {
  fetchedAt: "2026-10-28T10:52:54.525Z",
  sourceDate: "28 October 2026",
  source: { url: "https://www.facebook.com/photo.php?fbid=122237458508048473", label: "View the source post on Facebook" },
  rotation: {
    date: "Wednesday, October 28, 2026",
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
    "Talisay Feeder 3": { s: 15, e: 17, label: "3:00PM – 5:00PM" },
    "Alijis Feeder 8": { s: 16, e: 18, label: "4:00PM – 6:00PM" },
    "Sum-ag Feeder 2": { s: 16, e: 18, label: "4:00PM – 6:00PM" },
    "Alijis Feeder 1": { s: 17, e: 19, label: "5:00PM – 7:00PM" },
    "Alijis Feeder 2": { s: 17, e: 19, label: "5:00PM – 7:00PM" },
    "Mountain View Feeder 6": { s: 17, e: 19, label: "5:00PM – 7:00PM" },
    "Reclamation Feeder 3": { s: 17, e: 19, label: "5:00PM – 7:00PM" },
    "Mountain View Feeder 3": { s: 18, e: 20, label: "6:00PM – 8:00PM" },
    "Reclamation Feeder 1": { s: 18, e: 20, label: "6:00PM – 8:00PM" },
    "Talisay Feeder 2": { s: 18, e: 20, label: "6:00PM – 8:00PM" },
    "Alijis Feeder 4": { s: 19, e: 21, label: "7:00PM – 9:00PM" },
    "Alijis Feeder 6": { s: 19, e: 21, label: "7:00PM – 9:00PM" },
  },
  scheduled: [
    {
      "date": "Wednesday, October 28, 2026",
      "window": "7:00AM to 5:00PM",
      "feeders": [
        "Alijis Feeder 6"
      ],
      "cause": "Conversion of existing single - phase primary lines to three phase.",
      "areas": [
        "Portion of Hda. Kasantolan, Purok Gensoli, Purok Canumayan, Brgy. Vesta Alegre , Bacolod City."
      ]
    }
  ],
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
