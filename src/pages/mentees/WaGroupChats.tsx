import { useState, useRef, useEffect, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  mockWaGroups, mockWaNumbers, formatWaTime, MEMBER_STATUS_CLS, NUMBER_STATUS_CLS, WA_NOW,
  AI_NUMBER_NAME, numberLabel, activeRequest, currentMentor, pastMentors, menteeMember, lastMessageAt,
  type WaGroup, type GroupMessage, type GroupEvent, type GroupMember, type MediaType,
} from "@/data/waGroupsData"
import { EMPTY_WA_FILTERS, activeFilterCount, applyWaGroupFilters, filterOptions, type WaGroupFilters } from "@/lib/waGroupFilters"
import { WaGroupFilterDrawer } from "@/components/WaGroupFilterDrawer"
import { WaDefinitionsModal } from "@/components/WaDefinitionsModal"
import { WaText } from "@/components/WaText"
import {
  Search, Send, Users, Bot, PauseCircle, FileText, MessageSquare, Lock, Filter, Info, BookOpen, X,
  Bold, Italic, Strikethrough, Code, List, ListOrdered, Quote, AtSign, Paperclip, ListChecks,
  Image, Video, Mic, Reply, Plus, Trash2,
} from "lucide-react"

const ADMIN_NAME = "Maitreyee"

const MEDIA_ICON: Record<MediaType, typeof Image> = { image: Image, video: Video, document: FileText, audio: Mic }
const MEDIA_ACCEPT: Record<MediaType, string> = {
  image: "image/jpeg,image/png", video: "video/mp4,video/3gpp", document: "*", audio: "audio/*",
}

type TimelineItem =
  | { kind: "message"; at: string; message: GroupMessage }
  | { kind: "event"; at: string; event: GroupEvent }

function eventText(e: GroupEvent): string {
  const who = e.member ? `${e.member} ` : ""
  const req = e.detail ? ` (${e.detail})` : ""
  switch (e.type) {
    case "Joined": return `${who}joined via link${req}`
    case "Link sent": return `Joining link sent to ${e.member}${req}`
    case "Reminder sent": return `Reminder sent to ${e.member}`
    case "Removed": return `${who}removed${req}`
    case "Left": return `${who}left the group${req}`
    case "Join rejected": return `Join request from ${e.member} rejected`
    case "Did not join": return `${who}did not join in time`
    case "Admin takeover started": return `${e.detail ?? "Admin"} took over. AI stopped sending`
    case "Admin takeover ended": return `${e.detail ?? "Admin"} handed back to AI`
    default: return e.detail ? `${e.type} · ${e.detail}` : e.type
  }
}

function senderLabel(m: GroupMessage): string {
  if (m.senderRole === "AI") return `${AI_NUMBER_NAME} · AI`
  if (m.senderRole === "Admin") return `${m.senderName} (admin) · sent as ${AI_NUMBER_NAME}`
  return `${m.senderName} · ${m.senderRole}`
}

