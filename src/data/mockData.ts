export type MatchingStatus = "AI Matched" | "Manually Matched" | "Pending"
export type ConnectionStatus = "Connected" | "Meeting Scheduled" | "Not Connected"
export type AvailabilityStatus = "Available" | "On Leave" | "Inactive"

export interface Request {
  id: string
  mentee: string
  ngo: string
  opportunityType: string
  requiredSkills: string[]
  assignedVolunteer: string | null
  matchingStatus: MatchingStatus
  connectionStatus: ConnectionStatus
  createdAt: string
}

export interface Volunteer {
  id: string
  name: string
  skills: string[]
  domain: string
  experience: number
  availability: AvailabilityStatus
  matchScore?: number
}

export const mockRequests: Request[] = [
  {
    id: "REQ-001",
    mentee: "Priya Sharma",
    ngo: "Akanksha Foundation",
    opportunityType: "Skilled Mentoring",
    requiredSkills: ["Resume Writing", "Interview Prep"],
    assignedVolunteer: "Rahul Mehta",
    matchingStatus: "AI Matched",
    connectionStatus: "Connected",
    createdAt: "2026-05-01",
  },
  {
    id: "REQ-002",
    mentee: "Arjun Patel",
    ngo: "NavGurukul",
    opportunityType: "Skilled Mentoring",
    requiredSkills: ["Software Engineering", "Career Guidance"],
    assignedVolunteer: "Sneha Rao",
    matchingStatus: "Manually Matched",
    connectionStatus: "Meeting Scheduled",
    createdAt: "2026-05-03",
  },
  {
    id: "REQ-003",
    mentee: "Kavya Nair",
    ngo: "Parivarthan",
    opportunityType: "Expert Sessions",
    requiredSkills: ["Product Management"],
    assignedVolunteer: null,
    matchingStatus: "Pending",
    connectionStatus: "Not Connected",
    createdAt: "2026-05-07",
  },
  {
    id: "REQ-004",
    mentee: "Rohan Das",
    ngo: "Akanksha Foundation",
    opportunityType: "Skilled Mentoring",
    requiredSkills: ["Data Analysis", "Excel"],
    assignedVolunteer: "Amit Joshi",
    matchingStatus: "AI Matched",
    connectionStatus: "Meeting Scheduled",
    createdAt: "2026-05-08",
  },
  {
    id: "REQ-005",
    mentee: "Meena Iyer",
    ngo: "NavGurukul",
    opportunityType: "Training & Workshops",
    requiredSkills: ["Public Speaking", "Communication"],
    assignedVolunteer: null,
    matchingStatus: "Pending",
    connectionStatus: "Not Connected",
    createdAt: "2026-05-10",
  },
  {
    id: "REQ-006",
    mentee: "Siddharth Kumar",
    ngo: "Akanksha Foundation",
    opportunityType: "Skilled Mentoring",
    requiredSkills: ["Finance", "Investment Basics"],
    assignedVolunteer: "Pooja Verma",
    matchingStatus: "Manually Matched",
    connectionStatus: "Connected",
    createdAt: "2026-05-11",
  },
]

export const mockVolunteers: Volunteer[] = [
  {
    id: "VOL-001",
    name: "Rahul Mehta",
    skills: ["Resume Writing", "Interview Prep", "Career Guidance"],
    domain: "Human Resources",
    experience: 8,
    availability: "Available",
    matchScore: 94,
  },
  {
    id: "VOL-002",
    name: "Sneha Rao",
    skills: ["Software Engineering", "React", "Career Guidance"],
    domain: "Technology",
    experience: 6,
    availability: "Available",
    matchScore: 88,
  },
  {
    id: "VOL-003",
    name: "Amit Joshi",
    skills: ["Data Analysis", "Excel", "Python"],
    domain: "Analytics",
    experience: 5,
    availability: "Available",
    matchScore: 82,
  },
  {
    id: "VOL-004",
    name: "Pooja Verma",
    skills: ["Finance", "Investment Basics", "Accounting"],
    domain: "Finance",
    experience: 10,
    availability: "On Leave",
    matchScore: 79,
  },
]
