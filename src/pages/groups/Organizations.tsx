import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mockOrganizations, type Organization, type OrgType, type OrgPOC, type OrgMeeting } from "@/data/organizationsData"
import { mockPrograms } from "@/data/programsData"
import { taggableProgramOptions } from "@/lib/programMatch"
import {
  Search, Plus, X, Pencil, Check, CalendarPlus,
  Globe, MapPin, Calendar, Mail, Phone, Archive,
} from "lucide-react"

// ── Add Org Modal ─────────────────────────────────────────────────────────────

function AddOrgModal({ type, onSave, onClose }: {
  type: OrgType; onSave: (o: Omit<Organization, "id" | "meetings" | "poc" | "units" | "programs" | "social" | "dateAdded">) => void; onClose: () => void
}) {
  const [name, setName] = useState("")
  const [website, setWebsite] = useState("")
  const [summary, setSummary] = useState("")
  const [pocName, setPocName] = useState("")
  const [pocRole, setPocRole] = useState("")
  const [pocEmail, setPocEmail] = useState("")
  const [pocPhone, setPocPhone] = useState("")
  const [locations, setLocations] = useState("")

  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()

  const handleSave = () => {
    if (!name) return
    onSave({
      type,
      name,
      initials: initials || "??",
      website: website || undefined,
      summary,
      locations: locations.split(",").map((l) => l.trim()).filter(Boolean),
      status: "Active",
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto py-8">
      <div className="bg-white rounded-xl shadow-xl w-[520px] p-6 mx-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">{initials || "?"}</div>
          <h2 className="font-semibold text-gray-900">Add New {type} Organisation</h2>
          <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-xs text-gray-500 mb-5">Enter the details of the organisation to continue</p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Organisation Name *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. CRY India" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Website *</label>
              <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="e.g. https://www.cry.org" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Organisation Summary</label>
            <textarea className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 resize-none h-20" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Briefly describe the organisation's mission and reach…" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Locations (comma separated)</label>
            <Input value={locations} onChange={(e) => setLocations(e.target.value)} placeholder="e.g. Mumbai, Delhi, Bengaluru" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Sub Tab Category</p>
            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">{type} Organisation</span>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />Initial Point of Contact
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">POC Name</label>
                <Input value={pocName} onChange={(e) => setPocName(e.target.value)} placeholder="Name" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">POC Role</label>
                <Input value={pocRole} onChange={(e) => setPocRole(e.target.value)} placeholder="Role / Title" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Email</label>
                <Input value={pocEmail} onChange={(e) => setPocEmail(e.target.value)} placeholder="Email" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Phone</label>
                <Input value={pocPhone} onChange={(e) => setPocPhone(e.target.value)} placeholder="Phone" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSave}>Create Organisation</Button>
        </div>
      </div>
    </div>
  )
}

// ── Side Pane ─────────────────────────────────────────────────────────────────

function OrgPane({ org, onClose, onSave, onArchive }: {
  org: Organization; onClose: () => void; onSave: (o: Organization) => void; onArchive: () => void
}) {
  const [editingDetails, setEditingDetails] = useState(false)
  const [data, setData] = useState<Organization>({ ...org })
  const [showAddPoc, setShowAddPoc] = useState(false)
  const [newPoc, setNewPoc] = useState<Partial<OrgPOC>>({})
  const [showBookMeeting, setShowBookMeeting] = useState(false)
  const [newMeeting, setNewMeeting] = useState<Partial<OrgMeeting>>({})
  const [showProgramEditor, setShowProgramEditor] = useState(false)

  const set = (field: keyof Organization, val: unknown) => setData((d) => ({ ...d, [field]: val }))

  const saveDetails = () => { onSave(data); setEditingDetails(false) }
  const cancelDetails = () => { setData({ ...org }); setEditingDetails(false) }

  const addPoc = () => {
    if (!newPoc.name) return
    const poc: OrgPOC = { id: `P-${Date.now()}`, name: newPoc.name ?? "", role: newPoc.role ?? "", email: newPoc.email ?? "", phone: newPoc.phone ?? "", isMain: data.poc.length === 0 }
    const updated = { ...data, poc: [...data.poc, poc] }
    setData(updated); onSave(updated); setNewPoc({}); setShowAddPoc(false)
  }

  const removePoc = (id: string) => {
    const updated = { ...data, poc: data.poc.filter((p) => p.id !== id) }
    setData(updated); onSave(updated)
  }

  const bookMeeting = () => {
    if (!newMeeting.date || !newMeeting.details) return
    const m: OrgMeeting = { id: `OM-${Date.now()}`, date: newMeeting.date ?? "", details: newMeeting.details ?? "", poc: newMeeting.poc ?? "" }
    const updated = { ...data, meetings: [...data.meetings, m] }
    setData(updated); onSave(updated); setNewMeeting({}); setShowBookMeeting(false)
  }

  // Both org types are capped at one Program at a time.
  const setOrgProgram = (programId: string) => {
    const updated = { ...data, programs: programId ? [programId] : [] }
    setData(updated); onSave(updated)
  }

  const v = org

  return (
    <div className="w-[420px] border-l border-gray-200 bg-white flex flex-col overflow-hidden shrink-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 shrink-0">
        <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center text-base font-bold shrink-0">
          {v.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{v.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge variant="success">Active</Badge>
            <Badge variant={v.type === "Volunteer" ? "default" : "secondary"}>{v.type}</Badge>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0"><X className="w-4 h-4" /></button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Org Details */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Organisation Details</p>
            {editingDetails ? (
              <div className="flex gap-2">
                <button onClick={saveDetails} className="text-xs text-blue-600 font-medium flex items-center gap-1"><Check className="w-3 h-3" />Save</button>
                <button onClick={cancelDetails} className="text-xs text-gray-400">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setEditingDetails(true)} className="text-xs text-blue-600 font-medium flex items-center gap-1"><Pencil className="w-3 h-3" />Edit</button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-1">Website</p>
              {editingDetails ? (
                <input className="w-full border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400 text-xs" value={data.website ?? ""} onChange={(e) => set("website", e.target.value)} />
              ) : (
                <a href={`https://${v.website}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                  <Globe className="w-3 h-3" />{v.website ?? "—"}
                </a>
              )}
            </div>
            <div>
              <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-1">Date Added</p>
              <div className="flex items-center gap-1 text-gray-700"><Calendar className="w-3 h-3 text-gray-400" />{v.dateAdded}</div>
            </div>
            <div>
              <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-1">Locations</p>
              {editingDetails ? (
                <input className="w-full border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400 text-xs" value={data.locations.join(", ")} onChange={(e) => set("locations", e.target.value.split(",").map((l) => l.trim()))} />
              ) : (
                <div className="flex items-start gap-1 text-gray-700">
                  <MapPin className="w-3 h-3 text-gray-400 mt-0.5 shrink-0" />{v.locations.join(", ")}
                </div>
              )}
            </div>
            <div>
              <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-1">Social</p>
              {v.social?.linkedin ? (
                <a href={`https://${v.social.linkedin}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-xs">
                  LinkedIn ↗
                </a>
              ) : <span className="text-gray-400">—</span>}
            </div>
          </div>
          {v.summary && (
            <div className="mt-3">
              <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-1">Summary</p>
              {editingDetails ? (
                <textarea className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-blue-400 resize-none h-20" value={data.summary} onChange={(e) => set("summary", e.target.value)} />
              ) : (
                <p className="text-xs text-gray-600 leading-relaxed">{v.summary}</p>
              )}
            </div>
          )}
        </div>

        {/* Associated Units */}
        {v.units.length > 0 && (
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Associated Units</p>
            <div className="space-y-1.5">
              {v.units.map((u) => (
                <div key={u} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <p className="text-xs font-medium text-gray-800">{u}</p>
                  <Badge variant="success">Active</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Programs */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Associated Programs</p>
            <button onClick={() => setShowProgramEditor((o) => !o)} className="text-xs text-blue-600 font-medium flex items-center gap-1">
              <Pencil className="w-3 h-3" />Manage
            </button>
          </div>
          {v.programs.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No active programs</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {v.programs.map((id) => {
                const p = mockPrograms.find((pr) => pr.id === id)
                return p ? <span key={id} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{p.name}</span> : null
              })}
            </div>
          )}
          {showProgramEditor && (
            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
              {(() => {
                const options = taggableProgramOptions(mockPrograms)
                if (options.length === 0) {
                  return <p className="text-xs text-gray-400 italic">No programs available to tag — all Programs are either Closed or Projects-only.</p>
                }
                return (
                  <>
                    <p className="text-xs font-medium text-blue-800 mb-2">Tag to a Program</p>
                    <select
                      className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-blue-400 bg-white"
                      value={data.programs[0] ?? ""}
                      onChange={(e) => setOrgProgram(e.target.value)}
                    >
                      <option value="">No Program</option>
                      {options.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <p className="text-[11px] text-blue-600 mt-1.5">A {v.type} Organization can be tagged to one Program at a time.</p>
                  </>
                )
              })()}
            </div>
          )}
        </div>

        {/* POC */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Points of Contact</p>
            <button onClick={() => setShowAddPoc((o) => !o)} className="text-xs text-blue-600 font-medium flex items-center gap-1">
              <Plus className="w-3 h-3" />Manage
            </button>
          </div>
          <div className="space-y-2">
            {v.poc.map((p) => (
              <div key={p.id} className="flex items-start gap-2.5 bg-gray-50 rounded-lg px-3 py-2.5">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {p.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-gray-800">{p.name}</p>
                    {p.isMain && <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded font-medium">MAIN</span>}
                  </div>
                  <p className="text-xs text-gray-500">{p.role}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <a href={`mailto:${p.email}`} className="text-gray-400 hover:text-blue-600"><Mail className="w-3.5 h-3.5" /></a>
                  <a href={`tel:${p.phone}`} className="text-gray-400 hover:text-green-600"><Phone className="w-3.5 h-3.5" /></a>
                  <button onClick={() => removePoc(p.id)} className="text-gray-300 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
          {showAddPoc && (
            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium text-blue-800">Add Point of Contact</p>
              <div className="grid grid-cols-2 gap-2">
                <input className="text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" placeholder="Name" value={newPoc.name ?? ""} onChange={(e) => setNewPoc((p) => ({ ...p, name: e.target.value }))} />
                <input className="text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" placeholder="Role" value={newPoc.role ?? ""} onChange={(e) => setNewPoc((p) => ({ ...p, role: e.target.value }))} />
                <input className="text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" placeholder="Email" value={newPoc.email ?? ""} onChange={(e) => setNewPoc((p) => ({ ...p, email: e.target.value }))} />
                <input className="text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" placeholder="Phone" value={newPoc.phone ?? ""} onChange={(e) => setNewPoc((p) => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" onClick={addPoc}>Add</Button>
                <Button size="sm" variant="outline" onClick={() => { setShowAddPoc(false); setNewPoc({}) }}>Cancel</Button>
              </div>
            </div>
          )}
        </div>

        {/* Meetings */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Meetings & Touchpoints</p>
            <button onClick={() => setShowBookMeeting((o) => !o)} className="text-xs text-blue-600 font-medium flex items-center gap-1">
              <CalendarPlus className="w-3 h-3" />Book Meeting
            </button>
          </div>
          {showBookMeeting && (
            <div className="mb-3 bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-2">
              <input type="date" className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" value={newMeeting.date ?? ""} onChange={(e) => setNewMeeting((m) => ({ ...m, date: e.target.value }))} />
              <textarea className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-blue-400 resize-none h-16" placeholder="Meeting details…" value={newMeeting.details ?? ""} onChange={(e) => setNewMeeting((m) => ({ ...m, details: e.target.value }))} />
              <input className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" placeholder="POC Name" value={newMeeting.poc ?? ""} onChange={(e) => setNewMeeting((m) => ({ ...m, poc: e.target.value }))} />
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" onClick={bookMeeting}>Log</Button>
                <Button size="sm" variant="outline" onClick={() => { setShowBookMeeting(false); setNewMeeting({}) }}>Cancel</Button>
              </div>
            </div>
          )}
          {v.meetings.length === 0 ? (
            <div className="flex flex-col items-center py-4 text-gray-400">
              <CalendarPlus className="w-6 h-6 mb-1 text-gray-300" />
              <p className="text-xs">No meetings logged yet</p>
            </div>
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

        {/* Archive */}
        <div className="px-5 py-4">
          <button onClick={onArchive} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium">
            <Archive className="w-4 h-4" />Archive Organisation
          </button>
          <p className="text-xs text-gray-400 mt-1">Associated with {v.programs.length} program{v.programs.length !== 1 ? "s" : ""}</p>
        </div>
      </div>
    </div>
  )
}

// ── Org Card ──────────────────────────────────────────────────────────────────

function OrgCard({ org, onClick }: { org: Organization; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
          {org.initials}
        </div>
        <Badge variant="success">Active</Badge>
      </div>
      <p className="font-semibold text-gray-900 text-sm mb-0.5">{org.name}</p>
      {org.website && (
        <div className="flex items-center gap-1 text-xs text-blue-600 mb-2">
          <Globe className="w-3 h-3" />{org.website}
        </div>
      )}
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{org.summary}</p>
      {/* POC */}
      {org.poc.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px] font-bold">
            {org.poc[0].name.split(" ").map((n) => n[0]).join("")}
          </div>
          <p className="text-xs text-gray-600">{org.poc[0].name}</p>
        </div>
      )}
      {/* Programs */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">Programs</p>
        {org.programs.length > 0 ? (
          <span className="text-xs text-blue-600 font-medium">{org.programs.length} active</span>
        ) : (
          <span className="text-xs text-gray-400">None</span>
        )}
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function Organizations() {
  const [orgs, setOrgs] = useState<Organization[]>(mockOrganizations)
  const [activeTab, setActiveTab] = useState<OrgType>("Beneficiary")
  const [search, setSearch] = useState("")
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const filtered = orgs.filter((o) =>
    o.type === activeTab &&
    o.status !== "Archived" &&
    (o.name.toLowerCase().includes(search.toLowerCase()) || o.summary.toLowerCase().includes(search.toLowerCase()))
  )

  // Mock data has no backend — write through to the shared mockOrganizations
  // array too, so other pages (e.g. Program detail's tagged-orgs lookup) see
  // the change on their next mount, not just this page's local state.
  const syncShared = (next: Organization[]) => {
    mockOrganizations.length = 0
    mockOrganizations.push(...next)
  }

  const handleAddOrg = (data: Omit<Organization, "id" | "meetings" | "poc" | "units" | "programs" | "social" | "dateAdded">) => {
    const newOrg: Organization = {
      ...data,
      id: `ORG-${Date.now()}`,
      dateAdded: new Date().toISOString().split("T")[0],
      poc: [],
      units: [],
      programs: [],
      social: {},
      meetings: [],
    }
    setOrgs((p) => { const next = [...p, newOrg]; syncShared(next); return next })
    setShowAddModal(false)
  }

  const handleSaveOrg = (updated: Organization) => {
    setOrgs((p) => { const next = p.map((o) => o.id === updated.id ? updated : o); syncShared(next); return next })
    setSelectedOrg(updated)
  }

  const handleArchiveOrg = () => {
    if (!selectedOrg) return
    setOrgs((p) => { const next = p.map((o) => o.id === selectedOrg.id ? { ...o, status: "Archived" as const } : o); syncShared(next); return next })
    setSelectedOrg(null)
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 p-6 space-y-5 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Organisations</h1>
            <p className="text-sm text-gray-500 mt-0.5">Volunteer and beneficiary organisations</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input placeholder="Search organisations…" className="pl-9 w-60" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4" />Add Organisation
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2">
          {(["Beneficiary", "Volunteer"] as OrgType[]).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === tab ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {tab}
            </button>
          ))}
          <span className="text-xs text-gray-400 ml-2">{filtered.length} organisation{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Cards grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <p className="text-sm">No {activeTab.toLowerCase()} organisations found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((o) => (
              <OrgCard key={o.id} org={o} onClick={() => setSelectedOrg(o)} />
            ))}
          </div>
        )}
      </div>

      {/* Side pane */}
      {selectedOrg && (
        <OrgPane
          org={selectedOrg}
          onClose={() => setSelectedOrg(null)}
          onSave={handleSaveOrg}
          onArchive={handleArchiveOrg}
        />
      )}

      {showAddModal && (
        <AddOrgModal type={activeTab} onSave={handleAddOrg} onClose={() => setShowAddModal(false)} />
      )}
    </div>
  )
}
