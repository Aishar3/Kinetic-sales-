import { Star } from "lucide-react"

const testimonials = [
  {
    quote:
      "Kinetic paid for itself in the first month. Our reps book 3x more meetings and the AI replies are genuinely indistinguishable from our best closer.",
    name: "Maya Shah",
    role: "VP Sales, Northstar",
    initials: "MS",
  },
  {
    quote:
      "The lead scoring alone changed how we work. We stopped wasting time on dead deals and our win rate jumped 40% in a quarter.",
    name: "David Okafor",
    role: "Head of Revenue, Loop",
    initials: "DO",
  },
  {
    quote:
      "We replaced four separate tools with Kinetic. The unified inbox and automations save each rep almost two days a week.",
    name: "Elena Rossi",
    role: "Sales Director, Vela",
    initials: "ER",
  },
  {
    quote:
      "Forecasting used to be guesswork. Now leadership trusts the pipeline numbers because they're live and accurate.",
    name: "James Carter",
    role: "CRO, Meridian",
    initials: "JC",
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="scroll-mt-20 border-t border-border/60 bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Loved by sales teams</p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Trusted by 2,000+ revenue teams worldwide
          </h2>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {testimonials.map((t) => (
            <figure key={t.name} className="rounded-2xl border border-border bg-card p-7 shadow-sm">
              <div className="flex gap-0.5" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-primary text-primary" />
                ))}
              </div>
              <blockquote className="mt-4 text-pretty text-base leading-relaxed text-foreground">
                {`"${t.quote}"`}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {t.initials}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">{t.name}</span>
                  <span className="block text-sm text-muted-foreground">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
