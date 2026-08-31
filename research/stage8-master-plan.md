# Master Prep Plan — 30 Topics × 50-70 Qs

**Goal:** cover the user's full 30-topic FDE taxonomy at 50–70 questions/topic. Target total: **~1500 questions**.

**Focus:** Remote FDE offers via Turing / Andela (Toptal secondary).

**Rule:** don't build until this plan is approved.

---

## 1. Coverage audit — user's 30 topics vs current 16 modules

Legend: ✅ have module · 🟡 partial (in another module) · ⚠ new module needed

| #  | Topic                              | Current coverage                                     | Subtopics (per user format)                                                                          | Target Qs |
|----|------------------------------------|------------------------------------------------------|-------------------------------------------------------------------------------------------------------|----------:|
| 00 | Programming Fundamentals           | ⚠ nothing                                            | Variables/memory, functions, closures, scope, complexity/Big-O                                        |        60 |
| 01 | Data Structures & Algorithms       | ✅ dsa-easy(20)+medium(20)+hard(15) = 55             | Arrays, hash, strings, two-pointer, sliding-window, recursion, trees, graphs, DP, greedy, heap, bits, binary search |       200 |
| 02 | Python                             | ⚠ nothing (bank is JS/TS)                            | Basics, data structures, OOP, async, decorators, GIL, testing, idioms                                 |        70 |
| 03 | JavaScript / TypeScript            | ✅ js(75)+ts(25) = 100                                | Already at target                                                                                     |       100 |
| 04 | Backend Engineering                | 🟡 half of nodejs(50)                                 | Server internals, routing, middleware, auth, streams, error handling                                  |        60 |
| 05 | APIs & Distributed Communication   | 🟡 in web-protocols(40)+distributed(30)               | REST, GraphQL, gRPC, WebSockets, SSE, versioning                                                      |        60 |
| 06 | Databases                          | ✅ sql(45)                                            | SQL deep + NoSQL basics (Mongo, DynamoDB); +5-10 to hit target                                        |        60 |
| 07 | Redis & Caching                    | ⚠ 3 Qs scattered                                     | Data types, patterns, pub/sub, cluster, cache-aside/write-through, invalidation                        |        50 |
| 08 | Async / Concurrency / Queues       | ⚠ scattered across JS/Node/distributed                | Event loop, promises, workers, Kafka, RabbitMQ, SQS, backpressure                                     |        60 |
| 09 | System Design                      | ✅ sysdes(20)                                         | Bring to 40 with more real prompts                                                                    |        40 |
| 10 | Cloud & Deployment                 | ⚠ nothing                                            | AWS core (EC2/S3/RDS/IAM/VPC/ALB), secrets, CDN, GCP/Azure basics                                     |        50 |
| 11 | Docker / Kubernetes                | ⚠ 1 Q                                                | Docker basics/images/multi-stage; K8s pods/services/deployments/HPA/probes                            |        50 |
| 12 | Software Engineering               | 🟡 in refactoring-debugging(12)                       | SOLID, patterns, semver, ADRs, code review, Git workflows                                             |        40 |
| 13 | Testing / Debugging                | 🟡 partial                                            | Unit/integration/e2e/mocks/coverage/flaky-test playbook                                               |        50 |
| 14 | Security                           | ✅ web-protocols(40)                                  | Bring to 60 with app-layer + secrets + supply-chain                                                    |        60 |
| 15 | AI / LLM Fundamentals              | 🟡 in ai-llm(45)                                      | Tokens, temp, sampling, context window, models, cost                                                  |        60 |
| 16 | Embeddings / Vector Search         | 🟡 in ai-llm                                          | Embedding models, similarity, HNSW/IVF, pgvector/Pinecone/Qdrant                                       |        40 |
| 17 | RAG                                | 🟡 in ai-llm                                          | Chunking, retrieval, reranking, hybrid, HyDE/CRAG/Self-RAG/GraphRAG                                   |        60 |
| 18 | LLM Application Architecture       | ⚠ split from ai-llm                                  | System prompts, guardrails, structured output, tracing, cost tracking                                 |        40 |
| 19 | Agents / Tool Calling              | 🟡 in ai-llm                                          | ReAct, LangGraph, tools/schemas, HITL, checkpoints                                                    |        40 |
| 20 | AI Evaluation                      | 🟡 in ai-llm                                          | RAGAS, LLM-as-judge, golden sets, drift, red teaming                                                  |        30 |
| 21 | AI Security                        | 🟡 partial                                            | Prompt injection (direct/indirect), data leak, PII, tool-abuse, sandboxing                            |        30 |
| 22 | AI Production / Optimization       | 🟡 partial                                            | Latency, streaming, batching, caching, quantization, vLLM/TGI                                          |        40 |
| 23 | Enterprise Integrations            | 🟡 in sysdes                                          | Webhooks, SSO/SAML, SCIM, OAuth bridging, CRM/ERP adapters, legacy                                    |        40 |
| 24 | FDE / Customer Engineering         | ✅ decomposition(8)+client-sim(8) = 16                | Expand decomposition to 20, client-sim to 20                                                          |        40 |
| 25 | Behavioral / Communication         | ✅ behavioral(10)                                     | Expand STAR to 40 across all 8 slots + comms drills                                                   |        40 |
| 26 | Project Deep Dive                  | ⚠ nothing                                            | Résumé drilling, "I not we" audit, project story templates                                            |        20 |
| 27 | Live Coding / Take-Home            | 🟡 in refactoring-debugging                          | Timed drills, take-home rubrics, code-defense                                                          |        30 |
| 28 | Architecture Case Studies          | 🟡 in sysdes + decomposition                          | Multi-hour end-to-end scenarios with graded steps                                                     |        20 |
| 29 | Mock Interviews                    | ⚠ nothing                                            | Full-loop scripts (recruiter → HM → coding → sysdes → decomp → client-sim → behavioral)              |        15 |

