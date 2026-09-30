import type { SoftwareLessonDetails } from './software-core-lesson-types'

export const softwareOperationsLessonDetails = {
  'Reproduce first': {
    explanation: [
      'Reproducing a bug means finding a repeatable sequence that produces the reported failure. Record the input, environment, account state, timing, and observed output so the problem becomes an experiment instead of a vague report.',
      'Start with the closest safe copy of the failing conditions, then vary one condition at a time. If the failure is intermittent, repeat the run and track how often it occurs; a reproduction can be probabilistic as long as its rate is measurable.',
    ],
    whyItMatters: 'A repeatable failure gives you a baseline for testing hypotheses and proves whether a proposed fix changes the behavior without relying on memory or luck.',
    useCases: [
      'Replay a failed checkout request with the same payload and feature flags in staging',
      'Run a mobile crash flow on the reported operating system and application version',
      'Repeat a scheduled job with the same time zone and source file that caused a bad report',
    ],
    workedExample: {
      scenario: 'A customer reports that applying a coupon sometimes makes checkout return a 500 response, but ordinary test orders succeed.',
      steps: [
        'Find the failed request by its request ID and record the coupon, currency, cart items, account type, application version, and response.',
        'Replace customer identifiers with safe test values while preserving the shape and relationships of the original request.',
        'Replay the request against staging with the same coupon configuration and confirm that the 500 response occurs.',
        'Remove one cart condition at a time and record that the failure occurs whenever a discounted item already has a manual price override.',
        'Turn the smallest reliable replay into an automated regression test before changing the pricing code.',
      ],
      result: 'The team changes an intermittent report into a failing test that consistently exposes the interaction between coupons and manual price overrides.',
    },
    interview: {
      prompt: 'A production bug happened once and you cannot reproduce it locally. What do you do next?',
      answer: 'I would not guess at a fix. I would gather the exact request, release version, configuration, dependency responses, timing, and correlated logs, while removing sensitive data. I would replay those conditions in the safest representative environment, measure the failure rate if it is intermittent, and add targeted instrumentation for missing facts. Once I can distinguish a few hypotheses, I would vary one factor at a time and preserve the smallest failing case as a regression test.',
    },
  },
  'Minimize the case': {
    explanation: [
      'A minimal failing case contains only the data and operations needed to trigger a defect. You reach it by removing fields, records, services, and steps while checking after every removal that the same failure still occurs.',
      'Minimization reveals which details are causal and which are noise. It also makes the problem faster to run, easier to share, and less likely to expose private production data.',
    ],
    whyItMatters: 'Small reproductions shorten the feedback loop and often make the broken assumption visible before any debugger or large log search is needed.',
    useCases: [
      'Reduce a large CSV import to the two rows that trigger a duplicate-key failure',
      'Strip a failing API request to the one optional field that breaks validation',
      'Replace a full user interface flow with the direct function call that still corrupts state',
    ],
    workedExample: {
      scenario: 'A 20,000-row employee import fails near the end with a database uniqueness error, but the source file appears to contain unique employee IDs.',
      steps: [
        'Split the file in half and import each half into a clean test database to identify the half that still fails.',
        'Continue halving the failing subset until only two records are required to reproduce the error.',
        'Compare every normalized field and discover that two distinct emails become identical after trimming and lowercasing.',
        'Create a two-row fixture and a test that expects a clear duplicate-email validation error before insertion.',
      ],
      result: 'A slow, noisy import failure becomes a two-record test that identifies email normalization as the relevant operation.',
    },
    interview: {
      prompt: 'Why should you minimize a failure after you already know how to reproduce it?',
      answer: 'The first reproduction may contain many unrelated variables, so it can support the wrong explanation. I remove inputs and steps one at a time, keeping only changes that preserve the failure. The resulting case runs faster, protects sensitive data, and shows which condition is necessary. It also becomes a focused regression test that future maintainers can understand.',
    },
  },
  'Structured logging': {
    explanation: [
      'Structured logs store events as named fields rather than one formatted sentence. A useful event includes a stable event name, severity, timestamp, request or trace ID, relevant entity IDs, outcome, duration, and an error classification.',
      'Choose fields that let operators filter and group events, and keep their names consistent across services. Do not log passwords, tokens, payment details, or unnecessary personal data; log safe identifiers and explicit error categories instead.',
    ],
    whyItMatters: 'Consistent fields turn logs into queryable evidence, allowing a team to follow one operation, compare failure rates, and alert on meaningful conditions without parsing changing prose.',
    useCases: [
      'Follow one order through an API, queue, and background worker using a trace ID',
      'Count payment failures by provider and error category during an incident',
      'Measure job duration by tenant without recording tenant secrets or customer payloads',
    ],
    workedExample: {
      scenario: 'A notification worker retries failed deliveries, but its current log only says "send failed" and gives support no way to locate the affected notification.',
      steps: [
        'Define a notification_delivery_failed event with notification_id, tenant_id, trace_id, channel, attempt, error_code, and duration_ms fields.',
        'Pass the trace ID from the API request into the queued job so related events share one correlation value.',
        'Map raw provider errors to stable internal error codes and exclude recipient addresses and provider credentials.',
        'Query failures by error_code and attempt to verify that operators can distinguish rate limits from invalid destinations.',
      ],
      code: {
        language: 'TypeScript',
        code: `logger.warn('notification_delivery_failed', {
  notification_id: job.notificationId,
  tenant_id: job.tenantId,
  trace_id: job.traceId,
  channel: 'email',
  attempt: job.attempt,
  error_code: classifyProviderError(error),
  duration_ms: Date.now() - startedAt,
})`,
      },
      result: 'Support can locate every event for one notification, while operations can see that most retries come from provider rate limits rather than invalid addresses.',
    },
    interview: {
      prompt: 'What would you include in a structured log for a failed payment, and what would you exclude?',
      answer: 'I would include a stable event name, timestamp, severity, request and trace IDs, an internal payment ID, tenant or account ID when safe, provider name, operation, attempt, duration, outcome, and a normalized error code. I would exclude card numbers, security codes, access tokens, full request bodies, and unnecessary personal data. The fields should be documented and consistent so they support queries and alerts across services.',
    },
  },
  'Debugger inspection': {
    explanation: [
      'A debugger pauses a running program so you can inspect values, call frames, and control flow at the moment an assumption stops being true. Place breakpoints near a meaningful state transition instead of stepping through the whole program from its first line.',
      'Conditional breakpoints and watch expressions are especially useful when a bug appears only for one record or iteration. Inspecting state should test a specific hypothesis, such as whether a total becomes negative before or after a discount is applied.',
    ],
    whyItMatters: 'Direct runtime inspection can settle questions that static reading cannot, especially when mutable state, framework callbacks, or unfamiliar data shapes are involved.',
    useCases: [
      'Pause only when an inventory count falls below zero in a batch loop',
      'Inspect the call stack when a component receives an unexpected undefined value',
      'Watch an object before and after a library callback mutates it',
    ],
    workedExample: {
      scenario: 'An invoice total becomes negative for one order in a batch, although all visible line-item prices are positive.',
      steps: [
        'Set a conditional breakpoint on the total update where order.id matches the failing order and total is less than zero.',
        'Inspect the current line item, discount value, previous total, and call stack when the breakpoint is reached.',
        'Use a watch expression for discount.amount > subtotal and observe that a fixed discount is applied twice after a retry callback.',
        'Move the breakpoint to the retry boundary and confirm that the same mutable invoice object enters calculation for a second time.',
        'Add a regression test that calculates from immutable inputs and asserts the exact total across a retried operation.',
      ],
      result: 'The debugger shows the first incorrect transition and ties it to repeated mutation during retry, rather than to negative source prices.',
    },
    interview: {
      prompt: 'How do you use a debugger without aimlessly stepping through thousands of lines?',
      answer: 'I begin with a falsifiable hypothesis and identify the nearest point where a value changes from valid to invalid. I set a conditional breakpoint there, inspect only the relevant values and stack frames, and compare them with the expected invariant. Depending on the evidence, I move one boundary earlier or later. Once the cause is clear, I capture it with an automated test rather than relying on another debugging session.',
    },
  },
  'Stack traces': {
    explanation: [
      'A stack trace lists the active function calls when an error was created or reported. Read the error type and message first, then find the first frame owned by your application and follow the calls outward to understand how execution reached the failure.',
      'Framework and wrapper frames provide context, but the top line is not always the root cause. For asynchronous work, preserve the original error as a cause and use trace IDs because a queue or network boundary may separate related stacks.',
    ],
    whyItMatters: 'Reading traces systematically narrows a failure to an operation and call path, while preserving causes prevents useful evidence from being replaced by a generic wrapper error.',
    useCases: [
      'Locate the application function that passed an invalid value into a framework',
      'Distinguish a database timeout from the repository method that merely reported it',
      'Connect an API request to a later worker failure across an asynchronous boundary',
    ],
    workedExample: {
      scenario: 'An API returns "Unable to load profile," and the trace contains controller, repository, connection-pool, and network frames.',
      steps: [
        'Read the final error and its cause chain, noting that the lowest cause is a connection acquisition timeout.',
        'Find the first application frame, ProfileRepository.load, and inspect how it obtains and releases connections.',
        'Compare neighboring request traces and observe that ExportRepository holds connections while uploading files.',
        'Reproduce pool exhaustion with concurrent profile reads and exports, then add timing around connection checkout and release.',
      ],
      code: {
        language: 'TypeScript',
        code: `try {
  return await profileRepository.load(profileId)
} catch (error) {
  throw new Error('Unable to load profile', { cause: error })
}`,
      },
      result: 'The cause chain leads beyond the friendly API error to connection starvation, and measurements identify the export path that holds connections too long.',
    },
    interview: {
      prompt: 'The first application frame in a stack trace throws an error. Is that necessarily the root cause?',
      answer: 'No. That frame may only validate, translate, or report a failure created deeper in a dependency. I read the error and cause chain, identify owned frames, and reconstruct the path and boundaries involved. Then I confirm the suspected cause with runtime evidence. I also preserve original errors when wrapping them so the operational message does not erase the technical cause.',
    },
  },
  'Change isolation': {
    explanation: [
      'Change isolation finds the smallest code, configuration, data, or infrastructure change that introduced a regression. First bound the problem between a known-good and known-bad state, then test candidates systematically instead of reading every change at once.',
      'Binary search tools such as git bisect are effective when each revision can be tested reliably. Feature flags, dependency locks, deployment records, and configuration history matter too because a production behavior can change without an application commit.',
    ],
    whyItMatters: 'Isolating the first bad change reduces the amount of code to understand and produces a direct comparison between working and failing behavior.',
    useCases: [
      'Bisect commits to find the release that doubled memory use',
      'Compare feature-flag states to isolate a checkout regression',
      'Lock and vary one dependency version to identify a changed parser behavior',
    ],
    workedExample: {
      scenario: 'Search latency rose from 180 ms to 700 ms sometime during the last twelve deployments, and no single release was reported as broken.',
      steps: [
        'Choose the last deployment with normal metrics as known good and the current deployment as known bad.',
        'Create a repeatable benchmark using the same anonymized query set, index snapshot, and concurrency level.',
        'Test the midpoint revision, then repeatedly choose the half containing the regression until one commit remains.',
        'Inspect that commit and find that result enrichment changed from one batch request to one request per result.',
        'Revert or repair the change and rerun the same benchmark before deploying it gradually.',
      ],
      result: 'Six benchmark runs isolate one commit that introduced N+1 network calls, and batching restores median latency to the previous range.',
    },
    interview: {
      prompt: 'How would you use git bisect safely to find a performance regression?',
      answer: 'I would first define stable good and bad revisions and create an automated benchmark with controlled data, warmup, concurrency, and a clear pass threshold. Bisect can then test the midpoint revisions and narrow the range. I would account for database, configuration, dependency, and infrastructure changes that Git may not capture. After identifying a commit, I would inspect and verify the mechanism rather than treating correlation as proof.',
    },
  },
  'Race conditions': {
    explanation: [
      'A race condition occurs when correctness depends on the unpredictable order of concurrent operations. Each operation may look valid alone, yet an unlucky interleaving can make both read old state and perform an effect that should happen once.',
      'Adding delays can expose a race but does not fix it. Protect the invariant at the shared boundary with an atomic update, transaction, unique constraint, lock, compare-and-set operation, or idempotency key, then test concurrent attempts.',
    ],
    whyItMatters: 'Race conditions cause rare duplicate, lost, or inconsistent results that are difficult to reproduce and become more frequent as traffic and parallelism increase.',
    useCases: [
      'Prevent two workers from claiming the same queued job',
      'Stop concurrent withdrawals from spending the same account balance',
      'Ensure repeated payment requests create one charge',
    ],
    workedExample: {
      scenario: 'Two workers poll the same pending job, both see it as available, and both send the customer the same report.',
      steps: [
        'Run two worker calls behind a barrier so both attempt to claim the same known job at nearly the same time.',
        'Record that each worker reads status=pending before either writes status=running.',
        'Replace the separate read and write with one conditional update from pending to running that returns the claimed row.',
        'Let only the worker whose update affected one row continue; the other worker must choose another job.',
        'Run the concurrent test repeatedly and assert that exactly one delivery record exists.',
      ],
      code: {
        language: 'SQL',
        code: `UPDATE jobs
SET status = 'running', claimed_by = $1, claimed_at = NOW()
WHERE id = $2 AND status = 'pending'
RETURNING id;`,
      },
      result: 'The database makes claiming atomic, so one worker receives the job and the other observes that it claimed nothing.',
    },
    interview: {
      prompt: 'Why is checking whether a job is pending and then updating it not enough to prevent duplicate work?',
      answer: 'The check and update are two separate operations, so two workers can both pass the check before either update is visible. I would combine the state check and transition in one atomic database statement or transaction and continue only when that operation wins. For external effects, I would also use an idempotency key or unique constraint because a worker can crash after the effect but before marking the job complete.',
    },
  },
  'Performance diagnosis': {
    explanation: [
      'Performance diagnosis begins by defining the slow operation, workload, and metric: latency percentile, throughput, CPU time, memory, I/O, or query count. Measure where time and resources go before choosing an optimization.',
      'Break the request into stages and use profiles, traces, query plans, and controlled benchmarks to test likely bottlenecks. Compare representative inputs and concurrency because a fast single request can behave very differently under load.',
    ],
    whyItMatters: 'Measurement prevents expensive changes to the wrong layer and provides a baseline that shows whether an optimization improved user-visible behavior.',
    useCases: [
      'Use a query plan to investigate a slow tenant activity feed',
      'Profile CPU time when report generation blocks other requests',
      'Trace API stages to separate network waits from serialization work',
    ],
    workedExample: {
      scenario: 'A dashboard API takes 2.4 seconds at the 95th percentile, and the team assumes the database is responsible.',
      steps: [
        'Capture a trace that separates authentication, database queries, aggregation, serialization, and network calls.',
        'Run the endpoint with representative rows and concurrency while recording query count, CPU profile, and response size.',
        'Observe that database work takes 180 ms but JSON serialization takes 1.6 seconds for an unbounded event list.',
        'Add pagination and return summary fields for the initial view instead of serializing every event.',
        'Repeat the same load test and compare p50, p95, CPU, and payload size with the baseline.',
      ],
      result: 'The evidence rejects the database hypothesis; bounded responses reduce p95 latency to 420 ms and cut response size by 88 percent.',
    },
    interview: {
      prompt: 'An endpoint is slow. What information do you collect before optimizing it?',
      answer: 'I define which requests are slow, at which percentile and load, and what acceptable performance means. I capture end-to-end traces, query counts and plans, dependency timing, CPU and memory profiles, payload size, and saturation signals. I then form a hypothesis about the dominant cost, change one factor, and rerun a representative benchmark. The optimization is successful only if the target metric improves without breaking correctness or another budget.',
    },
  },
  'Production incidents': {
    explanation: [
      'During a production incident, the first goal is to reduce customer harm. Establish an incident lead, state the impact in observable terms, preserve a timeline, and choose the safest mitigation such as rollback, traffic reduction, feature disablement, or graceful degradation.',
      'Investigation continues in parallel, but a complete explanation should not delay a reversible action that restores service. Communicate known facts, decisions, owners, and the next update time without presenting guesses as conclusions.',
    ],
    whyItMatters: 'A disciplined response limits impact and coordination errors when time pressure makes untracked changes and unsupported assumptions especially dangerous.',
    useCases: [
      'Disable a failing third-party integration while preserving core checkout',
      'Roll back a release that causes elevated error rates',
      'Shed optional background work when a database is saturated',
    ],
    workedExample: {
      scenario: 'Five minutes after a release, checkout errors rise from 0.2 percent to 18 percent for customers using one payment provider.',
      steps: [
        'Declare the incident, assign an incident lead and communications owner, and record the start time, affected path, and current metrics.',
        'Compare error rates by release version and provider, confirming that the increase began with the deployment and is isolated to one provider path.',
        'Disable the new provider adapter behind its feature flag and route eligible traffic to the previous adapter.',
        'Verify recovery using checkout success rate, queue depth, payment reconciliation, and a synthetic transaction.',
        'Preserve logs and the timeline, then investigate the adapter contract and reconcile any uncertain payment attempts.',
      ],
      result: 'Checkout error rate returns below 0.3 percent within eight minutes, and uncertain payments are identified for reconciliation before deeper analysis begins.',
    },
    interview: {
      prompt: 'A new release is causing production errors, but you do not yet understand why. Do you investigate or roll back?',
      answer: 'I judge the current impact, confidence that the release is involved, rollback risk, and whether data or external effects make rollback unsafe. If rollback or a feature flag is low risk and likely to reduce harm, I mitigate first while preserving evidence. I assign clear roles, verify recovery with service and business metrics, and communicate facts on a schedule. Root-cause work follows after the system is stable.',
    },
  },
  'Root-cause analysis': {
    explanation: [
      'Root-cause analysis explains the chain of technical and organizational conditions that allowed an incident, not merely the line that threw an error. It connects the trigger, faulty assumption, system behavior, customer impact, detection, response, and missing defenses using evidence.',
      'A useful analysis avoids blame and asks why normal engineering controls did not prevent or contain the problem. Actions should address the contributing conditions and have owners and verification criteria, rather than ending with advice to be more careful.',
    ],
    whyItMatters: 'Understanding both the defect and the failed defenses produces stronger corrective actions and helps the organization learn without hiding mistakes.',
    useCases: [
      'Explain why a schema change broke an older application version during rollout',
      'Trace duplicate invoices through retries, missing idempotency, and weak alerts',
      'Analyze why expired credentials were detected only after a customer-facing outage',
    ],
    workedExample: {
      scenario: 'A deployment causes older workers to crash when they read jobs written by the new API version.',
      steps: [
        'Build a timestamped sequence from deployment records, queue metrics, error traces, alerts, and mitigation actions.',
        'Reproduce an old worker reading a job whose new required enum value it does not recognize.',
        'Identify the rollout assumption that producers and consumers would update together, although the queue allows version overlap.',
        'Explain why tests missed the defect: they covered each version alone but not a new producer with an old consumer.',
        'Assign actions for tolerant readers, contract compatibility tests, staged rollout checks, and an alert on dead-letter growth.',
      ],
      result: 'The analysis identifies incompatible message evolution plus missing mixed-version testing, leading to concrete controls instead of blaming the deployer.',
    },
    interview: {
      prompt: 'What is the difference between the immediate cause of an incident and its root cause?',
      answer: 'The immediate cause is the event closest to the failure, such as an old worker rejecting a new enum value. A useful root-cause analysis also explains why incompatible versions overlapped, why the contract allowed the change, why tests and rollout checks missed it, and why detection was late. I support that chain with evidence and choose actions that strengthen those defenses, each with an owner and a way to verify completion.',
    },
  },
  Prevention: {
    explanation: [
      'Prevention turns what a team learned from a defect into lasting controls. The strongest controls enforce correctness automatically through constraints, safer APIs, tests, deployment checks, bounded failure behavior, and monitoring.',
      'Not every risk deserves the same investment, so prioritize actions by expected impact, recurrence likelihood, and control cost. Training and documentation can help, but they should support rather than replace technical safeguards when automation is practical.',
    ],
    whyItMatters: 'A repair restores current behavior; prevention reduces the chance that the same failure class returns in another path, service, or future change.',
    useCases: [
      'Add a database uniqueness constraint after duplicate account creation',
      'Add contract tests and staged rollout checks after an incompatible event change',
      'Add expiration alerts and automated rotation before credentials become invalid',
    ],
    workedExample: {
      scenario: 'A retrying payment endpoint creates two charges because the first response is lost after the provider accepts the payment.',
      steps: [
        'Add a regression test that sends the same client operation ID twice and currently observes two provider calls.',
        'Require an idempotency key and store one payment operation per tenant and key under a unique database constraint.',
        'Return the stored operation result when a request repeats instead of calling the provider again.',
        'Add a metric and alert for idempotency conflicts and a reconciliation job for operations with uncertain provider state.',
        'Review other money-moving endpoints for the same missing control and track their remediation owners.',
      ],
      result: 'Repeated requests return one logical payment result, duplicate provider calls are blocked, and uncertain states become visible for reconciliation.',
    },
    interview: {
      prompt: 'After fixing a production bug, how do you decide which prevention work is necessary?',
      answer: 'I identify the broader failure class, estimate its impact and likelihood, and inspect where else the same assumption exists. I prefer controls close to the invariant, such as a database constraint or idempotent API, then add a regression test, detection, and an operational response where appropriate. Each action needs an owner and a measurable completion condition. I avoid a long wish list that does not materially reduce recurrence risk.',
    },
  },
  'Requirement clarification': {
    explanation: [
      'Requirement clarification turns broad language into observable behavior and explicit boundaries. Ask who needs the outcome, what problem they are solving, which inputs and exceptions exist, and how success will be measured.',
      'Ambiguous words such as fast, secure, real time, and scalable need numbers or examples. Write down decisions, unresolved questions, and acceptance cases so product, design, operations, and engineering are agreeing to the same behavior.',
    ],
    whyItMatters: 'Clarifying before implementation prevents technically correct work from solving the wrong problem and reveals constraints that change the design or estimate.',
    useCases: [
      'Define whether real-time status means under one second or under five minutes',
      'Specify which roles may approve, cancel, or view a contract',
      'Agree how partial failures should appear during a bulk import',
    ],
    workedExample: {
      scenario: 'A stakeholder asks for contract search to be "instant" across all customer documents.',
      steps: [
        'Ask which users search, what decisions they make, and whether they search full text, metadata, or both.',
        'Measure the current document count, growth, query frequency, permission rules, and acceptable freshness after an upload.',
        'Turn "instant" into acceptance targets: results begin within 500 ms at p95 for 95 percent of supported queries, and new documents appear within two minutes.',
        'Write examples for exact title search, phrase search, no results, permission filtering, and an index that is temporarily delayed.',
        'Confirm which targets are required for the first release and record deferred capabilities such as typo tolerance.',
      ],
      result: 'The team receives testable latency and freshness targets, a defined search scope, and permission cases that directly guide architecture and acceptance tests.',
    },
    interview: {
      prompt: 'A product manager asks you to build a scalable real-time dashboard. What do you clarify before proposing a design?',
      answer: 'I ask who uses it, what decisions it supports, which data is included, expected volume and growth, update frequency, acceptable staleness, latency target, availability need, permission model, and behavior during partial failure. I also ask what must ship first and how success will be measured. I summarize those answers as concrete examples and constraints before comparing designs.',
    },
  },
  'Tradeoff analysis': {
    explanation: [
      'Tradeoff analysis compares realistic options against named constraints instead of declaring one technology universally best. Relevant criteria can include correctness, delivery time, operating effort, latency, reliability, security, cost, reversibility, and team experience.',
      'State assumptions and quantify important differences where evidence exists. Choose an option, explain what it optimizes and what cost it accepts, then define a trigger for revisiting the decision if workload or constraints change.',
    ],
    whyItMatters: 'Explicit tradeoffs make decisions reviewable and prevent hidden priorities from appearing later as surprise cost, delay, or operational burden.',
    useCases: [
      'Choose between a managed queue and operating a queue cluster',
      'Compare synchronous validation with asynchronous review for large uploads',
      'Decide whether to build a feature internally or integrate a vendor service',
    ],
    workedExample: {
      scenario: 'A small team needs background email delivery and is deciding between a managed queue and a self-hosted broker.',
      steps: [
        'List the constraints: launch in four weeks, modest traffic, no dedicated operations role, at-least-once delivery, and a fixed monthly budget.',
        'Compare both options on delivery time, failure handling, monitoring, scaling, maintenance, portability, and projected cost at current and tenfold volume.',
        'Run a small managed-queue test to verify message size, retry, dead-letter, and local development needs.',
        'Choose the managed queue because reduced operational work outweighs current service cost and vendor dependency.',
        'Record a review trigger if throughput or cost exceeds the modeled threshold for three consecutive months.',
      ],
      result: 'The decision is tied to present constraints and includes accepted drawbacks plus a measurable point at which the team will reconsider it.',
    },
    interview: {
      prompt: 'How would you explain choosing a managed service when it costs more per request than self-hosting?',
      answer: 'I would compare total cost, not only unit price. That includes engineering time, upgrades, backups, monitoring, incident response, security work, and the cost of delayed delivery. I would state the reliability and portability tradeoffs, use expected traffic rather than an imaginary maximum, and identify a threshold where the economics change. The choice is defensible when it fits the current constraints and has a revisit trigger.',
    },
  },
  'Scalability basics': {
    explanation: [
      'Scalability is the ability to handle growth in users, data, or work while meeting correctness and service targets. Begin with a workload model and measured bottleneck, then consider more efficient algorithms, batching, caching, asynchronous work, vertical scaling, or horizontal scaling.',
      'Scaling one component can move pressure to another, so track limits across the full path. Stateless workers are easier to add, while shared databases, hot keys, ordering requirements, and external rate limits often become the real constraints.',
    ],
    whyItMatters: 'Understanding where capacity is consumed helps a system grow deliberately without adding distributed complexity before the workload requires it.',
    useCases: [
      'Add workers when queued jobs wait longer than the service target',
      'Batch database writes for a high-volume event importer',
      'Partition tenant work after measuring a hot shared queue',
    ],
    workedExample: {
      scenario: 'One report worker processes 20 jobs per minute, while peak demand has grown to 80 jobs per minute and the queue delay exceeds 30 minutes.',
      steps: [
        'Measure arrival rate, service time, CPU, memory, database load, external API limits, and the target queue delay.',
        'Confirm that jobs are independent and the worker stores no required process-local state between jobs.',
        'Make job claiming atomic and outputs idempotent so several workers can process safely.',
        'Increase workers gradually while watching queue age, database connections, API rate limits, and failure rate.',
        'Set autoscaling thresholds on queue age with maximum worker limits that protect downstream systems.',
      ],
      result: 'Four workers keep peak queue delay under three minutes, while downstream limits and idempotent processing prevent scaling from creating duplicate reports.',
    },
    interview: {
      prompt: 'Traffic is expected to grow tenfold. Would you immediately split a monolith into microservices?',
      answer: 'No. I would model the expected workload and measure current capacity by operation. A tenfold increase may be handled by indexing, caching, batching, a larger instance, or more stateless replicas. I would introduce a service boundary only where independent scaling, ownership, reliability, or deployment needs justify its network and operational cost. I would load test the chosen path and watch the next bottleneck.',
    },
  },
  Reliability: {
    explanation: [
      'Reliability means a system continues to provide the promised behavior over time, including when dependencies slow down or fail. Define that promise with measurable indicators such as successful request rate, latency, durability, and recovery time.',
      'Use timeouts, bounded retries, redundancy, idempotency, backpressure, health checks, backups, and graceful degradation according to the failure being handled. Every mechanism has limits: retries can amplify an outage, and redundancy helps only when replicas do not share the same failure mode.',
    ],
    whyItMatters: 'Failures are normal in production, so explicit reliability design prevents one slow dependency or machine failure from becoming a complete and prolonged outage.',
    useCases: [
      'Serve cached recommendations when the ranking service is unavailable',
      'Retry an idempotent read with backoff after a transient network timeout',
      'Restore a database from a tested backup after accidental data loss',
    ],
    workedExample: {
      scenario: 'A recommendation service occasionally takes 12 seconds, causing product pages to wait until users abandon them.',
      steps: [
        'Set a 250 ms recommendation timeout based on the page latency budget and measure timeout frequency.',
        'Return recently cached recommendations or popular products when the dependency exceeds the timeout.',
        'Limit concurrent calls so a slow dependency cannot consume every application connection.',
        'Retry only safe background refreshes with exponential backoff and jitter, not the already time-limited page request.',
        'Alert on fallback rate and verify that the core product page remains available during a dependency failure test.',
      ],
      result: 'Product pages remain below their latency target during recommendation outages, while fallback metrics make degraded quality visible to operators.',
    },
    interview: {
      prompt: 'When can retries make reliability worse?',
      answer: 'Retries make things worse when the failure is persistent, the operation is not idempotent, or many clients retry together and add load to an already saturated dependency. I use short timeouts, a limited retry budget, exponential backoff with jitter, and only retry errors likely to be transient. I also consider backpressure, circuit breaking, or degraded behavior and measure retry volume separately from successful user work.',
    },
  },
  'Security by default': {
    explanation: [
      'Security by default means the ordinary path grants the least access, accepts only validated input, protects sensitive data, and fails closed. A developer should have to make an explicit, reviewed choice to broaden trust or exposure.',
      'Apply controls in layers: strong identity, server-side authorization, secure secret storage, encrypted transport, safe output handling, dependency updates, audit events, and limited retention. Treat every external input and client-side claim as untrusted even when the interface normally produces valid values.',
    ],
    whyItMatters: 'Secure defaults reduce the number of places where one forgotten check or copied configuration can expose data or privileged operations.',
    useCases: [
      'Give a reporting process read-only access to one database schema',
      'Deny access to a new endpoint until an authorization policy is attached',
      'Reject unexpected request fields and escape user content before rendering it',
    ],
    workedExample: {
      scenario: 'A new contract download endpoint currently fetches a document by ID after checking only that the caller is signed in.',
      steps: [
        'Define the rule that callers may download only contracts belonging to an organization where they hold a permitted role.',
        'Resolve organization membership from trusted server-side data instead of accepting an organization ID claim from the browser.',
        'Query the contract through the authorized organization scope so an unrelated document ID returns the same not-found response.',
        'Use short-lived download URLs, avoid logging document contents, and record a safe audit event for successful downloads.',
        'Test allowed access, cross-organization access, removed membership, guessed IDs, and expired download URLs.',
      ],
      result: 'Knowing or changing a contract ID no longer bypasses tenant boundaries, and successful downloads leave a minimal audit record without exposing document contents.',
    },
    interview: {
      prompt: 'Why is hiding an admin button not sufficient authorization?',
      answer: 'The client is under the user control, so a caller can send the underlying request without the button. The server must authenticate the caller and authorize the exact action against trusted resource and membership data on every protected boundary. The interface can hide unavailable actions for usability, but it is not a security control. I would also test direct requests with insufficient roles and cross-tenant identifiers.',
    },
  },
  Observability: {
    explanation: [
      'Observability is the ability to understand system behavior from the signals it emits. Logs explain discrete events, metrics show trends and rates, and traces connect work across components; together they should answer what failed, where, for whom, and since when.',
      'Instrument important user and business operations rather than collecting every possible detail. Use consistent service names, trace IDs, error categories, and latency measurements, then build alerts around symptoms that require action and dashboards that support investigation.',
    ],
    whyItMatters: 'Good signals reduce detection and diagnosis time, reveal gradual degradation, and show whether a deployment or mitigation changed actual user outcomes.',
    useCases: [
      'Trace a contract upload from the API through scanning and indexing',
      'Alert when successful checkout rate drops below its service target',
      'Compare p95 latency and error rate before and after a deployment',
    ],
    workedExample: {
      scenario: 'Users report that uploaded contracts sometimes never appear in search, but each service dashboard looks healthy.',
      steps: [
        'Create one trace ID at upload and propagate it through storage, scan, queue, indexing, and search-visibility events.',
        'Record counters for accepted, scanned, indexed, failed, and dead-lettered documents plus the age of the oldest pending item.',
        'Add structured failure events with document ID, tenant ID, stage, safe error code, and retry count.',
        'Build a trace view that shows one document stopping after scanning and a metric alert when accepted minus indexed documents grows.',
        'Test the signals by forcing an indexing failure and confirm that the alert and trace identify the affected stage and document.',
      ],
      result: 'Operators discover expired indexing credentials within minutes and can list affected documents for replay instead of checking services independently.',
    },
    interview: {
      prompt: 'What is the difference between logs, metrics, and traces, and how would you use them together?',
      answer: 'Metrics efficiently show aggregate health and trends, such as error rate, latency percentiles, and queue age. Logs provide detailed events and context for specific failures. Traces show how one operation travels through services and where time or errors occur. I would alert on a user-impacting metric, use a representative trace to locate the failing stage, and inspect correlated structured logs for the detailed cause.',
    },
  },
  'Performance budgets': {
    explanation: [
      'A performance budget assigns measurable limits to the parts of an experience, such as end-to-end latency, response size, query count, memory, or startup time. The limits should come from user needs and realistic device, network, and traffic conditions.',
      'Divide the overall target among components so teams can reason about local changes without losing the full experience. Measure percentiles instead of averages where tail latency matters, enforce stable checks in continuous integration where practical, and investigate trends before the budget is exhausted.',
    ],
    whyItMatters: 'Budgets turn "keep it fast" into an engineering constraint that can guide design, expose regressions, and force explicit tradeoffs before users feel the accumulated cost.',
    useCases: [
      'Limit a search API to 300 ms at p95 within a one-second interaction target',
      'Cap the initial JavaScript payload for users on slow mobile networks',
      'Set a maximum query count for rendering an order history page',
    ],
    workedExample: {
      scenario: 'The team wants contract search results to feel responsive within one second for typical remote users.',
      steps: [
        'Define the measured journey from submitted query to useful results rendered, using a representative network and data set.',
        'Allocate 120 ms to network transit, 300 ms to server search, 180 ms to enrichment, 200 ms to transfer and rendering, and retain 200 ms of margin.',
        'Instrument each stage and run repeated tests at expected concurrency, reporting p50 and p95 rather than one local run.',
        'Add a review check when server p95 exceeds 300 ms or the first-result payload exceeds its size limit.',
        'When enrichment grows beyond budget, defer nonessential metadata until after initial results rather than silently raising the target.',
      ],
      result: 'The team can identify which stage owns a regression and keeps the measured p95 interaction at 870 ms under the defined workload.',
    },
    interview: {
      prompt: 'How do you choose a performance budget instead of inventing an arbitrary number?',
      answer: 'I start with the user task, research or measure where delay changes behavior, and account for realistic devices, networks, data volumes, and concurrency. I define the percentile and test conditions, then allocate the end-to-end target across components with some margin. Existing baselines and business needs help set an achievable first target. I review the budget when evidence or product requirements change, not merely when implementation exceeds it.',
    },
  },
  Documentation: {
    explanation: [
      'Useful documentation helps a specific reader complete a task or understand a decision. Keep setup instructions, public contracts, architectural decisions, and operational recovery close to the code or service that owns them.',
      'Document why a non-obvious choice exists, its constraints, examples, failure behavior, and how to verify the result. Test commands and links where possible, assign ownership, and remove stale instructions because incorrect documentation is often worse than missing documentation.',
    ],
    whyItMatters: 'Current, task-focused documentation reduces repeated discovery work and allows people to operate or change a system without depending on one person remembering its history.',
    useCases: [
      'Write a setup guide that takes a new developer from checkout to a verified local run',
      'Record an architecture decision and the conditions that would justify revisiting it',
      'Maintain a runbook for detecting, mitigating, and verifying queue backlog recovery',
    ],
    workedExample: {
      scenario: 'Only one engineer knows how to recover failed document-indexing jobs, and incident response waits for that person.',
      steps: [
        'Observe a recovery with the engineer and record prerequisites, permissions, commands, expected output, and irreversible risks.',
        'Organize the runbook by detection, impact check, mitigation, replay, verification, escalation, and rollback.',
        'Replace ambiguous instructions such as "check the queue" with exact metrics and thresholds that distinguish delay from failure.',
        'Have another engineer follow the runbook in a staging failure exercise without verbal help.',
        'Fix every unclear step and assign the indexing team as owner with a review after relevant system changes.',
      ],
      result: 'A second engineer restores a staged backlog and verifies search visibility using the runbook alone, exposing and resolving two missing permission details.',
    },
    interview: {
      prompt: 'What belongs in an architecture decision record?',
      answer: 'I include the decision context, constraints, realistic options, chosen option, important tradeoffs, consequences, status, and date. I also record evidence and a trigger for reconsideration when one exists. The record should explain why the choice made sense at the time, not claim it is permanently best. It should link to the owning system and remain concise enough that reviewers will maintain it.',
    },
  },
  Reviewability: {
    explanation: [
      'Reviewability is how easily another person can understand a change, assess its risks, and verify its behavior. Keep one coherent purpose per change, use clear names and commits, and separate mechanical movement from behavior changes when that distinction helps the reviewer.',
      'A strong review description states the problem, approach, alternatives that matter, risky boundaries, tests, rollout, and visual or operational evidence. Small does not mean incomplete; migrations, compatibility, monitoring, and rollback still need to be visible.',
    ],
    whyItMatters: 'Reviewable changes receive deeper feedback, merge with fewer misunderstandings, and are easier to diagnose or reverse when production behavior differs from expectations.',
    useCases: [
      'Split a database expansion from the application change that begins using it',
      'Provide before-and-after evidence for a performance optimization',
      'Keep generated formatting changes separate from a business-rule fix',
    ],
    workedExample: {
      scenario: 'A pull request mixes a contract status migration, an interface redesign, dependency upgrades, and a bug fix across 70 files.',
      steps: [
        'Identify the urgent outcome: prevent an invalid transition from approved back to draft.',
        'Extract a focused change containing the state rule, database protection, regression tests, and a short rollout note.',
        'Move the schema expansion into an earlier compatible change if deployment versions need to overlap.',
        'Defer the visual redesign and unrelated upgrades to separately described changes with their own verification.',
        'Add a review summary that names the invariant, affected paths, test evidence, monitoring signal, and rollback approach.',
      ],
      result: 'Reviewers can verify the state-transition fix independently, while the unrelated work no longer hides its risk or delays the urgent correction.',
    },
    interview: {
      prompt: 'A feature requires changes across the database, API, and user interface. How do you keep it reviewable?',
      answer: 'I organize the work around compatible, independently verifiable steps rather than forcing every layer into one large diff. For example, I can expand the schema first, add API behavior behind a flag, then expose the interface and later remove old paths. Each change states its contract, risks, tests, and deployment order. I avoid splitting so finely that an intermediate state is broken or impossible to reason about.',
    },
  },
  Estimation: {
    explanation: [
      'An engineering estimate is a range based on understood scope, dependencies, uncertainty, implementation, validation, rollout, and coordination. Break work into outcomes and investigation tasks, then identify assumptions that could materially change the range.',
      'Communicate confidence and update the estimate when evidence changes. A short time-boxed discovery can be the honest next step when an external API, legacy behavior, or data migration is too uncertain for a responsible delivery estimate.',
    ],
    whyItMatters: 'Transparent ranges help teams make scope and sequencing decisions while avoiding false precision that hides risk until the deadline.',
    useCases: [
      'Estimate an integration after separating vendor discovery from implementation',
      'Include migration rehearsal and rollback work in a database change estimate',
      'Offer a smaller first release when the full workflow has high uncertainty',
    ],
    workedExample: {
      scenario: 'A client asks when a new identity-provider integration can ship, but the provider documentation omits group membership behavior.',
      steps: [
        'Break the work into protocol setup, account linking, group mapping, user interface, security review, tests, deployment, and client acceptance.',
        'Mark group mapping and client access to a test tenant as high-uncertainty dependencies rather than assigning hidden padding.',
        'Propose a two-day technical spike to authenticate a test user, inspect claims, and verify refresh and logout behavior.',
        'Estimate the basic sign-in path separately from optional group synchronization and give a range with stated staffing assumptions.',
        'Update the range after the spike and report any scope or dependency change immediately.',
      ],
      result: 'Stakeholders receive a defensible range for basic sign-in, a separate estimate for group mapping, and a clear decision point after the technical spike.',
    },
    interview: {
      prompt: 'How do you estimate a project when a major dependency is unfamiliar?',
      answer: 'I separate known implementation work from the unknown dependency and list the assumptions that matter. I time-box a discovery task with a concrete question and artifact, such as a working authentication proof and documented failure cases. I provide a range and confidence level for the remaining work, include testing and rollout, and offer scope options. I revise the estimate when the discovery produces evidence rather than protecting an obsolete number.',
    },
  },
  Ownership: {
    explanation: [
      'Engineering ownership covers the outcome from problem discovery through design, delivery, operation, and learning. An owner coordinates dependencies, makes risks visible, verifies adoption and production behavior, and follows unresolved issues rather than merely completing assigned code.',
      'Ownership does not mean doing every task alone or hiding uncertainty. It means finding the right collaborators, escalating with context and options, documenting decisions, and leaving the system easier to operate and change.',
    ],
    whyItMatters: 'Software creates value only when it works for users in production, so ownership closes the gaps between implementation, rollout, support, and improvement.',
    useCases: [
      'Monitor a feature rollout and pause it when an error budget is exceeded',
      'Coordinate product, security, and support before changing account recovery',
      'Turn repeated support reports into a measured product and engineering fix',
    ],
    workedExample: {
      scenario: 'A new bulk contract upload feature passes tests and ships, but users abandon many uploads without reporting an error.',
      steps: [
        'Review funnel metrics and support sessions to locate the step where users stop and identify affected file sizes and formats.',
        'Reproduce the flow on representative networks and discover that validation appears frozen during long uploads.',
        'Work with product and design to add progress, cancellability, and clear row-level validation results while preserving safe server limits.',
        'Roll out to a small group and compare completion rate, processing failures, support contacts, and server load with the baseline.',
        'Document operational limits, update support guidance, and schedule a review of remaining abandonment causes.',
      ],
      result: 'Upload completion rises from 61 percent to 89 percent without increasing server errors, and support can explain limits using current operational guidance.',
    },
    interview: {
      prompt: 'Tell me what ownership looks like after your code has been merged.',
      answer: 'I verify that deployment and migration completed, watch technical and user outcome metrics, and confirm that support and operations have what they need. I compare the result with the acceptance criteria, investigate unexpected behavior, and adjust or roll back when risk exceeds the plan. I also close follow-up actions, document decisions, and share what the team learned. The work is complete when the intended outcome is operating reliably, not when the pull request merges.',
    },
  },
} satisfies Record<string, SoftwareLessonDetails>