export interface CommTemplate {
  id: string
  label: string
  category: "generic" | "engagement"
  message: string
  vars: string[]   // suggested system variable keys; index = {{n}}-1
  isCustom?: boolean
}

export interface CommLog {
  id: string
  date: string
  time: string
  triggerOrSender: string   // "System Trigger" or admin name
  templateLabel: string
  recipients: string[]      // contact names
  sentCount: number
  deliveredCount: number
  readCount: number
  failedCount: number
}

export interface ChatMessage {
  id: string
  type: "sent" | "received"
  text: string
  timestamp: string
  status?: "sent" | "delivered" | "read"
}

export interface CommContact {
  id: string
  name: string
  phone: string
  role: string           // e.g. "Mentor · Google" or "Mentee · Akanksha"
  lastMessage: string
  lastTime: string
  unread: number
  contactType: "volunteer" | "mentee"
}

export const commsTemplates: CommTemplate[] = [
  // Generic (volunteer-facing)
  { id: "T1", category: "generic",    label: "Complete Profile",              vars: ["volunteer_first_name"], message: "Hi {{1}}! 👋 We noticed your WeDoGood volunteer profile is almost complete. Adding your skills and experience helps us match you with the right mentee. Can you take 2 minutes to finish it? 🙏" },
  { id: "T2", category: "generic",    label: "Complete Orientation",          vars: ["volunteer_first_name"], message: "Hi {{1}}! Your orientation session is pending. It's a quick 30-minute call that helps you get started with mentoring. Would you like to pick a slot? Reply with a preferred date and time. 😊" },
  { id: "T3", category: "generic",    label: "Recommend a Friend",            vars: ["volunteer_first_name"], message: "Hi {{1}}! We're looking for more skilled mentors to support youth from NGO partners. If you know someone who'd be a great mentor, do share this link: [wedogood.org/volunteer]. Thank you! 🌟" },
  { id: "T4", category: "generic",    label: "Generic Feedback",              vars: ["volunteer_first_name"], message: "Hi {{1}}! We'd love your feedback on your volunteering experience with WeDoGood so far. Could you share what's working well and what we can improve? Your input matters a lot to us. 🙌" },
  // Engagement (volunteer-facing, references mentee + engagement context)
  { id: "T5", category: "engagement", label: "Confirm Interest in Engagement", vars: ["volunteer_first_name", "engagement_theme", "mentee_first_name", "mentee_group_name"], message: "Hi {{1}}! We'd like to match you with a mentee for a {{2}} engagement. The mentee is {{3}} from {{4}}. Are you available and interested? Please reply Yes or No. 🤝" },
  { id: "T6", category: "engagement", label: "Relevant Pre-Read",              vars: ["volunteer_first_name", "mentee_first_name"], message: "Hi {{1}}! Before your upcoming call with {{2}}, here's a quick read to help you prepare: [resource link]. Let us know if you have any questions. 📚" },
  { id: "T7", category: "engagement", label: "Confirm If Call Happened",       vars: ["volunteer_first_name", "mentee_first_name"], message: "Hi {{1}}! Just checking in — did your call with {{2}} happen as planned? Please reply Yes or No so we can update the engagement log. Thanks! 📞" },
  { id: "T8", category: "engagement", label: "Feedback for Request Call",      vars: ["volunteer_first_name", "mentee_first_name"], message: "Hi {{1}}! How did your recent call with {{2}} go? We'd love to hear your thoughts — any wins, challenges, or next steps? Your feedback helps us improve the program. 💬" },
]

