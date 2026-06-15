import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertTriangle, Bot, MessageSquare, ExternalLink, User, Calendar,
  CheckCircle2, Circle, Loader2, Phone, Star,
  Briefcase, Send, FileText, ArrowLeft, Zap, ShieldAlert,
  HelpCircle, Frown, WifiOff, X,
  Cpu, UserX,
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

// ─── helpers ──────────────────────────────────────────────────────────────────

export function ago(iso: string) {
  const d = Date.now() - new Date(iso).getTime(), m = Math.floor(d / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
export function fmtT(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
}
export function ini(name: string) { return name.split(" ").map(n => n[0]).join("").toUpperCase() }

// ─── config ───────────────────────────────────────────────────────────────────

export const PRI: Record<EscalationPriority, { cls: string; dot: string }> = {
  High:   { cls: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-400" },
  Medium: { cls: "bg-yellow-50 text-yellow-700 border-yellow-200", dot: "bg-yellow-400" },
  Low:    { cls: "bg-gray-100 text-gray-500 border-gray-200",       dot: "bg-gray-300"  },
}
export const STS: Record<EscalationStatus, { cls: string; Icon: React.ElementType }> = {
  "Open":        { cls: "bg-gray-100 text-gray-700 border-gray-200",   Icon: Circle       },
  "In Progress": { cls: "bg-blue-50 text-blue-700 border-blue-200",    Icon: Loader2      },
  "Resolved":    { cls: "bg-green-50 text-green-700 border-green-200", Icon: CheckCircle2 },
}
export const SRC: Record<EscalationSource, { cls: string; Icon: React.ElementType }> = {
  "Escalation Agent": { cls: "bg-purple-50 text-purple-700 border-purple-200", Icon: Bot },
  "Matchmaking":      { cls: "bg-rose-50 text-rose-700 border-rose-200",        Icon: Cpu },
}
export const CAT_I: Record<string, React.ElementType> = {
  "Safety Concern": ShieldAlert, "Match Dissatisfaction": Frown,
  "Unresponsive": WifiOff, "Platform Issue": AlertTriangle,
  "General Support": HelpCircle, "Request-Related": Briefcase,
  "No Candidates Found": UserX, "All Mentors Declined": UserX,
}
export const NGO_C: Record<string, string> = {
  "Akanksha Foundation": "bg-blue-100 text-blue-700",
  "NavGurukul":          "bg-green-100 text-green-700",
  "Parivarthan":         "bg-purple-100 text-purple-700",
}
export const nc = (n?: string) => NGO_C[n ?? ""] ?? "bg-gray-100 text-gray-600"

// ─── badges ───────────────────────────────────────────────────────────────────

export function PBadge({ p }: { p: EscalationPriority }) {
  const c = PRI[p]
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${c.cls}`}><span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />{p}</span>
}
export function SBadge({ s }: { s: EscalationStatus }) {
  const c = STS[s]
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${c.cls}`}><c.Icon className="w-3 h-3" />{s}</span>
}
export function RBadge({ s }: { s: EscalationSource }) {
  const c = SRC[s]
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${c.cls}`}><c.Icon className="w-3 h-3" />{s}</span>
}

// ─── Ticket detail pane ───────────────────────────────────────────────────────

export function TicketPane({ esc, onClose, onStatusChange }: {
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

  const lr    = esc.linkedEngagementId ? mockRequests.find(r => r.id === esc.linkedEngagementId) : null
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
        {esc.summary && (
          <div className={`mt-3 p-3 rounded-lg border ${esc.source === "Matchmaking" ? "bg-rose-50 border-rose-200" : "bg-purple-50 border-purple-200"}`}>
            <p className={`text-xs font-medium mb-1.5 flex items-center gap-1.5 ${esc.source === "Matchmaking" ? "text-rose-600" : "text-purple-600"}`}>
              {esc.source === "Matchmaking"
                ? <><Cpu className="w-3 h-3" />Match Status · {ago(esc.createdAt)}</>
                : <><Bot className="w-3 h-3" />AI Summary · {ago(esc.createdAt)}</>
              }
            </p>
            <p className={`text-sm leading-relaxed ${esc.source === "Matchmaking" ? "text-rose-800 font-medium" : "text-purple-900"}`}>{esc.summary}</p>
          </div>
        )}
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
                  <Button size="sm" variant="outline" className="text-xs h-7 flex-1" onClick={() => navigate(esc.personType === "Mentee" ? "/mentees" : "/volunteers")}><ExternalLink className="w-3 h-3 mr-1" />View Profile</Button>
                </div>
              </div>
            </div>
            {lr && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Linked Engagement</p>
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
                  <Button size="sm" variant="outline" className="text-xs h-7 w-full" onClick={() => navigate("/mentees/all-requests")}><ExternalLink className="w-3 h-3 mr-1" />View Mentoring Engagement</Button>
                </div>
              </div>
            )}
            {esc.candidatesAttempted !== undefined && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <UserX className="w-3.5 h-3.5 text-rose-400" />
                  Outreach Attempts ({esc.candidatesAttempted.length})
                </p>
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
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Engagement History ({reqs.length})</p>
              {reqs.length === 0 ? <p className="text-xs text-gray-400 italic">No requests.</p> : (
                <div className="space-y-2">
                  {reqs.map(r => (
                    <div key={r.id} className={`rounded-lg border p-3 text-xs ${r.id === esc.linkedEngagementId ? "border-blue-200 bg-blue-50/30" : "border-gray-100 bg-gray-50"}`}>
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
            {esc.personType === "Mentee" && (
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
            )}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick Actions</p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="text-xs h-9 justify-start gap-2" onClick={() => navigate(esc.personType === "Mentee" ? "/mentees/comms" : "/volunteers/comms")}><MessageSquare className="w-3.5 h-3.5 text-green-600" />Reply on WhatsApp</Button>
                {esc.linkedEngagementId && <Button variant="outline" size="sm" className="text-xs h-9 justify-start gap-2" onClick={() => navigate("/mentees/all-requests")}><ExternalLink className="w-3.5 h-3.5 text-blue-600" />View Engagement</Button>}
                {esc.linkedEngagementId && <Button variant="outline" size="sm" className="text-xs h-9 justify-start gap-2"><Zap className="w-3.5 h-3.5 text-yellow-600" />Trigger Rematch</Button>}
                <Button variant="outline" size="sm" className="text-xs h-9 justify-start gap-2 text-gray-600"><ShieldAlert className="w-3.5 h-3.5 text-gray-400" />Flag Profile</Button>
                {esc.linkedEngagementId && <Button variant="outline" size="sm" className="text-xs h-9 justify-start gap-2 col-span-2 text-gray-600"><X className="w-3.5 h-3.5" />Close Engagement</Button>}
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
