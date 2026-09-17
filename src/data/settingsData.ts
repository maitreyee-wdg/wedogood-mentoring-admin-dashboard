// Admin-configurable platform settings. Mock/in-memory, mirroring the other *Data.ts files —
// mutate `mockSettings` directly and every screen that reads it picks up the new value.

export interface AppSettings {
  maxConcurrentEngagementsPerVolunteer: number
}

export const mockSettings: AppSettings = {
  maxConcurrentEngagementsPerVolunteer: 2,
}
