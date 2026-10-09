import { account, openService, registryHost, resourceGroup } from './common'
import { lines, pt, type LabSeed } from './types'

export const operateLabs: readonly LabSeed[] = [
  {
    slug: 'enterprise-security',
    title: 'Enterprise security',
    mission: 'Lock the system down the way a bank would: firewall at the edge, secrets in a vault, private access only, least privilege everywhere.',
    concept: [
      'Defense in depth: many layers, so one mistake is not a breach.',
      'Identity is the new wall. Every person and every server proves who it is, with the smallest rights possible.',
      'Assume breach: log everything, encrypt everything, and limit how far an attacker can move.',
    ],
    build: ['WAF + DDoS protection', 'Secret vault', 'Private endpoints', 'Least-privilege roles', 'Audit logs'],
    architecture: ['dev', 'pipeline', 'registry', 'network', 'users', 'euUsers', 'waf', 'edge', 'lb', 'scaleSet', 'redis', 'db', 'vault', 'euRegion'],
    steps: [
      {
        title: 'Turn on the web firewall',
        screen: 'Home',
        instruction: pt('Open "Web Application Firewall policies".', 'Open "WAF & Shield".', 'Open "Cloud Armor".'),
        why: 'A WAF reads every request at the edge and blocks known attacks (SQL injection, bad bots, floods) before they reach your servers.',
        task: openService('waf'),
        result: 'WAF opened.',
      },
      {
        title: 'Configure WAF rules',
        screen: pt('Home > WAF policies > Create (Front Door)', 'WAF & Shield > Web ACLs > Create web ACL', 'Cloud Armor > Create policy'),
        instruction: 'Attach to the front door, use managed rules, block bad traffic, and rate-limit login.',
        why: 'Managed rules are kept up to date by the cloud security team. Rate limits stop password guessing and bot floods. Start in detection mode for a day, then switch to prevention.',
        task: {
          kind: 'form',
          fields: [
            account,
            resourceGroup,
            { kind: 'fixed', label: 'Attach to', value: pt('fd-shop (Front Door)', 'cf-shop (CloudFront)', 'glb-shop backend service') },
            {
              kind: 'select',
              label: 'Managed rule set',
              options: [
                { label: pt('Microsoft Default Rule Set 2.1 + Bot Manager', 'AWS Core rule set + Known bad inputs + Bot Control', 'OWASP preconfigured rules (sqli, xss) + bot management'), feedback: 'Correct. Covers the OWASP Top 10 and bots.' },
                { label: 'None (custom rules only)', feedback: 'You would have to write and update hundreds of rules yourself.' },
              ],
              correct: 0,
              hint: 'Let the security team at the cloud keep rules current.',
            },
            {
              kind: 'select',
              label: 'Mode',
              options: [
                { label: 'Prevention (block)', feedback: 'Correct for production, after a short detection trial.' },
                { label: 'Detection only (forever)', feedback: 'Attacks are logged but never stopped.' },
              ],
              correct: 0,
              hint: 'A firewall that only watches does not protect.',
            },
            {
              kind: 'select',
              label: 'Rate limit /login',
              options: [
                { label: '100 requests / minute per IP', feedback: 'Correct. Real users never hit it; bots do.' },
                { label: 'No limit', feedback: 'Bots can try millions of passwords.' },
              ],
              correct: 0,
              hint: 'Stop password guessing.',
            },
            {
              kind: 'select',
              label: 'DDoS protection',
              options: [
                { label: pt('DDoS Network Protection: On', 'Shield Advanced: On', 'Cloud Armor Enterprise: On'), feedback: 'Correct. Large floods are absorbed by the cloud network, with cost protection.' },
                { label: 'Basic only', feedback: 'Basic covers network floods, but not app-level attacks or the bill from scaling under attack.' },
              ],
              correct: 0,
              hint: 'Enterprise apps are attack targets.',
            },
          ],
          submit: 'Create',
        },
        result: 'WAF blocks attacks and rate-limits login.',
      },
      {
        title: 'Create a secret vault',
        screen: 'Home',
        instruction: pt('Open "Key vaults".', 'Open "Secrets Manager".', 'Open "Secret Manager".'),
        why: 'Secrets (DB password, API keys) belong in a vault. It encrypts them, logs every read, and can rotate them automatically.',
        task: openService('vault'),
        result: 'Vault service opened.',
      },
      {
        title: 'Store and protect the DB password',
        screen: pt('Key vaults > kv-shop > Secrets > Generate/Import', 'Secrets Manager > Store a new secret', 'Secret Manager > Create secret'),
        instruction: 'Store the database password, allow only the app identity to read it, and turn on rotation.',
        why: 'Only the app servers need this secret, so only their identity can read it. Rotation changes the password every 30 days, so a leaked password stops working.',
        task: {
          kind: 'form',
          fields: [
            { kind: 'text', label: 'Secret name', placeholder: 'db-password', accept: '^db-password$', hint: 'Type db-password.' },
            {
              kind: 'select',
              label: 'Who can read it',
              options: [
                { label: 'All developers', feedback: 'Every laptop becomes a way to steal production data.' },
                { label: pt('vmss-shop managed identity (Key Vault Secrets User)', 'shop-app-role (secretsmanager:GetSecretValue on this secret)', 'shop-app@ service account (Secret Accessor on this secret)'), feedback: 'Correct. Only the running app.' },
              ],
              correct: 1,
              hint: 'Only the thing that actually uses it.',
            },
            {
              kind: 'select',
              label: 'Rotation',
              options: [
                { label: 'Every 30 days, automatic', feedback: 'Correct. Leaked secrets expire on their own.' },
                { label: 'Never', feedback: 'A password leaked once works forever.' },
              ],
              correct: 0,
              hint: 'Old leaks should stop working.',
            },
            {
              kind: 'select',
              label: 'Network access',
              options: [
                { label: 'Public', feedback: 'The vault is reachable from the internet.' },
                { label: 'Private endpoint only', feedback: 'Correct. Only your network can reach it.' },
              ],
              correct: 1,
              hint: 'Same rule as the database.',
            },
          ],
          submit: 'Create',
        },
        cli: pt(
          'az keyvault create -g rg-shop-prod -n kv-shop --enable-rbac-authorization \\\n  --public-network-access Disabled\naz keyvault secret set --vault-name kv-shop -n db-password --value "$(openssl rand -base64 32)"',
          'aws secretsmanager create-secret --name db-password --generate-secret-string\naws secretsmanager rotate-secret --secret-id db-password \\\n  --rotation-rules AutomaticallyAfterDays=30',
          'openssl rand -base64 32 | gcloud secrets create db-password --data-file=- \\\n  --replication-policy=automatic --next-rotation-time=2026-11-05T00:00:00Z \\\n  --rotation-period=2592000s',
        ),
        result: 'Password lives in the vault, readable only by the app.',
      },
      {
        title: 'Read the secret at startup',
        surface: 'local',
        screen: 'shop-api > start.sh',
        instruction: 'Fill the blank so the app loads the password from the vault using its identity.',
        why: 'The password exists only in memory of the running app. It is never on disk, never in the image, never in Git.',
        task: {
          kind: 'code',
          file: 'start.sh',
          code: lines('#!/bin/sh', 'export DB_PASSWORD="$([[0]])"', 'exec node server.js'),
          blanks: [
            {
              options: [
                { label: 'cat /etc/secrets/db.txt', feedback: 'That means someone copied the password onto disk.' },
                {
                  label: pt(
                    'az keyvault secret show --vault-name kv-shop -n db-password --query value -o tsv',
                    'aws secretsmanager get-secret-value --secret-id db-password --query SecretString --output text',
                    'gcloud secrets versions access latest --secret=db-password',
                  ),
                  feedback: 'Correct. Uses the VM identity; no password needed to get the password.',
                },
              ],
              correct: 1,
            },
          ],
        },
        result: 'No secrets on disk.',
      },
      {
        title: 'Least privilege for people',
        screen: pt('Home > rg-shop-prod > Access control (IAM) > Add role assignment', 'IAM Identity Center > Permission sets', 'IAM & Admin > IAM > Grant access'),
        instruction: 'Give each team only the access they need.',
        why: 'Most breaches start with a stolen account. If that account can only read logs, the damage is small. Use groups, not single users, and require MFA.',
        task: {
          kind: 'form',
          fields: [
            {
              kind: 'select',
              label: 'Developers in production',
              options: [
                { label: 'Owner', feedback: 'One phished developer could delete everything.' },
                { label: 'Reader + log access', feedback: 'Correct. They can debug but not change production.' },
              ],
              correct: 1,
              hint: 'Changes go through the pipeline.',
            },
            {
              kind: 'select',
              label: 'Who can change production',
              options: [
                { label: 'The CI/CD pipeline identity only', feedback: 'Correct. Every change is reviewed in Git and logged.' },
                { label: 'Anyone on the team', feedback: 'No review, no record of who changed what.' },
              ],
              correct: 0,
              hint: 'Every change should be reviewed and recorded.',
            },
            {
              kind: 'select',
              label: 'Emergency admin access',
              options: [
                { label: pt('Just-in-time (PIM): 1 hour, needs approval + MFA', 'Temporary elevated access: 1 hour, approval + MFA', 'Privileged Access Manager: 1 hour grant, approval'), feedback: 'Correct. Power exists only when needed, and it is logged.' },
                { label: 'Permanent admin for team leads', feedback: 'Permanent admin accounts are the top target for attackers.' },
              ],
              correct: 0,
              hint: 'No standing admin power.',
            },
          ],
          submit: 'Save',
        },
        result: 'Least privilege applied to people.',
      },
      {
        title: 'Close every public door',
        screen: pt('Home > Private endpoints', 'VPC > Endpoints', 'Private Service Connect'),
        instruction: 'Pick which services should have public access turned off.',
        why: 'Private endpoints give each service an address inside your network. Then you turn public access off completely, so even a leaked password cannot be used from outside.',
        task: {
          kind: 'choice',
          question: 'Which services should be private only?',
          options: [
            { label: 'Only the database', feedback: 'Redis, the vault, and the registry hold sensitive data too.' },
            { label: 'Database, Redis, vault, and registry. Only the front door is public', correct: true, feedback: 'Correct. One public entry point, protected by the WAF.' },
            { label: 'Everything, including the front door', feedback: 'Then users could not reach your app.' },
          ],
        },
        result: 'Only the front door is public.',
      },
      {
        title: 'Encryption and audit',
        screen: pt('Microsoft Defender for Cloud > Recommendations', 'Security Hub > Findings', 'Security Command Center > Findings'),
        instruction: 'Run the cloud security scanner.',
        why: 'Security posture tools check hundreds of settings for you every day. They catch the things humans forget.',
        task: {
          kind: 'simulate',
          action: 'Run security scan',
          frames: [
            { log: 'Encryption at rest: on for disks, database, Redis, registry', tone: 'ok' },
            { log: 'TLS 1.2+ everywhere: yes', tone: 'ok' },
            { log: 'Public network access: only on front door', tone: 'ok' },
            { log: 'MFA for all humans: yes', tone: 'ok' },
            { log: 'Audit logs sent to a separate locked log account for 1 year', tone: 'ok' },
            { log: 'Finding: 1 VM image has a medium CVE → fixed in next pipeline build', tone: 'warn' },
          ],
        },
        result: 'Security score 96%.',
      },
      {
        title: 'Attack drill',
        screen: 'Attack simulation',
        instruction: 'Simulate common attacks against the system.',
        why: 'See each layer do its job.',
        task: {
          kind: 'simulate',
          action: 'Start attack',
          frames: [
            { log: 'SQL injection in /search?q=\' OR 1=1 → blocked by WAF (403)', tone: 'ok' },
            { log: '50,000 login attempts from a botnet → rate limit, 429', tone: 'ok' },
            { log: '2 Tbps network flood → absorbed by DDoS protection', tone: 'ok' },
            { log: 'Direct hit on database IP → no public address, unreachable', tone: 'ok' },
            { log: 'Stolen developer laptop → no production write access, MFA required', tone: 'ok' },
            { log: 'Real users: no errors during the attack', tone: 'ok' },
          ],
        },
        result: 'Every attack was stopped by a different layer.',
      },
    ],
  },
  {
    slug: 'monitor-and-recover',
    title: 'Monitor, alert, and recover',
    mission: 'Know about problems before users tell you, and fix them fast.',
    concept: [
      'Metrics are numbers over time (CPU, errors). Logs are events. Traces follow one request across services.',
      'An SLO is your promise, e.g. 99.9% of requests succeed. Alert when you are burning through it too fast.',
      'Alert on what users feel (errors, latency), not on every CPU spike.',
    ],
    build: ['Dashboard', 'SLO 99.9%', 'Alerts to on-call', 'Rollback runbook'],
    architecture: ['dev', 'pipeline', 'registry', 'network', 'users', 'euUsers', 'waf', 'edge', 'lb', 'scaleSet', 'redis', 'db', 'vault', 'monitor', 'euRegion'],
    steps: [
      {
        title: 'Open monitoring',
        screen: 'Home',
        instruction: pt('Open "Monitor".', 'Open "CloudWatch".', 'Open "Monitoring".'),
        why: 'Every cloud has built-in monitoring. Start here before buying extra tools.',
        task: openService('monitor'),
        result: 'Monitoring opened.',
      },
      {
        title: 'Turn on tracing in the app',
        surface: 'local',
        screen: 'shop-api > src/telemetry.js',
        instruction: 'Fill the blank to send traces with the open standard.',
        why: 'OpenTelemetry is the open standard. It works with every cloud, so you are not locked in. One trace shows exactly where a slow request spent its time.',
        task: {
          kind: 'code',
          file: 'src/telemetry.js',
          code: lines(
            "import { NodeSDK } from '@opentelemetry/sdk-node'",
            "import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'",
            '',
            'new NodeSDK({',
            "  serviceName: 'shop-api',",
            '  instrumentations: [[[0]]],',
            '}).start()',
          ),
          blanks: [
            {
              options: [
                { label: 'getNodeAutoInstrumentations()', feedback: 'Correct. HTTP, Redis, and Postgres calls are traced automatically.' },
                { label: 'console.log', feedback: 'Logs alone cannot follow a request across services.' },
              ],
              correct: 0,
            },
          ],
        },
        result: 'Traces flow to the cloud monitor.',
      },
      {
        title: 'Set the SLO and alerts',
        screen: pt('Monitor > Alerts > Create alert rule', 'CloudWatch > Application Signals > SLOs > Create SLO', 'Monitoring > Services > shop-api > Create SLO'),
        instruction: 'Define your promise and when to wake someone up.',
        why: '99.9% means about 43 minutes of failure per month. A burn-rate alert pages you only when you would run out of that budget soon. Fewer false alarms means people trust alerts.',
        task: {
          kind: 'form',
          fields: [
            {
              kind: 'select',
              label: 'SLO: successful requests',
              options: [
                { label: '100%', feedback: 'Impossible. You would never be allowed to deploy.' },
                { label: '99.9% over 30 days', feedback: 'Correct. Strong, but leaves room to ship changes.' },
                { label: '90%', feedback: '1 in 10 failures is a broken product.' },
              ],
              correct: 1,
              hint: 'Strong but realistic.',
            },
            {
              kind: 'select',
              label: 'Page on-call when',
              options: [
                { label: 'Any server CPU > 80%', feedback: 'Autoscale handles that. You would be woken up for nothing.' },
                { label: 'Error budget burns 14x faster than normal for 5 min', feedback: 'Correct. Real user pain, fast.' },
              ],
              correct: 1,
              hint: 'Page for user pain, not machine noise.',
            },
            {
              kind: 'select',
              label: 'p95 latency > 500 ms for 10 min',
              options: [
                { label: 'Ticket for next working day', feedback: 'Correct. Important but not an emergency.' },
                { label: 'Page at 3 a.m.', feedback: 'Slow-but-working rarely needs a midnight wake-up.' },
              ],
              correct: 0,
              hint: 'Not every problem is an emergency.',
            },
          ],
          submit: 'Create',
        },
        result: 'SLO and alerts configured.',
      },
      {
        title: 'Incident: errors are rising',
        screen: 'On-call > Incident #311',
        instruction: 'You were paged. Follow the dashboard to the cause.',
        why: 'Real incident work: check what changed, look at traces, then act. Most incidents are caused by a recent change.',
        task: {
          kind: 'simulate',
          action: 'Open dashboard',
          metrics: [
            { label: 'Error rate', unit: '%', max: 20 },
            { label: 'p95 latency', unit: 'ms', max: 3000 },
            { label: 'DB connections', unit: '', max: 500 },
          ],
          frames: [
            { log: 'Alert: error budget burning 22x. Started 14:02', tone: 'bad', values: [8, 2400, 480] },
            { log: 'Change log: deploy 9e2f1aa finished 13:58', tone: 'warn', values: [8, 2400, 480] },
            { log: 'Trace: 2.3 s waiting for a database connection', tone: 'warn', values: [9, 2500, 495] },
            { log: 'Cause: new version opens a DB connection per request (pool missing)', tone: 'bad', values: [9, 2500, 495] },
          ],
        },
        result: 'Cause found: the last deploy.',
      },
      {
        title: 'Recover',
        screen: 'On-call > Incident #311',
        instruction: 'Choose the first action.',
        why: 'First restore users, then fix the bug calmly. Rollback is the fastest safe fix because you know the old version worked.',
        task: {
          kind: 'choice',
          question: 'What do you do first?',
          options: [
            { label: 'Debug the code live in production', feedback: 'Users keep failing while you debug.' },
            { label: 'Roll back to the previous image 7a1d9e4', correct: true, feedback: 'Correct. Users recover in minutes. Fix forward later.' },
            { label: 'Double the database size', feedback: 'It treats the symptom and costs money. The bug remains.' },
          ],
        },
        cli: pt(
          'gh workflow run deploy.yml -f image_tag=7a1d9e4',
          'gh workflow run deploy.yml -f image_tag=7a1d9e4',
          'gh workflow run deploy.yml -f image_tag=7a1d9e4',
        ),
        result: 'Rolled back. Error rate back to 0.1% in 4 minutes.',
      },
      {
        title: 'Blameless review',
        screen: 'Postmortem #311',
        instruction: 'Pick the follow-up that prevents this from happening again.',
        why: 'A postmortem asks "how did the system let this through?", not "who did it?". Fix the system so the next person cannot make the same mistake.',
        task: {
          kind: 'choice',
          question: 'Best follow-up?',
          options: [
            { label: 'Tell the developer to be more careful', feedback: 'People will make mistakes again. Systems must catch them.' },
            { label: 'Add a canary step: send 5% of traffic to new versions and auto-roll back on errors', correct: true, feedback: 'Correct. Next time only 5% of users see the bug, for minutes.' },
          ],
        },
        result: 'Canary release added to the pipeline.',
      },
    ],
  },
  {
    slug: 'kubernetes',
    title: 'Run it on Kubernetes',
    mission: 'Move the same container from VMs to managed Kubernetes for faster scaling and easier deploys of many services.',
    concept: [
      'Kubernetes runs containers across many machines. You describe what you want; it keeps it that way.',
      'A Pod runs your container. A Deployment keeps N pods running. A Service gives them one address.',
      'Managed Kubernetes means the cloud runs the control plane for you.',
    ],
    build: ['Managed cluster in 3 zones', 'Deployment + Service + Ingress', 'Pod autoscaler'],
    architecture: ['dev', 'pipeline', 'registry', 'network', 'users', 'euUsers', 'waf', 'edge', 'lb', 'k8s', 'redis', 'db', 'vault', 'monitor', 'euRegion'],
    steps: [
      {
        title: 'When to use Kubernetes',
        screen: 'Design decision',
        instruction: 'Your company now has 25 services. Pick the platform.',
        why: 'Kubernetes adds complexity. It pays off with many services: one way to deploy, scale, and secure all of them, and pods start in seconds instead of VM minutes.',
        task: {
          kind: 'choice',
          question: 'Which platform for 25 containerized services?',
          options: [
            { label: '25 separate VM groups', feedback: '25 templates, 25 pipelines, slow scaling. Hard to manage.' },
            { label: pt('AKS (managed Kubernetes)', 'EKS (managed Kubernetes)', 'GKE (managed Kubernetes)'), correct: true, feedback: 'Correct. One platform for all services.' },
            { label: 'Build our own Kubernetes on VMs', feedback: 'You would run and patch the control plane yourself. Only worth it with a big platform team.' },
          ],
        },
        result: 'Managed Kubernetes chosen.',
      },
      {
        title: 'Create the cluster',
        screen: pt('Home > Kubernetes services > Create cluster', 'EKS > Clusters > Create cluster', 'Kubernetes Engine > Clusters > Create'),
        instruction: 'Create a private, zone-spread cluster with autoscaling nodes.',
        why: 'A private cluster has no public API endpoint. Nodes in 3 zones survive a zone outage. The cluster autoscaler adds VMs when pods do not fit.',
        task: {
          kind: 'form',
          tabs: pt(['Basics', 'Node pools', 'Networking', 'Integrations', 'Monitoring', 'Security', 'Review + create'], ['Configure cluster', 'Specify networking', 'Configure observability', 'Select add-ons'], ['Cluster basics', 'Networking', 'Security', 'Features']),
          fields: [
            account,
            resourceGroup,
            { kind: 'text', label: 'Cluster name', placeholder: 'k8s-shop', accept: '^k8s-shop$', hint: 'Type k8s-shop.' },
            {
              kind: 'select',
              label: pt('Cluster preset', 'Configuration', 'Mode'),
              options: [
                { label: pt('AKS Automatic', 'EKS Auto Mode', 'Autopilot'), feedback: 'Correct. The cloud manages nodes, scaling, and security defaults.' },
                { label: pt('Dev/Test (1 node)', 'Custom, 1 node', 'Standard, 1 node'), feedback: 'One node is a single point of failure.' },
              ],
              correct: 0,
              hint: 'Let the cloud manage nodes for you.',
            },
            { kind: 'fixed', label: 'Zones', value: pt('1, 2, 3', 'us-east-1a, 1b, 1c', 'us-central1-a, b, c') },
            {
              kind: 'select',
              label: 'API server access',
              options: [
                { label: 'Public', feedback: 'The cluster control API would be on the internet.' },
                { label: 'Private', feedback: 'Correct. Only reachable from your network and the pipeline.' },
              ],
              correct: 1,
              hint: 'The control API is the keys to everything.',
            },
          ],
          submit: 'Create',
        },
        cli: pt(
          'az aks create -g rg-shop-prod -n k8s-shop --sku automatic \\\n  --zones 1 2 3 --enable-private-cluster --vnet-subnet-id $APP_SUBNET',
          'eksctl create cluster --name k8s-shop --region us-east-1 --enable-auto-mode \\\n  --zones us-east-1a,us-east-1b,us-east-1c',
          'gcloud container clusters create-auto k8s-shop --region=us-central1 \\\n  --network=vpc-shop --subnetwork=snet-app --enable-private-nodes',
        ),
        result: 'Cluster k8s-shop running.',
      },
      {
        title: 'Write the Deployment',
        surface: 'local',
        screen: 'shop-api > k8s/deployment.yaml',
        instruction: 'Fill the blanks: replicas, image, and health checks.',
        why: 'This file replaces your VM template. Requests tell Kubernetes how much CPU/memory each pod needs. Probes play the same role as the load balancer health check.',
        task: {
          kind: 'code',
          file: 'k8s/deployment.yaml',
          code: pt(
            lines('apiVersion: apps/v1', 'kind: Deployment', 'metadata: { name: shop-api }', 'spec:', '  replicas: [[0]]', '  template:', '    spec:', '      containers:', '        - name: api', `          image: ${registryHost.azure}:7a1d9e4`, '          resources:', '            requests: { cpu: 250m, memory: 256Mi }', '          [[1]]:', '            httpGet: { path: /health, port: 3000 }', '      topologySpreadConstraints:', '        - topologyKey: [[2]]', '          maxSkew: 1', '          whenUnsatisfiable: ScheduleAnyway'),
            lines('apiVersion: apps/v1', 'kind: Deployment', 'metadata: { name: shop-api }', 'spec:', '  replicas: [[0]]', '  template:', '    spec:', '      containers:', '        - name: api', `          image: ${registryHost.aws}:7a1d9e4`, '          resources:', '            requests: { cpu: 250m, memory: 256Mi }', '          [[1]]:', '            httpGet: { path: /health, port: 3000 }', '      topologySpreadConstraints:', '        - topologyKey: [[2]]', '          maxSkew: 1', '          whenUnsatisfiable: ScheduleAnyway'),
            lines('apiVersion: apps/v1', 'kind: Deployment', 'metadata: { name: shop-api }', 'spec:', '  replicas: [[0]]', '  template:', '    spec:', '      containers:', '        - name: api', `          image: ${registryHost.gcp}:7a1d9e4`, '          resources:', '            requests: { cpu: 250m, memory: 256Mi }', '          [[1]]:', '            httpGet: { path: /health, port: 3000 }', '      topologySpreadConstraints:', '        - topologyKey: [[2]]', '          maxSkew: 1', '          whenUnsatisfiable: ScheduleAnyway'),
          ),
          blanks: [
            {
              options: [
                { label: '1', feedback: 'One pod is a single point of failure.' },
                { label: '3', feedback: 'Correct. One per zone to start; the autoscaler adds more.' },
              ],
              correct: 1,
            },
            {
              options: [
                { label: 'readinessProbe', feedback: 'Correct. Pods get traffic only when /health passes.' },
                { label: 'comment', feedback: 'Not a Kubernetes field. Traffic would hit pods that are still starting.' },
              ],
              correct: 0,
            },
            {
              options: [
                { label: 'topology.kubernetes.io/zone', feedback: 'Correct. Pods spread across zones.' },
                { label: 'color', feedback: 'Not a real topology key.' },
              ],
              correct: 0,
            },
          ],
        },
        result: 'Deployment ready.',
      },
      {
        title: 'Apply and expose',
        screen: 'Terminal > k8s-shop',
        instruction: 'Apply the manifests and check the pods.',
        why: 'kubectl apply sends the desired state. Kubernetes makes it real and keeps it real: if a pod dies, it starts a new one.',
        task: {
          kind: 'terminal',
          command: lines('kubectl apply -f k8s/', 'kubectl get pods -o wide'),
          output: [
            'deployment.apps/shop-api created',
            'service/shop-api created',
            'ingress.networking.k8s.io/shop-api created',
            'horizontalpodautoscaler.autoscaling/shop-api created',
            'NAME                       READY  STATUS   ZONE',
            'shop-api-7f9c8d6b5-2xkqp   1/1    Running  zone-1',
            'shop-api-7f9c8d6b5-h8tnw   1/1    Running  zone-2',
            'shop-api-7f9c8d6b5-zr4mf   1/1    Running  zone-3',
          ],
        },
        result: '3 pods running, one per zone.',
      },
      {
        title: 'Pod autoscaling under load',
        screen: 'Load test > 50,000 virtual users',
        instruction: 'Send a spike and watch pods and nodes scale.',
        why: 'The pod autoscaler adds pods in seconds. If nodes are full, the cluster adds nodes. Two layers of scaling, both automatic.',
        task: {
          kind: 'simulate',
          action: 'Start load test',
          metrics: [
            { label: 'Requests / s', unit: '', max: 20000 },
            { label: 'Pods', unit: '', max: 80 },
            { label: 'Nodes', unit: '', max: 20 },
            { label: 'p95 latency', unit: 'ms', max: 600 },
          ],
          frames: [
            { log: 'Baseline', tone: 'info', values: [800, 3, 3, 70] },
            { log: 'Spike: 15,000 requests/s', tone: 'warn', values: [15000, 3, 3, 520] },
            { log: 'Pod autoscaler: 3 → 30 pods in 20 s', tone: 'info', values: [15000, 30, 3, 300] },
            { log: 'Pods do not fit → cluster adds 7 nodes', tone: 'info', values: [15000, 30, 10, 180] },
            { log: 'Stable: 48 pods on 14 nodes', tone: 'ok', values: [17500, 48, 14, 85] },
          ],
        },
        result: 'Scaled in seconds, not minutes.',
      },
    ],
  },
  {
    slug: 'design-for-a-million',
    title: 'Capstone: design for 1 million users',
    mission: 'Marketing launches worldwide. Expect 1 million daily users and spikes of 50,000 requests per second. Make the right design call at each layer.',
    concept: [
      'At this scale, every layer must scale on its own and fail on its own without taking the rest down.',
      'Cache as much as possible as close to users as possible. The database is the hardest part to scale.',
      'Slow work (email, payments, images) goes to a queue, so user requests stay fast.',
    ],
    build: ['Full enterprise architecture', 'Capacity plan', 'Launch-day test'],
    architecture: ['dev', 'pipeline', 'registry', 'network', 'users', 'euUsers', 'waf', 'edge', 'lb', 'k8s', 'redis', 'db', 'vault', 'monitor', 'queue', 'euRegion'],
    steps: [
      {
        title: 'Do the math',
        screen: 'Capacity plan',
        instruction: 'One pod handles ~400 requests/s at 60% CPU. How many pods for a 50,000 req/s peak?',
        why: 'Capacity planning is simple division plus headroom. 50,000 / 400 = 125 pods. Add ~30% for a lost zone and deploys.',
        task: {
          kind: 'form',
          fields: [
            { kind: 'text', label: 'Pods at peak (with ~30% headroom)', placeholder: '165', accept: '^(16[0-9]|170)$', hint: '50,000 / 400 = 125. Then multiply by 1.3.' },
            {
              kind: 'select',
              label: 'Pod autoscaler max',
              options: [
                { label: '50', feedback: 'You would hit the ceiling at peak and drop users.' },
                { label: '250', feedback: 'Correct. Room above peak, still a cost cap.' },
              ],
              correct: 1,
              hint: 'The cap must sit above the peak.',
            },
          ],
          submit: 'Save plan',
        },
        result: 'Plan: ~165 pods at peak, cap 250.',
      },
      {
        title: 'Edge and caching',
        screen: 'Architecture > Edge',
        instruction: 'Most traffic is product pages that change a few times a day.',
        why: 'The cheapest request is the one that never reaches your servers. Short CDN caching of public pages can remove most of the load.',
        task: {
          kind: 'choice',
          question: 'How do you handle product page traffic?',
          options: [
            { label: 'Every request goes to the app', feedback: 'You would pay for 10x more servers than needed.' },
            { label: 'Cache public product pages at the CDN for 60 s; personal pages bypass', correct: true, feedback: 'Correct. ~80% of requests are served from the edge.' },
          ],
        },
        result: 'CDN absorbs ~80% of traffic.',
      },
      {
        title: 'Database at scale',
        screen: 'Architecture > Data',
        instruction: 'The primary database is at 85% CPU at peak.',
        why: 'Scale reads first (replicas + cache), fix slow queries, add connection pooling. Shard (split data) only when writes truly outgrow one machine.',
        task: {
          kind: 'choice',
          question: 'What do you do first?',
          options: [
            { label: 'Split the database into 16 shards now', feedback: 'Huge rewrite. Try the cheaper fixes first.' },
            { label: 'Send reads to replicas, add a connection pooler, fix the top slow queries', correct: true, feedback: 'Correct. Usually cuts primary load by more than half.' },
            { label: 'Disable backups to save CPU', feedback: 'You would lose the ability to recover data.' },
          ],
        },
        result: 'Reads on replicas, pooler added.',
      },
      {
        title: 'Slow work goes to a queue',
        screen: 'Architecture > Async',
        instruction: 'Checkout waits 3 s for the email and invoice PDF.',
        why: 'A queue takes the job and returns immediately. Workers process jobs at their own speed. If a worker crashes, the job waits in the queue and is retried.',
        task: {
          kind: 'choice',
          question: 'How do you make checkout fast?',
          options: [
            { label: pt('Put "order placed" on Service Bus; workers send email and PDF', 'Put "order placed" on SQS; workers send email and PDF', 'Put "order placed" on Pub/Sub; workers send email and PDF'), correct: true, feedback: 'Correct. Checkout returns in ~100 ms. Emails survive spikes.' },
            { label: 'Use a bigger server for checkout', feedback: 'The user still waits for slow third-party calls.' },
          ],
        },
        result: 'Checkout is fast; slow work runs in the background.',
      },
      {
        title: 'Protect against the spike',
        screen: 'Architecture > Resilience',
        instruction: 'A payment provider gets slow during the launch.',
        why: 'One slow dependency can tie up every server. Timeouts, retries with backoff, and a circuit breaker keep the rest of the app working.',
        task: {
          kind: 'choice',
          question: 'What protects the app?',
          options: [
            { label: 'Wait forever for the provider', feedback: 'All server threads get stuck. The whole site goes down.' },
            { label: '2 s timeout, 3 retries with backoff, circuit breaker; queue the payment if open', correct: true, feedback: 'Correct. Failures stay contained.' },
          ],
        },
        result: 'Slow dependencies cannot take down the site.',
      },
      {
        title: 'Launch-day test',
        screen: 'Load test > 1 million daily users, 50,000 req/s peak',
        instruction: 'Run the full launch simulation.',
        why: 'This is the whole system working together: edge, WAF, autoscaling, cache, replicas, queue, and monitoring.',
        task: {
          kind: 'simulate',
          action: 'Start launch',
          metrics: [
            { label: 'Requests / s', unit: '', max: 60000 },
            { label: 'Served by CDN', unit: '%', max: 100 },
            { label: 'Pods', unit: '', max: 250 },
            { label: 'Error rate', unit: '%', max: 5 },
          ],
          frames: [
            { log: 'Launch email sent. Traffic rising', tone: 'info', values: [8000, 78, 20, 0.05] },
            { log: 'Peak: 50,000 req/s across US + EU', tone: 'warn', values: [50000, 81, 120, 0.1] },
            { log: 'Bot surge blocked at WAF (12% of traffic)', tone: 'ok', values: [50000, 81, 120, 0.1] },
            { log: 'Payment provider slow → circuit open, payments queued', tone: 'warn', values: [49000, 82, 128, 0.2] },
            { log: 'Provider recovers → 4,200 queued payments processed in 3 min', tone: 'ok', values: [42000, 80, 110, 0.05] },
            { log: 'Launch complete. SLO 99.95%. Peak cost $41/hour', tone: 'ok', values: [12000, 79, 30, 0.04] },
          ],
        },
        result: 'You designed and ran a system for 1 million users.',
      },
    ],
  },
]
