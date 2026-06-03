import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mockMenteeGroups, type MenteeGroup, type GroupMeeting } from "@/data/groupsData"
import { Search, Plus, X, Pencil, Check, CalendarPlus, Users, Phone, Mail } from "lucide-react"

const ngoColor: Record<string, string> = {
  "Akanksha Foundation": "bg-blue-100 text-blue-700",
  "NavGurukul": "bg-green-100 text-green-700",
  "Parivarthan": "bg-purple-100 text-purple-700",
}

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

function AddGroupModal({ onSave, onClose }: { onSave: (g: Omit<MenteeGroup, "id" | "meetings">) => void; onClose: () => void }) {
  const [name, setName] = useState("")
  const [ngo, setNgo] = useState<MenteeGroup["ngo"]>("Akanksha Foundation")
  const [pocName, setPocName] = useState("")
  const [pocEmail, setPocEmail] = useState("")
  const [pocContact, setPocContact] = useState("")
  const [description, setDescription] = useState("")
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[420px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Add Mentee Group</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">GROUP NAME *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Akanksha — Batch 2026" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">NGO PARTNER *</label>
            <select value={ngo} onChange={(e) => setNgo(e.target.value as MenteeGroup["ngo"])} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white">
              <option>Akanksha Foundation</option>
              <option>NavGurukul</option>
              <option>Parivarthan</option>
            </select>
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
            <label className="text-xs font-medium text-gray-500 block mb-1">DESCRIPTION</label>
            <textarea className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 resize-none h-16" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description…" />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={() => name && onSave({ name, ngo, poc: { name: pocName, email: pocEmail, contact: pocContact }, memberCount: 0, status: "Active", description: description || undefined })}>Create Group</Button>
        </div>
      </div>
    </div>
  )
}