export const menteeCommsTemplates: CommTemplate[] = [
  { id: "MT1", category: "generic",    label: "Profile Nudge",       vars: ["mentee_first_name", "app_link"],           message: "Hi {{1}}! 👋 Your WeDoGood profile is almost set. Finish it to unlock your first mentor match 👉 {{2}}" },
  { id: "MT2", category: "generic",    label: "Re-engagement Nudge", vars: ["mentee_first_name", "app_link"],           message: "Hi {{1}}! It's been a while 👋 Ready to connect with a mentor? Head back to WeDoGood anytime 👉 {{2}}" },
  { id: "MT3", category: "engagement", label: "Mentor Matched",      vars: ["mentee_first_name", "volunteer_first_name", "volunteer_profile_link"], message: "Hi {{1}}! 🎉 Great news — {{2}} has been matched with you! View their profile and reach out 👉 {{3}}" },
  { id: "MT4", category: "engagement", label: "Days Remaining",      vars: ["mentee_first_name", "days_remaining", "volunteer_first_name"], message: "Hi {{1}}! ⏰ You have {{2}} days left to connect with your mentor {{3}}. Don't miss out!" },
  { id: "MT5", category: "engagement", label: "Feedback Request",    vars: ["mentee_first_name", "volunteer_first_name", "feedback_link"], message: "Hi {{1}}! How did your session with {{2}} go? Share your feedback here 👉 {{3}}" },
]

export const mockVolunteerContacts: CommContact[] = [
  { id: "VOL-001", name: "Rahul Mehta", phone: "+91 98765 11001", role: "Mentor · Infosys", lastMessage: "Yes, the call went well!", lastTime: "10:32 AM", unread: 0, contactType: "volunteer" },
  { id: "VOL-002", name: "Sneha Rao", phone: "+91 98765 11002", role: "Mentor · Google", lastMessage: "Sure, I'll complete it today.", lastTime: "Yesterday", unread: 2, contactType: "volunteer" },
  { id: "VOL-003", name: "Amit Joshi", phone: "+91 98765 11003", role: "Mentor · Swiggy", lastMessage: "Orientation slot confirmed ✅", lastTime: "Mon", unread: 0, contactType: "volunteer" },
  { id: "VOL-004", name: "Pooja Verma", phone: "+91 98765 11004", role: "Mentor · HDFC Bank", lastMessage: "I'll be back from leave on June 15.", lastTime: "Mon", unread: 1, contactType: "volunteer" },
  { id: "VOL-005", name: "Kiran Bhat", phone: "+91 98765 11005", role: "Mentor · Razorpay", lastMessage: "Interested! When do we start?", lastTime: "2 Jun", unread: 0, contactType: "volunteer" },
  { id: "VOL-006", name: "Divya Krishnan", phone: "+91 98765 11006", role: "Mentor · Zomato", lastMessage: "Thanks for the pre-read link!", lastTime: "1 Jun", unread: 0, contactType: "volunteer" },
]

export const mockMenteeContacts: CommContact[] = [
  { id: "M-001", name: "Priya Sharma", phone: "+91 77001 20001", role: "Mentee · Akanksha Foundation", lastMessage: "Thank you so much!", lastTime: "11:00 AM", unread: 1, contactType: "mentee" },
  { id: "M-002", name: "Arjun Patel", phone: "+91 77001 20002", role: "Mentee · NavGurukul", lastMessage: "Can we reschedule to Thursday?", lastTime: "Yesterday", unread: 3, contactType: "mentee" },
  { id: "M-003", name: "Kavya Nair", phone: "+91 77001 20003", role: "Mentee · Parivarthan", lastMessage: "I haven't heard from my mentor yet.", lastTime: "Mon", unread: 0, contactType: "mentee" },
  { id: "M-004", name: "Rohan Das", phone: "+91 77001 20004", role: "Mentee · Akanksha Foundation", lastMessage: "Session was great 🙌", lastTime: "30 May", unread: 0, contactType: "mentee" },
  { id: "M-005", name: "Meena Iyer", phone: "+91 77001 20005", role: "Mentee · NavGurukul", lastMessage: "Okay, I'll try the exercise.", lastTime: "29 May", unread: 0, contactType: "mentee" },
]

