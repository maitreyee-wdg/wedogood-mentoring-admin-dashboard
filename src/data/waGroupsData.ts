// WhatsApp group automation (Whapi.Cloud). One group per mentee, created on an AI number with a
// backup admin number in every group. Mock/in-memory, mirroring the other *Data.ts files.

import { mockRequests, type RequestStatus } from "@/data/requestsData"
import { mockVolunteers } from "@/data/volunteersData"

export const MIN_HOURS_BETWEEN_CREATIONS = 2

// Display names set on the WhatsApp profile of each number (PATCH /users/profile).
export const AI_NUMBER_NAME = "Ops team (WDG)"
export const BACKUP_NUMBER_NAME = "Ops team 2 (WDG)"

// Fixed "now" for the mock data, so countdowns and next-slot times read consistently.
export const WA_NOW = "2026-11-02T12:30:00"

// ─── WDG numbers ──────────────────────────────────────────────────────────────

export type WaNumberRole = "AI number" | "Backup admin"

// Derived from Whapi's GET /health status: QR → Pending connection, AUTH → Connected,
// user logged out (users.delete webhook) → Disconnected, ERROR / SYNC_ERROR / STOP → Error.
export type WaNumberStatus = "Pending connection" | "Connected" | "Disconnected" | "Error"

export interface WaNumber {
  id: string
  label: string                // admin-given name, portal only (members see the profile name)
  phone: string
  role: WaNumberRole
  status: WaNumberStatus
  statusDetail?: string        // Whapi status text, shown for Error / Disconnected
  linkedAt?: string            // when the number was first connected
  backupAdminId?: string       // AI numbers only
  groupsCreatedToday: number   // AI numbers only
  lastGroupCreatedAt?: string  // AI numbers only
  groupsHeld: number           // groups this number is admin of (AI: created on it; backup: groups it backs up)
}

export function numberName(n: Pick<WaNumber, "role">): string {
  return n.role === "AI number" ? AI_NUMBER_NAME : BACKUP_NUMBER_NAME
}

// How a number is shown on the portal: admin-given name, then the phone number.
export function numberLabel(id: string): string {
  const n = mockWaNumbers.find(x => x.id === id)
  return n ? `${n.label} (${n.phone})` : id
}

export const NUMBER_STATUS_CLS: Record<WaNumberStatus, string> = {
  "Connected":          "bg-green-50 text-green-700 border-green-200",
  "Pending connection": "bg-blue-50 text-blue-700 border-blue-200",
  "Disconnected":       "bg-red-50 text-red-700 border-red-200",
  "Error":              "bg-red-50 text-red-700 border-red-200",
}

// ─── Groups and members ───────────────────────────────────────────────────────

export type WaGroupStatus = "Queued" | "Created" | "Failed"
export type MemberRole = "Mentee" | "Mentor" | "AI number" | "Backup admin"

export type MenteeStatus = "Link sent" | "Joined" | "Left" | "Did not join"
export type MentorStatus = "Link sent" | "Joined" | "Did not join" | "Left" | "Removed"
export type WdgMemberStatus = "Admin" | "Not admin" | "Not in group"
export type MemberStatus = MenteeStatus | MentorStatus | WdgMemberStatus

export interface GroupMember {
  name: string
  phone: string
  role: MemberRole
  status: MemberStatus
  statusAt?: string     // when the current status was set
  requestId?: string    // mentors only: the request this membership belongs to
  linkSentAt?: string
  joinedAt?: string
  remindersSent?: number
}

export type GroupEventType =
  | "Group queued" | "Group created" | "Creation failed"
  | "Link sent" | "Reminder sent" | "Joined" | "Join rejected" | "Did not join"
  | "Left" | "Removed" | "Invite link reset"
  | "Admin takeover started" | "Admin takeover ended"

export interface GroupEvent {
  id: string
  at: string
  type: GroupEventType
  member?: string
  detail?: string
}

export type SenderRole = "Mentee" | "Mentor" | "AI" | "Admin"
export type MediaType = "image" | "video" | "document" | "audio"

export interface GroupMessage {
  id: string
  at: string
  senderName: string
  senderRole: SenderRole
  text: string                 // text body, or caption for media
  media?: { type: MediaType; fileName: string }
  poll?: { title: string; options: string[]; multiple: boolean }
  quotedId?: string
}

