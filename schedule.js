/* Bacolod outage map — SCHEDULE (rewritten by .github/workflows/refresh.yml).
 * Do not hand-edit; the refresh job overwrites this file.
 * Geometry lives in geo.js and is never touched by the job.
 */

const SCHEDULE = {
  fetchedAt: "2026-11-14T11:50:35.430Z",
  sourceDate: "14 November 2026",
  source: {"url":"https://www.facebook.com/negrospowerph","label":"View the Negros Power Facebook page"},
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
      "date": "Sunday, November 15, 2026",
      "window": "8:00AM to 5:00PM",
      "feeders": [
        "Murcia Feeder 4"
      ],
      "cause": "Replacement of 4 rotten primary wood pole with its accessories",
      "areas": [
        "Prk. Maasin, Brgy. Dulao, Bago City."
      ]
    },
    {
      "date": "Saturday, November 14, 2026",
      "window": "8:00 AM to 10:00 AM & 4:00 PM to 5:00 PM",
      "feeders": [
        "Hilangban Feeder 4"
      ],
      "cause": "NGCP Request ; Shutdown of Bacolod - San Enrique 69kV line Maintenance; Replacement of Sum-ag Substation Secondary Bus; Primary pole replacement along Maao Rd. for HF3 ; Conversion of 1Ph to 3Ph for SF2 to HF1 (1.0km) at Brgy.​ Dulao",
      "areas": [
        "Portion Lag-Asan Relocation Site, Portion Baligasag, Portion Napoles, Malingin, Ma-ao Barrio, Bacong, Binubuhan, Mailum, Ilijan, Sitio Najaba, Prk Manghumay, Prk  Abaca, Buenos Aires Resort, Pataan Resort."
      ]
    },
    {
      "date": "Saturday, November 14, 2026",
      "window": "8:00 AM to 9:00 AM & 4:00 PM to 5:00 PM",
      "feeders": [
        "Sum-ag Feeder 1",
        "Sum-ag Feeder 2"
      ],
      "cause": "NGCP Request ; Shutdown of Bacolod - San Enrique 69kV line Maintenance; Replacement of Sum-ag Substation Secondary Bus; Primary pole replacement along Maao Rd. for HF3 ; Conversion of 1Ph to 3Ph for SF2 to HF1 (1.0km) at Brgy.​ Dulao",
      "areas": [
        "Villa Lourdes Subd., Brgy. Pahanocoy,  Cegasco, Matti Village, NHA, Sitio Acacia, VMA From Sum-ag  Substation to Sum-ag Highway, Punta Taytay Brgy Hall, Puroks  (Paraiso-Bayani, Orchids, Abi-Abihon,Masinulundo,Mahinangpon, Masipag, Masagana, Mahigugma, Providence, Mabinuligon,  Kasanagan, YLAC, Progreso) GK ERH, JMC Village, Santanville, Sumag Elem Sch., Sumag Public Market, Metro Sumag.",
        "From Sum-ag Substation along Abuanan Road  (Sum-ag) to portion of Bago, Brgy. Tabunan, Quiet Place Resort, portion of Brgy. Dulao, Purok Paho, Purok Maria Elena, Negros  Occidental District Jail."
      ]
    },
    {
      "date": "Saturday, November 14, 2026",
      "window": "8:00 AM to 5:00 PM",
      "feeders": [
        "Hilangban Feeder 1",
        "Hilangban Feeder 2",
        "Hilangban Feeder 3",
        "Hilangban Feeder 4",
        "Sum-ag Feeder 1",
        "Sum-ag Feeder 2"
      ],
      "cause": "NGCP Request ; Shutdown of Bacolod - San Enrique 69kV line Maintenance; Replacement of Sum-ag Substation Secondary Bus; Primary pole replacement along Maao Rd. for HF3 ; Conversion of 1Ph to 3Ph for SF2 to HF1 (1.0km) at Brgy.​ Dulao",
      "areas": [
        "From Lag-asan or Hilangban Substation, Brgy. Lag-asan, Bago City College, Prk. Kapahuan 1 & 2, Bago City Hospital, Prk. Santan, San Esteban Phase 2, Sta. Catalina Subdivision, Brgy. Sampinit, San Sebastian Village, Brgy. Balingasag (Prk. Potat, Prk.  Rosal, Prk. Violetas), San Gabriel Subd., Brgy. Sampinit, Villa Cristeta Ph 3, Southbay Subdivision, South Valley, HDA. Yusay, portion of Brgy. Calumangan until Bangga Ma. Morena, Brgy. Calumanggan, Purok Batad, Bago City Hospital.",
        "Bago City Proper, San Esteban Phase 1, Brgy. Poblacion-Bago, Pta. Playa, Puroks (Pinanoyan, Batad, Malipayon), Bantayan Park.",
        "Crossing Ubay, Bago Eco-Center, Barangays (Pacol, Bagroy, Sagasa, Caridad, Alianza, Don Jorge Araneta – Central Ma-ao), Hda. Pili, Humberto’s Resort.",
        "Portion Lag-Asan Relocation Site, Portion Baligasag, Portion Napoles.",
        "Benito Village, Fiesta Homes, FE Village, Puroks (Bayahinan, Orchids, Manga, Makiangayon, KBS, Magayon) DBI to Bago-Bacolod Boundary, Puroks (Paghidaet, 13, Dangal, Baybay, Newton, Proper), Casa Rufina South, Sunshine Rd. Bangga Ma. Morena to Trese y Media, Puroks (Papaya, Eucalyptus, Sunflower, C3, Para 1, Mansanero), Marietta Village, DBI.",
        "Portion of Brgy. Dulao."
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
