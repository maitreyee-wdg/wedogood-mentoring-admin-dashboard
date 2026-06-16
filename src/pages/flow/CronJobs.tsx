import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Zap, Plus, Play, Pause, Pencil, Trash2, X, ChevronDown, ChevronRight, Lock, ClipboardList, Clock, Info } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type TriggerCategory = "Mentee" | "Volunteer"
type TriggerEntity = "mentee" | "volunteer" | "request"
type TriggerType = "status_duration" | "days_remaining" | "days_since" | "time_of_day"
type DurationUnit = "hours" | "days"

interface SystemTrigger {
  id: string
  name: string
  isPredefined: boolean
  category: TriggerCategory
  triggerType: TriggerType
  triggerEntity: TriggerEntity
  triggerStatus?: string
  triggerDuration?: number
  triggerDurationUnit?: DurationUnit
  triggerDaysValue?: number
  triggerTime?: string
  scheduledSendTime?: string
  whatsappTemplate: string
  status: "Active" | "Paused"
  runCount: number
}

interface TriggerLog {
  id: string
  triggerId: string
  triggerName: string
  firedAt: string
  template: string
  recipients: string[]
  sentCount: number
  deliveredCount: number
  readCount: number
}

// ─── Status options per entity ────────────────────────────────────────────────

const STATUS_OPTIONS: Record<TriggerEntity, string[]> = {
  mentee: ["Profile unfinished", "Request chat unfinished", "Active", "Completed", "Inactive"],
  volunteer: ["Profile unfinished", "Orientation pending", "Active", "Inactive", "Onboarding"],
  request: ["Mentor matched", "Number accessed", "Scheduled", "Confirmed", "Completed", "Cancelled"],
}

// ─── Templates by category ────────────────────────────────────────────────────

interface WATemplate {
  name: string
  content: string
}

const TEMPLATES_BY_CATEGORY: Record<TriggerCategory, WATemplate[]> = {
  Mentee: [
    { name: "Complete Profile", content: "Hi {name}! 👋 Your WeDoGood profile is almost ready. Adding your goals and background helps us find the right mentor for you. Can you take 2 minutes to finish it? 🙏" },
    { name: "Mentor Matched — View Details", content: "Hi {name}! Great news — we've found a mentor for you! 🎉 Log in to see their profile and confirm the match: [webapp link]. Let us know if you have any questions." },
    { name: "Confirm If Call Happened", content: "Hi {name}! Just checking — did your call with your mentor happen as planned? Please reply *Yes* or *No* so we can update your engagement log. 📞" },
    { name: "Days Remaining Reminder", content: "Hi {name}! Your mentoring engagement has just {days} days left. Make the most of it — schedule your next session soon! 🗓️" },
    { name: "Re-engagement Nudge", content: "Hi {name}! We noticed it's been a while since your last interaction. Your mentor is still here for you — would you like to reconnect? 💬" },
    { name: "Request Chat Nudge", content: "Hi {name}! Your request is almost complete. Just a few more details to help us find the best mentor match for you. Can you finish it? 🙏" },
  ],
  Volunteer: [
    { name: "Complete Profile", content: "Hi {name}! 👋 Your WeDoGood volunteer profile is almost complete. A full profile helps us match you with the right mentee. Can you finish it? 🙏" },
    { name: "Mentee Matched — View Details", content: "Hi {name}! We've matched you with a mentee who needs your expertise. 🎉 View their profile here: [webapp link]. Please confirm within 24 hours." },
    { name: "Request Confirmation Reminder", content: "Hi {name}! Just a heads-up — you have less than 1 hour to confirm your upcoming engagement. Please confirm ASAP so we can notify the mentee. ⏰" },
    { name: "Mentoring Session Feedback", content: "Hi {name}! How did your recent session with your mentee go? We'd love to hear your thoughts — any wins, challenges, or next steps? 💬" },
    { name: "Complete Orientation", content: "Hi {name}! Your orientation session is still pending. It's a quick 30-minute call to get you started. Would you like to pick a slot? Reply with a preferred date and time. 😊" },
    { name: "Orientation Slot Reminder", content: "Hi {name}! A friendly reminder — your orientation is scheduled for *today*. We're looking forward to speaking with you! 🌟" },
    { name: "Recommend a Friend", content: "Hi {name}! We're always looking for skilled mentors to support youth from NGO partners. If you know someone who'd be great, please share: [wedogood.org/volunteer] 🙏" },
  ],
}

