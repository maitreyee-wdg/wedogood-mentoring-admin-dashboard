export type OrgType = "Volunteer" | "Beneficiary"

export interface OrgPOC {
  id: string
  name: string
  role: string
  email: string
  phone: string
  isMain: boolean
}

export interface OrgMeeting {
  id: string
  date: string
  details: string
  poc: string
}

export interface Organization {
  id: string
  type: OrgType
  name: string
  initials: string
  website?: string
  summary: string
  locations: string[]
  social?: { linkedin?: string; twitter?: string }
  dateAdded: string
  poc: OrgPOC[]
  units: string[]        // associated volunteer groups / NGO units
  programs: string[]     // associated programs
  status: "Active" | "Archived"
  meetings: OrgMeeting[]
}

export const mockOrganizations: Organization[] = [
  // ── VOLUNTEER ORGS ──
  {
    id: "ORG-V001",
    type: "Volunteer",
    name: "Infosys",
    initials: "IN",
    website: "www.infosys.com",
    summary: "Infosys is a global leader in IT services and consulting. Their CSR arm actively supports education and skill-building for underserved youth.",
    locations: ["Bengaluru", "Pune", "Hyderabad", "Chennai"],
    social: { linkedin: "linkedin.com/company/infosys" },
    dateAdded: "2025-06-01",
    poc: [
      { id: "P-001", name: "Suresh Pillai", role: "CSR Manager", email: "suresh.pillai@infosys.com", phone: "+91 98001 10001", isMain: true },
      { id: "P-002", name: "Anita Rao", role: "HR Volunteer Lead", email: "anita.rao@infosys.com", phone: "+91 98001 10011", isMain: false },
    ],
    units: ["HR & People"],
    programs: ["Skilled Mentoring"],
    status: "Active",
    meetings: [
      { id: "OM-001", date: "2026-05-05", details: "Annual CSR review meeting. Discussed expansion of volunteer base and upcoming orientation.", poc: "Suresh Pillai" },
      { id: "OM-002", date: "2025-12-10", details: "Year-end partnership review. Positive outcomes shared from H2 engagements.", poc: "Suresh Pillai" },
    ],
  },
  {
    id: "ORG-V002",
    type: "Volunteer",
    name: "Google",
    initials: "GO",
    website: "www.google.com",
    summary: "Google's developer community and CSR programs support technology education and mentoring across India, with a focus on coding skills and product thinking.",
    locations: ["Mumbai", "Bengaluru", "Hyderabad"],
    social: { linkedin: "linkedin.com/company/google" },
    dateAdded: "2025-07-15",
    poc: [
      { id: "P-003", name: "Neetha Iyer", role: "Developer Relations", email: "neetha@google.com", phone: "+91 98001 10002", isMain: true },
    ],
    units: ["Technology"],
    programs: ["Skilled Mentoring", "Tech Skills Program"],
    status: "Active",
    meetings: [
      { id: "OM-003", date: "2026-04-20", details: "Planned Code4Good bootcamp. Confirmed 4 facilitators from Google team.", poc: "Neetha Iyer" },
    ],
  },
  {
    id: "ORG-V003",
    type: "Volunteer",
    name: "HDFC Bank",
    initials: "HD",
    website: "www.hdfcbank.com",
    summary: "HDFC Bank's CSR initiative — Parivartan — focuses on rural development, skill training, and financial literacy for underserved communities.",
    locations: ["Mumbai", "Delhi", "Bengaluru", "Kolkata"],
    social: { linkedin: "linkedin.com/company/hdfc-bank" },
    dateAdded: "2025-05-20",
    poc: [
      { id: "P-004", name: "Meena Kapoor", role: "Parivartan Lead", email: "meena.kapoor@hdfcbank.com", phone: "+91 98001 10004", isMain: true },
    ],
    units: ["Finance"],
    programs: ["Skilled Mentoring", "Finwise"],
    status: "Active",
    meetings: [
      { id: "OM-004", date: "2026-04-28", details: "Finwise program review with Parivarthan NGO. Discussed curriculum gaps.", poc: "Meena Kapoor" },
    ],
  },
  {
    id: "ORG-V004",
    type: "Volunteer",
    name: "Razorpay",
    initials: "RP",
    website: "www.razorpay.com",
    summary: "Razorpay's team of PMs, engineers, and designers contribute mentoring support to youth exploring careers in product and tech.",
    locations: ["Bengaluru"],
    social: { linkedin: "linkedin.com/company/razorpay" },
    dateAdded: "2025-11-01",
    poc: [
      { id: "P-005", name: "Arun Desai", role: "People & Culture", email: "arun.desai@razorpay.com", phone: "+91 98001 10005", isMain: true },
    ],
    units: ["Product"],
    programs: ["Skilled Mentoring"],
    status: "Active",
    meetings: [],
  },
  {
    id: "ORG-V005",
    type: "Volunteer",
    name: "Zomato",
    initials: "ZO",
    website: "www.zomato.com",
    summary: "Zomato's social impact team facilitates creative and marketing workshops, as well as individual mentoring for youth in communication and branding.",
    locations: ["Delhi", "Bengaluru", "Mumbai"],
    social: { linkedin: "linkedin.com/company/zomato" },
    dateAdded: "2025-06-25",
    poc: [
      { id: "P-006", name: "Shweta Rao", role: "Social Impact Manager", email: "shweta@zomato.com", phone: "+91 98001 10006", isMain: true },
    ],
    units: ["Marketing"],
    programs: ["Skilled Mentoring", "Creative Skills"],
    status: "Active",
    meetings: [
      { id: "OM-005", date: "2026-05-10", details: "Brand Workshop Series planning. 10 mentees to attend from Akanksha.", poc: "Shweta Rao" },
    ],
  },
  {
    id: "ORG-V006",
    type: "Volunteer",
    name: "Amazon India",
    initials: "AM",
    website: "www.amazon.jobs/en/teams/india",
    summary: "Amazon India's operations team contributes project volunteering, particularly around logistics, events, and capacity building for NGO partners.",
    locations: ["Bengaluru", "Hyderabad", "Mumbai"],
    social: { linkedin: "linkedin.com/company/amazon" },
    dateAdded: "2025-09-15",
    poc: [
      { id: "P-007", name: "Vikash Kumar", role: "Operations CSR Lead", email: "vikash@amazon.com", phone: "+91 98001 10007", isMain: true },
    ],
    units: ["Operations"],
    programs: ["Career Connect"],
    status: "Active",
    meetings: [
      { id: "OM-006", date: "2026-04-05", details: "Planned Youth Employment Fair logistics with NavGurukul.", poc: "Vikash Kumar" },
    ],
  },

  // ── BENEFICIARY ORGS ──
  {
    id: "ORG-B001",
    type: "Beneficiary",
    name: "Akanksha Foundation",
    initials: "AK",
    website: "www.akanksha.org",
    summary: "Akanksha Foundation works to transform the lives of children from low-income communities through high-quality education and holistic development.",
    locations: ["Mumbai", "Pune"],
    social: { linkedin: "linkedin.com/company/akanksha-foundation" },
    dateAdded: "2025-04-01",
    poc: [
      { id: "P-008", name: "Mait Sharma", role: "Program POC", email: "mait@akanksha.org", phone: "+91 99001 20001", isMain: true },
      { id: "P-009", name: "Deepa Nair", role: "Youth Programs Head", email: "deepa@akanksha.org", phone: "+91 99001 20009", isMain: false },
    ],
    units: ["Akanksha — Batch 2025", "Akanksha — Alumni Group"],
    programs: ["Skilled Mentoring"],
    status: "Active",
    meetings: [
      { id: "OM-007", date: "2026-05-22", details: "Monthly check-in — 28 active mentees, 3 requests pending match.", poc: "Mait Sharma" },
      { id: "OM-008", date: "2026-04-08", details: "Reviewed engagement health scores. 2 critical engagements discussed.", poc: "Mait Sharma" },
    ],
  },
  {
    id: "ORG-B002",
    type: "Beneficiary",
    name: "NavGurukul",
    initials: "NG",
    website: "www.navgurukul.org",
    summary: "NavGurukul is a residential school for marginalized girls that provides free coding education and career placement support.",
    locations: ["Pune", "Delhi", "Bengaluru", "Dharamsala"],
    social: { linkedin: "linkedin.com/company/navgurukul" },
    dateAdded: "2025-04-01",
    poc: [
      { id: "P-010", name: "Prerna Gupta", role: "Partnerships Manager", email: "prerna@navgurukul.org", phone: "+91 99001 20002", isMain: true },
    ],
    units: ["NavGurukul — Cohort A"],
    programs: ["Skilled Mentoring", "Tech Skills Program"],
    status: "Active",
    meetings: [
      { id: "OM-009", date: "2026-05-20", details: "Scaling discussion — NavGurukul wants to expand mentee base to 50.", poc: "Prerna Gupta" },
    ],
  },
  {
    id: "ORG-B003",
    type: "Beneficiary",
    name: "Parivarthan",
    initials: "PV",
    website: "www.parivarthan.org",
    summary: "Parivarthan empowers underserved youth through counselling, skill development, and career readiness programs across Karnataka.",
    locations: ["Bengaluru"],
    social: { linkedin: "linkedin.com/company/parivarthan" },
    dateAdded: "2026-01-15",
    poc: [
      { id: "P-011", name: "Rekha Shetty", role: "Program Director", email: "rekha@parivarthan.org", phone: "+91 99001 20003", isMain: true },
    ],
    units: ["Parivarthan — Group 1"],
    programs: ["Skilled Mentoring", "Finwise"],
    status: "Active",
    meetings: [
      { id: "OM-010", date: "2026-04-10", details: "Initial onboarding. 14 mentees profiled. 8 requests created.", poc: "Rekha Shetty" },
    ],
  },
]
