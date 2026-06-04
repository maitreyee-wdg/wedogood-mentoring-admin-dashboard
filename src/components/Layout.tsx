import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Heart, Users, UserCircle, MessageSquare, Layers, Building2, Bot, CalendarClock, UserCheck, FolderKanban, BrainCircuit } from "lucide-react"

const sections = [
  {
    label: "Volunteers",
    items: [
      { to: "/volunteers", label: "Volunteers", icon: Users, end: true },
      { to: "/volunteers/mentors", label: "Mentors", icon: UserCheck, end: false },
      { to: "/volunteers/comms", label: "Comms", icon: MessageSquare, end: false },
    ],
  },
  {
    label: "Groups",
    items: [
      { to: "/groups/volunteer-groups", label: "Volunteer Groups", icon: Layers, end: false },
      { to: "/groups/mentee-groups", label: "Mentee Groups", icon: FolderKanban, end: false },
      { to: "/groups/organizations", label: "Organizations", icon: Building2, end: false },
    ],
  },
  {
    label: "Mentees",
    items: [
      { to: "/mentees", label: "Mentees", icon: UserCircle, end: true },
      { to: "/mentees/active-requests", label: "Active Requests", icon: UserCheck, end: false },
      { to: "/mentees/all-requests", label: "All Requests", icon: Layers, end: false },
      { to: "/mentees/comms", label: "Comms", icon: MessageSquare, end: false },
    ],
  },
  {
    label: "Flow Management",
    items: [
      { to: "/flow/ai-agents", label: "AI Agents", icon: BrainCircuit, end: false },
      { to: "/flow/cron-jobs", label: "System Triggers", icon: CalendarClock, end: false },
    ],
  },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-52 bg-white border-r border-gray-200 flex flex-col shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-200">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg shrink-0">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">WeDoGood</p>
            <p className="text-xs text-gray-500 leading-tight">Skilled Mentoring</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-1">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      )
                    }
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200">
          <p className="text-xs text-gray-400">WDG Admin v0.2</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
