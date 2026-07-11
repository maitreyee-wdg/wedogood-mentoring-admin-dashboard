import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  type OnboardingLink, type FieldPreset, type OrientationSlot, type PresetFieldDef,
  VOLUNTEER_PRESET_FIELDS, MENTEE_PRESET_FIELDS,
} from "@/data/groupsData"
import { ClockTimeInput } from "@/components/ClockTimeInput"
import { X, Plus, Copy, Check, CalendarPlus } from "lucide-react"

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

export function OnboardingLinkModal({ link, entityType, groupName, interestNote, onSave, onClose }: {
  link?: OnboardingLink
  entityType: "volunteer" | "mentee"
  groupName: string
  interestNote?: string
  onSave: (l: Omit<OnboardingLink, "id" | "createdAt" | "status">) => void
  onClose: () => void
}) {
  const catalog: PresetFieldDef[] = entityType === "volunteer" ? VOLUNTEER_PRESET_FIELDS : MENTEE_PRESET_FIELDS
  const [name, setName] = useState(link?.name ?? "")
  const [description, setDescription] = useState(link?.description ?? "")
  const [presetFields, setPresetFields] = useState<FieldPreset[]>(link?.presetFields ?? [])
  const [orientationSlots, setOrientationSlots] = useState<OrientationSlot[]>(link?.orientationSlots ?? [])
  const [tagDrafts, setTagDrafts] = useState<Record<number, string>>({})
  const [copied, setCopied] = useState(false)

  const url = `app.wedogood.in/onboard/${entityType}/${slugify(groupName) || "group"}/${slugify(name) || "link"}`

  const usedFields = (excludeIdx: number) => presetFields.filter((_, i) => i !== excludeIdx).map((p) => p.field)

  const setPresetField = (idx: number, field: string) => {
    const def = catalog.find((f) => f.key === field)
    setPresetFields((prev) => prev.map((p, i) => i === idx ? { field, value: def?.type === "select" ? (def.options?.[0] ?? "") : "" } : p))
  }
  const setPresetValue = (idx: number, value: string) => setPresetFields((prev) => prev.map((p, i) => i === idx ? { ...p, value } : p))
  const addPresetField = () => {
    setPresetFields((prev) => {
      const next = catalog.find((f) => !prev.some((p) => p.field === f.key))
      if (!next) return prev
      return [...prev, { field: next.key, value: next.type === "select" ? (next.options?.[0] ?? "") : "" }]
    })
  }
  const removePresetField = (idx: number) => setPresetFields((prev) => prev.filter((_, i) => i !== idx))

  const tagsFor = (value: string) => value ? value.split(";").map((t) => t.trim()).filter(Boolean) : []
  const setTags = (idx: number, tags: string[]) => setPresetFields((prev) => prev.map((p, i) => i === idx ? { ...p, value: tags.join("; ") } : p))
  const addTag = (idx: number) => {
    const draft = (tagDrafts[idx] ?? "").trim()
    if (!draft) return
    setPresetFields((prev) => {
      const current = tagsFor(prev[idx].value)
      return current.includes(draft) ? prev : prev.map((p, i) => i === idx ? { ...p, value: [...current, draft].join("; ") } : p)
    })
    setTagDrafts((d) => ({ ...d, [idx]: "" }))
  }
  const removeTag = (idx: number, tag: string) => setTags(idx, tagsFor(presetFields[idx].value).filter((t) => t !== tag))
  const toggleTagOption = (idx: number, option: string) => {
    const current = tagsFor(presetFields[idx].value)
    setTags(idx, current.includes(option) ? current.filter((t) => t !== option) : [...current, option])
  }

  const addSlot = () => setOrientationSlots((prev) => [...prev, { id: `slot-${Date.now()}-${prev.length}`, meetingName: "", date: "", time: "", meetingLink: "", wdgEmail: "" }])
  const removeSlot = (id: string) => setOrientationSlots((prev) => prev.filter((s) => s.id !== id))
  const setSlot = (id: string, field: keyof OrientationSlot, value: string) => setOrientationSlots((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s))

  const handleCopy = () => {
    navigator.clipboard?.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const canSave = name.trim().length > 0

  const handleSave = () => {
    if (!canSave) return
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      url,
      presetFields: presetFields.filter((p) => p.field && p.value),
      orientationSlots: entityType === "volunteer" ? orientationSlots.filter((s) => s.date || s.time || s.meetingLink || s.meetingName || s.wdgEmail) : undefined,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[520px] max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">{link ? "Edit Onboarding Link" : "Create Onboarding Link"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">LINK NAME *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. LinkedIn Campaign — July" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">DESCRIPTION</label>
            <textarea className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 resize-none h-16" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this link for / where will it be shared…" />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">SIGNUP URL</label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <span className="text-xs text-gray-600 flex-1 truncate">{url}</span>
              <button onClick={handleCopy} className="text-gray-400 hover:text-blue-600 shrink-0">
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {interestNote && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-700">
              This group's only interest area is <strong>"{interestNote}"</strong> — volunteers signing up via any link from this group won't be asked to choose.
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-500">PRESET FIELD VALUES</label>
              {presetFields.length < catalog.length && (
                <button onClick={addPresetField} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"><Plus className="w-3 h-3" />Add field</button>
              )}
            </div>
            {presetFields.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No fields preset — end users will be asked to fill these in as usual.</p>
            ) : (
              <div className="space-y-2">
                {presetFields.map((pf, idx) => {
                  const def = catalog.find((f) => f.key === pf.field)
                  const availableForRow = catalog.filter((f) => f.key === pf.field || !usedFields(idx).includes(f.key))
                  return (
                    <div key={idx} className="border border-gray-100 rounded-lg p-2.5 bg-gray-50">
                      <div className="flex items-center gap-2 mb-1.5">
                        <select value={pf.field} onChange={(e) => setPresetField(idx, e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400 bg-white flex-1">
                          {availableForRow.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                        </select>
                        <button onClick={() => removePresetField(idx)} className="text-gray-400 hover:text-red-500 shrink-0"><X className="w-3.5 h-3.5" /></button>
                      </div>
                      {def?.type === "select" ? (
                        <select value={pf.value} onChange={(e) => setPresetValue(idx, e.target.value)} className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400 bg-white">
                          {def.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : def?.type === "number" ? (
                        <input type="number" value={pf.value} onChange={(e) => setPresetValue(idx, e.target.value)} className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" />
                      ) : def?.type === "tags" ? (
                        <div>
                          <div className="flex flex-wrap gap-1.5 mb-1.5">
                            {tagsFor(pf.value).map((t) => (
                              <span key={t} className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                {t}<button onClick={() => removeTag(idx, t)}><X className="w-2.5 h-2.5" /></button>
                              </span>
                            ))}
                          </div>
                          {def.options ? (
                            <div className="flex flex-wrap gap-1.5">
                              {def.options.map((o) => (
                                <button key={o} onClick={() => toggleTagOption(idx, o)} className={`text-xs px-2 py-0.5 rounded-full border ${tagsFor(pf.value).includes(o) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"}`}>{o}</button>
                              ))}
                            </div>
                          ) : (
                            <div className="flex gap-1.5">
                              <input className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" placeholder="Add value…" value={tagDrafts[idx] ?? ""} onChange={(e) => setTagDrafts((d) => ({ ...d, [idx]: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && addTag(idx)} />
                              <button onClick={() => addTag(idx)} className="text-xs text-blue-600 font-medium px-2">Add</button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <input value={pf.value} onChange={(e) => setPresetValue(idx, e.target.value)} className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" placeholder={`e.g. ${def?.label}`} />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {entityType === "volunteer" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-500">CUSTOM ORIENTATION SLOTS</label>
                <button onClick={addSlot} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"><CalendarPlus className="w-3 h-3" />Add slot</button>
              </div>
              {orientationSlots.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No custom slots — volunteers will use the general orientation pool.</p>
              ) : (
                <div className="space-y-2">
                  {orientationSlots.map((s) => (
                    <div key={s.id} className="border border-gray-100 rounded-lg p-2.5 bg-gray-50 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <input value={s.meetingName} onChange={(e) => setSlot(s.id, "meetingName", e.target.value)} className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" placeholder="Name of meeting" />
                        <button onClick={() => removeSlot(s.id)} className="text-gray-400 hover:text-red-500 shrink-0"><X className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="date" value={s.date} onChange={(e) => setSlot(s.id, "date", e.target.value)} className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" />
                        <ClockTimeInput
                          value={s.time}
                          onChange={(v) => setSlot(s.id, "time", v)}
                          className="w-28 text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400 bg-white flex items-center gap-1 hover:border-blue-300"
                        />
                      </div>
                      <input value={s.meetingLink} onChange={(e) => setSlot(s.id, "meetingLink", e.target.value)} className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" placeholder="Meeting link (e.g. meet.google.com/xyz)" />
                      <input type="email" value={s.wdgEmail} onChange={(e) => setSlot(s.id, "wdgEmail", e.target.value)} className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400" placeholder="WDG email (e.g. priya@wedogood.in)" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" disabled={!canSave} onClick={handleSave}>{link ? "Save Changes" : "Create Link"}</Button>
        </div>
      </div>
    </div>
  )
}
