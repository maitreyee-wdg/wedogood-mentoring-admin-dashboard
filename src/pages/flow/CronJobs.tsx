import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarClock, Plus, Play, Pause, Pencil, X } from "lucide-react"

interface CronJob {
  id: string
  name: string
  description: string
  schedule: string
  scheduleLabel: string
  template: string
  targetAudience: "All Mentors" | "All Mentees" | "Active Engagements" | "Pending Orientation" | "Custom"
  status: "Active" | "Paused"
  lastRun?: string
  nextRun: string
  runCount: number
}

const mockCronJobs: CronJob[] = [
  {
    id: "CJ-001",
    name: "Weekly Orientation Reminder",
    description: "Remind mentors with pending orientation to complete it",
    schedule: "0 10 * * MON",
    scheduleLabel: "Every Monday at 10:00 AM",
    template: "Complete Orientation",
    targetAudience: "Pending Orientation",
    status: "Active",
    lastRun: "2026-06-02",
    nextRun: "2026-06-09",
    runCount: 12,
  },
  {
    id: "CJ-002",
    name: "Post-Call Feedback (Mentor)",
    description: "Ask mentors for feedback 24 hours after a session",
    schedule: "0 9 * * *",
    scheduleLabel: "Daily at 9:00 AM",
    template: "Feedback for Request Call",
    targetAudience: "Active Engagements",
    status: "Active",
    lastRun: "2026-06-03",
    nextRun: "2026-06-04",
    runCount: 87,
  },
  {
    id: "CJ-003",
    name: "Confirm Call Happened",
    description: "Check with mentees if their scheduled call took place",
    schedule: "0 12 * * *",
    scheduleLabel: "Daily at 12:00 PM",
    template: "Confirm If Call Happened",
    targetAudience: "Active Engagements",
    status: "Active",
    lastRun: "2026-06-03",
    nextRun: "2026-06-04",
    runCount: 54,
  },
  {
    id: "CJ-004",
    name: "Monthly Profile Completion Nudge",
    description: "Remind volunteers with incomplete profiles to finish them",
    schedule: "0 11 1 * *",
    scheduleLabel: "1st of every month at 11:00 AM",
    template: "Complete Profile",
    targetAudience: "All Mentors",
    status: "Paused",
    lastRun: "2026-05-01",
    nextRun: "2026-07-01",
    runCount: 5,
  },
  {
    id: "CJ-005",
    name: "Referral Campaign",
    description: "Ask active volunteers to recommend friends who could mentor",
    schedule: "0 10 15 * *",
    scheduleLabel: "15th of every month at 10:00 AM",
    template: "Recommend a Friend",
    targetAudience: "All Mentors",
    status: "Paused",
    lastRun: "2026-05-15",
    nextRun: "2026-06-15",
    runCount: 3,
  },
]

function AddCronModal({ onSave, onClose }: { onSave: (c: Omit<CronJob, "id" | "runCount" | "lastRun">) => void; onClose: () => void }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [schedule, setSchedule] = useState("0 10 * * MON")
  const [scheduleLabel, setScheduleLabel] = useState("")
  const [template, setTemplate] = useState("Complete Profile")
  const [audience, setAudience] = useState<CronJob["targetAudience"]>("All Mentors")

  const handleSave = () => {
    if (!name || !schedule) return
    onSave({ name, description, schedule, scheduleLabel: scheduleLabel || schedule, template, targetAudience: audience, status: "Active", nextRun: "TBD" })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[480px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Add Cron Job</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Job Name *</label>
            <input className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Weekly Reminder" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Description</label>
            <input className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this job do?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Cron Schedule *</label>
              <input className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 font-mono" value={schedule} onChange={(e) => setSchedule(e.target.value)} placeholder="0 10 * * MON" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Human Readable</label>
              <input className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400" value={scheduleLabel} onChange={(e) => setScheduleLabel(e.target.value)} placeholder="Every Monday at 10am" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">WhatsApp Template</label>
            <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white" value={template} onChange={(e) => setTemplate(e.target.value)}>
              <option>Complete Profile</option>
              <option>Complete Orientation</option>
              <option>Recommend a Friend</option>
              <option>Generic Feedback</option>
              <option>Confirm Interest in Engagement</option>
              <option>Relevant Pre-Read</option>
              <option>Confirm If Call Happened</option>
              <option>Feedback for Request Call</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Target Audience</label>
            <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white" value={audience} onChange={(e) => setAudience(e.target.value as CronJob["targetAudience"])}>
              <option>All Mentors</option>
              <option>All Mentees</option>
              <option>Active Engagements</option>
              <option>Pending Orientation</option>
              <option>Custom</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSave}>Create Job</Button>
        </div>
      </div>
    </div>
  )
}

export default function CronJobs() {
  const [jobs, setJobs] = useState<CronJob[]>(mockCronJobs)
  const [showAddModal, setShowAddModal] = useState(false)

  const toggleStatus = (id: string) => {
    setJobs((p) => p.map((j) => j.id === id ? { ...j, status: j.status === "Active" ? "Paused" : "Active" } : j))
  }

  const activeCount = jobs.filter((j) => j.status === "Active").length

  return (
    <div className="h-full overflow-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
            <CalendarClock className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Cron Jobs</h1>
            <p className="text-sm text-gray-500">{activeCount} of {jobs.length} jobs active</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" />Add Job
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Active Jobs", value: activeCount, color: "text-green-600" },
          { label: "Paused", value: jobs.filter((j) => j.status === "Paused").length, color: "text-yellow-600" },
          { label: "Total Runs", value: jobs.reduce((s, j) => s + j.runCount, 0), color: "text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Jobs list */}
      <div className="space-y-3">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900 text-sm">{job.name}</p>
                  <Badge variant={job.status === "Active" ? "success" : "warning"}>{job.status}</Badge>
                </div>
                <p className="text-xs text-gray-500 mb-3">{job.description}</p>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  <div>
                    <span className="font-medium text-gray-700">Schedule: </span>
                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{job.schedule}</code>
                    <span className="ml-1 text-gray-400">({job.scheduleLabel})</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Template: </span>
                    <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium">{job.template}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Audience: </span>
                    {job.targetAudience}
                  </div>
                </div>
                <div className="flex gap-4 mt-2 text-xs text-gray-400">
                  {job.lastRun && <span>Last run: {job.lastRun}</span>}
                  <span>Next run: {job.nextRun}</span>
                  <span>{job.runCount} total runs</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleStatus(job.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${job.status === "Active" ? "border-yellow-200 text-yellow-700 hover:bg-yellow-50" : "border-green-200 text-green-700 hover:bg-green-50"}`}>
                  {job.status === "Active" ? <><Pause className="w-3.5 h-3.5" />Pause</> : <><Play className="w-3.5 h-3.5" />Resume</>}
                </button>
                <button className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <AddCronModal
          onSave={(data) => { setJobs((p) => [...p, { ...data, id: `CJ-${Date.now()}`, runCount: 0 }]); setShowAddModal(false) }}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}
