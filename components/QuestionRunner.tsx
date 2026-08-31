"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Question } from "@/lib/types";
import { loadProgress, setLastLocation, updateQuestion } from "@/lib/storage";

type Props = {
  moduleId: string;
  question: Question;
  prevHref: string | null;
  nextHref: string | null;
};

const difficultyColor: Record<string, string> = {
  easy: "bg-ok/20 text-ok",
  medium: "bg-warn/20 text-warn",
  hard: "bg-err/20 text-err",
};

export function QuestionRunner({ moduleId, question, prevHref, nextHref }: Props) {
  const isMulti = question.type === "mcq-multi";
  const isMcq = question.type.startsWith("mcq") || question.type === "code-output";
  const isOpen = question.type === "open-rubric" || question.type === "short-code";

  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [rubricChecks, setRubricChecks] = useState<boolean[]>([]);
  const [selfReveal, setSelfReveal] = useState(false);

  useEffect(() => {
    setSelected([]);
    setSubmitted(false);
    setSelfReveal(false);
    setRubricChecks(new Array(question.rubric?.length ?? 0).fill(false));
    const prior = loadProgress().questions[question.id];
    if (prior?.answered) {
      setSubmitted(true);
      setSelfReveal(true);
    }
    setLastLocation(moduleId, question.id);
  }, [moduleId, question]);

  const correct = useMemo(() => {
    if (!isMcq || !question.correct) return null;
    const want = [...question.correct].sort().join(",");
    const got = [...selected].sort().join(",");
    return want === got;
  }, [selected, question, isMcq]);

  function toggleOption(id: string) {
    if (submitted) return;
    if (isMulti) {
      setSelected((cur) =>
        cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
      );
    } else {
      setSelected([id]);
    }
  }

  function submitMcq() {
    if (!selected.length) return;
    setSubmitted(true);
    updateQuestion(question.id, { answered: true, correct: !!correct });
  }

  function retryMcq() {
    setSubmitted(false);
    setSelected([]);
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
    updateQuestion(question.id, { answered: true, selfScore: pct });
  }

  return (
    <article className="space-y-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs uppercase tracking-wider">
            <span className={`rounded px-2 py-0.5 ${difficultyColor[question.difficulty]}`}>
              {question.difficulty}
            </span>
            <span className="text-muted">{question.topic}</span>
            <span className="text-muted">·</span>
            <span className="text-muted">{question.type}</span>
          </div>
          <h1 className="text-xl font-medium leading-snug">{question.prompt}</h1>
        </div>
      </header>

      {question.code && (
        <pre className="text-sm border border-border">
          <code>{question.code}</code>
        </pre>
      )}

      {isMcq && question.options && (
        <div className="space-y-2">
          {question.options.map((opt) => {
            const isSelected = selected.includes(opt.id);
            const isCorrectAnswer = question.correct?.includes(opt.id);
            let cls = "border-border bg-panel";
            if (submitted) {
              if (isCorrectAnswer) cls = "border-ok bg-ok/10";
              else if (isSelected) cls = "border-err bg-err/10";
            } else if (isSelected) {
              cls = "border-accent bg-accent/10";
            }
            return (
              <button
                key={opt.id}
                onClick={() => toggleOption(opt.id)}
                disabled={submitted}
                className={`w-full text-left rounded-md border p-3 transition ${cls} ${
                  submitted ? "cursor-default" : "hover:border-accent/60"
                }`}
              >
                <span className="inline-block w-6 text-muted font-mono">
                  {opt.id}.
                </span>
                <span className="whitespace-pre-wrap">{opt.text}</span>
              </button>
            );
          })}
          <div className="flex gap-2 pt-2">
            {!submitted ? (
              <button
                onClick={submitMcq}
                disabled={!selected.length}
                className="px-4 py-2 rounded-md bg-accent text-black font-medium disabled:opacity-40"
              >
                Submit {isMulti ? `(${selected.length} selected)` : ""}
              </button>
            ) : (
              <button
                onClick={retryMcq}
                className="px-4 py-2 rounded-md border border-border hover:border-accent/60"
              >
                Try again
              </button>
            )}
          </div>
          {submitted && (
            <div
              className={`mt-3 rounded-md p-3 border ${
                correct ? "border-ok bg-ok/10 text-ok" : "border-err bg-err/10 text-err"
              }`}
            >
              {correct ? "Correct." : "Not quite."}
              {question.explanation && (
                <p className="mt-2 text-fg text-sm whitespace-pre-wrap">
                  {question.explanation}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {question.type === "short-code" && (
        <div className="space-y-3">
          <p className="text-sm text-muted">
            Write your solution locally, then reveal the reference solution below.
          </p>
          <button
            onClick={() => {
              setSelfReveal(true);
              updateQuestion(question.id, { answered: true, selfScore: 1 });
            }}
            className="px-4 py-2 rounded-md bg-accent text-black font-medium"
          >
            {selfReveal ? "Reference shown" : "Reveal reference solution"}
          </button>
          {selfReveal && question.explanation && (
            <div className="rounded-md border border-border bg-panel p-3">
              <div className="text-xs uppercase text-muted mb-2">Reference</div>
              <pre className="text-sm">
                <code>{question.explanation}</code>
              </pre>
            </div>
          )}
        </div>
      )}

      {question.type === "open-rubric" && question.rubric && (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Draft your answer aloud or in a scratch doc. When done, self-score
            against the rubric below.
          </p>
          <div className="rounded-md border border-border bg-panel p-4">
            <div className="text-xs uppercase text-muted mb-3">Rubric</div>
            <ul className="space-y-2">
              {question.rubric.map((r, i) => (
                <li key={i} className="flex items-start gap-3">
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
                    className="mt-1"
                  />
                  <span className="text-sm">
                    {r.criterion}{" "}
                    <span className="text-muted text-xs">
                      (weight {r.weight})
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <button
              onClick={scoreRubric}
              className="mt-4 px-4 py-2 rounded-md bg-accent text-black font-medium"
            >
              Score my answer
            </button>
          </div>
          {selfReveal && question.modelAnswer && (
            <div className="rounded-md border border-border bg-panel p-4">
              <div className="text-xs uppercase text-muted mb-2">
                Model answer
              </div>
              <p className="text-sm whitespace-pre-wrap">{question.modelAnswer}</p>
            </div>
          )}
        </div>
      )}

      <nav className="flex items-center justify-between pt-4 border-t border-border">
        {prevHref ? (
          <Link href={prevHref} className="text-sm text-muted hover:text-fg">
            ← Previous
          </Link>
        ) : (
          <span />
        )}
        {nextHref ? (
          <Link
            href={nextHref}
            className="text-sm rounded-md bg-accent/20 border border-accent/40 text-accent px-3 py-1.5 hover:bg-accent/30"
          >
            Next →
          </Link>
        ) : (
          <span className="text-sm text-muted">End of module</span>
        )}
      </nav>
    </article>
  );
}
