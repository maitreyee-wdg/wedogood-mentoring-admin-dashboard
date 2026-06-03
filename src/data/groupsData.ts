export interface GroupMeeting {
  id: string
  date: string
  details: string
  poc: string
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
}

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
  },
]
