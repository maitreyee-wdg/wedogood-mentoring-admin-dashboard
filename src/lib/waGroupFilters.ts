import {
  activeRequest, currentMentor, menteeMember, menteeOrgAndGroup, mentorOrgAndGroup,
  type WaGroup, type MemberStatus,
} from "@/data/waGroupsData"
import type { RequestStatus } from "@/data/requestsData"

export interface WaGroupFilters {
  menteeName: string
  mentorName: string
  menteeOrgs: string[]
  menteeGroups: string[]
  mentorOrgs: string[]
  mentorGroups: string[]
  requestStatuses: RequestStatus[]
  menteeStatuses: MemberStatus[]
  mentorStatuses: MemberStatus[]
  aiNumbers: string[]
  takeover: "all" | "on" | "off"
  createdWithinDays: "all" | "7" | "30" | "90"
}

export const EMPTY_WA_FILTERS: WaGroupFilters = {
  menteeName: "", mentorName: "",
  menteeOrgs: [], menteeGroups: [], mentorOrgs: [], mentorGroups: [],
  requestStatuses: [], menteeStatuses: [], mentorStatuses: [], aiNumbers: [],
  takeover: "all", createdWithinDays: "all",
}

export function activeFilterCount(f: WaGroupFilters): number {
  return [
    f.menteeName.trim(), f.mentorName.trim(),
    f.menteeOrgs.length, f.menteeGroups.length, f.mentorOrgs.length, f.mentorGroups.length,
    f.requestStatuses.length, f.menteeStatuses.length, f.mentorStatuses.length, f.aiNumbers.length,
    f.takeover !== "all", f.createdWithinDays !== "all",
  ].filter(Boolean).length
}

const mentorsOf = (g: WaGroup) => g.members.filter(m => m.role === "Mentor")

// Mentor name, org and group match any mentor who has been in the group (current or past).
// Mentor status matches the current mentor only; "No mentor" matches groups without one.
export function applyWaGroupFilters(groups: WaGroup[], f: WaGroupFilters, now: string): WaGroup[] {
  const anyOf = <T,>(list: T[], v: T) => list.length === 0 || list.includes(v)
  return groups.filter(g => {
    const mentee = menteeMember(g)
    const mentor = currentMentor(g)
    const mentors = mentorsOf(g)
    const mOrgGroup = menteeOrgAndGroup(g)
    const req = activeRequest(g)

    if (f.menteeName.trim() && !g.menteeName.toLowerCase().includes(f.menteeName.trim().toLowerCase())) return false
    if (f.mentorName.trim() && !mentors.some(m => m.name.toLowerCase().includes(f.mentorName.trim().toLowerCase()))) return false
    if (!anyOf(f.menteeOrgs, mOrgGroup.org)) return false
    if (!anyOf(f.menteeGroups, mOrgGroup.group)) return false
    if (f.mentorOrgs.length && !mentors.some(m => f.mentorOrgs.includes(mentorOrgAndGroup(m.name).org))) return false
    if (f.mentorGroups.length && !mentors.some(m => f.mentorGroups.includes(mentorOrgAndGroup(m.name).group))) return false
    if (f.requestStatuses.length && (!req || !f.requestStatuses.includes(req.status))) return false
    if (f.menteeStatuses.length && (!mentee || !f.menteeStatuses.includes(mentee.status))) return false
    if (f.mentorStatuses.length && (!mentor || !f.mentorStatuses.includes(mentor.status))) return false
    if (!anyOf(f.aiNumbers, g.aiNumberId)) return false
    if (f.takeover === "on" && !g.takeover) return false
    if (f.takeover === "off" && g.takeover) return false
    if (f.createdWithinDays !== "all") {
      if (!g.createdAt) return false
      const days = (new Date(now).getTime() - new Date(g.createdAt).getTime()) / 86_400_000
      if (days > Number(f.createdWithinDays)) return false
    }
    return true
  })
}

// Option lists for the filter drawer, built from the groups so every option matches something.
export function filterOptions(groups: WaGroup[]) {
  const uniq = (xs: string[]) => Array.from(new Set(xs.filter(x => x && x !== "—"))).sort()
  const mentors = groups.flatMap(mentorsOf)
  return {
    menteeOrgs: uniq(groups.map(g => menteeOrgAndGroup(g).org)),
    menteeGroups: uniq(groups.map(g => menteeOrgAndGroup(g).group)),
    mentorOrgs: uniq(mentors.map(m => mentorOrgAndGroup(m.name).org)),
    mentorGroups: uniq(mentors.map(m => mentorOrgAndGroup(m.name).group)),
  }
}
