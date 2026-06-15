import { useState, useEffect, useRef, useMemo } from "react"
import { mockMentees } from "@/data/menteesData"
import { mockRequests, type AiMessage } from "@/data/requestsData"
import { mockEscalations, type Escalation, type EscalationStatus } from "@/data/escalationsData"
import {
  Search, Bot, UserCircle, ShieldAlert,
  Send, ToggleLeft, ToggleRight, SlidersHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { MenteePane } from "@/components/MenteeSidePane"
import { TicketPane } from "@/components/EscalationSidePane"

// ── helpers ──────────────────────────────────────────────────────────────────

function fmt(ts: string) {
  const d = new Date(ts)
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
}

function fmtDate(ts: string) {
  const d = new Date(ts)
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

// ── Main Component ────────────────────────────────────────────────────────────

const menteeGroups = [...new Set(mockMentees.map(m => m.group))].sort()

export default function AIChatPage() {
  const [search, setSearch] = useState("")
  const [filterGroup, setFilterGroup] = useState("All")
  const [filterLastActive, setFilterLastActive] = useState("All")
  const [filterEscalation, setFilterEscalation] = useState("All")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedMenteeId, setSelectedMenteeId] = useState<string | null>(null)
  const [humanTakeover, setHumanTakeover] = useState<Record<string, boolean>>({})
  const [adminMessages, setAdminMessages] = useState<Record<string, AiMessage[]>>({})
  const [draftMessage, setDraftMessage] = useState("")
  const [sidePane, setSidePane] = useState<"profile" | "escalation" | null>(null)
  const [selectedEscalation, setSelectedEscalation] = useState<Escalation | null>(null)
  const [localEscs, setLocalEscs] = useState(mockEscalations)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Build per-mentee AI conversation from their most recent active request
  const menteeConversations = useMemo(() => {
    const map: Record<string, { messages: AiMessage[]; requestId: string; theme: string }> = {}
    for (const req of mockRequests) {
      if (!map[req.menteeId] && req.aiConversation.length > 0) {
        map[req.menteeId] = { messages: req.aiConversation, requestId: req.id, theme: req.theme }
      }
    }
    return map
  }, [])

  // Escalations indexed by menteeId
  const escalationsByMentee = useMemo(() => {
    const map: Record<string, Escalation[]> = {}
    for (const esc of localEscs) {
      if (esc.personType === "Mentee") {
        if (!map[esc.personId]) map[esc.personId] = []
        map[esc.personId].push(esc)
      }
    }
    return map
  }, [localEscs])

  const filteredMentees = useMemo(() => {
    const now = new Date()
    return mockMentees.filter(m => {
      const conv = menteeConversations[m.id]
      if (!conv) return false

      if (!m.name.toLowerCase().includes(search.toLowerCase())) return false
      if (filterGroup !== "All" && m.group !== filterGroup) return false

      if (filterLastActive !== "All") {
        const lastMsg = conv.messages[conv.messages.length - 1]
        const lastTs = new Date(lastMsg.timestamp)
        const diffDays = (now.getTime() - lastTs.getTime()) / (1000 * 60 * 60 * 24)
        if (filterLastActive === "Today" && diffDays > 1) return false
        if (filterLastActive === "This week" && diffDays > 7) return false
        if (filterLastActive === "This month" && diffDays > 30) return false
      }

      if (filterEscalation === "Has escalation" && !(escalationsByMentee[m.id]?.some(e => e.status !== "Resolved"))) return false
      if (filterEscalation === "No escalation" && (escalationsByMentee[m.id]?.some(e => e.status !== "Resolved"))) return false

      return true
    })
  }, [search, filterGroup, filterLastActive, filterEscalation, menteeConversations, escalationsByMentee])

  const selectedMentee = mockMentees.find(m => m.id === selectedMenteeId) ?? null
  const conv = selectedMenteeId ? menteeConversations[selectedMenteeId] : null
  const isHumanTakeover = selectedMenteeId ? (humanTakeover[selectedMenteeId] ?? false) : false
  const extraMessages = selectedMenteeId ? (adminMessages[selectedMenteeId] ?? []) : []
  const allMessages: AiMessage[] = conv ? [...conv.messages, ...extraMessages] : []
  const menteeEscalations = selectedMenteeId ? (escalationsByMentee[selectedMenteeId] ?? []) : []
  const hasOpenEscalation = (id: string) => (escalationsByMentee[id] ?? []).some(e => e.status !== "Resolved")

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [allMessages.length, selectedMenteeId])

  const sendAdminMessage = () => {
    if (!selectedMenteeId || !draftMessage.trim()) return
    const msg: AiMessage = {
      sender: "mira",
      text: draftMessage.trim(),
      timestamp: new Date().toISOString(),
    }
    setAdminMessages(prev => ({ ...prev, [selectedMenteeId]: [...(prev[selectedMenteeId] ?? []), msg] }))
    setDraftMessage("")
  }

  const toggleTakeover = (id: string) => {
    setHumanTakeover(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleEscalationClick = (esc: Escalation) => {
    setSelectedEscalation(esc)
    setSidePane("escalation")
  }

  const handleEscStatusChange = (id: string, s: EscalationStatus) => {
    setLocalEscs(prev => prev.map(e => e.id === id ? { ...e, status: s } : e))
    setSelectedEscalation(prev => prev?.id === id ? { ...prev, status: s } : prev)
  }

  return (
    <div className="flex h-full overflow-hidden">

      {/* Contact list */}
      <div className="w-72 border-r border-gray-200 bg-white flex flex-col shrink-0">
        <div className="px-3 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-900">AI Conversations</h2>
            <button
              onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${showFilters || filterGroup !== "All" || filterLastActive !== "All" || filterEscalation !== "All" ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}
            >
              <SlidersHorizontal className="w-3 h-3" />
              Filters
              {(filterGroup !== "All" || filterLastActive !== "All" || filterEscalation !== "All") && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-0.5" />
              )}
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
            <input
              className="w-full text-xs border border-gray-200 rounded-lg pl-8 pr-3 py-2 outline-none focus:border-blue-400 bg-gray-50"
              placeholder="Search mentee…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {showFilters && (
            <div className="mt-2 space-y-2">
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-1">Group</label>
                <select
                  value={filterGroup}
                  onChange={e => setFilterGroup(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-blue-400 bg-white"
                >
                  <option>All</option>
                  {menteeGroups.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-1">Last Active</label>
                <select
                  value={filterLastActive}
                  onChange={e => setFilterLastActive(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-blue-400 bg-white"
                >
                  <option>All</option>
                  <option>Today</option>
                  <option>This week</option>
                  <option>This month</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-1">Escalations</label>
                <select
                  value={filterEscalation}
                  onChange={e => setFilterEscalation(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-blue-400 bg-white"
                >
                  <option>All</option>
                  <option>Has escalation</option>
                  <option>No escalation</option>
                </select>
              </div>
              {(filterGroup !== "All" || filterLastActive !== "All" || filterEscalation !== "All") && (
                <button
                  onClick={() => { setFilterGroup("All"); setFilterLastActive("All"); setFilterEscalation("All") }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredMentees.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">No conversations found</p>
          ) : filteredMentees.map(mentee => {
            const conv = menteeConversations[mentee.id]
            const lastMsg = conv?.messages[conv.messages.length - 1]
            const hasEsc = hasOpenEscalation(mentee.id)
            const escs = escalationsByMentee[mentee.id] ?? []
            const isSelected = selectedMenteeId === mentee.id
            const isTakeover = humanTakeover[mentee.id]

            return (
              <button
                key={mentee.id}
                onClick={() => { setSelectedMenteeId(mentee.id); setSidePane(null) }}
                className={`w-full text-left px-3 py-3 border-b border-gray-100 transition-colors ${
                  isSelected ? "bg-blue-50" : hasEsc ? "bg-red-50/50 hover:bg-red-50" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="relative shrink-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${hasEsc ? "bg-red-100 text-red-700" : "bg-purple-100 text-purple-700"}`}>
                      {mentee.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    {isTakeover && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center">
                        <UserCircle className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-semibold truncate ${hasEsc ? "text-red-800" : "text-gray-900"}`}>{mentee.name}</p>
                      {lastMsg && <span className="text-[10px] text-gray-400 shrink-0">{fmt(lastMsg.timestamp)}</span>}
                    </div>
                    <p className="text-[10px] text-gray-500 truncate">{mentee.ngo}</p>
                    {lastMsg && (
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">
                        {lastMsg.sender === "mira" ? "🤖 " : "👤 "}{lastMsg.text}
                      </p>
                    )}
                    {hasEsc && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {escs.filter(e => e.status !== "Resolved").map(e => (
                          <span key={e.id} className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded font-medium flex items-center gap-0.5">
                            <ShieldAlert className="w-2.5 h-2.5" />{e.id}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Chat area */}
      {!selectedMentee ? (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center text-gray-400">
            <Bot className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Select a mentee to view their AI conversation</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          {/* Chat header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidePane(sidePane === "profile" ? null : "profile")}
                className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${hasOpenEscalation(selectedMentee.id) ? "bg-red-100 text-red-700" : "bg-purple-100 text-purple-700"}`}>
                  {selectedMentee.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900 hover:text-blue-600 leading-tight">{selectedMentee.name}</p>
                  <p className="text-xs text-gray-500 leading-tight">{selectedMentee.ngo}</p>
                </div>
              </button>
              {menteeEscalations.filter(e => e.status !== "Resolved").map(esc => (
                <button
                  key={esc.id}
                  onClick={() => handleEscalationClick(esc)}
                  className="flex items-center gap-1 text-[10px] px-2 py-1 bg-red-50 text-red-600 rounded-full border border-red-100 hover:bg-red-100 transition-colors font-medium"
                >
                  <ShieldAlert className="w-3 h-3" />{esc.id}
                </button>
              ))}
              {conv && <span className="text-xs text-gray-400 hidden lg:block">· {conv.theme}</span>}
            </div>

            {/* Human takeover toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Admin Takeover</span>
              <button
                onClick={() => toggleTakeover(selectedMentee.id)}
                className="flex items-center gap-1.5 transition-colors"
              >
                {isHumanTakeover ? (
                  <>
                    <ToggleRight className="w-6 h-6 text-blue-600" />
                    <span className="text-xs font-medium text-blue-600">On</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-gray-400">Off</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Takeover banner */}
          {isHumanTakeover && (
            <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center gap-2 shrink-0">
              <UserCircle className="w-3.5 h-3.5 text-blue-600" />
              <p className="text-xs text-blue-700 font-medium">Admin takeover active — your messages will be sent as Mira</p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
            {allMessages.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-8">No messages yet</p>
            ) : allMessages.map((msg, i) => {
              const isMira = msg.sender === "mira"
              return (
                <div key={i} className={`flex ${isMira ? "justify-end" : "justify-start"}`}>
                  {!isMira && (
                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold shrink-0 mr-1.5 mt-0.5">
                      {selectedMentee.name.split(" ").map(n => n[0]).join("")}
                    </div>
                  )}
                  <div className={`max-w-xs lg:max-w-sm xl:max-w-md rounded-2xl px-3.5 py-2.5 ${
                    isMira
                      ? "bg-green-600 text-white rounded-tr-sm"
                      : "bg-white text-gray-800 rounded-tl-sm border border-gray-100 shadow-sm"
                  }`}>
                    {isMira && (
                      <p className={`text-[10px] font-medium mb-0.5 ${isMira ? "text-green-200" : "text-gray-400"}`}>
                        Mira
                      </p>
                    )}
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p className={`text-[10px] mt-1 text-right ${isMira ? "text-green-200" : "text-gray-400"}`}>{fmtDate(msg.timestamp)} · {fmt(msg.timestamp)}</p>
                  </div>
                  {isMira && (
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0 ml-1.5 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              )
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          {isHumanTakeover ? (
            <div className="bg-white border-t border-gray-200 px-4 py-3 flex gap-2 shrink-0">
              <input
                className="flex-1 text-sm border border-gray-200 rounded-full px-4 py-2 outline-none focus:border-blue-400"
                placeholder="Type a message as admin…"
                value={draftMessage}
                onChange={e => setDraftMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendAdminMessage()}
              />
              <Button size="sm" onClick={sendAdminMessage} disabled={!draftMessage.trim()} className="rounded-full px-4">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <div className="bg-white border-t border-gray-200 px-4 py-3 shrink-0">
              <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-full px-4 py-2">
                <Bot className="w-3.5 h-3.5" />
                <span>Mira is handling this conversation · Enable Admin Takeover to respond</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Side pane — profile or escalation */}
      {sidePane === "profile" && selectedMentee && (
        <MenteePane
          mentee={selectedMentee}
          onClose={() => setSidePane(null)}
        />
      )}
      {sidePane === "escalation" && selectedEscalation && (
        <TicketPane
          esc={selectedEscalation}
          onClose={() => { setSidePane(null); setSelectedEscalation(null) }}
          onStatusChange={handleEscStatusChange}
        />
      )}
    </div>
  )
}
