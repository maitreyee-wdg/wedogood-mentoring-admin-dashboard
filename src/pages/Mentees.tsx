import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { mockMentees, ngoGroups, type Mentee, type EngagementStatus } from "@/data/menteesData"
import { mockRequests, ACTIVE_STATUSES, type MentoringRequest } from "@/data/requestsData"
import {
  Search, Plus, X, Users, MapPin, BookOpen, Globe, Target,
  Phone, Mail, Link, Star, Briefcase, GraduationCap, FileText,
} from "lucide-react"

// ── badge helpers ─────────────────────────────────────────────────────────────

const statusVariant: Record<EngagementStatus, "success" | "warning" | "secondary" | "outline"> = {
  "Active": "success",
  "Pending Match": "warning",
  "Closed": "secondary",
  "On Hold": "outline",
}

const ngoColor: Record<string, string> = {
  "Akanksha Foundation": "bg-blue-100 text-blue-700",
  "NavGurukul": "bg-green-100 text-green-700",
  "Parivarthan": "bg-purple-100 text-purple-700",
}

function StarDisplay({ value }: { value: number }) {
  if (!value) return <span className="text-xs text-gray-400 italic">Unrated</span>
  return (
    <span className="flex items-center gap-1">
      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
      <span className="text-xs font-medium text-gray-700">{value.toFixed(1)}</span>
    </span>
  )
}

// ── Profile Pane ─────────────────────────────────────────────────────────────

