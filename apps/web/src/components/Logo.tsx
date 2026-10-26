import { cn } from "../lib/utils";

/** Buxton's folded-page monogram. Original vector artwork; no external assets. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("h-7 w-7", className)} aria-hidden>
      <rect width="64" height="64" rx="19" className="fill-accent" />
      <path
        d="M22 16v32h12c8 0 13-4 13-10 0-5-3-8-8-9 3-1 5-3 5-6 0-5-4-7-10-7H22Z"
        fill="none"
        stroke="var(--accent-fg)"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M22 30h12" stroke="var(--accent-fg)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
