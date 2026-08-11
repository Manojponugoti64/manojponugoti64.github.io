import Link from "next/link";
import type { CathCase } from "@/lib/types";

const topicColors: Record<CathCase["topic"], string> = {
  bifurcation: "text-[var(--topic-bifurcation)] bg-[var(--topic-bifurcation)]/10",
  bradyarrhythmia: "text-[var(--topic-brady)] bg-[var(--topic-brady)]/10",
  ffr: "text-[var(--topic-ffr)] bg-[var(--topic-ffr)]/10",
};

const topicLabels: Record<CathCase["topic"], string> = {
  bifurcation: "Bifurcation PCI",
  bradyarrhythmia: "Bradyarrhythmia",
  ffr: "FFR / Physiology",
};

const difficultyLabels: Record<CathCase["difficulty"], string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

type Props = {
  case: CathCase;
  completed?: boolean;
};

export function CaseCard({ case: c, completed }: Props) {
  return (
    <Link
      href={`/cases/${c.slug}`}
      className="group block rounded-xl border border-card-border bg-card p-5 hover:border-accent/40 hover:bg-card/80 transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${topicColors[c.topic]}`}
        >
          {topicLabels[c.topic]}
        </span>
        <div className="flex items-center gap-2">
          {completed && (
            <span className="text-xs text-success font-medium">✓ Done</span>
          )}
          <span className="text-xs text-muted">{c.estimatedMinutes} min</span>
        </div>
      </div>
      <h3 className="font-semibold text-lg mb-1 group-hover:text-accent transition-colors">
        {c.title}
      </h3>
      <p className="text-sm text-muted mb-4">{c.subtitle}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">
          {difficultyLabels[c.difficulty]} · {c.steps.length} steps
        </span>
        <span className="text-sm text-accent opacity-0 group-hover:opacity-100 transition-opacity">
          Start case →
        </span>
      </div>
    </Link>
  );
}
