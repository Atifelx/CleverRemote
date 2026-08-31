# Stage 4 — Validation of Question Bank Against Real Test Surface

**Question:** does the Stage 3 bank actually prepare the user for what Turing / Andela / Toptal + FDE loop asks in 2026?

**Method:** map each platform's confirmed test sections (from Stages 1–2) onto the question bank; flag gaps.

---

## 1. Turing.com coverage

| Turing stage | Content required | Modules covering it | Status |
|---|---|---|---|
| Work Experience Survey | Professional ethics, bug-handling philosophy | (no drill needed — no wrong answers) | ✅ acknowledged |
| Tech-Stack MCQ: JavaScript | Closures, event loop, async, this, types, floats | `01-javascript` (45 Qs) | ✅ strong |
| Tech-Stack MCQ: TypeScript | Generics, utility, conditional, narrowing | `02-typescript` (25 Qs) | ✅ solid |
| Tech-Stack MCQ: React | Hooks, rendering, keys, memo, Next.js | `03-react` (30 Qs) | ✅ strong |
| Tech-Stack MCQ: React Hooks | (subset of React) | `03-react` | ✅ covered |
| Tech-Stack MCQ: Node.js | Event loop, streams, HTTP, auth, testing | `04-nodejs` (25 Qs) | ✅ solid |
| Automated coding challenge | HackerRank-style algorithms | `05/06/07-dsa` (55 Qs) | ✅ strong |
| Live coding (3 rounds) | Real code, narration expected | `js/react/node short-code` + DSA | ✅ covered |
| FDE-role interviews | System design + LangChain/LangGraph + client work | `09/10/11/12/13` | ✅ covered |

**Turing gap:** no dedicated Python module (Turing offers Python stack tests too). User's stated focus is JS/TS so this is a scope decision, not a gap. If they later apply to Python roles, add a `python-fundamentals` module.

---

## 2. Andela coverage

| Andela stage | Content required | Modules covering it | Status |
|---|---|---|---|
| Profile / GitHub review | (no drill possible — real portfolio) | — | ⚠ external |
| English screen | Fluency | (no drill) | ⚠ external |
| Automated HackerRank challenge | 2–4 problems, medium-hard DSA | `05/06/07-dsa` | ✅ strong |
| Qualified skills test (~1 hr, section-1 knockout) | Language fundamentals + problem-solving | `01-04` + `05/06-dsa` | ✅ covered |
| Technical screen | Stack depth + debugging | JS/TS/React/Node modules | ✅ covered |
| Pair programming (biggest round) | Clarifying Qs, thinking aloud, testable code, receiving feedback | `05/06-dsa short-code` + soft-skill emphasis in bank | ⚠ partial — see gap below |
| Behavioral / EPIC values | Excellence, Passion, Integrity, Collaboration | `13-behavioral` (10 stories) | ✅ covered (STAR maps to EPIC) |

**Andela gap:** the pair-programming round grades COMMUNICATION as much as code. Bank has short-code prompts but no explicit "narrate this out loud" rubric. Mitigation for now: FDE-decomposition/client-sim modules already train narration; app should mark pair-programming prep as a workflow tag on those.

---

## 3. Toptal coverage

| Toptal stage | Content required | Modules covering it | Status |
|---|---|---|---|
| English communication screen | Fluency | (no drill) | ⚠ external |
| Codility test — 3 problems in 90 min | Arrays, greedy, hash, stacks, DP (mixed) | `05/06/07-dsa` | ✅ strong (includes Codility-lesson mirrors: OddOccurrences, CyclicRotation, PermMissingElem, FrogJmp, TieRopes, BinaryGap, Dominator) |
| Live coding — 2 problems × 20 min | JS-specific (float pitfalls, deep-copy, async) | `01-javascript` (js-011 floats, js-021 shallow-copy, js-042 race, js-045 deep-clone) | ✅ covered |
| Test project (1–3 weeks) | Full-stack quality — backend + frontend + tests | React + Node + SQL modules; system-design context | ✅ conceptually covered — hands-on practice is on the user |
| Ongoing quality | Real client work | — | ⚠ post-placement |

**Toptal gap:** the test project is a real deliverable — the app can teach patterns but the user has to build the actual project. Recommend: side-project template mentioned in app UI, out of scope for question bank.

---

## 4. FDE-loop coverage

| FDE round | Modules covering it | Status |
|---|---|---|
| Recruiter screen | `13-behavioral bh-008` (why-FDE) | ✅ |
| Hiring manager screen | `13-behavioral` (ownership, difficult stakeholder) | ✅ |
| Coding round (practical) | `01-04` short-code (debounce, rate-limit, retry, deep-clone) + DSA | ✅ strong |
| System design (real production) | `09-system-design` (12 rubric prompts) | ✅ covered |
| Decomposition case study (biggest filter) | `11-fde-decomposition` (8 rubric prompts) | ✅ direct hit |
| Client simulation | `12-fde-client-sim` (8 rubric prompts) | ✅ direct hit |
| Behavioral / values | `13-behavioral` (10 STAR prompts) | ✅ |
| Take-home project | — | ⚠ user builds real project |
| Turing FDE code-along (LangGraph) | `10-ai-llm` (LangGraph + agent Qs) | ✅ conceptually — hands-on LangGraph practice is on the user |

**FDE gap:** the "take-home project" and "LangGraph code-along" require hands-on building against a real API. App teaches concepts + reference solutions; the actual build has to happen locally.

---

## 5. Overall verdict

- **MCQ readiness (Turing MCQ, Andela test, live-coding shallow):** ✅ Strong. 145 MCQs across JS/TS/React/Node/SQL/AI, all with explanations.
- **Coding-round readiness (Turing coding, Andela HR, Toptal Codility):** ✅ Strong. 55 DSA problems including 8 direct Codility-lesson mirrors + 8 practical FDE-style coding patterns.
- **System design + AI:** ✅ Solid. 27 rubric prompts with model answers grounded in real Turing/Palantir/OpenAI job data.
- **FDE decomposition + client-sim + behavioral:** ✅ Direct — these are the differentiator rounds and the bank targets them explicitly with the 5-step rubric and posture heuristics.
- **Communication / English / real portfolio / hands-on projects:** ⚠ external — no drill can substitute; app should flag these as user-owned.

## 6. Recommended next-cycle expansion (post-MVP)

Not blocking Stage 5 app build. Order by ROI:

1. **JavaScript** → +30 MCQs on regex, iterators, weakref, structuredClone, ES2024 methods (bring total to 75).
2. **React** → +20 MCQs on error boundaries, portals, Suspense edge cases, streaming SSR (to 50).
3. **DSA medium** → +30 more (to 50), especially graph BFS variants + interval merging + heap patterns.
4. **System design** → +8 more real prompts, esp. queues + observability + multi-region failover.
5. **FDE decomposition** → +7 more novel prompts to hit 15.
6. **Python module** — only if user targets Python roles later.

## 7. Loop-back decision

Do we need to loop back to Stage 1?

**No.** All findings from Stage 1 mapped cleanly to Stage 2 skills, which mapped to Stage 3 questions. No new question categories were discovered during Stage 3 that Stage 1 missed. Proceed to Stage 5 (Next.js app build).
