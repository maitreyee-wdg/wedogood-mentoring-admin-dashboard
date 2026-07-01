import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  mockMenteeContacts, mockConversations, menteeCommsTemplates, mockMenteeLogs,
  type CommContact, type ChatMessage, type CommTemplate, type CommLog,
} from "@/data/commsData"
import { mockMentees } from "@/data/menteesData"
import { MenteePane } from "@/components/MenteeSidePane"
import {
  Search, Send, Check, CheckCheck, MessageSquare,
  ClipboardList, X, CheckCircle2, AlertCircle,
  PauseCircle, Bot,
  LayoutTemplate, ImagePlus, Bold,
} from "lucide-react"
import { TemplatePickerModal, TemplatesView } from "@/components/WaTemplateComponents"

// ─── Create Template Modal ────────────────────────────────────────────────────

function CreateTemplateModal({
  onSave, onClose,
}: {
  onSave: (t: CommTemplate) => void
  onClose: () => void
}) {
  const [label, setLabel] = useState("")
  const [category, setCategory] = useState<"generic" | "engagement">("generic")
  const [message, setMessage] = useState("")

  const VARIABLES = ["{name}", "{menteeName}", "{mentorName}", "{ngo}", "{skill}", "{days}"]

  const insert = (v: string) => setMessage((m) => m + v)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-[520px]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">New WhatsApp Template</h2>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Template Name *</label>
            <input
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
              value={label} onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Reschedule Request"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Category</label>
            <select
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white"
              value={category} onChange={(e) => setCategory(e.target.value as "generic" | "engagement")}
            >
              <option value="generic">Generic</option>
              <option value="engagement">Engagement</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Message Body *</label>
            <textarea
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 resize-none h-28"
              value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message. Use variables from below."
            />
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <span className="text-xs text-gray-400 mr-1">Insert:</span>
              {VARIABLES.map((v) => (
                <button key={v} onClick={() => insert(v)}
                  className="text-xs bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 px-2 py-0.5 rounded font-mono transition-colors">
                  {v}
                </button>
              ))}
            </div>
          </div>
          {message && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Preview</label>
              <div className="bg-gray-50 rounded-xl p-3 flex justify-end">
                <div className="max-w-xs bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5">
                  <p className="text-sm leading-relaxed">{message}</p>
                  <p className="text-xs text-blue-200 mt-1 text-right">12:00 PM ✓✓</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 px-5 py-4 border-t border-gray-100">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={() => {
            if (!label || !message) return
            onSave({ id: `CT-${Date.now()}`, label, category, message, isCustom: true })
          }}>Save Template</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Logs View ────────────────────────────────────────────────────────────────

