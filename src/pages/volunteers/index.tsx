import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import {
  mockVolunteers, volunteerGroups,
  type Volunteer, type VolunteeringType, type Location, type VolunteerStatus, type OrientationStatus,
} from "@/data/volunteersData"
import { commsTemplates, type CommTemplate } from "@/data/commsData"
import {
  Search, Plus, X, MoreVertical, ChevronUp, ChevronDown,
  Star, MessageSquare, Archive, Users, Pencil, Briefcase,
  Mail, Phone, Link, FileText, Eye, Check, MapPin, Globe,
  UserCheck, FolderKanban, Send,
} from "lucide-react"

// ── helpers ─────────────────────────────────────────────────────────────────

const typeVariant: Record<VolunteeringType, "default" | "success" | "secondary"> = {
  "Mentoring": "default",
  "Projects": "secondary",
  "Both": "success",
}

const statusColors: Record<VolunteerStatus, string> = {
  "Active": "bg-green-100 text-green-700",
  "Orientation Pending": "bg-yellow-100 text-yellow-700",
  "Inactive": "bg-gray-100 text-gray-500",
  "Archived": "bg-red-50 text-red-500",
}

const orientationColors: Record<OrientationStatus, string> = {
  "Orientation Done": "bg-green-100 text-green-700",
  "Orientation Slot Booked": "bg-blue-100 text-blue-700",
  "Orientation Pending": "bg-yellow-100 text-yellow-700",
  "Orientation Rescheduled": "bg-orange-100 text-orange-700",
}

function StarRating({ value }: { value: number }) {
  if (!value) return <span className="text-xs text-gray-300">—</span>
  return (
    <div className="flex items-center gap-1">
      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
      <span className="text-sm font-medium text-gray-700">{value.toFixed(1)}</span>
    </div>
  )
}

type SortKey = "name" | "signedUpDate" | "mentoringRating" | "projectsRating" | "totalYearsExp"
type SortDir = "asc" | "desc"

type ColKey = "name" | "signedUpDate" | "volunteeringType" | "status" | "projectsRating" | "mentoringRating" | "group" | "availability"

const ALL_COLUMNS: { key: ColKey; label: string; always?: boolean }[] = [
  { key: "name", label: "Name", always: true },
  { key: "signedUpDate", label: "Signed Up" },
  { key: "volunteeringType", label: "Type" },
  { key: "status", label: "Status" },
  { key: "mentoringRating", label: "Mentoring Rating" },
  { key: "projectsRating", label: "Projects Rating" },
  { key: "group", label: "Group" },
  { key: "availability", label: "Availability" },
]

// ── Modals ───────────────────────────────────────────────────────────────────

function AssignGroupModal({ names, onAssign, onClose }: { names: string[]; onAssign: (g: string) => void; onClose: () => void }) {
  const [selected, setSelected] = useState("")
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-80 p-6">
        <h2 className="font-semibold text-gray-900 mb-1 text-sm">Assign Volunteer Group</h2>
        <p className="text-xs text-gray-500 mb-4">
          {names.length === 1 ? names[0] : `${names.length} volunteers selected`}
        </p>
        <Select value={selected} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelected(e.target.value)} className="w-full mb-4">
          <option value="">Select group…</option>
          {volunteerGroups.map((g) => <option key={g}>{g}</option>)}
        </Select>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={() => selected && onAssign(selected)} disabled={!selected}>Assign</Button>
        </div>
      </div>
    </div>
  )
}

function ChangeStatusModal({ names, current, onSave, onClose }: { names: string[]; current: VolunteerStatus; onSave: (s: VolunteerStatus) => void; onClose: () => void }) {
  const [selected, setSelected] = useState<VolunteerStatus>(current)
  const statuses: VolunteerStatus[] = ["Orientation Pending", "Active", "Inactive", "Archived"]
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-80 p-6">
        <h2 className="font-semibold text-gray-900 mb-1 text-sm">Change Status</h2>
        <p className="text-xs text-gray-500 mb-4">
          {names.length === 1 ? names[0] : `${names.length} volunteers selected`}
        </p>
        <div className="space-y-2 mb-4">
          {statuses.map((s) => (
            <label key={s} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
              <input type="radio" name="status" checked={selected === s} onChange={() => setSelected(s)} className="text-blue-600" />
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[s]}`}>{s}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={() => onSave(selected)}>Save</Button>
        </div>
      </div>
    </div>
  )
}

function ChangeOrientationModal({ names, current, onSave, onClose }: { names: string[]; current: OrientationStatus; onSave: (s: OrientationStatus) => void; onClose: () => void }) {
  const [selected, setSelected] = useState<OrientationStatus>(current)
  const statuses: OrientationStatus[] = ["Orientation Pending", "Orientation Slot Booked", "Orientation Done", "Orientation Rescheduled"]
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-80 p-6">
        <h2 className="font-semibold text-gray-900 mb-1 text-sm">Change Orientation Status</h2>
        <p className="text-xs text-gray-500 mb-4">
          {names.length === 1 ? names[0] : `${names.length} volunteers selected`}
        </p>
        <div className="space-y-2 mb-4">
          {statuses.map((s) => (
            <label key={s} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
              <input type="radio" name="orientation" checked={selected === s} onChange={() => setSelected(s)} className="text-blue-600" />
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${orientationColors[s]}`}>{s}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={() => onSave(selected)}>Save</Button>
        </div>
      </div>
    </div>
  )
}

