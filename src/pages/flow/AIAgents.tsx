import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  BrainCircuit, X, Lock, Pencil, Plus, ChevronRight,
  Wrench, GitBranch, Bot, Zap, Save, RotateCcw, Upload,
  Pause, Play, Trash2, Pencil as PencilIcon,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type AgentRole = "orchestrator" | "background" | "rule-based"

interface AgentTool {
  name: string
  description: string
}

const MODEL_OPTIONS = [
  { value: "claude-opus-4-5",    label: "Claude Opus 4.5",   badge: "Most capable",     cls: "text-purple-700 bg-purple-50"  },
  { value: "claude-sonnet-4-5",  label: "Claude Sonnet 4.5", badge: "Balanced",          cls: "text-blue-700 bg-blue-50"      },
  { value: "claude-haiku-4-5",   label: "Claude Haiku 4.5",  badge: "Fast & lightweight",cls: "text-teal-700 bg-teal-50"      },
  { value: "rule-based",         label: "Rule-based",        badge: "No LLM",            cls: "text-gray-600 bg-gray-100"     },
] as const

type ModelOption = typeof MODEL_OPTIONS[number]["value"]

interface Agent {
  id: string
  shortId: string        // A1–A7
  name: string
  role: AgentRole
  roleLabel: string
  description: string
  prompt: string
  model?: ModelOption
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
  "Mentee status remains 'Sign-up Completed' for 4 hours",
  "Mentee status remains 'Engagement Chat Abandoned' for 4 hours",
  "Request status changes to 'Matched'",
  "Request status changes to 'Accessed Contact'",
  "Mentoring request has 4 days remaining",
  "30 days since last mentee engagement created",
  "Volunteer status remains 'Orientation call not booked' for 4 hours",
  "Volunteer orientation slot is 1 hour away",
]

// ─── Volunteer workflow triggers ──────────────────────────────────────────────

const VOLUNTEER_WORKFLOW_TRIGGER_OPTIONS = [
  "Volunteer sends first WhatsApp message",
  "Volunteer orientation slot confirmed",
  "Session marked 'completed' in system",
  "Support keyword or chip detected in mentor message",
  "Volunteer status remains 'Orientation call not booked' for 24 hours",
  "Mentor accepts a match request",
  "Mentor declines a match request",
  "Mentoring request has 4 days remaining",
  "30 days since last volunteer engagement",
  "Volunteer marks session as done",
]

// ─── Tool catalogue ───────────────────────────────────────────────────────────

const ALL_TOOLS: AgentTool[] = [
  // A1 — Conversation Agent
  { name: "get_mentee_context",        description: "Loads full mentee profile, current phase, and metadata from DB for context injection." },
  { name: "get_session_history",       description: "Retrieves the last N messages of the current WhatsApp or web session for the user." },
  { name: "get_quick_replies",         description: "Returns platform-appropriate chip/button options for the current conversation state." },
  { name: "send_message",              description: "Sends a WhatsApp message (text, chips, or template) to the mentee via the messaging gateway." },
  // A2 — Extraction + Gap Agent
  { name: "extract_profile_fields",    description: "Parses the latest message and infers structured profile fields (goals, skills, background, etc.)." },
  { name: "extract_engagement_fields", description: "Parses the latest message for engagement-specific fields: challenge, theme, target domain, skills needed." },
  { name: "update_working_profile",    description: "Writes extracted fields into the in-progress working profile document in DB." },
  { name: "update_working_engagement", description: "Writes extracted fields into the in-progress working engagement document in DB." },
  { name: "infer_signals",             description: "Infers soft signals: confidence level, clarity of need, and mentor expectation type from message tone." },
  { name: "score_profile_completion",  description: "Scores profile completeness (0.0–1.0) against required schema; flags A3 when threshold is reached." },
  { name: "score_engagement_completion", description: "Scores engagement completeness (0.0–1.0); flags A3 when both profile and engagement hit their thresholds." },
  { name: "rank_next_gap",             description: "Prioritises missing fields by importance and conversation context to decide the next question for A1." },
  // A3 — Profile Synthesis Agent
  { name: "generate_summary",          description: "Writes a 2–4 sentence human-readable summary of the mentee profile for the matching team." },
  { name: "format_json_profile",       description: "Converts the completed working profile into the final structured JSON schema used by the matching engine." },
  { name: "extract_mentor_tags",       description: "Derives 3–7 recommended mentor skill/experience tags from the completed profile for search indexing." },
  { name: "write_to_db",               description: "Persists the final summary, structured JSON, and mentor tags to the mentee record in DB." },
  { name: "notify_matching_team",      description: "Sends a real-time alert to the matching team with the profile summary and structured data." },
  { name: "send_confirmation",         description: "Sends the summary card to the mentee for confirmation before writing to DB." },
  // A4 — Feedback Agent
  { name: "get_feedback_questions",    description: "Returns the fixed ordered set of 5 post-session feedback questions with chip answer options." },
  { name: "send_feedback_question",    description: "Delivers the next feedback question to the mentee via WhatsApp with chip options." },
  { name: "write_feedback_record",     description: "Writes each structured feedback answer directly to the DB as the user responds, without inference." },
  { name: "update_session_status",     description: "Marks the session as feedback-complete and updates the engagement status in DB." },
  { name: "trigger_next_prompt",       description: "Schedules the next session check-in or re-engagement prompt via A1 after feedback completion." },
  // A5 — Support Escalation Agent
  { name: "create_support_ticket",     description: "Creates a support ticket in the admin system with conversation context snapshot attached." },
  { name: "set_human_takeover",        description: "Sets human_takeover = true on the conversation, silencing A1 until an admin resolves it." },
  { name: "notify_admin_team",         description: "Sends a real-time alert to the admin team via internal channel with the ticket details and urgency." },
  { name: "send_holding_message",      description: "Sends a fixed holding message to the user: 'Our team has been notified and will be in touch shortly.'" },
  { name: "admin_send_message",        description: "Allows an admin to send a message into the mentee's chat thread directly from within the ticket view." },
  { name: "resolve_and_resume",        description: "Marks the ticket resolved, sets human_takeover = false, and resumes normal A1 conversation flow." },
]

