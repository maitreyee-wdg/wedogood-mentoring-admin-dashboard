# UX Proposal — Program Tagging via Organizations

Companion to `PRD_Program_Tagging.md`. Covers the four screens/flows this feature touches.

Note: the Organizations page already exists (`src/pages/groups/Organizations.tsx`, route `/groups/organizations`, nav entry already present under Groups → Organizations). `Organization.programs: string[]` already exists on the data model too. This proposal only covers what's added to what's already there — not a new page.

## 1. Organizations page — additions

In the existing side pane (`OrgPane`, `Organizations.tsx:237-249`), the "Associated Programs" block currently renders `org.programs` as plain read-only pills, with no way to change them. Replace that block with an editable control, identical for both org types:

* Single-select Program dropdown, plus a "No Program" option to clear it. Picking a new Program while one is already tagged replaces it — not additive. Both Beneficiary and Volunteer orgs are capped at one Program at a time (revised from an earlier draft that let Volunteer orgs hold several — that created ambiguity for rule 2 below, so it's one-to-one for both now).
* Excludes Closed programs and Projects-only programs from the options entirely, rather than allowing the pick and erroring afterward.
* Everything else on this page — tabs, search, Add-org modal, POC management, meeting log, archive — is unchanged.

## 2. Programs page — additions

On the existing Program detail view (`src/pages/groups/Programs.tsx`), add two read-only display blocks, next to where "Linked Mentee Groups" already renders:

* **Tagged Beneficiary Organizations** — org names currently pointing at this Program (reverse lookup of `Organization.programs`, not stored on Program itself).
* **Tagged Volunteer Organizations** — same, for volunteer orgs.

Both are display-only here — the actual tagging action happens on the Organizations page's side pane, to keep a single place where the tag is set. Clicking an org name in either list could deep-link to that org's side pane on the Organizations page.

If the Program is Closed or Projects-only, show a short note under these blocks: "Organizations cannot be tagged to this Program" — explains why an admin won't find it in the Organizations page's picker.

## 3. Engagement view — additions

Two places currently show/edit engagement fields: the Requests/Active-Requests side pane (read view) and `EditEngagementModal` (edit view).

* **Side pane** — add a "Program" row next to the existing NGO/Type fields, showing the resolved Program name or "No Program".
* **Edit modal** — add a Program field:
  * Editable dropdown listing all Programs, regardless of how the current value got there — auto-assignment isn't a locked state, it's just how the initial value was set.
  * A "Clear" option to remove the Program entirely, returning the engagement to the no-Program / manual-scope behavior.
  * No indicator of "this came from auto-assignment" — once saved, a Program on an engagement is just a Program on an engagement.

## 4. Mentor/candidate picker — behavior changes

Applies to `EditEngagementModal`'s mentor search and `ManualAssignModal` (Active Requests' Assign/Add-to-Queue flow) — both consume the same underlying pool.

* **Engagement has a Program:** a static line — "Matching from volunteers under: [Volunteer Org A], [Volunteer Org B]" — the Program's currently tagged Volunteer Organizations, matched against each volunteer's `currentCompany`. No toggle here — informational only. If that list is empty, it reads "No eligible volunteers for this Program" instead, with no fallback to all volunteers.
* **Engagement has no Program:** a two-option control — **All Volunteers** (default) / **Specific Groups**, revealing a multi-select of Volunteer Groups when the latter is picked.
* In both cases, the existing free-text search (by name/role/company/skill) continues to work as a secondary filter on top of whichever pool is active.
* Caveat carried over from the data model: eligibility is decided by exact string match (`currentCompany` against `Organization.name`), the same mechanism used elsewhere in this app — a typo or a later rename of either value would silently drop a volunteer out of eligibility with no warning shown anywhere.

## 5. Where the "Match from" choice is surfaced — revised

Earlier drafts of this feature placed the All Volunteers/Specific Groups control as a persistent block at the top of the Match tab, visible regardless of what the admin was doing. That's been corrected: the control only makes sense at the moment matching is actually (re)triggered, so it now lives inside the actions that trigger it, not floating in the tab on its own:

* **Individual retrigger** — `ConfirmRematchModal` ("Trigger Rematch" / "Trigger AI Rematch") and `UnmatchReasonModal` ("Unmatch & Rematch") each show the scope control (info line if the engagement has a Program, else the All Volunteers/Specific Groups toggle) directly above their confirm button.
* **Bulk retrigger** — the "Trigger Rematch" bulk action on the All Engagements list opens a `BulkRematchModal` with the same toggle, scoped to whichever selected engagements don't already have a Program (Program-tagged engagements in the selection keep their own tagged pool regardless of what's picked here).
* The scope choice still isn't persisted anywhere (consistent with the original design) — for the bulk case specifically, since there's no per-engagement session to hold it, confirming applies the ordinary rematch reset (clear candidates, status back to "New") to every selected engagement; the chosen scope is a parameter of that action's intent, not a value written onto the record.
* The Match tab itself no longer shows this control ambiently — it goes straight into the status-specific content (candidate list, outreach progress, etc.).

## 6. How an engagement actually gets its Program — precedence

Three ways an engagement ends up with a Program, checked in this order, none of which ever overwrites a value the previous step already set:

1. **At creation, from the mentee's Beneficiary Organization.** If the mentee's org (matched by `ngo`) is tagged to a Program, the new engagement inherits it immediately. No UI for this — it's not implementable in this codebase since there's no engagement-creation flow here (engagements only exist as mock/seed data); documented as intended behavior for wherever engagement creation actually lives.
2. **At mentor assignment, from the volunteer's Volunteer Organization — only if step 1 left the engagement with no Program.** The moment a volunteer becomes the assigned mentor (`ManualAssignModal`'s "Assign Mentor Directly", or setting Matched Mentor directly in `EditEngagementModal`), if the engagement still has no Program, it inherits the one tagged to that volunteer's org (matched by `currentCompany`). If the engagement already has a Program — from step 1, a previous instance of this step, or a manual set — this step does nothing.
3. **Manual, any time, always wins — but warns before overwriting.** Admin can set or clear an engagement's Program directly via `EditEngagementModal`'s Program dropdown, or in bulk from the All Engagements list. If the engagement already has a Program, both surfaces show a confirmation naming what's being replaced before applying — see sections below.

### Engagement edit form

In `EditEngagementModal`, changing the Program dropdown away from an already-set value doesn't apply immediately — it shows an inline warning ("This will replace the currently tagged program (X) with Y. Continue?") with Cancel/Confirm. Selecting a value when the field was previously empty applies immediately, no warning needed since nothing is being overwritten.

### Bulk assign

The "Assign to Program…" bulk action on All Engagements checks the selection first: if any selected engagement already has a *different* Program, a modal shows the count and asks for confirmation before applying to the whole selection (including the ones with no conflict).
