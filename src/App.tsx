import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Layout from "@/components/Layout"

// Volunteers
import VolunteersList from "@/pages/volunteers/index"
import MentorsList from "@/pages/volunteers/Mentors"
import VolunteersComms from "@/pages/volunteers/Comms"

// Groups
import VolunteerGroups from "@/pages/groups/VolunteerGroups"
import MenteeGroupsPage from "@/pages/groups/MenteeGroups"
import Organizations from "@/pages/groups/Organizations"

// Mentees
import MenteesList from "@/pages/mentees/index"
import ActiveRequests from "@/pages/mentees/ActiveRequests"
import AllRequests from "@/pages/mentees/AllRequests"
import MenteesComms from "@/pages/mentees/Comms"

// Flow
import AIAgents from "@/pages/flow/AIAgents"
import CronJobs from "@/pages/flow/CronJobs"

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/volunteers" replace />} />

          {/* Volunteers */}
          <Route path="/volunteers" element={<VolunteersList />} />
          <Route path="/volunteers/mentors" element={<MentorsList />} />
          <Route path="/volunteers/comms" element={<VolunteersComms />} />

          {/* Groups */}
          <Route path="/groups/volunteer-groups" element={<VolunteerGroups />} />
          <Route path="/groups/mentee-groups" element={<MenteeGroupsPage />} />
          <Route path="/groups/organizations" element={<Organizations />} />

          {/* Mentees */}
          <Route path="/mentees" element={<MenteesList />} />
          <Route path="/mentees/active-requests" element={<ActiveRequests />} />
          <Route path="/mentees/all-requests" element={<AllRequests />} />
          <Route path="/mentees/comms" element={<MenteesComms />} />

          {/* Flow */}
          <Route path="/flow/ai-agents" element={<AIAgents />} />
          <Route path="/flow/cron-jobs" element={<CronJobs />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
