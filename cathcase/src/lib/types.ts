export type Topic = "bifurcation" | "bradyarrhythmia" | "ffr";
export type Difficulty = "beginner" | "intermediate" | "advanced";

export type TextbookRef = {
  source: string;
  chapter: string;
  page: string;
  image?: string;
  caption?: string;
};

export type CaseOption = {
  id: string;
  label: string;
  isCorrect: boolean;
  feedback: string;
  nextStepId?: string;
};

export type CaseStep = {
  id: string;
  prompt: string;
  context?: string;
  image?: string;
  references?: TextbookRef[];
  options: CaseOption[];
};

export type CathCase = {
  slug: string;
  title: string;
  subtitle: string;
  topic: Topic;
  difficulty: Difficulty;
  estimatedMinutes: number;
  vignette: string;
  presentation: string[];
  learningObjectives: string[];
  steps: CaseStep[];
  keyTakeaways: string[];
  keyReferences: TextbookRef[];
};

export type AtlasEntry = {
  id: string;
  topic: Topic;
  title: string;
  source: string;
  chapter: string;
  page: string;
  image: string;
  tags: string[];
};
