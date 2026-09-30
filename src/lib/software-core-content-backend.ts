import type { SoftwareLessonDetails } from './software-core-lesson-types'

export const softwareBackendLessonDetails = {
  'HTTP methods': {
    explanation: [
      'HTTP methods communicate the intended operation on a resource. GET reads without changing server state, POST submits a new command or creates a subordinate resource, PUT replaces a resource at a known URI, PATCH applies a partial change, and DELETE removes or deactivates a resource. Method semantics guide clients, gateways, caches, and observability tools even though the server must still enforce the actual behavior.',
      'Choose a method from the operation contract rather than the handler name. Safe methods such as GET can be prefetched because they should not mutate business state, while idempotent methods such as PUT and DELETE can be repeated with the same intended effect. POST is appropriate for non-idempotent commands, but important retryable operations can add an idempotency key instead of pretending they are reads or replacements.',
    ],
    whyItMatters: 'Clear method semantics make an API predictable under retries, caching, monitoring, and third-party integration. In a Turing-style system design interview, explaining why a payment submission is POST while a profile replacement is PUT demonstrates that the contract accounts for distributed-system behavior, not only route naming.',
    useCases: [
      'Using GET /talent/42 to retrieve a candidate profile without incrementing an application counter',
      'Using PATCH /contracts/91 to update only the hourly rate while preserving the existing schedule',
      'Using DELETE /webhooks/17 to make repeated cleanup requests converge on an absent subscription',
    ],
    workedExample: {
      scenario: 'An Andela marketplace API must let a client create an engagement, read it, and later change only its expected weekly hours.',
      steps: [
        'Create the engagement with POST /engagements because the server assigns its identifier and the operation adds a new resource.',
        'Return the created representation and a Location header, then retrieve it later with the safe GET /engagements/eng_731 route.',
        'Change only weeklyHours with PATCH /engagements/eng_731 and reject attempts to modify immutable fields such as clientId.',
      ],
      code: {
        language: 'HTTP',
        code: `POST /engagements HTTP/1.1
Content-Type: application/json

{"clientId":"client_18","talentId":"talent_42","weeklyHours":30}

PATCH /engagements/eng_731 HTTP/1.1
Content-Type: application/merge-patch+json

{"weeklyHours":35}`,
      },
      result: 'The routes describe creation, retrieval, and partial modification explicitly, so clients can reason about side effects and the server can validate each operation against a narrow contract.',
    },
    interview: {
      prompt: 'When would you choose PUT instead of PATCH for an API update?',
      answer: 'I would use PUT when the client supplies the complete desired representation at a known resource URI and repeating it should converge on the same state. I would use PATCH when the request describes only selected changes. The server must define omitted-field behavior clearly, validate authorization for every changed field, and preserve idempotency where the patch format permits it.',
    },
  },
  'Status codes': {
    explanation: [
      'HTTP status codes summarize the outcome at the protocol boundary. A 2xx response means the request was accepted or completed, 3xx directs the client elsewhere, 4xx identifies a request the client must change or authenticate, and 5xx indicates the server or an upstream dependency failed to fulfill a valid request. The body should add stable machine-readable details rather than contradicting the status.',
      'Select the most specific code that changes client behavior: 201 for a created resource, 202 for accepted asynchronous work, 204 for success without a body, 400 for malformed syntax, 401 for missing or invalid authentication, 403 for an authenticated principal lacking permission, 404 for an unavailable resource, 409 for a state conflict, 422 for semantically invalid input, and 429 for throttling. Avoid returning 200 with an error object because generic clients, monitors, and retry policies will treat it as success.',
    ],
    whyItMatters: 'Accurate status codes let SDKs, load balancers, alerts, and partner integrations react correctly without parsing human text. During a Toptal backend exercise, distinguishing a validation failure from a transient server failure shows that the API supports reliable automation and meaningful operational metrics.',
    useCases: [
      'Returning 201 and a Location header after a contract resource is persisted',
      'Returning 409 when two recruiters attempt an incompatible transition on the same interview slot',
      'Returning 503 with Retry-After when a required matching service is temporarily unavailable',
    ],
    workedExample: {
      scenario: 'A candidate submits an assessment attempt, but the API must distinguish invalid answers, duplicate submission, and an unavailable scoring service.',
      steps: [
        'Validate the payload and return 422 with field errors when an answer references a question outside the assessment.',
        'Return 409 when the attempt is already finalized because the resource state conflicts with another submission.',
        'Return 202 with an attempt URI when scoring is queued, or 503 with Retry-After if the queue cannot accept work.',
      ],
      code: {
        language: 'JSON',
        code: `{
  "type": "https://api.example.com/problems/attempt-finalized",
  "title": "Assessment attempt is already finalized",
  "status": 409,
  "instance": "/attempts/att_204"
}`,
      },
      result: 'The client can correct invalid data, stop a duplicate submission, poll accepted work, or retry an infrastructure failure based on protocol-level signals.',
    },
    interview: {
      prompt: 'What is the practical difference between 401 and 403?',
      answer: 'A 401 response means valid authentication credentials were not supplied and normally includes an authentication challenge. A 403 response means the server recognized the principal but refuses the operation under its authorization policy. Keeping them distinct helps clients decide whether to authenticate again or stop requesting a forbidden action, while sensitive systems may still use 404 to avoid revealing resource existence.',
    },
  },
  'Resource modeling': {
    explanation: [
      'Resource modeling turns domain concepts into stable API nouns with identifiers, representations, relationships, and lifecycle rules. A resource should represent something clients can reason about, such as a candidate, engagement, interview, or assessment attempt, rather than exposing internal table names or service methods. Routes then describe collections and members while HTTP methods express operations.',
      'Good models balance normalization with client usability. Embed small values that belong to the representation, link independently changing resources, and promote important business actions to subresources or explicit commands when a simple field update would hide invariants. Design for evolution by using durable identifiers, additive fields, and clear ownership instead of mirroring a database schema that may change.',
    ],
    whyItMatters: 'A coherent resource model reduces client coupling and gives authorization, caching, and audit rules clear boundaries. In marketplace interviews, modeling an interview booking as a first-class resource makes concurrency and cancellation behavior easier to explain than an endpoint named runScheduleInterview.',
    useCases: [
      'Representing candidate applications as resources linking talent, role, stage, and current status',
      'Modeling an interview reschedule as a controlled transition on an existing booking',
      'Exposing assessment attempts separately from reusable assessment definitions and question banks',
    ],
    workedExample: {
      scenario: 'A Toptal-like platform needs an API for clients to invite talent to roles and track whether each invitation is accepted or declined.',
      steps: [
        'Model role, talent, and invitation as separate resources because each has an independent identity and lifecycle.',
        'Create an invitation under POST /roles/role_8/invitations with the target talent identifier and return its own URI.',
        'Expose acceptance as POST /invitations/inv_55/accept so the server can enforce expiry and current-state rules atomically.',
        'Include links or identifiers for the related role and talent without copying their mutable profiles into the invitation.',
      ],
      code: {
        language: 'JSON',
        code: `{
  "id": "inv_55",
  "roleId": "role_8",
  "talentId": "talent_42",
  "status": "pending",
  "expiresAt": "2026-10-07T12:00:00Z"
}`,
      },
      result: 'The invitation has a stable identity and explicit transition rules, while role and talent data can evolve without changing the invitation contract.',
    },
    interview: {
      prompt: 'Why should an API resource model not simply expose every database table?',
      answer: 'Tables optimize persistence and may split, join, or duplicate concepts for storage concerns. API resources should express domain contracts that remain stable for clients. One resource may combine several tables, while an internal join table may deserve no public route. Separating the models also prevents schema migrations from becoming accidental breaking API changes.',
    },
  },
  'Request validation': {
    explanation: [
      'Request validation establishes whether untrusted input satisfies the transport and domain contract before work begins. Structural validation checks types, required fields, formats, ranges, and unknown properties; domain validation checks facts such as whether an interview is in a schedulable state or an hourly rate is allowed for the selected contract. Both must run on the server even when a client already validates forms.',
      'Reject invalid input early with stable field-level errors, but avoid duplicating rules across handlers. Parse into a typed boundary object, normalize only explicitly documented forms, and enforce cross-record invariants near the transaction that uses them. Validation does not replace database constraints because concurrent requests can both pass a precheck before either writes.',
    ],
    whyItMatters: 'Strong validation keeps malformed or impossible state away from deeper services and gives API consumers actionable feedback. Turing and Andela exercises often include hostile input and race conditions, so a good answer separates friendly request errors from authoritative persistence guarantees.',
    useCases: [
      'Rejecting an availability window whose end precedes its start',
      'Validating that an assessment answer belongs to the submitted assessment version',
      'Blocking an hourly rate change outside the currency and range allowed by the active contract',
    ],
    workedExample: {
      scenario: 'A client creates an interview slot with a candidate, interviewer, start time, duration, and IANA time zone.',
      steps: [
        'Reject missing identifiers, a malformed time zone, and durations outside the supported 30-to-120-minute range at the request boundary.',
        'Resolve the local start time to an instant and reject ambiguous or nonexistent daylight-saving times unless an offset is supplied.',
        'Within the booking transaction, verify both participants are active and rely on a database exclusion rule to reject overlap.',
        'Return field errors for structural problems and a 409 conflict for a concurrently occupied slot.',
      ],
      code: {
        language: 'JSON',
        code: `{
  "errors": [
    {
      "field": "durationMinutes",
      "code": "out_of_range",
      "message": "Use a value from 30 through 120"
    }
  ]
}`,
      },
      result: 'Bad requests fail before scheduling work begins, while the transactional overlap rule still protects correctness when valid requests arrive concurrently.',
    },
    interview: {
      prompt: 'Where should validation live in a layered backend?',
      answer: 'Transport shape validation belongs at the boundary so malformed input never reaches business code. Domain rules belong in the domain or application service so every entry point applies them. Invariants vulnerable to races also need database constraints or transactional checks. This division provides useful errors without making the HTTP handler the only guardian of correctness.',
    },
  },
  'Authentication and authorization': {
    explanation: [
      'Authentication establishes who or what is making a request, commonly by validating a session, signed token, mutual TLS identity, or API credential. Authorization then decides whether that principal may perform a specific action on a specific resource. A valid token is evidence of identity and claims, not blanket permission to every record named in the URL.',
      'Enforce authorization on the server at each protected operation using least privilege and deny-by-default policies. Combine coarse roles with resource attributes when necessary, such as allowing a client administrator to read contracts only for the same organization. Validate token signature, issuer, audience, expiry, and revocation strategy, then avoid trusting client-supplied tenant or owner identifiers over authenticated context.',
    ],
    whyItMatters: 'Confusing authentication with authorization creates horizontal privilege escalation, where one valid user accesses another tenant by changing an identifier. Security-focused interviews expect explicit object-level checks, service credential scoping, and a clear account of where trust is established.',
    useCases: [
      'Allowing a candidate to edit only the profile linked to the authenticated account',
      'Permitting a client recruiter to view applications only inside the recruiter organization',
      'Giving a webhook delivery worker permission to read delivery payloads without granting user-management access',
    ],
    workedExample: {
      scenario: 'A recruiter requests GET /organizations/org_9/contracts/con_81 while authenticated with a token containing organization org_4.',
      steps: [
        'Validate the token signature, issuer, audience, and expiry before constructing the authenticated principal.',
        'Load the contract through a query scoped to the principal organization instead of fetching by contract identifier alone.',
        'Return the contract only if it belongs to org_4 and the recruiter role includes contract read permission.',
        'Record a security audit event for denied cross-organization access without exposing whether con_81 exists.',
      ],
      code: {
        language: 'SQL',
        code: `SELECT id, status, starts_at
FROM contracts
WHERE id = $1
  AND organization_id = $2;`,
      },
      result: 'Changing the route identifier cannot escape tenant scope because identity-derived organization filtering is part of the data access itself.',
    },
    interview: {
      prompt: 'A JWT is valid and contains a role of recruiter. What additional authorization checks might still be required?',
      answer: 'The server must verify that the role permits the requested action and that the target resource falls within the principal scope, such as the same organization or assigned project. It may also check resource state, delegated permissions, or recent revocation. Token validity answers who presented it; policy and current data answer what that principal may do now.',
    },
  },
  Pagination: {
    explanation: [
      'Pagination limits a collection response and provides a way to continue through the remaining rows. Offset pagination skips a number of sorted rows and is simple for shallow admin pages, while cursor or keyset pagination resumes after a stable sort key and avoids scanning or shifting large prefixes. Every scheme requires deterministic ordering, usually with a unique tie-breaker.',
      'Cursor pagination is preferable for changing feeds because inserts before the current position do not move already seen rows, but cursors should be opaque and bound to the active filters and sort direction. Define maximum page sizes, continuation behavior, and whether totals are exact, estimated, or omitted; exact counts can be more expensive than fetching one page.',
    ],
    whyItMatters: 'Unbounded list endpoints consume memory and database time, while unstable pages duplicate or omit records during concurrent writes. In a talent-search design question, choosing a cursor based on score and candidate ID shows awareness of scale, deterministic ordering, and live data.',
    useCases: [
      'Scrolling through candidates ordered by match score and unique candidate ID',
      'Browsing a small back-office contract table with offset and an exact total',
      'Processing webhook deliveries in chronological batches using createdAt and delivery ID as a cursor',
    ],
    workedExample: {
      scenario: 'A Turing-like search returns candidates ordered by descending match score, where many candidates can share the same score.',
      steps: [
        'Sort by match_score descending and candidate_id ascending so every row has a deterministic position.',
        'Fetch pageSize plus one rows to detect whether another page exists without running a full count.',
        'Encode the final returned score and ID into an opaque cursor tied to the current filters.',
        'For the next page, query rows after that compound key and return a new cursor.',
      ],
      code: {
        language: 'SQL',
        code: `SELECT candidate_id, match_score, headline
FROM candidate_matches
WHERE role_id = $1
  AND (match_score, candidate_id) < ($2, $3)
ORDER BY match_score DESC, candidate_id DESC
LIMIT $4;`,
      },
      result: 'Each candidate appears in a stable order even when scores tie, and the database can seek from the cursor instead of scanning every earlier result.',
    },
    interview: {
      prompt: 'Why can offset pagination produce duplicates or omissions when data changes?',
      answer: 'Offset identifies a physical position in the current result, not a durable boundary. An insertion or deletion before the next offset shifts later rows, so a client can see one row twice or miss it. A keyset cursor resumes after values from the last row under a deterministic ordering, which is more stable and usually more efficient for deep pages.',
    },
  },
  Idempotency: {
    explanation: [
      'An idempotent operation has the same intended effect when applied repeatedly as when applied once. HTTP defines PUT and DELETE as idempotent by semantics, but business commands such as creating a payment or submitting an application often use POST and need an explicit idempotency key so a retry does not duplicate the effect.',
      'Implement idempotency by storing a client-scoped key, a fingerprint of the normalized request, the operation state, and the final response under a unique constraint. A repeated matching request returns or waits for the original result; reuse with different input must fail. Retain keys for a documented window and coordinate the record with the business write so a crash cannot leave an untracked side effect.',
    ],
    whyItMatters: 'Networks can lose responses after the server commits, leaving clients unable to know whether retrying is safe. A robust idempotency design prevents duplicate contracts, charges, or applications under timeout and concurrency scenarios commonly explored in senior backend interviews.',
    useCases: [
      'Preventing two engagement records when a mobile client retries after a timeout',
      'Returning the original assessment submission result when a worker redelivers a command',
      'Rejecting reuse of one idempotency key for payment requests with different amounts',
    ],
    workedExample: {
      scenario: 'Two concurrent POST /contracts requests arrive with idempotency key contract-create-884 after the client times out and retries.',
      steps: [
        'Hash the authenticated client ID, route, and normalized request body, then attempt to insert the key under a unique constraint.',
        'Let the winning transaction create the contract and store its 201 response with the idempotency record.',
        'Make the losing request read the existing record and verify that its request hash matches.',
        'Return the stored response and contract identifier without running contract creation again.',
      ],
      code: {
        language: 'SQL',
        code: `INSERT INTO idempotency_records (client_id, key, request_hash, state)
VALUES ($1, $2, $3, 'started')
ON CONFLICT (client_id, key) DO NOTHING;`,
      },
      result: 'Both callers receive the same contract result, while the unique key and transactional response record ensure only one contract is created.',
    },
    interview: {
      prompt: 'Why is checking for an idempotency key and then inserting a record not sufficient?',
      answer: 'Two concurrent requests can both observe that the key is absent before either inserts, so both can perform the side effect. The key needs an atomic uniqueness guarantee, and its state must be coordinated with the business operation. The implementation must also detect a repeated key carrying different input rather than returning an unrelated stored response.',
    },
  },
  Webhooks: {
    explanation: [
      'A webhook is an outbound HTTP notification sent when an event occurs, allowing another system to react without polling. The producer usually delivers an event envelope containing a unique event ID, type, timestamp, version, and payload to a subscriber endpoint. Delivery is normally at least once, so receiving the same event more than once is expected behavior.',
      'Secure webhooks with TLS and a signature over the raw request body plus a timestamp, then reject stale timestamps to reduce replay risk. A receiver should verify before parsing, deduplicate by event ID, persist or enqueue quickly, and return success before slow business work. Producers need retry schedules, delivery logs, secret rotation, versioning, and a dead-letter or operator recovery path.',
    ],
    whyItMatters: 'Partner integrations fail at network boundaries, and webhook correctness depends on authenticity, duplicate handling, and recoverability rather than one successful demo request. These tradeoffs are central to integration exercises used in Andela and Toptal screening.',
    useCases: [
      'Notifying a client ATS when a candidate advances to the technical interview stage',
      'Receiving a payment-provider event that activates an engagement after settlement',
      'Sending an assessment.completed event to an external analytics platform',
    ],
    workedExample: {
      scenario: 'A talent platform receives contract.signed events from an e-signature provider that retries until it receives a 2xx response.',
      steps: [
        'Read the raw body and verify the timestamped HMAC signature with the active or previous rotation secret.',
        'Insert the provider event ID into an inbox table with a unique constraint before acknowledging it.',
        'Return 204 after durable enqueueing, then let a worker update the contract in a transaction.',
        'Treat a duplicate event ID as successful and skip the already completed transition.',
      ],
      code: {
        language: 'TypeScript',
        code: `const signed = timestamp + '.' + rawBody
const expected = createHmac('sha256', secret).update(signed).digest('hex')

if (timingSafeEqualHex(expected, signature) === false) {
  return new Response(null, { status: 401 })
}`,
      },
      result: 'Forged or stale events are rejected, valid events are durably acknowledged, and provider retries cannot sign the same contract twice.',
    },
    interview: {
      prompt: 'Why should a webhook receiver acknowledge before completing all business processing?',
      answer: 'The sender often has a short timeout and retries ambiguous failures. After the receiver verifies and durably stores or enqueues the event, it can return quickly and process asynchronously. This reduces duplicate pressure and isolates downstream latency. The worker still needs idempotent handling because acknowledgment can be lost and delivery remains at least once.',
    },
  },
  'Retries and backoff': {
    explanation: [
      'A retry repeats an operation after a transient failure such as a timeout, connection reset, throttling response, or temporary service error. It cannot repair invalid input, failed authorization, or a permanent business conflict, and retrying non-idempotent work without a deduplication mechanism can duplicate side effects. Retry policy therefore begins with classifying failures and operation safety.',
      'Exponential backoff increases the delay between attempts, while jitter randomizes delays so many clients do not retry in synchronized waves. Bound both attempts and total elapsed time, respect server Retry-After guidance, propagate cancellation, and combine retries with timeouts and circuit breaking. Retry at one deliberate layer because stacked retries can multiply load and latency.',
    ],
    whyItMatters: 'Poor retries turn a partial outage into a larger one by amplifying traffic exactly when a dependency is least able to serve it. A strong distributed-systems answer quantifies the retry budget, handles ambiguity, and prevents coordinated retry storms.',
    useCases: [
      'Retrying a rate-limited candidate-search provider after its Retry-After delay',
      'Retrying an idempotent object-store read after a connection reset',
      'Sending a failed webhook again with exponential backoff and a terminal dead-letter state',
    ],
    workedExample: {
      scenario: 'An integration worker calls a partner verification API that sometimes returns 503 during deployments and 422 for invalid identity data.',
      steps: [
        'Classify 503 and network timeouts as retryable, but send 422 directly to permanent-failure handling.',
        'Apply a per-attempt timeout and retry at most four times within the job deadline.',
        'Use exponential backoff with full jitter and honor a valid Retry-After value when it is longer.',
        'Record attempt count and final classification, then dead-letter exhausted jobs for inspection.',
      ],
      code: {
        language: 'TypeScript',
        code: `const capMs = Math.min(30_000, 500 * 2 ** attempt)
const jitteredDelayMs = Math.floor(Math.random() * capMs)
const delayMs = Math.max(jitteredDelayMs, retryAfterMs ?? 0)

await wait(delayMs, signal)`,
      },
      result: 'Temporary partner outages receive bounded, desynchronized retries, while invalid data fails immediately and repeated failure remains visible for recovery.',
    },
    interview: {
      prompt: 'Why is exponential backoff without jitter still risky?',
      answer: 'Clients that fail at the same time calculate the same delays and return together, creating repeated traffic spikes. Jitter spreads attempts across each backoff window and gives the dependency room to recover. The policy still needs a cap, total deadline, retryable error classification, and idempotency because randomness alone does not make an unsafe request safe.',
    },
  },
  'Rate limiting': {
    explanation: [
      'Rate limiting bounds how much work a principal can request over time to protect shared capacity, enforce product tiers, and reduce abuse. A fixed window is simple but permits bursts at boundaries; a sliding window is smoother but costs more state; token buckets allow controlled bursts while replenishing at a steady rate. Limits can apply by user, organization, API key, IP address, endpoint cost, or combinations of these dimensions.',
      'Enforce limits close to the admission point and make distributed updates atomic through a gateway or shared store. Return 429 with Retry-After and useful quota headers, but do not treat rate limiting as the only defense against expensive queries or malicious identities. Choose limits from capacity and fairness goals, exempt trusted internal traffic deliberately, and monitor rejected and near-limit requests before changing thresholds.',
    ],
    whyItMatters: 'Without fair admission control, one integration or scraper can exhaust database connections and degrade every customer. System design interviews value an answer that connects the algorithm to burst behavior, distributed consistency, identity choice, and user-visible recovery.',
    useCases: [
      'Allowing each client organization 120 candidate searches per minute with a small burst budget',
      'Applying a stricter limit to password-reset attempts than to authenticated profile reads',
      'Charging bulk matching requests more tokens than inexpensive contract lookups',
    ],
    workedExample: {
      scenario: 'A Toptal-like search API allows an organization 10 immediate requests and then replenishes two search tokens per second.',
      steps: [
        'Key the bucket by authenticated organization ID so users in one tenant share the purchased quota.',
        'Atomically refill tokens from elapsed time, cap the balance at 10, and subtract one token for a normal search.',
        'Reject requests when the balance is below the required cost and calculate when one token will be available.',
        'Return 429 with Retry-After while emitting tenant and route metrics without logging sensitive query text.',
      ],
      code: {
        language: 'HTTP',
        code: `HTTP/1.1 429 Too Many Requests
Retry-After: 1
RateLimit-Limit: 10
RateLimit-Remaining: 0
Content-Type: application/json

{"code":"search_rate_limited"}`,
      },
      result: 'Short legitimate bursts pass, sustained traffic converges on two searches per second, and callers know when to resume without guessing.',
    },
    interview: {
      prompt: 'How does a token bucket differ from a fixed-window rate limit?',
      answer: 'A fixed window counts requests in discrete periods and can allow nearly twice the nominal rate around a boundary. A token bucket accumulates tokens at a steady rate up to a capacity, so it permits a defined burst and then enforces the refill rate continuously. The tradeoff is more per-key state and a need for atomic distributed updates.',
    },
  },
  Caching: {
    explanation: [
      'A cache stores a reusable result closer to the caller so repeated reads avoid slower computation or I/O. Browser and CDN caches use HTTP freshness and validators, application caches store objects or query results by key, and database buffers cache pages internally. Cache keys must include every input that changes the result, especially tenant, locale, authorization scope, filters, and version.',
      'The hard problem is invalidation and staleness. Cache-aside loads on a miss and explicitly removes or updates entries after writes; write-through updates cache and store together but adds write cost; short time-to-live policies bound stale periods without proving immediate freshness. Prevent stampedes with request coalescing or leases, use negative caching carefully, and never serve one principal data cached under another principal key.',
    ],
    whyItMatters: 'Caching can transform latency and database load, but a fast wrong answer is still a defect and can become a data leak. Backend interviews expect explicit freshness requirements, key design, invalidation ownership, and behavior when the cache is unavailable.',
    useCases: [
      'Caching public skill taxonomy responses with ETag revalidation at the CDN',
      'Caching expensive candidate-match summaries by role, model version, and tenant',
      'Using a short negative cache for nonexistent public job slugs to absorb repeated scans',
    ],
    workedExample: {
      scenario: 'An Andela-style dashboard repeatedly requests an expensive candidate shortlist that changes when the role criteria or matching model changes.',
      steps: [
        'Construct the key from organization ID, role ID, criteria version, model version, and pagination cursor.',
        'On a miss, acquire a short lease so only one request computes the shortlist while others wait or use a recent stale value.',
        'Store the result with a five-minute TTL and metrics for hit, miss, compute time, and stale serving.',
        'Increment the criteria version after a role edit so new reads cannot collide with old cached results.',
      ],
      code: {
        language: 'Text',
        code: `shortlist:org_12:role_88:criteria_v7:model_v3:cursor_start`,
      },
      result: 'Repeated dashboard reads avoid duplicate matching work, while role and model changes naturally move traffic to a new cache namespace without cross-tenant leakage.',
    },
    interview: {
      prompt: 'What information must be part of a cache key?',
      answer: 'Every input that can change the returned value must affect the key or be enforced before lookup. That often includes resource identity, tenant, authorization visibility, locale, filters, sort, page cursor, and data or algorithm version. Omitting one can return stale, semantically wrong, or unauthorized data even when the cache itself operates perfectly.',
    },
  },
  'Relational modeling': {
    explanation: [
      'Relational modeling represents domain facts as tables whose rows have stable identities and whose columns have defined domains. Relationships express one-to-one, one-to-many, and many-to-many cardinality through keys, while normalization separates facts that change independently so one update does not require rewriting inconsistent copies across many rows.',
      'Model from invariants and query needs rather than from UI screens. Use a junction table when a relationship has many members or its own attributes, keep historical facts when later changes must not rewrite the past, and denormalize only for a measured read need with explicit synchronization ownership. Nullability should represent a real optional state, not uncertainty about the model.',
    ],
    whyItMatters: 'A sound schema lets the database enforce business truth and supports new queries without fragile duplicated state. Data-modeling interviews for marketplaces commonly test whether candidates can distinguish entities, relationships, lifecycle history, and derived values.',
    useCases: [
      'Modeling candidates and skills through a candidate_skill table with proficiency and verification date',
      'Separating reusable role definitions from individual candidate applications',
      'Recording contract rate history rather than overwriting the amount used by past invoices',
    ],
    workedExample: {
      scenario: 'A talent platform needs candidates to list many skills, while each skill belongs to many candidates and carries candidate-specific proficiency.',
      steps: [
        'Create candidate and skill tables with independent primary keys and unique business identifiers where appropriate.',
        'Create candidate_skill with both foreign keys plus proficiency_level and verified_at because those facts belong to the relationship.',
        'Use a composite uniqueness rule on candidate_id and skill_id to prevent duplicate claims.',
        'Index the reverse lookup needed to find verified candidates for one skill.',
      ],
      code: {
        language: 'SQL',
        code: `CREATE TABLE candidate_skill (
  candidate_id bigint NOT NULL REFERENCES candidate(id),
  skill_id bigint NOT NULL REFERENCES skill(id),
  proficiency_level smallint NOT NULL CHECK (proficiency_level BETWEEN 1 AND 5),
  verified_at timestamptz,
  PRIMARY KEY (candidate_id, skill_id)
);`,
      },
      result: 'Each skill and candidate is stored once, relationship-specific facts have a clear home, and duplicate skill claims are rejected by the schema.',
    },
    interview: {
      prompt: 'When is denormalization justified in a relational schema?',
      answer: 'It is justified when a measured read or availability requirement cannot be met reasonably through normalized queries, indexes, or materialized views. The duplicated value needs a named source of truth, an update strategy, consistency expectations, and repair tooling. Denormalization is a deliberate performance tradeoff, not a substitute for identifying the underlying entities and invariants.',
    },
  },
  'Primary and foreign keys': {
    explanation: [
      'A primary key uniquely identifies each row and is implicitly non-null, giving other rows a stable reference target. Natural keys derive from domain data, while surrogate keys use generated values such as integers or UUIDs; a surrogate often protects relationships from mutable business identifiers, but domain uniqueness still needs a separate constraint.',
      'A foreign key requires a referenced row to exist and defines what happens when that parent is updated or deleted. Use restrictive deletion for important history, cascading deletion only when the child has no independent meaning, and set-null only when absence is valid. Index foreign-key columns used for joins or parent deletion checks because many databases do not create those indexes automatically.',
    ],
    whyItMatters: 'Keys let the database prevent orphaned or ambiguous records under every application path, including scripts and concurrent workers. Interview answers become stronger when they separate row identity from business uniqueness and discuss deletion semantics rather than adding IDs mechanically.',
    useCases: [
      'Using an immutable candidate ID while enforcing a separate unique normalized email',
      'Preventing an application from referencing a role that does not exist',
      'Restricting deletion of a client organization that still owns auditable contracts',
    ],
    workedExample: {
      scenario: 'A contract belongs to one organization and references a candidate, but organizations with contracts must never be deleted accidentally.',
      steps: [
        'Give contracts an immutable generated primary key and organizations a separate stable primary key.',
        'Add non-null foreign keys from contract to organization and candidate.',
        'Use ON DELETE RESTRICT for organization and candidate references because contracts are legal history.',
        'Index organization_id and candidate_id for scoped reads and efficient referential checks.',
      ],
      code: {
        language: 'SQL',
        code: `CREATE TABLE contract (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE RESTRICT,
  candidate_id uuid NOT NULL REFERENCES candidate(id) ON DELETE RESTRICT,
  external_number text NOT NULL UNIQUE
);

CREATE INDEX contract_organization_idx ON contract (organization_id);`,
      },
      result: 'Contracts have durable internal identity, retain unique external numbers, and cannot become orphaned through parent deletion.',
    },
    interview: {
      prompt: 'If a table uses a surrogate primary key, are unique constraints on business fields still necessary?',
      answer: 'Yes. The surrogate distinguishes rows but does not enforce domain rules such as one application per candidate and role or one normalized email per account. Those rules need explicit unique constraints, often composite or partial. Otherwise duplicate business entities can receive different surrogate IDs and appear valid to the database.',
    },
  },
  Joins: {
    explanation: [
      'A join combines rows according to a predicate, usually a primary-key and foreign-key relationship. INNER JOIN keeps only matching pairs, LEFT JOIN preserves every row from the left and supplies nulls when no right row matches, and semi-join patterns such as EXISTS test related-row presence without multiplying the selected row. The chosen join must match the desired cardinality.',
      'Join bugs often come from filtering in the wrong place or misunderstanding one-to-many multiplication. A WHERE condition on the nullable side of a LEFT JOIN can turn it into an inner join, and joining two independent child collections can create a Cartesian multiplication before aggregation. Inspect expected row counts, qualify columns, and aggregate each many-side separately when necessary.',
    ],
    whyItMatters: 'Most useful relational queries cross entity boundaries, and a logically wrong join can return plausible but duplicated or missing data. SQL interviews frequently use joins to test whether a candidate reasons about cardinality and null preservation rather than memorizing syntax.',
    useCases: [
      'Listing every role with its assigned recruiter, including currently unassigned roles',
      'Finding candidates who have at least one verified TypeScript skill using EXISTS',
      'Combining contracts with organizations and current rate records for billing review',
    ],
    workedExample: {
      scenario: 'An operations report must show every open role and the date of its latest application, including roles with no applications.',
      steps: [
        'Start from role because every open role must remain in the result.',
        'Pre-aggregate applications to one latest date per role so the join cannot duplicate role rows.',
        'LEFT JOIN the aggregate and keep the open-status predicate on the role table.',
        'Represent a null latest date as no applications in the presentation layer.',
      ],
      code: {
        language: 'SQL',
        code: `SELECT r.id, r.title, a.latest_application_at
FROM role AS r
LEFT JOIN (
  SELECT role_id, max(created_at) AS latest_application_at
  FROM application
  GROUP BY role_id
) AS a ON a.role_id = r.id
WHERE r.status = 'open';`,
      },
      result: 'The report contains one row per open role, preserves roles with no applications, and avoids multiplying rows for roles with many applicants.',
    },
    interview: {
      prompt: 'How can a WHERE condition accidentally change a LEFT JOIN into an INNER JOIN?',
      answer: 'For unmatched left rows, columns from the right table are null. A WHERE predicate such as right.status = active rejects those null rows after the join, so only matches remain. Put a condition that defines acceptable matches in the ON clause, or explicitly include the null case when that matches the business requirement.',
    },
  },
  Grouping: {
    explanation: [
      'Grouping partitions input rows by one or more expressions and computes aggregates such as count, sum, minimum, maximum, or average for each partition. Every selected value must either identify the group or be derived through an aggregate, because an arbitrary row from the group would not have a defined meaning.',
      'WHERE filters rows before grouping, while HAVING filters the resulting groups. Be precise about count(*), which counts rows, count(column), which ignores nulls, and count(distinct column), which removes duplicates. Joining before aggregation can inflate totals, so confirm cardinality or aggregate child tables before combining them.',
    ],
    whyItMatters: 'Operational dashboards and marketplace analytics depend on correct aggregates, and subtle duplication can produce confident but false business decisions. Interviewers look for semantic control over grouping stages, nulls, and join cardinality.',
    useCases: [
      'Counting active candidates by primary time zone for staffing coverage',
      'Finding clients with at least five completed engagements in the past year',
      'Summing approved invoice amounts by currency without mixing monetary units',
    ],
    workedExample: {
      scenario: 'A client-success team wants organizations with at least three completed contracts during the third quarter of 2026.',
      steps: [
        'Filter contracts to completed status and the half-open quarter interval before grouping.',
        'Group by organization ID so each contract contributes to exactly one organization count.',
        'Use HAVING count(*) >= 3 to retain only qualifying organizations.',
        'Join organization names after aggregation or include the stable name according to the schema dependency.',
      ],
      code: {
        language: 'SQL',
        code: `SELECT o.id, o.name, c.completed_contracts
FROM organization AS o
JOIN (
  SELECT organization_id, count(*) AS completed_contracts
  FROM contract
  WHERE status = 'completed'
    AND completed_at >= DATE '2026-07-01'
    AND completed_at < DATE '2026-10-01'
  GROUP BY organization_id
  HAVING count(*) >= 3
) AS c ON c.organization_id = o.id;`,
      },
      result: 'The query returns one row per qualifying organization with a count limited to the exact quarter and completion state.',
    },
    interview: {
      prompt: 'What is the difference between WHERE and HAVING?',
      answer: 'WHERE removes individual input rows before groups and aggregates are formed. HAVING evaluates each completed group and can filter on aggregate values such as count(*) >= 3. Pushing ordinary row predicates into WHERE usually reduces work and prevents excluded rows from contributing to aggregates.',
    },
  },
  'Window functions': {
    explanation: [
      'A window function computes across a set of related rows while retaining each input row, unlike GROUP BY, which collapses a group to one output row. The OVER clause defines partitions, ordering, and an optional frame, enabling ranks, running totals, lag comparisons, and per-group aggregates beside row detail.',
      'Partitioning resets the calculation for each logical group, while ordering determines sequence and tie behavior. Functions such as row_number, rank, and dense_rank differ when values tie, and aggregate windows need an explicit ROWS frame when peer rows should not expand the default frame. Filter window results in an outer query or a supported QUALIFY clause because they are calculated after WHERE.',
    ],
    whyItMatters: 'Window functions solve ranking and temporal analysis without self-joins or loss of row detail. They are common in Toptal SQL screens because correct answers require understanding evaluation order, partitions, ties, and frames.',
    useCases: [
      'Selecting the latest assessment attempt for each candidate with row_number',
      'Ranking candidates within each role by score while preserving tied ranks',
      'Comparing each contract rate change with the previous rate through lag',
    ],
    workedExample: {
      scenario: 'A recruiter dashboard must show the most recent submitted assessment attempt for every candidate in one role.',
      steps: [
        'Filter attempts to the role and submitted status before window evaluation.',
        'Partition by candidate ID and order by submitted time descending with attempt ID as a deterministic tie-breaker.',
        'Assign row_number and select rank 1 in the outer query.',
        'Return the original attempt columns because the window did not collapse row detail.',
      ],
      code: {
        language: 'SQL',
        code: `WITH ranked_attempts AS (
  SELECT a.*,
         row_number() OVER (
           PARTITION BY candidate_id
           ORDER BY submitted_at DESC, id DESC
         ) AS recency
  FROM assessment_attempt AS a
  WHERE role_id = $1 AND status = 'submitted'
)
SELECT candidate_id, id, score, submitted_at
FROM ranked_attempts
WHERE recency = 1;`,
      },
      result: 'The query returns one deterministic latest attempt per candidate while preserving the score and submission fields from that exact row.',
    },
    interview: {
      prompt: 'How does a window function differ from GROUP BY?',
      answer: 'GROUP BY produces one row per group and removes individual row identity unless values are aggregated. A window function computes over a related set but attaches the result to each input row. That makes windows suitable for rank, previous-value comparison, and running aggregates when the query still needs row-level columns.',
    },
  },
  Indexes: {
    explanation: [
      'An index is an auxiliary data structure that lets a database locate rows without scanning an entire table. A B-tree index supports equality, range, and ordered access on its leading columns; other index types serve full-text, spatial, or containment operators. The optimizer chooses an index only when its estimated work is cheaper than alternatives.',
      'Indexes trade faster reads for storage, cache pressure, and extra work on every insert, update, and delete. Column order should follow real predicates and ordering, partial indexes can target a selective active subset, and covering columns can avoid heap reads. Redundant or low-selectivity indexes may add cost without improving plans, so measure representative queries and write load.',
    ],
    whyItMatters: 'A single well-designed index can reduce an endpoint from seconds to milliseconds, while indiscriminate indexing can slow ingestion and migrations. Backend interviews expect the index to be derived from a concrete query shape and validated with a plan.',
    useCases: [
      'Indexing applications by role ID, status, and submitted time for recruiter queues',
      'Using a unique index to enforce one active idempotency key per API client',
      'Creating a partial index for webhook deliveries whose status is pending or retryable',
    ],
    workedExample: {
      scenario: 'A dashboard repeatedly fetches the newest 50 pending applications for one role from a table containing millions of historical applications.',
      steps: [
        'Capture the exact predicate and ordering: role_id equality, pending status, then submitted_at descending.',
        'Create a partial index whose key starts with role_id and continues with submitted_at descending for pending rows.',
        'Include ID as a deterministic ordering key and selected display columns only if index-only reads are valuable.',
        'Run EXPLAIN ANALYZE with production-like distribution and compare latency and write overhead.',
      ],
      code: {
        language: 'SQL',
        code: `CREATE INDEX application_pending_queue_idx
ON application (role_id, submitted_at DESC, id DESC)
WHERE status = 'pending';

SELECT id, candidate_id, submitted_at
FROM application
WHERE role_id = $1 AND status = 'pending'
ORDER BY submitted_at DESC, id DESC
LIMIT 50;`,
      },
      result: 'The database can seek directly into the pending rows for one role and stop after 50 ordered matches instead of scanning historical statuses.',
    },
    interview: {
      prompt: 'Why does the order of columns in a composite B-tree index matter?',
      answer: 'The index is ordered lexicographically from its leading column, so it efficiently narrows by a usable left prefix. An index on role_id, status, submitted_at can serve equality on role and status followed by a time range or ordering. A query filtering only submitted_at usually cannot exploit that ordering as directly because the earlier columns are unconstrained.',
    },
  },
  Transactions: {
    explanation: [
      'A transaction groups database operations into one atomic unit: either all changes commit or none do. Consistency comes from the schema and application invariants preserved by that unit, isolation controls which concurrent effects are visible, and durability means committed data survives failures according to the database guarantee. Transactions protect related writes from partial completion but do not automatically encode the correct business rule.',
      'Keep transactions short, use conditional writes or locking when decisions depend on current state, and choose an isolation level based on anomalies the workflow cannot tolerate. External HTTP calls should usually happen outside the transaction because they hold locks and cannot be rolled back; use an outbox or state machine to coordinate database commits with asynchronous side effects.',
    ],
    whyItMatters: 'Concurrency can violate invariants even when each request works correctly in isolation. Senior backend exercises often ask how to prevent double booking or coordinate event publication, and the answer requires both transactional boundaries and database-enforced conditions.',
    useCases: [
      'Creating a contract and its initial rate record as one all-or-nothing change',
      'Claiming one interview slot under concurrent booking requests',
      'Writing an application status change and its outbound event into one transaction',
    ],
    workedExample: {
      scenario: 'Two clients attempt to reserve the last available interviewer slot at nearly the same time.',
      steps: [
        'Begin a transaction and issue a conditional update that changes available to reserved only when the slot is still available.',
        'Check the affected-row count; exactly one transaction can observe a successful transition.',
        'Insert the booking linked to the winning candidate within the same transaction.',
        'Commit the winner and return 409 from the loser without creating a booking.',
      ],
      code: {
        language: 'SQL',
        code: `BEGIN;

UPDATE interview_slot
SET status = 'reserved', candidate_id = $1
WHERE id = $2 AND status = 'available';

-- Continue only when exactly one row was updated.
INSERT INTO interview_booking (slot_id, candidate_id) VALUES ($2, $1);
COMMIT;`,
      },
      result: 'The state transition and booking commit together, and the conditional update allows only one concurrent caller to reserve the slot.',
    },
    interview: {
      prompt: 'Why should an application avoid making a slow network call inside a database transaction?',
      answer: 'The call extends lock duration and connection occupancy, increasing contention and deadlock risk, and its side effect cannot be undone if the database later rolls back. Prefer committing an outbox event or pending state atomically, then let a worker perform the call with idempotency and record the outcome in a later transaction.',
    },
  },
  Constraints: {
    explanation: [
      'Constraints encode data invariants in the database: NOT NULL requires a value, CHECK limits allowed values or relationships, UNIQUE prevents duplicate keys, FOREIGN KEY enforces references, and exclusion constraints can reject overlapping ranges. They protect every writer, including background jobs, migrations, and concurrent requests that bypass or race application prechecks.',
      'Use constraints for truths that must always hold in persisted state and application validation for friendly, contextual errors before the write. Constraint names should identify the rule so violations can map to stable API responses. Before adding a constraint to existing data, audit and repair violations, then use the database features for staged validation when a full table lock would be risky.',
    ],
    whyItMatters: 'Application checks alone have a race window and can drift across services, while constraints make invalid committed state impossible at the authoritative boundary. Interviewers often probe whether a proposed uniqueness check remains correct under concurrent inserts.',
    useCases: [
      'Enforcing one application per candidate and role with a composite unique constraint',
      'Rejecting contracts whose end date precedes their start date with CHECK',
      'Preventing overlapping interviewer time ranges with a PostgreSQL exclusion constraint',
    ],
    workedExample: {
      scenario: 'A candidate must not submit more than one application to the same role, even if two API requests arrive concurrently.',
      steps: [
        'Add a unique constraint on candidate_id and role_id after removing any historical duplicates.',
        'Keep a precheck only to provide an early friendly response in the common case.',
        'Attempt the insert and catch the named unique violation because another transaction may win after the precheck.',
        'Map that violation to a 409 response containing the existing application link.',
      ],
      code: {
        language: 'SQL',
        code: `ALTER TABLE application
ADD CONSTRAINT application_candidate_role_unique
UNIQUE (candidate_id, role_id);`,
      },
      result: 'The database admits at most one application for the pair under any concurrency pattern, while the API still returns a domain-specific conflict.',
    },
    interview: {
      prompt: 'If the API checks for duplicates before inserting, why add a unique constraint?',
      answer: 'The check and insert are separate observations unless protected by an equivalent serializable rule. Two requests can both see no duplicate and then both insert. A unique constraint arbitrates atomically at the database and also protects other writers. The API can retain its precheck for usability but must handle the constraint violation as the final authority.',
    },
  },
  'Query plans': {
    explanation: [
      'A query plan is the optimizer choice of scans, joins, sorts, aggregates, and access order used to execute SQL. It is based on table statistics, estimated row counts, available indexes, operator costs, and query predicates. The same SQL can receive different plans as data volume, parameter values, or statistics change.',
      'Use EXPLAIN to inspect estimates and EXPLAIN ANALYZE to execute the query and compare estimates with actual rows and timing. Look for unexpectedly large scans, repeated loops, spilled sorts, poor join choices, and cardinality errors rather than assuming every sequential scan is bad. Test with production-like data and account for cache warmth because tiny development tables hide plan problems.',
    ],
    whyItMatters: 'Performance tuning based only on SQL appearance leads to speculative indexes and missed bottlenecks. A plan provides evidence about where work occurs and is a common interview tool for connecting schema design, data distribution, and endpoint latency.',
    useCases: [
      'Diagnosing why candidate search scans millions of inactive profiles',
      'Confirming that a pending-delivery partial index supports the webhook worker query',
      'Finding a nested-loop join whose underestimated input causes repeated expensive lookups',
    ],
    workedExample: {
      scenario: 'An API query for the latest pending applications by role takes 1.8 seconds in staging despite returning only 50 rows.',
      steps: [
        'Run EXPLAIN (ANALYZE, BUFFERS) with a representative role ID and preserve the plan before changing anything.',
        'Observe whether the engine scans and sorts many application rows because no index matches both filtering and order.',
        'Add the targeted partial composite index and refresh statistics if necessary.',
        'Run the same plan again and compare actual rows, buffers, sort removal, and total execution time.',
      ],
      code: {
        language: 'SQL',
        code: `EXPLAIN (ANALYZE, BUFFERS)
SELECT id, candidate_id, submitted_at
FROM application
WHERE role_id = 884 AND status = 'pending'
ORDER BY submitted_at DESC, id DESC
LIMIT 50;`,
      },
      result: 'The before-and-after plans show whether the index changed the operation from a broad scan and sort to a bounded index scan, with measured buffer and latency impact.',
    },
    interview: {
      prompt: 'Is a sequential scan always evidence that an index is missing?',
      answer: 'No. A sequential scan can be cheapest for a small table or a query that returns a large fraction of rows, where random index lookups add overhead. I compare estimates with actual rows, inspect selectivity and buffers, and consider whether the query can stop early. The problem is excessive work for the requirement, not the presence of one operator name.',
    },
  },
  Migrations: {
    explanation: [
      'A database migration is a versioned, repeatable change to schema or data that moves every environment through a known sequence. Schema migrations create or alter structures, while data migrations backfill or transform rows. Each migration should have a clear invariant, deployment order, observability, and recovery plan rather than relying on a manual production edit.',
      'For zero-downtime releases, use expand-and-contract changes: add a backward-compatible structure, deploy code that can work during the transition, backfill in bounded batches, switch reads, enforce the final constraint, and remove the old structure only after older application versions are gone. Large table rewrites, long locks, and one-transaction backfills need database-specific analysis before rollout.',
    ],
    whyItMatters: 'Application and schema versions overlap during rolling deployment, so a locally correct breaking migration can cause production errors or extended locks. Migration design is a practical test of operational judgment in senior backend interviews.',
    useCases: [
      'Adding a non-null candidate handle to a populated profile table without blocking writes',
      'Splitting a single contract rate column into a rate-history table while old code remains live',
      'Building a large index concurrently before changing the query path',
    ],
    workedExample: {
      scenario: 'A populated application table needs a mandatory source column, but old servers will continue inserting rows during a rolling deployment.',
      steps: [
        'Add source as nullable with no table-wide default that would force an unsafe rewrite on the target database version.',
        'Deploy code that writes source for new rows while still tolerating null values on reads.',
        'Backfill old rows in small primary-key batches and monitor lock time, replication lag, and remaining null count.',
        'Add and validate the non-null guarantee only after all writers populate the field, then remove temporary fallback code later.',
      ],
      code: {
        language: 'SQL',
        code: `ALTER TABLE application ADD COLUMN source text;

UPDATE application
SET source = 'legacy'
WHERE id > $1 AND id <= $2 AND source IS NULL;

ALTER TABLE application ALTER COLUMN source SET NOT NULL;`,
      },
      result: 'Old and new application versions remain compatible throughout rollout, and the final schema enforces the new invariant after a controlled backfill.',
    },
    interview: {
      prompt: 'How would you safely rename a heavily used database column during rolling deployment?',
      answer: 'I would avoid a one-step rename that breaks old binaries. Add the new column, make deployed code write both and read with a controlled fallback, backfill existing rows, switch reads to the new column, and verify no old writers remain. Then stop dual writes and remove the old column in a later release, with monitoring and rollback points at each phase.',
    },
  },
  'N+1 queries': {
    explanation: [
      'An N+1 query problem occurs when code loads a collection with one query and then issues another query for each item, producing one plus N round trips. It commonly appears through ORM lazy loading or resolvers that fetch relationships independently. The result can look fast with five rows and collapse under realistic page sizes because network and database overhead grow linearly.',
      'Fix N+1 behavior by matching data loading to the access pattern: join when one result shape is appropriate, batch related keys with an IN query, preload declared relations, or use a request-scoped loader that batches and caches lookups. Preserve pagination and avoid replacing N+1 with one enormous Cartesian join; query count, returned row volume, memory, and authorization scope all matter.',
    ],
    whyItMatters: 'N+1 behavior turns normal growth into latency spikes and database connection pressure, especially on talent lists with several related fields. Performance interviews often expect both detection through traces or query counts and a fix that respects cardinality.',
    useCases: [
      'Batch-loading candidate profiles for 50 applications instead of querying once per row',
      'Preloading the current rate for each contract in an operations table',
      'Using a request-scoped loader to resolve organization names across GraphQL contract fields',
    ],
    workedExample: {
      scenario: 'A recruiter endpoint loads 50 applications, then the ORM separately fetches the candidate for every application, producing 51 queries.',
      steps: [
        'Capture database spans and confirm that the same candidate lookup shape repeats once per application.',
        'Collect the distinct candidate IDs from the page and fetch all permitted candidate summaries in one scoped query.',
        'Index the summaries by candidate ID in memory and attach them to applications while preserving original order.',
        'Add an integration assertion or query-budget test so the endpoint remains at a constant query count as page size grows.',
      ],
      code: {
        language: 'SQL',
        code: `SELECT id, display_name, headline
FROM candidate
WHERE organization_visibility_id = $1
  AND id = ANY($2);`,
      },
      result: 'The endpoint performs one application query and one candidate batch query, reducing round trips from 51 to 2 without exposing candidates outside the authorized scope.',
    },
    interview: {
      prompt: 'Why is replacing every N+1 query with one large join not always the best fix?',
      answer: 'Joining several one-to-many relationships can multiply rows, transfer duplicated data, complicate pagination, and consume more memory than a few bounded batch queries. I choose between joins, preloading, and request-scoped batching based on cardinality and result shape, then verify query count and row volume with realistic data.',
    },
  },
} satisfies Record<string, SoftwareLessonDetails>