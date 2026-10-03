import { fdeCustomerLessonDetails } from './fde-core-content-customer'
import { fdeDeliveryLessonDetails } from './fde-core-content-delivery'
import { fdePlatformLessonDetails } from './fde-core-content-platform'
import { fdeSystemsLessonDetails } from './fde-core-content-systems'
import type { FdeLessonDetails } from './fde-core-lesson-types'
import { systemDesignFundamentalsMasteryTopics } from './fde-core-mastery-system-design'
import {
  defineLearningPath,
  type LearningChapterSeed,
} from './learning-model'

const fdeLessonDetails: Readonly<Record<string, FdeLessonDetails>> = {
  ...fdeSystemsLessonDetails,
  ...fdePlatformLessonDetails,
  ...fdeCustomerLessonDetails,
  ...fdeDeliveryLessonDetails,
}

function addFdeLessonDetails(
  chapters: readonly LearningChapterSeed[],
): readonly LearningChapterSeed[] {
  return chapters.map((chapter) => ({
    ...chapter,
    examples: chapter.examples.map((example) => {
      if ('title' in example) {
        return example
      }

      const [title, principle] = example
      const details = fdeLessonDetails[title]

      return details ? { title, principle, ...details } : example
    }),
  }))
}

export const fdeCoreLearningPath = defineLearningPath({
  id: 'fde-system-delivery-core',
  title: 'FDE / System / Delivery Core',
  shortTitle: 'FDE & Delivery Core',
  description: 'Learn to shape ambiguous customer problems, design reliable systems, and deliver solutions into real environments.',
  accent: '#d6523c',
  audience: 'Forward Deployed Engineers and AI FDEs preparing for system, case, and client interviews.',
  recommendedFor: ['forward-deployed-engineer', 'ai-forward-deployed-engineer'],
  platforms: ['Turing', 'Andela', 'Toptal'],
  chapters: addFdeLessonDetails([
    {
      id: 'system-design-fundamentals',
      title: 'System Design Fundamentals',
      summary: 'Move from requirements to an operable design by estimating scale, defining boundaries, and planning for failure.',
      outcomes: ['Clarify functional and nonfunctional needs', 'Estimate scale', 'Defend an end-to-end design'],
      platformFocus: 'System-design interviews reward a structured conversation more than a memorized diagram.',
      masteryTopics: systemDesignFundamentalsMasteryTopics,
      examples: [
        ['Clarify the job', 'Requirements clarification turns a broad request into a precise system job with named users, outcomes, constraints, and exclusions.', 'For a notification system, ask who sends, who receives, and what delivery guarantee users need.'],
        ['Name quality attributes', 'Quality attributes are measurable targets for how well a system performs, including latency, availability, durability, security, and recovery.', 'Define P95 latency below 500 ms and 99.9% monthly availability.'],
        ['Estimate load', 'Load estimation uses simple arithmetic to approximate traffic, concurrency, bandwidth, and storage before choosing architecture.', 'Convert ten million daily events into average and peak events per second.'],
        ['Draw system boundaries', 'A system boundary shows what each component owns and where data, trust, or failure crosses into another system.', 'Place a webhook provider outside the trust boundary and your ingestion API inside it.'],
        ['Define the data model', 'A data model defines the durable facts, identities, relationships, states, and invariants a system must preserve.', 'Model delivery attempts separately from webhook events so every retry remains auditable.'],
        ['Design the API', 'An API is a behavioral contract for operations, identity, validation, errors, retries, concurrency, and completion.', 'Require an idempotency key when a client creates a payment.'],
        ['Load balancing & stateless services', 'A load balancer distributes traffic across healthy instances; stateless handlers let any instance safely serve the next request.', 'Move session state to a shared store before scaling API instances horizontally.'],
        ['Absorb bursts', 'A durable queue buffers temporary traffic spikes so producers can accept work faster than bounded consumers process it.', 'Buffer a campaign spike so workers deliver messages at a sustainable rate.'],
        ['Design failure paths', 'A failure path defines what users, services, and operators do when work times out, partially completes, or cannot continue.', 'Time out a pricing service, return a stale quote with a warning, and emit an alert.'],
      ],
    },
    {
      id: 'architecture',
      title: 'Architecture',
      summary: 'Choose boundaries and interaction styles that fit team, change, reliability, and operational constraints.',
      outcomes: ['Compare architecture styles', 'Control coupling', 'Record and evolve decisions'],
      platformFocus: 'Expect architecture deep-dives to test alternatives, downsides, and how a design changes over time.',
      examples: [
        ['Modular monolith', 'A well-bounded monolith can preserve simplicity while domains remain closely coordinated.', 'Keep billing and accounts as modules in one deployable until independent scaling is justified.'],
        ['Microservices', 'Services earn their cost when ownership or scaling must vary independently.', 'Extract document conversion because it scales differently and has a separate failure profile.'],
        ['Layered architecture', 'Layers separate interface, application policy, domain rules, and infrastructure.', 'Keep HTTP parsing out of the invoice calculation domain service.'],
        ['Hexagonal architecture', 'Ports protect core behavior from replaceable external adapters.', 'Expose a PaymentPort implemented by Stripe today and a sandbox fake in tests.'],
        ['Event-driven architecture', 'Events decouple producers from downstream reactions but introduce eventual consistency.', 'Publish OrderPlaced and let inventory and email handlers react independently.'],
        ['Architecture decision records', 'Record context, options, decision, and consequences while they are fresh.', 'Document why PostgreSQL was chosen over a document store for transactional inventory.'],
        ['Coupling and cohesion', 'Keep related behavior together and dependencies between units explicit.', 'Move discount rules into one pricing module rather than duplicate them across controllers.'],
        ['Contract evolution', 'Change shared contracts compatibly before removing old behavior.', 'Add an optional event field, migrate consumers, then make it required in a later version.'],
        ['Evolutionary architecture', 'Create fitness checks for properties the architecture must preserve.', 'Fail CI when a domain module imports a web framework adapter directly.'],
      ],
    },
    {
      id: 'distributed-systems',
      title: 'Distributed Systems',
      summary: 'Reason about partial failure, concurrency, time, duplication, and consistency across networked components.',
      outcomes: ['Choose consistency deliberately', 'Make operations retry-safe', 'Explain distributed failure modes'],
      platformFocus: 'Senior practical screens often probe retries, duplicate work, ordering, and unavailable dependencies.',
      examples: [
        ['CAP tradeoff', 'During a partition, a system must choose between immediate consistency and availability.', 'Reject inventory updates when quorum is unavailable rather than risk overselling.'],
        ['Consistency models', 'Select consistency by the user-visible invariant, not habit.', 'Use strong consistency for balance transfers but eventual consistency for analytics dashboards.'],
        ['Replication', 'Replication improves availability and reads while creating lag and failover complexity.', 'Send profile reads to replicas but route a just-updated profile read to the primary.'],
        ['Partitioning', 'A partition key determines load distribution and cross-partition work.', 'Partition events by tenant while protecting against one oversized tenant.'],
        ['Idempotent consumers', 'A repeated message should not repeat its business effect.', 'Record processed payment event IDs before applying account credit.'],
        ['Retry discipline', 'Retries need bounded attempts, exponential delay, jitter, and safe operations.', 'Retry a timed-out object read but dead-letter a permanently invalid event.'],
        ['Delivery semantics', 'At-least-once delivery is practical when consumers deduplicate effects.', 'Accept duplicate queue messages and guard order creation with an operation key.'],
        ['Leases and ownership', 'Time-bounded leases coordinate work without assuming a worker lives forever.', 'Let a crashed worker’s job become claimable after its lease expires.'],
        ['Time and ordering', 'Wall clocks differ, so order important events with versions or logical sequence.', 'Use an entity version to reject an older profile update that arrives late.'],
      ],
    },
    {
      id: 'cloud',
      title: 'Cloud',
      summary: 'Select managed infrastructure by workload shape, security boundary, resilience, and total operational cost.',
      outcomes: ['Choose cloud primitives', 'Design identity and networking', 'Balance resilience with cost'],
      platformFocus: 'Cloud questions are usually scenario-based: choose services, state assumptions, and explain operational tradeoffs.',
      examples: [
        ['Regions and zones', 'Zones reduce datacenter failure risk; regions address larger outages and data locality.', 'Run API replicas across three zones and maintain a tested cross-region recovery plan.'],
        ['Compute choice', 'Choose functions, containers, or VMs by runtime, control, scaling, and workload duration.', 'Use a scheduled function for short nightly cleanup and containers for a long-running worker.'],
        ['Storage choice', 'Match object, relational, key-value, and block storage to access and consistency needs.', 'Keep documents in object storage and their searchable metadata in PostgreSQL.'],
        ['Virtual networking', 'Subnets, routing, and private endpoints constrain how resources communicate.', 'Reach the database through a private network path instead of exposing a public endpoint.'],
        ['Cloud identity', 'Workload identities remove long-lived credentials from applications.', 'Grant a service identity read access to one secrets collection.'],
        ['Managed services', 'Managed services trade control and portability for reduced operational work.', 'Choose a managed queue when the team cannot own broker patching and failover.'],
        ['Autoscaling', 'Scale on a signal that represents pending work or user pressure.', 'Scale workers from queue depth rather than CPU when they mostly wait on APIs.'],
        ['Cost awareness', 'Estimate cost from traffic, retention, data transfer, and idle capacity.', 'Reduce high-cardinality logs after calculating their monthly ingestion cost.'],
        ['Disaster recovery', 'Recovery point and time objectives drive backup and failover design.', 'Use hourly backups for a one-hour RPO and rehearse restoration within the four-hour RTO.'],
      ],
    },
    {
      id: 'docker-deployment',
      title: 'Docker & Deployment',
      summary: 'Package reproducible services and release them with health checks, progressive exposure, and rollback.',
      outcomes: ['Build production images', 'Design safe pipelines', 'Operate releases confidently'],
      platformFocus: 'Take-homes and project reviews frequently assess Dockerfiles, CI/CD, release safety, and run instructions.',
      examples: [
        ['Container images', 'An image should contain the app and runtime while remaining deterministic and minimal.', 'Pin a slim runtime base image and install only production dependencies.'],
        ['Multi-stage builds', 'Build tools can stay in an earlier stage and out of the runtime image.', 'Compile TypeScript in one stage and copy only output plus runtime dependencies.'],
        ['Layer caching', 'Order stable dependency steps before frequently changing source files.', 'Copy the lockfile and install packages before copying application code.'],
        ['Configuration and secrets', 'Inject environment-specific configuration at runtime and never bake secrets into images.', 'Supply the database URL through the deployment secret store.'],
        ['Local composition', 'A compose file documents and starts the dependencies needed for local development.', 'Run the API, PostgreSQL, and a queue with health-based startup dependencies.'],
        ['CI/CD pipeline', 'A pipeline should build once, verify, promote the same artifact, and record provenance.', 'Test an image, scan it, then promote its immutable digest to production.'],
        ['Progressive rollout', 'Canary or blue-green rollout limits exposure while signals are observed.', 'Send five percent of traffic to the new version before expanding.'],
        ['Rollback', 'Define automated rollback signals and preserve backward compatibility.', 'Revert when error rate breaches the threshold while both versions understand the expanded schema.'],
        ['Health probes', 'Readiness controls traffic; liveness decides whether a process should restart.', 'Fail readiness during database warmup without causing a restart loop.'],
      ],
    },
    {
      id: 'security',
      title: 'Security',
      summary: 'Identify threats, minimize trust, and layer controls across identity, data, code, and operations.',
      outcomes: ['Threat-model a workflow', 'Apply least privilege', 'Protect tenant and customer data'],
      platformFocus: 'Security appears as constraints inside architecture and customer scenarios rather than only as isolated trivia.',
      examples: [
        ['Threat modeling', 'Map assets, actors, entry points, trust boundaries, and likely abuse.', 'Model forged webhook requests crossing from the public internet into order processing.'],
        ['Authentication', 'Use established identity protocols and validate issuer, audience, signature, and expiry.', 'Validate an OIDC access token before accepting an enterprise API request.'],
        ['Authorization', 'Enforce permission at the resource boundary, not only in the interface.', 'Check tenant ownership before returning an invoice by ID.'],
        ['Least privilege', 'Grant each person and workload only the actions and scope it requires.', 'Give the export worker read-only access to the reporting replica.'],
        ['Secret management', 'Store, rotate, scope, and audit secrets outside source and images.', 'Load an API key from a secret manager and rotate it without rebuilding.'],
        ['Encryption', 'Protect data in transit and at rest while managing keys separately.', 'Require TLS for database connections and use a managed customer key for sensitive archives.'],
        ['Application attacks', 'Validate input and use safe APIs against injection and request forgery.', 'Parameterize a customer search query instead of concatenating SQL.'],
        ['Tenant isolation', 'Carry tenant context through authentication, queries, queues, and storage.', 'Include tenant_id in every data access predicate and verify it in tests.'],
        ['Audit and response', 'Record sensitive actions and define containment, investigation, and notification steps.', 'Audit role changes with actor and timestamp, then alert on unexpected administrator grants.'],
      ],
    },
    {
      id: 'observability',
      title: 'Observability',
      summary: 'Instrument systems so teams can understand behavior, detect impact, and diagnose failures quickly.',
      outcomes: ['Design useful telemetry', 'Define service objectives', 'Run evidence-led incidents'],
      platformFocus: 'Strong answers tie telemetry to customer impact and an explicit response, not a list of tools.',
      examples: [
        ['Structured logs', 'Logs capture discrete events with searchable context.', 'Log delivery_id, tenant_id, attempt, and result for each webhook attempt.'],
        ['Metrics', 'Metrics summarize rates, levels, and distributions efficiently.', 'Track request count, error count, and a latency histogram by endpoint.'],
        ['Distributed traces', 'Traces connect timing and causality across service boundaries.', 'Follow one order from HTTP request through queue publication and worker processing.'],
        ['SLIs and SLOs', 'An SLI measures user-visible reliability; an SLO sets its target.', 'Measure successful checkout responses under two seconds with a 99.9% monthly target.'],
        ['Actionable alerts', 'Alert on meaningful customer risk with an owner and response path.', 'Page when error-budget burn predicts the monthly SLO will be exhausted.'],
        ['Dashboards', 'A dashboard should answer service health, impact, and likely location at a glance.', 'Show traffic, errors, latency, saturation, and top affected tenants.'],
        ['Correlation context', 'Propagate stable identifiers across logs, traces, messages, and support reports.', 'Carry the request ID into every async job created by the request.'],
        ['Telemetry cost', 'Control volume, retention, and cardinality without losing diagnostic value.', 'Sample successful traces but retain every failed or unusually slow trace.'],
        ['Incident learning', 'Use the timeline and evidence to improve detection, response, and prevention.', 'After a queue outage, add backlog age alerts and a documented drain procedure.'],
      ],
    },
    {
      id: 'customer-discovery',
      title: 'Customer Discovery',
      summary: 'Uncover the real workflow, desired outcome, constraints, and decision process before proposing technology.',
      outcomes: ['Run a discovery conversation', 'Separate needs from requested features', 'Define measurable success'],
      platformFocus: 'FDE case interviews frequently begin with an intentionally vague customer request.',
      examples: [
        ['Map stakeholders', 'Identify users, buyers, approvers, operators, and people affected by change.', 'Separate warehouse operators who use routing from executives who fund it.'],
        ['Define the outcome', 'Ask what changes in the business if the project succeeds.', 'Translate “add AI” into reducing average ticket resolution time by 25%.'],
        ['Observe the current workflow', 'Understand today’s steps, handoffs, systems, and workarounds.', 'Trace how a damaged shipment moves from driver report to customer refund.'],
        ['Surface constraints', 'Ask about policy, timing, budget, geography, risk, and existing commitments.', 'Learn that health data cannot leave a private network before proposing a hosted model.'],
        ['Assess data readiness', 'Locate sources, owners, quality issues, access, and historical coverage.', 'Sample support tickets and discover that resolution labels are missing.'],
        ['Separate requirement types', 'Distinguish must-have behavior from quality attributes and preferences.', 'Record auditability as mandatory while treating dashboard styling as negotiable.'],
        ['Control scope', 'Define a narrow first outcome and explicitly defer adjacent asks.', 'Pilot one warehouse and two exception types before automating the entire network.'],
        ['Set success measures', 'Pair business metrics with technical and adoption measures.', 'Track rerouting savings, recommendation acceptance, and API latency.'],
        ['Confirm understanding', 'End discovery with a concise playback of goals, constraints, decisions, and unknowns.', 'Send a recap that names the pilot scope, owners, data access, risks, and next decision.'],
      ],
    },
    {
      id: 'solution-architecture',
      title: 'Solution Architecture',
      summary: 'Translate customer context into an implementable solution spanning systems, data, migration, and operations.',
      outcomes: ['Map customer and product systems', 'Design integrations and migration', 'Present risks and options'],
      platformFocus: 'Customer case rounds test whether a technically sound design can actually fit the client environment.',
      examples: [
        ['Context map', 'Show users, systems of record, external services, and ownership boundaries.', 'Map CRM, billing, identity provider, data warehouse, and the proposed service.'],
        ['Integration pattern', 'Choose synchronous, asynchronous, batch, or file exchange by workflow needs.', 'Use nightly batch for historical backfill and events for new order updates.'],
        ['Data flow', 'Trace origin, validation, transformation, storage, use, and retention.', 'Follow patient documents from upload through OCR, indexing, retrieval, and deletion.'],
        ['Build versus buy', 'Compare differentiation, time, integration, control, and lifecycle cost.', 'Buy enterprise SSO but build the customer-specific approval workflow.'],
        ['Nonfunctional fit', 'Make scale, latency, availability, compliance, and support part of the design.', 'Keep the system inside the required region and define a one-hour recovery target.'],
        ['Migration strategy', 'Move data and traffic incrementally with reconciliation and rollback.', 'Backfill accounts, dual-write updates, compare results, then switch reads.'],
        ['Proof of concept', 'Use a proof to retire the highest-risk assumption with a clear exit criterion.', 'Test whether the legacy ERP can sustain required reads before designing the full integration.'],
        ['Risk register', 'Name probability, impact, owner, mitigation, and trigger for major risks.', 'Track delayed security approval with an owner and a date that threatens launch.'],
        ['Solution proposal', 'Present outcome, scope, architecture, plan, tradeoffs, cost, and decisions needed.', 'Offer a pilot and full-rollout option with explicit assumptions and success gates.'],
      ],
    },
    {
      id: 'delivery-fde',
      title: 'Delivery / FDE',
      summary: 'Drive an uncertain customer project from first plan through adoption, operation, and sustainable handoff.',
      outcomes: ['Plan and de-risk delivery', 'Manage scope and stakeholders', 'Create adoption and handoff'],
      platformFocus: 'Matching and client interviews look for end-to-end ownership under imperfect conditions.',
      examples: [
        ['Outcome-based plan', 'Plan around validated outcomes and decision points, not only implementation tasks.', 'Make “operators complete one live route with recommendations” the pilot milestone.'],
        ['Milestones', 'Each milestone should produce reviewable evidence and reduce uncertainty.', 'Deliver a real-data retrieval demo before building the final interface.'],
        ['Dependency management', 'Track external owners, dates, assumptions, and fallback options.', 'Escalate missing identity-provider metadata before it blocks integration testing.'],
        ['Risk and issue control', 'Risks may happen; issues are happening and need immediate ownership.', 'Convert the delayed data export risk into an issue with a temporary sample-data plan.'],
        ['Change control', 'Evaluate new requests against outcome, effort, risk, and committed dates.', 'Trade a newly requested dashboard for a planned export instead of silently adding scope.'],
        ['Customer demos', 'Demo completed workflows against acceptance criteria and capture decisions.', 'Show a failed webhook recovering after the customer endpoint returns.'],
        ['Rollout strategy', 'Limit exposure, monitor results, and define pause or rollback thresholds.', 'Pilot with one region and stop expansion if manual overrides exceed 20%.'],
        ['Adoption', 'A deployed system creates value only when users trust and use the workflow.', 'Train champions, observe sessions, and fix the highest-friction step.'],
        ['Handoff', 'Transfer code, context, operations, ownership, and open risks deliberately.', 'Run the client team through deployment and incident recovery before sign-off.'],
      ],
    },
    {
      id: 'communication',
      title: 'Communication',
      summary: 'Make technical work understandable, decision-oriented, and credible for different audiences.',
      outcomes: ['Adapt detail to audience', 'Communicate status and risk', 'Lead decisions constructively'],
      platformFocus: 'English screens, project walkthroughs, and client simulations evaluate clarity continuously.',
      examples: [
        ['Executive summary', 'Lead with outcome, decision, risk, and requested action.', 'Tell the sponsor launch is at risk from data access and ask for an owner by Friday.'],
        ['Status update', 'Report completed outcomes, next work, risks, and decisions without activity noise.', 'Say the import is validated on 80% of records and name the remaining quality blocker.'],
        ['Explain technical ideas', 'Use the audience’s goals and a precise analogy without hiding consequences.', 'Explain eventual consistency as a short period when two screens may disagree.'],
        ['Meeting design', 'Every meeting needs a decision or outcome, the right people, and prepared context.', 'Send options before a thirty-minute architecture decision meeting.'],
        ['Difficult news', 'State the fact early, own the impact, and present recovery choices.', 'Explain that launch will slip, why, what is protected, and two revised plans.'],
        ['Async communication', 'Write enough context for a recipient to act without another meeting.', 'Post the decision, rationale, owner, due date, and link to evidence.'],
        ['Decision record', 'Capture what was decided, alternatives, assumptions, and revisit triggers.', 'Record choosing batch synchronization until volume exceeds the measured threshold.'],
        ['Negotiation', 'Protect the shared outcome while making constraints and exchanges explicit.', 'Offer a smaller pilot by the deadline or the full scope two weeks later.'],
        ['Technical presentation', 'Build a narrative from problem to evidence, decision, result, and learning.', 'Walk through one architecture diagram and one production metric instead of every component.'],
      ],
    },
    {
      id: 'behavioral-experience',
      title: 'Behavioral / Experience',
      summary: 'Turn real experience into concise evidence of ownership, judgment, collaboration, and learning.',
      outcomes: ['Structure evidence-rich stories', 'Show personal contribution', 'Reflect honestly on outcomes'],
      platformFocus: 'Profile review and excellence interviews require specific first-person evidence, not hypothetical answers.',
      examples: [
        ['STAR structure', 'Set brief context, name your responsibility, explain actions, and quantify the result.', 'Describe a delayed launch, your recovery plan, and the measured reduction in support tickets.'],
        ['Ownership', 'Show where you noticed a gap and drove it beyond your assigned coding task.', 'Add monitoring and an on-call runbook after delivering an integration.'],
        ['Conflict', 'Explain the disagreement, shared goal, evidence used, and durable resolution.', 'Resolve a schema debate with a small benchmark and an agreed decision record.'],
        ['Ambiguity', 'Demonstrate how you reduced unknowns before making an expensive commitment.', 'Interview operators and prototype the risky workflow before estimating the project.'],
        ['Failure', 'Own your decision, impact, response, and changed practice without deflection.', 'Explain how a missing timeout caused an outage and how you changed review standards.'],
        ['Feedback', 'Show that you sought or received feedback and changed observable behavior.', 'After unclear updates, adopt a decision-first weekly status format.'],
        ['Leadership without authority', 'Leadership can align people through context, trust, and useful structure.', 'Coordinate security, data, and product owners around one launch checklist.'],
        ['Ethical judgment', 'Protect users and the organization when pressure conflicts with responsible practice.', 'Refuse to bypass an approval control and propose a compliant fast-track.'],
        ['Impact', 'Connect your contribution to a credible technical, user, or business measure.', 'Reduce reconciliation from four hours to twenty minutes and explain your part.'],
      ],
    },
  ]),
})