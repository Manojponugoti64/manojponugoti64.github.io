"use client";

import { useState } from "react";
import Image from "next/image";
import type { AtlasEntry, Topic } from "@/lib/types";
import { atlasEntries } from "@/lib/atlas";

const topicLabels: Record<Topic, string> = {
  bifurcation: "Bifurcation PCI",
  bradyarrhythmia: "Bradyarrhythmia",
  ffr: "FFR / Physiology",
};

const allTopics: (Topic | "all")[] = [
  "all",
  "bifurcation",
  "bradyarrhythmia",
  "ffr",
];

export function AtlasBrowser() {
  const [filter, setFilter] = useState<Topic | "all">("all");
  const [selected, setSelected] = useState<AtlasEntry | null>(null);

  const filtered =
    filter === "all"
      ? atlasEntries
      : atlasEntries.filter((e) => e.topic === filter);

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {allTopics.map((t) => (
          <button
            key={t}
            onClick={() => {
              setFilter(t);
              setSelected(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filter === t
                ? "bg-accent text-white"
                : "text-muted hover:text-foreground hover:bg-white/5"
            }`}
          >
            {t === "all" ? "All" : topicLabels[t]}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Thumbnail grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
          {filtered.map((entry) => (
            <button
              key={entry.id}
              onClick={() => setSelected(entry)}
              className={`rounded-lg border overflow-hidden text-left transition-all ${
                selected?.id === entry.id
                  ? "border-accent ring-1 ring-accent/30"
                  : "border-card-border hover:border-accent/30"
              }`}
            >
              <div className="aspect-[4/3] relative bg-black/30">
                <Image
                  src={entry.image}
                  alt={entry.title}
                  fill
                  className="object-cover object-top"
                  sizes="200px"
                />
              </div>
              <div className="p-2">
                <p className="text-xs font-medium truncate">{entry.title}</p>
                <p className="text-[10px] text-muted truncate">
                  {entry.source} {entry.page}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <div className="rounded-xl border border-card-border bg-card p-5 lg:sticky lg:top-20 lg:self-start">
          {selected ? (
            <>
              <h3 className="font-semibold text-lg mb-1">{selected.title}</h3>
              <p className="text-sm text-muted mb-4">
                {selected.source} · {selected.chapter} · {selected.page}
              </p>
              <div className="rounded-lg overflow-hidden border border-card-border mb-4">
                <Image
                  src={selected.image}
                  alt={selected.title}
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selected.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted text-sm">
              Select a page to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
