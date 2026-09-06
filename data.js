/* Bacolod outage map — data snapshot
 *
 * Source: facebook.com/negrospowerph (scheduled-outage posts + NGCP red-alert
 * rotation graphics), scraped 6 September 2026.
 *
 * GEOMETRY — two different kinds of claim, drawn differently on purpose:
 *
 *   AREA POLYGONS (zones[].poly) exist only where Negros Power actually
 *   published a street-level area list. Each polygon is the convex hull of the
 *   named places in that list, geocoded against OpenStreetMap and buffered
 *   ~320m, with points more than 3km from the median discarded as bad geocodes
 *   (numbered streets like "25th St." resolve terribly). These are derived from
 *   the utility's own text, not invented.
 *
 *   SUBSTATION PINS (kind:"substation") are real OpenStreetMap power=substation
 *   features operated by CENECO / Negros Power. A pin marks where those feeders
 *   ORIGINATE. It is not a coverage area — Negros Power does not publish which
 *   streets each of these feeders serves, so no shape is drawn.
 *
 * Alijis, Talisay, Lopez and Hilangban have neither a published area list nor a
 * substation in OpenStreetMap. They are listed with their rotation times and
 * left off the map entirely rather than given an invented shape.
 *
 * Validation: of 18 landmarks whose true feeder is known from the advisory text,
 * the polygons place 14 unambiguously and 4 in overlapping pairs, with none
 * wrong. Adjacent feeders genuinely interleave, so some overlap is real.
 */

const SNAPSHOT = "6 September 2026";

const ROTATION = {
  date: "Saturday, 5 September 2026",
  redAlert: "5:00PM – 8:00PM",
  yellowAlert: "8:00PM – 10:00PM",
  available: "2,255 MW",
  demand: "2,432 MW",
  reason:
    "Visayas coal plants TVI 1 and PEDC 3 are unavailable, with limited or zero " +
    "power import from the Mindanao grid.",
};

const T_START = 14, T_END = 23;

const SCHEDULED_SEP6 = {
  date: "Sunday, 6 September 2026",
  restoredAt: "6:37 PM",
  cause: [
    "Mt. View Substation preventive maintenance & old relay isolation",
    "69kV pole (2) replacement along Buri Rd. near Villa Estanzia & Magdalene Ville",
    "Primary pole replacement along GM Cordova, Buri & Lacson Sts. (6 double-circuit poles)",
    "Primary pole (4) relocation from Citadines to North Tourist-Inn",
    "Massive tree clearing along Aguinaldo St.",
  ],
};

