export type HealthScore = "Healthy" | "At Risk" | "Critical" | "Closed"
export type CallOutcome = "Positive" | "Neutral" | "No Show"

export interface CallLog {
  id: string
  date: string
  durationMins: number
  topics: string[]
  outcome: CallOutcome
  notes?: string
  feedback?: string
  menteeRating?: number
}

export interface Milestone {
  label: string
  targetDate: string
  completedDate?: string
  status: "Completed" | "In Progress" | "Not Started"
  goalPercent: number
}

export interface Engagement {
  id: string
  menteeName: string
  mentorName: string
  ngo: "Akanksha Foundation" | "NavGurukul" | "Parivarthan"
  skill: string
  startDate: string
  lastCallDate?: string
  nextCallDate?: string
  healthScore: number        // 0–100
  healthTrend: number[]      // last 6 weekly scores
  healthStatus: HealthScore
  callCount: number
  callsThisMonth: number
  milestoneGoalPct: number   // 0–100
  daysSinceLastCall?: number
  escalationFlag?: string
  callLog: CallLog[]
  milestones: Milestone[]
  recommendedAction?: string
}

export const mockEngagements: Engagement[] = [
  {
    id: "ENG-001",
    menteeName: "Priya Sharma",
    mentorName: "Ravi Kumar",
    ngo: "Akanksha Foundation",
    skill: "Resume Building",
    startDate: "2025-12-01",
    lastCallDate: "2026-05-28",
    nextCallDate: "2026-06-11",
    healthScore: 85,
    healthTrend: [60, 65, 72, 78, 82, 85],
    healthStatus: "Healthy",
    callCount: 8,
    callsThisMonth: 2,
    milestoneGoalPct: 75,
    daysSinceLastCall: 6,
    callLog: [
      {
        id: "C-001",
        date: "2026-05-28",
        durationMins: 45,
        topics: ["Interview prep", "LinkedIn profile"],
        outcome: "Positive",
        notes: "Priya did a mock interview. Feedback: good communication, needs work on case studies.",
        menteeRating: 5,
        feedback: "Very helpful session!",
      },
      {
        id: "C-002",
        date: "2026-05-14",
        durationMins: 35,
        topics: ["Resume review", "Job search strategy"],
        outcome: "Positive",
        menteeRating: 4,
      },
      {
        id: "C-003",
        date: "2026-04-30",
        durationMins: 40,
        topics: ["Skills gap analysis"],
        outcome: "Neutral",
      },
    ],
    milestones: [
      { label: "Resume polished", targetDate: "2026-01-31", completedDate: "2026-01-28", status: "Completed", goalPercent: 25 },
      { label: "LinkedIn optimised", targetDate: "2026-02-28", completedDate: "2026-02-25", status: "Completed", goalPercent: 50 },
      { label: "3 applications sent", targetDate: "2026-04-30", completedDate: "2026-04-20", status: "Completed", goalPercent: 75 },
      { label: "Interview secured", targetDate: "2026-06-30", status: "In Progress", goalPercent: 100 },
    ],
  },
  {
    id: "ENG-002",
    menteeName: "Arjun Mehta",
    mentorName: "Sneha Iyer",
    ngo: "NavGurukul",
    skill: "Frontend Development",
    startDate: "2026-01-15",
    lastCallDate: "2026-04-10",
    nextCallDate: undefined,
    healthScore: 32,
    healthTrend: [70, 65, 55, 45, 38, 32],
    healthStatus: "Critical",
    callCount: 4,
    callsThisMonth: 0,
    milestoneGoalPct: 30,
    daysSinceLastCall: 54,
    escalationFlag: "No contact in 54 days — mentor has not responded",
    recommendedAction: "Escalate to program manager and attempt direct outreach",
    callLog: [
      {
        id: "C-004",
        date: "2026-04-10",
        durationMins: 20,
        topics: ["HTML/CSS basics"],
        outcome: "Neutral",
        notes: "Short call, mentee seems disengaged.",
      },
      {
        id: "C-005",
        date: "2026-03-22",
        durationMins: 50,
        topics: ["JavaScript fundamentals", "DOM manipulation"],
        outcome: "Positive",
        menteeRating: 4,
      },
    ],
    milestones: [
      { label: "HTML/CSS project complete", targetDate: "2026-02-28", completedDate: "2026-03-10", status: "Completed", goalPercent: 33 },
      { label: "JS fundamentals done", targetDate: "2026-04-15", status: "In Progress", goalPercent: 66 },
      { label: "React mini-app built", targetDate: "2026-06-30", status: "Not Started", goalPercent: 100 },
    ],
  },
  {
    id: "ENG-003",
    menteeName: "Fatima Shaikh",
    mentorName: "Deepak Nair",
    ngo: "Akanksha Foundation",
    skill: "Public Speaking",
    startDate: "2026-02-01",
    lastCallDate: "2026-05-25",
    nextCallDate: "2026-06-08",
    healthScore: 61,
    healthTrend: [50, 52, 58, 55, 60, 61],
    healthStatus: "At Risk",
    callCount: 6,
    callsThisMonth: 1,
    milestoneGoalPct: 50,
    daysSinceLastCall: 9,
    recommendedAction: "Review call notes — last two sessions were shorter than expected",
    callLog: [
      {
        id: "C-006",
        date: "2026-05-25",
        durationMins: 25,
        topics: ["Presentation skills"],
        outcome: "Neutral",
        notes: "Short call. Fatima was nervous. Rescheduled practice session.",
      },
      {
        id: "C-007",
        date: "2026-05-11",
        durationMins: 30,
        topics: ["Body language", "Voice modulation"],
        outcome: "Positive",
        menteeRating: 3,
      },
    ],
    milestones: [
      { label: "First solo presentation", targetDate: "2026-03-15", completedDate: "2026-03-20", status: "Completed", goalPercent: 25 },
      { label: "Group workshop participation", targetDate: "2026-04-30", completedDate: "2026-04-28", status: "Completed", goalPercent: 50 },
      { label: "Debate or panel session", targetDate: "2026-06-30", status: "In Progress", goalPercent: 100 },
    ],
  },
  {
    id: "ENG-004",
    menteeName: "Kiran Rao",
    mentorName: "Anil Gupta",
    ngo: "NavGurukul",
    skill: "Data Analysis",
    startDate: "2025-11-01",
    lastCallDate: "2026-05-30",
    nextCallDate: "2026-06-13",
    healthScore: 91,
    healthTrend: [75, 80, 83, 87, 89, 91],
    healthStatus: "Healthy",
    callCount: 12,
    callsThisMonth: 3,
    milestoneGoalPct: 90,
    daysSinceLastCall: 4,
    callLog: [
      {
        id: "C-008",
        date: "2026-05-30",
        durationMins: 60,
        topics: ["SQL advanced queries", "Dashboard design"],
        outcome: "Positive",
        menteeRating: 5,
        feedback: "Best session yet. Anil explained pivots so clearly.",
      },
      {
        id: "C-009",
        date: "2026-05-16",
        durationMins: 55,
        topics: ["Python pandas", "Data visualisation"],
        outcome: "Positive",
        menteeRating: 5,
      },
    ],
    milestones: [
      { label: "Excel proficiency", targetDate: "2026-01-15", completedDate: "2026-01-12", status: "Completed", goalPercent: 25 },
      { label: "Python basics project", targetDate: "2026-02-28", completedDate: "2026-02-20", status: "Completed", goalPercent: 50 },
      { label: "SQL portfolio query", targetDate: "2026-04-15", completedDate: "2026-04-10", status: "Completed", goalPercent: 75 },
      { label: "Capstone dashboard", targetDate: "2026-06-30", status: "In Progress", goalPercent: 100 },
    ],
  },
  {
    id: "ENG-005",
    menteeName: "Rahul Das",
    mentorName: "Preethi Krishnan",
    ngo: "Parivarthan",
    skill: "Career Counselling",
    startDate: "2026-03-01",
    lastCallDate: "2026-05-20",
    nextCallDate: "2026-06-03",
    healthScore: 55,
    healthTrend: [40, 45, 52, 50, 54, 55],
    healthStatus: "At Risk",
    callCount: 5,
    callsThisMonth: 1,
    milestoneGoalPct: 40,
    daysSinceLastCall: 14,
    recommendedAction: "Mentor should confirm next call date — 2 missed schedules this month",
    callLog: [
      {
        id: "C-010",
        date: "2026-05-20",
        durationMins: 40,
        topics: ["Career options exploration"],
        outcome: "Positive",
        menteeRating: 4,
      },
    ],
    milestones: [
      { label: "Career map created", targetDate: "2026-03-31", completedDate: "2026-04-05", status: "Completed", goalPercent: 25 },
      { label: "3 informational interviews", targetDate: "2026-05-31", status: "In Progress", goalPercent: 75 },
      { label: "Action plan finalized", targetDate: "2026-07-31", status: "Not Started", goalPercent: 100 },
    ],
  },
  {
    id: "ENG-006",
    menteeName: "Nisha Patel",
    mentorName: "Vikram Singh",
    ngo: "Akanksha Foundation",
    skill: "Graphic Design",
    startDate: "2026-01-20",
    lastCallDate: "2026-03-05",
    healthScore: 18,
    healthTrend: [65, 55, 42, 30, 22, 18],
    healthStatus: "Critical",
    callCount: 3,
    callsThisMonth: 0,
    milestoneGoalPct: 20,
    daysSinceLastCall: 90,
    escalationFlag: "Mentor unreachable for 90 days — possible dropout",
    recommendedAction: "Consider volunteer replacement; contact NGO for mentee status",
    callLog: [
      {
        id: "C-011",
        date: "2026-03-05",
        durationMins: 15,
        topics: ["Canva basics"],
        outcome: "No Show",
        notes: "Mentor was 30 minutes late, mentee logged off.",
      },
    ],
    milestones: [
      { label: "Canva starter project", targetDate: "2026-02-28", status: "In Progress", goalPercent: 50 },
      { label: "Portfolio piece", targetDate: "2026-04-30", status: "Not Started", goalPercent: 100 },
    ],
  },
  {
    id: "ENG-007",
    menteeName: "Sana Qureshi",
    mentorName: "Meera Pillai",
    ngo: "NavGurukul",
    skill: "English Communication",
    startDate: "2026-02-10",
    lastCallDate: "2026-06-01",
    nextCallDate: "2026-06-15",
    healthScore: 78,
    healthTrend: [50, 58, 64, 70, 74, 78],
    healthStatus: "Healthy",
    callCount: 9,
    callsThisMonth: 2,
    milestoneGoalPct: 65,
    daysSinceLastCall: 2,
    callLog: [
      {
        id: "C-012",
        date: "2026-06-01",
        durationMins: 50,
        topics: ["Email writing", "Formal communication"],
        outcome: "Positive",
        menteeRating: 5,
        feedback: "Really helpful, I feel more confident now.",
      },
    ],
    milestones: [
      { label: "Daily journalling habit", targetDate: "2026-03-15", completedDate: "2026-03-12", status: "Completed", goalPercent: 20 },
      { label: "Email template mastered", targetDate: "2026-04-30", completedDate: "2026-04-28", status: "Completed", goalPercent: 50 },
      { label: "Mock interview in English", targetDate: "2026-06-30", status: "In Progress", goalPercent: 80 },
      { label: "Job interview cleared", targetDate: "2026-08-31", status: "Not Started", goalPercent: 100 },
    ],
  },
  {
    id: "ENG-008",
    menteeName: "Anjali Verma",
    mentorName: "Suresh Babu",
    ngo: "Parivarthan",
    skill: "Digital Marketing",
    startDate: "2026-04-01",
    lastCallDate: "2026-05-28",
    nextCallDate: "2026-06-11",
    healthScore: 72,
    healthTrend: [55, 60, 65, 68, 70, 72],
    healthStatus: "Healthy",
    callCount: 5,
    callsThisMonth: 2,
    milestoneGoalPct: 45,
    daysSinceLastCall: 6,
    callLog: [
      {
        id: "C-013",
        date: "2026-05-28",
        durationMins: 45,
        topics: ["SEO basics", "Google Analytics"],
        outcome: "Positive",
        menteeRating: 4,
      },
    ],
    milestones: [
      { label: "Social media strategy draft", targetDate: "2026-04-30", completedDate: "2026-04-28", status: "Completed", goalPercent: 25 },
      { label: "Campaign launched", targetDate: "2026-06-15", status: "In Progress", goalPercent: 60 },
      { label: "Analytics report presented", targetDate: "2026-07-31", status: "Not Started", goalPercent: 100 },
    ],
  },
]

