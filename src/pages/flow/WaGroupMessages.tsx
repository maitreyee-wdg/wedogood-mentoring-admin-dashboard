import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Lock, Moon, Pause, Pencil, Play, Plus, Users, Info } from "lucide-react"
import { WaText } from "@/components/WaText"
import {
  ReplaceVarPopup, findSysVar, VAR_CATEGORY_COLORS,
  type VarCategory, type VarMapping,
} from "@/components/WaVariableMapper"
import { AI_NUMBER_NAME } from "@/data/waGroupsData"

// ─── Types ────────────────────────────────────────────────────────────────────

type GroupTriggerId = "mentee_joined" | "mentor_joined"

interface GroupMessage {
  text: string                           // uses {{1}}, {{2}}… like WhatsApp templates
  varMappings: Record<number, VarMapping>
}

interface GroupMessageTrigger {
  id: GroupTriggerId
  name: string
  event: string
  sendsWhen: string[]
  notSentWhen: string[]
  messages: GroupMessage[]
  delaySeconds: number          // gap before message 2; only used when there are 2 messages
  respectSleepHours: boolean
  status: "Active" | "Paused"
  sentCount: number
  skippedCount: number
}

// ─── Variables ────────────────────────────────────────────────────────────────
// Variables come from the System Triggers list (SYSTEM_VARIABLES). Group messages are
// sent as free text through Whapi, so there is no Meta template approval.
// @mentee and @mentor are typed in the text and sent as real WhatsApp mentions.

// The mentee welcome can fire before any mentor is matched, so Volunteer variables are not offered there.
const ALLOWED: Record<GroupTriggerId, VarCategory[]> = {
  mentee_joined: ["Mentee", "Engagement"],
  mentor_joined: ["Mentee", "Volunteer", "Engagement"],
}

const MENTIONS: Record<GroupTriggerId, string[]> = {
  mentee_joined: ["@mentee"],
  mentor_joined: ["@mentee", "@mentor"],
}

const MENTION_SAMPLES: Record<string, string> = { "@mentee": "@Priya Sharma", "@mentor": "@Rahul Mehta" }

const SAMPLE_VALUES: Record<string, string> = {
  mentee_first_name: "Priya", mentee_last_name: "Sharma", mentee_city: "Pune", mentee_state: "Maharashtra",
  mentee_country: "India", mentee_group_name: "Pratham Pune 2026", mentee_education_level: "Undergraduate",
  mentee_education_degree: "B.Com",
  volunteer_first_name: "Rahul", volunteer_last_name: "Mehta", volunteer_current_company: "Infosys",
  volunteer_city: "Bengaluru", volunteer_state: "Karnataka", volunteer_country: "India",
  engagement_goal: "preparing for campus interviews", engagement_theme: "Career readiness",
  engagement_target_domain: "Finance", days_valid: "30", days_remaining: "12",
}

const WA_TEXT_LIMIT = 4096
const VAR_RE = /\{\{(\d+)\}\}/g

function varNumbers(text: string): number[] {
  return [...new Set([...text.matchAll(VAR_RE)].map(m => Number(m[1])))].sort((a, b) => a - b)
}

function sampleFor(m: VarMapping | undefined): string | null {
  if (!m) return null
  if (m.mode === "custom") return m.customText || null
  const v = findSysVar(m.systemVar)
  return v ? SAMPLE_VALUES[v.key] ?? `[${v.category} ${v.label}]` : null
}

