import { notFound } from "next/navigation";
import Link from "next/link";
import { getCase, cases } from "@/lib/cases";
import { CasePlayer } from "@/components/case-player";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return cases.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const c = getCase(slug);
  if (!c) return { title: "Case Not Found" };
  return { title: `${c.title} — CathLab Mentor` };
}

export default async function CasePage({ params }: Props) {
  const { slug } = await params;
  const caseData = getCase(slug);
  if (!caseData) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link
        href="/cases"
        className="text-sm text-muted hover:text-foreground transition-colors mb-6 inline-block"
      >
        ← All Cases
      </Link>
      <div className="mb-8">
        <p className="eyebrow mb-3 text-coral">CASE ROOM / DECISION PRACTICE</p>
        <h1 className="mentor-display text-3xl font-light tracking-[-0.07em] text-warm sm:text-4xl mb-1">
          {caseData.title}
        </h1>
        <p className="text-muted text-sm">{caseData.subtitle}</p>
      </div>
      <CasePlayer caseData={caseData} />
    </div>
  );
}
