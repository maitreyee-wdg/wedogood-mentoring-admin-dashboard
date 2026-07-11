import { DOMAINS, INDUSTRIES } from "@/data/volunteersData"

export interface GroupMeeting {
  id: string
  date: string
  details: string
  poc: string
}

export interface FieldPreset {
  field: string   // key from VOLUNTEER_PRESET_FIELDS / MENTEE_PRESET_FIELDS
  value: string   // stored as string; "tags" type values are semicolon-joined
}

export interface OrientationSlot {
  id: string
  meetingName: string
  date: string
  time: string
  meetingLink: string
  wdgEmail: string   // WDG team member's email hosting/taking this orientation session
}

export interface OnboardingLink {
  id: string
  name: string
  description?: string
  url: string
  status: "Active" | "Paused"
  presetFields: FieldPreset[]
  orientationSlots?: OrientationSlot[]   // volunteer links only
  createdAt: string
}

export interface VolunteerGroup {
  id: string
  name: string
  organizationName: string
  interestAreas: ("Mentoring" | "Projects" | "Both")[]
  poc: { name: string; email: string; contact: string }
  status: "Active" | "Inactive"
  additionalDetails?: string
  memberCount: number
  meetings: GroupMeeting[]
  onboardingLinks: OnboardingLink[]
}

export interface MenteeGroup {
  id: string
  name: string
  ngo: "Akanksha Foundation" | "NavGurukul" | "Parivarthan"
  poc: { name: string; email: string; contact: string }
  memberCount: number
  status: "Active" | "Inactive"
  description?: string
  meetings: GroupMeeting[]
  onboardingLinks: OnboardingLink[]
}

export type PresetFieldType = "text" | "number" | "select" | "tags"

export interface PresetFieldDef {
  key: string
  label: string
  type: PresetFieldType
  options?: string[]
}

export const VOLUNTEER_PRESET_FIELDS: PresetFieldDef[] = [
  { key: "currentRole", label: "Current Role", type: "text" },
  { key: "currentCompany", label: "Current Company", type: "text" },
  { key: "totalYearsExp", label: "Total Years of Experience", type: "number" },
  { key: "domain", label: "Domain", type: "select", options: DOMAINS },
  { key: "industry", label: "Industry", type: "select", options: INDUSTRIES },
  { key: "preferredMenteeStage", label: "Preferred Mentee Stage", type: "tags", options: ["College students", "Fresh graduates", "0–4 yrs", "4–8 yrs"] },
  { key: "skills", label: "Skills", type: "tags" },
  { key: "preferredLanguages", label: "Preferred Languages", type: "tags" },
  { key: "hometown.city", label: "Hometown — City", type: "text" },
  { key: "hometown.state", label: "Hometown — State", type: "text" },
  { key: "hometown.country", label: "Hometown — Country", type: "text" },
  { key: "currentLocation.city", label: "Current Location — City", type: "text" },
  { key: "currentLocation.state", label: "Current Location — State", type: "text" },
  { key: "currentLocation.country", label: "Current Location — Country", type: "text" },
]

