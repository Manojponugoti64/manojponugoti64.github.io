import Image from "next/image";
import Link from "next/link";
import { cases } from "@/lib/cases";
import { atlasEntries } from "@/lib/atlas";

const featured = cases[0];

export default function HomePage() {
  return (
    <div className="mentor-home">
      <section className="mentor-hero">
        <div className="hero-grid-lines" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 lg:grid-cols-[1fr_0.94fr] lg:gap-20 lg:pb-28 lg:pt-24">
          <div>
            <p className="eyebrow mb-7 flex items-center gap-3 text-coral">
              <span className="h-px w-8 bg-coral" /> CATHLAB MENTOR / 01
            </p>
            <h1 className="mentor-display max-w-3xl text-5xl font-light tracking-[-0.08em] text-warm sm:text-7xl lg:text-[6.9rem]">
              Learn the move
              <br />
              <em>before</em> the wire.
            </h1>
            <p className="mt-8 max-w-md text-base leading-7 text-muted">
              A case-led learning cockpit for cardiology trainees. Rehearse the
              anatomy, strategy, and bailout — then follow the exact textbook
              page that supports the move.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <Link href={`/cases/${featured.slug}`} className="mentor-cta">
                Start today&apos;s case <span>↗</span>
              </Link>
              <span className="text-xs text-quiet">12 min · 5 decisions · source-linked</span>
            </div>
          </div>

          <div className="hero-plate">
            <Image
              src="/images/bifurcation/provisional-algorithm.png"
              alt="Provisional bifurcation stenting algorithm from the teaching atlas"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover object-top"
            />
            <div className="hero-plate-wash" />
            <div className="hero-plate-tag">CASE 01 / BIFURCATION PCI</div>
            <div className="hero-plate-title">
              <span>LAD ↗ OM1</span>
              <strong>Provisional first.</strong>
            </div>
            <div className="hero-plate-axis"><span>ANATOMY</span><i /><span>STRATEGY</span><i /><span>OPTIMIZE</span></div>
          </div>
        </div>
      </section>

      <section className="mentor-signal border-y border-card-border">
        <div className="mx-auto grid max-w-6xl grid-cols-3 px-4 py-7">
          <div><strong>{cases.length}</strong><span>interactive cases</span></div>
          <div><strong>{atlasEntries.length}</strong><span>source-linked pages</span></div>
          <div><strong>01</strong><span>move at a time</span></div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 lg:py-28">
        <div className="mb-8 flex items-end justify-between border-b border-card-border pb-4">
          <div><p className="eyebrow mb-3 text-cyan">THE RUNWAY</p><h2 className="text-3xl font-light tracking-[-0.06em] text-warm">Choose your next move.</h2></div>
          <Link href="/cases" className="hidden text-xs text-cyan transition-colors hover:text-warm sm:block">View all cases <span className="ml-2 text-base">→</span></Link>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { n: "01", title: "Bifurcation strategy", detail: "Choose the move before you touch the wire.", href: `/cases/${cases[0].slug}`, state: "READY" },
            { n: "02", title: "Complete heart block", detail: "Stabilise the patient, then decide what stays.", href: `/cases/${cases[1].slug}`, state: "READY" },
            { n: "03", title: "Jailed side-branch FFR", detail: "Read the physiology behind the angiogram.", href: `/cases/${cases[2].slug}`, state: "READY" },
          ].map((item) => (
            <Link href={item.href} key={item.n} className="module-tile group">
              <div className="flex items-center justify-between"><span className="text-xs tracking-[0.18em] text-cyan">{item.n}</span><span className="text-[9px] tracking-[0.16em] text-coral">{item.state}</span></div>
              <h3 className="mt-12 text-xl font-normal tracking-[-0.04em] text-warm transition-colors group-hover:text-cyan">{item.title}</h3>
              <p className="mt-2 max-w-[230px] text-xs leading-5 text-muted">{item.detail}</p>
              <div className="mt-8 border-t border-card-border pt-3 text-xs text-quiet">Case · {cases[Number(item.n) - 1].estimatedMinutes} min <span className="float-right text-lg text-cyan">→</span></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-24 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="border border-card-border bg-card p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div><p className="eyebrow mb-3 text-cyan">SOURCE TRAIL</p><h2 className="text-2xl font-light tracking-[-0.05em] text-warm">Every answer leaves a trail.</h2></div>
            <span className="hidden text-3xl text-coral sm:block">↗</span>
          </div>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted">The feedback is not a black box. Each decision is connected to the chapter, printed/PDF page, and figure that shaped the lesson.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["Interventional Cardiology 8e", "Kern&apos;s 7e", "Topol 5e"].map((source, i) => <div className="source-chip" key={source}><span>{["TI", "K7", "T5"][i]}</span><strong>{source}</strong></div>)}
          </div>
        </div>
        <div className="border border-card-border bg-coral p-6 text-ink sm:p-8">
          <p className="eyebrow text-ink/60">YOUR RHYTHM</p>
          <div className="mt-7 text-6xl font-light tracking-[-0.1em]">02 <span className="text-xl tracking-normal text-ink/50">/ 04</span></div>
          <div className="mt-4 h-1 bg-ink/20"><div className="h-full w-1/2 bg-ink" /></div>
          <p className="mt-4 text-sm leading-6 text-ink/75">Two short sessions this week. Keep the wire moving.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl border-t border-card-border px-4 pb-10 pt-5">
        <div className="flex flex-col gap-2 text-[10px] leading-5 text-quiet sm:flex-row sm:items-baseline sm:gap-6"><span className="tracking-[0.16em] text-coral">EDUCATIONAL WORKSPACE</span><p className="m-0 max-w-2xl">CathLab Mentor supports deliberate learning and case discussion. It is not a substitute for supervised cath-lab training or patient-specific clinical judgment.</p></div>
      </section>
    </div>
  );
}
