export type RequestStatus =
  | "Draft"
  | "New"
  | "Match Approval Pending"
  | "Mentor Response Pending"
  | "No Match Found"
  | "Matched"
  | "Accessed Contact"
  | "Call Done — Feedback Pending"
  | "Closed"
  | "Expired"

export type RequestType = "New Mentor" | "Existing Mentor"

export const ACTIVE_STATUSES: RequestStatus[] = [
  "Draft", "New", "Match Approval Pending", "Mentor Response Pending", "No Match Found", "Matched", "Accessed Contact",
]

export const INACTIVE_STATUSES: RequestStatus[] = [
  "Call Done — Feedback Pending", "Closed", "Expired",
]

export const ALL_STATUSES: RequestStatus[] = [...ACTIVE_STATUSES, ...INACTIVE_STATUSES]

export interface MatchCandidate {
  id: string
  name: string
  role: string
  company: string
  matchPercent: number
  matchReason: string
  outreachStatus: "Pending" | "Sent" | "No Response" | "Declined" | "Accepted"
  outreachSentAt?: string   // ISO string
}

export interface AiMessage {
  sender: "mentee" | "mira"
  text: string
  timestamp: string   // ISO string
}

export interface CascadeLogEntry {
  mentorId: string
  mentorName: string
  notifiedAt: string
  respondedAt?: string
  response: "accepted" | "declined" | "no_response"
  reason?: string
}

export interface MatchScoreBreakdown {
  experienceGap: number
  domainDepth: number
  stateOrigin: number
  cityTier: number
  collegeType: number
  companyTrajectory: number
  careerTrajectory: number
  platformRating: number
  priorExperience: number
}

export interface MenteeFeedback {
  q1Relevance?: number       // 1–5: How relevant was the guidance?
  q2Understanding?: number   // 1–5: Did the mentor understand your challenge?
  q3Actionability?: number   // 1–5: How actionable was the advice?
  q4Continue?: boolean       // Would you want to continue with this mentor?
  q5Needs?: string           // What other help do you need?
  freeText?: string
  submittedAt?: string
}

export interface MentorFeedback {
  rating?: number            // 1–5: Rating of the mentee
  notes?: string
  submittedAt?: string
}

export interface MentoringRequest {
  id: string
  menteeId: string
  menteeName: string
  menteeGroup: string
  ngo: string
  requestDate: string
  theme: string
  goal?: string
  targetDomain: string
  targetRole: string
  skillsNeeded: string[]
  requestType: RequestType
  status: RequestStatus
  matchedMentor: string | null
  activeDays: number
  aiConversation: AiMessage[]
  matchCandidates: MatchCandidate[]
  cascadeLog?: CascadeLogEntry[]
  matchScore?: number
  matchScoreBreakdown?: MatchScoreBreakdown
  approvedTemplate?: string
  menteeFeedback?: MenteeFeedback
  mentorFeedback?: MentorFeedback
}

export const matchingTemplates = [
  {
    id: "T1", name: "Standard Match Request", description: "Friendly intro with mentee context",
    vars: ["volunteer_first_name", "mentee_first_name", "engagement_goal", "volunteer_fit_reason", "request_deep_link"],
    message: "Hi {{1}}! 🙌 You have a new mentorship request on WeDoGood.\n\nWe think you'd be a great fit for {{2}} — they're looking for help with {{3}}.\n\nWhy you? {{4}}\n\nView the full request and respond here 👇\n🔗 {{5}}",
  },
  {
    id: "T2", name: "Urgent Match Request", description: "Shorter response window, time-sensitive",
    vars: ["volunteer_first_name", "mentee_first_name", "engagement_goal", "hours_remaining", "request_deep_link"],
    message: "Hi {{1}}! ⏰ Urgent — {{2}} needs a mentor for {{3}} and you're a top match. Please respond within {{4}} hours.\n🔗 {{5}}",
  },
  {
    id: "T3", name: "Domain Expert Request", description: "Highlights specific skills needed",
    vars: ["volunteer_first_name", "engagement_theme", "mentee_first_name", "mentee_group_name", "request_deep_link"],
    message: "Hi {{1}}! We have a mentee who specifically needs expertise in {{2}}. The mentee is {{3}} from {{4}}. Your background makes you a perfect fit — would you be open to this engagement?\n🔗 {{5}}",
  },
]

