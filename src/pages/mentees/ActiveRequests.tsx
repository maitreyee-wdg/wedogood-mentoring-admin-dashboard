import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import {
  mockRequests, matchingTemplates, ACTIVE_STATUSES,
  type MentoringRequest, type RequestStatus, type MatchCandidate,
} from "@/data/requestsData"
import {
  Search, X, ChevronUp, ChevronDown, Plus, Check,
  MessageSquare, Users, Clock, ArrowRight, AlertCircle,
} from "lucide-react"

// ── Status config ─────────────────────────────────────────────────────────────

const statusVariant: Record<RequestStatus, "default" | "success" | "warning" | "secondary" | "outline" | "destructive"> = {
  "Draft": "secondary",
  "New": "default",
  "Match Approval Pending": "warning",
  "Mentor Response Pending": "warning",
  "No Match Found": "destructive",
  "Matched": "success",
  "Closed - Feedback Pending": "secondary",
  "Expired": "secondary",
  "Closed - With Feedback": "success",
}

const typeVariant: Record<string, string> = {
  "New Mentor": "bg-blue-100 text-blue-700",
  "Existing Mentor": "bg-purple-100 text-purple-700",
}

// ── Helper: format relative time ─────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

// ── Request Side Pane ────────────────────────────────────────────────────────