export const ngoBreakdown = [
  {
    ngo: "Akanksha Foundation",
    total: mockEngagements.filter((e) => e.ngo === "Akanksha Foundation").length,
    healthy: mockEngagements.filter((e) => e.ngo === "Akanksha Foundation" && e.healthStatus === "Healthy").length,
    atRisk: mockEngagements.filter((e) => e.ngo === "Akanksha Foundation" && e.healthStatus === "At Risk").length,
    critical: mockEngagements.filter((e) => e.ngo === "Akanksha Foundation" && e.healthStatus === "Critical").length,
    avgHealth: Math.round(
      mockEngagements.filter((e) => e.ngo === "Akanksha Foundation").reduce((s, e) => s + e.healthScore, 0) /
      mockEngagements.filter((e) => e.ngo === "Akanksha Foundation").length
    ),
  },
  {
    ngo: "NavGurukul",
    total: mockEngagements.filter((e) => e.ngo === "NavGurukul").length,
    healthy: mockEngagements.filter((e) => e.ngo === "NavGurukul" && e.healthStatus === "Healthy").length,
    atRisk: mockEngagements.filter((e) => e.ngo === "NavGurukul" && e.healthStatus === "At Risk").length,
    critical: mockEngagements.filter((e) => e.ngo === "NavGurukul" && e.healthStatus === "Critical").length,
    avgHealth: Math.round(
      mockEngagements.filter((e) => e.ngo === "NavGurukul").reduce((s, e) => s + e.healthScore, 0) /
      mockEngagements.filter((e) => e.ngo === "NavGurukul").length
    ),
  },
  {
    ngo: "Parivarthan",
    total: mockEngagements.filter((e) => e.ngo === "Parivarthan").length,
    healthy: mockEngagements.filter((e) => e.ngo === "Parivarthan" && e.healthStatus === "Healthy").length,
    atRisk: mockEngagements.filter((e) => e.ngo === "Parivarthan" && e.healthStatus === "At Risk").length,
    critical: mockEngagements.filter((e) => e.ngo === "Parivarthan" && e.healthStatus === "Critical").length,
    avgHealth: Math.round(
      mockEngagements.filter((e) => e.ngo === "Parivarthan").reduce((s, e) => s + e.healthScore, 0) /
      mockEngagements.filter((e) => e.ngo === "Parivarthan").length
    ),
  },
]
