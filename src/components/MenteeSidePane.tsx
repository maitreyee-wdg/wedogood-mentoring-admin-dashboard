import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { type Mentee, type EngagementStatus } from "@/data/menteesData"
import { mockRequests, ACTIVE_STATUSES, type MentoringRequest } from "@/data/requestsData"
import { X, MapPin, Globe, Target, Phone, Mail, Link, Star, Briefcase, GraduationCap, FileText } from "lucide-react"

export const statusVariant: Record<EngagementStatus, "success" | "warning" | "secondary" | "outline"> = {
  "Active": "success",
  "Pending Match": "warning",
  "Closed": "secondary",
  "On Hold": "outline",
}

export const ngoColor: Record<string, string> = {
  "Akanksha Foundation": "bg-blue-100 text-blue-700",
  "NavGurukul": "bg-green-100 text-green-700",
  "Parivarthan": "bg-purple-100 text-purple-700",
}

export function StarDisplay({ value }: { value: number }) {
  if (!value) return <span className="text-xs text-gray-400 italic">Unrated</span>
  return (
    <span className="flex items-center gap-1">
      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
      <span className="text-xs font-medium text-gray-700">{value.toFixed(1)}</span>
    </span>
  )
}

export function PaneSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">{label}</p>
      {children}
    </div>
  )
}

export function RequestCard({ req }: { req: MentoringRequest }) {
  const statusColor: Record<string, string> = {
    "Draft": "bg-gray-100 text-gray-600",
    "New": "bg-blue-100 text-blue-700",
    "Match Approval Pending": "bg-amber-100 text-amber-700",
    "Mentor Response Pending": "bg-yellow-100 text-yellow-700",
    "No Match Found": "bg-red-100 text-red-600",
    "Matched": "bg-green-100 text-green-700",
    "Closed - Feedback Pending": "bg-gray-100 text-gray-500",
    "Expired": "bg-gray-100 text-gray-400",
    "Closed - With Feedback": "bg-green-50 text-green-600",
  }
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-gray-500">{req.id}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[req.status]}`}>{req.status}</span>
      </div>
      <p className="text-xs font-medium text-gray-800 leading-snug">{req.theme}</p>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>{new Date(req.requestDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
        {req.matchedMentor && <><span>·</span><span className="text-gray-700">👤 {req.matchedMentor}</span></>}
      </div>
      {req.skillsNeeded.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-0.5">
          {req.skillsNeeded.slice(0, 3).map((s) => (
            <span key={s} className="text-xs bg-white border border-gray-200 text-gray-600 px-1.5 py-0.5 rounded">{s}</span>
          ))}
          {req.skillsNeeded.length > 3 && <span className="text-xs text-gray-400">+{req.skillsNeeded.length - 3}</span>}
        </div>
      )}
    </div>
  )
}