// ─── Volunteer tool catalogue ─────────────────────────────────────────────────

const VOLUNTEER_TOOLS: AgentTool[] = [
  // M-A1 — Conversation Agent
  { name: "get_mentor_context",           description: "Loads full volunteer/mentor profile, current engagement status, and active requests from DB." },
  { name: "get_session_history",          description: "Retrieves the last N messages of the current WhatsApp session for the mentor." },
  { name: "send_message",                 description: "Sends a WhatsApp message (text, chips, or template) to the mentor via the messaging gateway." },
  // M-A2 — Feedback Agent
  { name: "write_feedback_record",        description: "Writes each structured feedback answer directly to the DB immediately as the mentor responds, without inference." },
  { name: "update_session_status",        description: "Marks the session as feedback-complete and updates the engagement status in DB." },
  { name: "trigger_next_request_prompt",  description: "Schedules the next session check-in or re-engagement prompt via M-A1 after feedback completion." },
  // M-A3 — Support Agent
  { name: "create_support_ticket",        description: "Creates a support ticket in the admin system with conversation context snapshot attached." },
  { name: "set_human_takeover",           description: "Sets human_takeover = true on the conversation, silencing M-A1 and M-A2 until admin resolves." },
  { name: "notify_admin_team",            description: "Sends a real-time alert to the admin team via internal channel with the ticket details and urgency." },
  { name: "resolve_and_resume",           description: "Marks the ticket resolved, sets human_takeover = false, and resumes normal M-A1 conversation flow." },
]

// ─── Volunteer agent data ─────────────────────────────────────────────────────

