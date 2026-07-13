import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 font-semibold tracking-tight", className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className="text-lg">Kinetic</span>
    </span>
  )
}
