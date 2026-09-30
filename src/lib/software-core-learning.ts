import { softwareDeliveryLessonDetails } from './software-core-content-delivery'
import { softwareBackendLessonDetails } from './software-core-content-backend'
import { softwareDesignLessonDetails } from './software-core-content-design'
import { softwareFoundationsLessonDetails } from './software-core-content-foundations'
import { softwareOperationsLessonDetails } from './software-core-content-operations'
import { dsaMasteryTopics } from './software-core-mastery-dsa'
import { programmingFundamentalsMasteryTopics } from './software-core-mastery-fundamentals'
import { pythonEngineeringMasteryTopics } from './software-core-mastery-python'
import type { SoftwareLessonDetails } from './software-core-lesson-types'
import {
  defineLearningPath,
  type LearningChapterSeed,
} from './learning-model'

const softwareLessonDetails: Readonly<Record<string, SoftwareLessonDetails>> = {
  ...softwareFoundationsLessonDetails,
  ...softwareDesignLessonDetails,
  ...softwareBackendLessonDetails,
  ...softwareDeliveryLessonDetails,
  ...softwareOperationsLessonDetails,
}

function addSoftwareLessonDetails(
  chapters: readonly LearningChapterSeed[],
): readonly LearningChapterSeed[] {
  return chapters.map((chapter) => ({
    ...chapter,
    examples: chapter.examples.map((example) => {
      if ('title' in example) {
        return example
      }

      const [title, principle] = example
      const details = softwareLessonDetails[title]

      return details ? { title, principle, ...details } : example
    }),
  }))
}

