import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { mockMentees, ngoGroups, type Mentee, type EngagementStatus } from "@/data/menteesData"
import {
  Search, Plus, X, ChevronRight, Users,
  MapPin, BookOpen, Globe, Target, Phone,
} from "lucide-react"

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

export default function Mentees() {
  const [mentees] = useState<Mentee[]>(mockMentees)
  const [search, setSearch] = useState("")
  const [filterNGO, setFilterNGO] = useState("All")
  const [filterStatus, setFilterStatus] = useState("All")
  const [filterGender, setFilterGender] = useState("All")
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null)

  const filtered = mentees.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase()) ||
      m.location.toLowerCase().includes(search.toLowerCase()) ||
      m.scopedNeed.toLowerCase().includes(search.toLowerCase())
    const matchesNGO = filterNGO === "All" || m.ngo === filterNGO
    const matchesStatus = filterStatus === "All" || m.engagementStatus === filterStatus
    const matchesGender = filterGender === "All" || m.gender === filterGender
    return matchesSearch && matchesNGO && matchesStatus && matchesGender
  })

  const stats = {
    total: mentees.length,
    active: mentees.filter((m) => m.engagementStatus === "Active").length,
    pending: mentees.filter((m) => m.engagementStatus === "Pending Match").length,
    knowsNeed: mentees.filter((m) => m.knowsTheirNeed).length,
  }

  return (
    <div className="flex h-full">
      {/* Main content */}
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Mentees</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage end users across all NGO partners</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              Upload CSV
            </Button>
            <Button>
              <Plus className="w-4 h-4" />
              Add Mentee
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

        {/* NGO Groups */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">NGO Groups</p>
          <div className="flex gap-3">
            {ngoGroups.map((g) => (
              <button
                key={g.id}
                onClick={() => setFilterNGO(filterNGO === g.name ? "All" : g.name)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  filterNGO === g.name
                    ? "border-blue-400 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                {g.name}
                <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">{g.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, ID, location, need..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filterNGO} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterNGO(e.target.value)} className="w-44">
            <option>All</option>
            <option>Akanksha Foundation</option>
            <option>NavGurukul</option>
            <option>Parivarthan</option>
          </Select>
          <Select value={filterStatus} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)} className="w-40">
            <option>All</option>
            <option>Active</option>
            <option>Pending Match</option>
            <option>On Hold</option>
            <option>Closed</option>
          </Select>
          <Select value={filterGender} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterGender(e.target.value)} className="w-32">
            <option>All</option>
            <option>Female</option>
            <option>Male</option>
            <option>Other</option>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Mentee</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">NGO</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Education</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Location</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Scoped Need</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Mentor</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    No mentees match your filters
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedMentee(m)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold shrink-0">
                          {m.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{m.name}</p>
                          <p className="text-xs text-gray-400">{m.id} · {m.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ngoColor[m.ngo] ?? "bg-gray-100 text-gray-700"}`}>
                        {m.ngo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{m.educationLevel}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{m.location}</td>
                    <td className="px-4 py-3">
                      <p className="text-gray-800 text-xs max-w-36 truncate">{m.scopedNeed}</p>
                      {!m.knowsTheirNeed && (
                        <span className="text-xs text-amber-600 italic">Needs scoping</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {m.assignedMentor
                        ? <span className="text-gray-900">{m.assignedMentor}</span>
                        : <span className="text-gray-400 italic">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[m.engagementStatus]}>
                        {m.engagementStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Drawer */}
      {selectedMentee && (
        <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto flex flex-col">
          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <p className="font-semibold text-gray-900 text-sm">Mentee Profile</p>
            <button onClick={() => setSelectedMentee(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Avatar + name */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold">
              {selectedMentee.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{selectedMentee.name}</p>
              <p className="text-xs text-gray-500">{selectedMentee.id} · {selectedMentee.gender}</p>
              <Badge variant={statusVariant[selectedMentee.engagementStatus]} className="mt-1">
                {selectedMentee.engagementStatus}
              </Badge>
            </div>
          </div>

          {/* Details */}
          <div className="px-5 py-4 space-y-4 text-sm">
            <Section label="NGO Partner">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ngoColor[selectedMentee.ngo] ?? "bg-gray-100 text-gray-700"}`}>
                {selectedMentee.ngo}
              </span>
            </Section>

            <Section label="Contact">
              <div className="flex items-center gap-1.5 text-gray-700">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                {selectedMentee.phone ?? "—"}
              </div>
            </Section>

            <Section label="Education">
              <div className="flex items-center gap-1.5 text-gray-700">
                <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                {selectedMentee.educationLevel}
              </div>
            </Section>

            <Section label="Location">
              <div className="flex items-center gap-1.5 text-gray-700">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {selectedMentee.location}
              </div>
            </Section>

            <Section label="Language">
              <div className="flex items-center gap-1.5 text-gray-700">
                <Globe className="w-3.5 h-3.5 text-gray-400" />
                {selectedMentee.language}
              </div>
            </Section>

            <Section label="Goals">
              <div className="flex flex-wrap gap-1">
                {selectedMentee.goals.map((g) => (
                  <span key={g} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{g}</span>
                ))}
              </div>
            </Section>

            <Section label="Scoped Need">
              <div className="flex items-start gap-1.5">
                <Target className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-700">{selectedMentee.scopedNeed}</p>
                  {!selectedMentee.knowsTheirNeed && (
                    <p className="text-xs text-amber-600 mt-0.5">⚠ Needs scoping — share options based on goals</p>
                  )}
                </div>
              </div>
            </Section>

            <Section label="Assigned Mentor">
              {selectedMentee.assignedMentor
                ? <p className="text-gray-700">{selectedMentee.assignedMentor}</p>
                : <p className="text-gray-400 italic text-xs">No mentor assigned</p>}
            </Section>

            <Section label="Joined">
              <p className="text-gray-700">{new Date(selectedMentee.joinedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
            </Section>
          </div>

          {/* Actions */}
          <div className="mt-auto px-5 py-4 border-t border-gray-100 space-y-2">
            <Button className="w-full" size="sm">Edit Profile</Button>
            <Button variant="outline" className="w-full" size="sm">View Engagement</Button>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      {children}
    </div>
  )
}
