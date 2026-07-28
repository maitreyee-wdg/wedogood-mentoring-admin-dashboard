import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import {
  mockRequests, matchingTemplates, ACTIVE_STATUSES, ALL_STATUSES,
  type MentoringRequest, type RequestStatus, type MatchCandidate,
} from "@/data/requestsData"
import {
  Search, X, ChevronUp, ChevronDown, Plus, Check,
  MessageSquare, Users, Clock, ArrowRight, AlertCircle, RefreshCw, Pencil,
} from "lucide-react"
import { EditEngagementModal } from "@/components/EditEngagementModal"
import { mockPrograms } from "@/data/programsData"
import { mockVolunteerGroups } from "@/data/groupsData"

// ── Status config ─────────────────────────────────────────────────────────────

const statusVariant: Record<RequestStatus, "default" | "success" | "warning" | "secondary" | "outline" | "destructive"> = {
  "Draft": "secondary",
  "New": "default",
  "Match Approval Pending": "warning",
  "Mentor Response Pending": "warning",
  "No Match Found": "destructive",
  "Matched": "success",
  "Accessed Contact": "default",
  "Call Done — Feedback Pending": "warning",
  "Closed": "secondary",
  "Expired": "secondary",
}

const typeVariant: Record<string, string> = {
  "New Mentor": "bg-blue-100 text-blue-700",
  "Existing Mentor": "bg-purple-100 text-purple-700",
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

// ── Request Side Pane (shared with ActiveRequests) ────────────────────────────

function RequestPane({ request: initial, onClose, onUpdate }: {
  request: MentoringRequest
  onClose: () => void
  onUpdate: (r: MentoringRequest) => void
}) {
  const [tab, setTab] = useState<"overview" | "ai-chat" | "match">("overview")
  const [req, setReq] = useState<MentoringRequest>(initial)
  const [selectedTemplate, setSelectedTemplate] = useState(req.approvedTemplate ?? "")
  const [candidates, setCandidates] = useState<MatchCandidate[]>(req.matchCandidates)
  const [showEditModal, setShowEditModal] = useState(false)

  const handleEditSave = (updates: Partial<MentoringRequest>) => {
    const updated: MentoringRequest = { ...req, ...updates }
    setReq(updated); onUpdate(updated); setShowEditModal(false)
  }

  const moveUp = (i: number) => {
    if (i === 0) return
    const next = [...candidates]; [next[i - 1], next[i]] = [next[i], next[i - 1]]; setCandidates(next)
  }
  const moveDown = (i: number) => {
    if (i === candidates.length - 1) return
    const next = [...candidates]; [next[i], next[i + 1]] = [next[i + 1], next[i]]; setCandidates(next)
  }
  const removeCandidate = (id: string) => setCandidates(candidates.filter((c) => c.id !== id))

  const handleApprove = () => {
    const updated: MentoringRequest = {
      ...req,
      status: "Mentor Response Pending",
      approvedTemplate: selectedTemplate,
      matchCandidates: candidates.map((c) => ({ ...c, outreachStatus: "Sent", outreachSentAt: new Date().toISOString() })),
    }
    setReq(updated); setCandidates(updated.matchCandidates); onUpdate(updated)
  }

  const outreachStatusIcon = (s: MatchCandidate["outreachStatus"]) => {
    if (s === "Accepted") return <Check className="w-3.5 h-3.5 text-green-500" />
    if (s === "No Response" || s === "Declined") return <X className="w-3.5 h-3.5 text-red-400" />
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
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
        <div>
          <p className="font-semibold text-gray-900 text-sm">{req.id}</p>
          <p className="text-xs text-gray-500">{req.menteeName} · {req.menteeGroup}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant[req.status]}>{req.status}</Badge>
          <button onClick={() => setShowEditModal(true)} className="text-gray-400 hover:text-gray-600" title="Edit engagement">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
      </div>

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

      <div className="flex-1 overflow-y-auto">

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
                <div><span className="text-gray-400">Program</span>
                  <p className="text-gray-800 mt-0.5">{mockPrograms.find(p => p.id === req.programId)?.name ?? "No Program"}</p>
                </div>
              </div>
            </PaneSection>
            <PaneSection label="Theme / Summary"><p className="text-gray-800">{req.theme}</p></PaneSection>
            <PaneSection label="Target Domain & Role">
              <p className="text-gray-800 font-medium">{req.targetDomain}</p>
              <p className="text-gray-500 text-xs">{req.targetRole}</p>
            </PaneSection>
            <PaneSection label="Skills Needed">
              <div className="flex flex-wrap gap-1.5">
                {req.skillsNeeded.map((s) => <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{s}</span>)}
              </div>
            </PaneSection>
            <PaneSection label="Matched Mentor">
              {req.matchedMentor ? <p className="text-gray-800 font-medium">{req.matchedMentor}</p> : <p className="text-gray-400 italic text-xs">No mentor matched yet</p>}
            </PaneSection>
            {(req.status === "No Match Found" || req.status === "Mentor Response Pending" || req.status === "Matched" || req.status === "Match Approval Pending") && (
              <button
                onClick={() => alert("Rematch triggered for " + req.id)}
                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 transition-colors text-sm font-medium">
                <RefreshCw className="w-4 h-4" />
                Trigger Rematch
              </button>
            )}
          </div>
        )}

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

        {tab === "match" && (
          <div className="px-5 py-4 space-y-5 text-sm">

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
                          <div className="flex flex-col items-center gap-0.5">
                            <button onClick={() => moveUp(i)} disabled={i === 0} className="text-gray-300 hover:text-gray-600 disabled:opacity-30"><ChevronUp className="w-3.5 h-3.5" /></button>
                            <span className="text-xs font-bold text-gray-500 w-4 text-center">{i + 1}</span>
                            <button onClick={() => moveDown(i)} disabled={i === candidates.length - 1} className="text-gray-300 hover:text-gray-600 disabled:opacity-30"><ChevronDown className="w-3.5 h-3.5" /></button>
                          </div>
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
                    {matchingTemplates.map((t) => <option key={t.id} value={t.id}>{t.name} — {t.description}</option>)}
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

            {req.status === "Mentor Response Pending" && (
              <div className="space-y-4">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Outreach Progress</p>
                <div className="space-y-0">
                  {candidates.map((c, i) => {
                    const isCurrent = c.outreachStatus === "Sent"
                    const isDone = ["Accepted", "No Response", "Declined"].includes(c.outreachStatus)
                    const isPending = c.outreachStatus === "Pending"
                    return (
                      <div key={c.id} className="relative flex gap-3">
                        {i < candidates.length - 1 && <div className="absolute left-[13px] top-8 w-0.5 h-full bg-gray-200" />}
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 mt-0.5 ${isCurrent ? "bg-amber-100" : isDone && c.outreachStatus !== "Accepted" ? "bg-red-50" : c.outreachStatus === "Accepted" ? "bg-green-100" : "bg-gray-100"}`}>
                          {outreachStatusIcon(c.outreachStatus)}
                        </div>
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
                    <div className="flex-1"><span className="font-medium text-gray-800">{c.name}</span><span className="text-gray-400 ml-1">· {c.company}</span></div>
                    <span className="text-gray-500">{c.matchPercent}%</span>
                    <span className={c.outreachStatus === "Accepted" ? "text-green-600" : c.outreachStatus === "Pending" ? "text-gray-400" : "text-red-400"}>{c.outreachStatus}</span>
                  </div>
                ))}
              </div>
            )}

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
                    <div className="flex-1"><p className="font-medium text-gray-800">{c.name}</p><p className="text-gray-400">{c.role} · {c.company}</p></div>
                    <span className="text-red-400 font-medium">{c.outreachStatus}</span>
                  </div>
                ))}
                <Button variant="outline" className="w-full flex items-center gap-2 justify-center text-orange-700 border-orange-200 hover:bg-orange-50"
                  onClick={() => alert("Rematch triggered for " + req.id)}>
                  <RefreshCw className="w-3.5 h-3.5" /> Trigger Rematch
                </Button>
              </div>
            )}

            {req.status === "Draft" && (
              <div className="text-center py-8 space-y-3">
                <p className="text-sm font-medium text-gray-600">Request is in draft</p>
                <p className="text-xs text-gray-400">The mentee has not yet submitted this request.</p>
              </div>
            )}

            {(req.status === "Call Done — Feedback Pending" || req.status === "Closed" || req.status === "Expired") && (
              <div className="space-y-4">
                <div className="border rounded-xl p-4 text-center space-y-2 bg-gray-50 border-gray-200">
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

      {showEditModal && (
        <EditEngagementModal
          request={req}
          onSave={handleEditSave}
          onClose={() => setShowEditModal(false)}
        />
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

// ── Bulk Rematch modal — scope choice for engagements with no Program ────────

function BulkRematchModal({ count, onConfirm, onClose }: {
  count: number
  onConfirm: (groupNames: string[]) => void
  onClose: () => void
}) {
  const [scopeMode, setScopeMode] = useState<"all" | "specific">("all")
  const [scopeGroups, setScopeGroups] = useState<string[]>([])
  const [showList, setShowList] = useState(false)
  const toggleGroup = (name: string) =>
    setScopeGroups((prev) => prev.includes(name) ? prev.filter((g) => g !== name) : [...prev, name])

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-[440px]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Trigger Rematch for {count} engagement{count !== 1 ? "s" : ""}?</h2>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            Candidate lists will be cleared and matching will restart for all selected engagements. Engagements already tagged to a Program keep matching from that Program's Volunteer Organizations — this choice only applies to the rest.
          </p>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">Match from (for engagements with no Program)</p>
            <div className="flex gap-2 mb-1.5">
              <button type="button" onClick={() => { setScopeMode("all"); setShowList(false) }}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${scopeMode === "all" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"}`}>
                All Volunteers
              </button>
              <button type="button" onClick={() => setScopeMode("specific")}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${scopeMode === "specific" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"}`}>
                Specific Groups
              </button>
            </div>
            {scopeMode === "specific" && (
              <div className="relative">
                <button type="button" onClick={() => setShowList((o) => !o)}
                  className="w-full text-left text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white flex items-center justify-between">
                  <span className="text-gray-600">{scopeGroups.length === 0 ? "Select volunteer groups…" : scopeGroups.join(", ")}</span>
                </button>
                {showList && (
                  <div className="absolute z-10 mt-1 w-full border border-gray-200 rounded-lg bg-white shadow-md max-h-48 overflow-y-auto">
                    {mockVolunteerGroups.map((g) => (
                      <label key={g.id} className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer">
                        <input type="checkbox" checked={scopeGroups.includes(g.name)} onChange={() => toggleGroup(g.name)} />
                        {g.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white" onClick={() => onConfirm(scopeMode === "specific" ? scopeGroups : [])}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Yes, Trigger Rematch
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AllRequests() {
  const [requests, setRequests] = useState<MentoringRequest[]>(mockRequests)
  const [search, setSearch] = useState("")
  const [filterNGO, setFilterNGO] = useState("All")
  const [filterStatus, setFilterStatus] = useState("All")
  const [filterType, setFilterType] = useState("All")
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all")
  const [selectedReq, setSelectedReq] = useState<MentoringRequest | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showBulkRematch, setShowBulkRematch] = useState(false)
  const [bulkProgramChoice, setBulkProgramChoice] = useState("")
  const [pendingBulkProgramId, setPendingBulkProgramId] = useState<string | null>(null)

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  const toggleSelectAll = () => {
    setSelectedIds((prev) => prev.size === filtered.length ? new Set() : new Set(filtered.map((r) => r.id)))
  }
  const clearSelection = () => setSelectedIds(new Set())

  const filtered = useMemo(() => requests.filter((r) => {
    const q = search.toLowerCase()
    const isActive = ACTIVE_STATUSES.includes(r.status)
    return (
      (r.menteeName.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.theme.toLowerCase().includes(q) || r.skillsNeeded.some((s) => s.toLowerCase().includes(q))) &&
      (filterNGO === "All" || r.ngo === filterNGO) &&
      (filterStatus === "All" || r.status === filterStatus) &&
      (filterType === "All" || r.requestType === filterType) &&
      (filterActive === "all" || (filterActive === "active" ? isActive : !isActive))
    )
  }), [requests, search, filterNGO, filterStatus, filterType, filterActive])

  const stats = {
    total: requests.length,
    active: requests.filter((r) => ACTIVE_STATUSES.includes(r.status)).length,
    matched: requests.filter((r) => r.status === "Matched").length,
    closed: requests.filter((r) => r.status === "Closed" || r.status === "Call Done — Feedback Pending").length,
  }

  const handleUpdate = (updated: MentoringRequest) => {
    setRequests((prev) => prev.map((r) => r.id === updated.id ? updated : r))
    setSelectedReq(updated)
  }

  const bulkAssignProgram = (programId: string) => {
    if (!programId) return
    const conflicts = requests.filter((r) => selectedIds.has(r.id) && r.programId && r.programId !== programId).length
    if (conflicts > 0) {
      setPendingBulkProgramId(programId)
    } else {
      setRequests((prev) => prev.map((r) => selectedIds.has(r.id) ? { ...r, programId } : r))
      setBulkProgramChoice("")
      clearSelection()
    }
  }

  const confirmBulkProgram = () => {
    if (!pendingBulkProgramId) return
    setRequests((prev) => prev.map((r) => selectedIds.has(r.id) ? { ...r, programId: pendingBulkProgramId } : r))
    setPendingBulkProgramId(null)
    setBulkProgramChoice("")
    clearSelection()
  }

  const cancelBulkProgram = () => {
    setPendingBulkProgramId(null)
    setBulkProgramChoice("")
  }

  // Note: the chosen groupNames scope is used for this rematch action only —
  // like the individual rematch flow, it isn't persisted onto the engagement.
  const bulkRematch = () => {
    setRequests((prev) => prev.map((r) =>
      selectedIds.has(r.id) ? { ...r, status: "New", matchedMentor: null, matchCandidates: [] } : r
    ))
    setShowBulkRematch(false)
    clearSelection()
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">All Engagements</h1>
            <p className="text-sm text-gray-500 mt-0.5">Complete history of all mentoring requests across all statuses</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Engagements", value: stats.total, color: "text-gray-900" },
            { label: "Active", value: stats.active, color: "text-blue-600" },
            { label: "Matched", value: stats.matched, color: "text-green-600" },
            { label: "Closed w/ Feedback", value: stats.closed, color: "text-purple-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Active / Inactive toggle */}
        <div className="flex gap-2">
          {(["all", "active", "inactive"] as const).map((v) => (
            <button key={v} onClick={() => setFilterActive(v)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${filterActive === v ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {v === "all" ? "All" : v === "active" ? "Active" : "Inactive / Closed"}
            </button>
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
              {ALL_STATUSES.map((s) => <option key={s}>{s}</option>)}
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

        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-gray-700">
            <span className="text-sm font-medium">{selectedIds.size} engagement{selectedIds.size !== 1 ? "s" : ""} selected</span>
            <div className="w-px h-5 bg-gray-600" />
            <button
              onClick={() => setShowBulkRematch(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-white text-xs font-semibold rounded-lg transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Trigger Rematch
            </button>
            <button
              onClick={() => { alert("Close Engagements: " + Array.from(selectedIds).join(", ")); clearSelection() }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold rounded-lg transition-colors">
              <X className="w-3.5 h-3.5" /> Close Engagements
            </button>
            <select
              value={bulkProgramChoice}
              onChange={(e) => { setBulkProgramChoice(e.target.value); bulkAssignProgram(e.target.value) }}
              className="text-xs font-semibold rounded-lg px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white border-none outline-none cursor-pointer">
              <option value="" disabled>Assign to Program…</option>
              {mockPrograms.map((p) => <option key={p.id} value={p.id} className="text-gray-900">{p.name}</option>)}
            </select>
            <button onClick={clearSelection} className="text-gray-400 hover:text-white ml-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 w-8">
                  <input type="checkbox"
                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600 cursor-pointer" />
                </th>
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
                <tr><td colSpan={11} className="px-4 py-8 text-center text-gray-400">No requests match your filters</td></tr>
              ) : filtered.map((req) => (
                <tr key={req.id}
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedReq?.id === req.id ? "bg-blue-50" : ""} ${selectedIds.has(req.id) ? "bg-orange-50/40" : ""}`}
                  onClick={() => setSelectedReq(selectedReq?.id === req.id ? null : req)}>
                  <td className="px-4 py-3 w-8" onClick={(e) => toggleSelect(req.id, e)}>
                    <input type="checkbox" checked={selectedIds.has(req.id)} onChange={() => {}}
                      className="rounded border-gray-300 text-orange-500 cursor-pointer" />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 text-xs">{req.menteeName}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[120px]">{req.menteeGroup}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(req.requestDate)}</td>
                  <td className="px-4 py-3"><p className="text-xs text-gray-800 max-w-[160px] line-clamp-2">{req.theme}</p></td>
                  <td className="px-4 py-3"><p className="text-xs text-gray-700 max-w-[120px] truncate">{req.targetDomain}</p></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {req.skillsNeeded.slice(0, 2).map((s) => <span key={s} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{s}</span>)}
                      {req.skillsNeeded.length > 2 && <span className="text-xs text-gray-400">+{req.skillsNeeded.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeVariant[req.requestType]}`}>{req.requestType}</span></td>
                  <td className="px-4 py-3"><Badge variant={statusVariant[req.status]} className="whitespace-nowrap">{req.status}</Badge></td>
                  <td className="px-4 py-3 text-xs">{req.matchedMentor ? <span className="text-gray-900">{req.matchedMentor}</span> : <span className="text-gray-400 italic">—</span>}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 text-center">{req.activeDays}</td>
                  <td className="px-4 py-3"><ArrowRight className="w-4 h-4 text-gray-400" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReq && (
        <RequestPane key={selectedReq.id} request={selectedReq} onClose={() => setSelectedReq(null)} onUpdate={handleUpdate} />
      )}
      {showBulkRematch && (
        <BulkRematchModal
          count={selectedIds.size}
          onConfirm={bulkRematch}
          onClose={() => setShowBulkRematch(false)}
        />
      )}
      {pendingBulkProgramId && (() => {
        const conflicts = requests.filter((r) => selectedIds.has(r.id) && r.programId && r.programId !== pendingBulkProgramId).length
        const newProgramName = mockPrograms.find((p) => p.id === pendingBulkProgramId)?.name
        return (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-[420px]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Overwrite existing Program?</h2>
                <button onClick={cancelBulkProgram}><X className="w-4 h-4 text-gray-400" /></button>
              </div>
              <div className="px-6 py-5">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {conflicts} of the selected engagement{conflicts !== 1 ? "s" : ""} already {conflicts !== 1 ? "have" : "has"} a different Program tagged. Continuing will replace it with <span className="font-medium text-gray-800">{newProgramName}</span> for all selected engagements.
                </p>
              </div>
              <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
                <Button variant="outline" className="flex-1" onClick={cancelBulkProgram}>Cancel</Button>
                <Button className="flex-1" onClick={confirmBulkProgram}>Confirm Change</Button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