// ─── Mock Requests ─────────────────────────────────────────────────────────────

export const mockRequests: MentoringRequest[] = [
  // ── REQ-001: Matched — Priya Sharma / Resume Writing ──────────────────────
  {
    id: "REQ-001",
    menteeId: "MTE-001",
    menteeName: "Priya Sharma",
    menteeGroup: "Akanksha — Batch 2026",
    ngo: "Akanksha Foundation",
    requestDate: "2026-04-30",
    theme: "Resume & Interview Prep for First Job",
    goal: "Build a strong first resume and pass at least 2 mock interviews before applying to HR/admin roles",
    targetDomain: "Human Resources / Career Services",
    targetRole: "Entry-level Job Aspirant",
    skillsNeeded: ["Resume Writing", "Interview Preparation", "Career Guidance"],
    requestType: "New Mentor",
    status: "Matched",
    matchedMentor: "Rahul Mehta",
    activeDays: 34,
    aiConversation: [
      { sender: "mira", text: "Hi Priya! 👋 I'm Mira from WeDoGood. I'm here to help you connect with the right mentor. What would you like guidance with?", timestamp: "2026-04-30T10:00:00" },
      { sender: "mentee", text: "I need help writing my resume and preparing for job interviews", timestamp: "2026-04-30T10:01:30" },
      { sender: "mira", text: "That's a great goal! Are you currently a student or already working?", timestamp: "2026-04-30T10:01:45" },
      { sender: "mentee", text: "I'm in 12th grade, will finish in a few months and want to start applying for jobs", timestamp: "2026-04-30T10:02:20" },
      { sender: "mira", text: "Got it! So you're building your first professional resume and want interview coaching. Do you have any specific industry in mind?", timestamp: "2026-04-30T10:02:35" },
      { sender: "mentee", text: "Not really, open to anything — maybe HR or admin roles", timestamp: "2026-04-30T10:03:10" },
      { sender: "mira", text: "Perfect. I've noted your request — I'll find you a mentor experienced in HR and career coaching. You'll hear from me soon! 🎯", timestamp: "2026-04-30T10:03:25" },
    ],
    matchCandidates: [
      { id: "VOL-001", name: "Rahul Mehta", role: "HR Business Partner", company: "Infosys", matchPercent: 94, matchReason: "Exact skills match; has coached fresh graduates on resume & interviews", outreachStatus: "Accepted", outreachSentAt: "2026-04-30T14:00:00" },
      { id: "VOL-006", name: "Divya Krishnan", role: "Marketing Lead", company: "Zomato", matchPercent: 71, matchReason: "Communication & career coaching skills; hiring experience", outreachStatus: "Pending" },
    ],
    cascadeLog: [
      { mentorId: "VOL-001", mentorName: "Rahul Mehta", notifiedAt: "2026-04-30T14:00:00", respondedAt: "2026-04-30T16:30:00", response: "accepted" },
    ],
    matchScore: 94,
    matchScoreBreakdown: { experienceGap: 18, domainDepth: 20, stateOrigin: 8, cityTier: 7, collegeType: 10, companyTrajectory: 10, careerTrajectory: 9, platformRating: 9, priorExperience: 3 },
  },

  // ── REQ-002: Matched — Arjun Patel / Software Engineering ─────────────────
  {
    id: "REQ-002",
    menteeId: "MTE-002",
    menteeName: "Arjun Patel",
    menteeGroup: "NavGurukul — Cohort 12",
    ngo: "NavGurukul",
    requestDate: "2026-05-03",
    theme: "Breaking into Software Engineering as a Self-taught Dev",
    goal: "Land a full-time SDE role at a product company within 3 months",
    targetDomain: "Technology",
    targetRole: "Junior Software Engineer",
    skillsNeeded: ["Software Engineering", "React", "Career Guidance", "Code Reviews"],
    requestType: "New Mentor",
    status: "Matched",
    matchedMentor: "Sneha Rao",
    activeDays: 31,
    aiConversation: [
      { sender: "mira", text: "Hi Arjun! 👋 What skill or career area would you like mentoring on?", timestamp: "2026-05-02T18:00:00" },
      { sender: "mentee", text: "I'm a self-taught developer and I want to get a full-time job in software engineering. I know React and Node but I dropped out of college", timestamp: "2026-05-02T18:01:00" },
      { sender: "mira", text: "That's a solid foundation! What specifically do you want help with — job search strategy, technical prep, or building a portfolio?", timestamp: "2026-05-02T18:01:30" },
      { sender: "mentee", text: "All of it honestly, but mainly getting my code reviewed and understanding what companies look for", timestamp: "2026-05-02T18:02:00" },
      { sender: "mira", text: "Great — I'll find you a senior engineer who can do code reviews and guide your job search. Request created! 🚀", timestamp: "2026-05-02T18:02:20" },
    ],
    matchCandidates: [
      { id: "VOL-002", name: "Sneha Rao", role: "Senior Software Engineer", company: "Google", matchPercent: 92, matchReason: "React specialist, has guided self-taught devs in job search before", outreachStatus: "Accepted", outreachSentAt: "2026-05-03T10:00:00" },
      { id: "VOL-003", name: "Amit Joshi", role: "Data Analyst", company: "Swiggy", matchPercent: 68, matchReason: "Python & coding skills; limited front-end experience", outreachStatus: "Pending" },
    ],
    cascadeLog: [
      { mentorId: "VOL-002", mentorName: "Sneha Rao", notifiedAt: "2026-05-03T10:00:00", respondedAt: "2026-05-03T11:15:00", response: "accepted" },
    ],
    matchScore: 92,
    matchScoreBreakdown: { experienceGap: 16, domainDepth: 20, stateOrigin: 5, cityTier: 8, collegeType: 8, companyTrajectory: 12, careerTrajectory: 10, platformRating: 9, priorExperience: 4 },
  },

  // ── REQ-003: Match Approval Pending — Kavya Nair / Product Management ──────
  {
    id: "REQ-003",
    menteeId: "MTE-003",
    menteeName: "Kavya Nair",
    menteeGroup: "Parivarthan — Batch 1",
    ngo: "Parivarthan",
    requestDate: "2026-06-01",
    theme: "Transitioning from Operations to Product Management",
    goal: "Understand PM fundamentals and get clarity on how to position my ops experience for a PM role",
    targetDomain: "Product Management",
    targetRole: "Associate Product Manager",
    skillsNeeded: ["Product Management", "Product Roadmapping", "User Research", "Prioritisation Frameworks"],
    requestType: "New Mentor",
    status: "Match Approval Pending",
    matchedMentor: null,
    activeDays: 2,
    aiConversation: [
      { sender: "mira", text: "Hi Kavya! 😊 What are you hoping to get from a mentor?", timestamp: "2026-06-01T09:00:00" },
      { sender: "mentee", text: "I'm currently in operations at Myntra but I want to move into Product Management. I don't know how to make the switch.", timestamp: "2026-06-01T09:01:00" },
      { sender: "mira", text: "That's a popular and very doable transition! Do you know what kind of product role you're aiming for — B2C, B2B, platform?", timestamp: "2026-06-01T09:01:20" },
      { sender: "mentee", text: "Probably B2C. I'm most familiar with consumer apps like the ones I use at work.", timestamp: "2026-06-01T09:02:00" },
      { sender: "mira", text: "Great context! I'll match you with a PM who can guide you on making that ops-to-product transition. Anything specific you'd like to learn?", timestamp: "2026-06-01T09:02:20" },
      { sender: "mentee", text: "Roadmapping, user research, and how to write good PRDs would be super helpful", timestamp: "2026-06-01T09:03:00" },
      { sender: "mira", text: "Perfect. I've captured your request — you should hear back soon! 🙌", timestamp: "2026-06-01T09:03:15" },
    ],
    matchCandidates: [
      { id: "VOL-005", name: "Kiran Bhat", role: "Product Manager", company: "Razorpay", matchPercent: 87, matchReason: "Direct PM experience; has mentored ops-to-PM transitions before", outreachStatus: "Pending" },
      { id: "VOL-006", name: "Divya Krishnan", role: "Marketing Lead", company: "Zomato", matchPercent: 72, matchReason: "Cross-functional B2C experience; strong on user research & GTM", outreachStatus: "Pending" },
      { id: "VOL-009", name: "Vikram Singh", role: "Sales Director", company: "Salesforce India", matchPercent: 65, matchReason: "Senior leadership background; stakeholder management skills", outreachStatus: "Pending" },
      { id: "VOL-010", name: "Ananya Roy", role: "Content Strategist", company: "Byju's", matchPercent: 52, matchReason: "Adjacent skills in content strategy; limited direct product experience", outreachStatus: "Pending" },
    ],
  },

  // ── REQ-004: Mentor Response Pending — Rohan Das / Data Analysis ───────────
  {
    id: "REQ-004",
    menteeId: "MTE-004",
    menteeName: "Rohan Das",
    menteeGroup: "Akanksha — Batch 2026",
    ngo: "Akanksha Foundation",
    requestDate: "2026-05-08",
    theme: "Upskilling in Data Analysis & Advanced Excel",
    goal: "Be able to independently run data analysis projects and write basic SQL queries",
    targetDomain: "Data & Analytics",
    targetRole: "Data Analyst",
    skillsNeeded: ["Data Analysis", "Advanced Excel", "SQL", "Python (basics)"],
    requestType: "New Mentor",
    status: "Mentor Response Pending",
    matchedMentor: null,
    activeDays: 26,
    aiConversation: [
      { sender: "mira", text: "Hi Rohan! What would you like to learn from a mentor?", timestamp: "2026-05-07T20:00:00" },
      { sender: "mentee", text: "I'm a junior analyst and I want to improve my data analysis skills. Especially advanced Excel and SQL.", timestamp: "2026-05-07T20:01:00" },
      { sender: "mira", text: "Good plan! Are you open to learning Python basics too, or keeping it to Excel and SQL for now?", timestamp: "2026-05-07T20:01:20" },
      { sender: "mentee", text: "Yes, Python basics would help too. Not too deep though.", timestamp: "2026-05-07T20:01:50" },
      { sender: "mira", text: "Noted! I'll find you a data professional who can guide you through advanced Excel, SQL, and intro Python. Request is in! ✅", timestamp: "2026-05-07T20:02:10" },
    ],
    matchCandidates: [
      { id: "VOL-003", name: "Amit Joshi", role: "Data Analyst", company: "Swiggy", matchPercent: 94, matchReason: "Exact skills match; data analysis, Excel & Python experience", outreachStatus: "No Response", outreachSentAt: "2026-05-08T10:00:00" },
      { id: "VOL-002", name: "Sneha Rao", role: "Senior Software Engineer", company: "Google", matchPercent: 78, matchReason: "Strong Python and data skills; experienced in technical mentoring", outreachStatus: "Sent", outreachSentAt: "2026-05-08T22:30:00" },
      { id: "VOL-001", name: "Rahul Mehta", role: "HR Business Partner", company: "Infosys", matchPercent: 45, matchReason: "Career guidance skills; limited depth in data analysis", outreachStatus: "Pending" },
    ],
    cascadeLog: [
      { mentorId: "VOL-003", mentorName: "Amit Joshi", notifiedAt: "2026-05-08T10:00:00", response: "no_response" },
      { mentorId: "VOL-002", mentorName: "Sneha Rao", notifiedAt: "2026-05-08T22:30:00", response: "no_response" },
    ],
  },

  // ── REQ-005: New — Meena Iyer / Public Speaking ────────────────────────────
  {
    id: "REQ-005",
    menteeId: "MTE-005",
    menteeName: "Meena Iyer",
    menteeGroup: "NavGurukul — Cohort 12",
    ngo: "NavGurukul",
    requestDate: "2026-06-02",
    theme: "Overcoming Stage Fright & Building Communication Confidence",
    goal: "Be able to speak up confidently in group settings and deliver a 5-minute presentation without anxiety",
    targetDomain: "Communication & Soft Skills",
    targetRole: "Entry-level Professional",
    skillsNeeded: ["Public Speaking", "Presentation Skills", "Confidence Building"],
    requestType: "New Mentor",
    status: "New",
    matchedMentor: null,
    activeDays: 1,
    aiConversation: [
      { sender: "mira", text: "Hi Meena! 👋 What would you like help with from a mentor?", timestamp: "2026-06-02T11:00:00" },
      { sender: "mentee", text: "I'm very nervous when I have to speak in public or in meetings. I want to get better at it.", timestamp: "2026-06-02T11:01:30" },
      { sender: "mira", text: "Public speaking anxiety is very common — and very fixable with the right guidance! Are there specific situations that worry you most — presentations, group discussions, interviews?", timestamp: "2026-06-02T11:01:50" },
      { sender: "mentee", text: "Mostly presentations and speaking up in group settings", timestamp: "2026-06-02T11:02:30" },
      { sender: "mira", text: "Got it. I'll find a mentor who can help you build confidence in presentations and group communication. Request created! 🎤", timestamp: "2026-06-02T11:02:50" },
    ],
    matchCandidates: [],
  },

  // ── REQ-006: Matched — Siddharth Kumar / Finance ──────────────────────────
  {
    id: "REQ-006",
    menteeId: "MTE-006",
    menteeName: "Siddharth Kumar",
    menteeGroup: "Akanksha — Batch 2026",
    ngo: "Akanksha Foundation",
    requestDate: "2026-05-11",
    theme: "Personal Finance & Investment Planning Basics",
    goal: "Start a SIP, understand mutual fund categories, and build a basic personal financial plan",
    targetDomain: "Finance & Investment",
    targetRole: "Finance Associate",
    skillsNeeded: ["Investment Basics", "Mutual Funds", "Financial Planning", "Portfolio Management"],
    requestType: "New Mentor",
    status: "Matched",
    matchedMentor: "Pooja Verma",
    activeDays: 23,
    aiConversation: [
      { sender: "mira", text: "Hi Siddharth! What are you looking for in a mentor?", timestamp: "2026-05-10T19:00:00" },
      { sender: "mentee", text: "I want to learn about personal investing — mutual funds, stocks, SIPs. I'm a finance associate but I don't really apply this to my own money.", timestamp: "2026-05-10T19:01:00" },
      { sender: "mira", text: "That's very practical! Are you focused on learning theory, or do you want hands-on help with your own financial planning?", timestamp: "2026-05-10T19:01:20" },
      { sender: "mentee", text: "Both. I want to understand the fundamentals and then apply them.", timestamp: "2026-05-10T19:02:00" },
      { sender: "mira", text: "Perfect. I'll find you a finance mentor who can cover investment basics and help with your personal planning. ✅", timestamp: "2026-05-10T19:02:20" },
    ],
    matchCandidates: [
      { id: "VOL-004", name: "Pooja Verma", role: "Finance Manager", company: "HDFC Bank", matchPercent: 91, matchReason: "Deep finance and investment expertise; great mentoring track record", outreachStatus: "Accepted", outreachSentAt: "2026-05-11T12:00:00" },
      { id: "VOL-009", name: "Vikram Singh", role: "Sales Director", company: "Salesforce India", matchPercent: 58, matchReason: "Business acumen but limited personal finance expertise", outreachStatus: "Pending" },
    ],
  },

  // ── REQ-007: Draft — Ananya Singh / Career Exploration ────────────────────
  {
    id: "REQ-007",
    menteeId: "MTE-007",
    menteeName: "Ananya Singh",
    menteeGroup: "Parivarthan — Batch 1",
    ngo: "Parivarthan",
    requestDate: "2026-06-02",
    theme: "Exploring Career Options After 12th Grade",
    targetDomain: "Career Counselling",
    targetRole: "Student",
    skillsNeeded: ["Career Counselling", "Goal Setting"],
    requestType: "New Mentor",
    status: "Draft",
    matchedMentor: null,
    activeDays: 1,
    aiConversation: [
      { sender: "mira", text: "Hi Ananya! 😊 I'm Mira. Tell me — what kind of career guidance are you looking for?", timestamp: "2026-06-02T14:00:00" },
      { sender: "mentee", text: "I'm in 12th Arts and I have no idea what to do after school. I'm confused.", timestamp: "2026-06-02T14:01:00" },
      { sender: "mira", text: "Totally okay — that's a very common feeling! Are there any subjects or activities you enjoy most right now?", timestamp: "2026-06-02T14:01:20" },
      { sender: "mentee", text: "I like drawing and writing. But I don't know if that can be a career.", timestamp: "2026-06-02T14:02:00" },
      { sender: "mira", text: "Absolutely they can be! Design, content, journalism, UX are all real careers. Let me save this — a career counsellor mentor can help you explore your options. Should I submit your request?", timestamp: "2026-06-02T14:02:30" },
      { sender: "mentee", text: "Let me think about it first", timestamp: "2026-06-02T14:03:00" },
      { sender: "mira", text: "No problem! I'll save this as a draft and you can submit whenever you're ready. 🙂", timestamp: "2026-06-02T14:03:15" },
    ],
    matchCandidates: [],
  },

  // ── REQ-008: Closed — Vikram Rao / Backend Dev ─────────────────────────────
  {
    id: "REQ-008",
    menteeId: "MTE-008",
    menteeName: "Vikram Rao",
    menteeGroup: "NavGurukul — Cohort 11",
    ngo: "NavGurukul",
    requestDate: "2026-02-01",
    theme: "Backend Development & REST API Design",
    goal: "Design and build a portfolio REST API project demonstrating proper system design principles",
    targetDomain: "Technology",
    targetRole: "Backend Developer",
    skillsNeeded: ["Backend Development", "REST APIs", "Java", "System Design basics"],
    requestType: "New Mentor",
    status: "Closed",
    matchedMentor: "Rahul Mehta",
    activeDays: 92,
    aiConversation: [
      { sender: "mira", text: "Hi Vikram! What are you looking to improve as a developer?", timestamp: "2026-01-31T16:00:00" },
      { sender: "mentee", text: "I want to build better REST APIs and understand how to design backend systems properly", timestamp: "2026-01-31T16:01:00" },
      { sender: "mira", text: "Solid goal! You're currently using Java, right? Any preference for a mentor who also uses Java?", timestamp: "2026-01-31T16:01:30" },
      { sender: "mentee", text: "Yes, Java preferred but open to others", timestamp: "2026-01-31T16:02:00" },
      { sender: "mira", text: "Got it! I'll find you a backend-focused mentor. Request submitted ✅", timestamp: "2026-01-31T16:02:20" },
    ],
    matchCandidates: [
      { id: "VOL-001", name: "Rahul Mehta", role: "HR Business Partner", company: "Infosys", matchPercent: 77, matchReason: "Java background, Infosys experience; career + technical guidance", outreachStatus: "Accepted", outreachSentAt: "2026-02-01T10:00:00" },
    ],
    cascadeLog: [
      { mentorId: "VOL-001", mentorName: "Rahul Mehta", notifiedAt: "2026-02-01T10:00:00", respondedAt: "2026-02-01T14:00:00", response: "accepted" },
    ],
    menteeFeedback: {
      q1Relevance: 4,
      q2Understanding: 5,
      q3Actionability: 4,
      q4Continue: true,
      q5Needs: "More guidance on system design patterns",
      freeText: "Rahul was very patient and helped me structure my thinking around REST APIs. Would love to continue.",
      submittedAt: "2026-05-05T10:00:00",
    },
    mentorFeedback: {
      rating: 4,
      notes: "Vikram is a fast learner. Good grasp of Java fundamentals. Needs more practice with database design.",
      submittedAt: "2026-05-06T09:30:00",
    },
  },

  // ── REQ-009: No Match Found — Arjun Patel / System Design ─────────────────
  {
    id: "REQ-009",
    menteeId: "MTE-002",
    menteeName: "Arjun Patel",
    menteeGroup: "NavGurukul — Cohort 12",
    ngo: "NavGurukul",
    requestDate: "2026-04-10",
    theme: "System Design Concepts for Interview Preparation",
    targetDomain: "Technology",
    targetRole: "Software Engineer (Mid-level preparation)",
    skillsNeeded: ["System Design", "Distributed Systems", "Database Design"],
    requestType: "New Mentor",
    status: "No Match Found",
    matchedMentor: null,
    activeDays: 18,
    aiConversation: [
      { sender: "mira", text: "Hi Arjun! What do you want to work on next?", timestamp: "2026-04-09T17:00:00" },
      { sender: "mentee", text: "I'm starting to prepare for interviews at bigger companies. I need to understand system design — I have no clue about it.", timestamp: "2026-04-09T17:01:00" },
      { sender: "mira", text: "System design is key for senior+ interviews. Do you have a target company or level in mind?", timestamp: "2026-04-09T17:01:30" },
      { sender: "mentee", text: "Not yet, but I want to be ready for product companies. Maybe FAANG eventually.", timestamp: "2026-04-09T17:02:00" },
      { sender: "mira", text: "Ambitious and totally doable. I'll look for a senior engineer who can guide you through system design fundamentals. ✅", timestamp: "2026-04-09T17:02:20" },
    ],
    matchCandidates: [
      { id: "VOL-002", name: "Sneha Rao", role: "Senior Software Engineer", company: "Google", matchPercent: 82, matchReason: "Strong system design & distributed systems experience at Google", outreachStatus: "No Response", outreachSentAt: "2026-04-10T09:00:00" },
      { id: "VOL-007", name: "Arjun Sharma", role: "Operations Manager", company: "Amazon India", matchPercent: 68, matchReason: "System thinking at scale (ops); limited software design depth", outreachStatus: "No Response", outreachSentAt: "2026-04-10T21:30:00" },
      { id: "VOL-005", name: "Kiran Bhat", role: "Product Manager", company: "Razorpay", matchPercent: 61, matchReason: "Product-system understanding; non-technical mentor", outreachStatus: "Declined", outreachSentAt: "2026-04-11T10:00:00" },
    ],
    cascadeLog: [
      { mentorId: "VOL-002", mentorName: "Sneha Rao", notifiedAt: "2026-04-10T09:00:00", response: "no_response" },
      { mentorId: "VOL-007", mentorName: "Arjun Sharma", notifiedAt: "2026-04-10T21:30:00", response: "no_response" },
      { mentorId: "VOL-005", mentorName: "Kiran Bhat", notifiedAt: "2026-04-11T10:00:00", respondedAt: "2026-04-11T18:00:00", response: "declined", reason: "Outside my area of expertise" },
    ],
  },

  // ── REQ-010: Call Done — Feedback Pending — Priya Sharma / Interview Skills ─
  {
    id: "REQ-010",
    menteeId: "MTE-001",
    menteeName: "Priya Sharma",
    menteeGroup: "Akanksha — Batch 2026",
    ngo: "Akanksha Foundation",
    requestDate: "2026-03-15",
    theme: "Mock Interview Practice for First Job Placement",
    goal: "Complete 5 mock interviews and receive structured feedback on improvement areas",
    targetDomain: "Career Services",
    targetRole: "Entry-level Candidate",
    skillsNeeded: ["Mock Interviews", "Body Language", "Answering Behavioural Questions"],
    requestType: "Existing Mentor",
    status: "Call Done — Feedback Pending",
    matchedMentor: "Rahul Mehta",
    activeDays: 45,
    aiConversation: [
      { sender: "mira", text: "Hi Priya! What do you need help with today?", timestamp: "2026-03-14T10:00:00" },
      { sender: "mentee", text: "I want to do some mock interview practice before my placement season starts", timestamp: "2026-03-14T10:01:00" },
      { sender: "mira", text: "Great timing! Since you already work with Rahul Mehta, should I route this to him?", timestamp: "2026-03-14T10:01:20" },
      { sender: "mentee", text: "Yes please, he knows my background", timestamp: "2026-03-14T10:02:00" },
      { sender: "mira", text: "Done! I've flagged this to Rahul. He'll reach out to you to schedule the mock sessions. ✅", timestamp: "2026-03-14T10:02:20" },
    ],
    matchCandidates: [
      { id: "VOL-001", name: "Rahul Mehta", role: "HR Business Partner", company: "Infosys", matchPercent: 96, matchReason: "Existing mentor; specialises in interview coaching", outreachStatus: "Accepted", outreachSentAt: "2026-03-15T10:00:00" },
    ],
    cascadeLog: [
      { mentorId: "VOL-001", mentorName: "Rahul Mehta", notifiedAt: "2026-03-15T10:00:00", respondedAt: "2026-03-15T11:00:00", response: "accepted" },
    ],
  },

  // ── REQ-011: Expired — Rohan Das / Python ─────────────────────────────────
  {
    id: "REQ-011",
    menteeId: "MTE-004",
    menteeName: "Rohan Das",
    menteeGroup: "Akanksha — Batch 2026",
    ngo: "Akanksha Foundation",
    requestDate: "2026-03-20",
    theme: "Introduction to Python for Data Work",
    targetDomain: "Technology / Data",
    targetRole: "Analyst",
    skillsNeeded: ["Python", "Pandas", "Data Wrangling"],
    requestType: "New Mentor",
    status: "Expired",
    matchedMentor: null,
    activeDays: 14,
    aiConversation: [
      { sender: "mira", text: "Hi Rohan! What's on your learning list?", timestamp: "2026-03-19T15:00:00" },
      { sender: "mentee", text: "I want to start learning Python for my data work", timestamp: "2026-03-19T15:01:00" },
      { sender: "mira", text: "Great choice! Are you a complete beginner in Python or do you have some basics?", timestamp: "2026-03-19T15:01:20" },
      { sender: "mentee", text: "Complete beginner", timestamp: "2026-03-19T15:02:00" },
      { sender: "mira", text: "Perfect — I'll find you a Python mentor focused on data use cases. Request submitted ✅", timestamp: "2026-03-19T15:02:20" },
    ],
    matchCandidates: [
      { id: "VOL-002", name: "Sneha Rao", role: "Senior Software Engineer", company: "Google", matchPercent: 80, matchReason: "Python expert; data engineering background", outreachStatus: "No Response", outreachSentAt: "2026-03-20T10:00:00" },
      { id: "VOL-003", name: "Amit Joshi", role: "Data Analyst", company: "Swiggy", matchPercent: 75, matchReason: "Python for data — Pandas & data wrangling experience", outreachStatus: "No Response", outreachSentAt: "2026-03-20T22:30:00" },
    ],
    cascadeLog: [
      { mentorId: "VOL-002", mentorName: "Sneha Rao", notifiedAt: "2026-03-20T10:00:00", response: "no_response" },
      { mentorId: "VOL-003", mentorName: "Amit Joshi", notifiedAt: "2026-03-20T22:30:00", response: "no_response" },
    ],
  },
]
