import { mockSettings } from "@/data/settingsData"
import {
  mockWaGroups, mockWaNumbers, MIN_HOURS_BETWEEN_CREATIONS, WA_NOW,
  type WaGroup, type WaNumber,
} from "@/data/waGroupsData"

export interface PlannedCreation {
  groupId: string
  numberId: string | null   // null when every AI number is full or not connected
  at: string | null
}

const GAP_MS = MIN_HOURS_BETWEEN_CREATIONS * 60 * 60 * 1000

// Distribution rule. Queued and Failed groups are taken in the order they were queued. Each one
// goes to a Connected AI number that holds fewer groups than the batch size (Configs, default 50).
// Among those, the number with the earliest allowed slot wins (2 hours after its last creation).
// Ties go to the number holding the most groups, so batches fill one at a time,
// then to the number linked first. When no number has space, the group waits for a new number.
export function planCreationQueue(
  groups: WaGroup[],
  numbers: WaNumber[],
  batchSize: number = mockSettings.maxGroupsPerNumber,
  now: string = WA_NOW,
): PlannedCreation[] {
  const nowMs = new Date(now).getTime()
  const sim = numbers
    .filter(n => n.role === "AI number" && n.status === "Connected")
    .map(n => ({
      id: n.id,
      held: n.groupsHeld,
      linkedAt: n.linkedAt ?? "",
      last: n.lastGroupCreatedAt ? new Date(n.lastGroupCreatedAt).getTime() : null,
    }))

  return groups
    .filter(g => g.status !== "Created")
    .sort((a, b) => new Date(a.queuedAt).getTime() - new Date(b.queuedAt).getTime())
    .map(g => {
      let best: { s: (typeof sim)[number]; at: number } | null = null
      for (const s of sim) {
        if (s.held >= batchSize) continue
        const at = Math.max(nowMs, s.last !== null ? s.last + GAP_MS : nowMs)
        const better = !best
          || at < best.at
          || (at === best.at && (s.held > best.s.held || (s.held === best.s.held && s.linkedAt < best.s.linkedAt)))
        if (better) best = { s, at }
      }
      if (!best) return { groupId: g.id, numberId: null, at: null }
      const s = best.s
      s.held += 1
      s.last = best.at
      return { groupId: g.id, numberId: s.id, at: new Date(best.at).toISOString() }
    })
}

export function plannedCreationFor(groupId: string): PlannedCreation | undefined {
  return planCreationQueue(mockWaGroups, mockWaNumbers).find(p => p.groupId === groupId)
}
