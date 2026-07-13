import { SiteHeader } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"
import { Hero } from "@/components/site/hero"
import { Features } from "@/components/site/features"
import { Testimonials } from "@/components/site/testimonials"
import { Pricing } from "@/components/site/pricing"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Features />
        <Testimonials />
        <Pricing />
      </main>
      <SiteFooter />
    </div>
  )
}
