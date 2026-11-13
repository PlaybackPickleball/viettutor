type Props = {
  grapheme: string;
  hint?: string;
};

export function GraphemeHero({ grapheme, hint }: Props) {
  return (
    <div className="relative mb-8 flex flex-col items-center justify-center py-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
      >
        <div className="h-56 w-56 animate-breathe rounded-full bg-leaf/20 blur-2xl" />
      </div>
      <p
        className="font-display text-[7.5rem] leading-none tracking-tight text-ink sm:text-[8.5rem]"
        lang="vi"
      >
        {grapheme}
      </p>
      {hint ? (
        <p className="mt-2 text-sm text-ink/50">{hint}</p>
      ) : null}
    </div>
  );
}
