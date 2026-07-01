import { useState } from "react"
import { X, Pencil } from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SysVar {
  label: string
  key: string
  category: "Mentee" | "Volunteer" | "Engagement"
}

export interface VarMapping {
  mode: "system" | "custom"
  systemVar: string
  customText: string
}

export type VarCategory = "Mentee" | "Volunteer" | "Engagement"

// ── System variables ──────────────────────────────────────────────────────────

export const SYSTEM_VARIABLES: { category: VarCategory; color: string; vars: SysVar[] }[] = [
  {
    category: "Mentee", color: "violet",
    vars: [
      { label: "First Name",        key: "mentee_first_name",        category: "Mentee" },
      { label: "Last Name",         key: "mentee_last_name",         category: "Mentee" },
      { label: "City",              key: "mentee_city",              category: "Mentee" },
      { label: "State",             key: "mentee_state",             category: "Mentee" },
      { label: "Country",           key: "mentee_country",           category: "Mentee" },
      { label: "Group Name",        key: "mentee_group_name",        category: "Mentee" },
      { label: "Education Level",   key: "mentee_education_level",   category: "Mentee" },
      { label: "Education Degree",  key: "mentee_education_degree",  category: "Mentee" },
      { label: "Profile Link",      key: "mentee_profile_link",      category: "Mentee" },
    ],
  },
  {
    category: "Volunteer", color: "emerald",
    vars: [
      { label: "First Name",              key: "volunteer_first_name",      category: "Volunteer" },
      { label: "Last Name",               key: "volunteer_last_name",       category: "Volunteer" },
      { label: "Current Company",         key: "volunteer_current_company", category: "Volunteer" },
      { label: "City",                    key: "volunteer_city",            category: "Volunteer" },
      { label: "State",                   key: "volunteer_state",           category: "Volunteer" },
      { label: "Country",                 key: "volunteer_country",         category: "Volunteer" },
      { label: "Group Name",              key: "volunteer_group_name",      category: "Volunteer" },
      { label: "Profile Link",            key: "volunteer_profile_link",    category: "Volunteer" },
      { label: "Onboarding Booking Link", key: "onboarding_booking_link",   category: "Volunteer" },
      { label: "Onboarding Date",         key: "onboarding_date",           category: "Volunteer" },
      { label: "Onboarding Time",         key: "onboarding_time",           category: "Volunteer" },
      { label: "Call Join Link",          key: "onboarding_call_join_link", category: "Volunteer" },
    ],
  },
  {
    category: "Engagement", color: "orange",
    vars: [
      { label: "Engagement Goal",       key: "engagement_goal",          category: "Engagement" },
      { label: "Engagement Theme",      key: "engagement_theme",         category: "Engagement" },
      { label: "Target Domain",         key: "engagement_target_domain", category: "Engagement" },
      { label: "Days Valid",            key: "days_valid",               category: "Engagement" },
      { label: "Days Remaining",        key: "days_remaining",           category: "Engagement" },
      { label: "Hours Remaining",       key: "hours_remaining",          category: "Engagement" },
      { label: "Response Window (hrs)", key: "response_window_hours",    category: "Engagement" },
      { label: "Fit Reason",            key: "volunteer_fit_reason",     category: "Engagement" },
      { label: "App Link",              key: "app_link",                 category: "Engagement" },
      { label: "Mark Complete Link",    key: "mark_complete_link",       category: "Engagement" },
      { label: "Feedback Link",         key: "feedback_link",            category: "Engagement" },
      { label: "Active Requests Link",  key: "active_requests_link",     category: "Engagement" },
      { label: "Request Deep Link",     key: "request_deep_link",        category: "Engagement" },
      { label: "OTP",                   key: "otp",                      category: "Engagement" },
    ],
  },
]

