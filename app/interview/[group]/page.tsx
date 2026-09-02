"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { GROUPS, QUESTIONS, type IQ, type Difficulty } from "@/lib/interview-data";

const diffColor: Record<Difficulty, string> = {
  easy: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  medium: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  hard: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};
const typeLabel: Record<string, string> = {
  mcq: "MCQ",
  multi: "Multi-select",
  truefalse: "True / False",
  short: "Short answer",
  code: "Code",
};

function storageKey(groupId: string) {
  return `interview_done_${groupId}`;
}

export default function GroupPage() {
  const params = useParams();
  const groupId = params.group as string;

  const group = GROUPS.find((g) => g.id === groupId);
  const allQ = QUESTIONS.filter((q) => q.group === groupId);

  const [filter, setFilter] = useState<"all" | Difficulty>("all");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [done, setDone] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  // Load progress from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey(groupId));
      if (stored) setDone(new Set(JSON.parse(stored)));
    } catch {}
  }, [groupId]);

  function toggleDone(id: string) {
    setDone((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      try {
        localStorage.setItem(storageKey(groupId), JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }

  function toggleReveal(id: string) {
    setRevealed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function revealAll() {
    setRevealed(new Set(filtered.map((q) => q.id)));
  }

  function collapseAll() {
    setRevealed(new Set());
  }

  if (!group) {
    return (
      <div className="py-20 text-center text-[rgb(var(--muted))]">
        Group not found.{" "}
        <Link href="/interview" className="text-[rgb(var(--accent))]">
          Back to Interview Prep
        </Link>
      </div>
    );
  }

  const filtered = allQ.filter((q) => {
    if (filter !== "all" && q.difficulty !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return q.question.toLowerCase().includes(s) || q.answer.toLowerCase().includes(s);
    }
    return true;
  });

  const doneCount = allQ.filter((q) => done.has(q.id)).length;
  const pct = allQ.length ? Math.round((doneCount / allQ.length) * 100) : 0;

  // Adjacent groups for prev/next
  const gi = GROUPS.findIndex((g) => g.id === groupId);
  const prev = gi > 0 ? GROUPS[gi - 1] : null;
  const next = gi < GROUPS.length - 1 ? GROUPS[gi + 1] : null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-[rgb(var(--muted))]">
        <Link href="/interview" className="hover:text-[rgb(var(--fg))] transition">
          Interview Prep
        </Link>
        <span>/</span>
        <span className="text-[rgb(var(--fg))]">{group.label}</span>
      </div>

      {/* Header */}
      <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-[32px]">{group.icon}</span>
            <div>
              <h1 className="text-[24px] font-bold text-[rgb(var(--fg))]">{group.label}</h1>
              <p className="text-[13px] text-[rgb(var(--muted))] mt-1">{group.desc}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[28px] font-bold text-[rgb(var(--accent))]">
              {doneCount}/{allQ.length}
            </div>
            <div className="text-[11px] text-[rgb(var(--muted))]">completed</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 bg-[rgb(var(--panel-2))] rounded-full overflow-hidden">
          <div
            className="h-full bg-[rgb(var(--accent))] rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1.5 text-[11px] text-[rgb(var(--muted))]">{pct}% complete</div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <input
          type="text"
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] text-[13px] text-[rgb(var(--fg))] placeholder-[rgb(var(--muted))] focus:outline-none focus:border-[rgb(var(--accent))]/50 w-64"
        />

        {/* Difficulty filter */}
        <div className="flex items-center gap-1">
          {(["all", "easy", "medium", "hard"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition ${
                filter === d
                  ? "bg-[rgb(var(--accent))]/15 border-[rgb(var(--accent))]/40 text-[rgb(var(--accent))]"
                  : "border-[rgb(var(--border))] text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] hover:border-[rgb(var(--border))]/80 bg-[rgb(var(--panel))]"
              }`}
            >
              {d === "all" ? `All (${allQ.length})` : `${d.charAt(0).toUpperCase() + d.slice(1)} (${allQ.filter((q) => q.difficulty === d).length})`}
            </button>
          ))}
        </div>

        <div className="ml-auto flex gap-2">
          <button
            onClick={revealAll}
            className="px-3 py-1.5 rounded-lg text-[12px] border border-[rgb(var(--border))] bg-[rgb(var(--panel))] text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition"
          >
            Reveal all
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 rounded-lg text-[12px] border border-[rgb(var(--border))] bg-[rgb(var(--panel))] text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition"
          >
            Collapse all
          </button>
        </div>
      </div>

      {/* Results count */}
      {search || filter !== "all" ? (
        <p className="text-[12px] text-[rgb(var(--muted))]">
          Showing {filtered.length} of {allQ.length} questions
        </p>
      ) : null}

      {/* Question list */}
      <div className="space-y-3">
        {filtered.map((q, idx) => (
          <QuestionCard
            key={q.id}
            q={q}
            idx={allQ.indexOf(q) + 1}
            revealed={revealed.has(q.id)}
            done={done.has(q.id)}
            onReveal={() => toggleReveal(q.id)}
            onToggleDone={() => toggleDone(q.id)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="py-16 text-center text-[rgb(var(--muted))]">
            No questions match your filters.
          </div>
        )}
      </div>

      {/* Prev / Next */}
      <div className="flex items-center justify-between pt-4 border-t border-[rgb(var(--border))]">
        {prev ? (
          <Link
            href={`/interview/${prev.id}`}
            className="flex items-center gap-2 text-[13px] text-[rgb(var(--muted))] hover:text-[rgb(var(--accent))] transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span>
              {prev.icon} {prev.label}
            </span>
          </Link>
        ) : (
          <div />
        )}
        <Link href="/interview" className="text-[12px] text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition">
          All groups
        </Link>
        {next ? (
          <Link
            href={`/interview/${next.id}`}
            className="flex items-center gap-2 text-[13px] text-[rgb(var(--muted))] hover:text-[rgb(var(--accent))] transition"
          >
            <span>
              {next.icon} {next.label}
            </span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}

function QuestionCard({
  q,
  idx,
  revealed,
  done,
  onReveal,
  onToggleDone,
}: {
  q: IQ;
  idx: number;
  revealed: boolean;
  done: boolean;
  onReveal: () => void;
  onToggleDone: () => void;
}) {
  return (
    <div
      className={`rounded-xl border transition ${
        done
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-[rgb(var(--border))] bg-[rgb(var(--panel))]"
      }`}
    >
      {/* Question header — always visible */}
      <div className="p-5">
        <div className="flex items-start gap-3">
          {/* Number + done checkbox */}
          <button
            onClick={onToggleDone}
            title="Mark as done"
            className={`w-8 h-8 rounded-full border flex-shrink-0 flex items-center justify-center text-[12px] font-bold transition mt-0.5 ${
              done
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                : "border-[rgb(var(--border))] text-[rgb(var(--muted))] hover:border-[rgb(var(--accent))]/50"
            }`}
          >
            {done ? "✓" : idx}
          </button>

          <div className="flex-1 min-w-0">
            {/* Tags row */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${diffColor[q.difficulty]}`}
              >
                {q.difficulty}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[rgb(var(--panel-2))] border border-[rgb(var(--border))] text-[rgb(var(--muted))]">
                {typeLabel[q.type]}
              </span>
              {q.tags.filter((t) => ["turing", "toptal", "andela"].includes(t)).map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[rgb(var(--accent))]/10 border border-[rgb(var(--accent))]/20 text-[rgb(var(--accent))]"
                >
                  {t}
                </span>
              ))}
              {q.tags.includes("frequently-tested") && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  ⭐ frequently tested
                </span>
              )}
            </div>

            {/* Question text */}
            <p className="text-[14px] font-medium text-[rgb(var(--fg))] leading-relaxed">
              {q.question}
            </p>

            {/* Options for MCQ / truefalse */}
            {(q.type === "mcq" || q.type === "truefalse" || q.type === "multi") && q.options && !revealed && (
              <div className="mt-3 space-y-1.5">
                {q.options.map((opt, oi) => (
                  <div
                    key={oi}
                    className="flex items-center gap-2 text-[13px] text-[rgb(var(--fg-soft))] px-3 py-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel-2))]"
                  >
                    <span className="text-[11px] font-bold text-[rgb(var(--muted))] w-4 flex-shrink-0">
                      {String.fromCharCode(65 + oi)}.
                    </span>
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reveal button */}
          <button
            onClick={onReveal}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition ${
              revealed
                ? "bg-[rgb(var(--panel-2))] border-[rgb(var(--border))] text-[rgb(var(--muted))]"
                : "bg-[rgb(var(--accent))]/15 border-[rgb(var(--accent))]/30 text-[rgb(var(--accent))] hover:bg-[rgb(var(--accent))]/25"
            }`}
          >
            {revealed ? "Hide" : "Reveal"}
          </button>
        </div>
      </div>

      {/* Answer panel — revealed */}
      {revealed && (
        <div className="border-t border-[rgb(var(--border))] bg-[rgb(var(--panel-2))]/50">
          {/* Options with correct highlighted */}
          {(q.type === "mcq" || q.type === "truefalse" || q.type === "multi") && q.options && (
            <div className="px-5 pt-4 space-y-1.5">
              {q.options.map((opt, oi) => {
                const isCorrect =
                  q.answer === opt ||
                  (Array.isArray(q.answer) && (q.answer as string[]).includes(opt));
                return (
                  <div
                    key={oi}
                    className={`flex items-center gap-2 text-[13px] px-3 py-2 rounded-lg border transition ${
                      isCorrect
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                        : "border-[rgb(var(--border))] bg-[rgb(var(--panel))] text-[rgb(var(--muted))]"
                    }`}
                  >
                    <span className="text-[11px] font-bold w-4 flex-shrink-0">
                      {isCorrect ? "✓" : String.fromCharCode(65 + oi) + "."}
                    </span>
                    {opt}
                  </div>
                );
              })}
            </div>
          )}

          {/* Model answer */}
          <div className="px-5 pt-4 pb-2">
            <div className="text-[11px] uppercase tracking-wider text-[rgb(var(--accent))] font-semibold mb-2">
              Model Answer
            </div>
            <p className="text-[13px] text-[rgb(var(--fg))] leading-relaxed whitespace-pre-wrap">
              {q.answer}
            </p>
          </div>

          {/* Explanation */}
          <div className="px-5 pt-3 pb-5">
            <div className="text-[11px] uppercase tracking-wider text-[rgb(var(--muted))] font-semibold mb-2">
              Why this matters / deeper dive
            </div>
            <div className="rounded-lg bg-[rgb(var(--panel))] border border-[rgb(var(--border))] p-4">
              <p className="text-[13px] text-[rgb(var(--fg-soft))] leading-relaxed">
                {q.explanation}
              </p>
            </div>
          </div>

          {/* Mark done */}
          <div className="px-5 pb-5">
            <button
              onClick={onToggleDone}
              className={`w-full py-2 rounded-lg text-[13px] font-medium border transition ${
                done
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
                  : "border-[rgb(var(--border))] text-[rgb(var(--muted))] hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-emerald-500/10"
              }`}
            >
              {done ? "✓ Marked as done — click to unmark" : "Mark as done (saves progress)"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
