import { pt, type LabTask, type PerPlatform } from './types'

export const services = {
  vm: pt('Virtual machines', 'EC2', 'Compute Engine'),
  network: pt('Virtual networks', 'VPC', 'VPC network'),
  registry: pt('Container registries', 'Elastic Container Registry', 'Artifact Registry'),
  lb: pt('Application gateways', 'Load Balancers', 'Load balancing'),
  scale: pt('Virtual machine scale sets', 'Auto Scaling groups', 'Instance groups'),
  redis: pt('Azure Managed Redis', 'ElastiCache', 'Memorystore'),
  db: pt('Azure Database for PostgreSQL', 'RDS', 'Cloud SQL'),
  k8s: pt('Kubernetes services', 'Elastic Kubernetes Service', 'Kubernetes Engine'),
  global: pt('Front Door and CDN profiles', 'CloudFront', 'Cloud CDN'),
  waf: pt('Web Application Firewall policies', 'WAF & Shield', 'Cloud Armor'),
  vault: pt('Key vaults', 'Secrets Manager', 'Secret Manager'),
  monitor: pt('Monitor', 'CloudWatch', 'Monitoring'),
} satisfies Record<string, PerPlatform<string>>

export type ServiceKey = keyof typeof services

const serviceOrder = Object.keys(services) as ServiceKey[]

export function openService(key: ServiceKey): LabTask {
  return {
    kind: 'click',
    layout: 'services',
    items: serviceOrder.map((serviceKey) => services[serviceKey]),
    target: serviceOrder.indexOf(key),
    hint: pt(
      `Look for "${services[key].azure}". Use the search bar if you cannot see it.`,
      `Look for "${services[key].aws}". Use the search bar if you cannot see it.`,
      `Look for "${services[key].gcp}". Use the search bar if you cannot see it.`,
    ),
  }
}

export const account = {
  kind: 'fixed' as const,
  label: pt('Subscription', 'Account', 'Project'),
  value: pt('Shop-Production', 'shop-prod (1234-5678-9012)', 'shop-prod'),
}

export const resourceGroup = {
  kind: 'fixed' as const,
  label: 'Resource group',
  value: 'rg-shop-prod',
  platforms: ['azure'] as const,
}

export const registryHost = pt(
  'shopregistry.azurecr.io/shop-api',
  '123456789012.dkr.ecr.us-east-1.amazonaws.com/shop-api',
  'us-central1-docker.pkg.dev/shop-prod/shop/shop-api',
)

export const usRegion = pt('East US', 'us-east-1', 'us-central1')
