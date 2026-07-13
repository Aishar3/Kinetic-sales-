// Mock sales data powering the dashboard views.

export const revenueSeries = [
  { month: "Jan", revenue: 42000, target: 40000 },
  { month: "Feb", revenue: 48500, target: 44000 },
  { month: "Mar", revenue: 51200, target: 48000 },
  { month: "Apr", revenue: 60100, target: 52000 },
  { month: "May", revenue: 68400, target: 58000 },
  { month: "Jun", revenue: 74800, target: 64000 },
  { month: "Jul", revenue: 82300, target: 70000 },
  { month: "Aug", revenue: 91500, target: 76000 },
]

export const pipelineStages = [
  { stage: "New", count: 128, value: 384000 },
  { stage: "Qualified", count: 74, value: 296000 },
  { stage: "Proposal", count: 41, value: 246000 },
  { stage: "Negotiation", count: 23, value: 184000 },
  { stage: "Won", count: 16, value: 128000 },
]

export const leadSources = [
  { name: "Inbound", value: 42 },
  { name: "Outbound", value: 28 },
  { name: "Referral", value: 18 },
  { name: "Events", value: 12 },
]

export type Lead = {
  id: string
  name: string
  company: string
  email: string
  value: number
  score: number
  stage: "New" | "Qualified" | "Proposal" | "Negotiation" | "Won"
  owner: string
  updated: string
}

export const leads: Lead[] = [
  { id: "1", name: "Aria Patel", company: "Lumen Health", email: "aria@lumen.io", value: 24000, score: 92, stage: "Negotiation", owner: "You", updated: "2h ago" },
  { id: "2", name: "Marcus Lee", company: "Vela Robotics", email: "marcus@vela.ai", value: 48000, score: 88, stage: "Proposal", owner: "You", updated: "4h ago" },
  { id: "3", name: "Sofia Reyes", company: "Brightpath", email: "sofia@brightpath.co", value: 12000, score: 81, stage: "Qualified", owner: "Dana K.", updated: "6h ago" },
  { id: "4", name: "Tomas Novak", company: "Gridline", email: "tomas@gridline.eu", value: 36000, score: 76, stage: "Qualified", owner: "You", updated: "Yesterday" },
  { id: "5", name: "Nina Alvarez", company: "Cobalt Studio", email: "nina@cobalt.design", value: 8000, score: 69, stage: "New", owner: "Raj P.", updated: "Yesterday" },
  { id: "6", name: "Owen Fisher", company: "Northwind", email: "owen@northwind.com", value: 64000, score: 95, stage: "Negotiation", owner: "You", updated: "2d ago" },
  { id: "7", name: "Lena Vogt", company: "Meridian", email: "lena@meridian.io", value: 18000, score: 72, stage: "New", owner: "Dana K.", updated: "2d ago" },
]

export type Conversation = {
  id: string
  name: string
  company: string
  preview: string
  time: string
  unread: boolean
  channel: "email" | "chat" | "linkedin"
}

export const conversations: Conversation[] = [
  { id: "1", name: "Aria Patel", company: "Lumen Health", preview: "That timeline works for us — can you send the revised proposal?", time: "2m", unread: true, channel: "email" },
  { id: "2", name: "Owen Fisher", company: "Northwind", preview: "Looping in our CFO for the contract review.", time: "18m", unread: true, channel: "email" },
  { id: "3", name: "Marcus Lee", company: "Vela Robotics", preview: "Thanks for the demo, the team was impressed.", time: "1h", unread: false, channel: "linkedin" },
  { id: "4", name: "Sofia Reyes", company: "Brightpath", preview: "What does onboarding look like for a team of 12?", time: "3h", unread: false, channel: "chat" },
  { id: "5", name: "Tomas Novak", company: "Gridline", preview: "Can we push our call to Thursday?", time: "5h", unread: false, channel: "email" },
]

export type Automation = {
  id: string
  name: string
  description: string
  active: boolean
  runs: number
  trigger: string
}

export const automations: Automation[] = [
  { id: "1", name: "New lead welcome", description: "Send an AI-personalized intro email when a lead enters the pipeline.", active: true, runs: 1284, trigger: "Lead created" },
  { id: "2", name: "Stale deal nudge", description: "Ping the owner when a deal has no activity for 5 days.", active: true, runs: 342, trigger: "5 days idle" },
  { id: "3", name: "Proposal follow-up", description: "Auto-draft a follow-up 48h after a proposal is sent.", active: true, runs: 618, trigger: "Proposal sent" },
  { id: "4", name: "Meeting recap", description: "Summarize calls and log next steps to the CRM.", active: false, runs: 97, trigger: "Call ended" },
  { id: "5", name: "Churn risk alert", description: "Flag accounts showing drop-off in engagement.", active: false, runs: 44, trigger: "Engagement drop" },
]

export const activity = [
  { id: "1", who: "AI Assistant", action: "drafted a reply to Aria Patel", time: "2 min ago" },
  { id: "2", who: "Owen Fisher", action: "opened your proposal 3 times", time: "22 min ago" },
  { id: "3", who: "Automation", action: "sent follow-up to Marcus Lee", time: "1 hour ago" },
  { id: "4", who: "Dana K.", action: "moved Brightpath to Qualified", time: "3 hours ago" },
  { id: "5", who: "AI Assistant", action: "scored 12 new leads", time: "5 hours ago" },
]

export const stageColors: Record<Lead["stage"], string> = {
  New: "var(--color-muted-foreground)",
  Qualified: "#0ea5e9",
  Proposal: "#f59e0b",
  Negotiation: "#8b5cf6",
  Won: "var(--color-accent)",
}
