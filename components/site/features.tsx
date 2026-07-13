import { Bot, Target, Workflow, LineChart, Inbox, ShieldCheck } from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "AI conversation engine",
    desc: "Drafts context-aware replies in your voice and keeps every deal moving without manual follow-up.",
  },
  {
    icon: Target,
    title: "Predictive lead scoring",
    desc: "Every lead is ranked by likelihood to close, so reps always know who to call next.",
  },
  {
    icon: Workflow,
    title: "Pipeline automations",
    desc: "Trigger tasks, hand-offs, and nudges automatically as deals progress through your funnel.",
  },
  {
    icon: LineChart,
    title: "Revenue analytics",
    desc: "Forecast with confidence using real-time dashboards for pipeline, velocity, and win rate.",
  },
  {
    icon: Inbox,
    title: "Unified inbox",
    desc: "Email, chat, and social conversations in one place—prioritized and always in sync.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise security",
    desc: "SSO, granular roles, and encryption keep your customer data protected at every layer.",
  },
]

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 border-t border-border/60 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Everything you need</p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            One platform to run your entire sales motion
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Stop stitching together five tools. Kinetic unifies prospecting, outreach, and forecasting in a
            single, intelligent workspace.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="size-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
