import type { AiLessonDetails } from './ai-core-lesson-types'

export const aiAgentsLessonDetails = {
  'Agent loop': {
    explanation: [
      'An agent loop repeatedly accepts an observation, chooses a bounded next action, executes an approved tool, and records the outcome before deciding whether to continue. The loop should have explicit stop conditions, turn and cost limits, and a deterministic policy gate between model output and every side effect so generated text never becomes authority by itself.',
      'Use a loop when a task genuinely depends on results discovered at runtime, such as investigating an incident across several systems. The flexibility costs latency and predictability, while vague completion rules can cause repeated calls, duplicated writes, or confident but unfinished answers; durable traces, idempotent tools, and evaluation against task-level outcomes keep those failures observable and contained.',
    ],
    whyItMatters: 'The loop is the control plane of an agent. Making its transitions, limits, and authorization checks explicit turns an open-ended model interaction into a system that operators can inspect, test, resume, and stop.',
    useCases: [
      'Investigating a support case by reading account, order, and shipment systems until the evidence is sufficient',
      'Triaging an operational alert with read-only diagnostics before proposing a remediation',
      'Collecting missing fields for a business workflow while validating each answer against system records',
    ],
    workedExample: {
      scenario: 'A support agent must investigate a delayed order and may issue a shipping credit only when policy and account ownership allow it.',
      steps: [
        'Load the durable case state, then call read-only order and shipment tools using the authenticated customer account identifier.',
        'Ask the model to choose between gathering more evidence, proposing a credit, or stopping, while enforcing a six-turn limit.',
        'When a credit is proposed, run deterministic ownership and policy checks and require approval for any amount above the automatic limit.',
        'Execute the credit with the case ID as an idempotency key, persist the receipt, and score the trace for policy compliance and resolution quality.',
      ],
      result: 'The customer receives one authorized credit, the case can resume after interruption without repeating the write, and evaluators can reconstruct every decision from the trace.',
    },
    interview: {
      prompt: 'Where should an agent loop enforce authorization and termination, and why should the model not own either decision?',
      answer: 'The orchestrator should enforce turn, time, and cost limits, while each tool or policy service must authorize the concrete action against trusted identity and resource data. A model can recommend stopping or acting, but its output is untrusted input; deterministic code must prevent unauthorized effects and endless or duplicated execution.',
    },
  },
  'Tool design': {
    explanation: [
      'An agent tool is a narrow, typed capability with a clear verb, validated inputs, structured outputs, and documented error semantics. Good tools expose domain operations such as createRefund rather than raw database or shell access, and they derive identity and permissions from trusted runtime context instead of accepting model-supplied claims.',
      'Use tools to connect model reasoning to reliable computation or external systems, keeping reads separate from writes and making mutating calls idempotent. Tools that are broad, ambiguous, or return unbounded prose are hard to select and evaluate; tools that hide partial failure, omit timeouts, or trust generated authorization fields can produce duplicate effects or privilege escalation.',
    ],
    whyItMatters: 'The tool boundary is where probabilistic intent becomes deterministic behavior. A precise contract reduces model confusion while giving security, retry, observability, and testing logic a stable place to live.',
    useCases: [
      'Exposing a policy-checked refund operation instead of general payment API access',
      'Providing a read-only customer lookup that returns a small typed record',
      'Wrapping a deployment system with separate preview, approve, and execute operations',
    ],
    workedExample: {
      scenario: 'A billing agent needs a tool that can waive one late fee without allowing arbitrary account edits.',
      steps: [
        'Define waiveLateFee with accountId, invoiceId, reasonCode, and requestId inputs plus typed success, denied, conflict, and retryable error outputs.',
        'Resolve the caller identity outside the model, verify account scope and waiver policy inside the tool, and reject free-form policy claims.',
        'Store requestId with the completed waiver in the billing database before returning the receipt so retries return the same result.',
        'Evaluate the tool with valid, unauthorized, duplicate, malformed, and dependency-timeout cases before enabling agent access.',
      ],
      code: {
        language: 'TypeScript',
        code: `type WaiveLateFeeInput = {
  accountId: string
  invoiceId: string
  reasonCode: 'service_error' | 'first_offense'
  requestId: string
}`,
      },
      result: 'The agent can perform the intended waiver, but it cannot invent authority, edit unrelated fields, or create a second waiver when execution is retried.',
    },
    interview: {
      prompt: 'What makes a tool agent-friendly without making it dangerously powerful?',
      answer: 'Give it one domain-level purpose, a small typed schema, structured outcomes, bounded data, and explicit retry behavior. Keep authorization, validation, idempotency, and audit logging in deterministic code, and split read, preview, and write capabilities so the orchestrator can apply different controls.',
    },
  },
  Planning: {
    explanation: [
      'Planning separates deciding a sequence of goals from executing individual actions. A useful plan names verifiable milestones, dependencies, and stop or replan conditions, while the orchestrator validates each proposed step against available tools and policy before it becomes executable work.',
      'Planning helps with long, dependent tasks where acting immediately would make omissions expensive, but it is overhead for simple requests and becomes stale as observations change. Treat plans as revisable hypotheses rather than authority: constrain their size, persist completed milestones, and evaluate both execution success and whether planning reduced calls, errors, or recovery cost.',
    ],
    whyItMatters: 'An explicit plan makes progress and assumptions inspectable without granting the model unchecked control. It also provides stable checkpoints for approval, resumption, and comparison between intended and actual execution.',
    useCases: [
      'Preparing a migration that requires inventory, compatibility checks, approval, and staged execution',
      'Researching a customer issue across several systems with evidence requirements',
      'Generating and validating a multi-file change before opening a review request',
    ],
    workedExample: {
      scenario: 'An operations agent must rotate an application credential across staging and production without causing downtime.',
      steps: [
        'Generate a bounded plan with inventory, staging rotation, staging verification, production approval, production rotation, and final verification milestones.',
        'Validate resource identifiers and permissions deterministically, then execute only the read-only inventory milestone.',
        'Rotate staging with an idempotent operation, persist its version and verification evidence, and replan if the health check fails.',
        'Require an operator to approve the exact production diff before execution, then record the final receipts and evaluate availability signals.',
      ],
      result: 'The rotation proceeds through inspectable gates, survives interruption after staging, and cannot silently promote an unverified or unauthorized production action.',
    },
    interview: {
      prompt: 'When does planning improve an agent workflow, and how do you prevent a generated plan from becoming an unsafe script?',
      answer: 'Planning helps when a task has dependencies, costly actions, or approval points that benefit from explicit milestones. The runtime must validate every step, bind it to current state and policy, limit plan size, and replan on changed evidence; only deterministic orchestration can authorize and execute tools.',
    },
  },
  State: {
    explanation: [
      'Agent state is the explicit data needed to continue a workflow: identity references, inputs, completed steps, tool receipts, approvals, retry counts, and the current status. Durable state belongs in a transactional store with a version or compare-and-set guard, while transient prompt context should be reconstructed from that source rather than treated as the record of truth.',
      'State is necessary for workflows that span calls, workers, or human delays, but every stored field adds migration, privacy, and consistency obligations. Missing persistence causes lost progress and duplicate effects; unversioned writes cause races; storing model narration as authoritative state causes drift, so use typed fields, immutable events where useful, and explicit retention rules.',
    ],
    whyItMatters: 'Reliable agents are state machines around a model, not conversations that happen to remember. Durable, typed, and versioned state enables safe retries, auditability, deterministic authorization, and recovery after process failure.',
    useCases: [
      'Resuming a claims workflow after a reviewer responds several hours later',
      'Preventing two workers from executing the same approved payment action',
      'Recording tool receipts and evaluation outcomes for an incident investigation',
    ],
    workedExample: {
      scenario: 'A procurement agent pauses after collecting quotes and resumes when a manager approves one supplier.',
      steps: [
        'Create a workflow record containing the requester identity, approved budget scope, status, version, and empty tool receipt list.',
        'Persist normalized quote IDs and mark the workflow awaiting_approval before sending the approval request.',
        'On response, atomically update the expected version, verify that the approver owns the required role, and record the selected quote.',
        'Create the purchase order with the workflow ID as the idempotency key and persist the returned order ID before completion.',
      ],
      code: {
        language: 'TypeScript',
        code: `type ProcurementState = {
  workflowId: string
  status: 'collecting' | 'awaiting_approval' | 'approved' | 'complete'
  version: number
  selectedQuoteId?: string
  purchaseOrderId?: string
}`,
      },
      result: 'The workflow resumes from an authoritative checkpoint, rejects stale or unauthorized approval updates, and creates at most one purchase order.',
    },
    interview: {
      prompt: 'What belongs in durable agent state, and what consistency controls would you apply?',
      answer: 'Persist facts required to resume or audit the workflow, including trusted identity references, status, approvals, completed actions, idempotency keys, and tool receipts. Use typed schemas, transactional updates, version checks, encryption and retention controls, and never treat prompt text or a model summary as the sole authoritative record.',
    },
  },
  'Human in the loop': {
    explanation: [
      'Human-in-the-loop design inserts a deliberate review or input state where automated execution is uncertain, high impact, or legally constrained. The system should present the exact proposed action, evidence, policy result, and expiration time, then bind an authenticated approval to that immutable action rather than asking for a vague confirmation.',
      'Use human review for irreversible writes, exceptions, sensitive communications, and low-confidence cases, not as a substitute for basic validation. Excessive gates create fatigue and rubber-stamping, while underspecified approvals hide risk; calibrate thresholds with evaluation data, support reject and edit paths, and require reapproval whenever material inputs change.',
    ],
    whyItMatters: 'A well-designed review gate preserves accountable human judgment without sacrificing resumability or auditability. It also establishes a clear control boundary between a model recommendation and an authorized business action.',
    useCases: [
      'Approving a production database change after reviewing the generated diff and rollback plan',
      'Reviewing a customer credit above the automatic policy threshold',
      'Editing and approving a sensitive external message before it is sent',
    ],
    workedExample: {
      scenario: 'A collections agent drafts settlement offers, but any discount above ten percent requires a finance reviewer.',
      steps: [
        'Calculate the account balance and permitted automatic range with deterministic policy code, then let the model draft terms within those facts.',
        'Hash the proposed amount, deadline, and message, persist them with the evidence, and send the reviewer an approve, edit, or reject task.',
        'Authenticate the reviewer, verify the finance role, and bind the decision to the stored hash; require a new review after any edit.',
        'Send the approved offer with a workflow idempotency key and record delivery evidence for later evaluation.',
      ],
      result: 'Only the reviewed terms are sent, changed terms cannot reuse an old approval, and the organization can measure review frequency, edits, and policy escapes.',
    },
    interview: {
      prompt: 'How would you design an approval step so that it is a real control rather than a confirmation button?',
      answer: 'Show the concrete action, evidence, policy context, and consequences; authenticate the reviewer and verify the required role; bind approval to an immutable version or hash; expire it; and invalidate it when inputs change. The workflow must durably record approve, edit, reject, and timeout outcomes.',
    },
  },
  Guardrails: {
    explanation: [
      'Guardrails are layered controls that constrain inputs, model outputs, tool access, data flow, and final responses. Deterministic checks should enforce identity, authorization, schemas, budgets, allowlists, and invariants, while model-based classifiers can add probabilistic detection for concerns such as prompt injection or sensitive content but cannot grant permission.',
      'Apply guardrails at every trust boundary because a single system prompt is neither complete nor tamper-proof. Overly broad blocking damages usefulness, and a detector can miss adversarial or novel inputs; use defense in depth, fail closed for protected actions, log decisions without leaking secrets, and evaluate false accepts and false rejects on representative attacks and normal traffic.',
    ],
    whyItMatters: 'Guardrails convert policy into enforceable system behavior and limit the blast radius of model errors or hostile content. Their effectiveness comes from deterministic boundaries and measured coverage, not from claims that the model has been told to behave.',
    useCases: [
      'Rejecting cross-tenant record access even when retrieved text asks the agent to ignore policy',
      'Preventing a code agent from writing outside an approved workspace path',
      'Redacting regulated identifiers before prompts and logs leave a protected boundary',
    ],
    workedExample: {
      scenario: 'A document assistant can search tenant files, some of which may contain instructions designed to redirect the agent.',
      steps: [
        'Derive tenant scope from the authenticated session and apply it in the search query rather than including a model-selected tenant filter.',
        'Label retrieved text as untrusted data, remove active links and unsupported instructions, and limit the number and size of passages.',
        'Allow only read-only citation tools for the answer and reject any tool arguments that reference resources outside the trusted scope.',
        'Run injection and data-leak evaluations, review blocked legitimate queries, and tune probabilistic detectors without weakening tenant enforcement.',
      ],
      result: 'Malicious document text may influence wording, but it cannot expand resource scope or invoke a privileged operation, and guardrail quality is tracked with measurable error rates.',
    },
    interview: {
      prompt: 'Why is a system prompt not an authorization boundary, and what should enforce one?',
      answer: 'A system prompt influences probabilistic generation and can be misunderstood or overridden by conflicting context. Trusted application code, policy engines, scoped credentials, database filters, and tool-side checks must enforce authorization; model-based guardrails can detect risk but must not create authority.',
    },
  },
  Recovery: {
    explanation: [
      'Recovery starts by classifying failures as transient, permanent, ambiguous, or requiring human action, then applying an explicit transition for each class. The orchestrator persists checkpoints and attempt metadata before and after side effects, uses bounded backoff for retryable faults, and reconciles ambiguous outcomes through status reads instead of blindly repeating writes.',
      'Recovery is essential whenever dependencies fail or workflows outlive one process, but retries can amplify outages and duplicate non-idempotent effects. Cap attempts, use idempotency keys and circuit breakers, preserve enough state for manual repair, and evaluate injected timeouts, crashes, partial writes, and replay behavior rather than testing only successful runs.',
    ],
    whyItMatters: 'Failures are normal in tool-using systems, and an agent that cannot recover predictably is an operational liability. Explicit recovery semantics protect data integrity while making degraded and manual states visible.',
    useCases: [
      'Reconciling a payment request after the provider times out before returning a receipt',
      'Resuming a long-running report after a worker restarts',
      'Pausing an incident workflow when a dependency circuit breaker opens',
    ],
    workedExample: {
      scenario: 'A travel agent times out while booking a flight and cannot tell whether the airline accepted the reservation.',
      steps: [
        'Persist the booking intent and idempotency key before calling the airline, then mark the attempt outcome unknown after the timeout.',
        'Query reservation status using the same key instead of issuing a second booking request.',
        'If a reservation exists, persist its locator and continue; if the provider confirms no booking, retry within the bounded attempt policy.',
        'Move unresolved ambiguity to manual review with the request details, attempts, and provider responses, then evaluate the recovery trace.',
      ],
      result: 'The workflow either adopts the original reservation, safely retries a confirmed absence, or exposes an actionable manual case without double booking.',
    },
    interview: {
      prompt: 'How should an agent recover when a mutating tool times out and the outcome is unknown?',
      answer: 'It should persist the ambiguous state, avoid an unqualified retry, and reconcile through a status or lookup operation keyed by the original idempotency token. Only retry when the system can prove the first operation did not commit, otherwise adopt the existing result or escalate with complete evidence.',
    },
  },
  'Working memory': {
    explanation: [
      'Working memory is the small, task-local context assembled for the current reasoning step, including the active goal, relevant observations, constraints, and recent tool results. The orchestrator selects it from authoritative state and gives facts stable identifiers so the model can cite evidence without receiving the entire history.',
      'Use working memory to keep prompts focused and token costs bounded, especially during multi-step tasks. Naive truncation can remove a critical constraint, while continuously appending results creates distraction and injection exposure; use typed slots, relevance rules, size budgets, and evaluations that test whether required facts survive long workflows.',
    ],
    whyItMatters: 'A disciplined working set improves reasoning quality without confusing prompt context with durable truth. It also makes context selection an observable component that can be tested independently of the model.',
    useCases: [
      'Keeping the current incident hypothesis and latest diagnostics visible during triage',
      'Providing only the selected contract clauses for one review decision',
      'Tracking unresolved requirements while a coding agent edits several files',
    ],
    workedExample: {
      scenario: 'An incident agent investigates elevated checkout latency across many services and log queries.',
      steps: [
        'Persist all tool outputs as referenced artifacts, then maintain typed working slots for symptom, time window, hypotheses, evidence, and next question.',
        'Before each model call, select only evidence linked to active hypotheses and include immutable query and timestamp references.',
        'When the budget is exceeded, evict disproven hypotheses and old raw output while retaining their artifact IDs and conclusions.',
        'Evaluate whether seeded critical evidence remains available and whether the agent reaches the correct diagnosis under the context limit.',
      ],
      result: 'The model reasons over a compact, relevant context while operators retain the full durable evidence trail and can audit every summarized fact.',
    },
    interview: {
      prompt: 'How is working memory different from durable workflow state?',
      answer: 'Working memory is a selected prompt view optimized for the next reasoning step; it may be compressed or replaced. Durable state is the authoritative record needed for correctness, resumption, authorization, and audit. Working memory should be reproducible from durable facts and must not be the only copy of a tool receipt or approval.',
    },
  },
  'Conversation memory': {
    explanation: [
      'Conversation memory preserves user-visible continuity across turns by storing messages plus normalized facts such as the active subject, confirmed preferences, and unresolved questions. Each fact should retain provenance, confidence, scope, and time so the system can distinguish user statements from tool-verified data and temporary instructions from durable preferences.',
      'Use it when follow-up requests depend on prior context, but do not let remembered text silently authorize actions or override current policy. Memory can become stale, cross account boundaries, or perpetuate an earlier misunderstanding; provide correction and deletion paths, isolate tenants and users, and evaluate long conversations for wrong attribution and outdated recall.',
    ],
    whyItMatters: 'Conversation memory can make an assistant coherent over time, but only if continuity does not become hidden authority. Provenance and scope let the system use prior context while preserving privacy and deterministic control.',
    useCases: [
      'Remembering which support ticket a follow-up question refers to',
      'Carrying a user-confirmed output preference into later drafting turns',
      'Tracking unanswered onboarding questions across several sessions',
    ],
    workedExample: {
      scenario: 'A customer returns to a support conversation and asks to apply the solution discussed yesterday.',
      steps: [
        'Load messages and normalized facts only for the authenticated customer and active support case, including source timestamps.',
        'Resolve the referenced solution from the case record and ask for clarification if several proposals remain active.',
        'Recheck current account state and authorization before presenting the exact action for confirmation.',
        'Execute with a case-scoped idempotency key, then append the tool receipt and supersede any stale conversation fact.',
      ],
      result: 'The assistant continues the right case without treating yesterday\'s discussion as approval, and the durable record reflects the current verified outcome.',
    },
    interview: {
      prompt: 'What risks arise when conversation history is used directly as memory?',
      answer: 'History mixes user claims, model guesses, stale facts, and untrusted content without clear scope or authority. A safer design normalizes important facts with provenance and timestamps, isolates them by identity and case, revalidates sensitive data, supports correction and deletion, and requires fresh authorization for side effects.',
    },
  },
  'Episodic memory': {
    explanation: [
      'Episodic memory records completed experiences as structured episodes containing the task context, actions, outcomes, feedback, and references to evidence. Retrieval should match a current problem to relevant prior situations while keeping historical recommendations separate from current policy and verified state.',
      'Use episodes to improve troubleshooting, personalize workflows, or supply successful examples, but avoid replaying prior actions as scripts. Historical success may be coincidental or invalid under changed systems, and storing raw traces can retain sensitive data; curate episodes, redact them, apply retention, and evaluate whether retrieval improves outcomes without increasing policy violations.',
    ],
    whyItMatters: 'Episodes let an agent learn operationally useful patterns without changing model weights, while preserving an inspectable link to outcomes. Their value depends on quality, relevance, privacy controls, and fresh validation at execution time.',
    useCases: [
      'Retrieving a resolved incident with similar symptoms and infrastructure',
      'Showing a support agent prior cases that received positive customer feedback',
      'Reusing the outline of a successful migration while recalculating current commands',
    ],
    workedExample: {
      scenario: 'A database alert resembles an incident resolved three months earlier after a connection pool limit was exhausted.',
      steps: [
        'Retrieve redacted episodes by service, symptom, topology, and software version, then rank them using outcome quality and recency.',
        'Present the prior diagnosis as a hypothesis with links to its metrics and remediation receipt, not as a current fact.',
        'Collect fresh pool, latency, and deployment evidence and authorize only read-only diagnostics automatically.',
        'After resolution, store a new episode with the verified cause, approved actions, outcome metrics, and retention label.',
      ],
      result: 'The prior incident accelerates hypothesis formation, but current evidence determines the diagnosis and any remediation remains governed by present-day policy.',
    },
    interview: {
      prompt: 'How would you stop episodic memory from causing cargo-cult execution?',
      answer: 'Store episodes as evidence-backed examples, retrieve them by relevant context, and label their conclusions as historical hypotheses. Revalidate current state, policy, versions, and authorization before acting, and evaluate retrieved episodes for causal usefulness rather than merely matching text or past success.',
    },
  },
  'Semantic memory': {
    explanation: [
      'Semantic memory stores generalized facts and concepts independently of a single conversation, often as versioned records or indexed documents. A reliable system preserves source, owner, effective date, confidence, and access scope, then retrieves candidate facts and resolves them against authoritative systems before high-impact use.',
      'Use semantic memory for stable domain knowledge, terminology, and documented policy, but distinguish it from live operational truth. Extracted facts can be wrong, contradictory, stale, or visible to the wrong tenant; prefer governed source documents, define conflict and freshness rules, and evaluate citation correctness, access isolation, and abstention when evidence is weak.',
    ],
    whyItMatters: 'Semantic memory gives agents reusable organizational context without stuffing every document into every prompt. Provenance, versioning, and access control determine whether that context is dependable or merely plausible.',
    useCases: [
      'Retrieving the current definition of support severity levels from governed policy',
      'Resolving internal product terminology during technical assistance',
      'Providing approved architectural constraints during design review',
    ],
    workedExample: {
      scenario: 'A sales operations agent must answer whether a proposed discount complies with regional policy.',
      steps: [
        'Retrieve policy sections filtered by the authenticated employee role, region, product, and effective date.',
        'Return the source version and applicable thresholds as structured facts, preserving links to the governing clauses.',
        'Calculate eligibility in deterministic policy code and have the model explain the result with citations.',
        'Abstain and route to policy owners when sources conflict or no current version exists, then record the evaluation outcome.',
      ],
      result: 'The employee receives a cited explanation backed by the current policy, while the model cannot invent or grant a discount outside deterministic rules.',
    },
    interview: {
      prompt: 'What metadata makes semantic memory safe enough for enterprise use?',
      answer: 'At minimum, store provenance, ownership, version, effective and expiration dates, access scope, and confidence or extraction status. Retrieval must enforce identity scope, surface citations, resolve conflicts and staleness, and defer authoritative decisions to current systems or deterministic policy code.',
    },
  },
  Summarization: {
    explanation: [
      'Summarization compresses long histories or documents into a smaller representation for later reasoning. A robust summary uses a schema for goals, decisions, constraints, unresolved items, and evidence references, and it separates quoted facts from model inferences so important claims remain traceable.',
      'Use summaries when context limits or latency make full replay impractical, but never make a lossy summary the only record of approvals, amounts, identifiers, or tool outcomes. Compression can omit exceptions, merge speakers, or harden an early error; retain source artifacts, refresh incrementally, protect critical fields deterministically, and evaluate factual consistency and omission rates.',
    ],
    whyItMatters: 'Summaries control context cost and attention while preserving continuity. Structured, source-linked compression keeps that efficiency from erasing the facts needed for authorization, recovery, or audit.',
    useCases: [
      'Condensing a long support case before handing it to another worker',
      'Maintaining a rolling incident brief from many diagnostic events',
      'Extracting decisions and open questions from a project discussion',
    ],
    workedExample: {
      scenario: 'A claims workflow has accumulated hundreds of messages, attachments, and tool events before final review.',
      steps: [
        'Store all source events durably and extract protected fields such as claimant ID, requested amount, approvals, and evidence IDs with deterministic parsers.',
        'Ask the model for a schema-bound summary that distinguishes verified facts, user claims, decisions, and unresolved questions.',
        'Validate every cited source and compare protected fields against authoritative state, rejecting the summary on mismatch.',
        'Evaluate the summary with seeded exceptions and use it as prompt context while final authorization reads the original structured records.',
      ],
      result: 'Reviewers receive a concise case brief, but approvals and claim values remain anchored to authoritative records and omitted exceptions are detected before use.',
    },
    interview: {
      prompt: 'Which information should never depend solely on an agent-generated summary?',
      answer: 'Identity, permissions, approvals, financial values, legal terms, idempotency keys, and tool receipts should remain in durable structured records. A summary may reference and explain them, but critical decisions must read authoritative state and preserve links to original evidence.',
    },
  },
  'Memory retrieval': {
    explanation: [
      'Memory retrieval selects candidate records using filters, lexical or vector search, recency, and task relevance, then reranks and packages evidence within a context budget. Security filters must run before similarity ranking, and each returned item should preserve provenance, timestamp, and memory type so the model can weigh it appropriately.',
      'Retrieval is useful when only a small portion of stored knowledge matters to the current task, but semantic similarity is not truth or authorization. Broad queries can leak data, stale items can outrank current facts, and irrelevant memories can distract the model; combine hard scope filters with freshness and quality signals, support abstention, and evaluate recall, precision, leakage, and downstream task success.',
    ],
    whyItMatters: 'Memory only helps when the right evidence reaches the model at the right time. Retrieval is therefore a policy-sensitive ranking system that deserves independent tests and metrics, not an invisible prompt-building detail.',
    useCases: [
      'Finding prior incidents for the same service and software version',
      'Retrieving user preferences scoped to one account and task type',
      'Selecting current policy clauses for a region-specific decision',
    ],
    workedExample: {
      scenario: 'A support agent needs similar resolved cases for a tenant-specific integration error.',
      steps: [
        'Apply tenant, product, visibility, and retention filters from trusted session context before running any text or vector search.',
        'Retrieve a candidate set, then rerank by error signature, version, recency, verified resolution, and feedback score.',
        'Return three episodes with citations and an explicit no-match outcome when relevance stays below the evaluated threshold.',
        'Measure resolution lift, irrelevant retrieval rate, and cross-tenant canary leakage on a held-out case set.',
      ],
      result: 'The agent receives a small set of relevant, authorized cases or abstains, and operators have metrics showing whether retrieval improves resolution without exposing other tenants.',
    },
    interview: {
      prompt: 'Why must access control happen before vector similarity search?',
      answer: 'Similarity ranking can expose titles, snippets, embeddings, or timing information from records the caller should never consider. Hard filters derived from trusted identity must constrain the candidate set first; ranking can then optimize relevance only within authorized data.',
    },
  },
  'Privacy and deletion': {
    explanation: [
      'Privacy-aware memory begins with data minimization, declared purpose, consent where required, access isolation, encryption, retention schedules, and provenance. Records need stable subject and source identifiers so correction or deletion can propagate through primary storage, indexes, summaries, caches, backups, and derived episodes without relying on text search alone.',
      'Store personal data only when its benefit justifies the lifecycle burden, and avoid placing secrets or regulated values in prompts and logs by default. Deletion is difficult when data is duplicated or embedded in opaque artifacts; use tombstones and deletion jobs, prevent reindexing from old sources, verify completion, and evaluate both unauthorized recall and post-deletion regeneration paths.',
    ],
    whyItMatters: 'Agent memory can silently turn temporary interactions into durable risk. Designing lineage and deletion at ingestion time protects users, supports compliance, and prevents stale personal data from resurfacing through derived stores.',
    useCases: [
      'Deleting a former customer\'s profile facts and derived conversation summaries',
      'Applying different retention periods to support transcripts and payment receipts',
      'Preventing sensitive identifiers from appearing in model traces and evaluation datasets',
    ],
    workedExample: {
      scenario: 'A user requests deletion of all optional personalization data while financial records must remain under a legal retention policy.',
      steps: [
        'Authenticate the user, resolve the stable subject ID, and classify linked records by purpose, legal basis, and deletion eligibility.',
        'Create a durable deletion job that tombstones eligible source records and removes their vector, cache, summary, and episode derivatives.',
        'Keep required financial records access-restricted and disconnected from personalization retrieval, recording the policy reason and expiration.',
        'Run canary retrieval and regeneration checks, persist completion receipts, and expose unresolved backup expiration dates to the privacy operator.',
      ],
      result: 'Optional memory no longer appears in agent context, legally retained records remain narrowly protected, and the deletion has a verifiable audit trail across derived systems.',
    },
    interview: {
      prompt: 'Why is deleting the original conversation row insufficient for an agent memory system?',
      answer: 'The data may also exist in embeddings, summaries, caches, episodes, logs, evaluation sets, and backups, and an ingestion job may recreate it. Deletion needs lineage, stable subject IDs, tombstones, propagation to derivatives, retention-aware backup handling, and tests that verify the information cannot be retrieved or regenerated.',
    },
  },
  'Graph orchestration': {
    explanation: [
      'Graph orchestration models a workflow as nodes connected by explicit conditional transitions over shared state. The runtime chooses the next node from validated state, records each transition, and can support branches, joins, loops, approvals, and terminal outcomes without asking the model to improvise the entire control flow.',
      'Use a graph when a workflow has several paths, resumable checkpoints, or distinct control policies; a simple function is clearer for short linear work. Graphs can become unreadable, cycle forever, or duplicate effects during replay, so keep nodes cohesive, validate reachability and loop bounds, make writes idempotent, and evaluate full paths including denial and recovery branches.',
    ],
    whyItMatters: 'A graph makes agent control flow visible and testable while allowing model reasoning inside bounded nodes. It separates flexible decisions from deterministic routing, persistence, and policy enforcement.',
    useCases: [
      'Routing a claim through validation, evidence collection, review, payment, or denial',
      'Coordinating incident diagnosis with parallel service checks and a remediation gate',
      'Running a research workflow with retrieve, critique, revise, and cite paths',
    ],
    workedExample: {
      scenario: 'An expense agent must validate a receipt, classify policy status, request review for exceptions, and reimburse approved claims.',
      steps: [
        'Define typed nodes for intake, extraction, deterministic policy check, exception review, reimbursement, rejection, and completion.',
        'Route from policy check using validated status fields, with no model-generated node names or arbitrary jumps.',
        'Checkpoint before waiting for a reviewer and before reimbursement, binding approval to the claim version.',
        'Execute reimbursement with the claim ID as an idempotency key and test normal, exception, reject, timeout, and replay paths.',
      ],
      result: 'Every claim follows an inspectable route, reviewer delays survive restarts, and replay cannot create a second reimbursement.',
    },
    interview: {
      prompt: 'What belongs in graph edges rather than inside model prompts?',
      answer: 'Deterministic transition rules based on validated state, such as authorization results, approval status, retry limits, and terminal conditions, belong in edges or the runtime. Models may produce classified recommendations, but code must validate them and choose only among allowed transitions.',
    },
  },
  'Typed state': {
    explanation: [
      'Typed state defines the allowed fields and status variants for a workflow, including which identifiers, approvals, errors, and receipts exist at each stage. Runtime validation must accompany compile-time types because model outputs, stored records, and tool responses cross untrusted or versioned boundaries.',
      'Use typed state to make transitions and invariants reviewable, especially when workflows resume after deployments or involve several teams. An oversized catch-all object permits impossible combinations, while loose optional fields hide missing data; prefer discriminated states, schema versions, explicit migrations, and property or path tests that reject invalid transitions.',
    ],
    whyItMatters: 'Typed state moves workflow correctness from prompt convention into enforceable contracts. It reduces ambiguous recovery behavior and makes authorization, idempotency, and evaluation inputs consistent across nodes.',
    useCases: [
      'Ensuring a payment node can run only after a recorded approval',
      'Validating persisted workflow records after a schema deployment',
      'Representing retryable and permanent tool failures as distinct outcomes',
    ],
    workedExample: {
      scenario: 'A refund workflow must not execute unless the request has a policy decision and, for large amounts, reviewer approval.',
      steps: [
        'Define discriminated requested, awaiting_approval, approved, denied, and completed states with only the fields valid for each status.',
        'Parse model proposals and database records through a runtime schema before applying a transition.',
        'Allow the refund node to accept only approved state and derive its idempotency key from the immutable request ID.',
        'Test malformed records and every legal transition, including migration from the previous schema version.',
      ],
      code: {
        language: 'TypeScript',
        code: `type RefundState =
  | { status: 'requested'; requestId: string; amount: number }
  | { status: 'awaiting_approval'; requestId: string; amount: number; policyId: string }
  | { status: 'approved'; requestId: string; amount: number; approvalId: string }
  | { status: 'completed'; requestId: string; refundId: string }`,
      },
      result: 'The executor cannot receive a state that merely implies approval, invalid persisted records fail before side effects, and duplicate execution resolves to the original refund.',
    },
    interview: {
      prompt: 'Why are TypeScript types alone insufficient for agent workflow state?',
      answer: 'Types disappear at runtime, while model output, database rows, messages, and old schema versions can contain invalid data. Use runtime schemas and versioned migrations at boundaries, then encode legal states and transitions so impossible combinations cannot reach side-effecting nodes.',
    },
  },
  'Nodes and edges': {
    explanation: [
      'A node performs one cohesive operation such as retrieval, classification, policy evaluation, approval, or tool execution, while an edge decides which allowed node follows from validated state. Nodes should have typed input and output contracts, explicit side-effect behavior, and stable names that appear in traces and evaluation results.',
      'Separate nodes when operations need different retries, permissions, ownership, or observability, but avoid fragmenting every prompt into orchestration noise. Hidden writes inside reasoning nodes and model-selected arbitrary destinations defeat graph controls; declare mutations, keep routing deterministic, set loop limits, and test node contracts plus end-to-end paths.',
    ],
    whyItMatters: 'Clear node and edge responsibilities make complex agent workflows understandable and independently testable. They also locate policy, retries, checkpoints, and side effects where operators can reason about them.',
    useCases: [
      'Separating evidence extraction from deterministic eligibility checks',
      'Routing tool failures to retry, compensation, or human review nodes',
      'Running independent diagnostics before joining their results for analysis',
    ],
    workedExample: {
      scenario: 'A hiring assistant screens an application, schedules qualified candidates, and routes uncertain cases to a recruiter.',
      steps: [
        'Create parsing, minimum-qualification, ambiguity-review, scheduling, rejection-draft, and completion nodes with typed contracts.',
        'Implement qualification edges from deterministic job criteria and send missing or ambiguous evidence to recruiter review.',
        'Keep calendar writes only in the scheduling node, authorize the recruiter and candidate scope there, and use application ID for idempotency.',
        'Evaluate all branches for consistency, prohibited attribute use, duplicate invitations, and correct escalation.',
      ],
      result: 'The model can help extract and explain evidence, but deterministic criteria and explicit edges control advancement, and scheduling occurs at most once.',
    },
    interview: {
      prompt: 'How do you decide whether logic belongs in a node or an edge?',
      answer: 'A node transforms or obtains data and may have its own retry or side-effect policy. An edge selects among allowed next states from validated outputs. Authorization results, limits, and status-based routing should remain deterministic at the transition boundary rather than being buried in generated prose.',
    },
  },
  Checkpointing: {
    explanation: [
      'Checkpointing durably records workflow state at a known transition so execution can resume without replaying all prior work. A checkpoint should include a workflow and version identifier, current node, validated state, completed action receipts, pending approvals, and enough metadata to detect concurrent or incompatible resumes.',
      'Checkpoint before long waits and around expensive or side-effecting operations, balancing recovery value against storage and transaction cost. Saving after a write without an idempotency record leaves a crash window, while saving arbitrary model objects creates migration problems; use transactional outbox or intent-result patterns, schema versions, retention, and crash-injection tests.',
    ],
    whyItMatters: 'Checkpointing turns process failure from a workflow restart into a controlled resume. Correct checkpoint boundaries are central to durable state, exactly-once business effects, and operational repair.',
    useCases: [
      'Pausing a workflow while waiting days for legal approval',
      'Resuming document processing after a worker deployment',
      'Avoiding repeated charges when a process crashes after a payment call',
    ],
    workedExample: {
      scenario: 'A subscription agent may crash while upgrading an account through an external billing provider.',
      steps: [
        'Atomically store an upgrade intent, expected workflow version, and idempotency key before calling billing.',
        'Call the provider with that key, then store the receipt and next node in one durable update.',
        'On resume, load the latest checkpoint and reconcile any intent without a receipt through the provider status API.',
        'Continue provisioning only after a verified billing result and run crash-injection tests at each persistence boundary.',
      ],
      result: 'A restart resumes from the latest verified transition, ambiguous billing attempts are reconciled, and the customer is not charged twice.',
    },
    interview: {
      prompt: 'Where should checkpoints be placed around a non-transactional external side effect?',
      answer: 'Persist the intent and idempotency key before the call, then persist the result immediately after it. Because the external system and local store cannot share one transaction, recovery must reconcile intent-without-result through the same key or a status API before deciding whether to retry.',
    },
  },
  'Tool adapters': {
    explanation: [
      'A tool adapter translates a provider-specific API into the stable domain contract exposed to an agent. It normalizes authentication, input validation, timeouts, pagination, rate limits, error classes, idempotency, and output shape so orchestration logic does not depend on vendor quirks.',
      'Use adapters when providers vary or legacy APIs are too broad for direct model access, but do not hide semantics that affect correctness. Over-normalization can erase whether an outcome is ambiguous or partially successful, and version drift can silently change behavior; preserve provider receipts, expose capability differences, use contract tests, and evaluate failover before treating adapters as interchangeable.',
    ],
    whyItMatters: 'Adapters keep agent tools narrow and stable while concentrating unreliable integration details in deterministic code. They make provider changes testable without rewriting prompts or weakening authorization boundaries.',
    useCases: [
      'Presenting one createTicket tool over two service desk providers',
      'Normalizing cloud storage list operations with bounded pagination',
      'Wrapping a legacy payment API with modern idempotency and error semantics',
    ],
    workedExample: {
      scenario: 'A support agent creates tickets in either ServiceDesk A or ServiceDesk B depending on the customer contract.',
      steps: [
        'Define a provider-neutral createTicket contract with tenant, category, summary, request ID, and structured created, denied, conflict, or retryable outcomes.',
        'Select the provider from trusted tenant configuration, inject scoped credentials, and map the domain request to the provider API.',
        'Translate provider responses without collapsing unknown outcomes into failures, and persist both the normalized ticket ID and provider receipt.',
        'Run shared contract tests plus provider-specific timeout, duplicate, permission, and rate-limit tests.',
      ],
      result: 'The agent uses one predictable tool, while tenant routing, credentials, retries, and provider differences remain enforced and observable inside the adapter layer.',
    },
    interview: {
      prompt: 'What should a tool adapter normalize, and what should it preserve?',
      answer: 'Normalize the domain input, structured output, authentication injection, validation, retry categories, and observability. Preserve distinctions that affect correctness, including partial or unknown outcomes, provider capability gaps, raw receipt references, and idempotency guarantees; otherwise the orchestrator may make unsafe retry decisions.',
    },
  },
  'MCP interoperability': {
    explanation: [
      'Model Context Protocol provides a standard way for clients to discover and invoke server-provided tools and access contextual resources through declared schemas. A host still owns trust decisions: it chooses servers, authenticates connections, filters capabilities, validates arguments and results, and places user confirmation or policy checks before sensitive calls.',
      'Use MCP to integrate independently maintained capabilities without writing a bespoke agent binding for each one, especially across development tools and enterprise services. Discovery does not imply safety or semantic compatibility; malicious descriptions, schema changes, excessive permissions, and untrusted returned content remain risks, so pin trust, minimize exposure, sandbox where possible, and run contract and adversarial evaluations.',
    ],
    whyItMatters: 'MCP can reduce integration coupling, but interoperability is not authorization. A secure host treats every server and payload according to an explicit trust level and keeps durable execution controls outside model-generated requests.',
    useCases: [
      'Connecting a coding agent to approved repository and issue-tracker tools',
      'Sharing a governed internal search capability across several agent hosts',
      'Adding a read-only analytics server without changing the core orchestration graph',
    ],
    workedExample: {
      scenario: 'An engineering agent uses separate MCP servers for source control and issue tracking to prepare a bug-fix pull request.',
      steps: [
        'Configure an allowlist of server identities and expose only read repository, create branch, read issue, and draft pull request capabilities.',
        'Map the authenticated engineer to scoped credentials outside the model and validate every discovered schema against the pinned policy.',
        'Treat issue and repository content as untrusted, require confirmation for branch creation, and use the issue ID as part of each idempotency key.',
        'Record server versions, calls, results, and approvals, then evaluate prompt-injection and capability-change scenarios.',
      ],
      result: 'The agent interoperates across two servers while the host retains capability selection, identity, approval, replay protection, and a complete audit trail.',
    },
    interview: {
      prompt: 'Does using MCP make a tool safe to expose to an agent?',
      answer: 'No. MCP standardizes discovery and invocation, not trust. The host must verify server identity, minimize exposed capabilities, inject scoped credentials, validate schemas and payloads, authorize each sensitive action, handle untrusted content, and monitor version or capability changes.',
    },
  },
  'Framework selection': {
    explanation: [
      'Framework selection starts from workflow requirements: control-flow complexity, durable execution, typed state, tool integration, approval support, observability, evaluation hooks, deployment model, and team operating skills. Compare candidates with a representative workflow and failure tests rather than feature lists, and keep domain tools and policy logic behind framework-neutral interfaces.',
      'Use a framework when its runtime removes meaningful orchestration or operations work; direct SDK calls and ordinary application code are often clearer for a small loop. Rich abstractions can hide retries, state formats, authorization placement, or vendor coupling, so inspect execution semantics, export traces and state, test upgrade and exit paths, and choose the least complex option that meets measured needs.',
    ],
    whyItMatters: 'The framework becomes part of the reliability and control surface, not just developer convenience. A requirements-driven choice protects deterministic business rules and durable state from being trapped inside opaque agent behavior.',
    useCases: [
      'Comparing a durable graph runtime with a queue-based application for a claims workflow',
      'Choosing a lightweight model SDK for a read-only summarization service',
      'Evaluating whether an interoperability layer supports existing internal tool contracts',
    ],
    workedExample: {
      scenario: 'A team must choose an implementation approach for a procurement agent with approvals, week-long waits, and purchase-order side effects.',
      steps: [
        'Write acceptance criteria for resumability, typed versioned state, authenticated approval, idempotent execution, trace export, and deployment ownership.',
        'Build the same thin workflow slice in the two leading options using the real approval and purchase-order adapters.',
        'Inject worker crashes, duplicate messages, stale approvals, unauthorized requests, and framework upgrades, then score recovery and operator effort.',
        'Select the smallest option meeting the thresholds and isolate state, tools, policy, and evaluations behind portable contracts.',
      ],
      result: 'The team chooses based on demonstrated control and failure behavior, with an architecture that can replace the framework without rewriting core business rules.',
    },
    interview: {
      prompt: 'What evidence would you gather before adopting an agent framework for a production workflow?',
      answer: 'I would prototype the riskiest real path and measure durable resume, state migration, authorization placement, idempotent retries, approval binding, tracing, evaluation integration, deployment fit, and upgrade behavior. I would also estimate operational complexity and confirm that domain tools and policy can remain portable.',
    },
  },
} satisfies Record<string, AiLessonDetails>