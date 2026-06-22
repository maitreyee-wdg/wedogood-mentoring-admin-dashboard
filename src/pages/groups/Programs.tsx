import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  mockPrograms, type Program, type ProgramPOC, type ProgramMeeting,
  type ProgramType, type ProgramStatus,
} from "@/data/programsData"
import {
  Search, X, Pencil, Users, CalendarDays, Building2,
  Layers, CheckCircle2, XCircle, ChevronRight, Plus, Mail, Phone, Save,
  Trash2, Star,
} from "lucide-react"

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

const TYPE_CFG: Record<ProgramType, { label: string; cls: string }> = {
  "Mentoring": { label: "MENTORING",            cls: "bg-purple-100 text-purple-700" },
  "Projects":  { label: "PROJECTS",             cls: "bg-blue-100 text-blue-700"    },
  "Both":      { label: "MENTORING + PROJECTS", cls: "bg-teal-100 text-teal-700"    },
}

const inputCls = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white"
const labelCls = "text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5"

// ─── New Program Modal ─────────────────────────────────────────────────────────

function NewProgramModal({ onSave, onClose }: {
  onSave: (prog: Program) => void
  onClose: () => void
}) {
  const [step, setStep] = useState<1 | 2>(1)

  // Step 1 — Details
  const [name, setName]       = useState("")
  const [org, setOrg]         = useState("")
  const [type, setType]       = useState<ProgramType>("Mentoring")
  const [startDate, setStart] = useState("")
  const [endDate, setEnd]     = useState("")
  const [summary, setSummary] = useState("")
  const [details, setDetails] = useState("")
  const [beneficiary, setBen] = useState("")
  const [engagement, setEng]  = useState("")
  const [volunteer, setVol]   = useState("")

  // Step 2 — POCs
  const [pocs, setPocs] = useState<ProgramPOC[]>([{ name: "", role: "", email: "", mobile: "", isMain: true }])

  const updatePoc = (i: number, field: keyof ProgramPOC, val: string | boolean) =>
    setPocs(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p))
  const setMain = (i: number) =>
    setPocs(prev => prev.map((p, idx) => ({ ...p, isMain: idx === i })))
  const removePoc = (i: number) => setPocs(prev => prev.filter((_, idx) => idx !== i))
  const addPoc = () => setPocs(prev => [...prev, { name: "", role: "", email: "", mobile: "", isMain: false }])

  const step1Valid = name.trim() && org.trim() && startDate && summary.trim()

  const handleCreate = () => {
    const newProg: Program = {
      id: `PROG-${Date.now()}`,
      name: name.trim(),
      organization: org.trim(),
      type,
      status: "Active",
      startDate,
      endDate: endDate.trim() || undefined,
      summary: summary.trim(),
      details: details.trim(),
      constraints: {
        beneficiary: beneficiary.trim(),
        engagement: engagement.trim(),
        volunteer: volunteer.trim(),
      },
      pocs: pocs.filter(p => p.name.trim()),
      meetings: [],
      linkedMenteeGroupIds: [],
    }
    onSave(newProg)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-[620px] max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-semibold text-gray-900">New Program</h2>
            <p className="text-xs text-gray-400 mt-0.5">Step {step} of 2 — {step === 1 ? "Program Details" : "Points of Contact"}</p>
          </div>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>

        {/* Step indicator */}
        <div className="flex px-6 pt-4 pb-0 gap-2 shrink-0">
          {([1, 2] as const).map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-blue-600" : "bg-gray-200"}`} />
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Program Name <span className="text-red-400">*</span></label>
                  <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Akanksha Mentoring Cohort 2026" />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Sponsor Organisation <span className="text-red-400">*</span></label>
                  <input className={inputCls} value={org} onChange={e => setOrg(e.target.value)} placeholder="e.g. Akanksha Foundation" />
                </div>
                <div>
                  <label className={labelCls}>Type</label>
                  <select className={inputCls} value={type} onChange={e => setType(e.target.value as ProgramType)}>
                    <option value="Mentoring">Mentoring</option>
                    <option value="Projects">Projects</option>
                    <option value="Both">Both (Mentoring + Projects)</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Start Date <span className="text-red-400">*</span></label>
                  <input type="date" className={inputCls} value={startDate} onChange={e => setStart(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>End Date <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
                  <input type="date" className={inputCls} value={endDate} onChange={e => setEnd(e.target.value)} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Summary <span className="text-red-400">*</span> <span className="text-gray-400 normal-case font-normal">(shown on card)</span></label>
                <input className={inputCls} value={summary} onChange={e => setSummary(e.target.value)} placeholder="One-line description of the program…" />
              </div>

              <div>
                <label className={labelCls}>Details</label>
                <textarea className={inputCls + " resize-none h-24"} value={details} onChange={e => setDetails(e.target.value)} placeholder="Full program description, goals, structure…" />
              </div>

              <div className="space-y-3">
                <label className={labelCls}>Constraints <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Beneficiary</p>
                  <input className={inputCls} value={beneficiary} onChange={e => setBen(e.target.value)} placeholder="e.g. Youth from Akanksha centres, ages 16–22" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Engagement</p>
                  <input className={inputCls} value={engagement} onChange={e => setEng(e.target.value)} placeholder="e.g. 1 session of 45–60 min over 10 days" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Volunteer</p>
                  <input className={inputCls} value={volunteer} onChange={e => setVol(e.target.value)} placeholder="e.g. Min. 3 years work experience" />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500">Add at least one point of contact for this program. Mark one as Main.</p>
              {pocs.map((poc, i) => (
                <div key={i} className={`rounded-xl border p-4 space-y-3 ${poc.isMain ? "border-cyan-300 bg-cyan-50/20" : "border-gray-200"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-gray-600">Contact {i + 1}</p>
                      {poc.isMain && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500 text-white">MAIN</span>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {!poc.isMain && (
                        <button onClick={() => setMain(i)}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-cyan-600 border border-gray-200 hover:border-cyan-300 px-2 py-0.5 rounded transition-colors">
                          <Star className="w-3 h-3" /> Set Main
                        </button>
                      )}
                      {pocs.length > 1 && (
                        <button onClick={() => removePoc(i)} className="text-gray-300 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Full Name</p>
                      <input className={inputCls} value={poc.name} onChange={e => updatePoc(i, "name", e.target.value)} placeholder="e.g. Arun Mehta" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Role / Title</p>
                      <input className={inputCls} value={poc.role} onChange={e => updatePoc(i, "role", e.target.value)} placeholder="e.g. Programme Director" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Email</p>
                      <input className={inputCls} type="email" value={poc.email} onChange={e => updatePoc(i, "email", e.target.value)} placeholder="name@org.com" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Mobile</p>
                      <input className={inputCls} value={poc.mobile} onChange={e => updatePoc(i, "mobile", e.target.value)} placeholder="+91-XXXXX-XXXXX" />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addPoc}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-2 rounded-lg border border-dashed border-blue-300 hover:border-blue-400 w-full justify-center transition-colors">
                <Plus className="w-4 h-4" /> Add Another Contact
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 py-4 border-t border-gray-100 shrink-0">
          {step === 1 ? (
            <>
              <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button className="flex-1" disabled={!step1Valid} onClick={() => setStep(2)}>
                Next — Add POCs <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
              <Button className="flex-1" onClick={handleCreate}>
                <Save className="w-3.5 h-3.5 mr-1.5" /> Create Program
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Edit Details Modal ────────────────────────────────────────────────────────

function EditDetailsModal({ prog, onSave, onClose }: {
  prog: Program
  onSave: (updates: Partial<Program>) => void
  onClose: () => void
}) {
  const [name, setName]       = useState(prog.name)
  const [org, setOrg]         = useState(prog.organization)
  const [type, setType]       = useState<ProgramType>(prog.type)
  const [startDate, setStart] = useState(prog.startDate)
  const [endDate, setEnd]     = useState(prog.endDate ?? "")
  const [summary, setSummary] = useState(prog.summary)
  const [details, setDetails] = useState(prog.details)
  const [beneficiary, setBen] = useState(prog.constraints.beneficiary)
  const [engagement, setEng]  = useState(prog.constraints.engagement)
  const [volunteer, setVol]   = useState(prog.constraints.volunteer)

  const handleSave = () => {
    onSave({
      name: name.trim(), organization: org.trim(), type, startDate,
      endDate: endDate.trim() || undefined,
      summary: summary.trim(), details: details.trim(),
      constraints: { beneficiary: beneficiary.trim(), engagement: engagement.trim(), volunteer: volunteer.trim() },
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-xl z-10">
          <h2 className="font-semibold text-gray-900">Edit Programme Details</h2>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Programme Name</label>
              <input className={inputCls} value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Sponsor Organisation</label>
              <input className={inputCls} value={org} onChange={e => setOrg(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Type</label>
              <select className={inputCls} value={type} onChange={e => setType(e.target.value as ProgramType)}>
                <option value="Mentoring">Mentoring</option>
                <option value="Projects">Projects</option>
                <option value="Both">Both (Mentoring + Projects)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Start Date</label>
              <input type="date" className={inputCls} value={startDate} onChange={e => setStart(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>End Date <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
              <input type="date" className={inputCls} value={endDate} onChange={e => setEnd(e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Summary <span className="text-gray-400 normal-case font-normal">(shown on card)</span></label>
            <input className={inputCls} value={summary} onChange={e => setSummary(e.target.value)} />
          </div>

          <div>
            <label className={labelCls}>Details</label>
            <textarea className={inputCls + " resize-none h-24"} value={details} onChange={e => setDetails(e.target.value)} />
          </div>

          <div className="space-y-3">
            <label className={labelCls}>Constraints</label>
            <div>
              <p className="text-xs text-gray-400 mb-1">Beneficiary</p>
              <input className={inputCls} value={beneficiary} onChange={e => setBen(e.target.value)} />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Engagement</p>
              <input className={inputCls} value={engagement} onChange={e => setEng(e.target.value)} />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Volunteer</p>
              <input className={inputCls} value={volunteer} onChange={e => setVol(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSave}><Save className="w-3.5 h-3.5 mr-1.5" />Save Changes</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Edit POCs Modal ───────────────────────────────────────────────────────────

function EditPOCsModal({ prog, onSave, onClose }: {
  prog: Program
  onSave: (pocs: ProgramPOC[]) => void
  onClose: () => void
}) {
  const [pocs, setPocs] = useState<ProgramPOC[]>(prog.pocs.map(p => ({ ...p })))

  const update = (i: number, field: keyof ProgramPOC, val: string | boolean) => {
    setPocs(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p))
  }
  const setMain = (i: number) => {
    setPocs(prev => prev.map((p, idx) => ({ ...p, isMain: idx === i })))
  }
  const remove = (i: number) => setPocs(prev => prev.filter((_, idx) => idx !== i))
  const addPoc = () => setPocs(prev => [...prev, { name: "", role: "", email: "", mobile: "", isMain: false }])

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-xl z-10">
          <h2 className="font-semibold text-gray-900">Edit Points of Contact</h2>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {pocs.map((poc, i) => (
            <div key={i} className={`rounded-xl border p-4 space-y-3 ${poc.isMain ? "border-cyan-300 bg-cyan-50/20" : "border-gray-200"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-gray-600">Contact {i + 1}</p>
                  {poc.isMain && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500 text-white">MAIN</span>}
                </div>
                <div className="flex items-center gap-1.5">
                  {!poc.isMain && (
                    <button onClick={() => setMain(i)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-cyan-600 border border-gray-200 hover:border-cyan-300 px-2 py-0.5 rounded transition-colors">
                      <Star className="w-3 h-3" /> Set Main
                    </button>
                  )}
                  <button onClick={() => remove(i)} className="text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Full Name</p>
                  <input className={inputCls} value={poc.name} onChange={e => update(i, "name", e.target.value)} placeholder="e.g. Arun Mehta" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Role / Title</p>
                  <input className={inputCls} value={poc.role} onChange={e => update(i, "role", e.target.value)} placeholder="e.g. Programme Director" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Email</p>
                  <input className={inputCls} type="email" value={poc.email} onChange={e => update(i, "email", e.target.value)} placeholder="name@org.com" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Mobile</p>
                  <input className={inputCls} value={poc.mobile} onChange={e => update(i, "mobile", e.target.value)} placeholder="+91-XXXXX-XXXXX" />
                </div>
              </div>
            </div>
          ))}
          <button onClick={addPoc}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-2 rounded-lg border border-dashed border-blue-300 hover:border-blue-400 w-full justify-center transition-colors">
            <Plus className="w-4 h-4" /> Add Contact
          </button>
        </div>
        <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={() => onSave(pocs)}><Save className="w-3.5 h-3.5 mr-1.5" />Save POCs</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Edit Meetings Modal ───────────────────────────────────────────────────────

function EditMeetingsModal({ prog, onSave, onClose }: {
  prog: Program
  onSave: (meetings: ProgramMeeting[]) => void
  onClose: () => void
}) {
  const [meetings, setMeetings] = useState<ProgramMeeting[]>(prog.meetings.map(m => ({ ...m })))

  const update = (i: number, field: keyof ProgramMeeting, val: string) => {
    setMeetings(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: val } : m))
  }
  const remove = (i: number) => setMeetings(prev => prev.filter((_, idx) => idx !== i))
  const addMeeting = () => setMeetings(prev => [...prev, {
    id: `M-${Date.now()}`, date: "", title: "", notes: "",
  }])

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-xl z-10">
          <h2 className="font-semibold text-gray-900">Edit Meetings</h2>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {meetings.length === 0 && (
            <p className="text-sm text-gray-400 italic text-center py-4">No meetings recorded yet. Add one below.</p>
          )}
          {meetings.map((m, i) => (
            <div key={m.id} className="rounded-xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-600">Meeting {i + 1}</p>
                <button onClick={() => remove(i)} className="text-gray-300 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Date</p>
                  <input type="date" className={inputCls} value={m.date} onChange={e => update(i, "date", e.target.value)} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Title</p>
                  <input className={inputCls} value={m.title} onChange={e => update(i, "title", e.target.value)} placeholder="e.g. Kick-off call" />
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 mb-1">Notes</p>
                  <textarea className={inputCls + " resize-none h-16"} value={m.notes}
                    onChange={e => update(i, "notes", e.target.value)} placeholder="Key outcomes, action items…" />
                </div>
              </div>
            </div>
          ))}
          <button onClick={addMeeting}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-2 rounded-lg border border-dashed border-blue-300 hover:border-blue-400 w-full justify-center transition-colors">
            <Plus className="w-4 h-4" /> Add Meeting
          </button>
        </div>
        <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={() => onSave(meetings)}><Save className="w-3.5 h-3.5 mr-1.5" />Save Meetings</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Program Slider ────────────────────────────────────────────────────────────

function ProgramSlider({ prog, onClose, onEditDetails, onEditPOCs, onEditMeetings, onClose_Program }: {
  prog: Program
  onClose: () => void
  onEditDetails: () => void
  onEditPOCs: () => void
  onEditMeetings: () => void
  onClose_Program: () => void
}) {
  const tc = TYPE_CFG[prog.type]

  return (
    <div className="w-[480px] shrink-0 border-l border-gray-200 bg-white flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-200 shrink-0">
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">{prog.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 mt-1 shrink-0 ml-3">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-3">{prog.organization}</p>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tc.cls}`}>{tc.label}</span>
          {prog.status === "Closed" && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">CLOSED</span>
          )}
        </div>
        <p className="text-sm mt-3">
          <span className="text-gray-500 font-medium">Start: </span>
          <span className="font-bold text-gray-900">{prog.startDate}</span>
          {prog.endDate && <span className="text-gray-400 ml-2">→ {prog.endDate}</span>}
        </p>
      </div>

      {/* Action buttons */}
      <div className="px-6 py-4 border-b border-gray-100 shrink-0">
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Edit Details",  icon: Pencil,       cls: "border-cyan-400 text-cyan-600 hover:bg-cyan-50",            onClick: onEditDetails },
            { label: "Edit POCs",     icon: Users,        cls: "border-cyan-400 text-cyan-600 hover:bg-cyan-50",            onClick: onEditPOCs },
            { label: "Edit Meetings", icon: CalendarDays, cls: "border-cyan-400 text-cyan-600 hover:bg-cyan-50",            onClick: onEditMeetings },
            { label: "Close Program", icon: X,            cls: "border-red-300 text-red-500 hover:bg-red-50 bg-red-50/30", onClick: onClose_Program },
          ].map(({ label, icon: Icon, cls, onClick }) => (
            <button key={label} onClick={onClick}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-[11px] font-semibold transition-colors ${cls}`}>
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Summary</p>
          <p className="text-base font-bold text-gray-900 leading-snug">{prog.summary}</p>
        </div>

        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Details</p>
          <p className="text-sm text-gray-600 leading-relaxed">{prog.details}</p>
        </div>

        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Constraints</p>
          <div className="space-y-3">
            {[
              { label: "Beneficiary", value: prog.constraints.beneficiary },
              { label: "Engagement",  value: prog.constraints.engagement  },
              { label: "Volunteer",   value: prog.constraints.volunteer   },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
                <p className="text-sm text-gray-600 italic">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Points of Contact</p>
          <div className="space-y-3">
            {prog.pocs.map((poc) => (
              <div key={poc.email}
                className={`rounded-xl border p-4 ${poc.isMain ? "border-cyan-300 bg-cyan-50/20" : "border-gray-200 bg-white"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-gray-900 text-sm">{poc.name}</p>
                  {poc.isMain && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500 text-white">MAIN</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 italic mb-3">{poc.role}</p>
                <div className="space-y-1.5 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-400"><Mail className="w-3 h-3" />Email</span>
                    <span className="font-medium">{poc.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-400"><Phone className="w-3 h-3" />Mobile</span>
                    <span className="font-medium">{poc.mobile}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Meetings */}
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Meetings</p>
          {prog.meetings.length === 0
            ? <p className="text-xs text-gray-400 italic">No meetings recorded.</p>
            : (
              <div className="space-y-3">
                {prog.meetings.map((m) => (
                  <div key={m.id} className="rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-semibold text-gray-900">{m.title}</p>
                      <span className="text-xs text-gray-400">{fmtDate(m.date)}</span>
                    </div>
                    {m.notes && <p className="text-xs text-gray-500 leading-relaxed">{m.notes}</p>}
                  </div>
                ))}
              </div>
            )
          }
        </div>

        {prog.linkedMenteeGroupIds.length > 0 && (
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Linked Mentee Groups</p>
            <div className="flex flex-wrap gap-1.5">
              {prog.linkedMenteeGroupIds.map(id => (
                <span key={id} className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">{id}</span>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">All mentees in these groups — and their requests — inherit this program.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Program Card ──────────────────────────────────────────────────────────────

function ProgramCard({ prog, isSelected, onClick }: {
  prog: Program
  isSelected: boolean
  onClick: () => void
}) {
  const tc = TYPE_CFG[prog.type]

  return (
    <div onClick={onClick}
      className={`bg-white rounded-xl border cursor-pointer transition-all p-5 space-y-3 ${
        isSelected ? "border-blue-300 shadow-sm ring-1 ring-blue-100" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
      }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-tight">{prog.name}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <Building2 className="w-3 h-3 text-gray-400 shrink-0" />
            <p className="text-xs text-gray-500 truncate">{prog.organization}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tc.cls}`}>{tc.label}</span>
          {prog.status === "Closed"
            ? <span className="flex items-center gap-1 text-[10px] text-gray-400"><XCircle className="w-3 h-3" />Closed</span>
            : <span className="flex items-center gap-1 text-[10px] text-green-600"><CheckCircle2 className="w-3 h-3" />Active</span>
          }
        </div>
      </div>
      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{prog.summary}</p>
      <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-gray-100">
        <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />Started {fmtDate(prog.startDate)}</span>
        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{prog.linkedMenteeGroupIds.length} group{prog.linkedMenteeGroupIds.length !== 1 ? "s" : ""}</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

type ModalType = "details" | "pocs" | "meetings" | null

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>(mockPrograms)
  const [selected, setSelected] = useState<Program | null>(null)
  const [modal, setModal] = useState<ModalType>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [search, setSearch] = useState("")
  const [fType, setFType] = useState<ProgramType | "All">("All")
  const [fStatus, setFStatus] = useState<ProgramStatus | "All">("All")

  const stats = {
    total:     programs.length,
    active:    programs.filter(p => p.status === "Active").length,
    mentoring: programs.filter(p => p.type === "Mentoring" || p.type === "Both").length,
    projects:  programs.filter(p => p.type === "Projects"  || p.type === "Both").length,
  }

  const filtered = useMemo(() => programs.filter(p => {
    const q = search.toLowerCase()
    return (
      (p.name.toLowerCase().includes(q) || p.organization.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q)) &&
      (fType === "All" || p.type === fType) &&
      (fStatus === "All" || p.status === fStatus)
    )
  }), [programs, search, fType, fStatus])

  // Save helper — updates programs array and keeps selected in sync
  const saveToSelected = (updates: Partial<Program>) => {
    if (!selected) return
    const updated = { ...selected, ...updates }
    setPrograms(prev => prev.map(p => p.id === selected.id ? updated : p))
    setSelected(updated)
    setModal(null)
  }

  const closeProgram = () => {
    if (!selected) return
    saveToSelected({ status: "Closed" })
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 p-6 space-y-5 overflow-auto min-w-0">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Programs</h1>
            <p className="text-sm text-gray-500 mt-0.5">Sponsorship & engagement programs — mentee groups and requests inherit program membership</p>
          </div>
          <button onClick={() => setShowNewModal(true)} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> New Program
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Programs", value: stats.total,     color: "text-gray-900"   },
            { label: "Active",         value: stats.active,    color: "text-green-600"  },
            { label: "With Mentoring", value: stats.mentoring, color: "text-purple-600" },
            { label: "With Projects",  value: stats.projects,  color: "text-blue-600"   },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex flex-col gap-1 flex-1 min-w-48">
            <label className="text-xs font-medium text-gray-500">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
              <Input placeholder="Search by name, org, summary…" className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Type</label>
            <div className="flex gap-1.5">
              {(["All", "Mentoring", "Projects", "Both"] as const).map(t => (
                <button key={t} onClick={() => setFType(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${fType === t ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Status</label>
            <div className="flex gap-1.5">
              {(["All", "Active", "Closed"] as const).map(s => (
                <button key={s} onClick={() => setFStatus(s as ProgramStatus | "All")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${fStatus === s ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 -mt-2">{filtered.length} program{filtered.length !== 1 ? "s" : ""}</p>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Layers className="w-8 h-8 mb-2 text-gray-300" />
            <p className="text-sm">No programs match your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filtered.map(p => (
              <ProgramCard key={p.id} prog={p}
                isSelected={selected?.id === p.id}
                onClick={() => setSelected(selected?.id === p.id ? null : p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Slider */}
      {selected && (
        <ProgramSlider
          prog={selected}
          onClose={() => setSelected(null)}
          onEditDetails={() => setModal("details")}
          onEditPOCs={() => setModal("pocs")}
          onEditMeetings={() => setModal("meetings")}
          onClose_Program={closeProgram}
        />
      )}

      {/* Modals */}
      {modal === "details" && selected && (
        <EditDetailsModal prog={selected} onSave={saveToSelected} onClose={() => setModal(null)} />
      )}
      {modal === "pocs" && selected && (
        <EditPOCsModal prog={selected} onSave={pocs => saveToSelected({ pocs })} onClose={() => setModal(null)} />
      )}
      {modal === "meetings" && selected && (
        <EditMeetingsModal prog={selected} onSave={meetings => saveToSelected({ meetings })} onClose={() => setModal(null)} />
      )}
      {showNewModal && (
        <NewProgramModal
          onSave={prog => {
            setPrograms(prev => [prog, ...prev])
            setSelected(prog)
            setShowNewModal(false)
          }}
          onClose={() => setShowNewModal(false)}
        />
      )}
    </div>
  )
}
