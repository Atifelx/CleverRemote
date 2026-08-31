# Stage 2 — Skills Matrix & Official Practice Source Audit

**Purpose:** Definitive skill list per platform, cross-verified against official docs + candidate reports. Every skill has (a) which platform tests it, (b) at what weight, (c) where each platform officially points candidates to practice.

**Role focus:** Remote Forward Deployed Engineer, JS/TS stack.

---

## 1. Platform test configurations (verified)

### 1.1 Turing.com
| Attribute | Value | Source |
|---|---|---|
| Work Experience Survey | 57 Qs, 20–30 min actual (60 min allocated) | Turing blog |
| Tech Stack MCQ | 45–120 min per stack; 4 options per Q; single- or multi-correct | Turing blog |
| Total MCQ commitment | ~8 hours across selected stacks | Turing blog |
| Recommended MCQ prep pace | 2 hrs/day for ~1 week | Turing blog |
| Automated coding challenge | HackerRank-format, timed | Turing help |
| Live coding rounds | Typically 3 rounds, 3 problems, 90 min | Candidate reports |
| Pass rate | "Top 1% of applicants" | Turing blog |
| Retake window | **3 months** after failure | Turing blog |
| Official coding stacks offered | React, React Hooks, JavaScript, TypeScript, Node.js, Python, Django, DevOps (Git+regex), iOS Swift, WPF, Spring Boot, Golang, Ruby on Rails, Java | Turing blog + Turing help |

### 1.2 Andela
| Attribute | Value | Source |
|---|---|---|
| Profile review | Resume + GitHub | Andela help |
| English screen | Automated | Andela help |
| Automated coding challenge | 60–90 min, 2–4 problems, medium-hard on HackerRank | Ophy.ai + candidate reports |
| Qualified skills test | ~60 min average (extensible), section 1 = knockout | Andela help + FAQ |
| Live technical screen | 45–60 min | Ophy.ai |
| Pair programming | 60 min — **biggest weighted round** | Ophy.ai |
| Behavioral (EPIC values) | 30–45 min | Ophy.ai |
| Total timeline | 2–4 weeks | Ophy.ai |
| Retake window | **30 days** after failed Qualified | Andela help |
| Languages supported | JavaScript, Python, Java, Ruby (candidate-reported) | Candidate reports |

### 1.3 Toptal
| Attribute | Value | Source |
|---|---|---|
| English communication screen | ~30 min video call | Multiple sources |
| Codility test | **90 min, 3 problems: easy / medium / hard** | Multiple candidate reports |
| Codility pass score | **No fixed % — set per test.** One candidate report: **210 (of unknown max)** | Codility docs + candidate |
| Live coding interview | 60 min video; ~2 problems × 20 min each | Multiple sources |
| Test project | 1–3 weeks, real deliverable | Multiple sources |
| Ongoing quality review | Post-placement, continuous | Toptal official |
| Retake window | Not officially published; typically permanent-fail after project stage | Candidate reports |
| Pass funnel | "Top 3%" | Toptal marketing |

---

## 2. Definitive skill × platform matrix (with weights)

Weight scale: **3 = heavy focus (majority of round)**, **2 = tested regularly**, **1 = surface / possible**, **0 = not tested**.

### 2.1 JavaScript / TypeScript fundamentals

