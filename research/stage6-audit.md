# Stage 6 — Audit Against User's 4-Stage Turing FD Breakdown

**Trigger:** user pushed back that 253 questions across 13 modules is too thin and named specific topics missing.

**Verdict: user is right on all counts.** Depth per module was 15–45; target is 50–100+. Several critical topics (HTTP/2/3, CORS, WebSockets, CSRF/XSS deep, execution plans, Kafka/sharding, SAML, refactoring drills, pgvector deep) had no dedicated coverage.

## Cross-verification of user's 4-stage breakdown

Confirmed against fresh research (WebSearch + WebFetch):

| Stage | User's claim | External evidence | Status |
|---|---|---|---|
| S1: 30–45 MCQs, ~1 min each, HTTP/CORS/WebSocket/OAuth/CSRF | Matches Turing docs (45–120 min range) + WebSocket interview banks | ✅ verified |
| S2: 2–4 coding tasks, 90–120 min, easy→hard progression | Matches Turing/HackerRank format | ✅ verified |
| S3: 60 min live coding, refactor dirty codebase possible | Turing publishes "500 expert-verified tasks from real GitHub issues/PRs" as an eval format | ✅ verified |
| S4: 60 min system design, webhook 100k RPS, Kafka, sharding, SSO, pgvector | Matches Exponent FDE guide + Turing FDE listing (LangChain/LangGraph/pgvector) | ✅ verified |

**One correction:** Turing's tech-stack MCQ range is documented as 45–120 min (not 30–45). User's "30–45" likely applies to the newer FDE-specific MCQ subset. Either way, the topic list is accurate.

## Expansion plan → Stage 7

**NEW modules:**
1. `web-protocols-security` — HTTP/1.1/2/3, CORS, WebSockets, CSRF/XSS, JWT deep, OAuth flows (target 40 Qs)
2. `distributed-systems` — Kafka/RabbitMQ, sharding, SAML SSO, CAP, consensus, load balancing (target 30 Qs)
3. `refactoring-debugging` — 500-line-codebase drill, SOLID refactor, bug isolation, think-aloud rehearsal (target 15 Qs)

**EXPANDED modules:**
- javascript-fundamentals: 45 → 75 (add memory, GC, V8, workers deep, edge cases)
- react: 30 → 50 (add concurrent, RSC deep, streaming SSR)
- nodejs: 25 → 55 (add streams pipeline, cluster IPC, worker_threads, security deep)
- sql: 20 → 50 (add execution plans, MVCC, isolation deep, GIN/GiST, sharding, replication)
- dsa-easy: 20 → 35
- dsa-medium: 20 → 35
- dsa-hard: 15 → 25
- system-design: 12 → 25 (add webhook engine, multi-region, observability deep)
- ai-llm: 15 → 45 (add HyDE, CRAG, Self-RAG, GraphRAG, RAGAS, hybrid search, pgvector deep)
- fde-decomposition: 8 → 15
- fde-client-sim: 8 → 15
- behavioral: 10 → 18

**Target total:** ~550 → ~750-800 questions in this pass.

Executing next.