export interface WaGroup {
  id: string
  groupName: string
  menteeId: string
  menteeName: string
  aiNumberId: string
  backupAdminId: string
  status: WaGroupStatus
  queuedAt: string
  createdAt?: string
  failureError?: string
  inviteLink?: string
  takeover?: { by: string; since: string }
  members: GroupMember[]
  events: GroupEvent[]
  messages: GroupMessage[]
}

export const mockWaNumbers: WaNumber[] = [
  { id: "WN-1", label: "Batch 1", phone: "+91 90000 10001", role: "AI number", status: "Connected", linkedAt: "2026-01-20T10:00:00", backupAdminId: "WN-B1", groupsCreatedToday: 2, lastGroupCreatedAt: "2026-11-02T11:40:00", groupsHeld: 49 },
  { id: "WN-2", label: "Batch 2", phone: "+91 90000 10002", role: "AI number", status: "Connected", linkedAt: "2026-01-20T10:30:00", backupAdminId: "WN-B2", groupsCreatedToday: 4, lastGroupCreatedAt: "2026-11-02T11:20:00", groupsHeld: 37 },
  { id: "WN-3", label: "Batch 3", phone: "+91 90000 10003", role: "AI number", status: "Disconnected", statusDetail: "Logged out from the phone on 2 Nov, 10:01", linkedAt: "2026-09-05T09:00:00", backupAdminId: "WN-B1", groupsCreatedToday: 0, lastGroupCreatedAt: "2026-11-01T18:05:00", groupsHeld: 12 },
  { id: "WN-B1", label: "Backup A", phone: "+91 90000 20001", role: "Backup admin", status: "Connected", linkedAt: "2026-01-20T11:00:00", groupsCreatedToday: 0, groupsHeld: 61 },
  { id: "WN-B2", label: "Backup B", phone: "+91 90000 20002", role: "Backup admin", status: "Connected", linkedAt: "2026-01-20T11:15:00", groupsCreatedToday: 0, groupsHeld: 37 },
]

const wdg = (id: string): GroupMember => {
  const n = mockWaNumbers.find(x => x.id === id)!
  return { name: numberName(n), phone: n.phone, role: n.role, status: "Admin" }
}

