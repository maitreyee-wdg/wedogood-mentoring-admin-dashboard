import { useState, useMemo, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { mockVolunteers, mentorGroups, type Volunteer, type OrientationStatus } from "@/data/volunteersData"
import {
  Search, Plus, X, ChevronUp, ChevronDown, MoreVertical,
  Star, MessageSquare, RefreshCw, Archive, Users, Pencil,
  Upload, Download, FileSpreadsheet,
} from "lucide-react"
import { VolunteerPane } from "@/components/VolunteerSidePane"

// ── CSV template ──────────────────────────────────────────────────────────────

const VOL_CSV_HEADERS = [
  "name", "currentRole", "currentCompany", "totalYearsExp",
  "skills", "volunteeringType", "preferredMenteeStage", "preferredLanguages",
  "mentorGroup",
  "currentCity", "currentState",
  "whatsapp", "email", "officialEmail", "linkedin",
]

const VOL_CSV_EXAMPLE = [
  "Rahul Mehta", "HR Business Partner", "Infosys", "8",
  "Resume Writing;Interview Prep;Career Guidance", "Mentoring",
  "College students/Fresh graduates;0-4 years experience", "English;Hindi",
  "HR & People",
  "Bengaluru", "Karnataka",
  "+91 98765 11001", "rahul@gmail.com", "rahul@infosys.com", "linkedin.com/in/rahulmehta",
]

function downloadVolCSVTemplate() {
  const rows = [VOL_CSV_HEADERS.join(","), VOL_CSV_EXAMPLE.map(v => `"${v}"`).join(",")]
  const blob = new Blob([rows.join("\n")], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "volunteers_template.csv"
  a.click()
  URL.revokeObjectURL(url)
}

// ── Upload CSV Modal ──────────────────────────────────────────────────────────

function UploadCSVModal({ onClose }: { onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && f.name.endsWith(".csv")) setFile(f)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-[500px]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">Upload Volunteers via CSV</h2>
            <p className="text-xs text-gray-500 mt-0.5">Import multiple mentor profiles at once</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileSpreadsheet className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">Step 1 — Download the template</p>
                <p className="text-xs text-blue-700 mt-0.5">
                  Fill in the CSV with one volunteer per row. Use semicolons to separate multiple values in Skills, Interested In, and Languages columns.
                </p>
                <button
                  onClick={downloadVolCSVTemplate}
                  className="mt-2 flex items-center gap-1.5 text-xs font-medium text-blue-700 border border-blue-300 bg-white hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download Template CSV
                </button>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Step 2 — Upload your filled CSV</p>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                dragging ? "border-blue-400 bg-blue-50" : file ? "border-green-400 bg-green-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Upload className={`w-7 h-7 ${file ? "text-green-500" : "text-gray-300"}`} />
              {file ? (
                <div className="text-center">
                  <p className="text-sm font-medium text-green-700">{file.name}</p>
                  <p className="text-xs text-green-600">{(file.size / 1024).toFixed(1)} KB · ready to import</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-600">Drop your CSV here, or <span className="text-blue-600 font-medium">browse</span></p>
                  <p className="text-xs text-gray-400 mt-1">Only .csv files are accepted</p>
                </div>
              )}
              <input ref={inputRef} type="file" accept=".csv" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f) }} />
            </div>
            {file && (
              <button onClick={() => setFile(null)} className="mt-1.5 text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                <X className="w-3 h-3" /> Remove file
              </button>
            )}
          </div>

          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer font-medium text-gray-600 hover:text-gray-800">View expected columns</summary>
            <div className="mt-2 flex flex-wrap gap-1">
              {VOL_CSV_HEADERS.map(h => (
                <span key={h} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">{h}</span>
              ))}
            </div>
          </details>
        </div>

        <div className="flex gap-2 px-5 py-4 border-t border-gray-100">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" disabled={!file}>
            <Upload className="w-3.5 h-3.5" /> Import {file ? "Volunteers" : ""}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Add Volunteer Modal ───────────────────────────────────────────────────────

