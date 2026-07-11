export type OrientationStatus =
  | "Orientation Pending"
  | "Orientation Slot Booked"
  | "Orientation Done"
  | "Orientation Rescheduled"

export type VolunteerStatus = "Profile Incomplete" | "Orientation call not booked" | "Orientation booked" | "Active" | "Occupied" | "Inactive" | "Archived"
export type PreferredMenteeStage = "College students" | "Fresh graduates" | "0–4 yrs" | "4–8 yrs"
export type VolunteeringType = "Mentoring" | "Projects" | "Both"

export interface Experience {
  role: string
  company: string
  duration: string
}

export interface PastRequest {
  id: string
  menteeName: string
  skill: string
  closedAt: string
  feedback?: string
  rating?: number
}

export interface ActiveRequest {
  id: string
  menteeName: string
  skill: string
  startedAt: string
}

export interface Project {
  projectName: string
  programName: string
  ngo: string
}

export interface PastProject extends Project {
  endDate: string
}

export interface Location {
  city: string
  state: string
  country: string
}

export interface Volunteer {
  id: string
  name: string
  currentRole: string
  currentCompany: string
  totalYearsExp: number
  pastExperience: Experience[]
  skills: string[]
  volunteeringType: VolunteeringType
  preferredMenteeStage: PreferredMenteeStage[]   // only relevant if Mentoring or Both
  domain: string
  industry: string
  mentoringRating: number
  projectsRating: number
  group: string
  preferredLanguages: string[]
  hometown: Location
  currentLocation: Location
  whatsapp: string
  email: string
  officialEmail: string
  linkedin: string
  resume?: string
  status: VolunteerStatus
  orientationStatus: OrientationStatus
  orientationDate?: string
  orientationTime?: string
  orientationCallMeetingLink?: string
  signedUpDate: string
  sessionAvailability: "Available" | "On Leave" | "Inactive"
  activeRequest?: ActiveRequest
  pastRequests: PastRequest[]
  activeProjects: Project[]
  pastProjects: PastProject[]
  // legacy compat
  rating: number
}

