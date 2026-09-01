import Link from "next/link";
import { getModule } from "@/lib/data";
import { SYLLABUS, type SyllabusEntry } from "@/lib/syllabus";
import {
  TEST_STAGES,
  getStagesForPlatform,
  type Platform,
  type TestStage,
} from "@/lib/test-stages";
import { ResumeButton } from "@/components/ResumeButton";

type SP = { platform?: string };

export default async function Home({ searchParams }: { searchParams: Promise<SP> }) {
  const params = await searchParams;
  const platform = (params.platform ?? "turing") as Platform | "all";

  if (platform === "all") {
    return <AllTopicsView />;
  }

  const validPlatforms: Platform[] = ["turing", "andela"];
  const activePlatform: Platform = validPlatforms.includes(platform as Platform)
    ? (platform as Platform)
    : "turing";

  const stages = getStagesForPlatform(activePlatform);

  // Compute overall platform progress
  const platformSyllabus = SYLLABUS.filter((s) =>
    s.tracks.includes(activePlatform)
  );
  const totalBuilt = platformSyllabus.reduce((acc, s) => acc + countQs(s), 0);
  const totalTarget = platformSyllabus.reduce((acc, s) => acc + s.targetQs, 0);
  const overallPct = Math.round((totalBuilt / totalTarget) * 100);

  const platformMeta = {
    turing: {
      name: "Turing.com",
      subtitle: "Top 1% · 3-month retake on fail",
      color: "#2563eb",
      rounds: "5 rounds",
    },
    andela: {
      name: "Andela",
      subtitle: "EPIC values · 30-day retake",
      color: "#7c3aed",
      rounds: "5 rounds",
    },
  }[activePlatform];

  return (
    <div className="space-y-10">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <section className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.14em] px-2 py-0.5 rounded"
              style={{
                background: `${platformMeta.color}18`,
                color: platformMeta.color,
              }}
            >
              {platformMeta.name}
            </span>
            <span className="text-[11px] text-[rgb(var(--muted))]">
              {platformMeta.subtitle}
            </span>
          </div>
          <h1 className="text-[26px] font-semibold text-[rgb(var(--fg))] leading-tight tracking-tight">
            Interview Prep Path
          </h1>
          <p className="text-[13px] text-[rgb(var(--muted))] mt-1">
            {platformMeta.rounds} · {totalBuilt.toLocaleString()} /{" "}
            {totalTarget.toLocaleString()} questions ({overallPct}% built)
          </p>
        </div>
        <ResumeButton />
      </section>

      {/* ── Platform Switcher ─────────────────────────────────────── */}
      <PlatformSwitcher active={activePlatform} />

      {/* ── Test Stage Sections ───────────────────────────────────── */}
      <div className="space-y-8">
        {stages.map((stage, idx) => (
          <TestStageSection
            key={stage.id}
            stage={stage}
            stageIndex={idx}
            total={stages.length}
          />
        ))}
      </div>
    </div>
  );
}

// ── Platform Switcher ──────────────────────────────────────────────────────

function PlatformSwitcher({ active }: { active: Platform }) {
  const options: { id: Platform; label: string; icon: string }[] = [
    { id: "turing", label: "Turing FDE", icon: "⚡" },
    { id: "andela", label: "Andela", icon: "🌍" },
  ];

  return (
    <div className="flex items-center gap-2">
      {options.map((o) => {
        const isActive = active === o.id;
        return (
          <Link
            key={o.id}
            href={`/?platform=${o.id}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-[13px] font-medium transition ${
              isActive
                ? "bg-[rgb(var(--fg))] text-[rgb(var(--bg))] border-[rgb(var(--fg))]"
                : "bg-[rgb(var(--panel))] text-[rgb(var(--fg-soft))] border-[rgb(var(--border))] hover:border-[rgb(var(--border-strong))]"
            }`}
          >
            <span>{o.icon}</span>
            {o.label}
          </Link>
        );
      })}
      <Link
        href="/?platform=all"
        className="ml-2 px-3 py-2 rounded-lg border border-[rgb(var(--border))] text-[12px] text-[rgb(var(--muted))] hover:border-[rgb(var(--border-strong))] transition"
      >
        All topics
      </Link>
    </div>
  );
}

// ── Single Test Stage Section ──────────────────────────────────────────────

