import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  BrainCircuit, X, Lock, Pencil, Plus, ChevronRight,
  Wrench, GitBranch, Bot, Zap, Save, RotateCcw, Upload,
  Pause, Play, Trash2, Pencil as PencilIcon, RefreshCw,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type AgentRole = "orchestrator" | "background" | "rule-based"

interface AgentTool {
  name: string
  description: string
}

interface Agent {
  id: string
  shortId: string        // A1–A7
  name: string
  role: AgentRole
  roleLabel: string
  description: string
  prompt: string
  contextFiles?: string[]   // uploaded file names
  tools: string[]
  accessTo: string[]    // other agent shortIds
  isPredefined: boolean
  color: {
    bg: string
    border: string
    badge: string
    text: string
    dot: string
  }
}

interface Workflow {
  id: string
  name: string
  purpose: string
  trigger: string
  agentChain: string[]   // shortIds in order
  status: "Active" | "Paused"
  isPredefined?: boolean  // predefined workflows cannot be deleted
}

// ─── Workflow trigger options (mirrors system triggers) ───────────────────────

const WORKFLOW_TRIGGER_OPTIONS = [
  "New mentee sends first WhatsApp message",
  "New mentee registered on platform",
  "Mentee profile marked complete",
  "Mentor accepts a match request",
  "Session marked 'completed' in system",
  "Support keyword or chip detected in any message",
  "Mentee status remains 'Profile unfinished' for 4 hours",
  "Mentee status remains 'Request chat unfinished' for 4 hours",
  "Request status changes to 'Mentor matched'",
  "Request status changes to 'Number accessed'",
  "Mentoring request has 4 days remaining",
  "30 days since last mentee request created",
  "Volunteer status remains 'Orientation pending' for 4 hours",
  "Volunteer has orientation slot today",
]

// ─── Tool catalogue ───────────────────────────────────────────────────────────

const ALL_TOOLS: AgentTool[] = [
  { name: "get_mentee_context", description: "Loads full mentee profile, current phase, and metadata from DB for context injection." },
  { name: "get_session_history", description: "Retrieves the last N messages of the current WhatsApp session for the user." },
  { name: "get_quick_replies", description: "Returns platform-appropriate chip/button options for the current conversation state." },
  { name: "send_message", description: "Sends a WhatsApp message (text, chips, or template) to the mentee via the messaging gateway." },
  { name: "extract_profile_fields", description: "Parses the latest message and infers structured profile fields (goals, skills, background, etc.)." },
  { name: "update_working_profile", description: "Writes extracted fields into the in-progress working profile document in DB." },
  { name: "infer_signals", description: "Infers soft signals: confidence level, clarity of need, and mentor expectation type from message tone." },
  { name: "identify_missing_fields", description: "Diffs the current working profile against the required schema and returns a list of missing fields." },
  { name: "rank_next_gap", description: "Prioritises the list of missing fields by importance and conversation context to pick the next question." },
  { name: "check_completion_threshold", description: "Evaluates whether the working profile has reached the minimum completeness threshold to proceed." },
  { name: "generate_summary", description: "Writes a 2–4 sentence human-readable summary of the mentee profile for the matching team." },
  { name: "write_summary_to_db", description: "Persists the generated narrative summary to the mentee record in the database." },
  { name: "format_json_profile", description: "Converts the completed working profile into the final structured JSON schema used for matching." },
  { name: "extract_mentor_tags", description: "Derives recommended mentor skill/experience tags from the completed profile for search indexing." },
  { name: "write_json_to_db", description: "Stores the final JSON profile and mentor tags to DB alongside the narrative summary." },
  { name: "get_feedback_questions", description: "Returns the fixed ordered set of 5 post-session feedback questions with chip answer options." },
  { name: "write_feedback_record", description: "Writes each structured feedback answer directly to the DB as the user responds." },
  { name: "update_session_status", description: "Marks the session as feedback-complete and schedules the next check-in prompt." },
  { name: "create_support_ticket", description: "Creates a support ticket record in the admin system with conversation context attached." },
  { name: "set_human_takeover", description: "Sets human_takeover = true on the conversation, pausing all bot responses until resolved." },
  { name: "notify_admin_team", description: "Sends a real-time alert to the admin team via internal channel with the ticket details." },
]

// ─── Agent data ───────────────────────────────────────────────────────────────

