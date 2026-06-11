export type ProgramType = "Mentoring" | "Projects" | "Both"
export type ProgramStatus = "Active" | "Closed"

export interface ProgramPOC {
  name: string
  role: string
  email: string
  mobile: string
  isMain: boolean
}

export interface ProgramMeeting {
  id: string
  date: string       // ISO date
  title: string
  notes: string
}

export interface Program {
  id: string
  name: string
  organization: string
  type: ProgramType
  status: ProgramStatus
  startDate: string
  endDate?: string
  summary: string
  details: string
  constraints: {
    beneficiary: string
    engagement: string
    volunteer: string
  }
  pocs: ProgramPOC[]
  meetings: ProgramMeeting[]
  linkedMenteeGroupIds: string[]  // maps program → mentee groups → mentees → requests
}

export const mockPrograms: Program[] = [
  {
    id: "PROG-001",
    name: "Mentoring Circle",
    organization: "CRY",
    type: "Mentoring",
    status: "Active",
    startDate: "2025-11-01",
    summary: "1:1 mentoring for CRY Delhi youth aged 14–18",
    details: "Weekly mentoring sessions connecting corporate volunteers with CRY beneficiaries. Focus on career guidance, academic support, and life skills. 12-week programme with structured curriculum and progress tracking.",
    constraints: {
      beneficiary: "Children aged 14–18 from underserved communities in Delhi NCR region",
      engagement: "Minimum 2 hours per week commitment for 3 months",
      volunteer: "Must have 3+ years professional experience and pass background check",
    },
    pocs: [
      { name: "Arun Mehta", role: "Programme Director", email: "arun.m@cry.org", mobile: "+91-98112-33445", isMain: true },
      { name: "Sunita Rao", role: "Field Coordinator", email: "sunita.r@cry.org", mobile: "+91-98221-44556", isMain: false },
    ],
    meetings: [
      { id: "M1", date: "2025-12-01", title: "Kick-off call", notes: "Introductions and programme overview with NGO team and first cohort of mentors." },
      { id: "M2", date: "2026-02-15", title: "Mid-programme review", notes: "Progress check on matched pairs. 8 of 12 pairs actively meeting. 2 rematch requests raised." },
    ],
    linkedMenteeGroupIds: ["MGP-001", "MGP-002"],
  },
  {
    id: "PROG-002",
    name: "Career Pathways",
    organization: "NavGurukul",
    type: "Both",
    status: "Active",
    startDate: "2026-01-15",
    summary: "Tech skills + mentoring for coding school graduates",
    details: "Dual-track programme pairing NavGurukul graduates with industry professionals for both project-based learning and 1:1 mentoring. Participants work on real-world projects while receiving career coaching. 6-month cohort model.",
    constraints: {
      beneficiary: "NavGurukul graduates within 6 months of completion",
      engagement: "4 hours per week — 2 for project work, 2 for mentoring sessions",
      volunteer: "Software engineers or product managers with 5+ years experience",
    },
    pocs: [
      { name: "Preethi Nair", role: "Partnerships Lead", email: "preethi@navgurukul.org", mobile: "+91-80987-65432", isMain: true },
    ],
    meetings: [
      { id: "M3", date: "2026-01-20", title: "Cohort orientation", notes: "Orientation for first cohort of 15 graduates. Programme rules, expectations, and intro to mentors." },
    ],
    linkedMenteeGroupIds: ["MGP-003"],
  },
  {
    id: "PROG-003",
    name: "Project Launchpad",
    organization: "Akanksha Foundation",
    type: "Projects",
    status: "Active",
    startDate: "2026-03-01",
    summary: "Real-world project experience for college-age mentees",
    details: "Mentees from Akanksha's college programme are matched with corporate volunteer teams to complete 8-week projects in areas like data analysis, web development, and digital marketing. Focus on portfolio building and professional skills.",
    constraints: {
      beneficiary: "Akanksha college students (Year 2 or above)",
      engagement: "10 hours per week for 8 weeks",
      volunteer: "Teams of 2–3 professionals; one must be a designated project lead",
    },
    pocs: [
      { name: "Rohan Desai", role: "Corporate Engagement Manager", email: "rohan.d@akanksha.org", mobile: "+91-22654-32109", isMain: true },
      { name: "Anita Singh", role: "Student Coordinator", email: "anita.s@akanksha.org", mobile: "+91-22765-43210", isMain: false },
    ],
    meetings: [],
    linkedMenteeGroupIds: ["MGP-004"],
  },
  {
    id: "PROG-004",
    name: "Women in Leadership",
    organization: "Parivarthan",
    type: "Mentoring",
    status: "Closed",
    startDate: "2025-06-01",
    endDate: "2025-12-31",
    summary: "Leadership mentoring for young women in Bengaluru",
    details: "Six-month mentoring programme for young women (18–25) from Parivarthan's network. Focused on leadership skills, confidence building, and career planning. Concluded successfully with 32 matched pairs.",
    constraints: {
      beneficiary: "Women aged 18–25 from Parivarthan communities in Bengaluru",
      engagement: "Bi-weekly sessions of 1 hour each for 6 months",
      volunteer: "Women professionals in leadership roles with 8+ years experience",
    },
    pocs: [
      { name: "Kavitha Menon", role: "Programme Head", email: "kavitha@parivarthan.org", mobile: "+91-80123-45678", isMain: true },
    ],
    meetings: [
      { id: "M4", date: "2025-07-01", title: "Programme launch", notes: "Launch event with 32 mentor-mentee pairs. NGO leadership and WeDoGood team attended." },
      { id: "M5", date: "2025-09-15", title: "Mid-programme check-in", notes: "All pairs progressing well. 3 pairs requested topic change; handled by coordinators." },
      { id: "M6", date: "2025-12-20", title: "Closing ceremony", notes: "Successful conclusion. 28 of 32 pairs completed all sessions. Feedback collected." },
    ],
    linkedMenteeGroupIds: [],
  },
]
