import { account, resourceGroup } from './common'
import { lines, pt, type LabSeed } from './types'

const deployStep = pt(
  lines(
    '      - uses: azure/login@v2',
    '        with:',
    '          client-id: ${{ vars.AZURE_CLIENT_ID }}',
    '          tenant-id: ${{ vars.AZURE_TENANT_ID }}',
    '          subscription-id: ${{ vars.AZURE_SUBSCRIPTION_ID }}',
    '      - run: az acr build -r shopregistry -t shop-api:${{ github.sha }} .',
  ),
  lines(
    '      - uses: aws-actions/configure-aws-credentials@v4',
    '        with:',
    '          role-to-assume: arn:aws:iam::123456789012:role/github-deploy',
    '          aws-region: us-east-1',
    '      - run: ./scripts/build-and-push.sh ${{ github.sha }}',
  ),
  lines(
    '      - uses: google-github-actions/auth@v2',
    '        with:',
    '          workload_identity_provider: ${{ vars.GCP_WIF_PROVIDER }}',
    '          service_account: github-deploy@shop-prod.iam.gserviceaccount.com',
    '      - run: ./scripts/build-and-push.sh ${{ github.sha }}',
  ),
)

export const deliveryLabs: readonly LabSeed[] = [
  {
    slug: 'cicd-pipeline',
    title: 'Automate deploys with CI/CD',
    mission: 'Every merge to main should test, build, scan, and roll out a new version safely, with no one running commands by hand.',
    concept: [
      'CI (continuous integration): every change is tested and built automatically.',
      'CD (continuous delivery): the same tested image is rolled out to servers automatically.',
      'A rolling update replaces servers a few at a time, so users never see downtime.',
    ],
    build: ['GitHub Actions pipeline', 'Passwordless cloud login (OIDC)', 'Rolling update with health gate'],
    architecture: ['dev', 'pipeline', 'registry', 'network', 'users', 'lb', 'scaleSet', 'redis', 'db'],
    steps: [
      {
        title: 'Let GitHub log in without a password',
        screen: pt('Home > Microsoft Entra ID > App registrations > github-deploy > Federated credentials', 'IAM > Identity providers > token.actions.githubusercontent.com', 'IAM > Workload Identity Federation > github-pool'),
        instruction: 'Trust GitHub\'s identity for your repo and only the main branch.',
        why: 'The old way was a cloud password stored in GitHub. If it leaks, attackers own your cloud. With OIDC, GitHub gets a short-lived token for each run, only for your repo and branch.',
        task: {
          kind: 'form',
          fields: [
            { kind: 'fixed', label: 'Issuer', value: 'https://token.actions.githubusercontent.com' },
            { kind: 'text', label: 'Repository', placeholder: 'acme/shop-api', accept: '^acme/shop-api$', hint: 'Type acme/shop-api.' },
            {
              kind: 'select',
              label: 'Allowed branch',
              options: [
                { label: 'Any branch (*)', feedback: 'Anyone who can push a branch could deploy to production.' },
                { label: 'main only', feedback: 'Correct. Only reviewed, merged code can deploy.' },
              ],
              correct: 1,
              hint: 'Only reviewed code reaches production.',
            },
            {
              kind: 'select',
              label: 'Permissions',
              options: [
                { label: pt('Owner on subscription', 'AdministratorAccess', 'Owner on project'), feedback: 'A pipeline bug could delete everything.' },
                { label: pt('AcrPush + Contributor on rg-shop-prod only', 'Push to ECR + update asg-shop only', 'Artifact Registry Writer + Compute Instance Admin on mig-shop'), feedback: 'Correct. Just enough to push and roll out.' },
              ],
              correct: 1,
              hint: 'Least privilege, even for robots.',
            },
          ],
          submit: 'Add',
        },
        result: 'GitHub can deploy with short-lived tokens. No stored passwords.',
      },
      {
        title: 'Write the pipeline',
        surface: 'github',
        screen: 'acme/shop-api > .github/workflows/deploy.yml',
        instruction: 'Fill the blanks: run on main, test before build, and roll out by commit ID.',
        why: 'Order matters. Tests first: a failing test must stop the pipeline before anything is built or shipped. The commit ID tag links each server back to the exact code.',
        task: {
          kind: 'code',
          file: '.github/workflows/deploy.yml',
          code: pt(
            lines('name: deploy', 'on:', '  push:', '    branches: [[[0]]]', 'permissions:', '  id-token: write', '  contents: read', 'jobs:', '  ship:', '    runs-on: ubuntu-latest', '    steps:', '      - uses: actions/checkout@v4', '      - run: npm ci && [[1]]', deployStep.azure, '      - run: trivy image --exit-code 1 --severity CRITICAL $IMAGE', '      - run: ./scripts/rolling-update.sh [[2]]'),
            lines('name: deploy', 'on:', '  push:', '    branches: [[[0]]]', 'permissions:', '  id-token: write', '  contents: read', 'jobs:', '  ship:', '    runs-on: ubuntu-latest', '    steps:', '      - uses: actions/checkout@v4', '      - run: npm ci && [[1]]', deployStep.aws, '      - run: trivy image --exit-code 1 --severity CRITICAL $IMAGE', '      - run: ./scripts/rolling-update.sh [[2]]'),
            lines('name: deploy', 'on:', '  push:', '    branches: [[[0]]]', 'permissions:', '  id-token: write', '  contents: read', 'jobs:', '  ship:', '    runs-on: ubuntu-latest', '    steps:', '      - uses: actions/checkout@v4', '      - run: npm ci && [[1]]', deployStep.gcp, '      - run: trivy image --exit-code 1 --severity CRITICAL $IMAGE', '      - run: ./scripts/rolling-update.sh [[2]]'),
          ),
          blanks: [
            {
              options: [
                { label: 'main', feedback: 'Correct. Deploy only merged code.' },
                { label: '"*"', feedback: 'Every experiment branch would deploy to production.' },
              ],
              correct: 0,
            },
            {
              options: [
                { label: 'npm test', feedback: 'Correct. A failing test stops everything.' },
                { label: 'echo "skip tests"', feedback: 'Broken code would reach users.' },
              ],
              correct: 0,
            },
            {
              options: [
                { label: 'latest', feedback: 'Rollback would be impossible to target.' },
                { label: '${{ github.sha }}', feedback: 'Correct. The exact commit just built and scanned.' },
              ],
              correct: 1,
            },
          ],
        },
        result: 'Pipeline: test → build → scan → roll out.',
      },
      {
        title: 'Rolling update settings',
        screen: pt('Virtual machine scale set > Upgrade policy', 'Auto Scaling group > Instance refresh', 'Instance group > Update VMs'),
        instruction: 'Choose how fast old servers are replaced.',
        why: 'Replace a few servers at a time. Each new one must pass /health before the next batch. If new servers fail, the rollout stops and most users stay on the old, working version.',
        task: {
          kind: 'form',
          fields: [
            {
              kind: 'select',
              label: 'Batch size',
              options: [
                { label: '100% at once', feedback: 'If the new version is broken, the whole site breaks.' },
                { label: '20% at a time', feedback: 'Correct. Small blast radius, still finishes fast.' },
              ],
              correct: 1,
              hint: 'Limit the damage if the new version is bad.',
            },
            {
              kind: 'select',
              label: pt('Minimum healthy', 'Minimum healthy percentage', 'Max unavailable'),
              options: [
                { label: pt('90% healthy', '90%', '10%'), feedback: 'Correct. Users always have enough healthy servers.' },
                { label: pt('0% healthy', '0%', '100%'), feedback: 'All servers could be down at the same time.' },
              ],
              correct: 0,
              hint: 'Keep enough servers serving users.',
            },
            {
              kind: 'select',
              label: 'If new servers fail health checks',
              options: [
                { label: 'Stop and roll back automatically', feedback: 'Correct. Bad versions never reach everyone.' },
                { label: 'Keep going', feedback: 'You would replace good servers with broken ones.' },
              ],
              correct: 0,
              hint: 'Stop bad versions early.',
            },
          ],
          submit: 'Save',
        },
        cli: pt(
          'az vmss update -g rg-shop-prod -n vmss-shop --set upgradePolicy.mode=Rolling \\\n  upgradePolicy.rollingUpgradePolicy.maxBatchInstancePercent=20 \\\n  upgradePolicy.rollingUpgradePolicy.maxUnhealthyInstancePercent=10',
          'aws autoscaling start-instance-refresh --auto-scaling-group-name asg-shop \\\n  --preferences \'{"MinHealthyPercentage":90,"AutoRollback":true}\'',
          'gcloud compute instance-groups managed rolling-action start-update mig-shop \\\n  --region=us-central1 --version=template=it-shop-v2 --max-unavailable=10% \\\n  --max-surge=20%',
        ),
        result: 'Rolling update: 20% batches, health-gated, auto rollback.',
      },
      {
        title: 'Merge a change',
        surface: 'github',
        screen: 'acme/shop-api > Actions > deploy #128',
        instruction: 'Merge pull request #42 and watch the pipeline.',
        why: 'This is daily life for a DevOps team: merge, watch the pipeline, see it roll out, with no logins to servers.',
        task: {
          kind: 'simulate',
          action: 'Merge pull request #42',
          frames: [
            { log: 'Checkout 7a1d9e4 (main)', tone: 'info' },
            { log: 'npm test — 148 passed', tone: 'ok' },
            { log: 'Build image shop-api:7a1d9e4 (cached layers: 4/5)', tone: 'ok' },
            { log: 'Scan: 0 critical, 2 low', tone: 'ok' },
            { log: 'Cloud login via OIDC — token valid 10 min', tone: 'ok' },
            { log: 'Rolling update batch 1/5: 1 server on 7a1d9e4 → /health OK', tone: 'info' },
            { log: 'Batches 2–5 done. 5/5 servers on 7a1d9e4', tone: 'ok' },
            { log: 'Deploy finished in 6m 12s. Errors during rollout: 0', tone: 'ok' },
          ],
        },
        result: 'Version 7a1d9e4 is live with zero downtime.',
      },
      {
        title: 'Now ship a bad version',
        surface: 'github',
        screen: 'acme/shop-api > Actions > deploy #129',
        instruction: 'Merge PR #43. It has a bug that makes /health fail.',
        why: 'Pipelines are not only for speed. Their real job is to stop bad versions before they reach everyone.',
        task: {
          kind: 'simulate',
          action: 'Merge pull request #43',
          frames: [
            { log: 'Tests pass (the bug only shows with real config)', tone: 'info' },
            { log: 'Rolling update batch 1/5: 1 server on c44b2e1', tone: 'info' },
            { log: 'Health probe on new server: FAIL, FAIL, FAIL', tone: 'bad' },
            { log: 'Rollout stopped. Rolling back batch 1 to 7a1d9e4', tone: 'warn' },
            { log: 'All servers healthy on 7a1d9e4. User error rate stayed below 0.5%', tone: 'ok' },
          ],
        },
        result: 'The bad version only touched one server for 40 seconds.',
      },
    ],
  },
  {
    slug: 'go-global',
    title: 'Go global: add Europe',
    mission: 'Half your new users are in Europe and the app feels slow there. Add a European region and route each user to the nearest one.',
    concept: [
      'Distance adds latency. Light needs time to cross the ocean: about 80–100 ms for one round trip US ↔ Europe.',
      'A global front door (anycast + CDN) sends each user to the nearest healthy region.',
      'Data is the hard part. Reads can be local. Writes need a clear plan.',
    ],
    build: ['Second region in Europe', 'Global front door with CDN', 'Read replica + local Redis in Europe'],
    architecture: ['dev', 'pipeline', 'registry', 'network', 'users', 'euUsers', 'edge', 'lb', 'scaleSet', 'redis', 'db', 'euRegion'],
    steps: [
      {
        title: 'See the problem',
        screen: pt('Monitor > Application Insights > Performance by country', 'CloudWatch > RUM > Performance by country', 'Monitoring > Latency by client country'),
        instruction: 'Look at latency by country.',
        why: 'Always measure before you build. A second region costs real money, so prove the need first.',
        task: {
          kind: 'simulate',
          action: 'Load report',
          metrics: [
            { label: 'US p95', unit: 'ms', max: 900 },
            { label: 'UK p95', unit: 'ms', max: 900 },
            { label: 'Germany p95', unit: 'ms', max: 900 },
            { label: 'EU share of users', unit: '%', max: 100 },
          ],
          frames: [
            { log: 'All traffic is served from the US region', tone: 'info', values: [120, 610, 690, 46] },
            { log: 'Most EU delay is network distance, not server time (server: 35 ms)', tone: 'warn', values: [120, 610, 690, 46] },
          ],
        },
        result: 'EU users wait ~5x longer. Distance is the cause.',
      },
      {
        title: 'Copy the stack to Europe',
        screen: pt('Home > Deployments > Deploy template', 'CloudFormation > Stacks > Create stack', 'Infrastructure Manager > Deployments > Create'),
        instruction: 'Deploy the same infrastructure in a European region, with a new address range.',
        why: 'Everything you built (network, VM group, Redis) is code (Infrastructure as Code). You deploy the same code with new settings, instead of clicking it all again.',
        task: {
          kind: 'form',
          fields: [
            account,
            {
              kind: 'select',
              label: 'Region',
              options: [
                { label: pt('West Europe (Netherlands)', 'eu-west-1 (Ireland)', 'europe-west1 (Belgium)'), feedback: 'Correct. Central to most EU users.' },
                { label: pt('East US 2', 'us-east-2', 'us-east1'), feedback: 'That is still in the US.' },
              ],
              correct: 0,
              hint: 'Close to European users.',
            },
            {
              kind: 'select',
              label: 'Network range',
              options: [
                { label: '10.0.0.0/16 (same as US)', feedback: 'Overlapping ranges cannot be connected later.' },
                { label: '10.1.0.0/16', feedback: 'Correct. No overlap, so the regions can be peered.' },
              ],
              correct: 1,
              hint: 'Regions must not share address ranges.',
            },
            { kind: 'fixed', label: 'Template', value: 'shop-region (network + VM group + Redis), same as US' },
          ],
          submit: 'Deploy',
        },
        cli: pt(
          'az deployment group create -g rg-shop-eu -f main.bicep \\\n  -p location=westeurope addressSpace=10.1.0.0/16',
          'aws cloudformation deploy --stack-name shop-eu --region eu-west-1 \\\n  --template-file shop-region.yaml --parameter-overrides VpcCidr=10.1.0.0/16',
          'terraform apply -var="region=europe-west1" -var="subnet_cidr=10.1.2.0/24"',
        ),
        result: 'Europe stack running in 10.1.0.0/16.',
      },
      {
        title: 'Connect the two regions privately',
        screen: pt('Home > vnet-shop > Peerings > + Add', 'VPC > Peering connections > Create', 'VPC network > vpc-shop > Subnets > Add subnet (europe-west1)'),
        instruction: pt('Peer the US and EU networks.', 'Create a peering between the US and EU VPCs.', 'Add a European subnet to the same global VPC.'),
        why: pt(
          'Peering lets the EU servers reach the US database privately over Microsoft\'s backbone, not the public internet.',
          'Peering lets EU servers reach the US database privately over the AWS backbone. For many VPCs, use a Transit Gateway instead.',
          'Google VPCs are global. Adding a subnet in Europe means the regions already talk privately over Google\'s backbone.',
        ),
        task: {
          kind: 'choice',
          question: 'How should EU servers reach the US primary database?',
          options: [
            { label: 'Over the internet with a public database IP', feedback: 'The database would be exposed to everyone.' },
            { label: pt('VNet peering (private backbone)', 'VPC peering / Transit Gateway', 'Same global VPC (private backbone)'), correct: true, feedback: 'Correct. Private, encrypted, and fast.' },
          ],
        },
        result: 'Regions connected privately.',
      },
      {
        title: 'Plan the data',
        screen: 'Design decision',
        instruction: 'Choose a database layout for two regions.',
        why: 'Reads can be fast everywhere with replicas. Writes go to one primary to keep data correct. A cross-region write takes ~90 ms, which is fine for orders and keeps things simple.',
        task: {
          kind: 'choice',
          question: 'What is the safest starting design?',
          options: [
            { label: 'Two separate databases, one per region', feedback: 'A user who travels would see different orders. Data drifts.' },
            { label: 'One primary in US + read replica in EU. EU reads locally, writes go to US', correct: true, feedback: 'Correct. Simple, correct data, fast reads. The replica can become primary if the US fails.' },
            { label: 'Multi-primary writes in both regions', feedback: pt('Possible with Cosmos DB, but conflict handling is hard. Use it only when you must.', 'Possible with Aurora DSQL or DynamoDB global tables, but conflict handling is hard. Use it only when you must.', 'Possible with Spanner, but it costs more and needs a new data model. Use it only when you must.') },
          ],
        },
        result: 'US primary + EU read replica. Each region has its own Redis.',
      },
      {
        title: 'Create the global front door',
        screen: pt('Home > Front Door and CDN profiles > Create', 'CloudFront > Distributions > Create distribution', 'Load balancing > Create global external Application Load Balancer'),
        instruction: 'Add both regions as origins, route by latency, and cache static files.',
        why: 'The front door has points of presence in hundreds of cities. Users connect to the nearest one, then travel on the cloud\'s fast private network. Static files are cached right there.',
        task: {
          kind: 'form',
          fields: [
            account,
            resourceGroup,
            { kind: 'text', label: 'Name', placeholder: 'fd-shop', accept: '^(fd|cf|glb)-shop$', hint: pt('Type fd-shop.', 'Type cf-shop.', 'Type glb-shop.') },
            { kind: 'fixed', label: pt('Origins', 'Origins (with Route 53 latency routing)', 'Backends'), value: 'lb-shop (US) + lb-shop-eu (Europe)' },
            {
              kind: 'select',
              label: 'Routing',
              options: [
                { label: 'Always US, EU only if US is down', feedback: 'EU users would stay slow every day.' },
                { label: 'Lowest latency + health checks', feedback: 'Correct. Nearest healthy region wins.' },
                { label: 'Random 50/50', feedback: 'Half of US users would be sent to Europe.' },
              ],
              correct: 1,
              hint: 'Nearest healthy region.',
            },
            {
              kind: 'select',
              label: 'Cache /static/*',
              options: [
                { label: 'Yes, 1 day', feedback: 'Correct. Images and JS load from the nearest city.' },
                { label: 'No', feedback: 'Every image would travel to the origin.' },
              ],
              correct: 0,
              hint: 'Static files never change between deploys.',
            },
            {
              kind: 'select',
              label: 'Cache /api/*',
              options: [
                { label: 'Yes, 1 day', feedback: 'Users would see other people\'s carts and stale prices.' },
                { label: 'No (pass through)', feedback: 'Correct. API answers are personal and change often.' },
              ],
              correct: 1,
              hint: 'API answers are per user.',
            },
          ],
          submit: 'Create',
        },
        cli: pt(
          'az afd profile create -g rg-shop-prod -n fd-shop --sku Premium_AzureFrontDoor\naz afd origin create -g rg-shop-prod --profile-name fd-shop \\\n  --origin-group-name shop --origin-name eu --host-name lb-shop-eu.westeurope.cloudapp.azure.com',
          'aws route53 change-resource-record-sets --hosted-zone-id Z123 \\\n  --change-batch file://latency-records.json\naws cloudfront create-distribution --distribution-config file://cf-shop.json',
          'gcloud compute backend-services add-backend glb-shop --global \\\n  --instance-group=mig-shop-eu --instance-group-region=europe-west1',
        ),
        result: 'Global front door routes users to the nearest healthy region.',
      },
      {
        title: 'Measure again',
        screen: 'Global latency map',
        instruction: 'Compare latency before and after.',
        why: 'Check that the money spent actually helped users.',
        task: {
          kind: 'simulate',
          action: 'Load report',
          metrics: [
            { label: 'US p95', unit: 'ms', max: 900 },
            { label: 'UK p95', unit: 'ms', max: 900 },
            { label: 'Germany p95', unit: 'ms', max: 900 },
            { label: 'Static from cache', unit: '%', max: 100 },
          ],
          frames: [
            { log: 'Before: one US region', tone: 'warn', values: [120, 610, 690, 0] },
            { log: 'After: EU users served from Europe, reads from the EU replica', tone: 'ok', values: [110, 95, 105, 91] },
          ],
        },
        result: 'EU latency down from ~650 ms to ~100 ms.',
      },
      {
        title: 'Region failover drill',
        screen: 'Chaos test > US region outage',
        instruction: 'Turn off the whole US region.',
        why: 'A second region is also your disaster plan. Test it before you need it.',
        task: {
          kind: 'simulate',
          action: 'Fail US region',
          frames: [
            { log: 'US load balancer health checks fail', tone: 'bad' },
            { log: 'Front door sends all users to Europe within 30 s', tone: 'warn' },
            { log: 'EU replica promoted to primary (planned runbook, ~2 min)', tone: 'warn' },
            { log: 'EU VM group autoscales from 4 to 14 servers', tone: 'info' },
            { log: 'All users served. US users see +90 ms latency', tone: 'ok' },
          ],
        },
        result: 'The site survived losing a whole region.',
      },
    ],
  },
]
