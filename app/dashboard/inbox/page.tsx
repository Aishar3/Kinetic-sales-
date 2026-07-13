"use client"

import { useState } from "react"
import { Mail, MessageSquare, Linkedin, Send, Sparkles } from "lucide-react"
import { conversations, type Conversation } from "@/lib/dashboard-data"

const channelIcon = {
  email: Mail,
  chat: MessageSquare,
  linkedin: Linkedin,
}

export default function InboxPage() {
  const [active, setActive] = useState<Conversation>(conversations[0])
  const [reply, setReply] = useState("")
  const Icon = channelIcon[active.channel]

  function generateAiReply() {
    setReply(
      `Hi ${active.name.split(" ")[0]}, thanks for the note! I'd be happy to help with next steps. ` +
        `I'll send over the details shortly and we can find a time that works for your team.`,
    )
  }

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
      <p className="mt-1 text-sm text-muted-foreground">All your conversations in one place.</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[340px_1fr]">
        {/* list */}
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-3 text-sm font-semibold">
            Conversations
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {conversations.filter((c) => c.unread).length} unread
            </span>
          </div>
          <ul className="max-h-[560px] overflow-y-auto">
            {conversations.map((c) => {
              const CIcon = channelIcon[c.channel]
              const selected = c.id === active.id
              return (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      setActive(c)
                      setReply("")
                    }}
                    className={`flex w-full gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-0 ${
                      selected ? "bg-muted/70" : "hover:bg-muted/40"
                    }`}
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {c.name.split(" ").map((p) => p[0]).join("")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between">
                        <span className="truncate text-sm font-medium">{c.name}</span>
                        <span className="ml-2 shrink-0 text-xs text-muted-foreground">{c.time}</span>
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CIcon className="size-3" />
                        {c.company}
                      </span>
                      <span className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{c.preview}</span>
                    </span>
                    {c.unread && <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* thread */}
        <div className="flex flex-col rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-3 border-b border-border px-6 py-4">
            <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {active.name.split(" ").map((p) => p[0]).join("")}
            </span>
            <div className="flex-1">
              <div className="font-semibold">{active.name}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Icon className="size-3" /> {active.company}
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4 px-6 py-6">
            <div className="max-w-md rounded-2xl rounded-tl-sm bg-muted px-4 py-3 text-sm">{active.preview}</div>
            <div className="ml-auto max-w-md rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm text-primary-foreground">
              Absolutely — happy to help. Let me pull that together for you.
            </div>
          </div>

          <div className="border-t border-border p-4">
            <div className="rounded-xl border border-border bg-background p-3">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                placeholder="Write a reply…"
                className="w-full resize-none bg-transparent text-sm outline-none"
              />
              <div className="mt-2 flex items-center justify-between">
                <button
                  onClick={generateAiReply}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <Sparkles className="size-4 text-primary" />
                  AI draft
                </button>
                <button
                  onClick={() => {
                    setReply("")
                  }}
                  disabled={!reply.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
                >
                  <Send className="size-4" />
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