const FIELD_CLS = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white"
const LABEL_CLS = "text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1"
const SECTION_CLS = "space-y-3"
const SECTION_TITLE_CLS = "text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100 pb-1"

interface VolFormData {
  name: string
  currentRole: string; currentCompany: string; totalYearsExp: string
  skills: string
  volunteeringType: "Mentoring" | "Projects" | "Both"
  preferredLanguages: string
  group: string
  currentCity: string; currentState: string
  whatsapp: string; email: string; officialEmail: string; linkedin: string
}

const EMPTY_VOL: VolFormData = {
  name: "",
  currentRole: "", currentCompany: "", totalYearsExp: "0",
  skills: "",
  volunteeringType: "Mentoring",
  preferredLanguages: "",
  group: "",
  currentCity: "", currentState: "",
  whatsapp: "", email: "", officialEmail: "", linkedin: "",
}

function AddVolunteerModal({ onSave, onClose }: { onSave: (v: Volunteer) => void; onClose: () => void }) {
  const [form, setForm] = useState<VolFormData>(EMPTY_VOL)
  const set = (k: keyof VolFormData, v: string) => setForm(p => ({ ...p, [k]: v }))

  const canSave = form.name.trim() && form.whatsapp.trim()

  const handleSave = () => {
    if (!canSave) return
    const splitSemi = (s: string) => s.split(";").map(x => x.trim()).filter(Boolean)
    const newVol: Volunteer = {
      id: `VOL-${String(Date.now()).slice(-4)}`,
      name: form.name.trim(),
      currentRole: form.currentRole.trim() || "—",
      currentCompany: form.currentCompany.trim() || "—",
      totalYearsExp: parseFloat(form.totalYearsExp) || 0,
      pastExperience: [],
      skills: splitSemi(form.skills),
      volunteeringType: form.volunteeringType,
      preferredMenteeStage: [],
      mentoringRating: 0,
      projectsRating: 0,
      rating: 0,
      group: form.group || "—",
      preferredLanguages: splitSemi(form.preferredLanguages),
      hometown: { city: "", state: "", country: "India" },
      currentLocation: { city: form.currentCity.trim(), state: form.currentState.trim(), country: "India" },
      whatsapp: form.whatsapp.trim(),
      email: form.email.trim(),
      officialEmail: form.officialEmail.trim(),
      linkedin: form.linkedin.trim() || "—",
      status: "Orientation Pending",
      orientationStatus: "Orientation Pending",
      signedUpDate: new Date().toISOString().split("T")[0],
      sessionAvailability: "Available",
      pastRequests: [],
      activeProjects: [],
      pastProjects: [],
    }
    onSave(newVol)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-[600px] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-semibold text-gray-900">Add New Volunteer</h2>
            <p className="text-xs text-gray-500 mt-0.5">Fill in the mentor's profile details</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {/* Basic Info */}
          <div className={SECTION_CLS}>
            <p className={SECTION_TITLE_CLS}>Basic Info</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={LABEL_CLS}>Full Name *</label>
                <input className={FIELD_CLS} placeholder="e.g. Rahul Mehta" value={form.name} onChange={e => set("name", e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLS}>Current Role</label>
                <input className={FIELD_CLS} placeholder="e.g. HR Business Partner" value={form.currentRole} onChange={e => set("currentRole", e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLS}>Company</label>
                <input className={FIELD_CLS} placeholder="e.g. Infosys" value={form.currentCompany} onChange={e => set("currentCompany", e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLS}>Total Years of Experience</label>
                <input className={FIELD_CLS} type="number" min="0" step="1" placeholder="0" value={form.totalYearsExp} onChange={e => set("totalYearsExp", e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLS}>Preferred Languages <span className="font-normal normal-case text-gray-400">(semicolons)</span></label>
                <input className={FIELD_CLS} placeholder="e.g. English; Hindi" value={form.preferredLanguages} onChange={e => set("preferredLanguages", e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLS}>City</label>
                <input className={FIELD_CLS} placeholder="e.g. Bengaluru" value={form.currentCity} onChange={e => set("currentCity", e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLS}>State</label>
                <input className={FIELD_CLS} placeholder="e.g. Karnataka" value={form.currentState} onChange={e => set("currentState", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className={SECTION_CLS}>
            <p className={SECTION_TITLE_CLS}>Contact</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>WhatsApp *</label>
                <input className={FIELD_CLS} placeholder="+91 98765 11001" value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLS}>Personal Email</label>
                <input className={FIELD_CLS} type="email" placeholder="volunteer@gmail.com" value={form.email} onChange={e => set("email", e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLS}>Official Email</label>
                <input className={FIELD_CLS} type="email" placeholder="volunteer@company.com" value={form.officialEmail} onChange={e => set("officialEmail", e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLS}>LinkedIn</label>
                <input className={FIELD_CLS} placeholder="linkedin.com/in/username" value={form.linkedin} onChange={e => set("linkedin", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Mentor Group */}
          <div className={SECTION_CLS}>
            <p className={SECTION_TITLE_CLS}>Mentor Group</p>
            <div>
              <label className={LABEL_CLS}>Group</label>
              <select className={FIELD_CLS} value={form.group} onChange={e => set("group", e.target.value)}>
                <option value="">— Select a group —</option>
                {mentorGroups.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* Volunteering Preferences */}
          <div className={SECTION_CLS}>
            <p className={SECTION_TITLE_CLS}>Volunteering Preferences</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Volunteering Type</label>
                <select className={FIELD_CLS} value={form.volunteeringType} onChange={e => set("volunteeringType", e.target.value)}>
                  <option>Mentoring</option>
                  <option>Projects</option>
                  <option>Both</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLS}>Preferred Mentee Stage</label>
                <p className="text-xs text-gray-400 italic">Set after profile creation</p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className={SECTION_CLS}>
            <p className={SECTION_TITLE_CLS}>Skills</p>
            <div>
              <label className={LABEL_CLS}>Skills <span className="font-normal normal-case text-gray-400">(separate with semicolons)</span></label>
              <input className={FIELD_CLS} placeholder="e.g. Resume Writing; Interview Prep; Career Guidance" value={form.skills} onChange={e => set("skills", e.target.value)} />
            </div>
          </div>

        </div>

        <div className="flex gap-2 px-5 py-4 border-t border-gray-100 shrink-0">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" disabled={!canSave} onClick={handleSave}>
            <Plus className="w-3.5 h-3.5" /> Add Volunteer
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── helpers ──────────────────────────────────────────────────────────────────

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
  return (
    <div className="flex items-center gap-1">
      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
      <span className="text-sm font-medium text-gray-700">{value.toFixed(1)}</span>
    </div>
  )
}

type SortKey = "name" | "rating" | "totalYearsExp"
type SortDir = "asc" | "desc"

// ── main component ────────────────────────────────────────────────────────────

export default function Volunteers() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>(mockVolunteers)
  const [search, setSearch] = useState("")
  const [filterGroup, setFilterGroup] = useState("All")
  const [filterOrientation, setFilterOrientation] = useState("All")
  const [filterEngagement, setFilterEngagement] = useState("All")
  const [filterAvailability, setFilterAvailability] = useState("All")
  const [sortKey, setSortKey] = useState<SortKey>("name")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [drawerMentor, setDrawerMentor] = useState<Volunteer | null>(null)
  const [bulkActionOpen, setBulkActionOpen] = useState(false)
  const [showUploadCSV, setShowUploadCSV] = useState(false)
  const [showAddVolunteer, setShowAddVolunteer] = useState(false)

  // ── filter + sort ──
  const filtered = useMemo(() => {
    let list = volunteers.filter((v) => {
      const q = search.toLowerCase()
      const matchesSearch =
        v.name.toLowerCase().includes(q) ||
        v.currentRole.toLowerCase().includes(q) ||
        v.currentCompany.toLowerCase().includes(q) ||
        v.skills.some((s) => s.toLowerCase().includes(q))
      return (
        matchesSearch &&
        (filterGroup === "All" || v.group === filterGroup) &&
        (filterOrientation === "All" || v.orientationStatus === filterOrientation) &&
        (filterEngagement === "All" || (filterEngagement === "Active" ? !!v.activeRequest : !v.activeRequest)) &&
        (filterAvailability === "All" || v.sessionAvailability === filterAvailability)
      )
    })
    list = [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === "name") cmp = a.name.localeCompare(b.name)
      else if (sortKey === "rating") cmp = a.rating - b.rating
      else if (sortKey === "totalYearsExp") cmp = a.totalYearsExp - b.totalYearsExp
      return sortDir === "asc" ? cmp : -cmp
    })
    return list
  }, [volunteers, search, filterGroup, filterOrientation, filterEngagement, filterAvailability, sortKey, sortDir])

  // ── selection ──
  const allSelected = filtered.length > 0 && filtered.every((v) => selectedIds.has(v.id))
  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(filtered.map((v) => v.id)))
  }
  const toggleOne = (id: string) => {
    const next = new Set(selectedIds)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelectedIds(next)
  }

  // ── sort toggle ──
  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortKey(key); setSortDir("asc") }
  }
  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col
      ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />
      : <ChevronUp className="w-3 h-3 inline ml-0.5 opacity-20" />

  // ── individual actions ──
  const archiveMentor = (id: string) => {
    setVolunteers((prev) => prev.filter((v) => v.id !== id))
    setOpenMenuId(null)
    if (drawerMentor?.id === id) setDrawerMentor(null)
  }

  const openDrawer = (v: Volunteer) => {
    setDrawerMentor(v)
    setOpenMenuId(null)
  }

  const stats = {
    total: volunteers.length,
    active: volunteers.filter((v) => !!v.activeRequest).length,
    done: volunteers.filter((v) => v.orientationStatus === "Orientation Done").length,
    avgRating: (volunteers.reduce((s, v) => s + v.rating, 0) / volunteers.length).toFixed(1),
  }

  return (
    <div className="flex h-full">
      {/* ── MAIN ── */}
      <div className="flex-1 p-6 space-y-5 overflow-auto">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Volunteers / Mentors</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage mentor profiles, orientation and engagements</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowUploadCSV(true)}>
              <Upload className="w-4 h-4" />Upload CSV
            </Button>
            <Button size="sm" onClick={() => setShowAddVolunteer(true)}>
              <Plus className="w-4 h-4" />Add Mentor
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Mentors", value: stats.total, color: "text-gray-900" },
            { label: "Active Engagements", value: stats.active, color: "text-green-600" },
            { label: "Orientation Done", value: stats.done, color: "text-blue-600" },
            { label: "Avg Rating", value: stats.avgRating, color: "text-yellow-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search name, role, company, skill..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filterGroup} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterGroup(e.target.value)} className="w-40">
            <option>All</option>
            {mentorGroups.map((g) => <option key={g}>{g}</option>)}
          </Select>
          <Select value={filterOrientation} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterOrientation(e.target.value)} className="w-44">
            <option>All</option>
            <option>Orientation Pending</option>
            <option>Orientation Slot Booked</option>
            <option>Orientation Done</option>
            <option>Orientation Rescheduled</option>
          </Select>
          <Select value={filterEngagement} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterEngagement(e.target.value)} className="w-36">
            <option>All</option>
            <option>Active</option>
            <option>Not Engaged</option>
          </Select>
          <Select value={filterAvailability} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterAvailability(e.target.value)} className="w-36">
            <option>All</option>
            <option>Available</option>
            <option>On Leave</option>
            <option>Inactive</option>
          </Select>
        </div>

        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5">
            <span className="text-sm font-medium text-blue-700">{selectedIds.size} selected</span>
            <div className="flex gap-2 ml-2 relative">
              <Button size="sm" variant="outline" onClick={() => setBulkActionOpen((o) => !o)}>
                Bulk Actions <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
              {bulkActionOpen && (
                <div className="absolute top-10 left-0 z-20 bg-white border border-gray-200 rounded-lg shadow-lg w-52 py-1">
                  {[
                    { icon: MessageSquare, label: "Send Message" },
                    { icon: RefreshCw, label: "Change Orientation Status" },
                    { icon: Archive, label: "Archive Profiles" },
                    { icon: Users, label: "Assign Mentor Group" },
                  ].map(({ icon: Icon, label }) => (
                    <button key={label} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left" onClick={() => setBulkActionOpen(false)}>
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
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" onClick={() => { setOpenMenuId(null); setBulkActionOpen(false) }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 w-8">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded border-gray-300" />
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer select-none" onClick={() => handleSort("name")}>
                  Name <SortIcon col="name" />
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Company</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Skills</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Orientation</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Mentor Group</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Engagement</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer select-none" onClick={() => handleSort("rating")}>
                  Rating <SortIcon col="rating" />
                </th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-400">No mentors match your filters</td></tr>
              ) : filtered.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedIds.has(v.id)} onChange={() => toggleOne(v.id)} className="rounded border-gray-300" />
                  </td>
                  <td className="px-4 py-3 cursor-pointer" onClick={() => openDrawer(v)}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold shrink-0">
                        {v.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="font-medium text-gray-900 hover:text-blue-600">{v.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{v.currentRole}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{v.currentCompany}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {v.skills.slice(0, 2).map((s) => (
                        <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                      {v.skills.length > 2 && (
                        <span className="text-xs text-gray-400">+{v.skills.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={orientationVariant[v.orientationStatus]}>
                      {orientationShort[v.orientationStatus]}
                      {v.orientationDate && ` · ${v.orientationDate}`}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">{v.group}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={!!v.activeRequest ? "success" : "secondary"}>
                      {v.activeRequest ? `Active · ${v.activeRequest.menteeName}` : "Not Engaged"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3"><StarRating value={v.rating} /></td>
                  <td className="px-4 py-3 relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-400"
                      onClick={() => setOpenMenuId(openMenuId === v.id ? null : v.id)}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openMenuId === v.id && (
                      <div className="absolute right-8 top-2 z-20 bg-white border border-gray-200 rounded-lg shadow-lg w-52 py-1">
                        {[
                          { icon: MessageSquare, label: "Send Message", action: () => setOpenMenuId(null) },
                          { icon: RefreshCw, label: "Change Orientation Status", action: () => setOpenMenuId(null) },
                          { icon: Archive, label: "Archive Profile", action: () => archiveMentor(v.id) },
                          { icon: Users, label: "Assign Mentor Group", action: () => setOpenMenuId(null) },
                          { icon: Pencil, label: "Edit Profile", action: () => { openDrawer(v); } },
                        ].map(({ icon: Icon, label, action }) => (
                          <button key={label} onClick={action}
                            className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-gray-50 text-left ${label === "Archive Profile" ? "text-red-600" : "text-gray-700"}`}>
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

      {/* ── DRAWER ── */}
      {drawerMentor && (
        <VolunteerPane volunteer={drawerMentor} onClose={() => setDrawerMentor(null)} />
      )}

      {showUploadCSV && (
        <UploadCSVModal onClose={() => setShowUploadCSV(false)} />
      )}

      {showAddVolunteer && (
        <AddVolunteerModal
          onSave={(v) => { setVolunteers(prev => [v, ...prev]); setShowAddVolunteer(false) }}
          onClose={() => setShowAddVolunteer(false)}
        />
      )}
    </div>
  )
}
