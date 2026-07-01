import { useState, useEffect } from "react"
import { Search, X, Check, Plus, LayoutTemplate } from "lucide-react"
import { type CommTemplate } from "@/data/commsData"
import {
  WaTemplateEditor,
  type VarCategory, type VarMapping,
  defaultMappings, getVarCount,
} from "@/components/WaVariableMapper"

function categoryLabel(cat: string) {
  return cat === "generic" ? "Utility" : "Marketing"
}

// ── Template Picker Modal ─────────────────────────────────────────────────────

export function TemplatePickerModal({
  templates,
  allowedCategories,
  onClose,
  onSend,
}: {
  templates: CommTemplate[]
  allowedCategories: VarCategory[]
  onClose: () => void
  onSend: (msg: string) => void
}) {
  const [search, setSearch]     = useState("")
  const [selected, setSelected] = useState<CommTemplate | null>(templates[0] ?? null)
  const [mappings, setMappings] = useState<Record<number, VarMapping>>(
    templates[0] ? defaultMappings(templates[0].vars) : {}
  )

  useEffect(() => {
    if (selected) setMappings(defaultMappings(selected.vars))
  }, [selected?.id])

  const filtered = templates.filter(t =>
    t.label.toLowerCase().includes(search.toLowerCase()) ||
    categoryLabel(t.category).toLowerCase().includes(search.toLowerCase())
  )

  const varCount = selected ? getVarCount(selected.message) : 0

  function buildMessage() {
    if (!selected) return ""
    return resolveMessage(selected.message, mappings)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl w-[820px] max-h-[88vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Select WhatsApp Template</h2>
              <p className="text-sm text-gray-500 mt-0.5">Choose a template and map its variables before sending</p>
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
          <div className="w-[260px] border-r border-gray-100 overflow-y-auto shrink-0 p-3 space-y-2">
            {filtered.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No templates match</p>
            ) : filtered.map(t => (
              <button
                key={t.id}
                onClick={() => setSelected(t)}
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

          {/* Right: preview + variable mapper */}
          {selected ? (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <WaTemplateEditor
                  content={selected.message}
                  allowedCategories={allowedCategories}
                  mappings={mappings}
                  onChange={setMappings}
                />
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
      </div>
    </div>
  )
}

// ── Templates Page View ───────────────────────────────────────────────────────

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

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <LayoutTemplate className="w-8 h-8 mb-2 text-gray-300" />
          <p className="text-sm">No templates match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map(t => (
            <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 hover:border-gray-300 transition-colors">
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
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                {t.message}
              </p>
              {t.vars.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {t.vars.map((v, i) => (
                    <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {`{{${i + 1}}}`} {v}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
