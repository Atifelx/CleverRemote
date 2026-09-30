import type { SoftwareLessonDetails } from './software-core-lesson-types'

export const softwareDesignLessonDetails = {
  'Arrays and lists': {
    explanation: [
      'An array stores values in an indexed sequence, while a dynamic list adds capacity management so the sequence can grow. Reading or replacing an item by index is O(1), scanning is O(n), appending is amortized O(1), and inserting or deleting near the front is O(n) because later elements must shift.',
      'Choose an array or list when order matters, iteration is common, and positions have meaning. It offers compact storage and predictable traversal, but repeated insertion in the middle or repeated membership checks can make a linked structure, set, or hash map a better fit.',
    ],
    whyItMatters: 'Selecting a list for ordered data makes the common path simple and fast, but its linear shifts and searches become visible at scale. Knowing those costs prevents an innocent-looking loop or front insertion from turning a request into quadratic work.',
    useCases: [
      'Keeping search results in ranking order for indexed display',
      'Collecting validation errors in the order they are discovered',
      'Processing a compact batch of sensor readings sequentially',
    ],
    workedExample: {
      scenario: 'A product page receives ranked recommendation IDs and must render the first three while preserving the ranking supplied by the model.',
      steps: [
        'Store recommendation IDs in an array because rank is represented directly by position.',
        'Read the first three positions with slice, an O(k) operation for the k copied values, rather than repeatedly searching the full collection.',
        'Append a fallback ID only when needed; the append is amortized O(1) and preserves the existing order.',
      ],
      code: {
        language: 'TypeScript',
        code: `const rankedIds = ['p-17', 'p-04', 'p-29', 'p-08']
const visibleIds = rankedIds.slice(0, 3)

if (visibleIds.length < 3) {
  visibleIds.push('fallback')
}`,
      },
      result: 'The page preserves model rank, reads positions directly, and performs work proportional only to the small displayed prefix.',
    },
    interview: {
      prompt: 'Why can repeatedly inserting at index zero make building an array of n items O(n squared)?',
      answer: 'Each insertion shifts every existing item one position, so the work grows as 0 + 1 + 2 through n - 1. That sum is O(n squared). Appending and reversing once is usually O(n), or a deque can provide efficient insertion at the front when that operation is fundamental.',
    },
  },
  'Hash maps': {
    explanation: [
      'A hash map applies a hash function to a key and uses the result to select a storage bucket. Lookup, insertion, and deletion are O(1) on average when hashes are well distributed, but collisions and pathological input can degrade operations toward O(n), while resizing occasionally makes one insertion expensive.',
      'Choose a hash map for direct access by a stable key, counting, grouping, or memoization. It trades extra memory and usually non-semantic iteration order for fast key operations; an array is better for dense numeric positions, and a tree map is better when sorted traversal or range queries are required.',
    ],
    whyItMatters: 'Keyed access can replace a nested scan with one indexing pass, changing a reconciliation task from O(n times m) to O(n + m). The key definition still matters because unstable or non-unique keys silently produce wrong associations.',
    useCases: [
      'Indexing customer records by immutable customer ID',
      'Counting occurrences of error codes in a log batch',
      'Caching computed shipping quotes by normalized request key',
    ],
    workedExample: {
      scenario: 'An invoice import must attach 50,000 payment rows to customers without scanning the customer array for every payment.',
      steps: [
        'Build a map from customer ID to customer in O(n) time and O(n) additional space.',
        'Look up each payment customer ID in average O(1) time and reject rows whose key is absent.',
        'Process all m payments in O(m), making total expected work O(n + m).',
      ],
      code: {
        language: 'TypeScript',
        code: `const customersById = new Map(
  customers.map((customer) => [customer.id, customer]),
)

for (const payment of payments) {
  const customer = customersById.get(payment.customerId)
  if (customer) applyPayment(customer, payment)
}`,
      },
      result: 'The import performs one customer indexing pass and one payment pass instead of up to 50,000 full customer scans.',
    },
    interview: {
      prompt: 'What properties must a hash map key have, and why are mutable keys dangerous?',
      answer: 'Equal keys must produce the same hash, and equality should remain stable while the key is stored. If fields used by hashing or equality change, the entry may remain in its old bucket while future lookups search a new one. Immutable identifiers or normalized primitive keys avoid that failure.',
    },
  },
  Sets: {
    explanation: [
      'A set stores unique values and answers membership questions. Hash-backed sets provide average O(1) add, delete, and contains operations, while tree-backed sets commonly provide O(log n) operations and sorted iteration; traversing either form remains O(n).',
      'Choose a set when uniqueness or membership is the behavior, rather than storing placeholder values in a map or repeatedly scanning a list. A set does not preserve duplicates and may not preserve insertion order across languages, so a list is still required when repeated values or positional meaning are part of the data.',
    ],
    whyItMatters: 'Representing uniqueness in the data structure makes duplicate handling explicit and turns repeated O(n) membership scans into average O(1) checks. It also communicates intent more clearly than a map whose values carry no information.',
    useCases: [
      'Removing duplicate email addresses from an import batch',
      'Tracking feature flags enabled for a user',
      'Finding permissions shared by two roles with set intersection',
    ],
    workedExample: {
      scenario: 'A notification job receives repeated subscriber IDs from several segments but must send at most one message per subscriber.',
      steps: [
        'Insert each subscriber ID into a set, discarding duplicates during the O(n) input pass.',
        'Iterate over the unique IDs once to enqueue notifications.',
        'Keep the original segment arrays separately if segment order or duplicate counts are needed for reporting.',
      ],
      code: {
        language: 'TypeScript',
        code: `const recipientIds = new Set<string>()

for (const segment of segments) {
  for (const subscriberId of segment) recipientIds.add(subscriberId)
}

for (const subscriberId of recipientIds) enqueueNotification(subscriberId)`,
      },
      result: 'Each subscriber is enqueued once in expected O(n) time, without an O(n squared) duplicate scan or a meaningless map value.',
    },
    interview: {
      prompt: 'When would you choose a tree-backed set over a hash-backed set?',
      answer: 'A tree-backed set is useful when values must be iterated in sorted order, when predecessor or range operations matter, or when deterministic O(log n) operations are preferred. A hash-backed set is usually faster for pure membership with average O(1) operations and no ordering requirement.',
    },
  },
  Stacks: {
    explanation: [
      'A stack is a last-in, first-out structure: push adds to the top, pop removes the top, and peek reads it. These operations are O(1) with an array-backed implementation when the end of the array is the top, while searching the stack remains O(n).',
      'Choose a stack when the newest unfinished item must be handled first, such as nested parsing, undo history, or depth-first traversal. A queue is the alternative when arrival order must be preserved, and recursive call stacks should be replaced with an explicit stack when depth may exceed runtime limits.',
    ],
    whyItMatters: 'A stack makes nested state and reversal behavior explicit, preventing ad hoc index manipulation from mixing the order of pending work. Its O(1) top operations also keep depth-first algorithms linear in the number of visited items.',
    useCases: [
      'Checking whether nested brackets close in the correct order',
      'Implementing an editor undo history',
      'Traversing a directory tree depth first without recursion',
    ],
    workedExample: {
      scenario: 'A configuration parser must reject expressions such as ([)] where every closing bracket exists but closes in the wrong order.',
      steps: [
        'Push each opening bracket onto a stack as the expression is scanned once.',
        'For each closing bracket, pop the most recent opening bracket and verify that the pair matches.',
        'Accept only if every closing bracket matched and the stack is empty at the end.',
      ],
      code: {
        language: 'TypeScript',
        code: `const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' }
const stack: string[] = []

for (const token of expression) {
  if ('([{'.includes(token)) stack.push(token)
  else if (token in pairs && stack.pop() !== pairs[token]) return false
}

return stack.length === 0`,
      },
      result: 'The parser detects both missing and incorrectly nested brackets in O(n) time with O(d) space for maximum nesting depth d.',
    },
    interview: {
      prompt: 'Why is removing from the end of an array a better stack operation than removing from the front?',
      answer: 'Removing the final element normally changes only the length and is O(1). Removing the first element requires shifting all remaining elements and is O(n). Using the array end as the stack top preserves constant-time push and pop.',
    },
  },
  Queues: {
    explanation: [
      'A queue is a first-in, first-out structure: enqueue adds at the back and dequeue removes from the front. A linked queue, circular buffer, or deque supports both operations in O(1); repeatedly shifting a normal array can make dequeue O(n) because all remaining elements move.',
      'Choose a queue when fairness or arrival order defines correctness, including breadth-first search and background work dispatch. A bounded queue can also apply backpressure when producers are faster than consumers, while a priority queue is the better choice when urgency rather than arrival time controls service order.',
    ],
    whyItMatters: 'Queue semantics prevent old work from being starved by newer arrivals and make capacity pressure observable. The implementation choice matters because an O(n) front removal can dominate a high-throughput worker even though enqueue looks cheap.',
    useCases: [
      'Dispatching uploaded files to workers in arrival order',
      'Running breadth-first search to find the fewest unweighted hops',
      'Buffering events with a fixed capacity to protect a slower consumer',
    ],
    workedExample: {
      scenario: 'A support system must assign waiting chats in arrival order without shifting a growing array on every assignment.',
      steps: [
        'Store chats in an array and maintain a head index that identifies the next waiting chat.',
        'Append new chats in amortized O(1) and advance the head in O(1) when a chat is assigned.',
        'Periodically compact consumed entries so retained array slots do not keep old objects alive indefinitely.',
      ],
      code: {
        language: 'TypeScript',
        code: `const waitingChats: Chat[] = []
let head = 0

function enqueue(chat: Chat) {
  waitingChats.push(chat)
}

function dequeue() {
  return head < waitingChats.length ? waitingChats[head++] : undefined
}`,
      },
      result: 'Chat assignment remains FIFO with amortized O(1) enqueue and O(1) dequeue instead of repeatedly paying O(n) for array shifts.',
    },
    interview: {
      prompt: 'Why does breadth-first search use a queue rather than a stack?',
      answer: 'A queue processes all nodes at distance d before nodes at distance d + 1, so the first visit to a node in an unweighted graph uses the fewest edges. A stack follows one branch deeply first and does not preserve that shortest-hop guarantee.',
    },
  },
  'Linked lists': {
    explanation: [
      'A linked list stores each value in a node that points to the next node, and a doubly linked list also points backward. Inserting or deleting a known node is O(1), but locating an index or value is O(n) because nodes must be followed from an endpoint; each node also carries pointer and allocation overhead.',
      'Choose a linked list when stable node identity and frequent splicing dominate random access, especially when callers already hold node references. Dynamic arrays are usually better for indexed reads, compact memory, and cache-friendly iteration, so a linked list should not be selected merely because its theoretical insertion is constant time.',
    ],
    whyItMatters: 'The phrase O(1) insertion hides the O(n) search needed when the insertion point is not already known. Distinguishing those costs prevents a linked list from making ordinary traversal slower without improving the actual workload.',
    useCases: [
      'Maintaining the recency order in an LRU cache with direct node references',
      'Splicing jobs between scheduler lists without moving payloads',
      'Implementing a deque with constant-time operations at both ends',
    ],
    workedExample: {
      scenario: 'An LRU cache must move any accessed entry to the front and evict the least recent entry without scanning all cached keys.',
      steps: [
        'Store cache entries as nodes in a doubly linked list ordered from most to least recent.',
        'Keep a hash map from key to node so an access finds its node in average O(1) time.',
        'Detach and prepend the known node in O(1), or remove the tail node in O(1) during eviction.',
      ],
      result: 'Combining a hash map with a doubly linked list gives average O(1) lookup, recency update, and eviction while preserving an explicit recency order.',
    },
    interview: {
      prompt: 'When is insertion into a linked list not really O(1) for the caller?',
      answer: 'Insertion is O(1) only after the caller has the target node or endpoint. If the caller provides an index or value, finding that position takes O(n). An array may be faster overall for workloads that first search and then insert, due to compact storage and better locality.',
    },
  },
  Trees: {
    explanation: [
      'A tree represents hierarchical relationships with nodes and child edges. Traversal is O(n), and operations in a balanced binary search tree are O(log n), but an unbalanced tree can become a chain with O(n) search, insertion, and deletion.',
      'Choose a tree when data has parent-child structure or when ordered indexing, prefix organization, or range queries are central. Hash maps offer faster average exact-key lookup, while trees spend pointer or balancing overhead to preserve hierarchy or order and support operations that hashing cannot.',
    ],
    whyItMatters: 'Tree shape determines both correctness and performance: hierarchy enables focused subtree work, while balance prevents adversarial insertion order from destroying logarithmic behavior. Choosing the right tree variant avoids rebuilding ordering logic in application code.',
    useCases: [
      'Representing folders and files with recursive parent-child relationships',
      'Using a balanced search tree for sorted keys and range queries',
      'Storing URL routes in a prefix tree for segment-by-segment matching',
    ],
    workedExample: {
      scenario: 'A permissions screen must determine whether any node in a selected department subtree contains an explicit access denial.',
      steps: [
        'Model departments as nodes whose children are immediate subdepartments rather than as an unrelated flat list.',
        'Start a depth-first traversal at the selected department and inspect only nodes in that subtree.',
        'Stop when a denial is found; otherwise finish after O(s) work for the s nodes in the subtree and O(h) stack space for height h.',
      ],
      code: {
        language: 'TypeScript',
        code: `function containsDenial(node: Department): boolean {
  if (node.access === 'deny') return true
  return node.children.some(containsDenial)
}`,
      },
      result: 'The check follows the domain hierarchy and avoids scanning departments outside the selected subtree.',
    },
    interview: {
      prompt: 'Why does a binary search tree need balancing?',
      answer: 'Binary search is fast only when each comparison removes a substantial part of the remaining tree. Sorted insertion can make an ordinary tree one-sided, reducing it to a linked list with O(n) operations. A balancing scheme maintains O(log n) height by rotating or restructuring nodes.',
    },
  },
  Graphs: {
    explanation: [
      'A graph models entities as vertices and relationships as edges; edges may be directed, undirected, weighted, or cyclic. With an adjacency list, breadth-first and depth-first traversal cost O(V + E) and use O(V + E) space, while an adjacency matrix uses O(V squared) space but checks a specific edge in O(1).',
      'Choose a graph when relationships are many-to-many and paths, reachability, dependencies, or cycles matter. A tree is simpler when every node except the root has one parent and cycles are impossible; graph algorithms require a visited set to avoid repeated work or infinite traversal.',
    ],
    whyItMatters: 'Graph modeling exposes path and cycle questions directly instead of forcing network-shaped data into nested records. The representation controls memory and lookup costs, so sparse systems usually benefit from adjacency lists while dense systems may justify a matrix.',
    useCases: [
      'Finding dependency cycles before scheduling a software build',
      'Calculating the fewest transfers between transit stations',
      'Determining whether one user can reach a shared resource through group memberships',
    ],
    workedExample: {
      scenario: 'A build service must reject a new dependency if it creates a cycle among packages.',
      steps: [
        'Represent each package with an adjacency list of packages it directly depends on.',
        'Tentatively add the edge, then run depth-first search with visiting and visited states from the changed package.',
        'Reject the edge if traversal reaches a visiting node; the check is O(V + E) in the reachable dependency graph.',
      ],
      code: {
        language: 'TypeScript',
        code: `function visit(name: string): boolean {
  if (visiting.has(name)) return true
  if (visited.has(name)) return false
  visiting.add(name)
  for (const dependency of graph.get(name) ?? []) {
    if (visit(dependency)) return true
  }
  visiting.delete(name)
  visited.add(name)
  return false
}`,
      },
      result: 'The service catches direct and indirect cycles before accepting a dependency that would make build order impossible.',
    },
    interview: {
      prompt: 'When would an adjacency matrix be preferable to an adjacency list?',
      answer: 'A matrix is useful for a dense graph or a workload dominated by asking whether a particular edge exists, because that lookup is O(1). It costs O(V squared) space and scans O(V) potential neighbors, so adjacency lists are usually better for sparse graphs and traversal.',
    },
  },
  Heaps: {
    explanation: [
      'A binary heap is a complete tree, commonly stored in an array, whose parent is ordered before its children. Reading the minimum or maximum is O(1), insertion and removal of the root are O(log n), building a heap from n items is O(n), and finding an arbitrary value remains O(n).',
      'Choose a heap when the next smallest or largest item must be selected repeatedly without fully sorting all items. A sorted array gives O(1) access to an extreme but O(n) insertion, while a hash map gives fast key lookup but cannot efficiently identify the highest-priority entry.',
    ],
    whyItMatters: 'A heap focuses work on the one order statistic the application needs, reducing repeated scheduling or top-k selection from full sorts to logarithmic updates. It is the wrong structure when arbitrary lookup or complete sorted iteration is the main operation.',
    useCases: [
      'Selecting the next job by deadline in a scheduler',
      'Keeping the ten largest measurements from a data stream',
      'Choosing the next shortest tentative path in Dijkstra search',
    ],
    workedExample: {
      scenario: 'A monitoring service receives millions of latency samples and must retain only the 100 slowest without storing or sorting the full stream.',
      steps: [
        'Maintain a min-heap whose capacity is 100, with its smallest retained latency at the root.',
        'Push samples until the heap is full, then replace the root only when a new sample is larger.',
        'Sort the final 100 values for presentation; streaming work is O(n log 100) with O(100) space.',
      ],
      result: 'The service retains the 100 slowest samples with fixed memory and avoids an O(n log n) sort of the complete stream.',
    },
    interview: {
      prompt: 'Why is building a heap from an array O(n) rather than O(n log n)?',
      answer: 'Bottom-up heap construction sifts down internal nodes. Most nodes are near the leaves and move zero or one level, while only a few can move many levels. Summing that decreasing amount of work across levels is O(n), unlike inserting each item separately at O(log n) each.',
    },
  },
  'Binary search': {
    explanation: [
      'Binary search compares a target with the middle of a sorted search interval and discards the half that cannot contain the answer. It runs in O(log n) time and O(1) extra space iteratively, but only when the ordering predicate is monotonic and index access is efficient.',
      'Choose binary search for exact lookup, boundaries, or a monotonic answer space large enough to justify sorting or already maintained in order. A hash map is better for repeated exact lookup without ordering, and linear search is often simpler for tiny or unsorted collections where sorting would cost O(n log n).',
    ],
    whyItMatters: 'Binary search turns billions of possible positions into roughly thirty comparisons, but one incorrect boundary can skip the answer or loop forever. Defining whether the interval is closed or half-open makes the update rules and edge cases auditable.',
    useCases: [
      'Finding the first timestamp at or after a retention cutoff',
      'Checking whether a sorted catalog contains an exact product code',
      'Finding the smallest server capacity that passes a monotonic load test',
    ],
    workedExample: {
      scenario: 'An audit log stores events by ascending timestamp and must find the first event not older than a cutoff.',
      steps: [
        'Use a half-open interval from zero through events.length, where the answer may equal the length if no event qualifies.',
        'When the middle timestamp is before the cutoff, move the lower bound past it; otherwise retain the middle as a possible answer by moving the upper bound to it.',
        'Stop when the bounds meet and return that index after O(log n) comparisons.',
      ],
      code: {
        language: 'TypeScript',
        code: `let low = 0
let high = events.length

while (low < high) {
  const middle = low + Math.floor((high - low) / 2)
  if (events[middle].timestamp < cutoff) low = middle + 1
  else high = middle
}

return low`,
      },
      result: 'The returned index is the lower bound for the cutoff, including correct answers at the first position and one past the final position.',
    },
    interview: {
      prompt: 'What invariant makes a lower-bound binary search correct?',
      answer: 'All indices below low are known to fail the predicate, and all indices at or above high are known to satisfy it when they exist. Each comparison preserves that invariant while shrinking the half-open interval. When low equals high, that boundary is the first satisfying position.',
    },
  },
  'Two pointers': {
    explanation: [
      'The two-pointers pattern maintains two indices whose movement eliminates candidates without restarting a scan. On sorted data, inward-moving pointers often solve pair problems in O(n) time and O(1) space; same-direction pointers can define a sliding window or compact values in place.',
      'Choose two pointers when ordering or a maintained window gives a monotonic reason to move one boundary. A hash set may solve an unsorted pair lookup in O(n) with O(n) space, while nested loops remain O(n squared); forcing pointers onto data without a movement invariant can skip valid answers.',
    ],
    whyItMatters: 'The pattern converts repeated rescanning into one coordinated pass, but its efficiency depends on proving why every pointer move safely discards possibilities. That proof separates a reliable linear algorithm from a coincidentally passing implementation.',
    useCases: [
      'Finding two prices in a sorted list that match a budget',
      'Removing duplicates from a sorted array in place',
      'Finding the smallest window that satisfies a running constraint',
    ],
    workedExample: {
      scenario: 'A promotion engine receives sorted item prices and must find two distinct items whose prices equal a customer budget.',
      steps: [
        'Place one pointer at the lowest price and one at the highest price.',
        'Return the pair when the sum matches; move the left pointer when the sum is too small and the right pointer when it is too large.',
        'Stop when the pointers meet, after at most n - 1 moves and O(1) extra space.',
      ],
      code: {
        language: 'TypeScript',
        code: `let left = 0
let right = prices.length - 1

while (left < right) {
  const sum = prices[left] + prices[right]
  if (sum === budget) return [prices[left], prices[right]]
  if (sum < budget) left += 1
  else right -= 1
}

return undefined`,
      },
      result: 'The engine finds a matching pair in O(n) time instead of testing every O(n squared) pair.',
    },
    interview: {
      prompt: 'Why is sorting plus two pointers not always an O(n) solution?',
      answer: 'The pointer scan is O(n), but sorting unsorted input costs O(n log n) and may alter original positions. The complete solution is O(n log n) unless the input is already sorted. A hash set can provide expected O(n) time with O(n) extra space when order and original indices matter.',
    },
  },
  Encapsulation: {
    explanation: [
      'Encapsulation places state and the operations that preserve its invariants behind a controlled boundary. Callers request meaningful changes rather than directly coordinating fields, so the owning object can validate transitions, keep related updates atomic, and change its representation without breaking consumers.',
      'Use encapsulation for state with rules, but avoid hiding data behind trivial getters and setters that expose the same mutation surface. An immutable value or plain record is a clearer alternative when there is no lifecycle to protect; a service may be better when a rule spans several entities or external systems.',
    ],
    whyItMatters: 'When every caller can mutate related fields independently, invalid states become representable and fixes must be repeated across the codebase. A narrow behavioral API creates one enforceable location for rules and one place to test their consequences.',
    useCases: [
      'Protecting an account balance from withdrawals that exceed available funds',
      'Keeping an order status transition consistent with its completion timestamp',
      'Preventing direct mutation of a bounded retry counter',
    ],
    workedExample: {
      scenario: 'An account model exposes its balance publicly, allowing one caller to create a negative balance without recording a withdrawal.',
      steps: [
        'Make the balance writable only inside the account and expose it as a read-only value.',
        'Add a withdraw operation that validates a positive amount and sufficient funds before changing state.',
        'Return a domain result or throw a domain error so callers handle rejection without partially updating related records.',
      ],
      code: {
        language: 'TypeScript',
        code: `class Account {
  constructor(private balanceInCents: number) {}

  get balance() {
    return this.balanceInCents
  }

  withdraw(amountInCents: number) {
    if (amountInCents <= 0 || amountInCents > this.balanceInCents) {
      throw new Error('Invalid withdrawal')
    }
    this.balanceInCents -= amountInCents
  }
}`,
      },
      result: 'All balance reductions pass through one invariant-preserving operation, and callers can no longer construct a negative balance by assignment.',
    },
    interview: {
      prompt: 'How is encapsulation different from making every field private?',
      answer: 'Privacy is a mechanism; encapsulation is the design of a boundary that owns rules and exposes useful behavior. A class with private fields plus unrestricted setters still leaks its invariants. Good encapsulation gives callers operations such as withdraw or completeOrder and keeps invalid transitions inside the boundary.',
    },
  },
  Abstraction: {
    explanation: [
      'Abstraction presents the capability a caller needs while suppressing implementation details that should not influence that caller. A good abstraction has a small vocabulary, explicit guarantees, and stable failure semantics, allowing implementations to change without forcing every consumer to understand transport, storage, or vendor details.',
      'Introduce an abstraction at a real variation or complexity boundary, not for every function call. Direct use is clearer when there is one simple implementation and no meaningful policy to hide; a broad wrapper that mirrors an entire vendor API adds indirection without reducing coupling.',
    ],
    whyItMatters: 'A focused abstraction localizes volatile decisions and lets tests substitute controlled behavior at the boundary. A weak abstraction merely moves vendor names into another file while still leaking vendor-specific types and errors to every caller.',
    useCases: [
      'Exposing object storage as put and get operations independent of a cloud SDK',
      'Representing time through a clock when business rules depend on the current instant',
      'Providing a payment authorization capability across multiple processors',
    ],
    workedExample: {
      scenario: 'Receipt generation calls a payment vendor SDK directly, making tests perform network setup and exposing vendor response codes throughout the domain.',
      steps: [
        'Define the domain capability as authorizing a money amount with a stable success or failure result.',
        'Adapt the current vendor SDK inside one implementation that translates vendor errors into domain errors.',
        'Depend on the capability in receipt generation and use a deterministic fake in tests.',
      ],
      code: {
        language: 'TypeScript',
        code: `interface PaymentAuthorizer {
  authorize(amountInCents: number): Promise<{ authorizationId: string }>
}

async function issueReceipt(
  authorizer: PaymentAuthorizer,
  amountInCents: number,
) {
  const authorization = await authorizer.authorize(amountInCents)
  return { amountInCents, ...authorization }
}`,
      },
      result: 'Receipt logic depends on a payment capability rather than one SDK, while vendor translation and test substitution each have a clear home.',
    },
    interview: {
      prompt: 'What makes an abstraction leaky?',
      answer: 'It is leaky when callers still need implementation-specific knowledge to use it correctly, such as vendor error codes, connection lifecycle, or storage layout. A stronger boundary translates those details into stable domain concepts. Some operational facts cannot be hidden, but they should be explicit parts of the contract rather than accidental leaks.',
    },
  },
  Inheritance: {
    explanation: [
      'Inheritance defines a subtype by reusing and extending a base type, and it is sound only when the subtype can honor the full behavioral contract of the parent. Protected hooks can share a stable algorithm, but inherited state and overridable methods tightly couple child behavior to base implementation details.',
      'Use inheritance for a genuine is-a relationship with substitutable behavior and a deliberately designed extension point. Prefer composition when variation is one capability, when combinations are needed, or when subclasses would disable parent methods; duplicated code is often cheaper than a hierarchy with false semantic promises.',
    ],
    whyItMatters: 'An inheritance tree makes parent assumptions transitively binding on every subtype, so a small base-class change can alter distant behavior. Restricting inheritance to stable contracts keeps reuse from becoming hidden coupling.',
    useCases: [
      'Implementing specialized syntax nodes under a common visitor contract',
      'Providing framework components through a documented lifecycle base class',
      'Sharing a fixed import algorithm whose parsing step is an explicit protected hook',
    ],
    workedExample: {
      scenario: 'CSV and JSON importers share logging and transaction handling, but each parses records differently.',
      steps: [
        'Place the stable import sequence in a base class and make parsing the narrow extension point.',
        'Require each subtype to return the same validated record shape and preserve the same failure contract.',
        'Avoid exposing transaction internals to subclasses; switch to composed parsers if parsing needs independent runtime combinations.',
      ],
      code: {
        language: 'TypeScript',
        code: `abstract class Importer {
  async run(source: string) {
    const records = this.parse(source)
    await saveInTransaction(records)
  }

  protected abstract parse(source: string): RecordInput[]
}`,
      },
      result: 'Both importers reuse one transaction workflow while the subtype contract remains limited to producing validated records.',
    },
    interview: {
      prompt: 'What warning signs suggest inheritance should be replaced with composition?',
      answer: 'Warning signs include subclasses throwing for inherited methods, boolean flags controlling base behavior, deep override chains, and a need to combine behaviors independently. Those indicate the subtype is not truly substitutable or that variation belongs in collaborating strategies rather than an is-a hierarchy.',
    },
  },
  Composition: {
    explanation: [
      'Composition builds behavior by giving an object smaller collaborators and delegating work to them. Each collaborator owns one capability, and the containing object coordinates them, which allows behavior to vary independently without inheriting state or implementation from a base class.',
      'Use composition when features form mix-and-match dimensions, dependencies need independent tests, or runtime configuration selects behavior. Direct code is preferable for trivial fixed behavior, and excessive interfaces around one-line helpers can fragment understanding without creating a meaningful boundary.',
    ],
    whyItMatters: 'Composition limits the effect of change to the collaborator contract and avoids rigid subtype combinations such as one class for every transport and format pair. The tradeoff is more explicit wiring, which is valuable when it reveals real dependencies but wasteful when it only adds ceremony.',
    useCases: [
      'Combining a report formatter with an independent delivery channel',
      'Injecting retry and authentication policies into an API client',
      'Selecting a pricing strategy without subclassing the checkout service',
    ],
    workedExample: {
      scenario: 'A reporting system needs PDF and CSV formats delivered by email or object storage, and subclasses would require four combinations.',
      steps: [
        'Define formatter and delivery capabilities as separate contracts.',
        'Compose one of each in a report service rather than creating a subtype for every pair.',
        'Configure combinations at the application boundary and test coordination with small fakes.',
      ],
      code: {
        language: 'TypeScript',
        code: `class ReportService {
  constructor(
    private formatter: ReportFormatter,
    private delivery: ReportDelivery,
  ) {}

  async send(data: ReportData) {
    const file = await this.formatter.format(data)
    await this.delivery.deliver(file)
  }
}`,
      },
      result: 'Two formatters and two delivery mechanisms produce four supported combinations with four components rather than four coupled subclasses.',
    },
    interview: {
      prompt: 'Why is composition often described as more flexible than inheritance?',
      answer: 'Composed collaborators can be selected, replaced, and tested independently, including at runtime. Inheritance fixes behavior into a subtype hierarchy and exposes children to base implementation changes. Composition does add wiring, so it is most useful when the collaborators represent real independent variation.',
    },
  },
  Polymorphism: {
    explanation: [
      'Polymorphism lets code invoke one contract while different implementations provide behavior appropriate to their type. The caller dispatches through a method or function interface instead of branching on concrete type, so adding a compatible implementation does not require editing every consumer.',
      'Use polymorphism when several behaviors share stable inputs, outputs, and guarantees. A switch is clearer for a small closed set that must be handled exhaustively, especially with discriminated unions; polymorphism becomes harmful when implementations need different preconditions and only pretend to share a contract.',
    ],
    whyItMatters: 'Polymorphism moves variation behind an explicit contract, reducing duplicated conditionals and allowing extension at one registration point. Its value depends on behavioral compatibility, not merely matching method signatures.',
    useCases: [
      'Calculating shipping quotes through carrier-specific implementations',
      'Rendering different document nodes through a shared render operation',
      'Publishing events through production and in-memory transports',
    ],
    workedExample: {
      scenario: 'Checkout contains conditionals for postal, courier, and pickup delivery quotes, and each new method requires editing checkout logic.',
      steps: [
        'Define a delivery quoting contract with common request and result semantics.',
        'Implement the contract for each delivery method, translating method-specific details internally.',
        'Select the implementation before checkout and call it without a delivery-type branch in the calculation workflow.',
      ],
      code: {
        language: 'TypeScript',
        code: `interface DeliveryQuoter {
  quote(order: Order): Promise<Money>
}

async function totalFor(order: Order, quoter: DeliveryQuoter) {
  const delivery = await quoter.quote(order)
  return order.subtotal.add(delivery)
}`,
      },
      result: 'Checkout remains unchanged when a compatible locker-delivery quoter is registered, and each method owns its external integration details.',
    },
    interview: {
      prompt: 'When is a discriminated union better than polymorphic classes?',
      answer: 'A discriminated union is strong when the set of variants is closed and every operation should handle all variants exhaustively. Polymorphic implementations are stronger when new variants are expected and callers should remain unchanged. The choice depends on whether variants or operations are the more common axis of change.',
    },
  },
  'Single responsibility': {
    explanation: [
      'Single responsibility means a module should have one coherent reason to change, usually aligned with one policy or stakeholder rather than one method. A class that calculates invoices, formats PDFs, and sends email combines business rules, presentation, and delivery, even if each operation is short.',
      'Separate responsibilities when they change independently, require different dependencies, or need different tests and release decisions. Do not split by habit into tiny pass-through classes: behavior that enforces one invariant often belongs together, and a cohesive module may legitimately contain several supporting operations.',
    ],
    whyItMatters: 'Independent concerns in one module create accidental coupling: changing an email provider can risk invoice calculations, and testing tax policy may require network setup. Cohesive boundaries narrow both the blast radius of change and the setup needed to verify it.',
    useCases: [
      'Separating invoice calculation from document rendering',
      'Keeping request parsing outside a domain scheduling policy',
      'Moving audit persistence out of a password validation component',
    ],
    workedExample: {
      scenario: 'An InvoiceService calculates totals, renders a PDF, and sends it through a vendor-specific email client.',
      steps: [
        'Identify the three independent reasons to change: financial policy, document layout, and delivery provider.',
        'Extract calculator, renderer, and delivery components with contracts based on their actual outputs.',
        'Keep a small application service that coordinates them and test financial rules without PDF or email dependencies.',
      ],
      code: {
        language: 'TypeScript',
        code: `async function issueInvoice(order: Order) {
  const invoice = calculator.calculate(order)
  const document = await renderer.render(invoice)
  await delivery.send(invoice.customer, document)
  return invoice
}`,
      },
      result: 'Tax changes affect the calculator, layout changes affect the renderer, and provider changes affect delivery without forcing unrelated tests or edits.',
    },
    interview: {
      prompt: 'Does single responsibility mean every class should have only one public method?',
      answer: 'No. Responsibility is a cohesive reason to change, not a method count. A collection can expose add, remove, and contains while owning one responsibility. Conversely, one large process method can still mix validation, persistence, formatting, and transport policies that change independently.',
    },
  },
  'Open-closed design': {
    explanation: [
      'Open-closed design aims to let new behavior be added through a stable extension point while keeping proven core logic closed to repeated modification. Typical mechanisms include strategies, handlers, and registries whose contracts define what extensions may do and how failures are reported.',
      'Apply it where a variation point changes repeatedly, not to speculative possibilities. An exhaustive switch is a concrete and safer alternative for a small closed domain; a plugin system adds registration, compatibility, and discovery costs that are unjustified when every new case still requires changing core invariants.',
    ],
    whyItMatters: 'Repeatedly editing a central conditional increases regression risk and merge contention in the most connected code. A well-placed extension contract isolates new cases, while overgeneralizing too early creates abstractions that encode guesses rather than observed change.',
    useCases: [
      'Registering new export formats behind a formatter contract',
      'Adding promotion rules to a pricing pipeline',
      'Extending command handling without modifying the dispatcher',
    ],
    workedExample: {
      scenario: 'A checkout service has a growing switch for promotion codes, and every campaign edits the same calculation function.',
      steps: [
        'Define a promotion rule contract that receives a cart and returns an explicit adjustment.',
        'Register rules by code at the composition boundary and keep code lookup outside total calculation.',
        'Add a new campaign as a new rule plus contract tests, leaving the calculation pipeline unchanged.',
      ],
      code: {
        language: 'TypeScript',
        code: `interface PromotionRule {
  adjustmentFor(cart: Cart): Money
}

const rules = new Map<string, PromotionRule>()

function applyPromotion(cart: Cart, code: string) {
  const rule = rules.get(code)
  return rule ? cart.total.add(rule.adjustmentFor(cart)) : cart.total
}`,
      },
      result: 'Campaign additions no longer modify the checkout conditional, while the stable rule contract keeps adjustments compatible with total calculation.',
    },
    interview: {
      prompt: 'How can the open-closed principle be overapplied?',
      answer: 'A team can create interfaces, factories, and plugins for variation that never occurs, increasing indirection and configuration cost. The principle should respond to a demonstrated axis of change. For a fixed set of cases, a direct exhaustive switch may be easier to understand and safer to evolve.',
    },
  },
  'Liskov substitution': {
    explanation: [
      'Liskov substitution requires any subtype to work wherever its parent contract is expected without surprising the caller. A subtype must not demand stronger preconditions, return weaker guarantees, violate invariants, or introduce failure modes that the parent contract excludes.',
      'Use substitution tests to evaluate inheritance and interface implementations by running the same behavioral suite against each one. If an implementation cannot honor the contract, narrow or split the interface, use composition, or model the variant explicitly instead of adding type checks and unsupported-operation exceptions.',
    ],
    whyItMatters: 'Matching method names gives compile-time compatibility but not behavioral safety. A subtype that silently drops data or rejects valid parent inputs forces callers to know concrete types, eliminating the value of the abstraction and creating failures far from construction.',
    useCases: [
      'Verifying every repository implementation preserves save and retrieve semantics',
      'Preventing a read-only collection from pretending to support mutation',
      'Ensuring payment implementations follow one idempotency contract',
    ],
    workedExample: {
      scenario: 'A Cache interface promises that set makes a value immediately available, but an asynchronous implementation only schedules the write and returns early.',
      steps: [
        'Write contract tests that set a value, immediately get it, overwrite it, and verify expiration behavior.',
        'Run the suite against memory and remote implementations to expose the weaker asynchronous guarantee.',
        'Make set await durable availability or split the contract into immediate and eventually consistent cache capabilities.',
      ],
      code: {
        language: 'TypeScript',
        code: `async function cacheContract(createCache: () => Cache) {
  const cache = createCache()
  await cache.set('order-7', 'ready')
  expect(await cache.get('order-7')).toBe('ready')
}`,
      },
      result: 'Every object accepted as Cache now satisfies the immediate-read guarantee, or its weaker behavior is represented by a different contract that callers choose explicitly.',
    },
    interview: {
      prompt: 'Why is throwing UnsupportedOperationError from an overridden method often a substitution violation?',
      answer: 'The parent contract tells callers that the operation is available, so a subtype that rejects it weakens that promise. Callers must inspect the concrete type before using the parent API. Splitting read and write capabilities or using composition models the difference honestly.',
    },
  },
  'Dependency inversion': {
    explanation: [
      'Dependency inversion makes high-level policy depend on capability contracts rather than low-level database, network, or framework details. Concrete adapters implement those contracts, and the application composition root creates and supplies them so dependency direction follows policy ownership.',
      'Introduce a contract where an external detail crosses into stable application logic or where multiple implementations have real value. Do not create an interface for every local helper: direct dependency on stable language and domain types is simpler, while a repository that mirrors every database method may preserve rather than reduce coupling.',
    ],
    whyItMatters: 'When business logic imports infrastructure directly, tests require slow external setup and vendor changes spread through policy code. Inverting that dependency keeps domain decisions testable and makes infrastructure replacement an adapter concern, at the cost of explicit wiring and contract design.',
    useCases: [
      'Making an order service depend on an order repository contract instead of an ORM client',
      'Injecting a clock into expiration policy',
      'Sending domain notifications through a publisher capability rather than a message broker SDK',
    ],
    workedExample: {
      scenario: 'A password reset service imports a mail vendor SDK directly, so domain tests require vendor configuration and expose vendor response types.',
      steps: [
        'Define a reset-notification capability in terms of recipient and reset link, owned by the application layer.',
        'Inject that capability into the service and test reset policy with an in-memory recorder.',
        'Implement a vendor adapter at the boundary and wire it in the production composition root.',
      ],
      code: {
        language: 'TypeScript',
        code: `interface ResetNotifier {
  sendReset(recipient: string, resetUrl: string): Promise<void>
}

class PasswordResetService {
  constructor(private notifier: ResetNotifier) {}

  async request(recipient: string, resetUrl: string) {
    await this.notifier.sendReset(recipient, resetUrl)
  }
}`,
      },
      result: 'Password reset policy no longer imports the vendor SDK, and production delivery can change without altering or slowing the policy tests.',
    },
    interview: {
      prompt: 'Is dependency injection the same as dependency inversion?',
      answer: 'No. Injection is a technique for supplying a dependency, while inversion is an architectural direction: high-level policy owns or depends on an abstraction that low-level details implement. A concrete vendor client can be injected without inversion if policy still depends directly on that vendor type.',
    },
  },
  'Naming and shape': {
    explanation: [
      'Naming communicates a concept, while code shape shows its boundaries through types, parameters, return values, and control flow. Names such as processData hide intent; names such as reserveInventory reveal a domain action, and a result type can make success, rejection, and retry behavior visible without reading the implementation.',
      'Choose names from the domain and shape APIs so invalid combinations are difficult to express. Avoid both vague buckets and overlong names that narrate implementation; when two booleans or several optional parameters create ambiguous calls, use a parameter object, discriminated union, or separate operations with distinct contracts.',
    ],
    whyItMatters: 'Readers spend more time interpreting code than typing it, and misleading names cause callers to make incorrect assumptions that the type checker cannot catch. Clear shape reduces the amount of hidden context required at every call site and makes later change more local.',
    useCases: [
      'Replacing boolean arguments with a named delivery policy',
      'Returning a discriminated result for accepted and rejected payments',
      'Renaming generic manager classes around domain operations',
    ],
    workedExample: {
      scenario: 'A function call updateUser(user, true, false) gives reviewers no clue whether either boolean sends email, grants access, or skips validation.',
      steps: [
        'Identify the domain choices represented by the booleans and give each one a finite vocabulary.',
        'Replace positional flags with a parameter object whose property names are visible at the call site.',
        'Split the function if the options select fundamentally different workflows rather than variations of one update.',
      ],
      code: {
        language: 'TypeScript',
        code: `updateUser(user, {
  notification: 'send',
  accessReview: 'required',
})`,
      },
      result: 'The call now exposes both decisions, prevents swapped booleans, and gives future options a typed place without changing positional meaning.',
    },
    interview: {
      prompt: 'When should a function with several optional parameters be split into separate functions?',
      answer: 'Split it when parameter combinations represent different intents, require different invariants, or leave many options meaningless in some modes. Keep one function when the options are cohesive variations of one operation. Discriminated unions can preserve one entry point while making each valid shape explicit.',
    },
  },
  'Safe refactoring': {
    explanation: [
      'Refactoring changes internal structure while preserving externally observable behavior. A safe sequence establishes characterization or focused tests, makes one small structural change, and verifies immediately, separating behavior changes so failures have a narrow cause.',
      'Use incremental moves, renames, and extractions when the current behavior is understood and protected. Rewrite only when the old structure cannot be evolved economically and the team can define migration and parity checks; broad cleanup mixed with feature work obscures both review intent and rollback boundaries.',
    ],
    whyItMatters: 'Structural improvements are valuable only if users and dependent systems keep their existing guarantees. Small verified steps preserve a known-good point, reveal hidden coupling early, and make it practical to stop or revert without discarding an entire redesign.',
    useCases: [
      'Extracting tax calculation from a large checkout function under existing tests',
      'Renaming a public method through compiler-guided call-site updates',
      'Replacing a persistence adapter while comparing old and new results',
    ],
    workedExample: {
      scenario: 'A 200-line order completion function mixes validation, total calculation, persistence, and email, and a tax change is due next week.',
      steps: [
        'Add characterization tests for successful completion and important rejection paths before moving code.',
        'Extract the pure total calculation without changing its inputs or outputs, then run the focused tests.',
        'Move persistence and notification behind existing behavior boundaries in separate commits, verifying after each extraction.',
        'Implement the tax behavior change only after the structural refactor is green and independently reviewable.',
      ],
      code: {
        language: 'Text',
        code: `1. Characterize current behavior
2. Extract one responsibility
3. Run focused tests
4. Commit the behavior-preserving change
5. Change behavior in a separate step`,
      },
      result: 'The tax change lands against a smaller calculation component, while each preceding commit preserves behavior and can be reviewed or reverted independently.',
    },
    interview: {
      prompt: 'How do you refactor code that has no tests?',
      answer: 'First identify its observable boundaries and add characterization tests around representative success, failure, and edge cases without claiming the current behavior is ideal. Then make small mechanical changes and verify after each one. For difficult external effects, introduce narrow seams carefully and compare outputs before changing policy.',
    },
  },
} satisfies Record<string, SoftwareLessonDetails>