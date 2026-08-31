import Link from "next/link";
import { MANIFEST, allModules } from "@/lib/data";
import { ProgressBadge } from "@/components/ProgressBadge";
import { ResumeButton } from "@/components/ResumeButton";

const PLAN_ORDER = ["60-day", "20-day", "asap"] as const;

export default function Home() {
  const modules = allModules();

  return (
    <div className="space-y-10">
      <section>
        <p className="text-xs uppercase tracking-widest text-accent mb-2">
          {MANIFEST.role}
        </p>
        <h1 className="text-3xl font-semibold mb-2">
          Practice bank for Turing, Andela &amp; Toptal
        </h1>
        <p className="text-muted max-w-2xl">
          {MANIFEST.stackFocus}. Built for remote FDE offers at $5k+/mo.
          Everything runs locally — progress persists in your browser.
        </p>
        <div className="mt-4"><ResumeButton /></div>
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-widest text-muted mb-3">
          Choose a study plan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLAN_ORDER.map((id) => {
            const plan = MANIFEST.plans[id];
            if (!plan) return null;
            return (
              <Link
                key={id}
                href={`/plans/${id}`}
                className="block rounded-lg border border-border bg-panel p-5 hover:border-accent/60 transition"
              >
                <div className="text-lg font-medium mb-1">{plan.label}</div>
                <div className="text-sm text-muted mb-3">{plan.description}</div>
                <div className="text-xs text-muted">{plan.days.length} days</div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-widest text-muted mb-3">
          Modules ({modules.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((m) => (
            <Link
              key={m.module}
              href={`/module/${m.module}`}
              className="block rounded-lg border border-border bg-panel p-5 hover:border-accent/60 transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-base font-medium">{m.title}</div>
                <span className="text-xs text-muted">
                  {m.questions.length} Q · {m.estimatedHours}h
                </span>
              </div>
              <p className="text-sm text-muted line-clamp-3 mb-3">
                {m.description}
              </p>
              <div className="flex flex-wrap gap-1 mb-2">
                {m.platformCoverage.map((p) => (
                  <span
                    key={p}
                    className="text-[10px] uppercase tracking-wide rounded bg-border/50 text-muted px-1.5 py-0.5"
                  >
                    {p}
                  </span>
                ))}
              </div>
              <ProgressBadge module={m} />
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-widest text-muted mb-3">
          Platforms covered
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MANIFEST.platforms.map((p) => (
            <div key={p.id} className="rounded-lg border border-border bg-panel p-4">
              <div className="font-medium mb-1">{p.name}</div>
              <div className="text-xs text-muted">{p.notes}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
