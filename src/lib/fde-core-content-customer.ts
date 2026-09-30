import type { FdeLessonDetails } from './fde-core-lesson-types'

export const fdeCustomerLessonDetails = {
  'Structured logs': {
    explanation: [
      'Structured logs record events as named fields such as timestamp, service, operation, tenant, severity, and outcome instead of embedding every fact in prose. An FDE should define a stable event vocabulary, emit one record at meaningful state transitions, and keep field types consistent so operators can filter, aggregate, and join events without parsing message text.',
      'Use structured logs when diagnosing discrete events such as requests, retries, decisions, and failures. Include identifiers and bounded business context, but exclude secrets and unnecessary personal data; richer records improve diagnosis while high-cardinality or verbose fields increase storage cost, exposure risk, and query complexity.',
    ],
    whyItMatters: 'Customer environments rarely fail in a way that one developer can reproduce locally. Queryable event records let an FDE reconstruct what happened for one tenant or operation without reading millions of unrelated lines or asking the customer to repeat the failure.',
    useCases: [
      'Finding every failed document import for one customer tenant and connector version',
      'Comparing retry outcomes by dependency and error category during an incident',
      'Auditing which configuration version was active when a workflow changed state',
    ],
    workedExample: {
      scenario: 'A customer reports that some nightly CRM imports finish with fewer accounts than expected, but the job still reports success.',
      steps: [
        'Define import_started, page_received, record_rejected, and import_completed events with tenant_id, run_id, connector_version, counts, and outcome fields.',
        'Emit the events at each state transition and classify rejection reasons with bounded codes rather than raw exception messages.',
        'Query one affected run_id and compare received, accepted, rejected, and persisted counts to locate the first mismatch.',
      ],
      code: {
        language: 'JSON',
        code: `{
  "event": "record_rejected",
  "tenant_id": "northstar",
  "run_id": "crm-2026-09-30-01",
  "reason": "missing_external_id",
  "connector_version": "3.8.1"
}`,
      },
      result: 'The FDE identifies that records without external IDs were silently skipped, can quantify the impact for the customer, and has a stable event field for validating the fix.',
    },
    interview: {
      prompt: 'What makes a structured log useful rather than merely valid JSON?',
      answer: 'Its fields represent a deliberate, stable event model: consistent names and types, a clear event identity, correlation fields, bounded outcome values, and enough context to answer operational questions. Arbitrary JSON with changing keys, duplicated prose, secrets, or unbounded payloads is difficult and expensive to query even though it is technically structured.',
    },
  },
  Metrics: {
    explanation: [
      'Metrics are numeric measurements aggregated over time, commonly expressed as counters, gauges, and histograms. Counters track cumulative events, gauges represent current state, and histograms preserve a distribution of observations such as latency; an FDE should select the instrument that matches how the value changes and attach only bounded dimensions.',
      'Use metrics for trends, rates, ratios, capacity, and threshold evaluation rather than detailed event reconstruction. They are cheap to query and effective for alerting, but labels multiply time series, so values such as customer ID, request ID, or raw error text can create unbounded cardinality and should usually remain in logs or traces.',
    ],
    whyItMatters: 'A customer needs to know whether a problem is isolated or systemic and whether it is getting better or worse. Correctly designed metrics turn large event volumes into comparable signals that support capacity decisions, release validation, and rapid incident detection.',
    useCases: [
      'Tracking successful and failed synchronization operations by connector and region',
      'Measuring queue depth and worker throughput to detect growing processing delay',
      'Comparing request latency distributions before and after a customer rollout',
    ],
    workedExample: {
      scenario: 'A healthcare customer says eligibility checks feel slow during the morning enrollment window.',
      steps: [
        'Record request duration in a histogram and increment outcome counters, labeling only by region, operation, and bounded status class.',
        'Graph request rate and p50, p95, and p99 latency for the reported window instead of averaging all requests.',
        'Compare latency with dependency error rate and worker saturation to distinguish load from an upstream slowdown.',
      ],
      code: {
        language: 'PromQL',
        code: `histogram_quantile(
  0.95,
  sum by (le) (rate(eligibility_duration_seconds_bucket[5m]))
)`,
      },
      result: 'The data shows that p95 latency rises only when the upstream payer API slows, while local worker utilization remains normal, giving the customer a precise escalation target.',
    },
    interview: {
      prompt: 'Why should request IDs not be used as metric labels?',
      answer: 'Each unique label combination creates a separate time series. Request IDs are effectively unbounded, so using them causes cardinality and cost to grow with traffic and can overload the metrics system. Keep aggregate dimensions in metrics and use a request ID to pivot into logs or traces for one execution.',
    },
  },
  'Distributed traces': {
    explanation: [
      'A distributed trace models one operation as a tree of timed spans that cross service and process boundaries. Each span names a unit of work, records its parent, duration, status, and selected attributes, while propagated trace context lets the backend reconstruct the end-to-end critical path.',
      'Use traces when latency or failure depends on several services, queues, or external APIs. Sampling controls volume and cost, but head sampling can discard rare failures and indiscriminate span attributes can expose customer data; choose a sampling strategy and attribute policy that preserve important journeys without recording every detail.',
    ],
    whyItMatters: 'An FDE often owns the integration path but not every component on it. Traces show where time and errors accumulate across boundaries, replacing arguments based on isolated service timings with one causal view of the customer operation.',
    useCases: [
      'Locating which service dominates latency in a multi-step order submission',
      'Following an asynchronous job from API acceptance through a queue to completion',
      'Comparing dependency calls made by successful and failed customer requests',
    ],
    workedExample: {
      scenario: 'A logistics customer sees quote requests take six seconds even though the public API handler reports only 200 milliseconds of local work.',
      steps: [
        'Propagate W3C trace context from the public API through the pricing service and carrier adapters.',
        'Create spans for validation, cache lookup, each carrier call, and response assembly with bounded carrier and outcome attributes.',
        'Inspect slow traces and compare the critical path with a normal trace to find the span responsible for the delay.',
      ],
      result: 'The trace shows a five-second serial timeout against one carrier after two faster carrier calls, leading the team to parallelize calls and apply a tighter per-carrier deadline.',
    },
    interview: {
      prompt: 'How is a distributed trace different from a collection of timestamped logs?',
      answer: 'A trace carries explicit parent-child and causal context across boundaries, so the system can reconstruct concurrency and the critical path. Timestamped logs may describe the same work, but clock skew, missing identifiers, and interleaved events make causality harder to establish. Logs add detail; traces supply the execution structure.',
    },
  },
  'SLIs and SLOs': {
    explanation: [
      'A service level indicator is a measured ratio or distribution that represents customer-visible service behavior, such as successful valid requests divided by all valid requests. A service level objective sets a target for that indicator over a window, for example 99.9 percent successful processing over 28 days, which creates an error budget for imperfect service.',
      'Choose SLIs at the boundary customers experience and define eligibility, success, exclusions, data source, and window explicitly. Tight objectives drive reliability investment but reduce delivery freedom and may be expensive to meet; loose or infrastructure-only objectives can look healthy while the customer workflow is failing.',
    ],
    whyItMatters: 'SLIs and SLOs turn vague reliability expectations into shared decision rules. They let an FDE and customer discuss risk, release pace, and incident severity using the actual outcome the customer depends on rather than raw uptime or intuition.',
    useCases: [
      'Setting a completion objective for customer files processed before a contractual cutoff',
      'Tracking the proportion of valid API requests that return a correct response within two seconds',
      'Using error-budget burn to decide whether a risky rollout should pause',
    ],
    workedExample: {
      scenario: 'A payroll customer needs uploaded payroll files validated before its 5 PM approval deadline.',
      steps: [
        'Define an eligible event as a valid file received before 4:30 PM and a good event as validation completed within 10 minutes without manual intervention.',
        'Set a 99.5 percent objective over a rolling 28-day window and document exclusions for customer-cancelled uploads.',
        'Calculate the indicator from durable workflow events and review both compliance and error-budget burn during releases.',
      ],
      code: {
        language: 'Text',
        code: `SLI = eligible files validated within 10 minutes / all eligible files
SLO = SLI >= 99.5% over a rolling 28-day window`,
      },
      result: 'The teams now evaluate reliability against payroll readiness, and a fast-burning budget triggers investigation before missed validations threaten the approval deadline.',
    },
    interview: {
      prompt: 'Why is 99.9 percent server uptime often a weak SLO for a customer workflow?',
      answer: 'A server can be reachable while returning incorrect results, timing out downstream, or failing only the workflow the customer values. A useful SLO measures a customer-visible good event with clear eligibility and timing. Infrastructure uptime may support diagnosis, but it is not automatically the service outcome.',
    },
  },
  'Actionable alerts': {
    explanation: [
      'An actionable alert identifies a condition that requires timely human action and includes enough context to choose the first response. Strong alerts are tied to user impact or rapid error-budget burn, state the affected service and scope, link to evidence and a runbook, and stop firing when the condition resolves.',
      'Page on symptoms that threaten an objective and use tickets or dashboards for slower trends. Sensitive thresholds detect problems earlier but create noise; sustained windows, multi-window burn rates, deduplication, and routing reduce false urgency while still catching fast and slow failures.',
    ],
    whyItMatters: 'Customer trust suffers both when incidents go unnoticed and when responders become numb to noisy pages. Actionable alerts preserve attention for conditions where intervention can change the outcome and shorten the path from signal to mitigation.',
    useCases: [
      'Paging when checkout failures consume the error budget at a fast burn rate',
      'Opening a business-hours ticket when storage growth will reach capacity in two weeks',
      'Routing connector-specific failures to the team that owns the affected integration',
    ],
    workedExample: {
      scenario: 'An enterprise customer has nightly exports, and the current alert pages whenever any single export attempt fails.',
      steps: [
        'Replace the single-failure threshold with an alert on failed eligible exports and deadline risk across short and long windows.',
        'Include customer tier, affected region, recent deployment, dashboard link, and the export recovery runbook in the notification.',
        'Test the rule with historical data to verify that transient retries do not page but sustained failures do.',
      ],
      result: 'Responders receive one page when exports are genuinely at risk, can identify the affected scope immediately, and can start the documented replay procedure without searching for basic context.',
    },
    interview: {
      prompt: 'What is the difference between an alert being accurate and being actionable?',
      answer: 'An accurate alert can truthfully report a condition that needs no immediate response. An actionable alert represents meaningful impact or imminent risk, reaches an owner at the right urgency, and provides evidence and a first step. Accuracy is necessary, but actionability determines whether interruption is justified.',
    },
  },
  Dashboards: {
    explanation: [
      'A dashboard is a curated operational view that arranges related signals around a decision, not a collection of every available chart. Start with customer outcomes, then add traffic, errors, latency, saturation, deployment, and dependency panels that help explain changes in those outcomes.',
      'Use dashboards for shared situational awareness, release comparison, and investigation entry points. Aggregation makes patterns visible but can hide tenant-specific or tail behavior, so provide consistent filters, percentile views, units, annotations, and links to logs or traces rather than trying to encode every detail on one screen.',
    ],
    whyItMatters: 'During a customer incident, a well-designed dashboard gives engineering and customer stakeholders the same factual starting point. It reduces time spent assembling screenshots and prevents local component health from obscuring a failing end-to-end workflow.',
    useCases: [
      'Monitoring onboarding completion and failure reasons during a phased rollout',
      'Comparing service health before and after a connector release',
      'Reviewing capacity, latency, and error trends in a weekly customer operations meeting',
    ],
    workedExample: {
      scenario: 'A retailer is moving stores to a new inventory synchronization service and wants a rollout dashboard.',
      steps: [
        'Place synchronized-store percentage, freshness SLI, and failed-item ratio at the top as outcome panels.',
        'Add throughput, queue age, dependency latency, worker saturation, and release annotations as diagnostic panels.',
        'Provide region, store cohort, and connector-version filters, then verify every panel uses the same time zone and units.',
      ],
      result: 'The rollout team can see that one store cohort loses freshness after a connector release and pivot directly from the affected interval into correlated traces.',
    },
    interview: {
      prompt: 'How do you decide whether a chart belongs on an operational dashboard?',
      answer: 'Name the decision or question the chart supports. A panel should show customer impact, help explain that impact, or guide a response. If no expected action or interpretation follows from a change in the chart, it is probably diagnostic detail better reached through a drill-down rather than permanent dashboard space.',
    },
  },
  'Correlation context': {
    explanation: [
      'Correlation context is the set of identifiers propagated across telemetry so records from one business operation can be joined. A trace ID follows technical execution, while identifiers such as workflow ID, tenant ID, or idempotency key connect asynchronous retries and business state that may outlive a single trace.',
      'Generate identifiers at the first trusted boundary, propagate them through calls and messages, and record them consistently in logs and spans. More context improves investigation, but raw customer identifiers and high-cardinality values can create privacy or cost problems, so use opaque values, access controls, and the appropriate telemetry store.',
    ],
    whyItMatters: 'Without correlation, an FDE must infer relationships from timestamps and payloads, which is slow and unreliable under concurrency. Deliberate context turns scattered service evidence into the history of the exact customer operation being investigated.',
    useCases: [
      'Following one onboarding workflow across an API, queue, worker, and external identity provider',
      'Grouping all retry attempts made for the same idempotent customer request',
      'Joining a customer support case to logs and traces through an opaque workflow identifier',
    ],
    workedExample: {
      scenario: 'A bank reports that one account-opening request was acknowledged but never reached the review queue.',
      steps: [
        'Accept or create an opaque workflow_id at the API boundary and add it to the trace context, structured logs, and queued message metadata.',
        'Search by workflow_id to reconstruct acceptance, validation, publication, consumption, and persistence events.',
        'Compare the last successful event with queue telemetry and the dead-letter record to identify the failed transition.',
      ],
      result: 'The FDE finds that the message was dead-lettered after schema validation and can show the customer the exact transition, error category, and replay candidate without exposing account data.',
    },
    interview: {
      prompt: 'Why might a system need both a trace ID and a business workflow ID?',
      answer: 'A trace ID describes one technical execution and may end at an asynchronous boundary or change on a later retry. A workflow ID remains stable across attempts and long-running business states. Using both preserves detailed call causality while allowing the full customer operation to be reconstructed over time.',
    },
  },
  'Telemetry cost': {
    explanation: [
      'Telemetry cost is driven by event volume, payload size, metric cardinality, trace sampling, retention, indexing, and query frequency. An FDE should estimate those drivers from expected traffic, classify signals by diagnostic value, and set collection and retention policies before production volume makes defaults expensive.',
      'Control cost by aggregating routine measurements, sampling traces deliberately, reducing redundant fields, tiering retention, and preserving full fidelity for errors or high-value workflows. Aggressive reduction lowers spend but can erase rare evidence, so each change should state which operational question remains answerable and how incidents will be investigated.',
    ],
    whyItMatters: 'An observability design that is unaffordable will eventually be disabled or shortened exactly when customer history is needed. Cost-aware telemetry keeps the evidence sustainable while protecting the signals required for support, reliability, and contractual reporting.',
    useCases: [
      'Estimating log ingestion before enabling verbose connector events for all tenants',
      'Applying tail-based trace sampling that retains errors and unusually slow requests',
      'Moving older audit records to cheaper storage while keeping recent records indexed',
    ],
    workedExample: {
      scenario: 'A document-processing customer expects traffic to grow from 2 million to 40 million pages per month, and the current system logs one full payload per page.',
      steps: [
        'Measure average event bytes and events per page, then project monthly ingestion and indexed retention at the new volume.',
        'Replace full payloads with document IDs, bounded outcome fields, and sizes while storing sensitive source documents in the governed system of record.',
        'Retain error events longer, sample routine success traces, and validate that support can still answer its top investigation questions.',
      ],
      code: {
        language: 'Text',
        code: `monthly_ingestion_gb = pages_per_month * events_per_page * avg_event_bytes / 1e9
40,000,000 * 4 * 900 / 1e9 = 144 GB`,
      },
      result: 'The team has a volume-based budget, removes sensitive duplicate payloads, and retains complete failure evidence while reducing routine ingestion substantially.',
    },
    interview: {
      prompt: 'How would you reduce telemetry cost without making incidents harder to diagnose?',
      answer: 'First identify the questions and signals required during incidents. Then remove duplicate payloads, bound metric labels, aggregate routine events, and apply sampling or shorter retention to low-value successes while preserving errors, rare latency, audit needs, and correlation fields. Validate the policy against real investigations before broad rollout.',
    },
  },
  'Incident learning': {
    explanation: [
      'Incident learning turns a service disruption into durable system improvement through a factual timeline, impact statement, contributing conditions, response analysis, and owned follow-up actions. The review should explain how technical and organizational defenses interacted instead of stopping at the person or line of code closest to the failure.',
      'Run the review after service is stable and include customer-facing, engineering, and operational evidence. Deep analysis consumes time and can produce an unmanageable action list, so prioritize changes that reduce recurrence, limit blast radius, or improve detection and response, each with an owner and completion signal.',
    ],
    whyItMatters: 'Customer incidents reveal assumptions that normal testing and planning missed. A disciplined learning process converts that expensive evidence into better controls and gives the customer a credible account of what will materially change.',
    useCases: [
      'Reviewing why a schema change broke one customer connector despite passing tests',
      'Identifying detection and escalation delays after a regional processing outage',
      'Tracking corrective actions from a data-replay incident through verification',
    ],
    workedExample: {
      scenario: 'A customer received duplicate invoices after a worker restart replayed messages that had already triggered billing.',
      steps: [
        'Build a timestamped timeline from deployment, queue, billing, and support evidence and quantify affected invoices and customers.',
        'Identify contributing conditions including non-idempotent billing, an ambiguous retry contract, and an alert based only on worker errors.',
        'Assign actions for idempotency enforcement, replay-contract tests, duplicate-charge detection, and customer remediation with owners and due dates.',
        'Verify the controls with a restart exercise and share the measured result with the customer.',
      ],
      result: 'The review produces tested safeguards against duplicate billing and faster detection, rather than ending with a vague instruction for operators to be more careful.',
    },
    interview: {
      prompt: 'What distinguishes an effective incident review from a chronological incident summary?',
      answer: 'A timeline establishes facts, but learning requires analysis of why safeguards failed or were absent, how response conditions shaped impact, and which changes will reduce future risk. Effective actions have owners and verification criteria; blame and generic reminders do not improve the system.',
    },
  },
  'Map stakeholders': {
    explanation: [
      'Stakeholder mapping identifies who experiences, operates, funds, governs, integrates with, and can block or approve a customer solution. For each group, record its desired outcome, decision authority, workflow role, concerns, evidence needed, and communication path rather than treating all attendees as interchangeable users.',
      'Do this early and revise it as discovery exposes hidden owners such as security, data governance, frontline operations, or an external vendor. Broader inclusion uncovers constraints but increases coordination cost, so distinguish decision makers, contributors, affected users, and informed parties and involve each at the depth its role requires.',
    ],
    whyItMatters: 'A technically correct solution can fail when it ignores the person who approves data access, operates exceptions, or measures the business result. The map gives an FDE a concrete plan for gathering requirements and resolving decisions before late objections become redesigns.',
    useCases: [
      'Identifying compliance approval needed before using customer support transcripts',
      'Separating the executive sponsor from agents who perform the workflow every day',
      'Finding the external platform owner whose API limits constrain the integration',
    ],
    workedExample: {
      scenario: 'An insurer wants to automate claim intake, and the initial contact is the innovation director.',
      steps: [
        'List every group that supplies inputs, handles exceptions, approves risk, owns integrations, or measures claim outcomes.',
        'Interview claims adjusters, security, legal, data engineering, and the policy-system owner to capture authority, concerns, and required evidence.',
        'Create a decision matrix naming who recommends, approves, contributes to, and is informed about data use, workflow changes, and rollout.',
      ],
      code: {
        language: 'Text',
        code: `Decision: use claim attachments for model processing
Recommends: Claims Operations
Approves: Data Protection Officer
Contributes: Security, Platform Engineering
Informed: Innovation Sponsor, Support`,
      },
      result: 'The team discovers that the data protection officer must approve attachment handling and that adjusters, not the sponsor, own the exception workflow that the design must preserve.',
    },
    interview: {
      prompt: 'Why is an organization chart insufficient as a stakeholder map?',
      answer: 'Reporting structure does not show who performs the workflow, controls a dependency, approves a risk, or is affected by a change. A useful map connects people and groups to outcomes, authority, evidence, and operational roles, then uses those distinctions to plan discovery and decisions.',
    },
  },
  'Define the outcome': {
    explanation: [
      'Defining the outcome translates a requested feature into a measurable change in customer behavior or business performance. Ask what should improve, for whom, from what baseline, by when, and under which guardrails; then separate that result from the proposed mechanism so alternative solutions remain possible.',
      'Use outcome definition before architecture or backlog commitment and revisit it when evidence changes. A narrow outcome improves focus but may miss secondary effects, while a broad aspiration cannot guide tradeoffs, so pair one primary measure with explicit quality, risk, and adoption guardrails.',
    ],
    whyItMatters: 'Customers often arrive with a solution request because it is easier to name than the underlying result. A precise outcome prevents an FDE from shipping requested functionality that sees little adoption or shifts cost and risk elsewhere.',
    useCases: [
      'Reframing a chatbot request as reducing time to resolve a specific support case class',
      'Defining success for automating invoice extraction without increasing correction work',
      'Clarifying whether faster onboarding or lower abandonment is the primary objective',
    ],
    workedExample: {
      scenario: 'A telecom customer asks for an AI assistant that summarizes every support call.',
      steps: [
        'Ask which downstream decision the summary should improve and learn that agents spend four minutes writing wrap-up notes after billing calls.',
        'Measure the current median wrap-up time, correction rate, and required compliance fields for that call category.',
        'Define the outcome as reducing median wrap-up time from four minutes to one while keeping mandatory-field completeness above 99 percent and agent corrections below 10 percent.',
      ],
      result: 'The team can test a focused note-drafting workflow against operational measures instead of treating summary generation alone as success.',
    },
    interview: {
      prompt: 'How would you respond when a customer defines success as launching an AI assistant?',
      answer: 'Launching is an output, not the customer outcome. I would ask who should behave differently, which workflow measure should improve, its baseline and target, and what must not degrade. The assistant may remain the chosen mechanism, but it should be evaluated against that outcome and its guardrails.',
    },
  },
  'Observe the current workflow': {
    explanation: [
      'Workflow observation captures what people and systems actually do from trigger to completed outcome, including handoffs, tools, waiting, rework, exceptions, and informal workarounds. An FDE should shadow representative cases, collect artifacts and timestamps, and distinguish observed behavior from policy documents or remembered descriptions.',
      'Observe before designing automation, especially when several roles or legacy systems are involved. Observation takes access and can influence behavior, so sample normal and difficult cases, protect sensitive data, and validate the resulting map with participants rather than assuming one session represents all work.',
    ],
    whyItMatters: 'The hidden cost and risk in customer work often lives between documented steps: spreadsheet reconciliation, copied identifiers, approval queues, and exception calls. Seeing those mechanics prevents a solution from optimizing one screen while leaving the real bottleneck untouched.',
    useCases: [
      'Shadowing agents as they resolve account-access cases across several systems',
      'Timing handoffs and rework in a purchase-order approval process',
      'Following failed data imports through the customer team\'s manual recovery steps',
    ],
    workedExample: {
      scenario: 'A manufacturer says supplier onboarding takes ten days because its vendor portal is slow.',
      steps: [
        'Observe several standard and exception onboardings from invitation through approval and record active time, waiting time, handoffs, and systems used.',
        'Collect the checklist, email templates, spreadsheet, and rejection examples that participants use outside the portal.',
        'Validate the map with procurement and compliance, including where cases loop back for missing tax evidence.',
      ],
      result: 'The observation shows that seven days are spent waiting for compliance clarification by email, shifting the solution from portal performance work to earlier evidence validation and visible exception ownership.',
    },
    interview: {
      prompt: 'Why should an FDE observe a workflow if the customer already provided a process diagram?',
      answer: 'A diagram usually represents intended or simplified flow. Observation reveals actual tools, delays, exception paths, duplicated entry, and workarounds that determine whether a solution will fit. The existing diagram is a hypothesis to validate, not evidence that execution matches policy.',
    },
  },
  'Surface constraints': {
    explanation: [
      'Constraints are conditions the solution must respect, such as regulatory boundaries, deadlines, budgets, deployment environments, integration limits, staffing, procurement rules, and irreversible business dates. Surface them by asking for evidence, owners, and consequences, then classify each as fixed, negotiable, assumed, or unknown.',
      'Do this before committing to an approach and test constraints that sound absolute, because policy, preference, and technical necessity are often conflated. Challenging every limit wastes trust, but accepting every statement can eliminate viable options, so focus on constraints that materially change architecture, scope, or delivery risk.',
    ],
    whyItMatters: 'Late discovery of a residency rule, change freeze, or vendor rate limit can invalidate weeks of implementation. An explicit constraint set lets the FDE choose feasible options and escalate the few decisions where relaxing a limit creates significant value.',
    useCases: [
      'Confirming whether customer data must remain within a named region and account',
      'Planning around a quarter-end production freeze and fixed launch event',
      'Accounting for an external API quota that limits synchronization throughput',
    ],
    workedExample: {
      scenario: 'A public-sector customer says the solution cannot use any managed cloud service.',
      steps: [
        'Ask which policy or accreditation control creates the restriction and who can interpret it.',
        'Review the control with security and determine that protected records must stay in the accredited boundary, while aggregate operational metrics may use approved managed services.',
        'Record the data-boundary constraint, approved exceptions, decision owner, and design consequences in the discovery log.',
      ],
      result: 'The architecture keeps protected records inside the accredited environment without unnecessarily self-hosting the entire monitoring stack.',
    },
    interview: {
      prompt: 'How do you handle a customer statement that a proposed technology is prohibited?',
      answer: 'I treat it as an important constraint and ask for its source, scope, owner, and consequence. The goal is not to argue but to distinguish a binding rule from an interpretation or preference. I document the confirmed boundary and only propose alternatives or escalation where the customer has authority to decide.',
    },
  },
  'Assess data readiness': {
    explanation: [
      'Data readiness is the degree to which required data is available, representative, understandable, lawful to use, timely, and accessible in the target workflow. Assess actual samples and lineage, profile completeness and distributions, identify labels and join keys, and trace who produces, changes, and owns each field.',
      'Perform the assessment before promising model quality, automation rates, or migration dates. Detailed profiling costs time and may require sensitive access, so begin with the fields and cases that drive the outcome, then expand when early evidence shows material gaps or bias.',
    ],
    whyItMatters: 'A solution cannot compensate indefinitely for missing identifiers, delayed feeds, inconsistent labels, or prohibited use. Early evidence about data turns hidden delivery risk into concrete remediation, scope, and validation decisions.',
    useCases: [
      'Checking whether historical support resolutions are consistent enough to evaluate recommendations',
      'Profiling invoice fields and exception rates before committing to extraction automation',
      'Verifying that source systems share a reliable customer key for integration',
    ],
    workedExample: {
      scenario: 'A lender wants to predict which applications will need manual review using three years of application history.',
      steps: [
        'Sample records across products, regions, time periods, approvals, declines, and manually reviewed cases rather than using only recent successful applications.',
        'Profile missingness, schema changes, outcome-label timing, duplicate applicants, and leakage from fields created after the review decision.',
        'Confirm permitted use and retention with governance, then define remediation and an evaluation split based on decision time.',
      ],
      result: 'The team removes a post-decision leakage field, discovers one region has incomplete outcomes, and narrows the first release to products with representative and governed data.',
    },
    interview: {
      prompt: 'What evidence would you require before calling a customer dataset ready for an AI workflow?',
      answer: 'I would require representative samples, field definitions and lineage, measured quality and missingness, valid labels or evaluation outcomes, temporal correctness, access and use approval, and a plan for ongoing freshness and drift. A large row count alone says little about whether the data supports the intended decision.',
    },
  },
  'Separate requirement types': {
    explanation: [
      'Requirements become testable when separated into functional behavior, quality attributes, constraints, data rules, operational needs, and rollout or transition needs. For each requirement, record its source, priority, acceptance evidence, dependencies, and unresolved decisions instead of mixing goals and implementation ideas in one feature list.',
      'Use this classification during discovery and proposal review because each type drives different design and verification work. Too much taxonomy can slow a small engagement, so use only categories that expose tradeoffs, such as distinguishing what the system must do from how reliably, securely, and operably it must do it.',
    ],
    whyItMatters: 'A feature can pass its happy-path demonstration while failing the customer because retention, recovery, access control, or migration was never specified. Separating requirement types makes those obligations visible and assigns them suitable acceptance tests.',
    useCases: [
      'Distinguishing invoice approval behavior from latency and audit-retention targets',
      'Recording data residency as a constraint rather than an optional product feature',
      'Capturing rollback and support ownership alongside a new integration requirement',
    ],
    workedExample: {
      scenario: 'A customer asks for automatic contract review before documents enter its procurement system.',
      steps: [
        'Write functional requirements for document intake, clause detection, reviewer override, and procurement handoff.',
        'Record quality requirements for detection accuracy and latency, constraints for residency and document types, and operational requirements for audit, replay, and support.',
        'Attach a verification method and owner to each requirement, then identify conflicts such as detailed audit retention versus data minimization.',
      ],
      code: {
        language: 'Text',
        code: `Functional: route flagged clauses to legal review.
Quality: return a review result within 60 seconds at p95.
Constraint: source documents remain in the customer region.
Operational: authorized support can replay a failed review with an audit record.`,
      },
      result: 'The proposal covers the full operating contract of the workflow, and architecture decisions can be traced to explicit behavior, quality, compliance, and support needs.',
    },
    interview: {
      prompt: 'Why not keep all requirements in one prioritized backlog?',
      answer: 'They can share a backlog, but their types should remain visible because they shape different decisions and evidence. Functional stories do not automatically express latency, recovery, governance, or migration obligations. Classification exposes conflicts and ensures acceptance covers more than the visible happy path.',
    },
  },
  'Control scope': {
    explanation: [
      'Scope control defines the smallest coherent outcome a delivery phase will prove, along with explicit exclusions, assumptions, interfaces, and change rules. Break the outcome into capabilities, rank them by value and uncertainty, and defer work that does not contribute to the phase decision or an essential operational guardrail.',
      'Apply scope control continuously as discovery creates new requests. A narrow scope accelerates evidence but can produce an unusable demonstration if end-to-end needs are omitted, so preserve one complete customer journey and its safety requirements while reducing variants, integrations, and polish that are not needed to learn.',
    ],
    whyItMatters: 'FDE engagements operate under fixed customer attention and delivery windows. Controlled scope protects the outcome from becoming a collection of partially finished requests and gives both parties a transparent way to trade new work against time, risk, or existing commitments.',
    useCases: [
      'Limiting a pilot to one document type while preserving the complete review workflow',
      'Deferring secondary CRM integrations until the primary integration proves adoption',
      'Using a change log to trade a new approval rule against planned reporting work',
    ],
    workedExample: {
      scenario: 'During a six-week support automation pilot, the customer asks to add five languages, voice calls, and analytics exports.',
      steps: [
        'Restate the pilot decision: whether assisted resolution reduces handling time for English billing chats without lowering quality.',
        'Estimate how each request affects that decision, delivery effort, data readiness, and operational risk.',
        'Keep English chat and required supervisor review in scope, defer voice and four languages, and replace a low-value custom export with the one metric feed needed for evaluation.',
      ],
      result: 'The pilot still delivers an operable end-to-end workflow and enough evidence for an expansion decision within six weeks, with deferred requests recorded rather than silently rejected.',
    },
    interview: {
      prompt: 'How do you narrow scope without delivering a toy proof that cannot inform a customer decision?',
      answer: 'I preserve a thin end-to-end path for the real user, real data boundary, and essential safety and operational controls. I reduce breadth such as extra segments, integrations, and edge variants. Every retained item must support the target outcome or remove a critical uncertainty, and exclusions are explicit.',
    },
  },
  'Set success measures': {
    explanation: [
      'Success measures convert the desired outcome into observable definitions with a baseline, target, population, time window, data source, and owner. Include a primary outcome, leading adoption or process indicators, and guardrails for quality, reliability, cost, and risk so improvement in one dimension cannot conceal harm in another.',
      'Set measures before the implementation influences behavior or data collection. More measures provide context but dilute decisions and invite selective reporting, so choose a small decision set, define how each is calculated, and state what result leads to expand, revise, or stop.',
    ],
    whyItMatters: 'Without pre-agreed measures, a customer pilot can be declared successful because a demo looked good or unsuccessful because expectations changed. Measurable decision rules make results credible and direct the next investment.',
    useCases: [
      'Evaluating whether an agent-assist tool reduces handle time without increasing reopen rate',
      'Measuring automation rate alongside correction cost for document extraction',
      'Setting adoption and reliability thresholds for expanding a workflow to more regions',
    ],
    workedExample: {
      scenario: 'A retailer pilots product-description generation for 2,000 catalog items.',
      steps: [
        'Measure the current editor time per accepted description, first-pass acceptance, policy rejection, and publication throughput.',
        'Set targets of 40 percent lower median editor time and 70 percent first-pass acceptance, with policy violations below 0.5 percent and no increase in return-related complaints.',
        'Instrument the review workflow and predefine that expansion requires all guardrails plus the time target over four representative weeks.',
      ],
      result: 'The pilot yields a defensible expansion decision based on editor productivity and customer-risk guardrails rather than raw generation volume.',
    },
    interview: {
      prompt: 'Why should success measures include both an outcome and guardrails?',
      answer: 'Optimizing one metric can shift cost or harm elsewhere. Faster handling may reduce quality, and higher automation may increase incorrect decisions. The outcome captures intended value; guardrails define unacceptable tradeoffs. Together they make the success condition operationally and ethically meaningful.',
    },
  },
  'Confirm understanding': {
    explanation: [
      'Confirming understanding turns discovery notes into a shared, testable model of the problem. Summarize the actors, current workflow, desired outcome, constraints, requirements, measures, assumptions, and open decisions in concrete language, then ask stakeholders to correct specific statements and examples.',
      'Do this at meaningful discovery checkpoints and before architecture or delivery commitments. Formal confirmation reduces ambiguity but can create false certainty if stakeholders approve a dense document without engagement, so use diagrams, scenarios, playback sessions, and decision logs that make disagreements easy to expose.',
    ],
    whyItMatters: 'Customer and delivery teams often use the same words for different concepts. Playback catches those differences while correction is cheap and creates a stable basis for scope, design, and acceptance.',
    useCases: [
      'Walking through an exception scenario before finalizing workflow automation',
      'Confirming which system owns customer identity and conflict resolution',
      'Validating scope exclusions and pilot decision criteria with sponsors and operators',
    ],
    workedExample: {
      scenario: 'After discovery for a hospital referral workflow, the team believes a referral is complete when it reaches scheduling.',
      steps: [
        'Present a one-page workflow with actors, system boundaries, normal flow, exception paths, measures, and unresolved ownership questions.',
        'Walk through one routine referral and one missing-insurance case using real but de-identified examples.',
        'Ask each owner to correct the model and record the decision that completion means a booked appointment, not arrival in the scheduling queue.',
      ],
      result: 'The corrected definition changes the required integration and success metric before implementation, avoiding a system that would have reported incomplete referrals as successful.',
    },
    interview: {
      prompt: 'Is sending meeting notes for approval enough to confirm understanding?',
      answer: 'It can provide a record, but passive approval often misses semantic differences. I prefer an active playback using workflows, examples, exceptions, and explicit decisions, with named owners asked to correct the model. The goal is demonstrated shared meaning, not merely the absence of comments.',
    },
  },
  'Context map': {
    explanation: [
      'A context map shows the solution boundary and the people, systems, data stores, and external services that exchange information with it. It names each relationship, direction, ownership, protocol or interaction, and trust boundary so the team can reason about dependencies before choosing internal components.',
      'Create it early, then update it as discovery changes scope or ownership. A simple map improves alignment, but excessive infrastructure detail obscures the business boundary; keep internal deployment topology in lower-level diagrams and show only relationships that affect responsibility, data, availability, or security.',
    ],
    whyItMatters: 'Many customer delivery failures occur at ownership and integration boundaries rather than inside the new service. A context map makes those boundaries reviewable by technical and nontechnical stakeholders and exposes missing owners or assumptions.',
    useCases: [
      'Clarifying which system is authoritative for customer and entitlement data',
      'Showing external dependencies and trust boundaries for a security review',
      'Aligning customer and vendor teams on who initiates each integration exchange',
    ],
    workedExample: {
      scenario: 'A customer is introducing a case-triage service between email intake and its existing case-management platform.',
      steps: [
        'Place the triage service at the center and add agents, email gateway, identity provider, case platform, model endpoint, and audit archive around it.',
        'Label each exchange with direction, data category, protocol, and owning team, and mark trust boundaries.',
        'Review the map with security and operations to resolve who owns failed case creation and which system is authoritative for case status.',
      ],
      code: {
        language: 'Mermaid',
        code: `flowchart LR
  Mail[Email gateway] -->|message| Triage[Triage service]
  Triage -->|case draft| Cases[Case platform]
  Agent[Support agent] -->|review| Triage
  Triage -->|audit event| Archive[Audit archive]`,
      },
      result: 'The map exposes an unowned failure path between triage and case creation, leading the customer platform team to own retries and reconciliation before build begins.',
    },
    interview: {
      prompt: 'What should a context map communicate that a deployment diagram does not?',
      answer: 'A context map emphasizes system purpose, external actors, ownership, information exchange, and trust boundaries. A deployment diagram explains where components run and connect at runtime. The context map should remain understandable without internal infrastructure detail and should clarify who depends on whom.',
    },
  },
  'Integration pattern': {
    explanation: [
      'An integration pattern defines how systems exchange commands, events, queries, or files and how they handle timing, identity, retries, ordering, and failure. Select among synchronous requests, asynchronous messaging, events, batches, and change capture based on the business interaction rather than defaulting to the technology already familiar to the team.',
      'Synchronous calls simplify immediate responses but couple availability and latency; asynchronous flows absorb bursts and isolate failures but require idempotency, durable state, and eventual-consistency handling. The right pattern follows customer timing, ownership, volume, and recovery needs, and may combine approaches at different boundaries.',
    ],
    whyItMatters: 'The integration mechanism determines how customer workflows behave when dependencies are slow, unavailable, duplicated, or out of order. Choosing deliberately prevents reliability surprises and makes operational responsibility explicit.',
    useCases: [
      'Using a synchronous query when an agent needs an immediate account balance',
      'Publishing an event when several downstream systems react independently to an order',
      'Processing a governed nightly file when the source cannot support an online API',
    ],
    workedExample: {
      scenario: 'A retailer needs confirmed web orders sent to fulfillment, which experiences occasional ten-minute outages during maintenance.',
      steps: [
        'Define the business requirement that checkout confirmation must not depend on immediate fulfillment availability.',
        'Choose durable asynchronous order-created messages with an idempotency key, retry policy, dead-letter path, and visible fulfillment status.',
        'Run failure tests for duplicate delivery, delayed consumption, poison messages, and recovery after the fulfillment service returns.',
      ],
      result: 'Checkout remains available during fulfillment maintenance, and every accepted order is either processed once logically or appears in a recoverable exception queue.',
    },
    interview: {
      prompt: 'When is asynchronous messaging a poor choice despite improving availability?',
      answer: 'It is a poor fit when the caller needs an immediate authoritative answer before proceeding, when eventual state would violate the workflow, or when the organization cannot operate retries and reconciliation. Messaging shifts complexity into state, idempotency, ordering, and support; it does not remove failure handling.',
    },
  },
  'Data flow': {
    explanation: [
      'A data flow traces information from collection through validation, transformation, storage, use, sharing, retention, and deletion. For each movement, record fields or classifications, purpose, format, owner, trust boundary, protection, and failure behavior so the design reflects the full data lifecycle rather than only API connectivity.',
      'Map flows when integrating customer systems, handling regulated data, or changing data ownership. Detailed field-level mapping improves governance but can become expensive, so begin with sensitive and decision-critical data, then deepen the map where transformations, access, or retention create material risk.',
    ],
    whyItMatters: 'A solution can meet functional requirements while copying sensitive data unnecessarily, losing lineage, or leaving failed transformations invisible. An explicit flow supports privacy, security, correctness, debugging, and deletion obligations across system boundaries.',
    useCases: [
      'Tracing customer transcripts from ingestion through model processing and retention',
      'Defining transformations and reconciliation for an ERP-to-warehouse pipeline',
      'Showing where personal data crosses regional or organizational trust boundaries',
    ],
    workedExample: {
      scenario: 'A benefits provider wants to classify employee documents and send extracted fields into a claims platform.',
      steps: [
        'Inventory document content and extracted fields, classifying identity, health, and operational metadata separately.',
        'Trace upload, malware scan, extraction, human review, claims write, audit event, retention, and deletion with owners and encryption boundaries.',
        'Remove raw-document logging, define failed-record quarantine, and add reconciliation between accepted documents and claims records.',
      ],
      result: 'The design keeps raw documents only in approved storage, sends the minimum reviewed fields to claims, and provides a measurable path for detecting and recovering missing writes.',
    },
    interview: {
      prompt: 'What questions should a data-flow review answer at every system boundary?',
      answer: 'It should answer what data moves, why it is needed, who owns and may access it, how identity and integrity are preserved, what transformation occurs, where it is stored, how failure is detected and recovered, and when the data is retained or deleted.',
    },
  },
  'Build versus buy': {
    explanation: [
      'A build-versus-buy decision compares the lifetime fit of custom implementation, a managed product, and hybrid options against the customer outcome. Evaluate differentiation, functional coverage, integration effort, security and compliance, operability, vendor health, lock-in, skills, time to value, and total cost across adoption and change.',
      'Buy when a capability is commodity and a product meets critical constraints; build when the capability differentiates the customer or available products cannot meet essential needs. Buying reduces initial engineering but adds licensing and dependency risk, while building offers control but creates permanent maintenance and support obligations.',
    ],
    whyItMatters: 'The fastest prototype is not always the fastest sustainable solution. A structured comparison prevents teams from underpricing custom ownership or selecting a product whose gaps later require fragile customization.',
    useCases: [
      'Comparing a managed document extraction service with a custom model pipeline',
      'Deciding whether to purchase workflow orchestration or extend an internal platform',
      'Choosing a hybrid approach that buys identity verification but builds domain decisions',
    ],
    workedExample: {
      scenario: 'A legal-services customer needs contract clause extraction for six agreement types within four months.',
      steps: [
        'Weight criteria with the customer: extraction quality, regional processing, reviewer workflow, integration effort, four-month delivery, and three-year cost.',
        'Test two products and one custom baseline on the same representative document set, including tables, scans, and rare clauses.',
        'Estimate implementation, licensing, monitoring, retraining, migration, and exit costs, then record assumptions and sensitivity to volume.',
        'Select a hybrid design using a managed extraction service with a customer-owned review and rules layer.',
      ],
      result: 'The customer reaches the deadline with acceptable extraction quality while retaining control over its differentiating review policy and an exit path through stored annotations.',
    },
    interview: {
      prompt: 'Why is license price insufficient for a build-versus-buy decision?',
      answer: 'The decision depends on total lifecycle cost and fit. A product can require integration, customization, governance, operational training, price-escalation tolerance, and migration work. Custom software also carries support, security, staffing, and evolution costs. Compare options against weighted requirements and realistic ownership periods.',
    },
  },
  'Nonfunctional fit': {
    explanation: [
      'Nonfunctional fit measures whether a solution meets required qualities such as availability, latency, throughput, scalability, security, privacy, accessibility, maintainability, portability, recovery, and supportability. Express each relevant quality as a scenario with a stimulus, operating condition, measurable response, and acceptance threshold.',
      'Assess fit against peak and degraded conditions, not only a happy-path demonstration. Stronger qualities often increase cost or reduce design freedom, so prioritize those tied to customer harm and test the riskiest assumptions rather than assigning arbitrary high targets to every category.',
    ],
    whyItMatters: 'A solution that performs the correct function can still be unusable if it misses a cutoff, cannot recover, violates policy, or overwhelms operators. Nonfunctional fit connects architecture choices to the conditions under which the customer must rely on the system.',
    useCases: [
      'Validating p95 response time under the customer\'s peak concurrent load',
      'Testing recovery point and recovery time for a critical workflow store',
      'Confirming auditability and regional isolation before handling regulated records',
    ],
    workedExample: {
      scenario: 'A travel customer needs a rebooking service that will be used heavily during weather disruptions.',
      steps: [
        'Define peak arrival rate, p95 decision latency, availability, stale-data tolerance, and recovery targets for disruption mode.',
        'Load test with realistic dependency delays and failures while measuring queue age, saturation, retries, and completed rebookings.',
        'Compare results with thresholds and revise capacity, backpressure, and degraded-mode behavior for unavailable partner inventory.',
      ],
      result: 'The service meets normal demand but fails the disruption scenario, so the team adds bounded queues and a degraded offer path before customer rollout.',
    },
    interview: {
      prompt: 'How do you turn a vague requirement such as the system must be scalable into something designable?',
      answer: 'Define the expected workload shape, growth horizon, peak conditions, response thresholds, scaling time, and cost or resource limits. Then test a representative scenario and state what degradation is acceptable. Scalability becomes useful when it constrains a measurable response under named conditions.',
    },
  },
  'Migration strategy': {
    explanation: [
      'A migration strategy defines how users, data, traffic, and operating responsibility move from the current system to the target while service continues. Choose among phased cohorts, parallel run, strangler replacement, canary traffic, or a coordinated cutover based on coupling, reversibility, data consistency, and customer tolerance for transition.',
      'Plan inventory, transformation, validation, rehearsal, freeze windows, rollback, reconciliation, communications, and retirement together. Parallel operation and phased rollout reduce blast radius but extend cost and dual-system complexity; a big-bang cutover is shorter but demands stronger rehearsal and recovery because more assumptions change at once.',
    ],
    whyItMatters: 'Most migration risk lies in transition states rather than the final architecture. A strategy makes partial movement, inconsistent data, rollback limits, and ownership changes explicit before live customer operations depend on them.',
    useCases: [
      'Moving customer cohorts from a legacy case platform in controlled waves',
      'Running old and new scoring pipelines in shadow mode before switching decisions',
      'Using a strangler pattern to replace one legacy API capability at a time',
    ],
    workedExample: {
      scenario: 'A subscription business must migrate 800,000 active contracts to a new billing platform without missing renewals.',
      steps: [
        'Inventory contract variants and define transformation, validation, reconciliation, and rollback rules for each cohort.',
        'Run historical migrations and a shadow renewal cycle, comparing amounts, dates, taxes, and failures against the legacy system.',
        'Move low-risk cohorts first behind a routing control, monitor renewal outcomes, and pause automatically when reconciliation exceeds tolerance.',
        'Retire legacy writes only after all cohorts pass a full billing cycle and audit evidence is complete.',
      ],
      result: 'The customer moves contracts in reversible stages, catches a regional tax mapping gap in a low-risk cohort, and avoids exposing the full renewal population.',
    },
    interview: {
      prompt: 'What determines whether a migration can be rolled back?',
      answer: 'Rollback depends on whether old and new systems can still interpret current data, whether writes can be reconciled in both directions, and whether irreversible external actions have occurred. A switch alone is not rollback. The plan must identify the recovery point, data repair, traffic routing, and business consequences for each stage.',
    },
  },
  'Proof of concept': {
    explanation: [
      'A proof of concept is a time-boxed experiment designed to resolve a specific high-risk uncertainty with representative evidence. State the hypothesis, acceptance threshold, test data and environment, fixed constraints, and decision that follows before implementation; build only enough to make that test credible.',
      'Use a proof of concept for feasibility questions such as quality, latency, integration access, or operator interaction, not as an undocumented shortcut to production. Narrow experiments accelerate learning but omit hardening, scale, security, and support unless those are the uncertainty under test, so clearly label what the result does and does not prove.',
    ],
    whyItMatters: 'A focused experiment can invalidate an expensive architecture or vendor choice before full delivery. Its value comes from reducing decision uncertainty, not from producing impressive demo code that quietly becomes a production dependency.',
    useCases: [
      'Testing extraction quality on representative damaged and multilingual documents',
      'Verifying that a legacy API can sustain required throughput within its quotas',
      'Comparing two retrieval approaches on customer-defined answer-quality cases',
    ],
    workedExample: {
      scenario: 'A utilities customer needs to know whether free-form technician notes can identify likely equipment fault categories.',
      steps: [
        'Define the hypothesis that the top three suggestions include the reviewed fault category for at least 85 percent of eligible notes.',
        'Create a time-split, de-identified sample covering common, rare, short, and ambiguous notes, with labels reviewed by technicians.',
        'Build the smallest classification pipeline, measure top-three recall by category, and review false positives with users.',
        'Record the result, limitations, production gaps, and the decision to proceed only for high-support categories.',
      ],
      result: 'The experiment reaches 89 percent overall but performs poorly on rare transformer faults, supporting a constrained assistive rollout instead of unsupported full automation.',
    },
    interview: {
      prompt: 'How do you prevent a proof of concept from becoming an unsafe production system?',
      answer: 'Define its decision purpose and exclusions before building, isolate it from production authority and sensitive data where possible, and produce an explicit gap assessment for security, reliability, scale, operations, and governance. Reuse should require those gaps to be designed and validated, not assumed away because the demo worked.',
    },
  },
  'Risk register': {
    explanation: [
      'A risk register is a living set of uncertain events or conditions that could affect the customer outcome. Each entry should state cause, event, consequence, likelihood, impact, leading indicator, owner, mitigation, contingency, and review date so risk becomes a managed decision rather than a vague concern.',
      'Start the register during discovery and review it at delivery milestones, adding evidence and closing obsolete items. Scoring helps prioritize but can create false precision, so use consistent bands, highlight assumptions and interconnected risks, and focus discussion on exposure, mitigation effectiveness, and triggers.',
    ],
    whyItMatters: 'FDE work combines technical, customer, vendor, data, and adoption uncertainty. A visible register directs scarce validation effort toward the threats most likely to change scope, architecture, schedule, or customer value.',
    useCases: [
      'Tracking uncertainty about customer data quality before a model pilot',
      'Managing dependency on a vendor API with an unconfirmed quota increase',
      'Preparing a fallback when frontline adoption may miss the pilot threshold',
    ],
    workedExample: {
      scenario: 'A bank plans a six-week transaction-review pilot that depends on production-like data approval and a vendor screening API.',
      steps: [
        'Workshop risks across data, integration, compliance, schedule, operations, and adoption with owners from both teams.',
        'Score exposure and record evidence, indicators, mitigations, and contingencies for the highest items.',
        'Assign the data owner to secure approval by week one and schedule an API load test before committing the rollout date.',
        'Review triggers twice weekly and activate synthetic-data or reduced-volume contingencies when dates are missed.',
      ],
      code: {
        language: 'Text',
        code: `Risk: production-like data approval is delayed
Impact: pilot evaluation cannot represent real fraud patterns
Indicator: no governance decision by end of week 1
Mitigation: submit minimized field set with lineage and retention plan
Contingency: validate integration only; defer quality decision`,
      },
      result: 'The customer sees which assumptions threaten the pilot, and a missed approval date changes the declared decision scope instead of producing misleading quality claims.',
    },
    interview: {
      prompt: 'What makes a risk-register entry actionable?',
      answer: 'It names a specific uncertain cause, event, and consequence; has an accountable owner; identifies an observable trigger; and defines mitigation plus contingency. A label such as data risk is not actionable because nobody knows what evidence to gather or when to change course.',
    },
  },
  'Solution proposal': {
    explanation: [
      'A solution proposal connects verified customer outcomes and constraints to a recommended design, delivery plan, evidence, and decision. It should summarize the current problem, target measures, scope, architecture and data flows, requirement coverage, alternatives, risks, migration, operations, cost assumptions, and explicit approvals needed.',
      'Write the proposal after enough discovery to defend the recommendation but before expensive implementation makes change difficult. Detail builds confidence but can hide unresolved assumptions, so keep the main decision narrative concise, link supporting evidence, distinguish facts from estimates, and present tradeoffs and exclusions plainly.',
    ],
    whyItMatters: 'The proposal is the shared contract between customer intent and engineering execution. It lets decision makers evaluate whether the solution is valuable, feasible, governable, and operable before teams commit resources.',
    useCases: [
      'Seeking approval for a phased customer-service automation pilot',
      'Aligning security, operations, and product owners on an integration design',
      'Comparing a recommended architecture with lower-cost and lower-risk alternatives',
    ],
    workedExample: {
      scenario: 'A distributor wants to reduce manual order entry from emailed purchase orders and is ready to choose an implementation approach.',
      steps: [
        'Summarize the observed workflow, baseline handling time, data profile, primary outcome, guardrails, and constraints with links to evidence.',
        'Recommend extraction plus human review and ERP submission, showing the context, data flow, integration recovery, security, and operating model.',
        'Compare managed, custom, and hybrid options and explain why the hybrid option best meets the six-month outcome, regional, and support constraints.',
        'Define pilot scope, milestones, success gates, migration path, costs, risks, owner decisions, and conditions for expansion.',
      ],
      result: 'Customer leaders can approve a bounded pilot with known tradeoffs, while delivery teams have traceable requirements and gates rather than an open-ended instruction to automate order entry.',
    },
    interview: {
      prompt: 'What should a strong solution proposal enable a customer to decide?',
      answer: 'It should enable the customer to decide whether the recommended approach is worth pursuing now, given expected outcomes, alternatives, constraints, cost, risk, and operating responsibility. It must also identify remaining assumptions and the evidence or approvals needed before each commitment becomes irreversible.',
    },
  },
} satisfies Record<string, FdeLessonDetails>