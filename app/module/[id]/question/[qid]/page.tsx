import Link from "next/link";
import { notFound } from "next/navigation";
import { allModules, getModule, getQuestion } from "@/lib/data";
import { QuestionRunner } from "@/components/QuestionRunner";

export async function generateStaticParams() {
  const out: { id: string; qid: string }[] = [];
  for (const m of allModules()) {
    for (const q of m.questions) out.push({ id: m.module, qid: q.id });
  }
  return out;
}

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ id: string; qid: string }>;
}) {
  const { id, qid } = await params;
  const mod = getModule(id);
  if (!mod) return notFound();
  const found = getQuestion(id, qid);
  if (!found) return notFound();

  const { question, index } = found;
  const prev = index > 0 ? mod.questions[index - 1] : null;
  const next = index < mod.questions.length - 1 ? mod.questions[index + 1] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm">
        <Link href={`/module/${mod.module}`} className="text-muted hover:text-fg">
          ← {mod.title}
        </Link>
        <span className="text-muted">
          {index + 1} / {mod.questions.length}
        </span>
      </div>

      <QuestionRunner
        moduleId={mod.module}
        question={question}
        prevHref={prev ? `/module/${mod.module}/question/${prev.id}` : null}
        nextHref={next ? `/module/${mod.module}/question/${next.id}` : null}
      />
    </div>
  );
}