export const MENTEE_PRESET_FIELDS: PresetFieldDef[] = [
  { key: "currentRole", label: "Current Role", type: "text" },
  { key: "currentCompany", label: "Current Company", type: "text" },
  { key: "totalYearsExp", label: "Total Years of Experience", type: "number" },
  { key: "domain", label: "Domain", type: "text" },
  { key: "careerStage", label: "Career Stage", type: "select", options: ["Student", "Working", "Unemployed", "Fresh Graduate"] },
  { key: "education.level", label: "Education — Level", type: "text" },
  { key: "education.degree", label: "Education — Degree", type: "text" },
  { key: "education.institute", label: "Education — Institute", type: "text" },
  { key: "goals", label: "Goals", type: "tags" },
  { key: "skills", label: "Skills", type: "tags" },
  { key: "preferredLanguages", label: "Preferred Languages", type: "tags" },
  { key: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
  { key: "age", label: "Age", type: "number" },
]

export const mockVolunteerGroups: VolunteerGroup[] = [
  {
    id: "VG-001",
    name: "HR & People",
    organizationName: "Infosys CSR",
    interestAreas: ["Mentoring"],
    poc: { name: "Suresh Pillai", email: "suresh.pillai@infosys.com", contact: "+91 98001 10001" },
    status: "Active",
    additionalDetails: "HR professionals from Infosys interested in career mentoring.",
    memberCount: 8,
    meetings: [
      { id: "M-001", date: "2026-04-15", details: "Quarterly review of mentoring engagement quality. Discussed feedback loop improvements.", poc: "Suresh Pillai" },
      { id: "M-002", date: "2026-01-20", details: "Onboarding session for 3 new volunteers joining the group.", poc: "Suresh Pillai" },
    ],
    onboardingLinks: [],
  },
  {
    id: "VG-002",
    name: "Technology",
    organizationName: "Google Developer Community",
    interestAreas: ["Both"],
    poc: { name: "Neetha Iyer", email: "neetha@google.com", contact: "+91 98001 10002" },
    status: "Active",
    additionalDetails: "Engineers and PMs from Google volunteering for tech skill building and mentoring.",
    memberCount: 12,
    meetings: [
      { id: "M-003", date: "2026-05-01", details: "Planning Code4Good bootcamp logistics for NavGurukul batch.", poc: "Neetha Iyer" },
      { id: "M-004", date: "2026-02-10", details: "Mid-year check-in. 2 new project leads assigned.", poc: "Neetha Iyer" },
    ],
    onboardingLinks: [
      {
        id: "OL-001",
        name: "Google DevFest 2026 Signup",
        description: "Shared at the Google DevFest booth for engineers signing up on the spot.",
        url: "app.wedogood.in/onboard/volunteer/technology/google-devfest-2026-signup",
        status: "Active",
        presetFields: [
          { field: "currentCompany", value: "Google" },
          { field: "domain", value: "Technology" },
        ],
        orientationSlots: [
          { id: "OS-001", meetingName: "DevFest Volunteer Orientation", date: "2026-07-20", time: "11:00", meetingLink: "meet.google.com/devfest-orientation-1", wdgEmail: "priya@wedogood.in" },
          { id: "OS-002", meetingName: "DevFest Volunteer Orientation", date: "2026-07-22", time: "16:00", meetingLink: "meet.google.com/devfest-orientation-2", wdgEmail: "priya@wedogood.in" },
        ],
        createdAt: "2026-06-15",
      },
    ],
  },
  {
    id: "VG-003",
    name: "Analytics",
    organizationName: "Swiggy Data Science Team",
    interestAreas: ["Mentoring"],
    poc: { name: "Rohan Malhotra", email: "rohan.malhotra@swiggy.com", contact: "+91 98001 10003" },
    status: "Active",
    memberCount: 6,
    meetings: [
      { id: "M-005", date: "2026-03-18", details: "Discussed curriculum for data literacy workshops.", poc: "Rohan Malhotra" },
    ],
    onboardingLinks: [],
  },
  {
    id: "VG-004",
    name: "Finance",
    organizationName: "HDFC CSR Initiative",
    interestAreas: ["Both"],
    poc: { name: "Meena Kapoor", email: "meena.kapoor@hdfcbank.com", contact: "+91 98001 10004" },
    status: "Active",
    additionalDetails: "Finance professionals from HDFC Bank supporting financial literacy and mentoring.",
    memberCount: 9,
    meetings: [
      { id: "M-006", date: "2026-04-28", details: "Review of Finwise program with Parivarthan team.", poc: "Meena Kapoor" },
    ],
    onboardingLinks: [],
  },
  {
    id: "VG-005",
    name: "Product",
    organizationName: "Razorpay",
    interestAreas: ["Mentoring"],
    poc: { name: "Arun Desai", email: "arun.desai@razorpay.com", contact: "+91 98001 10005" },
    status: "Active",
    memberCount: 5,
    meetings: [],
    onboardingLinks: [],
  },
  {
    id: "VG-006",
    name: "Marketing",
    organizationName: "Zomato Social Impact",
    interestAreas: ["Both"],
    poc: { name: "Shweta Rao", email: "shweta@zomato.com", contact: "+91 98001 10006" },
    status: "Active",
    additionalDetails: "Marketing and brand professionals involved in content and creative workshops.",
    memberCount: 7,
    meetings: [
      { id: "M-007", date: "2026-05-10", details: "Brand Workshop Series planning for Akanksha batch.", poc: "Shweta Rao" },
      { id: "M-008", date: "2025-12-05", details: "Year-end retrospective. Positive feedback from mentees.", poc: "Shweta Rao" },
    ],
    onboardingLinks: [],
  },
  {
    id: "VG-007",
    name: "Operations",
    organizationName: "Amazon India",
    interestAreas: ["Projects"],
    poc: { name: "Vikash Kumar", email: "vikash@amazon.com", contact: "+91 98001 10007" },
    status: "Active",
    memberCount: 4,
    meetings: [
      { id: "M-009", date: "2026-04-05", details: "Youth Employment Fair logistics and team briefing.", poc: "Vikash Kumar" },
    ],
    onboardingLinks: [
      {
        id: "OL-002",
        name: "Amazon Ops Volunteers — Projects Only",
        description: "Amazon India CSR only permits Projects-based volunteering, not 1:1 mentoring.",
        url: "app.wedogood.in/onboard/volunteer/operations/amazon-ops-volunteers-projects-only",
        status: "Paused",
        presetFields: [
          { field: "currentCompany", value: "Amazon India" },
          { field: "industry", value: "Consumer/E-commerce" },
        ],
        orientationSlots: [],
        createdAt: "2026-05-02",
      },
    ],
  },
  {
    id: "VG-008",
    name: "Design",
    organizationName: "Swiggy Design Studio",
    interestAreas: ["Projects"],
    poc: { name: "Sana Qureshi", email: "sana.q@swiggy.com", contact: "+91 98001 10008" },
    status: "Inactive",
    memberCount: 3,
    meetings: [],
    onboardingLinks: [],
  },
]

export const mockMenteeGroups: MenteeGroup[] = [
  {
    id: "MG-001",
    name: "Akanksha — Batch 2025",
    ngo: "Akanksha Foundation",
    poc: { name: "Mait Sharma", email: "mait@akanksha.org", contact: "+91 99001 20001" },
    memberCount: 28,
    status: "Active",
    description: "Main cohort of mentees from Akanksha Foundation, 2025 intake.",
    meetings: [
      { id: "MM-001", date: "2026-05-12", details: "NGO check-in — reviewed 5 active engagements and flagged 2 at-risk cases.", poc: "Mait Sharma" },
      { id: "MM-002", date: "2026-03-01", details: "Onboarding meeting for new batch of 12 mentees.", poc: "Mait Sharma" },
    ],
    onboardingLinks: [
      {
        id: "OL-101",
        name: "Akanksha 2026 Intake Signup",
        description: "Shared with the new Akanksha batch during their first campus visit.",
        url: "app.wedogood.in/onboard/mentee/akanksha-batch-2025/akanksha-2026-intake-signup",
        status: "Active",
        presetFields: [
          { field: "careerStage", value: "Student" },
        ],
        createdAt: "2026-06-01",
      },
    ],
  },
  {
    id: "MG-002",
    name: "NavGurukul — Cohort A",
    ngo: "NavGurukul",
    poc: { name: "Prerna Gupta", email: "prerna@navgurukul.org", contact: "+91 99001 20002" },
    memberCount: 31,
    status: "Active",
    description: "First cohort of NavGurukul students enrolled in the mentoring program.",
    meetings: [
      { id: "MM-003", date: "2026-05-20", details: "Scaling discussion — NavGurukul wants to expand to 50 mentees next quarter.", poc: "Prerna Gupta" },
    ],
    onboardingLinks: [],
  },
  {
    id: "MG-003",
    name: "Parivarthan — Group 1",
    ngo: "Parivarthan",
    poc: { name: "Rekha Shetty", email: "rekha@parivarthan.org", contact: "+91 99001 20003" },
    memberCount: 14,
    status: "Active",
    description: "First group from Parivarthan, onboarded from scratch in 2026.",
    meetings: [
      { id: "MM-004", date: "2026-04-10", details: "Initial onboarding session. 14 mentees profiled via Mira bot.", poc: "Rekha Shetty" },
    ],
    onboardingLinks: [],
  },
  {
    id: "MG-004",
    name: "Akanksha — Alumni Group",
    ngo: "Akanksha Foundation",
    poc: { name: "Mait Sharma", email: "mait@akanksha.org", contact: "+91 99001 20001" },
    memberCount: 9,
    status: "Inactive",
    description: "Closed engagements from previous Akanksha batches. Archived for reference.",
    meetings: [],
    onboardingLinks: [],
  },
]
