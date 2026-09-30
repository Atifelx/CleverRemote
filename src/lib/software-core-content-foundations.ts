import type { SoftwareLessonDetails } from './software-core-lesson-types'

export const softwareFoundationsLessonDetails = {
  'Variables and naming': {
    explanation: [
      'A variable binds a name to a value so later code can refer to the value by its role instead of repeating a literal or expression. In Python, assignment creates or rebinds a name, and the value carries the runtime type; the variable is not a permanently typed box.',
      'Choose names that expose domain meaning, units, and state, such as retry_count, timeout_seconds, or normalized_email. Keep each name responsible for one concept, avoid shadowing built-ins, and introduce a local variable when it makes a transformation or business rule easier to inspect.',
    ],
    whyItMatters: 'Names are part of the program design because reviewers and future maintainers reason through them before tracing every expression. Precise names reduce unit mistakes, accidental reuse, and ambiguity at integration boundaries where similar values can have very different meanings.',
    useCases: [
      'Naming an external customer identifier separately from the internal database primary key',
      'Storing a normalized email before uniqueness lookup and account creation',
      'Distinguishing timeout_seconds from retry_count in a service client configuration',
    ],
    workedExample: {
      scenario: 'A webhook handler receives both a provider event ID and an internal event row ID, and vague names have caused the wrong value to be logged.',
      steps: [
        'Read the payload into provider_event_id so its origin remains explicit.',
        'Store the new database identifier as event_record_id instead of reusing a generic id variable.',
        'Use both names in the audit log and downstream call so their roles remain visible at each boundary.',
      ],
      code: {
        language: 'Python',
        code: `provider_event_id = payload["event_id"]
event_record_id = event_repository.insert(provider_event_id)

logger.info(
    "Stored provider event",
    extra={
        "provider_event_id": provider_event_id,
        "event_record_id": event_record_id,
    },
)`,
      },
      result: 'Logs and function calls now distinguish the external idempotency key from the internal storage identifier, preventing accidental substitution during debugging and maintenance.',
    },
    interview: {
      prompt: 'When does introducing a variable improve code instead of merely making it longer?',
      answer: 'A variable helps when it names a domain concept, preserves units or origin, avoids repeating an expensive or stateful expression, or exposes an intermediate transformation that deserves inspection. A name such as normalized_email documents why the value differs from raw_email. A temporary like x that only repeats an obvious expression adds little and may obscure the flow.',
    },
  },
  'Boolean control flow': {
    explanation: [
      'Boolean control flow chooses which operations run based on conditions. Comparisons, membership checks, and predicates produce truth values, while and and or short-circuit from left to right, allowing later checks to depend safely on earlier ones.',
      'Write conditions around explicit business predicates and prefer guard clauses for invalid or exceptional cases. Be careful with truthiness when zero, an empty collection, or an empty string is a valid value; compare with None or validate the exact state when absence and emptiness mean different things.',
    ],
    whyItMatters: 'Most production defects occur in branches and edge cases rather than the happy path. Clear conditions make authorization, validation, and fallback behavior auditable and prevent valid falsy values from being mistaken for missing data.',
    useCases: [
      'Rejecting a request unless the caller is authenticated and belongs to the requested tenant',
      'Using cached data only when the entry exists and has not expired',
      'Distinguishing a missing quantity from a valid quantity of zero in an inventory update',
    ],
    workedExample: {
      scenario: 'An inventory endpoint must accept zero as a valid stock level but reject a missing quantity and unauthorized warehouse access.',
      steps: [
        'Check warehouse access first and return a forbidden response before touching inventory state.',
        'Test quantity is None rather than relying on truthiness, because zero is valid.',
        'Reject negative values, then update the stock level for every remaining request.',
      ],
      code: {
        language: 'Python',
        code: `if not user.can_manage(warehouse_id):
    raise ForbiddenError("warehouse access required")

quantity = payload.get("quantity")
if quantity is None:
    raise ValidationError("quantity is required")
if quantity < 0:
    raise ValidationError("quantity cannot be negative")

inventory.set_quantity(item_id, quantity)`,
      },
      result: 'Unauthorized calls stop early, missing and negative quantities fail clearly, and a quantity of zero reaches the update as intended.',
    },
    interview: {
      prompt: 'Why can `if not value` be incorrect validation even though it is concise?',
      answer: 'It combines several states such as None, zero, an empty string, and an empty collection. Those states may have different domain meanings. If zero is valid but None means absent, `if value is None` expresses the real rule. Concision is useful only when every falsy value should follow the same branch.',
    },
  },
  'Loops and invariants': {
    explanation: [
      'A loop repeats an operation over items or while a condition holds. A loop invariant is a statement that is true before the first iteration and remains true after every iteration, such as processed_total equaling the sum of all records seen so far.',
      'Define the invariant and termination condition before writing a nontrivial loop. Update related state together, avoid mutating the collection being traversed unless the algorithm is designed for it, and add explicit bounds to retries or pagination so malformed input cannot create an infinite loop.',
    ],
    whyItMatters: 'An invariant gives a precise way to reason about partial progress, off-by-one errors, and recovery after failure. This matters in batch processing and pagination, where a loop may handle thousands of items and must never skip, duplicate, or process forever.',
    useCases: [
      'Following paginated API responses until the provider returns no continuation token',
      'Accumulating invoice totals while preserving the relationship between processed lines and the running sum',
      'Retrying a transient integration call with a fixed maximum number of attempts',
    ],
    workedExample: {
      scenario: 'A synchronization job fetches customers from a paginated partner API and must process each page exactly once.',
      steps: [
        'Initialize the page token to None and define the invariant that every stored customer came from a completed page before the current token.',
        'Fetch one page, store all of its customers transactionally, and only then replace the token with the returned continuation token.',
        'Stop when the continuation token is None, leaving the invariant true for the complete result set.',
      ],
      code: {
        language: 'Python',
        code: `page_token = None

while True:
    page = partner.fetch_customers(page_token=page_token)
    customer_repository.upsert_many(page.items)

    page_token = page.next_token
    if page_token is None:
        break`,
      },
      result: 'The job advances only after a page is stored, terminates on the documented sentinel, and maintains a clear checkpoint relationship between saved data and the next request.',
    },
    interview: {
      prompt: 'How would you reason about the correctness of a loop that calculates a total?',
      answer: 'I would state an invariant such as: before each iteration, the running total equals the sum of all previously processed items. It is true initially because no items have been processed and the total is zero. The loop preserves it by adding exactly the current item, and when iteration ends all items have been processed, so the invariant proves the final total.',
    },
  },
  'Functions and contracts': {
    explanation: [
      'A function packages behavior behind a named interface. Its contract describes accepted inputs, returned output, side effects, failure modes, and any preconditions or guarantees that callers may rely on, whether those rules are expressed through types, documentation, validation, or tests.',
      'Design a function around one coherent responsibility and make invalid states difficult to pass silently. Keep pure calculation separate from network or database effects when practical, return a stable shape, and raise or return errors at a level that callers can handle without knowing internal implementation details.',
    ],
    whyItMatters: 'Stable contracts let teams change implementations independently and test components in isolation. They also prevent ambiguous failure behavior, such as one caller expecting None while another assumes an exception, from spreading defects across service boundaries.',
    useCases: [
      'Defining a pricing function that accepts validated line items and returns a monetary total',
      'Wrapping a payment provider behind a charge operation with domain-specific failures',
      'Exposing a repository method that either returns an account or raises a documented not-found error',
    ],
    workedExample: {
      scenario: 'Several checkout handlers need the same subtotal calculation, and each currently handles negative quantities differently.',
      steps: [
        'Define a calculate_subtotal function whose contract accepts line items with non-negative quantities and integer cent prices.',
        'Validate the precondition at the function boundary and raise a domain validation error for an invalid item.',
        'Return an integer number of cents and add tests for an empty order, multiple items, and a negative quantity.',
      ],
      code: {
        language: 'Python',
        code: `def calculate_subtotal(lines: list[OrderLine]) -> int:
    total_cents = 0
    for line in lines:
        if line.quantity < 0:
            raise ValidationError("quantity cannot be negative")
        total_cents += line.unit_price_cents * line.quantity
    return total_cents`,
      },
      result: 'All checkout paths share one explicit monetary contract, and invalid quantities fail consistently before payment or persistence begins.',
    },
    interview: {
      prompt: 'What belongs in a function contract beyond parameter and return types?',
      answer: 'The contract also includes semantic rules such as valid ranges and units, side effects, ordering guarantees, mutation, exceptions, and resource ownership. A type of int cannot say whether a value is cents, whether negatives are accepted, or whether the function writes to a database. Those guarantees need clear code, validation, documentation, and tests.',
    },
  },
  'Scope and lifetime': {
    explanation: [
      'Scope determines where a name can be resolved, while lifetime describes how long the referenced object or resource remains usable. Python resolves local, enclosing, global, and built-in names in that order, but an object can outlive the function that created it when another reference retains it.',
      'Keep mutable state in the narrowest scope that owns it, pass dependencies explicitly, and avoid request-specific data in module globals. For files, locks, database sessions, and network clients, manage lifetime deliberately so cleanup happens even when control exits through an exception.',
    ],
    whyItMatters: 'Incorrect scope creates hidden coupling, while incorrect lifetime causes leaks, stale state, and cross-request contamination. Backend services are especially sensitive because module state may be shared by many concurrent requests in one process.',
    useCases: [
      'Keeping a request correlation ID local instead of storing it in a shared module variable',
      'Sharing a long-lived connection pool while creating a short-lived transaction per request',
      'Closing an uploaded temporary file immediately after its import completes',
    ],
    workedExample: {
      scenario: 'A web service stores the current tenant ID in a module variable, causing concurrent requests to occasionally query the wrong tenant.',
      steps: [
        'Remove the mutable module-level current_tenant_id value from the request path.',
        'Resolve the tenant from the authenticated request and pass it explicitly to the service layer.',
        'Create the database transaction inside the request scope and close it before the response is returned.',
      ],
      code: {
        language: 'Python',
        code: `def list_orders(request: Request) -> list[Order]:
    tenant_id = request.authenticated_tenant_id
    with database.transaction() as transaction:
        return order_service.list_for_tenant(transaction, tenant_id)`,
      },
      result: 'Each request carries its own tenant context and transaction lifetime, so concurrent work cannot overwrite shared request state.',
    },
    interview: {
      prompt: 'Why is a module-level variable risky for request-specific data in a web application?',
      answer: 'A server process commonly handles multiple requests over time and may interleave concurrent work. A module variable is shared within that process, so one request can overwrite data another request still expects. Request-specific state should be passed explicitly or held in a request-aware context whose lifetime and concurrency behavior are defined.',
    },
  },
  'Errors and recovery': {
    explanation: [
      'An error signals that an operation could not produce its promised result. Recovery means choosing a safe next state: retrying a transient failure, using a valid fallback, compensating for a partial effect, or stopping and surfacing enough context for another layer to respond.',
      'Classify failures before handling them. Retry only operations that are transient and safe to repeat, cap attempts with backoff, preserve the original cause when translating errors, and never convert an unknown failure into apparent success merely to keep the process moving.',
    ],
    whyItMatters: 'Distributed systems fail partially, and careless recovery can duplicate charges, lose records, or hide an outage. Deliberate recovery protects data integrity while giving operators and callers an accurate account of what completed and what remains uncertain.',
    useCases: [
      'Retrying a rate-limited provider request with bounded exponential backoff',
      'Moving an invalid queue message to a dead-letter queue after recording the validation failure',
      'Rolling back a database transaction when one step of an order update fails',
    ],
    workedExample: {
      scenario: 'A payment status lookup intermittently returns a provider timeout, but invalid payment IDs must fail immediately.',
      steps: [
        'Separate provider timeout errors from permanent not-found and authentication errors.',
        'Retry only timeouts, using the same read-only request and a maximum of three attempts with increasing delay.',
        'After the final timeout, raise an availability error with the payment ID and original cause for the API boundary to report.',
      ],
      code: {
        language: 'Python',
        code: `for attempt in range(3):
    try:
        return provider.get_payment(payment_id)
    except ProviderTimeout as error:
        if attempt == 2:
            raise PaymentServiceUnavailable(payment_id) from error
        time.sleep(0.25 * (2 ** attempt))`,
      },
      result: 'Transient timeouts receive a bounded recovery attempt, permanent failures are not retried, and exhaustion remains visible as a meaningful service error.',
    },
    interview: {
      prompt: 'What makes a retry safe, and why should retries be bounded?',
      answer: 'The failure must be plausibly transient, and repeating the operation must be idempotent or protected by an idempotency key. The delay should avoid amplifying an overloaded dependency. Bounds limit latency and load, prevent an infinite loop, and create a clear point where ownership returns to the caller, queue, or operator.',
    },
  },
  Collections: {
    explanation: [
      'Collections group related values and provide operations suited to different access patterns. Lists preserve order and allow duplicates, tuples represent fixed ordered records, sets provide unique membership, and dictionaries map unique keys to values.',
      'Select a collection from the behavior the program needs rather than habit. Use a set for repeated membership checks, a dictionary for keyed lookup, and a list when order or repeated values matter; then define what ordering, uniqueness, and missing keys mean at the contract boundary.',
    ],
    whyItMatters: 'The right collection makes intent visible and can change an operation from repeated linear scans to direct lookup. It also encodes domain rules such as uniqueness and ordering before those rules become scattered conditional logic.',
    useCases: [
      'Indexing customer records by external ID for reconciliation with a provider export',
      'Using a set of granted permissions for repeated authorization checks',
      'Preserving an ordered list of ledger entries for deterministic statement generation',
    ],
    workedExample: {
      scenario: 'A reconciliation job compares 10,000 provider transactions with local transactions and currently scans the local list for every provider row.',
      steps: [
        'Build a dictionary from local transactions keyed by the unique provider transaction ID.',
        'Iterate through provider rows and use direct keyed lookup to find the matching local record.',
        'Record missing IDs separately and compare amounts only for matched records.',
      ],
      code: {
        language: 'Python',
        code: `local_by_provider_id = {
    transaction.provider_id: transaction
    for transaction in local_transactions
}

for provider_row in provider_rows:
    local = local_by_provider_id.get(provider_row.id)
    if local is None:
        missing_ids.add(provider_row.id)
        continue
    compare_amounts(local, provider_row)`,
      },
      result: 'Each provider row performs one dictionary lookup instead of scanning every local transaction, while missing and matched cases remain explicit.',
    },
    interview: {
      prompt: 'How would you choose between a list, set, and dictionary for a new requirement?',
      answer: 'I would start from operations and invariants. A list is appropriate when order and duplicates matter, a set when uniqueness and membership dominate, and a dictionary when values are retrieved by a unique key. I would also consider iteration order, how missing values are handled, memory cost, and whether the chosen key is stable and hashable.',
    },
  },
  'Mutation and identity': {
    explanation: [
      'Identity asks whether two references point to the same object, while equality asks whether their values compare as equivalent. Mutation changes an existing object in place, so every holder of that object can observe the change; rebinding a name points only that name at another object.',
      'Use equality for domain value comparisons and identity primarily for singletons such as None. Copy mutable inputs when ownership should not be shared, avoid mutable default arguments, and make mutation explicit when callers need to know that a list, dictionary, or model will be changed in place.',
    ],
    whyItMatters: 'Aliased mutable state can produce changes far from the line that caused them, especially when cached objects or request payloads are reused. Understanding identity prevents accidental cross-call state and incorrect comparisons that pass simple tests but fail under real reuse.',
    useCases: [
      'Copying request metadata before adding internal tracing fields',
      'Avoiding a shared list as a function default across multiple calls',
      'Comparing a cached result with None by identity while comparing records by value',
    ],
    workedExample: {
      scenario: 'A helper adds an authorization header to a caller-provided headers dictionary, and the header unexpectedly appears in a later request.',
      steps: [
        'Treat the input dictionary as caller-owned rather than mutating it directly.',
        'Create a shallow copy because header keys and values are immutable strings.',
        'Add the authorization value to the copy and send that copy to the HTTP client.',
      ],
      code: {
        language: 'Python',
        code: `def authorized_headers(
    headers: dict[str, str], token: str
) -> dict[str, str]:
    result = headers.copy()
    result["Authorization"] = f"Bearer {token}"
    return result`,
      },
      result: 'The helper returns complete request headers without changing the caller-owned dictionary, so later requests do not inherit hidden state.',
    },
    interview: {
      prompt: 'What is the difference between `is` and `==`, and when does mutation make that distinction important?',
      answer: '`is` checks whether references point to the same object; `==` checks value equality as defined by the objects. Two separate lists can be equal without being identical. If two names are identical references to one mutable list, changing it through either name affects both, which is why shared ownership matters independently of equality.',
    },
  },
  'Input and output boundaries': {
    explanation: [
      'An input or output boundary is where data crosses between the program and an external system, such as HTTP, a queue, a file, a database, or standard input. Boundary code translates untrusted serialized data into validated domain values and translates internal results back into a stable external representation.',
      'Validate shape, type, range, encoding, and required relationships as data enters, then normalize it once before core logic uses it. On output, serialize only intended fields, use explicit formats for dates and money, and keep provider-specific schemas in adapters instead of leaking them through the application.',
    ],
    whyItMatters: 'External data is incomplete, malformed, versioned, and sometimes hostile. Strong boundaries keep those variations from contaminating core logic and make failures attributable to a specific contract rather than surfacing later as confusing internal exceptions.',
    useCases: [
      'Validating and normalizing a webhook payload before dispatching a domain event',
      'Parsing a CSV import into typed employee records with row-level errors',
      'Serializing internal timestamps as UTC ISO 8601 strings in an API response',
    ],
    workedExample: {
      scenario: 'A payroll integration receives employee start dates in a JSON webhook and must reject impossible or ambiguously formatted dates.',
      steps: [
        'Require the employee_id and start_date fields and reject unexpected non-string values.',
        'Parse start_date using the documented ISO date format rather than locale-dependent guessing.',
        'Pass the resulting date value to the payroll service and return a provider-safe acknowledgement without internal fields.',
      ],
      code: {
        language: 'Python',
        code: `employee_id = require_string(payload, "employee_id")
start_date_text = require_string(payload, "start_date")

try:
    start_date = date.fromisoformat(start_date_text)
except ValueError as error:
    raise ValidationError("start_date must use YYYY-MM-DD") from error

payroll.activate_employee(employee_id, start_date)`,
      },
      result: 'Core payroll logic receives a real date rather than an unchecked string, and malformed provider data fails with a boundary-specific message.',
    },
    interview: {
      prompt: 'Why should validation happen at a system boundary instead of only inside the business logic?',
      answer: 'Boundary validation converts uncertain external representations into trusted internal values and can report errors using the external contract. Without it, every internal function must defend against serialized forms and malformed states. Domain logic may still enforce business invariants, but parsing, schema checks, and normalization belong where the data enters.',
    },
  },
  'Complexity mindset': {
    explanation: [
      'A complexity mindset estimates how resource use grows as input grows. Time complexity counts dominant operations and space complexity counts additional storage, using forms such as constant, logarithmic, linear, and quadratic growth rather than machine-specific timings.',
      'Identify the input dimension, inspect nested work and repeated scans, and choose data structures or algorithms that fit expected scale. Complexity is one engineering constraint among latency, readability, network cost, and database behavior, so measure realistic workloads before complicating code for a theoretical improvement.',
    ],
    whyItMatters: 'Code that is fast for ten records can become unusable for ten thousand. Early growth-rate reasoning catches avoidable repeated work and helps candidates explain performance tradeoffs rigorously during backend and algorithm interviews.',
    useCases: [
      'Replacing nested customer reconciliation scans with a dictionary index',
      'Recognizing that database calls inside a loop create an N-plus-one query pattern',
      'Selecting pagination and streaming when an export cannot fit safely in memory',
    ],
    workedExample: {
      scenario: 'An endpoint attaches an owner to each project by scanning the full user list for every project.',
      steps: [
        'Define p as the number of projects and u as the number of users, making the nested scan cost proportional to p multiplied by u.',
        'Build one dictionary of users by ID in linear time and linear additional space.',
        'Look up each project owner once, then measure the endpoint with production-sized data to confirm the expected improvement.',
      ],
      code: {
        language: 'Python',
        code: `users_by_id = {user.id: user for user in users}

result = [
    ProjectView(project=project, owner=users_by_id[project.owner_id])
    for project in projects
]`,
      },
      result: 'The dominant work changes from O(p * u) repeated scans to O(p + u) construction and lookup, at the cost of O(u) additional memory.',
    },
    interview: {
      prompt: 'How do you discuss complexity when a function also performs database or network calls?',
      answer: 'I separate local algorithmic growth from external operations. A loop may be O(n) locally but issue n network requests, making round trips and provider limits dominant. I would state both, look for batching or set-based queries, estimate memory tradeoffs, and validate the design with realistic latency and input sizes.',
    },
  },
  Comprehensions: {
    explanation: [
      'A comprehension constructs a list, set, or dictionary by expressing a transformation and optional filter over an iterable. It keeps the output expression, source, and selection rule together, which can make a simple data reshaping operation easier to read than an accumulator loop.',
      'Use comprehensions for one clear transformation without hidden side effects. Switch to an ordinary loop when logic needs multiple branches, error handling, logging, mutation, or several intermediate names, and use a generator expression when the complete result does not need to be stored.',
    ],
    whyItMatters: 'Backend code frequently reshapes API and database results. A well-scoped comprehension makes that mapping concise without sacrificing intent, while knowing its limits prevents dense expressions that are difficult to debug or review.',
    useCases: [
      'Building a dictionary of active accounts keyed by external identifier',
      'Extracting unique normalized email domains from imported users',
      'Creating response objects from validated database rows',
    ],
    workedExample: {
      scenario: 'A partner API returns enabled and disabled integrations, and the application needs enabled configurations keyed by provider name.',
      steps: [
        'Iterate over the provider records once and filter to records whose enabled flag is true.',
        'Use the normalized provider name as the dictionary key and the configuration object as its value.',
        'Reject duplicate normalized names before construction if the upstream contract does not guarantee uniqueness.',
      ],
      code: {
        language: 'Python',
        code: `enabled_by_provider = {
    integration.provider_name.lower(): integration.config
    for integration in integrations
    if integration.enabled
}`,
      },
      result: 'The application obtains one direct-lookup dictionary whose transformation and enabled-only rule are visible in a single readable expression.',
    },
    interview: {
      prompt: 'When would you replace a comprehension with a regular loop?',
      answer: 'I would use a loop when each item needs several decisions, exception handling, logging, side effects, or intermediate values whose names explain the business rule. A comprehension is strongest when it states one transformation and perhaps one simple filter. Brevity should not compress away the reasoning a reviewer needs.',
    },
  },
  Generators: {
    explanation: [
      'A generator produces values lazily, pausing at each yield and resuming when the next value is requested. It follows the iterator protocol but retains its local execution state, allowing a pipeline to process one item at a time instead of materializing an entire collection.',
      'Use a generator for large or unbounded streams and composable transformations, while remembering that it is normally consumed once and errors may occur during iteration rather than creation. Resource ownership must remain clear because a suspended generator can keep files, cursors, or other state alive.',
    ],
    whyItMatters: 'Lazy production keeps memory bounded for large exports and lets consumers stop early. It also changes when work and failures happen, an important distinction when designing observability, cleanup, and transaction boundaries.',
    useCases: [
      'Streaming database rows into a CSV export without loading all rows into memory',
      'Reading and validating a multi-gigabyte event file one record at a time',
      'Producing paginated API items until a caller has enough results',
    ],
    workedExample: {
      scenario: 'An audit export may contain millions of rows, and building a list causes the worker to exceed its memory limit.',
      steps: [
        'Query audit rows in fixed-size pages ordered by a stable unique cursor.',
        'Yield each serialized row from the current page before requesting the next page.',
        'Let the response writer consume the generator incrementally and stop querying when no rows remain.',
      ],
      code: {
        language: 'Python',
        code: `def iter_audit_rows(repository: AuditRepository):
    cursor = None
    while True:
        page = repository.fetch_page(after=cursor, limit=1000)
        if not page:
            return
        for record in page:
            yield serialize_audit_record(record)
        cursor = page[-1].id`,
      },
      result: 'The exporter holds at most one database page and one serialized row at a time, so memory remains bounded as the export grows.',
    },
    interview: {
      prompt: 'How does a generator differ from returning a list, beyond lower memory use?',
      answer: 'A list performs its work before returning and can be iterated repeatedly. A generator defers work until consumption, can represent an unbounded sequence, preserves suspended local state, and is generally single-use. Exceptions and side effects therefore occur during iteration, and early termination may mean some work never happens.',
    },
  },
  'Context managers': {
    explanation: [
      'A context manager defines setup and cleanup around a block entered by with. Its enter operation acquires or prepares a resource, and its exit operation runs whether the block succeeds or raises, with the option to observe or deliberately suppress an exception.',
      'Use context managers for files, locks, transactions, temporary configuration, and other paired operations. Keep the managed scope as small as practical, do not suppress exceptions accidentally, and implement reusable managers with a class or contextlib when callers repeatedly need the same lifecycle guarantee.',
    ],
    whyItMatters: 'Cleanup paths are easy to miss when a function returns early or raises. Context managers make resource lifetime visible in the control flow and protect connection pools, file descriptors, locks, and transactional consistency.',
    useCases: [
      'Committing or rolling back a database transaction around an order update',
      'Closing an uploaded file after parsing succeeds or fails',
      'Acquiring and reliably releasing a distributed or local lock',
    ],
    workedExample: {
      scenario: 'Creating an invoice updates the invoice and ledger tables, and both writes must succeed or neither may remain.',
      steps: [
        'Open a transaction with a context manager before the first database write.',
        'Insert the invoice and matching ledger entry using the same transaction.',
        'Allow normal exit to commit and any raised exception to trigger rollback automatically.',
      ],
      code: {
        language: 'Python',
        code: `with database.transaction() as transaction:
    invoice = invoice_repository.create(transaction, invoice_data)
    ledger_repository.record_receivable(
        transaction,
        invoice_id=invoice.id,
        amount_cents=invoice.total_cents,
    )`,
      },
      result: 'The two related writes share one visible lifetime: successful completion commits both, while any failure rolls both back.',
    },
    interview: {
      prompt: 'What guarantee does a context manager provide when an exception occurs inside its block?',
      answer: 'Its exit method is invoked with the exception information, so cleanup can run even on exceptional control flow. The manager may suppress the exception by explicitly indicating that it handled it, but most resource managers clean up and allow it to propagate. The exact commit, rollback, close, or release behavior is part of that manager contract.',
    },
  },
  Dataclasses: {
    explanation: [
      'A dataclass declares a data-focused Python class and generates routine methods such as initialization, representation, and equality from annotated fields. It keeps related values under a named domain type without manually writing repetitive constructors and comparison code.',
      'Use dataclasses for internal records and value objects whose fields and defaults are well defined. Add validation in a factory or post-initialization step when needed, use default_factory for mutable defaults, and consider frozen instances when value semantics are more appropriate than in-place mutation.',
    ],
    whyItMatters: 'Named records communicate more than loose dictionaries and give type checkers a stable structure. They also make equality, defaults, and mutability explicit, which improves tests and prevents misspelled string keys from becoming runtime-only defects.',
    useCases: [
      'Representing a validated money value with currency and integer minor units',
      'Passing a structured import result containing accepted rows and row errors',
      'Modeling immutable configuration loaded from environment variables',
    ],
    workedExample: {
      scenario: 'A payout service passes amount and currency through several functions as an unstructured dictionary.',
      steps: [
        'Define a frozen Money dataclass with amount_cents and currency fields.',
        'Validate non-negative amounts and normalize currency in a named factory before constructing the value.',
        'Update payout calculations to accept Money so field access and equality are checked consistently.',
      ],
      code: {
        language: 'Python',
        code: `@dataclass(frozen=True)
class Money:
    amount_cents: int
    currency: str

    @classmethod
    def create(cls, amount_cents: int, currency: str) -> "Money":
        if amount_cents < 0:
            raise ValueError("amount cannot be negative")
        return cls(amount_cents, currency.upper())`,
      },
      result: 'Payout code receives an immutable named value with normalized currency, generated equality for tests, and no dictionary key ambiguity.',
    },
    interview: {
      prompt: 'When is a dataclass preferable to a dictionary, and when is it not enough?',
      answer: 'A dataclass is preferable when the program owns a stable set of named fields and benefits from construction, equality, and type checking. A dictionary remains useful for dynamic keys or raw boundary data. A dataclass does not automatically validate values or provide persistence behavior, so domain invariants still need factories, post-initialization checks, or a richer domain class.',
    },
  },
  'Type hints': {
    explanation: [
      'Type hints describe the values an expression, parameter, or return may hold so static tools and readers can check how components fit together before execution. Python normally does not enforce annotations at runtime, so they complement rather than replace boundary validation and tests.',
      'Annotate public contracts and domain structures precisely, using unions for genuine alternatives, protocols for required behavior, and narrow collection element types. Avoid Any when the shape is knowable because it turns off checking through that path, and let inference handle obvious local values instead of adding noise.',
    ],
    whyItMatters: 'Types expose mismatched assumptions during development, improve safe refactoring, and document integration contracts close to the code. In a distributed team, they reduce the amount of implementation reading needed to call a function correctly.',
    useCases: [
      'Declaring that a repository lookup may return an Account or None',
      'Defining a protocol for interchangeable email provider clients',
      'Typing parsed configuration so optional and required settings cannot be confused',
    ],
    workedExample: {
      scenario: 'A notification service should work with either a production email provider or a test fake without depending on either concrete class.',
      steps: [
        'Define an EmailSender protocol containing the send operation the service actually requires.',
        'Annotate the service dependency with the protocol and its method with concrete parameter and return types.',
        'Run the type checker against both the provider adapter and test fake to verify structural compatibility.',
      ],
      code: {
        language: 'Python',
        code: `class EmailSender(Protocol):
    def send(self, recipient: str, subject: str, body: str) -> str:
        ...

class WelcomeService:
    def __init__(self, email_sender: EmailSender) -> None:
        self.email_sender = email_sender`,
      },
      result: 'The service depends on one explicit capability, and both real and fake senders can be checked without inheritance from a shared concrete base.',
    },
    interview: {
      prompt: 'What value do type hints provide in Python if the interpreter does not enforce them?',
      answer: 'Static analyzers can detect incompatible calls, missing cases, and invalid attribute access before runtime, while editors provide better navigation and completion. Annotations also document contracts for reviewers and support safer refactors. Runtime validation is still required for untrusted external data because an annotation alone does not transform or reject a value.',
    },
  },
  'Exception boundaries': {
    explanation: [
      'An exception boundary is the layer that decides how a lower-level failure becomes a domain result, protocol response, retry decision, or process exit. Inner code raises meaningful failures, while the boundary translates them once into the vocabulary expected by HTTP clients, queue infrastructure, command-line users, or job schedulers.',
      'Catch only exceptions the boundary can handle, keep try blocks narrow, preserve causes when translating, and order handlers from specific to broad. A final broad handler may log an unexpected failure and return a generic response, but it should not disguise the failure as a normal domain outcome.',
    ],
    whyItMatters: 'Without deliberate boundaries, infrastructure details leak to clients or broad handlers hide programming defects. A consistent boundary produces stable external behavior, useful telemetry, and correct retry semantics without scattering transport concerns through core logic.',
    useCases: [
      'Mapping a domain NotFoundError to an HTTP 404 response',
      'Rejecting an invalid queue message while retrying a transient database outage',
      'Converting configuration errors into a clear command-line exit message and nonzero status',
    ],
    workedExample: {
      scenario: 'An account API must distinguish a missing account from a temporary database outage without exposing SQL details.',
      steps: [
        'Let the service raise AccountNotFound for the expected domain absence and DatabaseUnavailable for a transient infrastructure failure.',
        'At the HTTP handler, map AccountNotFound to 404 and DatabaseUnavailable to 503 with a retry-safe response.',
        'Log unexpected exceptions with correlation context and return a generic 500 while preserving the exception for monitoring.',
      ],
      code: {
        language: 'Python',
        code: `try:
    account = account_service.get(account_id)
except AccountNotFound:
    return json_response({"error": "account not found"}, status=404)
except DatabaseUnavailable as error:
    logger.warning("Account database unavailable", exc_info=error)
    return json_response({"error": "temporarily unavailable"}, status=503)`,
      },
      result: 'Clients receive stable status codes they can act on, while database implementation details remain internal and transient failures stay observable.',
    },
    interview: {
      prompt: 'Why is catching `Exception` deep inside business logic usually a problem?',
      answer: 'A broad catch combines expected domain failures, transient infrastructure failures, and programming defects even though they require different responses. Deep code often lacks enough context to choose the protocol behavior. Catch specific errors where recovery is possible, and reserve broad handling for a top-level boundary that logs context and prevents implementation details from escaping.',
    },
  },
  'Modules and imports': {
    explanation: [
      'A module is a Python file that creates a namespace for related definitions, and a package organizes modules into a larger importable unit. Importing executes a module once per interpreter process and caches it, after which import statements bind selected module objects or names locally.',
      'Organize modules around cohesive responsibilities, prefer explicit imports, and keep import-time work minimal. Put executable entry-point behavior behind a main guard, avoid circular dependencies by improving ownership boundaries, and import from stable public modules rather than reaching through private implementation paths.',
    ],
    whyItMatters: 'Module boundaries shape dependency direction and testability. Import side effects or cycles can make applications fail before startup, while clear namespaces let teams locate ownership and change internals without breaking every caller.',
    useCases: [
      'Separating payment domain rules from a provider-specific HTTP adapter',
      'Providing a package-level public API for shared validation helpers',
      'Keeping a migration script executable without running it when imported by tests',
    ],
    workedExample: {
      scenario: 'Importing a customer service module immediately reads environment variables and opens a provider connection, causing test collection to fail.',
      steps: [
        'Move provider client construction out of module scope into the application composition function.',
        'Keep the customer service module limited to class and function definitions with explicit dependencies.',
        'Construct the real client at startup and inject a fake client in unit tests.',
      ],
      code: {
        language: 'Python',
        code: `def build_application(settings: Settings) -> Application:
    customer_provider = CustomerProviderClient(
        base_url=settings.customer_api_url,
        api_key=settings.customer_api_key,
    )
    customer_service = CustomerService(customer_provider)
    return Application(customer_service)`,
      },
      result: 'Importing the service no longer performs configuration or network work, and application startup owns construction of the concrete dependency.',
    },
    interview: {
      prompt: 'What actually happens the first time Python imports a module, and why can import-time side effects be harmful?',
      answer: 'Python locates the module, creates its module object, executes its top-level code, and caches the result in sys.modules. File reads, connections, registration, or environment checks at top level therefore happen during import and can fail before the application is composed. They also make tests order-dependent and complicate circular imports.',
    },
  },
  'Dependency isolation': {
    explanation: [
      'Dependency isolation gives each project a controlled set of third-party packages and versions instead of relying on whatever is installed globally. A virtual environment separates installed distributions, while a declared dependency file and lock strategy make the environment reproducible on developer machines and in CI.',
      'Create the environment from project metadata, distinguish runtime from development tools, pin or constrain versions according to the deployment strategy, and rebuild rather than manually repairing drift. Secrets and machine-specific configuration belong outside dependency declarations, and transitive packages should be reviewed through the lock or resolved environment.',
    ],
    whyItMatters: 'Two applications may require incompatible versions of the same library, and unrecorded local packages create works-on-my-machine failures. Isolation makes builds repeatable, upgrades reviewable, and vulnerability remediation attributable to a known dependency graph.',
    useCases: [
      'Running two services that require different major versions of an HTTP framework',
      'Reproducing the same tested dependency set in CI and production images',
      'Evaluating a library upgrade in a fresh environment before merging it',
    ],
    workedExample: {
      scenario: 'A new SDK works locally but CI cannot import it because it was installed globally and never declared by the project.',
      steps: [
        'Add the SDK to the project dependency declaration with an intentional compatible version range.',
        'Regenerate the lock or resolved dependency set using the project package manager.',
        'Create a clean environment from the declaration and run the targeted integration tests before updating CI.',
      ],
      code: {
        language: 'Shell',
        code: `python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m pytest tests/integration/test_partner_sdk.py`,
      },
      result: 'The SDK becomes an explicit, reproducible project dependency, and a clean install proves the test does not rely on undeclared global state.',
    },
    interview: {
      prompt: 'What problem does a virtual environment solve, and what problem does it not solve by itself?',
      answer: 'It separates one projects installed Python packages from global and other project packages. By itself it does not record which packages or versions should be installed, guarantee operating-system libraries, or reproduce the interpreter version. Project metadata, a lock or constraints strategy, and the deployment image complete that reproducibility story.',
    },
  },
  Iterators: {
    explanation: [
      'An iterator is an object that returns one value at a time from __next__ and raises StopIteration when exhausted. An iterable can create an iterator through __iter__, which is why for loops, unpacking, and many standard functions can consume lists, files, generators, and custom sequences through one protocol.',
      'Use iteration to decouple consumers from how values are stored or produced. Remember that many iterators are single-pass and stateful, avoid consuming them merely to inspect them, and define deterministic exhaustion and error behavior when implementing a custom iterator.',
    ],
    whyItMatters: 'The iterator protocol lets backend pipelines process files, database cursors, and API pages uniformly without requiring a complete in-memory collection. Understanding consumption prevents subtle bugs where logging, validation, or a first pass silently exhausts the data.',
    useCases: [
      'Passing file lines through a validation pipeline without loading the file',
      'Wrapping paginated provider responses as one iterable sequence of records',
      'Using next with a default to find the first matching configuration',
    ],
    workedExample: {
      scenario: 'A partner client exposes paginated responses, but callers should iterate over records without managing page tokens.',
      steps: [
        'Create an iterator method that starts with no page token and requests one page at a time.',
        'Yield every record from the page before advancing to its next token.',
        'Stop when the provider returns no token and document that each returned iterator is single-use.',
      ],
      code: {
        language: 'Python',
        code: `class PartnerClient:
    def iter_accounts(self) -> Iterator[PartnerAccount]:
        page_token = None
        while True:
            page = self.fetch_accounts(page_token)
            yield from page.accounts
            if page.next_token is None:
                return
            page_token = page.next_token`,
      },
      result: 'Callers can use an ordinary for loop over all partner accounts while the client retains responsibility for pagination and bounded page storage.',
    },
    interview: {
      prompt: 'What is the difference between an iterable and an iterator?',
      answer: 'An iterable can provide an iterator, often a fresh one for each call to iter. An iterator is the stateful object that provides successive values through next and eventually signals exhaustion. A list is iterable and supports repeated passes; a generator object is both iterable and its own iterator, so it is normally consumed once.',
    },
  },
  Decorators: {
    explanation: [
      'A decorator takes a function or class and returns a replacement, allowing behavior to be added at definition time without changing each call site. Function decorators commonly create a wrapper that runs logic before or after the original call and closes over the wrapped function.',
      'Use decorators for cross-cutting behavior that has a consistent contract, such as authorization, tracing, registration, or retries. Preserve metadata with functools.wraps, forward arguments and return values faithfully, and avoid hiding domain control flow or applying unsafe generic retries to non-idempotent operations.',
    ],
    whyItMatters: 'A focused decorator centralizes repeated policy and keeps handlers readable, but an opaque one can conceal execution, failures, and ordering. Understanding the wrapper model lets engineers reuse behavior while keeping debugging and type contracts intact.',
    useCases: [
      'Checking a required permission before an administrative endpoint runs',
      'Recording duration and outcome metrics around provider adapter calls',
      'Registering message handlers under event names at import time',
    ],
    workedExample: {
      scenario: 'Several administrative handlers repeat the same permission check and return inconsistent errors when access is missing.',
      steps: [
        'Create a decorator factory that accepts the required permission and returns a wrapper.',
        'Read the authenticated user from the wrapped handlers arguments and raise one standard forbidden error when permission is absent.',
        'Apply functools.wraps and return the original handlers result unchanged after successful authorization.',
      ],
      code: {
        language: 'Python',
        code: `def requires_permission(permission: str):
    def decorate(handler):
        @wraps(handler)
        def wrapped(user, *args, **kwargs):
            if permission not in user.permissions:
                raise ForbiddenError(permission)
            return handler(user, *args, **kwargs)
        return wrapped
    return decorate

@requires_permission("billing:refund")
def refund_payment(user, payment_id: str) -> Refund:
    return refunds.create(payment_id)`,
      },
      result: 'Administrative handlers share one authorization policy and error shape, while their names, documentation, and return behavior remain available through the wrapper.',
    },
    interview: {
      prompt: 'What can go wrong when writing a decorator for production code?',
      answer: 'The wrapper can lose metadata, alter the call signature or return value, swallow exceptions, hide expensive work, or apply policy in an unexpected order relative to other decorators. I would use wraps, preserve the contract, keep the behavior narrow, test success and failure paths, and document ordering when decorators interact.',
    },
  },
  'Async I/O': {
    explanation: [
      'Async I/O lets one thread make progress on other tasks while a coroutine waits for network, timer, or other non-blocking I/O. An async function returns a coroutine, await suspends it until the awaited operation is ready, and the event loop schedules other runnable tasks during that wait.',
      'Use async for high-concurrency I/O workloads, not as an automatic speedup for CPU-heavy work. Call async-compatible libraries, bound concurrency with semaphores or worker pools, propagate cancellation, set timeouts, and gather independent work only when ordering and failure behavior are explicitly understood.',
    ],
    whyItMatters: 'Integration services often spend most of their time waiting on remote systems. Structured async concurrency can improve throughput without one thread per request, but unbounded tasks or blocking calls can exhaust dependencies and stall the entire event loop.',
    useCases: [
      'Fetching independent account balances from several provider APIs concurrently',
      'Serving many websocket connections whose work is mostly waiting for messages',
      'Running a bounded set of HTTP enrichment requests for imported customer records',
    ],
    workedExample: {
      scenario: 'A dashboard loads balances for 200 connected accounts, and sequential HTTP requests exceed the response deadline while unlimited concurrency triggers provider rate limits.',
      steps: [
        'Create one coroutine per account that acquires a semaphore before calling the async provider client.',
        'Apply a per-request timeout and let cancellation propagate instead of catching it as a normal provider error.',
        'Gather the bounded operations and associate each result or expected provider failure with its account ID.',
      ],
      code: {
        language: 'Python',
        code: `async def load_balance(account: Account, limit: asyncio.Semaphore):
    async with limit:
        async with asyncio.timeout(2.0):
            return await provider.fetch_balance(account.external_id)

limit = asyncio.Semaphore(10)
balances = await asyncio.gather(
    *(load_balance(account, limit) for account in accounts)
)`,
      },
      result: 'Up to ten balance requests wait concurrently, reducing total latency while respecting the provider limit and enforcing a clear timeout for stalled calls.',
    },
    interview: {
      prompt: 'When does async improve a Python service, and what mistakes can remove the benefit?',
      answer: 'Async helps when many tasks spend substantial time waiting on compatible non-blocking I/O. Blocking HTTP clients, file operations, or CPU-heavy work inside the event loop prevent other coroutines from progressing. Unbounded task creation can also overload memory and dependencies, so concurrency, timeouts, cancellation, and failure aggregation must be designed explicitly.',
    },
  },
  Threading: {
    explanation: [
      'Threads run concurrent call stacks inside one process and share its memory. In conventional CPython they are strongest when work spends time waiting on blocking I/O, because the interpreter can run another thread while one waits; the global interpreter lock usually prevents pure-Python CPU loops from scaling across cores.',
      'Treat shared memory as an explicit coordination problem. Prefer queues, events, and narrow critical sections over scattered mutable state, protect invariants rather than individual lines, and give every worker a shutdown and error-reporting path. Non-daemon workers should be joined so the application knows whether work completed.',
    ],
    whyItMatters: 'Many mature Python clients and operating-system APIs are synchronous. A bounded thread pool can integrate that work without serial waits, but races, deadlocks, hidden worker failures, and abrupt daemon shutdown can make a superficially fast service unreliable.',
    useCases: [
      'Calling a bounded number of synchronous vendor APIs concurrently',
      'Reading several independent files with a blocking parser',
      'Moving blocking legacy-client calls off an asyncio event-loop thread',
    ],
    workedExample: {
      scenario: 'A health audit must call 40 vendor endpoints through a synchronous HTTP client, record every failure, and avoid creating an unbounded thread per endpoint.',
      steps: [
        'Put the blocking request in a function with an explicit timeout and a small serializable result.',
        'Use a ThreadPoolExecutor to bound the number of active calls and map each future back to its URL.',
        'Consume futures as they complete and call result so worker exceptions become visible to the coordinating thread.',
      ],
      code: {
        language: 'Python',
        code: `from concurrent.futures import ThreadPoolExecutor, as_completed

def check_endpoint(url: str) -> int:
    response = requests.get(url, timeout=3)
    response.raise_for_status()
    return response.status_code

statuses: dict[str, int] = {}
failures: dict[str, str] = {}

with ThreadPoolExecutor(max_workers=8) as pool:
    pending = {pool.submit(check_endpoint, url): url for url in urls}
    for future in as_completed(pending):
        url = pending[future]
        try:
            statuses[url] = future.result()
        except requests.RequestException as error:
            failures[url] = str(error)`,
      },
      result: 'At most eight blocking calls run at once, each endpoint is associated with its outcome, and leaving the executor context waits for managed workers instead of abandoning them during shutdown.',
    },
    interview: {
      prompt: 'How do you decide whether threads are appropriate, and how do you keep them safe?',
      answer: 'I use threads when independent tasks mostly wait on blocking I/O or a native library releases the GIL. I bound the pool, avoid sharing mutable state where message passing works, lock complete invariants when sharing is necessary, and make cancellation, timeouts, joining, and exception observation explicit. For sustained pure-Python CPU work, I evaluate processes instead.',
    },
  },
  Multiprocessing: {
    explanation: [
      'Multiprocessing runs work in separate interpreter processes with isolated memory, allowing CPU-bound Python code to use multiple cores in conventional CPython. Isolation removes ordinary shared-memory races but introduces process startup, serialization, inter-process communication, and result-collection costs.',
      'Design process work as coarse, independent units with importable top-level callables and serializable inputs and outputs. Protect the application entry point for spawn-based startup, observe every worker result, and prefer cooperative pool shutdown over terminating workers that may be using queues or locks.',
    ],
    whyItMatters: 'Parallel processes can turn a long CPU-bound batch into tractable work, but they are not a free replacement for threads. Small tasks can lose to overhead, live connections cannot be safely passed as ordinary data, and platform start methods make implicit inherited state fragile.',
    useCases: [
      'Parsing and validating large independent document batches',
      'Running CPU-heavy feature extraction across image or event chunks',
      'Executing isolated simulation units whose inputs and outputs are plain data',
    ],
    workedExample: {
      scenario: 'A nightly job must count prime candidates across several large integer batches, and a single pure-Python process misses its completion window.',
      steps: [
        'Keep the CPU-bound worker at module scope and make each batch large enough to amortize process overhead.',
        'Create a ProcessPoolExecutor only from the guarded application entry point so spawn-based workers can import the module safely.',
        'Collect the mapped results so worker exceptions propagate, then combine the independent counts in the parent process.',
      ],
      code: {
        language: 'Python',
        code: `from concurrent.futures import ProcessPoolExecutor
from math import isqrt

def count_primes(numbers: list[int]) -> int:
    def is_prime(value: int) -> bool:
        return value >= 2 and all(
            value % divisor for divisor in range(2, isqrt(value) + 1)
        )

    return sum(is_prime(value) for value in numbers)

def main() -> int:
    with ProcessPoolExecutor() as pool:
        batch_counts = pool.map(count_primes, number_batches)
        return sum(batch_counts)

if __name__ == "__main__":
    total = main()`,
      },
      result: 'Independent batches can execute on multiple CPU cores, failures surface while results are consumed, and the guarded entry point works with startup methods that import the main module.',
    },
    interview: {
      prompt: 'What costs and correctness boundaries do you consider before choosing multiprocessing?',
      answer: 'I confirm the work is CPU-bound, independent, and large enough to repay startup and serialization costs. Worker functions and arguments must work with the selected start method, live resources stay process-local, and results or exceptions cross an explicit IPC boundary. I also plan graceful pool shutdown because forceful termination can leave queues and locks damaged.',
    },
  },
} satisfies Record<string, SoftwareLessonDetails>