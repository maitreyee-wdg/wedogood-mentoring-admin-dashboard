import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import {
  mockVolunteers, mentorGroups,
  type Volunteer, type OrientationStatus, type Location,
} from "@/data/volunteersData"
import {
  Search, Plus, X, MoreVertical, ChevronUp, ChevronDown,
  Star, MessageSquare, Archive, Users, Pencil, Briefcase,
  Mail, Phone, Link, FileText, Check, RefreshCw, MapPin, Globe,
} from "lucide-react"

// ── helpers ─────────────────────────────────────────────────────────────────

const orientationVariant: Record<OrientationStatus, "success" | "warning" | "secondary" | "outline"> = {
  "Orientation Done": "success",
  "Orientation Slot Booked": "secondary",
  "Orientation Pending": "warning",
  "Orientation Rescheduled": "outline",
}

const orientationShort: Record<OrientationStatus, string> = {
  "Orientation Done": "Done",
  "Orientation Slot Booked": "Slot Booked",
  "Orientation Pending": "Pending",
  "Orientation Rescheduled": "Rescheduled",
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

type SortKey = "name" | "mentoringRating" | "totalYearsExp"
type SortDir = "asc" | "desc"

// ── Change Orientation Modal ─────────────────────────────────────────────────

function OrientationModal({ names, current, onSave, onClose }: {
  names: string[]; current?: OrientationStatus; onSave: (s: OrientationStatus, date?: string) => void; onClose: () => void
}) {
  const [status, setStatus] = useState<OrientationStatus>(current ?? "Orientation Pending")
  const [date, setDate] = useState("")
  const needsDate = status === "Orientation Slot Booked" || status === "Orientation Rescheduled"
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-80 p-6">
        <h2 className="font-semibold text-gray-900 mb-1 text-sm">Change Orientation Status</h2>
        <p className="text-xs text-gray-500 mb-4">{names.length === 1 ? names[0] : `${names.length} mentors`}</p>
        <Select value={status} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value as OrientationStatus)} className="w-full mb-3">
          <option>Orientation Pending</option>
          <option>Orientation Slot Booked</option>
          <option>Orientation Done</option>
          <option>Orientation Rescheduled</option>
        </Select>
        {needsDate && (
          <div className="mb-3">
            <label className="text-xs font-medium text-gray-500 block mb-1">Orientation Date</label>
            <input type="date" className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 outline-none focus:border-blue-400" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={() => onSave(status, date || undefined)}>Save</Button>
        </div>
      </div>
    </div>
  )
}

// ── Profile Side Pane ────────────────────────────────────────────────────────