export const mockWaGroups: WaGroup[] = [
  // ── Priya Sharma: Rahul mentored REQ-010, then reconnected for REQ-001 ────
  {
    id: "WG-001", groupName: "ThinkWith | Priya", menteeId: "MTE-001", menteeName: "Priya Sharma",
    aiNumberId: "WN-1", backupAdminId: "WN-B1", status: "Created",
    queuedAt: "2026-03-14T10:03:00", createdAt: "2026-03-14T11:10:00", inviteLink: "https://chat.whatsapp.com/Pr1yaAbC123",
    members: [
      wdg("WN-1"), wdg("WN-B1"),
      { name: "Priya Sharma", phone: "+91 98765 00001", role: "Mentee", status: "Joined", statusAt: "2026-03-14T12:02:00", linkSentAt: "2026-03-14T11:11:00", joinedAt: "2026-03-14T12:02:00" },
      { name: "Rahul Mehta", phone: "+91 98765 11001", role: "Mentor", status: "Removed", statusAt: "2026-04-10T10:00:00", requestId: "REQ-010", linkSentAt: "2026-03-15T11:00:00", joinedAt: "2026-03-15T11:20:00" },
      { name: "Rahul Mehta", phone: "+91 98765 11001", role: "Mentor", status: "Joined", statusAt: "2026-04-30T17:05:00", requestId: "REQ-001", linkSentAt: "2026-04-30T16:30:00", joinedAt: "2026-04-30T17:05:00" },
    ],
    events: [
      { id: "E1", at: "2026-03-14T10:03:00", type: "Group queued", detail: "REQ-010 submitted" },
      { id: "E2", at: "2026-03-14T11:10:00", type: "Group created", detail: "On Batch 1 (+91 90000 10001)" },
      { id: "E3", at: "2026-03-14T11:11:00", type: "Link sent", member: "Priya Sharma" },
      { id: "E4", at: "2026-03-14T12:02:00", type: "Joined", member: "Priya Sharma" },
      { id: "E5", at: "2026-03-15T11:00:00", type: "Link sent", member: "Rahul Mehta", detail: "REQ-010" },
      { id: "E6", at: "2026-03-15T11:20:00", type: "Joined", member: "Rahul Mehta", detail: "REQ-010" },
      { id: "E7", at: "2026-04-10T10:00:00", type: "Removed", member: "Rahul Mehta", detail: "REQ-010 closed" },
      { id: "E8", at: "2026-04-10T10:00:00", type: "Invite link reset" },
      { id: "E9", at: "2026-04-30T16:30:00", type: "Link sent", member: "Rahul Mehta", detail: "REQ-001 (reconnect)" },
      { id: "E10", at: "2026-04-30T17:05:00", type: "Joined", member: "Rahul Mehta", detail: "REQ-001" },
    ],
    messages: [
      { id: "M0", at: "2026-03-15T11:21:00", senderName: AI_NUMBER_NAME, senderRole: "AI", text: "Hi Priya and Rahul! 👋 Rahul will help Priya with *mock interviews*. Most engagements run about 2 weeks with 1 to 3 calls." },
      { id: "M01", at: "2026-04-08T19:00:00", senderName: "Priya Sharma", senderRole: "Mentee", text: "Thank you sir, the mock interviews really helped 🙏" },
      { id: "M1", at: "2026-04-30T17:06:00", senderName: AI_NUMBER_NAME, senderRole: "AI", text: "Welcome back Rahul! 👋 This time Rahul will help Priya with her *resume* and _interview prep_." },
      { id: "M2", at: "2026-04-30T17:20:00", senderName: "Rahul Mehta", senderRole: "Mentor", text: "Hi Priya, happy to help again. Could you share your current resume here?" },
      { id: "M3", at: "2026-04-30T18:02:00", senderName: "Priya Sharma", senderRole: "Mentee", text: "Thank you sir! Sharing it now." },
      { id: "M4", at: "2026-04-30T18:03:00", senderName: "Priya Sharma", senderRole: "Mentee", text: "", media: { type: "document", fileName: "Priya_Resume.pdf" } },
      { id: "M5", at: "2026-05-01T10:15:00", senderName: "Rahul Mehta", senderRole: "Mentor", text: "Thanks. Can we do a call on Saturday 11am?" },
      { id: "M6", at: "2026-05-01T10:40:00", senderName: "Priya Sharma", senderRole: "Mentee", text: "Yes, Saturday 11am works 🙏", quotedId: "M5" },
    ],
  },

  // ── Arjun Patel: both joined, one stranger join request rejected ──────────
  {
    id: "WG-002", groupName: "ThinkWith | Arjun", menteeId: "MTE-002", menteeName: "Arjun Patel",
    aiNumberId: "WN-1", backupAdminId: "WN-B1", status: "Created",
    queuedAt: "2026-04-09T17:03:00", createdAt: "2026-04-09T18:20:00", inviteLink: "https://chat.whatsapp.com/ArJunXyZ789",
    members: [
      wdg("WN-1"), wdg("WN-B1"),
      { name: "Arjun Patel", phone: "+91 98765 00002", role: "Mentee", status: "Joined", statusAt: "2026-04-09T18:45:00", linkSentAt: "2026-04-09T18:21:00", joinedAt: "2026-04-09T18:45:00" },
      { name: "Sneha Rao", phone: "+91 98765 11002", role: "Mentor", status: "Joined", statusAt: "2026-05-03T13:40:00", requestId: "REQ-002", linkSentAt: "2026-05-03T11:15:00", joinedAt: "2026-05-03T13:40:00" },
    ],
    events: [
      { id: "E1", at: "2026-04-09T17:03:00", type: "Group queued", detail: "REQ-009 submitted" },
      { id: "E2", at: "2026-04-09T18:20:00", type: "Group created", detail: "On Batch 1 (+91 90000 10001)" },
      { id: "E3", at: "2026-04-09T18:21:00", type: "Link sent", member: "Arjun Patel" },
      { id: "E4", at: "2026-04-09T18:45:00", type: "Joined", member: "Arjun Patel" },
      { id: "E5", at: "2026-05-03T11:15:00", type: "Link sent", member: "Sneha Rao", detail: "REQ-002" },
      { id: "E6", at: "2026-05-03T13:40:00", type: "Joined", member: "Sneha Rao", detail: "REQ-002" },
      { id: "E7", at: "2026-05-04T09:12:00", type: "Join rejected", member: "+91 99887 66554", detail: "Not the mentee or the current mentor" },
    ],
    messages: [
      { id: "M1", at: "2026-05-03T13:41:00", senderName: AI_NUMBER_NAME, senderRole: "AI", text: "Hi Arjun and Sneha! 👋 Sneha will help Arjun prepare for SDE roles. Most engagements run about 2 weeks with 1 to 3 calls." },
      { id: "M2", at: "2026-05-03T14:05:00", senderName: "Sneha Rao", senderRole: "Mentor", text: "Hey Arjun! Send me:\n- your GitHub\n- the role you're targeting" },
      { id: "M3", at: "2026-05-03T15:30:00", senderName: "Arjun Patel", senderRole: "Mentee", text: "github.com/arjunp. Targeting frontend roles at product companies." },
      { id: "M4", at: "2026-05-04T20:10:00", senderName: "Arjun Patel", senderRole: "Mentee", text: "Can we reschedule to Thursday?" },
    ],
  },

  // ── Kavya Nair: mentee joined, no mentor accepted yet ─────────────────────
  {
    id: "WG-003", groupName: "ThinkWith | Kavya", menteeId: "MTE-003", menteeName: "Kavya Nair",
    aiNumberId: "WN-2", backupAdminId: "WN-B2", status: "Created",
    queuedAt: "2026-06-01T09:04:00", createdAt: "2026-06-01T10:30:00", inviteLink: "https://chat.whatsapp.com/KaVyaQwE456",
    members: [
      wdg("WN-2"), wdg("WN-B2"),
      { name: "Kavya Nair", phone: "+91 98765 00003", role: "Mentee", status: "Joined", statusAt: "2026-06-01T11:05:00", linkSentAt: "2026-06-01T10:31:00", joinedAt: "2026-06-01T11:05:00" },
    ],
    events: [
      { id: "E1", at: "2026-06-01T09:04:00", type: "Group queued", detail: "REQ-003 submitted" },
      { id: "E2", at: "2026-06-01T10:30:00", type: "Group created", detail: "On Batch 2 (+91 90000 10002)" },
      { id: "E3", at: "2026-06-01T10:31:00", type: "Link sent", member: "Kavya Nair" },
      { id: "E4", at: "2026-06-01T11:05:00", type: "Joined", member: "Kavya Nair" },
    ],
    messages: [
      { id: "M1", at: "2026-06-01T11:06:00", senderName: AI_NUMBER_NAME, senderRole: "AI", text: "Hi Kavya! 👋 This is your ThinkWith group. Your mentor will join here once they accept your request." },
      { id: "M2", at: "2026-06-01T11:20:00", senderName: "Kavya Nair", senderRole: "Mentee", text: "Thanks! How long does matching usually take?" },
    ],
  },

  // ── Rohan Das: group created, mentee has not joined ───────────────────────
  {
    id: "WG-004", groupName: "ThinkWith | Rohan", menteeId: "MTE-004", menteeName: "Rohan Das",
    aiNumberId: "WN-2", backupAdminId: "WN-B2", status: "Created",
    queuedAt: "2026-11-01T07:40:00", createdAt: "2026-11-01T09:15:00", inviteLink: "https://chat.whatsapp.com/RoHanAsD321",
    members: [
      wdg("WN-2"), wdg("WN-B2"),
      { name: "Rohan Das", phone: "+91 98765 00004", role: "Mentee", status: "Link sent", statusAt: "2026-11-01T09:16:00", linkSentAt: "2026-11-01T09:16:00", remindersSent: 1 },
    ],
    events: [
      { id: "E1", at: "2026-11-01T07:40:00", type: "Group queued", detail: "REQ-004 submitted" },
      { id: "E2", at: "2026-11-01T09:15:00", type: "Group created", detail: "On Batch 2 (+91 90000 10002)" },
      { id: "E3", at: "2026-11-01T09:16:00", type: "Link sent", member: "Rohan Das" },
      { id: "E4", at: "2026-11-02T09:16:00", type: "Reminder sent", member: "Rohan Das", detail: "Reminder 1 in Mira chat" },
    ],
    messages: [],
  },

  // ── Meena Iyer: creation failed on a disconnected number, retry queued ────
  {
    id: "WG-005", groupName: "ThinkWith | Meena", menteeId: "MTE-005", menteeName: "Meena Iyer",
    aiNumberId: "WN-3", backupAdminId: "WN-B1", status: "Failed",
    queuedAt: "2026-11-02T08:02:00",
    failureError: "Batch 3 (+91 90000 10003) disconnected (logged out).",
    members: [],
    events: [
      { id: "E1", at: "2026-11-02T08:02:00", type: "Group queued", detail: "REQ-005 submitted" },
      { id: "E2", at: "2026-11-02T10:05:00", type: "Creation failed", detail: "Batch 3 (+91 90000 10003) disconnected" },
    ],
    messages: [],
  },

  // ── Two more mentees waiting in the creation queue ────────────────────────
  {
    id: "WG-009", groupName: "ThinkWith | Neha", menteeId: "MTE-009", menteeName: "Neha Gupta",
    aiNumberId: "", backupAdminId: "", status: "Queued", queuedAt: "2026-11-02T11:50:00",
    members: [], events: [{ id: "E1", at: "2026-11-02T11:50:00", type: "Group queued", detail: "First request submitted" }], messages: [],
  },
  {
    id: "WG-010", groupName: "ThinkWith | Farhan", menteeId: "MTE-010", menteeName: "Farhan Ali",
    aiNumberId: "", backupAdminId: "", status: "Queued", queuedAt: "2026-11-02T12:05:00",
    members: [], events: [{ id: "E1", at: "2026-11-02T12:05:00", type: "Group queued", detail: "First request submitted" }], messages: [],
  },

  // ── Siddharth Kumar: first mentor left mid-request, second mentor added ───
  {
    id: "WG-006", groupName: "ThinkWith | Siddharth", menteeId: "MTE-006", menteeName: "Siddharth Kumar",
    aiNumberId: "WN-1", backupAdminId: "WN-B1", status: "Created",
    queuedAt: "2026-05-10T19:03:00", createdAt: "2026-05-10T20:10:00", inviteLink: "https://chat.whatsapp.com/SidKuMzXc654",
    takeover: { by: "Maitreyee", since: "2026-11-02T10:02:00" },
    members: [
      wdg("WN-1"), wdg("WN-B1"),
      { name: "Siddharth Kumar", phone: "+91 98765 00006", role: "Mentee", status: "Joined", statusAt: "2026-05-10T21:00:00", linkSentAt: "2026-05-10T20:11:00", joinedAt: "2026-05-10T21:00:00" },
      { name: "Vikram Singh", phone: "+91 98765 11009", role: "Mentor", status: "Left", statusAt: "2026-10-29T18:40:00", requestId: "REQ-006", linkSentAt: "2026-10-25T10:00:00", joinedAt: "2026-10-25T10:45:00" },
      { name: "Pooja Verma", phone: "+91 98765 11004", role: "Mentor", status: "Link sent", statusAt: "2026-11-02T08:30:00", requestId: "REQ-006", linkSentAt: "2026-11-02T08:30:00" },
    ],
    events: [
      { id: "E1", at: "2026-05-10T19:03:00", type: "Group queued", detail: "REQ-006 submitted" },
      { id: "E2", at: "2026-05-10T20:10:00", type: "Group created", detail: "On Batch 1 (+91 90000 10001)" },
      { id: "E3", at: "2026-05-10T20:11:00", type: "Link sent", member: "Siddharth Kumar" },
      { id: "E4", at: "2026-05-10T21:00:00", type: "Joined", member: "Siddharth Kumar" },
      { id: "E5", at: "2026-10-25T10:00:00", type: "Link sent", member: "Vikram Singh", detail: "REQ-006" },
      { id: "E6", at: "2026-10-25T10:45:00", type: "Joined", member: "Vikram Singh", detail: "REQ-006" },
      { id: "E7", at: "2026-10-29T18:40:00", type: "Left", member: "Vikram Singh", detail: "Left while REQ-006 active. Flagged" },
      { id: "E8", at: "2026-10-30T09:00:00", type: "Invite link reset", detail: "Admin unmatched Vikram Singh and rematched" },
      { id: "E9", at: "2026-11-02T08:30:00", type: "Link sent", member: "Pooja Verma", detail: "REQ-006" },
      { id: "E10", at: "2026-11-02T10:02:00", type: "Admin takeover started", detail: "Maitreyee" },
    ],
    messages: [
      { id: "M1", at: "2026-05-10T21:01:00", senderName: AI_NUMBER_NAME, senderRole: "AI", text: "Hi Siddharth! 👋 This is your ThinkWith group. Your mentor will join here once they accept your request." },
      { id: "M2", at: "2026-10-25T10:46:00", senderName: AI_NUMBER_NAME, senderRole: "AI", text: "Hi Siddharth and Vikram! 👋 Vikram will help Siddharth with *personal finance basics*." },
      { id: "M3", at: "2026-10-26T12:00:00", senderName: "Vikram Singh", senderRole: "Mentor", text: "Hi Siddharth, I'm travelling this week, will get back soon." },
      { id: "M4", at: "2026-11-02T09:55:00", senderName: "Siddharth Kumar", senderRole: "Mentee", text: "I got a message that a new mentor accepted, but nobody has joined yet?" },
      { id: "M5", at: "2026-11-02T10:04:00", senderName: "Maitreyee", senderRole: "Admin", text: "Hi Siddharth, Pooja accepted this morning and has the joining link. We'll update you here once she joins.", quotedId: "M4" },
    ],
  },

  // ── Vikram Rao: request closed, mentor removed ────────────────────────────
  {
    id: "WG-008", groupName: "ThinkWith | Vikram", menteeId: "MTE-008", menteeName: "Vikram Rao",
    aiNumberId: "WN-2", backupAdminId: "WN-B2", status: "Created",
    queuedAt: "2026-01-31T16:03:00", createdAt: "2026-01-31T17:30:00", inviteLink: "https://chat.whatsapp.com/ViKraMnew987",
    members: [
      wdg("WN-2"), wdg("WN-B2"),
      { name: "Vikram Rao", phone: "+91 98765 00008", role: "Mentee", status: "Joined", statusAt: "2026-01-31T18:10:00", linkSentAt: "2026-01-31T17:31:00", joinedAt: "2026-01-31T18:10:00" },
      { name: "Rahul Mehta", phone: "+91 98765 11001", role: "Mentor", status: "Removed", statusAt: "2026-05-05T10:05:00", requestId: "REQ-008", linkSentAt: "2026-02-01T14:00:00", joinedAt: "2026-02-01T14:30:00" },
    ],
    events: [
      { id: "E1", at: "2026-01-31T16:03:00", type: "Group queued", detail: "REQ-008 submitted" },
      { id: "E2", at: "2026-01-31T17:30:00", type: "Group created", detail: "On Batch 2 (+91 90000 10002)" },
      { id: "E3", at: "2026-01-31T17:31:00", type: "Link sent", member: "Vikram Rao" },
      { id: "E4", at: "2026-01-31T18:10:00", type: "Joined", member: "Vikram Rao" },
      { id: "E5", at: "2026-02-01T14:00:00", type: "Link sent", member: "Rahul Mehta", detail: "REQ-008" },
      { id: "E6", at: "2026-02-01T14:30:00", type: "Joined", member: "Rahul Mehta", detail: "REQ-008" },
      { id: "E7", at: "2026-05-05T10:05:00", type: "Removed", member: "Rahul Mehta", detail: "REQ-008 closed" },
      { id: "E8", at: "2026-05-05T10:05:00", type: "Invite link reset" },
    ],
    messages: [
      { id: "M1", at: "2026-02-01T14:31:00", senderName: AI_NUMBER_NAME, senderRole: "AI", text: "Hi Vikram and Rahul! 👋 Rahul will help Vikram with backend development and REST API design." },
      { id: "M2", at: "2026-02-01T15:00:00", senderName: "Rahul Mehta", senderRole: "Mentor", text: "Hi Vikram, let's start with your current project. What stack are you on?" },
      { id: "M3", at: "2026-02-01T15:20:00", senderName: "Vikram Rao", senderRole: "Mentee", text: "Java with Spring Boot." },
      { id: "M4", at: "2026-05-04T18:00:00", senderName: "Vikram Rao", senderRole: "Mentee", text: "Thank you for all the help, Rahul sir 🙏" },
    ],
  },
]

