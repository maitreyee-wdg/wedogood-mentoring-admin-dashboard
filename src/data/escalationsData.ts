export type EscalationSource = "AI-Raised" | "Mentee" | "Mentor" | "System"
export type EscalationCategory =
  | "Request-Related"
  | "Platform Issue"
  | "Safety Concern"
  | "Unresponsive"
  | "Match Dissatisfaction"
  | "General Support"
  | "No Candidates Found"
  | "All Mentors Declined"
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

  linkedRequestId?: string
  linkedRequestTheme?: string
  linkedMentor?: string

  triggerMessage: string   // the WA message or bot message that caused this
  aiSummary?: string        // A7 agent summary if AI-raised

  matchFailureReason?: string          // why match failed (for No Candidates Found / All Mentors Declined)
  candidatesAttempted?: MatchAttempt[] // mentors outreached and their outcome

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
    source: "AI-Raised",
    category: "Match Dissatisfaction",
    status: "Open",
    priority: "High",
    linkedRequestId: "REQ-002",
    linkedRequestTheme: "Breaking into Software Engineering as a Self-taught Dev",
    linkedMentor: "Sneha Rao",
    triggerMessage: "I don't think this mentor is right for me, she doesn't understand what I'm going through as someone without a degree",
    aiSummary: "Mentee expressed dissatisfaction with current mentor match. Sentiment: frustrated. Possible rematch or mediation needed. Human takeover flag set.",
    createdAt: "2026-06-03T14:22:00",
    updatedAt: "2026-06-03T14:22:00",
    assignedTo: undefined,
    resolutionNote: undefined,
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
    source: "AI-Raised",
    category: "Safety Concern",
    status: "Open",
    priority: "High",
    linkedRequestId: "REQ-001",
    linkedRequestTheme: "Resume & Interview Prep for First Job",
    linkedMentor: "Rahul Mehta",
    triggerMessage: "I'm not comfortable with some of the messages my mentor sent me. I feel weird.",
    aiSummary: "Mentee flagged discomfort with mentor communication. Potential boundary violation. Requires urgent admin review. Human takeover flag set.",
    createdAt: "2026-06-04T09:05:00",
    updatedAt: "2026-06-04T09:05:00",
    assignedTo: "Neha (Admin)",
    resolutionNote: undefined,
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
    personNGO: undefined,
    personGroup: undefined,
    personPhone: "+91 91234 56789",
    personRating: 4.7,
    personJoinedAt: "2025-08-01",
    source: "Mentor",
    category: "Unresponsive",
    status: "In Progress",
    priority: "Medium",
    linkedRequestId: "REQ-001",
    linkedRequestTheme: "Resume & Interview Prep for First Job",
    linkedMentor: undefined,
    triggerMessage: "My mentee hasn't responded to my last 3 messages. I'm not sure if she's still interested or if something happened.",
    aiSummary: undefined,
    createdAt: "2026-06-02T18:30:00",
    updatedAt: "2026-06-03T11:00:00",
    assignedTo: "Priya (Admin)",
    resolutionNote: undefined,
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
    source: "Mentee",
    category: "Platform Issue",
    status: "Open",
    priority: "Medium",
    linkedRequestId: undefined,
    linkedRequestTheme: undefined,
    linkedMentor: undefined,
    triggerMessage: "The app keeps crashing when I try to view my mentor's profile. I've tried 3 times.",
    aiSummary: undefined,
    createdAt: "2026-06-03T20:10:00",
    updatedAt: "2026-06-03T20:10:00",
    assignedTo: undefined,
    resolutionNote: undefined,
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
    source: "AI-Raised",
    category: "General Support",
    status: "Resolved",
    priority: "Low",
    linkedRequestId: "REQ-006",
    linkedRequestTheme: "Personal Finance & Investment Planning Basics",
    linkedMentor: "Pooja Verma",
    triggerMessage: "I'm confused about the next steps, nobody told me what happens after the session.",
    aiSummary: "Mentee expressed confusion about post-session process. Low urgency. Admin can clarify via WA.",
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
    personNGO: undefined,
    personGroup: undefined,
    personPhone: "+91 93456 78901",
    personRating: 4.9,
    personJoinedAt: "2025-07-10",
    source: "Mentor",
    category: "General Support",
    status: "In Progress",
    priority: "Low",
    linkedRequestId: "REQ-002",
    linkedRequestTheme: "Breaking into Software Engineering as a Self-taught Dev",
    linkedMentor: undefined,
    triggerMessage: "I'm going on leave for 2 weeks from June 10. Can we pause the request or transfer to someone else?",
    aiSummary: undefined,
    createdAt: "2026-06-04T08:00:00",
    updatedAt: "2026-06-04T08:00:00",
    assignedTo: "Neha (Admin)",
    resolutionNote: undefined,
    internalNotes: [],
  },
  // ── Match failure escalations (System-raised, always High priority) ──────────
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
    source: "System",
    category: "All Mentors Declined",
    status: "Open",
    priority: "High",
    linkedRequestId: "REQ-008",
    linkedRequestTheme: "System Design & Architecture for Senior Engineering Roles",
    linkedMentor: undefined,
    triggerMessage: "Automated: All outreached mentors for REQ-008 have either declined or not responded within the 48-hour window.",
    aiSummary: "3 mentors were contacted for this request. 1 explicitly declined, 2 did not respond within the defined outreach window. No active mentor assigned. Requires admin intervention — extend outreach pool or manually assign.",
    matchFailureReason: "All 3 candidates in the outreach batch have exhausted their response window. Highest match score was 82% (Sneha Rao, No Response). No backup candidates remain in the eligible pool for this domain.",
    candidatesAttempted: [
      { name: "Sneha Rao", role: "Senior Software Engineer", company: "Google", matchPercent: 82, outreachStatus: "No Response", outreachSentAt: "2026-04-10T09:00:00" },
      { name: "Arjun Sharma", role: "Operations Manager", company: "Amazon India", matchPercent: 68, outreachStatus: "No Response", outreachSentAt: "2026-04-10T21:30:00" },
      { name: "Kiran Bhat", role: "Product Manager", company: "Razorpay", matchPercent: 61, outreachStatus: "Declined", outreachSentAt: "2026-04-11T10:00:00" },
    ],
    createdAt: "2026-06-05T08:00:00",
    updatedAt: "2026-06-05T08:00:00",
    assignedTo: undefined,
    resolutionNote: undefined,
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
    source: "System",
    category: "No Candidates Found",
    status: "Open",
    priority: "High",
    linkedRequestId: "REQ-011",
    linkedRequestTheme: "Breaking into AI/ML Research from a Non-CS Background",
    linkedMentor: undefined,
    triggerMessage: "Automated: Matching engine found 0 eligible candidates for REQ-011 after applying domain, availability and language filters.",
    aiSummary: "No mentor profiles in the current volunteer pool meet the skill threshold (≥50% match) for AI/ML Research with a non-CS mentee context. The request has been open for 9 days without a single outreach being sent. Expand the volunteer pool or adjust match criteria.",
    matchFailureReason: "Matching engine returned 0 candidates after applying filters: domain = AI/ML Research, language = English, availability = weekends. The volunteer pool has only 2 AI/ML profiles and both are currently at capacity (3 active mentees each).",
    candidatesAttempted: [],
    createdAt: "2026-06-06T11:30:00",
    updatedAt: "2026-06-06T11:30:00",
    assignedTo: undefined,
    resolutionNote: undefined,
    internalNotes: [],
  },
]
