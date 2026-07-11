import { useParams, useNavigate, useLocation } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { mockOrientationSlots, type OrientationSlot } from "@/data/orientationSlotsData"
import { mockVolunteers } from "@/data/volunteersData"
import { formatTime12h } from "@/components/ClockTimeInput"
import { ArrowLeft, CalendarClock, Mail, Phone, Building2, Users } from "lucide-react"

const statusColors: Record<string, "success" | "warning" | "secondary" | "outline" | "destructive"> = {
  "Profile Incomplete": "outline",
  "Orientation call not booked": "warning",
  "Orientation booked": "secondary",
  Active: "success",
  Occupied: "secondary",
  Inactive: "outline",
  Archived: "destructive",
}

export default function OrientationSlotBookings() {
  const { slotId } = useParams<{ slotId: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  const slot: OrientationSlot | undefined =
    (location.state as { slot?: OrientationSlot } | null)?.slot ?? mockOrientationSlots.find((s) => s.id === slotId)

  if (!slot) {
    return (
      <div className="p-6">
        <button onClick={() => navigate("/volunteers/orientation-slots")} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />Back to Orientation Slots
        </button>
        <p className="text-sm text-gray-400">Slot not found.</p>
      </div>
    )
  }

  const bookedVolunteers = mockVolunteers.filter((v) => slot.bookedBy.some((b) => b.volunteerId === v.id))

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div>
        <button onClick={() => navigate("/volunteers/orientation-slots")} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" />Back to Orientation Slots
        </button>
        <h1 className="text-xl font-semibold text-gray-900">{slot.meetingName}</h1>
        <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
          <CalendarClock className="w-3.5 h-3.5" />
          {new Date(slot.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {formatTime12h(slot.time)}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-2">
        <Users className="w-4 h-4 text-gray-400" />
        <p className="text-sm font-medium text-gray-900">{bookedVolunteers.length} volunteer{bookedVolunteers.length === 1 ? "" : "s"} booked</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Company</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Group</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Current Role</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookedVolunteers.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No volunteers have booked this slot yet</td></tr>
            ) : bookedVolunteers.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{v.name}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />{v.email}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />{v.whatsapp}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />{v.currentCompany}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">{v.group}</span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">{v.currentRole}</td>
                <td className="px-4 py-3"><Badge variant={statusColors[v.status] ?? "outline"}>{v.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