// ─── Derived fields ───────────────────────────────────────────────────────────

const TERMINAL_MENTOR: MemberStatus[] = ["Removed", "Left", "Did not join"]

export function menteeMember(g: WaGroup): GroupMember | undefined {
  return g.members.find(m => m.role === "Mentee")
}

// The mentee's active request: their most recent request (one active request at a time).
export function activeRequest(g: WaGroup) {
  return mockRequests
    .filter(r => r.menteeId === g.menteeId)
    .sort((a, b) => b.requestDate.localeCompare(a.requestDate))[0]
}

// Current mentor: the latest mentor membership on the active request that hasn't ended.
export function currentMentor(g: WaGroup): GroupMember | undefined {
  const req = activeRequest(g)
  if (!req) return undefined
  return [...g.members].reverse().find(m =>
    m.role === "Mentor" && m.requestId === req.id && !TERMINAL_MENTOR.includes(m.status))
}

export function pastMentors(g: WaGroup): GroupMember[] {
  const current = currentMentor(g)
  return g.members.filter(m => m.role === "Mentor" && m !== current)
}

export function requestStatus(requestId: string): RequestStatus | undefined {
  return mockRequests.find(r => r.id === requestId)?.status
}

export function menteeOrgAndGroup(g: WaGroup): { org: string; group: string } {
  const req = mockRequests.find(r => r.menteeId === g.menteeId)
  return { org: req?.ngo ?? "—", group: req?.menteeGroup ?? "—" }
}

