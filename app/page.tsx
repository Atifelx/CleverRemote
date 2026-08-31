import Link from "next/link";
import { MANIFEST, allModules, getModule } from "@/lib/data";
import { SYLLABUS, type SyllabusEntry } from "@/lib/syllabus";
import { ResumeButton } from "@/components/ResumeButton";
import { TrackFilter } from "@/components/TrackFilter";

type SP = { track?: string };

export default async function Home({ searchParams }: { searchParams: Promise<SP> }) {
  const params = await searchParams;
  const track = (params.track ?? "all").toLowerCase();

  const filtered = SYLLABUS.filter((s) => {
    if (track === "all") return true;
    return s.tracks.includes(track as "turing" | "andela");
  });

  const counts = filtered.map((s) => ({ ...s, built: countQs(s) }));
  const totalBuilt = counts.reduce((s, e) => s + e.built, 0);
  const totalTarget = counts.reduce((s, e) => s + e.targetQs, 0);
  const overallPct = Math.round((totalBuilt / totalTarget) * 100);

  return (
    <div className="space-y-8">
      <section className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[rgb(var(--muted))] mb-2">
            {MANIFEST.role} · Turing + Andela
          </div>
          <h1 className="text-[26px] font-semibold text-[rgb(var(--fg))] leading-tight tracking-tight">
            {track === "turing" ? "Turing FDE syllabus" : track === "andela" ? "Andela syllabus" : "Full syllabus"}
          </h1>
          <p className="text-[13px] text-[rgb(var(--muted))] mt-1">
            {filtered.length} stages · {totalBuilt.toLocaleString()} / {totalTarget.toLocaleString()} questions built ({overallPct}%)
          </p>
        </div>
        <ResumeButton />
      </section>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <TrackFilter current={track} />
        <div className="flex items-center gap-3 text-[11px] text-[rgb(var(--muted))]">
          <LegendDot color="var(--accent)" label="built" />
          <LegendDot color="var(--medium)" label="partial" />
          <LegendDot color="var(--border-strong)" label="planned" />
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {counts.map((s) => (
          <StageTile key={s.id} stage={s} />
        ))}
      </section>
    </div>
  );
}

function StageTile({ stage }: { stage: SyllabusEntry & { built: number } }) {
  const pct = Math.min(100, Math.round((stage.built / stage.targetQs) * 100));
  const statusColor =
    stage.status === "built"
      ? "var(--accent)"
      : stage.status === "partial"
        ? "var(--medium)"
        : "var(--border-strong)";
  const isPlanned = stage.status === "planned";
  const href = stage.moduleId ? `/module/${stage.moduleId}` : `/planned/${stage.id}`;

  return (
    <Link
      href={href}
      className="group block rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4 hover:border-[rgb(var(--border-strong))] hover:bg-[rgb(var(--panel-2))]/40 transition"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-mono tabular-nums text-[rgb(var(--muted))] tracking-wider">
            {String(stage.num).padStart(2, "0")}
          </span>
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: `rgb(${statusColor})` }}
            title={stage.status}
          />
          <h3 className="text-[14px] font-medium text-[rgb(var(--fg))] group-hover:text-[rgb(var(--accent))] truncate">
            {stage.title}
          </h3>
        </div>
      </div>
      <p className="text-[12px] text-[rgb(var(--muted))] line-clamp-2 mb-3 min-h-[32px]">
        {stage.blurb}
      </p>
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-mono tabular-nums text-[rgb(var(--fg-soft))]">
          {stage.built} / {stage.targetQs}
        </span>
        <span className="font-mono tabular-nums text-[rgb(var(--muted))]">
          {isPlanned ? "planned" : `${pct}%`}
        </span>
      </div>
      <div className="mt-2 h-[3px] rounded-full bg-[rgb(var(--panel-2))] overflow-hidden">
        <div
          className="h-full transition-all"
          style={{ width: `${pct}%`, background: `rgb(${statusColor})` }}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {stage.testStages.slice(0, 3).map((t) => (
          <span
            key={t}
            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[rgb(var(--panel-2))] border border-[rgb(var(--border))] text-[rgb(var(--muted))]"
          >
            {t.replace(/^turing-|^andela-/, "")}
          </span>
        ))}
      </div>
    </Link>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: `rgb(${color})` }} />
      <span>{label}</span>
    </span>
  );
}

function countQs(s: SyllabusEntry): number {
  let total = 0;
  if (s.moduleId) {
    const m = getModule(s.moduleId);
    if (m) total += m.questions.length;
  }
  if (s.extraModuleIds) {
    for (const id of s.extraModuleIds) {
      const m = getModule(id);
      if (m) total += m.questions.length;
    }
  }
  return total;
}
