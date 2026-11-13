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
          ? "bg-gradient-to-r from-coral to-amber text-paper shadow-soft"
          : "border border-coral/35 bg-coral/10 text-ink"
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