export const mockVolunteers: Volunteer[] = [
  {
    id: "VOL-001",
    name: "Rahul Mehta",
    currentRole: "HR Business Partner",
    currentCompany: "Infosys",
    totalYearsExp: 8,
    pastExperience: [
      { role: "HR Executive", company: "Wipro", duration: "2018–2021" },
      { role: "Recruiter", company: "Naukri.com", duration: "2016–2018" },
    ],
    skills: ["Resume Writing", "Interview Prep", "Career Guidance"],
    volunteeringType: "Mentoring",
    preferredMenteeStage: ["College students", "Fresh graduates", "0–4 yrs"],
    domain: "HR & People",
    industry: "Technology",
    mentoringRating: 4.7,
    projectsRating: 0,
    rating: 4.7,
    group: "HR & People",
    preferredLanguages: ["English", "Hindi"],
    hometown: { city: "Lucknow", state: "Uttar Pradesh", country: "India" },
    currentLocation: { city: "Bengaluru", state: "Karnataka", country: "India" },
    whatsapp: "+91 98765 11001",
    email: "rahul.mehta@gmail.com",
    officialEmail: "rahul.mehta@infosys.com",
    linkedin: "linkedin.com/in/rahulmehta",
    status: "Active",
    orientationStatus: "Orientation Done",
    signedUpDate: "2025-09-10",
    activeRequest: { id: "REQ-001", menteeName: "Priya Sharma", skill: "Resume Writing", startedAt: "2026-05-01" },
    pastRequests: [
      { id: "REQ-P01", menteeName: "Ankit Verma", skill: "Interview Prep", closedAt: "2026-03-10", feedback: "Very helpful and patient mentor.", rating: 5 },
    ],
    activeProjects: [],
    pastProjects: [],
    sessionAvailability: "Available",
  },
  {
    id: "VOL-002",
    name: "Sneha Rao",
    currentRole: "Senior Software Engineer",
    currentCompany: "Google",
    totalYearsExp: 6,
    pastExperience: [
      { role: "SDE II", company: "Flipkart", duration: "2021–2023" },
      { role: "SDE I", company: "Zoho", duration: "2019–2021" },
    ],
    skills: ["Software Engineering", "React", "Career Guidance", "System Design"],
    volunteeringType: "Both",
    preferredMenteeStage: ["0–4 yrs", "4–8 yrs"],
    domain: "Technology",
    industry: "Technology",
    mentoringRating: 4.5,
    projectsRating: 4.6,
    rating: 4.5,
    group: "Technology",
    preferredLanguages: ["English", "Telugu", "Kannada"],
    hometown: { city: "Hyderabad", state: "Telangana", country: "India" },
    currentLocation: { city: "Bengaluru", state: "Karnataka", country: "India" },
    whatsapp: "+91 98765 11002",
    email: "sneha.rao@gmail.com",
    officialEmail: "sneha@google.com",
    linkedin: "linkedin.com/in/sneharo",
    status: "Active",
    orientationStatus: "Orientation Done",
    signedUpDate: "2025-08-22",
    activeRequest: { id: "REQ-002", menteeName: "Arjun Patel", skill: "Software Engineering", startedAt: "2026-05-03" },
    pastRequests: [
      { id: "REQ-P02", menteeName: "Rohit Das", skill: "React", closedAt: "2026-02-20", feedback: "Excellent mentor, very knowledgeable.", rating: 4 },
      { id: "REQ-P03", menteeName: "Neha Singh", skill: "Career Guidance", closedAt: "2025-12-15", rating: 5 },
    ],
    activeProjects: [{ projectName: "Code4Good Bootcamp", programName: "Tech Skills Program", ngo: "NavGurukul" }],
    pastProjects: [{ projectName: "Hackathon Facilitation", programName: "Youth Innovation", ngo: "Akanksha Foundation", endDate: "2025-11-30" }],
    sessionAvailability: "Available",
  },
  {
    id: "VOL-003",
    name: "Amit Joshi",
    currentRole: "Data Analyst",
    currentCompany: "Swiggy",
    totalYearsExp: 5,
    pastExperience: [
      { role: "Business Analyst", company: "KPMG", duration: "2021–2023" },
      { role: "Data Intern", company: "Accenture", duration: "2020–2021" },
    ],
    skills: ["Data Analysis", "Excel", "Python", "SQL"],
    volunteeringType: "Mentoring",
    preferredMenteeStage: ["College students", "Fresh graduates", "0–4 yrs"],
    domain: "Data & Analytics",
    industry: "Consumer/E-commerce",
    mentoringRating: 4.2,
    projectsRating: 0,
    rating: 4.2,
    group: "Analytics",
    preferredLanguages: ["English", "Marathi", "Hindi"],
    hometown: { city: "Pune", state: "Maharashtra", country: "India" },
    currentLocation: { city: "Bengaluru", state: "Karnataka", country: "India" },
    whatsapp: "+91 98765 11003",
    email: "amit.joshi@gmail.com",
    officialEmail: "amit.joshi@swiggy.com",
    linkedin: "linkedin.com/in/amitjoshi",
    status: "Orientation booked",
    orientationStatus: "Orientation Slot Booked",
    orientationDate: "2026-07-13",
    orientationTime: "10:00",
    orientationCallMeetingLink: "meet.google.com/orientation-jul13-10",
    signedUpDate: "2025-10-05",
    activeRequest: { id: "REQ-004", menteeName: "Rohan Das", skill: "Data Analysis", startedAt: "2026-05-08" },
    pastRequests: [],
    activeProjects: [],
    pastProjects: [],
    sessionAvailability: "Available",
  },
  {
    id: "VOL-004",
    name: "Pooja Verma",
    currentRole: "Finance Manager",
    currentCompany: "HDFC Bank",
    totalYearsExp: 10,
    pastExperience: [
      { role: "Senior Analyst", company: "Deloitte", duration: "2018–2022" },
      { role: "Finance Analyst", company: "Kotak", duration: "2015–2018" },
    ],
    skills: ["Finance", "Investment Basics", "Accounting", "Budgeting"],
    volunteeringType: "Both",
    preferredMenteeStage: ["4–8 yrs"],
    domain: "Finance",
    industry: "Banking & Finance",
    mentoringRating: 3.9,
    projectsRating: 4.1,
    rating: 3.9,
    group: "Finance",
    preferredLanguages: ["English", "Hindi"],
    hometown: { city: "Delhi", state: "Delhi", country: "India" },
    currentLocation: { city: "Mumbai", state: "Maharashtra", country: "India" },
    whatsapp: "+91 98765 11004",
    email: "pooja.verma@gmail.com",
    officialEmail: "pooja.verma@hdfc.com",
    linkedin: "linkedin.com/in/poojaverma",
    status: "Orientation booked",
    orientationStatus: "Orientation Rescheduled",
    orientationDate: "2026-07-14",
    orientationTime: "15:30",
    orientationCallMeetingLink: "meet.google.com/orientation-jul14-1530",
    signedUpDate: "2025-07-18",
    pastRequests: [
      { id: "REQ-P04", menteeName: "Siddharth Kumar", skill: "Finance", closedAt: "2026-04-01", feedback: "Good guidance but could be more proactive.", rating: 4 },
    ],
    activeProjects: [{ projectName: "Financial Literacy Drive", programName: "Finwise", ngo: "Parivarthan" }],
    pastProjects: [],
    sessionAvailability: "On Leave",
  },
  {
    id: "VOL-005",
    name: "Kiran Bhat",
    currentRole: "Product Manager",
    currentCompany: "Razorpay",
    totalYearsExp: 7,
    pastExperience: [
      { role: "Associate PM", company: "Paytm", duration: "2020–2023" },
      { role: "Business Analyst", company: "TCS", duration: "2018–2020" },
    ],
    skills: ["Product Management", "Roadmapping", "User Research"],
    volunteeringType: "Mentoring",
    preferredMenteeStage: ["0–4 yrs", "4–8 yrs"],
    domain: "Product Management",
    industry: "Banking & Finance",
    mentoringRating: 4.8,
    projectsRating: 0,
    rating: 4.8,
    group: "Product",
    preferredLanguages: ["English", "Kannada", "Hindi"],
    hometown: { city: "Mangalore", state: "Karnataka", country: "India" },
    currentLocation: { city: "Bengaluru", state: "Karnataka", country: "India" },
    whatsapp: "+91 98765 11005",
    email: "kiran.bhat@gmail.com",
    officialEmail: "kiran@razorpay.com",
    linkedin: "linkedin.com/in/kiranbhat",
    status: "Orientation call not booked",
    orientationStatus: "Orientation Pending",
    signedUpDate: "2025-11-02",
    pastRequests: [],
    activeProjects: [],
    pastProjects: [],
    sessionAvailability: "Available",
  },
  {
    id: "VOL-006",
    name: "Divya Krishnan",
    currentRole: "Marketing Lead",
    currentCompany: "Zomato",
    totalYearsExp: 9,
    pastExperience: [
      { role: "Brand Manager", company: "HUL", duration: "2019–2022" },
      { role: "Marketing Executive", company: "Ogilvy", duration: "2016–2019" },
    ],
    skills: ["Marketing", "Brand Building", "Content Strategy", "Communication"],
    volunteeringType: "Both",
    preferredMenteeStage: ["College students", "Fresh graduates", "0–4 yrs"],
    domain: "Marketing",
    industry: "Consumer/E-commerce",
    mentoringRating: 4.6,
    projectsRating: 4.8,
    rating: 4.6,
    group: "Marketing",
    preferredLanguages: ["English", "Tamil", "Hindi"],
    hometown: { city: "Chennai", state: "Tamil Nadu", country: "India" },
    currentLocation: { city: "Gurugram", state: "Haryana", country: "India" },
    whatsapp: "+91 98765 11006",
    email: "divya.k@gmail.com",
    officialEmail: "divya@zomato.com",
    linkedin: "linkedin.com/in/divyakrishnan",
    status: "Inactive",
    orientationStatus: "Orientation Done",
    signedUpDate: "2025-06-30",
    pastRequests: [
      { id: "REQ-P05", menteeName: "Meena Iyer", skill: "Communication", closedAt: "2026-03-20", feedback: "Very inspiring mentor.", rating: 5 },
    ],
    activeProjects: [{ projectName: "Brand Workshop Series", programName: "Creative Skills", ngo: "Akanksha Foundation" }],
    pastProjects: [{ projectName: "Content Creation Sprint", programName: "Digital Literacy", ngo: "NavGurukul", endDate: "2025-10-15" }],
    sessionAvailability: "Available",
  },
  {
    id: "VOL-007",
    name: "Arjun Sharma",
    currentRole: "Operations Manager",
    currentCompany: "Amazon India",
    totalYearsExp: 6,
    pastExperience: [
      { role: "Operations Lead", company: "Flipkart", duration: "2021–2023" },
      { role: "Supply Chain Analyst", company: "Delhivery", duration: "2019–2021" },
    ],
    skills: ["Operations", "Project Management", "Logistics", "Event Management"],
    volunteeringType: "Projects",
    preferredMenteeStage: [],
    domain: "Operations",
    industry: "Consumer/E-commerce",
    mentoringRating: 0,
    projectsRating: 4.4,
    rating: 4.4,
    group: "Operations",
    preferredLanguages: ["English", "Hindi", "Punjabi"],
    hometown: { city: "Chandigarh", state: "Punjab", country: "India" },
    currentLocation: { city: "Delhi", state: "Delhi", country: "India" },
    whatsapp: "+91 98765 11007",
    email: "arjun.sharma@gmail.com",
    officialEmail: "arjun.sharma@amazon.com",
    linkedin: "linkedin.com/in/arjunsharma",
    status: "Active",
    orientationStatus: "Orientation Done",
    signedUpDate: "2025-09-25",
    activeRequest: undefined,
    pastRequests: [],
    activeProjects: [{ projectName: "Youth Employment Fair", programName: "Career Connect", ngo: "NavGurukul" }],
    pastProjects: [{ projectName: "NGO Operations Audit", programName: "Capacity Building", ngo: "Parivarthan", endDate: "2025-12-31" }],
    sessionAvailability: "Available",
  },
  {
    id: "VOL-008",
    name: "Priyanka Nair",
    currentRole: "UX Designer",
    currentCompany: "Swiggy",
    totalYearsExp: 4,
    pastExperience: [
      { role: "UI Designer", company: "Myntra", duration: "2022–2024" },
    ],
    skills: ["UX Design", "Figma", "User Research", "Prototyping"],
    volunteeringType: "Projects",
    preferredMenteeStage: [],
    domain: "Design",
    industry: "Consumer/E-commerce",
    mentoringRating: 0,
    projectsRating: 4.3,
    rating: 4.3,
    group: "Design",
    preferredLanguages: ["English", "Malayalam"],
    hometown: { city: "Kochi", state: "Kerala", country: "India" },
    currentLocation: { city: "Bengaluru", state: "Karnataka", country: "India" },
    whatsapp: "+91 98765 11008",
    email: "priyanka.nair@gmail.com",
    officialEmail: "priyanka@swiggy.com",
    linkedin: "linkedin.com/in/priyankanair",
    status: "Active",
    orientationStatus: "Orientation Done",
    signedUpDate: "2025-12-01",
    pastRequests: [],
    activeProjects: [{ projectName: "App Redesign for NGO", programName: "Tech4Good", ngo: "Akanksha Foundation" }],
    pastProjects: [],
    sessionAvailability: "Available",
  },
  {
    id: "VOL-009",
    name: "Vikram Singh",
    currentRole: "Sales Director",
    currentCompany: "Salesforce India",
    totalYearsExp: 12,
    pastExperience: [
      { role: "Regional Sales Manager", company: "Oracle", duration: "2018–2022" },
      { role: "Sales Lead", company: "SAP", duration: "2014–2018" },
    ],
    skills: ["Sales", "Leadership", "Communication", "Negotiation", "Career Coaching"],
    volunteeringType: "Both",
    preferredMenteeStage: ["4–8 yrs"],
    domain: "Sales & Business Development",
    industry: "Technology",
    mentoringRating: 4.9,
    projectsRating: 4.7,
    rating: 4.9,
    group: "Sales & BD",
    preferredLanguages: ["English", "Hindi"],
    hometown: { city: "Jaipur", state: "Rajasthan", country: "India" },
    currentLocation: { city: "Bengaluru", state: "Karnataka", country: "India" },
    whatsapp: "+91 98765 11009",
    email: "vikram.s@gmail.com",
    officialEmail: "vikram.singh@salesforce.com",
    linkedin: "linkedin.com/in/vikramsingh",
    status: "Inactive",
    orientationStatus: "Orientation Done",
    signedUpDate: "2025-05-15",
    pastRequests: [],
    activeProjects: [{ projectName: "Entrepreneurship Workshop", programName: "BizBoost", ngo: "NavGurukul" }],
    pastProjects: [{ projectName: "Sales Training Camp", programName: "Skills Connect", ngo: "Parivarthan", endDate: "2026-01-20" }],
    sessionAvailability: "Available",
  },
  {
    id: "VOL-010",
    name: "Ananya Roy",
    currentRole: "Content Strategist",
    currentCompany: "Byju's",
    totalYearsExp: 3,
    pastExperience: [
      { role: "Content Writer", company: "Unacademy", duration: "2022–2024" },
    ],
    skills: ["Content Writing", "Social Media", "Copywriting"],
    volunteeringType: "Projects",
    preferredMenteeStage: [],
    domain: "Content & Communications",
    industry: "Education & EdTech",
    mentoringRating: 0,
    projectsRating: 3.8,
    rating: 3.8,
    group: "Marketing",
    preferredLanguages: ["English", "Bengali", "Hindi"],
    hometown: { city: "Kolkata", state: "West Bengal", country: "India" },
    currentLocation: { city: "Bengaluru", state: "Karnataka", country: "India" },
    whatsapp: "+91 98765 11010",
    email: "ananya.roy@gmail.com",
    officialEmail: "ananya@byjus.com",
    linkedin: "linkedin.com/in/ananyaroy",
    status: "Orientation call not booked",
    orientationStatus: "Orientation Pending",
    signedUpDate: "2026-01-10",
    pastRequests: [],
    activeProjects: [],
    pastProjects: [],
    sessionAvailability: "Available",
  },
]

export const mentorGroups = ["HR & People", "Technology", "Analytics", "Finance", "Product", "Marketing", "Operations", "Design", "Sales & BD"]

export const volunteerGroups = [...mentorGroups]

export const DOMAINS = [
  "HR & People", "Technology", "Data & Analytics", "Finance", "Product Management",
  "Marketing", "Operations", "Design", "Sales & Business Development",
  "Content & Communications", "Legal", "Engineering", "Healthcare", "Education",
]

export const INDUSTRIES = [
  "Technology", "Banking & Finance", "Consumer/E-commerce", "Healthcare",
  "Education & EdTech", "Media & Entertainment", "Consulting", "Manufacturing",
  "NGO/Social Impact", "Retail", "Logistics", "Real Estate",
  "Government & Public Sector", "Automotive", "FMCG",
]
