/* Bacolod outage map — data snapshot
 *
 * Source: facebook.com/negrospowerph (scheduled-outage posts + NGCP red-alert
 * rotation graphics), scraped 6 September 2026.
 *
 * Coordinates: every centre point below is geocoded from OpenStreetMap against a
 * real named place. Zone RADII are estimates — Negros Power does not publish
 * feeder boundary polygons, so a circle here means "roughly this area", never a
 * surveyed service boundary. Feeder families we could not ground to a real place
 * (Asdes-Gonzaga, Hilangban, Panaogao, Lopez) are deliberately NOT drawn on the
 * map; they appear in the unmapped list instead. Better a gap than a wrong shape.
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

// Scrubber covers the span of the published rotation.
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

/* zones: what we draw on the map ----------------------------------------- */

const ZONES = [
  {
    id: "mf1",
    fam: "Mountain View",
    name: "Mountain View Feeder 1",
    short: "MF1",
    center: [10.68927, 122.95974],
    radius: 1200,
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
    center: [10.68429, 122.96686],
    radius: 1300,
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
    center: [10.67736, 122.95163],
    radius: 950,
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
    center: [10.69819, 122.96216],
    radius: 1200,
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
    center: [10.69089, 122.95893],
    radius: 450,
    mld: [],
    sep6: { scope: "whole feeder", windows: [[6, 18]], label: "6:00AM – 6:00PM" },
    areas: ["Robinson's Commercial Complex"],
  },
  {
    id: "mf6",
    fam: "Mountain View",
    name: "Mountain View Feeder 6",
    short: "MF6",
    center: [10.69628, 122.98372],
    radius: 2100,
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

  /* broader feeder families — rotation only, no per-street data published */
  {
    id: "alijis",
    fam: "Alijis",
    name: "Alijis feeders",
    short: "Alijis",
    center: [10.63671, 122.95036],
    radius: 2400,
    family: true,
    mld: [
      { f: "Feeder 2", s: 14, e: 16, label: "2:00PM – 4:00PM" },
      { f: "Feeder 4", s: 16, e: 18, label: "4:00PM – 6:00PM" },
      { f: "Feeder 3", s: 16, e: 18, label: "4:00PM – 6:00PM" },
      { f: "Feeder 5", s: 18, e: 20, label: "6:00PM – 8:00PM" },
      { f: "Feeder 1", s: 18, e: 20, label: "6:00PM – 8:00PM" },
      { f: "Feeder 8", s: 19, e: 22, label: "7:00PM – 10:00PM" },
    ],
    areas: ["Alijis", "Taculing", "Singcang-Airport", "Handumanan"],
  },
  {
    id: "reclamation",
    fam: "Reclamation",
    name: "Reclamation feeders",
    short: "Reclamation",
    center: [10.68261, 122.94479],
    radius: 1300,
    family: true,
    mld: [
      { f: "Feeder 1", s: 15, e: 17, label: "3:00PM – 5:00PM" },
      { f: "Feeder 5", s: 18, e: 20, label: "6:00PM – 8:00PM" },
      { f: "Feeder 2", s: 19, e: 21, label: "7:00PM – 9:00PM" },
      { f: "Feeder 3", s: 21, e: 23, label: "9:00PM – 11:00PM" },
    ],
    areas: ["Bacolod Reclamation Area", "BREDCO Port", "Downtown waterfront"],
  },
  {
    id: "murcia",
    fam: "Murcia",
    name: "Murcia feeders",
    short: "Murcia",
    center: [10.60665, 123.04047],
    radius: 4500,
    family: true,
    mld: [
      { f: "Feeder 4", s: 16, e: 18, label: "4:00PM – 6:00PM" },
      { f: "Feeder 3", s: 17, e: 19, label: "5:00PM – 7:00PM" },
      { f: "Feeder 1", s: 18, e: 20, label: "6:00PM – 8:00PM" },
      { f: "Feeder 2", s: 20, e: 22, label: "8:00PM – 10:00PM" },
    ],
    areas: ["Murcia town proper", "Granada"],
  },
  {
    id: "sumag",
    fam: "Sum-ag",
    name: "Sum-ag feeders",
    short: "Sum-ag",
    center: [10.60199, 122.92483],
    radius: 2200,
    family: true,
    mld: [
      { f: "Feeder 1", s: 19, e: 21, label: "7:00PM – 9:00PM" },
      { f: "Feeder 2", s: 20, e: 22, label: "8:00PM – 10:00PM" },
    ],
    areas: ["Sum-ag", "Pahanocoy", "Tangub"],
  },
  {
    id: "talisay",
    fam: "Talisay",
    name: "Talisay feeders",
    short: "Talisay",
    center: [10.73726, 122.96733],
    radius: 3200,
    family: true,
    mld: [
      { f: "Feeder 2", s: 15, e: 17, label: "3:00PM – 5:00PM" },
      { f: "Feeder 1", s: 19, e: 22, label: "7:00PM – 10:00PM" },
      { f: "Feeder 3", s: 21, e: 23, label: "9:00PM – 11:00PM" },
    ],
    areas: ["Talisay City"],
  },
  {
    id: "dsb",
    fam: "Murcia",
    name: "Murcia Feeder 3 — Kumaliskis / DSB",
    short: "Kumaliskis",
    center: [10.55001, 123.22053],
    radius: 3500,
    family: true,
    upland: true,
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
];

/* feeder families we could not place on a map ---------------------------- */
const UNMAPPED = [
  { name: "Asdes-Gonzaga", slots: [
    { f: "Feeder 5", label: "2:00PM – 4:00PM" }, { f: "Feeder 4", label: "5:00PM – 7:00PM" },
    { f: "Feeder 1", label: "5:00PM – 7:00PM" }, { f: "Feeder 3", label: "7:00PM – 9:00PM" },
    { f: "Feeder 7", label: "8:00PM – 10:00PM" }, { f: "Feeder 2", label: "9:00PM – 11:00PM" }]},
  { name: "Hilangban", slots: [
    { f: "Feeder 4", label: "5:00PM – 7:00PM" }, { f: "Feeder 2", label: "5:00PM – 7:00PM" },
    { f: "Feeder 3", label: "7:00PM – 9:00PM" }]},
  { name: "Lopez", slots: [
    { f: "Feeder 1", label: "2:00PM – 4:00PM" }, { f: "Feeder 2", label: "3:00PM – 5:00PM" }]},
  { name: "Panaogao", slots: [
    { f: "Feeder 2", label: "5:00PM – 7:00PM" }, { f: "Feeder 1", label: "8:00PM – 10:00PM" }]},
];
