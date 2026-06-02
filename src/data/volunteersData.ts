export type OrientationStatus =
  | "Orientation Pending"
  | "Orientation Slot Booked"
  | "Orientation Done"
  | "Orientation Rescheduled"

export type EngagementStatus = "Active" | "Not Engaged"
export type MenteeInterest = "College students/Fresh graduates" | "0-4 years experience" | "4-8 years experience"

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

export interface Volunteer {
  id: string
  name: string
  currentRole: string
  currentCompany: string
  totalYearsExp: number
  pastExperience: Experience[]
  skills: string[]
  interestedIn: MenteeInterest[]
  rating: number
  group: string
  whatsapp: string
  email: string
  officialEmail: string
  linkedin: string
  resume?: string
  orientationStatus: OrientationStatus
  orientationDate?: string
  engagementStatus: EngagementStatus
  activeRequest?: ActiveRequest
  pastRequests: PastRequest[]
  availability: "Available" | "On Leave" | "Inactive"
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
    interestedIn: ["College students/Fresh graduates", "0-4 years experience"],
    rating: 4.7,
    group: "HR & People",
    whatsapp: "+91 98765 11001",
    email: "rahul.mehta@gmail.com",
    officialEmail: "rahul.mehta@infosys.com",
    linkedin: "linkedin.com/in/rahulmehta",
    orientationStatus: "Orientation Done",
    engagementStatus: "Active",
    activeRequest: {
      id: "REQ-001",
      menteeName: "Priya Sharma",
      skill: "Resume Writing",
      startedAt: "2026-05-01",
    },
    pastRequests: [
      {
        id: "REQ-P01",
        menteeName: "Ankit Verma",
        skill: "Interview Prep",
        closedAt: "2026-03-10",
        feedback: "Very helpful and patient mentor.",
        rating: 5,
      },
    ],
    availability: "Available",
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
    interestedIn: ["0-4 years experience", "4-8 years experience"],
    rating: 4.5,
    group: "Technology",
    whatsapp: "+91 98765 11002",
    email: "sneha.rao@gmail.com",
    officialEmail: "sneha@google.com",
    linkedin: "linkedin.com/in/sneharo",
    orientationStatus: "Orientation Done",
    engagementStatus: "Active",
    activeRequest: {
      id: "REQ-002",
      menteeName: "Arjun Patel",
      skill: "Software Engineering",
      startedAt: "2026-05-03",
    },
    pastRequests: [
      {
        id: "REQ-P02",
        menteeName: "Rohit Das",
        skill: "React",
        closedAt: "2026-02-20",
        feedback: "Excellent mentor, very knowledgeable.",
        rating: 4,
      },
      {
        id: "REQ-P03",
        menteeName: "Neha Singh",
        skill: "Career Guidance",
        closedAt: "2025-12-15",
        rating: 5,
      },
    ],
    availability: "Available",
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
    interestedIn: ["College students/Fresh graduates", "0-4 years experience"],
    rating: 4.2,
    group: "Analytics",
    whatsapp: "+91 98765 11003",
    email: "amit.joshi@gmail.com",
    officialEmail: "amit.joshi@swiggy.com",
    linkedin: "linkedin.com/in/amitjoshi",
    orientationStatus: "Orientation Slot Booked",
    orientationDate: "2026-06-05",
    engagementStatus: "Active",
    activeRequest: {
      id: "REQ-004",
      menteeName: "Rohan Das",
      skill: "Data Analysis",
      startedAt: "2026-05-08",
    },
    pastRequests: [],
    availability: "Available",
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
    interestedIn: ["4-8 years experience"],
    rating: 3.9,
    group: "Finance",
    whatsapp: "+91 98765 11004",
    email: "pooja.verma@gmail.com",
    officialEmail: "pooja.verma@hdfc.com",
    linkedin: "linkedin.com/in/poojaverma",
    orientationStatus: "Orientation Rescheduled",
    orientationDate: "2026-06-10",
    engagementStatus: "Not Engaged",
    pastRequests: [
      {
        id: "REQ-P04",
        menteeName: "Siddharth Kumar",
        skill: "Finance",
        closedAt: "2026-04-01",
        feedback: "Good guidance but could be more proactive.",
        rating: 4,
      },
    ],
    availability: "On Leave",
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
    interestedIn: ["0-4 years experience", "4-8 years experience"],
    rating: 4.8,
    group: "Product",
    whatsapp: "+91 98765 11005",
    email: "kiran.bhat@gmail.com",
    officialEmail: "kiran@razorpay.com",
    linkedin: "linkedin.com/in/kiranbhat",
    orientationStatus: "Orientation Pending",
    engagementStatus: "Not Engaged",
    pastRequests: [],
    availability: "Available",
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
    interestedIn: ["College students/Fresh graduates", "0-4 years experience"],
    rating: 4.6,
    group: "Marketing",
    whatsapp: "+91 98765 11006",
    email: "divya.k@gmail.com",
    officialEmail: "divya@zomato.com",
    linkedin: "linkedin.com/in/divyakrishnan",
    orientationStatus: "Orientation Done",
    engagementStatus: "Not Engaged",
    pastRequests: [
      {
        id: "REQ-P05",
        menteeName: "Meena Iyer",
        skill: "Communication",
        closedAt: "2026-03-20",
        feedback: "Very inspiring mentor.",
        rating: 5,
      },
    ],
    availability: "Available",
  },
]

export const mentorGroups = ["HR & People", "Technology", "Analytics", "Finance", "Product", "Marketing"]
