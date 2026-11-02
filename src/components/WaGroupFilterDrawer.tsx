import { useState } from "react"
import { X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EMPTY_WA_FILTERS, type WaGroupFilters } from "@/lib/waGroupFilters"
import { ALL_STATUSES } from "@/data/requestsData"
import { mockWaNumbers, numberLabel, type MemberStatus } from "@/data/waGroupsData"

const LABEL = "text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5"
const FIELD = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-blue-400 bg-white"

const MENTEE_STATUSES: MemberStatus[] = ["Link sent", "Joined", "Left", "Did not join"]
const MENTOR_STATUSES: MemberStatus[] = ["Link sent", "Joined"]

function MultiSelect<T extends string>({ options, value, onChange, placeholder, renderLabel }: {
  options: T[]
  value: T[]
  onChange: (v: T[]) => void
  placeholder: string
  renderLabel?: (v: T) => string
}) {
  const [open, setOpen] = useState(false)
  const label = (v: T) => renderLabel ? renderLabel(v) : v
  const toggle = (v: T) => onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v])
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`${FIELD} flex items-center justify-between text-left ${open ? "border-blue-400" : ""}`}>
        <span className={`truncate ${value.length ? "text-gray-800" : "text-gray-400"}`}>
          {value.length ? value.map(label).join(", ") : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          {options.length === 0 && <p className="px-3 py-2 text-xs text-gray-400">No options</p>}
          {options.map(o => (
            <label key={o} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
              <input type="checkbox" checked={value.includes(o)} onChange={() => toggle(o)} />
              {label(o)}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export function WaGroupFilterDrawer({ filters, options, onApply, onClose }: {
  filters: WaGroupFilters
  options: { menteeOrgs: string[]; menteeGroups: string[]; mentorOrgs: string[]; mentorGroups: string[] }
  onApply: (f: WaGroupFilters) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState<WaGroupFilters>(filters)
  const set = <K extends keyof WaGroupFilters>(k: K, v: WaGroupFilters[K]) => setDraft(d => ({ ...d, [k]: v }))
  const aiNumbers = mockWaNumbers.filter(n => n.role === "AI number")

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/20" onClick={onClose}>
      <div className="w-[420px] h-full bg-white shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Filters</h2>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <label className={LABEL}>Mentee name</label>
            <input className={FIELD} placeholder="Type a mentee's name…" value={draft.menteeName} onChange={e => set("menteeName", e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Mentor name</label>
            <input className={FIELD} placeholder="Type a mentor's name…" value={draft.mentorName} onChange={e => set("mentorName", e.target.value)} />
            <p className="text-[11px] text-gray-400 mt-1">Matches current and past mentors in the group.</p>
          </div>
          <div>
            <label className={LABEL}>Request status</label>
            <MultiSelect options={ALL_STATUSES} value={draft.requestStatuses} onChange={v => set("requestStatuses", v)} placeholder="Select status…" />
          </div>
          <div>
            <label className={LABEL}>Mentee org</label>
            <MultiSelect options={options.menteeOrgs} value={draft.menteeOrgs} onChange={v => set("menteeOrgs", v)} placeholder="Select org(s)…" />
          </div>
          <div>
            <label className={LABEL}>Mentee group</label>
            <MultiSelect options={options.menteeGroups} value={draft.menteeGroups} onChange={v => set("menteeGroups", v)} placeholder="Select group(s)…" />
          </div>
          <div>
            <label className={LABEL}>Volunteer org</label>
            <MultiSelect options={options.mentorOrgs} value={draft.mentorOrgs} onChange={v => set("mentorOrgs", v)} placeholder="Select org(s)…" />
          </div>
          <div>
            <label className={LABEL}>Volunteer group</label>
            <MultiSelect options={options.mentorGroups} value={draft.mentorGroups} onChange={v => set("mentorGroups", v)} placeholder="Select group(s)…" />
          </div>
          <div>
            <label className={LABEL}>Mentee status in group</label>
            <MultiSelect options={MENTEE_STATUSES} value={draft.menteeStatuses} onChange={v => set("menteeStatuses", v)} placeholder="Select status…" />
          </div>
          <div>
            <label className={LABEL}>Current mentor status in group</label>
            <MultiSelect options={MENTOR_STATUSES} value={draft.mentorStatuses} onChange={v => set("mentorStatuses", v)} placeholder="Select status…" />
          </div>
          <div>
            <label className={LABEL}>Ops team number</label>
            <MultiSelect options={aiNumbers.map(n => n.id)} value={draft.aiNumbers} onChange={v => set("aiNumbers", v)}
              placeholder="Select number(s)…" renderLabel={numberLabel} />
          </div>
          <div>
            <label className={LABEL}>Admin takeover</label>
            <select className={FIELD} value={draft.takeover} onChange={e => set("takeover", e.target.value as WaGroupFilters["takeover"])}>
              <option value="all">All</option>
              <option value="on">Takeover on</option>
              <option value="off">AI active</option>
            </select>
          </div>
          <div>
            <label className={LABEL}>Group created</label>
            <select className={FIELD} value={draft.createdWithinDays} onChange={e => set("createdWithinDays", e.target.value as WaGroupFilters["createdWithinDays"])}>
              <option value="all">Select range…</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <Button variant="outline" className="flex-1" onClick={() => setDraft(EMPTY_WA_FILTERS)}>Reset</Button>
          <Button className="flex-1" onClick={() => onApply(draft)}>Apply Filters</Button>
        </div>
      </div>
    </div>
  )
}
