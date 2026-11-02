import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  mockWaGroups, mockWaNumbers, formatWaTime, nextCreationSlot, numberName, numberLabel, WA_NOW,
  MEMBER_STATUS_CLS, NUMBER_STATUS_CLS, FIELD_DEFINITIONS, AI_NUMBER_NAME, BACKUP_NUMBER_NAME,
  MAX_GROUPS_PER_NUMBER_PER_DAY, MIN_HOURS_BETWEEN_CREATIONS,
  activeRequest, currentMentor, pastMentors, menteeMember, lastMessageAt,
  type WaGroupStatus, type GroupEventType, type WaNumber, type WaNumberRole,
} from "@/data/waGroupsData"
import { EMPTY_WA_FILTERS, activeFilterCount, applyWaGroupFilters, filterOptions, type WaGroupFilters } from "@/lib/waGroupFilters"
import { WaGroupFilterDrawer } from "@/components/WaGroupFilterDrawer"
import { WaDefinitionsModal } from "@/components/WaDefinitionsModal"
import { mockSettings } from "@/data/settingsData"
import { planCreationQueue } from "@/lib/waGroupDistribution"
import {
  Users, Clock, AlertTriangle, UserX, Smartphone, ListChecks, Activity, PhoneOff, Filter, Info, BookOpen,
  Plus, X, CheckCircle2, QrCode, KeyRound, RefreshCw, Pencil, Check, Layers,
} from "lucide-react"

type View = "groups" | "queue" | "numbers" | "events"

const GROUP_STATUS_CLS: Record<WaGroupStatus, string> = {
  Created: "bg-green-50 text-green-700 border-green-200",
  Queued:  "bg-blue-50 text-blue-700 border-blue-200",
  Failed:  "bg-red-50 text-red-700 border-red-200",
}

const thCls = "text-left px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide"
const td = "px-4 py-3 align-top"
const FIELD = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white"

const definition = (field: string) => FIELD_DEFINITIONS.find(d => d.field === field)?.definition

// Column header with the field definition on hover.
function Th({ label, field }: { label: string; field?: string }) {
  const def = field ? definition(field) : undefined
  return (
    <th className={thCls}>
      <span className="inline-flex items-center gap-1" title={def}>
        {label}{def && <Info className="w-3 h-3 text-gray-300" />}
      </span>
    </th>
  )
}