export const mockVolunteerLogs: CommLog[] = [
  { id: "VL-1", date: "2026-06-04", time: "10:00 AM", triggerOrSender: "System Trigger", templateLabel: "Complete Profile", recipients: ["Sneha Rao", "Pooja Verma"], sentCount: 2, deliveredCount: 2, readCount: 1, failedCount: 0 },
  { id: "VL-2", date: "2026-06-03", time: "9:00 AM", triggerOrSender: "System Trigger", templateLabel: "Orientation Slot Reminder", recipients: ["Amit Joshi"], sentCount: 1, deliveredCount: 1, readCount: 1, failedCount: 0 },
  { id: "VL-3", date: "2026-06-02", time: "11:30 AM", triggerOrSender: "Mait (Admin)", templateLabel: "Confirm Interest in Engagement", recipients: ["Kiran Bhat", "Divya Krishnan", "Rahul Mehta"], sentCount: 3, deliveredCount: 3, readCount: 2, failedCount: 0 },
  { id: "VL-4", date: "2026-06-01", time: "3:00 PM", triggerOrSender: "System Trigger", templateLabel: "Complete Orientation", recipients: ["Sneha Rao"], sentCount: 1, deliveredCount: 1, readCount: 0, failedCount: 0 },
  { id: "VL-5", date: "2026-05-30", time: "2:00 PM", triggerOrSender: "Mait (Admin)", templateLabel: "Relevant Pre-Read", recipients: ["Divya Krishnan"], sentCount: 1, deliveredCount: 1, readCount: 1, failedCount: 0 },
  { id: "VL-6", date: "2026-05-28", time: "10:00 AM", triggerOrSender: "System Trigger", templateLabel: "Complete Profile", recipients: ["Pooja Verma", "Kiran Bhat", "Amit Joshi"], sentCount: 3, deliveredCount: 2, readCount: 1, failedCount: 1 },
]

export const mockMenteeLogs: CommLog[] = [
  { id: "ML-1", date: "2026-06-04", time: "11:00 AM", triggerOrSender: "System Trigger", templateLabel: "Mentor Matched — View Details", recipients: ["Priya Sharma", "Rohan Das"], sentCount: 2, deliveredCount: 2, readCount: 2, failedCount: 0 },
  { id: "ML-2", date: "2026-06-03", time: "12:00 PM", triggerOrSender: "System Trigger", templateLabel: "Confirm If Call Happened", recipients: ["Arjun Patel", "Priya Sharma"], sentCount: 2, deliveredCount: 2, readCount: 1, failedCount: 0 },
  { id: "ML-3", date: "2026-06-02", time: "9:30 AM", triggerOrSender: "Mait (Admin)", templateLabel: "Re-engagement Nudge", recipients: ["Kavya Nair", "Meena Iyer"], sentCount: 2, deliveredCount: 1, readCount: 0, failedCount: 1 },
  { id: "ML-4", date: "2026-06-01", time: "4:00 PM", triggerOrSender: "System Trigger", templateLabel: "Days Remaining Reminder", recipients: ["Arjun Patel"], sentCount: 1, deliveredCount: 1, readCount: 1, failedCount: 0 },
  { id: "ML-5", date: "2026-05-31", time: "10:00 AM", triggerOrSender: "System Trigger", templateLabel: "Request Chat Nudge", recipients: ["Meena Iyer", "Kavya Nair", "Priya Sharma"], sentCount: 3, deliveredCount: 3, readCount: 2, failedCount: 0 },
]

type ConversationMap = Record<string, ChatMessage[]>

