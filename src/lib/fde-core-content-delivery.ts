import type { FdeLessonDetails } from './fde-core-lesson-types'

export const fdeDeliveryLessonDetails = {
  'Outcome-based plan': {
    explanation: [
      'An outcome-based plan starts with the customer behavior or business result that must change, then works backward to the technical capabilities, evidence, and decisions required to produce it. Instead of treating deployed code as completion, define a measurable outcome, a baseline, a target, an owner, and a time window before decomposing the work.',
      'Use this approach when a customer request is broad, several implementation paths are plausible, or delivery value could be confused with feature volume. Outcomes sharpen prioritization and expose assumptions, but distant business metrics can be noisy, so pair them with leading indicators that the delivery team can observe and influence during the engagement.',
    ],
    whyItMatters: 'An outcome-based plan aligns engineering effort with the reason the customer funded the work and gives both teams an objective way to decide whether to continue, change direction, or stop. It also prevents a technically complete deployment from being presented as success when users have not adopted it or operations have not improved.',
    useCases: [
      'Turning a request for an AI support assistant into a target reduction in median case-resolution time',
      'Choosing between workflow automation options by comparing their expected effect on analyst throughput',
      'Resetting an engagement whose backlog is growing while the original business goal remains unclear',
    ],
    workedExample: {
      scenario: 'A logistics customer asks the FDE team to build a shipment dashboard, but its actual concern is that dispatchers discover late deliveries too slowly.',
      steps: [
        'Measure the current median time from a delay signal to dispatcher acknowledgment and confirm the baseline is 42 minutes.',
        'Set a six-week outcome of reducing that time below 15 minutes, with alert acknowledgment rate as a leading indicator.',
        'Map dashboard views, alert routing, data freshness, and dispatcher training to the outcome, then remove requested widgets that do not affect detection or response.',
        'Review the metric weekly with the operations owner and change the plan if usage rises without response time improving.',
      ],
      code: {
        language: 'Text',
        code: `Outcome: Median delay-to-acknowledgment below 15 minutes by June 30
Baseline: 42 minutes
Leading indicator: 80% of alerts acknowledged within 10 minutes
Owner: Dispatch operations lead`,
      },
      result: 'The team delivers alerts and focused operational views first, reaches a 13-minute median acknowledgment time, and avoids spending two weeks on low-value dashboard customization.',
    },
    interview: {
      prompt: 'How would you turn an ambiguous customer request into an outcome-based delivery plan?',
      answer: 'I would ask what decision or behavior should change, establish the current baseline, and agree on a target, owner, and measurement window. I would then map proposed capabilities to leading indicators and test the riskiest assumptions early. If the customer cannot measure the final outcome during the engagement, I would explicitly use a credible proxy rather than pretending feature completion proves value.',
    },
  },
  Milestones: {
    explanation: [
      'A milestone is a verifiable state that reduces delivery uncertainty, not merely a date or a list of tasks completed. Strong milestones describe an observable capability, the evidence required for acceptance, the accountable decision maker, and the dependencies that must be true before the next stage begins.',
      'Use milestones to sequence customer validation, architecture decisions, security approval, pilot readiness, and production release. They create useful control points, but too many turn the plan into reporting overhead and milestone dates become misleading when acceptance criteria or dependency assumptions are left implicit.',
    ],
    whyItMatters: 'Evidence-based milestones make progress legible to engineering and customer leaders while surfacing slippage before the final deadline. They also prevent teams from claiming percentage-complete progress on work whose hardest integration or adoption risk remains unresolved.',
    useCases: [
      'Defining a data-readiness milestone before model tuning begins',
      'Requiring security sign-off and an operator runbook before a production pilot',
      'Structuring a twelve-week engagement around discovery, thin-slice validation, pilot, and handoff',
    ],
    workedExample: {
      scenario: 'An insurer wants a claims-triage assistant in production within ten weeks, with data access and compliance review on the critical path.',
      steps: [
        'Define the first milestone as approved access to a representative, de-identified claims sample with a documented quality profile.',
        'Define a thin-slice milestone in which adjusters evaluate 100 recommendations against agreed precision and recall thresholds.',
        'Make pilot readiness contingent on compliance approval, monitoring, fallback behavior, and completion of the operator runbook.',
        'Assign one customer approver to each milestone and schedule acceptance reviews before downstream work is committed.',
      ],
      code: {
        language: 'Text',
        code: `M1 Data ready: sample approved; quality report accepted
M2 Thin slice: 100 cases reviewed; precision >= 85%
M3 Pilot ready: compliance, monitoring, fallback, runbook approved`,
      },
      result: 'The data-access delay is identified in week one rather than during model evaluation, and the pilot starts with all four operational controls accepted.',
    },
    interview: {
      prompt: 'What distinguishes a useful milestone from a project checkpoint?',
      answer: 'A useful milestone proves a meaningful state with acceptance evidence and a named decision owner. A checkpoint can occur on schedule while nothing has become usable or less risky. I define milestones around validated capabilities or irreversible decisions, keep their criteria binary enough to assess, and use missed criteria to replan dependencies instead of reporting an arbitrary completion percentage.',
    },
  },
  'Dependency management': {
    explanation: [
      'Dependency management identifies the people, systems, approvals, data, environments, and external decisions that constrain delivery, then gives each dependency an owner, due date, status, and fallback. The mechanism is active: review the dependency path regularly, validate assumptions with the provider, and change sequence or scope before a blocked item stalls the whole team.',
      'Use it when customer-side access, security reviews, vendors, or parallel platform teams can determine the schedule. Tracking every minor relationship creates noise, so focus on dependencies with material schedule or outcome impact and distinguish a confirmed commitment from an optimistic date supplied without evidence.',
    ],
    whyItMatters: 'Customer delivery often fails at organizational and integration boundaries rather than inside the codebase. Visible ownership and fallback choices turn hidden waiting time into decisions the joint team can make while there is still room to protect the outcome.',
    useCases: [
      'Coordinating identity-provider configuration owned by the customer security team',
      'Sequencing data ingestion around a vendor API approval and rate-limit increase',
      'Preparing synthetic data and a mock adapter while production data access is reviewed',
    ],
    workedExample: {
      scenario: 'A manufacturer pilot depends on plant telemetry access, a network firewall change, and an identity review owned by three customer teams.',
      steps: [
        'List each dependency with a customer owner, needed-by date, evidence of completion, and the delivery capability it blocks.',
        'Confirm lead times directly with the owning teams and mark the firewall change as critical because it has a three-week review window.',
        'Build a replayable telemetry fixture and local adapter so model and interface work can continue without the live connection.',
        'Review critical dependencies twice weekly and escalate the firewall decision when its committed date moves by five days.',
      ],
      code: {
        language: 'Text',
        code: `Dependency | Owner | Needed by | Evidence | Fallback
Firewall rule | Network lead | May 8 | Test connection | Recorded telemetry
Telemetry scope | Plant lead | May 3 | Sample received | Synthetic fixture
SSO review | IAM lead | May 15 | Test login | Pilot accounts`,
      },
      result: 'The team loses no engineering time during the firewall delay, validates the workflow with recorded data, and connects the live feed two days before pilot acceptance.',
    },
    interview: {
      prompt: 'How do you manage a critical dependency owned by the customer?',
      answer: 'I make the requested decision or artifact, owner, date, and blocking consequence explicit, then confirm the commitment with the person doing the work. I create a fallback that preserves learning where possible and review the item at a cadence proportional to its lead time. If confidence drops, I escalate with options and impact rather than repeatedly asking for a status update.',
    },
  },
  'Risk and issue control': {
    explanation: [
      'A risk is an uncertain event that could affect delivery, while an issue is a problem already occurring. Control begins by recording cause, probability, impact, trigger, owner, and response for material risks, then converting triggered risks into issues with an immediate containment action and a recovery decision.',
      'Use a lightweight risk and issue review throughout engagements with technical novelty, customer dependencies, sensitive data, or firm deadlines. Numeric scoring helps prioritize but can imply false precision, so combine it with explicit impact narratives, observable triggers, and regular removal of stale items that no longer influence decisions.',
    ],
    whyItMatters: 'Separating future uncertainty from current failure keeps teams from discussing both as vague concerns. Owners and triggers make mitigation actionable, while early containment limits customer impact and gives leaders time to choose among scope, schedule, and quality tradeoffs.',
    useCases: [
      'Tracking uncertain model quality before labeled evaluation data is available',
      'Converting an unavailable production API from a risk into an active integration issue',
      'Monitoring whether a single customer expert creates a knowledge bottleneck for acceptance',
    ],
    workedExample: {
      scenario: 'A bank pilot relies on an undocumented transaction API that may not return stable merchant identifiers needed for matching.',
      steps: [
        'Record the risk with a high impact, the first schema sample as its trigger, and the integration lead as owner.',
        'Schedule a two-day API spike and prepare a fallback matching strategy using amount, time, and normalized merchant text.',
        'When the sample confirms identifiers are unstable, open an issue, contain it by enabling the fallback for the pilot, and quantify its lower accuracy.',
        'Present the customer with options to improve the source API, accept an 88 percent pilot match rate, or narrow pilot transaction types.',
      ],
      code: {
        language: 'Text',
        code: `Risk: Merchant ID is unstable across transaction feeds
Trigger: Duplicate purchases return different IDs in sample
Mitigation: Two-day schema spike
Fallback: Composite match; expected accuracy 88%
Owner: Integration lead`,
      },
      result: 'The issue is discovered four weeks before pilot, the fallback keeps the pilot on schedule, and the customer chooses a narrower segment that reaches 96 percent matching accuracy.',
    },
    interview: {
      prompt: 'How do you keep a risk register from becoming administrative theater?',
      answer: 'I include only uncertainties large enough to change scope, schedule, quality, or customer value. Every risk gets an owner, an observable trigger, and a response that can actually be executed. In review, I ask what changed and what decision follows; items without a plausible action are reframed, accepted explicitly, or removed.',
    },
  },
  'Change control': {
    explanation: [
      'Change control evaluates a proposed change against the agreed outcome, acceptance criteria, schedule, cost, dependencies, and risk before work enters the active plan. The team records the request, clarifies its benefit, estimates impact, presents options, and obtains a decision from the person authorized to trade scope or time.',
      'Use change control when new requirements materially alter an engagement baseline, especially near a pilot or production release. The process should not suppress learning or make small clarifications bureaucratic; set a threshold for formal review and preserve a fast path for changes that fit existing outcomes and capacity.',
    ],
    whyItMatters: 'Customer engagements naturally uncover new needs, but silently absorbing each request makes delivery dates and quality commitments meaningless. Explicit decisions preserve trust by showing what a change buys, what it displaces, and who accepted the tradeoff.',
    useCases: [
      'Evaluating a request for a second data source midway through an integration',
      'Trading lower-priority reporting features for a new regulatory control before pilot',
      'Deferring an executive dashboard that does not affect the agreed operational outcome',
    ],
    workedExample: {
      scenario: 'Three weeks before launch, a retailer asks the FDE team to add returns forecasting to an inventory-replenishment pilot.',
      steps: [
        'Clarify that the request targets a separate planning decision and define the minimum acceptance criteria for forecasting.',
        'Estimate that it needs ten engineering days plus new historical data, and identify that it would displace alert tuning and operator training.',
        'Present three choices: defer forecasting, move launch by two weeks, or narrow the pilot to one region and include a basic forecast.',
        'Record the sponsor decision to defer the feature and add it to a separately prioritized follow-on plan.',
      ],
      code: {
        language: 'Markdown',
        code: `## Change request: Returns forecasting
Benefit: Improve weekly inventory planning
Impact: +10 engineering days; new dataset; alert tuning delayed
Decision: Defer until pilot outcome review
Approver: VP Supply Chain`,
      },
      result: 'The original pilot launches on time, trained users handle replenishment alerts from day one, and forecasting is assessed later with real pilot data instead of being rushed into scope.',
    },
    interview: {
      prompt: 'A senior customer asks for an important feature late in delivery. How do you respond?',
      answer: 'I acknowledge the value, clarify the outcome and minimum need, and quickly estimate the effect on existing acceptance criteria, dependencies, and risk. I offer concrete choices rather than a reflexive yes or no, identify what must move for each choice, and record the authorized decision. Urgency can shorten the analysis, but it should not hide the tradeoff.',
    },
  },
  'Customer demos': {
    explanation: [
      'A customer demo is a structured validation session in which the team shows an end-to-end workflow using realistic data, ties each step to an agreed outcome, and captures decisions or corrections from the people who will use or sponsor it. The presenter should state what is proven, what is simulated, and which open question the audience is being asked to resolve.',
      'Use demos frequently to reduce interpretation gaps before formal acceptance, particularly for workflows that are hard to specify in documents. Polished demonstrations can create false confidence if they hide manual steps or selected data, while improvised walkthroughs waste stakeholder attention, so rehearse the path and disclose constraints without staging away meaningful risk.',
    ],
    whyItMatters: 'Working software gives customers a concrete surface for feedback and reveals operational assumptions earlier than status reports. A decision-oriented demo converts that feedback into accepted behavior and prevents late discovery that the team built the right code for the wrong workflow.',
    useCases: [
      'Validating an alert investigation flow with frontline operators every week',
      'Showing a sponsor that a thin slice produces the target business decision before scaling it',
      'Demonstrating degraded behavior when a customer data source is unavailable',
    ],
    workedExample: {
      scenario: 'The FDE team is demonstrating a fraud-review queue to investigators after two weeks of development.',
      steps: [
        'Choose three representative cases, including a true alert, a false positive, and a record with missing data.',
        'Open by restating the target of reducing review time and identify the two workflow decisions investigators need to validate.',
        'Run the cases end to end, disclose that identity enrichment is mocked, and ask an investigator to drive the final case.',
        'Record the accepted queue order, a required reason-code change, and the owner and date for the enrichment decision.',
      ],
      code: {
        language: 'Text',
        code: `Demo goal: Validate a review can finish in under 4 minutes
Real: Queue, case data, disposition persistence
Simulated: Identity enrichment response
Decisions: Queue priority; mandatory reason codes`,
      },
      result: 'Investigators complete the workflow in 3.5 minutes, catch a missing disposition reason before pilot, and approve the queue logic with one documented revision.',
    },
    interview: {
      prompt: 'How do you run a customer demo that produces useful feedback instead of applause?',
      answer: 'I define the decisions the demo must unlock, use realistic cases including a failure or edge condition, and connect the flow to a measurable outcome. I state what is real and simulated, invite a user to operate the workflow, and end by reading back accepted behavior, changes, owners, and dates. That makes feedback actionable and prevents presentation quality from being mistaken for production readiness.',
    },
  },
  'Rollout strategy': {
    explanation: [
      'A rollout strategy controls exposure to a new capability through stages such as internal testing, shadow mode, a limited cohort, progressive expansion, and general availability. Each stage defines entry criteria, monitored indicators, decision owners, rollback triggers, and the technical mechanism for stopping or reversing exposure.',
      'Use staged rollout when failure could affect customer operations, data integrity, trust, or many users at once. Smaller cohorts reduce blast radius but extend the period of parallel operations and can produce unrepresentative evidence, so choose cohorts that exercise real risk and set explicit conditions for progression rather than waiting for confidence by intuition.',
    ],
    whyItMatters: 'A controlled rollout turns production launch from a single irreversible event into a sequence of evidence-based decisions. It lets the joint team detect operational and adoption problems with limited impact while preserving a clear path to scale or recover.',
    useCases: [
      'Running recommendations in shadow mode before they influence customer decisions',
      'Launching a new workflow to one region and then expanding by operating unit',
      'Using feature flags and rollback thresholds for an integration that writes to a system of record',
    ],
    workedExample: {
      scenario: 'A utility will use a new model to prioritize field-service inspections across twelve districts.',
      steps: [
        'Run the model in shadow mode for two weeks and compare its rankings with actual inspection findings without changing dispatch.',
        'Pilot in one representative district with trained supervisors, a feature flag, and daily monitoring of missed high-risk cases.',
        'Set expansion criteria of no critical misses, at least 20 percent higher issue yield, and operator override below 15 percent.',
        'Expand to three districts at a time, pausing automatically if a critical miss or data-freshness breach occurs.',
      ],
      code: {
        language: 'Text',
        code: `Stage 0: Shadow, 14 days
Stage 1: One district, 100 inspections
Advance: +20% issue yield; <15% overrides; 0 critical misses
Rollback: Critical miss or telemetry lag >30 minutes`,
      },
      result: 'The first district improves issue yield by 27 percent with 9 percent overrides, and staged expansion catches a regional data-lag problem before it affects the remaining districts.',
    },
    interview: {
      prompt: 'What must be defined before starting a production rollout?',
      answer: 'I define the initial cohort, entry criteria, success and guardrail metrics, observation window, progression authority, and rollback triggers. I also verify that the rollback mechanism works and that operators know who can invoke it. A rollout percentage alone is not a strategy because it does not explain which risk the cohort tests or how evidence changes the next decision.',
    },
  },
  Adoption: {
    explanation: [
      'Adoption is the sustained use of a delivered capability in the customer workflow, not the count of accounts provisioned or training invitations sent. Manage it by identifying user groups and behavior changes, removing workflow friction, involving credible champions, providing role-specific enablement, and measuring activation, repeated use, completion, and outcome quality.',
      'Use an adoption plan whenever value depends on people changing decisions or routines, especially when the new system competes with spreadsheets, manual workarounds, or established incentives. Usage metrics can reward shallow clicks, so pair quantitative funnels with observation and interviews that explain whether the tool genuinely improves the job.',
    ],
    whyItMatters: 'A technically correct system produces no customer value when users avoid it, misuse it, or duplicate its work elsewhere. Treating adoption as a delivery workstream exposes product and organizational barriers early enough to fix them rather than blaming users after launch.',
    useCases: [
      'Tracking whether dispatchers repeatedly act on generated alerts after initial training',
      'Working with manager incentives when analysts continue using an unofficial spreadsheet',
      'Comparing activation and weekly retention across pilot teams to find workflow friction',
    ],
    workedExample: {
      scenario: 'A hospital deploys a bed-allocation tool, but coordinators still telephone wards and update a shared spreadsheet.',
      steps: [
        'Observe three coordinator shifts and map the extra verification and duplicate-entry steps that make the new tool slower.',
        'Integrate ward confirmation into the tool, remove one redundant field, and recruit two respected coordinators to test the revised flow.',
        'Train by shift using real allocation scenarios and provide an escalation path for data mismatches.',
        'Measure completed allocations, weekly retained users, and median allocation time by shift for four weeks.',
      ],
      code: {
        language: 'Text',
        code: `Activation: First allocation completed
Retention: 3+ active shifts per week
Quality: Reassignment rate below 5%
Outcome: Median allocation time below 12 minutes`,
      },
      result: 'Weekly retained use rises from 38 percent to 87 percent, median allocation time falls from 19 to 11 minutes, and the spreadsheet is retired with operations approval.',
    },
    interview: {
      prompt: 'What would you do if a delivered solution works but customer adoption remains low?',
      answer: 'I would segment usage by role and workflow stage, observe non-users doing the job, and test whether the barrier is trust, friction, missing integration, incentives, or training. I would choose one measurable behavior to improve, make the smallest workflow or enablement change, and compare retention and outcome quality afterward. I would not treat logins alone as evidence of adoption.',
    },
  },
  Handoff: {
    explanation: [
      'Handoff transfers the knowledge, access, operational routines, and decision authority needed for the customer to own a delivered system. It should be built throughout the engagement through paired work, customer-authored changes, runbook rehearsal, architecture and decision records, support boundaries, and verified ownership of repositories, credentials, dashboards, and vendors.',
      'Use a formal readiness review before the FDE team reduces involvement or changes support mode. Documentation is necessary but insufficient because unpracticed instructions decay quickly; require customer operators to demonstrate deployment, incident response, and common modifications while the delivery team can still close gaps.',
    ],
    whyItMatters: 'A solution that depends on the delivery team for routine operation is not truly delivered. Deliberate handoff reduces continuity risk, establishes accountable ownership, and gives the customer confidence to maintain and extend the capability after the engagement ends.',
    useCases: [
      'Having a customer engineer lead the final production deployment from the runbook',
      'Transferring monitoring ownership and rehearsing response to a failed data feed',
      'Documenting support boundaries and escalation contacts before an embedded team exits',
    ],
    workedExample: {
      scenario: 'An FDE team is leaving an energy customer after building a forecasting service that runs every morning before trading begins.',
      steps: [
        'Inventory code, environments, service accounts, dashboards, schedules, data contracts, known limitations, and named customer owners.',
        'Pair with two customer engineers on three releases, gradually moving execution and diagnosis to them.',
        'Run a game day in which the input feed is late and require the customer on-call engineer to detect, contain, communicate, and recover using the runbook.',
        'Close readiness gaps, obtain owner acceptance, and define the post-handoff support window and escalation criteria.',
      ],
      code: {
        language: 'Text',
        code: `Readiness evidence
[x] Customer-led deployment
[x] Feed-delay game day under 20 minutes
[x] Dashboard and pager ownership transferred
[x] Two maintainers approved
[x] Support boundary signed off`,
      },
      result: 'Customer engineers recover the simulated feed delay in 14 minutes, lead the next production release unaided, and complete the first month after exit without an FDE operational escalation.',
    },
    interview: {
      prompt: 'How do you know a customer handoff is complete?',
      answer: 'I look for demonstrated ownership rather than document delivery. Customer maintainers must be able to deploy, monitor, diagnose a representative failure, make a normal change, and explain escalation boundaries using access they own. I also verify named backups and acceptance from operational leadership. Any step that still silently depends on me remains a handoff gap.',
    },
  },
  'Executive summary': {
    explanation: [
      'An executive summary compresses a complex engagement into the outcome, current evidence, material risk, and decision needed from leadership. Lead with the business consequence, quantify movement from the baseline, distinguish fact from forecast, and include only technical detail required to understand confidence or choose an action.',
      'Use it for steering reviews, escalations, investment decisions, and transition points where leaders need to act without replaying the full project history. Compression can erase uncertainty or operational nuance, so state confidence, unresolved assumptions, and the cost of each option rather than presenting a falsely certain success narrative.',
    ],
    whyItMatters: 'Executives allocate attention, authority, and resources across many initiatives. A decision-centered summary lets them understand whether the engagement is producing value, where intervention is needed, and what will happen next without forcing them to translate engineering activity into business impact.',
    useCases: [
      'Requesting sponsor intervention on a customer data-access delay that threatens the pilot date',
      'Summarizing pilot outcomes and recommending whether to scale, revise, or stop',
      'Explaining why an architecture change requires additional investment but lowers operational risk',
    ],
    workedExample: {
      scenario: 'A telecom churn pilot has strong model performance but cannot expand because the customer has not assigned campaign operations capacity.',
      steps: [
        'Open with the result: the pilot identifies high-risk accounts at 82 percent precision and improves retention outreach conversion by 11 percent.',
        'State the constraint and consequence: only 30 percent of scored accounts are contacted, so expected value cannot be realized at national scale.',
        'Present options with cost and impact, then recommend funding two campaign operators for an eight-week expansion test.',
        'End with the sponsor decision and date required to preserve the planned regional rollout.',
      ],
      code: {
        language: 'Markdown',
        code: `## Decision requested
Fund two campaign operators for an eight-week expansion.

## Evidence
82% precision; +11% outreach conversion; only 30% of leads contacted.

## Consequence of no action
Pause expansion and preserve the pilot as analysis only.`,
      },
      result: 'The sponsor approves temporary staffing within three days, contacted leads rise to 91 percent, and the expansion test produces a defensible return-on-investment estimate.',
    },
    interview: {
      prompt: 'How would you summarize a technically successful project that is not yet delivering business value?',
      answer: 'I would state both facts plainly: what the technology has proven and which missing operational condition prevents value. I would quantify the gap, explain the smallest decision that can test or remove it, and show the consequence of acting or not acting. I would avoid labeling the engagement successful until the agreed customer outcome moves.',
    },
  },
  'Status update': {
    explanation: [
      'A status update reports movement against outcomes and milestones, not a diary of activity. A useful update states overall health with evidence, what changed since the prior report, completed and upcoming milestones, material risks or issues, and decisions or help needed from named owners.',
      'Use a stable cadence and format so readers can spot change quickly across a distributed customer team. Traffic-light labels aid scanning but hide nuance when unsupported, while exhaustive task lists obscure the critical path, so include the evidence behind health and emphasize exceptions that require action.',
    ],
    whyItMatters: 'Consistent status reporting creates a shared operational picture and exposes drift while options still exist. It reduces duplicate meetings, prevents surprises, and makes accountability visible without requiring stakeholders to inspect project systems or reconstruct progress from conversation.',
    useCases: [
      'Sending a weekly joint-team update for a multi-workstream customer implementation',
      'Flagging a milestone as at risk because an approval date moved onto the critical path',
      'Recording the decisions and metric movement following a pilot week',
    ],
    workedExample: {
      scenario: 'A procurement automation engagement is green on engineering work but at risk because production identity approval is five days late.',
      steps: [
        'Compare current outcome, milestone, and dependency evidence with the prior update rather than repeating unchanged activity.',
        'Mark overall health amber and explain that the identity delay consumes the remaining launch buffer despite completed workflow tests.',
        'Name the IAM director as the decision owner, state the approval date needed, and document temporary pilot accounts as a limited fallback.',
        'List the next proof point: a production-like login test scheduled immediately after approval.',
      ],
      code: {
        language: 'Markdown',
        code: `Health: AMBER - IAM approval is 5 days late; launch buffer is exhausted.
Progress: 24/24 workflow tests pass; operator training complete.
Decision: IAM approval by Thursday - Owner: IAM director.
Next proof: Production-like login test within 1 day of approval.`,
      },
      result: 'The escalation reaches the correct owner in one update, approval arrives the next day, and launch remains on schedule without disguising the dependency risk.',
    },
    interview: {
      prompt: 'What belongs in a strong weekly customer status update?',
      answer: 'I include outcome and milestone movement, evidence for overall health, meaningful changes since the prior update, the critical risks and issues, and explicit decisions with owners and dates. I keep routine activity out unless it changes confidence. A reader should know in two minutes whether the plan is working and where they must act.',
    },
  },
  'Explain technical ideas': {
    explanation: [
      'Explaining a technical idea means building the listener a usable mental model from their goals and existing knowledge. Start with the decision or problem, introduce only the components and relationships needed to reason about it, use a concrete example, and check understanding by asking the listener to apply the model rather than merely asking whether it makes sense.',
      'Use layered explanations when customer audiences vary from operators to engineers and executives. Analogies can speed understanding but import false assumptions, while excessive precision can bury the decision, so label where an analogy stops and offer deeper detail only where it changes risk, ownership, or action.',
    ],
    whyItMatters: 'FDEs translate between technical systems and customer operations. A shared mental model lets stakeholders make informed tradeoffs, identify incorrect assumptions, and own the delivered system instead of deferring every consequential decision to the implementation team.',
    useCases: [
      'Explaining retrieval-augmented generation to a compliance leader deciding what sources may be indexed',
      'Teaching customer engineers why idempotency is required for retried payment requests',
      'Clarifying eventual consistency for operators who expect two dashboards to update simultaneously',
    ],
    workedExample: {
      scenario: 'A customer operations leader believes an AI answer is guaranteed to be correct whenever the source document is present in the search index.',
      steps: [
        'Begin with the operational decision: which answers may be shown automatically and which require human review.',
        'Describe retrieval and generation as two separate stages, then walk through one case where the right passage is retrieved but interpreted incorrectly.',
        'Show measured grounded-answer accuracy and explain how citations, confidence thresholds, and review reduce different risks.',
        'Ask the leader to classify three sample answers into automatic, reviewed, and blocked paths using the model.',
      ],
      code: {
        language: 'Text',
        code: `Retrieve: Did the system find relevant approved evidence?
Generate: Did it use that evidence faithfully?
Control: What happens when either confidence is low?`,
      },
      result: 'The leader correctly classifies all three cases, approves automation only for the low-risk path, and replaces a blanket accuracy expectation with measurable review rules.',
    },
    interview: {
      prompt: 'How do you explain a complex technical system to a nontechnical customer?',
      answer: 'I start from a decision they already own, learn what they understand, and build the smallest accurate model needed for that decision. I use one realistic example, disclose important limits, and layer detail instead of unloading terminology. I verify understanding by asking them to reason through a new case, which reveals gaps more reliably than asking whether my explanation was clear.',
    },
  },
  'Meeting design': {
    explanation: [
      'Meeting design begins with an outcome that requires synchronous interaction, such as making a decision, resolving competing interpretations, or creating a plan across owners. Invite only needed roles, distribute decision context in advance, assign a facilitator and recorder, time-box discussion, and end with decisions, owners, dates, and unresolved questions.',
      'Use meetings when real-time exchange adds value that an asynchronous update cannot, especially for high-ambiguity or high-conflict choices. A smaller group moves faster but may exclude implementation knowledge or authority, so design participation by role and gather broader input before the session when everyone cannot attend.',
    ],
    whyItMatters: 'Customer delivery crosses organizations with expensive and limited attention. Purposeful meetings shorten decision latency and create accountable next steps, while poorly designed recurring calls consume trust and leave the same blockers unresolved week after week.',
    useCases: [
      'Running a 45-minute architecture decision meeting after options are documented asynchronously',
      'Facilitating a risk workshop with security, operations, data, and product owners',
      'Replacing a recurring status call with a written update and exception-only decision session',
    ],
    workedExample: {
      scenario: 'Six customer teams have discussed where to host sensitive document processing for three weeks without reaching a decision.',
      steps: [
        'Write a decision brief with two viable options, evaluation criteria, open evidence, and the accountable security executive.',
        'Invite one empowered representative from security, platform, operations, legal, and delivery, and collect corrections before the meeting.',
        'Use the session to confirm criteria, resolve two disputed assumptions, score both options, and ask the decision owner to choose.',
        'Read back the decision, dissent, follow-up controls, owners, and dates before ending five minutes early.',
      ],
      code: {
        language: 'Text',
        code: `0-5: Confirm decision and authority
5-15: Resolve disputed facts
15-30: Compare options against criteria
30-35: Decision
35-40: Owners, dates, and read-back`,
      },
      result: 'The customer chooses private cloud processing in one 40-minute session, assigns two compensating controls, and removes a three-week blocker from the integration plan.',
    },
    interview: {
      prompt: 'When should you schedule a meeting instead of sending an asynchronous update?',
      answer: 'I schedule one when the work needs live convergence: a consequential decision, rapid clarification across conflicting views, or collaborative planning with interdependent owners. I use asynchronous communication for information transfer and input collection first. If I cannot name the meeting outcome, required roles, and authority, I do not schedule it.',
    },
  },
  'Difficult news': {
    explanation: [
      'Delivering difficult news means communicating a material problem early, directly, and with verified facts. State what happened, the customer impact, what is known and unknown, immediate containment, the next evidence point, and the decision or support needed; take responsibility for the delivery response without speculating or assigning blame.',
      'Use this pattern for missed commitments, incidents, invalidated assumptions, budget pressure, or results below an agreed threshold. Waiting for a complete diagnosis can increase harm, but premature certainty creates retractions, so separate confirmed facts from hypotheses and commit to a timed update cadence while investigation continues.',
    ],
    whyItMatters: 'Trust depends less on never encountering problems than on making them visible and controllable. Early, precise communication gives the customer time to protect operations and participate in tradeoffs, while delayed or softened news turns a delivery problem into a credibility problem.',
    useCases: [
      'Telling a sponsor that the pilot will miss its date because a core assumption failed',
      'Notifying operators that a production release generated incorrect recommendations',
      'Reporting that evaluation results fall below the threshold required for automated decisions',
    ],
    workedExample: {
      scenario: 'After a data migration rehearsal, the FDE team discovers that 7 percent of customer records cannot be mapped and the planned weekend cutover is unsafe.',
      steps: [
        'Verify the affected population, stop further cutover preparation that assumes complete mapping, and notify the customer program owner the same day.',
        'State that the weekend cutover should not proceed, explain the known record categories, and distinguish two untested mapping hypotheses.',
        'Offer options to delay one week, exclude the affected segment temporarily, or accept manual reconciliation, with risk and effort for each.',
        'Agree on a daily evidence update and assign owners for source-data correction and the second rehearsal.',
      ],
      code: {
        language: 'Text',
        code: `Confirmed: 7% of records fail mapping; current cutover is unsafe.
Unknown: Whether two legacy categories can be deterministically converted.
Containment: Pause cutover; preserve source system.
Recommendation: Delay one week and rerun at 99.9% threshold.
Next update: 16:00 tomorrow.`,
      },
      result: 'The customer delays cutover before notifying users, the joint team raises mapping success to 99.96 percent in five days, and no production records require emergency repair.',
    },
    interview: {
      prompt: 'Tell me how you would communicate that your team will miss a customer commitment.',
      answer: 'I would communicate as soon as the miss is probable enough to affect customer choices. I would state the commitment, current evidence, impact, and my team\'s contribution to the problem; separate facts from investigation; and offer recovery options with explicit tradeoffs. I would set the next update time and keep it even if the only news is that uncertainty remains.',
    },
  },
  'Async communication': {
    explanation: [
      'Asynchronous communication packages enough context for a recipient to understand, respond, or decide without a meeting. A strong message names the purpose, relevant background, current evidence, specific request, decision owner, response deadline, and where the durable result will be recorded.',
      'Use it for status, review, proposals, and decisions across schedules or organizations when immediate dialogue is unnecessary. Rich context reduces back-and-forth but can become unreadable, so lead with the ask, link deeper evidence, choose a channel with the right audience and retention, and escalate synchronously when ambiguity or conflict persists.',
    ],
    whyItMatters: 'Clear asynchronous work preserves focus and creates a searchable record of facts and decisions. It also broadens participation across time zones while preventing routine information transfer from consuming the synchronous time needed for difficult joint reasoning.',
    useCases: [
      'Requesting approval of a data-retention design from a customer security owner',
      'Sharing a weekly decision and risk digest across teams in three time zones',
      'Collecting comments on an API contract before a short final decision meeting',
    ],
    workedExample: {
      scenario: 'A customer architect in Singapore must approve an event schema before developers in London can start an integration.',
      steps: [
        'Post a short message that leads with the approval request and Thursday deadline, then link the versioned schema and sample events.',
        'Explain the two intentional compatibility choices and ask reviewers to comment against named criteria rather than provide general reactions.',
        'Tag the accountable architect and affected consumer owner, while inviting other readers to observe without blocking approval.',
        'Record approval and the one accepted change in the decision log, then notify implementers in the same thread.',
      ],
      code: {
        language: 'Markdown',
        code: `Decision needed by Thu 12:00 UTC: approve event schema v3.
Please check: backward compatibility and deletion semantics.
Evidence: schema diff, 5 sample events, consumer test results.
Decision owner: Customer platform architect.`,
      },
      result: 'The schema is approved within one cross-time-zone cycle, one deletion field is corrected before implementation, and the London team starts without scheduling another meeting.',
    },
    interview: {
      prompt: 'How do you make an asynchronous decision request likely to receive a useful response?',
      answer: 'I put the decision and deadline first, name the accountable person, summarize why it matters, and attach the smallest evidence set needed to evaluate it. I constrain feedback with explicit criteria or options and state where the final decision will live. If responses reveal conflicting assumptions, I move that narrow conflict to a synchronous conversation rather than extending an unclear thread.',
    },
  },
  'Decision record': {
    explanation: [
      'A decision record captures a consequential choice in its original context: the problem, constraints, considered options, decision, rationale, consequences, owner, and date. It preserves why the team chose a path without turning the record into a transcript, and it can be superseded when evidence or constraints materially change.',
      'Use records for architecture, scope, data policy, rollout, ownership, and operational choices that future contributors may question or reverse. Recording every routine implementation choice creates clutter, while omitting dissent makes the rationale look stronger than it was, so set a materiality threshold and include important rejected options and uncertainty.',
    ],
    whyItMatters: 'Customer teams change and engagement context fades. A concise decision history prevents repeated debate, supports audits and handoff, and lets future owners distinguish a deliberate tradeoff from an accidental implementation detail.',
    useCases: [
      'Documenting why customer data remains in-region despite a simpler global service option',
      'Recording the choice to begin in advisory mode rather than automate decisions',
      'Capturing why an existing customer platform is reused instead of introducing a new component',
    ],
    workedExample: {
      scenario: 'A healthcare customer must choose between real-time and nightly synchronization for a referral-prioritization pilot.',
      steps: [
        'State the decision and constraints, including a two-hour clinical response target, limited source-system API capacity, and a six-week pilot window.',
        'Compare real-time events, hourly polling, and nightly batch on latency, implementation effort, source impact, and recoverability.',
        'Record the selection of hourly polling, why it satisfies the pilot outcome, and the accepted risk of up to 60 minutes of staleness.',
        'Name the trigger for revisiting the decision: production expansion to use cases requiring response under 30 minutes.',
      ],
      code: {
        language: 'Markdown',
        code: `Decision: Use hourly polling for the pilot.
Rationale: Meets the 2-hour response target with low source-system risk.
Consequence: Data may be up to 60 minutes stale.
Revisit when: A workflow requires response below 30 minutes.`,
      },
      result: 'The pilot integration is delivered two weeks faster, clinical response remains within target, and the scale-up team knows exactly when the synchronization choice must be reopened.',
    },
    interview: {
      prompt: 'What decisions deserve a durable record?',
      answer: 'I record choices that materially shape architecture, customer outcome, risk, cost, ownership, or future options and are likely to be revisited after the original participants have moved on. The record must preserve context and tradeoffs, not just the selected option. I avoid documenting reversible local choices whose rationale is already obvious in code.',
    },
  },
  Negotiation: {
    explanation: [
      'Negotiation in delivery aligns interests under constraints by separating stated positions from underlying needs, defining objective criteria, generating multiple packages, and understanding each side\'s best alternative if no agreement is reached. The goal is a workable commitment with clear scope, ownership, and consequences, not winning a concession that the other party cannot sustain.',
      'Use negotiation when schedule, scope, resources, risk, or responsibility cannot all remain fixed. Revealing priorities can create value but weak alternatives reduce leverage, so prepare evidence, authority boundaries, non-negotiable safety constraints, and several trades before the conversation rather than bargaining one demand at a time.',
    ],
    whyItMatters: 'FDE work regularly spans teams with different incentives and limited capacity. Principled negotiation protects the delivery outcome and relationship by converting conflict over positions into explicit trades that both organizations can actually execute.',
    useCases: [
      'Trading pilot scope for an immovable regulatory deadline without dropping safety controls',
      'Securing customer engineering ownership in exchange for accelerating a requested integration',
      'Agreeing on support boundaries when the customer wants continuous coverage beyond the engagement',
    ],
    workedExample: {
      scenario: 'A customer insists that five business units join a pilot by quarter end, while the FDE team can safely onboard only two with available support.',
      steps: [
        'Ask what the quarter-end commitment must prove and learn that the sponsor needs evidence across two distinct operating models, not every unit.',
        'Bring onboarding capacity, support-load data, and the reliability guardrails that cannot be traded.',
        'Offer two packages: two representative units with full workflow depth, or five units with read-only analytics and no automated actions.',
        'Agree on two full units now and reserve expansion dates contingent on support staffing and pilot reliability.',
      ],
      code: {
        language: 'Text',
        code: `Shared interest: Prove repeatability this quarter
Non-negotiable: On-call coverage for automated actions
Trade: Number of units vs workflow depth
Agreement: 2 full units now; 3 after reliability and staffing gates`,
      },
      result: 'I secured agreement on two representative units, both launched by quarter end with 99.8 percent workflow availability, and the measured support load justified staffing for the remaining three.',
    },
    interview: {
      prompt: 'Tell me about a time you negotiated scope with a demanding customer.',
      answer: 'I would answer with the specific constraint, the customer interest behind the stated demand, and the evidence I used to frame options. For example, I negotiated a five-unit launch into two representative units by showing support capacity and preserving the sponsor\'s repeatability goal. Both units launched on time at 99.8 percent availability, and the resulting load data unlocked staffing for the remaining rollout.',
    },
  },
  'Technical presentation': {
    explanation: [
      'A technical presentation guides a specific audience from a problem through evidence to a decision or transferable understanding. Build one narrative around the audience\'s stakes, use diagrams and demonstrations to expose system relationships, label assumptions and measured results, and keep detailed reference material available without forcing it into the main flow.',
      'Use presentations for architecture reviews, pilot readouts, training, and technical recommendations where a shared visual sequence improves reasoning. Simplification is necessary but can conceal failure modes, while dense slides protect precision at the cost of comprehension, so move detail to appendices and spend main-stage time on consequential mechanisms and tradeoffs.',
    ],
    whyItMatters: 'A strong presentation lets customer stakeholders evaluate technical work and remember the decisions it supports. It creates a common story across leaders, operators, and engineers while giving specialists enough evidence to challenge assumptions productively.',
    useCases: [
      'Presenting a pilot architecture and failure model to a customer review board',
      'Explaining evaluation results and a rollout recommendation to technical and business leaders',
      'Training customer engineers on how data moves through a delivered platform',
    ],
    workedExample: {
      scenario: 'The FDE team must present an AI document-processing pilot to a mixed audience of legal leaders, operators, and platform engineers.',
      steps: [
        'Interview representatives from each group and define one shared decision: whether to proceed to a controlled production pilot.',
        'Structure the presentation around current processing cost, the end-to-end workflow, measured quality by document type, failure controls, and rollout options.',
        'Use one architecture diagram and a live example with an intentionally ambiguous document, then disclose sample size and confidence limits.',
        'Rehearse to 20 minutes, place protocol and model details in an appendix, and reserve 15 minutes for decision-focused questions.',
      ],
      code: {
        language: 'Text',
        code: `1. Decision and customer outcome
2. Workflow and architecture
3. Evidence by document type
4. Failure handling and controls
5. Rollout options and recommendation`,
      },
      result: 'The review board approves a two-team production pilot, legal adopts the proposed human-review threshold, and engineers resolve all integration questions from the appendix without extending the meeting.',
    },
    interview: {
      prompt: 'How do you present deeply technical work to a mixed customer audience?',
      answer: 'I anchor the presentation on one shared decision or outcome, then layer the material: business stakes, a precise system model, measured evidence, and operational consequences. I use examples that matter to operators, diagrams that expose engineering boundaries, and an appendix for specialist depth. I rehearse with a representative listener and check whether each section changes understanding or action.',
    },
  },
  'STAR structure': {
    explanation: [
      'STAR structures behavioral evidence as Situation, Task, Action, and Result. Set only enough customer context to establish stakes and constraints, state the responsibility you personally owned, spend most of the answer on specific decisions and actions, and close with measured outcomes plus what the evidence taught you.',
      'Use STAR when an interviewer or stakeholder needs to evaluate how you operated, not just what a team delivered. The format improves clarity but can sound rehearsed or overclaim causality, so name collaborators and constraints accurately, distinguish your contribution from the team result, and include a lesson or limitation when it shaped later behavior.',
    ],
    whyItMatters: 'FDE performance is demonstrated through judgment under real customer constraints. A disciplined evidence structure makes ownership, reasoning, and impact assessable while preventing a technically impressive project description from hiding what the speaker actually did.',
    useCases: [
      'Answering an interview question about recovering a customer delivery at risk',
      'Explaining a cross-functional influence example during a promotion review',
      'Writing a concise engagement retrospective that separates context, intervention, and outcome',
    ],
    workedExample: {
      scenario: 'I need to explain how I recovered a warehouse optimization pilot that was two weeks behind because operations experts could not attend daily design sessions.',
      steps: [
        'I state the situation and my task in two sentences: protect a six-week pilot while obtaining enough operator input to validate the workflow.',
        'I describe my actions: observed one night shift, replaced daily meetings with two recorded prototypes, and secured a supervisor for twice-weekly decisions.',
        'I quantify the result: decision latency fell from five days to one, the team recovered nine delivery days, and 18 of 20 operators completed the pilot workflow without assistance.',
        'I add that the two struggling operators exposed a training gap, which I addressed before the next site rollout.',
      ],
      code: {
        language: 'Text',
        code: `S: Pilot 2 weeks behind; operators unavailable
T: Validate workflow within 6-week window
A: Shift observation, recorded prototypes, named supervisor
R: Decision latency 5 days -> 1; recovered 9 days; 18/20 independent users`,
      },
      result: 'I produce a two-minute answer that makes my decisions and the team outcome verifiable without erasing collaborators or hiding the remaining training gap.',
    },
    interview: {
      prompt: 'Use STAR to describe a time you recovered a delivery that was at risk.',
      answer: 'A warehouse pilot was two weeks behind because operators could not attend daily design sessions, and I owned restoring the validation path within the six-week window. I observed a night shift, replaced recurring meetings with recorded prototypes, and secured one supervisor for twice-weekly decisions. Decision latency fell from five days to one, we recovered nine days, and 18 of 20 operators completed the final flow unaided; I then added targeted training for the remaining two before expansion.',
    },
  },
  Ownership: {
    explanation: [
      'Ownership means treating the customer outcome and the system around it as your responsibility to advance, including gaps outside your original task. It requires identifying the next constraint, making commitments explicit, closing loops, escalating with options, and ensuring that work has a durable owner rather than personally absorbing every activity.',
      'Use ownership when a delivery crosses unclear boundaries or a problem could otherwise wait between teams. Taking initiative builds momentum, but overreach can bypass customer authority or create dependence, so clarify decision rights, invite the proper owners, and transfer recurring responsibility once the path is established.',
    ],
    whyItMatters: 'Customers experience the delivered outcome, not the internal boundary between engineering, security, data, and operations. End-to-end ownership prevents important gaps from becoming someone else\'s problem while still building the customer capability required for sustainable operation.',
    useCases: [
      'Driving resolution when no team owns the quality of a shared customer dataset',
      'Following a production issue through containment, communication, correction, and prevention',
      'Finding a customer operator to own a workflow before an otherwise complete pilot launches',
    ],
    workedExample: {
      scenario: 'During a billing analytics engagement, I discover that no team owns reconciliation between the source ledger and the new warehouse.',
      steps: [
        'I quantify the gap by sampling 10,000 records and show that 4.6 percent of invoices have mismatched status.',
        'I convene finance, data platform, and application owners, map where the status diverges, and obtain agreement that finance owns the business rule while data platform owns the check.',
        'I implement the first reconciliation report with a customer engineer and add a release gate at 0.5 percent unexplained mismatch.',
        'I transfer the dashboard and weekly review to named customer owners after they lead two consecutive cycles.',
      ],
      code: {
        language: 'Text',
        code: `Gap: 4.6% invoice-status mismatch
Business rule owner: Finance operations
Control owner: Data platform
Release gate: <0.5% unexplained mismatch
Transfer evidence: 2 customer-led review cycles`,
      },
      result: 'I help reduce unexplained mismatches from 4.6 percent to 0.3 percent in three weeks, unblock finance acceptance, and leave the control owned by the customer rather than by the FDE team.',
    },
    interview: {
      prompt: 'Tell me about a time you took ownership beyond your assigned scope.',
      answer: 'I found a 4.6 percent invoice-status mismatch that had no cross-system owner and would have invalidated our analytics pilot. I measured the failure, brought finance and platform owners together, paired with a customer engineer on a reconciliation control, and established a 0.5 percent release gate. We reached 0.3 percent in three weeks, finance approved the pilot, and customer teams led the next two control reviews without me.',
    },
  },
  Conflict: {
    explanation: [
      'Constructive conflict separates people from the technical or delivery disagreement, makes each concern and underlying interest explicit, and uses shared goals plus evidence to evaluate options. Listen for the constraint behind a position, restate it fairly, define decision authority, and disagree directly enough that important risk is not hidden by politeness.',
      'Use this approach when customer and delivery teams disagree on scope, architecture, quality, ownership, or urgency. Seeking consensus can delay necessary decisions and forceful escalation can damage trust, so choose a process proportional to the stakes and accept a clear accountable decision after material dissent is recorded.',
    ],
    whyItMatters: 'FDE engagements combine expertise from organizations with different incentives and information. Resolving disagreement without suppressing it improves decisions, preserves working relationships, and prevents unresolved tension from resurfacing as slow execution or passive resistance.',
    useCases: [
      'Resolving disagreement between security and operations about pilot access controls',
      'Challenging a customer sponsor who wants to automate a workflow before evaluation is adequate',
      'Mediating two engineering teams that each expect the other to own an integration adapter',
    ],
    workedExample: {
      scenario: 'A customer product lead wants automated case closure, while the compliance lead believes every recommendation requires manual review.',
      steps: [
        'I meet each lead separately to learn that product needs a 30 percent backlog reduction while compliance must prevent closure of regulated cases.',
        'I restate both interests in a joint session and replace the binary positions with a risk-tiered decision table using six months of case data.',
        'I propose automatic closure only for two low-risk categories above a confidence threshold, with audit sampling and an immediate kill switch.',
        'I ask the compliance lead, who owns the risk decision, to approve a four-week experiment with explicit stop criteria.',
      ],
      code: {
        language: 'Text',
        code: `Low-risk + high confidence: Auto-close; 10% audit sample
Regulated or low confidence: Human review
Stop: Any regulated false closure
Decision owner: Compliance lead`,
      },
      result: 'I turn a stalled all-or-nothing debate into an approved experiment that reduces the low-risk backlog by 34 percent with zero regulated false closures in 1,200 cases.',
    },
    interview: {
      prompt: 'Tell me about a conflict with a customer stakeholder and how you resolved it.',
      answer: 'A product lead wanted automated closure while compliance wanted universal review. I interviewed both, surfaced the backlog and regulatory interests behind their positions, and used six months of data to define a risk-tiered experiment. Compliance approved the guardrails; over 1,200 cases we cut the low-risk backlog by 34 percent with zero regulated false closures, and both leads adopted the decision table for expansion.',
    },
  },
  Ambiguity: {
    explanation: [
      'Operating in ambiguity means converting incomplete goals and uncertain constraints into the next reversible learning step. Frame what is known, list assumptions by consequence, identify the uncertainty that most changes the plan, and design a time-boxed probe whose evidence will support a decision.',
      'Use this approach early in new domains, with sparse customer data, or when stakeholders describe symptoms rather than outcomes. Excess analysis delays learning, but premature commitment can lock in the wrong problem, so bound exploration with a decision date and prefer experiments that preserve multiple future options.',
    ],
    whyItMatters: 'FDEs are often engaged before requirements, data, or ownership are settled. Structured ambiguity reduction creates momentum without disguising uncertainty and directs scarce engineering effort toward evidence that changes the delivery plan.',
    useCases: [
      'Starting discovery when a customer asks broadly to improve operational efficiency',
      'Testing whether available data can support a requested prediction before designing the platform',
      'Choosing a pilot workflow when several business units describe conflicting needs',
    ],
    workedExample: {
      scenario: 'A mining customer asks me to use AI to reduce downtime but cannot identify which failures are predictable or whether maintenance records are reliable.',
      steps: [
        'I interview maintenance and operations leads and rank three downtime categories by cost, frequency, available signals, and decision lead time.',
        'I select conveyor bearing failure as the highest-value uncertainty and time-box a five-day data-quality and predictability spike.',
        'I build a baseline against twelve months of sensor and maintenance data, documenting missing labels and the lead time operators can act on.',
        'I use the evidence to recommend a narrow monitoring pilot and explicitly stop work on two categories without usable labels.',
      ],
      code: {
        language: 'Text',
        code: `Decision: Which failure mode merits a pilot?
Probe: 5 days; baseline predictability and actionable lead time
Proceed: Precision >=75% at >=4 hours lead time
Evidence: 12 months sensor and maintenance history`,
      },
      result: 'I reduce a broad AI request to one actionable pilot, demonstrate 79 percent precision at six hours of lead time, and avoid an estimated six weeks of platform work for unmeasurable use cases.',
    },
    interview: {
      prompt: 'Tell me about a time you made progress with an ambiguous customer problem.',
      answer: 'A mining customer wanted AI to reduce downtime but had no selected failure mode or trusted labels. I ranked three categories with operators, ran a five-day predictability spike on the highest-value case, and set a go threshold before modeling. The baseline reached 79 percent precision at six hours of lead time, so we launched one focused pilot and avoided roughly six weeks of work on two cases the data could not support.',
    },
  },
  Failure: {
    explanation: [
      'A strong failure practice acknowledges the gap between intended and actual results, contains harm, and examines the system of assumptions, decisions, controls, and signals that allowed it. The owner should state their contribution precisely, gather evidence without blame, make corrective actions testable, and verify that those actions change future behavior.',
      'Use this approach after missed outcomes, incidents, rejected designs, or experiments that invalidate a hypothesis. Fast learning does not excuse avoidable harm, and a retrospective can become ritualized, so distinguish an acceptable experiment from negligence and assign owners and effectiveness checks to a small number of high-leverage changes.',
    ],
    whyItMatters: 'Customer trust depends on how the delivery team responds when reality contradicts its plan. Transparent accountability and verified prevention turn failure into improved judgment, while defensiveness or vague lessons allow the same mechanism to damage the next engagement.',
    useCases: [
      'Reviewing why a pilot metric failed despite positive offline evaluation',
      'Owning a release that disrupted a customer workflow and strengthening rollout controls',
      'Stopping an experiment whose core data assumption proved false and redirecting effort',
    ],
    workedExample: {
      scenario: 'I approve a recommendation-model pilot using historical validation, but the first live week produces many duplicate alerts and operator trust falls sharply.',
      steps: [
        'I pause new alerts within 30 minutes, tell the customer what I know, and preserve events for analysis instead of blaming user configuration.',
        'I identify that I failed to test repeated source events and that our offline dataset had already deduplicated them.',
        'I add idempotent event handling, a duplicate-rate guardrail, and a replay test built from the production event pattern.',
        'I rerun a one-team pilot and review trust and override measures with operators before expanding again.',
      ],
      code: {
        language: 'Text',
        code: `Failure mechanism: Repeated source events bypassed offline evaluation
My miss: No raw-event replay test
Controls: Idempotency key; duplicate guardrail <0.5%; replay fixture
Re-entry: One team for 2 weeks`,
      },
      result: 'I reduce duplicate alerts from 18 percent to 0.2 percent, restore weekly active use from 46 percent to 84 percent in three weeks, and add raw-event replay to every later integration review.',
    },
    interview: {
      prompt: 'Tell me about a failure and what you changed afterward.',
      answer: 'I approved a pilot whose offline data hid repeated source events, and live duplicate alerts drove weekly active use down to 46 percent. I paused the flow, owned the missing raw-event test, implemented idempotency plus a 0.5 percent guardrail, and reran with one team. Duplicates fell from 18 percent to 0.2 percent and usage recovered to 84 percent; I then made raw-event replay a required integration gate.',
    },
  },
  Feedback: {
    explanation: [
      'Effective feedback describes an observed behavior, its specific impact, and a clear request or question while leaving room for context the giver may not know. Deliver it near the event, choose a setting appropriate to sensitivity, listen to the response, and agree on an observable follow-up rather than judging identity or intent.',
      'Use feedback to reinforce useful behavior, correct delivery risks, and improve collaboration across customer and internal teams. Directness without care creates defensiveness, while softened hints create ambiguity, so ground the conversation in evidence, connect it to shared outcomes, and adapt for power differences and cultural context.',
    ],
    whyItMatters: 'FDE teams operate under pressure where small communication and execution habits compound quickly. Timely, actionable feedback protects customer outcomes and develops stronger collaborators without waiting for a formal review after the opportunity to improve has passed.',
    useCases: [
      'Helping an engineer stop overloading customer demos with unverified claims',
      'Asking a customer lead to provide decisions rather than reopening agreed scope in every meeting',
      'Reinforcing an operator who surfaced a data-quality problem early and with evidence',
    ],
    workedExample: {
      scenario: 'A teammate repeatedly answers customer questions with confident delivery dates before checking dependencies, creating conflicting commitments.',
      steps: [
        'I collect two recent examples and speak privately the same day, describing the statements and the resulting planning confusion.',
        'I ask for their perspective and learn they are trying to maintain customer confidence during uncertain discussions.',
        'I propose language that separates an estimate from a commitment and a rule that dependency owners must confirm dates before either of us commits.',
        'I observe the next three customer meetings and recognize the improved behavior while correcting one remaining ambiguous estimate.',
      ],
      code: {
        language: 'Text',
        code: `Observed: Two dates stated before dependency confirmation
Impact: Customer planned training against incompatible dates
Request: Label estimates; confirm owners before commitment
Check: Review next 3 customer meetings`,
      },
      result: 'I help eliminate conflicting date commitments over the next month, and the customer reports zero schedule corrections compared with four in the prior month.',
    },
    interview: {
      prompt: 'Tell me about difficult feedback you gave to a teammate.',
      answer: 'A teammate twice gave delivery dates before dependency owners confirmed them, which led the customer to schedule training against incompatible plans. I shared the two examples privately, learned they were trying to project confidence, and agreed on language for estimates plus a confirmation rule. Across the next three meetings the behavior changed, and customer schedule corrections fell from four that month to zero the following month.',
    },
  },
  'Leadership without authority': {
    explanation: [
      'Leadership without authority moves a group through credibility, shared purpose, useful structure, and voluntary commitments rather than formal control. Understand each stakeholder\'s incentives, contribute evidence and work before asking for support, make the path easy to join, and create visible ownership so progress does not depend on personal persuasion forever.',
      'Use it when customer delivery spans peers, vendors, customer executives, or platform teams outside your reporting line. Influence can align distributed expertise, but private coalition-building can feel manipulative and charisma does not replace governance, so keep tradeoffs transparent and route final decisions to legitimate owners.',
    ],
    whyItMatters: 'FDEs rarely command every resource needed for an outcome. The ability to align people across boundaries determines whether a strong technical solution receives data, approvals, operational support, and lasting customer ownership.',
    useCases: [
      'Aligning security, platform, and operations teams around a shared pilot path',
      'Creating a cross-team data-quality working group without managing its members',
      'Persuading customer engineers to adopt a common deployment standard through evidence and enablement',
    ],
    workedExample: {
      scenario: 'Four customer teams own parts of an order data pipeline, but none reports to the program sponsor and recurring quality failures have no joint priority.',
      steps: [
        'I quantify that schema drift caused 31 percent of pilot incidents and interview each team about its local incentives and constraints.',
        'I publish a one-page proposal for a shared contract test, contribute the first test harness, and ask each team for one named owner.',
        'I run a two-week working session where teams add their own critical fields and agree that the platform council owns contract changes.',
        'I make pass rates visible in the existing deployment dashboard and step back after customer owners lead two releases.',
      ],
      code: {
        language: 'Text',
        code: `Shared problem: Schema drift = 31% of pilot incidents
My contribution: Initial contract-test harness
Commitment: One owner and critical fields per team
Governance: Platform council approves contract changes`,
      },
      result: 'I align four teams without reporting authority, raise contract-test coverage from zero to 93 percent of critical fields, and reduce schema-related incidents from 13 to 2 in the next six releases.',
    },
    interview: {
      prompt: 'Tell me about a time you led people you did not manage.',
      answer: 'Four customer teams owned an unreliable data pipeline, and none had authority over the others. I showed that schema drift caused 31 percent of pilot incidents, built the first contract-test harness, and asked each team to contribute an owner and critical fields under platform-council governance. Coverage reached 93 percent and schema incidents fell from 13 to 2 over six releases; customer owners then ran the process without me.',
    },
  },
  'Ethical judgment': {
    explanation: [
      'Ethical judgment identifies who may benefit or be harmed by a system, tests whether data and decisions are legitimate for the intended use, and preserves meaningful human accountability. Examine consent, privacy, security, disparate effects, explainability, reversibility, and avenues for appeal, then document constraints and refuse deployment when safeguards cannot reduce unacceptable harm.',
      'Use this reasoning before and during delivery of systems that influence access, employment, health, finance, safety, or surveillance. Principles can conflict and metrics cannot encode every value, so involve affected domain experts, analyze outcomes by relevant groups, choose conservative controls under uncertainty, and escalate decisions to accountable customer governance.',
    ],
    whyItMatters: 'Technical feasibility and customer demand do not make a use case responsible. FDEs are close enough to real workflows to detect harm that abstract requirements miss, and they must protect affected people, customer trust, and the long-term legitimacy of the delivered system.',
    useCases: [
      'Challenging the use of employee activity data for individual performance scoring',
      'Adding human review and appeal to a model that prioritizes access to a constrained service',
      'Refusing to reuse customer data for a purpose outside its consent and retention terms',
    ],
    workedExample: {
      scenario: 'A staffing customer asks me to rank applicants using historical hiring outcomes that reflect large demographic differences.',
      steps: [
        'I pause ranking work and quantify selection-rate and error differences across legally and operationally relevant groups with privacy review.',
        'I show that the requested target reproduces prior decisions rather than job performance and document the risk to applicants and the customer.',
        'I propose a narrower tool that extracts job-relevant qualifications for human review, excludes protected attributes and proxies, and logs reasons for decisions.',
        'I require legal and responsible-use approval, subgroup evaluation thresholds, and an applicant appeal path before any pilot.',
      ],
      code: {
        language: 'Text',
        code: `Rejected use: Automated ranking from historical hiring outcome
Allowed pilot: Qualification extraction for human review
Controls: Proxy review, subgroup evaluation, reason log, appeal path
Authority: Legal and responsible-use approval required`,
      },
      result: 'I stop the automated ranking design before applicant exposure, secure approval for an assistive workflow, and the pilot reduces recruiter review time by 28 percent without making autonomous selection decisions.',
    },
    interview: {
      prompt: 'Tell me about a time you challenged a customer request on ethical grounds.',
      answer: 'A staffing customer asked me to rank applicants from historical hiring outcomes. I showed that the label reproduced prior selection decisions and had material group disparities, so I paused that design and escalated it to legal and responsible-use owners. I proposed qualification extraction with human review, reason logging, subgroup checks, and appeal. The approved pilot cut review time by 28 percent while keeping selection accountable to people.',
    },
  },
  Impact: {
    explanation: [
      'Impact is the attributable change a delivery creates for customers, users, operations, or risk, measured against a credible baseline. Define the value mechanism, instrument leading and lagging indicators, compare with a counterfactual or prior state where possible, and include quality and guardrail measures so gains in speed or cost do not conceal transferred harm.',
      'Use impact measurement to prioritize work, assess pilots, justify scaling, and learn whether adoption produced the expected result. Attribution becomes difficult when many changes occur together and short windows favor immediate metrics, so state confidence honestly, triangulate quantitative and qualitative evidence, and continue measuring effects that emerge later.',
    ],
    whyItMatters: 'Impact closes the loop between delivery activity and customer value. It helps teams invest in capabilities that change real outcomes, stop work that does not, and communicate results without inflating feature counts or claiming causality the evidence cannot support.',
    useCases: [
      'Comparing pilot teams with a similar non-pilot group before recommending expansion',
      'Measuring whether faster case handling preserves accuracy and customer satisfaction',
      'Quantifying avoided incident time after adding automated detection and an operator workflow',
    ],
    workedExample: {
      scenario: 'I deliver a maintenance-triage workflow for a rail operator and need to determine whether it merits network-wide expansion.',
      steps: [
        'I establish an eight-week baseline for triage time, repeat visits, service delay, and safety escalations in two comparable depots.',
        'I launch in one depot, keep the second as a comparison, and verify adoption and data quality before interpreting operational results.',
        'I compare adjusted changes across both depots and interview dispatchers to test whether another process change explains the difference.',
        'I present the efficiency gain with confidence limits, unchanged safety guardrails, and the cost and instrumentation needed to scale.',
      ],
      code: {
        language: 'Text',
        code: `Primary: Median triage time, pilot vs comparison depot
Quality: Repeat visit rate
Guardrail: Safety escalations and service delay
Adoption: Weekly active dispatchers and workflow completion`,
      },
      result: 'I demonstrate a 37 percent reduction in median triage time versus 6 percent at the comparison depot, with repeat visits and safety escalations unchanged, supporting a funded four-depot expansion.',
    },
    interview: {
      prompt: 'Tell me about the impact of a customer solution you delivered.',
      answer: 'I delivered maintenance triage at one rail depot after establishing an eight-week baseline and a comparable non-pilot depot. Median triage time fell 37 percent versus 6 percent in the comparison site, while repeat visits and safety escalations stayed flat. I validated that dispatchers actually used the workflow and reported the attribution limits, and the evidence secured funding for four more depots.',
    },
  },
} satisfies Record<string, FdeLessonDetails>