import { useState } from "react"
import { Search, X, Check, Plus, LayoutTemplate } from "lucide-react"
import { type CommTemplate } from "@/data/commsData"

// ── helpers ───────────────────────────────────────────────────────────────────

const SYSTEM_VARS = [
  { label: "Contact Name",  token: "name"       },
  { label: "Mentee Name",   token: "menteeName" },
  { label: "Mentor Name",   token: "mentorName" },
  { label: "NGO Name",      token: "ngo"        },
  { label: "Skill Area",    token: "skill"      },
  { label: "Days Count",    token: "days"       },
]

function extractVars(msg: string): string[] {
  return [...new Set([...msg.matchAll(/\{(\w+)\}/g)].map(m => m[1]))]
}

function categoryLabel(cat: string) {
  return cat === "generic" ? "Utility" : "Marketing"
}

// ── Template Picker Modal ─────────────────────────────────────────────────────
// Opened from the chat input bar; lets admin select + customise a template then send.

export function TemplatePickerModal({
  templates,
  onClose,
  onSend,
}: {
  templates: CommTemplate[]
  onClose: () => void
  onSend: (msg: string) => void
}) {
  const [search, setSearch]           = useState("")
  const [selected, setSelected]       = useState<CommTemplate | null>(templates[0] ?? null)
  const [varValues, setVarValues]     = useState<Record<string, string>>({})
  const [replacingVar, setReplacingVar] = useState<string | null>(null)
  const [sysVar, setSysVar]           = useState("")
  const [customVal, setCustomVal]     = useState("")

  const filtered = templates.filter(t =>
    t.label.toLowerCase().includes(search.toLowerCase()) ||
    categoryLabel(t.category).toLowerCase().includes(search.toLowerCase())
  )

  const vars = selected ? extractVars(selected.message) : []

  function renderPreview(msg: string) {
    const parts = msg.split(/(\{\w+\})/g)
    return parts.map((part, i) => {
      const m = part.match(/^\{(\w+)\}$/)
      if (!m) return <span key={i}>{part}</span>
      const varName = m[1]
      const value   = varValues[varName]
      return (
        <button
          key={i}
          onClick={() => { setReplacingVar(varName); setSysVar(""); setCustomVal(value ?? "") }}
          className={`inline-flex items-center rounded px-1.5 py-0.5 text-sm font-medium mx-0.5 transition-colors ${
            value ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          {value ?? `{${varName}}`}
        </button>
      )
    })
  }

  function buildMessage() {
    if (!selected) return ""
    let msg = selected.message
    for (const [k, v] of Object.entries(varValues)) {
      msg = msg.replace(new RegExp(`\\{${k}\\}`, "g"), v)
    }
    return msg
  }

  function confirmVar() {
    const val = sysVar || customVal
    if (val && replacingVar) setVarValues(p => ({ ...p, [replacingVar]: val }))
    setReplacingVar(null)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl w-[780px] max-h-[88vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Select WhatsApp Template</h2>
              <p className="text-sm text-gray-500 mt-0.5">Choose a template to send to the recipient</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 mt-0.5">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              className="w-full text-sm border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-blue-400 bg-gray-50"
              placeholder="Search templates..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* Left: template list */}
          <div className="w-[280px] border-r border-gray-100 overflow-y-auto shrink-0 p-3 space-y-2">
            {filtered.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No templates match</p>
            ) : filtered.map(t => (
              <button
                key={t.id}
                onClick={() => { setSelected(t); setVarValues({}) }}
                className={`w-full text-left rounded-xl border p-3 transition-all ${
                  selected?.id === t.id
                    ? "border-blue-400 bg-blue-50/60"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900 leading-snug">{t.label}</p>
                  {selected?.id === t.id && <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{categoryLabel(t.category)}</p>
                <span className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                  APPROVED
                </span>
                {t.isCustom && (
                  <span className="ml-1 inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200">
                    custom
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Right: preview */}
          {selected ? (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Template Preview</p>

                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-500">Message Template</p>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {renderPreview(selected.message)}
                  </p>
                </div>

                {vars.length > 0 && (
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Customize this template by clicking the highlighted variables above to replace them with
                    a system variable or custom text. Body variables (blue) update inline.
                    {varValues && Object.keys(varValues).length > 0 && (
                      <button
                        className="ml-1.5 text-blue-600 hover:underline"
                        onClick={() => setVarValues({})}
                      >
                        Reset all
                      </button>
                    )}
                  </p>
                )}
              </div>

              <div className="px-5 py-4 border-t border-gray-100 shrink-0">
                <button
                  onClick={() => { onSend(buildMessage()); onClose() }}
                  className="w-full bg-gray-900 hover:bg-black text-white rounded-xl py-3 text-sm font-semibold transition-colors"
                >
                  Send Template
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <p className="text-sm">Select a template to preview</p>
            </div>
          )}
        </div>

        {/* Variable Replace Sub-modal (layered on top of this modal) */}
        {replacingVar && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-2xl z-10">
            <div className="bg-white rounded-2xl shadow-2xl w-[360px] p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Replace Variable</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Replace <code className="bg-gray-100 px-1 rounded">{`{${replacingVar}}`}</code> with a system variable or custom text
                  </p>
                </div>
                <button onClick={() => setReplacingVar(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">System Variables</p>
                <select
                  value={sysVar}
                  onChange={e => setSysVar(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 outline-none focus:border-blue-400 bg-white text-gray-600 appearance-none"
                >
                  <option value="">Select a variable</option>
                  {SYSTEM_VARS.map(v => (
                    <option key={v.token} value={v.label}>{v.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Custom Text</p>
                <div className="flex gap-2">
                  <input
                    className="flex-1 text-sm border border-gray-300 rounded-xl px-3 py-2.5 outline-none focus:border-blue-400"
                    placeholder={`Enter value for {${replacingVar}}`}
                    value={customVal}
                    onChange={e => { setCustomVal(e.target.value); setSysVar("") }}
                    onKeyDown={e => e.key === "Enter" && confirmVar()}
                  />
                  <button
                    onClick={confirmVar}
                    className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Templates Page View ───────────────────────────────────────────────────────
// Full-page view shown when admin clicks the "Templates" tab.

export function TemplatesView({
  templates,
  onCreateTemplate,
}: {
  templates: CommTemplate[]
  onCreateTemplate: () => void
}) {
  const [filterCat, setFilterCat] = useState<"all" | "generic" | "engagement">("all")
  const [search, setSearch]       = useState("")

  const filtered = templates.filter(t => {
    if (filterCat !== "all" && t.category !== filterCat) return false
    if (search && !t.label.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">WhatsApp Templates</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {templates.length} template{templates.length !== 1 ? "s" : ""} — all approved for sending
          </p>
        </div>
        <button
          onClick={onCreateTemplate}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> New Template
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
          <input
            className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-blue-400 bg-gray-50"
            placeholder="Search templates..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5">
          {([["all", "All"], ["generic", "Utility"], ["engagement", "Marketing"]] as const).map(([val, lbl]) => (
            <button
              key={val}
              onClick={() => setFilterCat(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                filterCat === val
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Template grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <LayoutTemplate className="w-8 h-8 mb-2 text-gray-300" />
          <p className="text-sm">No templates match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map(t => {
            const vars = extractVars(t.message)
            return (
              <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 hover:border-gray-300 transition-colors">
                {/* Card header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{t.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{categoryLabel(t.category)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                      APPROVED
                    </span>
                    {t.isCustom && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200">
                        custom
                      </span>
                    )}
                  </div>
                </div>

                {/* Message preview */}
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                  {t.message}
                </p>

                {/* Variable chips */}
                {vars.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {vars.map(v => (
                      <span key={v} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        {`{${v}}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
