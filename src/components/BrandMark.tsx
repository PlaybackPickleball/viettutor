import Link from "next/link";

type Props = {
  href?: string;
  size?: "sm" | "lg";
};

function Lotus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path
        d="M24 42c-1.2-6.5 1.8-11 6.8-14.2 2.4 4.2 1.6 8.8-1.2 12.4C27.4 41.6 25.4 42.2 24 42Z"
        fill="#e07a4a"
        opacity="0.9"
      />
      <path
        d="M24 42c1.2-6.5-1.8-11-6.8-14.2-2.4 4.2-1.6 8.8 1.2 12.4C20.6 41.6 22.6 42.2 24 42Z"
        fill="#c45c38"
        opacity="0.9"
      />
      <path
        d="M24 40c0-8 4.5-13.5 11-16.5 1.2 5.5-0.5 11.2-4.8 15.2C28.2 40.5 25.8 41 24 40Z"
        fill="#e08a45"
        opacity="0.85"
      />
      <path
        d="M24 40c0-8-4.5-13.5-11-16.5-1.2 5.5 0.5 11.2 4.8 15.2C19.8 40.5 22.2 41 24 40Z"
        fill="#d9784f"
        opacity="0.85"
      />
      <path
        d="M24 38c1-9 0.2-15-1.5-20 4.8 2.2 8.8 7.2 10 13.8-2.6 2.8-5.6 4.8-8.5 6.2Z"
        fill="#f0a06a"
        opacity="0.95"
      />
      <path
        d="M24 38c-1-9-0.2-15 1.5-20-4.8 2.2-8.8 7.2-10 13.8 2.6 2.8 5.6 4.8 8.5 6.2Z"
        fill="#e8955c"
        opacity="0.95"
      />
      <circle cx="24" cy="22" r="3.2" fill="#fff7ee" />
    </svg>
  );
}

export function BrandMark({ href = "/", size = "sm" }: Props) {
  const title =
    size === "lg"
      ? "font-display text-4xl sm:text-5xl leading-none tracking-tight text-ink"
      : "font-display text-xl leading-none tracking-tight text-ink";

  const inner = (
    <span className="inline-flex items-center gap-2.5">
      <Lotus className={size === "lg" ? "h-11 w-11" : "h-8 w-8"} />
      <span className="inline-flex flex-col">
        <span className={title} lang="vi">
          ÁMi <span className="text-coral">Lingua</span>
        </span>
        {size === "lg" ? (
          <span className="mt-2 max-w-xs text-sm text-ink/60">AI Vietnamese Learning</span>
        ) : null}
      </span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="group inline-block focus:outline-none">
        {inner}
      </Link>
    );
  }
  return inner;
}
