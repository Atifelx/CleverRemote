import Link from "next/link";
import { notFound } from "next/navigation";
import { SYLLABUS } from "@/lib/syllabus";

export async function generateStaticParams() {
  return SYLLABUS.filter((s) => s.status === "planned").map((s) => ({ id: s.id }));
}

export default async function PlannedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const stage = SYLLABUS.find((s) => s.id === id);
  if (!stage) return notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-[12px] text-[rgb(var(--muted))]">
        <Link href="/" className="hover:text-[rgb(var(--fg))]">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-[rgb(var(--fg-soft))]">{stage.title}</span>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-mono text-[rgb(var(--muted))]">
            {String(stage.num).padStart(2, "0")}
          </span>
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "rgb(var(--border-strong))" }}
          />
          <span className="text-[10px] uppercase tracking-wider text-[rgb(var(--muted))]">
            planned
          </span>
        </div>
        <h1 className="text-[24px] font-semibold tracking-tight text-[rgb(var(--fg))]">
          {stage.title}
        </h1>
        <p className="text-[13px] text-[rgb(var(--muted))] mt-1 max-w-[62ch]">
          {stage.blurb}
        </p>
      </section>

      <section className="rounded-lg border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-8 text-center">
        <div className="text-[13px] text-[rgb(var(--muted))] mb-3">
          This stage is on the roadmap.
        </div>
        <div className="text-[36px] font-semibold text-[rgb(var(--fg-soft))] mono tabular-nums">
          0 / {stage.targetQs}
        </div>
        <div className="text-[11px] font-mono uppercase tracking-wider text-[rgb(var(--muted))] mt-2">
          questions targeted
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
          {stage.testStages.map((t) => (
            <span
              key={t}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgb(var(--panel-2))] border border-[rgb(var(--border))] text-[rgb(var(--muted))]"
            >
              {t}
            </span>
          ))}
        </div>
      </section>

      <div className="text-[12px] text-[rgb(var(--muted))] text-center">
        Come back after the next build session.
      </div>
    </div>
  );
}
