/* Bacolod outage map — SCHEDULE (rewritten by .github/workflows/refresh.yml).
 * Do not hand-edit; the refresh job overwrites this file.
 * Geometry lives in geo.js and is never touched by the job.
 */

const SCHEDULE = {
  fetchedAt: "2026-10-01T11:14:23.404Z",
  sourceDate: "4 October 2026",
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
      "date": "Saturday, October 3, 2026",
      "window": "6:00AM to 6:00PM",
      "feeders": [
        "Mountain View Feeder 6"
      ],
      "cause": "Reconductoring and 3-phase primary rotten pole replacements.",
      "areas": [
        "Gold Crest Subd., and Octagon Village, The Ruins,  Sta Maria (Talisay), Brgy. Bata from Celcor to Bata National High School (Prk. Mahimaya-on, Prk. Marapara, Prk. Kabayasan, Prk. Sawmill, Bacolod Golf & Country Club, Prk. Pag-isa, Prk. Kamonsil, Prk. Sawmill, Prk. Magbinuligay), Marapara Heights, Montebello Subd."
      ]
    },
    {
      "date": "Sunday, October 4, 2026",
      "window": "6:00AM to 8:00AM",
      "feeders": [
        "Burgos Feeder 2",
        "Asdes-Gonzaga Feeder 1",
        "Asdes-Gonzaga Feeder 3",
        "Reclamation Feeder 1"
      ],
      "cause": "Reconductoring of 1.5km 3-phase primary line to #336.4 ACSR Tree Wire from Palanca Road to Iglesia Filipina Brgy. 9 near Locsin St., from Burgos St. To BFP; Replacement of poles along San Juan St. and removal of 4-span 3-phase primary line.",
      "areas": [
        "Corazon Locsin Montelibano Memorial Regional Hospital, YLAC (Caltex – C.L. Montelibano), Dr. J Villarosa St., Narra  St. (Lopez Jaena St. –",
        "Mabini St. (Gonzaga-Malalosan St.)(Malalosan-Hernaez St.), Gonzaga St. (Mabini-Lacson St.)(Lacson-Gatuslao St.), Lacson St. (Gonzaga-Bacolod Business Inn), Rizal St. (Lacson-San  Juan St.), Cuadra St.,  Gatuslao St. (Galo-Luzuriaga St.) to Luzuriaga-Araneta, Centrolplex, Bacolod Central Market, BACIWA, San Sebastian Dawis, Bishop’s Palace, Bay Center, San Sebastian  Cathedral, DYAF – Radyo Veritas, GE Money Bank, Bacolod Business Inn, LCCB , Gaisano Grand Central (new).",
        "Lacson St. (Galo-4th St.)",
        "San Juan St. (BS Aquino-San Juan Banago Bridge),Tilapia,Cagaycay,Ceresa,Sigay, Lison, Bolinao, Makawiwili, Shell Depot, Portion of Brgy. Banago, Sta. Clara Phase II, Prk. Langis,  San Mateo Village, Petron Depot, Prk. Paraiso, Prk. Kasagingan, Prk. Lawayan, Prk. Rosas Pandan. 888"
      ]
    },
    {
      "date": "Sunday, October 4, 2026",
      "window": "6:00AM to 8:00AM & 5:00PM to 6:00PM",
      "feeders": [
        "Reclamation Feeder 1"
      ],
      "cause": "Reconductoring of 1.5km 3-phase primary line to #336.4 ACSR Tree Wire from Palanca Road to Iglesia Filipina Brgy. 9 near Locsin St., from Burgos St. To BFP; Replacement of poles along San Juan St. and removal of 4-span 3-phase primary line.",
      "areas": [
        "San Juan St. (St Capitol Rd.-BS Aquino Dr.),Narra-Baybay, Lampirong, Jalandon, Tambi, Balinday, Tahong,"
      ]
    },
    {
      "date": "Sunday, October 4, 2026",
      "window": "6:00AM to 6:00PM",
      "feeders": [
        "Reclamation Feeder 1",
        "Asdes-Gonzaga Feeder 1"
      ],
      "cause": "Reconductoring of 1.5km 3-phase primary line to #336.4 ACSR Tree Wire from Palanca Road to Iglesia Filipina Brgy. 9 near Locsin St., from Burgos St. To BFP; Replacement of poles along San Juan St. and removal of 4-span 3-phase primary line.",
      "areas": [
        "Portion of Brgy 16, Puroks (Malipayon, Boulevard, Mapinalanggaon, Kasing-kasing, Magti-ayon), Palanca St. (Rodriguez Ave-Burgos Ave), Bacolod Baywalk, San Juan St. (Burgos Ave-St  Capitol Rd), Puroks (Kabuhi),BFP Bacolod Fire Station.",
        "San Juan St. (Rizal-Burgos Ave)."
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
