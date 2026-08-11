import { AtlasBrowser } from "@/components/atlas-browser";

export const metadata = {
  title: "Textbook Atlas — CathLab Mentor",
};

export default function AtlasPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Textbook Atlas</h1>
      <p className="text-muted text-sm mb-8">
        Curated pages from standard cardiology references — the same sources
        behind every case.
      </p>
      <AtlasBrowser />
    </div>
  );
}