const AGENTS: Agent[] = [
  {
    id: "agent-a1", shortId: "A1",
    name: "Conversation Agent",
    role: "orchestrator",
    roleLabel: "User-facing · always on · orchestrator",
    description: "Only agent the mentee talks to. Opens with context, asks questions, offers chips, maintains tone. Checks human_takeover flag before every reply.",
    prompt: `You are Mira, a warm and supportive career mentoring assistant from WeDoGood.

Your job is to have a natural, friendly conversation with the mentee to understand their background, goals, and what kind of mentor would help them most.

Always:
- Start by greeting the user by name if available in context
- Ask one question at a time
- Mirror the user's language (English or Romanized Hindi)
- Offer 2–3 chip options where possible to reduce typing friction
- Keep messages short (under 3 sentences)
- Check human_takeover flag before every reply — if true, send holding message only

Never:
- Ask multiple questions at once
- Use jargon or overly formal language
- Make promises about specific mentors`,
    contextFiles: ["mentee_profile_schema.json"],
    tools: ["get_mentee_context", "get_session_history", "get_quick_replies", "send_message"],
    accessTo: ["A2", "A3", "A7"],
    isPredefined: true,
    color: { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-600", text: "text-blue-700", dot: "bg-blue-500" },
  },
  {
    id: "agent-a2", shortId: "A2",
    name: "Profile Extraction",
    role: "background",
    roleLabel: "Background · silent · runs after every message",
    description: "Reads latest message + full history. Extracts structured fields. Infers confidence, clarity, mentor expectation. Updates working profile. Calculates completion score.",
    prompt: `You are a silent data extraction agent. You never speak to the user.

After every message from the mentee, analyse the full conversation history and extract or update the following structured fields where evidence exists:
- Current role, company, years of experience
- Education level and field
- Career goals (short-term and long-term)
- Specific challenge or problem they need help with
- Communication style preference
- Confidence level (1–5 inferred)
- Clarity of need (high / medium / low)
- Expected mentor type (hands-on / advisory / network)

Only update fields when you have clear evidence. Do not infer beyond what is said.
Return structured JSON only — no prose.`,
    tools: ["extract_profile_fields", "update_working_profile", "infer_signals"],
    accessTo: ["A3"],
    isPredefined: true,
    color: { bg: "bg-violet-50", border: "border-violet-200", badge: "bg-violet-600", text: "text-violet-700", dot: "bg-violet-500" },
  },
  {
    id: "agent-a3", shortId: "A3",
    name: "Gap Analysis",
    role: "background",
    roleLabel: "Background · decides what to ask next",
    description: "Receives updated working profile from A2. Diffs against required schema. Ranks gaps by priority. Passes next question to A1 OR fires completion signal to A4 and A5.",
    prompt: `You are a silent gap analysis agent. You never speak to the user.

Given the current working profile state, identify what critical information is still missing for mentee–mentor matching.

Priority order for missing fields:
1. Specific challenge / scoped need (highest priority)
2. Career goal clarity
3. Preferred engagement style
4. Availability and time zone
5. Additional context (lowest priority)

If all priority-1 through priority-3 fields are filled with high confidence, fire the completion signal.
Otherwise, return the single next gap and a suggested question phrasing for A1 to use.`,
    tools: ["identify_missing_fields", "rank_next_gap", "check_completion_threshold"],
    accessTo: ["A1", "A4", "A5"],
    isPredefined: true,
    color: { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-600", text: "text-amber-700", dot: "bg-amber-500" },
  },
  {
    id: "agent-a4", shortId: "A4",
    name: "Profile Synthesis",
    role: "background",
    roleLabel: "Fires once · at completion threshold",
    description: "Takes completed working profile + full conversation. Writes 2–4 sentence human-readable summary for the matching team. Stores to DB.",
    prompt: `You are a profile synthesis agent. You fire once when the mentee profile reaches completion threshold.

Using the completed working profile JSON and the full conversation history, write a concise 2–4 sentence summary for the WeDoGood matching team.

The summary should cover:
- Who the mentee is (role, background)
- What they are trying to achieve
- What specific challenge they need help with
- What kind of mentor would suit them best

Write in third person, professionally. Keep it under 80 words. This will be read by a human matcher.`,
    tools: ["generate_summary", "write_summary_to_db"],
    accessTo: [],
    isPredefined: true,
    color: { bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-500", text: "text-orange-700", dot: "bg-orange-400" },
  },
  {
    id: "agent-a5", shortId: "A5",
    name: "JSON Formatter",
    role: "background",
    roleLabel: "Fires once · at completion threshold",
    description: "Formats completed working profile into final structured JSON schema. Extracts recommended mentor tags. Stores to DB alongside summary.",
    prompt: `You are a JSON formatting agent. You fire once when the mentee profile reaches completion threshold.

Convert the completed working profile into the final structured JSON schema required for the matching engine. Ensure all fields conform to the schema spec exactly.

Also extract 3–7 mentor skill/experience tags that would best serve this mentee based on their profile. Tags should be drawn from the canonical tag list only.

Return only valid JSON. No prose, no markdown, no explanations.`,
    contextFiles: ["mentor_tags_canonical.json"],
    tools: ["format_json_profile", "extract_mentor_tags", "write_json_to_db"],
    accessTo: [],
    isPredefined: true,
    color: { bg: "bg-green-50", border: "border-green-200", badge: "bg-green-600", text: "text-green-700", dot: "bg-green-500" },
  },
  {
    id: "agent-a6", shortId: "A6",
    name: "Feedback Agent",
    role: "rule-based",
    roleLabel: "Rule-based · no LLM · state machine",
    description: "Fixed sequence of 5 questions with chip options. Writes structured answer per question directly to DB. No inference. Free text stored raw. Triggers next session prompt on completion.",
    prompt: `[Rule-based agent — no LLM inference used]

This agent runs as a deterministic state machine. It does not use language model inference.

Flow:
1. Send question 1 with chip options → wait for response → write to DB → advance state
2. Send question 2... (repeat for all 5 questions)
3. On question 5 completion → trigger next session scheduling prompt via A1
4. Free-text answers are stored verbatim with no interpretation

Questions are loaded from the feedback_questions config. Do not deviate from the script.`,
    tools: ["get_feedback_questions", "write_feedback_record", "update_session_status"],
    accessTo: ["A1"],
    isPredefined: true,
    color: { bg: "bg-teal-50", border: "border-teal-200", badge: "bg-teal-600", text: "text-teal-700", dot: "bg-teal-500" },
  },
  {
    id: "agent-a7", shortId: "A7",
    name: "Support Escalation",
    role: "rule-based",
    roleLabel: "Rule-based · creates ticket · always A1",
    description: "Intercepts support chip or keyword. Creates ticket. Sets human_takeover = true on conversation. Notifies admins. Sends fixed holding message. Admin resolves and flips flag back.",
    prompt: `[Rule-based agent — minimal LLM use]

Trigger conditions (intercept from A1):
- User taps "I need help" chip
- Message contains keywords: help, problem, issue, complaint, stuck, wrong, error

On trigger:
1. Extract conversation context snapshot
2. Create support ticket with context
3. Set human_takeover = true on conversation record
4. Send fixed holding message: "I've flagged this for our team and someone will be in touch shortly. In the meantime, feel free to share any more details here."
5. Notify admin team with ticket link

Do not attempt to resolve the issue. Do not generate custom responses. Use fixed scripts only.`,
    tools: ["create_support_ticket", "set_human_takeover", "notify_admin_team"],
    accessTo: ["A1"],
    isPredefined: true,
    color: { bg: "bg-rose-50", border: "border-rose-200", badge: "bg-rose-600", text: "text-rose-700", dot: "bg-rose-500" },
  },
]

const WORKFLOWS: Workflow[] = [
  {
    id: "wf-1",
    name: "Mentee Onboarding",
    purpose: "Guide a new mentee from first message through completed profile and mentor matching.",
    trigger: "New mentee sends first WhatsApp message",
    agentChain: ["A1", "A2", "A3", "A4", "A5"],
    status: "Active",
    isPredefined: true,
  },
  {
    id: "wf-2",
    name: "Post-Session Feedback",
    purpose: "Collect structured feedback after each mentoring session and schedule the next.",
    trigger: "Session marked 'completed' in system",
    agentChain: ["A1", "A6"],
    status: "Active",
    isPredefined: true,
  },
  {
    id: "wf-3",
    name: "Support Escalation",
    purpose: "Intercept distress signals and hand off to a human admin immediately.",
    trigger: "Support keyword or chip detected in any message",
    agentChain: ["A1", "A7"],
    status: "Active",
    isPredefined: true,
  },
]

const ROLE_META: Record<AgentRole, { label: string; color: string }> = {
  orchestrator: { label: "Orchestrator", color: "bg-blue-100 text-blue-700" },
  background:   { label: "Background",   color: "bg-violet-100 text-violet-700" },
  "rule-based": { label: "Rule-based",   color: "bg-gray-100 text-gray-600" },
}

// ─── Agent Card ───────────────────────────────────────────────────────────────

function AgentCard({ agent, onClick }: { agent: Agent; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border-2 ${agent.color.border} rounded-xl p-4 cursor-pointer hover:shadow-md transition-all group`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md text-white ${agent.color.badge}`}>
            {agent.shortId}
          </span>
          <span className="font-semibold text-sm text-gray-900">{agent.name}</span>
        </div>
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {agent.isPredefined && <Lock className="w-3 h-3 text-gray-400" />}
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>

      {/* Role */}
      <p className={`text-[10px] font-medium mb-2 ${agent.color.text}`}>{agent.roleLabel}</p>

      {/* Description */}
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{agent.description}</p>
    </div>
  )
}

// ─── Agent Detail Pane ────────────────────────────────────────────────────────

function AgentPane({ agent, agents, onClose, onSave }: {
  agent: Agent
  agents: Agent[]
  onClose: () => void
  onSave: (id: string, updates: Partial<Agent>) => void
}) {
  const [editing, setEditing] = useState(false)
  const [prompt, setPrompt] = useState(agent.prompt)
  const [description, setDescription] = useState(agent.description)
  const [contextFiles, setContextFiles] = useState<string[]>(agent.contextFiles ?? [])
  const [selectedTools, setSelectedTools] = useState<string[]>(agent.tools)
  const [accessTo, setAccessTo] = useState<string[]>(agent.accessTo)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const MAX_TOTAL = 10 * 1024 * 1024
    const totalSize = files.reduce((sum, f) => sum + f.size, 0)
    if (totalSize > MAX_TOTAL) { alert("Total file size exceeds 10 MB. Please select smaller files."); return }
    setContextFiles((prev) => [...prev, ...files.map((f) => f.name)])
    e.target.value = ""
  }

  const handleSave = () => {
    onSave(agent.id, { prompt, description, contextFiles, tools: selectedTools, accessTo })
    setEditing(false)
  }

  const handleReset = () => {
    setPrompt(agent.prompt)
    setDescription(agent.description)
    setContextFiles(agent.contextFiles ?? [])
    setSelectedTools(agent.tools)
    setAccessTo(agent.accessTo)
    setEditing(false)
  }

  const toggleTool = (t: string) => {
    setSelectedTools((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])
  }

  const toggleAccess = (sid: string) => {
    setAccessTo((prev) => prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid])
  }

  const roleMeta = ROLE_META[agent.role]
  const inputCls = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white"
  const labelCls = "text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5"

  return (
    <div className="w-[480px] shrink-0 border-l border-gray-200 bg-white flex flex-col h-full">
      {/* Header */}
      <div className={`px-5 py-4 border-b border-gray-100 ${agent.color.bg}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md text-white ${agent.color.badge}`}>
              {agent.shortId}
            </span>
            <h2 className="font-semibold text-gray-900">{agent.name}</h2>
            {agent.isPredefined && (
              <span className="flex items-center gap-1 text-[10px] text-gray-400 border border-gray-200 bg-white rounded px-1.5 py-0.5">
                <Lock className="w-2.5 h-2.5" /> Predefined
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${roleMeta.color}`}>
          {roleMeta.label}
        </span>
        <p className={`text-xs mt-1.5 ${agent.color.text}`}>{agent.roleLabel}</p>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

        {/* Description */}
        <div>
          <label className={labelCls}>What it does <span className="text-gray-400 normal-case font-normal">(For Human understanding only)</span></label>
          {editing
            ? <textarea className={inputCls + " resize-none h-16"} value={description} onChange={(e) => setDescription(e.target.value)} />
            : <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
          }
        </div>

        {/* Prompt */}
        <div>
          <label className={labelCls}>Prompt</label>
          {editing
            ? <textarea className={inputCls + " resize-none h-52 font-mono text-xs"} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
            : (
              <pre className="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-lg p-3 whitespace-pre-wrap leading-relaxed max-h-52 overflow-y-auto font-mono">
                {prompt}
              </pre>
            )
          }
        </div>

        {/* Context Files */}
        <div>
          <label className={labelCls}>Context Files <span className="text-gray-400 normal-case font-normal">(max 10 MB total)</span></label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {contextFiles.length > 0
              ? contextFiles.map((f, i) => (
                  <span key={i} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg font-mono">
                    {f}
                    {editing && <button onClick={() => setContextFiles((p) => p.filter((_, idx) => idx !== i))}><X className="w-3 h-3 text-gray-400 hover:text-red-400" /></button>}
                  </span>
                ))
              : <span className="text-xs text-gray-400 italic">No context files</span>
            }
          </div>
          {editing && (
            <>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />
              <button onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs border border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 px-3 py-1.5 rounded-lg transition-colors">
                <Upload className="w-3.5 h-3.5" /> Upload files
              </button>
            </>
          )}
        </div>

        {/* Tools */}
        <div>
          <label className={labelCls}>Tools</label>
          {editing
            ? (
              <div className="flex flex-wrap gap-1.5">
                {ALL_TOOLS.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => toggleTool(t.name)}
                    className={`text-[11px] px-2 py-0.5 rounded font-mono border transition-colors ${
                      selectedTools.includes(t.name)
                        ? `${agent.color.bg} ${agent.color.border} ${agent.color.text}`
                        : "bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            )
            : (
              <div className="flex flex-wrap gap-1.5">
                {agent.tools.map((t) => (
                  <span key={t} className={`text-[11px] px-2 py-0.5 rounded font-mono border ${agent.color.bg} ${agent.color.border} ${agent.color.text}`}>
                    {t}
                  </span>
                ))}
              </div>
            )
          }
        </div>

        {/* Access to other agents */}
        <div>
          <label className={labelCls}>Access to agents</label>
          {editing
            ? (
              <div className="flex flex-wrap gap-2">
                {agents.filter((a) => a.id !== agent.id).map((a) => (
                  <button
                    key={a.shortId}
                    onClick={() => toggleAccess(a.shortId)}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                      accessTo.includes(a.shortId)
                        ? `${a.color.bg} ${a.color.border} ${a.color.text}`
                        : "bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    <span className={`text-[10px] font-bold px-1 rounded text-white ${a.color.badge}`}>{a.shortId}</span>
                    {a.name}
                  </button>
                ))}
              </div>
            )
            : (
              agent.accessTo.length > 0
                ? (
                  <div className="flex flex-wrap gap-2">
                    {agent.accessTo.map((sid) => {
                      const a = agents.find((x) => x.shortId === sid)
                      if (!a) return null
                      return (
                        <span key={sid} className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border ${a.color.bg} ${a.color.border} ${a.color.text} font-medium`}>
                          <span className={`text-[10px] font-bold px-1 rounded text-white ${a.color.badge}`}>{sid}</span>
                          {a.name}
                        </span>
                      )
                    })}
                  </div>
                )
                : <span className="text-xs text-gray-400 italic">No direct agent access</span>
            )
          }
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
        {editing ? (
          <>
            <Button variant="outline" size="sm" className="flex-1" onClick={handleReset}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Discard
            </Button>
            <Button size="sm" className="flex-1" onClick={handleSave}>
              <Save className="w-3.5 h-3.5 mr-1" /> Save Changes
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditing(true)}>
            <Pencil className="w-3.5 h-3.5 mr-1" /> Edit Agent
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Tools Tab ────────────────────────────────────────────────────────────────

function ToolsTab() {
  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">Available Tools</h2>
        <p className="text-sm text-gray-500">{ALL_TOOLS.length} tools available across all agents</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {ALL_TOOLS.map((tool) => (
          <div key={tool.name} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
            <p className="text-xs font-semibold font-mono text-gray-800 mb-1.5">{tool.name}</p>
            <p className="text-xs text-gray-500 leading-relaxed">{tool.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Workflows Tab ────────────────────────────────────────────────────────────

function WorkflowsTab({ agents, workflows, onAddWorkflow, onAddAgentToWorkflow, onRemoveAgentFromWorkflow, onToggleWorkflow, onDeleteWorkflow, onEditWorkflow }: {
  agents: Agent[]
  workflows: Workflow[]
  onAddWorkflow: () => void
  onAddAgentToWorkflow: (wfId: string, sid: string) => void
  onRemoveAgentFromWorkflow: (wfId: string, sid: string) => void
  onToggleWorkflow: (wfId: string) => void
  onDeleteWorkflow: (wfId: string) => void
  onEditWorkflow: (wf: Workflow) => void
}) {
  const [pickerOpen, setPickerOpen] = useState<string | null>(null)
  const getAgent = (sid: string) => agents.find((a) => a.shortId === sid)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Workflows</h2>
          <p className="text-sm text-gray-500">Agent chains triggered by system events</p>
        </div>
        <Button size="sm" onClick={onAddWorkflow}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Workflow
        </Button>
      </div>
      <div className="space-y-4">
        {workflows.map((wf) => (
          <div key={wf.id} className={`bg-white border rounded-xl p-5 transition-opacity ${wf.status === "Paused" ? "opacity-60 border-gray-100" : "border-gray-200"}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-2">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${wf.status === "Active" ? "bg-green-400" : "bg-gray-300"}`} />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-sm text-gray-900">{wf.name}</p>
                    {wf.isPredefined && (
                      <span className="flex items-center gap-1 text-[10px] text-gray-400 border border-gray-200 bg-gray-50 rounded px-1.5 py-0.5">
                        <Lock className="w-2.5 h-2.5" /> Standard
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{wf.purpose}</p>
                </div>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0 ml-3">
                <button onClick={() => onToggleWorkflow(wf.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border transition-colors ${wf.status === "Active" ? "border-yellow-200 text-yellow-700 hover:bg-yellow-50" : "border-green-200 text-green-700 hover:bg-green-50"}`}>
                  {wf.status === "Active" ? <><Pause className="w-3 h-3" />Pause</> : <><Play className="w-3 h-3" />Resume</>}
                </button>
                <button onClick={() => onEditWorkflow(wf)}
                  className="p-1.5 rounded border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-colors">
                  <PencilIcon className="w-3 h-3" />
                </button>
                {!wf.isPredefined && (
                  <button onClick={() => onDeleteWorkflow(wf.id)}
                    className="p-1.5 rounded border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Trigger */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1.5 text-xs bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-lg">
                <Zap className="w-3 h-3" />
                <span className="font-medium">Trigger:</span> {wf.trigger}
              </div>
            </div>

            {/* Agent chain */}
            <div className="flex items-center gap-1 flex-wrap">
              {wf.agentChain.map((sid, i) => {
                const a = getAgent(sid)
                if (!a) return null
                return (
                  <div key={sid} className="flex items-center gap-1">
                    <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border ${a.color.bg} ${a.color.border} ${a.color.text} font-medium group`}>
                      <span className={`text-[10px] font-bold px-1 py-0.5 rounded text-white ${a.color.badge}`}>{sid}</span>
                      {a.name}
                      <button onClick={() => onRemoveAgentFromWorkflow(wf.id, sid)}
                        className="ml-0.5 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    {i < wf.agentChain.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                  </div>
                )
              })}
              <div className="relative ml-1">
                <button onClick={() => setPickerOpen(pickerOpen === wf.id ? null : wf.id)}
                  className="flex items-center gap-1 text-xs text-gray-400 border border-dashed border-gray-300 px-2.5 py-1.5 rounded-lg hover:border-blue-300 hover:text-blue-500 transition-colors">
                  <Plus className="w-3 h-3" /> Add agent
                </button>
                {pickerOpen === wf.id && (
                  <div className="absolute left-0 top-9 z-30 bg-white border border-gray-200 rounded-xl shadow-xl p-2 w-56">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-2 mb-1.5">Select agent to append</p>
                    {agents.filter((a) => !wf.agentChain.includes(a.shortId)).map((a) => (
                      <button key={a.shortId} onClick={() => { onAddAgentToWorkflow(wf.id, a.shortId); setPickerOpen(null) }}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity ${a.color.bg} ${a.color.text} mb-1`}>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${a.color.badge}`}>{a.shortId}</span>
                        {a.name}
                      </button>
                    ))}
                    {agents.filter((a) => !wf.agentChain.includes(a.shortId)).length === 0 && (
                      <p className="text-xs text-gray-400 px-2 py-1">All agents already in chain</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {workflows.length === 0 && (
          <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            <GitBranch className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No workflows yet. Create your first one.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Add Agent Modal ──────────────────────────────────────────────────────────

function AddAgentModal({ onClose, onAdd, agents }: {
  onClose: () => void
  onAdd: (a: Agent) => void
  agents: Agent[]
}) {
  const [name, setName] = useState("")
  const [role, setRole] = useState<AgentRole>("background")
  const [description, setDescription] = useState("")
  const [prompt, setPrompt] = useState("")
  const [contextFiles, setContextFiles] = useState<string[]>([])
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [accessTo, setAccessTo] = useState<string[]>([])
  const [errors, setErrors] = useState<{ name?: string; prompt?: string }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const existingOrchestrator = agents.find((a) => a.role === "orchestrator")
  const orchestratorBlocked = role === "orchestrator" && !!existingOrchestrator

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const MAX_TOTAL = 10 * 1024 * 1024
    const totalSize = files.reduce((sum, f) => sum + f.size, 0)
    if (totalSize > MAX_TOTAL) { alert("Total file size exceeds 10 MB."); return }
    setContextFiles((prev) => [...prev, ...files.map((f) => f.name)])
    e.target.value = ""
  }

  const toggleTool = (t: string) =>
    setSelectedTools((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t])
  const toggleAccess = (sid: string) =>
    setAccessTo((p) => p.includes(sid) ? p.filter((x) => x !== sid) : [...p, sid])

  const handleAdd = () => {
    const newErrors: { name?: string; prompt?: string } = {}
    if (!name.trim()) newErrors.name = "Agent name is required"
    if (!prompt.trim()) newErrors.prompt = "Prompt is required"
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    if (orchestratorBlocked) return

    const newId = `A${agents.length + 1}`
    onAdd({
      id: `agent-custom-${Date.now()}`,
      shortId: newId,
      name: name.trim(), role,
      roleLabel: ROLE_META[role].label,
      description, prompt: prompt.trim(), contextFiles,
      tools: selectedTools, accessTo,
      isPredefined: false,
      color: { bg: "bg-gray-50", border: "border-gray-200", badge: "bg-gray-500", text: "text-gray-600", dot: "bg-gray-400" },
    })
  }

  const fieldCls = (err?: string) =>
    `w-full text-sm border rounded-lg px-3 py-2 outline-none focus:border-blue-400 ${err ? "border-red-300 bg-red-50" : "border-gray-200"}`
  const labelCls = "text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1"

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-[580px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-xl">
          <h2 className="font-semibold text-gray-900">New Agent</h2>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="px-6 py-5 space-y-5">
          {/* Name */}
          <div>
            <label className={labelCls}>Agent Name *</label>
            <input className={fieldCls(errors.name)} value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })) }}
              placeholder="e.g. Engagement Scorer" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Role */}
          <div>
            <label className={labelCls}>Role</label>
            <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white"
              value={role} onChange={(e) => setRole(e.target.value as AgentRole)}>
              <option value="background">Background (silent)</option>
              <option value="rule-based">Rule-based (no LLM)</option>
              <option value="orchestrator" disabled={!!existingOrchestrator}>
                Orchestrator (user-facing){existingOrchestrator ? " — already exists" : ""}
              </option>
            </select>
            {orchestratorBlocked && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                ⚠ Only one orchestration agent is allowed. {existingOrchestrator?.name} ({existingOrchestrator?.shortId}) is already the orchestrator.
              </p>
            )}
            {!orchestratorBlocked && (
              <p className="text-xs text-gray-400 mt-1">{
                role === "orchestrator" ? "Talks directly to the user. Always on." :
                role === "background" ? "Runs silently after each message. Never responds directly." :
                "Deterministic state machine. No LLM inference."
              }</p>
            )}
          </div>

          {/* What it does */}
          <div>
            <label className={labelCls}>What it does <span className="text-gray-400 normal-case font-normal">(For Human understanding only)</span></label>
            <textarea className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 resize-none h-16"
              value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="One-line summary of this agent's purpose" />
          </div>

          {/* Prompt */}
          <div>
            <label className={labelCls}>System Prompt *</label>
            <textarea className={fieldCls(errors.prompt) + " resize-none h-44 font-mono text-xs"} value={prompt}
              onChange={(e) => { setPrompt(e.target.value); setErrors((p) => ({ ...p, prompt: undefined })) }}
              placeholder={"You are a [role] agent.\n\nYour job is to...\n\nAlways:\n- ...\n\nNever:\n- ..."} />
            {errors.prompt && <p className="text-xs text-red-500 mt-1">{errors.prompt}</p>}
          </div>

          {/* Context Files */}
          <div>
            <label className={labelCls}>Context Files <span className="text-gray-400 normal-case font-normal">(optional · max 10 MB total)</span></label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {contextFiles.map((f, i) => (
                <span key={i} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono">
                  {f}<button onClick={() => setContextFiles((p) => p.filter((_, idx) => idx !== i))}><X className="w-3 h-3 text-gray-400 hover:text-red-400" /></button>
                </span>
              ))}
            </div>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />
            <button onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs border border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 px-3 py-1.5 rounded-lg transition-colors">
              <Upload className="w-3.5 h-3.5" /> Upload files
            </button>
          </div>

          {/* Tools */}
          <div>
            <label className={labelCls}>Tools</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_TOOLS.map((t) => (
                <button key={t.name} onClick={() => toggleTool(t.name)}
                  title={t.description}
                  className={`text-[11px] px-2 py-0.5 rounded font-mono border transition-colors ${
                    selectedTools.includes(t.name)
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300"
                  }`}>
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Access to agents */}
          <div>
            <label className={labelCls}>Can call agents</label>
            <div className="flex flex-wrap gap-2">
              {agents.map((a) => (
                <button key={a.shortId} onClick={() => toggleAccess(a.shortId)}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                    accessTo.includes(a.shortId)
                      ? `${a.color.bg} ${a.color.border} ${a.color.text}`
                      : "bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300"
                  }`}>
                  <span className={`text-[10px] font-bold px-1 rounded text-white ${a.color.badge}`}>{a.shortId}</span>
                  {a.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleAdd} disabled={orchestratorBlocked}>Create Agent</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Add Workflow Modal ───────────────────────────────────────────────────────

function AddWorkflowModal({ onClose, onAdd, agents, initial }: {
  onClose: () => void
  onAdd: (w: Workflow) => void
  agents: Agent[]
  initial?: Workflow
}) {
  const isEdit = !!initial
  const [name, setName] = useState(initial?.name ?? "")
  const [purpose, setPurpose] = useState(initial?.purpose ?? "")
  const [trigger, setTrigger] = useState(initial?.trigger ?? "")
  const [chain, setChain] = useState<string[]>(initial?.agentChain ?? [])
  const [errors, setErrors] = useState<{ name?: string; trigger?: string; chain?: string }>({})

  const addToChain = (sid: string) => {
    if (!chain.includes(sid)) setChain((p) => [...p, sid])
  }
  const removeFromChain = (sid: string) => setChain((p) => p.filter((x) => x !== sid))

  const handleCreate = () => {
    const errs: typeof errors = {}
    if (!name.trim()) errs.name = "Workflow name is required"
    if (!trigger.trim()) errs.trigger = "Trigger is required"
    if (chain.length === 0) errs.chain = "Add at least one agent to the chain"
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    onAdd({ id: initial?.id ?? `wf-${Date.now()}`, name: name.trim(), purpose, trigger: trigger.trim(), agentChain: chain, status: initial?.status ?? "Active" })
  }

  const inputCls = (err?: string) =>
    `w-full text-sm border rounded-lg px-3 py-2 outline-none focus:border-blue-400 ${err ? "border-red-300 bg-red-50" : "border-gray-200"}`
  const labelCls = "text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5"

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-[560px] max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-xl">
          <h2 className="font-semibold text-gray-900">{isEdit ? "Edit Workflow" : "New Workflow"}</h2>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Name */}
          <div>
            <label className={labelCls}>Workflow Name *</label>
            <input
              className={inputCls(errors.name)}
              value={name} onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })) }}
              placeholder="e.g. Post-Session Follow-up"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Purpose */}
          <div>
            <label className={labelCls}>Purpose</label>
            <textarea
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 resize-none h-16"
              value={purpose} onChange={(e) => setPurpose(e.target.value)}
              placeholder="What does this workflow accomplish?"
            />
          </div>

          {/* Trigger */}
          <div>
            <label className={labelCls}>Trigger *</label>
            <select
              className={`w-full text-sm border rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white ${errors.trigger ? "border-red-300 bg-red-50" : "border-gray-200"}`}
              value={trigger}
              onChange={(e) => { setTrigger(e.target.value); setErrors((p) => ({ ...p, trigger: undefined })) }}>
              <option value="">Select a trigger…</option>
              {WORKFLOW_TRIGGER_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.trigger && <p className="text-xs text-red-500 mt-1">{errors.trigger}</p>}
          </div>

          {/* Agent chain builder */}
          <div>
            <label className={labelCls}>Agent Chain *</label>
            <p className="text-xs text-gray-400 mb-3">Pick agents in the order they should run. Click to add, × to remove.</p>

            {/* Available agents */}
            <div className="flex flex-wrap gap-2 mb-3">
              {agents.map((a) => (
                <button
                  key={a.shortId}
                  onClick={() => addToChain(a.shortId)}
                  disabled={chain.includes(a.shortId)}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                    chain.includes(a.shortId)
                      ? "opacity-30 cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                      : `${a.color.bg} ${a.color.border} ${a.color.text} hover:opacity-80`
                  }`}
                >
                  <span className={`text-[10px] font-bold px-1 rounded text-white ${a.color.badge}`}>{a.shortId}</span>
                  {a.name}
                </button>
              ))}
            </div>

            {/* Chain preview */}
            <div className={`min-h-14 rounded-xl border-2 border-dashed p-3 flex items-center flex-wrap gap-1.5 ${errors.chain ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"}`}>
              {chain.length === 0 ? (
                <span className="text-xs text-gray-400">Click agents above to build the chain…</span>
              ) : chain.map((sid, i) => {
                const a = agents.find((x) => x.shortId === sid)
                if (!a) return null
                return (
                  <div key={sid} className="flex items-center gap-1">
                    <span className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg border ${a.color.bg} ${a.color.border} ${a.color.text} font-medium`}>
                      <span className={`text-[10px] font-bold px-1 rounded text-white ${a.color.badge}`}>{sid}</span>
                      {a.name}
                      <button onClick={() => removeFromChain(sid)} className="ml-1 opacity-60 hover:opacity-100">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                    {i < chain.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                  </div>
                )
              })}
            </div>
            {errors.chain && <p className="text-xs text-red-500 mt-1">{errors.chain}</p>}
          </div>
        </div>

        <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleCreate}>{isEdit ? "Save Changes" : "Create Workflow"}</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Tab = "agents" | "tools" | "workflows"

export default function AIAgents() {
  const [tab, setTab] = useState<Tab>("agents")
  const [agents, setAgents] = useState<Agent[]>(AGENTS)
  const [workflows, setWorkflows] = useState<Workflow[]>(WORKFLOWS)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAddWorkflow, setShowAddWorkflow] = useState(false)
  const [editWorkflow, setEditWorkflow] = useState<Workflow | null>(null)

  const handleSaveAgent = (id: string, updates: Partial<Agent>) => {
    setAgents((prev) => prev.map((a) => a.id === id ? { ...a, ...updates } : a))
    setSelectedAgent((prev) => prev?.id === id ? { ...prev, ...updates } : prev)
  }

  const handleAddAgent = (a: Agent) => {
    setAgents((prev) => [...prev, a])
    setShowAddModal(false)
  }

  const handleAddWorkflow = (w: Workflow) => {
    setWorkflows((prev) => [...prev, { ...w, status: "Active" }])
    setShowAddWorkflow(false)
  }

  const handleSaveEditWorkflow = (w: Workflow) => {
    setWorkflows((prev) => prev.map((wf) => wf.id === w.id ? w : wf))
    setEditWorkflow(null)
  }

  const handleAddAgentToWorkflow = (wfId: string, sid: string) => {
    setWorkflows((prev) => prev.map((w) =>
      w.id === wfId ? { ...w, agentChain: [...w.agentChain, sid] } : w
    ))
  }

  const handleRemoveAgentFromWorkflow = (wfId: string, sid: string) => {
    setWorkflows((prev) => prev.map((w) =>
      w.id === wfId ? { ...w, agentChain: w.agentChain.filter((x) => x !== sid) } : w
    ))
  }

  const handleToggleWorkflow = (wfId: string) => {
    setWorkflows((prev) => prev.map((w) =>
      w.id === wfId ? { ...w, status: w.status === "Active" ? "Paused" : "Active" } : w
    ))
  }

  const handleDeleteWorkflow = (wfId: string) => {
    setWorkflows((prev) => prev.filter((w) => w.id !== wfId))
  }

  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false)
  const handleRestoreDefaults = () => {
    setAgents(AGENTS)
    setWorkflows(WORKFLOWS)
    setSelectedAgent(null)
    setShowRestoreConfirm(false)
  }

  const tabs: { id: Tab; label: string; icon: typeof Bot }[] = [
    { id: "agents", label: "Agents", icon: Bot },
    { id: "tools", label: "Tools", icon: Wrench },
    { id: "workflows", label: "Workflows", icon: GitBranch },
  ]

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-0 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">AI Agents</h1>
                <p className="text-sm text-gray-500">{agents.length} agents · {agents.filter((a) => a.isPredefined).length} predefined</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {tab === "agents" && (
                <Button size="sm" onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4 mr-1" /> New Agent
                </Button>
              )}
              <button
                onClick={() => setShowRestoreConfirm(true)}
                className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 hover:border-amber-300 hover:text-amber-600 px-2.5 py-1.5 rounded-lg transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> Restore Defaults
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {tabs.map(({ id, label, icon: Icon }) => {
              if (id === "workflows") {
                return (
                  <div key={id} className="relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 border-transparent text-gray-300 cursor-not-allowed select-none">
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                    <span className="ml-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400 text-[10px] font-semibold border border-gray-200">
                      🔒 Coming soon
                    </span>
                  </div>
                )
              }
              return (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    tab === id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {tab === "agents" && (
            <div className="p-6">
              {/* Orchestration note */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">A1</div>
                <div>
                  <p className="text-xs font-semibold text-blue-800">Orchestration layer</p>
                  <p className="text-xs text-blue-600 mt-0.5">A1 (Conversation Agent) is the always-on orchestrator with access to all agents. All user-facing messages pass through it.</p>
                </div>
              </div>

              {/* All agents in a 2-col grid, left-aligned */}
              <div className="grid grid-cols-2 gap-4">
                {agents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    onClick={() => setSelectedAgent(agent)}
                  />
                ))}
              </div>
            </div>
          )}

          {tab === "tools" && <ToolsTab />}
          {tab === "workflows" && (
            <WorkflowsTab
              agents={agents}
              workflows={workflows}
              onAddWorkflow={() => setShowAddWorkflow(true)}
              onAddAgentToWorkflow={handleAddAgentToWorkflow}
              onRemoveAgentFromWorkflow={handleRemoveAgentFromWorkflow}
              onToggleWorkflow={handleToggleWorkflow}
              onDeleteWorkflow={handleDeleteWorkflow}
              onEditWorkflow={(wf) => setEditWorkflow(wf)}
            />
          )}
        </div>
      </div>

      {/* Right pane */}
      {selectedAgent && (
        <AgentPane
          agent={selectedAgent}
          agents={agents}
          onClose={() => setSelectedAgent(null)}
          onSave={handleSaveAgent}
        />
      )}

      {showAddModal && (
        <AddAgentModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddAgent}
          agents={agents}
        />
      )}

      {showAddWorkflow && (
        <AddWorkflowModal
          onClose={() => setShowAddWorkflow(false)}
          onAdd={handleAddWorkflow}
          agents={agents}
        />
      )}

      {editWorkflow && (
        <AddWorkflowModal
          onClose={() => setEditWorkflow(null)}
          onAdd={(w) => handleSaveEditWorkflow({ ...editWorkflow, ...w })}
          agents={agents}
          initial={editWorkflow}
        />
      )}

      {showRestoreConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-[420px] p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 text-amber-600" />
              </div>
              <h2 className="font-semibold text-gray-900">Restore to Defaults?</h2>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              This will reset <strong>all agents</strong> and <strong>all workflows</strong> back to their original definitions. Any custom agents or workflows you've created will be removed, and all edits to predefined agents will be reverted.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowRestoreConfirm(false)}>Cancel</Button>
              <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white" onClick={handleRestoreDefaults}>
                Yes, Restore Defaults
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