export const VAR_CATEGORY_COLORS: Record<VarCategory, { chip: string; badge: string }> = {
  Mentee:     { chip: "bg-violet-100 text-violet-800 border-violet-300",  badge: "bg-violet-100 text-violet-700 border-violet-200"  },
  Volunteer:  { chip: "bg-emerald-100 text-emerald-800 border-emerald-300", badge: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  Engagement: { chip: "bg-orange-100 text-orange-800 border-orange-300",  badge: "bg-orange-100 text-orange-700 border-orange-200"  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function findSysVar(key: string): SysVar | undefined {
  for (const group of SYSTEM_VARIABLES) {
    const v = group.vars.find((v) => v.key === key)
    if (v) return v
  }
}

export function getVarCount(content: string): number {
  const nums = [...content.matchAll(/\{\{(\d+)\}\}/g)].map((m) => parseInt(m[1]))
  return nums.length > 0 ? Math.max(...nums) : 0
}

export function defaultMappings(vars: string[]): Record<number, VarMapping> {
  const out: Record<number, VarMapping> = {}
  for (let i = 0; i < vars.length; i++) {
    out[i + 1] = { mode: "system", systemVar: vars[i], customText: "" }
  }
  return out
}

export function resolveMessage(content: string, mappings: Record<number, VarMapping>): string {
  return content.replace(/\{\{(\d+)\}\}/g, (_m, n) => {
    const idx = parseInt(n)
    const mapping = mappings[idx]
    if (!mapping) return `{{${n}}}`
    if (mapping.mode === "custom" && mapping.customText) return mapping.customText
    if (mapping.mode === "system" && mapping.systemVar) {
      const found = findSysVar(mapping.systemVar)
      return found ? found.label : `{{${n}}}`
    }
    return `{{${n}}}`
  })
}

// ── Replace Variable popup ────────────────────────────────────────────────────

function ReplaceVarPopup({
  varIndex,
  current,
  allowedCategories,
  onReplace,
  onClose,
}: {
  varIndex: number
  current: VarMapping | undefined
  allowedCategories: VarCategory[]
  onReplace: (m: VarMapping) => void
  onClose: () => void
}) {
  const visibleGroups = SYSTEM_VARIABLES.filter(g => allowedCategories.includes(g.category))

  const [sysVar, setSysVar] = useState(current?.mode === "system" ? current.systemVar : "")
  const [customText, setCustomText] = useState(current?.mode === "custom" ? current.customText : "")

  const canReplace = sysVar !== "" || customText.trim() !== ""

  function handleReplace() {
    if (sysVar) {
      onReplace({ mode: "system", systemVar: sysVar, customText: "" })
    } else {
      onReplace({ mode: "custom", systemVar: "", customText: customText.trim() })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-[380px] p-6 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-gray-900 text-base">Replace Variable</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Replace{" "}
              <code className="bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded font-mono text-[11px]">
                {`{{${varIndex}}}`}
              </code>{" "}
              with a system variable or custom text
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 mt-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* System variables */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">System Variables</p>
          <select
            value={sysVar}
            onChange={e => { setSysVar(e.target.value); setCustomText("") }}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-400 bg-white text-gray-700 appearance-none"
          >
            <option value="">Select a variable</option>
            {visibleGroups.map(group => (
              <optgroup key={group.category} label={`── ${group.category}`}>
                {group.vars.map(v => (
                  <option key={v.key} value={v.key}>{v.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
          {sysVar && (() => {
            const v = findSysVar(sysVar)
            return v ? (
              <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${VAR_CATEGORY_COLORS[v.category].badge}`}>
                {v.category} · {v.label}
              </span>
            ) : null
          })()}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Custom text */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Custom Text</p>
          <input
            value={customText}
            onChange={e => { setCustomText(e.target.value); setSysVar("") }}
            onKeyDown={e => e.key === "Enter" && canReplace && handleReplace()}
            placeholder={`Enter value for {{${varIndex}}}…`}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-400"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleReplace}
            disabled={!canReplace}
            className="flex-1 py-2.5 rounded-xl bg-gray-900 hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold transition-colors"
          >
            Replace
          </button>
        </div>
      </div>
    </div>
  )
}

// ── WaTemplateEditor — interactive template with clickable {{n}} tokens ────────
// This is the main component to use. It renders the template with clickable
// variable tokens, a popup to assign each one, and a WA bubble preview below.

export function WaTemplateEditor({
  content,
  allowedCategories,
  mappings,
  onChange,
}: {
  content: string
  allowedCategories: VarCategory[]
  mappings: Record<number, VarMapping>
  onChange: (mappings: Record<number, VarMapping>) => void
}) {
  const [activeVar, setActiveVar] = useState<number | null>(null)

  // Parse content into alternating text / {{n}} segments
  const segments: Array<{ type: "text"; value: string } | { type: "var"; index: number }> = []
  const regex = /\{\{(\d+)\}\}/g
  let last = 0
  let match: RegExpExecArray | null
  while ((match = regex.exec(content)) !== null) {
    if (match.index > last) segments.push({ type: "text", value: content.slice(last, match.index) })
    segments.push({ type: "var", index: parseInt(match[1]) })
    last = match.index + match[0].length
  }
  if (last < content.length) segments.push({ type: "text", value: content.slice(last) })

  function resolvedLabel(n: number): { label: string; category?: VarCategory; isCustom?: boolean } | null {
    const m = mappings[n]
    if (!m) return null
    if (m.mode === "custom" && m.customText) return { label: m.customText, isCustom: true }
    if (m.mode === "system" && m.systemVar) {
      const v = findSysVar(m.systemVar)
      if (v) return { label: v.label, category: v.category }
    }
    return null
  }

  // WA bubble preview
  const resolvedContent = resolveMessage(content, mappings)

  return (
    <div className="space-y-4">
      {/* Interactive template */}
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Template — click a variable to assign it
        </p>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {segments.map((seg, i) => {
            if (seg.type === "text") return <span key={i}>{seg.value}</span>
            const resolved = resolvedLabel(seg.index)
            if (resolved) {
              const chipCls = resolved.isCustom
                ? "bg-gray-100 text-gray-700 border-gray-300"
                : VAR_CATEGORY_COLORS[resolved.category!].chip
              return (
                <button
                  key={i}
                  onClick={() => setActiveVar(seg.index)}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold mx-0.5 align-middle transition-opacity hover:opacity-75 ${chipCls}`}
                >
                  {resolved.label}
                  <Pencil className="w-2.5 h-2.5 opacity-60" />
                </button>
              )
            }
            return (
              <button
                key={i}
                onClick={() => setActiveVar(seg.index)}
                className="inline-flex items-center rounded border border-blue-300 bg-blue-50 px-1.5 py-0.5 text-xs font-mono font-bold text-blue-600 mx-0.5 align-middle hover:bg-blue-100 transition-colors"
              >
                {`{{${seg.index}}}`}
              </button>
            )
          })}
        </div>
      </div>

      {/* WA bubble preview */}
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Preview</p>
        <div className="bg-[#ece5dd] rounded-xl p-3 flex justify-end">
          <div className="max-w-[75%] bg-[#005c4b] text-white rounded-2xl rounded-br-sm px-3 py-2 shadow-sm">
            <p className="text-xs leading-relaxed whitespace-pre-line">{resolvedContent}</p>
            <p className="text-[10px] text-green-200 mt-1 text-right">12:00 PM ✓✓</p>
          </div>
        </div>
      </div>

      {/* Popup */}
      {activeVar !== null && (
        <ReplaceVarPopup
          varIndex={activeVar}
          current={mappings[activeVar]}
          allowedCategories={allowedCategories}
          onReplace={m => onChange({ ...mappings, [activeVar]: m })}
          onClose={() => setActiveVar(null)}
        />
      )}
    </div>
  )
}

// ── Keep legacy exports for any remaining usages ──────────────────────────────

export function VariableMapper(props: {
  content: string
  allowedCategories: VarCategory[]
  mappings: Record<number, VarMapping>
  onChange: (mappings: Record<number, VarMapping>) => void
}) {
  return <WaTemplateEditor {...props} />
}

export function WaPreview({ content, mappings }: { content: string; mappings: Record<number, VarMapping> }) {
  const resolved = resolveMessage(content, mappings)
  return (
    <div className="bg-[#ece5dd] rounded-xl p-3 flex justify-end">
      <div className="max-w-[75%] bg-[#005c4b] text-white rounded-2xl rounded-br-sm px-3 py-2 shadow-sm">
        <p className="text-xs leading-relaxed whitespace-pre-line">{resolved}</p>
        <p className="text-[10px] text-green-200 mt-1 text-right">12:00 PM ✓✓</p>
      </div>
    </div>
  )
}
