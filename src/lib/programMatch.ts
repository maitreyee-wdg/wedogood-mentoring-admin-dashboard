import type { Program } from "@/data/programsData"
import type { Organization, OrgType } from "@/data/organizationsData"
import type { Volunteer } from "@/data/volunteersData"
import type { MentoringRequest } from "@/data/requestsData"

// A Beneficiary or Volunteer Organization can only be tagged to a Program that's
// active and not Projects-only.
export function canTagOrgToProgram(program: Program): boolean {
  return program.status !== "Closed" && program.type !== "Projects"
}

export function taggableProgramOptions(programs: Program[]): Program[] {
  return programs.filter(canTagOrgToProgram)
}

export function orgsTaggedToProgram(organizations: Organization[], programId: string, type: OrgType): Organization[] {
  return organizations.filter((o) => o.type === type && o.programs.includes(programId))
}

export interface ManualScope {
  mode: "all" | "specific"
  groupNames: string[]
}

export const ALL_VOLUNTEERS_SCOPE: ManualScope = { mode: "all", groupNames: [] }

// Eligible volunteer pool for an engagement's mentor/candidate picker.
// If the engagement has a Program, restrict to volunteers whose current company
// matches a Volunteer Organization currently tagged to that Program — resolved live,
// not frozen at whatever was tagged when the engagement was created.
// Otherwise fall back to the admin's manual scope (all volunteers, or specific groups).
export function eligibleVolunteers(
  request: MentoringRequest,
  volunteers: Volunteer[],
  organizations: Organization[],
  manualScope: ManualScope = ALL_VOLUNTEERS_SCOPE
): Volunteer[] {
  const base = volunteers.filter((v) => v.volunteeringType === "Mentoring" || v.volunteeringType === "Both")

  if (request.programId) {
    const orgNames = new Set(orgsTaggedToProgram(organizations, request.programId, "Volunteer").map((o) => o.name))
    // No Volunteer Organizations tagged to the Program yet — fall back to all volunteers
    // rather than showing an empty pool.
    if (orgNames.size === 0) return base
    return base.filter((v) => orgNames.has(v.currentCompany))
  }

  if (manualScope.mode === "specific" && manualScope.groupNames.length > 0) {
    return base.filter((v) => manualScope.groupNames.includes(v.group))
  }

  return base
}

// The Program tagged to a volunteer's Volunteer Organization, if any — used to
// auto-fill an engagement's Program when that volunteer becomes the assigned
// mentor and the engagement doesn't already have one. Never resolves to a
// Closed program (defense in depth, even though orgs can't tag one in the first place).
export function volunteerOrgProgramId(
  volunteer: Volunteer,
  organizations: Organization[],
  programs: Program[]
): string | undefined {
  const org = organizations.find((o) => o.type === "Volunteer" && o.name === volunteer.currentCompany)
  const programId = org?.programs[0]
  if (!programId) return undefined
  const program = programs.find((p) => p.id === programId)
  return program && canTagOrgToProgram(program) ? programId : undefined
}
