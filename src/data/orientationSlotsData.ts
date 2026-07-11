export type SlotRecurrence = "One-time" | "Daily" | "Weekly" | "Monthly"

export interface OrientationSlot {
  id: string
  meetingName: string
  date: string                 // "YYYY-MM-DD"
  time: string                 // "HH:mm"
  meetingLink: string
  wdgEmail: string              // WDG team member's email hosting/taking this orientation session
  recurrence: SlotRecurrence     // recurrence pattern this slot was created under
  bookedBy: { volunteerId: string; volunteerName: string }[]   // multiple people can book the same slot; delete is blocked when non-empty
}

export const mockOrientationSlots: OrientationSlot[] = [
  { id: "GOS-001", meetingName: "Volunteer Orientation — Morning Batch", date: "2026-07-13", time: "10:00", meetingLink: "meet.google.com/orientation-jul13-10", wdgEmail: "priya@wedogood.in", recurrence: "One-time", bookedBy: [{ volunteerId: "VOL-003", volunteerName: "Amit Joshi" }, { volunteerId: "VOL-005", volunteerName: "Kiran Bhat" }] },
  { id: "GOS-002", meetingName: "Volunteer Orientation — Afternoon Batch", date: "2026-07-14", time: "15:30", meetingLink: "meet.google.com/orientation-jul14-1530", wdgEmail: "priya@wedogood.in", recurrence: "One-time", bookedBy: [{ volunteerId: "VOL-004", volunteerName: "Pooja Verma" }] },
  { id: "GOS-003", meetingName: "Volunteer Orientation — Weekday Slot", date: "2026-07-16", time: "11:00", meetingLink: "meet.google.com/orientation-jul16-11", wdgEmail: "arjun@wedogood.in", recurrence: "One-time", bookedBy: [] },
  { id: "GOS-004", meetingName: "Volunteer Orientation — Evening Batch", date: "2026-07-18", time: "16:00", meetingLink: "meet.google.com/orientation-jul18-16", wdgEmail: "arjun@wedogood.in", recurrence: "One-time", bookedBy: [] },
  { id: "GOS-005", meetingName: "Volunteer Orientation — Weekly Slot", date: "2026-07-22", time: "10:30", meetingLink: "meet.google.com/orientation-jul22-1030", wdgEmail: "priya@wedogood.in", recurrence: "Weekly", bookedBy: [] },
  { id: "GOS-006", meetingName: "Volunteer Orientation — Weekly Slot", date: "2026-07-28", time: "14:00", meetingLink: "meet.google.com/orientation-jul28-14", wdgEmail: "arjun@wedogood.in", recurrence: "Weekly", bookedBy: [] },
]
