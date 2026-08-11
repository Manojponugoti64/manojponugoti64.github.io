"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { CathCase } from "@/lib/types";
import { saveStepProgress } from "@/lib/progress";

type Props = {
  caseData: CathCase;
};

export function CasePlayer({ caseData }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const step = caseData.steps[stepIndex];
  const isLast = stepIndex === caseData.steps.length - 1;
  const chosen = step.options.find((o) => o.id === selected);

  const handleSelect = useCallback(
    (optionId: string) => {
      if (showFeedback) return;
      const option = step.options.find((o) => o.id === optionId);
      if (!option) return;

      setSelected(optionId);
      setShowFeedback(true);
      if (option.isCorrect) setScore((s) => s + 1);
      saveStepProgress(
        caseData.slug,
        step.id,
        caseData.steps.length,
        option.isCorrect
      );
    },
    [showFeedback, step, caseData.slug, caseData.steps.length]
  );

  const handleNext = () => {
    if (isLast) {
      setFinished(true);
      return;
    }
    setStepIndex((i) => i + 1);
    setSelected(null);
    setShowFeedback(false);
  };

  if (finished) {
    const pct = Math.round((score / caseData.steps.length) * 100);
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="text-5xl mb-4">{pct >= 80 ? "🎯" : pct >= 50 ? "📚" : "💪"}</div>
        <h2 className="text-2xl font-bold mb-2">Case Complete</h2>
        <p className="text-muted mb-1">
          Score: {score}/{caseData.steps.length} ({pct}%)
        </p>
        <p className="text-sm text-muted mb-8">
          {pct >= 80
            ? "Excellent — textbook-ready."
            : pct >= 50
              ? "Good effort — review the takeaways below."
              : "Keep practicing — the atlas has all the references."}
        </p>

        <div className="text-left rounded-xl border border-card-border bg-card p-5 mb-8">
          <h3 className="font-semibold mb-3 text-accent">Key Takeaways</h3>
          <ul className="space-y-2">
            {caseData.keyTakeaways.map((t, i) => (
              <li key={i} className="text-sm text-muted flex gap-2">
                <span className="text-accent shrink-0">→</span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            href="/cases"
            className="px-5 py-2.5 rounded-lg border border-card-border text-sm hover:bg-white/5 transition-colors"
          >
            All Cases
          </Link>
          <button
            onClick={() => {
              setStepIndex(0);
              setSelected(null);
              setShowFeedback(false);
              setScore(0);
              setFinished(false);
            }}
            className="px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-dim transition-colors"
          >
            Retry Case
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted mb-2">
          <span>
            Step {stepIndex + 1} of {caseData.steps.length}
          </span>
          <span>
            Score: {score}/{stepIndex + (showFeedback ? 1 : 0)}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-card-border overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-300"
            style={{
              width: `${((stepIndex + (showFeedback ? 1 : 0)) / caseData.steps.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Vignette on first step */}
      {stepIndex === 0 && !showFeedback && (
        <div className="rounded-xl border border-card-border bg-card p-5 mb-6">
          <h3 className="text-xs font-medium text-accent uppercase tracking-wider mb-2">
            Clinical Vignette
          </h3>
          <p className="text-sm leading-relaxed mb-3">{caseData.vignette}</p>
          <ul className="text-xs text-muted space-y-1">
            {caseData.presentation.map((p, i) => (
              <li key={i}>• {p}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Question */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">{step.prompt}</h2>
        {step.context && (
          <p className="text-sm text-muted leading-relaxed">{step.context}</p>
        )}
      </div>

      {/* Image */}
      {step.image && (
        <div className="mb-6 rounded-xl border border-card-border overflow-hidden bg-black/20">
          <Image
            src={step.image}
            alt="Textbook reference"
            width={800}
            height={500}
            priority={stepIndex === 0}
            className="w-full h-auto"
          />
        </div>
      )}

      {/* Options */}
      <div className="space-y-2.5 mb-6">
        {step.options.map((option) => {
          const isChosen = selected === option.id;
          let border = "border-card-border hover:border-accent/30";
          if (showFeedback && isChosen) {
            border = option.isCorrect
              ? "border-success bg-success/5"
              : "border-error bg-error/5";
          } else if (showFeedback && option.isCorrect) {
            border = "border-success/40";
          }

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={showFeedback}
              className={`w-full text-left px-4 py-3.5 rounded-xl border ${border} bg-card transition-all disabled:cursor-default text-sm leading-relaxed`}
            >
              <span className="font-medium mr-2 text-muted">
                {option.id.toUpperCase()}.
              </span>
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {showFeedback && chosen && (
        <div
          className={`rounded-xl border p-4 mb-6 ${
            chosen.isCorrect
              ? "border-success/30 bg-success/5"
              : "border-error/30 bg-error/5"
          }`}
        >
          <p className="text-sm font-medium mb-1">
            {chosen.isCorrect ? "✓ Correct" : "✗ Not quite"}
          </p>
          <p className="text-sm text-muted leading-relaxed">{chosen.feedback}</p>
        </div>
      )}

      {/* References */}
      {showFeedback && step.references && step.references.length > 0 && (
        <div className="rounded-xl border border-card-border bg-card/50 p-4 mb-6">
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
            Textbook Reference
          </p>
          {step.references.map((ref, i) => (
            <p key={i} className="text-xs text-muted">
              {ref.source} · {ref.chapter} · {ref.page}
              {ref.caption && (
                <span className="block mt-0.5 text-foreground/70">
                  {ref.caption}
                </span>
              )}
            </p>
          ))}
        </div>
      )}

      {/* Next button */}
      {showFeedback && (
        <button
          onClick={handleNext}
          className="w-full py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent-dim transition-colors"
        >
          {isLast ? "Finish Case" : "Next Step →"}
        </button>
      )}
    </div>
  );
}
