# turing-prep

Private practice bank for **Turing.com**, **Andela**, and **Toptal** — targeted at remote Forward Deployed Engineer roles ($5k+/mo). JS/TS stack focus.

Runs entirely locally. Progress persists in your browser's `localStorage`.

## What's inside

- **253 practice questions** across 13 modules (MCQ + DSA + system design + FDE decomposition + client simulation + STAR behavioral)
- **3 study plans**: 60-day comprehensive, 20-day intensive, 7-day ASAP cram
- **Research notes** (`research/`) — full audit of Turing/Andela/Toptal test surface for 2026

## Quick start

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

## Structure

```
app/                    # Next.js app router
  page.tsx              # Home — plans + modules + platforms
  plans/[plan]/         # 60-day / 20-day / asap plan views
  module/[id]/          # Module question list
  module/[id]/question/[qid]/   # Interactive question runner
components/             # Client components
  QuestionRunner.tsx    # The interactive core — MCQ + open-rubric grading
  ModuleQuestionList.tsx
  ProgressBadge.tsx
  ResumeButton.tsx
lib/
  data.ts               # Static JSON imports
  storage.ts            # localStorage helpers
  types.ts
data/
  manifest.json         # Modules index + study plans
  questions/            # 13 JSON files, one per module
  schema.md
research/               # Stage 1-4 research notes
```

## How the study plans work

Each plan is a list of days. Each day lists which modules to touch and the focus for that day. Click a module chip on the plan page to jump straight into it.

Progress is tracked per-question in `localStorage` under `turing-prep:v1`. Homepage shows a "Resume" button that jumps back to your last question.

## Question types

- `mcq-single` — one correct answer
- `mcq-multi` — 2+ correct answers (Turing-style)
- `code-output` — MCQ "what does this print"
- `short-code` — write locally, reveal reference solution
- `open-rubric` — draft aloud, self-score against weighted rubric (system design, FDE decomposition, client sim, behavioral)

## Reset progress

DevTools → Application → LocalStorage → delete `turing-prep:v1`.

## Content sources

See [`research/`](research/) for the full audit trail. All findings drawn from:
- Official Turing / Andela / Toptal documentation
- Exponent FDE Interview Guide 2026
- FDE Academy question bank
- First-hand candidate reports (Medium, Dev.to, Glassdoor summaries)

## Expanding the bank

Add questions to any `data/questions/*.json` file following [`data/schema.md`](data/schema.md). The app picks them up on next build/reload.
