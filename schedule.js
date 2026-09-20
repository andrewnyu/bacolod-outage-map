/* Bacolod outage map — SCHEDULE (rewritten by .github/workflows/refresh.yml).
 * Do not hand-edit; the refresh job overwrites this file.
 * Geometry lives in geo.js and is never touched by the job.
 */

const SCHEDULE = {
  fetchedAt: "2026-09-20T09:30:48.834Z",
  sourceDate: "20 September 2026",
  source: {"url":"https://www.facebook.com/negrospowerph","label":"View the Negros Power Facebook page"},
  rotation: {
    date: "Wednesday, September 16, 2026",
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
      "date": "Sunday, September 20, 2026",
      "window": "6:00AM to 7:00AM & 5:00PM to 6:00PM",
      "feeders": [
        "Mountain View Feeder 2"
      ],
      "cause": "Reconductoring of 1.0 km 2/0 bare wire 3Ph Primary line MF2 along La Salle; Reconductoring of 0.3km #2 bare wire 3-phase prim. Line BF5 along CL Montelibano.",
      "areas": [
        "Portion of USLS, La Salle Avenue (Rollis to BS  Aquino), Lacson St. (12th and 13th St.), Triangle Plaza, NORD Medical Hub, Medical Plaza, The Doctor’s Hospital."
      ]
    },
    {
      "date": "Sunday, September 20, 2026",
      "window": "6:00AM to 6:00PM",
      "feeders": [
        "Mountain View Feeder 2",
        "Burgos Feeder 5"
      ],
      "cause": "Reconductoring of 1.0 km 2/0 bare wire 3Ph Primary line MF2 along La Salle; Reconductoring of 0.3km #2 bare wire 3-phase prim. Line BF5 along CL Montelibano.",
      "areas": [
        "San Lorenzo Ruiz, Prk. Canaan, Santorini, Purok Yanson, Tierra Minerva, Eroreco subd, Prk Casiana, Prk Sulom 1,St.  Scholastica Academy, La Salle Avenue (La Salle to St. Scho), Capitol  Ville, Portion of USLS.",
        "CL Montelibano-6th St. Going Lasalle."
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
