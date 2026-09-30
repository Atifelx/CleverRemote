import type { FdeLessonDetails } from './fde-core-lesson-types'

export const fdePlatformLessonDetails = {
  'Regions and zones': {
    explanation: [
      'A cloud region is a geographic area containing multiple isolated availability zones, while a zone is a separate failure domain with independent power, cooling, and networking. Distributing stateless instances and replicated data across zones lets a service continue when one datacenter fails without requiring traffic to cross a large geographic distance.',
      'Use multiple zones for high availability inside one region and multiple regions when requirements include regional disasters, data residency, or lower latency for distant users. Each added location increases replication lag, data-transfer cost, deployment complexity, and the chance of inconsistent configuration, so the topology should follow explicit recovery and locality goals rather than a desire for maximum distribution.',
    ],
    whyItMatters: 'Region and zone choices define which infrastructure failures an application can survive and where its data is allowed to live. A sound design connects those choices to measurable availability, latency, compliance, and recovery requirements.',
    useCases: [
      'Running API replicas across three zones so one datacenter outage does not stop checkout',
      'Keeping customer records in a required geography while serving static assets from nearby regions',
      'Maintaining a warm secondary region for a service with a strict regional recovery target',
    ],
    workedExample: {
      scenario: 'An order API must tolerate a zone failure and recover from a full regional outage within four hours with at most one hour of lost data.',
      steps: [
        'Deploy load-balanced stateless API replicas across three zones and place the primary database on a zone-redundant configuration.',
        'Copy encrypted database backups to a second region every hour and provision the minimum networking and configuration needed to restore there.',
        'Run a recovery exercise that restores the latest backup, redirects test traffic, and measures both data loss and elapsed recovery time.',
      ],
      result: 'A zone outage is absorbed automatically, while the tested regional procedure demonstrates a recovery point of at most one hour and a recovery time below four hours.',
    },
    interview: {
      prompt: 'Does deploying an application across three availability zones protect it from every regional failure?',
      answer: 'No. Zones isolate many datacenter-level failures, but they still share a region and can be affected by regional control-plane, network, or disaster events. Regional resilience requires a separate region, replicated or recoverable data, independent dependencies, traffic failover, and a tested procedure. That extra protection should be justified by recovery objectives because it adds cost and consistency complexity.',
    },
  },
  'Compute choice': {
    explanation: [
      'Compute options expose different levels of control. Functions execute short event-driven work with platform-managed scaling, containers package a long-running process with its dependencies, and virtual machines expose the operating system for workloads that need custom kernels, agents, or legacy installation patterns.',
      'Choose from workload duration, startup sensitivity, state, resource shape, scaling pattern, and the operations the team can own. More managed compute reduces patching and capacity work but can impose runtime limits, cold starts, and platform constraints; more direct control improves compatibility and tuning while increasing security, scaling, and maintenance responsibility.',
    ],
    whyItMatters: 'The compute model affects reliability, delivery speed, cost, and how much infrastructure the team must operate. Matching it to the workload prevents both unnecessary operational burden and painful platform limitations.',
    useCases: [
      'Using a function for a short image resize triggered by an object upload',
      'Running an HTTP API and queue worker as independently scalable containers',
      'Choosing a virtual machine for licensed software that requires operating-system installation and a persistent local agent',
    ],
    workedExample: {
      scenario: 'A team needs nightly cleanup, a continuously available customer API, and a vendor reporting engine that requires a system driver.',
      steps: [
        'Classify the cleanup as short scheduled work, the API as a long-running portable service, and the reporting engine as an operating-system-dependent workload.',
        'Run cleanup as a scheduled function, package the API as a container, and isolate the reporting engine on a patched virtual machine.',
        'Load-test startup and scaling behavior, then record ownership for function limits, container health, and virtual-machine patching.',
      ],
      result: 'Each workload receives enough control without forcing the team to manage virtual machines for components that can use higher-level compute.',
    },
    interview: {
      prompt: 'How would you choose between functions, containers, and virtual machines for a new worker?',
      answer: 'I would start with event frequency, execution duration, startup latency, state, resource needs, and required system access. Functions fit bounded event work, containers fit portable long-running workers, and virtual machines fit workloads needing operating-system control. I would also compare scaling behavior, observability, lock-in, and total operational cost rather than choosing from request volume alone.',
    },
  },
  'Storage choice': {
    explanation: [
      'Storage systems optimize for different access patterns. Relational databases provide transactions and queryable relationships, key-value stores provide predictable lookup by key, object stores hold durable blobs and large immutable files, and block storage presents a low-level disk to one or more compute instances.',
      'Select storage from data shape, read and write paths, consistency, query needs, retention, growth, and recovery requirements. Specialized stores can improve scale or cost, but every additional engine adds operational knowledge and cross-store consistency problems, so one adequate store is often better than several theoretically optimal ones.',
    ],
    whyItMatters: 'A storage decision becomes difficult to reverse once data and access patterns accumulate. Choosing from explicit invariants and workload behavior protects correctness while keeping performance and operating cost predictable.',
    useCases: [
      'Keeping orders and payments in a relational database so a transaction can preserve financial invariants',
      'Storing uploaded contracts in object storage and searchable contract metadata in a database',
      'Using a key-value store for low-latency session lookup by an opaque session identifier',
    ],
    workedExample: {
      scenario: 'A document platform stores multi-megabyte PDFs, supports metadata filtering, and must preserve a durable link between each file and its owner.',
      steps: [
        'Store PDF bytes in versioned object storage and assign each uploaded object an immutable identifier.',
        'Write owner, object identifier, checksum, status, and searchable fields to a relational database using a pending-to-ready workflow.',
        'Reconcile pending records and orphaned objects after failures, and test restoration of both the database and object versions.',
      ],
      result: 'Large files use economical blob storage while relational metadata supports filtering and ownership checks without pretending that two stores share one transaction.',
    },
    interview: {
      prompt: 'Why not place every kind of application data in the storage service with the highest benchmark throughput?',
      answer: 'Throughput is only one constraint. The system must preserve required transactions, support actual query shapes, meet consistency and recovery goals, and remain operable by the team. A fast store with weak query or transaction support can push correctness into application code, while multiple specialized stores create synchronization and recovery work.',
    },
  },
  'Virtual networking': {
    explanation: [
      'Virtual networks divide address space into subnets and use routes, firewalls, security groups, gateways, and name resolution to control how workloads communicate. Private endpoints give a managed service an address reachable through the private network, reducing dependence on a public ingress path.',
      'Use network boundaries to limit reachable paths between public entry points, application tiers, data services, and administration surfaces. Segmentation reduces blast radius, but excessive subnet and rule complexity can cause brittle deployments and difficult diagnosis; identity and application authorization remain necessary because network location alone is not trust.',
    ],
    whyItMatters: 'Networking determines which components can exchange traffic before application code evaluates a request. Deliberate routes and boundaries remove unnecessary exposure and make allowed communication easier to audit.',
    useCases: [
      'Exposing a load balancer publicly while keeping application instances and databases on private subnets',
      'Allowing a worker subnet to reach a queue but not the administrative database endpoint',
      'Connecting an office network to cloud services through a controlled private gateway',
    ],
    workedExample: {
      scenario: 'A public API currently connects to a database through its internet endpoint, even though both run in the same cloud environment.',
      steps: [
        'Place API instances in a private application subnet and create a private database endpoint with internal name resolution.',
        'Permit database traffic only from the application subnet on the required port and remove the database public ingress rule.',
        'Test API access, blocked access from an unrelated subnet, DNS resolution, and an operational recovery path before rollout.',
      ],
      result: 'The API reaches the database over a constrained private path, while direct internet and unrelated subnet access are denied.',
    },
    interview: {
      prompt: 'If a database has no public endpoint, is authorization inside the application still necessary?',
      answer: 'Yes. Private networking reduces who can reach the service, but compromised workloads, configuration mistakes, and insiders may already be inside that boundary. The database and application still need authenticated identities, least-privilege permissions, tenant checks, encryption, and audit records. Network controls are one layer rather than proof of trust.',
    },
  },
  'Cloud identity': {
    explanation: [
      'Cloud identity assigns a verifiable principal to a person, service, or workload and lets policy grant that principal specific actions. A workload identity obtains short-lived credentials from the execution environment, so application code can call another service without storing a reusable key in source or configuration.',
      'Prefer workload identity for service-to-service access and federation for external automation when the platform supports them. Short-lived credentials reduce theft and rotation risk, but identity mappings, token audiences, and permissions still require careful design; static credentials may be unavoidable for older systems and then need strict scope, storage, rotation, and monitoring.',
    ],
    whyItMatters: 'Identity is the durable basis for deciding who performed an action and what they may do. Removing shared long-lived credentials improves both containment and attribution across automated systems.',
    useCases: [
      'Giving an application instance identity permission to read one secrets collection',
      'Federating a CI job to deploy without storing a cloud access key in the repository',
      'Assigning separate identities to web and worker components so their permissions differ',
    ],
    workedExample: {
      scenario: 'An invoice worker currently reads a storage account key from an environment variable shared by several services.',
      steps: [
        'Assign the worker its own runtime identity and grant it read access only to the invoice input container.',
        'Change the storage client to request a short-lived token from the runtime identity provider instead of reading the shared key.',
        'Deploy, verify allowed reads and denied writes, then revoke the shared key after confirming no other workload depends on it.',
      ],
      result: 'The worker authenticates without a reusable secret, and compromise of its identity does not grant write access or access to unrelated storage.',
    },
    interview: {
      prompt: 'What security benefit does workload identity provide beyond moving an API key to a different configuration field?',
      answer: 'It replaces a copied long-lived secret with short-lived credentials issued to a specific runtime principal. Policy can scope that principal, logs can attribute its actions, and access can be revoked centrally without distributing a replacement key. It does not remove the need to validate permissions and token scope, but it reduces secret exposure and rotation burden.',
    },
  },
  'Managed services': {
    explanation: [
      'A managed service delegates responsibilities such as host provisioning, patching, backups, failover, and some monitoring to a provider while the application consumes a database, queue, cache, or similar capability through an interface. The customer still owns data design, access policy, capacity choices, application behavior, and verification of recovery.',
      'Managed services are valuable when operational maturity or staffing is more constrained than platform cost, especially for stateful systems. They trade low-level control and some portability for faster delivery and standardized operations; limits, pricing, regional availability, migration paths, and shared-responsibility boundaries should be examined before adoption.',
    ],
    whyItMatters: 'Delegating undifferentiated infrastructure work lets a team spend more time on product behavior, but misunderstood ownership can leave backups, capacity, or security untested. The decision should compare total operational burden, not only hourly price.',
    useCases: [
      'Choosing a managed relational database so a small team does not operate replication and patching',
      'Using a managed queue with dead-lettering instead of maintaining a broker cluster',
      'Rejecting a managed cache whose item-size limit conflicts with a required workload',
    ],
    workedExample: {
      scenario: 'A five-person team needs durable asynchronous job delivery but has no capacity to patch and fail over a broker cluster.',
      steps: [
        'Document delivery, retention, ordering, throughput, security, and recovery requirements before comparing queue services.',
        'Select a managed queue that meets those requirements and configure identity access, dead-lettering, alerts, and capacity limits.',
        'Test duplicate delivery, consumer failure, backlog recovery, and export or migration procedures rather than assuming the service removes those concerns.',
      ],
      result: 'The team avoids broker infrastructure while retaining explicit ownership of message semantics, permissions, monitoring, and failure handling.',
    },
    interview: {
      prompt: 'What responsibilities remain with an application team after it adopts a managed database?',
      answer: 'The team still owns schema and query design, data classification, identity and network access, capacity selection, application retries, observability, retention, and recovery validation. The provider may operate hosts and automated backups, but the team must verify that backup scope and restore time satisfy its requirements and understand service limits and failure modes.',
    },
  },
  Autoscaling: {
    explanation: [
      'Autoscaling changes the number or size of compute instances from measured demand. A useful scaling signal represents pressure the workload can relieve, such as request concurrency, queue age, or pending jobs, while minimums, maximums, cooldowns, and stabilization windows prevent unsafe or oscillating decisions.',
      'Use autoscaling for variable workloads whose instances can start quickly and share little local state. It improves utilization and responsiveness but cannot compensate for a saturated database, slow startup, or serial bottleneck; aggressive rules can amplify downstream load and cost, so capacity tests and backpressure must accompany scaling policy.',
    ],
    whyItMatters: 'Demand rarely stays constant, and manual capacity changes arrive too late for short spikes. Scaling from the right signal protects user experience and cost without hiding architectural bottlenecks.',
    useCases: [
      'Scaling HTTP replicas from request concurrency during a ticket release',
      'Scaling workers from oldest queue message age when processing falls behind',
      'Maintaining a nonzero minimum for a latency-sensitive service with slow startup',
    ],
    workedExample: {
      scenario: 'A document worker spends most of its time waiting on an external API, so CPU remains low while queued documents become hours old.',
      steps: [
        'Measure queue depth, oldest-message age, processing duration, external API limits, and startup time under representative load.',
        'Scale on oldest-message age with minimum and maximum worker counts, a gradual scale-out rule, and a conservative cooldown for scale-in.',
        'Load-test the policy while enforcing API concurrency limits and alert when backlog age remains high at maximum capacity.',
      ],
      result: 'Worker count responds to customer-visible delay rather than misleading CPU usage without overwhelming the external API.',
    },
    interview: {
      prompt: 'Why can CPU be a poor autoscaling signal for a queue consumer?',
      answer: 'A consumer may wait on databases or external APIs, leaving CPU low even as work accumulates. Queue age or backlog per healthy worker often represents demand more directly. The policy must still account for processing time, startup delay, poison messages, downstream limits, and maximum cost so scaling relieves pressure instead of moving it elsewhere.',
    },
  },
  'Cost awareness': {
    explanation: [
      'Cloud cost is a function of allocated capacity and measured consumption, including compute time, requests, storage volume, retention, backups, logs, and data transfer. Estimation starts with workload units and growth assumptions, then maps them to pricing dimensions rather than relying on one headline service rate.',
      'Cost-aware design compares total cost with reliability, performance, security, and engineering time. Reserved capacity can reduce predictable spend but weakens flexibility, usage pricing helps bursty workloads but can surprise at scale, and aggressive savings that remove redundancy or telemetry may create greater incident cost.',
    ],
    whyItMatters: 'Architectural choices create recurring bills long after implementation. Connecting spend to workload drivers lets teams forecast, set budgets, and optimize without trading away requirements invisibly.',
    useCases: [
      'Calculating log ingestion and retention before adding a high-cardinality diagnostic field',
      'Comparing always-on containers with per-invocation compute for a low-frequency job',
      'Reducing cross-region data transfer by serving large assets near their consumers',
    ],
    workedExample: {
      scenario: 'A service emits 500 GB of debug logs per day and retains all logs for one year, causing monitoring cost to exceed compute cost.',
      steps: [
        'Break cost into daily ingestion, indexed retention, archive retention, query, and export using measured event sizes and rates.',
        'Keep security and error events searchable, sample repetitive success events, and move older low-use records to cheaper archival storage.',
        'Set a budget alert and verify that incident investigations still have the fields and retention required by response policy.',
      ],
      result: 'Monthly observability spend falls substantially while high-value operational and audit evidence remains available for its required lifetime.',
    },
    interview: {
      prompt: 'How would you estimate cloud cost for a design before production traffic exists?',
      answer: 'I would state low, expected, and high assumptions for requests, concurrency, data size, retention, transfer, and growth. I would map each workload unit to billable dimensions, include redundancy and nonproduction environments, and identify nonlinear thresholds. Then I would load-test a small deployment, monitor actual unit cost, and revise the estimate rather than presenting one false-precision number.',
    },
  },
  'Disaster recovery': {
    explanation: [
      'Disaster recovery restores service after a major failure by combining durable copies of data, replacement infrastructure, dependency plans, and traffic redirection. Recovery point objective defines acceptable data loss in time, while recovery time objective defines how long restoration may take.',
      'Backup and restore is economical for generous objectives, warm standby reduces recovery time at moderate cost, and active-active designs reduce interruption but add continuous replication, conflict, and operational complexity. The chosen strategy must cover configuration, identities, keys, queues, and external dependencies as well as the primary database.',
    ],
    whyItMatters: 'High availability handles routine component failures, but it does not guarantee recovery from corruption, regional loss, or operator error. Explicit objectives and rehearsals turn an assumed recovery capability into measured evidence.',
    useCases: [
      'Restoring a database to a point before an accidental destructive migration',
      'Starting a warm secondary region after prolonged loss of the primary region',
      'Testing whether encryption keys and infrastructure definitions are available during account recovery',
    ],
    workedExample: {
      scenario: 'A payroll service requires an RPO of 15 minutes and an RTO of two hours for regional loss.',
      steps: [
        'Replicate transaction logs to a second region within 15 minutes and store versioned infrastructure and configuration outside the primary failure boundary.',
        'Automate restoration of compute, identities, network policy, and the latest consistent database state, with a controlled traffic switch.',
        'Run a quarterly isolated recovery exercise, verify payroll totals, and record measured data loss and time to service readiness.',
      ],
      result: 'The exercise demonstrates that the complete service, not only its database, can resume within two hours with no more than 15 minutes of lost writes.',
    },
    interview: {
      prompt: 'Why is having automated backups not enough to claim a disaster recovery plan?',
      answer: 'A backup may be incomplete, corrupt, inaccessible in the failed region, or too slow to restore. Recovery also needs infrastructure, identity, networking, keys, dependent services, validation, and traffic routing. A credible plan maps those steps to RPO and RTO and proves them through regular restoration exercises.',
    },
  },
  'Container images': {
    explanation: [
      'A container image is an immutable, layered filesystem plus metadata that defines how a process starts. A deterministic build pins inputs, installs only required runtime dependencies, and produces an artifact identified by a digest so the same bytes can move through test and production.',
      'Keep runtime images small and run as a non-root user to reduce download time and attack surface, but do not remove tools required for health or certificate operation. Minimalism must remain debuggable and compatible; base images still need vulnerability monitoring and rebuilds even when application code does not change.',
    ],
    whyItMatters: 'The image is the deployable supply-chain unit for a containerized service. Reproducible and constrained images make releases easier to verify, distribute, scan, and roll back.',
    useCases: [
      'Pinning a runtime base image and promoting the built digest across environments',
      'Excluding source control metadata, local secrets, and test output with a build ignore file',
      'Running an API as an unprivileged user with only production dependencies installed',
    ],
    workedExample: {
      scenario: 'A Node.js API image contains development tools, local files, and a floating base tag, producing large and inconsistent releases.',
      steps: [
        'Pin the base by supported version or digest, define an ignore file, and separate production dependencies from build-only packages.',
        'Copy only the built application, runtime dependencies, certificates, and startup metadata into the final image and use a non-root user.',
        'Build twice from the same commit, scan the result, start it with a read-only filesystem where possible, and record its digest.',
      ],
      result: 'The release image is smaller, contains fewer vulnerable tools, and can be promoted and rolled back by immutable digest rather than a mutable tag.',
    },
    interview: {
      prompt: 'What makes a container image suitable for production beyond the fact that it starts locally?',
      answer: 'Its inputs should be pinned and reproducible, its contents limited to runtime needs, its process unprivileged, and its startup and signal handling correct. It should expose a verifiable health behavior, contain no secrets, be scanned and rebuilt for base updates, and be promoted by immutable identity so production receives the tested bytes.',
    },
  },
  'Multi-stage builds': {
    explanation: [
      'A multi-stage build uses one image stage to compile, test, or package software and a later stage to run it. The final stage copies selected artifacts rather than inheriting the compiler, source tree, package caches, and credentials used during construction.',
      'Use multiple stages when build tooling is larger or more privileged than the runtime needs. They reduce image size and attack surface, but careless copy patterns can omit runtime assets or carry unwanted files forward, and native dependencies must be compatible between build and runtime stages.',
    ],
    whyItMatters: 'Separating construction from execution preserves a rich build environment without shipping it to production. The boundary makes image contents more intentional and security review more tractable.',
    useCases: [
      'Compiling TypeScript in a builder and copying JavaScript output into a runtime stage',
      'Building a static binary with a compiler image and running it in a minimal base',
      'Generating frontend assets without shipping the package manager and source maps to the web server',
    ],
    workedExample: {
      scenario: 'A TypeScript service currently ships its compiler, test framework, source files, and development dependencies in a 900 MB image.',
      steps: [
        'Create a builder stage that installs locked dependencies, runs tests, and compiles the service into a distribution directory.',
        'Create a compatible runtime stage that installs production dependencies and copies only compiled output and required runtime assets.',
        'Start the final image in a clean environment and exercise migrations, static files, health checks, and graceful shutdown.',
      ],
      code: {
        language: 'Dockerfile',
        code: `FROM node:24-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm test && npm run build

FROM node:24-slim AS runtime
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
USER node
CMD ["node", "dist/server.js"]`,
      },
      result: 'The runtime image contains the tested output and production dependencies without carrying the compiler or test toolchain.',
    },
    interview: {
      prompt: 'Does a multi-stage build automatically guarantee a small and secure final image?',
      answer: 'No. Only the selected final stage ships, but it can still use a large or vulnerable base, install unnecessary packages, copy broad directories, or run as root. The team must inspect the final contents, pin inputs, scan dependencies, verify native compatibility, and test all required runtime assets.',
    },
  },
  'Layer caching': {
    explanation: [
      'Container builds create reusable layers from build instructions, and a changed instruction invalidates that layer plus later dependent layers. Copying stable dependency manifests and installing dependencies before copying frequently changed source lets most builds reuse the expensive installation layer.',
      'Caching speeds local and CI builds when inputs fully describe their outputs. Incorrect cache assumptions can reuse stale dependencies or leak data, while over-fragmented layers add complexity; lockfiles, explicit cache keys, trusted cache scope, and deliberate invalidation preserve correctness before speed.',
    ],
    whyItMatters: 'Fast deterministic builds shorten feedback and deployment time without changing the application. Understanding invalidation prevents teams from disabling caches whenever stale or unsafe behavior appears.',
    useCases: [
      'Installing dependencies after copying only the package manifest and lockfile',
      'Sharing a trusted build cache across CI jobs keyed by platform and dependency inputs',
      'Keeping generated output and local dependency directories outside the build context',
    ],
    workedExample: {
      scenario: 'A one-line source edit causes a ten-minute dependency installation on every CI image build.',
      steps: [
        'Inspect the build order and confirm that the whole source tree is copied before the dependency installation instruction.',
        'Copy dependency manifests first, perform the locked install, and copy application source only after that cached layer.',
        'Build once, edit one source file, build again, and verify from build logs that dependency installation is reused while source compilation reruns.',
      ],
      result: 'Normal source changes reuse the dependency layer, cutting repeat build time while lockfile changes still invalidate dependencies correctly.',
    },
    interview: {
      prompt: 'How do you improve container build caching without risking stale dependencies?',
      answer: 'I make the dependency layer depend on every file that actually controls dependency resolution, including the lockfile and relevant configuration, and use a locked install. I place volatile source later, scope remote caches to trusted builders, and verify invalidation by changing both source and dependency inputs. Cache reuse must follow declared inputs rather than elapsed time.',
    },
  },
  'Configuration and secrets': {
    explanation: [
      'Configuration supplies environment-specific values such as endpoints, feature settings, and limits at deployment or runtime, allowing one built artifact to run in several environments. Secrets are sensitive configuration values that require protected storage, restricted delivery, rotation, and redaction rather than inclusion in images or source control.',
      'Inject configuration through a validated runtime interface and resolve secrets from a secret manager or mounted credential mechanism. Runtime injection improves artifact reuse and rotation, but missing or malformed values can fail late; validate required settings at startup, distinguish secret from nonsecret data, and avoid exposing either through logs or diagnostic endpoints.',
    ],
    whyItMatters: 'Separating environment data from the artifact keeps releases reproducible and prevents credentials from spreading through source, build caches, and registries. Explicit validation also turns configuration mistakes into fast, understandable failures.',
    useCases: [
      'Using the same image with different API endpoints and concurrency limits in test and production',
      'Mounting a database credential from a secret store and rotating it without rebuilding the image',
      'Rejecting startup when a required region or queue name is absent',
    ],
    workedExample: {
      scenario: 'A service image contains a production database password and environment-specific URL in a committed configuration file.',
      steps: [
        'Remove the file from the image and history, rotate the exposed password, and classify remaining settings as secret or nonsecret.',
        'Deliver the URL through deployment configuration and grant the workload identity access to retrieve only its database secret at runtime.',
        'Validate both values during startup, redact connection details from logs, and test credential rotation while instances overlap.',
      ],
      result: 'One immutable image runs across environments, and the database credential can be scoped and rotated without rebuilding or exposing it in the registry.',
    },
    interview: {
      prompt: 'Why is putting a secret in an environment variable not a complete secret-management strategy?',
      answer: 'An environment variable is only a delivery mechanism. The secret still needs protected storage, controlled issuance, least-privilege access, rotation, auditing, and redaction from process inspection, crash reports, and logs. Where supported, short-lived workload identity is preferable because it avoids delivering a reusable secret at all.',
    },
  },
  'Local composition': {
    explanation: [
      'Local composition declares the services, networks, volumes, ports, configuration, and health dependencies needed to run a system on one development machine. It gives developers a repeatable way to start an API with supporting databases, queues, or caches while preserving service boundaries used in deployment.',
      'Use composition for development integration and onboarding, not as proof that production orchestration behavior is correct. Local dependencies improve fidelity but consume resources and can drift from managed production services; pin versions, use disposable test data, document intentional differences, and keep a fast path for focused component work.',
    ],
    whyItMatters: 'A reproducible local environment reduces setup variance and makes cross-service behavior easier to exercise before CI. Clear boundaries also prevent undocumented laptop state from becoming a hidden requirement.',
    useCases: [
      'Starting an API, relational database, and queue with one versioned definition',
      'Creating an isolated named volume for disposable integration-test data',
      'Using dependency health checks so the API waits for database readiness rather than process creation',
    ],
    workedExample: {
      scenario: 'New developers manually install a database and queue, and the API often starts before either dependency is ready.',
      steps: [
        'Define pinned database, queue, and API services on a private local network with explicit ports and development-only credentials.',
        'Add dependency health checks and make API startup wait for healthy services while keeping application retries for later failures.',
        'Run the stack from a clean machine, execute an end-to-end job, destroy volumes, and repeat to verify reproducibility.',
      ],
      result: 'Developers can reproduce the integration environment with one command, and startup sequencing depends on readiness rather than arbitrary delays.',
    },
    interview: {
      prompt: 'What is the difference between a service being started and being ready in a local composition?',
      answer: 'Started means the process or container exists; ready means it can satisfy the dependency contract, such as accepting authenticated queries after migrations or recovery. Composition should use health-based dependency conditions where available, and the application should still retry transient loss because readiness at startup does not guarantee permanent availability.',
    },
  },
  'CI/CD pipeline': {
    explanation: [
      'A continuous integration and delivery pipeline converts a source revision into a verified artifact through repeatable build, test, security, and packaging stages, then promotes that artifact through environments. Recording source revision, dependency inputs, test evidence, and artifact digest creates provenance for what was released.',
      'Build once and promote the same immutable artifact so later environments do not receive untested bytes. More gates reduce some risks but lengthen feedback and can become ceremonial; parallelize independent checks, reserve slow tests for appropriate stages, protect production approvals, and automate routine evidence instead of rebuilding by hand.',
    ],
    whyItMatters: 'A pipeline makes release quality and identity repeatable rather than dependent on a developer workstation. It also provides the audit trail and rapid feedback needed to ship small changes safely.',
    useCases: [
      'Running lint, unit tests, and dependency checks for every proposed change',
      'Building a container once and promoting its digest from staging to production',
      'Requiring an explicit approval for a production database migration after automated validation',
    ],
    workedExample: {
      scenario: 'A team rebuilds its container separately for staging and production, so the production image can contain newer dependencies than the tested image.',
      steps: [
        'Build the image once from the reviewed commit, run tests and scans against it, and publish it under an immutable digest.',
        'Deploy that digest to staging, execute integration and migration checks, and attach results to the release record.',
        'Promote the identical digest to production after approval and record deployment status and rollback target.',
      ],
      result: 'Production receives the exact bytes tested in staging, with traceable evidence from source revision through deployment.',
    },
    interview: {
      prompt: 'Why should a delivery pipeline promote one artifact instead of rebuilding for each environment?',
      answer: 'A rebuild can resolve different dependencies, use a changed base image, or run under different tooling, so staging evidence no longer describes production bytes. Runtime configuration should vary by environment, but the artifact should retain one immutable identity. Promotion preserves provenance and makes rollback to a known digest straightforward.',
    },
  },
  'Progressive rollout': {
    explanation: [
      'A progressive rollout sends a limited portion of users or traffic to a new version before broad exposure. Canary delivery changes traffic weight gradually, while blue-green delivery prepares a parallel environment and switches traffic after verification; both separate deployment from full release.',
      'Use progression when telemetry can distinguish versions and a small cohort provides meaningful evidence. It limits blast radius but adds routing, capacity, and mixed-version complexity, and rare failures may not appear in a small sample; define success metrics, observation windows, cohort rules, and stop conditions before starting.',
    ],
    whyItMatters: 'Preproduction tests cannot reproduce every data shape and dependency condition. Controlled exposure turns production release into a measured decision while preserving a fast path to stop harmful changes.',
    useCases: [
      'Sending five percent of stateless API traffic to a new release while comparing errors and latency',
      'Using a blue-green switch for a service that needs rapid traffic reversal',
      'Enabling a feature for internal tenants before expanding to customers',
    ],
    workedExample: {
      scenario: 'A revised search API changes ranking behavior and query execution, creating both correctness and latency risk.',
      steps: [
        'Deploy the new version beside the current one and label metrics by version for latency, errors, empty results, and conversion.',
        'Route five percent of eligible traffic to the new version for a defined observation window while keeping capacity for immediate reversal.',
        'Advance through 25, 50, and 100 percent only when thresholds hold, otherwise stop and return traffic to the previous version.',
      ],
      result: 'The ranking change reaches customers in bounded increments, and objective version-specific signals control expansion or reversal.',
    },
    interview: {
      prompt: 'What must be in place before a canary rollout is safer than a normal deployment?',
      answer: 'The system needs reliable traffic control, version-labeled telemetry, enough old-version capacity, predefined success and rollback thresholds, and compatibility between versions and shared data. The canary cohort must be representative enough to reveal risk, and operators need authority and automation to stop progression quickly.',
    },
  },
  Rollback: {
    explanation: [
      'Rollback restores a previously known application version or disables a new behavior after release signals show unacceptable impact. It is fastest when artifacts are immutable, deployment state is recorded, and application versions remain compatible with shared schemas, queues, and persisted data during the rollback window.',
      'Use rollback for rapid containment when the prior version can operate safely; use a forward fix when data has been irreversibly transformed or external contracts have changed. Automated thresholds reduce response time but can react to noisy signals, so combine bounded automation with clear ownership, validation, and post-rollback diagnosis.',
    ],
    whyItMatters: 'Release failures are inevitable, but prolonged customer impact is not. A rehearsed reversal path changes deployment from an irreversible event into a controlled operational decision.',
    useCases: [
      'Returning traffic to the prior container digest after a new version raises server errors',
      'Disabling a faulty feature flag without redeploying the application',
      'Using an expand-and-contract schema change so old code can run after the new schema is deployed',
    ],
    workedExample: {
      scenario: 'A release doubles checkout errors, but its database migration only added a nullable column understood by both versions.',
      steps: [
        'Confirm the version-specific error threshold and pause further rollout while preserving logs and traces for diagnosis.',
        'Route traffic back to the previous immutable digest, leaving the backward-compatible additive column in place.',
        'Verify checkout recovery and data integrity, then investigate and correct the release before attempting another progression.',
      ],
      result: 'Customer error rate returns to baseline quickly without a risky database reversal, and evidence remains available for a forward fix.',
    },
    interview: {
      prompt: 'Why can an application rollback fail even when the previous image is still available?',
      answer: 'The newer release may have changed data, schemas, messages, configuration, or external contracts in a way the old code cannot understand. Rollback planning therefore requires backward-compatible transitions, preserved artifacts and configuration, tested traffic reversal, and explicit treatment of irreversible changes. Sometimes containment plus a forward fix is safer than reverting code.',
    },
  },
  'Health probes': {
    explanation: [
      'Health probes expose distinct lifecycle signals. A startup probe allows slow initialization, a readiness probe controls whether an instance receives traffic, and a liveness probe indicates that a stuck process should be restarted rather than merely removed from routing.',
      'Readiness may check critical ability to serve, while liveness should avoid broad dependency checks that cause every instance to restart during a shared outage. Probes need cheap bounded work, sensible thresholds, and observed failure behavior; overly sensitive checks create restart loops, while shallow checks route traffic to broken instances.',
    ],
    whyItMatters: 'Orchestrators act directly on probe results, so probe semantics become part of system control flow. Correct signals prevent traffic from reaching unready instances without turning dependency failures into self-inflicted outages.',
    useCases: [
      'Holding a new instance out of rotation until configuration and caches are loaded',
      'Failing readiness when a required connection pool cannot serve requests',
      'Restarting a process whose event loop is permanently deadlocked',
    ],
    workedExample: {
      scenario: 'An API uses one probe that checks the database for both readiness and liveness, causing all instances to restart during a brief database outage.',
      steps: [
        'Separate a process-level liveness check from a readiness check that reports whether the API can currently serve database-backed requests.',
        'Add a startup probe for migration and cache initialization, and tune timeouts and failure thresholds from observed startup and recovery times.',
        'Simulate database loss and recovery to confirm instances leave traffic rotation without restarting and become ready again afterward.',
      ],
      result: 'A database outage removes unhealthy service capacity from routing but does not trigger a fleet-wide restart loop that delays recovery.',
    },
    interview: {
      prompt: 'Should a liveness probe fail whenever a downstream database is unavailable?',
      answer: 'Usually not. Restarting the process does not repair a shared database and may create a restart storm. Liveness should detect an unrecoverably stuck process, while readiness can stop traffic when required dependencies are unavailable. The exact choice depends on whether the process can recover connections and whether it can serve any useful requests without that dependency.',
    },
  },
  'Threat modeling': {
    explanation: [
      'Threat modeling identifies valuable assets, actors, entry points, data flows, trust boundaries, and plausible abuse before selecting controls. Teams trace how an attacker or mistaken user could spoof identity, alter data, disclose information, exhaust resources, or gain privileges across each boundary.',
      'Use threat modeling during design and revisit it when data flows or integrations change. It prioritizes realistic risk rather than producing a generic security checklist, but its quality depends on accurate system context; model likely impact and feasibility, record assumptions, and assign mitigations instead of trying to enumerate every imaginable attack.',
    ],
    whyItMatters: 'Security controls are most effective when they address a known path to a valued asset. Early modeling exposes architectural risks while boundaries and protocols are still inexpensive to change.',
    useCases: [
      'Analyzing forged webhook requests entering an order-processing workflow',
      'Reviewing how uploaded files cross from an untrusted user to a privileged parser',
      'Mapping administrator actions and recovery paths for an enterprise tenant',
    ],
    workedExample: {
      scenario: 'A payment service accepts public webhooks that can update an order from pending to paid.',
      steps: [
        'Diagram the provider, public endpoint, verification component, queue, worker, and order database, marking the internet and service boundaries.',
        'Identify spoofing, replay, payload tampering, duplicate delivery, secret theft, and resource-exhaustion threats with their business impact.',
        'Require signed timestamped requests, bounded body size, replay protection, idempotent updates, scoped secrets, rate limits, and audit alerts, then assign tests and owners.',
      ],
      result: 'The design ties controls to concrete payment-forgery and availability threats before public traffic reaches the endpoint.',
    },
    interview: {
      prompt: 'How is threat modeling different from running a vulnerability scanner?',
      answer: 'A scanner detects known weaknesses in reachable code or configuration. Threat modeling reasons about assets, trust boundaries, business abuse, and missing controls even when no known vulnerability signature exists. Scanning supplies useful evidence, but it cannot decide that a valid webhook may be replayed to produce an invalid business effect.',
    },
  },
  Authentication: {
    explanation: [
      'Authentication establishes which principal is making a request by verifying credentials through a trusted protocol. In token-based systems, a resource server validates signature, issuer, audience, expiry, and relevant token type before treating claims as identity; possession of an unvalidated token is not proof.',
      'Use established identity providers and protocol libraries rather than designing credential formats. Central identity improves federation, revocation policy, and multifactor controls but creates a critical dependency and configuration surface; cache keys carefully, handle rotation, minimize token lifetime, and distinguish user identity from calling workload identity.',
    ],
    whyItMatters: 'Every authorization and audit decision depends on trustworthy identity. Authentication mistakes let attackers assume valid identities or let tokens intended for one service cross into another.',
    useCases: [
      'Validating an OIDC access token before serving an enterprise API request',
      'Using multifactor authentication for administrative console access',
      'Authenticating one service to another with a workload identity rather than a shared user credential',
    ],
    workedExample: {
      scenario: 'An API decodes token claims but does not verify the signature or audience before accepting the user identifier.',
      steps: [
        'Configure a maintained token-verification library with the trusted issuer, expected audience, allowed algorithms, and current signing keys.',
        'Reject expired, unsigned, wrongly issued, or wrongly targeted tokens before constructing the request principal.',
        'Add tests for valid tokens and each invalid condition, then monitor authentication failures without logging token contents.',
      ],
      result: 'Only tokens signed by the trusted issuer and intended for this API establish a principal, closing a direct identity-forgery path.',
    },
    interview: {
      prompt: 'Why is decoding a signed token not the same as authenticating the caller?',
      answer: 'Decoding only reads attacker-controlled fields. Authentication requires cryptographic signature verification and checks that the trusted issuer created a nonexpired token for this audience and acceptable use. The application must also handle key rotation and token type correctly before using claims as identity.',
    },
  },
  Authorization: {
    explanation: [
      'Authorization decides whether an authenticated principal may perform a specific action on a specific resource. A policy can combine roles, attributes, ownership, tenant context, resource state, and requested operation, but enforcement must occur at the server-side boundary that reads or changes the resource.',
      'Use deny-by-default policies and central helpers where they keep decisions consistent, while retaining enough resource context for object-level checks. Coarse roles are easy to operate but can overgrant; highly granular policies reduce privilege but become difficult to reason about, so model permissions around stable business capabilities and test denials as well as approvals.',
    ],
    whyItMatters: 'Authentication answers who the caller is, not what the caller may access. Correct authorization prevents valid users and services from crossing resource, role, and tenant boundaries.',
    useCases: [
      'Checking invoice ownership before returning an invoice selected by identifier',
      'Allowing support staff to view account status without granting payment modification',
      'Requiring both tenant membership and an administrator role before inviting users',
    ],
    workedExample: {
      scenario: 'An endpoint returns any invoice by numeric identifier to every authenticated user, allowing account-to-account data access.',
      steps: [
        'Define the read rule as authenticated membership in the invoice tenant with the invoice-view capability.',
        'Load the invoice through a query constrained by both invoice identifier and tenant identifier, then apply any role policy before serialization.',
        'Test owner access, same-tenant permitted access, cross-tenant denial, missing resources, and direct identifier guessing.',
      ],
      result: 'Possessing a valid account and guessing an invoice identifier no longer bypasses tenant and capability checks.',
    },
    interview: {
      prompt: 'Why is hiding an administrative button insufficient authorization?',
      answer: 'Interface state can be modified or bypassed by sending a request directly. The server must evaluate permission for the requested operation and resource using trusted identity and current data. Hiding the button can improve usability, but it is not a security boundary and should mirror rather than replace server enforcement.',
    },
  },
  'Least privilege': {
    explanation: [
      'Least privilege grants each human or workload only the actions, resources, and duration required for its task. Separate identities and scoped roles prevent a component that only reads one queue or container from inheriting broad account-level administration through a shared credential.',
      'Apply least privilege at application, data, cloud, and operational boundaries, then review permissions as responsibilities change. Very narrow grants can increase policy count and delivery friction, but broad permanent access increases incident blast radius; role templates, just-in-time elevation, access reviews, and denial tests balance those pressures.',
    ],
    whyItMatters: 'Credentials and workloads eventually fail or are compromised. Restricted permissions convert one failure from full-environment control into a bounded incident.',
    useCases: [
      'Giving an export worker read-only access to a reporting replica',
      'Granting temporary production diagnostics access that expires after an incident',
      'Separating deployment identity from the runtime identity used by the application',
    ],
    workedExample: {
      scenario: 'A background thumbnail worker uses an account-wide storage administrator credential even though it only reads originals and writes thumbnails.',
      steps: [
        'Create a dedicated worker identity and list the exact read and create operations it needs on the two relevant containers.',
        'Grant only those scoped operations, replace the shared credential, and explicitly deny or omit delete and policy-management privileges.',
        'Run normal processing plus negative tests for unrelated containers, deletion, and access-policy changes before revoking the old credential.',
      ],
      result: 'A compromised thumbnail worker can process its assigned files but cannot delete originals, inspect unrelated data, or change storage policy.',
    },
    interview: {
      prompt: 'What makes least privilege difficult to maintain after the initial deployment?',
      answer: 'Responsibilities change, temporary grants linger, shared identities obscure actual use, and teams often add broad access to resolve delivery failures quickly. Maintenance requires per-workload identities, usage evidence, expiring elevation, periodic reviews, policy-as-code, and tests proving both required access and expected denial.',
    },
  },
  'Secret management': {
    explanation: [
      'Secret management controls the creation, storage, distribution, use, rotation, revocation, and audit of credentials such as API keys and database passwords. A dedicated secret store encrypts values, applies identity-based policy, versions changes, and exposes them to workloads without placing plaintext in source or image layers.',
      'Prefer eliminating reusable secrets through short-lived identity, and otherwise scope and rotate each secret independently. Central storage reduces sprawl but can become a critical dependency; applications need bounded caching and rotation behavior, while logs, command arguments, build output, and support tooling must be designed not to reveal values.',
    ],
    whyItMatters: 'A secret copied into repositories and deployment systems is hard to inventory and revoke. Managed lifecycle and audit reduce both the probability and duration of credential exposure.',
    useCases: [
      'Loading a third-party API key from a secret store at runtime',
      'Rotating database credentials while old and new application instances overlap',
      'Scanning commits and build output to block accidental credential publication',
    ],
    workedExample: {
      scenario: 'A payment provider key is shared by development and production and stored in a repository configuration file.',
      steps: [
        'Revoke the exposed key, inspect repository and build history for disclosure, and issue separate environment-scoped credentials.',
        'Store the production key in a secret manager and grant only the payment workload identity permission to retrieve it.',
        'Implement overlap-aware rotation, redact provider headers from telemetry, and alert on unexpected retrieval or failed use.',
      ],
      result: 'Production access is isolated from development, the known exposure is closed, and future rotation no longer requires a source change.',
    },
    interview: {
      prompt: 'A secret was removed from the latest commit. What else must happen?',
      answer: 'Assume the value was exposed and revoke or rotate it immediately. Determine where history, forks, build logs, registries, caches, and deployed configuration may contain it, then move delivery to a managed mechanism and restrict access. History cleanup can reduce accidental discovery, but it does not make the old credential trustworthy again.',
    },
  },
  Encryption: {
    explanation: [
      'Encryption in transit protects data between endpoints through an authenticated secure channel, while encryption at rest protects stored bytes on disks, backups, and object media. Envelope encryption commonly encrypts data with a data key and protects that key with a separately controlled key-encryption key.',
      'Use modern maintained protocols and managed key services, with access policy and rotation separated from data access where practical. Encryption reduces disclosure from intercepted or copied bytes but does not stop an authorized or compromised application from reading plaintext; key loss, misuse, latency, and rotation complexity remain operational tradeoffs.',
    ],
    whyItMatters: 'Sensitive data crosses networks and persists in many physical and logical copies. Encryption limits what an interceptor or storage-level compromise can reveal while key policy creates a separate control point.',
    useCases: [
      'Requiring authenticated TLS for application-to-database connections',
      'Encrypting backups with a key whose access is separate from backup storage access',
      'Using per-tenant data keys to narrow the effect of a key compromise',
    ],
    workedExample: {
      scenario: 'Sensitive export archives are stored in object storage, and the same broad role can read both the objects and the master encryption key.',
      steps: [
        'Encrypt each archive with a generated data key and store only its encrypted key reference with the object.',
        'Restrict key-decryption permission to the export delivery workload while backup and storage operators retain object access without decryption.',
        'Test restore and key rotation, log decrypt operations, and verify that object access alone cannot recover plaintext.',
      ],
      result: 'Storage compromise does not automatically reveal archive contents, and key use becomes a separately authorized and auditable action.',
    },
    interview: {
      prompt: 'What risks remain after a database enables encryption at rest?',
      answer: 'The application and authorized queries still receive plaintext, so injection, excessive permissions, compromised identities, and data exported to logs remain risks. Key administrators and backups also require protection. Encryption at rest addresses exposure of stored media; it must be combined with transport security, access control, key separation, minimization, and auditing.',
    },
  },
  'Application attacks': {
    explanation: [
      'Application attacks exploit how software interprets input or performs privileged actions. Injection changes the meaning of commands, request forgery abuses trusted network access, cross-site scripting executes untrusted browser content, and path or object-reference flaws cross boundaries the application failed to enforce.',
      'Defend with context-aware safe APIs, parameterized queries, allowlisted destinations, output encoding, authorization, bounded parsers, and secure defaults in maintained frameworks. Input validation helps but cannot replace structural defenses, and generic filtering often breaks valid data while missing alternate encodings; controls should match the interpreter and trust boundary involved.',
    ],
    whyItMatters: 'Public applications process attacker-controlled input while holding trusted access to data and internal services. A single confused boundary can turn normal product capability into data theft or remote action.',
    useCases: [
      'Using parameterized queries for customer search instead of concatenating SQL',
      'Restricting a URL-fetch feature from private address ranges and cloud metadata endpoints',
      'Encoding user-authored text for its HTML context before browser rendering',
    ],
    workedExample: {
      scenario: 'A report endpoint constructs a SQL statement by concatenating a user-provided customer name into the query.',
      steps: [
        'Replace string construction with a parameterized query in which SQL structure and the customer value are sent separately.',
        'Apply length and type limits for product behavior, and ensure the database identity has only the read permissions the report needs.',
        'Add tests with quotes, SQL control text, Unicode edge cases, and a valid literal name to verify both security and functionality.',
      ],
      result: 'Customer input remains data rather than executable SQL, and database permissions limit impact if another query defect is introduced.',
    },
    interview: {
      prompt: 'Why is rejecting apostrophes not an adequate defense against SQL injection?',
      answer: 'It damages legitimate input and assumes one encoding and SQL context while attackers can use other syntax or injection points. Parameterized queries keep values separate from the command grammar regardless of their characters. Validation should enforce business constraints, and least-privilege database access provides an additional boundary.',
    },
  },
  'Tenant isolation': {
    explanation: [
      'Tenant isolation ensures one customer cannot access or influence another customer through application queries, caches, queues, storage paths, logs, or administrative operations. Trusted tenant context originates from authenticated membership and must travel with every request and asynchronous message to each data boundary.',
      'Shared tables with tenant predicates are efficient but depend on consistent enforcement, while separate schemas, databases, or accounts provide stronger boundaries at greater cost and operational complexity. Choose isolation from sensitivity, scale, compliance, and noisy-neighbor risk, then add defense in depth such as row policies, scoped identities, partitioning, and cross-tenant tests.',
    ],
    whyItMatters: 'A cross-tenant access flaw can expose an entire customer relationship even when authentication works correctly. Isolation must be a system invariant rather than a convention remembered by individual endpoint authors.',
    useCases: [
      'Including trusted tenant identifiers in every customer-data query',
      'Partitioning queue messages and object paths by tenant with server-side authorization',
      'Giving a regulated tenant a dedicated database and encryption key',
    ],
    workedExample: {
      scenario: 'A background export job receives only a report identifier, then loads that report without tenant context and writes it to a shared object path.',
      steps: [
        'Include the authenticated tenant identifier in the queued job and verify the worker identity is allowed to process that tenant.',
        'Load the report using both report and tenant identifiers, then write to a tenant-scoped storage prefix with restrictive access policy.',
        'Test forged queue messages, duplicate report identifiers across tenants, cache keys, and download authorization for cross-tenant denial.',
      ],
      result: 'Tenant context survives the asynchronous boundary and constrains both report retrieval and exported-object access.',
    },
    interview: {
      prompt: 'Is adding tenant_id to every database table enough to guarantee tenant isolation?',
      answer: 'No. Every query, cache key, message, object path, search index, log, and administrative path must preserve and enforce trusted tenant context. Application predicates can be missed, so database policies, scoped identities, partitioning, and systematic negative tests should provide additional boundaries. The identifier must come from authenticated membership, not an untrusted request field.',
    },
  },
  'Audit and response': {
    explanation: [
      'Audit records capture security-relevant actions with actor, target, tenant, operation, outcome, time, and correlation context in an append-resistant destination. Detection rules turn selected records into alerts, while an incident response plan defines triage, containment, evidence preservation, eradication, recovery, communication, and later improvement.',
      'Record sensitive changes and access without collecting secrets or unnecessary personal data. Broad logging improves investigation but increases cost and privacy exposure, and alerts without owners create noise; use risk-based events, protected retention, synchronized time, tested escalation paths, and response exercises that measure decisions rather than document length.',
    ],
    whyItMatters: 'Preventive controls cannot stop every misuse or compromise. Reliable evidence and rehearsed response reduce detection and containment time while supporting accountability and required notification.',
    useCases: [
      'Recording administrator role grants with actor, target, tenant, and request correlation identifier',
      'Alerting when a dormant workload identity suddenly reads many secrets',
      'Preserving an incident timeline and verified evidence before rotating credentials',
    ],
    workedExample: {
      scenario: 'An administrator account unexpectedly grants itself access to several customer tenants outside a planned change window.',
      steps: [
        'Trigger an alert from the immutable role-change event and correlate the actor, session, source, targets, and preceding authentication events.',
        'Disable the affected session and credentials, suspend unauthorized grants, preserve logs and snapshots, and assess accessed customer data.',
        'Recover with verified identities and permissions, notify required stakeholders, then close the path that allowed the grant and test the updated response runbook.',
      ],
      result: 'The organization contains unauthorized access quickly, preserves defensible evidence, determines affected tenants, and converts the incident into a tested control improvement.',
    },
    interview: {
      prompt: 'What makes an audit log useful during an incident rather than merely comprehensive?',
      answer: 'Useful records identify the actor, action, target, outcome, time, tenant, and correlation path in a protected and searchable form. Clocks and identities must be trustworthy, retention must cover investigation needs, and access to logs must itself be controlled. Most importantly, alerts and runbooks must connect evidence to an owned containment decision.',
    },
  },
} satisfies Record<string, FdeLessonDetails>