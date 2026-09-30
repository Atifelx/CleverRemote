import type { FdeLessonDetails } from './fde-core-lesson-types'

export const fdeSystemsLessonDetails = {
  'Clarify the job': {
    explanation: [
      'System design starts by translating a broad request into a specific job the system must perform for named users and neighboring systems. Clarify the main workflow, inputs, outputs, actors, invariants, and out-of-scope behavior before choosing storage, messaging, or deployment technology.',
      'Ask which outcomes are mandatory, what can be delayed or approximate, and which existing constraints cannot change. This prevents a technically impressive design from solving the wrong problem, but clarification has a cost: too little creates rework, while trying to settle every future possibility can stall delivery.',
    ],
    whyItMatters: 'Architecture choices are only good relative to a workload and its constraints. A clear job statement gives the team a stable basis for evaluating tradeoffs, testing behavior, and rejecting complexity that does not serve the required outcome.',
    useCases: [
      'Separating an order-submission workflow from later fulfillment and reporting work',
      'Determining whether a search feature needs exact results or useful ranked results',
      'Clarifying whether a file-processing service must return synchronously or may complete in the background',
    ],
    workedExample: {
      scenario: 'A retailer asks for a system that prevents overselling during flash sales, but has not defined what counts as a successful reservation.',
      steps: [
        'Identify shoppers, the checkout service, and warehouse inventory as the actors, then state that the core job is to reserve a requested quantity for a bounded checkout window.',
        'Record the invariant that confirmed reservations for an item cannot exceed sellable stock, and define reservation expiry and cancellation behavior.',
        'Mark recommendations, warehouse replenishment, and long-term demand forecasting as out of scope for the first design.',
        'Agree that checkout may reject a request when stock is uncertain rather than acknowledge a reservation that cannot be honored.',
      ],
      result: 'The team can now compare designs against a precise reservation invariant and latency boundary instead of debating an undefined inventory platform.',
    },
    interview: {
      prompt: 'A stakeholder asks you to design a scalable notification system. What would you clarify before drawing components?',
      answer: 'I would identify notification channels, senders, recipients, trigger patterns, delivery urgency, volume, user preferences, and any ordering or audit requirements. I would also ask what delivery guarantee the business actually needs, how failed destinations should be handled, and what is out of scope. Those answers determine whether the design needs synchronous responses, durable queues, per-recipient ordering, or only best-effort fan-out.',
    },
  },
  'Name quality attributes': {
    explanation: [
      'Quality attributes describe how well a system must behave, not which features it exposes. Availability, latency, throughput, durability, security, recoverability, operability, and cost become useful design inputs when each is written as a measurable scenario with a stimulus, operating condition, target response, and observation window.',
      'Attributes compete for the same budget and often conflict: synchronous replication can improve durability while increasing write latency, and excess capacity can improve resilience while increasing cost. Name priorities and acceptable degradation explicitly so the design can protect the most important behavior instead of claiming that every attribute is maximal.',
    ],
    whyItMatters: 'Measurable quality targets turn vague expectations such as fast or reliable into constraints that can guide architecture and verification. They also expose conflicts early, when a team can negotiate priorities instead of discovering them during an incident.',
    useCases: [
      'Defining a checkout latency target separately from a slower analytics freshness target',
      'Choosing a recovery time and recovery point objective for customer records',
      'Specifying how an API should degrade when a recommendation dependency is unavailable',
    ],
    workedExample: {
      scenario: 'A document-signing service is described as highly available, but no one knows whether that applies equally to signing and audit export.',
      steps: [
        'Write a signing target: during normal load, 99.9 percent of accepted signing requests complete within 800 ms over a rolling 30-day window.',
        'Write a recovery target: after loss of one application zone, signing resumes within 10 minutes with no acknowledged signature lost.',
        'Give audit export a lower priority and allow it to lag by up to 15 minutes during recovery so signing capacity remains protected.',
        'Add measurements for end-to-end latency, accepted-request loss, export lag, and recovery time.',
      ],
      result: 'The team has testable service objectives and a declared degradation order, so failover design and capacity spending can focus on signing rather than treating every path identically.',
    },
    interview: {
      prompt: 'Why is "the service must be highly available" not a sufficient quality requirement?',
      answer: 'It does not identify the operation, observation period, allowed failures, workload conditions, or expected behavior during dependency loss. I would turn it into measurable scenarios, such as a success ratio for a named endpoint and a recovery target after a stated failure. I would also define which less critical functions may degrade, because availability decisions usually trade against latency, consistency, and cost.',
    },
  },
  'Estimate load': {
    explanation: [
      'Load estimation converts product activity into approximate rates, concurrency, storage, and bandwidth. Start from active users or business events, state assumptions, calculate average demand, then apply peak factors and payload sizes; the purpose is to reveal orders of magnitude and likely bottlenecks rather than predict an exact future.',
      'Separate reads from writes, steady traffic from bursts, and logical records from replicated or indexed storage. Estimates should include headroom and be revised with measurements because an incorrect assumption can dominate the result, while over-precise arithmetic can hide the uncertainty that capacity planning must manage.',
    ],
    whyItMatters: 'A rough but explicit load model distinguishes a system that fits on one process from one that needs partitioning, buffering, or specialized storage. It also makes capacity decisions reviewable because others can challenge assumptions instead of guessing how a number was produced.',
    useCases: [
      'Sizing an ingestion path from events per device and active device count',
      'Estimating storage growth for retained audit records and their indexes',
      'Checking whether a launch burst can exceed a downstream API rate limit',
    ],
    workedExample: {
      scenario: 'A support platform expects 2 million active users, each creating 3 tickets per month with an average stored ticket size of 12 KB.',
      steps: [
        'Estimate 6 million new tickets per 30-day month, or about 2.3 writes per second on average.',
        'Apply a 20x business-hour and incident peak to plan for roughly 46 ticket writes per second before retries and attachments.',
        'Calculate about 72 GB of primary ticket data per month, then budget separately for indexes, replicas, backups, and attachment storage.',
        'Measure search reads and attachment sizes in a pilot because those uncertain terms are more likely than ticket writes to drive capacity.',
      ],
      code: {
        language: 'Text',
        code: `average writes/s = 2,000,000 x 3 / (30 x 24 x 3,600) = 2.3
planned peak writes/s = 2.3 x 20 = 46
primary growth/month = 6,000,000 x 12 KB = 72 GB`,
      },
      result: 'The write rate is modest, while storage amplification, search traffic, and attachments become the capacity questions that need measurement and design attention.',
    },
    interview: {
      prompt: 'How would you estimate capacity when product traffic data is incomplete?',
      answer: 'I would build a range from explicit assumptions, calculate average and peak rates, and separate reads, writes, payloads, retention, and amplification from indexes or replicas. I would identify which assumptions most affect the answer and propose a small measurement or load test for those terms. The estimate is a decision tool with uncertainty, not a promise of exact demand.',
    },
  },
  'Draw system boundaries': {
    explanation: [
      'A system boundary states what a component owns and which interactions cross into other ownership domains. Draw users, internal responsibilities, external dependencies, data stores, and trust boundaries, then label each crossing with the data, protocol, direction, and failure expectations that form the real contract.',
      'Useful boundaries follow responsibility and change ownership rather than arbitrary process counts. A boundary can isolate failures and clarify security, but every remote boundary adds latency, partial failure, versioning, and operational work, so do not turn every internal concept into a network service.',
    ],
    whyItMatters: 'Most difficult production behavior occurs where ownership, trust, or failure domains meet. Explicit boundaries reveal missing contracts and dependencies while helping teams decide which data and decisions belong together.',
    useCases: [
      'Showing where customer identity leaves an application trust boundary for a payment provider',
      'Separating an order domain from a warehouse system owned by another team',
      'Identifying which component owns validation and persistence for uploaded documents',
    ],
    workedExample: {
      scenario: 'A travel application books trips through an external airline API and stores customer itineraries internally.',
      steps: [
        'Place the traveler, booking application, itinerary store, and airline API on the diagram with clear ownership labels.',
        'Label the airline crossing with request identifiers, timeouts, authentication, response mapping, and the fact that success may be unknown after a timeout.',
        'Assign the application ownership of the local booking state and reconciliation workflow rather than allowing the external response format to become the internal model.',
        'Mark payment details as crossing a separate trust boundary and minimize what the application retains.',
      ],
      result: 'The diagram exposes two independent external failure and trust boundaries, and it gives the application a clear responsibility for local state and reconciliation.',
    },
    interview: {
      prompt: 'What information makes a system boundary diagram useful beyond drawing boxes and arrows?',
      answer: 'I would label ownership, data stores, trust zones, protocols, direction, data exchanged, and important failure behavior. A remote call should show timeout and authentication expectations, and an asynchronous edge should show durability and ownership. Those labels make hidden contracts visible and help determine whether a proposed boundary isolates responsibility or merely adds distributed-system cost.',
    },
  },
  'Define the data model': {
    explanation: [
      'A data model represents the facts a system must preserve, their identities, relationships, state transitions, and invariants. Begin with access and mutation patterns, choose stable identifiers, distinguish current state from history, and place constraints such as uniqueness or valid transitions near the data that must obey them.',
      'Normalization reduces duplication and conflicting updates, while denormalized views can make important reads faster or simpler. The right balance depends on write frequency, read shape, consistency needs, and evolution cost; derived copies need an owner and a repair strategy because they can drift from their source.',
    ],
    whyItMatters: 'Storage technology cannot compensate for an ambiguous model of identity and invariants. A deliberate model makes valid states explicit, supports expected queries, and reduces data corruption that application code alone may not prevent under concurrency.',
    useCases: [
      'Modeling an order separately from its immutable line-item price snapshots',
      'Choosing a uniqueness constraint for one active subscription per account',
      'Keeping an append-only status history while maintaining a current-state projection',
    ],
    workedExample: {
      scenario: 'A booking system must prevent two confirmed reservations for the same room and night while preserving price history.',
      steps: [
        'Define stable identifiers for room, stay date, reservation, and guest, and store the agreed nightly price on the reservation rather than reading a mutable catalog price later.',
        'Represent reservation status as a controlled transition from held to confirmed, expired, or cancelled.',
        'Add a uniqueness rule over room and stay date for states that consume inventory, implemented with a transaction or an equivalent serialized allocation record.',
        'Index guest and date lookup paths separately from the constraint that protects inventory.',
      ],
      result: 'Concurrent confirmation attempts cannot both consume the same room-night, and existing reservations retain the price agreed when they were created.',
    },
    interview: {
      prompt: 'When would you denormalize data, and what obligation does that create?',
      answer: 'I would denormalize when a measured read path is too expensive or needs an independently shaped projection, and when the consistency requirement allows it. The duplicate needs a source of truth, an update mechanism, freshness expectations, idempotent rebuilding, and reconciliation for missed updates. Without those, denormalization exchanges query cost for unexplained drift.',
    },
  },
  'Design the API': {
    explanation: [
      'An API is a behavioral contract covering operations, resource identity, validation, errors, concurrency, pagination, authentication, and side effects. Design it from caller jobs and domain semantics, make invalid states reject clearly, and give retryable mutations a stable request identity when duplicate execution would be harmful.',
      'A good contract hides internal storage without hiding important behavior such as asynchronous completion or conditional updates. Coarse operations can preserve invariants but reduce flexibility, while overly generic endpoints leak implementation details and force every client to reconstruct business rules.',
    ],
    whyItMatters: 'APIs outlive many internal implementations and coordinate change between independently deployed callers and providers. Precise semantics reduce accidental coupling, unsafe retries, and client-specific interpretations of the same operation.',
    useCases: [
      'Designing a payment creation endpoint with an idempotency key',
      'Using cursor pagination for a changing ordered collection',
      'Applying conditional updates to reject edits based on stale resource versions',
    ],
    workedExample: {
      scenario: 'A mobile client creates expense reports over an unreliable connection and may resend a request after a timeout.',
      steps: [
        'Define POST /expense-reports to accept a client-generated idempotency key and a validated set of line items.',
        'Store the key with the created report and response in the same transaction that commits the report.',
        'Return the original response when the same caller repeats the key with the same request, and reject reuse with different content.',
        'Expose report status explicitly so later approval can remain asynchronous without pretending the initial response means approval completed.',
      ],
      code: {
        language: 'HTTP',
        code: `POST /expense-reports
Idempotency-Key: 7f85b54e

{ "currency": "USD", "items": [{ "amount": 42.50 }] }`,
      },
      result: 'A lost response can be retried without creating a second report, and clients can distinguish successful creation from later approval.',
    },
    interview: {
      prompt: 'What would you define for an API beyond its request and response schemas?',
      answer: 'I would define identity, authorization, validation, error categories, retry and idempotency behavior, concurrency rules, pagination and ordering, rate expectations, and whether completion is synchronous or asynchronous. I would also state compatibility rules. Schemas describe shape, but callers need behavioral semantics to use the contract safely.',
    },
  },
  'Scale stateless work': {
    explanation: [
      'A stateless worker handles each request using request data and shared durable systems rather than relying on memory owned by one process. Because any healthy instance can perform the next request, a load balancer can distribute traffic and the platform can add, replace, or remove instances without moving client sessions.',
      'Stateless does not mean the system has no state; it means durable state has an explicit external owner. This improves horizontal scaling and recovery, but adds network calls and pressure on shared stores, and careless in-memory caches or local files can reintroduce hidden affinity and inconsistent behavior.',
    ],
    whyItMatters: 'Removing per-instance ownership from request handling makes capacity elastic and instance failure routine. It also forces state and concurrency rules into systems designed to preserve them instead of leaving correctness dependent on which process receives a request.',
    useCases: [
      'Running interchangeable API instances behind a load balancer',
      'Scaling image transformation workers that read and write object storage',
      'Replacing local login sessions with signed tokens or a shared session store',
    ],
    workedExample: {
      scenario: 'A web application stores shopping carts in each server process, so users lose carts when traffic moves to another instance.',
      steps: [
        'Assign every cart a stable identifier and move authoritative cart contents to a shared durable store.',
        'Make each request load and update the cart by identifier with an optimistic version check to detect conflicting edits.',
        'Run multiple interchangeable application instances behind the load balancer without session affinity.',
        'Load test the shared store and cache read-only data where bounded staleness is acceptable.',
      ],
      result: 'Requests can move between instances without losing cart state, while version checks protect concurrent updates and the shared store becomes an explicit capacity dependency.',
    },
    interview: {
      prompt: 'What does stateless service design buy, and where does the state go?',
      answer: 'It lets any instance handle a request, which simplifies load distribution, replacement, and horizontal scaling. Durable state moves to an explicitly owned database, object store, queue, or session system, while safe request context may travel with the request. The tradeoff is more dependency traffic and the need to scale and protect those shared stateful systems.',
    },
  },
  'Absorb bursts': {
    explanation: [
      'Burst absorption separates a fast or uneven producer from slower bounded work by accepting requests into a durable buffer. Consumers drain the backlog at a controlled rate, and queue depth, oldest-message age, and processing rate show whether the burst is temporary or demand exceeds sustainable capacity.',
      'Buffering smooths load but does not create capacity: a backlog that grows faster than it drains increases latency and can exhaust retention or storage. The design needs admission control, backlog limits, idempotent consumers, expiry rules, and a policy for work that is no longer valuable.',
    ],
    whyItMatters: 'Without a buffer or explicit rejection, a short spike can overload every downstream dependency at once. Controlled queuing preserves accepted work and protects bounded resources while making delay visible and manageable.',
    useCases: [
      'Queuing thumbnail generation after a large media upload campaign',
      'Smoothing webhook delivery when a customer endpoint slows down',
      'Batching telemetry writes from devices that reconnect after an outage',
    ],
    workedExample: {
      scenario: 'A ticket release creates 60,000 email confirmations in one minute, while the email provider accepts only 200 requests per second.',
      steps: [
        'Commit each confirmation intent to a durable queue as part of the successful purchase workflow.',
        'Limit consumers to the provider rate and include a stable confirmation identifier so retries do not create duplicate sends where the provider supports deduplication.',
        'Monitor queue age and depth, and alert before the promised confirmation-delay threshold is crossed.',
        'Expire or redirect messages that cannot succeed after their usefulness window instead of retrying indefinitely.',
      ],
      result: 'Purchases complete without opening 60,000 concurrent provider calls, and the approximately five-minute minimum drain time is visible as managed backlog rather than hidden timeout pressure.',
    },
    interview: {
      prompt: 'Why is adding a queue not by itself a complete answer to burst traffic?',
      answer: 'A queue moves excess work in time but cannot fix a sustained rate above consumer capacity. I would define acceptance limits, backlog latency targets, consumer concurrency, retry and dead-letter behavior, idempotency, and expiry. I would monitor both depth and oldest age, because a stable count can still hide work that is stuck.',
    },
  },
  'Design failure paths': {
    explanation: [
      'Failure-path design treats timeout, rejection, partial completion, dependency loss, and recovery as normal states with explicit behavior. For every remote or durable step, decide what the caller can know, which side owns recovery, how work is retried or reconciled, and what evidence operators can inspect.',
      'Fallbacks must preserve the core invariant and should not turn a visible outage into silent corruption. Fast failure, bounded degradation, or queued completion may each be appropriate; duplicating the happy path in a complex fallback often adds untested behavior precisely when the system is least stable.',
    ],
    whyItMatters: 'Distributed operations can complete even when their responses are lost, leaving callers uncertain rather than simply failed. Explicit failure states prevent unsafe repetition and give users and operators a path from ambiguity to a known result.',
    useCases: [
      'Reconciling a payment whose provider response timed out after submission',
      'Serving cached catalog data while a recommendation service is unavailable',
      'Moving repeatedly malformed messages to a quarantine path for inspection',
    ],
    workedExample: {
      scenario: 'A transfer service debits an account, calls an external settlement provider, and times out before receiving the provider response.',
      steps: [
        'Persist the transfer with a stable external request identifier and a pending-settlement state before making the provider call.',
        'On timeout, return an explicit pending result rather than retrying as a new transfer or claiming failure.',
        'Reconcile by querying or safely retrying the provider with the same identifier, then transition the local record once the outcome is known.',
        'Alert when pending age exceeds the operational objective and provide operators with the request and provider correlation identifiers.',
      ],
      result: 'A lost response does not cause a second debit, and every uncertain transfer remains visible until reconciliation establishes a final state.',
    },
    interview: {
      prompt: 'How do you reason about a timeout from a remote dependency?',
      answer: 'A timeout says the caller stopped waiting; it does not prove the remote operation did not run. I would classify whether the operation is safe to retry, use a stable idempotency identifier where possible, record an explicit pending or unknown state, and reconcile later. The caller also needs a bounded response and operators need evidence for unresolved outcomes.',
    },
  },
  'Modular monolith': {
    explanation: [
      'A modular monolith deploys as one application while dividing domain responsibilities into modules with explicit public interfaces and private implementation details. Modules can own their data access and rules even when they share a process and deployment, so internal calls remain simple without allowing arbitrary cross-module mutation.',
      'This style avoids network and distributed-transaction costs while a product and team are still evolving. Its discipline is architectural rather than enforced by process isolation, so dependency checks and ownership rules matter; independent scaling or release requirements may eventually justify extracting a boundary.',
    ],
    whyItMatters: 'A modular monolith can preserve clear domain boundaries with lower operational complexity than distributed services. It keeps later extraction possible without paying remote-call, observability, and consistency costs before those costs solve a demonstrated need.',
    useCases: [
      'Building an early product with separate billing, accounts, and reporting modules',
      'Consolidating tightly coupled services whose independent deployment provides little value',
      'Enforcing that an order module changes order state only through its public commands',
    ],
    workedExample: {
      scenario: 'A subscription product has account, billing, and notification logic mixed across controllers and database helpers.',
      steps: [
        'Create modules around account management, billing, and notifications, each exposing a small application interface.',
        'Move billing invariants and billing table access behind the billing module rather than allowing account code to update those tables directly.',
        'Connect modules through in-process commands and domain events with contract tests at each public interface.',
        'Add dependency rules that reject imports into another module\'s internal packages.',
      ],
      result: 'The application still ships as one unit, but ownership and dependencies are visible enough to change billing without tracing unrestricted calls across the codebase.',
    },
    interview: {
      prompt: 'When would you choose a modular monolith over microservices?',
      answer: 'I would choose it when the domain or team boundaries are still changing, most parts share release and scaling needs, and one deployment can meet reliability requirements. It preserves transaction and debugging simplicity while using module interfaces to control coupling. I would extract a service only when independent scaling, isolation, ownership, or release cadence provides enough value to justify distributed-system overhead.',
    },
  },
  Microservices: {
    explanation: [
      'Microservices divide a system into independently deployable services that own a business capability and normally control their own data. Interaction occurs through versioned network or messaging contracts, so each service must handle partial failure, authentication, observability, and data consistency without reaching into another service\'s internals.',
      'Independent deployment and scaling can support autonomous teams or sharply different workloads, but the boundary introduces latency, duplicated operational work, and harder cross-service changes. Service size should follow cohesive ownership and change patterns, not a target number of endpoints or code lines.',
    ],
    whyItMatters: 'Microservices are an organizational and operational tradeoff, not a default maturity step. Used at justified boundaries they isolate change and resource demand; used prematurely they convert local code relationships into slower, less reliable distributed dependencies.',
    useCases: [
      'Separating media transcoding that has distinct compute scaling from a web application',
      'Giving a payments team independent ownership of regulated payment workflows',
      'Isolating a high-risk document parser from customer-facing request processes',
    ],
    workedExample: {
      scenario: 'A marketplace considers extracting image processing because large uploads exhaust CPU and memory needed by checkout requests.',
      steps: [
        'Define image processing as ownership of validation, transformation, metadata, and output status, while the marketplace retains product ownership.',
        'Use a durable job contract containing an asset identifier and desired transformations rather than sharing application tables.',
        'Make processing idempotent, publish completion status, and let the marketplace tolerate delayed thumbnails.',
        'Deploy and scale workers independently, then measure whether checkout isolation and resource efficiency improve enough to justify the new service.',
      ],
      result: 'Image bursts no longer compete directly with checkout compute, while the asynchronous contract and independent operations make the cost of the extracted boundary explicit.',
    },
    interview: {
      prompt: 'What evidence would justify splitting a module into a microservice?',
      answer: 'I would look for a stable ownership boundary plus a concrete need for independent scaling, release cadence, fault isolation, security controls, or technology. I would also test whether the capability can own its data and expose a durable contract. If most changes still require coordinated releases and transactions, extraction is likely to add network failure and operational cost without meaningful independence.',
    },
  },
  'Layered architecture': {
    explanation: [
      'Layered architecture groups code by responsibility, commonly presentation, application workflow, domain rules, and infrastructure. Dependencies move through defined interfaces so transport parsing does not contain business policy and domain logic does not need to know which database driver or HTTP framework is in use.',
      'Layers make familiar separation and testing straightforward, but rigid pass-through layers can add ceremony without isolating decisions. Shared domain objects can also become an accidental coupling channel, so use a layer when it has a distinct responsibility and allow simple paths to remain simple.',
    ],
    whyItMatters: 'Clear layers keep volatile delivery and persistence details from spreading into business rules. This makes policy easier to test and lets implementations change with fewer unrelated edits, provided the boundaries enforce real responsibilities rather than naming folders.',
    useCases: [
      'Keeping HTTP validation separate from account-opening policy',
      'Replacing a database adapter without rewriting domain calculations',
      'Testing an application workflow with fake repository and notification interfaces',
    ],
    workedExample: {
      scenario: 'An invoice endpoint currently parses HTTP, calculates tax, writes SQL, and sends email in one handler.',
      steps: [
        'Keep request decoding and response mapping in the presentation layer.',
        'Move invoice orchestration into an application service that calls domain tax and total calculations.',
        'Place database and email implementations behind repository and notification interfaces owned by the inner workflow.',
        'Test tax rules without infrastructure and test the application service with controlled adapter substitutes.',
      ],
      result: 'Tax policy can be verified independently, while transport and infrastructure changes no longer require editing the calculation itself.',
    },
    interview: {
      prompt: 'What is a warning sign that a layered architecture is adding ceremony rather than separation?',
      answer: 'A warning sign is a chain of classes that only forwards identical data and has no policy, translation, or substitution boundary. I would keep layers where they isolate reasons to change, such as transport, workflow, domain rules, and infrastructure, but remove pass-through abstractions that provide no independent responsibility or test value.',
    },
  },
  'Hexagonal architecture': {
    explanation: [
      'Hexagonal architecture places application and domain behavior at the center and expresses outside interactions as ports. Inbound adapters such as HTTP handlers invoke application ports, while outbound adapters implement ports for persistence, messaging, clocks, or external services, keeping the core independent of delivery technology.',
      'The direction of dependency lets tests drive the core with simple substitutes and lets infrastructure change without rewriting policy. Defining a port for every function creates noise, however; ports are most valuable at meaningful boundaries where an external capability or volatile implementation meets core behavior.',
    ],
    whyItMatters: 'Ports make the application\'s required capabilities explicit and prevent frameworks from defining the domain model. The result is a core that can be exercised deterministically and connected to different delivery or infrastructure mechanisms.',
    useCases: [
      'Running the same pricing workflow from an HTTP API and a batch command',
      'Testing expiry behavior through an injected clock port',
      'Replacing a direct payment client with a queued payment adapter',
    ],
    workedExample: {
      scenario: 'A renewal workflow directly reads framework request objects, queries a database client, and calls a payment SDK.',
      steps: [
        'Define an inbound renew-subscription command using domain values rather than framework request types.',
        'Define outbound ports for loading subscriptions, charging a payment method, persisting the result, and reading time.',
        'Implement HTTP, database, payment, and system-clock adapters around those ports.',
        'Test renewal success, decline, and expiry using in-memory adapters with deterministic responses.',
      ],
      result: 'The renewal policy runs without the web framework or external SDK, while production adapters remain responsible for protocol details and error translation.',
    },
    interview: {
      prompt: 'How is a port different from an arbitrary wrapper around a library?',
      answer: 'A port describes a capability the application needs in domain terms and is owned by the application side of the boundary. An arbitrary wrapper may simply repeat a vendor API and preserve its coupling. I would introduce a port where it protects policy from an external mechanism, with operations shaped around the application workflow rather than the library surface.',
    },
  },
  'Event-driven architecture': {
    explanation: [
      'Event-driven architecture communicates completed facts as events that interested consumers process independently. A producer publishes a stable identity and meaningful domain occurrence, while consumers maintain their own progress and projections without requiring the producer to know every reaction.',
      'Events enable loose temporal coupling and scalable fan-out, but introduce delayed consistency, duplicates, ordering limits, schema evolution, and harder tracing. Publish durable events consistently with state changes, make consumers idempotent, and use commands rather than events when one specific owner is expected to decide or act.',
    ],
    whyItMatters: 'Events let multiple capabilities react to a business fact without extending the producer\'s synchronous critical path. The benefit depends on accepting asynchronous visibility and investing in replay, observability, and consumer correctness.',
    useCases: [
      'Updating search and analytics after a product is published',
      'Triggering independent receipt and fulfillment workflows after order confirmation',
      'Rebuilding a read projection from a retained event stream',
    ],
    workedExample: {
      scenario: 'An order service currently calls inventory, email, analytics, and loyalty systems synchronously before returning confirmation.',
      steps: [
        'Keep the order invariant in the order transaction and record an OrderConfirmed event in an outbox in that same commit.',
        'Publish the outbox record with a stable event identifier and order version.',
        'Let fulfillment, receipt, analytics, and loyalty consumers process independently and record handled event identifiers or idempotent state transitions.',
        'Monitor publication lag, consumer lag, and quarantined failures, and provide replay from retained events.',
      ],
      result: 'Order confirmation no longer waits for every secondary capability, while durable publication and observable consumers preserve recoverable follow-up work.',
    },
    interview: {
      prompt: 'When should an interaction be a command rather than an event?',
      answer: 'A command expresses a request to a specific owner that may accept or reject it, while an event states a fact that has already occurred and may have many consumers. I would use a command when the sender needs a decision or directs responsibility, and an event for independent reactions. Naming a desired action as a past-tense event can hide ownership and failure semantics.',
    },
  },
  'Architecture decision records': {
    explanation: [
      'An architecture decision record captures one significant decision with its context, constraints, considered options, chosen outcome, consequences, and status. It records why the choice was reasonable at the time, rather than presenting the current architecture as if no alternatives or uncertainty existed.',
      'ADRs should be short, versioned with the system, and superseded rather than silently rewritten when circumstances change. Recording every minor implementation choice creates noise, but omitting consequential tradeoffs forces future teams to repeat research or remove constraints they do not understand.',
    ],
    whyItMatters: 'Code shows what exists but rarely preserves the assumptions and rejected alternatives behind it. ADRs make those assumptions reviewable and give later changes a clear point from which to confirm or revise the decision.',
    useCases: [
      'Recording why a team selected asynchronous processing for report generation',
      'Documenting a single-region launch and the threshold for adding another region',
      'Superseding an earlier database choice after workload evidence changes',
    ],
    workedExample: {
      scenario: 'A team chooses a relational database for reservation inventory but expects future engineers to question why a document store was not used.',
      steps: [
        'State the context: reservations require transactional uniqueness across room, date, and active status, with moderate write volume.',
        'List the relational and document options and compare transaction support, query patterns, team experience, and operational cost.',
        'Record the relational choice, including the consequence that horizontal partitioning is deferred and schema migrations require discipline.',
        'Set a review trigger based on measured write or regional requirements and mark later decisions as superseding this record rather than editing history.',
      ],
      result: 'Future engineers can evaluate the choice against its original inventory invariant and know which changed conditions would justify reopening it.',
    },
    interview: {
      prompt: 'What makes an ADR useful instead of becoming stale documentation?',
      answer: 'It should capture a consequential decision, the context and constraints at that moment, real alternatives, tradeoffs, and consequences. It should live near the code, have an owner or status, and be superseded by a new record when the decision changes. Concrete review triggers help distinguish a durable rationale from an unsupported preference.',
    },
  },
  'Coupling and cohesion': {
    explanation: [
      'Cohesion measures how strongly the responsibilities inside a module belong together, while coupling measures how much one module depends on another\'s details, timing, data, or release. A cohesive module owns a focused capability and exposes the smallest contract needed by callers instead of sharing its internal tables or object graph.',
      'Some coupling is necessary for collaboration, so the goal is deliberate, stable coupling rather than zero coupling. Synchronous calls create temporal availability dependencies, shared databases create data and release dependencies, and events reduce direct knowledge while adding schema and eventual-consistency obligations.',
    ],
    whyItMatters: 'High cohesion localizes change and makes ownership understandable. Controlled coupling reduces the number of components that must change, deploy, or fail together when one capability evolves.',
    useCases: [
      'Moving discount rules into one pricing module instead of duplicating them across endpoints',
      'Replacing direct access to another service\'s tables with a supported contract',
      'Evaluating whether a synchronous dependency belongs on a critical request path',
    ],
    workedExample: {
      scenario: 'Checkout, support, and reporting code all query internal payment tables and interpret status values independently.',
      steps: [
        'Place payment state interpretation and transitions inside a cohesive payments capability.',
        'Expose a narrow payment-status query for checkout and support, and publish settled-payment facts for reporting.',
        'Remove shared table access and translate payment internals into stable contract values.',
        'Measure callers that still require coordinated changes to find missing or overly broad contract behavior.',
      ],
      result: 'Payment schema changes remain local, operational queries use an owned interface, and reporting no longer adds synchronous load to checkout dependencies.',
    },
    interview: {
      prompt: 'Is asynchronous messaging always less coupled than a synchronous API call?',
      answer: 'No. Messaging removes a temporal call dependency, but consumers still depend on event meaning, schema, identity, ordering, and delivery behavior. A poorly designed shared event can couple many consumers more widely than a narrow API. I would compare the dimensions of coupling and choose the contract that fits ownership, latency, and consistency needs.',
    },
  },
  'Contract evolution': {
    explanation: [
      'Contract evolution changes an API, event, or stored interchange format without requiring every producer and consumer to update at once. Favor additive changes, preserve field meaning, define defaults for absence, and make readers tolerate fields they do not understand when the serialization format permits it.',
      'Breaking semantic changes need a migration that supports an overlap period, observes adoption, and removes the old behavior only after consumers have moved. Permanent version proliferation increases testing and support cost, while changing meaning under the same field name creates a hidden break that version labels cannot repair.',
    ],
    whyItMatters: 'Independently deployed components inevitably run different versions at the same time. Compatibility rules allow rolling change and replay without turning every contract update into a coordinated outage.',
    useCases: [
      'Adding an optional delivery window to an order event',
      'Migrating an identifier from an integer field to a globally unique string field',
      'Changing an API response through an expand-migrate-contract rollout',
    ],
    workedExample: {
      scenario: 'An order event uses numeric customerId, but the organization is moving to string identifiers that can include multiple identity domains.',
      steps: [
        'Add a new customerRef string while continuing to publish customerId during the compatibility period.',
        'Update consumers to prefer customerRef and fall back to customerId, and track which consumers still read the old field.',
        'Backfill or translate retained events where replay requirements demand the new identity.',
        'Stop publishing customerId only after observed consumer migration and the declared deprecation window, then remove fallback readers later.',
      ],
      result: 'Producers and consumers deploy independently during the overlap, and removal occurs from adoption evidence rather than an assumed synchronized release.',
    },
    interview: {
      prompt: 'Why can adding a field still be a breaking contract change?',
      answer: 'Some readers reject unknown fields, generated clients may enforce closed schemas, and a new required field can break old producers. Even an optional field can break behavior if it changes how existing fields are interpreted. I would verify parser behavior, keep the addition optional with a clear default, preserve old semantics, and test mixed-version producers and consumers.',
    },
  },
  'Evolutionary architecture': {
    explanation: [
      'Evolutionary architecture makes change an explicit design property by using replaceable boundaries, incremental migrations, and fitness functions that continuously test important characteristics. It avoids predicting every future requirement, but preserves options where change is likely or expensive to reverse.',
      'Reversibility has a cost, so not every choice deserves abstraction or dual operation. Use evidence-based review triggers, small migration steps, and measurable constraints; excessive generality delays feedback, while irreversible coupling to volatile assumptions makes later change risky and disruptive.',
    ],
    whyItMatters: 'Workloads, organizations, and regulations change after a system launches. An evolutionary approach lets architecture respond through controlled increments while automated checks prevent important qualities from eroding unnoticed.',
    useCases: [
      'Migrating a table through additive schema changes while old and new application versions overlap',
      'Enforcing module dependency rules as an architectural fitness function',
      'Replacing a search implementation behind a stable query contract with shadow traffic',
    ],
    workedExample: {
      scenario: 'A product must replace a legacy search index without interrupting queries or trusting an unverified one-time cutover.',
      steps: [
        'Define a stable search port and measurable relevance, latency, and freshness fitness criteria.',
        'Build the new index from authoritative data and dual-write subsequent changes with reconciliation for missed updates.',
        'Send shadow queries to the new implementation and compare result quality and latency without serving its responses.',
        'Shift a small traffic percentage, monitor the criteria, increase gradually, and retain a bounded rollback path until confidence is established.',
      ],
      result: 'The search implementation changes through observable, reversible stages, and cutover depends on measured behavior rather than architecture preference.',
    },
    interview: {
      prompt: 'How does evolutionary architecture differ from designing for every possible future?',
      answer: 'It does not build speculative flexibility everywhere. It identifies likely or costly change points, creates modest boundaries or reversible migration paths, and uses fitness functions and production evidence to guide the next step. The architecture evolves through small validated changes instead of a universal abstraction based on uncertain forecasts.',
    },
  },
  'CAP tradeoff': {
    explanation: [
      'The CAP result concerns a replicated system when network communication between nodes is partitioned: it cannot guarantee both linearizable consistency and that every request to a non-failing node receives a successful response. A design must decide which operations reject or wait and which may proceed with potentially divergent state during that partition.',
      'CAP is not a permanent choice of two out of three, and it does not remove latency or durability tradeoffs when the network is healthy. Decisions can differ by operation: account balance updates may stop without quorum, while a product catalog can serve an older replica and reconcile writes later.',
    ],
    whyItMatters: 'Partitions and ambiguous communication force concrete behavior whether designers name it or not. Understanding the tradeoff prevents claims of simultaneous guarantees that cannot hold and helps align each operation with its business invariant.',
    useCases: [
      'Rejecting inventory allocation when a quorum cannot confirm remaining stock',
      'Serving a stale product description from an isolated read replica',
      'Allowing offline note edits that later merge after connectivity returns',
    ],
    workedExample: {
      scenario: 'Two regions accept loyalty-point redemptions, and a network partition prevents them from sharing the latest balance.',
      steps: [
        'State the invariant that confirmed redemptions must not drive a member below zero points.',
        'Route redemption ownership to a quorum or single home region and reject or queue redemptions when that authority is unreachable.',
        'Continue serving cached balance views with a visible freshness marker if stale reads are acceptable.',
        'After connectivity returns, reconcile queued requests against the authoritative balance rather than merging two independent confirmed debits.',
      ],
      result: 'The system sacrifices redemption availability during the partition to preserve the no-negative-balance invariant while keeping lower-risk reads available.',
    },
    interview: {
      prompt: 'What does CAP require you to choose during a network partition?',
      answer: 'For a replicated operation, it requires choosing between linearizable consistency and always returning a successful response from every reachable non-failing node. The choice should be stated per operation and invariant. It does not mean a system permanently picks only two properties, nor does it settle normal latency, durability, or eventual reconciliation behavior.',
    },
  },
  'Consistency models': {
    explanation: [
      'A consistency model defines which values a read may observe relative to concurrent writes. Linearizability makes each operation appear atomic in real-time order, while sequential, causal, read-your-writes, monotonic-read, and eventual guarantees permit different observations and therefore different implementation and latency choices.',
      'Choose the weakest model that still protects the user and domain invariant, and state it in observable terms. Stronger coordination can increase latency or reduce availability during communication failures, while vague eventual consistency can produce confusing regressions unless sessions, versions, and freshness are handled deliberately.',
    ],
    whyItMatters: 'Clients form expectations about what a successful write means and what later reads can return. Naming the model prevents different components from making incompatible assumptions and directs coordination cost toward operations that truly need it.',
    useCases: [
      'Providing read-your-writes behavior after a user updates a profile',
      'Using linearizable allocation for a unique username',
      'Allowing analytics counters to converge after asynchronous aggregation',
    ],
    workedExample: {
      scenario: 'A user changes a profile photo, but the next page load sometimes displays the old replica value for several seconds.',
      steps: [
        'Define the required session guarantee: after a successful update, that user must not observe an older profile version.',
        'Return the committed profile version with the write and carry it in the following read request.',
        'Route the read to a replica that has applied at least that version or fall back to the authoritative store within a bounded wait.',
        'Allow unrelated users to read slightly older versions because their path does not require the same session guarantee.',
      ],
      result: 'The editor receives read-your-writes behavior without imposing linearizable reads on every profile viewer.',
    },
    interview: {
      prompt: 'Is eventual consistency a single, precise behavior?',
      answer: 'No. It only broadly states that replicas converge after updates stop; it does not specify how stale a read may be, whether values can move backward, or whether a writer sees its own update. I would add concrete session, ordering, conflict, and freshness guarantees so callers know what observations are possible.',
    },
  },
  Replication: {
    explanation: [
      'Replication keeps copies of data on multiple nodes to improve read locality, throughput, or survival of node loss. A leader-based design orders writes through one authority and propagates them to followers, while multi-leader or leaderless designs accept more write locations and must detect and resolve concurrent versions.',
      'Synchronous acknowledgement can reduce acknowledged-write loss but adds coordination latency and can reject work when replicas are unreachable. Asynchronous replication lowers write latency and supports distant replicas, but creates lag and a failover window in which recent acknowledged data may be absent unless durability is provided elsewhere.',
    ],
    whyItMatters: 'Copies improve resilience only when their acknowledgement, lag, and failover semantics are understood. Otherwise replication can serve stale data, lose recent writes during promotion, or turn a recoverable node failure into conflicting histories.',
    useCases: [
      'Serving geographically closer read replicas for a product catalog',
      'Maintaining quorum copies of reservation records across failure domains',
      'Using change streams to populate a reporting replica without loading the primary',
    ],
    workedExample: {
      scenario: 'An account service uses one primary and two asynchronous replicas, and the team needs a failover policy for primary loss.',
      steps: [
        'Measure each replica\'s applied log position and exclude a replica that is too far behind for the account recovery objective.',
        'Fence the old primary before promoting the most current eligible replica so two writable primaries cannot both accept updates.',
        'Redirect writes to the promoted replica and keep reads that require recent writes on replicas at or beyond the client\'s observed version.',
        'Rejoin the old primary only after replacing or reconciling its divergent state.',
      ],
      result: 'Failover has explicit data-loss and split-brain controls, and clients that need recent account data do not silently read a lagging copy.',
    },
    interview: {
      prompt: 'Why does having three replicas not automatically mean an acknowledged write cannot be lost?',
      answer: 'Durability depends on which replicas persisted the write before acknowledgement and how failover selects a new authority. If the primary acknowledges before asynchronous followers receive the update, primary loss can remove the only copy. I would define the write quorum, persistence point, lag limits, promotion rule, and fencing behavior rather than infer guarantees from replica count.',
    },
  },
  Partitioning: {
    explanation: [
      'Partitioning divides a dataset and workload across owners using a key or range so no single node must hold or process everything. Hash partitioning tends to spread keys evenly, range partitioning supports ordered scans, and directory-based routing supports custom placement at the cost of maintaining routing metadata.',
      'The partition key determines locality, balance, and which operations need cross-partition coordination. Hot keys, skewed tenants, global uniqueness, joins, and rebalancing can dominate the design, so choose from actual access patterns and plan how clients find owners while data moves.',
    ],
    whyItMatters: 'Partitioning enables growth beyond one node but converts some local operations into distributed ones. A suitable key keeps common work together and spreads demand, while a poor key creates hotspots or expensive fan-out that additional nodes cannot fix.',
    useCases: [
      'Partitioning customer records by tenant for tenant-local queries',
      'Using time ranges for append-heavy logs with bounded retention',
      'Adding key salting to spread writes for one unusually active aggregate',
    ],
    workedExample: {
      scenario: 'A telemetry store receives most writes under one national utility customer, making tenant-id partitioning overload a single shard.',
      steps: [
        'Measure write distribution and confirm that the large tenant, rather than total storage, creates the hot shard.',
        'Partition records by tenant plus a stable device-hash bucket so the large tenant spans multiple write owners.',
        'Store bucket metadata so tenant-wide queries fan out only across that tenant\'s known buckets.',
        'Rebalance buckets gradually and monitor per-shard rate, storage, and query fan-out cost.',
      ],
      result: 'The dominant tenant\'s writes spread across several shards, while routing metadata bounds the extra work needed for tenant-wide reads.',
    },
    interview: {
      prompt: 'What makes a good partition key?',
      answer: 'It has enough cardinality to distribute load, avoids predictable hot values, and keeps the most common transactions and queries local. It should remain stable and support practical routing and rebalancing. I would validate it against both average and worst-case tenant or item distributions, because an even row count can still hide uneven request rates.',
    },
  },
  'Idempotent consumers': {
    explanation: [
      'An idempotent consumer can process the same logical message more than once without applying the business effect more than once. It uses a stable message or operation identity and combines duplicate detection with the state change, or defines the state transition itself so repeated application reaches the same result.',
      'Marking a message handled before the business update can lose work, while marking it afterward in a separate commit can duplicate work after a crash. A transactional inbox, unique business key, or compare-and-set transition closes that gap, though deduplication records need retention aligned with possible redelivery.',
    ],
    whyItMatters: 'Message brokers and workers commonly redeliver after timeout, crash, or acknowledgement loss. Idempotency lets the system prefer recovery and retry without turning infrastructure uncertainty into duplicate charges, shipments, or notifications.',
    useCases: [
      'Preventing a redelivered payment event from issuing two refunds',
      'Applying an inventory adjustment once per source operation identifier',
      'Ignoring a stale order-state event after a newer version is already stored',
    ],
    workedExample: {
      scenario: 'A fulfillment consumer may receive the same OrderConfirmed event again after it ships the order but crashes before acknowledging the message.',
      steps: [
        'Give the event a stable identifier and the shipment a unique order identifier.',
        'In one database transaction, insert the handled event identifier and create the shipment only if neither identity already exists.',
        'On a uniqueness conflict, load the existing outcome and treat the redelivery as successfully handled.',
        'Acknowledge the broker message only after the transaction commits.',
      ],
      result: 'A crash can cause another delivery, but the database admits only one shipment and the replay completes without a second fulfillment effect.',
    },
    interview: {
      prompt: 'Why is checking an in-memory set of processed message IDs insufficient for idempotency?',
      answer: 'The set disappears on restart, is not shared across consumers, and cannot commit atomically with the business effect. A crash between the effect and the check update still permits duplication. I would use durable deduplication or a unique business transition in the same transactional boundary as the effect, with retention long enough to cover redelivery.',
    },
  },
  'Retry discipline': {
    explanation: [
      'Retry discipline repeats only operations that are plausibly transient and safe to attempt again. It uses bounded attempts, exponential backoff, random jitter, per-attempt timeouts, and an overall deadline so callers do not synchronize into a retry storm or continue work after the result is no longer useful.',
      'Permanent validation, authorization, and conflict errors should usually fail immediately, and non-idempotent operations need a stable operation key or reconciliation instead of blind repetition. Retries consume capacity during failure, so budgets must account for amplification across nested service layers.',
    ],
    whyItMatters: 'Retries can turn brief packet loss into successful work, but uncontrolled retries multiply load on a dependency that is already struggling. A bounded policy improves recovery while preserving capacity and making final failure predictable.',
    useCases: [
      'Retrying a throttled read after a server-provided delay',
      'Using jitter when many workers reconnect after a shared outage',
      'Avoiding retries for malformed requests that cannot succeed unchanged',
    ],
    workedExample: {
      scenario: 'Five hundred workers call a metadata service that briefly returns unavailable, and immediate fixed retries keep the service overloaded.',
      steps: [
        'Classify unavailable and timeout responses as transient while excluding validation and authentication failures.',
        'Set a three-attempt budget within a two-second overall deadline, with each attempt receiving only the remaining time.',
        'Use exponential backoff with random jitter and honor a valid server retry delay.',
        'Stop retrying when the deadline expires, record the exhausted outcome, and reduce worker admission if failure rates remain high.',
      ],
      code: {
        language: 'Text',
        code: `delay = random(0, min(cap, base * 2^attempt))
attempt timeout <= overall deadline - elapsed time`,
      },
      result: 'Workers spread retry demand over time, cap amplification at three calls per operation, and fail within a known latency budget when recovery does not occur.',
    },
    interview: {
      prompt: 'What conditions must be true before you add a retry?',
      answer: 'The failure must be plausibly transient, another attempt must be safe or protected by idempotency, and enough deadline and capacity must remain. I would bound attempts, back off with jitter, avoid retrying permanent errors, and prevent multiple layers from multiplying retries. I would also observe retry volume and exhausted outcomes.',
    },
  },
  'Delivery semantics': {
    explanation: [
      'Delivery semantics describe how transport acknowledgement and failure can produce message attempts. At-most-once delivery may lose a message but does not redeliver after acknowledgement uncertainty; at-least-once preserves retryable work but permits duplicates; transport-level exactly-once claims apply only within stated boundaries and do not automatically make external effects unique.',
      'Choose semantics together with business processing: durable at-least-once delivery plus idempotent state transitions is often easier to verify than assuming one execution. End-to-end exactly-once effects require coordinated identity and atomicity across every relevant state change, which may be unavailable for email, payment, or third-party calls.',
    ],
    whyItMatters: 'Acknowledgement can be lost independently of processing, so duplicate or missing attempts are consequences of the protocol rather than rare coding accidents. Matching transport behavior to business safeguards prevents false guarantees at system boundaries.',
    useCases: [
      'Using at-least-once jobs with a unique invoice-generation key',
      'Accepting at-most-once ephemeral typing indicators',
      'Coordinating a database write and event publication through an outbox',
    ],
    workedExample: {
      scenario: 'A worker records an invoice and then acknowledges its queue message, but crashes after the database commit and before the acknowledgement.',
      steps: [
        'Configure durable at-least-once delivery so the unacknowledged message becomes visible again.',
        'Use the invoice request identifier as a unique database key and commit the invoice under that key.',
        'On redelivery, return the existing invoice outcome instead of creating another invoice.',
        'Acknowledge only after the database transaction has committed or the existing result has been confirmed.',
      ],
      result: 'The transport may deliver twice, but the observable business result contains one invoice and recoverable processing progress.',
    },
    interview: {
      prompt: 'Does an exactly-once message broker guarantee that a customer receives only one email?',
      answer: 'Not by itself. The broker can constrain delivery or processing within its transaction boundary, but the email provider and acknowledgement path are separate effects. A crash after sending and before recording completion can still cause another send. End-to-end uniqueness needs provider idempotency or a reconciled business identifier; otherwise the guarantee must state the remaining duplicate risk.',
    },
  },
  'Leases and ownership': {
    explanation: [
      'A lease grants temporary ownership of work until an expiry time, allowing another worker to recover responsibility when the holder stops renewing. The holder must renew before expiry and treat renewal failure as loss of authority, because a pause or network delay can let another worker acquire the same work while the old holder is still running.',
      'A lease alone cannot prevent a stale holder from writing after expiry. Pair it with a monotonically increasing fencing token that downstream state rejects when older than the latest accepted token; shorter leases recover faster but are more sensitive to pauses and renewal load, while longer leases delay failover.',
    ],
    whyItMatters: 'Leases provide recoverable coordination without permanent locks, but time-based ownership is uncertain at its edges. Fencing turns that uncertainty into an enforceable ordering rule and prevents overlapping holders from corrupting shared state.',
    useCases: [
      'Assigning one active worker to each scheduled export',
      'Electing a temporary partition processor with recoverable ownership',
      'Protecting writes from a paused worker after its lease has expired',
    ],
    workedExample: {
      scenario: 'Worker A pauses for garbage collection, its lease expires, and worker B acquires the same report job while A later resumes.',
      steps: [
        'Issue worker A lease token 41 and, after expiry, issue worker B token 42 from a serialized lease store.',
        'Require every report-state write to include the lease token and store the highest accepted token with the job.',
        'Accept worker B\'s token 42 update and reject worker A\'s later token 41 update as stale.',
        'Have each worker stop processing as soon as renewal fails and make report generation safe to resume from committed progress.',
      ],
      result: 'Both workers may briefly execute, but only the current fenced owner can mutate report state, so the resumed stale worker cannot overwrite newer progress.',
    },
    interview: {
      prompt: 'Why is checking that a lease has not expired before starting work insufficient?',
      answer: 'The worker can pause after the check, the lease can expire, and a new worker can acquire ownership before the old one writes. Clocks and communication also make the exact edge uncertain. I would renew during work, stop on renewal loss, and use a monotonically increasing fencing token that the protected resource validates on every mutation.',
    },
  },
  'Time and ordering': {
    explanation: [
      'Distributed nodes do not share a perfectly synchronized clock, and messages can be delayed, duplicated, or observed in different orders. Wall-clock timestamps are useful for human time and retention but are unsafe as a sole causal order; monotonic clocks measure local durations, while sequence numbers, versions, or logical clocks capture ordering within a defined scope.',
      'Choose the narrowest ordering guarantee the domain needs, such as per-account versions rather than a global event order. Total ordering requires coordination and can limit availability or throughput, while accepting concurrent events requires deterministic conflict rules and enough metadata to detect stale updates.',
    ],
    whyItMatters: 'Incorrect time assumptions create expired leases, overwritten updates, and histories that appear to run backward. Explicit ordering scope lets the system reject stale work and reason about concurrency without demanding unnecessary global coordination.',
    useCases: [
      'Using a monotonic clock to enforce a request timeout',
      'Applying account events only when their sequence follows the stored version',
      'Detecting concurrent offline document edits with version vectors or equivalent metadata',
    ],
    workedExample: {
      scenario: 'Two profile-update events arrive out of order at a search projection because the newer event took a faster network path.',
      steps: [
        'Assign each profile change a version that increases within that profile\'s authoritative write stream.',
        'Include profile ID and version on every event rather than ordering by producer wall-clock timestamp.',
        'Have the projection apply an event only when its version is newer than the stored projection version, and record gaps for replay or source refresh.',
        'Use a monotonic local timer for processing deadlines so wall-clock corrections do not extend or shorten them unexpectedly.',
      ],
      result: 'The projection keeps version 12 when version 11 arrives late, and ordering is enforced per profile without coordinating a global sequence across unrelated users.',
    },
    interview: {
      prompt: 'Why should distributed events not be ordered solely by wall-clock timestamps?',
      answer: 'Node clocks can differ or move after synchronization, and network arrival does not preserve creation order. Equal or misleading timestamps cannot establish causality reliably. I would use authoritative per-entity versions, broker partition offsets, or logical metadata for the required scope, and reserve wall time for display, retention, or approximate correlation.',
    },
  },
} satisfies Record<string, FdeLessonDetails>