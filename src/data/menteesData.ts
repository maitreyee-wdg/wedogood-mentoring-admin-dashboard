export type EngagementStatus = "Active" | "Pending Match" | "Closed" | "On Hold"

export interface Mentee {
  id: string
  name: string
  gender: "Male" | "Female" | "Other"
  ngo: string
  educationLevel: string
  language: string
  location: string
  goals: string[]
  scopedNeed: string
  knowsTheirNeed: boolean
  engagementStatus: EngagementStatus
  assignedMentor: string | null
  joinedAt: string
  phone?: string
}

export const mockMentees: Mentee[] = [
  {
    id: "MTE-001",
    name: "Priya Sharma",
    gender: "Female",
    ngo: "Akanksha Foundation",
    educationLevel: "12th Grade",
    language: "English",
    location: "Mumbai",
    goals: ["Career Clarity", "Job Readiness"],
    scopedNeed: "Resume Writing & Interview Prep",
    knowsTheirNeed: true,
    engagementStatus: "Active",
    assignedMentor: "Rahul Mehta",
    joinedAt: "2026-04-10",
    phone: "+91 98765 00001",
  },
  {
    id: "MTE-002",
    name: "Arjun Patel",
    gender: "Male",
    ngo: "NavGurukul",
    educationLevel: "B.Tech (Dropout)",
    language: "English",
    location: "Pune",
    goals: ["Software Career", "First Job"],
    scopedNeed: "Software Engineering Mentorship",
    knowsTheirNeed: true,
    engagementStatus: "Active",
    assignedMentor: "Sneha Rao",
    joinedAt: "2026-04-15",
    phone: "+91 98765 00002",
  },
  {
    id: "MTE-003",
    name: "Kavya Nair",
    gender: "Female",
    ngo: "Parivarthan",
    educationLevel: "B.Com",
    language: "English / Kannada",
    location: "Bangalore",
    goals: ["Career Growth", "Leadership"],
    scopedNeed: "Product Management",
    knowsTheirNeed: false,
    engagementStatus: "Pending Match",
    assignedMentor: null,
    joinedAt: "2026-05-01",
    phone: "+91 98765 00003",
  },
  {
    id: "MTE-004",
    name: "Rohan Das",
    gender: "Male",
    ngo: "Akanksha Foundation",
    educationLevel: "B.Sc",
    language: "Hindi",
    location: "Delhi",
    goals: ["Finance Career", "Skill Building"],
    scopedNeed: "Data Analysis & Excel",
    knowsTheirNeed: true,
    engagementStatus: "Active",
    assignedMentor: "Amit Joshi",
    joinedAt: "2026-04-20",
    phone: "+91 98765 00004",
  },
  {
    id: "MTE-005",
    name: "Meena Iyer",
    gender: "Female",
    ngo: "NavGurukul",
    educationLevel: "BA",
    language: "English / Tamil",
    location: "Chennai",
    goals: ["Communication Skills", "Confidence"],
    scopedNeed: "Public Speaking",
    knowsTheirNeed: false,
    engagementStatus: "Pending Match",
    assignedMentor: null,
    joinedAt: "2026-05-05",
    phone: "+91 98765 00005",
  },
  {
    id: "MTE-006",
    name: "Siddharth Kumar",
    gender: "Male",
    ngo: "Akanksha Foundation",
    educationLevel: "MBA",
    language: "Hindi / English",
    location: "Jaipur",
    goals: ["Investment Knowledge", "Financial Planning"],
    scopedNeed: "Finance & Investment Basics",
    knowsTheirNeed: true,
    engagementStatus: "Active",
    assignedMentor: "Pooja Verma",
    joinedAt: "2026-04-25",
    phone: "+91 98765 00006",
  },
  {
    id: "MTE-007",
    name: "Ananya Singh",
    gender: "Female",
    ngo: "Parivarthan",
    educationLevel: "12th Grade",
    language: "Hindi",
    location: "Lucknow",
    goals: ["Career Clarity"],
    scopedNeed: "Unsure — exploring options",
    knowsTheirNeed: false,
    engagementStatus: "On Hold",
    assignedMentor: null,
    joinedAt: "2026-03-15",
    phone: "+91 98765 00007",
  },
  {
    id: "MTE-008",
    name: "Vikram Rao",
    gender: "Male",
    ngo: "NavGurukul",
    educationLevel: "Diploma",
    language: "Kannada / English",
    location: "Mysore",
    goals: ["Placement", "Technical Skills"],
    scopedNeed: "Backend Development",
    knowsTheirNeed: true,
    engagementStatus: "Closed",
    assignedMentor: "Rahul Mehta",
    joinedAt: "2026-02-01",
    phone: "+91 98765 00008",
  },
]

export const ngoGroups = [
  { id: "GRP-001", name: "Akanksha Foundation", count: 30, color: "blue" },
  { id: "GRP-002", name: "NavGurukul", count: 30, color: "green" },
  { id: "GRP-003", name: "Parivarthan", count: 12, color: "purple" },
]
