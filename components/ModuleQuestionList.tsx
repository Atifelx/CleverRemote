"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadProgress } from "@/lib/storage";
import type { Module, QuestionProgress } from "@/lib/types";

export function ModuleQuestionList({ module }: { module: Module }) {
  const [progress, setProgress] = useState<Record<string, QuestionProgress>>({});
  const [activeSub, setActiveSub] = useState<string | "all">("all");

  useEffect(() => {
    setProgress(loadProgress().questions);
  }, []);

  const groups = useMemo(() => {
    const g = new Map<string, typeof module.questions>();
    for (const q of module.questions) {
      const key = q.subtopic ?? "General";
      if (!g.has(key)) g.set(key, [] as typeof module.questions);
      g.get(key)!.push(q);
    }
    return [...g.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [module]);

  const filtered = activeSub === "all" ? module.questions : groups.find((g) => g[0] === activeSub)?.[1] ?? [];

  const diffClass: Record<string, string> = {
    easy: "diff-easy",
    medium: "diff-medium",
    hard: "diff-hard",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
      {/* Sidebar — subtopic list */}
      <aside className="lg:sticky lg:top-4 self-start">
        <div className="text-[11px] uppercase tracking-wider text-[rgb(var(--muted))] mb-2 px-2">
          Subtopics
        </div>
        <div className="flex flex-col gap-0.5">
          <SubButton
            label="All"
            count={module.questions.length}
            active={activeSub === "all"}
            onClick={() => setActiveSub("all")}
          />
          {groups.map(([sub, qs]) => (
            <SubButton
              key={sub}
              label={sub}
              count={qs.length}
              done={qs.filter((q) => progress[q.id]?.answered).length}
              active={activeSub === sub}
              onClick={() => setActiveSub(sub)}
            />
          ))}
        </div>

        {module.studyNotes?.[activeSub] && (
          <div className="mt-4 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3">
            <div className="text-[10px] uppercase tracking-wider text-[rgb(var(--muted))] mb-2">
              Study
            </div>
            <ul className="text-[12px] text-[rgb(var(--fg-soft))] space-y-1 list-disc pl-4">
              {module.studyNotes[activeSub].map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      {/* Problem table */}
      <section className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] overflow-hidden">
        <table className="w-full text-[13px]">
          <thead className="bg-[rgb(var(--panel-2))] border-b border-[rgb(var(--border))]">
            <tr className="text-left text-[10px] uppercase tracking-wider text-[rgb(var(--muted))]">
              <th className="px-3 py-2.5 w-12">Status</th>
              <th className="px-3 py-2.5 w-16">#</th>
              <th className="px-3 py-2.5">Problem</th>
              <th className="px-3 py-2.5 w-24">Difficulty</th>
              <th className="px-3 py-2.5 w-20 text-right">Time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((q, i) => {
              const p = progress[q.id];
              const done = p?.answered && (p.correct || (p.selfScore ?? 0) >= 0.7);
              const retry = p?.answered && !done;
              const mins = q.timeBudgetSec ? Math.round(q.timeBudgetSec / 60) : 1;
              return (
                <tr
                  key={q.id}
                  className="border-b border-[rgb(var(--border))] last:border-b-0 hover:bg-[rgb(var(--panel-2))]/60"
                >
                  <td className="px-3 py-2.5">
                    {done ? (
                      <span className="text-[rgb(var(--accent))]">●</span>
                    ) : retry ? (
                      <span className="text-[rgb(var(--medium))]">◐</span>
                    ) : (
                      <span className="text-[rgb(var(--border-strong))]">○</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[rgb(var(--muted))]">
                    {String(i + 1).padStart(3, "0")}
                  </td>
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/module/${module.module}/question/${q.id}`}
                      className="text-[rgb(var(--fg))] hover:text-[rgb(var(--accent))] font-medium"
                    >
                      {q.prompt.split("\n")[0].slice(0, 90)}
                      {q.prompt.length > 90 ? "…" : ""}
                    </Link>
                    {q.niche && (
                      <div className="text-[11px] text-[rgb(var(--muted))] mt-0.5">
                        {q.niche}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${diffClass[q.difficulty] ?? ""}`}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-[rgb(var(--muted))] text-[12px]">
                    {mins} min
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function SubButton({
  label,
  count,
  done,
  active,
  onClick,
}: {
  label: string;
  count: number;
  done?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left flex items-center justify-between px-2 py-1.5 rounded transition text-[12.5px] ${
        active
          ? "bg-[rgb(var(--panel-2))] text-[rgb(var(--fg))] font-medium"
          : "text-[rgb(var(--fg-soft))] hover:bg-[rgb(var(--panel-2))]/60"
      }`}
    >
      <span className="truncate">{label}</span>
      <span className="text-[11px] font-mono text-[rgb(var(--muted))] ml-2">
        {done !== undefined ? `${done}/${count}` : count}
      </span>
    </button>
  );
}
