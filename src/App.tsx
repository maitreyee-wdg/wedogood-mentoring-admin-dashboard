import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Layout from "@/components/Layout"

// Volunteers
import VolunteersList from "@/pages/volunteers/index"
import VolunteersComms from "@/pages/volunteers/Comms"
import OrientationSlots from "@/pages/volunteers/OrientationSlots"
import OrientationSlotBookings from "@/pages/volunteers/OrientationSlotBookings"

// Groups
import VolunteerGroups from "@/pages/groups/VolunteerGroups"
import MenteeGroupsPage from "@/pages/groups/MenteeGroups"
import Organizations from "@/pages/groups/Organizations"
import ProgramsPage from "@/pages/groups/Programs"

// Mentees
import MenteesList from "@/pages/mentees/index"
import Engagements from "@/pages/mentees/Engagements"
import MenteesComms from "@/pages/mentees/Comms"
import AIChatPage from "@/pages/mentees/AIChat"

// Flow
import AIAgents from "@/pages/flow/AIAgents"
import CronJobs from "@/pages/flow/CronJobs"

// Escalations
import EscalationsPage from "@/pages/escalations/index"

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/volunteers" replace />} />

          {/* Volunteers */}
          <Route path="/volunteers" element={<VolunteersList />} />
          <Route path="/volunteers/orientation-slots" element={<OrientationSlots />} />
          <Route path="/volunteers/orientation-slots/:slotId/bookings" element={<OrientationSlotBookings />} />
          <Route path="/volunteers/comms" element={<VolunteersComms />} />

          {/* Groups */}
          <Route path="/groups/volunteer-groups" element={<VolunteerGroups />} />
          <Route path="/groups/mentee-groups" element={<MenteeGroupsPage />} />
          <Route path="/groups/organizations" element={<Organizations />} />
          <Route path="/groups/programs" element={<ProgramsPage />} />

          {/* Mentees */}
          <Route path="/mentees" element={<MenteesList />} />
          <Route path="/mentees/engagements" element={<Engagements />} />
          <Route path="/mentees/comms" element={<MenteesComms />} />
          <Route path="/mentees/ai-chat" element={<AIChatPage />} />

          {/* Flow */}
          <Route path="/flow/ai-agents" element={<AIAgents />} />
          <Route path="/flow/cron-jobs" element={<CronJobs />} />

          {/* Escalations */}
          <Route path="/escalations" element={<EscalationsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