| Skill | Turing MCQ | Turing coding | Andela HR | Andela pair | Toptal Codility | Toptal live | FDE loop |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `let`/`const`/`var`, hoisting, TDZ | 3 | 1 | 1 | 1 | 0 | 2 | 1 |
| Closures & lexical scope | 3 | 2 | 2 | 2 | 1 | 3 | 2 |
| `this` binding + arrow fns | 3 | 1 | 1 | 1 | 0 | 2 | 1 |
| Prototypes & prototype chain | 3 | 0 | 0 | 0 | 0 | 1 | 0 |
| Event loop, task queue, microtasks | 3 | 2 | 1 | 2 | 0 | 3 | 2 |
| `Promise`, `async`/`await`, error prop | 3 | 3 | 2 | 3 | 0 | 3 | 3 |
| Type coercion, `==` vs `===` | 3 | 1 | 1 | 1 | 0 | 2 | 1 |
| `Array`, `Map`, `Set`, `Object` APIs | 2 | 3 | 3 | 3 | 3 | 3 | 2 |
| Destructuring, spread/rest, optional chaining | 2 | 2 | 2 | 2 | 1 | 2 | 1 |
| Iterators, generators | 1 | 1 | 0 | 1 | 0 | 1 | 1 |
| Modules (ESM vs CJS) | 2 | 1 | 0 | 1 | 0 | 1 | 1 |
| TS generics, utility types, discriminated unions | 3 | 2 | 1 | 2 | 0 | 2 | 2 |
| Floating-point precision gotchas | 1 | 1 | 1 | 1 | 2 | 3 | 1 |

### 2.2 React

| Skill | Turing MCQ | Turing coding | Andela | Toptal | FDE loop |
|---|:-:|:-:|:-:|:-:|:-:|
| Hooks: `useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`, `useReducer` | 3 | 3 | 1 | 2 | 1 |
| Custom hooks + rules of hooks | 3 | 2 | 1 | 2 | 1 |
| Rendering, reconciliation, keys | 3 | 2 | 1 | 2 | 1 |
| Context API vs Redux vs Zustand | 2 | 1 | 1 | 2 | 1 |
| Suspense, concurrent rendering, `use()` | 2 | 1 | 0 | 1 | 0 |
| Next.js app router, RSC, server actions | 2 | 2 | 1 | 2 | 2 |
| Data fetching patterns (SWR, React Query) | 2 | 2 | 1 | 2 | 2 |
| Forms, controlled/uncontrolled | 2 | 2 | 1 | 2 | 1 |
| Performance profiling, memoization | 2 | 1 | 1 | 2 | 1 |

### 2.3 Node.js

| Skill | Turing MCQ | Turing coding | Andela | Toptal | FDE loop |
|---|:-:|:-:|:-:|:-:|:-:|
| Event loop phases, `process.nextTick`, microtasks | 3 | 2 | 2 | 1 | 2 |
| Streams (readable/writable/transform), backpressure | 2 | 2 | 2 | 1 | 3 |
| `Buffer`, encoding | 2 | 1 | 1 | 0 | 1 |
| Cluster, `worker_threads`, child processes | 2 | 1 | 1 | 1 | 1 |
| HTTP server, routing (Express/Fastify) | 3 | 3 | 3 | 2 | 3 |
| Middleware, error handling, async handlers | 3 | 3 | 3 | 2 | 3 |
| npm/yarn/pnpm, package resolution, workspaces | 2 | 1 | 1 | 1 | 1 |
| `fs`/promises, path handling | 1 | 2 | 2 | 1 | 2 |
| JWT/OAuth, session, cookies | 2 | 2 | 2 | 2 | 3 |
| Testing (Jest, Vitest, Mocha) | 2 | 2 | 3 | 2 | 2 |

### 2.4 Data structures & algorithms (LeetCode-style)

| Topic | Turing coding | Andela HR | Andela pair | Toptal Codility | Toptal live | FDE loop |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| Arrays + prefix sums + sliding window | 3 | 3 | 3 | 3 | 3 | 2 |
| Strings + regex + parsing | 3 | 3 | 3 | 3 | 3 | 3 |
| Hash maps / sets | 3 | 3 | 3 | 3 | 3 | 3 |
| Two pointers | 3 | 3 | 2 | 3 | 3 | 1 |
| Stacks & queues (incl. monotonic) | 2 | 3 | 2 | 3 | 3 | 1 |
| Linked lists | 2 | 2 | 1 | 2 | 2 | 0 |
| Recursion + backtracking | 2 | 3 | 2 | 3 | 3 | 1 |
| Trees (BST, traversal, LCA) | 2 | 3 | 2 | 3 | 3 | 1 |
| Graphs (BFS, DFS, Dijkstra, topo) | 1 | 3 | 2 | 3 | 2 | 1 |
| Heaps / priority queues | 1 | 2 | 2 | 3 | 2 | 1 |
| Greedy algorithms | 2 | 3 | 2 | 3 | 2 | 1 |
| Dynamic programming (1D, 2D, memo) | 1 | 3 | 2 | 3 | 2 | 1 |
| Bit manipulation | 1 | 2 | 1 | 3 | 1 | 0 |
| Binary search + variants | 2 | 3 | 2 | 3 | 3 | 1 |
| BigO analysis | 3 | 3 | 3 | 3 | 3 | 2 |

