import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Zap, Plus, Play, Pause, Pencil, Trash2, X, ChevronDown, ChevronRight, Lock, ClipboardList, Clock, Info } from "lucide-react"
import {
  defaultMappings, WaTemplateEditor,
  type VarCategory, type VarMapping,
} from "@/components/WaVariableMapper"

// ─── Types ────────────────────────────────────────────────────────────────────

type TriggerCategory = "Mentee" | "Volunteer" | "Engagement"
type TemplateCategory = "Mentee" | "Volunteer"
type TriggerEntity = "mentee" | "volunteer" | "request"
type TriggerType = "status_duration" | "days_remaining" | "days_since" | "time_of_day" | "orientation_status"
type DurationUnit = "hours" | "days"
type Recipient = "mentee" | "volunteer"
type OffsetDirection = "before" | "after"

interface SystemTrigger {
  id: string
  name: string
  isPredefined: boolean
  category: TriggerCategory
  recipient?: Recipient
  triggerType: TriggerType
  triggerEntity: TriggerEntity
  triggerStatus?: string
  triggerDuration?: number
  triggerDurationUnit?: DurationUnit
  triggerDaysValue?: number
  triggerTime?: string
  triggerOrientationStatus?: string
  offsetDirection?: OffsetDirection
  scheduledSendTime?: string
  whatsappTemplate: string
  varMappings?: Record<number, VarMapping>
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

// ─── System variables by level ────────────────────────────────────────────────

// ─── Status options per entity ────────────────────────────────────────────────

const STATUS_OPTIONS: Record<TriggerEntity, string[]> = {
  mentee:    ["Sign-up completed", "Engagement chat abandoned", "Engagement created", "Engagement completed", "Engagement expired"],
  volunteer: ["Profile incomplete", "Orientation pending", "Active", "Occupied", "Inactive", "Archived"],
  request:   ["Draft", "New", "Match Approval Pending", "Mentor response pending", "No Match Found", "Matched", "Accessed Contact", "Call done - Feedback Pending", "Closed - Feedback Pending", "Expired"],
}

// ─── Orientation status options (Volunteer — mirrors OrientationStatus in volunteersData.ts) ──

const ORIENTATION_STATUS_OPTIONS = ["Orientation Pending", "Orientation Slot Booked", "Orientation Done", "Orientation Rescheduled"]

// Statuses that carry an associated orientation date + time (vs. Pending, which doesn't)
const DATE_LINKED_ORIENTATION_STATUSES = new Set(["Orientation Slot Booked", "Orientation Done", "Orientation Rescheduled"])

// ─── Trigger types by category ────────────────────────────────────────────────

const TRIGGER_TYPES_BY_CATEGORY: Record<TriggerCategory, { value: TriggerType; label: string }[]> = {
  Mentee:     [{ value: "status_duration", label: "Status remains for duration" }, { value: "days_since", label: "Days since last request" }],
  Volunteer:  [{ value: "status_duration", label: "Status remains for duration" }, { value: "time_of_day", label: "Scheduled time today" }, { value: "orientation_status", label: "Orientation status" }],
  Engagement: [{ value: "status_duration", label: "Status remains for duration" }, { value: "days_remaining", label: "Days remaining in request" }],
}

// ─── Templates ────────────────────────────────────────────────────────────────

interface WATemplate {
  name: string
  content: string
  vars: string[]   // suggested system variable keys, index = {{n}}-1
}

const TEMPLATES_BY_CATEGORY: Record<TemplateCategory, WATemplate[]> = {
  Mentee: [
    {
      name: "Complete Profile",
      vars: ["mentee_first_name", "app_link"],
      content: "Hi {{1}}! 👋 It's Mira from ThinkWith!\n\nYou're so close — your profile is all set and we have mentors who can be the perfect fit for your goals. All that's left is creating your first mentorship request. 🌟\n\nReady? Let's get you started 👇 🔗 {{2}}",
    },
    {
      name: "Mentor Matched — View Details",
      vars: ["mentee_first_name", "volunteer_first_name", "engagement_goal", "days_valid", "volunteer_profile_link"],
      content: "Hi {{1}}! 🎉 I'm Mira, your ThinkWith guide — and I've got great news!\n\nI believe {{2}} would be a perfect fit for helping with {{3}}. Your request is valid for {{4}} days — reach out and get your mentorship journey started!\n\n👉 View their profile here: {{5}}",
    },
    {
      name: "Confirm If Call Happened",
      vars: ["mentee_first_name", "volunteer_first_name"],
      content: "Hi {{1}}! 👋 Just checking — did your call with {{2}} happen as planned? Please reply *Yes* or *No* so we can update your engagement. 📞",
    },
    {
      name: "Days Remaining Reminder",
      vars: ["mentee_first_name", "volunteer_first_name", "days_remaining", "mark_complete_link"],
      content: "Hi {{1}}! 👋 Just a reminder from Mira — you have {{3}} days left to connect with {{2}}.\n\nHaven't reached out yet? Now's a good time — don't let this opportunity pass! 🙌\n\nAlready had your session? Let me know 👇\n🔗 {{4}}",
    },
    {
      name: "Re-engagement Nudge",
      vars: ["mentee_first_name", "engagement_goal", "app_link"],
      content: "Hi {{1}}! It's Mira from ThinkWith 👋 It's been a while.\n\nHow are things going on {{2}}?\n\nReady to connect with your next mentor? I'll find you the right match. Your growth journey doesn't have to stop here. 💪\n🔗 {{3}}",
    },
    {
      name: "Request Chat Nudge",
      vars: ["mentee_first_name", "app_link"],
      content: "Hi {{1}}! It looks like you were in the middle of telling Mira what you're looking for in a mentor. Pick up where you left off — it only takes a few minutes 👉 {{2}}",
    },
    {
      name: "Stale Request Nudge",
      vars: ["mentee_first_name", "engagement_goal"],
      content: "Hi {{1}}! 👋 Just a quick update — I'm still working on finding the right mentor for you for helping with {{2}}.\n\nGood things take a little time! I'll reach out as soon as I have a match. Thanks for your patience!",
    },
    {
      name: "Session Expiry Notice",
      vars: ["mentee_first_name", "volunteer_first_name", "app_link"],
      content: "Hi {{1}}! Your mentorship request with {{2}} has closed.\n\nHave you already connected? Let me know how it went — I'd love to hear! 😊\n\nIf you haven't yet and would like to reconnect, just head back to ThinkWith anytime. 💪\n🔗 {{3}}",
    },
    {
      name: "Feedback Reminder",
      vars: ["mentee_first_name", "volunteer_first_name", "feedback_link"],
      content: "Hi {{1}}! It's Mira from ThinkWith 😊 How did your session with {{2}} go?\n\nI'd love to hear your feedback. It helps me make better matches for everyone. Tap here to share your thoughts 👇\n🔗 {{3}}",
    },
  ],
  Volunteer: [
    {
      name: "Complete Profile",
      vars: ["volunteer_first_name", "volunteer_profile_link"],
      content: "Hi {{1}}! 👋 Your WeDoGood volunteer profile is almost complete. A full profile helps us match you with the right mentee. Can you finish it? 🙏\n🔗 {{2}}",
    },
    {
      name: "New Engagement Request",
      vars: ["volunteer_first_name", "mentee_first_name", "engagement_goal", "response_window_hours", "request_deep_link"],
      content: "Hi {{1}}! 🙌 You have a new mentorship request waiting on WeDoGood.\n\nWe think you'd be a great fit for {{2}} — they're looking for help with {{3}}. Open the app to review their full profile and accept the engagement 👇\n\nPlease respond within {{4}} hours so we can keep their mentorship journey on track.\n🔗 {{5}}",
    },
    {
      name: "Engagement Request Reminder",
      vars: ["volunteer_first_name", "mentee_first_name", "engagement_goal", "hours_remaining", "request_deep_link"],
      content: "Hi {{1}}! 👋 Just a gentle nudge — {{2}} is still waiting for a mentor.\n\nThey're looking for help with {{3}} and we think you'd be a great match. You have {{4}} hours left to respond before the request expires!\n🔗 {{5}}",
    },
    {
      name: "Mentee Matched — View Details",
      vars: ["volunteer_first_name", "mentee_first_name", "mentee_profile_link"],
      content: "Hi {{1}}! 🌟 You've accepted {{2}}'s mentoring request. They're looking forward to connecting with you!\n\nView their profile and contact them here 👇\n🔗 {{3}}",
    },
    {
      name: "Request Confirmation Reminder",
      vars: ["volunteer_first_name", "mentee_first_name", "hours_remaining", "request_deep_link"],
      content: "Hi {{1}}! ⏰ Reminder — your response window for {{2}}'s mentoring request closes soon. You have {{3}} hours left to respond.\n🔗 {{4}}",
    },
    {
      name: "Complete Orientation",
      vars: ["volunteer_first_name", "onboarding_booking_link"],
      content: "Hi {{1}}! Your orientation session is still pending. It's a quick 30-minute call to get you started — book your slot here 👇\n🔗 {{2}}",
    },
    {
      name: "Onboarding Slot Confirmed",
      vars: ["volunteer_first_name", "onboarding_date", "onboarding_time"],
      content: "Hi {{1}}! 🎉 Your WeDoGood onboarding call is confirmed for {{2}} at {{3}}.\n\nWe'll walk you through everything you need to know to get started as a mentor. See you then! 🙌",
    },
    {
      name: "Orientation Slot Reminder",
      vars: ["volunteer_first_name", "onboarding_call_join_link"],
      content: "Hi {{1}}! ⏰ Your WeDoGood onboarding call is in 1 hour — just a heads up so you're ready!\n\nJoin the call here 👇\n🔗 {{2}}\n\nSee you soon! 😊",
    },
    {
      name: "Mid-Engagement Check-in",
      vars: ["volunteer_first_name", "mentee_first_name", "days_remaining", "app_link"],
      content: "Hi {{1}}! 👋 Just checking in from WeDoGood — how's it going with {{2}}?\n\n{{3}} days are remaining for this mentorship window to close. Let us know if you have connected with them 👇\n🔗 {{4}}",
    },
    {
      name: "Session Expiry Notice",
      vars: ["volunteer_first_name", "mentee_first_name", "active_requests_link"],
      content: "Hi {{1}}! Your mentorship window with {{2}} has now been closed.\n\nDid you connect with them? Provide your feedback here: {{3}}\n\nThank you for the time you put in — you're making a real difference. 💚",
    },
    {
      name: "Feedback Reminder",
      vars: ["volunteer_first_name", "mentee_first_name", "feedback_link"],
      content: "Hi {{1}}! It's Mira from ThinkWith 😊 How did your session with {{2}} go?\n\nI'd love to hear your feedback. It helps us make better matches. Tap here 👇\n🔗 {{3}}",
    },
  ],
}

// ─── Mock log data ────────────────────────────────────────────────────────────

const MOCK_LOGS: TriggerLog[] = [
  { id: "L1", triggerId: "PT-E1", triggerName: "Mentor Matched — Notify Mentee",  firedAt: "2026-06-04 11:02 AM", template: "Mentor Matched — View Details",  recipients: ["Priya Sharma", "Rohan Das"],    sentCount: 2, deliveredCount: 2, readCount: 2 },
  { id: "L2", triggerId: "PT-M1", triggerName: "Mentee Profile Nudge",            firedAt: "2026-06-04 09:00 AM", template: "Complete Profile",               recipients: ["Kavya Nair", "Meena Iyer"],     sentCount: 2, deliveredCount: 2, readCount: 1 },
  { id: "L3", triggerId: "PT-E2", triggerName: "Mentor Matched — Notify Mentor",  firedAt: "2026-06-04 11:02 AM", template: "Mentee Matched — View Details",  recipients: ["Rahul Mehta", "Sneha Rao"],     sentCount: 2, deliveredCount: 2, readCount: 2 },
  { id: "L4", triggerId: "PT-V4", triggerName: "Orientation Pending Reminder",    firedAt: "2026-06-03 09:00 AM", template: "Complete Orientation",            recipients: ["Amit Joshi"],                  sentCount: 1, deliveredCount: 1, readCount: 1 },
  { id: "L5", triggerId: "PT-E3", triggerName: "Confirm Call Happened",           firedAt: "2026-06-03 02:15 PM", template: "Confirm If Call Happened",        recipients: ["Arjun Patel", "Priya Sharma"], sentCount: 2, deliveredCount: 2, readCount: 1 },
  { id: "L6", triggerId: "PT-V5", triggerName: "Orientation Slot Today",          firedAt: "2026-06-03 09:00 AM", template: "Orientation Slot Reminder",       recipients: ["Divya Krishnan"],              sentCount: 1, deliveredCount: 1, readCount: 1 },
  { id: "L7", triggerId: "PT-M2", triggerName: "Request Chat Nudge",             firedAt: "2026-06-02 09:00 AM", template: "Request Chat Nudge",              recipients: ["Meena Iyer", "Kavya Nair"],    sentCount: 2, deliveredCount: 1, readCount: 0 },
  { id: "L8", triggerId: "PT-V1", triggerName: "Volunteer Profile Nudge",           firedAt: "2026-06-01 09:00 AM", template: "Complete Profile",                recipients: ["Kiran Bhat", "Pooja Verma"],   sentCount: 2, deliveredCount: 2, readCount: 2 },
]

// ─── Predefined triggers ──────────────────────────────────────────────────────

const PREDEFINED: SystemTrigger[] = [
  { id: "PT-M1", name: "Mentee Profile Nudge", isPredefined: true, category: "Mentee", triggerType: "status_duration", triggerEntity: "mentee", triggerStatus: "Sign-up completed",         triggerDuration: 4, triggerDurationUnit: "hours", whatsappTemplate: "Complete Profile",            status: "Active", runCount: 34 },
  { id: "PT-M2", name: "Request Chat Nudge",   isPredefined: true, category: "Mentee", triggerType: "status_duration", triggerEntity: "mentee", triggerStatus: "Engagement chat abandoned", triggerDuration: 4, triggerDurationUnit: "hours", whatsappTemplate: "Request Chat Nudge",          status: "Active", runCount: 21 },
  { id: "PT-M3", name: "Re-engagement Nudge",  isPredefined: true, category: "Mentee", triggerType: "days_since",      triggerEntity: "mentee", triggerDaysValue: 30,                                                                         whatsappTemplate: "Re-engagement Nudge",         status: "Active", runCount: 9  },

  { id: "PT-V1", name: "Volunteer Profile Nudge",      isPredefined: true, category: "Volunteer", triggerType: "status_duration", triggerEntity: "volunteer", triggerStatus: "Profile incomplete",  triggerDuration: 4, triggerDurationUnit: "hours", whatsappTemplate: "Complete Profile",         status: "Active", runCount: 18 },
  { id: "PT-V4", name: "Orientation Pending Reminder", isPredefined: true, category: "Volunteer", triggerType: "status_duration", triggerEntity: "volunteer", triggerStatus: "Orientation pending", triggerDuration: 4, triggerDurationUnit: "hours", whatsappTemplate: "Complete Orientation",     status: "Active", runCount: 31 },
  { id: "PT-V5", name: "Orientation Slot Today",       isPredefined: true, category: "Volunteer", triggerType: "time_of_day",     triggerEntity: "volunteer", triggerTime: "09:00",                                                               whatsappTemplate: "Orientation Slot Reminder", status: "Active", runCount: 14 },
  { id: "CT-V1", name: "Orientation Slot Booked Reminder", isPredefined: false, category: "Volunteer", triggerType: "orientation_status", triggerEntity: "volunteer", triggerOrientationStatus: "Orientation Slot Booked", triggerDuration: 1, triggerDurationUnit: "days", offsetDirection: "before", whatsappTemplate: "Orientation Slot Reminder", status: "Active", runCount: 0 },

  { id: "PT-E1", name: "Mentor Matched — Notify Mentee",    isPredefined: true, category: "Engagement", recipient: "mentee",    triggerType: "status_duration", triggerEntity: "request", triggerStatus: "Matched",  triggerDuration: 0, triggerDurationUnit: "hours", whatsappTemplate: "Mentor Matched — View Details",  status: "Active", runCount: 58 },
  { id: "PT-E2", name: "Mentor Matched — Notify Volunteer", isPredefined: true, category: "Engagement", recipient: "volunteer", triggerType: "status_duration", triggerEntity: "request", triggerStatus: "Matched",  triggerDuration: 0, triggerDurationUnit: "hours", whatsappTemplate: "Mentee Matched — View Details",  status: "Active", runCount: 58 },
  { id: "PT-E3", name: "Confirm Call Happened",              isPredefined: true, category: "Engagement", recipient: "mentee",    triggerType: "status_duration", triggerEntity: "request", triggerStatus: "Accessed Contact", triggerDuration: 1, triggerDurationUnit: "hours", whatsappTemplate: "Confirm If Call Happened",       status: "Active", runCount: 47 },
  { id: "PT-E4", name: "Days Left Reminder",                 isPredefined: true, category: "Engagement", recipient: "mentee",    triggerType: "days_remaining",  triggerEntity: "request", triggerDaysValue: 4,                                                                whatsappTemplate: "Days Remaining Reminder",        status: "Active", runCount: 12 },
  { id: "PT-E5", name: "Confirmation Deadline Reminder",     isPredefined: true, category: "Engagement", recipient: "volunteer", triggerType: "status_duration", triggerEntity: "request", triggerStatus: "Mentor response pending",       triggerDuration: 1, triggerDurationUnit: "hours", whatsappTemplate: "Request Confirmation Reminder",  status: "Active", runCount: 26 },
  { id: "PT-E6", name: "Mid-Engagement Check-in",            isPredefined: true, category: "Engagement", recipient: "volunteer", triggerType: "days_remaining",  triggerEntity: "request", triggerDaysValue: 2,                                                                whatsappTemplate: "Mid-Engagement Check-in",        status: "Active", runCount: 8  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function conditionSentence(t: SystemTrigger): string {
  if (t.triggerType === "status_duration") {
    const dur = t.triggerDuration === 0 ? "immediately" : `for ${t.triggerDuration} ${t.triggerDurationUnit}`
    return `Status of ${t.triggerEntity} remains "${t.triggerStatus}" ${dur}`
  }
  if (t.triggerType === "days_remaining") return `Days left in request = ${t.triggerDaysValue}`
  if (t.triggerType === "days_since")    return `Days since last request > ${t.triggerDaysValue}`
  if (t.triggerType === "time_of_day")   return `Orientation slot is today — fires at ${t.triggerTime}`
  if (t.triggerType === "orientation_status") {
    if (!DATE_LINKED_ORIENTATION_STATUSES.has(t.triggerOrientationStatus ?? "")) {
      const dur = t.triggerDuration === 0 ? "immediately" : `for ${t.triggerDuration} ${t.triggerDurationUnit}`
      return `Volunteer's orientation status remains "${t.triggerOrientationStatus}" ${dur}`
    }
    return `Volunteer's orientation status is "${t.triggerOrientationStatus}" — fires ${t.triggerDuration} ${t.triggerDurationUnit} ${t.offsetDirection} the orientation date & time`
  }
  return ""
}

function effectiveTemplateCategory(category: TriggerCategory, recipient?: Recipient): TemplateCategory {
  if (category === "Mentee") return "Mentee"
  if (category === "Volunteer") return "Volunteer"
  return recipient === "mentee" ? "Mentee" : "Volunteer"
}

// ─── Category colours ─────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<TriggerCategory, { badge: string; dot: string }> = {
  Mentee:     { badge: "bg-violet-100 text-violet-700",   dot: "bg-violet-400"  },
  Volunteer:  { badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-400" },
  Engagement: { badge: "bg-orange-100 text-orange-700",   dot: "bg-orange-400"  },
}

const RECIPIENT_COLORS: Record<Recipient, string> = {
  mentee:    "bg-violet-50 text-violet-600 border-violet-200",
  volunteer: "bg-emerald-50 text-emerald-600 border-emerald-200",
}

// ─── Template preview ─────────────────────────────────────────────────────────

// ─── Edit / Add Modal ─────────────────────────────────────────────────────────

function TriggerModal({ trigger, onSave, onClose }: {
  trigger?: SystemTrigger
  onSave: (data: Partial<SystemTrigger>) => void
  onClose: () => void
}) {
  const isPredefined = !!trigger?.isPredefined
  const isNew = !trigger

  const [name, setName]                         = useState(trigger?.name ?? "")
  const [category, setCategory]                 = useState<TriggerCategory>(trigger?.category ?? "Mentee")
  const [recipient, setRecipient]               = useState<Recipient>(trigger?.recipient ?? "mentee")
  const [triggerType, setTriggerType]           = useState<TriggerType>(trigger?.triggerType ?? "status_duration")
  const [triggerEntity, setTriggerEntity]       = useState<TriggerEntity>(trigger?.triggerEntity ?? "mentee")
  const [triggerStatus, setTriggerStatus]       = useState(trigger?.triggerStatus ?? "Sign-up completed")
  const [triggerDuration, setTriggerDuration]   = useState(trigger?.triggerDuration ?? 4)
  const [triggerDurationUnit, setTriggerDurationUnit] = useState<DurationUnit>(trigger?.triggerDurationUnit ?? "hours")
  const [triggerDaysValue, setTriggerDaysValue] = useState(trigger?.triggerDaysValue ?? 4)
  const [triggerTime, setTriggerTime]           = useState(trigger?.triggerTime ?? "09:00")
  const [triggerOrientationStatus, setTriggerOrientationStatus] = useState(trigger?.triggerOrientationStatus ?? ORIENTATION_STATUS_OPTIONS[0])
  const [offsetDirection, setOffsetDirection]   = useState<OffsetDirection>(trigger?.offsetDirection ?? "before")
  const [scheduledSendEnabled, setScheduledSendEnabled] = useState(!!trigger?.scheduledSendTime)
  const [scheduledSendTime, setScheduledSendTime] = useState(trigger?.scheduledSendTime ?? "09:00")

  const initTemplateCat = effectiveTemplateCategory(trigger?.category ?? "Mentee", trigger?.recipient)
  const initTemplate = trigger?.whatsappTemplate ?? TEMPLATES_BY_CATEGORY[initTemplateCat][0].name
  const [whatsappTemplate, setWhatsappTemplate] = useState(initTemplate)

  const templateCat = effectiveTemplateCategory(category, recipient)
  const currentTpl = TEMPLATES_BY_CATEGORY[templateCat].find((t) => t.name === whatsappTemplate)
    ?? TEMPLATES_BY_CATEGORY[templateCat][0]

  const [varMappings, setVarMappings] = useState<Record<number, VarMapping>>(
    trigger?.varMappings ?? defaultMappings(currentTpl.vars)
  )

  // Reset mappings when template changes
  useEffect(() => {
    const tpl = TEMPLATES_BY_CATEGORY[templateCat].find((t) => t.name === whatsappTemplate)
    if (tpl) setVarMappings(defaultMappings(tpl.vars))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [whatsappTemplate, templateCat])

  function handleCategoryChange(c: TriggerCategory) {
    setCategory(c)
    setTriggerType(TRIGGER_TYPES_BY_CATEGORY[c][0].value)
    if (c === "Mentee")     { setTriggerEntity("mentee");   setTriggerStatus(STATUS_OPTIONS["mentee"][0]) }
    if (c === "Volunteer")  { setTriggerEntity("volunteer"); setTriggerStatus(STATUS_OPTIONS["volunteer"][0]) }
    if (c === "Engagement") { setTriggerEntity("request");  setTriggerStatus(STATUS_OPTIONS["request"][0]) }
    const newCat = effectiveTemplateCategory(c, recipient)
    const first = TEMPLATES_BY_CATEGORY[newCat][0]
    setWhatsappTemplate(first.name)
  }

  function handleRecipientChange(r: Recipient) {
    setRecipient(r)
    const newCat = effectiveTemplateCategory(category, r)
    const first = TEMPLATES_BY_CATEGORY[newCat][0]
    setWhatsappTemplate(first.name)
  }

  function handleTemplateChange(name: string) {
    setWhatsappTemplate(name)
    // mappings reset handled by useEffect
  }

  const inlineSel = "border-0 border-b-2 border-blue-400 text-blue-700 font-semibold bg-transparent outline-none px-1 py-0 text-sm cursor-pointer"
  const inlineNum = "border-0 border-b-2 border-blue-400 text-blue-700 font-semibold bg-transparent outline-none w-14 text-center text-sm"
  const entityLabel = category === "Engagement" ? "request" : category === "Mentee" ? "mentee" : "volunteer"

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-[620px] max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-xl z-10">
          <div className="flex items-center gap-2">
            {isPredefined && <Lock className="w-4 h-4 text-gray-400" />}
            <h2 className="font-semibold text-gray-900">{isNew ? "New System Trigger" : "Edit Trigger"}</h2>
            {trigger && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[trigger.category].badge}`}>
                {trigger.category}
              </span>
            )}
          </div>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {isPredefined && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-xs text-amber-700">
              Predefined trigger — core condition is locked. You can adjust duration, time, template, and variable mappings.
            </div>
          )}

          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Trigger Name</label>
            {isPredefined
              ? <p className="text-sm font-medium text-gray-700">{name}</p>
              : <input className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Session expiry — notify mentee" />
            }
          </div>

          {/* Category + recipient + type (new only) */}
          {!isPredefined && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Trigger Category</label>
                <div className="flex gap-2">
                  {(["Mentee", "Volunteer", "Engagement"] as TriggerCategory[]).map((c) => (
                    <button key={c} onClick={() => handleCategoryChange(c)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${category === c ? `${CATEGORY_COLORS[c].badge} border-transparent` : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              {category === "Engagement" && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Send Message To</label>
                  <div className="flex gap-2">
                    {(["mentee", "volunteer"] as Recipient[]).map((r) => (
                      <button key={r} onClick={() => handleRecipientChange(r)}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors capitalize ${recipient === r ? `${RECIPIENT_COLORS[r]} border-transparent` : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Trigger Type</label>
                <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white"
                  value={triggerType} onChange={(e) => setTriggerType(e.target.value as TriggerType)}>
                  {TRIGGER_TYPES_BY_CATEGORY[category].map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Recipient badge (predefined Engagement) */}
          {isPredefined && trigger?.category === "Engagement" && trigger.recipient && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Message Recipient</label>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${RECIPIENT_COLORS[trigger.recipient]}`}>
                {trigger.recipient}
              </span>
            </div>
          )}

          {/* Condition builder */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Trigger Condition</label>
            <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 leading-8">
              {triggerType === "status_duration" && (
                <>
                  When the status of a <span className="font-semibold text-gray-900">{entityLabel}</span> remains{" "}
                  {isPredefined
                    ? <span className="bg-gray-200 text-gray-800 font-semibold px-1.5 py-0.5 rounded">"{triggerStatus}"</span>
                    : <select value={triggerStatus} onChange={(e) => setTriggerStatus(e.target.value)} className={inlineSel}>
                        {STATUS_OPTIONS[triggerEntity].map((s) => <option key={s}>{s}</option>)}
                      </select>
                  }{" "}for{" "}
                  <input type="number" min={0} value={triggerDuration} onChange={(e) => setTriggerDuration(Number(e.target.value))} className={inlineNum} />{" "}
                  <select value={triggerDurationUnit} onChange={(e) => setTriggerDurationUnit(e.target.value as DurationUnit)} className={inlineSel}>
                    <option value="hours">hours</option><option value="days">days</option>
                  </select>
                  {triggerDuration === 0 && <span className="ml-2 text-xs text-blue-500">(fires immediately)</span>}
                </>
              )}
              {triggerType === "days_remaining" && (
                <>When days left in the mentoring request equals{" "}
                  <input type="number" min={1} value={triggerDaysValue} onChange={(e) => setTriggerDaysValue(Number(e.target.value))} className={inlineNum} />
                </>
              )}
              {triggerType === "days_since" && (
                <>When the last request was created more than{" "}
                  <input type="number" min={1} value={triggerDaysValue} onChange={(e) => setTriggerDaysValue(Number(e.target.value))} className={inlineNum} /> days ago
                </>
              )}
              {triggerType === "time_of_day" && (
                <>When the orientation slot is scheduled for today, fire at{" "}
                  <input type="time" value={triggerTime} onChange={(e) => setTriggerTime(e.target.value)} className={inlineSel + " w-28"} />
                </>
              )}
              {triggerType === "orientation_status" && (
                <>
                  When the volunteer's orientation status is{" "}
                  <select value={triggerOrientationStatus} onChange={(e) => setTriggerOrientationStatus(e.target.value)} className={inlineSel}>
                    {ORIENTATION_STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>{" "}
                  {DATE_LINKED_ORIENTATION_STATUSES.has(triggerOrientationStatus) ? (
                    <>
                      , fire{" "}
                      <input type="number" min={0} value={triggerDuration} onChange={(e) => setTriggerDuration(Number(e.target.value))} className={inlineNum} />{" "}
                      <select value={triggerDurationUnit} onChange={(e) => setTriggerDurationUnit(e.target.value as DurationUnit)} className={inlineSel}>
                        <option value="hours">hours</option><option value="days">days</option>
                      </select>{" "}
                      <select value={offsetDirection} onChange={(e) => setOffsetDirection(e.target.value as OffsetDirection)} className={inlineSel}>
                        <option value="before">before</option><option value="after">after</option>
                      </select>{" "}
                      the orientation date &amp; time
                      <p className="text-xs text-gray-400 mt-1">Uses the orientation date + time set on the volunteer's profile</p>
                    </>
                  ) : (
                    <>
                      , fire after it remains this way for{" "}
                      <input type="number" min={0} value={triggerDuration} onChange={(e) => setTriggerDuration(Number(e.target.value))} className={inlineNum} />{" "}
                      <select value={triggerDurationUnit} onChange={(e) => setTriggerDurationUnit(e.target.value as DurationUnit)} className={inlineSel}>
                        <option value="hours">hours</option><option value="days">days</option>
                      </select>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Delivery schedule */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Message Delivery</label>
            <div className={`rounded-xl border p-4 space-y-3 ${scheduledSendEnabled ? "border-blue-200 bg-blue-50/30" : "border-gray-200 bg-white"}`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => setScheduledSendEnabled((v) => !v)}
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
                      <input type="time" value={scheduledSendTime} onChange={(e) => setScheduledSendTime(e.target.value)}
                        className="border border-blue-300 rounded-lg px-2 py-1 text-sm text-blue-700 font-semibold bg-white outline-none focus:border-blue-500" />
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                    <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 leading-relaxed">
                      <span className="font-semibold">Condition re-validated at send time.</span> If it no longer holds, the message is not sent.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Template + variable mapping */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              Action — send WhatsApp message
            </label>
            <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white"
              value={whatsappTemplate} onChange={(e) => handleTemplateChange(e.target.value)}>
              {TEMPLATES_BY_CATEGORY[templateCat].map((t) => <option key={t.name}>{t.name}</option>)}
            </select>

            {/* Preview + mapping */}
            {(() => {
              const tpl = TEMPLATES_BY_CATEGORY[templateCat].find(t => t.name === whatsappTemplate)
              if (!tpl) return null
              const allowedCategories: VarCategory[] =
                category === "Mentee" ? ["Mentee"]
                : category === "Volunteer" ? ["Volunteer"]
                : ["Mentee", "Volunteer", "Engagement"]
              return (
                <WaTemplateEditor
                  content={tpl.content}
                  allowedCategories={allowedCategories}
                  mappings={varMappings}
                  onChange={setVarMappings}
                />
              )
            })()}
          </div>
        </div>

        <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={() => onSave({
            name, category, recipient: category === "Engagement" ? recipient : undefined,
            triggerType, triggerEntity, triggerStatus, triggerDuration, triggerDurationUnit,
            triggerDaysValue, triggerTime, triggerOrientationStatus, offsetDirection,
            scheduledSendTime: scheduledSendEnabled ? scheduledSendTime : undefined,
            whatsappTemplate, varMappings,
          })}>
            {isNew ? "Create Trigger" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Trigger row ──────────────────────────────────────────────────────────────

function TriggerRow({ trigger, onToggle, onEdit, onDelete }: {
  trigger: SystemTrigger
  onToggle: () => void
  onEdit: () => void
  onDelete?: () => void
}) {
  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 bg-white border rounded-lg transition-colors ${trigger.status === "Active" ? "border-gray-200 hover:border-gray-300" : "border-gray-100 opacity-60"}`}>
      <div className={`w-2 h-2 rounded-full shrink-0 ${trigger.status === "Active" ? "bg-green-400" : "bg-gray-300"}`} />
      <div className="flex items-center gap-1.5 w-56 shrink-0">
        <span className="text-sm font-medium text-gray-900 truncate">{trigger.name}</span>
        {trigger.isPredefined && <Lock className="w-3 h-3 text-gray-300 shrink-0" />}
      </div>
      <span className="flex-1 text-xs text-gray-500 truncate min-w-0">{conditionSentence(trigger)}</span>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-gray-300 text-sm">→</span>
        {trigger.recipient && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold capitalize ${RECIPIENT_COLORS[trigger.recipient]}`}>
            to {trigger.recipient}
          </span>
        )}
        <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded font-medium whitespace-nowrap">
          WA: {trigger.whatsappTemplate}
        </span>
        {trigger.scheduledSendTime && (
          <span className="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
            <Clock className="w-2.5 h-2.5" />{trigger.scheduledSendTime}
          </span>
        )}
      </div>
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
  const descriptions: Record<TriggerCategory, string> = {
    Mentee:     "Conditions on the mentee's profile or activity",
    Volunteer:  "Conditions on the volunteer's profile or onboarding",
    Engagement: "Conditions on the mentoring request — sends to either party",
  }
  return (
    <div className="mb-4">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 w-full mb-1.5">
        {open ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[title].badge}`}>{title}</span>
        <span className="text-xs text-gray-400">{active}/{triggers.length} active</span>
        <span className="text-xs text-gray-300 hidden sm:inline">·</span>
        <span className="text-xs text-gray-400 hidden sm:inline">{descriptions[title]}</span>
      </button>
      {open && (
        <div className="space-y-1.5 pl-5">
          {triggers.map((t) => (
            <TriggerRow key={t.id} trigger={t}
              onToggle={() => onToggle(t.id)}
              onEdit={() => onEdit(t)}
              onDelete={t.isPredefined ? undefined : () => onDelete(t.id)}
            />
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
  const [triggers, setTriggers]   = useState<SystemTrigger[]>(PREDEFINED)
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState<SystemTrigger | null>(null)
  const [pageTab, setPageTab]     = useState<PageTab>("triggers")

  const toggle = (id: string) =>
    setTriggers((p) => p.map((t) => t.id === id ? { ...t, status: t.status === "Active" ? "Paused" : "Active" } : t))

  const deleteTrigger = (id: string) => setTriggers((p) => p.filter((t) => t.id !== id))

  const handleSave = (data: Partial<SystemTrigger>) => {
    if (editTarget) {
      setTriggers((p) => p.map((t) => t.id === editTarget.id ? { ...t, ...data } : t))
    } else {
      const cat = data.category ?? "Mentee"
      const entity: TriggerEntity = cat === "Engagement" ? "request" : cat === "Mentee" ? "mentee" : "volunteer"
      setTriggers((p) => [...p, {
        id: `CT-${Date.now()}`, name: data.name ?? "New Trigger", isPredefined: false,
        category: cat, recipient: data.recipient,
        triggerType: data.triggerType ?? "status_duration", triggerEntity: entity,
        triggerStatus: data.triggerStatus, triggerDuration: data.triggerDuration,
        triggerDurationUnit: data.triggerDurationUnit, triggerDaysValue: data.triggerDaysValue,
        triggerTime: data.triggerTime, triggerOrientationStatus: data.triggerOrientationStatus,
        offsetDirection: data.offsetDirection, scheduledSendTime: data.scheduledSendTime,
        whatsappTemplate: data.whatsappTemplate ?? "", varMappings: data.varMappings,
        status: "Active", runCount: 0,
      }])
    }
    setShowModal(false)
    setEditTarget(null)
  }

  const activeCount = triggers.filter((t) => t.status === "Active").length
  const categories: TriggerCategory[] = ["Mentee", "Volunteer", "Engagement"]

  return (
    <div className="h-full flex flex-col overflow-hidden">
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

        <div className="flex gap-4 mb-4">
          {[
            { label: "Active",      value: activeCount,                                        color: "text-green-600"  },
            { label: "Paused",      value: triggers.filter((t) => t.status === "Paused").length, color: "text-yellow-600" },
            { label: "Predefined",  value: triggers.filter((t) => t.isPredefined).length,      color: "text-gray-500"   },
            { label: "Custom",      value: triggers.filter((t) => !t.isPredefined).length,     color: "text-blue-600"   },
            { label: "Log entries", value: MOCK_LOGS.length,                                    color: "text-violet-600" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
              <span className="text-xs text-gray-400">{s.label}</span>
              <span className="text-gray-200">·</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-4">
          {categories.map((c) => (
            <div key={c} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${CATEGORY_COLORS[c].dot}`} />
              <span className="text-xs text-gray-500">{c} ({triggers.filter((t) => t.category === c).length})</span>
            </div>
          ))}
        </div>

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
