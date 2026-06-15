import { useState } from "react"
import {
  X, Star, Briefcase, Mail, Phone, Link, FileText,
  MessageSquare, Pencil, CheckSquare,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { type Volunteer, type OrientationStatus } from "@/data/volunteersData"

// ── helpers (mirrored from Volunteers.tsx) ────────────────────────────────────

const orientationVariant: Record<OrientationStatus, "success" | "warning" | "secondary" | "outline"> = {
  "Orientation Done":        "success",
  "Orientation Slot Booked": "secondary",
  "Orientation Pending":     "warning",
  "Orientation Rescheduled": "outline",
}


function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
      <span className="text-sm font-medium text-gray-700">{value.toFixed(1)}</span>
    </div>
  )
}

function DrawerSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">{label}</p>
      {children}
    </div>
  )
}

// ── VolunteerPane ─────────────────────────────────────────────────────────────

export function VolunteerPane({
  volunteer: v,
  onClose,
}: {
  volunteer: Volunteer
  onClose: () => void
}) {
  const [drawerTab, setDrawerTab] = useState<"profile" | "orientation" | "requests" | "ratings">("profile")

  return (
    <div className="w-96 border-l border-gray-200 bg-white flex flex-col overflow-hidden shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
        <p className="font-semibold text-gray-900 text-sm">Mentor Profile</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Avatar + name */}
      <div className="px-5 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg font-bold shrink-0">
            {v.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900">{v.name}</p>
            <p className="text-xs text-gray-500">{v.currentRole} · {v.currentCompany}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <StarRating value={v.rating} />
              <span className="text-xs text-gray-400">·</span>
              <Badge variant={v.engagementStatus === "Active" ? "success" : "secondary"}>
                {v.engagementStatus}
              </Badge>
              <Badge variant={v.availability === "Available" ? "success" : "warning"}>
                {v.availability}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 shrink-0">
        {(["profile", "orientation", "requests", "ratings"] as const).map(tab => (
          <button key={tab} onClick={() => setDrawerTab(tab)}
            className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${drawerTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-sm">

        {/* ── PROFILE ── */}
        {drawerTab === "profile" && (
          <>
            <DrawerSection label="Current Position">
              <div className="flex items-start gap-2">
                <Briefcase className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-900 font-medium">{v.currentRole}</p>
                  <p className="text-gray-500 text-xs">{v.currentCompany} · {v.totalYearsExp} yrs total exp</p>
                </div>
              </div>
            </DrawerSection>

            <DrawerSection label="Past Experience">
              <div className="space-y-2">
                {v.pastExperience.map((e, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-gray-800 font-medium text-xs">{e.role}</p>
                      <p className="text-gray-500 text-xs">{e.company} · {e.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </DrawerSection>

            <DrawerSection label="Skills">
              <div className="flex flex-wrap gap-1.5">
                {v.skills.map(s => (
                  <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            </DrawerSection>

            <DrawerSection label="Interested in Mentoring">
              <div className="flex flex-wrap gap-1.5">
                {v.interestedIn.map(i => (
                  <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{i}</span>
                ))}
              </div>
            </DrawerSection>

            <DrawerSection label="Mentor Group">
              <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">{v.group}</span>
            </DrawerSection>

            <DrawerSection label="Contact">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-gray-700 text-xs">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />{v.whatsapp}
                </div>
                <div className="flex items-center gap-2 text-gray-700 text-xs">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />{v.email}
                </div>
                <div className="flex items-center gap-2 text-gray-700 text-xs">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />{v.officialEmail}
                  <span className="text-gray-400">(official)</span>
                </div>
                <div className="flex items-center gap-2 text-blue-600 text-xs">
                  <Link className="w-3.5 h-3.5" />
                  <a href={`https://${v.linkedin}`} target="_blank" rel="noreferrer" className="hover:underline truncate">
                    {v.linkedin}
                  </a>
                </div>
                {v.resume ? (
                  <div className="flex items-center gap-2 text-blue-600 text-xs">
                    <FileText className="w-3.5 h-3.5" />
                    <a href={v.resume} target="_blank" rel="noreferrer" className="hover:underline">View Resume</a>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <FileText className="w-3.5 h-3.5" />Resume not uploaded
                  </div>
                )}
              </div>
            </DrawerSection>
          </>
        )}

        {/* ── ORIENTATION ── */}
        {drawerTab === "orientation" && (
          <>
            <DrawerSection label="Current Status">
              <Badge variant={orientationVariant[v.orientationStatus]}>
                {v.orientationStatus}
                {v.orientationDate && ` · ${v.orientationDate}`}
              </Badge>
            </DrawerSection>
            <DrawerSection label="Update Status">
              <Select defaultValue={v.orientationStatus} className="w-full text-xs">
                <option>Orientation Pending</option>
                <option>Orientation Slot Booked</option>
                <option>Orientation Done</option>
                <option>Orientation Rescheduled</option>
              </Select>
              <Button size="sm" className="mt-2 w-full">Save Status</Button>
            </DrawerSection>
          </>
        )}

        {/* ── REQUESTS ── */}
        {drawerTab === "requests" && (
          <>
            <DrawerSection label="Active Request">
              {v.activeRequest ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1">
                  <p className="text-xs font-semibold text-green-800">{v.activeRequest.id}</p>
                  <p className="text-xs text-green-700">Mentee: <strong>{v.activeRequest.menteeName}</strong></p>
                  <p className="text-xs text-green-700">Skill: {v.activeRequest.skill}</p>
                  <p className="text-xs text-gray-500">Since {v.activeRequest.startedAt}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No active request</p>
              )}
            </DrawerSection>

            <DrawerSection label={`Past Requests (${v.pastRequests.length})`}>
              {v.pastRequests.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No past requests</p>
              ) : (
                <div className="space-y-3">
                  {v.pastRequests.map(r => (
                    <div key={r.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1">
                      <p className="text-xs font-semibold text-gray-700">{r.id}</p>
                      <p className="text-xs text-gray-700">Mentee: <strong>{r.menteeName}</strong></p>
                      <p className="text-xs text-gray-600">Skill: {r.skill}</p>
                      <p className="text-xs text-gray-400">Closed: {r.closedAt}</p>
                      {r.feedback && <p className="text-xs text-gray-600 italic mt-1">"{r.feedback}"</p>}
                      {r.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs text-gray-600">{r.rating}/5</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </DrawerSection>
          </>
        )}

        {/* ── RATINGS ── */}
        {drawerTab === "ratings" && (
          <>
            <DrawerSection label="Overall Rating">
              <div className="flex items-center gap-3">
                <div className="text-4xl font-bold text-gray-900">{v.rating.toFixed(1)}</div>
                <div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className={`w-4 h-4 ${i <= Math.round(v.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Avg of {v.pastRequests.filter(r => r.rating).length} ratings
                  </p>
                </div>
              </div>
            </DrawerSection>

            <DrawerSection label="Ratings by Mentee">
              {v.pastRequests.filter(r => r.rating).length === 0 ? (
                <p className="text-xs text-gray-400 italic">No ratings yet</p>
              ) : (
                <div className="space-y-2">
                  {v.pastRequests.filter(r => r.rating).map(r => (
                    <div key={r.id} className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium text-gray-800">{r.menteeName}</p>
                        {r.feedback && <p className="text-xs text-gray-500 italic">"{r.feedback}"</p>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-medium">{r.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DrawerSection>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-100 flex gap-2 shrink-0">
        <Button size="sm" className="flex-1">
          <Pencil className="w-3.5 h-3.5" />Edit Profile
        </Button>
        <Button size="sm" variant="outline">
          <MessageSquare className="w-3.5 h-3.5" />Message
        </Button>
        <Button size="sm" variant="outline">
          <CheckSquare className="w-3.5 h-3.5" />Orientation
        </Button>
      </div>
    </div>
  )
}