// ─── Mock log data ────────────────────────────────────────────────────────────

const MOCK_LOGS: TriggerLog[] = [
  { id: "L1", triggerId: "PT-M3", triggerName: "Mentor Matched — Notify Mentee", firedAt: "2026-06-04 11:02 AM", template: "Mentor Matched — View Details", recipients: ["Priya Sharma", "Rohan Das"], sentCount: 2, deliveredCount: 2, readCount: 2 },
  { id: "L2", triggerId: "PT-M1", triggerName: "Mentee Profile Nudge", firedAt: "2026-06-04 09:00 AM", template: "Complete Profile", recipients: ["Kavya Nair", "Meena Iyer"], sentCount: 2, deliveredCount: 2, readCount: 1 },
  { id: "L3", triggerId: "PT-V2", triggerName: "Volunteer Matched — Notify Volunteer", firedAt: "2026-06-04 11:02 AM", template: "Mentee Matched — View Details", recipients: ["Rahul Mehta", "Sneha Rao"], sentCount: 2, deliveredCount: 2, readCount: 2 },
  { id: "L4", triggerId: "PT-V4", triggerName: "Orientation Pending Reminder", firedAt: "2026-06-03 09:00 AM", template: "Complete Orientation", recipients: ["Amit Joshi"], sentCount: 1, deliveredCount: 1, readCount: 1 },
  { id: "L5", triggerId: "PT-M4", triggerName: "Confirm Call Happened", firedAt: "2026-06-03 02:15 PM", template: "Confirm If Call Happened", recipients: ["Arjun Patel", "Priya Sharma"], sentCount: 2, deliveredCount: 2, readCount: 1 },
  { id: "L6", triggerId: "PT-V5", triggerName: "Orientation Slot Today", firedAt: "2026-06-03 09:00 AM", template: "Orientation Slot Reminder", recipients: ["Divya Krishnan"], sentCount: 1, deliveredCount: 1, readCount: 1 },
  { id: "L7", triggerId: "PT-M2", triggerName: "Request Chat Nudge", firedAt: "2026-06-02 09:00 AM", template: "Request Chat Nudge", recipients: ["Meena Iyer", "Kavya Nair"], sentCount: 2, deliveredCount: 1, readCount: 0 },
  { id: "L8", triggerId: "PT-V1", triggerName: "Volunteer Profile Nudge", firedAt: "2026-06-01 09:00 AM", template: "Complete Profile", recipients: ["Kiran Bhat", "Pooja Verma"], sentCount: 2, deliveredCount: 2, readCount: 2 },
]

// ─── Predefined triggers ──────────────────────────────────────────────────────

