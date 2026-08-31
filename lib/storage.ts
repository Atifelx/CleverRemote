"use client";

import type { AppProgress, QuestionProgress } from "./types";

const KEY = "turing-prep:v1";

const empty: AppProgress = { questions: {} };

export function loadProgress(): AppProgress {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as AppProgress;
    return { ...empty, ...parsed, questions: parsed.questions ?? {} };
  } catch {
    return empty;
  }
}

export function saveProgress(p: AppProgress) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* ignore quota errors */
  }
}

export function updateQuestion(qid: string, patch: Partial<QuestionProgress>) {
  const cur = loadProgress();
  const prev = cur.questions[qid] ?? { answered: false, lastSeenAt: 0 };
  cur.questions[qid] = { ...prev, ...patch, lastSeenAt: Date.now() };
  saveProgress(cur);
  return cur;
}

export function setCurrentPlan(planId: string, day?: number) {
  const cur = loadProgress();
  cur.currentPlan = planId;
  if (typeof day === "number") cur.currentDay = day;
  saveProgress(cur);
}

export function setLastLocation(moduleId: string, questionId: string) {
  const cur = loadProgress();
  cur.lastModuleId = moduleId;
  cur.lastQuestionId = questionId;
  saveProgress(cur);
}

export function resetProgress() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
