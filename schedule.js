/* Bacolod outage map — SCHEDULE (rewritten by .github/workflows/refresh.yml).
 * Do not hand-edit; the refresh job overwrites this file.
 * Geometry lives in geo.js and is never touched by the job.
 */

const SCHEDULE = {
  fetchedAt: "2026-09-26T13:41:40.636Z",
  sourceDate: "26 September 2026",
  source: { url: "https://www.facebook.com/negrospowerph", label: "View the Negros Power Facebook page" },
  rotation: {
    date: "Thursday, September 24, 2026",
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
      "date": "Sunday, September 27, 2026",
      "window": "6:00AM to 6:00PM",
      "feeders": [
        "Asdes-Gonzaga Feeder 3"
      ],
      "cause": "Removal of overhead Primary Line along Lacson St. From Capitol Lagoon to 18th Lacson St.",
      "areas": [
        "Portion Lagoon to 18th St."
      ]
    },
    {
      "date": "Wednesday, September 30, 2026",
      "window": "8:00AM to 5:00PM",
      "feeders": [
        "Hilangban Feeder 4"
      ],
      "cause": "Replacement of poles",
      "areas": [
        "Prk. Lunao, Kakapihan, Tabidyao, Kalubihan and Haggdan, Brgy. Mailum, Bago City."
      ]
    },
    {
      "date": "Saturday, September 26, 2026",
      "window": "6:00AM to 7:00AM & 5:00PM to 6:00PM",
      "feeders": [
        "Alijis Feeder 7",
        "Alijis Feeder 8"
      ],
      "cause": "Reconductoring of 1.9 km 3Ph 2/0 Primary line to 336.4 Tree Wire from South Spring Village-Bangga Totong-7/11 Handumanam and Savemore to Handumanan National Highschool; Massive Insulator Replacement East Homes 5; Replacement/relocation of pole, installation of rubber insert, DT & FCO covers, bail clamps.",
      "areas": [
        "Portion of Mansilingan Subd., Ta-ala Farms Inc., Kabugwason.",
        "One Communities Subdivision."
      ]
    },
    {
      "date": "Saturday, September 26, 2026",
      "window": "6:00AM to 6:00PM",
      "feeders": [
        "Alijis Feeder 7",
        "Alijis Feeder 8"
      ],
      "cause": "Reconductoring of 1.9 km 3Ph 2/0 Primary line to 336.4 Tree Wire from South Spring Village-Bangga Totong-7/11 Handumanam and Savemore to Handumanan National Highschool; Massive Insulator Replacement East Homes 5; Replacement/relocation of pole, installation of rubber insert, DT & FCO covers, bail clamps.",
      "areas": [
        "East Homes Phase 4, 5, 6, South Spring Village, Villa Maria Reyna Subd., Sunny Plains Subd., Prk Totong, Hda. Edmar, Brgy. Felisa.",
        "NGO Village, Handumanan (Handumanan Elem. School, Handumanan National High School until 7/11 Felisa), Villasor  Village, Purok Ceres Ph III."
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