function GroupPane({ group, onClose, onSave, onLogMeeting }: {
  group: MenteeGroup; onClose: () => void; onSave: (g: MenteeGroup) => void; onLogMeeting: () => void
}) {
  const [mode, setMode] = useState<"view" | "edit">("view")
  const [data, setData] = useState<MenteeGroup>({ ...group })
  const set = (field: keyof MenteeGroup, val: unknown) => setData((d) => ({ ...d, [field]: val }))
  const setPoc = (field: "name" | "email" | "contact", val: string) => setData((d) => ({ ...d, poc: { ...d.poc, [field]: val } }))
  const v = mode === "edit" ? data : group

  return (
    <div className="w-96 border-l border-gray-200 bg-white flex flex-col overflow-hidden shrink-0">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
        <p className="font-semibold text-gray-900 text-sm">Group Details</p>
        <div className="flex items-center gap-2">
          {mode === "view" && <button onClick={() => setMode("edit")} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"><Pencil className="w-3 h-3" /> Edit</button>}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="px-5 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-base font-bold shrink-0 ${ngoColor[v.ngo] ?? "bg-gray-100 text-gray-700"}`}>
            {v.name[0]}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{v.name}</p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ngoColor[v.ngo] ?? "bg-gray-100 text-gray-700"}`}>{v.ngo}</span>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge variant={v.status === "Active" ? "success" : "secondary"}>{v.status}</Badge>
              <span className="text-xs text-gray-400">{v.memberCount} mentees</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-sm">
        {v.description && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Description</p>
            {mode === "edit" ? (
              <textarea className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-blue-400 resize-none h-16" value={data.description ?? ""} onChange={(e) => set("description", e.target.value)} />
            ) : (
              <p className="text-xs text-gray-700">{v.description}</p>
            )}
          </div>
        )}

        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Point of Contact</p>
          {mode === "edit" ? (
            <div className="space-y-1.5">
              <div><label className="text-xs text-gray-500 block mb-0.5">Name</label><input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" placeholder="e.g. Priya Sharma" value={data.poc.name} onChange={(e) => setPoc("name", e.target.value)} /></div>
              <div><label className="text-xs text-gray-500 block mb-0.5">Email</label><input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" placeholder="e.g. priya@ngo.org" value={data.poc.email} onChange={(e) => setPoc("email", e.target.value)} /></div>
              <div><label className="text-xs text-gray-500 block mb-0.5">Phone</label><input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" placeholder="e.g. +91 9876543210" value={data.poc.contact} onChange={(e) => setPoc("contact", e.target.value)} /></div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-800">{v.poc.name}</p>
              <div className="flex items-center gap-2 text-xs text-gray-600"><Mail className="w-3.5 h-3.5 text-gray-400" />{v.poc.email}</div>
              <div className="flex items-center gap-2 text-xs text-gray-600"><Phone className="w-3.5 h-3.5 text-gray-400" />{v.poc.contact}</div>
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Meetings ({v.meetings.length})</p>
          <button onClick={onLogMeeting} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium mb-3">
            <CalendarPlus className="w-3.5 h-3.5" />Log meeting
          </button>
          {v.meetings.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No meetings logged</p>
          ) : [...v.meetings].sort((a, b) => b.date.localeCompare(a.date)).map((m) => (
            <div key={m.id} className="bg-gray-50 border border-gray-100 rounded-lg p-3 mb-2">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-gray-700">{new Date(m.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                <p className="text-xs text-gray-400">{m.poc}</p>
              </div>
              <p className="text-xs text-gray-600">{m.details}</p>
            </div>
          ))}
        </div>
      </div>

      {mode === "edit" ? (
        <div className="px-5 py-4 border-t border-gray-100 flex gap-2 shrink-0">
          <Button size="sm" className="flex-1" onClick={() => { onSave(data); setMode("view") }}><Check className="w-3.5 h-3.5" />Save</Button>
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

export default function MenteeGroups() {
  const [groups, setGroups] = useState<MenteeGroup[]>(mockMenteeGroups)
  const [search, setSearch] = useState("")
  const [filterNGO, setFilterNGO] = useState("All")
  const [filterStatus, setFilterStatus] = useState("All")
  const [selectedGroup, setSelectedGroup] = useState<MenteeGroup | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [logMeetingFor, setLogMeetingFor] = useState<MenteeGroup | null>(null)

  const filtered = groups.filter((g) => {
    const q = search.toLowerCase()
    return (
      (g.name.toLowerCase().includes(q) || g.ngo.toLowerCase().includes(q)) &&
      (filterNGO === "All" || g.ngo === filterNGO) &&
      (filterStatus === "All" || g.status === filterStatus)
    )
  })

  const handleLogMeeting = (meeting: Omit<GroupMeeting, "id">) => {
    if (!logMeetingFor) return
    const m: GroupMeeting = { ...meeting, id: `MM-${Date.now()}` }
    setGroups((p) => p.map((g) => g.id === logMeetingFor.id ? { ...g, meetings: [...g.meetings, m] } : g))
    if (selectedGroup?.id === logMeetingFor.id) setSelectedGroup((g) => g ? { ...g, meetings: [...g.meetings, m] } : null)
    setLogMeetingFor(null)
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 p-6 space-y-5 overflow-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Mentee Groups</h1>
            <p className="text-sm text-gray-500 mt-0.5">NGO-based groups for end users</p>
          </div>
          <Button size="sm" onClick={() => setShowAddModal(true)}><Plus className="w-4 h-4" />Add Group</Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Groups", value: groups.length, color: "text-gray-900" },
            { label: "Active", value: groups.filter((g) => g.status === "Active").length, color: "text-green-600" },
            { label: "Total Mentees", value: groups.reduce((s, g) => s + g.memberCount, 0), color: "text-blue-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 flex-wrap items-end">
          <div className="flex flex-col gap-1 flex-1 min-w-48">
            <label className="text-xs font-medium text-gray-500">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input placeholder="Search group or NGO…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">NGO Partner</label>
            <select value={filterNGO} onChange={(e) => setFilterNGO(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white w-48">
              <option>All</option>
              <option>Akanksha Foundation</option>
              <option>NavGurukul</option>
              <option>Parivarthan</option>
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

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Group Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">NGO Partner</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">POC</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Mentees</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Meetings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedGroup(g)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${ngoColor[g.ngo] ?? "bg-gray-100 text-gray-700"}`}>{g.name[0]}</div>
                      <span className="font-medium text-gray-900">{g.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ngoColor[g.ngo] ?? "bg-gray-100 text-gray-700"}`}>{g.ngo}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{g.poc.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-xs text-gray-600"><Users className="w-3.5 h-3.5 text-gray-400" />{g.memberCount}</div>
                  </td>
                  <td className="px-4 py-3"><Badge variant={g.status === "Active" ? "success" : "secondary"}>{g.status}</Badge></td>
                  <td className="px-4 py-3 text-xs text-gray-500">{g.meetings.length} logged</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedGroup && (
        <GroupPane
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
          onSave={(updated) => { setGroups((p) => p.map((g) => g.id === updated.id ? updated : g)); setSelectedGroup(updated) }}
          onLogMeeting={() => setLogMeetingFor(selectedGroup)}
        />
      )}

      {showAddModal && (
        <AddGroupModal
          onSave={(data) => { setGroups((p) => [...p, { ...data, id: `MG-${Date.now()}`, meetings: [] }]); setShowAddModal(false) }}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {logMeetingFor && (
        <LogMeetingModal groupName={logMeetingFor.name} onSave={handleLogMeeting} onClose={() => setLogMeetingFor(null)} />
      )}
    </div>
  )
}