function Chip({ label, cls }: { label: string; cls: string }) {
  return <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded border ${cls}`}>{label}</span>
}

function MemberRow({ m, sub }: { m: GroupMember; sub?: string }) {
  return (
    <div className="py-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-gray-900 truncate">{m.name}</p>
        <Chip label={m.status} cls={MEMBER_STATUS_CLS[m.status]} />
      </div>
      <p className="text-[11px] text-gray-400">{m.phone}{sub ? ` · ${sub}` : ""}</p>
      {(m.linkSentAt || m.joinedAt || m.statusAt) && (
        <p className="text-[11px] text-gray-400">
          {m.linkSentAt && `Link sent ${formatWaTime(m.linkSentAt)}`}
          {m.joinedAt && ` · Joined ${formatWaTime(m.joinedAt)}`}
          {m.statusAt && !["Joined", "Link sent", "Admin"].includes(m.status) && ` · ${m.status} ${formatWaTime(m.statusAt)}`}
          {m.remindersSent ? ` · ${m.remindersSent} reminder${m.remindersSent > 1 ? "s" : ""}` : ""}
        </p>
      )}
    </div>
  )
}

function TakeoverInfo({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute right-0 top-10 z-30 w-[380px] bg-white border border-gray-200 rounded-xl shadow-xl p-4 text-xs text-gray-700 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">What admin takeover does</p>
        <button onClick={onClose}><X className="w-3.5 h-3.5 text-gray-400" /></button>
      </div>
      <p><span className="font-semibold">AI stops sending.</span> No AI replies and no automated messages (check-ins, reminders) are posted in this group. Automated messages that fall due during takeover are skipped and logged.</p>
      <p><span className="font-semibold">AI keeps reading.</span> Every message is still received, stored and shown here, and the AI still reads it for context and flags, so it knows what happened when it resumes.</p>
      <p><span className="font-semibold">Membership automation keeps running.</span> Join approvals, removals and invite link resets are not affected.</p>
      <p><span className="font-semibold">Admin messages go from {AI_NUMBER_NAME}.</span> Members see {AI_NUMBER_NAME}, not the admin's name. The portal records which admin sent each message.</p>
      <p><span className="font-semibold">Takeover is per group and stays on</span> until an admin clicks Hand back to AI. Start and end are logged with the admin's name.</p>
    </div>
  )
}

function PollModal({ onSend, onClose }: { onSend: (p: { title: string; options: string[]; multiple: boolean }) => void; onClose: () => void }) {
  const [title, setTitle] = useState("")
  const [options, setOptions] = useState(["", ""])
  const [multiple, setMultiple] = useState(false)
  const valid = title.trim() && options.filter(o => o.trim()).length >= 2
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-[440px]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Create poll</h2>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <input className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400" placeholder="Question"
            value={title} onChange={e => setTitle(e.target.value)} />
          {options.map((o, i) => (
            <div key={i} className="flex gap-2">
              <input className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400" placeholder={`Option ${i + 1}`}
                value={o} onChange={e => setOptions(prev => prev.map((x, j) => j === i ? e.target.value : x))} />
              {options.length > 2 && (
                <button onClick={() => setOptions(prev => prev.filter((_, j) => j !== i))}><Trash2 className="w-3.5 h-3.5 text-gray-400" /></button>
              )}
            </div>
          ))}
          {options.length < 12 && (
            <button onClick={() => setOptions(prev => [...prev, ""])} className="text-xs text-blue-600 flex items-center gap-1"><Plus className="w-3 h-3" /> Add option</button>
          )}
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input type="checkbox" checked={multiple} onChange={e => setMultiple(e.target.checked)} /> Allow multiple answers
          </label>
          <p className="text-[11px] text-gray-400">2 to 12 options.</p>
        </div>
        <div className="flex gap-2 px-5 py-4 border-t border-gray-100">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" disabled={!valid} onClick={() => onSend({ title: title.trim(), options: options.map(o => o.trim()).filter(Boolean), multiple })}>Send poll</Button>
        </div>
      </div>
    </div>
  )
}

export default function WaGroupChats() {
  const [groups, setGroups] = useState<WaGroup[]>(() => mockWaGroups.filter(g => g.status === "Created"))
  const [searchParams] = useSearchParams()
  const [activeId, setActiveId] = useState<string | null>(() => {
    const fromUrl = searchParams.get("group")
    return fromUrl && groups.some(g => g.id === fromUrl) ? fromUrl : groups[0]?.id ?? null
  })
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<WaGroupFilters>(EMPTY_WA_FILTERS)
  const [showFilters, setShowFilters] = useState(false)
  const [showDefs, setShowDefs] = useState(false)
  const [showInfo, setShowInfo] = useState(true)
  const [showTakeoverInfo, setShowTakeoverInfo] = useState(false)

  const [message, setMessage] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [attachment, setAttachment] = useState<{ type: MediaType; fileName: string } | null>(null)
  const [menu, setMenu] = useState<"attach" | "mention" | null>(null)
  const [showPoll, setShowPoll] = useState(false)
  const pendingMediaType = useRef<MediaType>("document")
  const fileRef = useRef<HTMLInputElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const endRef = useRef<HTMLDivElement>(null)

  const active = groups.find(g => g.id === activeId) ?? null
  const aiNumber = active ? mockWaNumbers.find(n => n.id === active.aiNumberId) : undefined

  const filtered = applyWaGroupFilters(groups, filters, WA_NOW).filter(g =>
    g.menteeName.toLowerCase().includes(search.toLowerCase()) || g.groupName.toLowerCase().includes(search.toLowerCase()))
  const filterCount = activeFilterCount(filters)

  const timeline: TimelineItem[] = useMemo(() => {
    if (!active) return []
    const items: TimelineItem[] = [
      ...active.messages.map(m => ({ kind: "message" as const, at: m.at, message: m })),
      ...active.events.filter(e => e.type !== "Group queued").map(e => ({ kind: "event" as const, at: e.at, event: e })),
    ]
    return items.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
  }, [active])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }) }, [timeline.length, activeId])

  const updateActive = (fn: (g: WaGroup) => WaGroup) => {
    if (!active) return
    setGroups(prev => prev.map(g => g.id === active.id ? fn(g) : g))
  }

  const toggleTakeover = () => {
    const at = new Date().toISOString()
    updateActive(g => ({
      ...g,
      takeover: g.takeover ? undefined : { by: ADMIN_NAME, since: at },
      events: [...g.events, { id: `E-${Date.now()}`, at, type: g.takeover ? "Admin takeover ended" : "Admin takeover started", detail: ADMIN_NAME }],
    }))
  }

  const pushMessage = (partial: Omit<GroupMessage, "id" | "at" | "senderName" | "senderRole">) => {
    const msg: GroupMessage = { id: `M-${Date.now()}`, at: new Date().toISOString(), senderName: ADMIN_NAME, senderRole: "Admin", ...partial }
    updateActive(g => ({ ...g, messages: [...g.messages, msg] }))
    setMessage(""); setReplyTo(null); setAttachment(null)
  }

  const sendMessage = () => {
    if (!active?.takeover) return
    if (attachment) pushMessage({ text: message.trim(), media: attachment, quotedId: replyTo ?? undefined })
    else if (message.trim()) pushMessage({ text: message.trim(), quotedId: replyTo ?? undefined })
  }

  // Wraps the selected text in a WhatsApp marker (*bold*, _italic_, ~strike~, ```mono```).
  const wrap = (marker: string) => {
    const ta = taRef.current
    if (!ta) return
    const { selectionStart: s, selectionEnd: e } = ta
    const sel = message.slice(s, e) || "text"
    setMessage(message.slice(0, s) + marker + sel + marker + message.slice(e))
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(s + marker.length, s + marker.length + sel.length) })
  }

  // Prefixes every selected line (or the current line) for lists and quotes.
  const prefixLines = (prefix: (i: number) => string) => {
    const ta = taRef.current
    if (!ta) return
    const s = message.lastIndexOf("\n", ta.selectionStart - 1) + 1
    const eIdx = message.indexOf("\n", ta.selectionEnd)
    const e = eIdx === -1 ? message.length : eIdx
    const block = message.slice(s, e).split("\n").map((l, i) => prefix(i) + l).join("\n")
    setMessage(message.slice(0, s) + block + message.slice(e))
    requestAnimationFrame(() => ta.focus())
  }

  const insertMention = (name: string) => {
    setMessage(m => `${m}${m && !m.endsWith(" ") ? " " : ""}@${name} `)
    setMenu(null)
    requestAnimationFrame(() => taRef.current?.focus())
  }

  const pickFile = (type: MediaType) => {
    pendingMediaType.current = type
    setMenu(null)
    if (fileRef.current) { fileRef.current.accept = MEDIA_ACCEPT[type]; fileRef.current.click() }
  }

  const mentee = active ? menteeMember(active) : undefined
  const mentor = active ? currentMentor(active) : undefined
  const past = active ? pastMentors(active) : []
  const req = active ? activeRequest(active) : undefined
  const quoted = (id?: string) => active?.messages.find(m => m.id === id)

  type Tool = "bold" | "italic" | "strike" | "mono" | "bullets" | "numbers" | "quote"
  const toolbar: { id: Tool; icon: typeof Bold; title: string }[] = [
    { id: "bold", icon: Bold, title: "Bold (*text*)" },
    { id: "italic", icon: Italic, title: "Italic (_text_)" },
    { id: "strike", icon: Strikethrough, title: "Strikethrough (~text~)" },
    { id: "mono", icon: Code, title: "Monospace (```text```)" },
    { id: "bullets", icon: List, title: "Bulleted list" },
    { id: "numbers", icon: ListOrdered, title: "Numbered list" },
    { id: "quote", icon: Quote, title: "Quote" },
  ]
  const runTool = (id: Tool) => {
    if (id === "bold") wrap("*")
    else if (id === "italic") wrap("_")
    else if (id === "strike") wrap("~")
    else if (id === "mono") wrap("```")
    else if (id === "bullets") prefixLines(() => "- ")
    else if (id === "numbers") prefixLines(i => `${i + 1}. `)
    else prefixLines(() => "> ")
  }

  return (
    <div className="flex h-full bg-white">
      {/* Group list */}
      <div className="w-80 border-r border-gray-200 flex flex-col shrink-0">
        <div className="px-4 py-4 border-b border-gray-200 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">WA Group Chats</h2>
              <p className="text-xs text-gray-500 mt-0.5">One WhatsApp group per mentee</p>
            </div>
            <button onClick={() => setShowDefs(true)} title="Field and status definitions" className="text-gray-400 hover:text-blue-600"><BookOpen className="w-4 h-4" /></button>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input placeholder="Search by mentee…" className="pl-9 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button onClick={() => setShowFilters(true)}
              className={`flex items-center gap-1 px-2.5 rounded-md border text-xs font-medium ${filterCount ? "border-blue-300 bg-blue-50 text-blue-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
              <Filter className="w-3.5 h-3.5" /> Filter{filterCount ? ` (${filterCount})` : ""}
            </button>
          </div>
          {filterCount > 0 && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-500">{filtered.length} of {groups.length} groups</span>
              <button onClick={() => setFilters(EMPTY_WA_FILTERS)} className="text-blue-600 hover:underline">Clear filters</button>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(g => {
            const lastAt = lastMessageAt(g)
            const last = g.messages.find(m => m.at === lastAt)
            const gm = menteeMember(g)
            const cm = currentMentor(g)
            return (
              <button key={g.id} onClick={() => { setActiveId(g.id); setReplyTo(null); setAttachment(null) }}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${activeId === g.id ? "bg-blue-50" : ""}`}>
                <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0"><Users className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">{g.groupName}</p>
                    <p className="text-[11px] text-gray-400 shrink-0 ml-2">{lastAt ? formatWaTime(lastAt) : ""}</p>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {last ? (last.media ? `📎 ${last.media.fileName}` : last.poll ? `📊 ${last.poll.title}` : last.text) : "No messages yet"}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {gm && gm.status !== "Joined" && <Chip label={`Mentee: ${gm.status}`} cls={MEMBER_STATUS_CLS[gm.status]} />}
                    {cm && cm.status !== "Joined" && <Chip label={`Mentor: ${cm.status}`} cls={MEMBER_STATUS_CLS[cm.status]} />}
                    {g.takeover && <Chip label="Admin takeover" cls="bg-amber-50 text-amber-700 border-amber-200" />}
                  </div>
                </div>
              </button>
            )
          })}
          {filtered.length === 0 && <p className="text-center text-xs text-gray-400 py-8">No groups match.</p>}
        </div>
      </div>

      {/* Chat */}
      {active ? (
        <div className="flex-1 flex min-w-0">
          <div className="flex-1 flex flex-col min-w-0">
            <div className="border-b border-gray-200 px-5 py-3 bg-white shrink-0 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{active.groupName}</p>
                <p className="text-xs text-gray-500 truncate">
                  {active.menteeName} · {req ? `${req.id} (${req.status})` : "No request"} · {AI_NUMBER_NAME} on {numberLabel(active.aiNumberId)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 relative">
                <button onClick={toggleTakeover}
                  title={active.takeover ? "Hand this group back to the AI" : "Take over this group from the AI"}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    active.takeover ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100" : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"}`}>
                  {active.takeover ? <PauseCircle className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  {active.takeover ? "Admin takeover · Hand back to AI" : "AI active · Take over"}
                </button>
                <button onClick={() => setShowTakeoverInfo(v => !v)} title="What admin takeover does" className="text-gray-400 hover:text-blue-600"><Info className="w-4 h-4" /></button>
                <button onClick={() => setShowInfo(v => !v)}
                  className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border ${showInfo ? "bg-gray-100 border-gray-300 text-gray-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                  Group info
                </button>
                {showTakeoverInfo && <TakeoverInfo onClose={() => setShowTakeoverInfo(false)} />}
              </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50">
              {active.takeover && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 sticky top-0 z-10">
                  <PauseCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-700 font-medium">
                    {active.takeover.by} took over {formatWaTime(active.takeover.since)}. AI is not sending in this group but is still reading. Messages go from {AI_NUMBER_NAME} on {aiNumber ? numberLabel(aiNumber.id) : ""}.
                  </p>
                </div>
              )}
              {timeline.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">No messages yet.</div>
              ) : timeline.map(item => item.kind === "event" ? (
                <div key={`ev-${item.event.id}`} className="flex justify-center">
                  <span className="text-[11px] text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-1 text-center">
                    {eventText(item.event)} · {formatWaTime(item.at)}
                  </span>
                </div>
              ) : (() => {
                const m = item.message
                const fromUs = m.senderRole === "AI" || m.senderRole === "Admin"
                const bubble = m.senderRole === "Admin" ? "bg-amber-500 text-white rounded-br-sm"
                  : fromUs ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-white text-gray-900 border border-gray-200 rounded-bl-sm shadow-sm"
                const q = quoted(m.quotedId)
                const MediaIcon = m.media ? MEDIA_ICON[m.media.type] : null
                return (
                  <div key={m.id} className={`group flex items-center gap-2 ${fromUs ? "justify-end" : "justify-start"}`}>
                    {fromUs && active.takeover && (
                      <button onClick={() => setReplyTo(m.id)} title="Reply" className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600"><Reply className="w-3.5 h-3.5" /></button>
                    )}
                    <div className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-2.5 ${bubble}`}>
                      <p className={`text-[11px] font-semibold mb-0.5 ${fromUs ? "text-white/80" : m.senderRole === "Mentee" ? "text-violet-700" : "text-emerald-700"}`}>{senderLabel(m)}</p>
                      {q && (
                        <div className={`text-[11px] rounded-md px-2 py-1 mb-1 border-l-2 ${fromUs ? "bg-white/15 border-white/60" : "bg-gray-100 border-gray-400"}`}>
                          <p className="font-semibold">{q.senderRole === "AI" || q.senderRole === "Admin" ? AI_NUMBER_NAME : q.senderName}</p>
                          <p className="truncate opacity-80">{q.media ? q.media.fileName : q.poll ? q.poll.title : q.text}</p>
                        </div>
                      )}
                      {m.media && MediaIcon && (
                        <p className="text-sm flex items-center gap-1.5 mb-0.5"><MediaIcon className="w-3.5 h-3.5" /> {m.media.fileName} <span className="text-xs opacity-70">({m.media.type})</span></p>
                      )}
                      {m.poll && (
                        <div className="text-sm">
                          <p className="font-semibold flex items-center gap-1.5"><ListChecks className="w-3.5 h-3.5" /> {m.poll.title}</p>
                          <p className="text-[11px] opacity-70 mb-1">{m.poll.multiple ? "Select one or more" : "Select one"}</p>
                          {m.poll.options.map(o => <p key={o} className="flex items-center gap-1.5"><span className={`w-3 h-3 border border-current inline-block ${m.poll!.multiple ? "rounded-sm" : "rounded-full"}`} />{o}</p>)}
                        </div>
                      )}
                      {m.text && <WaText text={m.text} />}
                      <p className={`text-xs mt-1 text-right ${fromUs ? "text-white/70" : "text-gray-400"}`}>{formatWaTime(m.at)}</p>
                    </div>
                    {!fromUs && active.takeover && (
                      <button onClick={() => setReplyTo(m.id)} title="Reply" className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600"><Reply className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                )
              })())}
              <div ref={endRef} />
            </div>

            {/* Composer */}
            <div className="border-t border-gray-200 bg-white shrink-0">
              {active.takeover ? (
                <div className="px-5 py-3 space-y-2">
                  {replyTo && quoted(replyTo) && (
                    <div className="flex items-center justify-between bg-gray-50 border-l-2 border-amber-500 rounded px-3 py-1.5 text-xs">
                      <span className="truncate text-gray-600">Replying to <span className="font-semibold">{quoted(replyTo)!.senderRole === "AI" || quoted(replyTo)!.senderRole === "Admin" ? AI_NUMBER_NAME : quoted(replyTo)!.senderName}</span>: {quoted(replyTo)!.text || quoted(replyTo)!.media?.fileName}</span>
                      <button onClick={() => setReplyTo(null)}><X className="w-3.5 h-3.5 text-gray-400" /></button>
                    </div>
                  )}
                  {attachment && (
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded px-3 py-1.5 text-xs text-blue-700">
                      <span className="flex items-center gap-1.5">{(() => { const I = MEDIA_ICON[attachment.type]; return <I className="w-3.5 h-3.5" /> })()} {attachment.fileName} · text below is sent as the caption</span>
                      <button onClick={() => setAttachment(null)}><X className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                  <div className="flex items-center gap-0.5 relative">
                    {toolbar.map(t => (
                      <button key={t.id} onClick={() => runTool(t.id)} title={t.title} className="w-7 h-7 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 flex items-center justify-center"><t.icon className="w-3.5 h-3.5" /></button>
                    ))}
                    <span className="w-px h-4 bg-gray-200 mx-1" />
                    <button onClick={() => setMenu(menu === "mention" ? null : "mention")} title="Mention" className="w-7 h-7 rounded-md text-gray-500 hover:bg-gray-100 flex items-center justify-center"><AtSign className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setMenu(menu === "attach" ? null : "attach")} title="Attach" className="w-7 h-7 rounded-md text-gray-500 hover:bg-gray-100 flex items-center justify-center"><Paperclip className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setShowPoll(true)} title="Poll" className="w-7 h-7 rounded-md text-gray-500 hover:bg-gray-100 flex items-center justify-center"><ListChecks className="w-3.5 h-3.5" /></button>
                    {menu === "mention" && (
                      <div className="absolute bottom-9 left-48 z-20 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-1 text-xs">
                        <button onClick={() => insertMention("all")} className="w-full text-left px-3 py-2 hover:bg-gray-50"><span className="font-medium">@all</span> <span className="text-gray-400">everyone in the group</span></button>
                        {[mentee, mentor].filter((x): x is GroupMember => !!x && ["Joined", "Link sent"].includes(x.status)).map(x => (
                          <button key={x.phone} onClick={() => insertMention(x.name)} className="w-full text-left px-3 py-2 hover:bg-gray-50"><span className="font-medium">@{x.name}</span> <span className="text-gray-400">{x.role}</span></button>
                        ))}
                      </div>
                    )}
                    {menu === "attach" && (
                      <div className="absolute bottom-9 left-56 z-20 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 text-xs">
                        {(["image", "video", "document", "audio"] as MediaType[]).map(t => {
                          const I = MEDIA_ICON[t]
                          return <button key={t} onClick={() => pickFile(t)} className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 capitalize"><I className="w-3.5 h-3.5 text-gray-500" />{t}</button>
                        })}
                      </div>
                    )}
                    <input ref={fileRef} type="file" className="hidden" onChange={e => {
                      const f = e.target.files?.[0]
                      if (f) setAttachment({ type: pendingMediaType.current, fileName: f.name })
                      e.target.value = ""
                    }} />
                  </div>
                  <div className="flex items-end gap-2">
                    <textarea ref={taRef} rows={2}
                      className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 resize-none"
                      placeholder={attachment ? "Add a caption…" : `Message the group as ${AI_NUMBER_NAME}…  (Shift+Enter for a new line)`}
                      value={message} onChange={e => setMessage(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() } }} />
                    <button onClick={sendMessage} disabled={!message.trim() && !attachment}
                      className="w-10 h-10 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl flex items-center justify-center transition-colors shrink-0">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                    <p className="text-xs text-gray-500 flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> AI is handling this group. Take over to send messages from {AI_NUMBER_NAME}.</p>
                    <button onClick={toggleTakeover} className="text-xs font-semibold text-amber-700 hover:underline shrink-0">Take over</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Group info */}
          {showInfo && (
            <div className="w-72 border-l border-gray-200 overflow-y-auto shrink-0 bg-white">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">Group info</p>
                <button onClick={() => setShowDefs(true)} className="text-[11px] text-blue-600 hover:underline">Status definitions</button>
              </div>
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Ops team numbers</p>
                {active.members.filter(m => m.role === "AI number" || m.role === "Backup admin").map(m => {
                  const n = mockWaNumbers.find(x => x.phone === m.phone)
                  return (
                    <div key={m.phone}>
                      <MemberRow m={m} sub={n ? `${n.label} · ${m.role}` : m.role} />
                      {n && <div className="-mt-1 mb-1"><Chip label={`Number: ${n.status}`} cls={NUMBER_STATUS_CLS[n.status]} /></div>}
                    </div>
                  )
                })}
              </div>
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Mentee</p>
                {mentee ? <MemberRow m={mentee} /> : <p className="text-xs text-gray-400 py-2">Not invited yet</p>}
              </div>
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Current mentor</p>
                {mentor ? <MemberRow m={mentor} sub={mentor.requestId} /> : <p className="text-xs text-gray-400 py-2">No mentor on {req?.id ?? "the active request"} yet</p>}
              </div>
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Past mentors ({past.length})</p>
                {past.length === 0 ? <p className="text-xs text-gray-400 py-2">None</p> : past.map((m, i) => <MemberRow key={`${m.phone}-${m.requestId}-${i}`} m={m} sub={m.requestId} />)}
              </div>
              <div className="px-4 py-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Invite link</p>
                <p className="text-[11px] text-gray-600 break-all">{active.inviteLink}</p>
                <p className="text-[11px] text-gray-400 mt-1">Join approval is on. Only the mentee and the current mentor are approved. Reset when a mentor is removed.</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Select a group to view its conversation</p>
          </div>
        </div>
      )}

      {showFilters && (
        <WaGroupFilterDrawer filters={filters} options={filterOptions(groups)}
          onApply={f => { setFilters(f); setShowFilters(false) }} onClose={() => setShowFilters(false)} />
      )}
      {showDefs && <WaDefinitionsModal onClose={() => setShowDefs(false)} />}
      {showPoll && <PollModal onClose={() => setShowPoll(false)} onSend={p => { pushMessage({ text: "", poll: p, quotedId: replyTo ?? undefined }); setShowPoll(false) }} />}
    </div>
  )
}
