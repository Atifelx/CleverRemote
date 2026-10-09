import { lines, pt, type LabSeed } from './types'

export const automationLabs: readonly LabSeed[] = [
  {
    slug: 'infrastructure-as-code',
    title: 'Build repeatable infrastructure as code',
    mission: 'Move the production stack out of the console and into reviewed Terraform so any environment can be rebuilt safely and drift is visible.',
    concept: [
      'Infrastructure as code is a desired-state contract: review the plan, then let the tool make reality match the code.',
      'Remote encrypted state and locking keep the team from overwriting each other during concurrent changes.',
      'Reusable modules remove copy-paste, while environment inputs keep production settings explicit.',
    ],
    build: ['Protected remote state', 'Reusable multi-cloud module', 'Plan, approval, apply, and drift workflow'],
    architecture: ['dev', 'registry', 'network', 'users', 'lb', 'scaleSet', 'redis', 'db'],
    steps: [
      {
        title: 'Protect the Terraform state',
        screen: pt(
          'Storage accounts > tfstateshop > Containers > tfstate',
          'S3 > tfstate-shop-prod > Properties',
          'Cloud Storage > tfstate-shop-prod > Configuration',
        ),
        instruction: 'Configure the shared state store so a lost laptop or two simultaneous applies cannot corrupt production.',
        why: 'State maps code to real resource IDs. If it leaks, is deleted, or is written by two jobs at once, the next apply can expose secrets or replace healthy infrastructure.',
        task: {
          kind: 'form',
          fields: [
            {
              kind: 'select',
              label: 'Encryption',
              options: [
                { label: 'Off', feedback: 'State can contain resource IDs and sensitive outputs.' },
                { label: pt('Microsoft-managed key', 'SSE-KMS', 'Google-managed encryption key'), feedback: 'Correct. State is encrypted at rest.' },
              ],
              correct: 1,
              hint: 'State must be encrypted.',
            },
            {
              kind: 'select',
              label: 'Version history',
              options: [
                { label: 'Disabled', feedback: 'A bad write would replace the only recoverable copy.' },
                { label: 'Enabled', feedback: 'Correct. Previous state versions can be recovered.' },
              ],
              correct: 1,
              hint: 'Keep recoverable state versions.',
            },
            {
              kind: 'select',
              label: 'Public access',
              options: [
                { label: 'Allow anonymous reads', feedback: 'Infrastructure metadata would be exposed.' },
                { label: 'Blocked', feedback: 'Correct. Only the deployment identity can read state.' },
              ],
              correct: 1,
              hint: 'State is never public.',
            },
            {
              kind: 'select',
              label: 'Concurrent writes',
              options: [
                { label: 'Last writer wins', feedback: 'Two applies could lose resources from state.' },
                { label: pt('Blob lease lock', 'S3 lockfile', 'Object generation lock'), feedback: 'Correct. A second apply waits or exits safely.' },
              ],
              correct: 1,
              hint: 'Only one apply may write at a time.',
            },
          ],
          submit: 'Save backend settings',
        },
        result: 'Remote state is encrypted, private, versioned, and locked.',
      },
      {
        title: 'Call the reusable production module',
        surface: 'github',
        screen: 'acme/shop-infra > environments/prod/main.tf',
        instruction: 'Fill the environment inputs without copying the network, compute, and database resources.',
        why: 'A module gives every environment the same tested building blocks. Inputs expose the few differences that reviewers should examine closely.',
        task: {
          kind: 'code',
          file: 'environments/prod/main.tf',
          code: pt(
            lines('module "shop" {', '  source        = "../../modules/shop"', '  cloud         = "azure"', '  region        = [[0]]', '  environment   = [[1]]', '  min_instances = [[2]]', '}'),
            lines('module "shop" {', '  source        = "../../modules/shop"', '  cloud         = "aws"', '  region        = [[0]]', '  environment   = [[1]]', '  min_instances = [[2]]', '}'),
            lines('module "shop" {', '  source        = "../../modules/shop"', '  cloud         = "gcp"', '  region        = [[0]]', '  environment   = [[1]]', '  min_instances = [[2]]', '}'),
          ),
          blanks: [
            {
              options: [
                { label: pt('"eastus"', '"us-east-1"', '"us-central1"'), feedback: 'Correct. Keep the existing production region.' },
                { label: pt('"australiaeast"', '"ap-southeast-2"', '"australia-southeast1"'), feedback: 'That would rebuild production far from its users and data.' },
              ],
              correct: 0,
            },
            {
              options: [
                { label: '"prod"', feedback: 'Correct. Policies and tags can key off the environment.' },
                { label: '"sandbox"', feedback: 'Sandbox defaults may remove HA and retention controls.' },
              ],
              correct: 0,
            },
            {
              options: [
                { label: '1', feedback: 'One instance cannot survive an update or zone failure.' },
                { label: '3', feedback: 'Correct. Production starts with one instance per zone.' },
              ],
              correct: 1,
            },
          ],
        },
        result: 'Production calls one reviewed module with explicit inputs.',
      },
      {
        title: 'Validate before touching the cloud',
        surface: 'local',
        screen: 'Terminal > shop-infra/environments/prod',
        instruction: 'Format, initialize, validate, and save a plan artifact.',
        why: 'Syntax and provider checks are cheap. A saved plan guarantees that approval and apply refer to the same proposed changes.',
        task: {
          kind: 'terminal',
          command: 'terraform fmt -check -recursive && terraform init && terraform validate && terraform plan -out=tfplan',
          output: pt(
            ['Backend: azurerm (state lock acquired)', 'Success! The configuration is valid.', 'Plan: 12 to add, 0 to change, 0 to destroy.'],
            ['Backend: s3 (state lock acquired)', 'Success! The configuration is valid.', 'Plan: 12 to add, 0 to change, 0 to destroy.'],
            ['Backend: gcs (state lock acquired)', 'Success! The configuration is valid.', 'Plan: 12 to add, 0 to change, 0 to destroy.'],
          ),
        },
        cli: 'terraform show tfplan',
        result: 'A reproducible plan artifact is ready for review.',
      },
      {
        title: 'Review a dangerous plan',
        surface: 'github',
        screen: 'acme/shop-infra > Pull request #184 > Terraform plan',
        instruction: 'The plan wants to replace the production database after an engine-version edit. Decide what happens next.',
        why: 'A green syntax check does not mean a safe change. Reviewers must inspect replacements, deletes, public exposure, and data-service changes.',
        task: {
          kind: 'choice',
          question: 'The plan says “1 to add, 0 to change, 1 to destroy” for the database. What should you do?',
          options: [
            { label: 'Approve because the plan completed successfully', feedback: 'Terraform can execute a destructive plan perfectly.' },
            { label: 'Stop, change the upgrade strategy, and require a new non-destructive plan', correct: true, feedback: 'Correct. Production data must not be replaced by surprise.' },
            { label: 'Apply manually so CI cannot see the destroy', feedback: 'That removes review and creates untracked drift.' },
          ],
        },
        result: 'The destructive plan is blocked before production changes.',
      },
      {
        title: 'Detect console drift',
        screen: pt('Virtual machine scale set > Networking', 'Auto Scaling group > Launch template', 'Instance group > Instance template'),
        instruction: 'Someone enabled a public IP during an incident. Run the drift check and choose the durable fix.',
        why: 'Emergency console changes sometimes happen. The next plan must expose them, then code should become the source of truth again.',
        task: {
          kind: 'simulate',
          action: 'Run scheduled drift check',
          frames: [
            { log: 'terraform plan -detailed-exitcode -refresh-only', tone: 'info' },
            { log: pt('Drift: public_ip_address = null → 20.62.14.9', 'Drift: associate_public_ip_address = false → true', 'Drift: access_config = absent → present'), tone: 'bad' },
            { log: 'Policy: production compute must not have public IPs', tone: 'warn' },
            { log: 'Pull request opened: remove emergency public access', tone: 'ok' },
          ],
        },
        cli: 'terraform plan -detailed-exitcode -refresh-only',
        result: 'Unreviewed public access is visible as drift and queued for removal.',
      },
      {
        title: 'Apply the approved plan',
        surface: 'github',
        screen: 'acme/shop-infra > Actions > apply #184',
        instruction: 'Merge the corrected pull request and apply its saved plan.',
        why: 'Production applies should use a protected branch, short-lived identity, one writer, and the exact plan reviewers approved.',
        task: {
          kind: 'simulate',
          action: 'Merge and apply',
          frames: [
            { log: 'OIDC login issued for acme/shop-infra:main', tone: 'ok' },
            { log: 'Remote state lock acquired', tone: 'info' },
            { log: 'Policy checks: 18 passed, 0 denied', tone: 'ok' },
            { log: 'Applying reviewed plan SHA 9f62c31', tone: 'info' },
            { log: 'Apply complete! Resources: 12 added, 0 changed, 0 destroyed.', tone: 'ok' },
            { log: 'Smoke check: /health 200 through the load balancer', tone: 'ok' },
          ],
        },
        result: 'Infrastructure is reproducible, reviewed, policy-checked, and healthy.',
      },
    ],
  },
  {
    slug: 'software-supply-chain',
    title: 'Secure the software supply chain',
    mission: 'Prove what is inside every image, block critical vulnerabilities, sign build provenance, and reject anything that did not come from the trusted pipeline.',
    concept: [
      'An SBOM is an inventory of packages inside an artifact; it makes newly disclosed vulnerabilities searchable in minutes.',
      'Provenance records who built an image, from which commit, with which workflow. A signature makes tampering detectable.',
      'Immutable digests and admission policy ensure production runs the artifact that was actually scanned and approved.',
    ],
    build: ['Pinned and hardened image', 'SBOM, vulnerability gate, and provenance', 'Signature enforcement before deploy'],
    architecture: ['dev', 'pipeline', 'registry', 'network', 'users', 'lb', 'scaleSet', 'redis', 'db'],
    steps: [
      {
        title: 'Make the build reproducible',
        surface: 'github',
        screen: 'acme/shop-api > Dockerfile',
        instruction: 'Pin the base image, install only production dependencies, and run as a non-root user.',
        why: 'Mutable tags can silently change between builds. A digest identifies exact bytes, while a non-root runtime limits damage if the app is compromised.',
        task: {
          kind: 'code',
          file: 'Dockerfile',
          code: lines('FROM node:22.12.0-alpine@[[0]]', 'WORKDIR /app', 'COPY package*.json ./', 'RUN npm ci [[1]]', 'COPY . .', 'USER [[2]]', 'CMD ["node", "server.js"]'),
          blanks: [
            {
              options: [
                { label: 'latest', feedback: 'The tag can point to different bytes tomorrow.' },
                { label: 'sha256:8c3f...91ab', feedback: 'Correct. The base image is immutable.' },
              ],
              correct: 1,
            },
            {
              options: [
                { label: '--omit=dev', feedback: 'Correct. Fewer packages mean a smaller attack surface.' },
                { label: '--force', feedback: 'This bypasses safeguards and still installs unnecessary packages.' },
              ],
              correct: 0,
            },
            {
              options: [
                { label: 'root', feedback: 'A compromised process would have container root privileges.' },
                { label: '10001', feedback: 'Correct. The application runs as an unprivileged UID.' },
              ],
              correct: 1,
            },
          ],
        },
        result: 'The image has a pinned base, minimal dependencies, and no root runtime.',
      },
      {
        title: 'Generate the SBOM and scan',
        surface: 'github',
        screen: 'acme/shop-api > Actions > supply-chain #212',
        instruction: 'Create a CycloneDX package inventory, then fail the job on fixable critical vulnerabilities.',
        why: 'The SBOM answers “where do we use this package?” The vulnerability gate stops known critical risk before an image reaches the registry.',
        task: {
          kind: 'terminal',
          command: 'syft shop-api:${GITHUB_SHA} -o cyclonedx-json=sbom.json && trivy image --exit-code 1 --severity CRITICAL --ignore-unfixed shop-api:${GITHUB_SHA}',
          output: [
            'SBOM: 186 packages written to sbom.json',
            'CRITICAL  openssl  3.3.1-r0  fixed in 3.3.2-r1',
            'Scan failed with exit code 1. Image was not pushed.',
          ],
        },
        result: 'A fixable critical vulnerability blocks the release.',
      },
      {
        title: 'Patch, rebuild, and rescan',
        surface: 'github',
        screen: 'acme/shop-api > Pull request #57 > Checks',
        instruction: 'Update the pinned base digest and run the full build again.',
        why: 'Do not waive a fixable critical issue to make the pipeline green. Rebuild from a patched base and regenerate evidence for the new bytes.',
        task: {
          kind: 'simulate',
          action: 'Merge patched base image',
          frames: [
            { log: 'Tests: 148 passed', tone: 'ok' },
            { log: 'Image built: shop-api@sha256:71ec...a402', tone: 'info' },
            { log: 'SBOM regenerated: 186 packages', tone: 'info' },
            { log: 'Vulnerability scan: 0 critical, 0 high, 3 low', tone: 'ok' },
            { log: 'Policy gate passed', tone: 'ok' },
          ],
        },
        result: 'The patched immutable image passes the security gate.',
      },
      {
        title: 'Sign the image and provenance',
        surface: 'github',
        screen: 'acme/shop-api > Actions > supply-chain #213',
        instruction: 'Use the workflow OIDC identity to sign the digest and attach build provenance without storing a signing key.',
        why: 'Keyless signing binds the artifact to a short-lived trusted CI identity. Provenance links the digest back to its repository, commit, and workflow.',
        task: {
          kind: 'terminal',
          command: 'cosign sign --yes "$IMAGE@$DIGEST" && cosign attest --yes --type slsaprovenance --predicate provenance.json "$IMAGE@$DIGEST"',
          output: pt(
            ['OIDC issuer: token.actions.githubusercontent.com', 'Identity: acme/shop-api/.github/workflows/supply-chain.yml@refs/heads/main', 'Signature and SLSA provenance stored with ACR digest sha256:71ec...a402'],
            ['OIDC issuer: token.actions.githubusercontent.com', 'Identity: acme/shop-api/.github/workflows/supply-chain.yml@refs/heads/main', 'Signature and SLSA provenance stored with ECR digest sha256:71ec...a402'],
            ['OIDC issuer: token.actions.githubusercontent.com', 'Identity: acme/shop-api/.github/workflows/supply-chain.yml@refs/heads/main', 'Signature and SLSA provenance stored with Artifact Registry digest sha256:71ec...a402'],
          ),
        },
        result: 'The registry now holds the image, SBOM, signature, and build provenance.',
      },
      {
        title: 'Enforce the deploy policy',
        screen: pt(
          'Defender for Cloud > Container registries > Deployment policy',
          'Amazon Inspector > ECR scanning > Deployment policy',
          'Binary Authorization > Policies > shop-prod',
        ),
        instruction: 'Allow only immutable images signed by the trusted main-branch workflow.',
        why: 'A dashboard warning is easy to ignore. Enforcement turns security evidence into a hard production boundary.',
        task: {
          kind: 'form',
          fields: [
            {
              kind: 'select',
              label: 'Image reference',
              options: [
                { label: 'Allow mutable tags such as latest', feedback: 'The tag can move after approval.' },
                { label: 'Require sha256 digest', feedback: 'Correct. Production names exact bytes.' },
              ],
              correct: 1,
              hint: 'Deploy immutable content.',
            },
            {
              kind: 'select',
              label: 'Trusted signer',
              options: [
                { label: 'Any GitHub repository', feedback: 'Another repository could sign malicious images.' },
                { label: 'acme/shop-api main-branch workflow only', feedback: 'Correct. Trust is scoped to the reviewed release path.' },
              ],
              correct: 1,
              hint: 'Bind trust to one repository and workflow.',
            },
            {
              kind: 'select',
              label: 'Required evidence',
              options: [
                { label: 'Signature only', feedback: 'You still cannot prove source and build workflow.' },
                { label: 'Signature + SBOM + provenance + passed vulnerability gate', feedback: 'Correct. All release evidence is required.' },
              ],
              correct: 1,
              hint: 'Require the complete evidence chain.',
            },
          ],
          submit: 'Enforce policy',
        },
        result: 'Production accepts only trusted, scanned, traceable image digests.',
      },
      {
        title: 'Try to deploy a tampered image',
        screen: pt('Deployment Center > Release validation', 'CodeDeploy > Deployment validation', 'Cloud Deploy > Release validation'),
        instruction: 'Attempt to deploy an image pushed from a developer laptop with a copied tag.',
        why: 'A control is not real until the team proves it blocks the attack path it was designed for.',
        task: {
          kind: 'simulate',
          action: 'Deploy shop-api:approved-copy',
          frames: [
            { log: 'Resolved tag approved-copy → sha256:0bad...cafe', tone: 'info' },
            { log: 'Digest differs from approved sha256:71ec...a402', tone: 'warn' },
            { log: 'Signature verification: FAILED — no trusted CI identity', tone: 'bad' },
            { log: 'Provenance verification: MISSING', tone: 'bad' },
            { log: 'Deployment denied before any instance was updated', tone: 'ok' },
          ],
        },
        result: 'A tampered image is rejected before it can run in production.',
      },
    ],
  },
]