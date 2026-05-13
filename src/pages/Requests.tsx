import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { mockRequests, mockVolunteers, type Request, type MatchingStatus, type ConnectionStatus } from "@/data/mockData"
import { Search, Plus, UserPlus, Unlink, ChevronRight } from "lucide-react"

const matchingStatusVariant: Record<MatchingStatus, "default" | "warning" | "success"> = {
  "AI Matched": "default",
  "Manually Matched": "success",
  "Pending": "warning",
}

const connectionStatusVariant: Record<ConnectionStatus, "success" | "default" | "secondary"> = {
  "Connected": "success",
  "Meeting Scheduled": "default",
  "Not Connected": "secondary",
}

export default function Requests() {
  const [requests, setRequests] = useState<Request[]>(mockRequests)
  const [search, setSearch] = useState("")
  const [filterNGO, setFilterNGO] = useState("All")
  const [filterMatching, setFilterMatching] = useState("All")
  const [filterConnection, setFilterConnection] = useState("All")
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [showMatchModal, setShowMatchModal] = useState(false)

  const ngos = ["All", "Akanksha Foundation", "NavGurukul", "Parivarthan"]

  const filtered = requests.filter((r) => {
    const matchesSearch =
      r.mentee.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.requiredSkills.some((s: string) => s.toLowerCase().includes(search.toLowerCase()))
    const matchesNGO = filterNGO === "All" || r.ngo === filterNGO
    const matchesMatching = filterMatching === "All" || r.matchingStatus === filterMatching
    const matchesConnection = filterConnection === "All" || r.connectionStatus === filterConnection
    return matchesSearch && matchesNGO && matchesMatching && matchesConnection
  })

  const handleAssignVolunteer = (requestId: string, volunteerName: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, assignedVolunteer: volunteerName, matchingStatus: "Manually Matched", connectionStatus: "Meeting Scheduled" }
          : r
      )
    )
    setShowMatchModal(false)
    setSelectedRequest(null)
  }

  const handleUnassign = (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, assignedVolunteer: null, matchingStatus: "Pending", connectionStatus: "Not Connected" }
          : r
      )
    )
  }

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.matchingStatus === "Pending").length,
    connected: requests.filter((r) => r.connectionStatus === "Connected").length,
    aiMatched: requests.filter((r) => r.matchingStatus === "AI Matched").length,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and track skilled mentoring requests</p>
        </div>
        <Button>
          <Plus className="w-4 h-4" />
          New Request
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Requests", value: stats.total, color: "text-gray-900" },
          { label: "Pending Match", value: stats.pending, color: "text-yellow-600" },
          { label: "Connected", value: stats.connected, color: "text-green-600" },
          { label: "AI Matched", value: stats.aiMatched, color: "text-blue-600" },
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
            placeholder="Search by mentee, ID, or skill..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterNGO} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterNGO(e.target.value)} className="w-44">
          {ngos.map((n) => <option key={n}>{n}</option>)}
        </Select>
        <Select value={filterMatching} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterMatching(e.target.value)} className="w-44">
          <option>All</option>
          <option>AI Matched</option>
          <option>Manually Matched</option>
          <option>Pending</option>
        </Select>
        <Select value={filterConnection} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterConnection(e.target.value)} className="w-44">
          <option>All</option>
          <option>Connected</option>
          <option>Meeting Scheduled</option>
          <option>Not Connected</option>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Mentee</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">NGO</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Skills Needed</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Assigned Mentor</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Match Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Connection</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  No requests match your filters
                </td>
              </tr>
            ) : (
              filtered.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{req.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{req.mentee}</p>
                    <p className="text-xs text-gray-400">{req.opportunityType}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{req.ngo}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {req.requiredSkills.map((s: string) => (
                        <span key={s} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {req.assignedVolunteer ? (
                      <span className="text-gray-900">{req.assignedVolunteer}</span>
                    ) : (
                      <span className="text-gray-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={matchingStatusVariant[req.matchingStatus]}>
                      {req.matchingStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={connectionStatusVariant[req.connectionStatus]}>
                      {req.connectionStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSelectedRequest(req); setShowMatchModal(true) }}
                        title="Assign / Rematch"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                      </Button>
                      {req.assignedVolunteer && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnassign(req.id)}
                          title="Unassign mentor"
                        >
                          <Unlink className="w-3.5 h-3.5 text-red-400" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" title="View details">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Match Modal */}
      {showMatchModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Assign Mentor</h2>
            <p className="text-sm text-gray-500 mb-4">
              Selecting a mentor for <strong>{selectedRequest.mentee}</strong>
            </p>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Available Volunteers</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {mockVolunteers.map((v: typeof mockVolunteers[0]) => (
                <button
                  key={v.id}
                  onClick={() => handleAssignVolunteer(selectedRequest.id, v.name)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{v.name}</p>
                    <p className="text-xs text-gray-500">{v.domain} · {v.experience} yrs exp</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {v.skills.slice(0, 3).map((s: string) => (
                        <span key={s} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    <Badge variant={v.availability === "Available" ? "success" : "warning"}>
                      {v.availability}
                    </Badge>
                    {v.matchScore && (
                      <p className="text-xs text-blue-600 font-semibold mt-1">{v.matchScore}% match</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => { setShowMatchModal(false); setSelectedRequest(null) }}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
