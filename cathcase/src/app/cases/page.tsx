import { cases } from "@/lib/cases";
import { CaseCard } from "@/components/case-card";

export const metadata = {
  title: "Cases — CathCase",
};

export default function CasesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <p className="eyebrow mb-3 text-coral">THE CASE ROOM</p>
      <h1 className="mentor-display text-4xl font-light tracking-[-0.07em] text-warm mb-2">Choose the next decision.</h1>
      <p className="text-muted text-sm mb-8">
        {cases.length} interactive cases · progress saved locally in your browser
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {cases.map((c) => (
          <CaseCard key={c.slug} case={c} />
        ))}
      </div>
    </div>
  );
}