export const softwareCoreLearningPath = defineLearningPath({
  id: 'software-engineering-core',
  title: 'Software Engineering Core',
  shortTitle: 'Software Core',
  description: 'Build the coding, data, testing, and engineering judgment needed before a platform technical screen.',
  accent: '#3157d5',
  audience: 'The shared foundation for FDE, AI Engineer, and AI FDE candidates.',
  recommendedFor: ['forward-deployed-engineer', 'ai-engineer', 'ai-forward-deployed-engineer'],
  platforms: ['Turing', 'Andela', 'Toptal'],
  chapters: addSoftwareLessonDetails([
    {
      id: 'programming-fundamentals',
      title: 'Programming Fundamentals',
      summary: 'Reason clearly about values, control flow, functions, state, errors, and cost before reaching for frameworks.',
      outcomes: ['Trace a program by hand', 'Choose clear control flow', 'Explain runtime and memory costs'],
      platformFocus: 'Commonly appears as screening questions, code reading, or the opening discussion in a live exercise.',
      masteryTopics: programmingFundamentalsMasteryTopics,
      examples: [
        {
          title: 'Values and types',
          principle: 'A value is a piece of data; its type defines what that data means, how it is stored, and which operations are valid.',
          explanation: [
            'Programs receive values such as text, numbers, booleans, dates, and objects. Two values can look similar to a person while behaving very differently in code: the text "100" can be joined with other text, while the number 100 can be added or multiplied.',
            'Types let the language and the programmer distinguish those meanings. Some languages check types before the program runs, while JavaScript also performs runtime coercion. You still need to validate external input because TypeScript types disappear at runtime and cannot make an API payload trustworthy.',
          ],
          whyItMatters: 'Type mistakes often survive happy-path testing and become billing, sorting, or validation bugs. Converting data once at the system boundary gives the rest of the program a reliable value to work with.',
          useCases: [
            'Converting form and URL values, which arrive as text',
            'Validating JSON returned by an external API',
            'Keeping money, dates, identifiers, and booleans from being mixed accidentally',
          ],
          workedExample: {
            scenario: 'An invoice form sends amount as text. Convert it to a number, reject bad input, and calculate 18% tax without relying on JavaScript coercion.',
            steps: [
              'Trim the text so whitespace-only input cannot masquerade as a value.',
              'Reject an empty string before conversion because Number("") produces 0.',
              'Convert with Number and verify the result is finite and non-negative.',
              'Perform arithmetic only after validation, then round at the money boundary.',
            ],
            code: {
              language: 'TypeScript',
              code: `function calculateTax(amountText: string, taxRate = 0.18) {
  const normalized = amountText.trim()
  if (normalized === '') throw new Error('Amount is required')

  const amount = Number(normalized)
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error('Amount must be a non-negative number')
  }

  return Math.round(amount * taxRate * 100) / 100
}

calculateTax('125.50') // 22.59
calculateTax('abc')    // throws a validation error`,
            },
            result: 'After the boundary check, amount is a trustworthy number. The calculation cannot silently concatenate strings or accept NaN as an invoice amount.',
          },
          interview: {
            prompt: 'Why is Number(amountText) alone not enough validation, and why does a TypeScript string annotation not solve the runtime problem?',
            answer: 'Number accepts surprising values such as an empty string as 0 and produces NaN for invalid text. TypeScript checks developer-written code, but external values still arrive at runtime. Validate the raw value, convert it, check the converted result, and only then pass the trusted number into business logic.',
          },
        },
        ['Variables and naming', 'Names should expose intent and units instead of implementation trivia.', 'Rename d to retryDelaySeconds so a reviewer cannot confuse seconds with milliseconds.'],
        ['Boolean control flow', 'Prefer conditions that state the business rule directly.', 'Allow checkout only when the cart is nonempty and payment authorization succeeded.'],
        ['Loops and invariants', 'A loop invariant states what remains true after every iteration.', 'Scan transactions while maintaining that runningTotal equals the sum of all processed amounts.'],
        ['Functions and contracts', 'A function should have explicit inputs, output, and failure behavior.', 'Define parseUserId to return a validated identifier or a typed validation error.'],
        ['Scope and lifetime', 'Keep mutable state in the narrowest scope that needs it.', 'Create the request accumulator inside the handler so concurrent requests cannot share it.'],
        ['Errors and recovery', 'Distinguish expected domain failures from unexpected defects.', 'Return a validation result for an expired coupon but report a database disconnect as an operational error.'],
        ['Collections', 'Choose a collection by access pattern, ordering, and uniqueness needs.', 'Use a set to remove duplicate email addresses before sending invitations.'],
        ['Mutation and identity', 'Aliasing mutable objects can make changes appear in distant code.', 'Copy a configuration object before applying request-specific overrides.'],
        ['Input and output boundaries', 'Validate untrusted data once at the boundary and use trusted shapes internally.', 'Convert a CSV row into a validated Customer record before business logic runs.'],
        ['Complexity mindset', 'Estimate how work grows with input size before optimizing constants.', 'Recognize that checking every order against every customer is quadratic and index customers by ID.'],
      ],
    },
    {
      id: 'python-engineering',
      title: 'Python Engineering',
      summary: 'Use Python idioms deliberately while keeping production behavior typed, testable, and resource-aware.',
      outcomes: ['Write idiomatic Python', 'Control resources and failures', 'Use typing and async appropriately'],
      platformFocus: 'Python-focused assessments often combine language behavior, practical data manipulation, and readable implementation.',
      masteryTopics: pythonEngineeringMasteryTopics,
      examples: [
        ['Comprehensions', 'Use comprehensions for simple transformations, not hidden multi-step logic.', 'Build active_user_ids from users with one readable filtered list comprehension.'],
        ['Generators', 'Generators stream values and avoid materializing an entire input.', 'Process a ten-million-line event file one record at a time with a generator.'],
        ['Context managers', 'Context managers guarantee cleanup around a bounded operation.', 'Open a report with with so the file closes even when parsing raises an exception.'],
        ['Dataclasses', 'Dataclasses make data records explicit without repetitive boilerplate.', 'Represent a DeploymentResult with status, version, and completed_at fields.'],
        ['Type hints', 'Types document contracts and let tooling catch impossible calls.', 'Annotate load_orders as returning list[Order] rather than an unstructured list.'],
        ['Exception boundaries', 'Catch only exceptions that a layer can handle meaningfully.', 'Translate a database uniqueness exception into an EmailAlreadyRegistered domain error.'],
        ['Modules and imports', 'Modules should expose a small public surface and avoid import-time side effects.', 'Move email delivery behind send_receipt instead of opening a network connection during import.'],
        ['Dependency isolation', 'Lock dependencies and isolate environments to make builds reproducible.', 'Pin the tested major version of a database driver in the project environment.'],
        ['Iterators', 'The iterator protocol separates traversal from storage.', 'Implement an iterator that pages through an API without exposing pagination to callers.'],
        ['Decorators', 'Decorators wrap cross-cutting behavior while preserving the function contract.', 'Add timing telemetry around handlers without mixing metrics code into business logic.'],
        ['Async I/O', 'Async improves throughput for waiting-heavy work, not CPU-heavy computation.', 'Fetch independent customer endpoints concurrently while limiting concurrency with a semaphore.'],
        ['Threading', 'Threads overlap blocking I/O but require deliberate shared-state coordination.', 'Audit synchronous vendor endpoints with a bounded thread pool and observe every worker result.'],
        ['Multiprocessing', 'Processes parallelize coarse CPU-bound work across isolated interpreters.', 'Distribute independent numeric batches across a process pool with a safe application entry point.'],
      ],
    },
    {
      id: 'dsa',
      title: 'DSA',
      summary: 'Master the small set of data structures and patterns that dominate practical coding screens.',
      outcomes: ['Select structures by operation cost', 'Recognize reusable patterns', 'State complexity precisely'],
      platformFocus: 'Expect basic-to-medium problem solving; FDE screens usually value practical clarity over competitive-programming tricks.',
      masteryTopics: dsaMasteryTopics,
      examples: [
        ['Arrays and lists', 'Contiguous indexed collections give fast lookup but costly middle insertion.', 'Store hourly metrics in an array when reads by position dominate.'],
        ['Hash maps', 'Hash maps trade memory for average constant-time lookup.', 'Group anagrams by mapping each normalized character signature to its words.'],
        ['Sets', 'Sets make membership and uniqueness explicit.', 'Detect a duplicate transaction ID during a single pass through an import.'],
        ['Stacks', 'A stack models last-in-first-out work and nested structure.', 'Validate matching brackets by pushing open delimiters and popping on close.'],
        ['Queues', 'A queue models first-in-first-out processing.', 'Use a queue for breadth-first traversal of service dependencies.'],
        ['Linked lists', 'Linked structures offer constant-time local insertion but no random access.', 'Maintain an LRU cache order with a doubly linked list plus a hash map.'],
        ['Trees', 'Trees model hierarchy and support recursive divide-and-conquer traversal.', 'Walk an organization tree to calculate total reports under each manager.'],
        ['Graphs', 'Graphs represent arbitrary relationships and require cycle-aware traversal.', 'Find whether service A transitively depends on service B with depth-first search.'],
        ['Heaps', 'A heap keeps the smallest or largest item accessible efficiently.', 'Track the ten highest API latencies from a stream using a size-ten min-heap.'],
        ['Binary search', 'Binary search applies to a monotonic decision space, not only arrays.', 'Find the first deployment version where a regression appears.'],
        ['Two pointers', 'Two pointers reduce repeated scanning when order provides structure.', 'Find two sorted invoice amounts that sum to a target in linear time.'],
      ],
    },
    {
      id: 'oop-clean-code',
      title: 'OOP & Clean Code',
      summary: 'Design small, coherent units whose names and dependencies communicate the system clearly.',
      outcomes: ['Model responsibilities cleanly', 'Prefer composition deliberately', 'Refactor without changing behavior'],
      platformFocus: 'Frequently evaluated through code review, project discussion, and maintainability questions.',
      examples: [
        ['Encapsulation', 'Keep invariants with the state they protect.', 'Let BankAccount.withdraw reject an overdraft instead of exposing balance for arbitrary mutation.'],
        ['Abstraction', 'Expose what callers need while hiding replaceable details.', 'Give callers a FileStore interface without revealing S3 request construction.'],
        ['Inheritance', 'Use inheritance only for a true substitutable is-a relationship.', 'Treat CsvExporter and JsonExporter as Exporter implementations with the same contract.'],
        ['Composition', 'Compose focused collaborators when behavior varies independently.', 'Inject a RetryPolicy into ApiClient instead of subclassing one client per retry strategy.'],
        ['Polymorphism', 'A stable interface lets multiple implementations serve the same caller.', 'Run local and cloud payment gateways through a common charge method.'],
        ['Single responsibility', 'A unit should have one coherent reason to change.', 'Separate invoice calculation from PDF rendering and email delivery.'],
        ['Open-closed design', 'Add variants through stable extension points rather than repeated conditionals.', 'Register new notification channels behind a Sender interface.'],
        ['Liskov substitution', 'A subtype must preserve the promises of its base contract.', 'Do not make ReadOnlyFile inherit a writable File API whose save method always fails.'],
        ['Dependency inversion', 'High-level policy should depend on abstractions, not infrastructure details.', 'Make Checkout depend on PaymentGateway rather than a concrete Stripe SDK.'],
        ['Naming and shape', 'Names, function size, and control flow should reduce cognitive load.', 'Replace processData with calculateMonthlyRevenue and split parsing from aggregation.'],
        ['Safe refactoring', 'Protect behavior with tests before changing structure.', 'Add characterization tests, extract pricing rules, then compare old and new outputs.'],
      ],
    },
    {
      id: 'apis-backend',
      title: 'APIs & Backend',
      summary: 'Build explicit service boundaries that remain correct under retries, invalid input, and partial failure.',
      outcomes: ['Design HTTP contracts', 'Protect integration boundaries', 'Handle retries and scale safely'],
      platformFocus: 'Practical API and integration scenarios are especially relevant to FDE and client-facing engineering screens.',
      examples: [
        ['HTTP methods', 'Choose methods by semantics and idempotency, not by payload size.', 'Use PATCH for a partial profile update and GET only for side-effect-free retrieval.'],
        ['Status codes', 'Status codes should let clients distinguish retryable, client, and server failures.', 'Return 409 for a version conflict and 503 when a dependency is temporarily unavailable.'],
        ['Resource modeling', 'Model stable domain resources rather than mirroring UI button names.', 'Expose /orders/{id}/cancellation instead of /clickCancelButton.'],
        ['Request validation', 'Reject malformed input before domain or persistence work starts.', 'Validate currency, amount, and customer ID at the order endpoint boundary.'],
        ['Authentication and authorization', 'Authentication identifies the caller; authorization decides permitted actions.', 'Verify the token, then check that the user may read the requested tenant.'],
        ['Pagination', 'Cursor pagination stays stable when rows are inserted between requests.', 'Page an event stream using created_at plus ID rather than an offset.'],
        ['Idempotency', 'An idempotency key lets repeated requests produce one logical effect.', 'Store the result of a payment request keyed by the client operation ID.'],
        ['Webhooks', 'Persist outbound events before delivery and sign each request.', 'Retry a customer webhook from an outbox while preserving its event ID.'],
        ['Retries and backoff', 'Retry transient failures with limits, jitter, and an idempotent operation.', 'Back off after 503 responses but do not retry an invalid 400 payload.'],
        ['Rate limiting', 'Rate limits protect capacity and should identify the constrained principal.', 'Apply a token bucket per API key with a documented 429 response.'],
        ['Caching', 'Cache only when staleness and invalidation behavior are explicit.', 'Cache a product catalog for five minutes and invalidate on a published update event.'],
      ],
    },
    {
      id: 'sql-databases',
      title: 'SQL & Databases',
      summary: 'Model durable data, write explainable queries, and preserve correctness under concurrent changes.',
      outcomes: ['Design relational schemas', 'Query and index intentionally', 'Use transactions and migrations safely'],
      platformFocus: 'SQL transformations and database tradeoffs often appear in data-heavy and AI engineering assessments.',
      examples: [
        ['Relational modeling', 'Normalize facts that change independently and join them through stable keys.', 'Store customers and orders separately instead of repeating customer details on every order.'],
        ['Primary and foreign keys', 'Keys establish identity and enforce valid relationships.', 'Reference orders.customer_id to customers.id with an explicit deletion policy.'],
        ['Joins', 'Select a join by whether unmatched rows must survive.', 'Use a left join to list every customer, including those with no orders.'],
        ['Grouping', 'Aggregate only after defining the grouping grain.', 'Calculate revenue per customer per month, not over accidentally duplicated joined rows.'],
        ['Window functions', 'Window functions compute across related rows without collapsing them.', 'Rank each customer’s orders by date to return the latest two.'],
        ['Indexes', 'Indexes accelerate selected access paths while adding write and storage cost.', 'Create a composite index on tenant_id and created_at for a tenant event feed.'],
        ['Transactions', 'A transaction keeps related writes atomic under failure and concurrency.', 'Create an order and reserve inventory in one transaction or commit neither.'],
        ['Constraints', 'Database constraints defend invariants regardless of the calling application.', 'Use a unique constraint to prevent two accounts with the same normalized email.'],
        ['Query plans', 'Inspect the actual plan before guessing why a query is slow.', 'Confirm whether a large orders query scans the table or uses the intended index.'],
        ['Migrations', 'Expand and contract schemas so old and new application versions can overlap.', 'Add a nullable column, backfill it, switch readers, then enforce NOT NULL.'],
        ['N+1 queries', 'Batch related reads instead of issuing one query per parent row.', 'Load all order items for a page of orders with one keyed query.'],
      ],
    },
    {
      id: 'git-software-development',
      title: 'Git & Software Development',
      summary: 'Use version control as a communication, review, recovery, and delivery tool.',
      outcomes: ['Create reviewable history', 'Recover safely from mistakes', 'Collaborate through disciplined review'],
      platformFocus: 'Take-home projects are judged on repository hygiene, commits, documentation, and delivery discipline.',
      examples: [
        ['Atomic commits', 'Each commit should represent one coherent, working change.', 'Commit the schema migration separately from the UI that consumes the new field.'],
        ['Branching', 'Use short-lived branches to limit divergence and integration risk.', 'Merge a small payment validation branch after review instead of accumulating a month of work.'],
        ['Merge and rebase', 'Merge preserves branch history; rebase rewrites local commits onto a new base.', 'Rebase an unshared feature branch before review but merge a shared release branch.'],
        ['Conflict resolution', 'Resolve conflicts by understanding intended behavior, not selecting a side mechanically.', 'Combine two validation changes and rerun tests after editing the conflicted function.'],
        ['Pull requests', 'A pull request should make purpose, risk, and verification easy to inspect.', 'Describe the bug, solution, screenshots, migration impact, and exact tests run.'],
        ['Code review', 'Review correctness, design, security, and operability rather than formatting alone.', 'Flag a retry loop with no bound even though the code style is clean.'],
        ['Git bisect', 'Binary search through history can isolate the first bad commit.', 'Use bisect with a failing test to locate when login latency regressed.'],
        ['Revert', 'Revert creates a safe inverse commit without rewriting shared history.', 'Revert a faulty production feature while preserving the audit trail.'],
        ['Secrets and ignore rules', 'Never commit credentials; ignore generated and local-only artifacts.', 'Keep .env.local out of Git and rotate a token immediately if it was committed.'],
        ['Continuous integration', 'CI should reproduce the checks required before a change can merge.', 'Run formatting, types, tests, and a production build for every pull request.'],
        ['Semantic history', 'Commit messages should explain intent and make later diagnosis easier.', 'Write “Prevent duplicate webhook delivery on retry” instead of “fix stuff”.'],
      ],
    },
    {
      id: 'testing',
      title: 'Testing',
      summary: 'Build a layered test strategy that catches meaningful failures without making delivery brittle.',
      outcomes: ['Choose the right test boundary', 'Design reliable cases', 'Use doubles without hiding integration risk'],
      platformFocus: 'Testing judgment appears in live exercises, code review, take-homes, and discussions of production quality.',
      examples: [
        ['Unit tests', 'Unit tests isolate a small behavior and run quickly.', 'Test discount calculation with fixed inputs without starting a database.'],
        ['Integration tests', 'Integration tests verify contracts across real collaborating components.', 'Run a repository test against PostgreSQL to verify transaction behavior.'],
        ['End-to-end tests', 'End-to-end tests protect a few critical user journeys through the deployed stack.', 'Create an account, place an order, and verify the confirmation from the browser.'],
        ['Test pyramid', 'Use many fast focused tests and fewer expensive broad tests.', 'Cover price rules with units and reserve one checkout journey for end-to-end coverage.'],
        ['Boundary cases', 'Failures cluster around empty, maximum, duplicate, and malformed inputs.', 'Test an empty CSV, one row, duplicate IDs, and a row larger than the accepted limit.'],
        ['Mocks and fakes', 'A test double should simplify an external boundary without asserting implementation trivia.', 'Fake the payment gateway response instead of mocking every internal helper call.'],
        ['Fixtures', 'Fixtures should be minimal, explicit, and relevant to the behavior under test.', 'Build one active customer with only the fields needed by the cancellation test.'],
        ['Parameterized tests', 'One table can express the same rule across many inputs.', 'Check several tax regions and expected rates through a parameterized case list.'],
        ['Property-based tests', 'Properties validate invariants across generated input spaces.', 'Verify that encoding then decoding any valid identifier returns the original value.'],
        ['Flaky tests', 'Remove nondeterminism by controlling time, concurrency, randomness, and external state.', 'Inject a clock instead of waiting for a token to expire in real time.'],
        ['Coverage judgment', 'Coverage is a map of execution, not proof of useful assertions.', 'Add a failure-path assertion instead of chasing line coverage through empty tests.'],
      ],
    },
    {
      id: 'debugging',
      title: 'Debugging',
      summary: 'Turn vague symptoms into reproducible evidence, isolate the cause, and prevent recurrence.',
      outcomes: ['Form falsifiable hypotheses', 'Use runtime evidence', 'Close incidents with prevention'],
      platformFocus: 'Interviewers value a disciplined debugging narrative as much as finding the final line of code.',
      examples: [
        ['Reproduce first', 'A reliable reproduction turns an anecdote into a testable failure.', 'Capture the exact payload and environment that trigger a checkout crash.'],
        ['Minimize the case', 'Remove variables until the smallest failing input remains.', 'Reduce a thousand-row import to the two rows that expose the duplicate-key bug.'],
        ['Structured logging', 'Logs should carry stable context without leaking sensitive data.', 'Attach request_id, tenant_id, and operation to every retry log.'],
        ['Debugger inspection', 'Pause where state diverges and inspect assumptions directly.', 'Set a conditional breakpoint when inventory becomes negative.'],
        ['Stack traces', 'Read from the failure outward while distinguishing cause from wrappers.', 'Trace a timeout through the repository call to the upstream client that exhausted its pool.'],
        ['Change isolation', 'Search changes by halves when the regression window is known.', 'Bisect releases to find the first version with a memory increase.'],
        ['Race conditions', 'Concurrent bugs require reasoning about interleavings and shared state.', 'Reproduce two workers claiming the same job before adding an atomic lease.'],
        ['Performance diagnosis', 'Measure CPU, memory, I/O, and query behavior before optimizing.', 'Use a trace to discover that serialization, not the database, dominates latency.'],
        ['Production incidents', 'Stabilize impact before pursuing a complete explanation.', 'Disable a failing integration, confirm recovery, then investigate its malformed responses.'],
        ['Root-cause analysis', 'A root cause explains both the defect and why defenses missed it.', 'Document the unsafe default plus the missing boundary test that allowed it to ship.'],
        ['Prevention', 'A fix is complete when the failure becomes harder to repeat.', 'Add a constraint, regression test, alert, and runbook after resolving duplicate payments.'],
      ],
    },
    {
      id: 'engineering-fundamentals',
      title: 'Engineering Fundamentals',
      summary: 'Connect code-level choices to requirements, operations, security, delivery, and business outcomes.',
      outcomes: ['Translate requirements into constraints', 'Make explicit tradeoffs', 'Own software beyond implementation'],
      platformFocus: 'Project deep-dives and technical interviews use these signals to distinguish production engineers from puzzle solvers.',
      examples: [
        ['Requirement clarification', 'Resolve ambiguous terms into observable behavior before implementation.', 'Ask whether “real time” means under one second or within five minutes.'],
        ['Tradeoff analysis', 'A decision should compare options against named constraints.', 'Choose a managed queue for delivery speed while accepting service cost and vendor dependency.'],
        ['Scalability basics', 'Scale the measured bottleneck while preserving correctness.', 'Partition event processing by tenant only after one worker reaches its throughput limit.'],
        ['Reliability', 'Design expected failures with timeouts, redundancy, and graceful degradation.', 'Serve cached recommendations when the ranking service is temporarily unavailable.'],
        ['Security by default', 'Reduce trust, privilege, exposed data, and attack surface.', 'Give a reporting job read-only access to one schema instead of database-admin rights.'],
        ['Observability', 'Expose enough signals to answer what failed, where, and for whom.', 'Trace a request across API, queue, and worker with one correlation ID.'],
        ['Performance budgets', 'Set measurable latency and resource targets tied to user needs.', 'Budget 200 ms for search so the full interaction remains below one second.'],
        ['Documentation', 'Document decisions, contracts, setup, and operational recovery near their owners.', 'Record why the team selected eventual consistency and how callers observe pending state.'],
        ['Reviewability', 'Small changes with explicit evidence are easier to verify and reverse.', 'Ship a schema expansion separately with tests and rollback notes.'],
        ['Estimation', 'Estimate ranges from scope, uncertainty, dependencies, and validation effort.', 'Give a two-to-four-week range and name the unknown vendor API as the largest risk.'],
        ['Ownership', 'Engineering ownership includes adoption, operation, and learning after release.', 'Monitor the rollout, collect support signals, and adjust the workflow after users struggle.'],
      ],
    },
  ]),
})