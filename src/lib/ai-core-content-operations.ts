import type { AiLessonDetails } from './ai-core-lesson-types'

export const aiOperationsLessonDetails = {
  'AI traces': {
    explanation: [
      'An AI trace records the causal path of one request across prompt assembly, retrieval, model calls, tool invocations, validation, and the final response. Each span should carry stable request and version identifiers, timing, token counts, outcomes, and redacted inputs or outputs so operators can reconstruct behavior without turning the trace store into a copy of sensitive production data.',
      'Use traces when aggregate metrics cannot explain why a request was slow, expensive, or wrong, and define the boundary at every model, data, and tool transition. Full payload capture improves diagnosis but raises privacy, retention, and cost risks; sampling can miss rare failures, missing parent identifiers break causality, and unrestricted trace access can expose prompts, credentials, or customer records.',
    ],
    whyItMatters: 'AI failures often emerge from an interaction among retrieval, prompts, nondeterministic generation, and tools rather than one stack frame. A privacy-aware trace provides the evidence needed to reproduce that interaction, attribute latency and cost, and verify which policy and artifact versions governed it.',
    useCases: [
      'Finding why a support assistant called the refund tool twice for one customer request',
      'Comparing retrieval documents and token use before and after a prompt release',
      'Auditing which model, policy, and tool result produced a disputed recommendation',
    ],
    workedExample: {
      scenario: 'A production travel assistant has a p95 latency spike and occasionally proposes flights that are no longer available.',
      steps: [
        'Assign one trace identifier to the request and child spans for retrieval, model inference, inventory lookup, and output validation.',
        'Record model and prompt versions, document identifiers, tool status, latency, and token counts while replacing traveler fields with irreversible tokens.',
        'Query slow failed traces and group them by inventory status and model version.',
        'Confirm that stale retrieval results trigger a second model call after inventory rejection, then change the flow to query live inventory before generation.',
      ],
      code: {
        language: 'SQL',
        code: `SELECT model_version, tool_status, COUNT(*) AS requests,
       AVG(duration_ms) AS average_ms
FROM ai_spans
WHERE operation = 'inventory_lookup'
  AND started_at >= CURRENT_TIMESTAMP - INTERVAL '1 hour'
GROUP BY model_version, tool_status;`,
      },
      result: 'The query attributes 82 percent of slow requests to rejected stale inventory, and the reordered flow removes the duplicate model call while lowering p95 latency from 8.4 seconds to 3.1 seconds.',
    },
    interview: {
      prompt: 'What should an AI trace capture, and what should it deliberately avoid capturing?',
      answer: 'It should preserve causality and operational facts: request and span identifiers, model and prompt versions, retrieval references, tool decisions, validation outcomes, latency, tokens, and errors. It should avoid raw secrets and unnecessary personal data, apply field-level redaction before export, restrict access and retention, and sample in a way that still retains errors and high-risk decisions.',
    },
  },
  'Evaluation datasets': {
    explanation: [
      'An evaluation dataset is a versioned collection of realistic inputs, expected facts or actions, grading criteria, and metadata slices used to measure an AI system. Strong datasets include normal traffic, important edge cases, policy boundaries, adversarial inputs, and known incidents, with provenance and consent recorded so every score can be traced to an appropriate test case.',
      'Build a dataset when a product decision needs repeatable evidence, and separate training, tuning, and holdout cases to limit overfitting. The control boundary includes who can add or edit examples, how sensitive records are transformed, and which slices must pass; stale or duplicated cases create false confidence, while a narrow benchmark can reward behavior that fails on languages, tenants, or workflows absent from the sample.',
    ],
    whyItMatters: 'A model score has little operational value without a representative and governed set of cases behind it. Versioned datasets turn quality, safety, and business requirements into repeatable checks and make regressions visible within the user groups and failure modes that matter.',
    useCases: [
      'Maintaining billing, cancellation, multilingual, and jailbreak slices for a support assistant',
      'Converting confirmed production incidents into permanent regression cases',
      'Comparing two retrieval strategies against the same cited-answer holdout set',
    ],
    workedExample: {
      scenario: 'A banking assistant performs well on common account questions but has no measured evidence for joint accounts or Spanish requests.',
      steps: [
        'Sample consented and de-identified production intents, then add synthetic policy-edge cases reviewed by compliance specialists.',
        'Label expected answer facts, prohibited actions, source documents, language, and account type for every case.',
        'Create immutable train, tuning, and holdout partitions and publish a manifest with dataset version and reviewer approvals.',
        'Require overall and per-slice reports so a high English score cannot conceal weak Spanish or joint-account behavior.',
      ],
      code: {
        language: 'JSON',
        code: `{
  "dataset_version": "bank-support-2026-09-30",
  "required_slices": ["spanish", "joint-account", "policy-denial"],
  "holdout_sha256": "91f9c6...",
  "minimum_cases_per_slice": 100
}`,
      },
      result: 'The first sliced evaluation reveals 93 percent factual accuracy overall but only 71 percent on Spanish joint-account cases, blocking release until that measured gap is addressed.',
    },
    interview: {
      prompt: 'How would you prevent an evaluation dataset from becoming a misleading benchmark?',
      answer: 'I would version provenance, labels, partitions, and slice definitions; keep a protected holdout; deduplicate against training data; refresh cases from reviewed production failures; and report per-slice confidence intervals alongside aggregate scores. Access controls and privacy review must govern real examples, while independent label checks reduce evaluator bias.',
    },
  },
  'Offline evaluation': {
    explanation: [
      'Offline evaluation runs a fixed candidate system against a versioned dataset without exposing users to its responses. The harness should pin the model, prompt, retrieval corpus, tool mocks, decoding settings, evaluator versions, and random seeds where supported, then emit task, safety, latency, and cost metrics with confidence intervals and per-slice results.',
      'Use offline evaluation for rapid iteration, regression testing, and release gating before online exposure, while recognizing that static cases cannot reproduce every production interaction or distribution shift. Mocked tools may hide integration failures, reference answers may be incomplete, and repeated tuning against one benchmark can overfit it, so the boundary is pre-release evidence rather than proof of production impact.',
    ],
    whyItMatters: 'Offline evaluation makes candidate comparison fast, repeatable, and safe enough for continuous integration. It catches clear regressions before users encounter them and establishes measurable hypotheses that later online experiments can test under real traffic.',
    useCases: [
      'Comparing prompt revisions on grounded answer accuracy and refusal behavior',
      'Testing a new embedding model against retrieval recall at fixed document depth',
      'Rejecting an agent build that exceeds its tool-call or token budget on regression cases',
    ],
    workedExample: {
      scenario: 'A retailer wants to replace the model behind a product-support assistant with a cheaper candidate.',
      steps: [
        'Run the current and candidate configurations on the same 1,500-case holdout with deterministic product API fixtures.',
        'Measure grounded correctness, unsafe-action rate, p95 simulated latency, tokens, and results for warranty and accessibility slices.',
        'Bootstrap the paired score differences and reject the candidate if the confidence interval crosses the allowed quality loss.',
        'Publish the run manifest and failure examples for review before any traffic allocation.',
      ],
      code: {
        language: 'YAML',
        code: `gates:
  grounded_correctness_delta: ">= -0.01"
  unsafe_action_rate: "<= 0.001"
  p95_tokens: "<= 1800"
  warranty_slice_score: ">= 0.90"`,
      },
      result: 'The candidate cuts median token cost by 28 percent but loses 4.2 points on warranty cases, so the offline gate rejects it and provides the exact failures needed for another iteration.',
    },
    interview: {
      prompt: 'What can offline evaluation establish, and what can it not establish?',
      answer: 'It can establish repeatable comparative performance on known cases under pinned dependencies, including quality, safety, latency proxies, and cost. It cannot establish real user impact, live dependency behavior, or resilience to unseen distribution changes. I use it as a precondition for a controlled online test, not as a substitute for one.',
    },
  },
  'Online evaluation': {
    explanation: [
      'Online evaluation measures an AI candidate under real production traffic through shadowing, interleaving, A/B tests, or carefully reviewed live scoring. Assignment must be stable, metrics must connect model behavior to user and business outcomes, and guardrails must automatically stop exposure when safety, error, latency, or cost thresholds are breached.',
      'Use online evaluation only after offline gates pass and when realistic interactions are necessary to resolve uncertainty such as task completion or user trust. The experiment boundary must isolate treatments and exclude users or workflows that cannot safely participate; novelty effects, feedback loops, sample-ratio mismatch, and delayed outcomes can invalidate conclusions, while live experiments always carry user-impact risk.',
    ],
    whyItMatters: 'Users interact with the whole system under changing conditions, not a static benchmark. Controlled online evidence reveals whether a technically improved candidate actually helps users while bounded exposure and automatic rollback keep the learning process operationally responsible.',
    useCases: [
      'Shadowing a new routing policy against live requests without returning its answers',
      'A/B testing whether a support copilot improves verified case resolution',
      'Monitoring a small live cohort for citation clicks, corrections, and escalation rate',
    ],
    workedExample: {
      scenario: 'A customer-service copilot candidate passed offline tests, and the team needs to know whether it reduces handling time without increasing incorrect refunds.',
      steps: [
        'Randomize eligible agents by stable identifier into control and candidate groups while excluding high-value refund workflows.',
        'Track verified resolution, median handling time, incorrect refund rate, overrides, latency, and assignment counts for each group.',
        'Configure an automatic stop if incorrect refunds exceed 0.2 percent or p95 latency rises above four seconds for fifteen minutes.',
        'Run until the preregistered sample size is reached, then review effect sizes and confidence intervals before expanding exposure.',
      ],
      result: 'At 8,000 eligible cases, the candidate reduces median handling time by 11 percent with no measurable resolution loss, while the incorrect refund guardrail remains below 0.1 percent.',
    },
    interview: {
      prompt: 'Why is a higher thumbs-up rate not enough to declare an online AI experiment successful?',
      answer: 'Thumbs-up feedback is selective, easy to influence through presentation, and may not represent task correctness or long-term outcomes. I would preregister a primary outcome such as verified resolution, add safety and operational guardrails, confirm balanced assignment, inspect important slices, and account for delayed effects before making a rollout decision.',
    },
  },
  'LLM as judge': {
    explanation: [
      'LLM-as-judge evaluation asks a model to score or compare outputs against an explicit rubric, supplied context, and sometimes a reference answer. Reliable implementations constrain the output schema, randomize pair order, blind system identity, calibrate against expert labels, and record judge model and prompt versions so the resulting metric can be reproduced.',
      'Use a judge for criteria that deterministic checks cannot express economically, such as completeness or tone, but keep hard policy and structural rules in code. Judges can favor verbose answers, share blind spots with the system under test, be manipulated by evaluated text, and drift after a model update; therefore their scores require calibration, disagreement monitoring, and human review near consequential thresholds.',
    ],
    whyItMatters: 'Many useful response qualities are expensive to label continuously, and a calibrated judge can evaluate them at scale. Treating the judge as a measured instrument rather than ground truth preserves that leverage without allowing one opaque model opinion to become an unchecked release authority.',
    useCases: [
      'Scoring whether generated support answers fully address a multi-part question',
      'Pairwise comparing summaries after deterministic fact checks pass',
      'Prioritizing low-confidence conversations for expert review rather than auto-failing them',
    ],
    workedExample: {
      scenario: 'A legal research assistant needs a scalable completeness score for answers that cite an approved document set.',
      steps: [
        'Create a rubric with separate groundedness, completeness, and unsupported-claim fields, each anchored with reviewed examples.',
        'Require strict JSON from the judge and place candidate text in a delimited data field with instructions that it cannot alter the rubric.',
        'Calibrate the judge on 300 double-labeled cases and measure agreement and false-pass rate by document type.',
        'Use deterministic citation validation first, then send judge failures and borderline scores to a blinded human reviewer.',
      ],
      code: {
        language: 'JSON',
        code: `{
  "groundedness": 0,
  "completeness": 0,
  "unsupported_claim": false,
  "evidence": ["document-id:passage-id"]
}`,
      },
      result: 'The calibrated judge reaches 0.86 weighted agreement with experts, and the human-review band keeps measured false passes below 1 percent while reducing manual grading volume by 64 percent.',
    },
    interview: {
      prompt: 'How would you make an LLM judge trustworthy enough to support a release decision?',
      answer: 'I would define an observable rubric, constrain and validate outputs, blind identities and randomize pair order, calibrate against representative expert labels, and report agreement plus false-pass rates by slice. I would pin the judge version, treat evaluated text as untrusted data, use deterministic checks for hard rules, and route consequential or borderline cases to humans.',
    },
  },
  'Operational telemetry': {
    explanation: [
      'Operational telemetry aggregates counters, distributions, logs, and alerts for the AI request path, including availability, time to first token, end-to-end latency, token use, model and tool errors, queue depth, validation failures, and cost. Metrics should use bounded dimensions such as model and route rather than request identifiers, while traces carry high-cardinality diagnostic detail.',
      'Use telemetry to operate service-level objectives and detect failures before anecdotal reports arrive, with ownership defined for model providers, application code, tools, and data stores. Excessive labels can overwhelm the monitoring backend, averages hide tail pain, and successful HTTP responses can contain unusable AI outputs, so dashboards need percentile, quality-proxy, and business-impact signals with actionable alert thresholds.',
    ],
    whyItMatters: 'An AI endpoint can be technically available while returning empty, unsafe, slow, or unaffordable results. Layered telemetry makes those distinct failure modes visible and gives responders enough bounded evidence to decide whether to throttle, fail over, or roll back.',
    useCases: [
      'Alerting when p95 time to first token breaches the conversational latency objective',
      'Separating provider throttling from internal queue saturation and tool timeouts',
      'Tracking validated response rate and cost per completed workflow by model route',
    ],
    workedExample: {
      scenario: 'A document assistant returns HTTP 200 responses, but users report blank answers during busy periods.',
      steps: [
        'Instrument request count, nonempty validated responses, provider status, queue delay, inference latency, and tokens by bounded route labels.',
        'Define a service-level indicator as validated nonempty responses divided by eligible requests rather than HTTP success alone.',
        'Alert when the five-minute validated response rate falls below 99 percent and attach exemplars linking to redacted traces.',
        'Correlate the alert with provider throttles and enable the lower-volume fallback route until the primary recovers.',
      ],
      code: {
        language: 'PromQL',
        code: `sum(rate(ai_responses_total{validated="true",nonempty="true"}[5m]))
/
sum(rate(ai_requests_total{eligible="true"}[5m])) < 0.99`,
      },
      result: 'The new indicator detects the incident within three minutes, identifies provider throttling instead of an HTTP outage, and limits blank responses to 0.4 percent during fallback.',
    },
    interview: {
      prompt: 'Which signals would you monitor for a production generative AI endpoint beyond ordinary HTTP metrics?',
      answer: 'I would add time to first token and full-response percentiles, queueing, tokens, cost, provider throttles, tool outcomes, retrieval health, validation and refusal rates, fallback use, and a task-quality proxy such as grounded valid responses. Labels must remain bounded, sensitive content belongs in controlled traces, and alerts need explicit owners and response actions.',
    },
  },
  'Feedback and drift': {
    explanation: [
      'Feedback and drift monitoring compares current inputs, outputs, user actions, and verified outcomes with an approved baseline. Useful signals include intent mix, embedding-distance distributions, language and length shifts, correction or escalation rates, policy violations, and delayed labels, all segmented by meaningful cohorts and tested against expected variation.',
      'Use drift signals to trigger investigation, dataset refresh, or retraining rather than automatic model changes, because distribution movement does not necessarily mean quality loss. Explicit feedback is sparse and biased, silent behavior can be ambiguous, and retraining on unreviewed model outputs creates feedback loops; the control boundary requires provenance, human review, and measured post-change evaluation.',
    ],
    whyItMatters: 'Production data and user needs change after launch, so a previously valid model can degrade without any code deployment. Linking drift to verified outcomes helps teams distinguish harmless traffic changes from real quality loss and respond with evidence rather than blindly retraining.',
    useCases: [
      'Detecting a new product intent that is absent from a support evaluation dataset',
      'Monitoring whether citation corrections rise after a knowledge-base migration',
      'Finding that one language cohort has increasing escalation rates despite stable global scores',
    ],
    workedExample: {
      scenario: 'A benefits assistant begins receiving questions about a newly introduced family-leave policy that was absent from its baseline.',
      steps: [
        'Compare weekly intent embeddings and escalation rates with the approved baseline using minimum-volume and significance thresholds.',
        'Cluster the shifted requests and have policy owners label a representative sample without accepting model responses as ground truth.',
        'Add reviewed family-leave cases to a new dataset version and update the retrieval corpus with the effective policy documents.',
        'Run offline regression gates and a limited online release before replacing the baseline.',
      ],
      result: 'The process attributes a 17 percent escalation increase to the new policy intent, adds 120 reviewed cases, and restores that slice to a 92 percent verified resolution rate without retraining on noisy feedback.',
    },
    interview: {
      prompt: 'Should input drift automatically trigger model retraining?',
      answer: 'No. Input drift indicates change, not necessarily harmful change, and an automatic loop can learn from biased feedback or model-generated errors. I would confirm the shift with sufficient volume, connect it to verified quality or business outcomes, review representative cases, update governed data, and require offline and online evidence before promoting a new model.',
    },
  },
  'Prompt injection': {
    explanation: [
      'Prompt injection occurs when untrusted text attempts to override instructions, disclose context, or induce unauthorized actions. The system must treat user input, retrieved documents, web pages, tool output, and prior messages as data rather than authority, and enforce permissions, tool schemas, data access, and output rules outside the model so persuasive text cannot grant capability.',
      'Apply layered defenses anywhere external content reaches a model, including instruction hierarchy, clear data delimiters, content filtering, least-privilege tools, confirmation for consequential actions, and adversarial evaluation. Pattern blocking alone is brittle, model refusal can be bypassed, and over-filtering harms valid tasks; the hard boundary is deterministic authorization and isolation, with the model used only as one detection signal.',
    ],
    whyItMatters: 'A model cannot reliably distinguish an instruction from quoted or retrieved text solely by linguistic intent. Enforceable boundaries limit an injection to a bad response or blocked attempt instead of allowing it to become a data breach or an external side effect.',
    useCases: [
      'Preventing a malicious knowledge-base page from instructing an agent to reveal its system prompt',
      'Blocking a user message that tries to make a support bot issue an unauthorized refund',
      'Testing whether email content can redirect an assistant to send data to an attacker-controlled address',
    ],
    workedExample: {
      scenario: 'An email triage agent reads a message containing instructions to forward recent customer invoices to an external address.',
      steps: [
        'Mark email bodies and attachments as untrusted content and provide them to the model only inside a delimited data field.',
        'Expose a send-email tool that requires server-side recipient allowlisting, tenant authorization, and a user-approved draft identifier.',
        'Reject arguments not matching the schema and log the policy decision independently of the model response.',
        'Add the attack and paraphrases to an adversarial evaluation that requires zero unauthorized sends.',
      ],
      code: {
        language: 'TypeScript',
        code: `const allowedRecipient = recipient.endsWith('@company.example')
const approvedDraft = draft.tenantId === session.tenantId && draft.approvedAt !== null

if (allowedRecipient === false || approvedDraft === false) {
  throw new Error('Email policy denied')
}`,
      },
      result: 'The model may still summarize the malicious message, but the tool rejects the external recipient and no data leaves the tenant; the regression suite verifies the denial across 75 attack variants.',
    },
    interview: {
      prompt: 'Why can prompt instructions alone not secure an agent against prompt injection?',
      answer: 'All instructions and untrusted content eventually share a model context, and the model is probabilistic rather than a reference monitor. I would reduce exposed context, label untrusted data, and detect attacks, but enforce identity, authorization, schemas, destinations, and side-effect confirmation in deterministic code outside the model.',
    },
  },
  'Data exfiltration': {
    explanation: [
      'Data exfiltration is the unauthorized movement of protected information through model output, tool calls, retrieval, URLs, logs, or covertly encoded content. Prevention starts with tenant-scoped retrieval, minimal context, outbound destination controls, secret redaction, response inspection, and network policies that deny arbitrary egress from model and tool runtimes.',
      'Use defense in depth because an injection detector cannot prove that generated text is safe to transmit. Controls must sit at every source and sink, including database queries, tool arguments, rendered links, telemetry, and provider retention settings; overly broad blocking can break legitimate sharing, while checking only visible prose misses attachments, encodings, and side-channel fields.',
    ],
    whyItMatters: 'AI systems combine broad data access with flexible output channels, so one compromised instruction can bridge stores that were previously separate. Source-scoped access and sink enforcement make disclosure impossible even when model behavior is manipulated.',
    useCases: [
      'Preventing cross-tenant documents from appearing in retrieval context or citations',
      'Blocking an agent from posting customer records to an unapproved webhook',
      'Removing secrets and personal identifiers before prompts and traces reach external services',
    ],
    workedExample: {
      scenario: 'A sales assistant can search customer notes and draft webhook payloads for an approved CRM integration.',
      steps: [
        'Apply tenant and user authorization inside the search query so unauthorized notes never enter model context.',
        'Tokenize sensitive fields before inference and retain the reidentification map only in the trusted application boundary.',
        'Allow outbound requests only to the pinned CRM host and validate payload fields against an explicit schema and purpose.',
        'Run canary-secret tests that fail the deployment if any synthetic secret reaches output, logs, or the network sink.',
      ],
      code: {
        language: 'Policy',
        code: `allow webhook.send when
  destination.host == "crm.company.example" and
  payload.tenant_id == principal.tenant_id and
  payload.keys subset_of ["account_id", "summary", "next_action"]`,
      },
      result: 'Cross-tenant search returns zero rows, an injected external URL is denied at egress, and 200 canary-secret cases complete with zero secret appearances across responses and logs.',
    },
    interview: {
      prompt: 'Where should an AI system enforce data-exfiltration controls?',
      answer: 'At both sources and sinks. Retrieval and tools must enforce tenant, user, and purpose authorization before data enters context; prompts should contain only necessary redacted fields; outbound tools and networks must allow only approved destinations and schemas; and outputs plus telemetry need secret and policy checks. Model instructions can support these controls but cannot replace them.',
    },
  },
  'Tool authorization': {
    explanation: [
      'Tool authorization decides whether the authenticated principal may invoke a specific operation on a specific resource with proposed arguments. The application, not the model, must derive identity and tenant context, validate a narrow schema, check object-level permissions and business invariants, issue short-lived credentials, and record the decision before executing the tool.',
      'Use least-privilege tools and separate read, draft, approve, and execute capabilities so routine assistance does not inherit administrative power. Broad tools simplify orchestration but increase blast radius, repeated confirmation creates friction, and trusting model-supplied identifiers enables confused-deputy attacks; high-impact or irreversible operations need idempotency and explicit human approval.',
    ],
    whyItMatters: 'An agent turns generated text into side effects, making authorization the boundary between a mistaken suggestion and real harm. Deterministic checks preserve ordinary access-control guarantees even when prompts are malicious or model arguments are wrong.',
    useCases: [
      'Allowing an assistant to draft a refund while requiring a manager to approve execution',
      'Restricting a calendar agent to events owned by the signed-in user',
      'Giving a deployment agent read access broadly but restart permission only for approved services',
    ],
    workedExample: {
      scenario: 'A commerce support agent proposes refunds, but only supervisors may refund orders above 100 dollars.',
      steps: [
        'Load the order by server-derived tenant identifier and ignore any tenant value supplied by the model.',
        'Validate the refund amount against the captured charge and check the principal role for amounts above the threshold.',
        'Require a signed approval token bound to order, amount, actor, and expiry for elevated refunds.',
        'Execute through an idempotent payment operation and write an immutable authorization record.',
      ],
      code: {
        language: 'TypeScript',
        code: `const order = await orders.get(session.tenantId, input.orderId)
const elevated = input.amountCents > 10_000

if (input.amountCents > order.capturedCents ||
    (elevated && approvals.verify(input.approvalToken, order.id) === false)) {
  throw new Error('Refund authorization denied')
}`,
      },
      result: 'A prompt-injected 500-dollar refund is denied without a matching approval token, while approved retries reuse one idempotency key and create exactly one payment reversal.',
    },
    interview: {
      prompt: 'What information may safely come from the model when authorizing a tool call?',
      answer: 'The model may propose typed arguments, but none of them should establish identity, tenant, role, ownership, or approval. The server derives security context, validates resource-level permission and business rules, binds approvals to exact arguments, and executes with narrow credentials. Consequential tools also need idempotency, audit records, and an appropriate human checkpoint.',
    },
  },
  'Output validation': {
    explanation: [
      'Output validation treats every model response as untrusted input and checks it before parsing, rendering, storing, or executing it. Controls include strict schemas, bounded lengths and values, citation verification, allowlisted markup, business-rule checks, and parameterized downstream APIs, with invalid outputs rejected or repaired through a limited and observable path.',
      'Use deterministic validation whenever generated content crosses a system boundary, especially for tool arguments, code, financial values, and user-visible rich text. Schema validity does not prove semantic truth, repeated repair can add latency and hide instability, and permissive parsers create inconsistent behavior; validators should fail closed for high-impact actions and expose measurable failure rates.',
    ],
    whyItMatters: 'Fluent output can still be malformed, fabricated, unsafe, or executable in an unintended context. Validation converts an open-ended generation into a constrained application contract and prevents downstream systems from treating model confidence as correctness.',
    useCases: [
      'Rejecting an extracted invoice when totals do not reconcile with line items',
      'Sanitizing generated support HTML before rendering it in a browser',
      'Verifying that every generated citation references an allowed retrieved passage',
    ],
    workedExample: {
      scenario: 'An invoice assistant extracts payment instructions that feed an accounts-payable review queue.',
      steps: [
        'Require JSON matching a schema with bounded currency codes, nonnegative integer cents, and known invoice fields.',
        'Recompute line totals and tax in application code and compare them with the generated aggregate within a one-cent tolerance.',
        'Verify vendor and bank-account identifiers against approved master data rather than accepting newly generated values.',
        'Route validation failures to manual review and publish failure rate by model version as a release metric.',
      ],
      code: {
        language: 'TypeScript',
        code: `const computedTotal = invoice.lines.reduce(
  (sum, line) => sum + line.quantity * line.unitPriceCents,
  invoice.taxCents,
)

if (Math.abs(computedTotal - invoice.totalCents) > 1) {
  throw new Error('Invoice total validation failed')
}`,
      },
      result: 'The validator catches 14 inconsistent totals in a 10,000-document canary and sends them to review, producing zero automatically queued payments with mismatched amounts.',
    },
    interview: {
      prompt: 'Is a valid JSON schema enough to trust model output?',
      answer: 'No. A schema proves structure and basic constraints, not factual accuracy, authorization, or business validity. I would also verify identifiers against trusted stores, recompute derivable values, validate citations and policy rules, sanitize the destination format, and fail closed or require review when a consequential check cannot be satisfied.',
    },
  },
  'Sensitive data': {
    explanation: [
      'Sensitive-data handling begins with classification and minimization before information reaches a prompt, model provider, vector index, trace, or evaluation set. Systems should redact or tokenize unnecessary identifiers, encrypt data in transit and at rest, scope access by tenant and purpose, configure provider retention explicitly, and apply deletion and residency rules across derived artifacts.',
      'Use sensitive data only when the task benefit requires it and document the lawful purpose and retention boundary. Aggressive redaction can remove facts needed for correct answers, while weak pattern matching misses contextual secrets and derived embeddings can remain linkable; access reviews, data-loss tests, and audited reidentification services are needed instead of assuming anonymization is permanent.',
    ],
    whyItMatters: 'AI pipelines replicate data into prompts, caches, indexes, logs, and datasets, multiplying exposure and deletion obligations. Minimizing and tracking those copies reduces breach impact and makes privacy promises enforceable across the full lifecycle.',
    useCases: [
      'Tokenizing patient identifiers before a clinical summarization request',
      'Excluding payment credentials and authentication secrets from AI traces',
      'Applying tenant-specific retention and deletion to vector-index chunks and evaluation examples',
    ],
    workedExample: {
      scenario: 'A healthcare service summarizes referral notes while clinicians still need names restored in the final approved document.',
      steps: [
        'Classify note fields and replace direct identifiers with random scoped tokens inside a trusted preprocessing service.',
        'Send only clinically necessary tokenized text to a provider configured for no training and approved regional processing.',
        'Validate the summary for unsupported facts, then restore identifiers only for an authorized clinician session.',
        'Delete the provider request, temporary mapping, cache entry, and trace payload according to the documented retention schedule.',
      ],
      code: {
        language: 'Policy',
        code: `reidentify(summary, token_map) only when
  principal.role == "clinician" and
  principal.patient_access contains patient_id and
  purpose == "referral-review"`,
      },
      result: 'The model and general telemetry receive no direct identifiers, authorized clinicians receive usable summaries, and deletion tests confirm that all temporary copies disappear within the 24-hour policy window.',
    },
    interview: {
      prompt: 'How would you decide whether sensitive data may be included in an AI prompt?',
      answer: 'I would start from the task purpose and ask whether each field is necessary. Necessary data must have an approved legal and security basis, scoped access, suitable provider retention and residency terms, encryption, auditability, and deletion coverage. I would tokenize or redact wherever possible and test both leakage and task-quality impact before production use.',
    },
  },
  'Supply-chain security': {
    explanation: [
      'AI supply-chain security covers models, datasets, adapters, prompt packages, container images, runtimes, libraries, and remote tools imported into the system. Each artifact should come from an approved source, be pinned by immutable version or digest, scanned and signed, accompanied by provenance and license metadata, and promoted through an isolated build process.',
      'Apply these controls before an artifact can influence inference or execute code, with sandboxing and restricted network access for converters and loaders. Pinning slows automatic updates and signatures do not prove quality, while mutable model tags, unsafe deserialization, poisoned data, and compromised plugins can bypass application reviews; continuous vulnerability monitoring and revocation remain necessary after release.',
    ],
    whyItMatters: 'An AI service inherits risk from large opaque artifacts and code that may never appear in the application diff. Verifiable provenance and isolated promotion prevent a convenient model or package update from silently becoming a production code-execution or data-integrity incident.',
    useCases: [
      'Verifying a downloaded model digest and signature before loading it into an inference image',
      'Scanning a prompt-tool package and its transitive dependencies before registry promotion',
      'Recording dataset provenance and license approval for a fine-tuning run',
    ],
    workedExample: {
      scenario: 'A team wants to deploy a community embedding model downloaded from a public registry.',
      steps: [
        'Resolve the model to an immutable digest and verify its publisher signature and provenance statement in a network-restricted intake job.',
        'Scan model files for unsafe serialization, scan the serving image for vulnerabilities, and review model license and data documentation.',
        'Run behavioral and canary-file tests in an isolated environment with no production credentials or outbound network access.',
        'Sign the approved internal artifact and configure production to accept only that registry and digest.',
      ],
      code: {
        language: 'Policy',
        code: `allow deploy when
  image.registry == "registry.company.example" and
  image.digest in approved_digests and
  signature.identity in trusted_builders and
  scan.critical_vulnerabilities == 0`,
      },
      result: 'The intake scan rejects an unsafe serialized file in the original package; a converted and signed artifact passes tests and production admits only its recorded digest.',
    },
    interview: {
      prompt: 'Why is pinning an AI model version necessary but insufficient for supply-chain security?',
      answer: 'Pinning makes an artifact reproducible but says nothing about who produced it, whether it was tampered with, what code its loader executes, or whether its data and license are acceptable. I would also verify signatures and provenance, scan and sandbox loading, test behavior, promote through a trusted registry, and continuously monitor dependencies for revocation or vulnerabilities.',
    },
  },
  'Adversarial testing': {
    explanation: [
      'Adversarial testing systematically probes an AI system with attacks and difficult inputs aimed at its real assets and boundaries. A threat model identifies protected data, permitted actions, attacker capabilities, and abuse paths, then tests prompt injection, encoding, multi-turn manipulation, retrieval poisoning, tool misuse, denial of service, and cross-tenant access with explicit pass criteria.',
      'Run adversarial tests before releases and continuously against changed models, prompts, tools, and corpora, combining automated variants with independent human exploration. A static jailbreak list quickly becomes stale, test models can share blind spots with the target, and unrestricted red teaming can affect production data; tests need isolated environments, rate limits, evidence capture, and owned remediation deadlines.',
    ],
    whyItMatters: 'Normal quality tests confirm expected use, while attackers deliberately search for paths the design did not anticipate. Threat-led testing measures whether deterministic controls hold under hostile model behavior and turns discovered attacks into repeatable regression cases.',
    useCases: [
      'Testing whether encoded instructions can induce a document agent to disclose another tenant record',
      'Probing a shopping agent for unauthorized purchases through multi-turn social engineering',
      'Measuring resource exhaustion from extremely long context and recursive tool requests',
    ],
    workedExample: {
      scenario: 'A human-resources assistant can search employee policies and open benefit tickets for the signed-in employee.',
      steps: [
        'Define zero tolerance for cross-employee records or tickets and set bounded targets for attack detection and service availability.',
        'Generate direct, encoded, multilingual, retrieved-document, and multi-turn attacks against identity and ticket arguments.',
        'Execute the suite in a seeded test tenant and inspect server authorization logs rather than grading only the visible response.',
        'Convert every successful attack into a regression case and require the deterministic control fix to pass all variants.',
      ],
      code: {
        language: 'YAML',
        code: `pass_criteria:
  cross_employee_records_returned: 0
  unauthorized_tickets_created: 0
  p95_latency_under_attack_ms: 5000
  authorization_log_coverage: 1.0`,
      },
      result: 'The test finds one tool path that trusts a model-supplied employee identifier; server-side identity binding closes it, and 480 attack variants then produce zero unauthorized reads or writes.',
    },
    interview: {
      prompt: 'How is adversarial testing different from collecting a list of jailbreak prompts?',
      answer: 'It starts from system assets, attacker capabilities, and end-to-end boundaries rather than one prompt pattern. It tests retrieval, identity, tools, networks, rate limits, and multi-turn state, then verifies server-side outcomes and logs. Findings become versioned regression cases with measurable criteria and owners, while independent exploration searches for new classes of failure.',
    },
  },
  'Version everything': {
    explanation: [
      'Reproducible AI behavior requires immutable versions for application code, model and endpoint, system and task prompts, retrieval corpus, embedding model, index configuration, tool schemas, policies, evaluators, datasets, and decoding parameters. A release manifest should bind these identifiers to one deployable configuration and every trace or evaluation run should record the manifest identifier.',
      'Use versioning at every independently changing boundary so incidents can be replayed and one component can be rolled back without guessing. More versions increase storage and migration work, external hosted models may change behind aliases, and old indexes can be incompatible with new embeddings; mutable labels are convenient for discovery but production promotion must resolve them to immutable identifiers.',
    ],
    whyItMatters: 'An AI result cannot be explained or reproduced from a source commit alone. A complete manifest turns an otherwise invisible combination of data, prompts, policies, and provider behavior into an auditable release unit that can be evaluated, compared, and rolled back.',
    useCases: [
      'Replaying a disputed answer with the exact prompt, corpus, and model configuration',
      'Rolling back a policy prompt without reverting an unrelated application fix',
      'Comparing evaluation runs only when dataset and judge versions are explicitly recorded',
    ],
    workedExample: {
      scenario: 'A procurement assistant begins omitting contract exceptions after a release that changed both retrieval and prompting.',
      steps: [
        'Read the release manifest from affected traces to identify the exact prompt, index, embedding, model, and policy versions.',
        'Replay the same cases against the previous manifest and change one component at a time in controlled evaluation runs.',
        'Attribute the regression to the new chunking configuration and promote a manifest that restores the previous index while retaining the prompt fix.',
        'Retain manifests and artifacts according to the audit policy and mark superseded aliases without mutating their records.',
      ],
      code: {
        language: 'JSON',
        code: `{
  "release": "procurement-ai-2026.09.30.2",
  "model": "provider/model@2026-08-15",
  "prompt_sha256": "c4b72a...",
  "index": "contracts-v43",
  "embedding": "embed-v7",
  "policy": "tool-policy-v12"
}`,
      },
      result: 'The team reproduces the omission, restores exception recall from 81 percent to 96 percent by rolling back only the index, and preserves the unrelated prompt correction.',
    },
    interview: {
      prompt: 'Why is a Git commit not a complete version for an AI application?',
      answer: 'The commit may not identify hosted model revisions, prompts stored elsewhere, retrieval content and indexes, embedding settings, policies, datasets, judges, or runtime parameters. I would create an immutable release manifest that resolves every dependency and attach its identifier to deployments, traces, and evaluation reports.',
    },
  },
  'Evaluation gates': {
    explanation: [
      'An evaluation gate is an automated promotion rule that compares a candidate against absolute safety limits, minimum task scores, and allowed regression budgets on a versioned dataset. Gates should evaluate overall and critical-slice metrics, account for statistical uncertainty, preserve failure evidence, and require signed exceptions with owners and expiry rather than permitting undocumented overrides.',
      'Use gates in continuous delivery after deterministic tests and before traffic exposure, choosing thresholds from product risk and baseline capability rather than convenient round numbers. Overly strict gates can freeze useful changes, weak aggregate thresholds hide subgroup regressions, noisy judges create flaky builds, and optimizing repeatedly against a known gate can overfit the suite, so holdouts and periodic calibration are essential.',
    ],
    whyItMatters: 'Evaluation gates make quality and safety requirements enforceable at the same point where software checks already control promotion. They prevent schedule pressure from silently accepting a measured regression and leave an auditable record when risk is explicitly accepted.',
    useCases: [
      'Blocking a release when a policy-refusal slice falls below its minimum score',
      'Preventing a cheaper model from shipping when its paired factuality loss exceeds budget',
      'Requiring zero unauthorized tool actions across the adversarial regression suite',
    ],
    workedExample: {
      scenario: 'A loan-document assistant candidate improves extraction speed but changes model, prompt, and OCR preprocessing.',
      steps: [
        'Run schema, arithmetic, citation, and adversarial checks on the pinned holdout and calculate paired confidence intervals against production.',
        'Require zero unauthorized decisions, at least 98 percent field accuracy, and no critical-language slice regression greater than one point.',
        'Publish case-level failures and prevent artifact promotion when any hard gate fails.',
        'Allow an exception only through a signed, time-limited risk record that names monitoring and rollback conditions.',
      ],
      code: {
        language: 'YAML',
        code: `promotion:
  unauthorized_decisions: "== 0"
  field_accuracy: ">= 0.98"
  critical_slice_delta: ">= -0.01"
  confidence: 0.95
  exception_requires: ["risk-owner", "expiry", "rollback-plan"]`,
      },
      result: 'The pipeline blocks promotion because Vietnamese field accuracy falls by 2.6 points despite a passing global score, and the team fixes OCR preprocessing before rerunning the same gate.',
    },
    interview: {
      prompt: 'How would you choose and operate evaluation gate thresholds?',
      answer: 'I would derive hard limits from safety and business consequences, and comparative budgets from a measured production baseline. Gates need representative critical slices, uncertainty handling, pinned evaluators, failure artifacts, and explicit exception governance. I would monitor false failures and production escapes, refresh protected holdouts, and adjust thresholds through review rather than per-release convenience.',
    },
  },
  'Progressive deployment': {
    explanation: [
      'AI progressive deployment promotes a versioned model configuration through offline validation, shadow traffic, a small live canary, and increasing cohorts while comparing it with a stable control. Allocation should be deterministic, traces must identify prompt, model, corpus, policy, and tool versions, and automated rollback must react to quality proxies, safety violations, latency, provider errors, and token cost.',
      'Use this AI-specific process because model behavior is probabilistic and can shift by language, intent, context length, or provider conditions even when application code is unchanged. Shadowing cannot reveal user reactions, small canaries may miss rare harms, mixed cache entries can contaminate comparisons, and long conversations can cross versions; sticky assignment, cache isolation, cohort exclusions, and explicit rollback scope control those failures.',
    ],
    whyItMatters: 'A passing benchmark cannot represent every live prompt, dependency, or conversation. Progressive exposure limits the number of users affected by an AI regression while producing direct comparative evidence for the complete model configuration rather than only the application binary.',
    useCases: [
      'Shadowing a new model and retrieval index on live traffic before returning responses',
      'Canarying a prompt version to one percent of low-risk conversations with sticky assignment',
      'Expanding an agent release only after tool-denial, groundedness, latency, and cost remain within bounds',
    ],
    workedExample: {
      scenario: 'A claims assistant is moving to a new model and prompt that passed offline accuracy and security gates.',
      steps: [
        'Replay ten percent of eligible live requests in shadow mode with side effects disabled and compare validation, latency, and token metrics.',
        'Assign one percent of low-risk new conversations to the candidate, isolate caches by release manifest, and keep high-value claims on control.',
        'Automatically roll back if unsupported-claim rate exceeds 0.5 percent, tool denials rise by two points, or p95 latency exceeds five seconds.',
        'Expand to 10, 25, 50, and 100 percent only after each cohort reaches its minimum sample and review window.',
      ],
      code: {
        language: 'YAML',
        code: `canary:
  sticky_key: conversation_id
  eligible_risk: low
  stages: [1, 10, 25, 50, 100]
  rollback_when:
    unsupported_claim_rate: "> 0.005"
    p95_latency_ms: "> 5000"`,
      },
      result: 'The 10 percent stage reveals a 1.3 percent unsupported-claim rate on scanned forms, triggers automatic rollback within six minutes, and leaves 90 percent of eligible traffic plus all high-value claims on the stable control.',
    },
    interview: {
      prompt: 'What makes progressive deployment for an AI configuration different from a conventional code canary?',
      answer: 'The release unit includes model, prompt, retrieval, tools, policy, and evaluators, and outcomes are probabilistic rather than only error codes. I would use shadow evaluation, sticky conversation assignment, version-isolated caches, risk-based eligibility, quality and safety guardrails alongside latency and errors, and automatic rollback tied to the complete manifest.',
    },
  },
  'Model gateway': {
    explanation: [
      'A model gateway is a controlled service boundary between applications and model providers that centralizes authentication, approved-model routing, quotas, request normalization, content policy, redaction, telemetry, and cost attribution. Applications send a task class and constraints rather than provider credentials, while the gateway resolves an immutable route and records every policy and fallback decision.',
      'Use a gateway when several applications or providers need consistent controls, but keep task-specific authorization and semantic validation in the owning application. A gateway can become a latency bottleneck and single failure domain, lowest-common-denominator APIs can hide provider capabilities, and careless retries can duplicate cost; high availability, bounded retries, circuit breakers, and explicit escape hatches are required.',
    ],
    whyItMatters: 'Without a shared enforcement point, credentials, model allowlists, budgets, and audit behavior drift across applications. A gateway makes provider access governable and observable while allowing routing policy to change independently from each product deployment.',
    useCases: [
      'Routing low-risk classification to a small model and complex synthesis to an approved stronger model',
      'Enforcing per-tenant token budgets and redacting secrets before provider requests',
      'Failing over between compatible regional deployments when a provider returns throttling errors',
    ],
    workedExample: {
      scenario: 'Three internal copilots call different providers directly, and one team accidentally exceeds its monthly token budget.',
      steps: [
        'Move provider credentials into the gateway and require workload identity plus tenant and task claims from each application.',
        'Define approved route policies with model versions, regions, token ceilings, data classifications, and fallback compatibility.',
        'Reject requests above tenant budget before inference and emit bounded cost, latency, policy, and route metrics.',
        'Deploy redundant gateway instances and test circuit breaking without retrying non-idempotent tool workflows.',
      ],
      code: {
        language: 'Policy',
        code: `allow model.invoke when
  principal.workload in approved_workloads and
  request.data_classification <= route.maximum_classification and
  tenant.monthly_tokens + request.maximum_tokens <= tenant.token_budget`,
      },
      result: 'All model traffic uses short-lived workload identity, over-budget calls fail before incurring provider cost, and route-level telemetry attributes 97 percent of spend to a named tenant and task.',
    },
    interview: {
      prompt: 'Which responsibilities belong in a model gateway, and which should remain in the application?',
      answer: 'The gateway should own provider credentials, approved routes, quotas, transport normalization, common redaction, retry policy, and cross-service telemetry. The application must still own user and object authorization, task meaning, tool permissions, semantic output validation, and user experience. Keeping that boundary prevents generic infrastructure from pretending to understand domain consequences.',
    },
  },
  'Scaling inference': {
    explanation: [
      'Scaling inference matches request demand to compute through batching, concurrency limits, queues, replicas, model parallelism, and hardware-aware scheduling. Capacity planning should use measured prompt and generation lengths, time to first token, tokens per second, memory per replica, warm-up time, and workload classes because request count alone does not describe generative load.',
      'Use autoscaling and admission control to protect latency and availability during variable traffic, with separate budgets for interactive and batch work. Larger batches improve throughput but delay individual requests, excessive concurrency causes memory exhaustion or token thrashing, scale-to-zero adds cold starts, and unbounded queues turn overload into timeouts; backpressure and load shedding must be explicit.',
    ],
    whyItMatters: 'Inference capacity is expensive and sensitive to input and output length, so naive replica scaling either wastes hardware or collapses under bursty demand. Measured scheduling and admission control preserve useful service for priority requests while keeping cost predictable.',
    useCases: [
      'Separating interactive chat traffic from overnight document summarization queues',
      'Autoscaling replicas from queue delay and active tokens rather than CPU alone',
      'Rejecting or degrading oversized requests before they exhaust accelerator memory',
    ],
    workedExample: {
      scenario: 'A coding assistant meets normal demand but its latency collapses when a company-wide workshop starts.',
      steps: [
        'Replay representative prompt and completion lengths to measure safe concurrent sequences, throughput, and memory headroom per replica.',
        'Place interactive requests in a bounded priority queue and cap context plus output tokens before admission.',
        'Scale on queue delay and active token load, maintaining two warm replicas for the documented burst arrival rate.',
        'Return a retryable overload response or a smaller-model route when the queue budget is exhausted.',
      ],
      code: {
        language: 'YAML',
        code: `inference_pool:
  min_replicas: 2
  max_replicas: 16
  scale_target_queue_ms: 250
  max_active_tokens_per_replica: 120000
  max_queue_depth: 400`,
      },
      result: 'During a 6x burst, p95 time to first token remains below 1.8 seconds, the queue never exceeds 360 requests, and 3 percent of excess traffic uses the declared smaller-model fallback instead of timing out.',
    },
    interview: {
      prompt: 'Why is CPU utilization often a poor autoscaling signal for generative inference?',
      answer: 'Accelerator work, memory pressure, prompt length, active sequence count, and generated tokens dominate capacity, while CPU may remain moderate during saturation. I would benchmark representative lengths, scale on queue delay and active token load, bound admission and queues, maintain warm capacity for burst objectives, and separate interactive from batch scheduling.',
    },
  },
  'Caching and reuse': {
    explanation: [
      'AI caching can reuse exact responses, semantic matches, retrieval results, embeddings, prompt prefixes, or provider-side context when a stable key proves compatibility. Keys must include tenant and authorization scope, model and prompt versions, policy, locale, retrieval snapshot, tool state, and relevant generation settings, with encrypted storage, bounded retention, and invalidation tied to source changes.',
      'Use caching for repeated low-variance work where stale or shared data has acceptable risk, and bypass it for personalized or consequential answers that require fresh tools. Semantic similarity can return a plausible answer to a materially different question, stale retrieval can preserve revoked facts, and cross-tenant keys can leak data; measure hit quality and savings, not hit rate alone.',
    ],
    whyItMatters: 'Model calls are often the slowest and most expensive part of an AI workflow, and disciplined reuse can improve both latency and capacity. Correct scoping and invalidation are essential because a fast cached answer is worse than a fresh call when it exposes another user or applies obsolete policy.',
    useCases: [
      'Reusing embeddings for unchanged document chunks identified by content hash',
      'Caching public product answers by prompt, corpus, model, and locale version',
      'Sharing a stable prompt prefix within a provider session while isolating tenant content',
    ],
    workedExample: {
      scenario: 'A product-documentation assistant repeatedly answers public installation questions but also serves account-specific entitlement questions.',
      steps: [
        'Classify requests and permit response caching only for public-document tasks with no account or session fields.',
        'Build the cache key from normalized question, locale, model, prompt, policy, and documentation snapshot versions.',
        'Validate cached citations against the current snapshot and purge entries when a source document is withdrawn.',
        'Track valid-hit rate, latency saved, token savings, and stale-answer incidents while bypassing all entitlement requests.',
      ],
      code: {
        language: 'TypeScript',
        code: `const cacheable = request.dataClass === 'public' && request.accountId === null
const cacheKey = hash([
  request.normalizedQuestion,
  request.locale,
  release.model,
  release.prompt,
  release.policy,
  docs.snapshot,
])`,
      },
      result: 'Public requests achieve a 43 percent validated cache-hit rate and 38 percent lower median latency, while account-specific traffic produces zero cache reads and withdrawn-document entries disappear within five minutes.',
    },
    interview: {
      prompt: 'What must be part of an AI response-cache key?',
      answer: 'Every factor that can change meaning or permission: normalized input, tenant and user scope where caching is allowed, model, prompt, policy, locale, retrieval snapshot, tool state, and relevant generation settings. I would prefer content hashes and immutable versions, set risk-based retention, validate citations, test cross-tenant isolation, and bypass cache when freshness or personalization cannot be proven.',
    },
  },
  'Fallback design': {
    explanation: [
      'Fallback design defines a bounded alternative for each failed AI dependency or confidence condition, such as retrying a transient provider error, routing to a compatible model, returning retrieved sources without synthesis, using a deterministic workflow, asking a clarifying question, or escalating to a human. Each transition needs an explicit trigger, capability contract, timeout, attempt limit, and user-visible statement that reflects reduced functionality.',
      'Use fallbacks to preserve safe utility, not to hide every failure, and validate that the alternate path satisfies the same authorization, privacy, and output controls. A smaller model may not support required tools, retries can multiply cost and latency, chained providers can create an outage cascade, and silent degradation can mislead users; hard safety failures should fail closed rather than route around policy.',
    ],
    whyItMatters: 'Models and providers will throttle, time out, and produce invalid results, but the correct response depends on task consequence. Designed fallbacks keep low-risk work available while ensuring that high-risk decisions stop or reach a qualified human instead of continuing through an incompatible path.',
    useCases: [
      'Returning verified search results when answer generation exceeds its latency budget',
      'Routing low-risk summarization to a compatible secondary model during provider throttling',
      'Escalating a medical or financial request when evidence is missing or validation fails',
    ],
    workedExample: {
      scenario: 'An order-support assistant uses a primary model to explain shipment status and can request address changes through an authorized tool.',
      steps: [
        'Classify status explanation as low risk and address change as consequential, then define separate fallback contracts.',
        'On one transient primary timeout, route status explanation to a tested secondary model with the same retrieval and validation controls.',
        'For address changes, disable fallback execution and present the verified order status plus a human-support handoff when the primary or authorization check fails.',
        'Record fallback reason, route, latency, validation result, and outcome, then alert when fallback volume exceeds five percent for ten minutes.',
      ],
      code: {
        language: 'YAML',
        code: `fallbacks:
  shipment_explanation:
    transient_attempts: 1
    route: secondary-summary
  address_change:
    route: human-support
    tool_execution: disabled
  alert_rate: 0.05`,
      },
      result: 'During a 20-minute primary outage, 96 percent of status questions receive validated secondary responses, while all 37 address-change requests are safely handed to staff with zero unauthorized modifications.',
    },
    interview: {
      prompt: 'How do you decide whether an AI failure should retry, use another model, degrade, or stop?',
      answer: 'I classify the failure as transient or semantic and the task by consequence. A bounded retry fits a transient idempotent call; a secondary model is valid only if it meets the same capability and policy contract; deterministic degradation works when verified data still provides value; and consequential actions fail closed or escalate when authorization, evidence, or validation is uncertain.',
    },
  },
} satisfies Record<string, AiLessonDetails>