**Delta from today:** current bank ≈ 453 Qs across 16 modules → target ≈ 1500 Qs across 30 modules. **+1050 questions**, **+14 new modules or splits**.

---

## 2. Stage plan (8 → 13)

Each stage is one deliverable. Stop-and-review checkpoint between stages.

### Stage 8 — Restructure (no new Qs, ~1 session)
Renames + splits so the app's 16 modules map cleanly onto the 30-topic taxonomy.

- Split `ai-llm` (45 Qs) into **15 fundamentals + 16 embeddings + 17 RAG + 18 LLM-arch + 19 agents + 20 eval + 21 security + 22 production** (distribute existing Qs, tag by subtopic).
- Split `distributed-systems` (30 Qs) into **05 APIs/comms + 07 Redis/cache + 08 async/queues** + keep some in general distributed.
- Split `refactoring-debugging` (12 Qs) into **12 SE + 13 testing/debug + 27 live-coding**.
- Extract enterprise-integration Qs from `system-design` → **23 Enterprise Integrations**.
- Update `manifest.json`, `lib/data.ts`, and study plans.
- Add `subtopic` field to every question so app can filter by user's numbered subtopics (e.g. 1.3 Strings).

### Stage 9 — Foundations (4 new modules, ~230 Qs)
Fills the biggest gaps that block everything else.

- 00 Programming Fundamentals — 60 Qs (variables, closures, complexity)
- 02 Python — 70 Qs (Turing FDE lists Python as core, currently zero)
- 10 Cloud & Deployment — 50 Qs (AWS-heavy for FDE)
- 11 Docker / Kubernetes — 50 Qs (deployment context for every FDE case)

### Stage 10 — DSA depth by subtopic (~150 Qs)
Rework current 55 DSA Qs into 13 subtopic buckets and expand to per-user's format (each subtopic gets 15–25 Qs with study list + question list).

- Arrays 20, Hash 20, Strings 20, Two-pointer 15, Sliding-window 15, Recursion 20, Trees 25, Graphs 20, DP 25, Greedy 15, Heap 10, Bit-manip 10, Binary-search 10 → ~215 total (55 exist, +160 new).

### Stage 11 — AI/LLM full split + expansion (~120 Qs)
The 45 existing AI Qs split across 8 sub-modules; each expanded to target.

- 15 Fundamentals to 60, 16 Embeddings to 40, 17 RAG to 60, 18 LLM-arch to 40, 19 Agents to 40, 20 Eval to 30, 21 AI-security to 30, 22 Production to 40.

### Stage 12 — FDE + soft skills + take-home + mocks (~130 Qs)
- 23 Enterprise Integrations — build to 40
- 24 FDE — expand to 40
- 25 Behavioral — expand to 40
- 26 Project Deep Dive — 20 (new)
- 27 Live Coding / Take-home — 30
- 28 Architecture Cases — 20
- 29 Mock Interviews — 15 full-loop rehearsals

### Stage 13 — App polish
- Subtopic filter UI in the module page
- Study-notes block above each subtopic (matches user's "Study:" list)
- Per-subtopic progress meter (not just per-module)
- Full-mock-run mode (times you, cycles across modules)

---

## 3. Delivery order (recommended)

Ordered by (a) blocker size, (b) Turing FDE test weight, (c) user's stated focus:

1. **Stage 8** — restructure first, one session. Cheap, unblocks everything downstream.
2. **Stage 9** — foundations. Missing Python + Cloud + Docker are the biggest live gaps for Turing FDE.
3. **Stage 11** — AI/LLM split. Turing FDE role names LangChain/LangGraph/RAG in the job req.
4. **Stage 10** — DSA depth. Andela HackerRank + Turing coding leans hard here.
5. **Stage 12** — FDE + behavioral expansion.
6. **Stage 13** — app polish.

Each stage ends with `npm run build` passing + commit + optional push.

---

## 4. Open questions before starting Stage 8

1. **Python priority?** User's stack focus locked as JS/TS earlier. Turing FDE job listing names Python, LangChain, LangGraph. Should I still add module 02 Python at full 70 Qs, or slim it to 30 (bridge coverage) and keep depth in JS/TS?
2. **Existing 3-tier DSA split** — keep `dsa-easy/medium/hard` folder structure with subtopic tags, or fully restructure into 13 subtopic files (1.1 Arrays, 1.2 Hash, …)? Second option is closer to user's example format.
3. **Study notes** — user's format shows a `Study:` list before each question set. Add that block to every subtopic in the JSON schema + app UI? (Requires small schema addition.)
4. **Total scope** — 1500 Qs is ~4–6 focused sessions of adding. OK to run at that pace, or trim any topics to reduce?
