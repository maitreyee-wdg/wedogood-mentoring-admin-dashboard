import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  mockMenteeContacts, mockConversations, commsTemplates,
  type CommContact, type ChatMessage,
} from "@/data/commsData"
import { Search, Send, ChevronDown, Check, CheckCheck, MessageSquare } from "lucide-react"

export default function MenteesComms() {
  const [contacts] = useState<CommContact[]>(mockMenteeContacts)
  const [conversations, setConversations] = useState(mockConversations)
  const [activeContactId, setActiveContactId] = useState<string | null>(contacts[0]?.id ?? null)
  const [search, setSearch] = useState("")
  const [message, setMessage] = useState("")
  const [showTemplates, setShowTemplates] = useState(false)
  const [templateTab, setTemplateTab] = useState<"generic" | "engagement">("generic")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.role.toLowerCase().includes(search.toLowerCase())
  )

  const activeContact = contacts.find((c) => c.id === activeContactId)
  const activeMessages: ChatMessage[] = (activeContactId ? conversations[activeContactId] : null) ?? []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeMessages.length])

  const sendMessage = () => {
    if (!message.trim() || !activeContactId) return
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: "sent",
      text: message.trim(),
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    }
    setConversations((prev) => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] ?? []), newMsg],
    }))
    setMessage("")
  }

  const insertTemplate = (msg: string) => {
    setMessage(msg)
    setShowTemplates(false)
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
            <button key={c.id} onClick={() => setActiveContactId(c.id)}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${activeContactId === c.id ? "bg-blue-50" : ""}`}>
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

      {/* Chat area */}
      {activeContact ? (
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 shrink-0">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${getRoleBadgeClass(activeContact.role)}`}>
              {activeContact.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{activeContact.name}</p>
              <p className="text-xs text-gray-500">{activeContact.role} · {activeContact.phone}</p>
            </div>
            <div className="ml-auto relative" onClick={(e) => e.stopPropagation()}>
              <Button variant="outline" size="sm" onClick={() => setShowTemplates((o) => !o)}>
                <MessageSquare className="w-3.5 h-3.5" />Templates <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
              {showTemplates && (
                <div className="absolute right-0 top-10 z-30 bg-white border border-gray-200 rounded-xl shadow-xl w-80">
                  <div className="flex border-b border-gray-200 px-1 pt-1">
                    {(["generic", "engagement"] as const).map((tab) => (
                      <button key={tab} onClick={() => setTemplateTab(tab)}
                        className={`flex-1 py-2 text-xs font-medium capitalize rounded-t-lg ${templateTab === tab ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:text-gray-700"}`}>
                        {tab === "generic" ? "Generic" : "Engagement"}
                      </button>
                    ))}
                  </div>
                  <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
                    {commsTemplates.filter((t) => t.category === templateTab).map((t) => (
                      <button key={t.id} onClick={() => insertTemplate(t.message)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50">
                        <p className="text-xs font-medium text-gray-800">{t.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{t.message}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50" onClick={() => setShowTemplates(false)}>
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

          <div className="px-5 py-4 border-t border-gray-200 bg-white shrink-0">
            <div className="flex gap-3">
              <input
                className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                placeholder="Type a message…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              />
              <button onClick={sendMessage} disabled={!message.trim()}
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl flex items-center justify-center transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Select a contact to view conversation</p>
          </div>
        </div>
      )}
    </div>
  )
}
