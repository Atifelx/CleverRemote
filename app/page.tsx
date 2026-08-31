import Link from "next/link";
import { MANIFEST, allModules } from "@/lib/data";
import { ResumeButton } from "@/components/ResumeButton";
import { TrackFilter } from "@/components/TrackFilter";

type SP = { track?: string };

export default async function Home({ searchParams }: { searchParams: Promise<SP> }) {
  const params = await searchParams;
  const track = (params.track ?? "all").toLowerCase();
  const allMods = allModules();

  const filtered = allMods.filter((m) => {
    if (track === "all") return true;
    if (!m.tracks) return true;
    return m.tracks.includes(track);
  });

  const totalQs = filtered.reduce((s, m) => s + m.questions.length, 0);

  return (
    <div className="space-y-8">
      <section className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[rgb(var(--muted))] mb-2">
            Practice bank · {MANIFEST.role}
          </div>
          <h1 className="text-[26px] font-semibold text-[rgb(var(--fg))] leading-tight tracking-tight">
            {track === "turing" ? "Turing FDE" : track === "andela" ? "Andela" : "All modules"}
          </h1>
          <p className="text-[13px] text-[rgb(var(--muted))] mt-1">
            {filtered.length} modules · {totalQs.toLocaleString()} questions ·{" "}
            {filtered.reduce((s, m) => s + m.estimatedHours, 0)}h estimated
          </p>
        </div>
        <ResumeButton />
      </section>

      <TrackFilter current={track} />

      <section>
        <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-[rgb(var(--panel-2))] border-b border-[rgb(var(--border))]">
              <tr className="text-left text-[11px] uppercase tracking-wider text-[rgb(var(--muted))]">
                <th className="px-4 py-3 w-10">#</th>
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3 w-24 text-right">Questions</th>
                <th className="px-4 py-3 w-24 text-right">Hours</th>
                <th className="px-4 py-3 w-56">Tests</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <tr
                  key={m.module}
                  className="border-b border-[rgb(var(--border))] last:border-b-0 hover:bg-[rgb(var(--panel-2))]/60 transition"
                >
                  <td className="px-4 py-3 text-[rgb(var(--muted))] font-mono">
                    {String(i).padStart(2, "0")}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/module/${m.module}`}
                      className="font-medium text-[rgb(var(--fg))] hover:text-[rgb(var(--accent))]"
                    >
                      {m.title}
                    </Link>
                    <div className="text-[12px] text-[rgb(var(--muted))] mt-0.5 line-clamp-1">
                      {m.description}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[rgb(var(--fg-soft))]">
                    {m.questions.length}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[rgb(var(--muted))]">
                    {m.estimatedHours}h
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(m.testStages || m.platformCoverage || []).slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[rgb(var(--panel-2))] border border-[rgb(var(--border))] text-[rgb(var(--muted))]"
                        >
                          {t.replace(/^turing-|^andela-/, "")}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