### 2.5 SQL / databases

| Skill | Turing MCQ | Turing coding | Andela | Toptal | FDE loop |
|---|:-:|:-:|:-:|:-:|:-:|
| SELECT + JOINs (inner/left/right/full) | 3 | 2 | 2 | 1 | 3 |
| GROUP BY, HAVING, aggregates | 3 | 2 | 2 | 1 | 3 |
| Window functions (ROW_NUMBER, RANK, LAG/LEAD) | 2 | 1 | 1 | 1 | 3 |
| CTEs, recursive CTEs | 2 | 1 | 1 | 1 | 2 |
| Indexes, query plans, EXPLAIN | 2 | 1 | 2 | 1 | 3 |
| Normalization vs denormalization | 2 | 0 | 1 | 0 | 2 |
| Transactions, isolation levels | 2 | 1 | 1 | 1 | 2 |
| ORMs (Prisma/Sequelize/TypeORM) | 1 | 1 | 2 | 1 | 2 |
| NoSQL (Mongo, Redis, DynamoDB) basics | 1 | 1 | 1 | 1 | 2 |

### 2.6 System design (real-world)

| Topic | Turing FDE | Andela | Toptal live | FDE loop |
|---|:-:|:-:|:-:|:-:|
| REST API design + versioning | 3 | 2 | 2 | 3 |
| Auth: OAuth 1.0/2.0, JWT, SSO/SAML | 2 | 1 | 1 | 3 |
| Rate limiting (per-user + global) | 3 | 1 | 1 | 3 |
| Caching layers (CDN, Redis, in-mem) | 2 | 1 | 1 | 3 |
| Queues (SQS, Kafka, Redis) | 2 | 1 | 1 | 3 |
| Webhooks + idempotency + retries | 3 | 1 | 1 | 3 |
| Multi-tenant SaaS design | 2 | 1 | 0 | 3 |
| Observability (logs, traces, metrics, dashboards) | 2 | 1 | 0 | 3 |
| Deploy topology: VPC, SSO, HIPAA/SOC2 constraints | 3 | 0 | 0 | 3 |
| Failure modes + rollback | 2 | 1 | 1 | 3 |

### 2.7 AI / LLM systems (FDE-specific)

| Topic | Turing FDE | FDE loop generally |
|---|:-:|:-:|
| RAG architecture (chunk → embed → retrieve → rerank) | 3 | 3 |
| Vector DBs (Pinecone, pgvector, Chroma) | 3 | 3 |
| LangChain / LangGraph agents | 3 | 3 |
| Prompt engineering + prompt injection defense | 2 | 3 |
| LLM evaluation: exact-match, BLEU/ROUGE, LLM-as-judge | 2 | 3 |
| Guardrails: input validation, PII redaction, toxicity | 2 | 3 |
| Fine-tune vs RAG vs prompt-engineer decision | 2 | 3 |
| Prompt versioning, A/B testing, rollback | 2 | 3 |
| Latency optimization (chunk size, batch, KV cache) | 2 | 3 |
| Hosted vs self-hosted LLM trade-offs | 2 | 3 |

### 2.8 FDE soft skills