export function MenteePane({ mentee, onClose }: { mentee: Mentee; onClose: () => void }) {
  const [tab, setTab] = useState<"profile" | "requests">("profile")

  const menteeRequests = mockRequests.filter((r) => r.menteeId === mentee.id)
  const activeReqs = menteeRequests.filter((r) => ACTIVE_STATUSES.includes(r.status))
  const pastReqs = menteeRequests.filter((r) => !ACTIVE_STATUSES.includes(r.status))

  return (
    <div className="w-[420px] border-l border-gray-200 bg-white flex flex-col overflow-hidden shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
        <p className="font-semibold text-gray-900 text-sm">Mentee Profile</p>
        <div className="flex items-center gap-2">
          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">Edit</button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Avatar + Name */}
      <div className="px-5 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold shrink-0">
            {mentee.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900">{mentee.name}</p>
            <p className="text-xs text-gray-500">{mentee.id} · {mentee.gender} · Age {mentee.age}</p>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <Badge variant={statusVariant[mentee.engagementStatus]}>{mentee.engagementStatus}</Badge>
              {mentee.isStudent && <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Student</span>}
              <StarDisplay value={mentee.rating} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 shrink-0">
        {(["profile", "requests"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-medium capitalize ${tab === t ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
            {t}{t === "requests" ? ` (${menteeRequests.length})` : ""}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-sm">

        {tab === "profile" && (
          <>
            <PaneSection label="NGO & Group">
              <div className="flex flex-col gap-1">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${ngoColor[mentee.ngo] ?? "bg-gray-100 text-gray-700"}`}>{mentee.ngo}</span>
                <span className="text-xs text-gray-600">{mentee.group}</span>
              </div>
            </PaneSection>

            <PaneSection label="Current Role">
              <div className="flex items-start gap-2">
                <Briefcase className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-900 font-medium">{mentee.currentRole}</p>
                  {mentee.currentCompany !== "—" && <p className="text-gray-500 text-xs">{mentee.currentCompany} · {mentee.totalYearsExp} yr{mentee.totalYearsExp !== 1 ? "s" : ""} exp</p>}
                </div>
              </div>
            </PaneSection>

            {mentee.pastExperience.length > 0 && (
              <PaneSection label="Past Experience">
                <div className="space-y-2">
                  {mentee.pastExperience.map((e, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-gray-800 font-medium text-xs">{e.role}</p>
                        <p className="text-gray-500 text-xs">{e.company} · {e.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </PaneSection>
            )}

            <PaneSection label="Education">
              <div className="flex items-start gap-2">
                <GraduationCap className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-900 font-medium">{mentee.education.degree}</p>
                  <p className="text-gray-500 text-xs">{mentee.education.institute}</p>
                  <p className="text-gray-400 text-xs">{mentee.education.level} · {mentee.education.yearOfGraduation}</p>
                </div>
              </div>
            </PaneSection>

            {mentee.skills.length > 0 && (
              <PaneSection label="Skills">
                <div className="flex flex-wrap gap-1.5">
                  {mentee.skills.map((s) => (
                    <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </PaneSection>
            )}

            <PaneSection label="Goals">
              <div className="flex flex-wrap gap-1.5">
                {mentee.goals.map((g) => (
                  <span key={g} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{g}</span>
                ))}
              </div>
            </PaneSection>

            <PaneSection label="Scoped Need">
              <div className="flex items-start gap-2">
                <Target className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-700">{mentee.scopedNeed}</p>
                  {!mentee.knowsTheirNeed && (
                    <p className="text-xs text-amber-600 mt-0.5">⚠ Needs scoping — share options based on goals</p>
                  )}
                </div>
              </div>
            </PaneSection>

            <PaneSection label="Location & Language">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-700">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />{mentee.location}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-700">
                  <Globe className="w-3.5 h-3.5 text-gray-400" />{mentee.language}
                </div>
              </div>
            </PaneSection>

            <PaneSection label="Contact">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-700"><Phone className="w-3.5 h-3.5 text-gray-400" />{mentee.whatsapp}</div>
                <div className="flex items-center gap-2 text-xs text-gray-700"><Mail className="w-3.5 h-3.5 text-gray-400" />{mentee.email}</div>
                {mentee.linkedin !== "—" && (
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <Link className="w-3.5 h-3.5" />
                    <a href={`https://${mentee.linkedin}`} target="_blank" rel="noreferrer" className="hover:underline truncate">{mentee.linkedin}</a>
                  </div>
                )}
                {mentee.resume ? (
                  <div className="flex items-center gap-2 text-xs text-blue-600"><FileText className="w-3.5 h-3.5" /><a href={mentee.resume} target="_blank" rel="noreferrer" className="hover:underline">View Resume</a></div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-gray-400"><FileText className="w-3.5 h-3.5" />Resume not uploaded</div>
                )}
              </div>
            </PaneSection>

            <PaneSection label="Requests Summary">
              <div className="flex gap-4 text-xs">
                <div>
                  <p className="text-gray-400">Total</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{menteeRequests.length}</p>
                </div>
                <div>
                  <p className="text-gray-400">Active</p>
                  <p className="font-semibold text-blue-600 mt-0.5">{activeReqs.length}</p>
                </div>
                <div>
                  <p className="text-gray-400">Past</p>
                  <p className="font-semibold text-gray-500 mt-0.5">{pastReqs.length}</p>
                </div>
              </div>
            </PaneSection>

            <PaneSection label="Joined">
              <p className="text-xs text-gray-700">{new Date(mentee.joinedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
            </PaneSection>
          </>
        )}

        {tab === "requests" && (
          <>
            {activeReqs.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Active Requests</p>
                <div className="space-y-2">
                  {activeReqs.map((r) => <RequestCard key={r.id} req={r} />)}
                </div>
              </div>
            )}

            {pastReqs.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 mt-4">Past Requests</p>
                <div className="space-y-2">
                  {pastReqs.map((r) => <RequestCard key={r.id} req={r} />)}
                </div>
              </div>
            )}

            {menteeRequests.length === 0 && (
              <p className="text-sm text-gray-400 italic text-center py-8">No requests yet</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
