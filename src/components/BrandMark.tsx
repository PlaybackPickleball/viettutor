import Link from "next/link";

type Props = {
  href?: string;
  size?: "sm" | "lg";
};

export function BrandMark({ href = "/", size = "sm" }: Props) {
  const title =
    size === "lg"
      ? "font-display text-5xl sm:text-6xl leading-none tracking-tight text-ink"
      : "font-display text-2xl leading-none tracking-tight text-ink";

  const inner = (
    <span className="inline-flex flex-col">
      <span className={title} lang="vi">
        ÁMi <span className="text-jade">Lingua</span>
      </span>
      {size === "lg" ? (
        <span className="mt-3 max-w-xs text-base text-ink/65">
          Southern Vietnamese · Level 1 foundations
        </span>
      ) : null}
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
