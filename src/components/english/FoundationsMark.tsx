function RedLotus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 64" className={className} aria-hidden>
      <path fill="#e24b4b" d="M36 58c0-14-10-24-20-28 6 12 12 20 20 28Z" />
      <path fill="#d63c3c" d="M36 58c0-14 10-24 20-28-6 12-12 20-20 28Z" />
      <path fill="#ef5d55" d="M36 56C36 36 28 22 22 12c8 12 12 26 14 44Z" />
      <path fill="#e24b4b" d="M36 56c0-20 8-34 14-44-8 12-12 26-14 44Z" />
      <path fill="#c43232" d="M36 54c0-22 0-34 0-46 4 14 4 30 0 46Z" />
    </svg>
  );
}

export function OutlineLotus({ className = "h-14 w-14 shrink-0 text-[var(--en-leaf)]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <path d="M32 54c0-12-8-20-16-24 5 10 10 16 16 24Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M32 54c0-12 8-20 16-24-5 10-10 16-16 24Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M32 52c0-16-6-26-10-34 6 10 8 20 10 34Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M32 52c0-16 6-26 10-34-6 10-8 20-10 34Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M32 50V16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function OutlineBook({ className = "h-14 w-14 shrink-0 text-[var(--en-leaf)]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <path d="M10 16c8-3 14-3 22-1v34c-8-2-14-2-22 1V16Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M54 16c-8-3-14-3-22-1v34c8-2 14-2 22 1V16Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FoundationsMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex flex-col items-center text-center">
      <RedLotus className={compact ? "h-10 w-10" : "h-14 w-14"} />
      <p className={`font-display leading-none tracking-tight text-[var(--en-navy)] ${compact ? "mt-1 text-3xl" : "mt-1 text-5xl"}`}>
        A&apos;Mi
      </p>
      <p className="mt-2 text-[11px] font-semibold tracking-[0.28em] text-[var(--en-leaf)]">— FOUNDATIONS —</p>
    </div>
  );
}