function resolve(msg: GroupMessage): string {
  let out = msg.text.replace(VAR_RE, (raw, n) => sampleFor(msg.varMappings[Number(n)]) ?? raw)
  for (const [token, sample] of Object.entries(MENTION_SAMPLES)) out = out.split(token).join(sample)
  return out
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const sys = (key: string): VarMapping => ({ mode: "system", systemVar: key, customText: "" })

const DEFAULTS: GroupMessageTrigger[] = [
  {
    id: "mentee_joined",
    name: "Mentee joined group: Welcome",
    event: "The mentee joins their WhatsApp group through the invite link",
    sendsWhen: ["First time the mentee joins the group"],
    notSentWhen: ["The mentee rejoins after leaving", "Admin takeover is on (skipped and logged)", "The trigger is paused"],
    messages: [{
      text: "Hi @mentee 👋 Welcome to your WeDoGood mentoring group!\n\n*Who is in this group*\n- Ops team (WDG): that's us. We set things up and help if you get stuck.\n- Your mentor joins this group once they accept your request.\n\n*What happens next*\n1. We find a mentor for your goal: _{{1}}_\n2. Your mentor joins this group and introduces themselves\n3. You plan your calls with your mentor here\n\nThis group stays the same for your whole engagement. Use the meet link shared in this group for every call with your mentor.",
      varMappings: { 1: sys("engagement_goal") },
    }],
    delaySeconds: 0,
    respectSleepHours: false,
    status: "Active",
    sentCount: 112,
    skippedCount: 3,
  },
  {
    id: "mentor_joined",
    name: "Mentor joined group: Introduction",
    event: "The current mentor of the mentee's active request joins the group",
    sendsWhen: ["Each new current mentor, including a replacement mentor"],
    notSentWhen: ["A past mentor rejoins", "The current mentor rejoins after leaving", "Admin takeover is on (skipped and logged)", "The trigger is paused"],
    messages: [
      {
        text: "Welcome @mentor! 🎉\n\n@mentee, meet {{1}} from {{2}}. {{1}} will be your mentor for _{{3}}_.\n\n{{1}}, meet {{4}} from {{5}}.\n\nTo break the ice: tell each other one thing you're looking forward to in this engagement 🙂",
        varMappings: {
          1: sys("volunteer_first_name"), 2: sys("volunteer_current_company"), 3: sys("engagement_goal"),
          4: sys("mentee_first_name"), 5: sys("mentee_city"),
        },
      },
      {
        text: "*How this works*\n1. Use this group to plan your calls\n2. Join every call on the meet link shared in this group\n3. Plan your first call in the next few days\n4. Need help? Message Ops team (WDG) in this group",
        varMappings: {},
      },
    ],
    delaySeconds: 60,
    respectSleepHours: false,
    status: "Active",
    sentCount: 71,
    skippedCount: 1,
  },
]

const DELAY_OPTIONS = [
  { value: 0,   label: "Right after message 1" },
  { value: 30,  label: "30 seconds after" },
  { value: 60,  label: "1 minute after" },
  { value: 120, label: "2 minutes after" },
  { value: 300, label: "5 minutes after" },
]

function delayLabel(s: number): string {
  return DELAY_OPTIONS.find(o => o.value === s)?.label ?? `${s} seconds after`
}

// ─── Preview ──────────────────────────────────────────────────────────────────

function GroupPreview({ trigger }: { trigger: GroupMessageTrigger }) {
  return (
    <div className="rounded-xl bg-[#efeae2] p-3 space-y-2 min-h-[180px]">
      <p className="text-center text-[10px] text-gray-500 bg-white/70 rounded-md px-2 py-1 mx-auto w-fit">
        {trigger.id === "mentee_joined" ? "Priya Sharma joined using this group's invite link" : "Rahul Mehta joined using this group's invite link"}
      </p>
      {trigger.messages.map((m, i) => (
        <div key={i}>
          {i === 1 && trigger.delaySeconds > 0 && (
            <p className="text-center text-[10px] text-gray-500 mb-1">{delayLabel(trigger.delaySeconds)}</p>
          )}
          <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 shadow-sm max-w-[92%]">
            <p className="text-[11px] font-semibold text-teal-700 mb-0.5">{AI_NUMBER_NAME}</p>
            <div className="text-gray-800"><WaText text={resolve(m)} /></div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Variable tokens under each message ───────────────────────────────────────

function VarTokens({ msg, onPick }: { msg: GroupMessage; onPick: (n: number) => void }) {
  const nums = varNumbers(msg.text)
  if (nums.length === 0) return <p className="text-[11px] text-gray-400 mt-1">No variables. Click Add variable or type {"{{1}}"}, {"{{2}}"}…</p>
  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
      <span className="text-[11px] text-gray-400">Click to set:</span>
      {nums.map(n => {
        const m = msg.varMappings[n]
        const v = m?.mode === "system" ? findSysVar(m.systemVar) : undefined
        const custom = m?.mode === "custom" && m.customText ? m.customText : null
        const cls = v ? VAR_CATEGORY_COLORS[v.category].chip
          : custom ? "bg-gray-100 text-gray-700 border-gray-300"
          : "bg-blue-50 text-blue-600 border-blue-300 font-mono"
        return (
          <button key={n} onClick={() => onPick(n)}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold hover:opacity-75 ${cls}`}>
            <span className="font-mono">{`{{${n}}}`}</span>
            {v && <span>· {v.category} {v.label}</span>}
            {custom && <span>· “{custom}”</span>}
            {!v && !custom && <span className="font-sans font-normal">· not set</span>}
            <Pencil className="w-2.5 h-2.5 opacity-60" />
          </button>
        )
      })}
    </div>
  )
}

// ─── Editor ───────────────────────────────────────────────────────────────────

function TriggerEditor({ trigger, onSave, onCancel }: {
  trigger: GroupMessageTrigger
  onSave: (t: GroupMessageTrigger) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState<GroupMessageTrigger>(trigger)
  const [picking, setPicking] = useState<{ msg: number; n: number } | null>(null)
  const boxes = useRef<(HTMLTextAreaElement | null)[]>([])

  function patchMessage(i: number, patch: Partial<GroupMessage>) {
    setDraft(d => ({ ...d, messages: d.messages.map((m, j) => (j === i ? { ...m, ...patch } : m)) }))
  }

  // Inserts the next {{n}} at the cursor and opens Replace Variable for it.
  function addVariable(i: number) {
    const el = boxes.current[i]
    const text = draft.messages[i].text
    const n = Math.max(0, ...varNumbers(text)) + 1
    const token = `{{${n}}}`
    const start = el?.selectionStart ?? text.length
    const end = el?.selectionEnd ?? text.length
    patchMessage(i, { text: text.slice(0, start) + token + text.slice(end) })
    setPicking({ msg: i, n })
  }

  const errors = draft.messages.flatMap((m, i) => {
    const label = draft.messages.length > 1 ? `Message ${i + 1}` : "Message"
    const out: string[] = []
    if (!m.text.trim()) out.push(`${label} is empty`)
    if (m.text.length > WA_TEXT_LIMIT) out.push(`${label} is over ${WA_TEXT_LIMIT} characters`)
    const unset = varNumbers(m.text).filter(n => sampleFor(m.varMappings[n]) === null)
    if (unset.length) out.push(`${label}: set ${unset.map(n => `{{${n}}}`).join(", ")} to a system variable or custom text`)
    return out
  })

  return (
    <div className="border-t border-gray-100 px-4 py-4 grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="space-y-4">
        <p className="text-[11px] text-gray-500">
          Add variables as {"{{1}}"}, {"{{2}}"}… then click each one to set a system variable or custom text.
          Mention with {MENTIONS[trigger.id].join(" or ")}.
          {trigger.id === "mentee_joined" && " Volunteer variables are not available: the mentee can join before a mentor is matched."}
        </p>

        {draft.messages.map((m, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {draft.messages.length > 1 ? `Message ${i + 1}` : "Message"}
              </label>
              <div className="flex items-center gap-3">
                <button onClick={() => addVariable(i)}
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
                  <Plus className="w-3 h-3" />Add variable
                </button>
                <span className={`text-[11px] ${m.text.length > WA_TEXT_LIMIT ? "text-red-600" : "text-gray-400"}`}>{m.text.length} / {WA_TEXT_LIMIT}</span>
              </div>
            </div>
            <textarea
              ref={el => { boxes.current[i] = el }}
              value={m.text}
              onChange={e => patchMessage(i, { text: e.target.value })}
              rows={9}
              className="w-full text-sm font-mono border border-gray-200 focus:border-blue-400 rounded-lg px-3 py-2 outline-none resize-y"
            />
            <VarTokens msg={m} onPick={n => setPicking({ msg: i, n })} />
          </div>
        ))}
        <p className="text-[11px] text-gray-400">Formatting: *bold*, _italic_, ~strike~, `code`, "- " bullets, "1. " numbered lists.</p>

        {draft.messages.length > 1 && (
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Send message 2</label>
            <select value={draft.delaySeconds} onChange={e => setDraft(d => ({ ...d, delaySeconds: Number(e.target.value) }))}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white">
              {DELAY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        )}

        <label className="flex items-center gap-3 cursor-pointer">
          <span onClick={() => setDraft(d => ({ ...d, respectSleepHours: !d.respectSleepHours }))}
            className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${draft.respectSleepHours ? "bg-indigo-600" : "bg-gray-200"}`}>
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${draft.respectSleepHours ? "translate-x-4" : "translate-x-0.5"}`} />
          </span>
          <span>
            <span className="block text-sm font-medium text-gray-800">Respect sleep hours (10:00 PM – 8:00 AM)</span>
            <span className="block text-xs text-gray-400">If the join happens during sleep hours, the message is held and sent at 8:00 AM</span>
          </span>
        </label>

        {errors.length > 0 && (
          <ul className="text-xs text-red-600 space-y-0.5">{errors.map(e => <li key={e}>{e}</li>)}</ul>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
          <Button size="sm" disabled={errors.length > 0} onClick={() => onSave(draft)}>Save Changes</Button>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Preview with sample data</p>
        <GroupPreview trigger={draft} />
      </div>

      {picking && (
        <ReplaceVarPopup
          varIndex={picking.n}
          current={draft.messages[picking.msg].varMappings[picking.n]}
          allowedCategories={ALLOWED[trigger.id]}
          onReplace={vm => patchMessage(picking.msg, { varMappings: { ...draft.messages[picking.msg].varMappings, [picking.n]: vm } })}
          onClose={() => setPicking(null)}
        />
      )}
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function TriggerCard({ trigger, editing, onEdit, onToggle, onSave, onCancel }: {
  trigger: GroupMessageTrigger
  editing: boolean
  onEdit: () => void
  onToggle: () => void
  onSave: (t: GroupMessageTrigger) => void
  onCancel: () => void
}) {
  const active = trigger.status === "Active"
  return (
    <div className={`bg-white border rounded-xl ${active ? "border-gray-200" : "border-gray-100 opacity-70"}`}>
      <div className="flex items-start gap-3 px-4 py-3">
        <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${active ? "bg-green-400" : "bg-gray-300"}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-gray-900">{trigger.name}</span>
            <Lock className="w-3 h-3 text-gray-300" />
            <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded font-medium">
              {trigger.messages.length} message{trigger.messages.length > 1 ? "s" : ""}
            </span>
            {trigger.messages.length > 1 && (
              <span className="text-[11px] text-gray-400">· message 2 {delayLabel(trigger.delaySeconds).toLowerCase()}</span>
            )}
            {trigger.respectSleepHours && (
              <span className="flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-200 px-1.5 py-0.5 rounded font-medium">
                <Moon className="w-2.5 h-2.5" />Sleep hours
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">When: {trigger.event}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 mt-2 text-xs">
            <div>
              <span className="text-gray-400">Sent: </span>
              <span className="text-gray-600">{trigger.sendsWhen.join("; ")}</span>
            </div>
            <div>
              <span className="text-gray-400">Not sent: </span>
              <span className="text-gray-600">{trigger.notSentWhen.join("; ")}</span>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">Sent {trigger.sentCount} times · skipped {trigger.skippedCount} times (admin takeover)</p>
        </div>
        {!editing && (
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={onToggle}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border transition-colors ${active ? "border-yellow-200 text-yellow-700 hover:bg-yellow-50" : "border-green-200 text-green-700 hover:bg-green-50"}`}>
              {active ? <><Pause className="w-3 h-3" />Pause</> : <><Play className="w-3 h-3" />Resume</>}
            </button>
            <button onClick={onEdit} className="p-1.5 rounded border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-colors">
              <Pencil className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
      {editing && <TriggerEditor trigger={trigger} onSave={onSave} onCancel={onCancel} />}
    </div>
  )
}

// ─── Tab ──────────────────────────────────────────────────────────────────────

export default function WaGroupMessages() {
  const [triggers, setTriggers] = useState<GroupMessageTrigger[]>(DEFAULTS)
  const [editing, setEditing] = useState<GroupTriggerId | null>(null)

  const update = (t: GroupMessageTrigger) => {
    setTriggers(p => p.map(x => (x.id === t.id ? t : x)))
    setEditing(null)
  }
  const toggle = (id: GroupTriggerId) =>
    setTriggers(p => p.map(t => (t.id === id ? { ...t, status: t.status === "Active" ? "Paused" : "Active" } : t)))

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2"><Users className="w-4 h-4 text-teal-600" />WA Group Messages</h2>
        <p className="text-sm text-gray-500">Messages {AI_NUMBER_NAME} posts in the mentee's WhatsApp group when someone joins.</p>
      </div>
      <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-600">
        <Info className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
        <p>
          Sent as free text through Whapi, so edits apply right away with no template approval. The trigger condition is fixed;
          message text, variables, the gap before message 2, sleep hours and on/off can be changed. Every send or skip is recorded in the group's Event Log.
        </p>
      </div>
      {triggers.map(t => (
        <TriggerCard key={t.id} trigger={t}
          editing={editing === t.id}
          onEdit={() => setEditing(t.id)}
          onToggle={() => toggle(t.id)}
          onSave={update}
          onCancel={() => setEditing(null)}
        />
      ))}
    </div>
  )
}