const VOLUNTEER_AGENTS: Agent[] = [
  {
    id: "vol-agent-ma1", shortId: "M-A1",
    name: "Conversation Agent",
    role: "orchestrator",
    roleLabel: "LLM · Always On",
    description: "The only agent the mentor speaks to directly. Handles open Q&A, session check-in conversation, and bridges between notification events. Reads full conversation history every turn.",
    prompt: `You are Mira, a supportive coordinator from WeDoGood speaking with a mentor volunteer.

Your job is to check in after sessions, answer questions about the platform and the mentee they are working with, and facilitate a smooth mentoring experience.

Always:
- Greet the mentor by name if available in context
- Keep messages short and warm
- Offer chip options where relevant
- Check human_takeover flag before every reply — if true, do not respond
- When the mentor confirms a session happened, hand off to M-A2 immediately
- Detect support keywords → hand off to M-A3

Never:
- Send proactive or scheduled notifications (handled by system triggers)
- Write to feedback_records directly
- Create support tickets yourself — always hand off to M-A3
- Re-ask questions already answered in the session history`,
    model: "claude-sonnet-4-5",
    contextFiles: ["mentor_profile_schema.json"],
    tools: ["get_mentor_context", "get_session_history", "send_message"],
    accessTo: ["M-A2", "M-A3"],
    isPredefined: true,
    color: { bg: "bg-teal-50", border: "border-teal-200", badge: "bg-teal-600", text: "text-teal-700", dot: "bg-teal-500" },
  },
  {
    id: "vol-agent-ma2", shortId: "M-A2",
    name: "Feedback Agent",
    role: "background",
    roleLabel: "Lightweight LLM · Mandatory Sequence",
    description: "Fires immediately after M-A1 confirms session happened. Delivers 5 mandatory questions one at a time. Phrasing can vary but order and topics are fixed. Stores each answer to DB immediately.",
    prompt: `You are the feedback collection agent for WeDoGood mentor sessions.

You must ask exactly 5 questions in order. You cannot skip or reorder them.

Rules:
- Deliver one question at a time with chip response options
- You MAY vary the phrasing and tone to feel natural
- You CANNOT change the meaning, intent, or answer options of any question
- Chip answers are written to DB exactly as received — no interpretation
- Free text answers are stored verbatim — no summarising
- After question 5 is answered, trigger the next request prompt via trigger_next_request_prompt

Tone: Brief, warm, appreciative. The session just happened — keep it light.

You cannot:
- Skip or reorder questions
- Engage in open conversation
- Initiate feedback unprompted — only fires after M-A1 confirms session happened
- Override the human_takeover flag`,
    model: "claude-haiku-4-5",
    tools: ["write_feedback_record", "update_session_status", "trigger_next_request_prompt"],
    accessTo: [],
    isPredefined: true,
    color: { bg: "bg-green-50", border: "border-green-200", badge: "bg-green-600", text: "text-green-700", dot: "bg-green-500" },
  },
  {
    id: "vol-agent-ma3", shortId: "M-A3",
    name: "Support Agent",
    role: "rule-based",
    roleLabel: "Rule-Based · Intercepts Any Phase",
    description: "Intercepts at any point when a support keyword or chip is detected. Creates ticket, silences M-A1 and M-A2, notifies admin team with full context snapshot. Admin flips flag to resume.",
    prompt: `[Rule-based agent — no LLM inference used]

Trigger conditions (evaluated on every message before M-A1 responds):
- Mentor taps "I need help" / "Support" chip
- Message contains any of: help, problem, issue, complaint, stuck, wrong, error, uncomfortable, unsafe, worried

On trigger:
1. Snapshot current conversation context
2. Create support ticket with context snapshot
3. Set human_takeover = true on the conversation record (silences M-A1 and M-A2)
4. Notify admin team with ticket link and urgency level
5. Admin flips flag to resume

Cannot:
- Resolve tickets autonomously
- Engage in conversation while takeover is active
- Initiate proactively without a keyword trigger`,
    model: "rule-based",
    tools: ["create_support_ticket", "set_human_takeover", "notify_admin_team", "resolve_and_resume"],
    accessTo: ["M-A1"],
    isPredefined: true,
    color: { bg: "bg-purple-50", border: "border-purple-200", badge: "bg-purple-600", text: "text-purple-700", dot: "bg-purple-500" },
  },
]

const VOLUNTEER_WORKFLOWS: Workflow[] = [
  {
    id: "vol-wf-1",
    name: "Post-Session Check-in",
    purpose: "Confirm the session happened and immediately collect structured feedback from the mentor.",
    trigger: "Session marked 'completed' in system",
    agentChain: ["M-A1", "M-A3"],
    status: "Active",
    isPredefined: true,
  },
  {
    id: "vol-wf-2",
    name: "Support Escalation",
    purpose: "Intercept support signals from the mentor and hand off to admin immediately.",
    trigger: "Support keyword or chip detected in mentor message",
    agentChain: ["M-A1", "M-A4"],
    status: "Active",
    isPredefined: true,
  },
  {
    id: "vol-wf-3",
    name: "Match Request Notification",
    purpose: "Notify the mentor of a new match request and collect their response.",
    trigger: "Mentor accepts a match request",
    agentChain: ["M-A1"],
    status: "Active",
    isPredefined: true,
  },
]

// ─── Agent data ───────────────────────────────────────────────────────────────

