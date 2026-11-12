/* Bacolod outage map — SCHEDULE (rewritten by .github/workflows/refresh.yml).
 * Do not hand-edit; the refresh job overwrites this file.
 * Geometry lives in geo.js and is never touched by the job.
 */

const SCHEDULE = {
  fetchedAt: "2026-11-12T13:23:26.551Z",
  sourceDate: "15 November 2026",
  source: { url: "https://www.facebook.com/negrospowerph", label: "View the Negros Power Facebook page" },
  rotation: {
    date: "Friday, October 30, 2026",
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
  },
  scheduled: [
    {
      "date": "Thursday, November 12, 2026",
      "window": "8:00AM to 5:00PM",
      "feeders": [
        "Alijis Feeder 8"
      ],
      "cause": "Reconductoring of 5 span dilapidated secondary lines into 4/0 All aluminum conductors.",
      "areas": [
        "Portion along B11, L14, Torrecampo Village, Brgy. Cabug, Bacolod City."
      ]
    },
    {
      "date": "Sunday, November 15, 2026",
      "window": "8:00AM to 5:00PM",
      "feeders": [
        "Murcia Feeder 4"
      ],
      "cause": "Replacement of 4 rotten primary wood pole with its accessories",
      "areas": [
        "Prk. Maasin, Brgy. Dulao, Bago City."
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