// ── Bulk Send Message Modal ──────────────────────────────────────────────────

function extractVariables(message: string): string[] {
  const matches = message.match(/\{(\w+)\}/g) ?? []
  return [...new Set(matches.map((m) => m.slice(1, -1)))]
}

function BulkSendMessageModal({
  names,
  onClose,
}: {
  names: string[]
  onClose: () => void
}) {
  const [selected, setSelected] = useState<CommTemplate | null>(null)
  const [vars, setVars] = useState<Record<string, string>>({})

  const handleSelect = (t: CommTemplate) => {
    setSelected(t)
    const v: Record<string, string> = {}
    extractVariables(t.message).forEach((k) => { v[k] = "" })
    setVars(v)
  }

  const preview = selected
    ? selected.message.replace(/\{(\w+)\}/g, (_, k) => vars[k] || `{${k}}`)
    : ""

  const genericTemplates = commsTemplates.filter((t) => t.category === "generic")
  const engagementTemplates = commsTemplates.filter((t) => t.category === "engagement")

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-[640px] max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">Send WhatsApp Message</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {names.length === 1 ? names[0] : `${names.length} volunteers`}
            </p>
          </div>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Template list */}
          <div className="w-56 border-r border-gray-100 overflow-y-auto py-3 shrink-0">
            {[{ label: "Generic", items: genericTemplates }, { label: "Engagement", items: engagementTemplates }].map(({ label, items }) => (
              <div key={label} className="mb-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-4 mb-1">{label}</p>
                {items.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelect(t)}
                    className={`w-full text-left px-4 py-2 text-xs transition-colors ${selected?.id === t.id ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Right panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selected ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-xs">
                Select a template to preview
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {/* Variables */}
                {Object.keys(vars).length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Fill in variables</p>
                    <div className="space-y-2">
                      {Object.keys(vars).map((k) => (
                        <div key={k}>
                          <label className="text-xs text-gray-500 block mb-0.5">{`{${k}}`}</label>
                          <input
                            className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-blue-400"
                            placeholder={`Enter ${k}…`}
                            value={vars[k]}
                            onChange={(e) => setVars((v) => ({ ...v, [k]: e.target.value }))}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preview */}
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Message preview</p>
                  <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3 text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {preview}
                  </div>
                </div>
              </div>
            )}

            <div className="px-5 py-3 border-t border-gray-100 flex gap-2 shrink-0">
              <Button variant="outline" size="sm" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button size="sm" className="flex-1" disabled={!selected} onClick={onClose}>
                <Send className="w-3.5 h-3.5" />Send to {names.length === 1 ? names[0].split(" ")[0] : `${names.length} volunteers`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Side Pane ────────────────────────────────────────────────────────────────

function ProfilePane({
  volunteer, onClose, onSave,
}: {
  volunteer: Volunteer
  onClose: () => void
  onSave: (v: Volunteer) => void
}) {
  const navigate = useNavigate()
  const [mode, setMode] = useState<"view" | "edit">("view")
  const [data, setData] = useState<Volunteer>({ ...volunteer })
  const [newSkill, setNewSkill] = useState("")
  const [paneTab, setPaneTab] = useState<"profile" | "mentoring" | "projects">("profile")

  const set = (field: keyof Volunteer, val: unknown) =>
    setData((d) => ({ ...d, [field]: val }))

  const handleSave = () => { onSave(data); setMode("view") }
  const handleCancel = () => { setData({ ...volunteer }); setMode("view") }

  const addSkill = () => {
    if (newSkill.trim() && !data.skills.includes(newSkill.trim())) {
      set("skills", [...data.skills, newSkill.trim()])
      setNewSkill("")
    }
  }
  const removeSkill = (s: string) => set("skills", data.skills.filter((x) => x !== s))

  const addExp = () => set("pastExperience", [...data.pastExperience, { role: "", company: "", duration: "" }])
  const removeExp = (i: number) => set("pastExperience", data.pastExperience.filter((_, idx) => idx !== i))
  const updateExp = (i: number, field: "role" | "company" | "duration", val: string) =>
    set("pastExperience", data.pastExperience.map((e, idx) => idx === i ? { ...e, [field]: val } : e))

  const [newLang, setNewLang] = useState("")
  const addLang = () => {
    const lang = newLang.trim()
    if (lang && !data.preferredLanguages.includes(lang)) {
      set("preferredLanguages", [...data.preferredLanguages, lang])
      setNewLang("")
    }
  }
  const removeLang = (l: string) => set("preferredLanguages", data.preferredLanguages.filter((x) => x !== l))

  const setHometown = (field: keyof Location, val: string) => set("hometown", { ...data.hometown, [field]: val })
  const setCurrentLocation = (field: keyof Location, val: string) => set("currentLocation", { ...data.currentLocation, [field]: val })
  const fmtLocation = (loc: Location) => [loc.city, loc.state, loc.country].filter(Boolean).join(", ")

  const v = mode === "edit" ? data : volunteer

  const hasMentoring = v.volunteeringType === "Mentoring" || v.volunteeringType === "Both"
  const hasProjects = v.volunteeringType === "Projects" || v.volunteeringType === "Both"

  return (
    <div className="w-[420px] border-l border-gray-200 bg-white flex flex-col overflow-hidden shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
        <p className="font-semibold text-gray-900 text-sm">Volunteer Profile</p>
        <div className="flex items-center gap-2">
          {mode === "view" && (
            <button onClick={() => setMode("edit")} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
              <Pencil className="w-3 h-3" /> Edit
            </button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Avatar + name */}
      <div className="px-5 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg font-bold shrink-0">
            {volunteer.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="flex-1 min-w-0">
            {mode === "edit" ? (
              <input className="text-sm font-semibold text-gray-900 border-b border-blue-300 w-full outline-none bg-transparent" value={data.name} onChange={(e) => set("name", e.target.value)} />
            ) : (
              <p className="font-semibold text-gray-900">{v.name}</p>
            )}
            <p className="text-xs text-gray-500 mt-0.5">{v.currentRole} · {v.currentCompany}</p>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <Badge variant={typeVariant[v.volunteeringType]}>{v.volunteeringType}</Badge>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${statusColors[v.status]}`}>{v.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 shrink-0">
        {(["profile", "mentoring", "projects"] as const)
          .filter((tab) => tab === "profile" || (tab === "mentoring" && hasMentoring) || (tab === "projects" && hasProjects))
          .map((tab) => (
            <button key={tab} onClick={() => setPaneTab(tab)}
              className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${paneTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-sm">

        {/* ── Profile Tab ── */}
        {paneTab === "profile" && (
          <>
            <PaneSection label="Current Role">
              {mode === "edit" ? (
                <div className="space-y-1.5">
                  <div><label className="text-xs text-gray-500 block mb-0.5">Role</label><input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" value={data.currentRole} onChange={(e) => set("currentRole", e.target.value)} /></div>
                  <div><label className="text-xs text-gray-500 block mb-0.5">Company</label><input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" value={data.currentCompany} onChange={(e) => set("currentCompany", e.target.value)} /></div>
                  <div><label className="text-xs text-gray-500 block mb-0.5">Total years of experience</label><input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" type="number" value={data.totalYearsExp} onChange={(e) => set("totalYearsExp", Number(e.target.value))} /></div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <Briefcase className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-900 font-medium">{v.currentRole}</p>
                    <p className="text-gray-500 text-xs">{v.currentCompany} · {v.totalYearsExp} yrs total exp</p>
                  </div>
                </div>
              )}
            </PaneSection>

            <PaneSection label="Past Experience">
              {mode === "edit" ? (
                <div className="space-y-2">
                  {data.pastExperience.map((e, i) => (
                    <div key={i} className="bg-gray-50 rounded p-2 space-y-1 relative">
                      <button onClick={() => removeExp(i)} className="absolute top-1.5 right-1.5 text-gray-300 hover:text-red-400"><X className="w-3 h-3" /></button>
                      <div><label className="text-xs text-gray-500 block mb-0.5">Role</label><input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" value={e.role} onChange={(ev) => updateExp(i, "role", ev.target.value)} /></div>
                      <div><label className="text-xs text-gray-500 block mb-0.5">Company</label><input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" value={e.company} onChange={(ev) => updateExp(i, "company", ev.target.value)} /></div>
                      <div><label className="text-xs text-gray-500 block mb-0.5">Duration</label><input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" value={e.duration} onChange={(ev) => updateExp(i, "duration", ev.target.value)} /></div>
                    </div>
                  ))}
                  <button onClick={addExp} className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Add experience</button>
                </div>
              ) : (
                <div className="space-y-2">
                  {v.pastExperience.map((e, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-gray-800 font-medium text-xs">{e.role}</p>
                        <p className="text-gray-500 text-xs">{e.company} · {e.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </PaneSection>

            <PaneSection label="Skills">
              {mode === "edit" ? (
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {data.skills.map((s) => (
                      <span key={s} className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {s}<button onClick={() => removeSkill(s)}><X className="w-2.5 h-2.5" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <input className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" placeholder="Add skill…" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSkill()} />
                    <button onClick={addSkill} className="text-xs text-blue-600 font-medium px-2">Add</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {v.skills.map((s) => <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{s}</span>)}
                </div>
              )}
            </PaneSection>

            <PaneSection label="Volunteering Type">
              {mode === "edit" ? (
                <Select value={data.volunteeringType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set("volunteeringType", e.target.value)} className="w-full text-xs">
                  <option>Mentoring</option><option>Projects</option><option>Both</option>
                </Select>
              ) : (
                <Badge variant={typeVariant[v.volunteeringType]}>{v.volunteeringType}</Badge>
              )}
            </PaneSection>

            <PaneSection label="Status">
              {mode === "edit" ? (
                <Select value={data.status} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set("status", e.target.value as VolunteerStatus)} className="w-full text-xs">
                  <option>Orientation Pending</option><option>Active</option><option>Inactive</option><option>Archived</option>
                </Select>
              ) : (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[v.status]}`}>{v.status}</span>
              )}
            </PaneSection>

            {/* Orientation — shown in Profile for both types */}
            <PaneSection label="Orientation">
              <div className="space-y-2">
                {hasMentoring && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center gap-2 mb-1">
                      <UserCheck className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs font-medium text-gray-600">Mentoring</span>
                    </div>
                    {mode === "edit" ? (
                      <div className="space-y-2">
                        <Select value={data.orientationStatus} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set("orientationStatus", e.target.value as OrientationStatus)} className="w-full text-xs">
                          <option>Orientation Pending</option>
                          <option>Orientation Slot Booked</option>
                          <option>Orientation Done</option>
                          <option>Orientation Rescheduled</option>
                        </Select>
                        {data.orientationStatus !== "Orientation Pending" && (
                          <div>
                            <label className="text-xs text-gray-500 block mb-0.5">Orientation Date</label>
                            <input
                              type="date"
                              className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400"
                              value={data.orientationDate ?? ""}
                              onChange={(e) => set("orientationDate", e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${orientationColors[v.orientationStatus]}`}>{v.orientationStatus}</span>
                        {v.orientationStatus !== "Orientation Pending" && v.orientationDate && (
                          <p className="text-xs text-gray-500">Date: {new Date(v.orientationDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                        )}
                      </div>
                    )}
                    {(v.volunteeringType === "Mentoring" || v.volunteeringType === "Both") && v.interestedIn.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {v.interestedIn.map((i) => <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{i}</span>)}
                      </div>
                    )}
                  </div>
                )}
                {hasProjects && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <FolderKanban className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs font-medium text-gray-600">Projects</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">Orientation Done</span>
                  </div>
                )}
              </div>
            </PaneSection>

            <PaneSection label="Group">
              {mode === "edit" ? (
                <Select value={data.group} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set("group", e.target.value)} className="w-full text-xs">
                  {volunteerGroups.map((g) => <option key={g}>{g}</option>)}
                </Select>
              ) : (
                <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">{v.group}</span>
              )}
            </PaneSection>

            <PaneSection label="Availability">
              {mode === "edit" ? (
                <Select value={data.availability} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set("availability", e.target.value as Volunteer["availability"])} className="w-full text-xs">
                  <option>Available</option><option>On Leave</option><option>Inactive</option>
                </Select>
              ) : (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.availability === "Available" ? "bg-green-100 text-green-700" : v.availability === "On Leave" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"}`}>
                  {v.availability}
                </span>
              )}
            </PaneSection>

            <PaneSection label="Ratings">
              <div className="grid grid-cols-2 gap-3">
                {hasMentoring && (
                  <div className="bg-gray-50 rounded p-2 text-center">
                    <p className="text-xs text-gray-500 mb-1">Mentoring</p>
                    <StarRating value={v.mentoringRating} />
                  </div>
                )}
                {hasProjects && (
                  <div className="bg-gray-50 rounded p-2 text-center">
                    <p className="text-xs text-gray-500 mb-1">Projects</p>
                    <StarRating value={v.projectsRating} />
                  </div>
                )}
              </div>
            </PaneSection>

            <PaneSection label="Contact">
              {mode === "edit" ? (
                <div className="space-y-1.5">
                  <div><label className="text-xs text-gray-500 block mb-0.5">WhatsApp</label><input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" value={data.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></div>
                  <div><label className="text-xs text-gray-500 block mb-0.5">Personal Email</label><input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" value={data.email} onChange={(e) => set("email", e.target.value)} /></div>
                  <div><label className="text-xs text-gray-500 block mb-0.5">Official Email</label><input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" value={data.officialEmail} onChange={(e) => set("officialEmail", e.target.value)} /></div>
                  <div><label className="text-xs text-gray-500 block mb-0.5">LinkedIn</label><input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" value={data.linkedin} onChange={(e) => set("linkedin", e.target.value)} /></div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-gray-700"><Phone className="w-3.5 h-3.5 text-gray-400" />{v.whatsapp}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-700"><Mail className="w-3.5 h-3.5 text-gray-400" />{v.email}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500"><Mail className="w-3.5 h-3.5 text-gray-300" />{v.officialEmail} <span className="text-gray-400">(official)</span></div>
                  <div className="flex items-center gap-2 text-xs text-blue-600"><Link className="w-3.5 h-3.5" /><a href={`https://${v.linkedin}`} target="_blank" rel="noreferrer" className="hover:underline truncate">{v.linkedin}</a></div>
                  {v.resume ? (
                    <div className="flex items-center gap-2 text-xs text-blue-600"><FileText className="w-3.5 h-3.5" /><a href={v.resume} target="_blank" rel="noreferrer" className="hover:underline">View Resume</a></div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-gray-400"><FileText className="w-3.5 h-3.5" />Resume not uploaded</div>
                  )}
                </div>
              )}
            </PaneSection>

            <PaneSection label="Preferred Languages">
              {mode === "edit" ? (
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {data.preferredLanguages.map((l) => (
                      <span key={l} className="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                        {l}<button onClick={() => removeLang(l)}><X className="w-2.5 h-2.5" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <input className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" placeholder="Add language…" value={newLang} onChange={(e) => setNewLang(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addLang()} />
                    <button onClick={addLang} className="text-xs text-blue-600 font-medium px-2">Add</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {v.preferredLanguages.map((l) => <span key={l} className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">{l}</span>)}
                </div>
              )}
            </PaneSection>

            <PaneSection label="Hometown">
              {mode === "edit" ? (
                <div className="space-y-1.5">
                  <div><label className="text-xs text-gray-500 block mb-0.5">City</label><input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" value={data.hometown.city} onChange={(e) => setHometown("city", e.target.value)} /></div>
                  <div><label className="text-xs text-gray-500 block mb-0.5">State</label><input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" value={data.hometown.state} onChange={(e) => setHometown("state", e.target.value)} /></div>
                  <div><label className="text-xs text-gray-500 block mb-0.5">Country</label><input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" value={data.hometown.country} onChange={(e) => setHometown("country", e.target.value)} /></div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-gray-700"><MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />{fmtLocation(v.hometown)}</div>
              )}
            </PaneSection>

            <PaneSection label="Current Location">
              {mode === "edit" ? (
                <div className="space-y-1.5">
                  <div><label className="text-xs text-gray-500 block mb-0.5">City</label><input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" value={data.currentLocation.city} onChange={(e) => setCurrentLocation("city", e.target.value)} /></div>
                  <div><label className="text-xs text-gray-500 block mb-0.5">State</label><input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" value={data.currentLocation.state} onChange={(e) => setCurrentLocation("state", e.target.value)} /></div>
                  <div><label className="text-xs text-gray-500 block mb-0.5">Country</label><input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" value={data.currentLocation.country} onChange={(e) => setCurrentLocation("country", e.target.value)} /></div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-gray-700"><Globe className="w-3.5 h-3.5 text-gray-400 shrink-0" />{fmtLocation(v.currentLocation)}</div>
              )}
            </PaneSection>

            <PaneSection label="Signed Up">
              <p className="text-xs text-gray-700">{new Date(v.signedUpDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
            </PaneSection>
          </>
        )}

        {/* ── Mentoring Tab ── */}
        {paneTab === "mentoring" && (
          <>
            {!hasMentoring ? (
              <div className="text-center py-8 text-gray-400 text-xs">This volunteer is not registered for mentoring.</div>
            ) : (
              <>
                <PaneSection label="Active Mentoring">
                  {v.activeRequest ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1">
                      <p className="text-xs font-semibold text-green-800">{v.activeRequest.id}</p>
                      <p className="text-xs text-green-700">Mentee: <strong>{v.activeRequest.menteeName}</strong></p>
                      <p className="text-xs text-green-600">Skill: {v.activeRequest.skill}</p>
                      <p className="text-xs text-gray-400">Since {new Date(v.activeRequest.startedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No active mentoring session</p>
                  )}
                </PaneSection>

                <PaneSection label={`Past Mentoring (${v.pastRequests.length})`}>
                  {v.pastRequests.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No past mentoring sessions</p>
                  ) : v.pastRequests.map((r) => (
                    <div key={r.id} className="bg-gray-50 border border-gray-100 rounded-lg p-3 space-y-1">
                      <p className="text-xs font-semibold text-gray-700">{r.id}</p>
                      <p className="text-xs text-gray-700">Mentee: <strong>{r.menteeName}</strong></p>
                      <p className="text-xs text-gray-500">Skill: {r.skill} · Closed: {r.closedAt}</p>
                      {r.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-medium">{r.rating}/5</span>
                        </div>
                      )}
                      {r.feedback && <p className="text-xs text-gray-600 italic">"{r.feedback}"</p>}
                    </div>
                  ))}
                </PaneSection>

                <PaneSection label="Mentoring Rating">
                  <div className="flex items-center gap-2">
                    <StarRating value={v.mentoringRating} />
                    {!v.mentoringRating && <span className="text-xs text-gray-400">No rating yet</span>}
                  </div>
                </PaneSection>
              </>
            )}
          </>
        )}

        {/* ── Projects Tab ── */}
        {paneTab === "projects" && (
          <>
            {!hasProjects ? (
              <div className="text-center py-8 text-gray-400 text-xs">This volunteer is not registered for projects.</div>
            ) : (
              <>
                <PaneSection label={`Active Projects (${v.activeProjects.length})`}>
                  {v.activeProjects.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No active projects</p>
                  ) : v.activeProjects.map((p, i) => (
                    <div key={i} className="bg-green-50 border border-green-100 rounded p-2.5 text-xs space-y-0.5">
                      <p className="font-medium text-green-800">{p.projectName}</p>
                      <p className="text-green-700">{p.programName}</p>
                      <p className="text-green-600">NGO: {p.ngo}</p>
                    </div>
                  ))}
                </PaneSection>

                <PaneSection label={`Past Projects (${v.pastProjects.length})`}>
                  {v.pastProjects.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No past projects</p>
                  ) : v.pastProjects.map((p, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-100 rounded p-2.5 text-xs space-y-0.5">
                      <p className="font-medium text-gray-800">{p.projectName}</p>
                      <p className="text-gray-600">{p.programName}</p>
                      <p className="text-gray-500">NGO: {p.ngo}</p>
                      <p className="text-gray-400">Ended: {p.endDate}</p>
                    </div>
                  ))}
                </PaneSection>

                <PaneSection label="Projects Rating">
                  <div className="flex items-center gap-2">
                    <StarRating value={v.projectsRating} />
                    {!v.projectsRating && <span className="text-xs text-gray-400">No rating yet</span>}
                  </div>
                </PaneSection>
              </>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {mode === "edit" ? (
        <div className="px-5 py-4 border-t border-gray-100 flex gap-2 shrink-0">
          <Button size="sm" className="flex-1" onClick={handleSave}><Check className="w-3.5 h-3.5" />Save Changes</Button>
          <Button size="sm" variant="outline" onClick={handleCancel}>Cancel</Button>
        </div>
      ) : (
        <div className="px-5 py-4 border-t border-gray-100 flex gap-2 shrink-0">
          <Button size="sm" className="flex-1" onClick={() => setMode("edit")}><Pencil className="w-3.5 h-3.5" />Edit Profile</Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/volunteers/comms", { state: { contactId: volunteer.id } })}><MessageSquare className="w-3.5 h-3.5" />Message</Button>
        </div>
      )}
    </div>
  )
}

function PaneSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">{label}</p>
      {children}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function VolunteersList() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>(mockVolunteers)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("All")
  const [filterGroup, setFilterGroup] = useState("All")
  const [filterStatus, setFilterStatus] = useState("All")
  const [sortKey, setSortKey] = useState<SortKey>("name")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [drawerVol, setDrawerVol] = useState<Volunteer | null>(null)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [showColPicker, setShowColPicker] = useState(false)
  const [visibleCols, setVisibleCols] = useState<Set<ColKey>>(
    new Set(["name", "signedUpDate", "volunteeringType", "status", "mentoringRating", "projectsRating", "group"])
  )
  const [assignGroupFor, setAssignGroupFor] = useState<string[] | null>(null)
  const [changeStatusFor, setChangeStatusFor] = useState<string[] | null>(null)
  const [changeOrientationFor, setChangeOrientationFor] = useState<string[] | null>(null)
  const [bulkSendFor, setBulkSendFor] = useState<string[] | null>(null)

  const filtered = useMemo(() => {
    let list = volunteers.filter((v) => {
      const q = search.toLowerCase()
      return (
        (v.name.toLowerCase().includes(q) || v.currentRole.toLowerCase().includes(q) || v.currentCompany.toLowerCase().includes(q) || v.skills.some((s) => s.toLowerCase().includes(q))) &&
        (filterType === "All" || v.volunteeringType === filterType) &&
        (filterGroup === "All" || v.group === filterGroup) &&
        (filterStatus === "All" || v.status === filterStatus)
      )
    })
    list = [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === "name") cmp = a.name.localeCompare(b.name)
      else if (sortKey === "signedUpDate") cmp = a.signedUpDate.localeCompare(b.signedUpDate)
      else if (sortKey === "mentoringRating") cmp = a.mentoringRating - b.mentoringRating
      else if (sortKey === "projectsRating") cmp = a.projectsRating - b.projectsRating
      else if (sortKey === "totalYearsExp") cmp = a.totalYearsExp - b.totalYearsExp
      return sortDir === "asc" ? cmp : -cmp
    })
    return list
  }, [volunteers, search, filterType, filterGroup, filterStatus, sortKey, sortDir])

  const allSelected = filtered.length > 0 && filtered.every((v) => selectedIds.has(v.id))
  const toggleAll = () => setSelectedIds(allSelected ? new Set() : new Set(filtered.map((v) => v.id)))
  const toggleOne = (id: string) => {
    const next = new Set(selectedIds); next.has(id) ? next.delete(id) : next.add(id); setSelectedIds(next)
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("asc") }
  }
  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col
      ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />
      : <ChevronUp className="w-3 h-3 inline ml-0.5 opacity-20" />

  const assignGroup = (group: string) => {
    if (!assignGroupFor) return
    setVolunteers((prev) => prev.map((v) => assignGroupFor.includes(v.id) ? { ...v, group } : v))
    if (drawerVol && assignGroupFor.includes(drawerVol.id)) setDrawerVol((d) => d ? { ...d, group } : null)
    setAssignGroupFor(null)
    setSelectedIds(new Set())
  }

  const applyStatus = (status: VolunteerStatus) => {
    if (!changeStatusFor) return
    setVolunteers((prev) => prev.map((v) => changeStatusFor.includes(v.id) ? { ...v, status } : v))
    if (drawerVol && changeStatusFor.includes(drawerVol.id)) setDrawerVol((d) => d ? { ...d, status } : null)
    setChangeStatusFor(null)
    setSelectedIds(new Set())
  }

  const applyOrientation = (orientationStatus: OrientationStatus) => {
    if (!changeOrientationFor) return
    setVolunteers((prev) => prev.map((v) => changeOrientationFor.includes(v.id) ? { ...v, orientationStatus } : v))
    if (drawerVol && changeOrientationFor.includes(drawerVol.id)) setDrawerVol((d) => d ? { ...d, orientationStatus } : null)
    setChangeOrientationFor(null)
    setSelectedIds(new Set())
  }

  const saveVol = (updated: Volunteer) => {
    setVolunteers((p) => p.map((v) => v.id === updated.id ? updated : v))
    setDrawerVol(updated)
  }

  const toggleCol = (col: ColKey) => {
    setVisibleCols((prev) => {
      const next = new Set(prev)
      next.has(col) ? next.delete(col) : next.add(col)
      return next
    })
  }

  const stats = {
    total: volunteers.filter(v => v.status !== "Archived").length,
    mentoring: volunteers.filter((v) => (v.volunteeringType === "Mentoring" || v.volunteeringType === "Both") && v.status !== "Archived").length,
    projects: volunteers.filter((v) => (v.volunteeringType === "Projects" || v.volunteeringType === "Both") && v.status !== "Archived").length,
    active: volunteers.filter((v) => v.status === "Active").length,
  }

  const selectedVolunteers = volunteers.filter(v => selectedIds.has(v.id))
  const firstSelected = selectedVolunteers[0]

  return (
    <div className="flex h-full" onClick={() => { setOpenMenuId(null); setBulkOpen(false); setShowColPicker(false) }}>
      <div className="flex-1 p-6 space-y-5 overflow-auto min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Volunteers</h1>
            <p className="text-sm text-gray-500 mt-0.5">All registered volunteers across groups and organisations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Upload CSV</Button>
            <Button size="sm"><Plus className="w-4 h-4" />Add Volunteer</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Volunteers", value: stats.total, color: "text-gray-900" },
            { label: "Mentoring", value: stats.mentoring, color: "text-blue-600" },
            { label: "Projects", value: stats.projects, color: "text-purple-600" },
            { label: "Active", value: stats.active, color: "text-green-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap items-end">
          <div className="flex flex-col gap-1 flex-1 min-w-48">
            <label className="text-xs font-medium text-gray-500">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input placeholder="Search name, role, company, skill…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Type</label>
            <Select value={filterType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterType(e.target.value)} className="w-36">
              <option>All</option><option>Mentoring</option><option>Projects</option><option>Both</option>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Status</label>
            <Select value={filterStatus} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)} className="w-44">
              <option>All</option><option>Active</option><option>Orientation Pending</option><option>Inactive</option><option>Archived</option>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Group</label>
            <Select value={filterGroup} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterGroup(e.target.value)} className="w-40">
              <option>All</option>
              {volunteerGroups.map((g) => <option key={g}>{g}</option>)}
            </Select>
          </div>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <Button variant="outline" size="sm" onClick={() => setShowColPicker((o) => !o)}>
              <Eye className="w-3.5 h-3.5" />Columns
            </Button>
            {showColPicker && (
              <div className="absolute right-0 top-10 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-48">
                <p className="text-xs font-medium text-gray-500 mb-2">Show / hide columns</p>
                {ALL_COLUMNS.filter((c) => !c.always).map((col) => (
                  <label key={col.key} className="flex items-center gap-2 py-1 text-sm cursor-pointer">
                    <input type="checkbox" checked={visibleCols.has(col.key)} onChange={() => toggleCol(col.key)} className="rounded border-gray-300" />
                    {col.label}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bulk bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5">
            <span className="text-sm font-medium text-blue-700">{selectedIds.size} selected</span>
            <div className="flex gap-2 ml-2 relative" onClick={(e) => e.stopPropagation()}>
              <Button size="sm" variant="outline" onClick={() => setBulkOpen((o) => !o)}>
                Bulk Actions <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
              {bulkOpen && (
                <div className="absolute top-10 left-0 z-20 bg-white border border-gray-200 rounded-lg shadow-lg w-56 py-1">
                  {[
                    { icon: MessageSquare, label: "Send Message", action: () => { setBulkSendFor([...selectedIds]); setBulkOpen(false) } },
                    { icon: UserCheck, label: "Change Status", action: () => { setChangeStatusFor([...selectedIds]); setBulkOpen(false) } },
                    { icon: Archive, label: "Change Orientation Status", action: () => { setChangeOrientationFor([...selectedIds]); setBulkOpen(false) } },
                    { icon: Users, label: "Assign Volunteer Group", action: () => { setAssignGroupFor([...selectedIds]); setBulkOpen(false) } },
                  ].map(({ icon: Icon, label, action }) => (
                    <button key={label} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-gray-50 text-left text-gray-700" onClick={action}>
                      <Icon className="w-4 h-4 text-gray-400" />{label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="ml-auto text-gray-400 hover:text-gray-600" onClick={() => setSelectedIds(new Set())}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 w-8">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded border-gray-300" />
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer select-none" onClick={() => handleSort("name")}>
                  Name <SortIcon col="name" />
                </th>
                {visibleCols.has("signedUpDate") && (
                  <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer select-none" onClick={() => handleSort("signedUpDate")}>
                    Signed Up <SortIcon col="signedUpDate" />
                  </th>
                )}
                {visibleCols.has("volunteeringType") && <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>}
                {visibleCols.has("status") && <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>}
                {visibleCols.has("mentoringRating") && (
                  <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer select-none" onClick={() => handleSort("mentoringRating")}>
                    Mentoring <SortIcon col="mentoringRating" />
                  </th>
                )}
                {visibleCols.has("projectsRating") && (
                  <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer select-none" onClick={() => handleSort("projectsRating")}>
                    Projects <SortIcon col="projectsRating" />
                  </th>
                )}
                {visibleCols.has("group") && <th className="text-left px-4 py-3 font-medium text-gray-600">Group</th>}
                {visibleCols.has("availability") && <th className="text-left px-4 py-3 font-medium text-gray-600">Availability</th>}
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-400">No volunteers match your filters</td></tr>
              ) : filtered.map((v) => (
                <tr key={v.id} className={`hover:bg-gray-50 transition-colors ${v.status === "Archived" ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedIds.has(v.id)} onChange={() => toggleOne(v.id)} className="rounded border-gray-300" />
                  </td>
                  <td className="px-4 py-3 cursor-pointer" onClick={() => setDrawerVol(v)}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold shrink-0">
                        {v.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 hover:text-blue-600">{v.name}</p>
                        <p className="text-xs text-gray-400">{v.currentRole}</p>
                      </div>
                    </div>
                  </td>
                  {visibleCols.has("signedUpDate") && (
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {new Date(v.signedUpDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                    </td>
                  )}
                  {visibleCols.has("volunteeringType") && (
                    <td className="px-4 py-3"><Badge variant={typeVariant[v.volunteeringType]}>{v.volunteeringType}</Badge></td>
                  )}
                  {visibleCols.has("status") && (
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[v.status]}`}>{v.status}</span>
                    </td>
                  )}
                  {visibleCols.has("mentoringRating") && (
                    <td className="px-4 py-3"><StarRating value={v.mentoringRating} /></td>
                  )}
                  {visibleCols.has("projectsRating") && (
                    <td className="px-4 py-3"><StarRating value={v.projectsRating} /></td>
                  )}
                  {visibleCols.has("group") && (
                    <td className="px-4 py-3">
                      <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">{v.group}</span>
                    </td>
                  )}
                  {visibleCols.has("availability") && (
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.availability === "Available" ? "bg-green-100 text-green-700" : v.availability === "On Leave" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"}`}>
                        {v.availability}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3 relative" onClick={(e) => e.stopPropagation()}>
                    <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400" onClick={() => setOpenMenuId(openMenuId === v.id ? null : v.id)}>
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openMenuId === v.id && (
                      <div className="absolute right-8 top-2 z-20 bg-white border border-gray-200 rounded-lg shadow-lg w-56 py-1">
                        {[
                          { icon: Pencil, label: "Edit Profile", action: () => { setDrawerVol(v); setOpenMenuId(null) } },
                          { icon: UserCheck, label: "Change Status", action: () => { setChangeStatusFor([v.id]); setOpenMenuId(null) } },
                          { icon: Archive, label: "Change Orientation Status", action: () => { setChangeOrientationFor([v.id]); setOpenMenuId(null) } },
                          { icon: Users, label: "Assign Volunteer Group", action: () => { setAssignGroupFor([v.id]); setOpenMenuId(null) } },
                          { icon: MessageSquare, label: "Send Message", action: () => setOpenMenuId(null) },
                        ].map(({ icon: Icon, label, action }) => (
                          <button key={label} onClick={action}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-gray-50 text-left text-gray-700">
                            <Icon className="w-4 h-4 text-gray-400" />{label}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side pane */}
      {drawerVol && (
        <ProfilePane volunteer={drawerVol} onClose={() => setDrawerVol(null)} onSave={saveVol} />
      )}

      {/* Modals */}
      {assignGroupFor && (
        <AssignGroupModal
          names={assignGroupFor.map((id) => volunteers.find((v) => v.id === id)?.name ?? id)}
          onAssign={assignGroup}
          onClose={() => setAssignGroupFor(null)}
        />
      )}
      {changeStatusFor && firstSelected && (
        <ChangeStatusModal
          names={changeStatusFor.map((id) => volunteers.find((v) => v.id === id)?.name ?? id)}
          current={volunteers.find(v => v.id === changeStatusFor[0])?.status ?? "Active"}
          onSave={applyStatus}
          onClose={() => setChangeStatusFor(null)}
        />
      )}
      {changeOrientationFor && (
        <ChangeOrientationModal
          names={changeOrientationFor.map((id) => volunteers.find((v) => v.id === id)?.name ?? id)}
          current={volunteers.find(v => v.id === changeOrientationFor[0])?.orientationStatus ?? "Orientation Pending"}
          onSave={applyOrientation}
          onClose={() => setChangeOrientationFor(null)}
        />
      )}
      {bulkSendFor && (
        <BulkSendMessageModal
          names={bulkSendFor.map((id) => volunteers.find((v) => v.id === id)?.name ?? id)}
          onClose={() => { setBulkSendFor(null); setSelectedIds(new Set()) }}
        />
      )}
    </div>
  )
}