const PREDEFINED: SystemTrigger[] = [
  { id: "PT-M1", name: "Mentee Profile Nudge", isPredefined: true, category: "Mentee", triggerType: "status_duration", triggerEntity: "mentee", triggerStatus: "Profile unfinished", triggerDuration: 4, triggerDurationUnit: "hours", whatsappTemplate: "Complete Profile", status: "Active", runCount: 34 },
  { id: "PT-M2", name: "Request Chat Nudge", isPredefined: true, category: "Mentee", triggerType: "status_duration", triggerEntity: "mentee", triggerStatus: "Request chat unfinished", triggerDuration: 4, triggerDurationUnit: "hours", whatsappTemplate: "Request Chat Nudge", status: "Active", runCount: 21 },
  { id: "PT-M3", name: "Mentor Matched — Notify Mentee", isPredefined: true, category: "Mentee", triggerType: "status_duration", triggerEntity: "request", triggerStatus: "Mentor matched", triggerDuration: 0, triggerDurationUnit: "hours", whatsappTemplate: "Mentor Matched — View Details", status: "Active", runCount: 58 },
  { id: "PT-M4", name: "Confirm Call Happened", isPredefined: true, category: "Mentee", triggerType: "status_duration", triggerEntity: "request", triggerStatus: "Number accessed", triggerDuration: 1, triggerDurationUnit: "hours", whatsappTemplate: "Confirm If Call Happened", status: "Active", runCount: 47 },
  { id: "PT-M5", name: "Days Left Reminder", isPredefined: true, category: "Mentee", triggerType: "days_remaining", triggerEntity: "mentee", triggerDaysValue: 4, whatsappTemplate: "Days Remaining Reminder", status: "Active", runCount: 12 },
  { id: "PT-M6", name: "Re-engagement Nudge", isPredefined: true, category: "Mentee", triggerType: "days_since", triggerEntity: "mentee", triggerDaysValue: 30, whatsappTemplate: "Re-engagement Nudge", status: "Active", runCount: 9 },
  { id: "PT-V1", name: "Volunteer Profile Nudge", isPredefined: true, category: "Volunteer", triggerType: "status_duration", triggerEntity: "volunteer", triggerStatus: "Profile unfinished", triggerDuration: 4, triggerDurationUnit: "hours", whatsappTemplate: "Complete Profile", status: "Active", runCount: 18 },
  { id: "PT-V2", name: "Volunteer Matched — Notify Volunteer", isPredefined: true, category: "Volunteer", triggerType: "status_duration", triggerEntity: "request", triggerStatus: "Mentor matched", triggerDuration: 0, triggerDurationUnit: "hours", whatsappTemplate: "Mentee Matched — View Details", status: "Active", runCount: 58 },
  { id: "PT-V3", name: "Confirmation Deadline Reminder", isPredefined: true, category: "Volunteer", triggerType: "status_duration", triggerEntity: "request", triggerStatus: "Scheduled", triggerDuration: 1, triggerDurationUnit: "hours", whatsappTemplate: "Request Confirmation Reminder", status: "Active", runCount: 26 },
  { id: "PT-V4", name: "Orientation Pending Reminder", isPredefined: true, category: "Volunteer", triggerType: "status_duration", triggerEntity: "volunteer", triggerStatus: "Orientation pending", triggerDuration: 4, triggerDurationUnit: "hours", whatsappTemplate: "Complete Orientation", status: "Active", runCount: 31 },
  { id: "PT-V5", name: "Orientation Slot Today", isPredefined: true, category: "Volunteer", triggerType: "time_of_day", triggerEntity: "volunteer", triggerTime: "09:00", whatsappTemplate: "Orientation Slot Reminder", status: "Active", runCount: 14 },
]

// ─── Sentence builder helpers ─────────────────────────────────────────────────

function conditionSentence(t: SystemTrigger): string {
  if (t.triggerType === "status_duration") {
    const dur = t.triggerDuration === 0
      ? "immediately"
      : `for ${t.triggerDuration} ${t.triggerDurationUnit}`
    return `Status of ${t.triggerEntity} remains "${t.triggerStatus}" ${dur}`
  }
  if (t.triggerType === "days_remaining") return `Days left in mentoring request = ${t.triggerDaysValue}`
  if (t.triggerType === "days_since") return `Days since last request created > ${t.triggerDaysValue}`
  if (t.triggerType === "time_of_day") return `Orientation slot is today — fires at ${t.triggerTime}`
  return ""
}

// ─── Template preview bubble ──────────────────────────────────────────────────

function TemplatePreview({ category, name }: { category: TriggerCategory; name: string }) {
  const tpl = TEMPLATES_BY_CATEGORY[category].find((t) => t.name === name)
  if (!tpl) return null
  return (
    <div className="mt-2 bg-gray-50 rounded-xl p-3 flex justify-end">
      <div className="max-w-xs bg-[#005c4b] text-white rounded-2xl rounded-br-sm px-3 py-2 shadow-sm">
        <p className="text-xs leading-relaxed">{tpl.content}</p>
        <p className="text-[10px] text-green-200 mt-1 text-right">12:00 PM ✓✓</p>
      </div>
    </div>
  )
}

// ─── Edit / Add Modal ─────────────────────────────────────────────────────────

