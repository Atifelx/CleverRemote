import Link from "next/link";
import { getModule } from "@/lib/data";
import { SYLLABUS, type SyllabusEntry } from "@/lib/syllabus";
import {
  TURING_STAGES,
  ANDELA_STAGES,
  getStagesForPlatform,
  type Platform,
  type TestStage,
} from "@/lib/test-stages";
import { ResumeButton } from "@/components/ResumeButton";

type SP = { platform?: string };

export default async function Home({ searchParams }: { searchParams: Promise<SP> }) {
  const params = await searchParams;
  const raw = params.platform ?? "turing";

  if (raw === "all") return <AllTopicsView />;

  const platform: Platform = raw === "andela" ? "andela" : "turing";
  const stages = getStagesForPlatform(platform);

  const platformSyllabus = SYLLABUS.filter((s) => s.tracks.includes(platform));
  const totalBuilt = platformSyllabus.reduce((a, s) => a + countQs(s), 0);
  const totalTarget = platformSyllabus.reduce((a, s) => a + s.targetQs, 0);

  const meta =
    platform === "turing"
      ? { name: "Turing.com", accent: "#2563eb", icon: "⚡" }
      : { name: "Andela", accent: "#7c3aed", icon: "🌍" };

  return (
    <div className="space-y-10">
      {/* ── Top bar ── */}
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
              style={{ background: `${meta.accent}18`, color: meta.accent }}
            >
              {meta.icon} {meta.name}
            </span>
          </div>
          <h1 className="text-[26px] font-semibold text-[rgb(var(--fg))] leading-tight tracking-tight">
            Your Hiring Funnel
          </h1>
          <p className="text-[13px] text-[rgb(var(--muted))] mt-1">
            {stages.length} tests to clear · {totalBuilt.toLocaleString()} /{" "}
            {totalTarget.toLocaleString()} practice questions
          </p>
        </div>
        <ResumeButton />
      </div>

      {/* ── Platform switcher ── */}
      <div className="flex items-center gap-2">
        {[
          { id: "turing" as Platform, label: "⚡ Turing FDE" },
          { id: "andela" as Platform, label: "🌍 Andela" },
        ].map((o) => (
          <Link
            key={o.id}
            href={`/?platform=${o.id}`}
            className={`px-4 py-2 rounded-lg border text-[13px] font-medium transition ${
              platform === o.id
                ? "bg-[rgb(var(--fg))] text-[rgb(var(--bg))] border-[rgb(var(--fg))]"
                : "bg-[rgb(var(--panel))] text-[rgb(var(--fg-soft))] border-[rgb(var(--border))] hover:border-[rgb(var(--border-strong))]"
            }`}
          >
            {o.label}
          </Link>
        ))}
        <Link
          href="/?platform=all"
          className="ml-2 px-3 py-2 rounded-lg border border-[rgb(var(--border))] text-[12px] text-[rgb(var(--muted))] hover:border-[rgb(var(--border-strong))] transition"
        >
          All topics
        </Link>
      </div>

      {/* ── Journey overview strip ── */}
      <FunnelOverview stages={stages} platform={platform} />

      {/* ── Stage sections ── */}
      <div className="space-y-10">
        {stages.map((stage) => (
          <StageSection key={stage.id} stage={stage} />
        ))}
      </div>
    </div>
  );
}

// ── Funnel overview (horizontal stepper) ──────────────────────────────────────

