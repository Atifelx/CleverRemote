"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Question } from "@/lib/types";
import { loadProgress, setLastLocation, updateQuestion } from "@/lib/storage";

type Props = {
  moduleId: string;
  moduleTitle: string;
  question: Question;
  prevHref: string | null;
  nextHref: string | null;
  positionLabel: string;
};

const diffClass: Record<string, string> = {
  easy: "diff-easy",
  medium: "diff-medium",
  hard: "diff-hard",
};

export function QuestionRunner({
  moduleId,
  moduleTitle,
  question,
  prevHref,
  nextHref,
  positionLabel,
}: Props) {
  const isMulti = question.type === "mcq-multi";
  const isMcq = question.type.startsWith("mcq") || question.type === "code-output";

  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [rubricChecks, setRubricChecks] = useState<boolean[]>([]);
  const [selfReveal, setSelfReveal] = useState(false);

  const budget = question.timeBudgetSec ?? 60;
  const [remaining, setRemaining] = useState(budget);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setSelected([]);
    setSubmitted(false);
    setSelfReveal(false);
    setRubricChecks(new Array(question.rubric?.length ?? 0).fill(false));
    setRemaining(question.timeBudgetSec ?? 60);
    setRunning(false);
    const prior = loadProgress().questions[question.id];
    if (prior?.answered) {
      setSubmitted(true);
      setSelfReveal(true);
    }
    setLastLocation(moduleId, question.id);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [moduleId, question]);

  useEffect(() => {
    if (!running) return;
    timerRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(timerRef.current!);
          setRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [running]);

  const correct = useMemo(() => {
    if (!isMcq || !question.correct) return null;
    const want = [...question.correct].sort().join(",");
    const got = [...selected].sort().join(",");
    return want === got;
  }, [selected, question, isMcq]);

  function toggleOption(id: string) {
    if (submitted) return;
    if (!running && remaining === (question.timeBudgetSec ?? 60)) setRunning(true);
    if (isMulti) {
      setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
    } else {
      setSelected([id]);
    }
  }

  function submitMcq() {
    if (!selected.length) return;
    setSubmitted(true);
    setRunning(false);
    updateQuestion(question.id, { answered: true, correct: !!correct });
  }

  function retry() {
    setSubmitted(false);
    setSelected([]);
    setSelfReveal(false);
    setRubricChecks(new Array(question.rubric?.length ?? 0).fill(false));
    setRemaining(question.timeBudgetSec ?? 60);
    setRunning(false);
    updateQuestion(question.id, { answered: false, correct: undefined });
  }

  function scoreRubric() {
    if (!question.rubric) return;
    const totalWeight = question.rubric.reduce((s, r) => s + r.weight, 0);
    const gotWeight = question.rubric.reduce(
      (s, r, i) => s + (rubricChecks[i] ? r.weight : 0),
      0
    );
    const pct = totalWeight ? gotWeight / totalWeight : 0;
    setSelfReveal(true);
    setSubmitted(true);
    setRunning(false);
    updateQuestion(question.id, { answered: true, selfScore: pct });
  }

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const timerColor =
    remaining === 0
      ? "text-[rgb(var(--hard))]"
      : remaining < 30
        ? "text-[rgb(var(--medium))]"
        : "text-[rgb(var(--fg))]";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      {/* Left: problem */}
      <article className="min-w-0">
        <div className="text-[12px] text-[rgb(var(--muted))] mb-4">
          <Link href="/" className="hover:text-[rgb(var(--fg))]">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/module/${moduleId}`} className="hover:text-[rgb(var(--fg))]">
            {moduleTitle}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[rgb(var(--fg-soft))]">{positionLabel}</span>
        </div>

        <div className="flex items-center gap-2 mb-3 text-[11px]">
          <span className={`px-2 py-0.5 rounded font-mono ${diffClass[question.difficulty]}`}>
            {question.difficulty}
          </span>
          {question.subtopic && (
            <span className="text-[rgb(var(--muted))] font-mono">{question.subtopic}</span>
          )}
          {question.niche && (
            <>
              <span className="text-[rgb(var(--muted))]">·</span>
              <span className="text-[rgb(var(--muted))]">{question.niche}</span>
            </>
          )}
        </div>

        <h1 className="text-[20px] leading-snug text-[rgb(var(--fg))] font-medium mb-4">
          {question.prompt}
        </h1>

        {question.code && (
          <pre className="mb-4">
            <code>{question.code}</code>
          </pre>
        )}

        {isMcq && question.options && (
          <div className="space-y-2">
            {question.options.map((opt) => {
              const isSelected = selected.includes(opt.id);
              const isCorrectAnswer = question.correct?.includes(opt.id);
              let cls = "border-[rgb(var(--border))] bg-[rgb(var(--panel))]";
              if (submitted) {
                if (isCorrectAnswer) cls = "border-[rgb(var(--accent))] bg-[color-mix(in_oklab,rgb(var(--accent))_10%,transparent)]";
                else if (isSelected) cls = "border-[rgb(var(--hard))] bg-[color-mix(in_oklab,rgb(var(--hard))_10%,transparent)]";
              } else if (isSelected) {
                cls = "border-[rgb(var(--fg))] bg-[rgb(var(--panel-2))]";
              }
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleOption(opt.id)}
                  disabled={submitted}
                  className={`w-full text-left rounded-md border p-3 transition text-[13.5px] ${cls} ${
                    submitted ? "cursor-default" : "hover:border-[rgb(var(--border-strong))]"
                  }`}
                >
                  <span className="inline-block w-6 mono text-[rgb(var(--muted))]">{opt.id}.</span>
                  <span className="whitespace-pre-wrap">{opt.text}</span>
                </button>
              );
            })}
          </div>
        )}

        {question.type === "short-code" && !selfReveal && (
          <div className="rounded-md border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6 text-center text-[13px] text-[rgb(var(--muted))]">
            Write your solution locally (any editor). When done, reveal the reference.
          </div>
        )}

        {question.type === "open-rubric" && question.rubric && !selfReveal && (
          <div className="rounded-md border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6 text-[13px] text-[rgb(var(--muted))]">
            Draft your answer aloud or in a scratch doc. Then self-score against the rubric on the right.
          </div>
        )}

        {submitted && isMcq && (
          <div
            className={`mt-4 rounded-md p-4 border text-[13px] ${
              correct
                ? "border-[rgb(var(--accent))] bg-[color-mix(in_oklab,rgb(var(--accent))_8%,transparent)]"
                : "border-[rgb(var(--hard))] bg-[color-mix(in_oklab,rgb(var(--hard))_8%,transparent)]"
            }`}
          >
            <div className="font-medium mb-2">
              {correct ? "Correct." : "Not quite."}
            </div>
            {question.explanation && (
              <p className="text-[rgb(var(--fg-soft))] whitespace-pre-wrap">{question.explanation}</p>
            )}
          </div>
        )}

        {question.type === "short-code" && selfReveal && question.explanation && (
          <div className="mt-4 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4">
            <div className="text-[10px] uppercase tracking-wider text-[rgb(var(--muted))] mb-2">
              Reference solution
            </div>
            <div className="text-[13px] whitespace-pre-wrap text-[rgb(var(--fg-soft))]">
              {question.explanation}
            </div>
          </div>
        )}

        {question.type === "open-rubric" && selfReveal && question.modelAnswer && (
          <div className="mt-4 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4">
            <div className="text-[10px] uppercase tracking-wider text-[rgb(var(--muted))] mb-2">
              Model answer
            </div>
            <p className="text-[13px] whitespace-pre-wrap text-[rgb(var(--fg-soft))]">
              {question.modelAnswer}
            </p>
          </div>
        )}

        <nav className="flex items-center justify-between mt-8 pt-4 border-t border-[rgb(var(--border))]">
          {prevHref ? (
            <Link href={prevHref} className="text-[12.5px] text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))]">
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          {nextHref ? (
            <Link
              href={nextHref}
              className="text-[12.5px] font-medium px-3 py-1.5 rounded-md bg-[rgb(var(--panel-2))] border border-[rgb(var(--border))] hover:border-[rgb(var(--border-strong))]"
            >
              Next →
            </Link>
          ) : (
            <span className="text-[12.5px] text-[rgb(var(--muted))]">End of module</span>
          )}
        </nav>
      </article>

      {/* Right rail: timer + actions + rubric */}
      <aside className="lg:sticky lg:top-4 self-start space-y-4">
        {/* Timer card */}
        <div className="rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4">
          <div className="text-[10px] uppercase tracking-wider text-[rgb(var(--muted))] mb-1">
            Time budget · {Math.round(budget / 60)} min
          </div>
          <div className={`text-[36px] font-semibold mono tabular-nums ${timerColor}`}>
            {mm}:{ss}
          </div>
          {!submitted && (
            <div className="flex gap-2 mt-3">
              {!running && remaining > 0 && (
                <button
                  onClick={() => setRunning(true)}
                  className="flex-1 h-9 rounded-md bg-[rgb(var(--fg))] text-[rgb(var(--bg))] text-[12.5px] font-medium hover:opacity-90"
                >
                  {remaining === budget ? "Start timer" : "Resume"}
                </button>
              )}
              {running && (
                <button
                  onClick={() => setRunning(false)}
                  className="flex-1 h-9 rounded-md border border-[rgb(var(--border))] text-[12.5px] font-medium hover:border-[rgb(var(--border-strong))]"
                >
                  Pause
                </button>
              )}
              <button
                onClick={() => { setRemaining(budget); setRunning(false); }}
                className="h-9 px-3 rounded-md border border-[rgb(var(--border))] text-[12.5px] text-[rgb(var(--muted))] hover:border-[rgb(var(--border-strong))]"
                title="Reset timer"
              >
                ↺
              </button>
            </div>
          )}
        </div>

        {/* Submit / actions */}
        <div className="rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4">
          <div className="text-[10px] uppercase tracking-wider text-[rgb(var(--muted))] mb-3">
            Actions
          </div>
          {isMcq && !submitted && (
            <button
              onClick={submitMcq}
              disabled={!selected.length}
              className="w-full h-9 rounded-md bg-[rgb(var(--accent))] text-white text-[13px] font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit {isMulti ? `(${selected.length})` : ""}
            </button>
          )}
          {isMcq && submitted && (
            <button
              onClick={retry}
              className="w-full h-9 rounded-md border border-[rgb(var(--border))] text-[13px] hover:border-[rgb(var(--border-strong))]"
            >
              Try again
            </button>
          )}
          {question.type === "short-code" && (
            <button
              onClick={() => {
                setSelfReveal(true);
                setSubmitted(true);
                setRunning(false);
                updateQuestion(question.id, { answered: true, selfScore: 1 });
              }}
              className="w-full h-9 rounded-md bg-[rgb(var(--accent))] text-white text-[13px] font-medium"
            >
              {selfReveal ? "Reference shown" : "Reveal reference"}
            </button>
          )}
        </div>

        {/* Rubric for open-rubric */}
        {question.type === "open-rubric" && question.rubric && (
          <div className="rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4">
            <div className="text-[10px] uppercase tracking-wider text-[rgb(var(--muted))] mb-2">
              Self-score rubric
            </div>
            <ul className="space-y-2">
              {question.rubric.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-[12.5px]">
                  <input
                    type="checkbox"
                    checked={!!rubricChecks[i]}
                    onChange={(e) =>
                      setRubricChecks((cur) => {
                        const next = [...cur];
                        next[i] = e.target.checked;
                        return next;
                      })
                    }
                    disabled={submitted}
                    className="mt-1"
                  />
                  <span className="text-[rgb(var(--fg-soft))]">
                    {r.criterion}{" "}
                    <span className="text-[10px] text-[rgb(var(--muted))]">
                      (w{r.weight})
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            {!submitted && (
              <button
                onClick={scoreRubric}
                className="mt-3 w-full h-9 rounded-md bg-[rgb(var(--accent))] text-white text-[13px] font-medium"
              >
                Score my answer
              </button>
            )}
          </div>
        )}

        {question.sourcePlatforms && question.sourcePlatforms.length > 0 && (
          <div className="rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4">
            <div className="text-[10px] uppercase tracking-wider text-[rgb(var(--muted))] mb-2">
              Real test stage
            </div>
            <div className="flex flex-wrap gap-1">
              {question.sourcePlatforms.map((p) => (
                <span
                  key={p}
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[rgb(var(--panel-2))] border border-[rgb(var(--border))] text-[rgb(var(--muted))]"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