function RequestPane({ request: initial, onClose, onUpdate }: {
  request: MentoringRequest
  onClose: () => void
  onUpdate: (r: MentoringRequest) => void
}) {
  const [tab, setTab] = useState<"overview" | "ai-chat" | "match">("overview")
  const [req, setReq] = useState<MentoringRequest>(initial)
  const [selectedTemplate, setSelectedTemplate] = useState(req.approvedTemplate ?? "")
  const [candidates, setCandidates] = useState<MatchCandidate[]>(req.matchCandidates)

  // ── Match approval actions ────────────────────────────────────────────────

  const moveUp = (i: number) => {
    if (i === 0) return
    const next = [...candidates]
    ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
    setCandidates(next)
  }
  const moveDown = (i: number) => {
    if (i === candidates.length - 1) return
    const next = [...candidates]
    ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
    setCandidates(next)
  }
  const removeCandidate = (id: string) => setCandidates(candidates.filter((c) => c.id !== id))

  const handleApprove = () => {
    const updated: MentoringRequest = {
      ...req,
      status: "Mentor Response Pending",
      approvedTemplate: selectedTemplate,
      matchCandidates: candidates.map((c) => ({ ...c, outreachStatus: "Sent", outreachSentAt: new Date().toISOString() })),
    }
    setReq(updated)
    setCandidates(updated.matchCandidates)
    onUpdate(updated)
  }

  const outreachStatusIcon = (s: MatchCandidate["outreachStatus"]) => {
    if (s === "Accepted") return <Check className="w-3.5 h-3.5 text-green-500" />
    if (s === "No Response") return <X className="w-3.5 h-3.5 text-red-400" />
    if (s === "Declined") return <X className="w-3.5 h-3.5 text-red-400" />
    if (s === "Sent") return <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
    return <div className="w-2.5 h-2.5 rounded-full border-2 border-gray-300" />
  }

  const outreachStatusLabel: Record<MatchCandidate["outreachStatus"], string> = {
    "Pending": "Pending",
    "Sent": "Awaiting response",
    "No Response": "No response · Window expired",
    "Declined": "Declined",
    "Accepted": "Accepted ✓",
  }

  return (
    <div className="w-[500px] border-l border-gray-200 bg-white flex flex-col overflow-hidden shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
        <div>
          <p className="font-semibold text-gray-900 text-sm">{req.id}</p>
          <p className="text-xs text-gray-500">{req.menteeName} · {req.menteeGroup}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant[req.status]}>{req.status}</Badge>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 shrink-0">
        {([
          { key: "overview", label: "Overview" },
          { key: "ai-chat", label: "AI Chat" },
          { key: "match", label: req.status === "Match Approval Pending" ? "Match ⚠" : "Match" },
        ] as const).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 text-xs font-medium ${tab === t.key ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div className="px-5 py-4 space-y-5 text-sm">
            <PaneSection label="Request Details">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div><span className="text-gray-400">Date</span><p className="text-gray-800 mt-0.5">{fmtDate(req.requestDate)}</p></div>
                <div><span className="text-gray-400">Active Days</span><p className="text-gray-800 mt-0.5">{req.activeDays} days</p></div>
                <div><span className="text-gray-400">NGO</span><p className="text-gray-800 mt-0.5">{req.ngo}</p></div>
                <div><span className="text-gray-400">Type</span>
                  <p className="mt-0.5"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeVariant[req.requestType]}`}>{req.requestType}</span></p>
                </div>
              </div>
            </PaneSection>

            <PaneSection label="Theme / Summary">
              <p className="text-gray-800">{req.theme}</p>
            </PaneSection>

            <PaneSection label="Target Domain & Role">
              <div className="space-y-0.5">
                <p className="text-gray-800 font-medium">{req.targetDomain}</p>
                <p className="text-gray-500 text-xs">{req.targetRole}</p>
              </div>
            </PaneSection>

            <PaneSection label="Skills Needed">
              <div className="flex flex-wrap gap-1.5">
                {req.skillsNeeded.map((s) => (
                  <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            </PaneSection>

            <PaneSection label="Matched Mentor">
              {req.matchedMentor
                ? <p className="text-gray-800 font-medium">{req.matchedMentor}</p>
                : <p className="text-gray-400 italic text-xs">No mentor matched yet</p>}
            </PaneSection>
          </div>
        )}

        {/* ── AI CHAT ── */}
        {tab === "ai-chat" && (
          <div className="px-5 py-4">
            <p className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Conversation between mentee and Mira (WeDoGood AI) that created this request
            </p>
            {req.aiConversation.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center py-8">Request created via platform — no conversation available</p>
            ) : (
              <div className="space-y-3">
                {req.aiConversation.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === "mentee" ? "justify-end" : "justify-start"}`}>
                    {msg.sender === "mira" && (
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center mr-2 mt-0.5 shrink-0">M</div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${msg.sender === "mentee" ? "bg-blue-500 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
                      <p>{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${msg.sender === "mentee" ? "text-blue-200" : "text-gray-400"}`}>
                        {new Date(msg.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MATCH ── */}
        {tab === "match" && (
          <div className="px-5 py-4 space-y-5 text-sm">

            {/* NEW — trigger matching */}
            {req.status === "New" && (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-sm font-medium text-gray-800">Ready to find a match</p>
                <p className="text-xs text-gray-500">The AI matching algorithm will suggest mentors based on skills, domain, and availability.</p>
                <Button className="mx-auto">Trigger AI Matching</Button>
              </div>
            )}

            {/* MATCH APPROVAL PENDING — editable candidate list */}
            {req.status === "Match Approval Pending" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">AI Suggested Mentors</p>
                  <span className="text-xs text-gray-400">{candidates.length} candidates</span>
                </div>

                <div className="space-y-2">
                  {candidates.map((c, i) => (
                    <div key={c.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          {/* Priority + reorder */}
                          <div className="flex flex-col items-center gap-0.5">
                            <button onClick={() => moveUp(i)} disabled={i === 0} className="text-gray-300 hover:text-gray-600 disabled:opacity-30"><ChevronUp className="w-3.5 h-3.5" /></button>
                            <span className="text-xs font-bold text-gray-500 w-4 text-center">{i + 1}</span>
                            <button onClick={() => moveDown(i)} disabled={i === candidates.length - 1} className="text-gray-300 hover:text-gray-600 disabled:opacity-30"><ChevronDown className="w-3.5 h-3.5" /></button>
                          </div>
                          {/* Mentor info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-semibold text-gray-900">{c.name}</p>
                              <span className="text-xs font-bold text-blue-600">{c.matchPercent}%</span>
                            </div>
                            <p className="text-xs text-gray-500">{c.role} · {c.company}</p>
                            <p className="text-xs text-gray-400 mt-0.5 italic">"{c.matchReason}"</p>
                          </div>
                        </div>
                        <button onClick={() => removeCandidate(c.id)} className="text-gray-300 hover:text-red-400 shrink-0"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium">
                  <Plus className="w-3.5 h-3.5" /> Add Mentor
                </button>

                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Matchmaking Message Template</label>
                  <select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white">
                    <option value="">Select a template…</option>
                    {matchingTemplates.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} — {t.description}</option>
                    ))}
                  </select>
                </div>

                <Button className="w-full" disabled={!selectedTemplate || candidates.length === 0} onClick={handleApprove}>
                  Approve & Notify Mentors
                </Button>
                <p className="text-xs text-gray-400 text-center">
                  Mentors will be contacted in priority order. Each has 12 hrs to respond before moving to the next.
                </p>
              </div>
            )}

            {/* MENTOR RESPONSE PENDING — outreach timeline */}
            {req.status === "Mentor Response Pending" && (
              <div className="space-y-4">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Outreach Progress</p>
                <div className="space-y-0">
                  {candidates.map((c, i) => {
                    const isCurrent = c.outreachStatus === "Sent"
                    const isDone = c.outreachStatus === "Accepted" || c.outreachStatus === "No Response" || c.outreachStatus === "Declined"
                    const isPending = c.outreachStatus === "Pending"
                    return (
                      <div key={c.id} className="relative flex gap-3">
                        {/* Connector line */}
                        {i < candidates.length - 1 && (
                          <div className="absolute left-[13px] top-8 w-0.5 h-full bg-gray-200" />
                        )}
                        {/* Icon */}
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 mt-0.5 ${isCurrent ? "bg-amber-100" : isDone && c.outreachStatus !== "Accepted" ? "bg-red-50" : c.outreachStatus === "Accepted" ? "bg-green-100" : "bg-gray-100"}`}>
                          {outreachStatusIcon(c.outreachStatus)}
                        </div>
                        {/* Content */}
                        <div className={`flex-1 pb-4 ${isPending ? "opacity-50" : ""}`}>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-gray-900">{c.name}</p>
                            <span className="text-xs text-gray-400">#{i + 1}</span>
                            {isCurrent && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">Current</span>}
                          </div>
                          <p className="text-xs text-gray-500">{c.role} · {c.company}</p>
                          <p className={`text-xs mt-0.5 ${isCurrent ? "text-amber-600" : isDone ? (c.outreachStatus === "Accepted" ? "text-green-600" : "text-red-500") : "text-gray-400"}`}>
                            {outreachStatusLabel[c.outreachStatus]}
                            {c.outreachSentAt && !isPending && <span className="text-gray-400 ml-1">· {fmtDate(c.outreachSentAt)}</span>}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* MATCHED */}
            {req.status === "Matched" && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto text-xl font-bold">
                    {req.matchedMentor?.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <p className="font-semibold text-green-800">{req.matchedMentor}</p>
                  <p className="text-xs text-green-600">Matched & notified via WhatsApp</p>
                </div>
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">All Candidates</p>
                {candidates.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 text-xs">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${c.outreachStatus === "Accepted" ? "bg-green-500" : c.outreachStatus === "Pending" ? "bg-gray-300" : "bg-red-300"}`} />
                    <div className="flex-1">
                      <span className="font-medium text-gray-800">{c.name}</span>
                      <span className="text-gray-400 ml-1">· {c.company}</span>
                    </div>
                    <span className="text-gray-500">{c.matchPercent}%</span>
                    <span className={`${c.outreachStatus === "Accepted" ? "text-green-600" : c.outreachStatus === "Pending" ? "text-gray-400" : "text-red-400"}`}>{c.outreachStatus}</span>
                  </div>
                ))}
              </div>
            )}

            {/* NO MATCH FOUND */}
            {req.status === "No Match Found" && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
                  <p className="text-sm font-medium text-red-700">No mentor confirmed availability</p>
                  <p className="text-xs text-red-500">All candidates were contacted but none accepted within the 12-hour window.</p>
                </div>
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Contacted Mentors</p>
                {candidates.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 text-xs py-1.5 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{c.name}</p>
                      <p className="text-gray-400">{c.role} · {c.company}</p>
                    </div>
                    <span className="text-red-400 font-medium">{c.outreachStatus}</span>
                  </div>
                ))}
                <Button variant="outline" className="w-full">Retry Matching</Button>
              </div>
            )}

            {/* DRAFT */}
            {req.status === "Draft" && (
              <div className="text-center py-8 space-y-3">
                <p className="text-sm font-medium text-gray-600">Request is in draft</p>
                <p className="text-xs text-gray-400">The mentee has not yet submitted this request. Once submitted it will move to "New".</p>
              </div>
            )}

            {/* CLOSED / EXPIRED */}
            {(req.status === "Closed - With Feedback" || req.status === "Closed - Feedback Pending" || req.status === "Expired") && (
              <div className="space-y-4">
                <div className={`border rounded-xl p-4 text-center space-y-2 ${req.status === "Closed - With Feedback" ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
                  <p className="text-sm font-medium text-gray-700">{req.status}</p>
                  {req.matchedMentor && <p className="text-xs text-gray-500">Matched with {req.matchedMentor}</p>}
                </div>
                {candidates.length > 0 && (
                  <>
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Match History</p>
                    {candidates.map((c) => (
                      <div key={c.id} className="flex items-center gap-3 text-xs py-1">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${c.outreachStatus === "Accepted" ? "bg-green-500" : "bg-gray-300"}`} />
                        <span className="font-medium text-gray-700">{c.name}</span>
                        <span className="text-gray-400 flex-1">{c.company}</span>
                        <span className="text-blue-600">{c.matchPercent}%</span>
                        <span className="text-gray-500">{c.outreachStatus}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
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

export default function ActiveRequests() {
  const [requests, setRequests] = useState<MentoringRequest[]>(
    mockRequests.filter((r) => ACTIVE_STATUSES.includes(r.status))
  )
  const [search, setSearch] = useState("")
  const [filterNGO, setFilterNGO] = useState("All")
  const [filterStatus, setFilterStatus] = useState("All")
  const [filterType, setFilterType] = useState("All")
  const [selectedReq, setSelectedReq] = useState<MentoringRequest | null>(null)

  const filtered = useMemo(() => requests.filter((r) => {
    const q = search.toLowerCase()
    return (
      (r.menteeName.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.theme.toLowerCase().includes(q) || r.skillsNeeded.some((s) => s.toLowerCase().includes(q))) &&
      (filterNGO === "All" || r.ngo === filterNGO) &&
      (filterStatus === "All" || r.status === filterStatus) &&
      (filterType === "All" || r.requestType === filterType)
    )
  }), [requests, search, filterNGO, filterStatus, filterType])

  const stats = {
    total: requests.length,
    approvalPending: requests.filter((r) => r.status === "Match Approval Pending").length,
    responsePending: requests.filter((r) => r.status === "Mentor Response Pending").length,
    matched: requests.filter((r) => r.status === "Matched").length,
  }

  const handleUpdate = (updated: MentoringRequest) => {
    setRequests((prev) => prev.map((r) => r.id === updated.id ? updated : r))
    setSelectedReq(updated)
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Active Requests</h1>
            <p className="text-sm text-gray-500 mt-0.5">Mentoring requests that are open and in progress</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Active Requests", value: stats.total, color: "text-gray-900" },
            { label: "Approval Pending", value: stats.approvalPending, color: "text-amber-600" },
            { label: "Mentor Response Pending", value: stats.responsePending, color: "text-yellow-600" },
            { label: "Matched", value: stats.matched, color: "text-green-600" },
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
              <Input placeholder="Search by mentee, ID, skill, theme…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
            <Select value={filterStatus} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)} className="w-52">
              <option>All</option>
              {ACTIVE_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Request Type</label>
            <Select value={filterType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterType(e.target.value)} className="w-40">
              <option>All</option>
              <option>New Mentor</option>
              <option>Existing Mentor</option>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Mentee / Group</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Theme</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Target Domain</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Skills</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Matched Mentor</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Days</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-400">No active requests match your filters</td></tr>
              ) : filtered.map((req) => (
                <tr key={req.id}
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedReq?.id === req.id ? "bg-blue-50" : ""}`}
                  onClick={() => setSelectedReq(selectedReq?.id === req.id ? null : req)}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 text-xs">{req.menteeName}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[120px]">{req.menteeGroup}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(req.requestDate)}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-800 max-w-[160px] line-clamp-2">{req.theme}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-700 max-w-[120px] truncate">{req.targetDomain}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {req.skillsNeeded.slice(0, 2).map((s) => (
                        <span key={s} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                      {req.skillsNeeded.length > 2 && <span className="text-xs text-gray-400">+{req.skillsNeeded.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeVariant[req.requestType]}`}>{req.requestType}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[req.status]} className="whitespace-nowrap">{req.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {req.matchedMentor
                      ? <span className="text-gray-900">{req.matchedMentor}</span>
                      : <span className="text-gray-400 italic">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 text-center">{req.activeDays}</td>
                  <td className="px-4 py-3">
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Pane */}
      {selectedReq && (
        <RequestPane
          key={selectedReq.id}
          request={selectedReq}
          onClose={() => setSelectedReq(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}
