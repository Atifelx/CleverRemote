import Link from "next/link";
import { allModules } from "@/lib/data";
import { SYLLABUS } from "@/lib/syllabus";

type SP = {
  diff?: string;
  mod?: string;
  type?: string;
  q?: string;
};

export default async function BrowseQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const params = await searchParams;
  const filterDiff = params.diff ?? "all";
  const filterMod = params.mod ?? "all";
  const filterType = params.type ?? "all";
  const search = (params.q ?? "").toLowerCase().trim();

  const modules = allModules();

  // Build flat list of all questions
  type QRow = {
    moduleId: string;
    moduleTitle: string;
    qid: string;
    prompt: string;
    difficulty: string;
    type: string;
    subtopic: string;
    timeBudgetSec: number;
  };

  const all: QRow[] = [];
  for (const m of modules) {
    const syllabusEntry = SYLLABUS.find((s) => s.moduleId === m.module);
    const moduleTitle = syllabusEntry?.title ?? m.title;
    for (const q of m.questions) {
      all.push({
        moduleId: m.module,
        moduleTitle,
        qid: q.id,
        prompt: q.prompt,
        difficulty: q.difficulty ?? "medium",
        type: q.type,
        subtopic: q.subtopic ?? "",
        timeBudgetSec: q.timeBudgetSec ?? 60,
      });
    }
  }

  // Filter
  const filtered = all.filter((q) => {
    if (filterDiff !== "all" && q.difficulty !== filterDiff) return false;
    if (filterMod !== "all" && q.moduleId !== filterMod) return false;
    if (filterType !== "all" && q.type !== filterType) return false;
    if (search && !q.prompt.toLowerCase().includes(search) && !q.subtopic.toLowerCase().includes(search)) return false;
    return true;
  });

  const totalAll = all.length;
  const easy = all.filter((q) => q.difficulty === "easy").length;
  const med = all.filter((q) => q.difficulty === "medium").length;
  const hard = all.filter((q) => q.difficulty === "hard").length;

  const diffColors: Record<string, string> = {
    easy: "rgb(var(--easy))",
    medium: "rgb(var(--medium))",
    hard: "rgb(var(--hard))",
  };
  const diffBg: Record<string, string> = {
    easy: "diff-easy",
    medium: "diff-medium",
    hard: "diff-hard",
  };

  const typeLabel: Record<string, string> = {
    "mcq-single": "MCQ",
    "mcq-multi": "Multi-MCQ",
    "open-rubric": "Open / Rubric",
    "short-code": "Code",
    "code-output": "Code Output",
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-[12px] text-[rgb(var(--muted))]">
        <Link href="/?platform=all" className="hover:text-[rgb(var(--fg))]">All Topics</Link>
        <span className="mx-2">/</span>
        <span className="text-[rgb(var(--fg-soft))]">Browse All Questions</span>
      </div>

      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight text-[rgb(var(--fg))]">
            Browse All Questions
          </h1>
          <p className="text-[13px] text-[rgb(var(--muted))] mt-1">
            {totalAll.toLocaleString()} questions across {modules.length} modules
          </p>
        </div>
        {/* Stat pills */}
        <div className="flex items-center gap-2 text-[11px]">
          <span className="px-2 py-1 rounded font-mono diff-easy">{easy} easy</span>
          <span className="px-2 py-1 rounded font-mono diff-medium">{med} med</span>
          <span className="px-2 py-1 rounded font-mono diff-hard">{hard} hard</span>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4 space-y-3">
        {/* Search */}
        <form method="GET" className="flex gap-2 flex-wrap items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[rgb(var(--muted))] mb-1">
              Search
            </label>
            <input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Search question text or subtopic…"
              className="w-full px-3 py-1.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel-2))] text-[13px] text-[rgb(var(--fg))] placeholder:text-[rgb(var(--muted))] focus:outline-none focus:border-[rgb(var(--accent))]"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[rgb(var(--muted))] mb-1">
              Difficulty
            </label>
            <select
              name="diff"
              defaultValue={filterDiff}
              className="px-3 py-1.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel-2))] text-[13px] text-[rgb(var(--fg))] focus:outline-none focus:border-[rgb(var(--accent))]"
            >
              <option value="all">All difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[rgb(var(--muted))] mb-1">
              Type
            </label>
            <select
              name="type"
              defaultValue={filterType}
              className="px-3 py-1.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel-2))] text-[13px] text-[rgb(var(--fg))] focus:outline-none focus:border-[rgb(var(--accent))]"
            >
              <option value="all">All types</option>
              <option value="mcq-single">MCQ</option>
              <option value="mcq-multi">Multi-select MCQ</option>
              <option value="open-rubric">Open / Rubric</option>
              <option value="short-code">Code</option>
              <option value="code-output">Code Output</option>
            </select>
          </div>

          {/* Module */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[rgb(var(--muted))] mb-1">
              Module
            </label>
            <select
              name="mod"
              defaultValue={filterMod}
              className="px-3 py-1.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel-2))] text-[13px] text-[rgb(var(--fg))] focus:outline-none focus:border-[rgb(var(--accent))] max-w-[200px]"
            >
              <option value="all">All modules</option>
              {modules.map((m) => {
                const s = SYLLABUS.find((s) => s.moduleId === m.module);
                return (
                  <option key={m.module} value={m.module}>
                    {s?.title ?? m.title}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Keep other params when filtering one */}
          {filterDiff !== "all" && <input type="hidden" name="diff" value={filterDiff} />}
          {filterMod !== "all" && <input type="hidden" name="mod" value={filterMod} />}
          {filterType !== "all" && <input type="hidden" name="type" value={filterType} />}

          <button
            type="submit"
            className="px-4 py-1.5 rounded-lg bg-[rgb(var(--fg))] text-[rgb(var(--bg))] text-[13px] font-medium hover:opacity-90 transition"
          >
            Filter
          </button>
          {(filterDiff !== "all" || filterMod !== "all" || filterType !== "all" || search) && (
            <Link
              href="/questions"
              className="px-3 py-1.5 rounded-lg border border-[rgb(var(--border))] text-[13px] text-[rgb(var(--muted))] hover:border-[rgb(var(--border-strong))] transition"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Results count */}
      <p className="text-[12px] text-[rgb(var(--muted))]">
        Showing <span className="font-semibold text-[rgb(var(--fg-soft))]">{filtered.length.toLocaleString()}</span> of {totalAll.toLocaleString()} questions
      </p>

      {/* Question list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-[rgb(var(--muted))]">
            <p className="text-[32px] mb-3">🔍</p>
            <p className="text-[14px]">No questions match your filters.</p>
            <Link href="/questions" className="mt-3 inline-block text-[13px] text-[rgb(var(--accent))] hover:underline">
              Clear filters
            </Link>
          </div>
        )}
        {filtered.map((q, i) => (
          <Link
            key={`${q.moduleId}-${q.qid}`}
            href={`/module/${q.moduleId}/question/${q.qid}`}
            className="group flex items-start gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4 py-3 hover:border-[rgb(var(--border-strong))] hover:bg-[rgb(var(--panel-2))] transition"
          >
            {/* Number */}
            <span className="text-[11px] font-mono text-[rgb(var(--muted))] pt-0.5 w-8 flex-shrink-0 tabular-nums">
              {String(i + 1).padStart(3, "0")}
            </span>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <p className="text-[14px] text-[rgb(var(--fg))] group-hover:text-[rgb(var(--accent))] leading-snug line-clamp-2">
                {q.prompt}
              </p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-[11px] text-[rgb(var(--muted))]">{q.moduleTitle}</span>
                {q.subtopic && (
                  <>
                    <span className="text-[rgb(var(--border-strong))]">·</span>
                    <span className="text-[11px] text-[rgb(var(--muted))] truncate max-w-[200px]">{q.subtopic}</span>
                  </>
                )}
              </div>
            </div>

            {/* Right meta */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] text-[rgb(var(--muted))] font-mono hidden sm:block">
                {typeLabel[q.type] ?? q.type}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${diffBg[q.difficulty] ?? ""}`}>
                {q.difficulty}
              </span>
              <span className="text-[11px] text-[rgb(var(--muted))] font-mono">
                {q.timeBudgetSec < 60 ? `${q.timeBudgetSec}s` : `${Math.round(q.timeBudgetSec / 60)}m`}
              </span>
              <svg
                className="w-4 h-4 text-[rgb(var(--muted))] group-hover:text-[rgb(var(--accent))] transition"
                fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