function FunnelOverview({
  stages,
  platform,
}: {
  stages: TestStage[];
  platform: Platform;
}) {
  const platformLabel = platform === "turing" ? "Turing.com" : "Andela";
  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-5">
      <p className="text-[12px] text-[rgb(var(--muted))] mb-4">
        To get hired at{" "}
        <span className="text-[rgb(var(--fg))] font-medium">{platformLabel}</span>,
        you must pass every stage below — in order.
      </p>

      {/* Stepper */}
      <div className="flex items-center gap-0 overflow-x-auto hide-scroll pb-1">
        {stages.map((s, i) => (
          <div key={s.id} className="flex items-center flex-shrink-0">
            {/* Step */}
            <div className="flex flex-col items-center gap-1.5 min-w-[96px] max-w-[110px]">
              {/* Badge */}
              <span
                className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold border-2 flex-shrink-0"
                style={{ borderColor: s.color, color: s.color }}
              >
                {s.tag}
              </span>
              {/* Name */}
              <span className="text-[10px] text-center text-[rgb(var(--fg-soft))] leading-tight px-1">
                {s.title.replace(" Interview", "").replace(" Assessment", "").replace(" Challenge", "")}
              </span>
              {/* Type pill */}
              <span
                className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold"
                style={
                  s.type === "automated"
                    ? { background: "#0d948818", color: "#0d9488" }
                    : { background: "#7c3aed18", color: "#7c3aed" }
                }
              >
                {s.type === "automated" ? "🤖 Auto" : "👤 Human"}
              </span>
            </div>

            {/* Arrow connector */}
            {i < stages.length - 1 && (
              <div className="flex items-center flex-shrink-0 mx-1">
                <div className="h-px w-5 bg-[rgb(var(--border-strong))]" />
                <svg width="6" height="10" viewBox="0 0 6 10" className="text-[rgb(var(--muted))]">
                  <polyline points="1,1 5,5 1,9" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-[rgb(var(--border))] flex flex-wrap gap-4 text-[11px] text-[rgb(var(--muted))]">
        <span className="flex items-center gap-1.5">
          <span className="text-[#0d9488] font-semibold">🤖 Automated</span>
          — no human, instant result
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-[#7c3aed] font-semibold">👤 Human</span>
          — real interviewer, subjective score
        </span>
        {platform === "turing" && (
          <span className="text-[rgb(var(--muted))]">
            Fail any stage → 3-month retake lock
          </span>
        )}
        {platform === "andela" && (
          <span className="text-[rgb(var(--muted))]">
            Fail any stage → 30-day retake lock
          </span>
        )}
      </div>
    </div>
  );
}

// ── Single stage section ───────────────────────────────────────────────────────

function StageSection({ stage }: { stage: TestStage }) {
  const topics = SYLLABUS.filter((s) => s.testStages.includes(stage.id));
  const stageBuilt = topics.reduce((a, s) => a + countQs(s), 0);
  const stageTarget = topics.reduce((a, s) => a + s.targetQs, 0);
  const pct = stageTarget > 0 ? Math.round((stageBuilt / stageTarget) * 100) : 0;

  return (
    <section id={stage.id} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] overflow-hidden">

      {/* ── Stage header ── */}
      <div
        className="border-b border-[rgb(var(--border))] p-5"
        style={{ borderLeft: `4px solid ${stage.color}` }}
      >
        {/* Stage number + type badge */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
            style={{ background: `${stage.color}18`, color: stage.color }}
          >
            Stage {stage.order} of {stage.totalStages}
          </span>
          <span
            className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded"
            style={
              stage.type === "automated"
                ? { background: "#0d948818", color: "#0d9488" }
                : { background: "#7c3aed18", color: "#7c3aed" }
            }
          >
            {stage.type === "automated" ? "🤖 Online Test · Automated" : "👤 Live Interview · Human"}
          </span>
        </div>

        {/* Title row */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[13px] font-bold px-2 py-0.5 rounded"
                style={{ background: `${stage.color}18`, color: stage.color }}
              >
                {stage.tag}
              </span>
              <h2 className="text-[18px] font-semibold text-[rgb(var(--fg))]">
                {stage.title}
              </h2>
            </div>
            <div className="flex flex-wrap gap-4 text-[12px] text-[rgb(var(--muted))] mt-1">
              <span className="flex items-center gap-1.5"><ClockIcon />{stage.duration}</span>
              <span className="flex items-center gap-1.5"><FormatIcon />{stage.format}</span>
            </div>
          </div>

          {/* Progress */}
          {stageTarget > 0 && (
            <div className="text-right flex-shrink-0">
              <div className="text-[13px] font-mono tabular-nums text-[rgb(var(--fg-soft))]">
                {stageBuilt} / {stageTarget}
              </div>
              <div className="text-[11px] text-[rgb(var(--muted))]">{pct}% practiced</div>
              <div className="mt-1.5 w-24 h-[4px] rounded-full bg-[rgb(var(--panel-2))] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: stage.color }} />
              </div>
            </div>
          )}
        </div>

        {/* What to expect */}
        <div className="mt-4 space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[rgb(var(--muted))]">
            What happens in this stage
          </p>
          <ul className="space-y-1">
            {stage.whatToExpect.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-[rgb(var(--fg-soft))]">
                <span className="mt-1 w-1 h-1 rounded-full flex-shrink-0" style={{ background: stage.color }} />
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        {/* Pass mark */}
        <div className="mt-3 flex items-start gap-2 text-[12px]">
          <span className="text-[rgb(var(--muted))] font-semibold flex-shrink-0">Pass mark:</span>
          <span className="text-[rgb(var(--fg-soft))]">{stage.passMark}</span>
        </div>

        {/* Key tip */}
        <div
          className="mt-3 px-3 py-2 rounded-lg text-[12px] leading-relaxed"
          style={{ background: `${stage.color}10`, color: stage.color }}
        >
          <span className="font-bold">Key tip: </span>
          {stage.keyTip}
        </div>
      </div>

      {/* ── Practice topics ── */}
      {topics.length > 0 && (
        <div className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[rgb(var(--muted))] mb-3">
            Practice questions for this stage
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {topics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} color={stage.color} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// ── Topic card ─────────────────────────────────────────────────────────────────

function TopicCard({ topic, color }: { topic: SyllabusEntry; color: string }) {
  const built = countQs(topic);
  const pct = Math.min(100, Math.round((built / topic.targetQs) * 100));
  const isPlanned = topic.status === "planned";
  const href = topic.moduleId ? `/module/${topic.moduleId}` : `/planned/${topic.id}`;

  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel-2))]/50 p-3 hover:border-[rgb(var(--border-strong))] hover:bg-[rgb(var(--panel-2))] transition"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-[rgb(var(--fg))] group-hover:text-[rgb(var(--accent))] truncate leading-tight">
          {topic.title}
        </span>
        <span className="text-[11px] font-mono tabular-nums text-[rgb(var(--muted))] flex-shrink-0">
          {isPlanned ? "—" : `${built}/${topic.targetQs}`}
        </span>
      </div>
      <p className="text-[11px] text-[rgb(var(--muted))] line-clamp-2 leading-relaxed">
        {topic.blurb}
      </p>
      <div className="h-[3px] rounded-full bg-[rgb(var(--border))] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: isPlanned ? "rgb(var(--border-strong))" : color }}
        />
      </div>
    </Link>
  );
}

// ── All topics fallback ────────────────────────────────────────────────────────

function AllTopicsView() {
  const totalBuilt = SYLLABUS.reduce((a, s) => a + countQs(s), 0);
  const totalTarget = SYLLABUS.reduce((a, s) => a + s.targetQs, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-[26px] font-semibold text-[rgb(var(--fg))] leading-tight">Full Syllabus</h1>
          <p className="text-[13px] text-[rgb(var(--muted))] mt-1">
            {SYLLABUS.length} stages · {totalBuilt.toLocaleString()} / {totalTarget.toLocaleString()} questions
          </p>
        </div>
        <ResumeButton />
      </div>

      <div className="flex items-center gap-2">
        <Link href="/?platform=turing" className="px-4 py-2 rounded-lg border border-[rgb(var(--border))] text-[13px] text-[rgb(var(--fg-soft))] hover:border-[rgb(var(--border-strong))] transition">⚡ Turing FDE</Link>
        <Link href="/?platform=andela" className="px-4 py-2 rounded-lg border border-[rgb(var(--border))] text-[13px] text-[rgb(var(--fg-soft))] hover:border-[rgb(var(--border-strong))] transition">🌍 Andela</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {SYLLABUS.map((s) => {
          const built = countQs(s);
          const pct = Math.min(100, Math.round((built / s.targetQs) * 100));
          const href = s.moduleId ? `/module/${s.moduleId}` : `/planned/${s.id}`;
          const sc = s.status === "built" ? "var(--accent)" : s.status === "partial" ? "var(--medium)" : "var(--border-strong)";
          return (
            <Link key={s.id} href={href} className="group block rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4 hover:border-[rgb(var(--border-strong))] transition">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-[rgb(var(--muted))]">{String(s.num).padStart(2,"0")}</span>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: `rgb(${sc})` }} />
                <span className="text-[14px] font-medium text-[rgb(var(--fg))] group-hover:text-[rgb(var(--accent))] truncate">{s.title}</span>
              </div>
              <p className="text-[12px] text-[rgb(var(--muted))] line-clamp-2 mb-3">{s.blurb}</p>
              <div className="flex justify-between text-[11px] font-mono mb-1.5">
                <span className="text-[rgb(var(--fg-soft))]">{built}/{s.targetQs}</span>
                <span className="text-[rgb(var(--muted))]">{s.status === "planned" ? "planned" : `${pct}%`}</span>
              </div>
              <div className="h-[3px] rounded-full bg-[rgb(var(--panel-2))] overflow-hidden">
                <div className="h-full" style={{ width: `${pct}%`, background: `rgb(${sc})` }} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function countQs(s: SyllabusEntry): number {
  let n = 0;
  if (s.moduleId) { const m = getModule(s.moduleId); if (m) n += m.questions.length; }
  if (s.extraModuleIds) { for (const id of s.extraModuleIds) { const m = getModule(id); if (m) n += m.questions.length; } }
  return n;
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function FormatIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}
