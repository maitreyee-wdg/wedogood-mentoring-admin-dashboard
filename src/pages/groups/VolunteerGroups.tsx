import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mockVolunteerGroups, type VolunteerGroup, type GroupMeeting } from "@/data/groupsData"
import { Search, Plus, X, Pencil, Check, CalendarPlus, Building2, Users, Phone, Mail } from "lucide-react"

// ── Add/Edit Group Modal ──────────────────────────────────────────────────────

function GroupModal({ group, onSave, onClose }: {
  group?: VolunteerGroup; onSave: (g: Omit<VolunteerGroup, "id" | "meetings">) => void; onClose: () => void
}) {
  const [name, setName] = useState(group?.name ?? "")
  const [org, setOrg] = useState(group?.organizationName ?? "")
  const [interests, setInterests] = useState<VolunteerGroup["interestAreas"]>(group?.interestAreas ?? [])
  const [pocName, setPocName] = useState(group?.poc.name ?? "")
  const [pocEmail, setPocEmail] = useState(group?.poc.email ?? "")
  const [pocContact, setPocContact] = useState(group?.poc.contact ?? "")
  const [details, setDetails] = useState(group?.additionalDetails ?? "")

  const toggleInterest = (val: "Mentoring" | "Projects" | "Both") => {
    setInterests((prev) => prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val])
  }

  const handleSave = () => {
    if (!name || !org) return
    onSave({ name, organizationName: org, interestAreas: interests, poc: { name: pocName, email: pocEmail, contact: pocContact }, status: "Active", additionalDetails: details || undefined, memberCount: group?.memberCount ?? 0 })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[480px] max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">{group ? "Edit Group" : "Add Volunteer Group"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">GROUP NAME *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Technology" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">ORGANISATION NAME *</label>
              <Input value={org} onChange={(e) => setOrg(e.target.value)} placeholder="e.g. Google" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-2">INTEREST AREAS</label>
            <div className="flex gap-2">
              {(["Mentoring", "Projects", "Both"] as const).map((val) => (
                <button key={val} onClick={() => toggleInterest(val)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${interests.includes(val) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>
                  {val}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-2">POINT OF CONTACT</label>
            <div className="space-y-2">
              <Input value={pocName} onChange={(e) => setPocName(e.target.value)} placeholder="POC Name" />
              <Input value={pocEmail} onChange={(e) => setPocEmail(e.target.value)} placeholder="POC Email" />
              <Input value={pocContact} onChange={(e) => setPocContact(e.target.value)} placeholder="POC Phone" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">ADDITIONAL DETAILS</label>
            <textarea className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 resize-none h-20" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Brief description of this group…" />
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSave}>{group ? "Save Changes" : "Create Group"}</Button>
        </div>
      </div>
    </div>
  )
}

// ── Log Meeting Modal ─────────────────────────────────────────────────────────

function LogMeetingModal({ groupName, onSave, onClose }: {
  groupName: string; onSave: (m: Omit<GroupMeeting, "id">) => void; onClose: () => void
}) {
  const [date, setDate] = useState("")
  const [details, setDetails] = useState("")
  const [poc, setPoc] = useState("")
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-96 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 text-sm">Log Meeting</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-xs text-gray-500 mb-4">Group: <strong>{groupName}</strong></p>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">DATE *</label>
            <input type="date" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">MEETING DETAILS *</label>
            <textarea className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 resize-none h-24" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="What was discussed…" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">GROUP POC</label>
            <Input value={poc} onChange={(e) => setPoc(e.target.value)} placeholder="POC Name" />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={() => date && details && onSave({ date, details, poc })}>Log Meeting</Button>
        </div>
      </div>
    </div>
  )
}

// ── Side Pane ─────────────────────────────────────────────────────────────────

function GroupPane({ group, onClose, onSave, onLogMeeting }: {
  group: VolunteerGroup
  onClose: () => void
  onSave: (g: VolunteerGroup) => void
  onLogMeeting: () => void
}) {
  const [mode, setMode] = useState<"view" | "edit">("view")
  const [data, setData] = useState<VolunteerGroup>({ ...group })

  const set = (field: keyof VolunteerGroup, val: unknown) => setData((d) => ({ ...d, [field]: val }))
  const setPoc = (field: "name" | "email" | "contact", val: string) => setData((d) => ({ ...d, poc: { ...d.poc, [field]: val } }))

  const handleSave = () => { onSave(data); setMode("view") }
  const v = mode === "edit" ? data : group

  const interestColor = (ia: string) =>
    ia === "Mentoring" ? "bg-blue-50 text-blue-700" : ia === "Projects" ? "bg-purple-50 text-purple-700" : "bg-green-50 text-green-700"

  return (
    <div className="w-96 border-l border-gray-200 bg-white flex flex-col overflow-hidden shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
        <p className="font-semibold text-gray-900 text-sm">Group Details</p>
        <div className="flex items-center gap-2">
          {mode === "view" && (
            <button onClick={() => setMode("edit")} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
              <Pencil className="w-3 h-3" /> Edit
            </button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Group name + org */}
      <div className="px-5 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-base font-bold shrink-0">
            {group.name[0]}
          </div>
          <div>
            {mode === "edit" ? (
              <input className="text-sm font-semibold text-gray-900 border-b border-blue-300 outline-none bg-transparent w-full" value={data.name} onChange={(e) => set("name", e.target.value)} />
            ) : (
              <p className="font-semibold text-gray-900">{v.name}</p>
            )}
            <p className="text-xs text-gray-500">{v.organizationName}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge variant={v.status === "Active" ? "success" : "secondary"}>{v.status}</Badge>
              <span className="text-xs text-gray-400">{v.memberCount} members</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-sm">
        <Section label="Interest Areas">
          {mode === "edit" ? (
            <div className="flex gap-2">
              {(["Mentoring", "Projects", "Both"] as const).map((val) => (
                <button key={val} onClick={() => set("interestAreas", data.interestAreas.includes(val) ? data.interestAreas.filter((x) => x !== val) : [...data.interestAreas, val])}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${data.interestAreas.includes(val) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"}`}>
                  {val}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {v.interestAreas.map((ia) => (
                <span key={ia} className={`text-xs px-2 py-0.5 rounded-full font-medium ${interestColor(ia)}`}>{ia}</span>
              ))}
            </div>
          )}
        </Section>

        <Section label="Point of Contact">
          {mode === "edit" ? (
            <div className="space-y-1.5">
              <div><label className="text-xs text-gray-500 block mb-0.5">Name</label><input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" placeholder="e.g. Priya Sharma" value={data.poc.name} onChange={(e) => setPoc("name", e.target.value)} /></div>
              <div><label className="text-xs text-gray-500 block mb-0.5">Email</label><input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" placeholder="e.g. priya@org.com" value={data.poc.email} onChange={(e) => setPoc("email", e.target.value)} /></div>
              <div><label className="text-xs text-gray-500 block mb-0.5">Phone</label><input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" placeholder="e.g. +91 9876543210" value={data.poc.contact} onChange={(e) => setPoc("contact", e.target.value)} /></div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-800">{v.poc.name}</p>
              <div className="flex items-center gap-2 text-xs text-gray-600"><Mail className="w-3.5 h-3.5 text-gray-400" />{v.poc.email}</div>
              <div className="flex items-center gap-2 text-xs text-gray-600"><Phone className="w-3.5 h-3.5 text-gray-400" />{v.poc.contact}</div>
            </div>
          )}
        </Section>

        {v.additionalDetails && (
          <Section label="Additional Details">
            {mode === "edit" ? (
              <textarea className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-blue-400 resize-none h-16" value={data.additionalDetails ?? ""} onChange={(e) => set("additionalDetails", e.target.value)} />
            ) : (
              <p className="text-xs text-gray-700">{v.additionalDetails}</p>
            )}
          </Section>
        )}

        <Section label={`Meetings (${v.meetings.length})`}>
          <button onClick={onLogMeeting} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium mb-3">
            <CalendarPlus className="w-3.5 h-3.5" />Log meeting
          </button>
          {v.meetings.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No meetings logged yet</p>
          ) : (
            <div className="space-y-3">
              {[...v.meetings].sort((a, b) => b.date.localeCompare(a.date)).map((m) => (
                <div key={m.id} className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-gray-700">{new Date(m.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                    <p className="text-xs text-gray-400">{m.poc}</p>
                  </div>
                  <p className="text-xs text-gray-600">{m.details}</p>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* Footer */}
      {mode === "edit" ? (
        <div className="px-5 py-4 border-t border-gray-100 flex gap-2 shrink-0">
          <Button size="sm" className="flex-1" onClick={handleSave}><Check className="w-3.5 h-3.5" />Save</Button>
          <Button size="sm" variant="outline" onClick={() => { setData({ ...group }); setMode("view") }}>Cancel</Button>
        </div>
      ) : (
        <div className="px-5 py-4 border-t border-gray-100 flex gap-2 shrink-0">
          <Button size="sm" className="flex-1" onClick={() => setMode("edit")}><Pencil className="w-3.5 h-3.5" />Edit Group</Button>
          <Button size="sm" variant="outline" onClick={onLogMeeting}><CalendarPlus className="w-3.5 h-3.5" /></Button>
        </div>
      )}
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">{label}</p>
      {children}
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function VolunteerGroups() {
  const [groups, setGroups] = useState<VolunteerGroup[]>(mockVolunteerGroups)
  const [search, setSearch] = useState("")
  const [filterInterest, setFilterInterest] = useState("All")
  const [filterStatus, setFilterStatus] = useState("All")
  const [selectedGroup, setSelectedGroup] = useState<VolunteerGroup | null>(null)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState<VolunteerGroup | undefined>()
  const [logMeetingFor, setLogMeetingFor] = useState<VolunteerGroup | null>(null)

  const filtered = groups.filter((g) => {
    const q = search.toLowerCase()
    return (
      (g.name.toLowerCase().includes(q) || g.organizationName.toLowerCase().includes(q)) &&
      (filterInterest === "All" || g.interestAreas.includes(filterInterest as "Mentoring" | "Projects" | "Both")) &&
      (filterStatus === "All" || g.status === filterStatus)
    )
  })

  const handleAddGroup = (data: Omit<VolunteerGroup, "id" | "meetings">) => {
    setGroups((p) => [...p, { ...data, id: `VG-${Date.now()}`, meetings: [] }])
    setShowGroupModal(false)
  }

  const handleSaveGroup = (updated: VolunteerGroup) => {
    setGroups((p) => p.map((g) => g.id === updated.id ? updated : g))
    setSelectedGroup(updated)
  }

  const handleLogMeeting = (meeting: Omit<GroupMeeting, "id">) => {
    if (!logMeetingFor) return
    const newMeeting: GroupMeeting = { ...meeting, id: `M-${Date.now()}` }
    setGroups((p) => p.map((g) => g.id === logMeetingFor.id ? { ...g, meetings: [...g.meetings, newMeeting] } : g))
    if (selectedGroup?.id === logMeetingFor.id) setSelectedGroup((g) => g ? { ...g, meetings: [...g.meetings, newMeeting] } : null)
    setLogMeetingFor(null)
  }

  const interestColor = (ia: string) =>
    ia === "Mentoring" ? "bg-blue-50 text-blue-700" : ia === "Projects" ? "bg-purple-50 text-purple-700" : "bg-green-50 text-green-700"

  return (
    <div className="flex h-full">
      <div className="flex-1 p-6 space-y-5 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Volunteer Groups</h1>
            <p className="text-sm text-gray-500 mt-0.5">Source groups for volunteer mentors</p>
          </div>
          <Button size="sm" onClick={() => { setEditingGroup(undefined); setShowGroupModal(true) }}>
            <Plus className="w-4 h-4" />Add Group
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Groups", value: groups.length, color: "text-gray-900" },
            { label: "Active", value: groups.filter((g) => g.status === "Active").length, color: "text-green-600" },
            { label: "Total Members", value: groups.reduce((s, g) => s + g.memberCount, 0), color: "text-blue-600" },
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
              <Input placeholder="Search group or organisation…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Interest Area</label>
            <select value={filterInterest} onChange={(e) => setFilterInterest(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white w-36">
              <option>All</option>
              <option>Mentoring</option>
              <option>Projects</option>
              <option>Both</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white w-28">
              <option>All</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Group Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Organisation</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Interest Areas</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">POC</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Members</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Meetings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No groups found</td></tr>
              ) : filtered.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedGroup(g)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0">{g.name[0]}</div>
                      <span className="font-medium text-gray-900">{g.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" />{g.organizationName}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {g.interestAreas.map((ia) => (
                        <span key={ia} className={`text-xs px-2 py-0.5 rounded-full font-medium ${interestColor(ia)}`}>{ia}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{g.poc.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Users className="w-3.5 h-3.5 text-gray-400" />{g.memberCount}
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant={g.status === "Active" ? "success" : "secondary"}>{g.status}</Badge></td>
                  <td className="px-4 py-3 text-xs text-gray-500">{g.meetings.length} logged</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side pane */}
      {selectedGroup && (
        <GroupPane
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
          onSave={handleSaveGroup}
          onLogMeeting={() => setLogMeetingFor(selectedGroup)}
        />
      )}

      {showGroupModal && (
        <GroupModal group={editingGroup} onSave={handleAddGroup} onClose={() => setShowGroupModal(false)} />
      )}

      {logMeetingFor && (
        <LogMeetingModal groupName={logMeetingFor.name} onSave={handleLogMeeting} onClose={() => setLogMeetingFor(null)} />
      )}
    </div>
  )
}
