"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadProgress } from "@/lib/storage";
import type { Module, QuestionProgress } from "@/lib/types";

export function ModuleQuestionList({ module }: { module: Module }) {
  const [progress, setProgress] = useState<Record<string, QuestionProgress>>({});

  useEffect(() => {
    setProgress(loadProgress().questions);
  }, []);

  const difficultyColor: Record<string, string> = {
    easy: "text-ok",
    medium: "text-warn",
    hard: "text-err",
  };

  return (
    <section>
      <div className="grid grid-cols-1 gap-2">
        {module.questions.map((q, i) => {
          const p = progress[q.id];
          return (
            <Link
              key={q.id}
              href={`/module/${module.module}/question/${q.id}`}
              className="flex items-center gap-4 rounded-md border border-border bg-panel p-3 hover:border-accent/60 transition"
            >
              <div className="flex-shrink-0 w-8 text-center text-xs text-muted">
                {i + 1}
              </div>
              <div className="flex-shrink-0 w-14">
                <span
                  className={`text-[10px] uppercase tracking-wider ${difficultyColor[q.difficulty]}`}
                >
                  {q.difficulty}
                </span>
              </div>
              <div className="flex-shrink-0 w-24 text-xs text-muted truncate">
                {q.topic}
              </div>
              <div className="flex-1 text-sm truncate">{q.prompt}</div>
              <div className="flex-shrink-0 text-xs">
                {p?.answered ? (
                  p.correct || (p.selfScore ?? 0) >= 0.7 ? (
                    <span className="text-ok">✓ done</span>
                  ) : (
                    <span className="text-warn">✗ retry</span>
                  )
                ) : (
                  <span className="text-muted">·</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
