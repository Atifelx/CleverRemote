import { pt, type LabSeed } from './types'

export const governanceLabs: readonly LabSeed[] = [
  {
    slug: 'disaster-recovery',
    title: 'Prove disaster recovery works',
    mission: 'Turn backups and a standby region into a measured recovery capability with explicit RTO/RPO targets, isolated restores, and a destructive game day.',
    concept: [
      'RPO is the maximum acceptable data loss. RTO is the maximum acceptable time to restore service.',
      'A backup is only a hope until it has been restored, checked for integrity, and used by the application.',
      'Recovery copies need a separate failure boundary: another region, restricted identity, immutability, and tested runbooks.',
    ],
    build: ['Business recovery targets', 'Immutable cross-region backups', 'Restore test and regional failover game day'],
    architecture: ['dev', 'pipeline', 'registry', 'network', 'users', 'euUsers', 'edge', 'lb', 'scaleSet', 'redis', 'db', 'euRegion'],
    steps: [
      {
        title: 'Set RTO and RPO from business impact',
        screen: 'Resilience workbook > shop-api > Recovery objectives',
        instruction: 'Choose targets for checkout: each minute down costs about $8,000, and losing more than five minutes of paid orders requires manual reconciliation.',
        why: 'Technology does not choose recovery objectives. Business loss sets the target, then architecture and operating cost must support it.',
        task: {
          kind: 'form',
          fields: [
            {
              kind: 'select',
              label: 'Recovery time objective (RTO)',
              options: [
                { label: '24 hours', feedback: 'That could lose millions in checkout revenue.' },
                { label: '15 minutes', feedback: 'Correct. The standby region and runbook can meet this target.' },
                { label: '0 seconds', feedback: 'Zero downtime is not credible for a regional disaster and would have extreme cost.' },
              ],
              correct: 1,
              hint: 'Balance business loss with a realistic recovery design.',
            },
            {
              kind: 'select',
              label: 'Recovery point objective (RPO)',
              options: [
                { label: '24 hours', feedback: 'A day of paid orders would need reconstruction.' },
                { label: '5 minutes', feedback: 'Correct. Replication plus transaction-log backups can support this.' },
                { label: 'No target', feedback: 'The team could not tell whether recovery succeeded.' },
              ],
              correct: 1,
              hint: 'Use the maximum acceptable order-data loss.',
            },
            {
              kind: 'select',
              label: 'Recovery tier',
              options: [
                { label: 'Restore from monthly backup', feedback: 'This cannot meet either objective.' },
                { label: 'Warm standby region + continuous database replication', feedback: 'Correct. Capacity exists before the incident and data lag stays low.' },
              ],
              correct: 1,
              hint: 'The design must meet both objectives.',
            },
          ],
          submit: 'Approve objectives',
        },
        result: 'Checkout target: RTO 15 minutes, RPO 5 minutes.',
      },
      {
        title: 'Make recovery copies survive an attack',
        screen: pt(
          'Backup center > Policies > db-shop-critical',
          'AWS Backup > Backup plans > db-shop-critical',
          'Backup and DR > Backup plans > db-shop-critical',
        ),
        instruction: 'Configure backups that survive a compromised production administrator and a failed region.',
        why: 'Ransomware and operator mistakes can delete ordinary backups. Immutability and a separate recovery identity prevent production access from erasing the last good copy.',
        task: {
          kind: 'form',
          fields: [
            {
              kind: 'select',
              label: 'Point-in-time recovery',
              options: [
                { label: 'Disabled', feedback: 'You could only restore to the last full backup.' },
                { label: 'Continuous logs, 7-day window', feedback: 'Correct. Restore to just before a bad change.' },
              ],
              correct: 1,
              hint: 'Protect against accidental writes and deletes.',
            },
            {
              kind: 'select',
              label: 'Daily recovery copy',
              options: [
                { label: 'Same account and same region', feedback: 'One compromised account or regional failure can remove both copies.' },
                { label: pt('Recovery vault in West Europe', 'Cross-account vault in eu-west-1', 'Recovery project in europe-west1'), feedback: 'Correct. The copy has a separate region and administrative boundary.' },
              ],
              correct: 1,
              hint: 'Use separate regional and identity boundaries.',
            },
            {
              kind: 'select',
              label: 'Retention protection',
              options: [
                { label: 'Any production admin can delete immediately', feedback: 'A stolen production role could erase recovery.' },
                { label: pt('Vault lock: immutable 35 days', 'Vault Lock: compliance mode, 35 days', 'Locked retention: 35 days'), feedback: 'Correct. Even administrators cannot shorten active retention.' },
              ],
              correct: 1,
              hint: 'Make the recovery window tamper-resistant.',
            },
          ],
          submit: 'Create backup policy',
        },
        result: 'Database recovery is point-in-time, cross-region, and immutable.',
      },
      {
        title: 'Restore into an isolated network',
        screen: pt('Backup center > Restore', 'AWS Backup > Recovery points > Restore', 'Backup and DR > Restore'),
        instruction: 'Restore yesterday’s database into the DR test network without overwriting production.',
        why: 'Recovery tests must never write into the live database or accept user traffic. An isolated restore lets the team inspect data before promotion.',
        task: {
          kind: 'terminal',
          command: pt(
            'az postgres flexible-server restore -g rg-shop-dr -n db-shop-restore --source-server db-shop --restore-time 2026-10-08T21:55:00Z',
            'aws rds restore-db-instance-to-point-in-time --source-db-instance-identifier db-shop --target-db-instance-identifier db-shop-restore --restore-time 2026-10-08T21:55:00Z --db-subnet-group-name dr-isolated',
            'gcloud sql backups restore 8421 --restore-instance=db-shop-restore --backup-instance=db-shop',
          ),
          output: pt(
            ['Restore accepted: db-shop-restore', 'Network: vnet-shop-dr/snet-isolated', 'Status: Ready in 6m 18s'],
            ['Restore accepted: db-shop-restore', 'Network: vpc-shop-dr/dr-isolated', 'Status: available in 6m 41s'],
            ['Restore accepted: db-shop-restore', 'Network: vpc-shop-dr/dr-isolated', 'Status: RUNNABLE in 5m 57s'],
          ),
        },
        result: 'A production recovery point is running safely in the isolated DR network.',
      },
      {
        title: 'Verify data and application behavior',
        surface: 'local',
        screen: 'DR runner > restore-verification #48',
        instruction: 'Run integrity checks, compare critical row counts, and point a disposable app instance at the restored database.',
        why: 'A database can report “restored” while tables, permissions, extensions, or application migrations are unusable. Recovery validation must test the whole service path.',
        task: {
          kind: 'simulate',
          action: 'Run recovery verification',
          frames: [
            { log: 'pg_verifybackup: manifest and checksums valid', tone: 'ok' },
            { log: 'orders: source 8,421,903 · restored 8,421,903', tone: 'ok' },
            { log: 'payments ledger checksum: MATCH', tone: 'ok' },
            { log: 'Schema migration level: 202610072130', tone: 'info' },
            { log: 'Disposable app: /health 200, checkout smoke test passed', tone: 'ok' },
            { log: 'Restore evidence attached to quarterly control report', tone: 'ok' },
          ],
        },
        result: 'The restored database is complete and usable by the application.',
      },
      {
        title: 'Destroy the primary region',
        screen: 'Resilience game day > Scenario: US region unavailable',
        instruction: 'Start the approved game day and execute the regional failover runbook.',
        why: 'A controlled destructive exercise exposes stale permissions, missing capacity, hidden dependencies, and slow human handoffs before a real disaster does.',
        task: {
          kind: 'simulate',
          action: 'Start regional failure',
          metrics: [
            { label: 'Elapsed', unit: ' min', max: 20 },
            { label: 'Replication lag', unit: ' s', max: 300 },
            { label: 'EU capacity', unit: '%', max: 100 },
            { label: 'Successful checks', unit: '%', max: 100 },
          ],
          frames: [
            { log: 'T+00:00 US health probes fail across all zones', tone: 'bad', values: [0, 38, 35, 0] },
            { log: 'T+02:10 Incident commander declares regional disaster', tone: 'warn', values: [2.2, 42, 35, 10] },
            { log: 'T+05:40 EU database replica promoted', tone: 'info', values: [5.7, 42, 50, 45] },
            { log: 'T+10:20 EU compute scaled to recovery capacity', tone: 'info', values: [10.3, 42, 100, 70] },
            { log: 'T+18:04 Manual traffic approval completed', tone: 'warn', values: [18.1, 42, 100, 95] },
            { log: 'Service healthy in Europe. RPO 42 s PASS, RTO 18m 04s FAIL', tone: 'bad', values: [18.1, 42, 100, 100] },
          ],
        },
        result: 'Data loss is within target, but a manual traffic gate makes recovery three minutes too slow.',
      },
      {
        title: 'Remove the slow recovery handoff',
        screen: 'Resilience workbook > Corrective actions > DR-48',
        instruction: 'Choose the corrective action, then rerun the game day.',
        why: 'A game day is valuable only when measured failures become engineering work and the team proves the fix in another exercise.',
        task: {
          kind: 'choice',
          question: 'Which change addresses the missed RTO without weakening safety?',
          options: [
            { label: 'Reduce backup retention from 35 days to 7', feedback: 'Retention does not speed traffic failover and reduces protection.' },
            { label: 'Pre-approve health-gated global routing after database promotion, with an operator abort', correct: true, feedback: 'Correct. Automation removes the slow handoff while preserving a stop control.' },
            { label: 'Skip database verification during future incidents', feedback: 'That could send writes to corrupt or incomplete data.' },
          ],
        },
        result: 'Rerun: RTO 9m 12s, RPO 36s. Both recovery objectives pass.',
      },
    ],
  },
  {
    slug: 'finops-governance',
    title: 'Control cloud cost and governance',
    mission: 'Make every dollar attributable, catch spend anomalies early, rightsize from evidence, and prevent unsafe or wasteful resources before they are created.',
    concept: [
      'FinOps is an engineering feedback loop: allocate cost, measure unit economics, optimize safely, and verify the result.',
      'Budgets report risk; policy prevents known-bad configurations such as public databases or unowned resources.',
      'Rightsizing uses sustained utilization and SLO headroom, not a one-hour snapshot or a blanket size reduction.',
    ],
    build: ['Allocation labels and forecast alerts', 'Cost anomaly investigation and rightsizing', 'Preventive organization policy'],
    architecture: ['dev', 'pipeline', 'registry', 'network', 'users', 'euUsers', 'edge', 'lb', 'scaleSet', 'redis', 'db', 'euRegion'],
    steps: [
      {
        title: 'Make every resource accountable',
        screen: pt('Cost Management > Tag governance', 'Billing and Cost Management > Cost allocation tags', 'Billing > Labels and cost attribution'),
        instruction: 'Choose the required metadata for production resources.',
        why: 'A cost report cannot drive action when half the bill is “untagged.” Ownership and business context must be enforced when infrastructure is created.',
        task: {
          kind: 'form',
          fields: [
            {
              kind: 'select',
              label: 'Required allocation keys',
              options: [
                { label: 'Name only', feedback: 'A name does not identify owner, environment, or business purpose.' },
                { label: pt('owner, environment, service, costCenter', 'owner, environment, service, cost-center', 'owner, environment, service, cost_center'), feedback: 'Correct. Cost can be grouped and routed to an accountable team.' },
              ],
              correct: 1,
              hint: 'Include technical and business ownership.',
            },
            {
              kind: 'select',
              label: 'Missing required metadata',
              options: [
                { label: 'Create it and ask someone later', feedback: 'Untagged spend accumulates and ownership stays unclear.' },
                { label: 'Deny production creation; audit existing resources', feedback: 'Correct. New debt is prevented while old debt is remediated.' },
              ],
              correct: 1,
              hint: 'Prevent new unallocated spend.',
            },
            {
              kind: 'text',
              label: 'Service value',
              placeholder: 'shop-api',
              accept: '^shop-api$',
              hint: 'Use the stable service name: shop-api.',
            },
          ],
          submit: 'Save allocation standard',
        },
        result: 'New production spend always has an owner, environment, service, and cost center.',
      },
      {
        title: 'Set forecasts and anomaly alerts',
        screen: pt('Cost Management > Budgets > shop-prod', 'AWS Budgets > shop-prod', 'Cloud Billing > Budgets & alerts > shop-prod'),
        instruction: 'Set a monthly guardrail that warns before the team has already overspent.',
        why: 'A 100% actual-spend alert arrives too late. Forecast and anomaly signals buy the team time to investigate before month end.',
        task: {
          kind: 'form',
          fields: [
            { kind: 'fixed', label: 'Monthly target', value: '$12,000' },
            {
              kind: 'select',
              label: 'Alert schedule',
              options: [
                { label: 'Actual spend at 100% only', feedback: 'The budget is already exhausted when the first alert arrives.' },
                { label: 'Actual 50% and 80%; forecast 100%', feedback: 'Correct. The team gets early and projected-spend warnings.' },
              ],
              correct: 1,
              hint: 'Alert on both actual and forecast spend.',
            },
            {
              kind: 'select',
              label: 'Daily anomaly detection',
              options: [
                { label: 'Off', feedback: 'A sudden leak may hide below the monthly threshold for days.' },
                { label: 'Alert service owner when daily cost is >30% above baseline', feedback: 'Correct. Sudden service-level changes get routed quickly.' },
              ],
              correct: 1,
              hint: 'Catch abrupt changes independently of the monthly budget.',
            },
          ],
          submit: 'Create budget',
        },
        result: 'The team receives actual, forecast, and daily anomaly signals.',
      },
      {
        title: 'Investigate an egress cost spike',
        screen: pt('Cost Management > Cost analysis', 'Cost Explorer > Cost and usage', 'Billing > Reports > Cost table'),
        instruction: 'Drill from the account total to service, region, and usage type.',
        why: 'Do not optimize the largest-looking service by guesswork. Cost dimensions reveal what changed and which team owns the fix.',
        task: {
          kind: 'simulate',
          action: 'Open anomaly details',
          metrics: [
            { label: 'Daily cost', unit: '$', max: 1000 },
            { label: 'Data egress', unit: ' GB', max: 5000 },
            { label: 'CDN hit rate', unit: '%', max: 100 },
          ],
          frames: [
            { log: 'Baseline: $390/day', tone: 'info', values: [390, 620, 81] },
            { log: 'Anomaly: $864/day (+121%)', tone: 'bad', values: [864, 4200, 18] },
            { log: 'Cost group: network egress, Europe → US', tone: 'warn', values: [864, 4200, 18] },
            { log: 'Change found: product responses now set Cache-Control: no-store', tone: 'bad', values: [864, 4200, 18] },
            { log: 'Owner: shop-api · commit 54be812', tone: 'info', values: [864, 4200, 18] },
          ],
        },
        result: 'A cache-header regression, not normal growth, caused the cost spike.',
      },
      {
        title: 'Rightsize without breaking the SLO',
        screen: pt('Advisor > Cost recommendations', 'Compute Optimizer > Recommendations', 'Recommender > VM rightsizing'),
        instruction: 'Use 30 days of utilization and the zone-failure requirement to choose a change.',
        why: 'Average CPU alone is misleading. Preserve peak headroom, rolling-deploy capacity, and one-zone failure tolerance before reducing cost.',
        task: {
          kind: 'choice',
          question: 'Twelve app VMs average 11% CPU, peak at 38%, and the service needs eight VMs if one zone fails. What is the safest optimization?',
          options: [
            { label: 'Reduce immediately to four VMs because average CPU is low', feedback: 'A zone failure or deployment would exhaust capacity.' },
            { label: 'Move to a smaller VM shape, keep a 9-VM minimum across three zones, load test, then lower gradually', correct: true, feedback: 'Correct. It captures savings while preserving failure and rollout headroom.' },
            { label: 'Turn off autoscaling and use one very large VM', feedback: 'That adds a single point of failure and removes elasticity.' },
          ],
        },
        result: 'A load-tested smaller shape cuts compute cost 31% while preserving zone resilience.',
      },
      {
        title: 'Prevent unsafe and wasteful resources',
        screen: pt('Azure Policy > Assignments > shop-production', 'Organizations > Policies > shop-production', 'Organization policies > shop-production'),
        instruction: 'Set preventive controls for production while leaving a time-limited exception path.',
        why: 'Review catches many mistakes; policy catches the repeatable ones every time. Exceptions must be explicit, approved, scoped, and expire automatically.',
        task: {
          kind: 'form',
          fields: [
            {
              kind: 'select',
              label: 'Public database endpoints',
              options: [
                { label: 'Audit only', feedback: 'The insecure database would still be created.' },
                { label: 'Deny in production', feedback: 'Correct. Data services stay on private networks.' },
              ],
              correct: 1,
              hint: 'Prevent public production data services.',
            },
            {
              kind: 'select',
              label: 'Allowed regions',
              options: [
                { label: 'Every global region', feedback: 'Data residency and support boundaries would be unenforced.' },
                { label: pt('East US and West Europe', 'us-east-1 and eu-west-1', 'us-central1 and europe-west1'), feedback: 'Correct. Deployments stay inside the approved operating footprint.' },
              ],
              correct: 1,
              hint: 'Match the approved US and Europe design.',
            },
            {
              kind: 'select',
              label: 'High-cost GPU resources',
              options: [
                { label: 'Always allowed', feedback: 'A typo or compromised pipeline could create major spend.' },
                { label: 'Deny unless an approved exception expires within 24 hours', feedback: 'Correct. Legitimate use remains possible without a permanent bypass.' },
              ],
              correct: 1,
              hint: 'Use short-lived, reviewable exceptions.',
            },
          ],
          submit: 'Assign policy',
        },
        result: 'Production policy blocks public data, unapproved regions, and unapproved high-cost resources.',
      },
      {
        title: 'Verify savings per customer',
        screen: 'FinOps review > shop-api > Monthly scorecard',
        instruction: 'Apply the cache fix and rightsizing plan, then compare cost and reliability by business unit.',
        why: 'A smaller bill is not success if traffic also fell or reliability degraded. Unit cost and SLOs prove whether efficiency actually improved.',
        task: {
          kind: 'simulate',
          action: 'Run 30-day scorecard',
          metrics: [
            { label: 'Monthly cost', unit: '$k', max: 16 },
            { label: 'Cost / 1k orders', unit: '$', max: 8 },
            { label: 'Availability', unit: '%', max: 100 },
            { label: 'Unallocated spend', unit: '%', max: 20 },
          ],
          frames: [
            { log: 'Before: 2.1M orders, $14.2k, 99.95% availability', tone: 'info', values: [14.2, 6.76, 99.95, 17] },
            { log: 'Cache fix deployed: CDN hit rate 18% → 83%', tone: 'ok', values: [11.8, 5.62, 99.95, 17] },
            { log: 'Compute rightsized after load and zone-failure tests', tone: 'ok', values: [9.8, 4.67, 99.95, 17] },
            { log: 'Allocation policy remediated 42 legacy resources', tone: 'ok', values: [9.8, 4.67, 99.95, 0] },
            { log: 'Result: 31% lower monthly cost, 31% lower unit cost, SLO unchanged', tone: 'ok', values: [9.8, 4.67, 99.95, 0] },
          ],
        },
        result: 'Spend is attributable and unit cost falls without sacrificing reliability.',
      },
    ],
  },
]