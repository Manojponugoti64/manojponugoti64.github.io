const STORAGE_KEY = "cathcase-progress";

export type CaseProgress = {
  slug: string;
  completedSteps: string[];
  completed: boolean;
  completedAt?: string;
  score: number;
  totalSteps: number;
};

export type ProgressStore = Record<string, CaseProgress>;

function readStore(): ProgressStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressStore) : {};
  } catch {
    return {};
  }
}

function writeStore(store: ProgressStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getProgress(slug: string): CaseProgress | null {
  return readStore()[slug] ?? null;
}

export function getAllProgress(): ProgressStore {
  return readStore();
}

export function saveStepProgress(
  slug: string,
  stepId: string,
  totalSteps: number,
  wasCorrect: boolean
) {
  const store = readStore();
  const existing = store[slug] ?? {
    slug,
    completedSteps: [],
    completed: false,
    score: 0,
    totalSteps,
  };

  if (!existing.completedSteps.includes(stepId)) {
    existing.completedSteps.push(stepId);
    if (wasCorrect) existing.score += 1;
  }

  if (existing.completedSteps.length >= totalSteps) {
    existing.completed = true;
    existing.completedAt = new Date().toISOString();
  }

  existing.totalSteps = totalSteps;
  store[slug] = existing;
  writeStore(store);
  return existing;
}

export function getCompletedCount(): number {
  return Object.values(readStore()).filter((p) => p.completed).length;
}