const ZONES = [
  {
    id: "mf1",
    fam: "Mountain View",
    name: "Mountain View Feeder 1",
    short: "MF1",
    kind: "area",
    hullPoints: 8,
    center: [10.68919, 122.9581],
    poly: [
      [10.67523,122.95822], [10.67455,122.9569], [10.6746,122.95541], [10.67599,122.9537],
      [10.67743,122.95334], [10.70071,122.9536], [10.70275,122.95446], [10.7036,122.9565],
      [10.70277,122.95856], [10.69878,122.96268], [10.69719,122.96352], [10.69367,122.96414],
      [10.67926,122.96222], [10.67523,122.95822]
    ],
    mld: [],
    sep6: { scope: "whole feeder", windows: [[6, 18]], label: "6:00AM – 6:00PM" },
    areas: [
      "Lopue's Mandalagan", "Bangga Subay", "Sta. Clara I (portion, back of Lopue's)",
      "Mandalagan Highway (Lacson & Mt. View Rd. corner to North Drive)",
      "25th St.", "26th St.", "27th St.", "Convergys", "Carmelite Monastery",
      "Sunny Ville", "Bombo Radyo", "BS Aquino Drive to 20th St.", "PhilHealth",
      "Colegio San Agustin", "Redemptorist Church", "McDonald's La Salle",
      "Jollibee North Drive", "Brgy. 7 (portion) including Brgy. Hall",
    ],
  },
  {
    id: "mf2",
    fam: "Mountain View",
    name: "Mountain View Feeder 2",
    short: "MF2",
    kind: "area",
    hullPoints: 13,
    center: [10.68309, 122.96883],
    poly: [
      [10.67159,122.96287], [10.67139,122.96054], [10.67228,122.95923], [10.67457,122.95745],
      [10.67683,122.95737], [10.69553,122.97118], [10.69665,122.97303], [10.69653,122.97448],
      [10.69571,122.9757], [10.69441,122.97636], [10.68593,122.97826], [10.68401,122.97804],
      [10.67846,122.97519], [10.67159,122.96287]
    ],
    mld: [],
    sep6: {
      scope: "portion",
      windows: [[6, 13], [17, 18]],
      label: "6:00AM – 1:00PM &amp; 5:00PM – 6:00PM (plus a 6:00AM – 6:00PM portion)",
    },
    areas: [
      "Villa Georgina Subd.", "Queen of Mercy Hospital", "San Lorenzo Ruiz",
      "Prk. Canaan", "Santorini", "Purok Yanson", "Tierra Minerva", "Eroreco Subd.",
      "Prk. Casiana", "Prk. Sulom 1", "Lacson St. (14th and 15th St.)",
      "Capitol Shopping", "St. Scholastica Academy", "La Salle Avenue",
      "Capitol Ville", "University of St. La Salle (USLS)", "Triangle Plaza",
      "NORD Medical Hub", "Medical Plaza", "The Doctor's Hospital",
      "Prk. 13", "Magdalene Ville", "Purok Luhod-Luhod",
      "Dona Aurora St. going to Eroreco",
    ],
  },
  {
    id: "mf3",
    fam: "Mountain View",
    name: "Mountain View Feeder 3",
    short: "MF3",
    kind: "area",
    hullPoints: 12,
    center: [10.66946, 122.95164],
    poly: [
      [10.65123,122.9461], [10.65031,122.94484], [10.65041,122.94253], [10.65216,122.94102],
      [10.65372,122.94096], [10.6777,122.94671], [10.6856,122.95147], [10.68633,122.95279],
      [10.6863,122.95429], [10.68553,122.95559], [10.67725,122.96339], [10.67496,122.96416],
      [10.67344,122.96355], [10.65123,122.9461]
    ],
    mld: [],
    sep6: {
      scope: "portion",
      windows: [[6, 7], [17, 18]],
      label: "6:00AM – 7:00AM &amp; 5:00PM – 6:00PM (plus a 6:00AM – 6:00PM portion)",
    },
    areas: [
      "Gatuslao St. (N. Capitol Rd. to Imperial Court)",
      "Aguinaldo St. (N. Capitol Rd. to 15th St.)",
      "Lacson St. Seaside (SEDA to 15th St.)", "Ayala Malls",
      "Capitol Park and Lagoon", "SEDA Hotel", "NBI", "Fordland Building",
      "Urbanview", "Piazza Sorento", "L'Fisher Hotel and Ecotel", "PNB Lacson",
      "Gatuslao St. (Imperial Court to 23rd St.)", "14th St.",
      "BS Aquino Dr. (Lacson St. to San Juan St.)", "Starbucks Lacson St.",
    ],
  },
  {
    id: "mf4",
    fam: "Mountain View",
    name: "Mountain View Feeder 4",
    short: "MF4",
    kind: "area",
    hullPoints: 11,
    center: [10.6985, 122.96487],
    poly: [
      [10.6894,122.96975], [10.68846,122.96778], [10.68874,122.96633], [10.69843,122.95464],
      [10.70043,122.95361], [10.70258,122.9543], [10.70798,122.9622], [10.70809,122.96371],
      [10.70743,122.96508], [10.69918,122.97462], [10.6979,122.97548], [10.69563,122.97531],
      [10.6894,122.96975]
    ],
    mld: [{ f: "Feeder 4", s: 18, e: 20, label: "6:00PM – 8:00PM" }],
    sep6: { scope: "whole feeder", windows: [[6, 18]], label: "6:00AM – 6:00PM" },
    areas: [
      "Mt. View Subd.", "Mt. View Subd. Ph. 2", "Sta. Clara Executive Village",
      "Sta. Clara Subd. Ph. 1", "Villa Valderrama Subd.", "Sto. Rosario Rd.",
      "Purok Sambag", "Purok Santol", "Purok Porferia", "Purok Kametal",
      "Purok Maaliwanay", "Messavire Garden Residences", "The Row",
      "Pepsi Cola Bottling Company",
    ],
  },
  {
    id: "mf5",
    fam: "Mountain View",
    name: "Mountain View Feeder 5",
    short: "MF5",
    kind: "area",
    hullPoints: 1,
    center: [10.69089, 122.95893],
    poly: [
      [10.69089,122.96185], [10.68882,122.961], [10.68796,122.95893], [10.68882,122.95686],
      [10.69089,122.956], [10.69296,122.95686], [10.69381,122.95893], [10.69296,122.961],
      [10.69089,122.96185]
    ],
    mld: [],
    sep6: { scope: "whole feeder", windows: [[6, 18]], label: "6:00AM – 6:00PM" },
    areas: ["Robinson's Commercial Complex"],
  },
  {
    id: "mf6",
    fam: "Mountain View",
    name: "Mountain View Feeder 6",
    short: "MF6",
    kind: "area",
    hullPoints: 22,
    center: [10.69603, 122.98217],
    poly: [
      [10.67821,122.99585], [10.67651,122.99463], [10.67605,122.99259], [10.67918,122.98476],
      [10.69043,122.97186], [10.70529,122.96201], [10.70667,122.96154], [10.70874,122.96219],
      [10.70979,122.96408], [10.71211,122.98229], [10.7113,122.9847], [10.69966,122.99642],
      [10.6893,122.99811], [10.67821,122.99585]
    ],
    mld: [],
    sep6: {
      scope: "portion",
      windows: [[6, 9], [17, 18]],
      label: "6:00AM – 9:00AM &amp; 5:00PM – 6:00PM (plus a 6:00AM – 6:00PM portion)",
    },
    areas: [
      "Camella Subd.", "Meadows of Camelot", "Golden Palm Subd.", "Country Homes 1",
      "Country Homes 2", "Country Homes 3", "Villa Lucasan Subd.", "Abkasa",
      "Capitol Heights Ph. 5", "La Herencia Subd.", "Prk. Villamar", "Prk. Tumpok",
      "Buri Rd. (Buri-Circumferential, front of All Home)", "Forbes Hill",
      "Estanzia Subd.", "Kaakbay Village", "Goldcrest Subd.", "Octagon Village",
      "Marapara Heights", "Montebello Subd.", "Purok Pinetree", "Purok Bayabasan",
      "Purok Mainuswagon", "Purok Marapara", "Purok Mahimayaon",
      "Purok Magbinuligay", "Purok Kamunsil", "Purok Tunay", "Purok Sawmill",
      "Purok Riverside-Bata", "Purok Andan", "Purok Simboryo", "Purok Sta. Maria",
      "The Ruins", "Roselawn Memorial Park",
    ],
  },
  {
    id: "dsb",
    fam: "Murcia",
    name: "Murcia Feeder 3 — Kumaliskis / DSB",
    short: "Kumaliskis",
    kind: "area",
    hullPoints: 2,
    center: [10.56354, 123.22045],
    poly: [
      [10.57706,123.21744], [10.57913,123.21829], [10.58,123.22035], [10.57916,123.22242],
      [10.57709,123.22329], [10.55002,123.22345], [10.54795,123.22261], [10.54708,123.22054],
      [10.54793,123.21847], [10.54999,123.2176], [10.57706,123.21744]
    ],
    mld: [{ f: "Feeder 3", s: 17, e: 19, label: "5:00PM – 7:00PM" }],
    scheduled: {
      date: "Tuesday, 8 September 2026",
      window: "1:00PM – 3:00PM",
      s: 13,
      e: 15,
      cause: "Uprating of existing distribution transformer",
    },
    areas: ["Kumaliskis (portion)", "Don Salvador Benedicto"],
  },
  {
    id: "mvsub",
    fam: "Mountain View",
    name: "Mountain View Substation",
    short: "Mt. View SS",
    kind: "substation",
    center: [10.693143, 122.969153],
    mld: [],
    note: "Feeds MF1-MF6. The 6 September preventive maintenance happened here.",
    areas: [],
  },
  {
    id: "asdes",
    fam: "Asdes-Gonzaga",
    name: "Asdes-Gonzaga Substation",
    short: "Asdes-Gonzaga",
    kind: "substation",
    center: [10.666209, 122.952618],
    mld: [
      { f: "Feeder 5", s: 14, e: 16, label: "2:00PM – 4:00PM" },
      { f: "Feeder 4", s: 17, e: 19, label: "5:00PM – 7:00PM" },
      { f: "Feeder 1", s: 17, e: 19, label: "5:00PM – 7:00PM" },
      { f: "Feeder 3", s: 19, e: 21, label: "7:00PM – 9:00PM" },
      { f: "Feeder 7", s: 20, e: 22, label: "8:00PM – 10:00PM" },
      { f: "Feeder 2", s: 21, e: 23, label: "9:00PM – 11:00PM" },
    ],
    note: "Tagged in OpenStreetMap as Asbes Gonzaga Substation, operated by CENECO.",
    areas: [],
  },
  {
    id: "panaogao",
    fam: "Panaogao",
    name: "Panaogao Substation",
    short: "Panaogao",
    kind: "substation",
    center: [10.781265, 123.002954],
    mld: [
      { f: "Feeder 2", s: 17, e: 19, label: "5:00PM – 7:00PM" },
      { f: "Feeder 1", s: 20, e: 22, label: "8:00PM – 10:00PM" },
    ],
    areas: [],
  },
  {
    id: "reclamation",
    fam: "Reclamation",
    name: "Reclamation Substation",
    short: "Reclamation",
    kind: "substation",
    center: [10.666136, 122.936001],
    mld: [
      { f: "Feeder 1", s: 15, e: 17, label: "3:00PM – 5:00PM" },
      { f: "Feeder 5", s: 18, e: 20, label: "6:00PM – 8:00PM" },
      { f: "Feeder 2", s: 19, e: 21, label: "7:00PM – 9:00PM" },
      { f: "Feeder 3", s: 21, e: 23, label: "9:00PM – 11:00PM" },
    ],
    areas: [],
  },
  {
    id: "sumag",
    fam: "Sum-ag",
    name: "Sum-ag Substation",
    short: "Sum-ag",
    kind: "substation",
    center: [10.594298, 122.925092],
    mld: [
      { f: "Feeder 1", s: 19, e: 21, label: "7:00PM – 9:00PM" },
      { f: "Feeder 2", s: 20, e: 22, label: "8:00PM – 10:00PM" },
    ],
    areas: [],
  },
  {
    id: "murcia",
    fam: "Murcia",
    name: "CENECO Murcia Substation",
    short: "Murcia",
    kind: "substation",
    center: [10.613463, 123.028222],
    mld: [
      { f: "Feeder 4", s: 16, e: 18, label: "4:00PM – 6:00PM" },
      { f: "Feeder 3", s: 17, e: 19, label: "5:00PM – 7:00PM" },
      { f: "Feeder 1", s: 18, e: 20, label: "6:00PM – 8:00PM" },
      { f: "Feeder 2", s: 20, e: 22, label: "8:00PM – 10:00PM" },
    ],
    note: "Murcia Feeder 3 also runs up to Kumaliskis / Don Salvador Benedicto, ~20km east.",
    areas: [],
  },
];

