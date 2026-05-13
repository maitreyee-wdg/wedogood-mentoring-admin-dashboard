import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  ClipboardList,
  Users,
  UserCircle,
  BarChart2,
  Bot,
  Heart,
} from "lucide-react"

const navItems = [
  { to: "/requests", label: "Requests", icon: ClipboardList },
  { to: "/volunteers", label: "Volunteers", icon: Users },
  { to: "/mentees", label: "Mentees", icon: UserCircle },
  { to: "/health", label: "Health Dashboard", icon: BarChart2 },
  { to: "/bot-config", label: "Bot Config", icon: Bot },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-200">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">WeDoGood</p>
            <p className="text-xs text-gray-500">Skilled Mentoring</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200">
          <p className="text-xs text-gray-400">Admin Dashboard v0.1</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
