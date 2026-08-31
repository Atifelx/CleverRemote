import Link from "next/link";
import { notFound } from "next/navigation";
import { allModules, getModule } from "@/lib/data";
import { ModuleQuestionList } from "@/components/ModuleQuestionList";

export async function generateStaticParams() {
  return allModules().map((m) => ({ id: m.module }));
}

export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mod = getModule(id);
  if (!mod) return notFound();

  const easy = mod.questions.filter((q) => q.difficulty === "easy").length;
  const med = mod.questions.filter((q) => q.difficulty === "medium").length;
  const hard = mod.questions.filter((q) => q.difficulty === "hard").length;

  return (
    <div className="space-y-6">
      <div className="text-[12px] text-[rgb(var(--muted))]">
        <Link href="/" className="hover:text-[rgb(var(--fg))]">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-[rgb(var(--fg-soft))]">{mod.title}</span>
      </div>

      <section>
        <h1 className="text-[24px] font-semibold tracking-tight text-[rgb(var(--fg))]">
          {mod.title}
        </h1>
        <p className="text-[13px] text-[rgb(var(--muted))] mt-1 max-w-[70ch]">
          {mod.description}
        </p>
        <div className="flex items-center gap-2 mt-3 text-[11px]">
          <span className="px-2 py-0.5 rounded font-mono bg-[rgb(var(--panel-2))] border border-[rgb(var(--border))] text-[rgb(var(--muted))]">
            {mod.questions.length} questions
          </span>
          <span className="px-2 py-0.5 rounded font-mono bg-[rgb(var(--panel-2))] border border-[rgb(var(--border))] text-[rgb(var(--muted))]">
            ~{mod.estimatedHours}h
          </span>
          {easy > 0 && <span className="px-2 py-0.5 rounded font-mono diff-easy">{easy} easy</span>}
          {med > 0 && <span className="px-2 py-0.5 rounded font-mono diff-medium">{med} med</span>}
          {hard > 0 && <span className="px-2 py-0.5 rounded font-mono diff-hard">{hard} hard</span>}
        </div>
      </section>

      <ModuleQuestionList module={mod} />
    </div>
  );
}
