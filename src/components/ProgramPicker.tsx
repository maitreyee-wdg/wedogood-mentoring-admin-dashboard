import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import type { Program } from "@/data/programsData"

export function ProgramPicker({ programs, value, onSelect, placeholder = "Search programs…", allowClear = true, className }: {
  programs: Program[]
  value: string
  onSelect: (programId: string) => void
  placeholder?: string
  allowClear?: boolean
  className?: string
}) {
  const [query, setQuery] = useState(programs.find(p => p.id === value)?.name ?? "")
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return programs
    return programs.filter(p => p.name.toLowerCase().includes(q) || p.organization.toLowerCase().includes(q))
  }, [programs, query])

  const select = (id: string) => {
    onSelect(id)
    setQuery(programs.find(p => p.id === id)?.name ?? "")
    setOpen(false)
  }
  const clear = () => { onSelect(""); setQuery(""); setOpen(false) }

  return (
    <div className={`relative ${className ?? ""}`}>
      <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
      <input
        className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-blue-400 bg-white"
        placeholder={placeholder}
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          {allowClear && (
            <button type="button" onMouseDown={clear}
              className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 border-b border-gray-100">
              — No Program —
            </button>
          )}
          {filtered.length === 0 ? (
            <p className="px-3 py-3 text-xs text-gray-400 italic text-center">No programs found</p>
          ) : filtered.map(p => (
            <button key={p.id} type="button" onMouseDown={() => select(p.id)}
              className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50">
              <span className="font-medium text-gray-800">{p.name}</span>
              <span className="text-gray-400"> · {p.organization}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
