import Link from "next/link";
import { notFound } from "next/navigation";
import { MANIFEST, getModule } from "@/lib/data";

export async function generateStaticParams() {
  return Object.keys(MANIFEST.plans).map((plan) => ({ plan }));
}

export default async function PlanPage({
  params,
}: {
  params: Promise<{ plan: string }>;
}) {
  const { plan: planId } = await params;
  const plan = MANIFEST.plans[planId];
  if (!plan) return notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/" className="text-sm text-muted hover:text-fg">
          ← Home
        </Link>
      </div>

      <section>
        <p className="text-xs uppercase tracking-widest text-accent mb-2">
          Study plan
        </p>
        <h1 className="text-3xl font-semibold mb-1">{plan.label}</h1>
        <p className="text-muted">{plan.description}</p>
      </section>

      <section>
        <div className="space-y-2">
          {plan.days.map((d) => (
            <div
              key={d.day}
              className="flex items-start gap-4 rounded-lg border border-border bg-panel p-4"
            >
              <div className="flex-shrink-0 w-12 text-center">
                <div className="text-xs uppercase text-muted">Day</div>
                <div className="text-lg font-medium">{d.day}</div>
              </div>
              <div className="flex-1">
                <div className="text-sm mb-1">{d.focus}</div>
                <div className="flex flex-wrap gap-2">
                  {d.modules.length === 0 && (
                    <span className="text-xs text-muted italic">Rest day</span>
                  )}
                  {d.modules.map((mid) => {
                    const m = getModule(mid);
                    return m ? (
                      <Link
                        key={mid}
                        href={`/module/${mid}`}
                        className="text-xs rounded bg-accent/20 border border-accent/40 text-accent px-2 py-1 hover:bg-accent/30"
                      >
                        {m.title}
                      </Link>
                    ) : (
                      <span key={mid} className="text-xs text-err">
                        {mid} (missing)
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
