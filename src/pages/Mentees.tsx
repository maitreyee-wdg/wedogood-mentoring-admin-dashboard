import { useState, useMemo, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { mockMentees, ngoGroups, type Mentee, type CareerStage, type PreviousRole } from "@/data/menteesData"
import { mockRequests, ACTIVE_STATUSES } from "@/data/requestsData"
import { Search, Plus, Users, BookOpen, Download, Upload, X, FileSpreadsheet } from "lucide-react"
import { MenteePane, StarDisplay, statusVariant, ngoColor } from "@/components/MenteeSidePane"

// ── CSV template columns ───────────────────────────────────────────────────────
const CSV_HEADERS = [
  "firstName", "lastName", "gender", "age", "careerStage",
  "beneficiaryGroup",
  "currentRole", "currentCompany", "totalYearsExp", "domain",
  "educationLevel", "educationDegree", "educationInstitute", "educationYear",
  "skills", "goals", "preferredLanguages",
  "hometownCity", "hometownState", "hometownCountry",
  "currentCity", "currentState", "currentCountry",
  "whatsapp", "email", "linkedin",
]

const CSV_MANDATORY = new Set(["firstName", "whatsapp"])

const CSV_EXAMPLE_ROW = [
  "Priya", "Sharma", "Female", "18", "Student",
  "Akanksha — Batch 2026",
  "Student", "—", "0", "Career Counselling",
  "12th Grade", "Science", "St. Xavier's School, Mumbai", "2026",
  "Excel;Communication", "Career Clarity;Job Readiness", "English;Hindi",
  "Mumbai", "Maharashtra", "India",
  "Mumbai", "Maharashtra", "India",
  "+91 98765 00001", "priya@gmail.com", "linkedin.com/in/priya",
]

function downloadCSVTemplate() {
  const requiredRow = CSV_HEADERS.map(h => CSV_MANDATORY.has(h) ? "required" : "optional")
  const rows = [
    CSV_HEADERS.join(","),
    requiredRow.map(v => `"${v}"`).join(","),
    CSV_EXAMPLE_ROW.map(v => `"${v}"`).join(","),
  ]
  const blob = new Blob([rows.join("\n")], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "mentees_template.csv"
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
            <h2 className="font-semibold text-gray-900">Upload Mentees via CSV</h2>
            <p className="text-xs text-gray-500 mt-0.5">Import multiple mentee profiles at once</p>
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
                  Fill in the CSV with one mentee per row. Use semicolons to separate multiple values in Skills, Goals, and Preferred Languages columns.
                </p>
                <button
                  onClick={downloadCSVTemplate}
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
              {CSV_HEADERS.map(h => (
                <span key={h} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono ${CSV_MANDATORY.has(h) ? "bg-red-50 text-red-700 border border-red-200" : "bg-gray-100 text-gray-600"}`}>
                  {h}{CSV_MANDATORY.has(h) && <span className="text-red-500 font-bold">*</span>}
                </span>
              ))}
            </div>
            <p className="mt-2 text-gray-400"><span className="text-red-500 font-bold">*</span> required</p>
          </details>
        </div>

        <div className="flex gap-2 px-5 py-4 border-t border-gray-100">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" disabled={!file}>
            <Upload className="w-3.5 h-3.5" /> Import {file ? "Mentees" : ""}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Add Mentee Modal ──────────────────────────────────────────────────────────

const FIELD_CLS = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white"
const LABEL_CLS = "text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1"
const SECTION_CLS = "space-y-3"
const SECTION_TITLE_CLS = "text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100 pb-1"

const CAREER_STAGES: CareerStage[] = ["Student", "Working", "Unemployed", "Fresh Graduate"]

const ALL_LANGUAGES = [
  "English", "Hindi", "Bengali", "Telugu", "Marathi", "Tamil",
  "Gujarati", "Kannada", "Malayalam", "Punjabi", "Odia", "Assamese", "Urdu",
]

interface MenteeFormData {
  firstName: string; lastName: string
  gender: "Male" | "Female" | "Other"
  age: string
  careerStage: CareerStage
  group: string
  currentRole: string; currentCompany: string; totalYearsExp: string; domain: string
  educationLevel: string; educationDegree: string; educationInstitute: string; educationYear: string
  skills: string; goals: string
  hometownCity: string; hometownState: string; hometownCountry: string
  currentCity: string; currentState: string; currentCountry: string
  whatsapp: string; email: string; linkedin: string
}

const EMPTY_FORM: MenteeFormData = {
  firstName: "", lastName: "",
  gender: "Female", age: "", careerStage: "Student",
  group: "",
  currentRole: "", currentCompany: "", totalYearsExp: "0", domain: "",
  educationLevel: "", educationDegree: "", educationInstitute: "", educationYear: "",
  skills: "", goals: "",
  hometownCity: "", hometownState: "", hometownCountry: "India",
  currentCity: "", currentState: "", currentCountry: "India",
  whatsapp: "", email: "", linkedin: "",
}

const EMPTY_ROLE: PreviousRole = { role: "", company: "", years: 0 }

function AddMenteeModal({ onSave, onClose }: { onSave: (m: Mentee) => void; onClose: () => void }) {
  const [form, setForm] = useState<MenteeFormData>(EMPTY_FORM)
  const [preferredLanguages, setPreferredLanguages] = useState<string[]>([])
  const [previousRoles, setPreviousRoles] = useState<PreviousRole[]>([])
  const [langInput, setLangInput] = useState("")

  const set = (k: keyof MenteeFormData, v: string) => setForm(p => ({ ...p, [k]: v }))

  const addLanguage = (lang: string) => {
    if (lang && !preferredLanguages.includes(lang)) {
      setPreferredLanguages(p => [...p, lang])
    }
    setLangInput("")
  }
  const removeLang = (lang: string) => setPreferredLanguages(p => p.filter(l => l !== lang))

  const addRole = () => setPreviousRoles(p => [...p, { ...EMPTY_ROLE }])
  const removeRole = (i: number) => setPreviousRoles(p => p.filter((_, idx) => idx !== i))
  const setRole = (i: number, field: keyof PreviousRole, val: string | number) =>
    setPreviousRoles(p => p.map((r, idx) => idx === i ? { ...r, [field]: val } : r))

  const canSave = form.firstName.trim() && form.whatsapp

  const handleSave = () => {
    if (!canSave) return
    const newMentee: Mentee = {
      id: `MTE-${String(Date.now()).slice(-4)}`,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      gender: form.gender,
      careerStage: form.careerStage,
      age: parseInt(form.age) || 0,
      ngo: "",
      group: form.group.trim(),
      currentRole: form.currentRole.trim() || (form.careerStage === "Student" ? "Student" : "—"),
      currentCompany: form.currentCompany.trim() || "—",
      totalYearsExp: parseFloat(form.totalYearsExp) || 0,
      domain: form.domain.trim(),
      previousRoles: previousRoles.filter(r => r.role.trim()),
      education: {
        level: form.educationLevel.trim(),
        degree: form.educationDegree.trim(),
        institute: form.educationInstitute.trim(),
        yearOfGraduation: form.educationYear.trim(),
      },
      skills: form.skills.split(";").map(s => s.trim()).filter(Boolean),
      goals: form.goals.split(";").map(g => g.trim()).filter(Boolean),
      rating: 0,
      preferredLanguages: preferredLanguages.length ? preferredLanguages : ["English"],
      hometown: { city: form.hometownCity.trim(), state: form.hometownState.trim(), country: form.hometownCountry.trim() },
      currentLocation: { city: form.currentCity.trim(), state: form.currentState.trim(), country: form.currentCountry.trim() },
      scopedNeed: "Unsure — needs scoping",
      knowsTheirNeed: false,
      engagementStatus: "Pending Match",
      joinedAt: new Date().toISOString().split("T")[0],
      whatsapp: form.whatsapp.trim(),
      email: form.email.trim(),
      linkedin: form.linkedin.trim() || "—",
    }
    onSave(newMentee)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-[600px] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-semibold text-gray-900">Add New Mentee</h2>
            <p className="text-xs text-gray-500 mt-0.5">Fill in the mentee's profile details</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {/* Basic Info */}
          <div className={SECTION_CLS}>
            <p className={SECTION_TITLE_CLS}>Basic Info</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>First Name *</label>
                <input className={FIELD_CLS} placeholder="e.g. Priya" value={form.firstName} onChange={e => set("firstName", e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLS}>Last Name</label>
                <input className={FIELD_CLS} placeholder="e.g. Sharma" value={form.lastName} onChange={e => set("lastName", e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLS}>Gender</label>
                <select className={FIELD_CLS} value={form.gender} onChange={e => set("gender", e.target.value)}>
                  <option>Female</option><option>Male</option><option>Other</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLS}>Age</label>
                <input className={FIELD_CLS} type="number" min="10" max="60" placeholder="e.g. 22" value={form.age} onChange={e => set("age", e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className={LABEL_CLS}>Career Stage</label>
                <select className={FIELD_CLS} value={form.careerStage} onChange={e => set("careerStage", e.target.value)}>
                  {CAREER_STAGES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className={SECTION_CLS}>
            <p className={SECTION_TITLE_CLS}>Contact</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>WhatsApp *</label>
                <input className={FIELD_CLS} placeholder="+91 98765 00001" value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLS}>Email</label>
                <input className={FIELD_CLS} type="email" placeholder="mentee@gmail.com" value={form.email} onChange={e => set("email", e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className={LABEL_CLS}>LinkedIn</label>
                <input className={FIELD_CLS} placeholder="linkedin.com/in/username" value={form.linkedin} onChange={e => set("linkedin", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Mentee Group */}
          <div className={SECTION_CLS}>
            <p className={SECTION_TITLE_CLS}>Mentee Group</p>
            <div>
              <label className={LABEL_CLS}>Group / Batch</label>
              <select className={FIELD_CLS} value={form.group} onChange={e => set("group", e.target.value)}>
                <option value="">— Select a group —</option>
                <option>Akanksha — Batch 2026</option>
                <option>NavGurukul — Cohort 11</option>
                <option>NavGurukul — Cohort 12</option>
                <option>Parivarthan — Batch 1</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div className={SECTION_CLS}>
            <p className={SECTION_TITLE_CLS}>Location</p>
            <p className="text-xs text-gray-500 -mt-1">Hometown</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={LABEL_CLS}>City</label>
                <input className={FIELD_CLS} placeholder="e.g. Mumbai" value={form.hometownCity} onChange={e => set("hometownCity", e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLS}>State</label>
                <input className={FIELD_CLS} placeholder="e.g. Maharashtra" value={form.hometownState} onChange={e => set("hometownState", e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLS}>Country</label>
                <input className={FIELD_CLS} placeholder="India" value={form.hometownCountry} onChange={e => set("hometownCountry", e.target.value)} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Current Location</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={LABEL_CLS}>City</label>
                <input className={FIELD_CLS} placeholder="e.g. Pune" value={form.currentCity} onChange={e => set("currentCity", e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLS}>State</label>
                <input className={FIELD_CLS} placeholder="e.g. Maharashtra" value={form.currentState} onChange={e => set("currentState", e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLS}>Country</label>
                <input className={FIELD_CLS} placeholder="India" value={form.currentCountry} onChange={e => set("currentCountry", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Preferred Languages */}
          <div className={SECTION_CLS}>
            <p className={SECTION_TITLE_CLS}>Preferred Languages</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {preferredLanguages.map(l => (
                <span key={l} className="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                  {l}<button type="button" onClick={() => removeLang(l)}><X className="w-2.5 h-2.5" /></button>
                </span>
              ))}
              {preferredLanguages.length === 0 && <span className="text-xs text-gray-400 italic">No languages added</span>}
            </div>
            <div className="flex gap-2">
              <select
                className={FIELD_CLS}
                value={langInput}
                onChange={e => setLangInput(e.target.value)}
              >
                <option value="">— Select a language —</option>
                {ALL_LANGUAGES.filter(l => !preferredLanguages.includes(l)).map(l => (
                  <option key={l}>{l}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => addLanguage(langInput)}
                disabled={!langInput}
                className="text-xs text-blue-600 font-medium px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Add
              </button>
            </div>
          </div>

          {/* Education */}
          <div className={SECTION_CLS}>
            <p className={SECTION_TITLE_CLS}>Education</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Level</label>
                <input className={FIELD_CLS} placeholder="e.g. B.Tech, 12th Grade, MBA" value={form.educationLevel} onChange={e => set("educationLevel", e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLS}>Degree / Stream</label>
                <input className={FIELD_CLS} placeholder="e.g. Computer Science" value={form.educationDegree} onChange={e => set("educationDegree", e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLS}>Institute</label>
                <input className={FIELD_CLS} placeholder="e.g. VIT Pune" value={form.educationInstitute} onChange={e => set("educationInstitute", e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLS}>Year of Graduation</label>
                <input className={FIELD_CLS} placeholder="e.g. 2025" value={form.educationYear} onChange={e => set("educationYear", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Current Position */}
          <div className={SECTION_CLS}>
            <p className={SECTION_TITLE_CLS}>Current Position</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Current Role</label>
                <input className={FIELD_CLS} placeholder="e.g. Junior Developer" value={form.currentRole} onChange={e => set("currentRole", e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLS}>Company / Organisation</label>
                <input className={FIELD_CLS} placeholder="e.g. Infosys" value={form.currentCompany} onChange={e => set("currentCompany", e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLS}>Total Years of Experience</label>
                <input className={FIELD_CLS} type="number" min="0" step="0.5" placeholder="0" value={form.totalYearsExp} onChange={e => set("totalYearsExp", e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLS}>Domain</label>
                <input className={FIELD_CLS} placeholder="e.g. Software Engineering" value={form.domain} onChange={e => set("domain", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Previous Roles */}
          <div className={SECTION_CLS}>
            <p className={SECTION_TITLE_CLS}>Previous Roles</p>
            {previousRoles.length === 0 && (
              <p className="text-xs text-gray-400 italic">No previous roles added</p>
            )}
            {previousRoles.map((r, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_80px_28px] gap-2 items-end">
                <div>
                  {i === 0 && <label className={LABEL_CLS}>Role</label>}
                  <input className={FIELD_CLS} placeholder="e.g. Intern" value={r.role} onChange={e => setRole(i, "role", e.target.value)} />
                </div>
                <div>
                  {i === 0 && <label className={LABEL_CLS}>Company</label>}
                  <input className={FIELD_CLS} placeholder="e.g. TCS" value={r.company} onChange={e => setRole(i, "company", e.target.value)} />
                </div>
                <div>
                  {i === 0 && <label className={LABEL_CLS}>Years</label>}
                  <input className={FIELD_CLS} type="number" min="0" step="0.5" placeholder="1" value={r.years || ""} onChange={e => setRole(i, "years", parseFloat(e.target.value) || 0)} />
                </div>
                <button type="button" onClick={() => removeRole(i)} className={`text-gray-400 hover:text-red-500 ${i === 0 ? "mt-5" : ""}`}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={addRole}
              className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:text-blue-700">
              <Plus className="w-3.5 h-3.5" /> Add Role
            </button>
          </div>

          {/* Skills & Goals */}
          <div className={SECTION_CLS}>
            <p className={SECTION_TITLE_CLS}>Skills & Goals</p>
            <div>
              <label className={LABEL_CLS}>Skills <span className="font-normal normal-case text-gray-400">(separate with semicolons)</span></label>
              <input className={FIELD_CLS} placeholder="e.g. Excel; Communication" value={form.skills} onChange={e => set("skills", e.target.value)} />
            </div>
            <div>
              <label className={LABEL_CLS}>Goals <span className="font-normal normal-case text-gray-400">(separate with semicolons)</span></label>
              <input className={FIELD_CLS} placeholder="e.g. Career Clarity; Job Readiness" value={form.goals} onChange={e => set("goals", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex gap-2 px-5 py-4 border-t border-gray-100 shrink-0">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" disabled={!canSave} onClick={handleSave}>
            <Plus className="w-3.5 h-3.5" /> Add Mentee
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Mentees() {
  const [mentees, setMentees] = useState<Mentee[]>(mockMentees)
  const [search, setSearch] = useState("")
  const [filterNGO, setFilterNGO] = useState("All")
  const [filterStatus, setFilterStatus] = useState("All")
  const [filterGender, setFilterGender] = useState("All")
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null)
  const [showUploadCSV, setShowUploadCSV] = useState(false)
  const [showAddMentee, setShowAddMentee] = useState(false)

  const filtered = useMemo(() => mentees.filter((m) => {
    const q = search.toLowerCase()
    const fullName = `${m.firstName} ${m.lastName}`.toLowerCase()
    const matchSearch =
      fullName.includes(q) ||
      m.id.toLowerCase().includes(q) ||
      m.currentLocation.city.toLowerCase().includes(q) ||
      m.hometown.city.toLowerCase().includes(q) ||
      m.domain.toLowerCase().includes(q) ||
      m.scopedNeed.toLowerCase().includes(q) ||
      m.skills.some((s) => s.toLowerCase().includes(q))
    return (
      matchSearch &&
      (filterNGO === "All" || m.ngo === filterNGO) &&
      (filterStatus === "All" || m.engagementStatus === filterStatus) &&
      (filterGender === "All" || m.gender === filterGender)
    )
  }), [mentees, search, filterNGO, filterStatus, filterGender])

  const stats = {
    total: mentees.length,
    active: mentees.filter((m) => m.engagementStatus === "Active").length,
    pending: mentees.filter((m) => m.engagementStatus === "Pending Match").length,
    knowsNeed: mentees.filter((m) => m.knowsTheirNeed).length,
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Mentees</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage end users across all NGO partners</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowUploadCSV(true)}>
              <Upload className="w-4 h-4" />Upload CSV
            </Button>
            <Button onClick={() => setShowAddMentee(true)}>
              <Plus className="w-4 h-4" />Add Mentee
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Mentees", value: stats.total, color: "text-gray-900" },
            { label: "Active", value: stats.active, color: "text-green-600" },
            { label: "Pending Match", value: stats.pending, color: "text-yellow-600" },
            { label: "Know Their Need", value: stats.knowsNeed, color: "text-blue-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* NGO quick filter */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">NGO Groups</p>
          <div className="flex gap-3">
            {ngoGroups.map((g) => (
              <button key={g.id} onClick={() => setFilterNGO(filterNGO === g.name ? "All" : g.name)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${filterNGO === g.name ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}>
                <Users className="w-3.5 h-3.5" />{g.name}
                <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">{g.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap items-end">
          <div className="flex flex-col gap-1 flex-1 min-w-48">
            <label className="text-xs font-medium text-gray-500">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input placeholder="Search by name, ID, skill, domain…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">NGO Partner</label>
            <Select value={filterNGO} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterNGO(e.target.value)} className="w-44">
              <option>All</option>
              <option>Akanksha Foundation</option>
              <option>NavGurukul</option>
              <option>Parivarthan</option>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Status</label>
            <Select value={filterStatus} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)} className="w-40">
              <option>All</option>
              <option>Active</option>
              <option>Pending Match</option>
              <option>On Hold</option>
              <option>Closed</option>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Gender</label>
            <Select value={filterGender} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterGender(e.target.value)} className="w-32">
              <option>All</option>
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Mentee</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">NGO / Group</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Education</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Skills</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Scoped Need</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Active Request</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-center"># Requests</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Rating</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-400">No mentees match your filters</td></tr>
              ) : filtered.map((m) => {
                const fullName = `${m.firstName} ${m.lastName}`
                return (
                  <tr key={m.id} className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedMentee?.id === m.id ? "bg-blue-50" : ""}`}
                    onClick={() => setSelectedMentee(selectedMentee?.id === m.id ? null : m)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold shrink-0">
                          {[m.firstName, m.lastName].map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{fullName}</p>
                          <p className="text-xs text-gray-400">{m.id} · {m.gender} · {m.age}y</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ngoColor[m.ngo] ?? "bg-gray-100 text-gray-700"}`}>{m.ngo}</span>
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[120px]">{m.group}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{m.education.level}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {m.skills.slice(0, 2).map((s) => (
                          <span key={s} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{s}</span>
                        ))}
                        {m.skills.length > 2 && <span className="text-xs text-gray-400">+{m.skills.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-800 text-xs max-w-[140px] truncate">{m.scopedNeed}</p>
                      {!m.knowsTheirNeed && <span className="text-xs text-amber-600 italic">Needs scoping</span>}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {(() => {
                        const active = mockRequests.filter((r) => r.menteeId === m.id && ACTIVE_STATUSES.includes(r.status))
                        return active.length > 0
                          ? <p className="text-gray-800 max-w-[150px] truncate">{active[0].theme}{active.length > 1 && <span className="text-gray-400 ml-1">+{active.length - 1}</span>}</p>
                          : <span className="text-gray-400 italic">No active request</span>
                      })()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-medium text-gray-700">
                        {mockRequests.filter((r) => r.menteeId === m.id).length}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[m.engagementStatus]}>{m.engagementStatus}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <StarDisplay value={m.rating} />
                    </td>
                    <td className="px-4 py-3">
                      <BookOpen className="w-4 h-4 text-gray-300" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedMentee && (
        <MenteePane mentee={selectedMentee} onClose={() => setSelectedMentee(null)} />
      )}

      {showUploadCSV && (
        <UploadCSVModal onClose={() => setShowUploadCSV(false)} />
      )}

      {showAddMentee && (
        <AddMenteeModal
          onSave={(m) => { setMentees(prev => [m, ...prev]); setShowAddMentee(false) }}
          onClose={() => setShowAddMentee(false)}
        />
      )}
    </div>
  )
}