function TriggerModal({
  trigger, onSave, onClose,
}: {
  trigger?: SystemTrigger
  onSave: (data: Partial<SystemTrigger>) => void
  onClose: () => void
}) {
  const isPredefined = !!trigger?.isPredefined
  const isNew = !trigger

  const [name, setName] = useState(trigger?.name ?? "")
  const [category, setCategory] = useState<TriggerCategory>(trigger?.category ?? "Mentee")
  const [triggerType, setTriggerType] = useState<TriggerType>(trigger?.triggerType ?? "status_duration")
  const [triggerEntity, setTriggerEntity] = useState<TriggerEntity>(trigger?.triggerEntity ?? "mentee")
  const [triggerStatus, setTriggerStatus] = useState(trigger?.triggerStatus ?? "Profile unfinished")
  const [triggerDuration, setTriggerDuration] = useState(trigger?.triggerDuration ?? 4)
  const [triggerDurationUnit, setTriggerDurationUnit] = useState<DurationUnit>(trigger?.triggerDurationUnit ?? "hours")
  const [triggerDaysValue, setTriggerDaysValue] = useState(trigger?.triggerDaysValue ?? 4)
  const [triggerTime, setTriggerTime] = useState(trigger?.triggerTime ?? "09:00")
  const [scheduledSendEnabled, setScheduledSendEnabled] = useState(!!trigger?.scheduledSendTime)
  const [scheduledSendTime, setScheduledSendTime] = useState(trigger?.scheduledSendTime ?? "09:00")
  const [whatsappTemplate, setWhatsappTemplate] = useState(trigger?.whatsappTemplate ?? TEMPLATES_BY_CATEGORY["Mentee"][0].name)

  const availableTemplates = TEMPLATES_BY_CATEGORY[category]

  // inline select style — underline, blue variable
  const inlineSel = "border-0 border-b-2 border-blue-400 text-blue-700 font-semibold bg-transparent outline-none px-1 py-0 text-sm cursor-pointer"
  const inlineNum = "border-0 border-b-2 border-blue-400 text-blue-700 font-semibold bg-transparent outline-none w-14 text-center text-sm"

  // full sentence builder
  const SentenceBuilder = () => {
    if (isPredefined) {
      // still show as sentence but editable only for duration/time/template
      return (
        <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 leading-8">
          {triggerType === "status_duration" && (
            <>
              When the status of a <span className="font-semibold text-gray-900">{triggerEntity}</span> remains{" "}
              <span className="bg-gray-200 text-gray-800 font-semibold px-1.5 py-0.5 rounded">"{triggerStatus}"</span> for{" "}
              <input type="number" min={0} value={triggerDuration}
                onChange={(e) => setTriggerDuration(Number(e.target.value))}
                className={inlineNum} />{" "}
              <select value={triggerDurationUnit} onChange={(e) => setTriggerDurationUnit(e.target.value as DurationUnit)} className={inlineSel}>
                <option value="hours">hours</option>
                <option value="days">days</option>
              </select>
              {triggerDuration === 0 && <span className="ml-2 text-xs text-blue-500">(fires immediately)</span>}
            </>
          )}
          {triggerType === "days_remaining" && (
            <>
              When days left in mentoring request is{" "}
              <input type="number" min={1} value={triggerDaysValue}
                onChange={(e) => setTriggerDaysValue(Number(e.target.value))}
                className={inlineNum} />
            </>
          )}
          {triggerType === "days_since" && (
            <>
              When last request created date is more than{" "}
              <input type="number" min={1} value={triggerDaysValue}
                onChange={(e) => setTriggerDaysValue(Number(e.target.value))}
                className={inlineNum} /> days ago
            </>
          )}
          {triggerType === "time_of_day" && (
            <>
              When orientation slot is scheduled for today, fire at{" "}
              <input type="time" value={triggerTime}
                onChange={(e) => setTriggerTime(e.target.value)}
                className={inlineSel + " w-28"} />
            </>
          )}
        </div>
      )
    }

    // full editable sentence
    return (
      <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 leading-8">
        {triggerType === "status_duration" && (
          <>
            When the status of a{" "}
            <select value={triggerEntity}
              onChange={(e) => {
                setTriggerEntity(e.target.value as TriggerEntity)
                setTriggerStatus(STATUS_OPTIONS[e.target.value as TriggerEntity][0])
              }}
              className={inlineSel}>
              <option value="mentee">mentee</option>
              <option value="volunteer">volunteer</option>
              <option value="request">request</option>
            </select>{" "}
            remains{" "}
            <select value={triggerStatus} onChange={(e) => setTriggerStatus(e.target.value)} className={inlineSel}>
              {STATUS_OPTIONS[triggerEntity].map((s) => <option key={s}>{s}</option>)}
            </select>{" "}
            for{" "}
            <input type="number" min={0} value={triggerDuration}
              onChange={(e) => setTriggerDuration(Number(e.target.value))}
              className={inlineNum} />{" "}
            <select value={triggerDurationUnit} onChange={(e) => setTriggerDurationUnit(e.target.value as DurationUnit)} className={inlineSel}>
              <option value="hours">hours</option>
              <option value="days">days</option>
            </select>
            {triggerDuration === 0 && <span className="ml-2 text-xs text-blue-500">(fires immediately on status change)</span>}
          </>
        )}
        {triggerType === "days_remaining" && (
          <>
            When days left in the mentoring request equals{" "}
            <input type="number" min={1} value={triggerDaysValue}
              onChange={(e) => setTriggerDaysValue(Number(e.target.value))}
              className={inlineNum} />
          </>
        )}
        {triggerType === "days_since" && (
          <>
            When the last request was created more than{" "}
            <input type="number" min={1} value={triggerDaysValue}
              onChange={(e) => setTriggerDaysValue(Number(e.target.value))}
              className={inlineNum} /> days ago
          </>
        )}
        {triggerType === "time_of_day" && (
          <>
            When the orientation slot is scheduled for today, fire at{" "}
            <input type="time" value={triggerTime}
              onChange={(e) => setTriggerTime(e.target.value)}
              className={inlineSel + " w-28"} />
          </>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-[580px] max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-xl z-10">
          <div className="flex items-center gap-2">
            {isPredefined && <Lock className="w-4 h-4 text-gray-400" />}
            <h2 className="font-semibold text-gray-900">
              {isNew ? "New System Trigger" : isPredefined ? "Edit Trigger" : "Edit Trigger"}
            </h2>
          </div>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {isPredefined && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-xs text-amber-700">
              Predefined trigger — core condition is locked. You can adjust duration, time, and template.
            </div>
          )}

          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Trigger Name</label>
            {isPredefined
              ? <p className="text-sm font-medium text-gray-700">{name}</p>
              : <input className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mentee Check-in Reminder" />
            }
          </div>

          {/* Category + type (new only) */}
          {!isPredefined && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Category</label>
                <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white"
                  value={category} onChange={(e) => {
                    setCategory(e.target.value as TriggerCategory)
                    setWhatsappTemplate(TEMPLATES_BY_CATEGORY[e.target.value as TriggerCategory][0].name)
                  }}>
                  <option>Mentee</option><option>Volunteer</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Trigger Type</label>
                <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white"
                  value={triggerType} onChange={(e) => setTriggerType(e.target.value as TriggerType)}>
                  <option value="status_duration">Status remains for duration</option>
                  <option value="days_remaining">Days remaining in request</option>
                  <option value="days_since">Days since last request</option>
                  <option value="time_of_day">Scheduled time today</option>
                </select>
              </div>
            </div>
          )}

          {/* Sentence condition builder */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Trigger Condition</label>
            <SentenceBuilder />
          </div>

          {/* Scheduled delivery */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
              Message Delivery
            </label>
            <div className={`rounded-xl border p-4 space-y-3 ${scheduledSendEnabled ? "border-blue-200 bg-blue-50/30" : "border-gray-200 bg-white"}`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setScheduledSendEnabled((v) => !v)}
                  className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${scheduledSendEnabled ? "bg-blue-600" : "bg-gray-200"}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${scheduledSendEnabled ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Schedule message at a specific time</p>
                  <p className="text-xs text-gray-400">Otherwise, message is sent immediately when the condition fires</p>
                </div>
              </label>

              {scheduledSendEnabled && (
                <div className="space-y-3 pt-1 border-t border-blue-100">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">Send at</span>
                      <input
                        type="time"
                        value={scheduledSendTime}
                        onChange={(e) => setScheduledSendTime(e.target.value)}
                        className="border border-blue-300 rounded-lg px-2 py-1 text-sm text-blue-700 font-semibold bg-white outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                    <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 leading-relaxed">
                      <span className="font-semibold">Condition re-validated at send time.</span> The trigger condition is checked again just before the message is sent — if it no longer holds (e.g. the mentee has completed their profile), the message is not sent.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action — template */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              Action — send WhatsApp message
            </label>
            <select
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white"
              value={whatsappTemplate}
              onChange={(e) => setWhatsappTemplate(e.target.value)}
            >
              {availableTemplates.map((t) => <option key={t.name}>{t.name}</option>)}
            </select>
            <TemplatePreview category={category} name={whatsappTemplate} />
          </div>
        </div>

        <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={() => onSave({ name, category, triggerType, triggerEntity, triggerStatus, triggerDuration, triggerDurationUnit, triggerDaysValue, triggerTime, scheduledSendTime: scheduledSendEnabled ? scheduledSendTime : undefined, whatsappTemplate })}>
            {isNew ? "Create Trigger" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Compact trigger row ──────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<TriggerCategory, string> = {
  Mentee: "bg-violet-100 text-violet-700",
  Volunteer: "bg-emerald-100 text-emerald-700",
}

function TriggerRow({ trigger, onToggle, onEdit, onDelete }: {
  trigger: SystemTrigger
  onToggle: () => void
  onEdit: () => void
  onDelete?: () => void
}) {
  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 bg-white border rounded-lg transition-colors ${trigger.status === "Active" ? "border-gray-200 hover:border-gray-300" : "border-gray-100 opacity-60"}`}>
      {/* Status dot */}
      <div className={`w-2 h-2 rounded-full shrink-0 ${trigger.status === "Active" ? "bg-green-400" : "bg-gray-300"}`} />

      {/* Name */}
      <div className="flex items-center gap-1.5 w-52 shrink-0">
        <span className="text-sm font-medium text-gray-900 truncate">{trigger.name}</span>
        {trigger.isPredefined && <Lock className="w-3 h-3 text-gray-300 shrink-0" />}
      </div>

      {/* Condition */}
      <span className="flex-1 text-xs text-gray-500 truncate min-w-0">{conditionSentence(trigger)}</span>

      {/* Arrow + Template */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-gray-300 text-sm">→</span>
        <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded font-medium whitespace-nowrap">
          WA: {trigger.whatsappTemplate}
        </span>
        {trigger.scheduledSendTime && (
          <span className="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
            <Clock className="w-2.5 h-2.5" />{trigger.scheduledSendTime}
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1 shrink-0 ml-2">
        <button onClick={onToggle}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border transition-colors ${trigger.status === "Active" ? "border-yellow-200 text-yellow-700 hover:bg-yellow-50" : "border-green-200 text-green-700 hover:bg-green-50"}`}>
          {trigger.status === "Active" ? <><Pause className="w-3 h-3" />Pause</> : <><Play className="w-3 h-3" />Resume</>}
        </button>
        <button onClick={onEdit} className="p-1.5 rounded border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-colors">
          <Pencil className="w-3 h-3" />
        </button>
        {!trigger.isPredefined && onDelete && (
          <button onClick={onDelete} className="p-1.5 rounded border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors">
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Category section ─────────────────────────────────────────────────────────

function CategorySection({ title, triggers, onToggle, onEdit, onDelete }: {
  title: TriggerCategory
  triggers: SystemTrigger[]
  onToggle: (id: string) => void
  onEdit: (t: SystemTrigger) => void
  onDelete: (id: string) => void
}) {
  const [open, setOpen] = useState(true)
  const active = triggers.filter((t) => t.status === "Active").length

  return (
    <div className="mb-3">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 w-full mb-1.5">
        {open ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[title]}`}>{title}</span>
        <span className="text-xs text-gray-400">{active}/{triggers.length} active</span>
      </button>
      {open && (
        <div className="space-y-1.5 pl-5">
          {triggers.map((t) => (
            <TriggerRow key={t.id} trigger={t} onToggle={() => onToggle(t.id)} onEdit={() => onEdit(t)}
              onDelete={t.isPredefined ? undefined : () => onDelete(t.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Log Tab ──────────────────────────────────────────────────────────────────

function LogTab({ logs }: { logs: TriggerLog[] }) {
  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">Trigger Log</h2>
        <p className="text-sm text-gray-500">{logs.length} events recorded</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide">Fired At</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide">Trigger</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide">Template Sent</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide">Recipients</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-500 uppercase tracking-wide">Sent</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-500 uppercase tracking-wide">Delivered</th>
              <th className="text-center px-3 py-3 font-semibold text-gray-500 uppercase tracking-wide">Read</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={log.id} className={`border-b border-gray-100 ${i % 2 === 0 ? "" : "bg-gray-50/40"}`}>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{log.firedAt}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{log.triggerName}</td>
                <td className="px-4 py-3">
                  <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-[11px] font-medium">{log.template}</span>
                </td>
                <td className="px-4 py-3 text-gray-600 max-w-[180px]">
                  <p className="truncate" title={log.recipients.join(", ")}>{log.recipients.join(", ")}</p>
                  <p className="text-gray-400">{log.recipients.length} contact{log.recipients.length !== 1 ? "s" : ""}</p>
                </td>
                <td className="px-3 py-3 text-center font-medium text-gray-700">{log.sentCount}</td>
                <td className="px-3 py-3 text-center text-blue-600 font-medium">{log.deliveredCount}</td>
                <td className="px-3 py-3 text-center text-green-600 font-medium">{log.readCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

type PageTab = "triggers" | "log"

export default function CronJobs() {
  const [triggers, setTriggers] = useState<SystemTrigger[]>(PREDEFINED)
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState<SystemTrigger | null>(null)
  const [pageTab, setPageTab] = useState<PageTab>("triggers")

  const toggle = (id: string) =>
    setTriggers((p) => p.map((t) => t.id === id ? { ...t, status: t.status === "Active" ? "Paused" : "Active" } : t))

  const deleteTrigger = (id: string) => setTriggers((p) => p.filter((t) => t.id !== id))

  const handleSave = (data: Partial<SystemTrigger>) => {
    if (editTarget) {
      setTriggers((p) => p.map((t) => t.id === editTarget.id ? { ...t, ...data } : t))
    } else {
      setTriggers((p) => [...p, {
        id: `CT-${Date.now()}`, name: data.name ?? "New Trigger", isPredefined: false,
        category: data.category ?? "Mentee", triggerType: data.triggerType ?? "status_duration",
        triggerEntity: data.triggerEntity ?? "mentee", triggerStatus: data.triggerStatus,
        triggerDuration: data.triggerDuration, triggerDurationUnit: data.triggerDurationUnit,
        triggerDaysValue: data.triggerDaysValue, triggerTime: data.triggerTime,
        whatsappTemplate: data.whatsappTemplate ?? "", status: "Active", runCount: 0,
      }])
    }
    setShowModal(false)
    setEditTarget(null)
  }

  const activeCount = triggers.filter((t) => t.status === "Active").length
  const categories: TriggerCategory[] = ["Mentee", "Volunteer"]

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-0 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">System Triggers</h1>
              <p className="text-sm text-gray-500">{activeCount} of {triggers.length} active</p>
            </div>
          </div>
          {pageTab === "triggers" && (
            <Button size="sm" onClick={() => { setEditTarget(null); setShowModal(true) }}>
              <Plus className="w-4 h-4" /> Add Trigger
            </Button>
          )}
        </div>

        {/* Stats row */}
        <div className="flex gap-4 mb-4">
          {[
            { label: "Active", value: activeCount, color: "text-green-600" },
            { label: "Paused", value: triggers.filter((t) => t.status === "Paused").length, color: "text-yellow-600" },
            { label: "Predefined", value: triggers.filter((t) => t.isPredefined).length, color: "text-gray-500" },
            { label: "Custom", value: triggers.filter((t) => !t.isPredefined).length, color: "text-blue-600" },
            { label: "Log entries", value: MOCK_LOGS.length, color: "text-violet-600" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
              <span className="text-xs text-gray-400">{s.label}</span>
              <span className="text-gray-200">·</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          <button onClick={() => setPageTab("triggers")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${pageTab === "triggers" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            <Zap className="w-3.5 h-3.5" /> Triggers
          </button>
          <button onClick={() => setPageTab("log")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${pageTab === "log" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            <ClipboardList className="w-3.5 h-3.5" /> Log
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {pageTab === "triggers" ? (
          <div className="p-6">
            {categories.map((cat) => (
              <CategorySection key={cat} title={cat}
                triggers={triggers.filter((t) => t.category === cat)}
                onToggle={toggle}
                onEdit={(t) => { setEditTarget(t); setShowModal(true) }}
                onDelete={deleteTrigger}
              />
            ))}
          </div>
        ) : (
          <LogTab logs={MOCK_LOGS} />
        )}
      </div>

      {showModal && (
        <TriggerModal
          trigger={editTarget ?? undefined}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditTarget(null) }}
        />
      )}
    </div>
  )
}