export const mockConversations: ConversationMap = {
  "VOL-001": [
    { id: "c1", type: "sent", text: "Hi Rahul! 👋 Just checking in — did your call with Priya Sharma happen as planned?", timestamp: "10:00 AM", status: "read" },
    { id: "c2", type: "received", text: "Yes, the call went well! We covered resume structuring and she has some great experience to highlight.", timestamp: "10:32 AM" },
    { id: "c3", type: "sent", text: "That's wonderful! Would you be able to share a brief summary for the engagement log? 🙏", timestamp: "10:35 AM", status: "delivered" },
  ],
  "VOL-002": [
    { id: "c4", type: "sent", text: "Hi Sneha! We noticed your WeDoGood volunteer profile is almost complete. Adding your skills helps with matching. Can you finish it?", timestamp: "9:00 AM", status: "read" },
    { id: "c5", type: "received", text: "Sure, I'll complete it today.", timestamp: "Yesterday 2:15 PM" },
    { id: "c6", type: "sent", text: "Also, your orientation is still pending. Would you like to book a slot? 😊", timestamp: "Yesterday 2:20 PM", status: "read" },
    { id: "c7", type: "received", text: "Yes please! Can we do Friday at 4pm?", timestamp: "Yesterday 3:00 PM" },
    { id: "c8", type: "received", text: "Or Monday morning works too.", timestamp: "Yesterday 3:01 PM" },
  ],
  "VOL-003": [
    { id: "c9", type: "sent", text: "Hi Amit! Your orientation slot is confirmed for June 5th. Looking forward to it! ✅", timestamp: "Mon 11:00 AM", status: "read" },
    { id: "c10", type: "received", text: "Orientation slot confirmed ✅", timestamp: "Mon 11:15 AM" },
  ],
  "VOL-004": [
    { id: "c11", type: "sent", text: "Hi Pooja! Hope you're doing well. Just a gentle reminder that you have a pending mentee match. When are you back from leave?", timestamp: "Mon 9:30 AM", status: "read" },
    { id: "c12", type: "received", text: "I'll be back from leave on June 15.", timestamp: "Mon 10:00 AM" },
  ],
  "VOL-005": [
    { id: "c13", type: "sent", text: "Hi Kiran! We'd like to match you with a mentee for a Product Management engagement. Are you interested?", timestamp: "2 Jun 3:00 PM", status: "read" },
    { id: "c14", type: "received", text: "Interested! When do we start?", timestamp: "2 Jun 4:30 PM" },
  ],
  "VOL-006": [
    { id: "c15", type: "sent", text: "Hi Divya! Before your upcoming call with Meena Iyer, here's a quick read to help you prepare: [resource link] 📚", timestamp: "1 Jun 10:00 AM", status: "read" },
    { id: "c16", type: "received", text: "Thanks for the pre-read link!", timestamp: "1 Jun 10:45 AM" },
  ],
  "M-001": [
    { id: "m1", type: "sent", text: "Hi Priya! 👋 How did your last session with Rahul go? We'd love to hear your feedback!", timestamp: "10:45 AM", status: "read" },
    { id: "m2", type: "received", text: "Thank you so much!", timestamp: "11:00 AM" },
  ],
  "M-002": [
    { id: "m3", type: "sent", text: "Hi Arjun! Your next session with Sneha Rao is scheduled for tomorrow. Let us know if you have any questions.", timestamp: "Yesterday 1:00 PM", status: "read" },
    { id: "m4", type: "received", text: "Can we reschedule to Thursday?", timestamp: "Yesterday 2:00 PM" },
    { id: "m5", type: "received", text: "I have an exam on Wednesday.", timestamp: "Yesterday 2:01 PM" },
    { id: "m6", type: "received", text: "Sorry for the inconvenience!", timestamp: "Yesterday 2:02 PM" },
  ],
  "M-003": [
    { id: "m7", type: "sent", text: "Hi Kavya! We're actively working on finding the right mentor for your request. We'll have an update for you soon. 🙏", timestamp: "Mon 12:00 PM", status: "read" },
    { id: "m8", type: "received", text: "I haven't heard from my mentor yet.", timestamp: "Mon 3:00 PM" },
  ],
  "M-004": [
    { id: "m9", type: "sent", text: "Hi Rohan! How did your last data analysis session go?", timestamp: "30 May 4:00 PM", status: "read" },
    { id: "m10", type: "received", text: "Session was great 🙌", timestamp: "30 May 5:00 PM" },
  ],
  "M-005": [
    { id: "m11", type: "sent", text: "Hi Meena! Divya shared some exercises for you to practice communication skills. Give it a try and let us know how it goes!", timestamp: "29 May 10:00 AM", status: "read" },
    { id: "m12", type: "received", text: "Okay, I'll try the exercise.", timestamp: "29 May 10:30 AM" },
  ],
}
