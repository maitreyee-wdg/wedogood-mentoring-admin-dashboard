import { useState, useMemo, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import {
  AlertTriangle, Bot, MessageSquare, ExternalLink, User, Clock,
  Search, CheckCircle2, Circle, Loader2, Phone, Star, Calendar,
  Briefcase, Send, FileText, ArrowLeft, Zap, ShieldAlert,
  HelpCircle, Frown, WifiOff, TicketCheck, X,
  LayoutList, LayoutGrid, Cpu, PauseCircle, PlayCircle, UserX,
} from "lucide-react"
import {
  mockEscalations,
  type Escalation,
  type EscalationStatus,
  type EscalationPriority,
  type EscalationSource,
} from "@/data/escalationsData"
import { mockRequests } from "@/data/requestsData"
import { mockMentees } from "@/data/menteesData"
import { useNavigate } from "react-router-dom"

// ─── tiny helpers ─────────────────────────────────────────────────────────────

function ago(iso: string) {
  const d = Date.now() - new Date(iso).getTime(), m = Math.floor(d / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
function fmtT(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
}
function ini(name: string) { return name.split(" ").map(n => n[0]).join("").toUpperCase() }

// ─── config ───────────────────────────────────────────────────────────────────

const PRI: Record<EscalationPriority, { cls: string; dot: string }> = {
  High:   { cls: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-400" },
  Medium: { cls: "bg-yellow-50 text-yellow-700 border-yellow-200", dot: "bg-yellow-400" },
  Low:    { cls: "bg-gray-100 text-gray-500 border-gray-200",       dot: "bg-gray-300"  },
}
const STS: Record<EscalationStatus, { cls: string; Icon: React.ElementType }> = {
  "Open":        { cls: "bg-gray-100 text-gray-700 border-gray-200",   Icon: Circle       },
  "In Progress": { cls: "bg-blue-50 text-blue-700 border-blue-200",    Icon: Loader2      },
  "Resolved":    { cls: "bg-green-50 text-green-700 border-green-200", Icon: CheckCircle2 },
}
const SRC: Record<EscalationSource, { cls: string; Icon: React.ElementType }> = {
  "AI-Raised": { cls: "bg-purple-50 text-purple-700 border-purple-200", Icon: Bot  },
  "Mentee":    { cls: "bg-sky-50 text-sky-700 border-sky-200",           Icon: User },
  "Mentor":    { cls: "bg-teal-50 text-teal-700 border-teal-200",        Icon: User },
  "System":    { cls: "bg-rose-50 text-rose-700 border-rose-200",        Icon: Cpu  },
}
const CAT_I: Record<string, React.ElementType> = {
  "Safety Concern": ShieldAlert, "Match Dissatisfaction": Frown,
  "Unresponsive": WifiOff, "Platform Issue": AlertTriangle,
  "General Support": HelpCircle, "Request-Related": Briefcase,
  "No Candidates Found": UserX, "All Mentors Declined": UserX,
}
const NGO_C: Record<string, string> = {
  "Akanksha Foundation": "bg-blue-100 text-blue-700",
  "NavGurukul":          "bg-green-100 text-green-700",
  "Parivarthan":         "bg-purple-100 text-purple-700",
}
const nc = (n?: string) => NGO_C[n ?? ""] ?? "bg-gray-100 text-gray-600"

// ─── badges ───────────────────────────────────────────────────────────────────

function PBadge({ p }: { p: EscalationPriority }) {
  const c = PRI[p]
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${c.cls}`}><span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />{p}</span>
}
function SBadge({ s }: { s: EscalationStatus }) {
  const c = STS[s]
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${c.cls}`}><c.Icon className="w-3 h-3" />{s}</span>
}
function RBadge({ s }: { s: EscalationSource }) {
  const c = SRC[s]
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${c.cls}`}><c.Icon className="w-3 h-3" />{s}</span>
}

// ─── mock chat sessions ───────────────────────────────────────────────────────

const CHATS = [
  {
    id: "CHAT-001", personId: "MTE-001", personName: "Priya Sharma", personNGO: "Akanksha Foundation",
    agentName: "Mira (Onboarding)", requestId: "REQ-001", startedAt: "2026-04-30T10:00:00", linkedEscId: "ESC-002",
    msgs: [
      { from: "bot"    as const, text: "Hi Priya! 👋 I'm Mira from WeDoGood. What would you like guidance with?",                     ts: "2026-04-30T10:00:00" },
      { from: "mentee" as const, text: "I need help writing my resume and preparing for job interviews",                               ts: "2026-04-30T10:01:30" },
      { from: "bot"    as const, text: "Great goal! Are you currently a student or already working?",                                 ts: "2026-04-30T10:01:45" },
      { from: "mentee" as const, text: "I'm in 12th grade, finishing soon, want to start applying for jobs",                          ts: "2026-04-30T10:02:20" },
      { from: "bot"    as const, text: "Got it! Any specific industry in mind?",                                                      ts: "2026-04-30T10:02:35" },
      { from: "mentee" as const, text: "Not really — maybe HR or admin roles",                                                        ts: "2026-04-30T10:03:10" },
      { from: "bot"    as const, text: "Perfect. I'll find you a mentor in HR and career coaching. You'll hear from me soon! 🎯",     ts: "2026-04-30T10:03:25" },
    ],
  },
  {
    id: "CHAT-002", personId: "MTE-002", personName: "Arjun Patel", personNGO: "NavGurukul",
    agentName: "Mira (Onboarding)", requestId: "REQ-002", startedAt: "2026-05-02T18:00:00", linkedEscId: "ESC-001",
    msgs: [
      { from: "bot"    as const, text: "Hi Arjun! 👋 What skill or career area would you like mentoring on?",                        ts: "2026-05-02T18:00:00" },
      { from: "mentee" as const, text: "I'm self-taught, want a job in software. I know React & Node but dropped out of college",     ts: "2026-05-02T18:01:00" },
      { from: "bot"    as const, text: "Solid foundation! Job search, technical prep, or portfolio?",                                 ts: "2026-05-02T18:01:30" },
      { from: "mentee" as const, text: "Mainly code reviews and understanding what companies look for",                               ts: "2026-05-02T18:02:00" },
      { from: "bot"    as const, text: "I'll find you a senior engineer for code reviews and job guidance. Request created! 🚀",      ts: "2026-05-02T18:02:20" },
    ],
  },
  {
    id: "CHAT-003", personId: "MTE-006", personName: "Siddharth Kumar", personNGO: "Akanksha Foundation",
    agentName: "A6 Feedback Agent", requestId: "REQ-006", startedAt: "2026-06-01T12:00:00", linkedEscId: "ESC-005",
    msgs: [
      { from: "bot"    as const, text: "Hi Siddharth! Your session is complete. 5 quick questions — under 2 min. Ready?",            ts: "2026-06-01T12:00:00" },
      { from: "mentee" as const, text: "Sure",                                                                                        ts: "2026-06-01T12:01:00" },
      { from: "bot"    as const, text: "How satisfied were you with your mentor overall? (1–5)",                                      ts: "2026-06-01T12:01:10" },
      { from: "mentee" as const, text: "4",                                                                                           ts: "2026-06-01T12:01:40" },
      { from: "bot"    as const, text: "Did the session cover what you needed?",                                                      ts: "2026-06-01T12:01:55" },
      { from: "mentee" as const, text: "Mostly yes, but I'm confused about what happens next",                                        ts: "2026-06-01T12:02:30" },
    ],
  },
  {
    id: "CHAT-004", personId: "MTE-004", personName: "Rohan Das", personNGO: "Akanksha Foundation",
    agentName: "A7 Support Escalation", requestId: undefined, startedAt: "2026-06-03T20:05:00", linkedEscId: "ESC-004",
    msgs: [
      { from: "mentee" as const, text: "The app keeps crashing when I try to view my mentor's profile. Tried 3 times.",              ts: "2026-06-03T20:05:00" },
      { from: "bot"    as const, text: "Sorry to hear that! I've flagged this — an admin will follow up shortly.",                    ts: "2026-06-03T20:05:10" },
      { from: "mentee" as const, text: "Ok thanks. When will it be fixed?",                                                           ts: "2026-06-03T20:06:00" },
      { from: "bot"    as const, text: "Our team will look into it ASAP. I've created a ticket on your behalf. 🎫",                   ts: "2026-06-03T20:06:15" },
    ],
  },
]
type Chat = typeof CHATS[number]

// ─── Ticket detail pane ───────────────────────────────────────────────────────

function TicketPane({ esc, onClose, onStatusChange }: {
  esc: Escalation
  onClose: () => void
  onStatusChange: (id: string, s: EscalationStatus) => void
}) {
  const navigate = useNavigate()
  const [tab, setTab]       = useState<"context" | "conversation" | "actions">("context")
  const [botMsg, setBotMsg] = useState("")
  const [botLog, setBotLog] = useState<Array<{ side: "admin" | "bot"; text: string; t: string }>>([
    { side: "bot", text: `Hi! I can help you reach ${esc.personName} through the platform chat.`, t: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) },
  ])
  const [noteText, setNoteText] = useState("")
  const [notes, setNotes]       = useState(esc.internalNotes)

  const lr    = esc.linkedRequestId ? mockRequests.find(r => r.id === esc.linkedRequestId) : null
  const reqs  = mockRequests.filter(r => esc.personType === "Mentee" ? r.menteeId === esc.personId : r.matchedMentor === esc.personName)
  const mt    = esc.personType === "Mentee" ? mockMentees.find(m => m.id === esc.personId) : null
  const prior = mockEscalations.filter(e => e.personId === esc.personId && e.id !== esc.id).length
  const CI    = CAT_I[esc.category] ?? HelpCircle

  function sendBot() {
    if (!botMsg.trim()) return
    const t = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    setBotLog(p => [...p, { side: "admin", text: botMsg, t }, { side: "bot", text: `Sent to ${esc.personName} via platform chat.`, t }])
    setBotMsg("")
  }
  function addNote() {
    if (!noteText.trim()) return
    setNotes(p => [...p, { sender: "admin" as const, text: noteText, timestamp: new Date().toISOString(), channel: "internal" as const }])
    setNoteText("")
  }

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 w-[480px] shrink-0">
      {/* header */}
      <div className="px-5 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <button onClick={onClose} className="mt-0.5 text-gray-400 hover:text-gray-600 shrink-0"><ArrowLeft className="w-4 h-4" /></button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-mono text-gray-400">{esc.id}</span>
                <PBadge p={esc.priority} /><SBadge s={esc.status} />
              </div>
              <p className="text-sm font-semibold text-gray-900 mt-1">{esc.personName}<span className="font-normal text-gray-400"> · {esc.personType}</span></p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                <RBadge s={esc.source} />
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-gray-50 text-gray-600 border-gray-200"><CI className="w-3 h-3" />{esc.category}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 shrink-0">
            {esc.status === "Open" && <Button size="sm" variant="outline" className="text-xs h-7 text-blue-700 border-blue-200 hover:bg-blue-50" onClick={() => onStatusChange(esc.id, "In Progress")}>Take On</Button>}
            {esc.status !== "Resolved" && <Button size="sm" variant="outline" className="text-xs h-7 text-green-700 border-green-200 hover:bg-green-50" onClick={() => onStatusChange(esc.id, "Resolved")}><CheckCircle2 className="w-3 h-3 mr-1" />Resolve</Button>}
          </div>
        </div>
        <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
          <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><MessageSquare className="w-3 h-3" />Trigger · {ago(esc.createdAt)}</p>
          <p className="text-sm text-gray-800 italic">"{esc.triggerMessage}"</p>
          {esc.aiSummary && <p className="text-xs text-purple-600 mt-2 flex items-start gap-1"><Bot className="w-3 h-3 mt-0.5 shrink-0" />{esc.aiSummary}</p>}
        </div>
      </div>

      {/* tabs */}
      <div className="flex border-b border-gray-200 px-5 shrink-0">
        {(["context", "conversation", "actions"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${tab === t ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-800"}`}>{t}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* context */}
        {tab === "context" && (
          <div className="p-5 space-y-5">
            {prior > 0 && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-600 shrink-0" />
                <p className="text-xs text-yellow-800"><span className="font-semibold">{prior} prior escalation{prior > 1 ? "s" : ""}</span> from this person.</p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Profile</p>
              <div className="rounded-xl border border-gray-200 p-4 space-y-2.5">
                <div className="flex items-start justify-between">
                  <div><p className="font-semibold text-gray-900">{esc.personName}</p><p className="text-xs text-gray-400">{esc.personType}</p></div>
                  {esc.personRating && <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-current text-yellow-400" /><span className="text-sm font-medium text-gray-700">{esc.personRating}</span></div>}
                </div>
                <div className="grid grid-cols-2 gap-y-1.5 text-xs text-gray-600">
                  {esc.personNGO   && <div className="flex items-center gap-1.5"><Briefcase className="w-3 h-3 text-gray-400" />{esc.personNGO}</div>}
                  {esc.personGroup && <div className="flex items-center gap-1.5"><User className="w-3 h-3 text-gray-400" />{esc.personGroup}</div>}
                  <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-gray-400" />{esc.personPhone}</div>
                  {esc.personJoinedAt && <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-gray-400" />Joined {new Date(esc.personJoinedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</div>}
                </div>
                {mt && mt.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {mt.skills.slice(0, 4).map(s => <span key={s} className="px-1.5 py-0.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">{s}</span>)}
                    {mt.skills.length > 4 && <span className="text-xs text-gray-400 self-center">+{mt.skills.length - 4}</span>}
                  </div>
                )}
                <div className="flex gap-2 pt-1 border-t border-gray-100">
                  <Button size="sm" variant="outline" className="text-xs h-7 flex-1" onClick={() => navigate(esc.personType === "Mentee" ? "/mentees/comms" : "/volunteers/comms")}><MessageSquare className="w-3 h-3 mr-1" />WhatsApp</Button>
                  <Button size="sm" variant="outline" className="text-xs h-7 flex-1" onClick={() => navigate(esc.personType === "Mentee" ? "/mentees" : "/volunteers/mentors")}><ExternalLink className="w-3 h-3 mr-1" />View Profile</Button>
                </div>
              </div>
            </div>
            {lr && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Linked Request</p>
                <div className="rounded-xl border border-gray-200 p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div><p className="text-xs font-mono text-gray-400">{lr.id}</p><p className="text-sm font-medium text-gray-800 leading-tight mt-0.5">{lr.theme}</p></div>
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium border ${lr.status === "Matched" ? "bg-green-50 text-green-700 border-green-200" : lr.status.startsWith("Closed") ? "bg-gray-100 text-gray-500 border-gray-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>{lr.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                    <span><span className="text-gray-400">Domain: </span>{lr.targetDomain}</span>
                    <span><span className="text-gray-400">Active: </span>{lr.activeDays}d</span>
                    {lr.matchedMentor && <span className="col-span-2"><span className="text-gray-400">Mentor: </span>{lr.matchedMentor}</span>}
                  </div>
                  <Button size="sm" variant="outline" className="text-xs h-7 w-full" onClick={() => navigate("/mentees/all-requests")}><ExternalLink className="w-3 h-3 mr-1" />Open in All Requests</Button>
                </div>
              </div>
            )}
            {/* Match failure: candidates attempted */}
            {esc.candidatesAttempted !== undefined && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <UserX className="w-3.5 h-3.5 text-rose-400" />
                  Outreach Attempts ({esc.candidatesAttempted.length})
                </p>
                {esc.matchFailureReason && (
                  <div className="mb-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-700 leading-relaxed">
                    {esc.matchFailureReason}
                  </div>
                )}
                {esc.candidatesAttempted.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-xs text-gray-400">
                    No outreach was sent — no candidates met the match threshold.
                  </div>
                ) : (
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left px-3 py-2 font-semibold text-gray-400 uppercase tracking-wide">Mentor</th>
                          <th className="text-center px-3 py-2 font-semibold text-gray-400 uppercase tracking-wide">Match</th>
                          <th className="text-left px-3 py-2 font-semibold text-gray-400 uppercase tracking-wide">Outcome</th>
                          <th className="text-left px-3 py-2 font-semibold text-gray-400 uppercase tracking-wide">Sent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {esc.candidatesAttempted.map((c, i) => {
                          const statusCls =
                            c.outreachStatus === "Declined"    ? "bg-rose-50 text-rose-700 border-rose-200" :
                            c.outreachStatus === "No Response" ? "bg-amber-50 text-amber-700 border-amber-200" :
                            c.outreachStatus === "Accepted"    ? "bg-green-50 text-green-700 border-green-200" :
                            "bg-gray-100 text-gray-500 border-gray-200"
                          return (
                            <tr key={i} className={`border-b border-gray-100 ${i % 2 !== 0 ? "bg-gray-50/40" : ""}`}>
                              <td className="px-3 py-2.5">
                                <p className="font-medium text-gray-800">{c.name}</p>
                                <p className="text-gray-400 truncate">{c.role} · {c.company}</p>
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <span className="font-semibold text-gray-700">{c.matchPercent}%</span>
                              </td>
                              <td className="px-3 py-2.5">
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full font-medium border ${statusCls}`}>
                                  {c.outreachStatus}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-gray-400">
                                {c.outreachSentAt
                                  ? new Date(c.outreachSentAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                                  : "—"}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Request History ({reqs.length})</p>
              {reqs.length === 0 ? <p className="text-xs text-gray-400 italic">No requests.</p> : (
                <div className="space-y-2">
                  {reqs.map(r => (
                    <div key={r.id} className={`rounded-lg border p-3 text-xs ${r.id === esc.linkedRequestId ? "border-blue-200 bg-blue-50/30" : "border-gray-100 bg-gray-50"}`}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-mono text-gray-400">{r.id}</span>
                        <span className={`px-1.5 py-0.5 rounded-full font-medium border ${r.status === "Matched" ? "bg-green-50 text-green-700 border-green-200" : r.status.startsWith("Closed") ? "bg-gray-100 text-gray-500 border-gray-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>{r.status}</span>
                      </div>
                      <p className="text-gray-700 font-medium">{r.theme}</p>
                      {r.matchedMentor && <p className="text-gray-400 mt-0.5">Mentor: {r.matchedMentor}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* conversation */}
        {tab === "conversation" && (
          <div className="p-5 space-y-5">
            <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-green-600" />WhatsApp Conversation</p>
                <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => navigate(esc.personType === "Mentee" ? "/mentees/comms" : "/volunteers/comms")}>Open <ExternalLink className="w-3 h-3 ml-1" /></Button>
              </div>
              <p className="text-xs text-gray-500">View and reply to {esc.personName}'s full WhatsApp thread.</p>
            </div>
            {lr && lr.aiConversation.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Bot className="w-3.5 h-3.5" />Mira Chat · {lr.id}</p>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-2 max-h-52 overflow-y-auto">
                  {lr.aiConversation.map((m, i) => (
                    <div key={i} className={`flex ${m.sender === "mira" ? "justify-start" : "justify-end"}`}>
                      <div className={`rounded-lg px-3 py-2 text-xs max-w-[85%] ${m.sender === "mira" ? "bg-purple-50 text-purple-900 border border-purple-100" : "bg-white text-gray-800 border border-gray-200"}`}>
                        <p className="font-medium text-[10px] mb-0.5 opacity-50">{m.sender === "mira" ? "Mira" : esc.personName}</p>{m.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Internal Notes</p>
              <div className="space-y-2 mb-3">
                {notes.length === 0 ? <p className="text-xs text-gray-400 italic">No notes yet.</p> : notes.map((n, i) => (
                  <div key={i} className="rounded-lg bg-yellow-50 border border-yellow-100 p-3 text-xs">
                    <div className="flex items-center justify-between mb-1"><span className="font-medium text-yellow-800">Admin</span><span className="text-yellow-600 text-[10px]">{fmtT(n.timestamp)}</span></div>
                    <p className="text-gray-700">{n.text}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add internal note…" className="text-xs h-8 flex-1" onKeyDown={e => e.key === "Enter" && addNote()} />
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={addNote}><FileText className="w-3 h-3 mr-1" />Add</Button>
              </div>
            </div>
          </div>
        )}

        {/* actions */}
        {tab === "actions" && (
          <div className="p-5 space-y-5">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Bot className="w-3.5 h-3.5" />Platform Bot Chat</p>
              <p className="text-xs text-gray-400 mb-3">Messages appear in {esc.personName}'s web app — separate from WhatsApp.</p>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-purple-700 px-3 py-2 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"><Bot className="w-3 h-3 text-white" /></div>
                  <span className="text-xs font-medium text-white">Admin → {esc.personName}</span>
                  <span className="ml-auto text-[10px] text-white/60">Platform Chat</span>
                </div>
                <div className="bg-gray-50 p-3 h-36 overflow-y-auto space-y-2">
                  {botLog.map((m, i) => (
                    <div key={i} className={`flex ${m.side === "admin" ? "justify-end" : "justify-start"}`}>
                      <div className={`rounded-lg px-3 py-2 text-xs max-w-[85%] ${m.side === "admin" ? "bg-purple-700 text-white" : "bg-white text-gray-700 border border-gray-200"}`}>
                        <p>{m.text}</p><p className={`text-[10px] mt-0.5 ${m.side === "admin" ? "text-white/50" : "text-gray-400"}`}>{m.t}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-gray-200 flex gap-2 bg-white">
                  <Input value={botMsg} onChange={e => setBotMsg(e.target.value)} placeholder="Type a message…" className="text-xs h-8 flex-1" onKeyDown={e => e.key === "Enter" && sendBot()} />
                  <Button size="sm" className="h-8 bg-purple-700 hover:bg-purple-800" onClick={sendBot}><Send className="w-3 h-3" /></Button>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick Actions</p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="text-xs h-9 justify-start gap-2" onClick={() => navigate(esc.personType === "Mentee" ? "/mentees/comms" : "/volunteers/comms")}><MessageSquare className="w-3.5 h-3.5 text-green-600" />Reply on WhatsApp</Button>
                {esc.linkedRequestId && <Button variant="outline" size="sm" className="text-xs h-9 justify-start gap-2" onClick={() => navigate("/mentees/all-requests")}><ExternalLink className="w-3.5 h-3.5 text-blue-600" />View Request</Button>}
                {esc.linkedMentor && <Button variant="outline" size="sm" className="text-xs h-9 justify-start gap-2"><Zap className="w-3.5 h-3.5 text-yellow-600" />Trigger Rematch</Button>}
                <Button variant="outline" size="sm" className="text-xs h-9 justify-start gap-2 text-gray-600"><ShieldAlert className="w-3.5 h-3.5 text-gray-400" />Flag Profile</Button>
                {esc.linkedRequestId && <Button variant="outline" size="sm" className="text-xs h-9 justify-start gap-2 col-span-2 text-gray-600"><X className="w-3.5 h-3.5" />Close Request</Button>}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Assigned To</p>
              <div className="flex gap-2"><Input defaultValue={esc.assignedTo ?? ""} placeholder="Assign to admin…" className="text-xs h-8 flex-1" /><Button size="sm" variant="outline" className="h-8 text-xs">Save</Button></div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Status</p>
              <div className="flex gap-2">{(["Open", "In Progress", "Resolved"] as EscalationStatus[]).map(s => <Button key={s} size="sm" variant={esc.status === s ? "default" : "outline"} className="text-xs h-8 flex-1" onClick={() => onStatusChange(esc.id, s)}>{s}</Button>)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Chats (full-height 3-panel, no outer scroll) ─────────────────────────────

function ChatsView({ escs, onSC }: { escs: Escalation[]; onSC: (id: string, s: EscalationStatus) => void }) {
  const [active, setActive]           = useState<Chat>(CHATS[0])
  const [showProf, setShowProf]       = useState(false)
  const [ticketId, setTicketId]       = useState<string | null>(null)
  const [search, setSearch]           = useState("")
  const [reply, setReply]             = useState("")
  const [extra, setExtra]             = useState<Record<string, Array<{ text: string; t: string }>>>({})
  const [humanTakeover, setHumanTakeover] = useState<Record<string, boolean>>({})
  const bottomRef                     = useRef<HTMLDivElement>(null)

  const isHT = humanTakeover[active.id] ?? false
  function toggleHT() { setHumanTakeover(p => ({ ...p, [active.id]: !p[active.id] })) }

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [active.id, extra])

  const sessions = useMemo(() => {
    if (!search) return CHATS
    const q = search.toLowerCase()
    return CHATS.filter(s => s.personName.toLowerCase().includes(q) || s.agentName.toLowerCase().includes(q) || (s.requestId ?? "").toLowerCase().includes(q))
  }, [search])

  function send() {
    if (!reply.trim()) return
    const t = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    setExtra(p => ({ ...p, [active.id]: [...(p[active.id] ?? []), { text: reply, t }] }))
    setReply("")
  }

  function toggleTicket(escId: string) {
    setTicketId(prev => prev === escId ? null : escId)
    setShowProf(false)
  }

  const linkedEsc    = active.linkedEscId ? escs.find(e => e.id === active.linkedEscId) : null
  const mentee       = mockMentees.find(m => m.id === active.personId)
  const personReqs   = mockRequests.filter(r => r.menteeId === active.personId)
  const openedTicket = ticketId ? escs.find(e => e.id === ticketId) ?? null : null

  const allMsgs = useMemo(() => [
    ...active.msgs.map(m => ({ side: m.from, text: m.text, t: new Date(m.ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) })),
    ...(extra[active.id] ?? []).map(m => ({ side: "admin" as const, text: m.text, t: m.t })),
  ], [active, extra])

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* session list */}
      <div className="w-72 border-r border-gray-200 flex flex-col shrink-0 bg-white">
        <div className="px-4 py-3 border-b border-gray-200 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <Input placeholder="Search sessions…" className="pl-9 h-9 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sessions.map(s => {
            const esc  = s.linkedEscId ? escs.find(e => e.id === s.linkedEscId) : null
            const last = s.msgs[s.msgs.length - 1]
            return (
              <button key={s.id} onClick={() => { setActive(s); setShowProf(false); setTicketId(null) }}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-gray-100 transition-colors ${active.id === s.id ? "bg-blue-50" : "hover:bg-gray-50"}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${nc(s.personNGO)}`}>{ini(s.personName)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">{s.personName}</p>
                    <p className="text-xs text-gray-400 shrink-0 ml-1">{ago(s.startedAt)}</p>
                  </div>
                  <p className="text-xs text-purple-600 truncate mt-0.5">{s.agentName}</p>
                  <p className="text-xs text-gray-400 truncate italic">"{last?.text}"</p>
                  {esc && <div className="mt-1"><SBadge s={esc.status} /></div>}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* chat panel */}
      <div className="flex flex-col flex-1 min-w-0 bg-gray-50">
        {/* chat header */}
        <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-3 shrink-0">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${nc(active.personNGO)}`}>{ini(active.personName)}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{active.personName}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center gap-1 text-xs text-purple-600"><Bot className="w-3 h-3" />{active.agentName}</span>
              {active.requestId && <span className="text-xs text-gray-400 flex items-center gap-1"><Briefcase className="w-3 h-3" />{active.requestId}</span>}
            </div>
          </div>
          {/* human takeover toggle */}
          <button
            onClick={toggleHT}
            title={isHT ? "Mira is paused. Click to resume." : "Mira is handling this. Click to take over."}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              isHT
                ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
            }`}
          >
            {isHT ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
            {isHT ? "Human Takeover" : "Mira Active"}
          </button>

          {/* ticket chip — opens pane inline */}
          {linkedEsc && (
            <button onClick={() => toggleTicket(linkedEsc.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors ${ticketId === linkedEsc.id ? "bg-blue-50 border-blue-200 text-blue-700" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>
              <TicketCheck className="w-3.5 h-3.5" />{linkedEsc.id}<SBadge s={linkedEsc.status} />
            </button>
          )}
          {/* profile toggle */}
          <button onClick={() => { setShowProf(p => !p); setTicketId(null) }}
            className={`p-2 rounded-lg border transition-colors ${showProf ? "bg-blue-50 border-blue-200 text-blue-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
            <User className="w-4 h-4" />
          </button>
        </div>

        {/* messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {isHT && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 sticky top-0 z-10">
              <PauseCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-700 font-medium">Mira is paused for this session. You are in control. Toggle off to resume AI responses.</p>
            </div>
          )}
          {allMsgs.map((m, i) => (
            <div key={i} className={`flex ${m.side === "mentee" ? "justify-start" : "justify-end"}`}>
              {m.side === "bot" ? (
                <div className="flex items-end gap-2 max-w-sm">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mb-0.5"><Bot className="w-3.5 h-3.5 text-purple-600" /></div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
                    <p className="text-xs font-medium text-purple-600 mb-0.5">{active.agentName}</p>
                    <p className="text-sm text-gray-800 leading-relaxed">{m.text}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{m.t}</p>
                  </div>
                </div>
              ) : m.side === "mentee" ? (
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-sm shadow-sm">
                  <p className="text-xs font-medium text-gray-500 mb-0.5">{active.personName}</p>
                  <p className="text-sm text-gray-800 leading-relaxed">{m.text}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{m.t}</p>
                </div>
              ) : (
                <div className="bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5 max-w-sm">
                  <p className="text-xs font-medium text-blue-200 mb-0.5">Admin</p>
                  <p className="text-sm leading-relaxed">{m.text}</p>
                  <p className="text-[10px] text-blue-300 mt-1">{m.t}</p>
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* reply bar */}
        <div className="bg-white border-t border-gray-200 px-5 py-3 shrink-0">
          <div className="flex gap-3 items-center">
            <input className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 bg-gray-50"
              placeholder="Reply via platform bot…" value={reply}
              onChange={e => setReply(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()} />
            <button onClick={send} disabled={!reply.trim()} className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white rounded-xl flex items-center justify-center transition-colors shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* right panel: ticket pane OR profile */}
      {openedTicket ? (
        <TicketPane esc={openedTicket} onClose={() => setTicketId(null)} onStatusChange={onSC} />
      ) : showProf ? (
        <div className="w-72 border-l border-gray-200 bg-white flex flex-col shrink-0 overflow-y-auto">
          <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
            <p className="text-sm font-semibold text-gray-900">Profile</p>
            <button onClick={() => setShowProf(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>
          <div className="px-4 py-5 flex flex-col items-center text-center border-b border-gray-100">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mb-2 ${nc(active.personNGO)}`}>{ini(active.personName)}</div>
            <p className="font-semibold text-gray-900">{active.personName}</p>
            <p className="text-xs text-gray-400 mt-0.5">{active.personNGO}</p>
            {mentee && <div className="flex items-center gap-1 mt-1"><Star className="w-3.5 h-3.5 fill-current text-yellow-400" /><span className="text-sm font-medium text-gray-700">{mentee.rating}</span></div>}
          </div>
          <div className="px-4 py-4 space-y-4 text-xs">
            {mentee && mentee.skills.length > 0 && (
              <div>
                <p className="font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Skills</p>
                <div className="flex flex-wrap gap-1">{mentee.skills.map(s => <span key={s} className="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded text-gray-600">{s}</span>)}</div>
              </div>
            )}
            {linkedEsc && (
              <div>
                <p className="font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Linked Ticket</p>
                <button onClick={() => toggleTicket(linkedEsc.id)} className="w-full text-left rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-1"><span className="font-mono text-gray-400">{linkedEsc.id}</span><SBadge s={linkedEsc.status} /></div>
                  <p className="text-gray-600">{linkedEsc.category}</p>
                  <p className="text-gray-400 mt-0.5 italic truncate">"{linkedEsc.triggerMessage}"</p>
                </button>
              </div>
            )}
            {personReqs.length > 0 && (
              <div>
                <p className="font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Requests ({personReqs.length})</p>
                <div className="space-y-2">{personReqs.map(r => (
                  <div key={r.id} className="rounded-lg border border-gray-100 bg-gray-50 p-2.5">
                    <div className="flex items-center justify-between mb-0.5"><span className="font-mono text-gray-400">{r.id}</span><span className={`px-1.5 py-0.5 rounded-full font-medium border text-[10px] ${r.status === "Matched" ? "bg-green-50 text-green-700 border-green-200" : r.status.startsWith("Closed") ? "bg-gray-100 text-gray-500 border-gray-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>{r.status}</span></div>
                    <p className="text-gray-700 leading-snug">{r.theme}</p>
                  </div>
                ))}</div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function EscalationsPage() {
  const [escs, setEscs]       = useState(mockEscalations)
  const [tab, setTab]         = useState<"tickets" | "chats">("tickets")
  const [viewMode, setViewMode] = useState<"table" | "card">("table")
  const [selected, setSelected] = useState<Escalation | null>(null)
  const [search, setSearch]   = useState("")
  const [fSts, setFSts]       = useState("All")
  const [fPri, setFPri]       = useState("All")
  const [fSrc, setFSrc]       = useState("All")
  const [fTyp, setFTyp]       = useState("All")

  const stats = useMemo(() => ({
    total: escs.length,
    open: escs.filter(e => e.status === "Open").length,
    inProgress: escs.filter(e => e.status === "In Progress").length,
    urgent: escs.filter(e => e.status !== "Resolved" && e.priority === "High").length,
    resolved: escs.filter(e => e.status === "Resolved").length,
  }), [escs])

  const filtered = useMemo(() => escs.filter(e => {
    if (fSts !== "All" && e.status     !== fSts) return false
    if (fPri !== "All" && e.priority   !== fPri) return false
    if (fSrc !== "All" && e.source     !== fSrc) return false
    if (fTyp !== "All" && e.personType !== fTyp) return false
    if (search) {
      const q = search.toLowerCase()
      if (!e.personName.toLowerCase().includes(q) && !e.triggerMessage.toLowerCase().includes(q) && !e.category.toLowerCase().includes(q)) return false
    }
    return true
  }), [escs, fSts, fPri, fSrc, fTyp, search])

  function onSC(id: string, s: EscalationStatus) {
    setEscs(prev => prev.map(e => e.id === id ? { ...e, status: s } : e))
    if (selected?.id === id) setSelected(p => p ? { ...p, status: s } : null)
  }

  // ── Shared tab bar snippet ──
  const TabBar = (
    <div className="flex items-center justify-between border-b border-gray-200">
      <div className="flex">
        <button onClick={() => setTab("tickets")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${tab === "tickets" ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
          <TicketCheck className="w-3.5 h-3.5" />Tickets
          {stats.open + stats.inProgress > 0 && <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-semibold">{stats.open + stats.inProgress}</span>}
        </button>
        <button onClick={() => setTab("chats")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${tab === "chats" ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
          <Bot className="w-3.5 h-3.5" />AI Chats
          <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-semibold">{CHATS.length}</span>
        </button>
      </div>
      {tab === "tickets" && (
        <div className="flex border border-gray-200 rounded-lg overflow-hidden h-8 mb-0.5">
          <button onClick={() => setViewMode("table")} title="Table view" className={`px-3 flex items-center transition-colors ${viewMode === "table" ? "bg-blue-50 text-blue-700" : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"}`}><LayoutList className="w-4 h-4" /></button>
          <button onClick={() => setViewMode("card")}  title="Card view"  className={`px-3 flex items-center border-l border-gray-200 transition-colors ${viewMode === "card" ? "bg-blue-50 text-blue-700" : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"}`}><LayoutGrid className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  )

  // ── CHATS layout: full height, no outer scroll ──
  if (tab === "chats") {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="px-6 pt-4 bg-white shrink-0">{TabBar}</div>
        <ChatsView escs={escs} onSC={onSC} />
      </div>
    )
  }

  // ── TICKETS layout: everything scrolls (Mentors page pattern) ──
  // Outer flex row: scrollable content + fixed side pane as sibling
  return (
    <div className="flex h-full">
      {/* scrollable left */}
      <div className="flex-1 p-6 space-y-5 overflow-auto min-w-0">
        {/* page header */}
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Escalations</h1>
          <p className="text-sm text-gray-500 mt-0.5">AI-raised and manually created cases from mentees and mentors</p>
        </div>

        {/* stats */}
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: "Total",       value: stats.total,      color: "text-gray-900"   },
            { label: "Open",        value: stats.open,       color: "text-gray-700"   },
            { label: "In Progress", value: stats.inProgress, color: "text-blue-600"   },
            { label: "Urgent",      value: stats.urgent,     color: "text-orange-600" },
            { label: "Resolved",    value: stats.resolved,   color: "text-green-600"  },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* tab bar + view toggle */}
        {TabBar}

        {/* filters */}
        <div className="flex gap-3 flex-wrap items-end">
          <div className="flex flex-col gap-1 flex-1 min-w-48">
            <label className="text-xs font-medium text-gray-500">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
              <Input placeholder="Search by name, issue, category…" className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Status</label>
            <Select value={fSts} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFSts(e.target.value)} className="w-36 h-9">
              <option>All</option><option>Open</option><option>In Progress</option><option>Resolved</option>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Priority</label>
            <Select value={fPri} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFPri(e.target.value)} className="w-32 h-9">
              <option>All</option><option>High</option><option>Medium</option><option>Low</option>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Source</label>
            <Select value={fSrc} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFSrc(e.target.value)} className="w-36 h-9">
              <option>All</option><option>AI-Raised</option><option>Mentee</option><option>Mentor</option><option>System</option>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Type</label>
            <Select value={fTyp} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFTyp(e.target.value)} className="w-28 h-9">
              <option>All</option><option>Mentee</option><option>Mentor</option>
            </Select>
          </div>
        </div>
        <p className="text-xs text-gray-400 -mt-2">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>

        {/* TABLE */}
        {viewMode === "table" && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left">
                  {["Person", "Source", "Category", "Priority", "Status", "Request", "Assigned", "Created"].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">No escalations match your filters.</td></tr>
                  : filtered.map((e, i) => {
                    const isSel = selected?.id === e.id
                    const CI    = CAT_I[e.category] ?? HelpCircle
                    return (
                      <tr key={e.id} onClick={() => setSelected(isSel ? null : e)}
                        className={`border-b border-gray-100 cursor-pointer transition-colors ${isSel ? "bg-blue-50" : i % 2 === 0 ? "hover:bg-gray-50" : "bg-gray-50/40 hover:bg-gray-100/60"}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-0.5 h-8 rounded-full shrink-0 ${e.priority === "High" ? "bg-orange-400" : e.priority === "Medium" ? "bg-yellow-400" : "bg-gray-200"}`} />
                            <div>
                              <p className="font-medium text-gray-900">{e.personName}</p>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className={`text-xs px-1.5 rounded font-medium ${e.personType === "Mentee" ? "bg-sky-50 text-sky-700" : "bg-teal-50 text-teal-700"}`}>{e.personType}</span>
                                {e.personNGO && <span className="text-xs text-gray-400">{e.personNGO}</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap"><RBadge s={e.source} /></td>
                        <td className="px-4 py-3 whitespace-nowrap"><span className="inline-flex items-center gap-1 text-xs text-gray-600"><CI className="w-3.5 h-3.5 text-gray-400" />{e.category}</span></td>
                        <td className="px-4 py-3 whitespace-nowrap"><PBadge p={e.priority} /></td>
                        <td className="px-4 py-3 whitespace-nowrap"><SBadge s={e.status} /></td>
                        <td className="px-4 py-3">{e.linkedRequestId ? <span className="text-xs font-mono text-blue-600">{e.linkedRequestId}</span> : <span className="text-xs text-gray-300">—</span>}</td>
                        <td className="px-4 py-3">{e.assignedTo ? <span className="text-xs text-gray-600">{e.assignedTo}</span> : <span className="text-xs text-gray-300">—</span>}</td>
                        <td className="px-4 py-3 whitespace-nowrap"><span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{ago(e.createdAt)}</span></td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          </div>
        )}

        {/* CARDS */}
        {viewMode === "card" && (
          filtered.length === 0
            ? <div className="flex flex-col items-center justify-center py-20 text-gray-400"><CheckCircle2 className="w-8 h-8 mb-2 text-gray-300" /><p className="text-sm">No escalations match your filters</p></div>
            : <div className="grid grid-cols-2 gap-3">
                {filtered.map(e => {
                  const isSel = selected?.id === e.id
                  const CI    = CAT_I[e.category] ?? HelpCircle
                  return (
                    <div key={e.id} onClick={() => setSelected(isSel ? null : e)}
                      className={`bg-white rounded-xl border cursor-pointer transition-all p-4 space-y-3 ${isSel ? "border-blue-300 bg-blue-50/20 shadow-sm" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-1 h-8 rounded-full shrink-0 ${e.priority === "High" ? "bg-orange-400" : e.priority === "Medium" ? "bg-yellow-400" : "bg-gray-200"}`} />
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{e.personName}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className={`text-xs px-1.5 rounded font-medium ${e.personType === "Mentee" ? "bg-sky-50 text-sky-700" : "bg-teal-50 text-teal-700"}`}>{e.personType}</span>
                              {e.personNGO && <span className="text-xs text-gray-400">{e.personNGO}</span>}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0"><Clock className="w-3 h-3" />{ago(e.createdAt)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5"><RBadge s={e.source} /><SBadge s={e.status} /><PBadge p={e.priority} /></div>
                      <p className="text-xs text-gray-600 italic line-clamp-2">"{e.triggerMessage}"</p>
                      {e.aiSummary && <p className="text-xs text-purple-600 flex items-start gap-1 line-clamp-1"><Bot className="w-3 h-3 mt-0.5 shrink-0" />{e.aiSummary}</p>}
                      <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-gray-100">
                        <span className="flex items-center gap-1"><CI className="w-3 h-3" />{e.category}</span>
                        {e.linkedRequestId && <span className="font-mono text-blue-500">{e.linkedRequestId}</span>}
                        {e.assignedTo && <span className="flex items-center gap-1"><User className="w-3 h-3" />{e.assignedTo}</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
        )}
      </div>

      {/* ticket pane — flex sibling, stays fixed while left scrolls */}
      {selected && <TicketPane esc={selected} onClose={() => setSelected(null)} onStatusChange={onSC} />}
    </div>
  )
}
