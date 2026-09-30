import type { SoftwareLessonDetails } from './software-core-lesson-types'

export const softwareDeliveryLessonDetails = {
  'Atomic commits': {
    explanation: [
      'An atomic commit records one coherent change that can be understood, tested, and reversed on its own. It does not need to modify only one file, but every changed line should serve the same purpose, such as adding one validation rule or renaming one public operation.',
      'Build an atomic commit by separating unrelated work, staging only the relevant hunks, and checking the staged diff before committing. The repository should remain usable after the commit, so include the tests, migrations, or documentation needed for that particular change instead of leaving a knowingly broken midpoint.',
    ],
    whyItMatters: 'Small coherent commits make review, debugging, cherry-picking, and rollback safer because each history entry has one explainable effect. They also let future maintainers identify why a line changed without untangling several unrelated decisions.',
    useCases: [
      'Separating a bug fix from an unrelated formatting cleanup found in the same file',
      'Committing a database migration together with the model change that requires it',
      'Preparing a focused change that may need to be cherry-picked into a release branch',
    ],
    workedExample: {
      scenario: 'While fixing duplicate invoice creation, a developer also renames a reporting helper. The two changes need separate commits so the urgent fix can be released alone.',
      steps: [
        'Run the invoice regression test and stage only the duplicate-prevention code and its test with git add -p.',
        'Inspect the staged patch with git diff --cached, then commit it with a message that states the behavior being fixed.',
        'Stage the helper rename separately, run the affected reporting tests, and create a second commit.',
      ],
      code: {
        language: 'Shell',
        code: `git add -p src/invoices src/invoices.test.ts
git diff --cached
git commit -m "Prevent duplicate invoice creation"

git add src/reporting
git commit -m "Rename monthly report helper"`,
      },
      result: 'The first commit can be reviewed, released, or reverted without carrying the reporting rename, while the second commit preserves the cleanup as an independent decision.',
    },
    interview: {
      prompt: 'A feature requires changes to an API handler, a database constraint, and a test. Is that automatically too large for an atomic commit?',
      answer: 'No. Atomic describes one coherent purpose, not one file. If the handler, constraint, and test are all required to enforce the same rule and the repository works at that commit, they belong together. Unrelated cleanup or a separate behavior change should be moved to another commit.',
    },
  },
  Branching: {
    explanation: [
      'A branch is a movable name for a line of commits. It lets a developer work on a change without moving the shared main branch, while still keeping the full history connected to the commit from which the work began.',
      'Branches work best when they are focused and short lived. Start from an up-to-date base, push the branch so work is backed up and visible, integrate changes from the base when necessary, and delete the branch after merge so stale branches do not look active.',
    ],
    whyItMatters: 'A clear branching habit limits how far work can diverge and makes integration problems smaller. It also gives teams a stable main branch while allowing multiple changes to be developed and reviewed concurrently.',
    useCases: [
      'Developing a payment validation change without exposing unfinished code on main',
      'Preparing a narrow production fix while a larger feature remains in progress',
      'Using a temporary experiment branch to compare an implementation before deciding whether to keep it',
    ],
    workedExample: {
      scenario: 'A developer needs to add account locking while other changes continue to land on main.',
      steps: [
        'Update the local main branch from the remote before creating the feature branch.',
        'Create a descriptively named branch, commit the account-locking work in reviewable pieces, and push it to the remote.',
        'Bring the latest main changes into the branch before final verification, then open the branch for review and delete it after merge.',
      ],
      code: {
        language: 'Shell',
        code: `git switch main
git pull --ff-only
git switch -c feature/account-locking

git push -u origin feature/account-locking
git fetch origin
git rebase origin/main`,
      },
      result: 'The account-locking work has an isolated review surface, and rebasing before review exposes integration issues while they are still local to the feature.',
    },
    interview: {
      prompt: 'Why can a branch that remains open for several weeks become risky even if every individual commit is correct?',
      answer: 'The branch accumulates assumptions about an older version of the code while main keeps changing. The eventual merge must reconcile more semantic and textual differences at once. Smaller branches merged frequently reduce that divergence and let integration tests provide feedback earlier.',
    },
  },
  'Merge and rebase': {
    explanation: [
      'A merge combines two lines of history and normally creates a commit with both branch tips as parents. It preserves the fact that work happened in parallel, and it does not replace the existing commits on either branch.',
      'A rebase copies commits onto a new base, producing new commit identities and a straight history. Rebase is useful for cleaning up an unshared feature branch, but rewriting commits that other people already use forces them to reconcile a changed history, so shared branches are usually merged instead.',
    ],
    whyItMatters: 'Choosing deliberately between merge and rebase preserves collaboration safety while keeping history useful. The key distinction is whether preserving the existing shared commit identities matters more than producing a linear local story.',
    useCases: [
      'Rebasing a private feature branch onto the latest main before opening a pull request',
      'Merging a shared release branch so its integration history and commit identities remain intact',
      'Using an interactive rebase to combine noisy local fixup commits before anyone else depends on them',
    ],
    workedExample: {
      scenario: 'A private branch has three commits and main has advanced by two commits. The developer wants the feature reviewed on top of the current code.',
      steps: [
        'Fetch the remote so origin/main names the current shared base.',
        'While on the private feature branch, rebase its commits onto origin/main and resolve any conflicts one commit at a time.',
        'Run the full relevant checks, then push the rewritten private branch with lease protection rather than an unrestricted force push.',
      ],
      code: {
        language: 'Shell',
        code: `git fetch origin
git switch feature/invoice-search
git rebase origin/main
npm test
git push --force-with-lease`,
      },
      result: 'The feature commits now follow the latest main commit in a linear order, and force-with-lease refuses to overwrite unexpected remote work.',
    },
    interview: {
      prompt: 'What changes during rebase, and why is rebasing a shared branch dangerous?',
      answer: 'Rebase reapplies each selected commit onto a new parent, so the resulting commits have new identities even when their file changes look similar. Collaborators who based work on the old identities now have a different history. Merging preserves those shared commits and avoids making everyone repair their branch ancestry.',
    },
  },
  'Conflict resolution': {
    explanation: [
      'A conflict means Git cannot safely combine changes without human judgment. Text markers show competing edits, but the real task is to reconstruct the behavior the combined code should have, which may differ from simply keeping either version.',
      'Resolve a conflict by reading the surrounding code and the intent of both changes, editing a clean combined version, and removing every marker. Then run focused tests and inspect the final diff because a file can be syntactically conflict-free while still losing a validation rule or duplicating an operation.',
    ],
    whyItMatters: "Mechanical conflict choices can silently discard correct work. Careful semantic resolution protects both contributors' intent and catches integration bugs at the point where independent assumptions meet.",
    useCases: [
      'Combining two branches that both changed request validation in the same handler',
      'Reconciling a renamed function with another branch that added calls to its old name',
      'Resolving dependency lockfile changes by regenerating the file from the accepted manifest',
    ],
    workedExample: {
      scenario: 'One branch rejects negative transfer amounts while another adds a daily transfer limit in the same function.',
      steps: [
        'Inspect the conflict and the commits on both sides to identify the two independent business rules.',
        'Edit the function so it checks both non-negative amounts and the daily limit, then remove the conflict markers.',
        'Stage the resolved file and run tests for negative, within-limit, and over-limit transfers before continuing the merge or rebase.',
      ],
      code: {
        language: 'Shell',
        code: `git status
git log --oneline --left-right HEAD...origin/main

# Edit the conflicted file, then verify it.
git add src/transfers/validate.ts
npm test -- transfer-validation`,
      },
      result: 'The resolved function preserves both business rules, and the targeted tests demonstrate that resolution changed more than the conflict markers.',
    },
    interview: {
      prompt: 'Why is choosing "ours" or "theirs" for every conflict usually unsafe?',
      answer: 'Those choices select one snapshot of the conflicted region, not the correct combined behavior. Both branches may contain valid requirements, or one may have renamed code that the other extended. A sound resolution starts from intent, constructs the desired result, and verifies it with tests and diff review.',
    },
  },
  'Pull requests': {
    explanation: [
      'A pull request is a proposal to integrate a set of commits into another branch. Its diff is only part of the proposal; the description should state the problem, the chosen solution, important alternatives, user-visible effects, and any operational work reviewers must understand.',
      'A useful pull request is small enough to reason about and contains evidence that the change works. Link the relevant issue, call out risky files and migrations, provide reproduction or verification steps, and update the description as the implementation changes during review.',
    ],
    whyItMatters: "Pull requests create a shared checkpoint for correctness and knowledge transfer before code becomes part of the maintained system. A clear proposal helps reviewers spend attention on behavior and risk rather than reconstructing the author's intent.",
    useCases: [
      'Reviewing a bug fix with before-and-after reproduction steps',
      'Coordinating a schema migration that requires a particular deployment order',
      'Showing screenshots and accessibility checks for a user-interface change',
    ],
    workedExample: {
      scenario: 'A checkout fix changes idempotency handling and adds a database uniqueness constraint, so reviewers need both code evidence and rollout context.',
      steps: [
        'Write a title and summary that name the duplicate-charge symptom and the rule used to prevent it.',
        'Describe the migration order, rollback behavior, and exact automated and manual checks that were run.',
        'Keep the branch focused, request reviewers who understand payments and persistence, and resolve discussion with follow-up commits or documented reasoning.',
      ],
      code: {
        language: 'Markdown',
        code: `## Problem
Retries can create two charges for one checkout operation.

## Change
- Store one result per idempotency key.
- Enforce uniqueness in the database.

## Verification
- Duplicate-request integration test passes.
- Migration tested against a production-size snapshot.`,
      },
      result: 'Reviewers can evaluate the behavior, database safety, and evidence without guessing why the files changed or how the fix will be released.',
    },
    interview: {
      prompt: 'What information belongs in a pull request when the diff already shows every changed line?',
      answer: 'The diff shows implementation but not enough context to judge it efficiently. The pull request should explain the problem, intended behavior, notable tradeoffs, risk, rollout or migration needs, and verification evidence. That information lets reviewers test assumptions instead of reverse-engineering them from code.',
    },
  },
  'Code review': {
    explanation: [
      'Code review is a structured attempt to find defects and improve a change before it is integrated. Reviewers should trace important behavior, challenge assumptions at system boundaries, and consider correctness, security, data integrity, failure handling, performance, readability, and operations.',
      'Effective comments are specific and proportional. Explain the consequence of an issue, distinguish blocking problems from optional suggestions, and ask a question when context may be missing. Authors should respond with evidence or reasoning rather than treating approval as a contest.',
    ],
    whyItMatters: 'Review catches risks that tests and tools do not express, while distributing knowledge about how the system works. It also improves future changes by making design decisions and quality expectations visible to the team.',
    useCases: [
      'Finding that an unbounded retry loop can overload a failing dependency',
      'Checking that a new endpoint verifies tenant authorization as well as authentication',
      'Confirming that a data migration can run while old and new application versions overlap',
    ],
    workedExample: {
      scenario: 'A pull request retries all failed payment requests five times, including invalid card requests that return a client error.',
      steps: [
        'Trace the failure branches and identify which responses are transient and which represent permanent input failures.',
        'Leave a blocking comment tied to the retry condition, describing the duplicate-load and latency risk and suggesting a retryable-status allowlist.',
        'Ask for tests that prove a temporary service error is retried with a limit while an invalid request fails immediately.',
      ],
      code: {
        language: 'Text',
        code: `Blocking: this retries permanent 4xx failures. That adds latency and
repeats requests that cannot succeed. Could we retry only documented transient
statuses, cap attempts, and add one test for 503 plus one for 400?`,
      },
      result: 'The revised code retries only bounded transient failures, and the review explains both the defect and the evidence needed to close it.',
    },
    interview: {
      prompt: 'How would you review a change whose tests pass and whose formatting is clean?',
      answer: 'I would still trace the requirements and important failure paths, inspect trust and persistence boundaries, and consider concurrency, security, performance, and rollback. Tests only cover cases someone encoded, and formatting does not prove correct behavior. I would make concrete comments and label optional design suggestions separately from blockers.',
    },
  },
  'Git bisect': {
    explanation: [
      'Git bisect uses binary search over commits to find where a reproducible behavior changed. You mark one commit as bad and an older commit as good, then Git checks out a midpoint for you to test and repeatedly narrows the range.',
      'The method is most reliable when the test has a clear exit status and each candidate commit can be built in a comparable environment. Automated bisect runs are fast, but you should inspect the identified commit and verify the parent is good because flaky tests, environmental changes, or broken intermediate commits can mislead the search.',
    ],
    whyItMatters: 'Bisect turns a large regression window into a logarithmic search, replacing guesses about likely authors or files with repeatable evidence. It is especially valuable when the visible failure appears far from the change that caused it.',
    useCases: [
      'Finding the first commit that made a deterministic login regression test fail',
      'Locating when a command-line tool began producing a different output format',
      'Narrowing a performance regression with a script that classifies a measured threshold',
    ],
    workedExample: {
      scenario: 'The current main branch fails a session-expiry test, while release tag v2.4.0 passes it.',
      steps: [
        'Confirm the same focused test reliably fails at the current commit and passes at v2.4.0.',
        'Start bisect, mark the current commit bad and v2.4.0 good, then let the test command classify each midpoint.',
        'Inspect the first bad commit and verify its parent manually before ending bisect and returning to the original branch.',
      ],
      code: {
        language: 'Shell',
        code: `git bisect start
git bisect bad HEAD
git bisect good v2.4.0
git bisect run npm test -- session-expiry
git show --stat
git bisect reset`,
      },
      result: 'Git reports the first commit associated with the failure, reducing the investigation to that change and its assumptions rather than the entire release range.',
    },
    interview: {
      prompt: 'What conditions must hold for git bisect run to give a trustworthy answer?',
      answer: 'The command must classify commits consistently through its exit status, and good and bad endpoints must be verified. Candidate commits need a comparable build and test environment. If results are flaky or some commits cannot be tested, the run needs stabilization or explicit skipping followed by manual verification of the reported boundary.',
    },
  },
  Revert: {
    explanation: [
      'Git revert creates a new commit that applies the inverse of an earlier commit. The original commit remains in history, so collaborators can pull the correction normally and the record still shows what was introduced and later undone.',
      'Revert is different from reset, which moves a branch reference and is often used only for local history repair. A revert can conflict when later changes depend on the original commit, so inspect the inverse diff, test the resulting behavior, and include any operational rollback that Git cannot perform, such as restoring migrated data.',
    ],
    whyItMatters: 'Reverting is a collaboration-safe way to remove a harmful change from shared history. It favors quick restoration of known behavior while preserving an audit trail for later diagnosis and a better fix.',
    useCases: [
      'Backing out a recently merged feature that causes production errors',
      'Removing one faulty commit from a shared release branch without rewriting other work',
      'Reverting a merge after verifying that all changes introduced by that merge should be undone',
    ],
    workedExample: {
      scenario: 'A newly merged cache policy serves stale inventory counts in production, and the safest immediate response is to restore the previous policy.',
      steps: [
        'Identify the exact introducing commit and inspect its changes and any later commits that depend on it.',
        'Create a revert commit on a new branch, resolve conflicts according to the desired previous behavior, and review the inverse diff.',
        'Run inventory and cache tests, deploy the revert through the normal review path, and monitor stale-read indicators.',
      ],
      code: {
        language: 'Shell',
        code: `git switch -c revert/inventory-cache origin/main
git show a1b2c3d
git revert a1b2c3d
npm test -- inventory cache`,
      },
      result: 'The cache behavior is removed by a visible new commit, while the original change remains available for root-cause analysis and a corrected follow-up.',
    },
    interview: {
      prompt: 'Why is git revert generally safer than git reset for undoing a commit already shared with a team?',
      answer: 'Revert adds a new inverse commit and does not change the commit ancestry collaborators already have. Reset moves the branch pointer and usually requires rewriting the remote branch, which can discard or complicate other work. Revert still requires testing because later code or external data changes may depend on the original commit.',
    },
  },
  'Secrets and ignore rules': {
    explanation: [
      'Secrets such as API keys, passwords, private keys, and session-signing material must not be stored in Git. Deleting a secret in a later commit does not remove it from earlier commits, forks, caches, or clones, so a committed secret must be treated as exposed and rotated.',
      'Ignore rules prevent untracked local or generated files from being added, but they do not untrack files already committed. Keep a safe example file with variable names and dummy values, store real values in an approved secret system, and combine ignore rules with automated secret scanning and narrow credentials.',
    ],
    whyItMatters: 'Repository history is widely copied and long lived, making it a poor secret store. Preventing and rapidly rotating leaked credentials reduces unauthorized access, while precise ignore rules keep builds and reviews free of machine-specific or generated noise.',
    useCases: [
      'Ignoring local environment files while committing a documented .env.example',
      'Excluding generated build output, coverage reports, and editor-specific state',
      'Rotating a cloud token immediately after secret scanning finds it in a pushed commit',
    ],
    workedExample: {
      scenario: 'A developer accidentally stages .env.local, which contains a live payment sandbox token, but notices before committing.',
      steps: [
        'Remove the file from the staging area without deleting the local copy, then add its pattern to .gitignore.',
        'Confirm Git ignores the file and inspect the staged diff to ensure no secret value appears elsewhere.',
        'If the token was ever pushed or shared, rotate it in the provider first and follow the team process for cleaning history and auditing use.',
      ],
      code: {
        language: 'Shell',
        code: `git restore --staged .env.local
printf ".env.local\\n" >> .gitignore
git check-ignore -v .env.local
git diff --cached`,
      },
      result: 'The local configuration remains available to the developer but cannot be added by a normal git add, and any previously exposed token is replaced rather than merely hidden.',
    },
    interview: {
      prompt: 'A secret was committed, then deleted in the next commit. What should happen next?',
      answer: 'Assume the secret is compromised and revoke or rotate it immediately. Removing the latest file does not erase prior history or copies. After containment, determine whether history cleanup is appropriate, notify collaborators if rewritten history is required, audit use of the old credential, and add prevention such as ignore rules and secret scanning.',
    },
  },
  'Continuous integration': {
    explanation: [
      'Continuous integration runs repeatable checks whenever changes are proposed or added to a shared branch. A typical pipeline installs locked dependencies in a clean environment, then performs formatting or lint checks, type checking, tests, security checks, and a production build as appropriate.',
      'CI should provide fast, trustworthy feedback rather than becoming a separate mystery environment. Keep commands runnable locally, cache only reproducible artifacts, expose useful failure logs, protect required checks from being skipped, and move slower suites into clear stages without weakening merge safety.',
    ],
    whyItMatters: 'Automated integration checks catch incompatible changes before they accumulate on the shared branch. They also make the definition of a releasable change consistent instead of depending on which developer remembered which manual command.',
    useCases: [
      'Running lint, type checking, unit tests, and a production build for every pull request',
      'Testing a library against each supported runtime version through a build matrix',
      'Blocking a merge when a database integration test or dependency audit fails',
    ],
    workedExample: {
      scenario: 'A TypeScript service needs a pull-request pipeline that catches type errors, test failures, and production-only build errors.',
      steps: [
        'Check out the exact commit and install dependencies from the lockfile in a clean runner.',
        'Run lint, type checking, and unit tests as separate named checks so failures are easy to identify.',
        'Run the production build after the fast checks and require all jobs before the pull request can merge.',
      ],
      code: {
        language: 'YAML',
        code: `steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
    with:
      node-version: 22
      cache: npm
  - run: npm ci
  - run: npm run lint
  - run: npx tsc --noEmit
  - run: npm test
  - run: npm run build`,
      },
      result: 'Every proposed commit is evaluated by the same declared commands, and a failed check points reviewers to the affected quality gate before merge.',
    },
    interview: {
      prompt: 'What makes a CI pipeline trustworthy rather than merely present?',
      answer: 'Its required checks match the risks of the project, run from a reproducible dependency state, fail clearly, and cannot be routinely bypassed. The same core commands should work locally. Flaky checks should be fixed rather than ignored, and the pipeline should include production-relevant validation such as a real build or integration boundary where needed.',
    },
  },
  'Semantic history': {
    explanation: [
      'Semantic history records the intent and consequence of changes, not just the files touched. A useful commit subject states an action and outcome, while an optional body explains motivation, constraints, and tradeoffs that are not obvious from the diff.',
      'History remains readable when commits are coherent and messages use stable language meaningful to the project. Issue references and structured conventions can help automation, but a prefix alone is not semantic if the rest of the message says only "update" or "fix stuff".',
    ],
    whyItMatters: 'Good history supports debugging, release notes, audits, and future design work because maintainers can discover why behavior changed. It reduces dependence on memories, chat logs, and closed review interfaces that may not be available years later.',
    useCases: [
      'Explaining why webhook retries became idempotent when inspecting git blame',
      'Generating a release summary from consistently categorized commits',
      'Finding the change that introduced a business rule by searching commit messages',
    ],
    workedExample: {
      scenario: 'A developer changes a timeout from 5 seconds to 20 seconds because a partner API has a documented slower completion window.',
      steps: [
        'Write a subject that describes the behavioral outcome rather than the numeric edit alone.',
        'Use the message body to record the partner constraint and why 20 seconds is an acceptable bound.',
        'Review the commit with git show to confirm its content matches the message and contains no unrelated changes.',
      ],
      code: {
        language: 'Text',
        code: `Allow partner settlement requests to complete

The partner documents a 15-second processing window. Use a 20-second client
timeout while retaining the existing overall request deadline and metrics.`,
      },
      result: 'A future maintainer can understand the external constraint and surrounding safety limit without inferring intent from the number 20.',
    },
    interview: {
      prompt: 'What makes a commit message useful for future debugging?',
      answer: 'It identifies the behavior or decision changed and, when necessary, explains why. It should agree with an atomic diff and mention constraints that code cannot reveal. File names and vague words describe activity, but intent-focused messages help searches, blame, bisect follow-up, and rollback decisions.',
    },
  },
  'Unit tests': {
    explanation: [
      'A unit test checks one small unit of behavior through a stable public interface, usually without real network, filesystem, clock, or database dependencies. The unit may be a function or a small group of collaborating objects; isolation matters because the test should fail for a narrow, understandable reason.',
      'Strong unit tests arrange meaningful inputs, perform one behavior, and assert observable outcomes rather than private implementation steps. Include success and failure cases around business rules, use descriptive names, and keep setup small enough that the rule under test remains visible.',
    ],
    whyItMatters: 'Fast focused tests give developers precise feedback while changing logic and make refactoring safer. They are especially effective for combinatorial business rules that would be slow and difficult to diagnose through a full application test.',
    useCases: [
      'Checking discount calculations across customer tiers and order totals',
      'Verifying a parser rejects malformed identifiers without starting external services',
      'Testing state transitions in an order aggregate with in-memory inputs',
    ],
    workedExample: {
      scenario: 'Free shipping applies only when a domestic order total is at least 50 dollars, and the threshold needs precise tests.',
      steps: [
        'Call the shipping rule directly with totals just below, exactly at, and above the threshold.',
        'Add an international order at the threshold to prove destination remains part of the rule.',
        'Assert the returned fee rather than checking which helper functions were called.',
      ],
      code: {
        language: 'TypeScript',
        code: `describe('shippingFee', () => {
  test.each([
    [49.99, 'domestic', 5],
    [50, 'domestic', 0],
    [80, 'domestic', 0],
    [50, 'international', 15],
  ])('returns the fee for %s and %s', (total, region, expected) => {
    expect(shippingFee(total, region)).toBe(expected)
  })
})`,
      },
      result: 'The test suite documents the exact threshold and destination rule, runs without infrastructure, and will survive internal refactoring that preserves the output.',
    },
    interview: {
      prompt: 'Should a unit test always test exactly one function and mock every collaborator?',
      answer: 'No. The useful boundary is a small coherent behavior with fast and deterministic dependencies, not a mandatory one-function rule. Mocking every internal call couples tests to implementation. Prefer testing observable results through a stable interface and replace only boundaries that are slow, nondeterministic, or outside the unit.',
    },
  },
  'Integration tests': {
    explanation: [
      'An integration test checks that real components work together across a meaningful boundary, such as application code with a database, message broker, filesystem, or HTTP adapter. It focuses on contracts that a unit test with doubles cannot prove, including serialization, queries, transactions, and configuration.',
      'Keep integration tests repeatable by provisioning controlled dependencies, isolating each test case, and cleaning or rolling back state. Use realistic schemas and protocols, assert externally visible behavior, and reserve integration coverage for boundaries where mismatched assumptions create real risk.',
    ],
    whyItMatters: 'Components can pass isolated tests while failing when joined because their data shapes, timing, transactions, or configuration disagree. Integration tests expose those boundary errors before deployment without requiring the cost of exercising the entire product.',
    useCases: [
      'Verifying a repository query and database constraint against the real database engine',
      'Checking that an HTTP client serializes requests accepted by a local provider stub',
      'Proving that publishing an event results in the expected consumer-side database update',
    ],
    workedExample: {
      scenario: 'Two concurrent requests using the same idempotency key must create only one payment row in PostgreSQL.',
      steps: [
        'Start a disposable PostgreSQL instance and apply the production migrations, including the uniqueness constraint.',
        'Send two concurrent repository operations with the same key and wait for both outcomes.',
        'Query the database directly to assert that one row exists and verify that the second operation returns the stored result rather than creating another charge.',
      ],
      code: {
        language: 'TypeScript',
        code: `const results = await Promise.all([
  payments.createOnce('checkout-42', payment),
  payments.createOnce('checkout-42', payment),
])

expect(results[0].id).toBe(results[1].id)
expect(await db.payment.count({
  where: { idempotencyKey: 'checkout-42' },
})).toBe(1)`,
      },
      result: 'The test proves that application logic and the real database constraint cooperate under concurrency, a guarantee an in-memory repository could easily miss.',
    },
    interview: {
      prompt: 'What should an integration test cover that a unit test using a database mock cannot?',
      answer: 'It should cover behavior owned by the actual boundary: query syntax, schema constraints, transaction isolation, driver serialization, migrations, and configuration. A mock can model expected calls, but it cannot prove the real database accepts them or enforces the same concurrency and data rules.',
    },
  },
  'End-to-end tests': {
    explanation: [
      "An end-to-end test exercises a user or system journey through the application's real external interfaces and its major deployed components. A browser test might submit a form, pass through the API and database, and confirm the resulting page or message.",
      'Because broad tests are slower and have more failure sources, use them for a small set of critical journeys rather than every input combination. Control test accounts and data, wait on observable conditions instead of fixed delays, capture diagnostics on failure, and keep lower-level tests responsible for detailed rule coverage.',
    ],
    whyItMatters: 'End-to-end tests show that separately tested parts are wired into a usable system. They protect high-value workflows against missing routes, broken configuration, incompatible deployments, and other failures that appear only across the complete path.',
    useCases: [
      'Creating an account, verifying it, and signing in through the browser',
      'Completing a checkout with a sandbox payment provider and confirming the order',
      'Uploading a document and verifying that its processed status appears to the user',
    ],
    workedExample: {
      scenario: 'The team wants one browser test proving that a registered customer can place an order and see its confirmation number.',
      steps: [
        'Create a unique test customer and product through supported setup APIs so the journey starts from known data.',
        'Use the browser to sign in, add the product, submit checkout, and wait for the confirmation heading rather than sleeping for a fixed time.',
        'Assert the displayed order number and verify through the public order API that the same order is persisted, then remove the test data.',
      ],
      code: {
        language: 'TypeScript',
        code: `await page.goto('/login')
await page.getByLabel('Email').fill(customer.email)
await page.getByLabel('Password').fill(customer.password)
await page.getByRole('button', { name: 'Sign in' }).click()

await page.goto('/products/test-widget')
await page.getByRole('button', { name: 'Add to cart' }).click()
await page.getByRole('button', { name: 'Place order' }).click()
await expect(page.getByRole('heading', { name: /order confirmed/i })).toBeVisible()`,
      },
      result: 'The test verifies the critical checkout wiring from browser interaction to persisted confirmation while leaving detailed pricing cases to faster tests.',
    },
    interview: {
      prompt: 'Why should a team avoid putting every business rule into end-to-end tests?',
      answer: 'Each end-to-end case exercises many components, so it is slower, more expensive to maintain, and less precise when it fails. Keep a few broad tests for critical wiring and user journeys, then cover rule combinations with unit tests and boundary contracts with integration tests. This gives faster feedback and clearer diagnosis.',
    },
  },
  'Test pyramid': {
    explanation: [
      'The test pyramid is a cost model: keep many fast focused tests near the code, fewer tests across real component boundaries, and a small number of broad end-to-end journeys. The exact proportions depend on the system, but feedback speed and failure diagnosis should guide where each behavior is tested.',
      'The goal is not to maximize test count at one layer. Put pure rules where they can be checked cheaply, use integration tests for contracts that need real infrastructure, and use end-to-end tests for wiring and critical user outcomes. Avoid duplicating the same assertion at every layer unless the added defense addresses a distinct risk.',
    ],
    whyItMatters: 'A layered strategy provides confidence without making every change wait on slow, fragile system tests. It also localizes failures: a rule failure points to a focused test, while a broad failure more likely indicates wiring or environment trouble.',
    useCases: [
      'Testing many price combinations as units while keeping one complete checkout journey',
      'Using repository integration tests for SQL behavior instead of repeating every query through a browser',
      'Moving validation edge cases out of a slow API suite into fast domain tests',
    ],
    workedExample: {
      scenario: 'A subscription service supports six plans, several tax regions, a payment gateway, and one customer checkout flow.',
      steps: [
        'Cover plan and tax combinations with fast table-driven unit tests around the pricing function.',
        'Add integration tests for payment request serialization and transaction persistence against controlled dependencies.',
        'Keep one or two end-to-end tests for successful checkout and a declined payment, then monitor suite time and failure quality.',
      ],
      code: {
        language: 'Text',
        code: `Unit:        plan rules, tax tables, proration, validation
Integration: payment contract, database transaction, event publication
End-to-end:  successful checkout, declined-payment journey`,
      },
      result: 'Most rule combinations receive rapid precise coverage, while the smaller integration and end-to-end layers prove the contracts and user journey that focused tests cannot.',
    },
    interview: {
      prompt: 'Does the test pyramid require a fixed percentage of unit, integration, and end-to-end tests?',
      answer: 'No. It expresses a tradeoff among speed, realism, maintenance cost, and diagnostic precision. The appropriate mix depends on architecture and risk. The enduring principle is to test each behavior at the lowest-cost layer that can prove it, while retaining enough broader tests to verify important boundaries and wiring.',
    },
  },
  'Boundary cases': {
    explanation: [
      'Boundary cases sit at the edges of valid and invalid behavior: empty input, one item, a maximum value, just below or above a threshold, duplicates, malformed data, and transitions between states. Defects cluster there because comparisons, indexing, rounding, and assumptions about presence become visible.',
      'Derive boundary tests from the contract rather than collecting random unusual values. For each rule, identify the valid range and equivalence groups, then test the boundary itself and neighboring values where practical. Include failure behavior so callers know whether invalid input is rejected, normalized, or handled another documented way.',
    ],
    whyItMatters: 'Happy-path examples often exercise the middle of a valid range and miss off-by-one, overflow, empty-state, and transition defects. Focused boundary tests provide high defect-finding value with a small number of deliberate cases.',
    useCases: [
      'Testing ages 17, 18, and 19 when eligibility begins at 18',
      'Testing an empty page, one full page, and one item beyond the page size',
      'Testing timestamps immediately before, at, and after an expiration instant',
    ],
    workedExample: {
      scenario: 'A file upload accepts positive files up to and including 10 megabytes and rejects empty or oversized files.',
      steps: [
        'Translate the rule into exact byte values so the test does not rely on ambiguous display units.',
        'Test zero bytes, one byte, exactly 10 megabytes, and one byte above the maximum.',
        'Assert both acceptance and the specific rejection reason so callers receive the intended contract.',
      ],
      code: {
        language: 'TypeScript',
        code: `const limit = 10 * 1024 * 1024

expect(validateUploadSize(0)).toEqual({ ok: false, reason: 'empty' })
expect(validateUploadSize(1)).toEqual({ ok: true })
expect(validateUploadSize(limit)).toEqual({ ok: true })
expect(validateUploadSize(limit + 1)).toEqual({ ok: false, reason: 'too-large' })`,
      },
      result: 'The cases define both sides of each contract edge and will catch an accidental less-than comparison or acceptance of an empty upload.',
    },
    interview: {
      prompt: 'How do you choose boundary cases for a new validation rule?',
      answer: 'I first state the valid domain precisely, including inclusive or exclusive limits and empty behavior. Then I select values at each transition and immediately around it, plus representative malformed or duplicate inputs where relevant. I assert the documented result or error, not just that execution completed.',
    },
  },
  'Mocks and fakes': {
    explanation: [
      'Mocks and fakes are test doubles used in place of a real dependency. A mock is commonly configured with expected interactions and can verify calls, while a fake provides a lightweight working implementation, such as an in-memory repository with the same public contract.',
      'Use doubles at stable external boundaries, not around every helper. Prefer state or returned-result assertions over fragile call-order checks, make fakes honor important real constraints, and retain contract or integration tests because a double can drift from the service or database it represents.',
    ],
    whyItMatters: 'Well-chosen doubles make tests fast and deterministic when real dependencies are slow, costly, or capable of side effects. Poorly chosen doubles make tests pass against an imaginary system and couple harmless refactoring to extensive test rewrites.',
    useCases: [
      'Faking an email sender so a registration test can inspect the queued message without sending mail',
      "Mocking a payment gateway timeout to verify the application's retry policy",
      'Using an in-memory clock implementation to test expiration without waiting in real time',
    ],
    workedExample: {
      scenario: 'An order service should mark an order paid only after its payment gateway returns an approved charge.',
      steps: [
        'Define a payment gateway interface at the external boundary and inject it into the order service.',
        'Use a small fake that returns a chosen approval or decline result without mocking internal order methods.',
        'Call the service and assert the final order state for both outcomes, then keep a separate integration test for the real gateway adapter contract.',
      ],
      code: {
        language: 'TypeScript',
        code: `class FakeGateway implements PaymentGateway {
  constructor(private readonly approved: boolean) {}

  async charge(): Promise<{ approved: boolean }> {
    return { approved: this.approved }
  }
}

const service = new OrderService(new FakeGateway(true), orders)
await service.pay(order.id)
expect((await orders.get(order.id)).status).toBe('paid')`,
      },
      result: 'The test controls the external payment outcome and checks business state without depending on network access or internal call structure.',
    },
    interview: {
      prompt: 'When can mocking make a test less trustworthy?',
      answer: 'It becomes risky when the mock reproduces assumptions instead of the real dependency contract, or when it asserts private call sequences rather than outcomes. Such tests can stay green while production integration fails and can break during harmless refactoring. Use doubles at clear boundaries and verify those adapters separately against realistic systems.',
    },
  },
  Fixtures: {
    explanation: [
      'A fixture supplies known data or environment state needed by a test. It can be a small object builder, a database row set, a file, or setup and cleanup logic, but its purpose is to make the starting conditions explicit and repeatable.',
      'Good fixtures contain only details relevant to the behavior under test and allow important differences to be stated at the call site. Large shared fixtures hide assumptions, create accidental coupling, and make failures difficult to read, so prefer focused factories with sensible defaults and explicit overrides.',
    ],
    whyItMatters: 'Controlled setup prevents one test from depending on another and makes failures reproducible. Minimal fixtures also show which facts drive the expected result, reducing maintenance when unrelated fields or schemas change.',
    useCases: [
      'Building an active customer with an explicit expired subscription for one test',
      'Loading a small CSV file containing the exact malformed row a parser must reject',
      'Seeding related database records before a transaction integration test and removing them afterward',
    ],
    workedExample: {
      scenario: 'Cancellation is allowed for a paid order that has not shipped, and tests need readable order setup without repeating every field.',
      steps: [
        'Create an order factory whose defaults represent a valid paid and unshipped order.',
        'Override only status or shipment time in tests that exercise those specific restrictions.',
        'Give each generated order a unique identifier and clean persisted records after integration tests.',
      ],
      code: {
        language: 'TypeScript',
        code: `function orderFixture(overrides: Partial<Order> = {}): Order {
  return {
    id: crypto.randomUUID(),
    status: 'paid',
    shippedAt: null,
    totalCents: 2500,
    ...overrides,
  }
}

const shipped = orderFixture({ shippedAt: new Date('2026-01-10T10:00:00Z') })
expect(canCancel(shipped)).toBe(false)`,
      },
      result: 'The test emphasizes the shipped state that matters, while valid defaults keep irrelevant order fields from obscuring the rule.',
    },
    interview: {
      prompt: 'Why can one large shared fixture make a test suite harder to maintain?',
      answer: "Tests begin depending on fields they do not declare, so changing the shared data causes distant failures or silently changes test meaning. Readers also cannot tell which values matter. Small factories with explicit overrides preserve reusable setup while keeping each test's relevant assumptions visible.",
    },
  },
  'Parameterized tests': {
    explanation: [
      'A parameterized test runs the same behavior check against a table of inputs and expected outputs. It removes repeated test structure while making the dimensions of a rule, such as region, threshold, or status, easy to compare.',
      'Each row should represent a meaningful case and produce a readable failure name. Keep the test body simple, avoid putting unrelated workflows into one giant table, and use separate tests when cases require different setup or assertions rather than forcing them into an unclear schema.',
    ],
    whyItMatters: 'Tables make systematic coverage easier to inspect and extend, especially around equivalence classes and boundaries. They reduce copy-and-paste mistakes while still reporting exactly which input combination violates the rule.',
    useCases: [
      'Checking tax rates for several supported regions with the same calculation contract',
      'Testing a parser against valid, empty, and malformed strings with expected results',
      'Verifying role permissions across a table of roles, actions, and allow or deny outcomes',
    ],
    workedExample: {
      scenario: 'A password rule requires at least 12 characters and at least one digit, and the team wants concise coverage of independent failures.',
      steps: [
        'List representative inputs for too short, missing digit, valid at the boundary, and valid above the boundary.',
        'Include a descriptive case label so a failing row identifies the broken rule immediately.',
        'Run every row through the same public validator and compare the complete result.',
      ],
      code: {
        language: 'TypeScript',
        code: `test.each([
  ['too short', 'abc123', false],
  ['missing digit', 'longpassword', false],
  ['valid at length 12', 'abcdefghijk1', true],
  ['valid above boundary', 'a-secure-passphrase-9', true],
])('%s', (_caseName, password, expected) => {
  expect(isValidPassword(password)).toBe(expected)
})`,
      },
      result: "One compact test displays the rule's important classes, and a failure reports which requirement and input stopped matching the contract.",
    },
    interview: {
      prompt: 'When should parameterized cases be split into separate tests?',
      answer: 'Split them when rows no longer share one behavior, setup, and assertion shape. A table that needs many optional columns or branching logic hides intent. Parameterization is strongest when each row answers the same question and differs only in clearly named input and expected-output values.',
    },
  },
  'Property-based tests': {
    explanation: [
      'Property-based testing generates many inputs and checks a rule that should hold for all valid examples, rather than listing only selected expected values. Useful properties include round trips, invariants, ordering, idempotence, and agreement between a simple reference implementation and an optimized one.',
      'Generators must match the domain so failures represent meaningful inputs, and the property must be stronger than a restatement of the implementation. Good tools shrink a failing generated value to a smaller counterexample; record or report the seed so the exact failure can be reproduced and turned into a regression case when useful.',
    ],
    whyItMatters: 'Generated exploration reaches combinations and edge cases that example-based tests may overlook. It is particularly effective for parsers, serializers, algorithms, and stateful rules with a large valid input space.',
    useCases: [
      'Checking that encoding and then decoding any valid identifier returns the original identifier',
      'Verifying that sorting any generated list produces ordered output with the same members',
      'Ensuring repeated normalization of valid user input gives the same result as one normalization',
    ],
    workedExample: {
      scenario: 'A URL-safe token encoder and decoder should round-trip every nonempty byte array supported by the token format.',
      steps: [
        'Define a generator for nonempty byte arrays within the documented maximum token size.',
        'For each generated value, encode it, decode the result, and assert byte-for-byte equality with the original.',
        'When the tool finds a failure, retain the seed and inspect the minimized counterexample before fixing the implementation.',
      ],
      code: {
        language: 'TypeScript',
        code: `fc.assert(
  fc.property(
    fc.uint8Array({ minLength: 1, maxLength: 256 }),
    (bytes) => {
      const token = encodeToken(bytes)
      expect(decodeToken(token)).toEqual(bytes)
    },
  ),
)`,
      },
      result: 'The property explores many lengths and byte combinations, and any failure is reduced to a reproducible value that violates the round-trip contract.',
    },
    interview: {
      prompt: 'How is a property-based test different from a parameterized test?',
      answer: 'A parameterized test evaluates a fixed table of examples selected by the developer. A property-based test defines a domain generator and an invariant, then explores many generated examples and often shrinks failures. They complement each other: named examples document known boundaries, while properties search a wider space for counterexamples.',
    },
  },
  'Flaky tests': {
    explanation: [
      'A flaky test sometimes passes and sometimes fails without a relevant code change. Common causes include uncontrolled time, random data, shared state, asynchronous races, fixed delays, order dependence, network services, resource pressure, and assumptions about locale or environment.',
      'Treat flakiness as a defect in the test or product, not as harmless noise. Capture failure evidence, reproduce under repetition or changed ordering, isolate the nondeterministic dependency, and replace timing guesses with controlled clocks or observable conditions. Quarantine may protect delivery briefly, but it needs an owner and a repair path.',
    ],
    whyItMatters: 'Flaky tests train teams to rerun or ignore failures, allowing real regressions to merge and wasting investigation time. A deterministic suite preserves confidence that a red result means action is required.',
    useCases: [
      'Injecting a fake clock instead of waiting for a token to expire',
      'Giving each parallel database test unique records instead of sharing one account',
      'Waiting for a visible completion event rather than sleeping for an estimated network delay',
    ],
    workedExample: {
      scenario: 'A browser test sleeps for two seconds after submitting a report, then intermittently fails when report generation takes longer in CI.',
      steps: [
        'Capture traces and repeat the test to confirm that the assertion races the asynchronous report completion.',
        'Remove the fixed sleep and wait for the application-owned completed status or download control with a bounded timeout.',
        'Run the focused test repeatedly and in parallel with neighboring tests to check that no shared report data remains.',
      ],
      code: {
        language: 'TypeScript',
        code: `await page.getByRole('button', { name: 'Generate report' }).click()

await expect(
  page.getByTestId('report-status'),
).toHaveText('Completed', { timeout: 15_000 })

await expect(page.getByRole('link', { name: 'Download' })).toBeVisible()`,
      },
      result: 'The test synchronizes with a user-visible state transition and fails only if completion does not occur within the actual contract, rather than if one machine is slower than an estimate.',
    },
    interview: {
      prompt: 'A test passes after rerunning it. What should you do next?',
      answer: 'Preserve the original logs and treat the first failure as evidence. Reproduce with repetition, randomized order, or parallel execution; identify uncontrolled time, state, concurrency, or environment; and fix that source. A temporary quarantine can limit disruption, but repeatedly rerunning until green hides both product races and test defects.',
    },
  },
  'Coverage judgment': {
    explanation: [
      'Coverage reports show which code was executed by tests, usually as lines, branches, functions, or statements. They do not show whether assertions were meaningful, requirements were complete, failures were realistic, or the tests would detect an incorrect implementation.',
      'Use coverage as a map for investigation, not a score to optimize blindly. Examine untested decision branches and high-risk behavior, add tests that could fail for a real defect, and accept that some trivial or generated lines may be lower value than one carefully tested authorization or transaction rule.',
    ],
    whyItMatters: 'Coverage can reveal accidental gaps, but targets pursued without judgment encourage tests that execute lines without checking behavior. Risk-based interpretation directs effort toward defects that would matter to users and operations.',
    useCases: [
      'Finding that an authorization denial branch is never exercised',
      'Comparing changed-line coverage in a pull request to locate newly untested logic',
      'Using branch coverage to spot an untested retry-exhaustion path hidden by high line coverage',
    ],
    workedExample: {
      scenario: 'A payment module reports 98 percent line coverage, but the coverage report shows that the branch handling a gateway timeout never runs.',
      steps: [
        'Open the branch coverage view and trace the uncovered timeout path to its required customer-visible and persistence behavior.',
        'Add a test that makes the gateway time out and asserts no payment is marked successful, the attempt is recorded, and the caller receives a retryable failure.',
        'Mutation-check or temporarily break the timeout handling to confirm the new assertion fails for the defect it is intended to catch.',
      ],
      code: {
        language: 'TypeScript',
        code: `gateway.charge.mockRejectedValue(new TimeoutError())

await expect(service.pay(order.id)).rejects.toMatchObject({
  retryable: true,
})
expect(await payments.findSuccessful(order.id)).toBeNull()
expect(await attempts.countFor(order.id)).toBe(1)`,
      },
      result: 'The numerical increase is secondary; the important outcome is a test that detects a dangerous false-success behavior on a previously untested failure branch.',
    },
    interview: {
      prompt: 'Can a project with 100 percent line coverage still have serious bugs?',
      answer: 'Yes. Tests may execute lines without strong assertions, miss combinations and branch outcomes, or encode the same wrong assumption as the implementation. Coverage is useful for locating code no test reaches, but confidence also requires requirement-based cases, meaningful assertions, realistic integration checks, and attention to risk.',
    },
  },
} satisfies Record<string, SoftwareLessonDetails>