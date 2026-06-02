import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { mockVolunteers, mentorGroups, type Volunteer, type OrientationStatus } from "@/data/volunteersData"
import {
  Search, Plus, X, ChevronUp, ChevronDown, MoreVertical,
  Star, MessageSquare, RefreshCw, Archive, Users, Pencil,
  Briefcase, Mail, Phone, Link, FileText, CheckSquare,
} from "lucide-react"

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
  const [drawerTab, setDrawerTab] = useState<"profile" | "orientation" | "requests" | "ratings">("profile")
  const [bulkActionOpen, setBulkActionOpen] = useState(false)

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
        (filterEngagement === "All" || v.engagementStatus === filterEngagement) &&
        (filterAvailability === "All" || v.availability === filterAvailability)
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
    setDrawerTab("profile")
    setOpenMenuId(null)
  }

  const stats = {
    total: volunteers.length,
    active: volunteers.filter((v) => v.engagementStatus === "Active").length,
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
            <Button variant="outline" size="sm">Upload CSV</Button>
            <Button size="sm"><Plus className="w-4 h-4" />Add Mentor</Button>
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
                    <Badge variant={v.engagementStatus === "Active" ? "success" : "secondary"}>
                      {v.engagementStatus === "Active" ? `Active · ${v.activeRequest?.menteeName}` : "Not Engaged"}
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
        <div className="w-96 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
            <p className="font-semibold text-gray-900 text-sm">Mentor Profile</p>
            <button onClick={() => setDrawerMentor(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Avatar + name */}
          <div className="px-5 py-4 border-b border-gray-100 shrink-0">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg font-bold shrink-0">
                {drawerMentor.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{drawerMentor.name}</p>
                <p className="text-xs text-gray-500">{drawerMentor.currentRole} · {drawerMentor.currentCompany}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <StarRating value={drawerMentor.rating} />
                  <span className="text-xs text-gray-400">·</span>
                  <Badge variant={drawerMentor.engagementStatus === "Active" ? "success" : "secondary"}>
                    {drawerMentor.engagementStatus}
                  </Badge>
                  <Badge variant={drawerMentor.availability === "Available" ? "success" : "warning"}>
                    {drawerMentor.availability}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 shrink-0">
            {(["profile", "orientation", "requests", "ratings"] as const).map((tab) => (
              <button key={tab} onClick={() => setDrawerTab(tab)}
                className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${drawerTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-sm">

            {/* ── PROFILE TAB ── */}
            {drawerTab === "profile" && (
              <>
                <DrawerSection label="Current Position">
                  <div className="flex items-start gap-2">
                    <Briefcase className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-gray-900 font-medium">{drawerMentor.currentRole}</p>
                      <p className="text-gray-500 text-xs">{drawerMentor.currentCompany} · {drawerMentor.totalYearsExp} yrs total exp</p>
                    </div>
                  </div>
                </DrawerSection>

                <DrawerSection label="Past Experience">
                  <div className="space-y-2">
                    {drawerMentor.pastExperience.map((e, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                        <div>
                          <p className="text-gray-800 font-medium text-xs">{e.role}</p>
                          <p className="text-gray-500 text-xs">{e.company} · {e.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </DrawerSection>

                <DrawerSection label="Skills">
                  <div className="flex flex-wrap gap-1.5">
                    {drawerMentor.skills.map((s) => (
                      <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </DrawerSection>

                <DrawerSection label="Interested in Mentoring">
                  <div className="flex flex-wrap gap-1.5">
                    {drawerMentor.interestedIn.map((i) => (
                      <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{i}</span>
                    ))}
                  </div>
                </DrawerSection>

                <DrawerSection label="Mentor Group">
                  <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">{drawerMentor.group}</span>
                </DrawerSection>

                <DrawerSection label="Contact">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-gray-700 text-xs">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />{drawerMentor.whatsapp}
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 text-xs">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />{drawerMentor.email}
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 text-xs">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />{drawerMentor.officialEmail}
                      <span className="text-gray-400">(official)</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600 text-xs">
                      <Link className="w-3.5 h-3.5" />
                      <a href={`https://${drawerMentor.linkedin}`} target="_blank" rel="noreferrer" className="hover:underline truncate">
                        {drawerMentor.linkedin}
                      </a>
                    </div>
                    {drawerMentor.resume ? (
                      <div className="flex items-center gap-2 text-blue-600 text-xs">
                        <FileText className="w-3.5 h-3.5" />
                        <a href={drawerMentor.resume} target="_blank" rel="noreferrer" className="hover:underline">View Resume</a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400 text-xs">
                        <FileText className="w-3.5 h-3.5" />Resume not uploaded
                      </div>
                    )}
                  </div>
                </DrawerSection>
              </>
            )}

            {/* ── ORIENTATION TAB ── */}
            {drawerTab === "orientation" && (
              <>
                <DrawerSection label="Current Status">
                  <Badge variant={orientationVariant[drawerMentor.orientationStatus]}>
                    {drawerMentor.orientationStatus}
                    {drawerMentor.orientationDate && ` · ${drawerMentor.orientationDate}`}
                  </Badge>
                </DrawerSection>
                <DrawerSection label="Update Status">
                  <Select defaultValue={drawerMentor.orientationStatus} className="w-full text-xs">
                    <option>Orientation Pending</option>
                    <option>Orientation Slot Booked</option>
                    <option>Orientation Done</option>
                    <option>Orientation Rescheduled</option>
                  </Select>
                  <Button size="sm" className="mt-2 w-full">Save Status</Button>
                </DrawerSection>
              </>
            )}

            {/* ── REQUESTS TAB ── */}
            {drawerTab === "requests" && (
              <>
                <DrawerSection label="Active Request">
                  {drawerMentor.activeRequest ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1">
                      <p className="text-xs font-semibold text-green-800">{drawerMentor.activeRequest.id}</p>
                      <p className="text-xs text-green-700">Mentee: <strong>{drawerMentor.activeRequest.menteeName}</strong></p>
                      <p className="text-xs text-green-700">Skill: {drawerMentor.activeRequest.skill}</p>
                      <p className="text-xs text-gray-500">Since {drawerMentor.activeRequest.startedAt}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No active request</p>
                  )}
                </DrawerSection>

                <DrawerSection label={`Past Requests (${drawerMentor.pastRequests.length})`}>
                  {drawerMentor.pastRequests.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No past requests</p>
                  ) : (
                    <div className="space-y-3">
                      {drawerMentor.pastRequests.map((r) => (
                        <div key={r.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1">
                          <p className="text-xs font-semibold text-gray-700">{r.id}</p>
                          <p className="text-xs text-gray-700">Mentee: <strong>{r.menteeName}</strong></p>
                          <p className="text-xs text-gray-600">Skill: {r.skill}</p>
                          <p className="text-xs text-gray-400">Closed: {r.closedAt}</p>
                          {r.feedback && (
                            <p className="text-xs text-gray-600 italic mt-1">"{r.feedback}"</p>
                          )}
                          {r.rating && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              <span className="text-xs text-gray-600">{r.rating}/5</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </DrawerSection>
              </>
            )}

            {/* ── RATINGS TAB ── */}
            {drawerTab === "ratings" && (
              <>
                <DrawerSection label="Overall Rating">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl font-bold text-gray-900">{drawerMentor.rating.toFixed(1)}</div>
                    <div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className={`w-4 h-4 ${i <= Math.round(drawerMentor.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">Avg of {drawerMentor.pastRequests.filter((r) => r.rating).length + (drawerMentor.activeRequest ? 0 : 0)} ratings</p>
                    </div>
                  </div>
                </DrawerSection>

                <DrawerSection label="Ratings by Mentee">
                  {drawerMentor.pastRequests.filter((r) => r.rating).length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No ratings yet</p>
                  ) : (
                    <div className="space-y-2">
                      {drawerMentor.pastRequests.filter((r) => r.rating).map((r) => (
                        <div key={r.id} className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-medium text-gray-800">{r.menteeName}</p>
                            {r.feedback && <p className="text-xs text-gray-500 italic">"{r.feedback}"</p>}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-medium">{r.rating}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </DrawerSection>
              </>
            )}
          </div>

          {/* Drawer footer */}
          <div className="px-5 py-4 border-t border-gray-100 flex gap-2 shrink-0">
            <Button size="sm" className="flex-1">
              <Pencil className="w-3.5 h-3.5" />Edit Profile
            </Button>
            <Button size="sm" variant="outline">
              <MessageSquare className="w-3.5 h-3.5" />Message
            </Button>
            <Button size="sm" variant="outline">
              <CheckSquare className="w-3.5 h-3.5" />Orientation
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function DrawerSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">{label}</p>
      {children}
    </div>
  )
}