function MenteePane({ mentee, onClose }: { mentee: Mentee; onClose: () => void }) {
  const [tab, setTab] = useState<"profile" | "requests">("profile")

  const menteeRequests = mockRequests.filter((r) => r.menteeId === mentee.id)
  const activeReqs = menteeRequests.filter((r) => ACTIVE_STATUSES.includes(r.status))
  const pastReqs = menteeRequests.filter((r) => !ACTIVE_STATUSES.includes(r.status))

  return (
    <div className="w-[420px] border-l border-gray-200 bg-white flex flex-col overflow-hidden shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
        <p className="font-semibold text-gray-900 text-sm">Mentee Profile</p>
        <div className="flex items-center gap-2">
          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">Edit</button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Avatar + Name */}
      <div className="px-5 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold shrink-0">
            {mentee.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900">{mentee.name}</p>
            <p className="text-xs text-gray-500">{mentee.id} · {mentee.gender} · Age {mentee.age}</p>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <Badge variant={statusVariant[mentee.engagementStatus]}>{mentee.engagementStatus}</Badge>
              {mentee.isStudent && <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Student</span>}
              <StarDisplay value={mentee.rating} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 shrink-0">
        {(["profile", "requests"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-medium capitalize ${tab === t ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
            {t}{t === "requests" ? ` (${menteeRequests.length})` : ""}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-sm">

        {/* ── PROFILE TAB ── */}
        {tab === "profile" && (
          <>
            <PaneSection label="NGO & Group">
              <div className="flex flex-col gap-1">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${ngoColor[mentee.ngo] ?? "bg-gray-100 text-gray-700"}`}>{mentee.ngo}</span>
                <span className="text-xs text-gray-600">{mentee.group}</span>
              </div>
            </PaneSection>

            <PaneSection label="Current Role">
              <div className="flex items-start gap-2">
                <Briefcase className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-900 font-medium">{mentee.currentRole}</p>
                  {mentee.currentCompany !== "—" && <p className="text-gray-500 text-xs">{mentee.currentCompany} · {mentee.totalYearsExp} yr{mentee.totalYearsExp !== 1 ? "s" : ""} exp</p>}
                </div>
              </div>
            </PaneSection>

            {mentee.pastExperience.length > 0 && (
              <PaneSection label="Past Experience">
                <div className="space-y-2">
                  {mentee.pastExperience.map((e, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-gray-800 font-medium text-xs">{e.role}</p>
                        <p className="text-gray-500 text-xs">{e.company} · {e.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </PaneSection>
            )}

            <PaneSection label="Education">
              <div className="flex items-start gap-2">
                <GraduationCap className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-900 font-medium">{mentee.education.degree}</p>
                  <p className="text-gray-500 text-xs">{mentee.education.institute}</p>
                  <p className="text-gray-400 text-xs">{mentee.education.level} · {mentee.education.yearOfGraduation}</p>
                </div>
              </div>
            </PaneSection>

            {mentee.skills.length > 0 && (
              <PaneSection label="Skills">
                <div className="flex flex-wrap gap-1.5">
                  {mentee.skills.map((s) => (
                    <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </PaneSection>
            )}

            <PaneSection label="Goals">
              <div className="flex flex-wrap gap-1.5">
                {mentee.goals.map((g) => (
                  <span key={g} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{g}</span>
                ))}
              </div>
            </PaneSection>

            <PaneSection label="Scoped Need">
              <div className="flex items-start gap-2">
                <Target className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-700">{mentee.scopedNeed}</p>
                  {!mentee.knowsTheirNeed && (
                    <p className="text-xs text-amber-600 mt-0.5">⚠ Needs scoping — share options based on goals</p>
                  )}
                </div>
              </div>
            </PaneSection>

            <PaneSection label="Location & Language">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-700">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />{mentee.location}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-700">
                  <Globe className="w-3.5 h-3.5 text-gray-400" />{mentee.language}
                </div>
              </div>
            </PaneSection>

            <PaneSection label="Contact">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-700"><Phone className="w-3.5 h-3.5 text-gray-400" />{mentee.whatsapp}</div>
                <div className="flex items-center gap-2 text-xs text-gray-700"><Mail className="w-3.5 h-3.5 text-gray-400" />{mentee.email}</div>
                {mentee.linkedin !== "—" && (
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <Link className="w-3.5 h-3.5" />
                    <a href={`https://${mentee.linkedin}`} target="_blank" rel="noreferrer" className="hover:underline truncate">{mentee.linkedin}</a>
                  </div>
                )}
                {mentee.resume ? (
                  <div className="flex items-center gap-2 text-xs text-blue-600"><FileText className="w-3.5 h-3.5" /><a href={mentee.resume} target="_blank" rel="noreferrer" className="hover:underline">View Resume</a></div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-gray-400"><FileText className="w-3.5 h-3.5" />Resume not uploaded</div>
                )}
              </div>
            </PaneSection>

            <PaneSection label="Requests Summary">
              <div className="flex gap-4 text-xs">
                <div>
                  <p className="text-gray-400">Total</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{menteeRequests.length}</p>
                </div>
                <div>
                  <p className="text-gray-400">Active</p>
                  <p className="font-semibold text-blue-600 mt-0.5">{activeReqs.length}</p>
                </div>
                <div>
                  <p className="text-gray-400">Past</p>
                  <p className="font-semibold text-gray-500 mt-0.5">{pastReqs.length}</p>
                </div>
              </div>
            </PaneSection>

            <PaneSection label="Joined">
              <p className="text-xs text-gray-700">{new Date(mentee.joinedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
            </PaneSection>
          </>
        )}

        {/* ── REQUESTS TAB ── */}
        {tab === "requests" && (
          <>
            {activeReqs.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Active Requests</p>
                <div className="space-y-2">
                  {activeReqs.map((r) => <RequestCard key={r.id} req={r} />)}
                </div>
              </div>
            )}

            {pastReqs.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 mt-4">Past Requests</p>
                <div className="space-y-2">
                  {pastReqs.map((r) => <RequestCard key={r.id} req={r} />)}
                </div>
              </div>
            )}

            {menteeRequests.length === 0 && (
              <p className="text-sm text-gray-400 italic text-center py-8">No requests yet</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function RequestCard({ req }: { req: MentoringRequest }) {
  const statusColor: Record<string, string> = {
    "Draft": "bg-gray-100 text-gray-600",
    "New": "bg-blue-100 text-blue-700",
    "Match Approval Pending": "bg-amber-100 text-amber-700",
    "Mentor Response Pending": "bg-yellow-100 text-yellow-700",
    "No Match Found": "bg-red-100 text-red-600",
    "Matched": "bg-green-100 text-green-700",
    "Closed - Feedback Pending": "bg-gray-100 text-gray-500",
    "Expired": "bg-gray-100 text-gray-400",
    "Closed - With Feedback": "bg-green-50 text-green-600",
  }
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-gray-500">{req.id}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[req.status]}`}>{req.status}</span>
      </div>
      <p className="text-xs font-medium text-gray-800 leading-snug">{req.theme}</p>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>{new Date(req.requestDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
        {req.matchedMentor && <><span>·</span><span className="text-gray-700">👤 {req.matchedMentor}</span></>}
      </div>
      {req.skillsNeeded.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-0.5">
          {req.skillsNeeded.slice(0, 3).map((s) => (
            <span key={s} className="text-xs bg-white border border-gray-200 text-gray-600 px-1.5 py-0.5 rounded">{s}</span>
          ))}
          {req.skillsNeeded.length > 3 && <span className="text-xs text-gray-400">+{req.skillsNeeded.length - 3}</span>}
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

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Mentees() {
  const [mentees] = useState<Mentee[]>(mockMentees)
  const [search, setSearch] = useState("")
  const [filterNGO, setFilterNGO] = useState("All")
  const [filterStatus, setFilterStatus] = useState("All")
  const [filterGender, setFilterGender] = useState("All")
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null)

  const filtered = useMemo(() => mentees.filter((m) => {
    const q = search.toLowerCase()
    const matchSearch =
      m.name.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      m.location.toLowerCase().includes(q) ||
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
      {/* Main */}
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Mentees</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage end users across all NGO partners</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Upload CSV</Button>
            <Button><Plus className="w-4 h-4" />Add Mentee</Button>
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
              <Input placeholder="Search by name, ID, skill, need…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
              ) : filtered.map((m) => (
                <tr key={m.id} className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedMentee?.id === m.id ? "bg-blue-50" : ""}`}
                  onClick={() => setSelectedMentee(selectedMentee?.id === m.id ? null : m)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold shrink-0">
                        {m.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{m.name}</p>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Pane */}
      {selectedMentee && (
        <MenteePane mentee={selectedMentee} onClose={() => setSelectedMentee(null)} />
      )}
    </div>
  )
}