function MentorPane({ mentor, onClose, onSave }: {
  mentor: Volunteer; onClose: () => void; onSave: (v: Volunteer) => void
}) {
  const [mode, setMode] = useState<"view" | "edit">("view")
  const [data, setData] = useState<Volunteer>({ ...mentor })
  const [paneTab, setPaneTab] = useState<"profile" | "orientation" | "requests">("profile")
  const [newSkill, setNewSkill] = useState("")

  const set = (field: keyof Volunteer, val: unknown) => setData((d) => ({ ...d, [field]: val }))
  const v = mode === "edit" ? data : mentor

  const handleSave = () => { onSave(data); setMode("view") }
  const handleCancel = () => { setData({ ...mentor }); setMode("view") }

  const addSkill = () => {
    if (newSkill.trim() && !data.skills.includes(newSkill.trim())) { set("skills", [...data.skills, newSkill.trim()]); setNewSkill("") }
  }
  const removeSkill = (s: string) => set("skills", data.skills.filter((x) => x !== s))

  const [newLang, setNewLang] = useState("")
  const addLang = () => {
    const lang = newLang.trim()
    if (lang && !data.preferredLanguages.includes(lang)) { set("preferredLanguages", [...data.preferredLanguages, lang]); setNewLang("") }
  }
  const removeLang = (l: string) => set("preferredLanguages", data.preferredLanguages.filter((x) => x !== l))

  const setHometown = (field: keyof Location, val: string) => set("hometown", { ...data.hometown, [field]: val })
  const setCurrentLocation = (field: keyof Location, val: string) => set("currentLocation", { ...data.currentLocation, [field]: val })
  const fmtLocation = (loc: Location) => [loc.city, loc.state, loc.country].filter(Boolean).join(", ")

  return (
    <div className="w-96 border-l border-gray-200 bg-white flex flex-col overflow-hidden shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
        <p className="font-semibold text-gray-900 text-sm">Mentor Profile</p>
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
            {mentor.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900">{mentor.name}</p>
            <p className="text-xs text-gray-500">{mentor.currentRole} · {mentor.currentCompany}</p>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <StarRating value={mentor.mentoringRating} />
              <Badge variant={!!mentor.activeRequest ? "success" : "secondary"}>{mentor.activeRequest ? "Active" : "Not Engaged"}</Badge>
              <Badge variant={orientationVariant[mentor.orientationStatus]}>{orientationShort[mentor.orientationStatus]}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 shrink-0">
        {(["profile", "orientation", "requests"] as const).map((tab) => (
          <button key={tab} onClick={() => setPaneTab(tab)}
            className={`flex-1 py-2.5 text-xs font-medium capitalize ${paneTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-sm">
        {paneTab === "profile" && (
          <>
            <PaneSection label="Current Position">
              {mode === "edit" ? (
                <div className="space-y-1.5">
                  <div><label className="text-xs text-gray-500 block mb-0.5">Role</label><input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" placeholder="e.g. Software Engineer" value={data.currentRole} onChange={(e) => set("currentRole", e.target.value)} /></div>
                  <div><label className="text-xs text-gray-500 block mb-0.5">Company</label><input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" placeholder="e.g. Google" value={data.currentCompany} onChange={(e) => set("currentCompany", e.target.value)} /></div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <Briefcase className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-900 font-medium">{v.currentRole}</p>
                    <p className="text-gray-500 text-xs">{v.currentCompany} · {v.totalYearsExp} yrs exp</p>
                  </div>
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

            <PaneSection label="Preferred Mentee Stage">
              {mode === "edit" ? (
                <div className="space-y-1">
                  {(["College students", "Fresh graduates", "0–4 yrs", "4–8 yrs"] as const).map((lvl) => (
                    <label key={lvl} className="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" checked={data.preferredMenteeStage.includes(lvl)} onChange={(e) => set("preferredMenteeStage", e.target.checked ? [...data.preferredMenteeStage, lvl] : data.preferredMenteeStage.filter((x) => x !== lvl))} className="rounded border-gray-300" />
                      {lvl}
                    </label>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {v.preferredMenteeStage.map((i) => <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{i}</span>)}
                </div>
              )}
            </PaneSection>

            <PaneSection label="Mentor Group">
              {mode === "edit" ? (
                <Select value={data.group} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set("group", e.target.value)} className="w-full text-xs">
                  {mentorGroups.map((g) => <option key={g}>{g}</option>)}
                </Select>
              ) : (
                <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">{v.group}</span>
              )}
            </PaneSection>

            <PaneSection label="Contact">
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
            </PaneSection>

            <PaneSection label="Preferred Languages">
              {mode === "edit" ? (
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {data.preferredLanguages.map((l) => (
                      <span key={l} className="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                        {l}
                        <button onClick={() => removeLang(l)}><X className="w-2.5 h-2.5" /></button>
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
                  {v.preferredLanguages.map((l) => (
                    <span key={l} className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">{l}</span>
                  ))}
                </div>
              )}
            </PaneSection>

            <PaneSection label="Hometown">
              {mode === "edit" ? (
                <div className="space-y-1.5">
                  <div><label className="text-xs text-gray-500 block mb-0.5">City</label><input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" placeholder="e.g. Mumbai" value={data.hometown.city} onChange={(e) => setHometown("city", e.target.value)} /></div>
                  <div><label className="text-xs text-gray-500 block mb-0.5">State</label><input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" placeholder="e.g. Maharashtra" value={data.hometown.state} onChange={(e) => setHometown("state", e.target.value)} /></div>
                  <div><label className="text-xs text-gray-500 block mb-0.5">Country</label><input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" placeholder="e.g. India" value={data.hometown.country} onChange={(e) => setHometown("country", e.target.value)} /></div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-gray-700">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {fmtLocation(v.hometown)}
                </div>
              )}
            </PaneSection>

            <PaneSection label="Current Location">
              {mode === "edit" ? (
                <div className="space-y-1.5">
                  <div><label className="text-xs text-gray-500 block mb-0.5">City</label><input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" placeholder="e.g. Bengaluru" value={data.currentLocation.city} onChange={(e) => setCurrentLocation("city", e.target.value)} /></div>
                  <div><label className="text-xs text-gray-500 block mb-0.5">State</label><input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" placeholder="e.g. Karnataka" value={data.currentLocation.state} onChange={(e) => setCurrentLocation("state", e.target.value)} /></div>
                  <div><label className="text-xs text-gray-500 block mb-0.5">Country</label><input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" placeholder="e.g. India" value={data.currentLocation.country} onChange={(e) => setCurrentLocation("country", e.target.value)} /></div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-gray-700">
                  <Globe className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {fmtLocation(v.currentLocation)}
                </div>
              )}
            </PaneSection>
          </>
        )}

        {paneTab === "orientation" && (
          <>
            <PaneSection label="Current Status">
              <Badge variant={orientationVariant[v.orientationStatus]}>
                {v.orientationStatus}{v.orientationDate && ` · ${v.orientationDate}`}
              </Badge>
            </PaneSection>
            <PaneSection label="Update Status">
              <Select defaultValue={v.orientationStatus} className="w-full text-xs">
                <option>Orientation Pending</option>
                <option>Orientation Slot Booked</option>
                <option>Orientation Done</option>
                <option>Orientation Rescheduled</option>
              </Select>
              <Button size="sm" className="mt-2 w-full">Save Status</Button>
            </PaneSection>
          </>
        )}

        {paneTab === "requests" && (
          <>
            <PaneSection label="Active Request">
              {v.activeRequest ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1">
                  <p className="text-xs font-semibold text-green-800">{v.activeRequest.id}</p>
                  <p className="text-xs text-green-700">Mentee: <strong>{v.activeRequest.menteeName}</strong></p>
                  <p className="text-xs text-green-600">Skill: {v.activeRequest.skill}</p>
                  <p className="text-xs text-gray-400">Since {v.activeRequest.startedAt}</p>
                </div>
              ) : <p className="text-xs text-gray-400 italic">No active request</p>}
            </PaneSection>
            <PaneSection label={`Past Requests (${v.pastRequests.length})`}>
              {v.pastRequests.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No past requests</p>
              ) : v.pastRequests.map((r) => (
                <div key={r.id} className="bg-gray-50 border border-gray-100 rounded-lg p-3 space-y-1">
                  <p className="text-xs font-semibold text-gray-700">{r.id}</p>
                  <p className="text-xs text-gray-600">Mentee: {r.menteeName} · {r.closedAt}</p>
                  {r.feedback && <p className="text-xs italic text-gray-500">"{r.feedback}"</p>}
                  {r.rating && <div className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /><span className="text-xs">{r.rating}/5</span></div>}
                </div>
              ))}
            </PaneSection>
            <PaneSection label="Active Projects">
              {v.activeProjects.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No active projects</p>
              ) : v.activeProjects.map((p, i) => (
                <div key={i} className="bg-blue-50 border border-blue-100 rounded p-2.5 text-xs">
                  <p className="font-medium text-blue-800">{p.projectName}</p>
                  <p className="text-blue-600">{p.programName} · {p.ngo}</p>
                </div>
              ))}
            </PaneSection>
          </>
        )}
      </div>

      {/* Footer */}
      {mode === "edit" ? (
        <div className="px-5 py-4 border-t border-gray-100 flex gap-2 shrink-0">
          <Button size="sm" className="flex-1" onClick={handleSave}><Check className="w-3.5 h-3.5" />Save</Button>
          <Button size="sm" variant="outline" onClick={handleCancel}>Cancel</Button>
        </div>
      ) : (
        <div className="px-5 py-4 border-t border-gray-100 flex gap-2 shrink-0">
          <Button size="sm" className="flex-1" onClick={() => setMode("edit")}><Pencil className="w-3.5 h-3.5" />Edit</Button>
          <Button size="sm" variant="outline"><MessageSquare className="w-3.5 h-3.5" />Message</Button>
          <Button size="sm" variant="outline" onClick={() => setPaneTab("orientation")}><RefreshCw className="w-3.5 h-3.5" /></Button>
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

// ── Main ─────────────────────────────────────────────────────────────────────

export default function MentorsList() {
  const mentors = useMemo(() =>
    mockVolunteers.filter((v) => v.volunteeringType === "Mentoring" || v.volunteeringType === "Both"),
    []
  )
  const [list, setList] = useState<Volunteer[]>(mentors)
  const [search, setSearch] = useState("")
  const [filterOrientation, setFilterOrientation] = useState("All")
  const [filterGroup, setFilterGroup] = useState("All")
  const [filterEngagement, setFilterEngagement] = useState("All")
  const [filterAvailability, setFilterAvailability] = useState("All")
  const [sortKey, setSortKey] = useState<SortKey>("name")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [drawerMentor, setDrawerMentor] = useState<Volunteer | null>(null)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [orientationModalFor, setOrientationModalFor] = useState<string[] | null>(null)

  const filtered = useMemo(() => {
    let result = list.filter((v) => {
      const q = search.toLowerCase()
      return (
        (v.name.toLowerCase().includes(q) || v.currentRole.toLowerCase().includes(q) || v.skills.some((s) => s.toLowerCase().includes(q))) &&
        (filterOrientation === "All" || v.orientationStatus === filterOrientation) &&
        (filterGroup === "All" || v.group === filterGroup) &&
        (filterEngagement === "All" || (filterEngagement === "Active" ? !!v.activeRequest : !v.activeRequest)) &&
        (filterAvailability === "All" || v.sessionAvailability === filterAvailability)
      )
    })
    result = [...result].sort((a, b) => {
      let cmp = 0
      if (sortKey === "name") cmp = a.name.localeCompare(b.name)
      else if (sortKey === "mentoringRating") cmp = a.mentoringRating - b.mentoringRating
      else if (sortKey === "totalYearsExp") cmp = a.totalYearsExp - b.totalYearsExp
      return sortDir === "asc" ? cmp : -cmp
    })
    return result
  }, [list, search, filterOrientation, filterGroup, filterEngagement, filterAvailability, sortKey, sortDir])

  const allSelected = filtered.length > 0 && filtered.every((v) => selectedIds.has(v.id))
  const toggleAll = () => setSelectedIds(allSelected ? new Set() : new Set(filtered.map((v) => v.id)))
  const toggleOne = (id: string) => {
    const n = new Set(selectedIds); n.has(id) ? n.delete(id) : n.add(id); setSelectedIds(n)
  }
  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("asc") }
  }
  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />) : <ChevronUp className="w-3 h-3 inline ml-0.5 opacity-20" />

  const archiveMentor = (id: string) => {
    setList((p) => p.filter((v) => v.id !== id))
    if (drawerMentor?.id === id) setDrawerMentor(null)
    setSelectedIds((s) => { const n = new Set(s); n.delete(id); return n })
    setOpenMenuId(null)
  }

  const saveOrientation = (status: OrientationStatus, date?: string) => {
    if (!orientationModalFor) return
    setList((p) => p.map((v) => orientationModalFor.includes(v.id) ? { ...v, orientationStatus: status, orientationDate: date } : v))
    if (drawerMentor && orientationModalFor.includes(drawerMentor.id)) setDrawerMentor((d) => d ? { ...d, orientationStatus: status, orientationDate: date } : null)
    setOrientationModalFor(null)
  }

  const saveMentor = (updated: Volunteer) => {
    setList((p) => p.map((v) => v.id === updated.id ? updated : v))
    setDrawerMentor(updated)
  }

  const stats = {
    total: list.length,
    done: list.filter((v) => v.orientationStatus === "Orientation Done").length,
    active: list.filter((v) => !!v.activeRequest).length,
    avgRating: list.length ? (list.reduce((s, v) => s + v.mentoringRating, 0) / list.length).toFixed(1) : "—",
  }

  return (
    <div className="flex h-full" onClick={() => { setOpenMenuId(null); setBulkOpen(false) }}>
      <div className="flex-1 p-6 space-y-5 overflow-auto min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Mentors</h1>
            <p className="text-sm text-gray-500 mt-0.5">Volunteers interested in mentoring</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Upload CSV</Button>
            <Button size="sm"><Plus className="w-4 h-4" />Add Mentor</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Mentors", value: stats.total, color: "text-gray-900" },
            { label: "Orientation Done", value: stats.done, color: "text-blue-600" },
            { label: "Active Engagements", value: stats.active, color: "text-green-600" },
            { label: "Avg Rating", value: stats.avgRating, color: "text-yellow-600" },
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
              <Input placeholder="Search name, role, skill…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Orientation Status</label>
            <Select value={filterOrientation} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterOrientation(e.target.value)} className="w-48">
              <option>All</option>
              <option>Orientation Pending</option>
              <option>Orientation Slot Booked</option>
              <option>Orientation Done</option>
              <option>Orientation Rescheduled</option>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Group</label>
            <Select value={filterGroup} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterGroup(e.target.value)} className="w-40">
              <option>All</option>
              {mentorGroups.map((g) => <option key={g}>{g}</option>)}
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Engagement</label>
            <Select value={filterEngagement} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterEngagement(e.target.value)} className="w-36">
              <option>All</option>
              <option>Active</option>
              <option>Not Engaged</option>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Availability</label>
            <Select value={filterAvailability} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterAvailability(e.target.value)} className="w-36">
              <option>All</option>
              <option>Available</option>
              <option>On Leave</option>
              <option>Inactive</option>
            </Select>
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
                    { icon: MessageSquare, label: "Send WhatsApp Message", action: () => setBulkOpen(false) },
                    { icon: RefreshCw, label: "Change Orientation Status", action: () => { setOrientationModalFor([...selectedIds]); setBulkOpen(false) } },
                    { icon: Archive, label: "Archive Profiles", action: () => { [...selectedIds].forEach(archiveMentor); setBulkOpen(false) } },
                    { icon: Users, label: "Assign Mentor Group", action: () => setBulkOpen(false) },
                  ].map(({ icon: Icon, label, action }) => (
                    <button key={label} className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-gray-50 text-left ${label.includes("Archive") ? "text-red-600" : "text-gray-700"}`} onClick={action}>
                      <Icon className="w-4 h-4 text-gray-400" />{label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="ml-auto text-gray-400 hover:text-gray-600" onClick={() => setSelectedIds(new Set())}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 w-8"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded border-gray-300" /></th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer select-none" onClick={() => handleSort("name")}>Name <SortIcon col="name" /></th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Interested In</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Orientation</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Group</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Active Request</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer select-none" onClick={() => handleSort("mentoringRating")}>Rating <SortIcon col="mentoringRating" /></th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No mentors match your filters</td></tr>
              ) : filtered.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedIds.has(v.id)} onChange={() => toggleOne(v.id)} className="rounded border-gray-300" />
                  </td>
                  <td className="px-4 py-3 cursor-pointer" onClick={() => setDrawerMentor(v)}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold shrink-0">
                        {v.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 hover:text-blue-600">{v.name}</p>
                        <p className="text-xs text-gray-400">{v.currentRole} · {v.currentCompany}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {v.preferredMenteeStage.map((i) => (
                        <span key={i} className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">{i}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={orientationVariant[v.orientationStatus]}>
                      {orientationShort[v.orientationStatus]}{v.orientationDate && ` · ${v.orientationDate}`}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">{v.group}</span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {v.activeRequest ? (
                      <Badge variant="success">{v.activeRequest.menteeName}</Badge>
                    ) : <span className="text-gray-400 italic">None</span>}
                  </td>
                  <td className="px-4 py-3"><StarRating value={v.mentoringRating} /></td>
                  <td className="px-4 py-3 relative" onClick={(e) => e.stopPropagation()}>
                    <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400" onClick={() => setOpenMenuId(openMenuId === v.id ? null : v.id)}>
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openMenuId === v.id && (
                      <div className="absolute right-8 top-2 z-20 bg-white border border-gray-200 rounded-lg shadow-lg w-56 py-1">
                        {[
                          { icon: MessageSquare, label: "Send WhatsApp Message", action: () => setOpenMenuId(null) },
                          { icon: RefreshCw, label: "Change Orientation Status", action: () => { setOrientationModalFor([v.id]); setOpenMenuId(null) } },
                          { icon: Archive, label: "Archive Profile", action: () => archiveMentor(v.id) },
                          { icon: Users, label: "Assign Mentor Group", action: () => setOpenMenuId(null) },
                          { icon: Pencil, label: "Edit Profile", action: () => { setDrawerMentor(v); setOpenMenuId(null) } },
                        ].map(({ icon: Icon, label, action }) => (
                          <button key={label} onClick={action}
                            className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-gray-50 text-left ${label.includes("Archive") ? "text-red-600" : "text-gray-700"}`}>
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

      {drawerMentor && (
        <MentorPane mentor={drawerMentor} onClose={() => setDrawerMentor(null)} onSave={saveMentor} />
      )}

      {orientationModalFor && (
        <OrientationModal
          names={orientationModalFor.map((id) => list.find((v) => v.id === id)?.name ?? id)}
          current={list.find((v) => v.id === orientationModalFor[0])?.orientationStatus}
          onSave={saveOrientation}
          onClose={() => setOrientationModalFor(null)}
        />
      )}
    </div>
  )
}
