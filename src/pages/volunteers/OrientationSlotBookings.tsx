import { useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { mockOrientationSlots, type OrientationSlot } from "@/data/orientationSlotsData"
import { mockVolunteers, type Volunteer, type OrientationStatus } from "@/data/volunteersData"
import { formatTime12h } from "@/components/ClockTimeInput"
import {
  ArrowLeft, CalendarClock, Mail, Phone, Building2, Users,
  Download, CheckCircle2, RefreshCw, X,
} from "lucide-react"

const statusColors: Record<string, "success" | "warning" | "secondary" | "outline" | "destructive"> = {
  "Profile Incomplete": "outline",
  "Orientation call not booked": "warning",
  "Orientation booked": "secondary",
  Active: "success",
  Occupied: "secondary",
  Inactive: "outline",
  Archived: "destructive",
}

const orientationStatusColors: Record<OrientationStatus, "success" | "warning" | "secondary" | "outline"> = {
  "Orientation Done": "success",
  "Orientation Slot Booked": "secondary",
  "Orientation Pending": "warning",
  "Orientation Rescheduled": "outline",
}

function toCsvField(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

export default function OrientationSlotBookings() {
  const { slotId } = useParams<{ slotId: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  const slot: OrientationSlot | undefined =
    (location.state as { slot?: OrientationSlot } | null)?.slot ?? mockOrientationSlots.find((s) => s.id === slotId)

  const [volunteers, setVolunteers] = useState<Volunteer[]>(() =>
    mockVolunteers.filter((v) => slot?.bookedBy.some((b) => b.volunteerId === v.id) ?? false)
  )
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  const toggleSelectAll = () => {
    setSelectedIds((prev) => prev.size === volunteers.length ? new Set() : new Set(volunteers.map((v) => v.id)))
  }
  const clearSelection = () => setSelectedIds(new Set())

  const applyOrientationStatus = (ids: string[], newStatus: OrientationStatus) => {
    setVolunteers((prev) => prev.map((v) => {
      if (!ids.includes(v.id)) return v
      return {
        ...v,
        orientationStatus: newStatus,
        status: newStatus === "Orientation Done" ? "Active" : v.status,
      }
    }))
  }
  const bulkApply = (newStatus: OrientationStatus) => {
    applyOrientationStatus(Array.from(selectedIds), newStatus)
    clearSelection()
  }

  const handleExport = () => {
    if (!slot) return
    const headers = ["Name", "Email", "Phone", "Company", "Group", "Current Role", "Status", "Orientation Status"]
    const rows = volunteers.map((v) => [
      v.name, v.email, v.whatsapp, v.currentCompany, v.group, v.currentRole, v.status, v.orientationStatus,
    ])
    const csv = [headers, ...rows].map((row) => row.map(toCsvField).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${slot.meetingName.replace(/\s+/g, "_")}_bookings.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

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

      <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <p className="text-sm font-medium text-gray-900">{volunteers.length} volunteer{volunteers.length === 1 ? "" : "s"} booked</p>
        </div>
        <button
          onClick={handleExport}
          disabled={volunteers.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          <Download className="w-3.5 h-3.5" /> Export List
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 w-8">
                <input type="checkbox"
                  checked={volunteers.length > 0 && selectedIds.size === volunteers.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-blue-600 cursor-pointer" />
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Company</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Group</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Current Role</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Orientation Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {volunteers.length === 0 ? (
              <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-400">No volunteers have booked this slot yet</td></tr>
            ) : volunteers.map((v) => (
              <tr key={v.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.has(v.id) ? "bg-orange-50/40" : ""}`}>
                <td className="px-4 py-3 w-8" onClick={(e) => toggleSelect(v.id, e)}>
                  <input type="checkbox" checked={selectedIds.has(v.id)} onChange={() => {}}
                    className="rounded border-gray-300 text-orange-500 cursor-pointer" />
                </td>
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
                <td className="px-4 py-3"><Badge variant={orientationStatusColors[v.orientationStatus]}>{v.orientationStatus}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 justify-end">
                    <button
                      onClick={() => applyOrientationStatus([v.id], "Orientation Done")}
                      disabled={v.orientationStatus === "Orientation Done"}
                      title="Mark orientation done"
                      className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 disabled:opacity-30 disabled:cursor-not-allowed">
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => applyOrientationStatus([v.id], "Orientation Rescheduled")}
                      disabled={v.orientationStatus === "Orientation Rescheduled"}
                      title="Mark as rescheduled"
                      className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 disabled:opacity-30 disabled:cursor-not-allowed">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-gray-700">
          <span className="text-sm font-medium">{selectedIds.size} volunteer{selectedIds.size !== 1 ? "s" : ""} selected</span>
          <div className="w-px h-5 bg-gray-600" />
          <button
            onClick={() => bulkApply("Orientation Done")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded-lg transition-colors">
            <CheckCircle2 className="w-3.5 h-3.5" /> Mark Orientation Done
          </button>
          <button
            onClick={() => bulkApply("Orientation Rescheduled")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold rounded-lg transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Mark Rescheduled
          </button>
          <button onClick={clearSelection} className="text-gray-400 hover:text-white ml-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
