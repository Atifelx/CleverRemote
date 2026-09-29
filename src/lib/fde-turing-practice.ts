import { getHistoricalPracticeQuestion } from './historical-practice-questions'
import type { StagePractice } from './practice-model'

export const fdeTuringPractice: StagePractice[] = [
  {
    stageId: 'profile-signal',
    competency: 'Turing needs a profile that proves customer-facing ownership, not a list of technologies. Your evidence should make the problem, your decisions, and the measured result easy to verify.',
    preparation: [
      'Choose projects where you personally moved a customer or business outcome.',
      'Build each story around context, ownership, concrete actions, result, and reflection.',
      'Connect your motivation for FDE work and Turing to specific past experience.',
    ],
    completionRule: 'Pass all four story drills at 70% or better against their weighted rubrics.',
    questions: [
      {
        id: 'be-201',
        source: 'data/questions/25-behavioral.json',
        kind: 'rubric',
        difficulty: 'medium',
        topic: 'End-to-end ownership',
        timeMinutes: 5,
        prompt: 'Tell me about a project you owned end-to-end. Keep the spoken answer to 60-90 seconds.',
        referenceAnswer: 'Situation: An onboarding funnel dropped 40% of users at step three. Task: I owned reducing that loss. Action: I used session replays to find three friction points, prototyped fixes in a week, and A/B tested them one at a time. Result: Drop-off fell from 40% to 18% in six weeks, adding about $300k ARR. Reflection: Session replay is now my first move on a funnel problem.',
        criteria: [
          { label: 'Fits comfortably within 90 seconds when spoken', weight: 2 },
          { label: 'Opens with a crisp one- or two-sentence situation', weight: 1 },
          { label: 'Defines your personal ownership and task', weight: 2 },
          { label: 'Names three or four concrete actions using "I"', weight: 3 },
          { label: 'Quantifies the result', weight: 3 },
          { label: 'Ends with one clear lesson', weight: 1 },
        ],
        minimumAnswerLength: 120,
      },
      {
        id: 'pd-101',
        source: 'data/questions/26-project-deep-dive.json',
        kind: 'rubric',
        difficulty: 'medium',
        topic: 'Project impact',
        timeMinutes: 5,
        prompt: 'Tell me about the most impactful project you have worked on. Practice your answer in two to three minutes.',
        referenceAnswer: 'At Acme Corp, I led backend work for a real-time messaging feature serving 400k daily users. Messages arrived four to eight seconds late, complaints were rising, and churn was increasing. I redesigned delivery by replacing polling with WebSockets and adding Redis Pub/Sub for fan-out. P95 latency fell from six seconds to under 200ms and complaint tickets dropped 70% in the next sprint cycle. I learned to instrument before optimizing: profiling showed HTTP polling, not the database, was the bottleneck.',
        criteria: [
          { label: 'Orients the listener with company, product, and scale', weight: 2 },
          { label: 'States what was broken, missing, or needed', weight: 2 },
          { label: 'Uses "I" to own specific contributions', weight: 3 },
          { label: 'Quantifies impact with credible numbers', weight: 3 },
          { label: 'Ends with a lesson or changed practice', weight: 2 },
          { label: 'Stays concise enough for three minutes', weight: 2 },
        ],
        minimumAnswerLength: 180,
      },
      {
        id: 'be-209',
        source: 'data/questions/25-behavioral.json',
        kind: 'rubric',
        difficulty: 'medium',
        topic: 'FDE motivation',
        timeMinutes: 5,
        prompt: 'Why Forward Deployed Engineering rather than a regular software engineering role?',
        referenceAnswer: 'For the last three years, I have either sat with customers or built for internal teams with the same tight feedback loop. I like that the work starts messy - real data, organizational constraints, and real deadlines - and ends with something that works in the customer environment, not only mine. FDE makes that the whole job. Turing is relevant to me because its client matching model puts that ownership into varied, high-impact environments.',
        criteria: [
          { label: 'Connects the answer to specific customer-facing work', weight: 3 },
          { label: 'Names ambiguity, ownership, and direct impact', weight: 3 },
          { label: 'Avoids generic claims such as "I like hard problems"', weight: 3 },
          { label: 'Explains why Turing is a relevant route for this work', weight: 3 },
        ],
        minimumAnswerLength: 120,
      },
      {
        id: 'be-210',
        source: 'data/questions/25-behavioral.json',
        kind: 'rubric',
        difficulty: 'medium',
        topic: 'Turing motivation',
        timeMinutes: 5,
        prompt: 'Why Turing specifically?',
        referenceAnswer: 'I have two specific reasons. First, Turing gives vetted engineers access to global teams where they can own meaningful delivery rather than isolated tasks; that matches how I have produced my best work. Second, the emphasis on technical vetting and role matching fits my background in customer-facing integration work. I want to be selected for a concrete client problem where I can clarify ambiguity, ship, and stay accountable for adoption.',
        criteria: [
          { label: 'Cites specific aspects of Turing rather than generic prestige', weight: 3 },
          { label: 'Connects those aspects to your own background', weight: 3 },
          { label: 'Explains the value you intend to deliver for a matched client', weight: 2 },
        ],
        minimumAnswerLength: 100,
      },
    ],
  },
  {
    stageId: 'problem-solving',
    competency: 'Turing’s qualification includes a role-aligned tech-stack test and live coding challenge. Prepare both production-minded implementation and representative data-structure and algorithm fundamentals without assuming a separate DSA-only round.',
    preparation: [
      'State constraints and failure cases before coding.',
      'Review hash maps, arrays, strings, complexity, and common data-structure patterns.',
      'Use the final minutes to test edge cases and narrate operational behavior.',
    ],
    completionRule: 'Submit a solution or debug plan for each drill, compare it with the benchmark, and score 70% or better.',
    questions: [
      getHistoricalPracticeQuestion('de-019'),
      {
        id: 'lct-603',
        source: 'data/questions/27-live-coding-take-home.json',
        kind: 'code-review',
        difficulty: 'medium',
        topic: 'NDJSON transformation',
        timeMinutes: 25,
        prompt: 'Process a 50GB NDJSON file line by line, keep records where price is greater than 100, and write valid NDJSON output.',
        referenceAnswer: `const fs = require('fs')
const readline = require('readline')

async function filter(inputPath, outputPath) {
  const lines = readline.createInterface({ input: fs.createReadStream(inputPath) })
  const output = fs.createWriteStream(outputPath)

  for await (const line of lines) {
    try {
      const record = JSON.parse(line)
      if (record.price > 100 && !output.write(JSON.stringify(record) + '\\n')) {
        await new Promise((resolve) => output.once('drain', resolve))
      }
    } catch {
      // Record or report malformed lines according to the product requirement.
    }
  }
  output.end()
}`,
        criteria: [
          { label: 'Processes input incrementally with bounded memory', weight: 3 },
          { label: 'Parses and emits one valid NDJSON record per line', weight: 2 },
          { label: 'Defines behavior for malformed records', weight: 2 },
          { label: 'Waits for drain when the output applies backpressure', weight: 3 },
          { label: 'Closes the output and accounts for stream errors', weight: 2 },
        ],
        minimumAnswerLength: 180,
      },
      {
        id: 'lct-605',
        source: 'data/questions/27-live-coding-take-home.json',
        kind: 'code-review',
        difficulty: 'medium',
        topic: 'Timeout and retry',
        timeMinutes: 15,
        prompt: 'Implement fetch with an AbortController timeout. Retry a timed-out request up to three total attempts.',
        referenceAnswer: `async function fetchWithTimeout(url, timeoutMs = 5000, attempts = 3) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      return await fetch(url, { signal: controller.signal })
    } catch (error) {
      const isTimeout = error instanceof Error && error.name === 'AbortError'
      if (!isTimeout || attempt === attempts - 1) throw error
    } finally {
      clearTimeout(timer)
    }
  }
  throw new Error('Unreachable')
}`,
        criteria: [
          { label: 'Creates a fresh controller and timeout for every attempt', weight: 3 },
          { label: 'Always clears the timeout', weight: 3 },
          { label: 'Retries timeout failures without swallowing unrelated errors', weight: 3 },
          { label: 'Stops after three total attempts and surfaces the final error', weight: 2 },
        ],
        minimumAnswerLength: 140,
      },
      {
        id: 'rd-003',
        source: 'data/questions/16-refactoring-debugging.json',
        kind: 'rubric',
        difficulty: 'hard',
        topic: 'Flaky CI failure',
        timeMinutes: 15,
        prompt: 'A test fails intermittently in CI, about once every 20 runs, but always passes locally. Walk through your debugging approach.',
        referenceAnswer: 'Reproduce first by looping the test, then compare serial and parallel runs in a CI-like environment. Investigate shared global state, data that is not cleaned up, timezone or locale differences, clock-based assertions, real network calls, and filesystem races. Run the test alone and in different orderings to isolate interference. Fix the nondeterministic cause, then add a regression assertion; do not make a retry the primary fix.',
        criteria: [
          { label: 'Does not start by adding a retry', weight: 3 },
          { label: 'Considers shared state, races, ordering, external I/O, and clock differences', weight: 3 },
          { label: 'Reproduces with loops, parallelism, and a CI-like environment', weight: 3 },
          { label: 'Runs the test alone and in different orderings to isolate interference', weight: 2 },
          { label: 'Fixes the cause and adds a regression assertion', weight: 3 },
        ],
        minimumAnswerLength: 160,
      },
    ],
  },
  {
    stageId: 'technical-vetting',
    competency: 'If a matched client adds a technical interview, your reasoning matters more than a single diagram. Clarify guarantees and constraints, choose a design, and make reliability, security, tenancy, and operations visible.',
    preparation: [
      'Open with requirement questions and state the guarantees you are optimizing for.',
      'Trace one request or event through the design before adding scale components.',
      'Close with failure modes, observability, capacity assumptions, and rollback.',
    ],
    completionRule: 'Pass all four architecture drills at 70% or better after reviewing the benchmark designs.',
    questions: [
      {
        id: 'sd-003',
        source: 'data/questions/09-system-design.json',
        kind: 'rubric',
        difficulty: 'hard',
        topic: 'Reliable outbound webhooks',
        timeMinutes: 30,
        prompt: 'Design a reliable webhook integration with a client system that frequently goes offline.',
        referenceAnswer: 'Write an outbox record in the same database transaction that produces the event. A worker sends the payload with an HMAC signature, timestamp, and idempotency key. Non-2xx responses return to the queue with exponential backoff and jitter. Terminal failures move to a dead-letter queue with alerting and replay controls. Apply a circuit breaker and per-endpoint throttling so recovering clients are not overloaded.',
        criteria: [
          { label: 'Uses at-least-once delivery with idempotency keys', weight: 3 },
          { label: 'Uses exponential backoff with jitter and a bounded retry window', weight: 2 },
          { label: 'Provides a dead-letter queue, alerting, and replay tool', weight: 2 },
          { label: 'Signs payloads with an HMAC and timestamp', weight: 2 },
          { label: 'Persists delivery using an outbox or equivalent durable pattern', weight: 2 },
          { label: 'Applies backpressure or throttling per endpoint', weight: 1 },
        ],
        minimumAnswerLength: 220,
      },
      {
        id: 'sd-009',
        source: 'data/questions/09-system-design.json',
        kind: 'rubric',
        difficulty: 'hard',
        topic: 'Legacy ERP integration',
        timeMinutes: 30,
        prompt: 'A client has a 15-year-old on-premise ERP with no API layer. Design an integration.',
        referenceAnswer: 'First ask about the database, permitted access, existing exports, batch windows, and change control. Prefer CDC from a read replica into a durable stream and modern landing layer. Fall back to scheduled SQL exports over SFTP; screen scraping is a last resort. For writes, use authorized import files or a thin adapter. Version schemas, define conflict handling, audit every write, and make rollback explicit.',
        criteria: [
          { label: 'Asks about database access, batch windows, and existing extracts', weight: 2 },
          { label: 'Respects change control instead of proposing an invasive rewrite', weight: 2 },
          { label: 'Prioritizes read replica or CDC, then file drops, with scraping last', weight: 3 },
          { label: 'Uses a modern landing layer with schema versioning', weight: 2 },
          { label: 'Addresses two-way synchronization and conflicts', weight: 2 },
          { label: 'Includes security, audit, and rollback', weight: 1 },
        ],
        minimumAnswerLength: 220,
      },
      {
        id: 'sd-013',
        source: 'data/questions/09-system-design.json',
        kind: 'rubric',
        difficulty: 'hard',
        topic: 'Multi-tenant webhook ingestion',
        timeMinutes: 45,
        prompt: 'Design a webhook ingestion engine handling 100k requests per second with per-tenant rate limiting, retry backoff, and tenant isolation.',
        referenceAnswer: 'Terminate TLS and verify HMAC signatures at the edge. Keep ingestion thin: validate, deduplicate with an idempotency key, write to Kafka partitioned by tenant, and return 202. A separate consumer fleet scales on lag and processes with capped exponential retries plus jitter; terminal failures go to a replayable DLQ. Enforce token-bucket limits and in-flight quotas per tenant, use partition or worker bulkheads for isolation, and monitor failures, lag, and DLQ depth per tenant. Show capacity math for payload rate, replication, and retention.',
        criteria: [
          { label: 'Clarifies sender/receiver role, durability SLA, and ordering guarantees', weight: 3 },
          { label: 'Validates at the edge and returns a success response quickly', weight: 3 },
          { label: 'Writes to a durable tenant-partitioned queue from a thin handler', weight: 3 },
          { label: 'Uses a separate consumer fleet that scales on lag', weight: 3 },
          { label: 'Enforces edge rate limits and per-tenant queue quotas', weight: 3 },
          { label: 'Uses capped retry with jitter plus a replayable DLQ', weight: 3 },
          { label: 'Creates tenant bulkheads in queues or workers', weight: 3 },
          { label: 'Deduplicates using idempotency keys with bounded retention', weight: 3 },
          { label: 'Defines tenant-level observability and alerts', weight: 2 },
          { label: 'Shows capacity math for throughput and retention', weight: 2 },
        ],
        minimumAnswerLength: 300,
      },
      {
        id: 'sd-015',
        source: 'data/questions/09-system-design.json',
        kind: 'rubric',
        difficulty: 'hard',
        topic: 'Enterprise SSO',
        timeMinutes: 30,
        prompt: 'A client requires SAML SSO from Okta and only allows employees to reach your application. Design the integration.',
        referenceAnswer: 'Route the user to a tenant-specific identity provider configuration. In an SP-initiated flow, redirect to Okta and validate the returned signature, issuer, audience, timing, and request correlation. Store IdP metadata and overlapping certificates per tenant for rotation. Map NameID and group attributes into users and roles, support just-in-time provisioning, and add SCIM for deprovisioning. Define local or single logout behavior explicitly.',
        criteria: [
          { label: 'Explains the complete SP-initiated redirect and response flow', weight: 3 },
          { label: 'Validates signature, issuer, audience, timing, and replay correlation', weight: 3 },
          { label: 'Stores IdP metadata per tenant and supports certificate rotation', weight: 3 },
          { label: 'Maps SAML attributes into users and roles', weight: 2 },
          { label: 'Supports just-in-time provisioning', weight: 2 },
          { label: 'Defines logout behavior', weight: 1 },
          { label: 'Uses SCIM for employee lifecycle and deprovisioning', weight: 2 },
          { label: 'Routes each tenant to the correct identity provider', weight: 2 },
        ],
        minimumAnswerLength: 220,
      },
    ],
  },
  {
    stageId: 'delivery-simulation',
    competency: 'For client processes that include a delivery case, start by reducing ambiguity. Identify the decision-maker and metric, map constraints, and propose a reversible first release before automation.',
    preparation: [
      'Turn broad requests into one measurable workflow and named owner.',
      'Sequence discovery, shadow mode, advisory behavior, and automation by risk.',
      'Include adoption, feedback, kill switches, and operational handoff in the plan.',
    ],
    completionRule: 'Pass all four customer cases at 70% or better against the delivery rubrics.',
    questions: [
      {
        id: 'fce-101',
        source: 'data/questions/24-fde-customer-engineering.json',
        kind: 'rubric',
        difficulty: 'hard',
        topic: 'Public-safety discovery',
        timeMinutes: 45,
        prompt: 'A large city wants to reduce 911 response times using call data, traffic patterns, and ambulance GPS. Walk through your first 60 minutes with the customer.',
        referenceAnswer: 'First identify whether the target is average response, P95, or equity by ZIP and who owns that metric. Map stakeholders across dispatch, EMS operations, city IT, unions, and civil-rights review. Inspect GPS refresh, call classification, traffic licensing, and PII constraints. Decompose a baseline dashboard, staging recommendation, and dispatch assist in risk order. Propose a four-week walking skeleton for one district and call category with no automated dispatch.',
        criteria: [
          { label: 'Clarifies which response-time failure matters most', weight: 3 },
          { label: 'Identifies stakeholders and the success-metric owner', weight: 3 },
          { label: 'Maps data quality, refresh, licensing, and PII constraints', weight: 2 },
          { label: 'Decomposes two to four workstreams in risk/value order', weight: 3 },
          { label: 'Proposes a narrow dashboard-only walking skeleton', weight: 3 },
          { label: 'Names safety failures and rollback', weight: 2 },
        ],
        minimumAnswerLength: 240,
      },
      {
        id: 'fce-104',
        source: 'data/questions/24-fde-customer-engineering.json',
        kind: 'rubric',
        difficulty: 'hard',
        topic: 'AI rollout',
        timeMinutes: 45,
        prompt: 'A logistics company wants an AI agent to reroute shipments using SAP, weather APIs, and 500 warehouse managers. Shape the rollout.',
        referenceAnswer: 'Clarify whether success means cost, on-time delivery, or manager time saved. Start with five warehouses in shadow mode: the agent recommends while managers operate normally. Compare outcomes for 30 days, then move to advisory with one-click acceptance. Auto-approve only low-impact reroutes and escalate high-impact changes. Give each warehouse a kill switch, instrument decisions, and run office hours so manager corrections become evaluation data.',
        criteria: [
          { label: 'Clarifies the business success metric', weight: 3 },
          { label: 'Keeps a human in the loop above an impact threshold', weight: 3 },
          { label: 'Phases shadow, advisory, semi-automatic, and automatic behavior', weight: 3 },
          { label: 'Includes observability and a per-warehouse kill switch', weight: 2 },
          { label: 'Plans change management with warehouse managers', weight: 2 },
          { label: 'Names explicit failure modes', weight: 2 },
        ],
        minimumAnswerLength: 220,
      },
      {
        id: 'fce-110',
        source: 'data/questions/24-fde-customer-engineering.json',
        kind: 'rubric',
        difficulty: 'hard',
        topic: 'Forecasting scope',
        timeMinutes: 45,
        prompt: 'A retailer with 5,000 stores wants demand forecasting integrated with legacy SAP and 12 data sources. The ask is ambiguous. What do you propose?',
        referenceAnswer: 'Ask which SKU class, geography, and forecast horizon have the highest business impact. Land raw data, create validated and conformed layers, then publish versioned features. Establish a seasonal baseline before introducing ML and adopt a model only when it beats that baseline materially. Compare every forecast with actuals and attribute error. Pilot one region, one product class, and one horizon before expanding.',
        criteria: [
          { label: 'Clarifies SKU class, geography, horizon, and business impact', weight: 3 },
          { label: 'Defines raw, validated, and product-ready data layers', weight: 3 },
          { label: 'Establishes a naive or seasonal baseline before ML', weight: 3 },
          { label: 'Creates a forecast-to-actual feedback and error loop', weight: 3 },
          { label: 'Pilots one region and product class first', weight: 2 },
        ],
        minimumAnswerLength: 220,
      },
      {
        id: 'fce-115',
        source: 'data/questions/24-fde-customer-engineering.json',
        kind: 'rubric',
        difficulty: 'hard',
        topic: 'Executive framing',
        timeMinutes: 20,
        prompt: 'A CEO says, "We want AI to make us more efficient." What do you say back in the meeting?',
        referenceAnswer: 'That is a useful signal. Before we build, I would like to identify where it can move a number. May I propose a two-week discovery? I will speak with operations, sales, and finance leads, observe a few workflows, and return with three opportunities ranked by impact and feasibility. You will get a written recommendation and can choose where engineering investment matters most. Does that outcome work for you?',
        criteria: [
          { label: 'Asks for specifics instead of accepting the broad request', weight: 3 },
          { label: 'Reframes around team, workflow, and measurable outcome', weight: 3 },
          { label: 'Offers a bounded discovery that produces ranked opportunities', weight: 3 },
          { label: 'Sounds customer-friendly rather than gatekeeping', weight: 2 },
          { label: 'Commits to a written discovery outcome', weight: 2 },
        ],
        minimumAnswerLength: 140,
      },
    ],
  },
  {
    stageId: 'matching',
    competency: 'Matching aligns your verified skills and availability to suitable work; any later client evaluation varies by engagement. Prepare to demonstrate calm ownership, proactive stakeholder management, durable handoff, and a direct connection to the client situation.',
    preparation: [
      'Answer in the first person and lead with the client impact, not your intention.',
      'Offer dated options and next checkpoints when delivery is at risk.',
      'Show how you build relationships and capability that survive your departure.',
    ],
    completionRule: 'Pass all four client scenarios at 70% or better to earn the final 20% of readiness.',
    questions: [
      {
        id: 'fce-201',
        source: 'data/questions/24-fde-customer-engineering.json',
        kind: 'rubric',
        difficulty: 'hard',
        topic: 'Delivery recovery',
        timeMinutes: 30,
        prompt: 'A deployment has slipped three weeks. The client CTO is on the call and visibly frustrated. Handle the first five minutes.',
        referenceAnswer: 'I want to own this. We are three weeks behind on the agreed release because of the stated cause. These pieces are confirmed complete; this item remains at risk. Before I lay out recovery, what is most exposed on your side? I can offer two dated options: narrow to the top three flows and ship in one week, or preserve scope and land the fully verified release in two and a half weeks. I will send the written plan within the hour and hold the next checkpoint Friday at 3pm.',
        criteria: [
          { label: 'Takes responsibility immediately', weight: 3 },
          { label: 'States what slipped, why, and what is known versus uncertain', weight: 2 },
          { label: 'Asks about the client operational pressure', weight: 2 },
          { label: 'Presents a revised plan with dates', weight: 3 },
          { label: 'Offers a clear scope-versus-time tradeoff', weight: 2 },
          { label: 'Sets a written follow-up and next checkpoint', weight: 1 },
        ],
        minimumAnswerLength: 180,
      },
      {
        id: 'fce-211',
        source: 'data/questions/24-fde-customer-engineering.json',
        kind: 'rubric',
        difficulty: 'hard',
        topic: 'Executive transition',
        timeMinutes: 25,
        prompt: 'Your executive champion at the client has left. The new executive does not know your project. What do you do?',
        referenceAnswer: 'Treat the loss of sponsorship as an immediate delivery risk. Within 48 hours, ask the new executive or chief of staff for a 30-minute introduction. Bring a one-page brief covering the business problem, current solution, measured value, risks, and the smallest ask needed from them. In parallel, strengthen relationships with the operations lead, director, and daily users so the project is not single-threaded again.',
        criteria: [
          { label: 'Recognizes loss of the champion as an immediate risk', weight: 3 },
          { label: 'Requests an introduction within a week', weight: 3 },
          { label: 'Prepares a one-page brief with problem, value, status, and ask', weight: 3 },
          { label: 'Builds multiple backup relationships across the client', weight: 2 },
          { label: 'Acts proactively instead of waiting for outreach', weight: 2 },
        ],
        minimumAnswerLength: 160,
      },
      {
        id: 'fce-214',
        source: 'data/questions/24-fde-customer-engineering.json',
        kind: 'rubric',
        difficulty: 'medium',
        topic: 'Technical handoff',
        timeMinutes: 25,
        prompt: 'The project is complete and the client wants a handoff to an in-house team with no experience in the core framework. Plan the transition.',
        referenceAnswer: 'Use a four-week ramp. In week one, deliver the architecture guide, runbook, on-call playbook, and two walkthroughs. In week two, the client team handles low-risk tickets while I pair. In week three, they own all tickets while I review. In week four, they become primary and I remain backup. Keep a named escalation contact and monthly office hours for the next three months.',
        criteria: [
          { label: 'Uses a multi-week transition rather than one meeting', weight: 3 },
          { label: 'Includes architecture, runbook, and on-call documentation', weight: 3 },
          { label: 'Uses shadowing in both directions', weight: 3 },
          { label: 'Reduces involvement gradually instead of ending abruptly', weight: 2 },
          { label: 'Names a post-handoff escalation contact', weight: 2 },
        ],
        minimumAnswerLength: 160,
      },
      {
        id: 'fce-215',
        source: 'data/questions/24-fde-customer-engineering.json',
        kind: 'rubric',
        difficulty: 'hard',
        topic: 'Renewal risk',
        timeMinutes: 30,
        prompt: 'Contract renewal is in 30 days and the signals are cool. What is your plan?',
        referenceAnswer: 'Do not wait for the renewal meeting. Ask the executive sponsor for 30 minutes and speak separately with two or three daily users for unfiltered feedback. Prepare a written impact summary with hard numbers, and name anything promised but not delivered. Bring a concrete 90-day proposal tied to the feedback. If sentiment remains cool, ask directly what would need to change for renewal and handle the answer honestly.',
        criteria: [
          { label: 'Reaches out before the formal renewal meeting', weight: 3 },
          { label: 'Gets unfiltered feedback from key stakeholders and users', weight: 3 },
          { label: 'Documents delivered value with numbers', weight: 3 },
          { label: 'Names promised but undelivered work honestly', weight: 3 },
          { label: 'Proposes a concrete next 90 days tied to client priorities', weight: 2 },
        ],
        minimumAnswerLength: 180,
      },
    ],
  },
]

export function getFdeTuringStagePractice(stageId: string) {
  return fdeTuringPractice.find((stage) => stage.stageId === stageId)
}