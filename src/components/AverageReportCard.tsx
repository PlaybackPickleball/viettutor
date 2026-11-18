import type { AverageReport } from "@/lib/pronunciation";

type Props = {
  report: AverageReport;
};

export function AverageReportCard({ report }: Props) {
  if (!report.scoringAvailable || report.averageQuality == null) {
    return (
      <div className="ami-card animate-pop px-4 py-4" role="status">
        <p className="quiet-label mb-2">Compare set complete</p>
        <p className="font-display text-3xl text-coral">{report.count} takes</p>
        <p className="mt-1 text-sm text-ink/55">Listen → record → compare cycles</p>
        <p className="mt-4 text-sm leading-relaxed text-ink/80">{report.tip}</p>
        <p className="mt-2 text-xs text-ink/40">
          No invented average — automatic scoring waits for a validated provider.
        </p>
      </div>
    );
  }

  return (
    <div className="ami-card animate-pop px-4 py-4" role="status">
      <p className="quiet-label mb-2">AI set average</p>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-display text-4xl text-coral">{report.averageQuality}</p>
          <p className="text-sm text-ink/55">average across {report.count} takes</p>
        </div>
        <div className="text-right text-sm text-ink/60">
          <p>{report.passRate ?? 0}% solid takes</p>
          <p className="mt-1 capitalize">
            Focus: {report.dominantIssue === "ok" ? "keep steady" : report.dominantIssue}
          </p>
        </div>
      </div>
      <div className="mt-4 flex h-10 items-end gap-1">
        {report.qualities.map((q, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-md bg-coral/80"
            style={{ height: `${Math.max(12, q)}%` }}
            title={`Take ${i + 1}: ${q}`}
          />
        ))}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-ink/80">{report.tip}</p>
    </div>
  );
}