export function mentorOrgAndGroup(name: string): { org: string; group: string } {
  const v = mockVolunteers.find(x => x.name === name)
  return { org: v?.currentCompany ?? "—", group: v?.group ?? "—" }
}

// Last message: time of the most recent message posted in the group by anyone (or by one
// sender role). Member events such as joins, removals and link sends don't count.
export function lastMessageAt(g: WaGroup, role?: SenderRole): string | undefined {
  const msgs = role ? g.messages.filter(m => m.senderRole === role) : g.messages
  return msgs.length ? msgs.reduce((a, b) => new Date(a.at) > new Date(b.at) ? a : b).at : undefined
}

export function nextCreationSlot(n: WaNumber, maxGroupsPerNumber: number): string | null {
  if (n.role !== "AI number" || n.status !== "Connected") return null
  if (n.groupsHeld >= maxGroupsPerNumber) return null
  const now = new Date(WA_NOW).getTime()
  if (!n.lastGroupCreatedAt) return WA_NOW
  const earliest = new Date(n.lastGroupCreatedAt).getTime() + MIN_HOURS_BETWEEN_CREATIONS * 60 * 60 * 1000
  return new Date(Math.max(now, earliest)).toISOString()
}

// Tailwind classes for member-status chips, shared by the group chat and activity screens.
export const MEMBER_STATUS_CLS: Record<MemberStatus, string> = {
  "Joined":       "bg-green-50 text-green-700 border-green-200",
  "Admin":        "bg-green-50 text-green-700 border-green-200",
  "Link sent":    "bg-amber-50 text-amber-700 border-amber-200",
  "Did not join": "bg-red-50 text-red-700 border-red-200",
  "Left":         "bg-orange-50 text-orange-700 border-orange-200",
  "Removed":      "bg-gray-100 text-gray-500 border-gray-200",
  "Not admin":    "bg-red-50 text-red-700 border-red-200",
  "Not in group": "bg-red-50 text-red-700 border-red-200",
}

