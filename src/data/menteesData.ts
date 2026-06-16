export type EngagementStatus = "Active" | "Pending Match" | "Closed" | "On Hold"
export type CareerStage = "Student" | "Working" | "Unemployed" | "Fresh Graduate"

export interface PreviousRole {
  role: string
  company: string
  years: number
}

export interface MenteeEducation {
  level: string
  degree: string
  institute: string
  yearOfGraduation: string
}

export interface MenteeLocation {
  city: string
  state: string
  country: string
}

export interface Mentee {
  id: string
  firstName: string
  lastName: string
  gender: "Male" | "Female" | "Other"
  careerStage: CareerStage
  age: number
  ngo: string
  group: string
  currentRole: string
  currentCompany: string
  totalYearsExp: number
  domain: string
  previousRoles: PreviousRole[]
  skills: string[]
  education: MenteeEducation
  goals: string[]
  rating: number          // avg of all ratings given by mentors; 0 = unrated
  preferredLanguages: string[]
  hometown: MenteeLocation
  currentLocation: MenteeLocation
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
    firstName: "Priya", lastName: "Sharma",
    gender: "Female",
    careerStage: "Student",
    age: 18,
    ngo: "Akanksha Foundation",
    group: "Akanksha — Batch 2026",
    currentRole: "Student",
    currentCompany: "—",
    totalYearsExp: 0,
    domain: "Career Counselling",
    previousRoles: [],
    skills: ["Basic Excel", "Communication", "Hindi / English"],
    education: { level: "12th Grade", degree: "Science", institute: "St. Xavier's School, Mumbai", yearOfGraduation: "2026" },
    goals: ["Career Clarity", "Job Readiness"],
    rating: 4.5,
    preferredLanguages: ["English", "Hindi"],
    hometown: { city: "Mumbai", state: "Maharashtra", country: "India" },
    currentLocation: { city: "Mumbai", state: "Maharashtra", country: "India" },
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
    firstName: "Arjun", lastName: "Patel",
    gender: "Male",
    careerStage: "Working",
    age: 22,
    ngo: "NavGurukul",
    group: "NavGurukul — Cohort 12",
    currentRole: "Freelance Developer",
    currentCompany: "Self",
    totalYearsExp: 1,
    domain: "Software Engineering",
    previousRoles: [
      { role: "Software Intern", company: "Startup Labs", years: 0.5 },
    ],
    skills: ["JavaScript", "React", "Node.js", "Python basics"],
    education: { level: "B.Tech (Dropout)", degree: "Computer Science", institute: "VIT Pune", yearOfGraduation: "—" },
    goals: ["Software Career", "First Full-time Job"],
    rating: 4.2,
    preferredLanguages: ["English"],
    hometown: { city: "Pune", state: "Maharashtra", country: "India" },
    currentLocation: { city: "Pune", state: "Maharashtra", country: "India" },
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
    firstName: "Kavya", lastName: "Nair",
    gender: "Female",
    careerStage: "Working",
    age: 24,
    ngo: "Parivarthan",
    group: "Parivarthan — Batch 1",
    currentRole: "Operations Executive",
    currentCompany: "Myntra",
    totalYearsExp: 2,
    domain: "Product Management",
    previousRoles: [
      { role: "Business Dev Intern", company: "Swiggy", years: 0.3 },
    ],
    skills: ["Excel", "Operations", "Stakeholder Communication"],
    education: { level: "B.Com", degree: "Commerce", institute: "Christ University, Bengaluru", yearOfGraduation: "2024" },
    goals: ["Career Growth", "Move into Product Management"],
    rating: 0,
    preferredLanguages: ["English", "Kannada"],
    hometown: { city: "Bengaluru", state: "Karnataka", country: "India" },
    currentLocation: { city: "Bengaluru", state: "Karnataka", country: "India" },
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
    firstName: "Rohan", lastName: "Das",
    gender: "Male",
    careerStage: "Working",
    age: 23,
    ngo: "Akanksha Foundation",
    group: "Akanksha — Batch 2026",
    currentRole: "Junior Analyst",
    currentCompany: "Deloitte",
    totalYearsExp: 1,
    domain: "Data Analysis",
    previousRoles: [
      { role: "Data Intern", company: "KPMG", years: 0.25 },
    ],
    skills: ["Excel", "SQL basics", "Data Cleaning"],
    education: { level: "B.Sc", degree: "Statistics", institute: "Delhi University", yearOfGraduation: "2024" },
    goals: ["Finance Career", "Data Skills"],
    rating: 3.8,
    preferredLanguages: ["Hindi"],
    hometown: { city: "Delhi", state: "Delhi", country: "India" },
    currentLocation: { city: "Delhi", state: "Delhi", country: "India" },
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
    firstName: "Meena", lastName: "Iyer",
    gender: "Female",
    careerStage: "Student",
    age: 21,
    ngo: "NavGurukul",
    group: "NavGurukul — Cohort 12",
    currentRole: "Final Year Student",
    currentCompany: "—",
    totalYearsExp: 0,
    domain: "Communication",
    previousRoles: [],
    skills: ["Writing", "Tamil / English"],
    education: { level: "BA", degree: "English Literature", institute: "Stella Maris College, Chennai", yearOfGraduation: "2025" },
    goals: ["Communication Skills", "Confidence Building"],
    rating: 0,
    preferredLanguages: ["English", "Tamil"],
    hometown: { city: "Chennai", state: "Tamil Nadu", country: "India" },
    currentLocation: { city: "Chennai", state: "Tamil Nadu", country: "India" },
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
    firstName: "Siddharth", lastName: "Kumar",
    gender: "Male",
    careerStage: "Working",
    age: 27,
    ngo: "Akanksha Foundation",
    group: "Akanksha — Batch 2026",
    currentRole: "Finance Associate",
    currentCompany: "Kotak Mahindra Bank",
    totalYearsExp: 3,
    domain: "Finance",
    previousRoles: [
      { role: "Finance Intern", company: "ICICI Bank", years: 0.5 },
      { role: "Junior Analyst", company: "Deloitte", years: 1 },
    ],
    skills: ["Accounting", "Excel", "Tally", "Financial Reporting"],
    education: { level: "MBA", degree: "Finance", institute: "NMIMS Mumbai", yearOfGraduation: "2024" },
    goals: ["Investment Knowledge", "Financial Planning Skills"],
    rating: 4.0,
    preferredLanguages: ["Hindi", "English"],
    hometown: { city: "Jaipur", state: "Rajasthan", country: "India" },
    currentLocation: { city: "Jaipur", state: "Rajasthan", country: "India" },
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
    firstName: "Ananya", lastName: "Singh",
    gender: "Female",
    careerStage: "Student",
    age: 17,
    ngo: "Parivarthan",
    group: "Parivarthan — Batch 1",
    currentRole: "Student",
    currentCompany: "—",
    totalYearsExp: 0,
    domain: "Career Counselling",
    previousRoles: [],
    skills: ["Hindi", "Communication", "Arts"],
    education: { level: "12th Grade", degree: "Arts", institute: "City Montessori School, Lucknow", yearOfGraduation: "2026" },
    goals: ["Career Clarity"],
    rating: 0,
    preferredLanguages: ["Hindi"],
    hometown: { city: "Lucknow", state: "Uttar Pradesh", country: "India" },
    currentLocation: { city: "Lucknow", state: "Uttar Pradesh", country: "India" },
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
    firstName: "Vikram", lastName: "Rao",
    gender: "Male",
    careerStage: "Working",
    age: 23,
    ngo: "NavGurukul",
    group: "NavGurukul — Cohort 11",
    currentRole: "Junior Developer",
    currentCompany: "Infosys",
    totalYearsExp: 1,
    domain: "Backend Development",
    previousRoles: [
      { role: "Dev Intern", company: "TCS", years: 0.5 },
    ],
    skills: ["Java", "SQL", "REST APIs", "Git"],
    education: { level: "Diploma", degree: "Computer Engineering", institute: "KLE Polytechnic, Belgaum", yearOfGraduation: "2023" },
    goals: ["Placement", "Backend Development Skills"],
    rating: 4.8,
    preferredLanguages: ["Kannada", "English"],
    hometown: { city: "Mysuru", state: "Karnataka", country: "India" },
    currentLocation: { city: "Mysuru", state: "Karnataka", country: "India" },
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
