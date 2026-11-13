"use client";

type Props = {
  message: string;
  variant?: "step" | "letter";
};

export function CelebrateBanner({ message, variant = "step" }: Props) {
  return (
    <div
      role="status"
      className={`animate-pop mb-4 overflow-hidden rounded-2xl px-4 py-3 ${
        variant === "letter"
          ? "bg-gradient-to-r from-jade to-leaf text-paper shadow-soft"
          : "border border-amber/40 bg-amber/15 text-ink"
      }`}
    >
      <p className="text-sm font-medium leading-snug">
        <span className="mr-1.5" aria-hidden>
          ★
        </span>
        {message}
      </p>
    </div>
  );
}