// Status definitions shown in the in-app legend. Same wording as the PRD.
export const STATUS_DEFINITIONS: { role: string; status: string; when: string }[] = [
  { role: "Mentee", status: "Link sent", when: "Group created and joining link sent in the mentee's Mira chat." },
  { role: "Mentee", status: "Joined", when: "Mentee's join request from their registered number is approved." },
  { role: "Mentee", status: "Left", when: "Mentee leaves the group." },
  { role: "Mentee", status: "Did not join", when: "Reminder window ends without a join. Handed to an admin to contact directly." },
  { role: "Mentor", status: "Link sent", when: "Mentor accepts a request and receives the joining link." },
  { role: "Mentor", status: "Joined", when: "Mentor's join request is approved (number matches the mentor on the active request)." },
  { role: "Mentor", status: "Did not join", when: "Mentor join time limit (Configs) passes without a join. Request moves to the next volunteer." },
  { role: "Mentor", status: "Left", when: "Mentor leaves the group on their own. If the request is still active, it is flagged for admin." },
  { role: "Mentor", status: "Removed", when: "System removes the mentor: request Closed, removal delay after Expired passed, mentee unresponsive, or admin unmatched." },
  { role: "Ops team numbers", status: "Admin", when: "Number is in the group as admin. Set at creation." },
  { role: "Ops team numbers", status: "Not admin", when: "Number is in the group, but admin promotion failed." },
  { role: "Ops team numbers", status: "Not in group", when: "Number was removed from the group, or its WhatsApp account was logged out or banned." },
]

