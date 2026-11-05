/* Bacolod outage map — SCHEDULE (rewritten by .github/workflows/refresh.yml).
 * Do not hand-edit; the refresh job overwrites this file.
 * Geometry lives in geo.js and is never touched by the job.
 */

const SCHEDULE = {
  fetchedAt: "2026-11-05T12:49:55.722Z",
  sourceDate: "5 November 2026",
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
      "date": "Saturday, November 7, 2026",
      "window": "8:00AM to 5:00PM",
      "feeders": [
        "Talisay Feeder 3"
      ],
      "cause": "Rehabilitaion of 12-spans secondary line and upgrading of 1-25KVa to 1-37.5kva common Distribution Transformer.",
      "areas": [
        "Portion of Zone 5, Hda. Bocboc, Hda.  Angeles, Brgy. Concepcion, Talisay City."
      ]
    },
    {
      "date": "Thursday, November 5, 2026",
      "window": "8:00AM to 5:00PM",
      "feeders": [
        "Mountain View Feeder 6"
      ],
      "cause": "Replacement of one 30ft. dilapidated wood pole into one 40ft. steel pole and removal of one 30ft. Dilapidated wooden pole and transfer its attachments to adjacent secondary steel pole.",
      "areas": [
        "Portion along Prk. Bayabasan, Brgy. Bata, Bacolod City."
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