const AGENTS: Agent[] = [
  {
    id: "agent-a1", shortId: "A1",
    name: "Conversation Agent",
    role: "orchestrator",
    roleLabel: "User-facing · always on · orchestrator",
    description: "The only agent the mentee talks to. Reads full conversation history and loaded mentee context before every turn. Never re-asks a question the mentee already answered. Adapts tone from A2 signals. Opens return sessions with prior mentor reference and known context — not from scratch.",
    prompt: `You are Mira, a warm and supportive career mentoring assistant from WeDoGood.

Your job is to have a natural, friendly conversation with the mentee to understand their background, goals, and what kind of mentor would help them most.

Always:
- Start by greeting the user by name if available in context
- Ask one question at a time
- Mirror the user's language (English or Romanized Hindi)
- Offer 2–3 chip options where possible to reduce typing friction
- Keep messages short (under 3 sentences)
- Check human_takeover flag before every reply — if true, send holding message only and do not continue

Never:
- Ask multiple questions at once
- Re-ask something the mentee has already answered (check full history)
- Use jargon or overly formal language
- Make promises about specific mentors`,
    model: "claude-sonnet-4-5",
    contextFiles: ["mentee_profile_schema.json"],
    tools: ["get_mentee_context", "get_session_history", "get_quick_replies", "send_message"],
    accessTo: ["A2", "A5"],
    isPredefined: true,
    color: { bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-600", text: "text-emerald-700", dot: "bg-emerald-500" },
  },
  {
    id: "agent-a2", shortId: "A2",
    name: "Extraction + Gap Agent",
    role: "background",
    roleLabel: "Background · silent · runs after every message",
    description: "Runs background after every message. Maintains two separate working state objects — working_profile and working_engagement. Extracts fields into the correct object. Scores each independently: profile_completion_score (threshold 0.80) and engagement_completion_score (threshold 0.85). Flags completion to A3 when both hit their thresholds. For return users with a complete profile, flags when engagement alone hits 0.85.",
    prompt: `You are a silent data extraction agent. You never speak to the user.

After every message from the mentee, analyse the full conversation history and extract or update the following fields into the correct working object.

Working Profile fields:
- Current role, company, years of experience
- Education level and field
- Career goals (short-term and long-term)
- Communication style preference
- Confidence level (1–5 inferred)
- Clarity of need (high / medium / low)
- Expected mentor type (hands-on / advisory / network)

Working Engagement fields:
- Specific challenge or problem to solve
- Theme / domain of the ask
- Target role or domain for mentor
- Specific skills needed in mentor

Scoring rules:
- profile_completion_score: 0.0–1.0, threshold 0.80
- engagement_completion_score: 0.0–1.0, threshold 0.85
- For return users with complete profile: score engagement only

When both thresholds are met, flag A3 to synthesise.
Return rank_next_gap output alongside scores so A1 knows what to ask next.
Return structured JSON only — no prose.`,
    model: "claude-haiku-4-5",
    tools: ["extract_profile_fields", "extract_engagement_fields", "update_working_profile", "update_working_engagement", "infer_signals", "score_profile_completion", "score_engagement_completion", "rank_next_gap"],
    accessTo: ["A3"],
    isPredefined: true,
    color: { bg: "bg-violet-50", border: "border-violet-200", badge: "bg-violet-600", text: "text-violet-700", dot: "bg-violet-500" },
  },
  {
    id: "agent-a3", shortId: "A3",
    name: "Profile Synthesis Agent",
    role: "background",
    roleLabel: "Fires once · at completion threshold ≥ 0.85",
    description: "Takes the completed working profile at threshold (≥ 0.85). Writes the human-readable summary, formats the structured JSON, extracts mentor tags. Presents a summary card to the mentee for confirmation, then writes to DB and notifies the admin team.",
    prompt: `You are a profile synthesis agent. You fire once when both working_profile and working_engagement have reached their completion thresholds.

Using the completed working profile and working engagement JSON objects, produce:

1. A 2–4 sentence human-readable summary for the WeDoGood matching team covering:
   - Who the mentee is (role, background, career stage)
   - What they are trying to achieve
   - What specific challenge they need help with
   - What kind of mentor would suit them best
   Write in third person, professionally. Under 80 words.

2. Final structured JSON profile conforming exactly to the schema spec.

3. 3–7 recommended mentor tags drawn from the canonical tag list only.

4. A summary card in the mentee's language for them to confirm before DB write.

Only write to DB after mentee confirms the summary card.`,
    model: "claude-opus-4-5",
    contextFiles: ["mentor_tags_canonical.json", "mentee_profile_schema.json"],
    tools: ["generate_summary", "format_json_profile", "extract_mentor_tags", "write_to_db", "notify_matching_team", "send_confirmation"],
    accessTo: [],
    isPredefined: true,
    color: { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-600", text: "text-blue-700", dot: "bg-blue-500" },
  },
  {
    id: "agent-a4", shortId: "A4",
    name: "Feedback Agent",
    role: "background",
    roleLabel: "Lightweight LLM · mandatory 5-question sequence",
    description: "Uses a lightweight LLM with a tightly constrained system prompt. The prompt mandates all 5 questions, their sequence, and the required response options — but allows the phrasing and tone to vary naturally. The LLM cannot skip or reorder questions. Structured answers written directly to DB per question. Free text stored raw. Fires after session completion or cron 48hr after completion.",
    prompt: `You are the feedback collection agent for WeDoGood mentoring sessions.

You must ask exactly 5 questions in order. You cannot skip or reorder them. The questions are loaded from the feedback_questions config.

Rules:
- Deliver one question at a time with chip response options
- You MAY vary the phrasing and tone to feel natural (not robotic)
- You CANNOT change the meaning, intent, or answer options of any question
- Chip answers are written to DB exactly as received — no interpretation
- Free text answers are stored verbatim — no summarising
- After question 5 is answered, trigger the next session scheduling prompt

Tone: Warm, brief, appreciative. The session just happened — keep it light.`,
    model: "claude-haiku-4-5",
    tools: ["get_feedback_questions", "send_feedback_question", "write_feedback_record", "update_session_status", "trigger_next_prompt"],
    accessTo: [],
    isPredefined: true,
    color: { bg: "bg-rose-50", border: "border-rose-200", badge: "bg-rose-700", text: "text-rose-700", dot: "bg-rose-500" },
  },
  {
    id: "agent-a5", shortId: "A5",
    name: "Support Escalation Agent",
    role: "rule-based",
    roleLabel: "Rule-based · intercepts at any point in any workflow",
    description: "Detects a support chip tap or support keyword in any conversation at any point. Creates a support ticket, sets human_takeover = true (silencing A1), notifies the admin team, and sends a holding message to the mentee. Admin joins the chat, types as 'Support team'. resolve_and_resume flips the flag back and A1 resumes.",
    prompt: `[Rule-based agent — no LLM inference used]

Trigger conditions (evaluated on every message before A1 responds):
- User taps "I need help" / "Support" chip
- Message contains any of: help, problem, issue, complaint, stuck, wrong, error, uncomfortable, unsafe, worried, scared

On trigger:
1. Snapshot current conversation context
2. Create support ticket with context snapshot
3. Set human_takeover = true on conversation record
4. Send fixed holding message: "I've flagged this for our support team and someone will be in touch shortly. Feel free to share any more details here in the meantime."
5. Notify admin team with ticket link and urgency level

Do not attempt to resolve the issue.
Do not generate custom or dynamic responses.
Use fixed scripts only.
Admin uses admin_send_message to communicate with the mentee.
resolve_and_resume flips human_takeover = false and signals A1 to resume.`,
    model: "rule-based",
    tools: ["create_support_ticket", "set_human_takeover", "notify_admin_team", "send_holding_message", "admin_send_message", "resolve_and_resume"],
    accessTo: ["A1"],
    isPredefined: true,
    color: { bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-600", text: "text-orange-700", dot: "bg-orange-500" },
  },
]

const WORKFLOWS: Workflow[] = [
  {
    id: "wf-1",
    name: "Mentee Onboarding",
    purpose: "Guide a new mentee from first message through completed profile and mentor matching.",
    trigger: "New mentee sends first WhatsApp message",
    agentChain: ["A1", "A2", "A3"],
    status: "Active",
    isPredefined: true,
  },
  {
    id: "wf-2",
    name: "Post-Session Feedback",
    purpose: "Collect structured feedback after each mentoring session and schedule the next.",
    trigger: "Session marked 'completed' in system",
    agentChain: ["A1", "A4"],
    status: "Active",
    isPredefined: true,
  },
  {
    id: "wf-3",
    name: "Support Escalation",
    purpose: "Intercept distress signals and hand off to a human admin immediately.",
    trigger: "Support keyword or chip detected in any message",
    agentChain: ["A1", "A5"],
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

function AgentCard({ agent, onClick, onDelete }: {
  agent: Agent
  onClick: () => void
  onDelete?: (id: string) => void
}) {
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
          {!agent.isPredefined && onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(agent.id) }}
              className="p-0.5 rounded hover:text-red-500 text-gray-400 transition-colors"
              title="Delete agent">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
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

function AgentPane({ agent, agents, onClose, onSave, onDelete, onRestoreDefault }: {
  agent: Agent
  agents: Agent[]
  onClose: () => void
  onSave: (id: string, updates: Partial<Agent>) => void
  onDelete?: (id: string) => void
  onRestoreDefault?: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [prompt, setPrompt] = useState(agent.prompt)
  const [description, setDescription] = useState(agent.description)
  const [model, setModel] = useState<ModelOption>(agent.model ?? "claude-sonnet-4-5")
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
    onSave(agent.id, { prompt, description, model, contextFiles, tools: selectedTools, accessTo })
    setEditing(false)
  }

  const handleReset = () => {
    setPrompt(agent.prompt)
    setDescription(agent.description)
    setModel(agent.model ?? "claude-sonnet-4-5")
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

        {/* AI Model */}
        <div>
          <label className={labelCls}>AI Model</label>
          {agent.role === "rule-based" ? (
            <p className="text-xs text-gray-400 italic">Rule-based agents do not use an LLM — no model selection needed.</p>
          ) : editing ? (
            <select className={inputCls} value={model} onChange={e => setModel(e.target.value as ModelOption)}>
              {MODEL_OPTIONS.filter(m => m.value !== "rule-based").map(m => (
                <option key={m.value} value={m.value}>{m.label} — {m.badge}</option>
              ))}
            </select>
          ) : (
            (() => {
              const m = MODEL_OPTIONS.find(x => x.value === model) ?? MODEL_OPTIONS[1]
              return (
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${m.cls}`}>
                  {m.label}
                  <span className="font-normal text-[10px] opacity-70">{m.badge}</span>
                </div>
              )
            })()
          )}
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
      <div className="px-5 py-4 border-t border-gray-100 space-y-2">
        {editing ? (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={handleReset}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Discard
            </Button>
            <Button size="sm" className="flex-1" onClick={handleSave}>
              <Save className="w-3.5 h-3.5 mr-1" /> Save Changes
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" className="w-full" onClick={() => setEditing(true)}>
            <Pencil className="w-3.5 h-3.5 mr-1" /> Edit Agent
          </Button>
        )}
        {/* Per-agent restore (predefined) or delete (custom) */}
        {agent.isPredefined && onRestoreDefault && !editing && (
          <button
            onClick={() => onRestoreDefault(agent.id)}
            className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 border border-amber-200 hover:border-amber-300 px-3 py-1.5 rounded-lg transition-colors w-full justify-center">
            <RotateCcw className="w-3.5 h-3.5" /> Restore to Default
          </button>
        )}
        {!agent.isPredefined && onDelete && (
          <button
            onClick={() => onDelete(agent.id)}
            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors w-full justify-center">
            <Trash2 className="w-3.5 h-3.5" /> Delete Agent
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Tools Tab ────────────────────────────────────────────────────────────────

function ToolsTab({ tools }: { tools: AgentTool[] }) {
  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">Available Tools</h2>
        <p className="text-sm text-gray-500">{tools.length} tools available across all agents</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {tools.map((tool) => (
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
  triggerOptions?: string[]
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
  const [agentModel, setAgentModel] = useState<ModelOption>("claude-sonnet-4-5")
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
      description, prompt: prompt.trim(), model: role === "rule-based" ? "rule-based" : agentModel,
      contextFiles, tools: selectedTools, accessTo,
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

          {/* AI Model */}
          {role !== "rule-based" && (
            <div>
              <label className={labelCls}>AI Model</label>
              <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white"
                value={agentModel} onChange={e => setAgentModel(e.target.value as ModelOption)}>
                {MODEL_OPTIONS.filter(m => m.value !== "rule-based").map(m => (
                  <option key={m.value} value={m.value}>{m.label} — {m.badge}</option>
                ))}
              </select>
            </div>
          )}

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

// ─── Layer Panel (shared between Mentee and Volunteer) ───────────────────────

function LayerPanel({
  orchestratorId,
  orchestratorNote,
  allAgents,
  allWorkflows,
  allTools,
  defaultAgents,
  showWorkflows = true,
}: {
  layerLabel?: string
  orchestratorId: string
  orchestratorNote: string
  allAgents: Agent[]
  allWorkflows: Workflow[]
  allTools: AgentTool[]
  triggerOptions?: string[]
  defaultAgents: Agent[]
  showWorkflows?: boolean
}) {
  const [tab, setTab] = useState<Tab>("agents")
  const [agents, setAgents] = useState<Agent[]>(allAgents)
  const [workflows, setWorkflows] = useState<Workflow[]>(allWorkflows)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAddWorkflow, setShowAddWorkflow] = useState(false)
  const [editWorkflow, setEditWorkflow] = useState<Workflow | null>(null)
  const [restoreTargetId, setRestoreTargetId] = useState<string | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const handleSaveAgent = (id: string, updates: Partial<Agent>) => {
    setAgents((prev) => prev.map((a) => a.id === id ? { ...a, ...updates } : a))
    setSelectedAgent((prev) => prev?.id === id ? { ...prev, ...updates } : prev)
  }
  const handleAddAgent = (a: Agent) => { setAgents((prev) => [...prev, a]); setShowAddModal(false) }
  const handleAddWorkflow = (w: Workflow) => { setWorkflows((prev) => [...prev, { ...w, status: "Active" }]); setShowAddWorkflow(false) }
  const handleSaveEditWorkflow = (w: Workflow) => { setWorkflows((prev) => prev.map((wf) => wf.id === w.id ? w : wf)); setEditWorkflow(null) }
  const handleAddAgentToWorkflow = (wfId: string, sid: string) => setWorkflows((prev) => prev.map((w) => w.id === wfId ? { ...w, agentChain: [...w.agentChain, sid] } : w))
  const handleRemoveAgentFromWorkflow = (wfId: string, sid: string) => setWorkflows((prev) => prev.map((w) => w.id === wfId ? { ...w, agentChain: w.agentChain.filter((x) => x !== sid) } : w))
  const handleToggleWorkflow = (wfId: string) => setWorkflows((prev) => prev.map((w) => w.id === wfId ? { ...w, status: w.status === "Active" ? "Paused" : "Active" } : w))
  const handleDeleteWorkflow = (wfId: string) => setWorkflows((prev) => prev.filter((w) => w.id !== wfId))
  const handleRestoreDefault = (id: string) => setRestoreTargetId(id)
  const confirmRestoreDefault = () => {
    if (!restoreTargetId) return
    const original = defaultAgents.find(a => a.id === restoreTargetId)
    if (original) { setAgents(prev => prev.map(a => a.id === restoreTargetId ? { ...original } : a)); setSelectedAgent({ ...original }) }
    setRestoreTargetId(null)
  }
  const handleDeleteAgent = (id: string) => setDeleteTargetId(id)
  const confirmDeleteAgent = () => {
    if (!deleteTargetId) return
    setAgents(prev => prev.filter(a => a.id !== deleteTargetId))
    if (selectedAgent?.id === deleteTargetId) setSelectedAgent(null)
    setDeleteTargetId(null)
  }

  const availableTabs: { id: Tab; label: string; icon: typeof Bot }[] = [
    { id: "agents", label: "Agents", icon: Bot },
    { id: "tools", label: "Tools", icon: Wrench },
    ...(showWorkflows ? [{ id: "workflows" as Tab, label: "Workflows", icon: GitBranch }] : []),
  ]

  return (
    <div className="h-full flex overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Sub-header */}
        <div className="px-6 pt-4 pb-0 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">{agents.length} agents · {agents.filter((a) => a.isPredefined).length} predefined</p>
            {tab === "agents" && (
              <Button size="sm" onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-1" /> New Agent
              </Button>
            )}
          </div>
          <div className="flex gap-1">
            {availableTabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {tab === "agents" && (
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{orchestratorId}</div>
                <div>
                  <p className="text-xs font-semibold text-blue-800">Orchestration layer</p>
                  <p className="text-xs text-blue-600 mt-0.5">{orchestratorNote}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {agents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} onClick={() => setSelectedAgent(agent)} onDelete={handleDeleteAgent} />
                ))}
              </div>
            </div>
          )}
          {tab === "tools" && <ToolsTab tools={allTools} />}
          {tab === "workflows" && (
            <WorkflowsTab
              agents={agents} workflows={workflows}
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

      {selectedAgent && (
        <AgentPane agent={selectedAgent} agents={agents} onClose={() => setSelectedAgent(null)}
          onSave={handleSaveAgent} onDelete={handleDeleteAgent} onRestoreDefault={handleRestoreDefault} />
      )}

      {showAddModal && <AddAgentModal onClose={() => setShowAddModal(false)} onAdd={handleAddAgent} agents={agents} />}

      {showAddWorkflow && (
        <AddWorkflowModal onClose={() => setShowAddWorkflow(false)} onAdd={handleAddWorkflow} agents={agents} />
      )}
      {editWorkflow && (
        <AddWorkflowModal onClose={() => setEditWorkflow(null)} onAdd={(w) => handleSaveEditWorkflow({ ...editWorkflow, ...w })} agents={agents} initial={editWorkflow} />
      )}

      {restoreTargetId && (() => {
        const a = agents.find(x => x.id === restoreTargetId)
        return (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-[420px] p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0"><RotateCcw className="w-4 h-4 text-amber-600" /></div>
                <h2 className="font-semibold text-gray-900">Restore {a?.name} to Default?</h2>
              </div>
              <p className="text-sm text-gray-600 mb-5">This will reset <strong>{a?.shortId} — {a?.name}</strong> back to its original prompt, tools, model, and configuration.</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setRestoreTargetId(null)}>Cancel</Button>
                <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white" onClick={confirmRestoreDefault}>Yes, Restore Default</Button>
              </div>
            </div>
          </div>
        )
      })()}

      {deleteTargetId && (() => {
        const a = agents.find(x => x.id === deleteTargetId)
        return (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-[420px] p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0"><Trash2 className="w-4 h-4 text-red-500" /></div>
                <h2 className="font-semibold text-gray-900">Delete {a?.name}?</h2>
              </div>
              <p className="text-sm text-gray-600 mb-5"><strong>{a?.shortId} — {a?.name}</strong> will be permanently deleted. Any workflows that reference this agent will need to be updated manually.</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setDeleteTargetId(null)}>Cancel</Button>
                <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white" onClick={confirmDeleteAgent}>Yes, Delete Agent</Button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Tab = "agents" | "tools" | "workflows"
type Layer = "mentee" | "volunteer"

export default function AIAgents() {
  const [layer, setLayer] = useState<Layer>("mentee")

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Page header with layer switcher */}
      <div className="px-6 pt-6 pb-0 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">AI Agents</h1>
              <p className="text-sm text-gray-500">Configure intelligent agents for each user layer</p>
            </div>
          </div>
        </div>

        {/* Layer tabs */}
        <div className="flex gap-1">
          {([
            { id: "mentee" as Layer, label: "Mentee AI Agent" },
            { id: "volunteer" as Layer, label: "Volunteer AI Agent" },
          ]).map(({ id, label }) => (
            <button key={id} onClick={() => setLayer(id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${layer === id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              <Bot className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Layer content */}
      <div className="flex-1 overflow-hidden">
        {layer === "mentee" && (
          <LayerPanel
            layerLabel="Mentee AI Agent"
            orchestratorId="A1"
            orchestratorNote="A1 (Conversation Agent) is the always-on orchestrator with access to all agents. All user-facing messages pass through it."
            allAgents={AGENTS}
            allWorkflows={WORKFLOWS}
            allTools={ALL_TOOLS}
            triggerOptions={WORKFLOW_TRIGGER_OPTIONS}
            defaultAgents={AGENTS}
          />
        )}
        {layer === "volunteer" && (
          <LayerPanel
            layerLabel="Volunteer AI Agent"
            orchestratorId="M-A1"
            orchestratorNote="M-A1 (Conversation Agent) is the always-on orchestrator for mentors. All mentor-facing messages pass through it. Hands off to M-A2 after session confirmation, and to M-A3 on support detection."
            allAgents={VOLUNTEER_AGENTS}
            allWorkflows={VOLUNTEER_WORKFLOWS}
            allTools={VOLUNTEER_TOOLS}
            triggerOptions={VOLUNTEER_WORKFLOW_TRIGGER_OPTIONS}
            defaultAgents={VOLUNTEER_AGENTS}
            showWorkflows={false}
          />
        )}
      </div>
    </div>
  )
}