export function formatWaTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
}

// Field definitions shown in the in-app legend. Same wording as the PRD.
export const FIELD_DEFINITIONS: { field: string; definition: string }[] = [
  { field: "Request", definition: "The mentee's active request (a mentee has one active request at a time) and its status." },
  { field: "Current mentor", definition: "The latest mentor on the active request whose status is Link sent or Joined. At most one." },
  { field: "Past mentors", definition: "Mentors from earlier requests, and earlier mentors on the same request who Left, were Removed or Did not join." },
  { field: "Created", definition: "Time Whapi returned the group ID for this group." },
  { field: "Last message", definition: "Time of the most recent message posted in the group by anyone: mentee, mentor, Ops team or admin. Joins, removals, link sends and other member events don't count." },
  { field: "Queued at", definition: "Time the mentee submitted their first request and the group entered the creation queue." },
  { field: "Next attempt", definition: "Earliest creation slot on a Connected AI number that is below its batch size and 2+ hours past its last creation." },
  { field: "Groups created", definition: "Groups with status Created." },
  { field: "Created today", definition: "Groups created since 00:00 IST today, across all AI numbers (per number on the Numbers tab)." },
  { field: "Waiting to be created", definition: "Groups with status Queued or Failed." },
  { field: "Mentee not joined", definition: "Created groups where the mentee's status is Link sent or Did not join." },
  { field: "Mentor not joined", definition: "Created groups where the current mentor's status is Link sent." },
  { field: "Numbers not connected", definition: "Ops team numbers whose status is anything other than Connected." },
  { field: "Next allowed creation", definition: "Later of now and the number's last creation + 2 hours. Not shown if the number isn't connected or its batch is full." },
  { field: "Linked since", definition: "When the number was first connected to Whapi by QR code or pairing code." },
  { field: "Groups held", definition: "Groups the number is admin of. AI number: groups created on it. Backup admin: groups it backs up. Groups are not deleted, so this only goes up." },
  { field: "Batch capacity left", definition: "Sum over Connected AI numbers of (max groups per number minus groups held)." },
  { field: "Will be created on", definition: "AI number the queue assigns this group to, and the time of that slot, under the distribution rule." },
]