function Chip({ label, cls }: { label: string; cls: string }) {
  return <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded border ${cls}`}>{label}</span>
}

// ─── Add / reconnect number ───────────────────────────────────────────────────

// Deterministic fake QR pattern for the prototype. The real QR is the base64 image from GET /users/login.
function MockQr({ seed }: { seed: number }) {
  const size = 21
  const cells = Array.from({ length: size * size }, (_, i) => {
    const x = i % size, y = Math.floor(i / size)
    const finder = (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7)
    if (finder) return (x % 6 === 0 || y % 6 === 0 || (x >= size - 7 && (x - (size - 7)) % 6 === 0)) || ((x % (size - 7)) >= 2 && (x % (size - 7)) <= 4 && (y % (size - 7)) >= 2 && (y % (size - 7)) <= 4)
    return ((x * 31 + y * 17 + seed * 7) * 2654435761) % 7 < 3
  })
  return (
    <div className="grid bg-white p-2 border border-gray-200 rounded" style={{ gridTemplateColumns: `repeat(${size}, 8px)` }}>
      {cells.map((on, i) => <div key={i} className={`w-2 h-2 ${on ? "bg-gray-900" : "bg-white"}`} />)}
    </div>
  )
}

function NumberModal({ existing, numbers, onDone, onClose }: {
  existing?: WaNumber
  numbers: WaNumber[]
  onDone: (n: WaNumber) => void
  onClose: () => void
}) {
  const [step, setStep] = useState<"details" | "connect" | "done">(existing ? "connect" : "details")
  const [phone, setPhone] = useState(existing?.phone ?? "")
  const [label, setLabel] = useState(existing?.label ?? "")
  const [role, setRole] = useState<WaNumberRole>(existing?.role ?? "AI number")
  const backups = numbers.filter(n => n.role === "Backup admin" && n.status === "Connected")
  const [backupId, setBackupId] = useState(existing?.backupAdminId ?? backups[0]?.id ?? "")
  const [checked, setChecked] = useState<"idle" | "valid">("idle")
  const [method, setMethod] = useState<"qr" | "code">("qr")
  const [seed, setSeed] = useState(1)
  const [expiresIn, setExpiresIn] = useState(60)
  const [result, setResult] = useState<WaNumber | null>(null)

  useEffect(() => {
    if (step !== "connect" || method !== "qr") return
    const t = setInterval(() => setExpiresIn(s => {
      if (s <= 1) { setSeed(x => x + 1); return 60 }
      return s - 1
    }), 1000)
    return () => clearInterval(t)
  }, [step, method])

  const digits = phone.replace(/\D/g, "")
  const labelTaken = numbers.some(n => n.id !== existing?.id && n.label.trim().toLowerCase() === label.trim().toLowerCase())
  const phoneValid = digits.length >= 10 && label.trim().length > 0 && !labelTaken
  const displayName = role === "AI number" ? AI_NUMBER_NAME : BACKUP_NUMBER_NAME

  const finish = () => {
    const n: WaNumber = existing
      ? { ...existing, status: "Connected", statusDetail: undefined }
      : {
          id: `WN-${Date.now()}`, label: label.trim(), phone, role, status: "Connected", linkedAt: new Date().toISOString(),
          backupAdminId: role === "AI number" ? backupId : undefined, groupsCreatedToday: 0, groupsHeld: 0,
        }
    setResult(n)
    setStep("done")
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-[520px]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">{existing ? `Reconnect ${existing.label} (${existing.phone})` : "Add Ops team number"}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {step === "details" ? "Step 1 of 2 · Number details" : step === "connect" ? `${existing ? "" : "Step 2 of 2 · "}Link the number to Whapi` : "Connected"}
            </p>
          </div>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>

        {step === "details" && (
          <div className="px-5 py-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Name *</label>
              <input className={FIELD} placeholder="e.g. Batch 4" value={label} onChange={e => setLabel(e.target.value)} />
              {labelTaken
                ? <p className="text-[11px] text-red-600 mt-1">Another number already has this name.</p>
                : <p className="text-[11px] text-gray-400 mt-1">Shown on the admin portal only, to find and filter this number. Members see the WhatsApp profile name.</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">WhatsApp number *</label>
              <input className={FIELD} placeholder="+91 90000 10004" value={phone} onChange={e => { setPhone(e.target.value); setChecked("idle") }} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Role *</label>
              <select className={FIELD} value={role} onChange={e => setRole(e.target.value as WaNumberRole)}>
                <option value="AI number">AI number (creates groups, sends and reads messages)</option>
                <option value="Backup admin">Backup admin (silent admin in every group)</option>
              </select>
            </div>
            {role === "AI number" && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Backup admin number *</label>
                <select className={FIELD} value={backupId} onChange={e => setBackupId(e.target.value)}>
                  {backups.map(b => <option key={b.id} value={b.id}>{b.label} ({b.phone})</option>)}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">Added to every group this number creates, and promoted to admin.</p>
              </div>
            )}
            <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600 space-y-1">
              <p>WhatsApp profile name will be set to <span className="font-semibold">{displayName}</span>.</p>
              <p className="text-gray-400">Use a regular WhatsApp account, not the WhatsApp Business app. Whapi can't set the profile name on Business app accounts.</p>
            </div>
            {checked === "valid" && (
              <p className="text-xs text-green-700 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> {phone} is registered on WhatsApp.</p>
            )}
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
              {checked === "valid"
                ? <Button className="flex-1" onClick={() => setStep("connect")}>Continue to link</Button>
                : <Button className="flex-1" disabled={!phoneValid} onClick={() => setChecked("valid")}>Check number</Button>}
            </div>
          </div>
        )}

        {step === "connect" && (
          <div className="px-5 py-4 space-y-4">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
              <button onClick={() => setMethod("qr")} className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md ${method === "qr" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}><QrCode className="w-3.5 h-3.5" /> QR code</button>
              <button onClick={() => setMethod("code")} className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md ${method === "code" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}><KeyRound className="w-3.5 h-3.5" /> Pairing code</button>
            </div>
            {method === "qr" ? (
              <div className="flex gap-4">
                <MockQr seed={seed} />
                <div className="text-xs text-gray-600 space-y-2">
                  <p className="font-semibold text-gray-900">On the phone with {phone}:</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Open WhatsApp → Settings → Linked devices</li>
                    <li>Tap Link a device</li>
                    <li>Scan this code</li>
                  </ol>
                  <p className="text-gray-400 flex items-center gap-1">Refreshes in {expiresIn}s
                    <button onClick={() => { setSeed(s => s + 1); setExpiresIn(60) }} className="text-blue-600"><RefreshCw className="w-3 h-3" /></button>
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-600 space-y-2">
                <p className="text-2xl font-mono font-semibold tracking-widest text-gray-900">482-913</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>On the phone with {phone}, open WhatsApp → Settings → Linked devices</li>
                  <li>Tap Link a device → Link with phone number instead</li>
                  <li>Enter this code</li>
                </ol>
              </div>
            )}
            <p className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">Status: Pending connection. The portal checks the link automatically.</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button className="flex-1" onClick={finish}>Simulate linked (prototype)</Button>
            </div>
          </div>
        )}

        {step === "done" && result && (
          <div className="px-5 py-5 space-y-3 text-xs text-gray-700">
            <p className="flex items-center gap-2 text-sm font-semibold text-green-700"><CheckCircle2 className="w-4 h-4" /> {result.label} ({result.phone}) connected</p>
            <ul className="space-y-1 pl-1">
              <li>• Profile name set to <span className="font-semibold">{numberName(result)}</span></li>
              <li>• Webhooks set for messages, groups, statuses, users and channel events</li>
              {result.role === "AI number" && <li>• Available for group creation from now: up to {MAX_GROUPS_PER_NUMBER_PER_DAY} groups a day, {mockSettings.maxGroupsPerNumber} groups in total</li>}
            </ul>
            <Button className="w-full" onClick={() => onDone(result)}>Done</Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WaGroupActivity() {
  const [view, setView] = useState<View>("groups")
  const [filters, setFilters] = useState<WaGroupFilters>(EMPTY_WA_FILTERS)
  const [showFilters, setShowFilters] = useState(false)
  const [showDefs, setShowDefs] = useState(false)
  const [eventFilter, setEventFilter] = useState<GroupEventType | "all">("all")
  const [numbers, setNumbers] = useState<WaNumber[]>(mockWaNumbers)
  const [numberModal, setNumberModal] = useState<{ existing?: WaNumber } | null>(null)
  const [renaming, setRenaming] = useState<{ id: string; value: string } | null>(null)
  const batchSize = mockSettings.maxGroupsPerNumber

  const filtered = applyWaGroupFilters(mockWaGroups, filters, WA_NOW)
  const filterCount = activeFilterCount(filters)
  const created = filtered.filter(g => g.status === "Created")
  const waiting = filtered.filter(g => g.status !== "Created")
  const menteeNotJoined = created.filter(g => { const m = menteeMember(g); return m && (m.status === "Link sent" || m.status === "Did not join") })
  const mentorNotJoined = created.filter(g => currentMentor(g)?.status === "Link sent")
  const createdToday = numbers.reduce((s, n) => s + n.groupsCreatedToday, 0)
  const notConnected = numbers.filter(n => n.status !== "Connected")
  const plan = planCreationQueue(mockWaGroups, numbers, batchSize)
  const capacityLeft = numbers
    .filter(n => n.role === "AI number" && n.status === "Connected")
    .reduce((s, n) => s + Math.max(0, batchSize - n.groupsHeld), 0)
  const unassigned = plan.filter(p => !p.numberId).length

  const stats = [
    { label: "Groups created", value: created.length, icon: Users, cls: "text-gray-900" },
    { label: "Created today", value: createdToday, icon: Clock, cls: "text-gray-900" },
    { label: "Waiting to be created", value: waiting.length, icon: ListChecks, cls: waiting.length ? "text-blue-700" : "text-gray-900" },
    { label: "Mentee not joined", value: menteeNotJoined.length, icon: UserX, cls: menteeNotJoined.length ? "text-amber-700" : "text-gray-900" },
    { label: "Mentor not joined", value: mentorNotJoined.length, icon: UserX, cls: mentorNotJoined.length ? "text-amber-700" : "text-gray-900" },
    { label: "Numbers not connected", value: notConnected.length, icon: PhoneOff, cls: notConnected.length ? "text-red-600" : "text-gray-900" },
    { label: "Batch capacity left", value: capacityLeft, icon: Layers, cls: capacityLeft < waiting.length ? "text-red-600" : "text-gray-900" },
  ]

  const allEvents = filtered
    .flatMap(g => g.events.map(e => ({ ...e, groupName: g.groupName, groupId: g.id })))
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
  const eventTypes = Array.from(new Set(allEvents.map(e => e.type)))
  const filteredEvents = eventFilter === "all" ? allEvents : allEvents.filter(e => e.type === eventFilter)

  const tabs: { id: View; label: string; icon: typeof Users; count?: number }[] = [
    { id: "groups", label: "Groups", icon: Users, count: created.length },
    { id: "queue", label: "Creation Queue", icon: ListChecks, count: waiting.length },
    { id: "numbers", label: "Numbers", icon: Smartphone, count: numbers.length },
    { id: "events", label: "Event Log", icon: Activity },
  ]

  const saveRename = () => {
    if (!renaming) return
    const value = renaming.value.trim()
    if (!value || numbers.some(n => n.id !== renaming.id && n.label.toLowerCase() === value.toLowerCase())) return
    const n = mockWaNumbers.find(x => x.id === renaming.id)
    if (n) n.label = value
    setNumbers([...mockWaNumbers])
    setRenaming(null)
  }

  const saveNumber = (n: WaNumber) => {
    const idx = mockWaNumbers.findIndex(x => x.id === n.id)
    if (idx >= 0) mockWaNumbers[idx] = n
    else mockWaNumbers.push(n)
    setNumbers([...mockWaNumbers])
    setNumberModal(null)
  }

  return (
    <div className="p-6 space-y-5 overflow-auto h-full">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">WA Group Activity</h1>
          <p className="text-sm text-gray-500 mt-0.5">Group creation, joining and membership across all mentee WhatsApp groups</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowDefs(true)}><BookOpen className="w-3.5 h-3.5 mr-1.5" />Definitions</Button>
          <Button variant="outline" onClick={() => setShowFilters(true)} className={filterCount ? "border-blue-300 bg-blue-50 text-blue-700" : ""}>
            <Filter className="w-3.5 h-3.5 mr-1.5" />Filter{filterCount ? ` (${filterCount})` : ""}
          </Button>
        </div>
      </div>

      {filterCount > 0 && (
        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-500">Filters applied to groups, queue and event log.</span>
          <button onClick={() => setFilters(EMPTY_WA_FILTERS)} className="text-blue-600 hover:underline">Clear filters</button>
        </div>
      )}

      {unassigned > 0 && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-xs">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          {unassigned} queued group{unassigned > 1 ? "s have" : " has"} no AI number with space. Every Connected AI number holds {batchSize} groups. Add a number on the Numbers tab.
        </div>
      )}

      <div className="grid grid-cols-4 xl:grid-cols-7 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-lg px-4 py-3" title={definition(s.label)}>
            <div className="flex items-center gap-1.5 text-xs text-gray-500"><s.icon className="w-3.5 h-3.5" />{s.label}<Info className="w-3 h-3 text-gray-300" /></div>
            <p className={`text-2xl font-semibold mt-1 ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setView(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${view === t.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
            {t.count !== undefined && <span className="text-[11px] bg-gray-100 text-gray-600 rounded-full px-1.5">{t.count}</span>}
          </button>
        ))}
      </div>

      {view === "groups" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <Th label="Group" />
                <Th label="Request" field="Request" />
                <Th label="Mentee" />
                <Th label="Current mentor" field="Current mentor" />
                <Th label="Past mentors" field="Past mentors" />
                <Th label="Ops team number" />
                <Th label="Created" field="Created" />
                <Th label="Last message" field="Last message" />
              </tr>
            </thead>
            <tbody>
              {created.map(g => {
                const req = activeRequest(g)
                const mentee = menteeMember(g)
                const mentor = currentMentor(g)
                const past = pastMentors(g)
                const last = lastMessageAt(g)
                return (
                  <tr key={g.id} className="border-b border-gray-100">
                    <td className={td}>
                      <p className="font-medium text-gray-900">{g.groupName}</p>
                      {g.takeover && <Chip label={`Takeover · ${g.takeover.by}`} cls="bg-amber-50 text-amber-700 border-amber-200" />}
                    </td>
                    <td className={td}>
                      <p className="text-gray-700">{req?.id ?? "—"}</p>
                      <p className="text-gray-400">{req?.status ?? ""}</p>
                    </td>
                    <td className={td}>
                      <p className="text-gray-700 mb-1">{g.menteeName}</p>
                      {mentee && <Chip label={mentee.status} cls={MEMBER_STATUS_CLS[mentee.status]} />}
                      {mentee?.status === "Link sent" && (
                        <p className="text-gray-400 mt-1">
                          Since {mentee.linkSentAt && formatWaTime(mentee.linkSentAt)}
                          {mentee.remindersSent ? ` · ${mentee.remindersSent} reminder${mentee.remindersSent > 1 ? "s" : ""}` : ""}
                        </p>
                      )}
                    </td>
                    <td className={td}>
                      {mentor ? (
                        <>
                          <p className="text-gray-700 mb-1">{mentor.name}</p>
                          <Chip label={mentor.status} cls={MEMBER_STATUS_CLS[mentor.status]} />
                          {mentor.status === "Link sent" && mentor.linkSentAt && <p className="text-gray-400 mt-1">Since {formatWaTime(mentor.linkSentAt)}</p>}
                        </>
                      ) : <span className="text-gray-400">None</span>}
                    </td>
                    <td className={td}>
                      {past.length === 0 ? <span className="text-gray-400">0</span> : past.map((m, i) => (
                        <p key={i} className="text-gray-600 whitespace-nowrap">{m.name} <span className="text-gray-400">· {m.status} · {m.requestId}</span></p>
                      ))}
                    </td>
                    <td className={`${td} text-gray-600 whitespace-nowrap`}>{numberLabel(g.aiNumberId)}</td>
                    <td className={`${td} text-gray-600 whitespace-nowrap`}>{g.createdAt ? formatWaTime(g.createdAt) : "—"}</td>
                    <td className={`${td} text-gray-600 whitespace-nowrap`}>{last ? formatWaTime(last) : "No messages"}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {created.length === 0 && <p className="text-center py-10 text-gray-400 text-sm">No groups match these filters.</p>}
        </div>
      )}

      {view === "queue" && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Groups are created in the order requests were submitted. Each goes to a Connected AI number holding fewer than {batchSize} groups, at the earliest allowed slot ({MIN_HOURS_BETWEEN_CREATIONS} hours apart, at most {MAX_GROUPS_PER_NUMBER_PER_DAY} a day). Ties go to the number closest to full, so batches fill one at a time.
          </p>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <Th label="Mentee" />
                  <Th label="Request" field="Request" />
                  <Th label="Queued at" field="Queued at" />
                  <Th label="Status" />
                  <Th label="Will be created on" field="Will be created on" />
                  <Th label="Error" />
                </tr>
              </thead>
              <tbody>
                {waiting.map(g => {
                  const p = plan.find(x => x.groupId === g.id)
                  return (
                  <tr key={g.id} className="border-b border-gray-100">
                    <td className={`${td} font-medium text-gray-900`}>{g.menteeName}</td>
                    <td className={`${td} text-gray-700`}>{activeRequest(g)?.id ?? "—"}</td>
                    <td className={`${td} text-gray-600`}>{formatWaTime(g.queuedAt)}</td>
                    <td className={td}><Chip label={g.status} cls={GROUP_STATUS_CLS[g.status]} /></td>
                    <td className={`${td} text-gray-600`}>
                      {p?.numberId && p.at
                        ? <>{numberLabel(p.numberId)}<p className="text-gray-400">{formatWaTime(p.at)}</p></>
                        : <span className="text-red-600">No AI number with space</span>}
                    </td>
                    <td className={td}>
                      {g.failureError
                        ? <span className="flex items-start gap-1 text-red-600"><AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" />{g.failureError}</span>
                        : <span className="text-gray-400">—</span>}
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
            {waiting.length === 0 && <p className="text-center py-10 text-gray-400 text-sm">No groups waiting to be created.</p>}
          </div>
        </div>
      )}

      {view === "numbers" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              AI numbers show as <span className="font-semibold">{AI_NUMBER_NAME}</span> in groups; backup admin numbers as <span className="font-semibold">{BACKUP_NUMBER_NAME}</span>.
            </p>
            <Button onClick={() => setNumberModal({})}><Plus className="w-3.5 h-3.5 mr-1.5" />Add number</Button>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <Th label="Name and number" />
                  <Th label="Role" />
                  <Th label="Status" />
                  <Th label="Backup admin" />
                  <Th label="Groups held" field="Groups held" />
                  <Th label="Created today" field="Created today" />
                  <Th label="Last creation" />
                  <Th label="Next allowed creation" field="Next allowed creation" />
                  <Th label="Linked since" field="Linked since" />
                  <Th label="" />
                </tr>
              </thead>
              <tbody>
                {numbers.map(n => {
                  const isAi = n.role === "AI number"
                  const next = nextCreationSlot(n, batchSize)
                  const atMax = n.groupsCreatedToday >= MAX_GROUPS_PER_NUMBER_PER_DAY
                  const full = isAi && n.groupsHeld >= batchSize
                  return (
                    <tr key={n.id} className="border-b border-gray-100">
                      <td className={td}>
                        {renaming?.id === n.id ? (
                          <div className="flex items-center gap-1">
                            <input autoFocus value={renaming.value} onChange={e => setRenaming({ id: n.id, value: e.target.value })}
                              onKeyDown={e => { if (e.key === "Enter") saveRename(); if (e.key === "Escape") setRenaming(null) }}
                              className="w-28 text-xs border border-blue-300 rounded px-2 py-1 outline-none" />
                            <button onClick={saveRename} title="Save name"><Check className="w-3.5 h-3.5 text-green-600" /></button>
                            <button onClick={() => setRenaming(null)} title="Cancel"><X className="w-3.5 h-3.5 text-gray-400" /></button>
                          </div>
                        ) : (
                          <p className="font-medium text-gray-900 whitespace-nowrap flex items-center gap-1.5">
                            {n.label}
                            <button onClick={() => setRenaming({ id: n.id, value: n.label })} title="Rename"><Pencil className="w-3 h-3 text-gray-400 hover:text-blue-600" /></button>
                          </p>
                        )}
                        <p className="text-gray-500 whitespace-nowrap">{n.phone}</p>
                        <p className="text-gray-400">Shows as {numberName(n)}</p>
                      </td>
                      <td className={`${td} text-gray-700`}>{n.role}</td>
                      <td className={td}>
                        <Chip label={n.status} cls={NUMBER_STATUS_CLS[n.status]} />
                        {n.statusDetail && <p className="text-gray-400 mt-1 max-w-[180px]">{n.statusDetail}</p>}
                      </td>
                      <td className={`${td} text-gray-600 whitespace-nowrap`}>{isAi && n.backupAdminId ? numberLabel(n.backupAdminId) : "—"}</td>
                      <td className={td}>
                        {isAi ? (
                          <div className="w-28">
                            <p className={full ? "text-red-600 font-medium" : "text-gray-700"}>{n.groupsHeld} / {batchSize}{full ? " · Full" : ""}</p>
                            <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                              <div className={`h-full ${full ? "bg-red-500" : "bg-blue-500"}`} style={{ width: `${Math.min(100, (n.groupsHeld / batchSize) * 100)}%` }} />
                            </div>
                          </div>
                        ) : <span className="text-gray-700">{n.groupsHeld}</span>}
                      </td>
                      <td className={td}>
                        {isAi ? <span className={atMax ? "text-red-600 font-medium" : "text-gray-700"}>{n.groupsCreatedToday} / {MAX_GROUPS_PER_NUMBER_PER_DAY}</span> : <span className="text-gray-400">—</span>}
                      </td>
                      <td className={`${td} text-gray-600 whitespace-nowrap`}>{isAi && n.lastGroupCreatedAt ? formatWaTime(n.lastGroupCreatedAt) : "—"}</td>
                      <td className={`${td} text-gray-600 whitespace-nowrap`}>
                        {!isAi ? "—" : n.status !== "Connected" ? <span className="text-red-600">Not connected</span> : full ? <span className="text-red-600">Batch full</span> : atMax ? <span className="text-red-600">Daily maximum reached</span> : next ? formatWaTime(next) : "—"}
                      </td>
                      <td className={`${td} text-gray-600 whitespace-nowrap`}>{n.linkedAt ? formatWaTime(n.linkedAt) : "—"}</td>
                      <td className={td}>
                        {n.status !== "Connected" && (
                          <button onClick={() => setNumberModal({ existing: n })} className="text-xs font-medium text-blue-600 hover:underline whitespace-nowrap">Reconnect</button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === "events" && (
        <div className="space-y-3">
          <select value={eventFilter} onChange={e => setEventFilter(e.target.value as GroupEventType | "all")}
            className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-blue-400">
            <option value="all">All events</option>
            {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <Th label="Time" /><Th label="Group" /><Th label="Event" /><Th label="Member" /><Th label="Detail" />
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map(e => (
                  <tr key={`${e.groupId}-${e.id}`} className="border-b border-gray-100">
                    <td className={`${td} text-gray-600 whitespace-nowrap`}>{formatWaTime(e.at)}</td>
                    <td className={`${td} text-gray-900 font-medium`}>{e.groupName}</td>
                    <td className={`${td} text-gray-700`}>{e.type}</td>
                    <td className={`${td} text-gray-600`}>{e.member ?? "—"}</td>
                    <td className={`${td} text-gray-500`}>{e.detail ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showFilters && (
        <WaGroupFilterDrawer filters={filters} options={filterOptions(mockWaGroups)}
          onApply={f => { setFilters(f); setShowFilters(false) }} onClose={() => setShowFilters(false)} />
      )}
      {showDefs && <WaDefinitionsModal onClose={() => setShowDefs(false)} />}
      {numberModal && (
        <NumberModal existing={numberModal.existing} numbers={numbers} onDone={saveNumber} onClose={() => setNumberModal(null)} />
      )}
    </div>
  )
}
