import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bot, ChevronRight, History, Play, RotateCcw, Save } from "lucide-react"

const phases = [
  { id: "scoping", label: "Scoping", description: "Initial need assessment and qualification", color: "bg-blue-100 text-blue-700" },
  { id: "profiling", label: "Profiling", description: "Understanding mentee background and goals", color: "bg-purple-100 text-purple-700" },
  { id: "connection", label: "Connection & Support", description: "Post-match confirmation and pre-call prep", color: "bg-green-100 text-green-700" },
  { id: "first_call", label: "First Call", description: "Structured first call facilitation", color: "bg-orange-100 text-orange-700" },
  { id: "ongoing", label: "Ongoing", description: "Regular check-ins and engagement tracking", color: "bg-teal-100 text-teal-700" },
  { id: "closing", label: "Closing", description: "Goal review, feedback collection and closure", color: "bg-red-100 text-red-700" },
]

const mockPrompts: Record<string, string> = {
  scoping: `You are Mira, a friendly career mentoring assistant from WeDoGood. Your job is to understand what kind of help the user is looking for.

Start with a warm greeting and ask what area they'd like support in. Keep the conversation natural and conversational.

Available categories: Career guidance, Resume building, Interview prep, Skill development, Domain mentoring.

If the user is unsure, help them by asking about their goals and current situation. Qualify whether this is a mentoring need or a project/volunteering opportunity.`,

  profiling: `You are Mira from WeDoGood. The user has been qualified for mentoring support. Now gather their profile information naturally.

Collect: Name, educational background, current work status, key skills, location, and language preference.

Be conversational — don't make it feel like a form. Acknowledge each response before asking the next question.`,

  connection: `You are Mira from WeDoGood. A mentor has been matched with this user. Your job is to facilitate the connection.

1. Inform them warmly about their mentor match.
2. Share the mentor's brief profile highlights.
3. Confirm their interest in proceeding.
4. Suggest a time to connect.

Use a warm, encouraging tone. Make the mentee feel excited about the match.`,

  first_call: `You are Mira from WeDoGood. This message is sent before the first mentor-mentee call.

Send a prep message that includes:
- A reminder of the call details (time, mentor name)
- 2-3 conversation starters they can use
- A link to any relevant pre-read material
- Encouragement to be open and honest

Keep it brief and warm.`,

  ongoing: `You are Mira from WeDoGood. You are checking in after a mentoring session.

Ask:
1. Did the call happen?
2. How did it go? (if yes)
3. What was most helpful?
4. Any next steps planned?

If the call did not happen, understand why and flag for rescheduling if needed.`,

  closing: `You are Mira from WeDoGood. This engagement is approaching its natural close.

1. Acknowledge the journey the mentee has been on.
2. Ask for honest feedback on the program and their mentor.
3. Ask if their original goal was met.
4. Ask if they'd like to start a new engagement or refer a friend.

Be warm and celebratory. Make them feel proud of their progress.`,
}

export default function BotConfig() {
  const [activePhase, setActivePhase] = useState("scoping")
  const [prompts, setPrompts] = useState<Record<string, string>>(mockPrompts)
  const [editingPrompt, setEditingPrompt] = useState(mockPrompts["scoping"])
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<"prompts" | "health">("prompts")

  const handlePhaseSelect = (id: string) => {
    setActivePhase(id)
    setEditingPrompt(prompts[id] ?? "")
    setSaved(false)
  }

  const handleSave = () => {
    setPrompts((p) => ({ ...p, [activePhase]: editingPrompt }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    setEditingPrompt(mockPrompts[activePhase] ?? "")
  }

  const activePhaseData = phases.find((p) => p.id === activePhase)

  const healthSignals = [
    { label: "Call frequency", weight: 30, description: "How regularly calls are happening" },
    { label: "Call duration", weight: 20, description: "Average length of sessions" },
    { label: "Mentee feedback rating", weight: 25, description: "Ratings given by mentee post-call" },
    { label: "Response rate", weight: 15, description: "How quickly participants respond to Mira" },
    { label: "Goal milestone progress", weight: 10, description: "Completion of agreed milestones" },
  ]

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Bot Configuration</h1>
            <p className="text-sm text-gray-500">Configure Mira — the WhatsApp engagement assistant</p>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          {(["prompts", "health"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {tab === "prompts" ? "Skill Prompts" : "Health Score Config"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "prompts" ? (
        <div className="flex flex-1 overflow-hidden">
          {/* Phase list */}
          <div className="w-64 border-r border-gray-200 bg-white overflow-y-auto shrink-0">
            <div className="p-3 space-y-1">
              {phases.map((phase) => (
                <button key={phase.id} onClick={() => handlePhaseSelect(phase.id)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-colors ${activePhase === phase.id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50 border border-transparent"}`}>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${phase.color}`}>{phase.label}</span>
                    </div>
                    <p className="text-xs text-gray-500">{phase.description}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 ${activePhase === phase.id ? "text-blue-600" : "text-gray-300"}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Prompt editor */}
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0">
              <div>
                <div className={`inline-block text-xs px-2 py-0.5 rounded font-medium mb-1 ${activePhaseData?.color}`}>{activePhaseData?.label}</div>
                <p className="text-xs text-gray-500">{activePhaseData?.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium">
                  <History className="w-3.5 h-3.5" />History
                </button>
                <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium">
                  <Play className="w-3.5 h-3.5" />Test
                </button>
                <Button size="sm" variant="outline" onClick={handleReset}>
                  <RotateCcw className="w-3.5 h-3.5" />Reset
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="w-3.5 h-3.5" />{saved ? "Saved ✓" : "Save"}
                </Button>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-hidden">
              <textarea
                className="w-full h-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-sm font-mono text-gray-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-none leading-relaxed"
                value={editingPrompt}
                onChange={(e) => { setEditingPrompt(e.target.value); setSaved(false) }}
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl">
            <p className="text-sm text-gray-600 mb-6">Adjust the weight of each engagement signal that contributes to the overall health score. Weights must total 100%.</p>
            <div className="space-y-4">
              {healthSignals.map((signal, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{signal.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{signal.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="number" min={0} max={100} defaultValue={signal.weight}
                        className="w-16 text-sm border border-gray-200 rounded-lg px-2 py-1 text-center outline-none focus:border-blue-400 font-medium" />
                      <span className="text-sm text-gray-400">%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${signal.weight}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Button>Save Health Score Config</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