export const NUMBER_STATUS_DEFINITIONS: { status: WaNumberStatus; whapi: string; when: string }[] = [
  { status: "Pending connection", whapi: "QR", when: "Number added, QR code or pairing code shown, waiting for it to be scanned or entered on the phone." },
  { status: "Connected", whapi: "AUTH", when: "Linked and working. Only Connected AI numbers create groups." },
  { status: "Disconnected", whapi: "users.delete webhook", when: "Logged out on the phone or the session ended. Needs Reconnect (scan again). Groups stay; the backup admin keeps admin rights." },
  { status: "Error", whapi: "ERROR, SYNC_ERROR, STOP", when: "Whapi reports an error or the channel is stopped (billing, deactivation). Needs admin action." },
]

export const GROUP_STATUS_DEFINITIONS: { status: WaGroupStatus; when: string }[] = [
  { status: "Queued", when: "Mentee submitted their first request. Waiting for a creation slot on an AI number." },
  { status: "Created", when: "Group exists on WhatsApp. Ops team numbers are admins, settings applied, mentee link sent." },
  { status: "Failed", when: "Last creation attempt failed. Retried automatically at the next slot; the error is shown in the Creation Queue." },
]

// ─── Engagement link sync ─────────────────────────────────────────────────────

export function groupForMentee(menteeId: string): WaGroup | undefined {
  return mockWaGroups.find(g => g.menteeId === menteeId)
}

// Time the current invite link was issued: the last invite link reset, else group creation.
export function inviteLinkUpdatedAt(g: WaGroup): string | undefined {
  const resets = g.events.filter(e => e.type === "Invite link reset").map(e => e.at)
  return resets.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? g.createdAt
}

// Writes the group's current invite link to the WhatsApp Group Link field of every request of
// that mentee. Runs when the group is created and every time its invite link is reset.
export function syncGroupLinkToRequests(g: WaGroup) {
  if (g.status !== "Created" || !g.inviteLink) return
  mockRequests.filter(r => r.menteeId === g.menteeId).forEach(r => { r.whatsappGroupLink = g.inviteLink })
}

mockWaGroups.forEach(syncGroupLinkToRequests)