/* Neither a published area list nor a substation in OpenStreetMap. Listed with
   their rotation times; deliberately not drawn. */
const UNMAPPED = [
  { name: "Alijis", slots: [
    { f: "Feeder 2", label: "2:00PM – 4:00PM" }, { f: "Feeder 4", label: "4:00PM – 6:00PM" },
    { f: "Feeder 3", label: "4:00PM – 6:00PM" }, { f: "Feeder 5", label: "6:00PM – 8:00PM" },
    { f: "Feeder 1", label: "6:00PM – 8:00PM" }, { f: "Feeder 8", label: "7:00PM – 10:00PM" }]},
  { name: "Talisay", slots: [
    { f: "Feeder 2", label: "3:00PM – 5:00PM" }, { f: "Feeder 1", label: "7:00PM – 10:00PM" },
    { f: "Feeder 3", label: "9:00PM – 11:00PM" }]},
  { name: "Hilangban", slots: [
    { f: "Feeder 4", label: "5:00PM – 7:00PM" }, { f: "Feeder 2", label: "5:00PM – 7:00PM" },
    { f: "Feeder 3", label: "7:00PM – 9:00PM" }]},
  { name: "Lopez", slots: [
    { f: "Feeder 1", label: "2:00PM – 4:00PM" }, { f: "Feeder 2", label: "3:00PM – 5:00PM" }]},
];
