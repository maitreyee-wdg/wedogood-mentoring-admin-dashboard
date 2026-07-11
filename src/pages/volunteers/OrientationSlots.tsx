import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mockOrientationSlots, type OrientationSlot } from "@/data/orientationSlotsData"
import { ClockTimeInput, formatTime12h } from "@/components/ClockTimeInput"
import { Plus, X, Copy, Trash2, CalendarClock, Users, Mail } from "lucide-react"

function formatLocalDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}
function todayStr() {
  return formatLocalDate(new Date())
}
function maxDateStr() {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return formatLocalDate(d)
}
function maxVisibleDateStr() {
  const d = new Date()
  d.setDate(d.getDate() + 21)
  return formatLocalDate(d)
}

type RecurrenceFrequency = "Daily" | "Weekly" | "Monthly"

function generateRecurrenceDates(start: string, frequency: RecurrenceFrequency, until: string): string[] {
  const dates: string[] = []
  const d = new Date(start + "T00:00:00")
  const endD = new Date(until + "T00:00:00")
  while (d <= endD) {
    dates.push(formatLocalDate(d))
    if (frequency === "Daily") d.setDate(d.getDate() + 1)
    else if (frequency === "Weekly") d.setDate(d.getDate() + 7)
    else d.setMonth(d.getMonth() + 1)
  }
  return dates
}

function AddSlotModal({ onSave, onClose }: { onSave: (slots: Omit<OrientationSlot, "id" | "bookedBy">[]) => void; onClose: () => void }) {
  const [meetingName, setMeetingName] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [meetingLink, setMeetingLink] = useState("")
  const [wdgEmail, setWdgEmail] = useState("")
  const [repeat, setRepeat] = useState<"none" | RecurrenceFrequency>("none")
  const [repeatUntil, setRepeatUntil] = useState("")
  const min = todayStr()
  const max = maxDateStr()
  const canSave = meetingName.trim() && date && time && meetingLink.trim() && wdgEmail.trim() && (repeat === "none" || repeatUntil)

  const handleSubmit = () => {
    if (!canSave) return
    const base = { meetingName: meetingName.trim(), time, meetingLink: meetingLink.trim(), wdgEmail: wdgEmail.trim(), recurrence: repeat === "none" ? "One-time" as const : repeat }
    const dates = repeat === "none" ? [date] : generateRecurrenceDates(date, repeat, repeatUntil)
    onSave(dates.map((d) => ({ ...base, date: d })))
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-96 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 text-sm">Add Orientation Slot</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">NAME OF MEETING *</label>
            <Input value={meetingName} onChange={(e) => setMeetingName(e.target.value)} placeholder="e.g. Volunteer Orientation — Morning Batch" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">DATE *</label>
            <input type="date" min={min} max={max} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400" value={date} onChange={(e) => setDate(e.target.value)} />
            <p className="text-xs text-gray-400 mt-1">Slots can only be created up to 30 days in advance.</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">TIME *</label>
            <ClockTimeInput value={time} onChange={setTime} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">MEETING LINK *</label>
            <Input value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="e.g. meet.google.com/xyz" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">WDG EMAIL (TAKING THE SESSION) *</label>
            <Input type="email" value={wdgEmail} onChange={(e) => setWdgEmail(e.target.value)} placeholder="e.g. priya@wedogood.in" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">REPEAT</label>
            <select value={repeat} onChange={(e) => setRepeat(e.target.value as "none" | RecurrenceFrequency)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white">
              <option value="none">Does not repeat</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>
          {repeat !== "none" && (
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">REPEAT UNTIL *</label>
              <input type="date" min={date || min} max={max} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400" value={repeatUntil} onChange={(e) => setRepeatUntil(e.target.value)} />
              <p className="text-xs text-gray-400 mt-1">Each occurrence uses the same time, meeting link and host email. Recurring slots are also capped at 30 days out.</p>
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-5">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" disabled={!canSave} onClick={handleSubmit}>{repeat === "none" ? "Add Slot" : "Add Slots"}</Button>
        </div>
      </div>
    </div>
  )
}

export default function OrientationSlots() {
  const navigate = useNavigate()
  const [slots, setSlots] = useState<OrientationSlot[]>(mockOrientationSlots)
  const [showAddModal, setShowAddModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<OrientationSlot | null>(null)

  const maxVisibleDate = maxVisibleDateStr()
  const visibleSlots = slots.filter((s) => s.date <= maxVisibleDate)
  const filtered = [...visibleSlots].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))

  const handleAddSlot = (data: Omit<OrientationSlot, "id" | "bookedBy">[]) => {
    setSlots((p) => [...p, ...data.map((d, i) => ({ ...d, id: `GOS-${Date.now()}-${i}`, bookedBy: [] }))])
    setShowAddModal(false)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    setSlots((p) => p.filter((s) => s.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Orientation Slots</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage the pool of orientation call slots and meeting links volunteers book into · showing slots up to 3 weeks out</p>
        </div>
        <Button size="sm" onClick={() => setShowAddModal(true)}><Plus className="w-4 h-4" />Add Slot</Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Total Slots", value: visibleSlots.length, color: "text-gray-900" },
          { label: "Total Bookings", value: visibleSlots.reduce((sum, s) => sum + s.bookedBy.length, 0), color: "text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name of Meeting</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Time</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Meeting Link</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">WDG Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Recurrence</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600"># Booked</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No orientation slots found</td></tr>
            ) : filtered.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-800 font-medium">{s.meetingName}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-gray-800">
                    <CalendarClock className="w-3.5 h-3.5 text-gray-400" />
                    {new Date(s.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{formatTime12h(s.time)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="truncate max-w-[220px]">{s.meetingLink}</span>
                    <button onClick={() => navigator.clipboard?.writeText(s.meetingLink)} className="text-gray-400 hover:text-blue-600 shrink-0"><Copy className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />{s.wdgEmail}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.recurrence === "One-time" ? "bg-gray-100 text-gray-600" : "bg-indigo-50 text-indigo-700"}`}>{s.recurrence}</span>
                </td>
                <td className="px-4 py-3">
                  {s.bookedBy.length > 0 ? (
                    <button
                      onClick={() => navigate(`/volunteers/orientation-slots/${s.id}/bookings`, { state: { slot: s } })}
                      className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium"
                    >
                      <Users className="w-3.5 h-3.5" />{s.bookedBy.length}
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Users className="w-3.5 h-3.5 text-gray-300" />0
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => s.bookedBy.length === 0 && setDeleteTarget(s)}
                    disabled={s.bookedBy.length > 0}
                    title={s.bookedBy.length > 0 ? `Can't delete — ${s.bookedBy.length} volunteer${s.bookedBy.length > 1 ? "s" : ""} booked this slot` : "Delete slot"}
                    className={`flex items-center gap-1 text-xs font-medium ${s.bookedBy.length > 0 ? "text-gray-300 cursor-not-allowed" : "text-red-500 hover:text-red-600"}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <AddSlotModal onSave={handleAddSlot} onClose={() => setShowAddModal(false)} />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-96 p-6">
            <h2 className="font-semibold text-gray-900 text-sm mb-2">Delete Orientation Slot</h2>
            <p className="text-sm text-gray-600 mb-5">
              <strong>{deleteTarget.meetingName}</strong> on <strong>{new Date(deleteTarget.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} at {formatTime12h(deleteTarget.time)}</strong> will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white" onClick={confirmDelete}>Yes, Delete Slot</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
