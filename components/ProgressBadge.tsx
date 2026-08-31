"use client";

import { useEffect, useState } from "react";
import { loadProgress } from "@/lib/storage";
import type { Module } from "@/lib/types";

export function ProgressBadge({ module }: { module: Module }) {
  const [state, setState] = useState<{ answered: number; correct: number } | null>(null);

  useEffect(() => {
    const p = loadProgress();
    let answered = 0;
    let correct = 0;
    for (const q of module.questions) {
      const rec = p.questions[q.id];
      if (rec?.answered) {
        answered++;
        if (rec.correct || (rec.selfScore ?? 0) >= 0.7) correct++;
      }
    }
    setState({ answered, correct });
  }, [module]);

  if (!state) return <span className="text-xs text-muted">…</span>;
  const total = module.questions.length;
  const pct = total ? Math.round((state.answered / total) * 100) : 0;
  return (
    <div className="text-xs text-muted">
      <span className="text-fg font-medium">{state.answered}</span>/{total} done
      <span className="mx-1">·</span>
      <span className="text-ok">{state.correct}</span> correct
      <span className="mx-1">·</span>
      <span>{pct}%</span>
    </div>
  );
}