function LogsView({ logs }: { logs: CommLog[] }) {
  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">Message Logs</h3>
          <p className="text-xs text-gray-500 mt-0.5">All outbound messages — triggered and manual</p>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide">Date / Time</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide">Sent by</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide">Template</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide">Recipients</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-500 uppercase tracking-wide">Sent</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-500 uppercase tracking-wide">Delivered</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-500 uppercase tracking-wide">Read</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-500 uppercase tracking-wide">Failed</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={log.id} className={`border-b border-gray-100 ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                <td className="px-4 py-3 text-gray-600">
                  <p className="font-medium">{log.date}</p>
                  <p className="text-gray-400">{log.time}</p>
                </td>
                <td className="px-4 py-3">
                  {log.triggerOrSender === "System Trigger"
                    ? <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-medium">⚡ System Trigger</span>
                    : <span className="text-gray-600">{log.triggerOrSender}</span>
                  }
                </td>
                <td className="px-4 py-3">
                  <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-[11px] font-medium">{log.templateLabel}</span>
                </td>
                <td className="px-4 py-3 text-gray-600 max-w-[180px]">
                  <p className="truncate" title={log.recipients.join(", ")}>{log.recipients.join(", ")}</p>
                  <p className="text-gray-400">{log.recipients.length} contact{log.recipients.length !== 1 ? "s" : ""}</p>
                </td>
                <td className="px-3 py-3 text-center font-medium text-gray-700">{log.sentCount}</td>
                <td className="px-3 py-3 text-center">
                  <span className="text-blue-600 font-medium">{log.deliveredCount}</span>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className="text-green-600 font-medium">{log.readCount}</span>
                </td>
                <td className="px-3 py-3 text-center">
                  {log.failedCount > 0
                    ? <span className="text-red-500 font-medium flex items-center justify-center gap-1"><AlertCircle className="w-3 h-3" />{log.failedCount}</span>
                    : <span className="text-gray-300 flex items-center justify-center"><CheckCircle2 className="w-3.5 h-3.5 text-green-400" /></span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">No logs yet.</div>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MenteesComms() {
  const [contacts] = useState<CommContact[]>(mockMenteeContacts)
  const [conversations, setConversations] = useState(mockConversations)
  const [activeContactId, setActiveContactId] = useState<string | null>(contacts[0]?.id ?? null)
  const [search, setSearch] = useState("")
  const [message, setMessage] = useState("")
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [templates, setTemplates] = useState<CommTemplate[]>(menteeCommsTemplates)
  const [showCreateTemplate, setShowCreateTemplate] = useState(false)
  const [view, setView] = useState<"chat" | "logs" | "templates">("chat")
  const [humanTakeover, setHumanTakeover] = useState<Record<string, boolean>>({})

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const isHT = humanTakeover[activeContactId ?? ""] ?? false
  function toggleHT() {
    if (!activeContactId) return
    setHumanTakeover(p => ({ ...p, [activeContactId]: !p[activeContactId] }))
  }

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.role.toLowerCase().includes(search.toLowerCase())
  )

  const activeContact = contacts.find((c) => c.id === activeContactId)
  const activeMessages: ChatMessage[] = (activeContactId ? conversations[activeContactId] : null) ?? []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeMessages.length])

  const sendMessage = (text?: string) => {
    const body = text ?? message
    if (!body.trim() || !activeContactId) return
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: "sent",
      text: body.trim(),
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    }
    setConversations((prev) => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] ?? []), newMsg],
    }))
    if (!text) setMessage("")
  }

  const ngoColor: Record<string, string> = {
    "Akanksha Foundation": "bg-blue-100 text-blue-700",
    "NavGurukul": "bg-green-100 text-green-700",
    "Parivarthan": "bg-purple-100 text-purple-700",
  }
  const getRoleBadgeClass = (role: string) => {
    for (const [ngo, cls] of Object.entries(ngoColor)) {
      if (role.includes(ngo)) return cls
    }
    return "bg-gray-100 text-gray-700"
  }

  return (
    <div className="flex h-full bg-white">
      {/* Contact list */}
      <div className="w-72 border-r border-gray-200 flex flex-col shrink-0">
        <div className="px-4 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 text-sm mb-3">Mentee Comms</h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input placeholder="Search mentees…" className="pl-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((c) => (
            <button key={c.id} onClick={() => { setActiveContactId(c.id); setView("chat") }}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${activeContactId === c.id && view === "chat" ? "bg-blue-50" : ""}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${getRoleBadgeClass(c.role)}`}>
                {c.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                  <p className="text-xs text-gray-400 shrink-0 ml-2">{c.lastTime}</p>
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">{c.lastMessage}</p>
              </div>
              {c.unread > 0 && (
                <span className="mt-1 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center shrink-0">{c.unread}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top tab bar */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 bg-white shrink-0">
          <div className="flex gap-1">
            <button
              onClick={() => setView("chat")}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${view === "chat" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> Chat
            </button>
            <button
              onClick={() => setView("logs")}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${view === "logs" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              <ClipboardList className="w-3.5 h-3.5" /> Logs
            </button>
            <button
              onClick={() => setView("templates")}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${view === "templates" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              <LayoutTemplate className="w-3.5 h-3.5" /> Templates
            </button>
          </div>
          {view === "chat" && activeContact && (
            <div className="flex items-center gap-3 py-2.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${getRoleBadgeClass(activeContact.role)}`}>
                {activeContact.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{activeContact.name}</p>
                <p className="text-xs text-gray-500">{activeContact.role} · {activeContact.phone}</p>
              </div>
              <button
                onClick={toggleHT}
                title={isHT ? "Mira is paused. Click to resume." : "Mira is handling this chat. Click to take over."}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  isHT
                    ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                    : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                }`}
              >
                {isHT ? <PauseCircle className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                {isHT ? "Human Takeover" : "Mira Active"}
              </button>
            </div>
          )}
        </div>

        {/* Clickable contact name strip */}
        {activeContact && (
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-2 px-5 py-2 border-b border-gray-100 bg-white hover:bg-gray-50 transition-colors text-left shrink-0"
          >
            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0">
              {activeContact.name.split(" ").map(n => n[0]).join("")}
            </div>
            <span className="text-xs font-medium text-blue-600 hover:underline">{activeContact.name}</span>
            <span className="text-xs text-gray-400">— click to view profile</span>
          </button>
        )}

        {/* Content */}
        {view === "templates" ? (
          <TemplatesView
            templates={templates}
            onCreateTemplate={() => setShowCreateTemplate(true)}
          />
        ) : view === "logs" ? (
          <LogsView logs={mockMenteeLogs} />
        ) : activeContact ? (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50">
              {isHT && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 sticky top-0 z-10">
                  <PauseCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-700 font-medium">Mira is paused. You are replying directly. Toggle off to resume AI responses.</p>
                </div>
              )}
              {activeMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">No messages yet.</div>
              ) : activeMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === "sent" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs lg:max-w-sm rounded-2xl px-4 py-2.5 ${msg.type === "sent" ? "bg-blue-600 text-white rounded-br-sm" : "bg-white text-gray-900 border border-gray-200 rounded-bl-sm shadow-sm"}`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <div className={`flex items-center gap-1 mt-1 justify-end ${msg.type === "sent" ? "text-blue-200" : "text-gray-400"}`}>
                      <span className="text-xs">{msg.timestamp}</span>
                      {msg.type === "sent" && (msg.status === "read" ? <CheckCheck className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            {/* Chat input bar */}
            <div className="px-5 py-4 border-t border-gray-200 bg-white shrink-0">
              <div className="flex items-center gap-2">
                {/* 3 action icons */}
                <button
                  onClick={() => setShowTemplatePicker(true)}
                  title="Select Template"
                  className="w-9 h-9 rounded-xl border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 flex items-center justify-center transition-colors shrink-0"
                >
                  <LayoutTemplate className="w-4 h-4" />
                </button>
                <button
                  title="Attach Image"
                  className="w-9 h-9 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 flex items-center justify-center transition-colors shrink-0"
                >
                  <ImagePlus className="w-4 h-4" />
                </button>
                <button
                  title="Format"
                  className="w-9 h-9 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 flex items-center justify-center transition-colors shrink-0"
                >
                  <Bold className="w-4 h-4" />
                </button>
                {/* Text input */}
                <input
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400"
                  placeholder="Type a message…" value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                />
                <button onClick={() => sendMessage()} disabled={!message.trim()}
                  className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl flex items-center justify-center transition-colors shrink-0">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Select a contact to view conversation</p>
            </div>
          </div>
        )}
      </div>

      {showTemplatePicker && (
        <TemplatePickerModal
          templates={templates}
          allowedCategories={["Mentee"]}
          onClose={() => setShowTemplatePicker(false)}
          onSend={(msg) => sendMessage(msg)}
        />
      )}

      {showCreateTemplate && (
        <CreateTemplateModal
          onSave={(t) => { setTemplates((prev) => [...prev, t]); setShowCreateTemplate(false) }}
          onClose={() => setShowCreateTemplate(false)}
        />
      )}

      {showProfile && activeContact && (() => {
        const mentee = mockMentees.find(m => `${m.firstName} ${m.lastName}` === activeContact.name)
        return mentee ? (
          <MenteePane mentee={mentee} onClose={() => setShowProfile(false)} />
        ) : null
      })()}
    </div>
  )
}
