import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

type Period = "AM" | "PM"

function to12Hour(time24: string): { hour: number; minute: number; period: Period } {
  if (!time24) return { hour: 9, minute: 0, period: "AM" }
  const [h, m] = time24.split(":").map(Number)
  const period: Period = h >= 12 ? "PM" : "AM"
  let hour = h % 12
  if (hour === 0) hour = 12
  return { hour, minute: m, period }
}

function to24Hour(hour: number, minute: number, period: Period): string {
  let h = hour % 12
  if (period === "PM") h += 12
  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

function formatDisplay(time24: string): string {
  if (!time24) return ""
  const { hour, minute, period } = to12Hour(time24)
  return `${hour}:${String(minute).padStart(2, "0")} ${period}`
}

const CENTER = 100
const NUMBER_RADIUS = 72

function pointForIndex(i: number, radius: number) {
  const angle = i * (2 * Math.PI / 12)
  return { x: CENTER + radius * Math.sin(angle), y: CENTER - radius * Math.cos(angle) }
}

const HOURS = Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i))
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5)

function ClockTimePickerModal({ value, onSave, onClose }: { value: string; onSave: (v: string) => void; onClose: () => void }) {
  const initial = to12Hour(value)
  const [hour, setHour] = useState(initial.hour)
  const [minute, setMinute] = useState(initial.minute)
  const [period, setPeriod] = useState<Period>(initial.period)
  const [mode, setMode] = useState<"hour" | "minute">("hour")

  const selectedIndex = mode === "hour" ? HOURS.indexOf(hour) : MINUTES.indexOf(minute)
  const handPoint = pointForIndex(selectedIndex, NUMBER_RADIUS)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-xl shadow-xl w-80 p-5">
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="flex items-center gap-1 text-3xl font-semibold">
            <button onClick={() => setMode("hour")} className={mode === "hour" ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}>{hour}</button>
            <span className="text-gray-300">:</span>
            <button onClick={() => setMode("minute")} className={mode === "minute" ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}>{String(minute).padStart(2, "0")}</button>
          </div>
          <div className="flex flex-col text-xs font-semibold border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => setPeriod("AM")} className={`px-3 py-1.5 ${period === "AM" ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>AM</button>
            <button onClick={() => setPeriod("PM")} className={`px-3 py-1.5 border-t border-gray-200 ${period === "PM" ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>PM</button>
          </div>
        </div>

        <svg viewBox="0 0 200 200" className="w-full aspect-square select-none">
          <circle cx={CENTER} cy={CENTER} r={92} className="fill-gray-50" />
          <line x1={CENTER} y1={CENTER} x2={handPoint.x} y2={handPoint.y} stroke="#2563eb" strokeWidth={2} />
          <circle cx={CENTER} cy={CENTER} r={3.5} fill="#2563eb" />
          {(mode === "hour" ? HOURS : MINUTES).map((val) => {
            const i = mode === "hour" ? HOURS.indexOf(val) : MINUTES.indexOf(val)
            const p = pointForIndex(i, NUMBER_RADIUS)
            const selected = mode === "hour" ? val === hour : val === minute
            return (
              <g
                key={val}
                onClick={() => {
                  if (mode === "hour") { setHour(val); setMode("minute") }
                  else setMinute(val)
                }}
                className="cursor-pointer"
              >
                {selected && <circle cx={p.x} cy={p.y} r={14} fill="#2563eb" />}
                <circle cx={p.x} cy={p.y} r={14} fill="transparent" />
                <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="central" className={`text-[13px] font-medium pointer-events-none ${selected ? "fill-white" : "fill-gray-700"}`}>
                  {mode === "minute" ? String(val).padStart(2, "0") : val}
                </text>
              </g>
            )
          })}
        </svg>

        <div className="flex gap-2 mt-5">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={() => onSave(to24Hour(hour, minute, period))}>Done</Button>
        </div>
      </div>
    </div>
  )
}

export function ClockTimeInput({ value, onChange, className }: { value: string; onChange: (v: string) => void; className?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className ?? "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-left flex items-center gap-2 outline-none focus:border-blue-400 bg-white hover:border-blue-300"}
      >
        <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className={value ? "text-gray-900" : "text-gray-400"}>{value ? formatDisplay(value) : "Select time"}</span>
      </button>
      {open && (
        <ClockTimePickerModal
          value={value}
          onSave={(v) => { onChange(v); setOpen(false) }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