function TestStageSection({
  stage,
  stageIndex,
  total,
}: {
  stage: TestStage;
  stageIndex: number;
  total: number;
}) {
  // Find all syllabus entries that belong to this test stage
  const topics = SYLLABUS.filter((s) =>
    s.testStages.includes(stage.id)
  );

  const stageBuilt = topics.reduce((acc, s) => acc + countQs(s), 0);
  const stageTarget = topics.reduce((acc, s) => acc + s.targetQs, 0);
  const stagePct = stageTarget > 0 ? Math.round((stageBuilt / stageTarget) * 100) : 0;

  const tagColor: Record<string, string> = {
    blue: "#2563eb",
    purple: "#7c3aed",
    orange: "#ea580c",
    green: "#16a34a",
    red: "#dc2626",
    yellow: "#ca8a04",
    teal: "#0d9488",
    indigo: "#4f46e5",
    pink: "#db2777",
  };
  const color = tagColor[stage.color] ?? "#64748b";

  return (
    <section className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] overflow-hidden">
      {/* Stage header */}
      <div
        className="px-5 py-4 border-b border-[rgb(var(--border))]"
        style={{ borderLeft: `3px solid ${color}` }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            {/* Round badge */}
            <span
              className="mt-0.5 text-[11px] font-bold px-2 py-1 rounded-md min-w-[36px] text-center flex-shrink-0"
              style={{
                background: `${color}18`,
                color,
              }}
            >
              {stage.tag}
            </span>
            <div>
              <h2 className="text-[16px] font-semibold text-[rgb(var(--fg))]">
                {stage.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-[12px] text-[rgb(var(--muted))]">
                <span className="flex items-center gap-1">
                  <ClockIcon />
                  {stage.duration}
                </span>
                <span className="flex items-center gap-1">
                  <FormatIcon />
                  {stage.format}
                </span>
              </div>
            </div>
          </div>
          {/* Stage progress */}
          <div className="text-right flex-shrink-0">
            <div className="text-[13px] font-mono tabular-nums text-[rgb(var(--fg-soft))]">
              {stageBuilt} / {stageTarget}
            </div>
            <div className="text-[11px] text-[rgb(var(--muted))]">
              {stagePct}% ready
            </div>
            <div className="mt-1.5 w-24 h-[4px] rounded-full bg-[rgb(var(--panel-2))] overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${stagePct}%`, background: color }}
              />
            </div>
          </div>
        </div>

        {/* Description + tip */}
        <p className="mt-3 text-[13px] text-[rgb(var(--muted))] leading-relaxed">
          {stage.description}
        </p>
        <div
          className="mt-2 px-3 py-2 rounded-md text-[12px] leading-relaxed"
          style={{ background: `${color}0d`, color }}
        >
          <span className="font-semibold">Key tip: </span>
          {stage.passTip}
        </div>
      </div>

      {/* Topic grid */}
      {topics.length > 0 ? (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} accentColor={color} />
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-[13px] text-[rgb(var(--muted))]">
          No topics assigned yet.
        </div>
      )}
    </section>
  );
}

// ── Topic Card (inside a stage) ────────────────────────────────────────────

function TopicCard({
  topic,
  accentColor,
}: {
  topic: SyllabusEntry;
  accentColor: string;
}) {
  const built = countQs(topic);
  const pct = Math.min(100, Math.round((built / topic.targetQs) * 100));
  const isPlanned = topic.status === "planned";
  const href = topic.moduleId
    ? `/module/${topic.moduleId}`
    : `/planned/${topic.id}`;

  const statusColor =
    topic.status === "built"
      ? "var(--accent)"
      : topic.status === "partial"
        ? "var(--medium)"
        : "var(--border-strong)";

  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel-2))]/50 p-3 hover:border-[rgb(var(--border-strong))] hover:bg-[rgb(var(--panel-2))] transition"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: `rgb(${statusColor})` }}
          />
          <span className="text-[13px] font-medium text-[rgb(var(--fg))] group-hover:text-[rgb(var(--accent))] truncate leading-tight">
            {topic.title}
          </span>
        </div>
        <span className="text-[11px] font-mono tabular-nums text-[rgb(var(--muted))] flex-shrink-0">
          {isPlanned ? "—" : `${built}/${topic.targetQs}`}
        </span>
      </div>
      <p className="text-[11px] text-[rgb(var(--muted))] line-clamp-2 leading-relaxed">
        {topic.blurb}
      </p>
      <div className="h-[3px] rounded-full bg-[rgb(var(--border))] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: isPlanned ? "rgb(var(--border-strong))" : accentColor,
          }}
        />
      </div>
    </Link>
  );
}

// ── All Topics fallback view ───────────────────────────────────────────────

function AllTopicsView() {
  const totalBuilt = SYLLABUS.reduce((acc, s) => acc + countQs(s), 0);
  const totalTarget = SYLLABUS.reduce((acc, s) => acc + s.targetQs, 0);
  const overallPct = Math.round((totalBuilt / totalTarget) * 100);

  return (
    <div className="space-y-8">
      <section className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[rgb(var(--muted))] mb-2">
            All Stages
          </div>
          <h1 className="text-[26px] font-semibold text-[rgb(var(--fg))] leading-tight tracking-tight">
            Full Syllabus
          </h1>
          <p className="text-[13px] text-[rgb(var(--muted))] mt-1">
            {SYLLABUS.length} stages · {totalBuilt.toLocaleString()} /{" "}
            {totalTarget.toLocaleString()} questions ({overallPct}%)
          </p>
        </div>
        <ResumeButton />
      </section>

      <PlatformSwitcher active={"turing"} />

      <div className="flex items-center gap-3 text-[11px] text-[rgb(var(--muted))]">
        <LegendDot color="var(--accent)" label="built" />
        <LegendDot color="var(--medium)" label="partial" />
        <LegendDot color="var(--border-strong)" label="planned" />
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {SYLLABUS.map((s) => (
          <AllTopicTile key={s.id} stage={s} />
        ))}
      </section>
    </div>
  );
}

function AllTopicTile({ stage }: { stage: SyllabusEntry }) {
  const built = countQs(stage);
  const pct = Math.min(100, Math.round((built / stage.targetQs) * 100));
  const isPlanned = stage.status === "planned";
  const href = stage.moduleId
    ? `/module/${stage.moduleId}`
    : `/planned/${stage.id}`;
  const statusColor =
    stage.status === "built"
      ? "var(--accent)"
      : stage.status === "partial"
        ? "var(--medium)"
        : "var(--border-strong)";

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
          {built} / {stage.targetQs}
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

// ── Helpers ────────────────────────────────────────────────────────────────

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

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: `rgb(${color})` }} />
      <span>{label}</span>
    </span>
  );
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function FormatIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}
