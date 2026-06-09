export type EscalationSource = "Escalation Agent" | "Matchmaking"
export type EscalationCategory =
  | "Safety Concern"
  | "Match Dissatisfaction"
  | "Unresponsive"
  | "Platform Issue"
  | "General Support"
  | "No Candidates Found"
  | "All Mentors Declined/Unresponsive"
export type EscalationStatus = "Open" | "In Progress" | "Resolved"
export type EscalationPriority = "High" | "Medium" | "Low"
export type PersonType = "Mentee" | "Mentor"

export interface EscalationMessage {
  sender: "admin" | "person" | "ai"
  text: string
  timestamp: string
  channel: "whatsapp" | "bot" | "internal"
}

export interface MatchAttempt {
  name: string
  role: string
  company: string
  matchPercent: number
  outreachStatus: "No Response" | "Declined" | "Accepted" | "Sent" | "Pending"
  outreachSentAt?: string
}

export interface Escalation {
  id: string
  personId: string
  personName: string
  personType: PersonType
  personNGO?: string
  personGroup?: string
  personPhone: string
  personRating?: number
  personJoinedAt?: string

  source: EscalationSource
  category: EscalationCategory
  status: EscalationStatus
  priority: EscalationPriority

  linkedEngagementId?: string   // previously linkedRequestId
  linkedEngagementTheme?: string
  linkedMentor?: string
  linkedMentee?: string

  // For Escalation Agent tickets: AI-generated summary of the situation
  // For Matchmaking tickets: structured one-liner on match status
  summary?: string

  // Match failure fields (Matchmaking source only)
  candidatesAttempted?: MatchAttempt[]

  createdAt: string
  updatedAt: string
  assignedTo?: string
  resolutionNote?: string

  internalNotes: EscalationMessage[]
}

