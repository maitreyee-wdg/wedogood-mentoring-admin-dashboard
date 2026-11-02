// Admin-configurable platform settings. Mock/in-memory, mirroring the other *Data.ts files —
// mutate `mockSettings` directly and every screen that reads it picks up the new value.

export interface AppSettings {
  maxConcurrentEngagementsPerVolunteer: number
  mentorGroupJoinTimeLimitHours: number   // hours an accepted mentor has to join the mentee's WhatsApp group
  mentorRemovalDelayAfterExpiryDays: number  // days after a request expires before its mentor is removed from the group
  maxGroupsPerNumber: number   // batch size: most WhatsApp groups one AI number holds
}

export const mockSettings: AppSettings = {
  maxConcurrentEngagementsPerVolunteer: 2,
  mentorGroupJoinTimeLimitHours: 24,
  mentorRemovalDelayAfterExpiryDays: 3,
  maxGroupsPerNumber: 50,
}
