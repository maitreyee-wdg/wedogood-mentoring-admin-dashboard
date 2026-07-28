Feature: Program Tagging via Organizations

* Admin tags a Beneficiary Organization or Volunteer Organization to a Program
* An engagement inherits a Program in priority order: its mentee's Beneficiary Organization at creation, else its assigned mentor's Volunteer Organization at the moment of assignment, else an admin sets it manually
* The mentor/candidate picker for a Program-tagged engagement is restricted to volunteers belonging to that Program's tagged Volunteer Organization

Problems

* A corporate or CSR partner that sponsors volunteers for a specific program needs to confirm those volunteers only mentor within that program's mentees, for the partner's own funding and impact reporting — matching today pulls from every volunteer in the system regardless of which partner sponsored them.
* An NGO or funder that sponsors a mentee cohort needs confirmation that those mentees were served by volunteers belonging to that program, not just whoever was available — there is no relationship today between a mentee's engagement and any program at all.
* Answering either of the above today means an admin manually cross-checking the mentee's NGO against the volunteer's employer for each engagement, one at a time — no record on the engagement itself states which program it belongs to.

Hypothesis

* Restricting an engagement's candidate pool to volunteers under its program's tagged Volunteer Organizations keeps a sponsoring partner's volunteers confined to the program they were sponsored for, satisfying that partner's reporting requirement.
* Auto-assigning a Program to every engagement from its mentee's Beneficiary Organization gives every mentee request a program attribution from the moment it's created, so a funder's cohort can be confirmed as served within their own program.
* Recording the Program directly on the engagement, instead of reconstructing it from separate NGO and employer fields, lets an admin answer a funder or partner's "were your people/beneficiaries kept within your program" question by reading one field, not cross-checking two.
* Falling back to the assigned mentor's Volunteer Organization when the mentee's Beneficiary Organization isn't tagged still gives that engagement a program attribution, instead of leaving it permanently unattributed whenever the mentee side wasn't set up first.

Scope

What is included:
* Editable Program tag on an Organization, added to the existing side pane in `src/pages/groups/Organizations.tsx` (today `programs` is stored on the `Organization` record but only ever rendered read-only — no control sets it)
* A Beneficiary Organization or a Volunteer Organization can each be tagged to at most one Program at a time
* Tagging either organization type to a Program is unavailable when that Program's type is "Projects"
* Tagging either organization type to a Program is unavailable when that Program's status is "Closed"
* New `programId` field on Engagement (`MentoringRequest`)
* New engagement automatically assigned the Program tagged to the Beneficiary Organization whose name matches the engagement's `ngo`, at the moment the engagement is created
* If the engagement still has no Program when a volunteer becomes its assigned mentor, it's assigned the Program tagged to that volunteer's Volunteer Organization (matched by `currentCompany`), if any
* Neither of the above ever overwrites a Program the engagement already has — each only fills the field when it's empty
* Admin can manually set or clear the Program on an existing engagement at any time; if the engagement already has a Program, changing or clearing it shows a confirmation warning first
* Engagements whose `ngo` doesn't match any Beneficiary Organization, or whose matching Beneficiary Organization has no Program tag, are created with no Program
* Program detail page (`src/pages/groups/Programs.tsx`) shows which Beneficiary Organizations and which Volunteer Organizations are currently tagged to it
* Mentor/candidate picker (`EditEngagementModal`, `ManualAssignModal`) restricts the volunteer list to volunteers whose `currentCompany` matches a Volunteer Organization currently tagged to the engagement's Program, when the engagement has a Program
* That restricted list reflects whichever Volunteer Organizations are tagged to the Program at the time of matching, not at the time the engagement was created
* Mentor/candidate picker for an engagement with no Program shows a control to choose "All Volunteers" or one or more specific Volunteer Groups
* That All-Volunteers/Specific-Groups choice is not saved — it resets every time the picker is reopened
* Picker shows "no eligible volunteers" when the resolved pool is empty
* Bulk-assign a Program to multiple selected engagements at once, from the All Engagements list's existing bulk action bar; if any selected engagement already has a different Program, a warning shows before applying

What is not included:
* A new Organizations page or entity — `Organization` and its list/detail UI already exist; this feature only adds the Program tag control and the rules around it
* Any change to Mentee Group or Volunteer Group, or to `units` on Organization — all remain unrelated to Program tagging
* Any change to `Program.organization` (existing sponsor-name field)
* A Group-level or individual-volunteer-level tagging or exclusion mechanism
* Recomputing an engagement's Program once it already has one — the volunteer-org fallback only ever fills an empty field, it never overwrites; only a manual change (with its warning) can do that
* Any computed matching algorithm — the picker stays a manual search-and-add workflow, only the candidate pool is restricted
* Assigning a Program to engagements that existed before this feature ships
* An automatic fallback when the resolved volunteer pool is empty
* An id-based link between Engagement/Volunteer and Organization — matching stays on exact string equality (`ngo` / `currentCompany` against `Organization.name`), the same mechanism already used elsewhere in this codebase

User experience

* Admin portal (live): https://wedogood-mentoring-admin-dashboard.vercel.app/ — Groups → Organizations (existing page, extended by this feature)
* Admin portal (live): Groups → Programs (existing page, extended by this feature)
* Repo — Organization entity/page: `src/pages/groups/Organizations.tsx`, `src/data/organizationsData.ts`
* Repo — mentor/candidate picker components to be changed: `src/components/EditEngagementModal.tsx`, `src/pages/mentees/ActiveRequests.tsx`

Acceptance Criteria

* Admin can tag a Beneficiary Organization to a Program from the Organization's side pane
* Admin can tag a Volunteer Organization to a Program from the Organization's side pane
* Tagging a second Program to an Organization (Beneficiary or Volunteer) that already has one replaces the existing tag — neither type can hold more than one
* Tagging either organization type to a Program is unavailable when that Program's type is "Projects"
* Tagging either organization type to a Program is unavailable when that Program's status is "Closed"
* Creating an engagement whose `ngo` matches a Beneficiary Organization tagged to a Program sets that engagement's Program automatically
* Creating an engagement whose `ngo` doesn't match any Beneficiary Organization, or whose matching Beneficiary Organization has no Program tag, leaves that engagement's Program unset
* An engagement's Program does not change on its own after creation from a Beneficiary Organization re-tag, even if that org's tag changes or is removed afterward
* Assigning a mentor to an engagement that has no Program yet sets that engagement's Program to the one tagged to the mentor's Volunteer Organization, if any
* Assigning a mentor never changes an engagement's Program if it already has one
* Admin can manually set or clear an engagement's Program at any time
* If the engagement already has a Program, changing or clearing it via the edit form shows a confirmation warning before applying, naming the program being replaced
* Bulk-assigning a Program to multiple selected engagements shows a warning naming how many of them already have a different Program, before applying to all of them
* The mentor/candidate picker, for an engagement with a Program, lists only volunteers whose `currentCompany` matches the Volunteer Organization currently tagged to that Program
* That list reflects the Program's currently tagged Volunteer Organization, not whatever was tagged when the engagement was created
* The mentor/candidate picker, for an engagement with no Program, shows a choice between "All Volunteers" and one or more specific Volunteer Groups
* That All-Volunteers/Specific-Groups choice is not retained the next time the picker is opened for the same engagement
* The mentor/candidate picker shows "no eligible volunteers" when the resolved pool is empty, with no volunteers shown outside that pool
* Program detail page lists the Beneficiary Organization and Volunteer Organization currently tagged to it
* Admin can select multiple engagements in the All Engagements list and assign a Program to all of them in one action