export const mockEscalations: Escalation[] = [
  {
    id: "ESC-001",
    personId: "MTE-002",
    personName: "Arjun Patel",
    personType: "Mentee",
    personNGO: "NavGurukul",
    personGroup: "NavGurukul — Cohort 12",
    personPhone: "+91 98765 43210",
    personRating: 4.2,
    personJoinedAt: "2026-01-15",
    source: "Escalation Agent",
    category: "Match Dissatisfaction",
    status: "Open",
    priority: "High",
    linkedEngagementId: "REQ-002",
    linkedEngagementTheme: "Breaking into Software Engineering as a Self-taught Dev",
    linkedMentor: "Sneha Rao",
    summary: "Mentee expressed dissatisfaction with current mentor match. Sentiment: frustrated. States mentor 'doesn't understand what I'm going through as someone without a degree'. Possible rematch or mediation needed.",
    createdAt: "2026-06-03T14:22:00",
    updatedAt: "2026-06-03T14:22:00",
    internalNotes: [],
  },
  {
    id: "ESC-002",
    personId: "MTE-001",
    personName: "Priya Sharma",
    personType: "Mentee",
    personNGO: "Akanksha Foundation",
    personGroup: "Akanksha — Batch 2026",
    personPhone: "+91 99887 76655",
    personRating: 4.5,
    personJoinedAt: "2025-11-10",
    source: "Escalation Agent",
    category: "Safety Concern",
    status: "Open",
    priority: "High",
    linkedEngagementId: "REQ-001",
    linkedEngagementTheme: "Resume & Interview Prep for First Job",
    linkedMentor: "Rahul Mehta",
    summary: "Mentee flagged discomfort with mentor communication. Language suggests potential boundary violation. Requires urgent admin review — mentor's messages described as making her 'feel weird'.",
    createdAt: "2026-06-04T09:05:00",
    updatedAt: "2026-06-04T09:05:00",
    assignedTo: "Neha (Admin)",
    internalNotes: [
      {
        sender: "admin",
        text: "Reached out to Priya on WhatsApp. She's agreed to share screenshots. Waiting.",
        timestamp: "2026-06-04T09:45:00",
        channel: "internal",
      },
    ],
  },
  {
    id: "ESC-003",
    personId: "VOL-001",
    personName: "Rahul Mehta",
    personType: "Mentor",
    personPhone: "+91 91234 56789",
    personRating: 4.7,
    personJoinedAt: "2025-08-01",
    source: "Escalation Agent",
    category: "Unresponsive",
    status: "In Progress",
    priority: "Medium",
    linkedEngagementId: "REQ-001",
    linkedEngagementTheme: "Resume & Interview Prep for First Job",
    linkedMentee: "Priya Sharma",
    summary: "Mentor reports mentee has not responded to 3 consecutive messages over 5 days. Engagement at risk of stalling. Admin nudge recommended.",
    createdAt: "2026-06-02T18:30:00",
    updatedAt: "2026-06-03T11:00:00",
    assignedTo: "Priya (Admin)",
    internalNotes: [
      {
        sender: "admin",
        text: "Checked Priya Sharma's WA — she has been online but not responding. Sending nudge.",
        timestamp: "2026-06-03T11:00:00",
        channel: "internal",
      },
    ],
  },
  {
    id: "ESC-004",
    personId: "MTE-004",
    personName: "Rohan Das",
    personType: "Mentee",
    personNGO: "Akanksha Foundation",
    personGroup: "Akanksha — Batch 2026",
    personPhone: "+91 87654 32100",
    personRating: 3.8,
    personJoinedAt: "2026-01-20",
    source: "Escalation Agent",
    category: "Platform Issue",
    status: "Open",
    priority: "Medium",
    summary: "Mentee reports app crash when viewing mentor profile — reproduced 3 times. No linked engagement at time of report. Likely a client-side rendering issue on the mentor profile page.",
    createdAt: "2026-06-03T20:10:00",
    updatedAt: "2026-06-03T20:10:00",
    internalNotes: [],
  },
  {
    id: "ESC-005",
    personId: "MTE-006",
    personName: "Siddharth Kumar",
    personType: "Mentee",
    personNGO: "Akanksha Foundation",
    personGroup: "Akanksha — Batch 2026",
    personPhone: "+91 76543 21987",
    personRating: 4.0,
    personJoinedAt: "2026-02-05",
    source: "Escalation Agent",
    category: "General Support",
    status: "Resolved",
    priority: "Low",
    linkedEngagementId: "REQ-006",
    linkedEngagementTheme: "Personal Finance & Investment Planning Basics",
    linkedMentor: "Pooja Verma",
    summary: "Mentee expressed confusion about next steps after session completion. No urgency — needs a clear explanation of the feedback and engagement closing process.",
    createdAt: "2026-06-01T13:00:00",
    updatedAt: "2026-06-02T09:00:00",
    assignedTo: "Priya (Admin)",
    resolutionNote: "Sent Siddharth a WA message explaining the feedback and closing process. He confirmed he understood.",
    internalNotes: [],
  },
  {
    id: "ESC-006",
    personId: "VOL-002",
    personName: "Sneha Rao",
    personType: "Mentor",
    personPhone: "+91 93456 78901",
    personRating: 4.9,
    personJoinedAt: "2025-07-10",
    source: "Escalation Agent",
    category: "General Support",
    status: "In Progress",
    priority: "Low",
    linkedEngagementId: "REQ-002",
    linkedEngagementTheme: "Breaking into Software Engineering as a Self-taught Dev",
    linkedMentee: "Arjun Patel",
    summary: "Mentor going on 2-week leave from June 10. Requesting engagement pause or reassignment to another mentor. Admin action needed to prevent mentee being left without support.",
    createdAt: "2026-06-04T08:00:00",
    updatedAt: "2026-06-04T08:00:00",
    assignedTo: "Neha (Admin)",
    internalNotes: [],
  },
  // ── Matchmaking failures — always High priority ──────────────────────────────
  {
    id: "ESC-007",
    personId: "MTE-009",
    personName: "Riya Menon",
    personType: "Mentee",
    personNGO: "Parivarthan",
    personGroup: "Parivarthan — Cohort 3",
    personPhone: "+91 82345 67890",
    personRating: 4.1,
    personJoinedAt: "2026-03-10",
    source: "Matchmaking",
    category: "All Mentors Declined/Unresponsive",
    status: "Open",
    priority: "High",
    linkedEngagementId: "REQ-008",
    linkedEngagementTheme: "System Design & Architecture for Senior Engineering Roles",
    summary: "3 matches found — 1 mentor declined, 2 mentors did not respond",
    candidatesAttempted: [
      { name: "Sneha Rao", role: "Senior Software Engineer", company: "Google", matchPercent: 82, outreachStatus: "No Response", outreachSentAt: "2026-04-10T09:00:00" },
      { name: "Arjun Sharma", role: "Operations Manager", company: "Amazon India", matchPercent: 68, outreachStatus: "No Response", outreachSentAt: "2026-04-10T21:30:00" },
      { name: "Kiran Bhat", role: "Product Manager", company: "Razorpay", matchPercent: 61, outreachStatus: "Declined", outreachSentAt: "2026-04-11T10:00:00" },
    ],
    createdAt: "2026-06-05T08:00:00",
    updatedAt: "2026-06-05T08:00:00",
    internalNotes: [],
  },
  {
    id: "ESC-008",
    personId: "MTE-010",
    personName: "Divya Nair",
    personType: "Mentee",
    personNGO: "NavGurukul",
    personGroup: "NavGurukul — Cohort 13",
    personPhone: "+91 90123 45678",
    personRating: 3.9,
    personJoinedAt: "2026-04-01",
    source: "Matchmaking",
    category: "No Candidates Found",
    status: "Open",
    priority: "High",
    linkedEngagementId: "REQ-011",
    linkedEngagementTheme: "Breaking into AI/ML Research from a Non-CS Background",
    summary: "No candidates contacted — 0 matches found above threshold",
    candidatesAttempted: [],
    createdAt: "2026-06-06T11:30:00",
    updatedAt: "2026-06-06T11:30:00",
    internalNotes: [],
  },
]
