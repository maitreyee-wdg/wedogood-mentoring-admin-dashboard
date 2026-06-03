export type EngagementStatus = "Active" | "Pending Match" | "Closed" | "On Hold"

export interface MenteeExperience {
  role: string
  company: string
  duration: string
}

export interface MenteeEducation {
  level: string
  degree: string
  institute: string
  yearOfGraduation: string
}

export interface Mentee {
  id: string
  name: string
  gender: "Male" | "Female" | "Other"
  isStudent: boolean
  age: number
  ngo: string
  group: string
  currentRole: string
  currentCompany: string
  totalYearsExp: number
  pastExperience: MenteeExperience[]
  skills: string[]
  education: MenteeEducation
  goals: string[]
  rating: number          // avg of all ratings given by mentors; 0 = unrated
  language: string
  location: string
  scopedNeed: string
  knowsTheirNeed: boolean
  engagementStatus: EngagementStatus
  joinedAt: string
  whatsapp: string
  email: string
  linkedin: string
  resume?: string
}

export const mockMentees: Mentee[] = [
  {
    id: "MTE-001",
    name: "Priya Sharma",
    gender: "Female",
    isStudent: true,
    age: 18,
    ngo: "Akanksha Foundation",
    group: "Akanksha — Batch 2026",
    currentRole: "Student",
    currentCompany: "—",
    totalYearsExp: 0,
    pastExperience: [],
    skills: ["Basic Excel", "Communication", "Hindi / English"],
    education: { level: "12th Grade", degree: "Science", institute: "St. Xavier's School, Mumbai", yearOfGraduation: "2026" },
    goals: ["Career Clarity", "Job Readiness"],
    rating: 4.5,
    language: "English",
    location: "Mumbai",
    scopedNeed: "Resume Writing & Interview Prep",
    knowsTheirNeed: true,
    engagementStatus: "Active",
    joinedAt: "2026-04-10",
    whatsapp: "+91 98765 00001",
    email: "priya.sharma@gmail.com",
    linkedin: "linkedin.com/in/priyasharma",
  },
  {
    id: "MTE-002",
    name: "Arjun Patel",
    gender: "Male",
    isStudent: false,
    age: 22,
    ngo: "NavGurukul",
    group: "NavGurukul — Cohort 12",
    currentRole: "Freelance Developer",
    currentCompany: "Self",
    totalYearsExp: 1,
    pastExperience: [
      { role: "Software Intern", company: "Startup Labs, Pune", duration: "2024 (6 months)" },
    ],
    skills: ["JavaScript", "React", "Node.js", "Python basics"],
    education: { level: "B.Tech (Dropout)", degree: "Computer Science", institute: "VIT Pune", yearOfGraduation: "—" },
    goals: ["Software Career", "First Full-time Job"],
    rating: 4.2,
    language: "English",
    location: "Pune",
    scopedNeed: "Software Engineering Mentorship",
    knowsTheirNeed: true,
    engagementStatus: "Active",
    joinedAt: "2026-04-15",
    whatsapp: "+91 98765 00002",
    email: "arjun.patel22@gmail.com",
    linkedin: "linkedin.com/in/arjunpatel",
  },
  {
    id: "MTE-003",
    name: "Kavya Nair",
    gender: "Female",
    isStudent: false,
    age: 24,
    ngo: "Parivarthan",
    group: "Parivarthan — Batch 1",
    currentRole: "Operations Executive",
    currentCompany: "Myntra",
    totalYearsExp: 2,
    pastExperience: [
      { role: "Business Dev Intern", company: "Swiggy", duration: "2023 (4 months)" },
    ],
    skills: ["Excel", "Operations", "Stakeholder Communication"],
    education: { level: "B.Com", degree: "Commerce", institute: "Christ University, Bengaluru", yearOfGraduation: "2024" },
    goals: ["Career Growth", "Move into Product Management"],
    rating: 0,
    language: "English / Kannada",
    location: "Bangalore",
    scopedNeed: "Product Management Guidance",
    knowsTheirNeed: false,
    engagementStatus: "Pending Match",
    joinedAt: "2026-05-01",
    whatsapp: "+91 98765 00003",
    email: "kavya.nair@gmail.com",
    linkedin: "linkedin.com/in/kavyanair",
  },
  {
    id: "MTE-004",
    name: "Rohan Das",
    gender: "Male",
    isStudent: false,
    age: 23,
    ngo: "Akanksha Foundation",
    group: "Akanksha — Batch 2026",
    currentRole: "Junior Analyst",
    currentCompany: "Deloitte",
    totalYearsExp: 1,
    pastExperience: [
      { role: "Data Intern", company: "KPMG", duration: "2024 (3 months)" },
    ],
    skills: ["Excel", "SQL basics", "Data Cleaning"],
    education: { level: "B.Sc", degree: "Statistics", institute: "Delhi University", yearOfGraduation: "2024" },
    goals: ["Finance Career", "Data Skills"],
    rating: 3.8,
    language: "Hindi",
    location: "Delhi",
    scopedNeed: "Data Analysis & Advanced Excel",
    knowsTheirNeed: true,
    engagementStatus: "Active",
    joinedAt: "2026-04-20",
    whatsapp: "+91 98765 00004",
    email: "rohan.das@gmail.com",
    linkedin: "linkedin.com/in/rohandas",
  },
  {
    id: "MTE-005",
    name: "Meena Iyer",
    gender: "Female",
    isStudent: false,
    age: 21,
    ngo: "NavGurukul",
    group: "NavGurukul — Cohort 12",
    currentRole: "Final Year Student",
    currentCompany: "—",
    totalYearsExp: 0,
    pastExperience: [],
    skills: ["Writing", "Tamil / English"],
    education: { level: "BA", degree: "English Literature", institute: "Stella Maris College, Chennai", yearOfGraduation: "2025" },
    goals: ["Communication Skills", "Confidence Building"],
    rating: 0,
    language: "English / Tamil",
    location: "Chennai",
    scopedNeed: "Public Speaking & Presentation Skills",
    knowsTheirNeed: false,
    engagementStatus: "Pending Match",
    joinedAt: "2026-05-05",
    whatsapp: "+91 98765 00005",
    email: "meena.iyer@gmail.com",
    linkedin: "—",
  },
  {
    id: "MTE-006",
    name: "Siddharth Kumar",
    gender: "Male",
    isStudent: false,
    age: 27,
    ngo: "Akanksha Foundation",
    group: "Akanksha — Batch 2026",
    currentRole: "Finance Associate",
    currentCompany: "Kotak Mahindra Bank",
    totalYearsExp: 3,
    pastExperience: [
      { role: "Finance Intern", company: "ICICI Bank", duration: "2022 (6 months)" },
      { role: "Junior Analyst", company: "Deloitte", duration: "2022–2023" },
    ],
    skills: ["Accounting", "Excel", "Tally", "Financial Reporting"],
    education: { level: "MBA", degree: "Finance", institute: "NMIMS Mumbai", yearOfGraduation: "2024" },
    goals: ["Investment Knowledge", "Financial Planning Skills"],
    rating: 4.0,
    language: "Hindi / English",
    location: "Jaipur",
    scopedNeed: "Finance & Investment Basics",
    knowsTheirNeed: true,
    engagementStatus: "Active",
    joinedAt: "2026-04-25",
    whatsapp: "+91 98765 00006",
    email: "siddharth.kumar@gmail.com",
    linkedin: "linkedin.com/in/siddharthkumar",
  },
  {
    id: "MTE-007",
    name: "Ananya Singh",
    gender: "Female",
    isStudent: true,
    age: 17,
    ngo: "Parivarthan",
    group: "Parivarthan — Batch 1",
    currentRole: "Student",
    currentCompany: "—",
    totalYearsExp: 0,
    pastExperience: [],
    skills: ["Hindi", "Communication", "Arts"],
    education: { level: "12th Grade", degree: "Arts", institute: "City Montessori School, Lucknow", yearOfGraduation: "2026" },
    goals: ["Career Clarity"],
    rating: 0,
    language: "Hindi",
    location: "Lucknow",
    scopedNeed: "Unsure — exploring career options",
    knowsTheirNeed: false,
    engagementStatus: "On Hold",
    joinedAt: "2026-03-15",
    whatsapp: "+91 98765 00007",
    email: "ananya.singh@gmail.com",
    linkedin: "—",
  },
  {
    id: "MTE-008",
    name: "Vikram Rao",
    gender: "Male",
    isStudent: false,
    age: 23,
    ngo: "NavGurukul",
    group: "NavGurukul — Cohort 11",
    currentRole: "Junior Developer",
    currentCompany: "Infosys",
    totalYearsExp: 1,
    pastExperience: [
      { role: "Dev Intern", company: "TCS", duration: "2024 (6 months)" },
    ],
    skills: ["Java", "SQL", "REST APIs", "Git"],
    education: { level: "Diploma", degree: "Computer Engineering", institute: "KLE Polytechnic, Belgaum", yearOfGraduation: "2023" },
    goals: ["Placement", "Backend Development Skills"],
    rating: 4.8,
    language: "Kannada / English",
    location: "Mysore",
    scopedNeed: "Backend Development & System Design",
    knowsTheirNeed: true,
    engagementStatus: "Closed",
    joinedAt: "2026-02-01",
    whatsapp: "+91 98765 00008",
    email: "vikram.rao@gmail.com",
    linkedin: "linkedin.com/in/vikramrao",
  },
]

export const ngoGroups = [
  { id: "GRP-001", name: "Akanksha Foundation", count: 30, color: "blue" },
  { id: "GRP-002", name: "NavGurukul", count: 30, color: "green" },
  { id: "GRP-003", name: "Parivarthan", count: 12, color: "purple" },
]
