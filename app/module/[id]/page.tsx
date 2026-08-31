import Link from "next/link";
import { notFound } from "next/navigation";
import { allModules, getModule } from "@/lib/data";
import { ModuleQuestionList } from "@/components/ModuleQuestionList";

export async function generateStaticParams() {
  return allModules().map((m) => ({ id: m.module }));
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mod = getModule(id);
  if (!mod) return notFound();

  const easy = mod.questions.filter((q) => q.difficulty === "easy").length;
  const med = mod.questions.filter((q) => q.difficulty === "medium").length;
  const hard = mod.questions.filter((q) => q.difficulty === "hard").length;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/" className="text-sm text-muted hover:text-fg">
          ← Home
        </Link>
      </div>

      <section>
        <p className="text-xs uppercase tracking-widest text-accent mb-2">
          Module
        </p>
        <h1 className="text-3xl font-semibold mb-1">{mod.title}</h1>
        <p className="text-muted mb-4 max-w-3xl">{mod.description}</p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded bg-border/50 text-muted px-2 py-1">
            {mod.questions.length} questions
          </span>
          <span className="rounded bg-border/50 text-muted px-2 py-1">
            ~{mod.estimatedHours}h
          </span>
          <span className="rounded bg-ok/20 text-ok px-2 py-1">
            {easy} easy
          </span>
          <span className="rounded bg-warn/20 text-warn px-2 py-1">
            {med} medium
          </span>
          <span className="rounded bg-err/20 text-err px-2 py-1">
            {hard} hard
          </span>
        </div>
      </section>

      <ModuleQuestionList module={mod} />
    </div>
  );
}