| Skill | Turing FDE | Toptal | FDE loop |
|---|:-:|:-:|:-:|
| STAR-format storytelling | 3 | 2 | 3 |
| Decomposition 5-step framework | 3 | 0 | 3 |
| Client simulation posture | 3 | 1 | 3 |
| Ownership language ("I", not "we") | 3 | 2 | 3 |
| Communicating trade-offs | 3 | 2 | 3 |
| Async written comms (English fluency) | 2 | 3 | 2 |

---

## 3. Official practice-source audit (where each platform sends you)

### 3.1 Turing.com — officially recommended prep
From the Turing developer-test prep blog post:

| Resource | Purpose |
|---|---|
| [HackerRank](https://www.hackerrank.com/) | Coding challenge practice (Turing's coding round uses HackerRank-style) |
| [Codility](https://app.codility.com/programmers/) | Algorithmic problem practice |
| [LeetCode](https://leetcode.com/) | DSA drills |
| [Coursera](https://www.coursera.org/) | Foundational courses |
| [Khan Academy](https://www.khanacademy.org/) | Math + CS fundamentals |
| [System Design Primer (GitHub)](https://github.com/donnemartin/system-design-primer) | System design |
| [YouTube: OOP + design patterns](https://www.youtube.com/) | Reinforcement |
| [Git official docs](https://git-scm.com/doc) | DevOps MCQ |

### 3.2 Andela — officially recommended prep
From Andela Talent Cloud Support:

| Resource | Purpose |
|---|---|
| [Qualified.io](https://www.qualified.io/) (test platform itself) | The test platform — sample problems available |
| HackerRank | Automated challenge stage |
| LeetCode | DSA warm-up before Qualified test |
| "Cracking the Coding Interview" (book) | Behavioral + technical |
| GitHub / open source | Portfolio builders for profile screen |

### 3.3 Toptal — recommended prep (community consensus, no official page)

| Resource | Purpose |
|---|---|
| [Codility lessons (free)](https://app.codility.com/programmers/lessons/) | THE prep path — same platform as the test |
| Codility "Golden" tasks | Hard-tier practice |
| LeetCode Medium/Hard | Live coding round prep |
| "Cracking the Coding Interview" — BigO + Arrays/Strings chapters | Test project quality bar |
| InterviewCake | Structured problem walk-throughs |
| Actual senior full-stack side project | Test project portfolio |

### 3.4 Codility lessons → skill mapping (Toptal's most-used prep path)

| Codility lesson | Skill it drills | Difficulty |
|---|---|---|
| Iterations | Bit-count, decimal → binary | Easy |
| Arrays | Rotation, odd-occurrence | Easy |
| Time Complexity | BigO reasoning | Easy |
| Counting Elements | Frog jumps, permutation check | Easy |
| Prefix Sums | Passing cars, min avg slice | Medium |
| Sorting | Distinct, triangle, max-product | Medium |
| Stacks and Queues | Brackets, fish, stone wall | Medium |
| Leader | Dominator, equi-leader | Medium |
| Maximum Slice | Kadane variants | Medium |
| Prime & Composite Numbers | Factorization | Medium |
| Sieve of Eratosthenes | Non-divisible count | Medium |
| Euclidean Algorithm | GCD, chocolates by numbers | Medium |
| Fibonacci Numbers | Ladder, frog river one | Medium |
| Binary Search Algorithm | NailingPlanks, MinMaxDivision | Hard |
| Caterpillar Method | AbsDistinct, CountTriangles | Hard |
| Greedy Algorithms | TieRopes, MaxNonoverlappingSegments | Hard |
| Dynamic Programming | NumberSolitaire, MinAbsSum | Hard |

### 3.5 FDE-specific practice sources

| Resource | Purpose |
|---|---|
| Exponent FDE course | Decomposition + client sim mocks |
| [FDE.academy](https://fde.academy/) | Category-organized question bank |
| Palantir Foundry blog + case studies | Ontology mental model |
| Anthropic Core Views / Responsible Scaling | Alignment interviews |
| LangChain / LangGraph docs + tutorials | Turing FDE build-along interview |
| pgvector + OpenAI cookbook | RAG prototype practice |

---

## 4. What the app needs to cover — final scope for Stage 3

Based on this matrix, the question bank must cover these **13 skill modules**, each with 50–100 questions:

1. **JavaScript fundamentals** (MCQ + short-code) — closures, event loop, async, `this`, types, floats
2. **TypeScript** (MCQ + short-code) — generics, utility types, discriminated unions
3. **React** (MCQ + code) — hooks, rendering, Next.js router, data fetching, forms
4. **Node.js** (MCQ + code) — streams, HTTP, middleware, auth, testing
5. **DSA — easy tier** (LeetCode-style) — arrays, hash, two pointers, strings, stacks
6. **DSA — medium tier** — sliding window, trees, BST, recursion, greedy, binary search
7. **DSA — hard tier** — graphs (BFS/DFS/Dijkstra/topo), DP (1D/2D), heaps, bit manip
8. **SQL** (MCQ + query) — joins, aggregates, window fns, CTEs, indexes
9. **System design** (open-ended with rubric) — REST, auth, rate limit, cache, queue, webhook, multi-tenant, HIPAA/VPC
10. **AI / LLM systems** (open-ended with rubric) — RAG, vector DBs, LangChain, evaluation, guardrails, latency
11. **FDE decomposition** (open-ended, 5-step rubric) — 15+ real case prompts
12. **FDE client simulation** (open-ended, posture rubric) — 15+ scenario prompts
13. **Behavioral / STAR** (open-ended, story-slot rubric) — 8 core story slots, 30+ prompts

Target: **~800–1000 total questions** across modules, MCQs graded auto, open-ended graded by rubric checklist.

---

## 5. Gaps still open

- Turing exact MCQ count per stack: not published; candidate reports vary 30–70 Qs per stack.
- Andela Qualified exact question count: not published; ~1 hr time suggests 3–5 problems.
- Toptal Codility exact pass threshold: varies per test instance; treat as "solve easy + medium fully = ~pass floor."
- Andela official prep page content (403-blocked). Backfill from Ophy.ai + candidate Medium accounts is adequate.

None of these gaps block Stage 3. Question bank uses the matrix above as source of truth.

---

## Sources

- [Turing developer test prep blog](https://www.turing.com/blog/turing-developer-test-preparation-tips)
- [Turing become-a-remote-developer blog](https://www.turing.com/blog/how-to-become-a-remote-developer-for-turing)
- [Turing coding challenge help](https://help.turing.com/for-developers-automated-coding-challenge)
- [Turing vetting process help](https://help.turing.com/hc/en-us/articles/360004371156-What-is-Turing-s-vetting-process-)
- [Andela technical skills test help](https://help.andela.com/hc/en-us/articles/26607236489363-Step-2-The-technical-skills-test)
- [Andela Qualified FAQs](https://help.andela.com/hc/en-us/articles/27280569743251-Andela-Qualified-FAQs)
- [Andela interview process 2026 — Ophy.ai](https://ophyai.com/blog/company-guides/andela-interview-guide)
- [Toptal Codility passing story — Souvic](https://souvic.medium.com/how-i-passed-the-toptal-codility-test-32f99f22d758)
- [Toptal Codility exposé — Carlos Roso](https://carlosroso.com/ctti-draft/)
- [Codility passing score docs](https://support.codility.com/hc/en-us/articles/360051122493-How-do-I-set-a-Passing-Score)
- [Codility lessons index](https://app.codility.com/programmers/lessons/)
- [Exponent FDE guide 2026](https://www.tryexponent.com/blog/forward-deployed-engineer-interview-the-definitive-2026-guide-fde)
- [FDE Academy interview questions](https://fde.academy/blog/forward-deployed-engineer-interview-questions)
- [System Design Primer](https://github.com/donnemartin/system-design-primer)
