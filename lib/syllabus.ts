// Full syllabus. `tracks` lists every portal that tests this topic.
// `testStages` maps to real test rounds in lib/test-stages.ts.
// The 80% CORE (DSA, JS/TS, System Design, Code Quality, Communication)
// is tested by ALL portals — only the format differs.

export type SyllabusStatus = "built" | "partial" | "planned";

export type SyllabusEntry = {
  num: number;
  id: string;
  title: string;
  blurb: string;
  targetQs: number;
  status: SyllabusStatus;
  moduleId: string | null;
  extraModuleIds?: string[];
  tracks: ("turing" | "andela" | "toptal")[];
  testStages: string[];
  isCore?: boolean; // true = part of the universal FD skill set
};

export const SYLLABUS: SyllabusEntry[] = [

  // ─── UNIVERSAL CORE (all portals) ────────────────────────────────────────────

  { num: 0, id: "programming-fundamentals", title: "Programming Fundamentals",
    blurb: "Variables, memory, closures, complexity, types, recursion, OOP, logic puzzles.",
    targetQs: 90, status: "built", moduleId: "programming-fundamentals", isCore: true,
    tracks: ["turing", "andela", "toptal"],
    testStages: ["turing-t1-mcq", "andela-a1-hackerrank", "andela-a3-screen", "toptal-tp2-tech"] },

  { num: 1, id: "dsa", title: "Data Structures & Algorithms",
    blurb: "Arrays, hash, strings, two-pointer, sliding window, trees, graphs, DP, greedy, heap, bits, binary search.",
    targetQs: 220, status: "built", moduleId: "dsa", isCore: true,
    tracks: ["turing", "andela", "toptal"],
    testStages: ["turing-t2-oa", "turing-t3-live", "andela-a1-hackerrank", "andela-a2-qualified", "toptal-tp2-tech"] },

  { num: 3, id: "javascript-typescript", title: "JavaScript / TypeScript",
    blurb: "Closures, event loop, this, async/await, TS generics, utility types, discriminated unions.",
    targetQs: 100, status: "built", moduleId: "javascript-fundamentals", extraModuleIds: ["typescript"], isCore: true,
    tracks: ["turing", "andela", "toptal"],
    testStages: ["turing-t1-mcq", "turing-t3-live", "andela-a2-qualified", "andela-a4-pair", "toptal-tp2-tech", "toptal-tp3-project"] },

  { num: 4, id: "backend-engineering", title: "Backend Engineering",
    blurb: "Server internals, routing, middleware, auth, streams, error handling.",
    targetQs: 60, status: "partial", moduleId: "nodejs", isCore: true,
    tracks: ["turing", "andela", "toptal"],
    testStages: ["turing-t1-mcq", "turing-t3-live", "andela-a3-screen", "andela-a4-pair", "toptal-tp2-tech", "toptal-tp3-project"] },

  { num: 5, id: "apis-comm", title: "APIs & Distributed Communication",
    blurb: "REST, GraphQL, gRPC, WebSocket, SSE, versioning.",
    targetQs: 60, status: "partial", moduleId: "web-protocols-security", isCore: true,
    tracks: ["turing", "andela", "toptal"],
    testStages: ["turing-t1-mcq", "turing-t4-fde", "andela-a2-qualified", "toptal-tp2-tech", "toptal-tp3-project"] },

  { num: 6, id: "databases", title: "Databases",
    blurb: "SQL joins/windows/CTE, indexes, isolation, execution plans, NoSQL basics.",
    targetQs: 60, status: "built", moduleId: "sql", isCore: true,
    tracks: ["turing", "andela", "toptal"],
    testStages: ["turing-t1-mcq", "turing-t4-fde", "andela-a2-qualified", "andela-a3-screen", "toptal-tp2-tech", "toptal-tp3-project"] },

  { num: 9, id: "system-design", title: "System Design",
    blurb: "Rate limiting, webhooks, multi-tenancy, sharding, real production prompts.",
    targetQs: 40, status: "built", moduleId: "system-design", isCore: true,
    tracks: ["turing", "andela", "toptal"],
    testStages: ["turing-t4-fde", "andela-a2-qualified", "toptal-tp2-tech"] },

  { num: 12, id: "software-engineering", title: "Software Engineering & PR Review",
    blurb: "SOLID, patterns, semver, ADRs, code review, Git flow, PR review drills.",
    targetQs: 40, status: "built", moduleId: "software-engineering", isCore: true,
    tracks: ["turing", "andela", "toptal"],
    testStages: ["turing-t3-live", "andela-a2-qualified", "andela-a4-pair", "toptal-tp3-project"] },

  { num: 13, id: "testing-debugging", title: "Testing / Debugging",
    blurb: "Unit/integration/e2e/mocks/coverage/flaky-test playbook.",
    targetQs: 50, status: "built", moduleId: "testing-debugging", isCore: true,
    tracks: ["turing", "andela", "toptal"],
    testStages: ["turing-t3-live", "andela-a4-pair", "toptal-tp3-project"] },

  { num: 14, id: "security", title: "Security",
    blurb: "CSRF/XSS/SSRF, JWT, OAuth, SAML, CSP, TLS, secrets, supply chain.",
    targetQs: 60, status: "built", moduleId: "web-protocols-security", isCore: true,
    tracks: ["turing", "andela", "toptal"],
    testStages: ["turing-t1-mcq", "andela-a2-qualified", "toptal-tp3-project"] },

  { num: 25, id: "behavioral", title: "Behavioral / Communication",
    blurb: "STAR stories across 8 core slots + comms drills + EPIC values + English clarity.",
    targetQs: 40, status: "built", moduleId: "behavioral", isCore: true,
    tracks: ["turing", "andela", "toptal"],
    testStages: ["turing-t1-hm", "andela-a5-epic", "toptal-tp1-screen", "toptal-tp4-trial"] },

  { num: 26, id: "project-deep-dive", title: "Project Deep Dive",
    blurb: "Résumé drilling, 'I not we' audit, project story templates, async client communication drills.",
    targetQs: 20, status: "built", moduleId: "project-deep-dive", isCore: true,
    tracks: ["turing", "andela", "toptal"],
    testStages: ["turing-t1-hm", "andela-a3-screen", "toptal-tp1-screen", "toptal-tp4-trial"] },

  { num: 30, id: "oop-design-patterns", title: "OOP & Design Patterns (All 23 GoF)",
    blurb: "All 23 Gang of Four patterns with JS/TS examples. SOLID deep dive. Composition vs inheritance, DRY, YAGNI, LoD.",
    targetQs: 45, status: "built", moduleId: "oop-design-patterns", isCore: true,
    tracks: ["turing", "andela", "toptal"],
    testStages: ["turing-t1-mcq", "turing-t3-live", "turing-t4-fde", "andela-a2-qualified", "toptal-tp2-tech"] },

  { num: 31, id: "git-advanced", title: "Git — Deep Dive",
    blurb: "Git internals, rebase interactive, bisect, stash, hooks, cherry-pick, reflog, workflows, conventional commits.",
    targetQs: 35, status: "built", moduleId: "git-advanced", isCore: true,
    tracks: ["turing", "andela", "toptal"],
    testStages: ["turing-t1-mcq", "turing-t3-live", "andela-a2-qualified", "andela-a4-pair", "toptal-tp3-project"] },

  // ─── CODILITY-SPECIFIC (Turing T2 + Andela A1) ───────────────────────────────

  { num: 29, id: "codility-patterns", title: "Codility Patterns (OA Prep)",
    blurb: "All 17 Codility lesson categories: prefix sums, sieve, Euclidean GCD, caterpillar, Kadane's, leader, counting elements, binary search on answer, Fibonacci DP.",
    targetQs: 40, status: "built", moduleId: "codility-patterns",
    tracks: ["turing", "andela"],
    testStages: ["turing-t2-oa", "andela-a1-hackerrank"] },

  // ─── ANDELA WOVEN-SPECIFIC ────────────────────────────────────────────────────

  { num: 32, id: "financial-data-engineering", title: "Financial Data Engineering",
    blurb: "Float vs integer precision for currency, UTC/timezone for backdated billing, O(N²)→O(N) lookup optimization, proration. Core Andela Woven code challenge.",
    targetQs: 25, status: "built", moduleId: "financial-data-engineering",
    tracks: ["andela"],
    testStages: ["andela-a2-qualified", "andela-a4-pair"] },

  { num: 33, id: "pr-review-andela", title: "PR Review — Risk→Impact→Resolution",
    blurb: "Async flaws, hardcoded credentials, SQL injection, race conditions, webhook idempotency. Structured feedback framework.",
    targetQs: 20, status: "built", moduleId: "pr-review-andela",
    tracks: ["turing", "andela", "toptal"],
    testStages: ["andela-a2-qualified", "andela-a4-pair", "turing-t3-live", "turing-t4-fde", "toptal-tp3-project"] },

  // ─── AI / LLM (FDE-specific depth) ──────────────────────────────────────────

  { num: 15, id: "llm-fundamentals", title: "AI / LLM Fundamentals",
    blurb: "Tokens, sampling, context, models, cost, latency, streaming.",
    targetQs: 60, status: "partial", moduleId: "ai-llm",
    tracks: ["turing", "andela"], testStages: ["turing-t4-fde", "andela-a2-qualified"] },

  { num: 16, id: "embeddings-vector", title: "Embeddings / Vector Search",
    blurb: "Embed models, similarity, HNSW/IVF, pgvector, Pinecone, Qdrant.",
    targetQs: 40, status: "partial", moduleId: "ai-llm",
    tracks: ["turing", "andela"], testStages: ["turing-t4-fde", "andela-a2-qualified"] },

  { num: 17, id: "rag", title: "RAG",
    blurb: "Chunking, retrieval, reranking, hybrid, HyDE, recall/precision, hallucination, RAGAS.",
    targetQs: 60, status: "built", moduleId: "rag-andela-deep", extraModuleIds: ["ai-llm"],
    tracks: ["turing", "andela"], testStages: ["turing-t4-fde", "andela-a2-qualified"] },

  { num: 18, id: "llm-arch", title: "LLM Application Architecture",
    blurb: "System prompts, guardrails, structured output, tracing, cost tracking.",
    targetQs: 40, status: "built", moduleId: "llm-app-arch",
    tracks: ["turing", "andela"], testStages: ["turing-t4-fde", "andela-a2-qualified"] },

  { num: 19, id: "agents-tools", title: "Agents / Tool Calling",
    blurb: "ReAct, LangGraph, tools/schemas, HITL, checkpoints, function-calling.",
    targetQs: 40, status: "partial", moduleId: "ai-llm",
    tracks: ["turing", "andela"], testStages: ["turing-t4-fde", "andela-a2-qualified"] },

  { num: 20, id: "ai-eval", title: "AI Evaluation",
    blurb: "RAGAS, LLM-as-judge, golden sets, drift, red teaming.",
    targetQs: 30, status: "partial", moduleId: "ai-llm",
    tracks: ["turing", "andela"], testStages: ["turing-t4-fde", "andela-a2-qualified"] },

  { num: 21, id: "ai-security", title: "AI Security",
    blurb: "Prompt injection (direct/indirect), data leak, PII, tool abuse, sandboxing.",
    targetQs: 30, status: "partial", moduleId: "ai-llm",
    tracks: ["turing", "andela"], testStages: ["turing-t4-fde", "andela-a2-qualified"] },

  { num: 34, id: "rag-andela-deep", title: "RAG & AI Governance (Andela Deep)",
    blurb: "Chunking strategies, hybrid search + BM25, PII governance, prompt caching, faithfulness, multi-tenant isolation.",
    targetQs: 25, status: "built", moduleId: "rag-andela-deep",
    tracks: ["turing", "andela"], testStages: ["andela-a2-qualified", "andela-a3-screen", "andela-a4-pair", "turing-t4-fde"] },

  // ─── INFRASTRUCTURE / DEVOPS ──────────────────────────────────────────────────

  { num: 7, id: "redis-caching", title: "Redis & Caching",
    blurb: "Data types, patterns, pub/sub, cluster, invalidation, cache-aside vs write-through.",
    targetQs: 50, status: "built", moduleId: "redis-caching",
    tracks: ["turing", "andela"], testStages: ["turing-t4-fde", "andela-a2-qualified"] },

  { num: 8, id: "async-queues", title: "Async / Concurrency / Queues",
    blurb: "Event loop, promises, workers, Kafka, RabbitMQ, SQS, backpressure.",
    targetQs: 60, status: "built", moduleId: "async-concurrency",
    tracks: ["turing", "andela"], testStages: ["turing-t1-mcq", "turing-t4-fde", "andela-a2-qualified"] },

  { num: 10, id: "cloud", title: "Cloud & Deployment",
    blurb: "AWS core (EC2/S3/RDS/IAM/VPC/ALB), secrets, CDN, GCP/Azure basics.",
    targetQs: 50, status: "built", moduleId: "cloud-deployment",
    tracks: ["turing"], testStages: ["turing-t4-fde"] },

  { num: 11, id: "docker-k8s", title: "Docker / Kubernetes",
    blurb: "Docker basics, multi-stage, K8s pods/services/deployments/HPA/probes.",
    targetQs: 30, status: "built", moduleId: "docker-k8s",
    tracks: ["turing"], testStages: ["turing-t4-fde"] },

  { num: 22, id: "ai-production", title: "AI Production / Optimization",
    blurb: "Latency, streaming, batching, caching, quantization, vLLM / TGI.",
    targetQs: 40, status: "partial", moduleId: "ai-llm",
    tracks: ["turing"], testStages: ["turing-t4-fde"] },

  { num: 23, id: "enterprise-integrations", title: "Enterprise Integrations",
    blurb: "Webhooks, SSO/SAML, SCIM, OAuth bridging, CRM/ERP adapters, legacy.",
    targetQs: 40, status: "partial", moduleId: "enterprise-integrations",
    tracks: ["turing", "andela"], testStages: ["turing-t4-fde", "andela-a2-qualified"] },

  { num: 24, id: "fde-customer-eng", title: "FDE / Customer Engineering",
    blurb: "Decomposition (5-step framework), client sim (posture drills).",
    targetQs: 40, status: "built", moduleId: "fde-customer-engineering",
    tracks: ["turing", "andela"], testStages: ["turing-t4-fde", "andela-a2-qualified"] },

  // ─── PLATFORM EXTRAS ─────────────────────────────────────────────────────────

  { num: 2, id: "python", title: "Python",
    blurb: "Basics, data structures, OOP, async, decorators, GIL, testing idioms.",
    targetQs: 70, status: "built", moduleId: "python",
    tracks: ["turing", "andela"], testStages: ["turing-t1-mcq", "andela-a1-hackerrank"] },

  { num: 27, id: "live-coding-take-home", title: "Live Coding / Take-Home",
    blurb: "Timed drills, take-home rubrics, code defense.",
    targetQs: 30, status: "built", moduleId: "live-coding-take-home",
    tracks: ["turing", "andela", "toptal"],
    testStages: ["turing-t3-live", "andela-a4-pair", "toptal-tp3-project"] },

  { num: 28, id: "architecture-cases", title: "Architecture Case Studies",
    blurb: "Multi-hour end-to-end scenarios with graded steps.",
    targetQs: 20, status: "partial", moduleId: "system-design",
    tracks: ["turing", "andela", "toptal"],
    testStages: ["turing-t4-fde", "andela-a2-qualified", "toptal-tp2-tech"] },
];
