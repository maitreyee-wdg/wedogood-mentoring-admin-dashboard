import { useMemo, useState } from "react"
import { X, Save, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ALL_STATUSES, type MentoringRequest, type RequestStatus } from "@/data/requestsData"
import { mockVolunteers } from "@/data/volunteersData"
import { mockPrograms } from "@/data/programsData"
import { mockVolunteerGroups } from "@/data/groupsData"
import { eligibleVolunteers, orgsTaggedToProgram, volunteerOrgProgramId, type ManualScope } from "@/lib/programMatch"
import { mockOrganizations } from "@/data/organizationsData"
import { ProgramPicker } from "@/components/ProgramPicker"

const inputCls = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white"
const labelCls = "text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5"

export function EditEngagementModal({ request, onSave, onClose }: {
  request: MentoringRequest
  onSave: (updates: Partial<MentoringRequest>) => void
  onClose: () => void
}) {
  const [theme, setTheme] = useState(request.theme)
  const [targetDomain, setTargetDomain] = useState(request.targetDomain)
  const [skillsText, setSkillsText] = useState(request.skillsNeeded.join(", "))
  const [status, setStatus] = useState<RequestStatus>(request.status)
  const [matchedMentor, setMatchedMentor] = useState(request.matchedMentor ?? "")
  const [mentorQuery, setMentorQuery] = useState(request.matchedMentor ?? "")
  const [showMentorList, setShowMentorList] = useState(false)
  const [programId, setProgramId] = useState(request.programId ?? "")
  const [pendingProgramId, setPendingProgramId] = useState<string | null>(null)
  const [scopeMode, setScopeMode] = useState<"all" | "specific">("all")
  const [scopeGroups, setScopeGroups] = useState<string[]>([])
  const [showScopeList, setShowScopeList] = useState(false)

  const effectiveRequest = { ...request, programId: programId || undefined }
  const manualScope: ManualScope = { mode: scopeMode, groupNames: scopeGroups }
  const mentorOptions = eligibleVolunteers(effectiveRequest, mockVolunteers, mockOrganizations, manualScope)
  const taggedVolunteerOrgNames = programId
    ? orgsTaggedToProgram(mockOrganizations, programId, "Volunteer").map(o => o.name)
    : []

  const filteredMentors = useMemo(() => {
    const q = mentorQuery.trim().toLowerCase()
    if (!q) return mentorOptions
    return mentorOptions.filter(v =>
      v.name.toLowerCase().includes(q) ||
      v.currentRole.toLowerCase().includes(q) ||
      v.currentCompany.toLowerCase().includes(q)
    )
  }, [mentorQuery, mentorOptions])

  const selectMentor = (name: string) => {
    setMatchedMentor(name); setMentorQuery(name); setShowMentorList(false)
  }
  const clearMentor = () => {
    setMatchedMentor(""); setMentorQuery(""); setShowMentorList(true)
  }

  const toggleScopeGroup = (name: string) => {
    setScopeGroups(prev => prev.includes(name) ? prev.filter(g => g !== name) : [...prev, name])
  }

  // Rule 3: changing away from an already-set Program needs confirmation first.
  const handleProgramChange = (value: string) => {
    if (programId && value !== programId) setPendingProgramId(value)
    else setProgramId(value)
  }
  const confirmProgramChange = () => {
    if (pendingProgramId !== null) setProgramId(pendingProgramId)
    setPendingProgramId(null)
  }

  const handleSave = () => {
    // Rule 2: if no program is set (neither already on the request, nor picked
    // in this edit) and a new mentor was just assigned, inherit a program from
    // that mentor's Volunteer Organization, if it's tagged to one.
    let finalProgramId = programId || undefined
    const mentorJustAssigned = matchedMentor && matchedMentor !== request.matchedMentor
    if (!request.programId && !programId && mentorJustAssigned) {
      const mentorVolunteer = mockVolunteers.find(v => v.name === matchedMentor)
      const inferred = mentorVolunteer ? volunteerOrgProgramId(mentorVolunteer, mockOrganizations, mockPrograms) : undefined
      if (inferred) finalProgramId = inferred
    }
    onSave({
      theme: theme.trim(),
      targetDomain: targetDomain.trim(),
      skillsNeeded: skillsText.split(",").map(s => s.trim()).filter(Boolean),
      status,
      matchedMentor: matchedMentor || null,
      programId: finalProgramId,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-[560px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-xl z-10">
          <div>
            <h2 className="font-semibold text-gray-900">Edit Engagement</h2>
            <p className="text-xs text-gray-400 mt-0.5">{request.menteeName} · {request.id}</p>
          </div>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className={labelCls}>Theme / Summary</label>
            <input className={inputCls} value={theme} onChange={e => setTheme(e.target.value)} />
          </div>

          <div>
            <label className={labelCls}>Target Domain</label>
            <input className={inputCls} value={targetDomain} onChange={e => setTargetDomain(e.target.value)} />
          </div>

          <div>
            <label className={labelCls}>Program</label>
            <ProgramPicker programs={mockPrograms} value={programId} onSelect={handleProgramChange} placeholder="Search programs…" />
            {pendingProgramId !== null && (
              <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800 leading-relaxed mb-2">
                  This will replace the currently tagged program (<span className="font-medium">{mockPrograms.find(p => p.id === programId)?.name}</span>) with{" "}
                  <span className="font-medium">{pendingProgramId ? mockPrograms.find(p => p.id === pendingProgramId)?.name : "No Program"}</span>. Continue?
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setPendingProgramId(null)}>Cancel</Button>
                  <Button size="sm" className="flex-1" onClick={confirmProgramChange}>Confirm Change</Button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className={labelCls}>Skills Needed <span className="text-gray-400 normal-case font-normal">(comma-separated)</span></label>
            <input className={inputCls} value={skillsText} onChange={e => setSkillsText(e.target.value)}
              placeholder="e.g. Resume Writing, Interview Preparation" />
          </div>

          <div>
            <label className={labelCls}>Status</label>
            <select className={inputCls} value={status} onChange={e => setStatus(e.target.value as RequestStatus)}>
              {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className={labelCls}>Matched Mentor</label>

            {programId ? (
              <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-2">
                {taggedVolunteerOrgNames.length > 0
                  ? <>Tagged to Program <span className="font-medium text-gray-700">{mockPrograms.find(p => p.id === programId)?.name}</span> — matching from volunteers under: <span className="font-medium text-gray-700">{taggedVolunteerOrgNames.join(", ")}</span></>
                  : <>Tagged to Program <span className="font-medium text-gray-700">{mockPrograms.find(p => p.id === programId)?.name}</span> — no eligible volunteers, no Volunteer Organizations are tagged to it yet.</>}
              </p>
            ) : (
              <div className="mb-2">
                <div className="flex gap-2 mb-1.5">
                  <button type="button" onClick={() => { setScopeMode("all"); setShowScopeList(false) }}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${scopeMode === "all" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"}`}>
                    All Volunteers
                  </button>
                  <button type="button" onClick={() => setScopeMode("specific")}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${scopeMode === "specific" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"}`}>
                    Specific Groups
                  </button>
                </div>
                {scopeMode === "specific" && (
                  <div className="relative">
                    <button type="button" onClick={() => setShowScopeList(o => !o)}
                      className="w-full text-left text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white flex items-center justify-between">
                      <span className="text-gray-600">{scopeGroups.length === 0 ? "Select volunteer groups…" : scopeGroups.join(", ")}</span>
                    </button>
                    {showScopeList && (
                      <div className="absolute z-10 mt-1 w-full border border-gray-200 rounded-lg bg-white shadow-md max-h-48 overflow-y-auto">
                        {mockVolunteerGroups.map(g => (
                          <label key={g.id} className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer">
                            <input type="checkbox" checked={scopeGroups.includes(g.name)} onChange={() => toggleScopeGroup(g.name)} />
                            {g.name}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
              <input
                className={inputCls + " pl-9"}
                placeholder="Search by name, role, or company…"
                value={mentorQuery}
                onChange={e => { setMentorQuery(e.target.value); setMatchedMentor(""); setShowMentorList(true) }}
                onFocus={() => setShowMentorList(true)}
                onBlur={() => setTimeout(() => setShowMentorList(false), 150)}
              />
              {matchedMentor && !showMentorList && (
                <button type="button" onClick={clearMentor} className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {showMentorList && (
              <div className="mt-2 border border-gray-200 rounded-lg max-h-56 overflow-y-auto divide-y divide-gray-100">
                <button type="button" onMouseDown={clearMentor}
                  className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:bg-gray-50">
                  — Not matched —
                </button>
                {filteredMentors.length === 0 ? (
                  <p className="px-3 py-3 text-xs text-gray-400 italic text-center">No mentors found</p>
                ) : filteredMentors.map(v => (
                  <div key={v.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50/30">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900">{v.name}</p>
                      {(v.currentRole || v.currentCompany) && (
                        <p className="text-xs text-gray-500">{v.currentRole}{v.currentRole && v.currentCompany ? " · " : ""}{v.currentCompany}</p>
                      )}
                      {v.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {v.skills.slice(0, 3).map(s => (
                            <span key={s} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{s}</span>
                          ))}
                          {v.skills.length > 3 && <span className="text-[10px] text-gray-400">+{v.skills.length - 3} more</span>}
                        </div>
                      )}
                    </div>
                    <button type="button" onMouseDown={() => selectMentor(v.name)}
                      className="px-3 py-1.5 border border-blue-300 text-blue-600 hover:bg-blue-50 text-xs font-semibold rounded-lg shrink-0">
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSave}><Save className="w-3.5 h-3.5 mr-1.5" />Save Changes</Button>
        </div>
      </div>
    </div>
  )
}
