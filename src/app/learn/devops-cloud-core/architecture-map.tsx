import { forPlatform, pt, type ArchitectureNodeId, type LabPlatform, type PlatformText } from '@/lib/devops-lab'

import styles from './lab.module.css'

type MapNodeId = Exclude<ArchitectureNodeId, 'network' | 'vm' | 'scaleSet' | 'k8s'> | 'compute'

const W = 130
const H = 56

const positions: Record<MapNodeId, { x: number, y: number }> = {
  dev: { x: 20, y: 20 },
  pipeline: { x: 180, y: 20 },
  registry: { x: 340, y: 20 },
  users: { x: 20, y: 180 },
  euUsers: { x: 20, y: 330 },
  edge: { x: 180, y: 255 },
  waf: { x: 340, y: 255 },
  lb: { x: 520, y: 255 },
  compute: { x: 680, y: 255 },
  monitor: { x: 520, y: 135 },
  vault: { x: 840, y: 135 },
  redis: { x: 840, y: 255 },
  db: { x: 840, y: 375 },
  queue: { x: 680, y: 375 },
  euRegion: { x: 500, y: 482 },
}

const labels: Record<Exclude<MapNodeId, 'compute'> | 'vm' | 'scaleSet' | 'k8s', { title: PlatformText, detail: PlatformText }> = {
  dev: { title: 'Your laptop', detail: 'code + Dockerfile' },
  pipeline: { title: 'CI/CD pipeline', detail: 'GitHub Actions' },
  registry: { title: pt('Azure Registry', 'ECR', 'Artifact Registry'), detail: 'versioned images' },
  users: { title: 'Users', detail: 'United States' },
  euUsers: { title: 'Users', detail: 'Europe' },
  edge: { title: pt('Front Door', 'CloudFront', 'Global LB'), detail: pt('CDN · nearest region', 'CDN + Route 53', 'Cloud CDN · nearest') },
  waf: { title: pt('WAF policy', 'WAF + Shield', 'Cloud Armor'), detail: 'blocks attacks' },
  lb: { title: pt('App Gateway', 'ALB', 'HTTPS LB'), detail: 'HTTPS + health' },
  vm: { title: pt('Virtual machine', 'EC2 instance', 'VM instance'), detail: 'vm-shop-1' },
  scaleSet: { title: pt('VM scale set', 'Auto Scaling', 'Instance group'), detail: '3 zones · 2–20 VMs' },
  k8s: { title: pt('AKS cluster', 'EKS cluster', 'GKE cluster'), detail: 'pods in 3 zones' },
  monitor: { title: pt('Azure Monitor', 'CloudWatch', 'Cloud Monitoring'), detail: 'SLO + alerts' },
  vault: { title: pt('Key Vault', 'Secrets Manager', 'Secret Manager'), detail: 'secrets, rotated' },
  redis: { title: pt('Managed Redis', 'ElastiCache', 'Memorystore'), detail: 'cache + sessions' },
  db: { title: pt('PostgreSQL', 'RDS PostgreSQL', 'Cloud SQL'), detail: 'primary + standby' },
  queue: { title: pt('Service Bus', 'SQS', 'Pub/Sub'), detail: 'background jobs' },
  euRegion: { title: 'Europe region', detail: 'LB + servers + Redis + DB replica' },
}

type Edge = { from: MapNodeId, to: MapNodeId, path: string, label?: string, labelAt?: [number, number], dashed?: boolean, traffic?: boolean }

function edgesFor(present: Set<MapNodeId>): Edge[] {
  const edges: Edge[] = []
  const add = (edge: Edge) => {
    if (present.has(edge.from) && present.has(edge.to)) edges.push(edge)
  }

  if (present.has('pipeline')) {
    add({ from: 'dev', to: 'pipeline', path: 'M150 48 H180' })
    add({ from: 'pipeline', to: 'registry', path: 'M310 48 H340' })
  } else {
    add({ from: 'dev', to: 'registry', path: 'M150 48 H340', label: 'docker push', labelAt: [210, 40] })
  }
  add({ from: 'registry', to: 'compute', path: 'M470 48 H745 V255', label: 'pull image', labelAt: [560, 40], dashed: true })

  const entry = (['users', 'edge', 'waf', 'lb'] as const).filter((id) => present.has(id))
  const chainPaths: Record<string, string> = {
    'users-edge': 'M150 208 H165 V270 H180',
    'users-waf': 'M150 208 H325 V283 H340',
    'users-lb': 'M150 208 H490 V283 H520',
    'edge-waf': 'M310 283 H340',
    'edge-lb': 'M310 283 H520',
    'waf-lb': 'M470 283 H520',
  }
  for (let index = 0; index < entry.length - 1; index += 1) {
    const from = entry[index]
    const to = entry[index + 1]
    add({ from, to, path: chainPaths[`${from}-${to}`], traffic: true })
  }
  add({ from: 'euUsers', to: 'edge', path: 'M150 358 H165 V296 H180', traffic: true })
  add({ from: 'lb', to: 'compute', path: 'M650 283 H680', traffic: true })
  add({ from: 'compute', to: 'redis', path: 'M810 283 H840', traffic: true })
  add({ from: 'compute', to: 'db', path: 'M810 296 H825 V403 H840' })
  add({ from: 'compute', to: 'vault', path: 'M810 270 H825 V163 H840', dashed: true })
  add({ from: 'compute', to: 'monitor', path: 'M720 255 V223 H585 V191', dashed: true })
  add({ from: 'compute', to: 'queue', path: 'M745 311 V375' })
  add({ from: 'edge', to: 'euRegion', path: 'M245 311 V510 H500', label: 'EU traffic', labelAt: [300, 502], traffic: true })
  add({ from: 'db', to: 'euRegion', path: 'M905 431 V482', label: 'replica', labelAt: [912, 462], dashed: true })

  return edges
}

type ArchitectureMapProps = {
  nodes: readonly ArchitectureNodeId[]
  newNodes: readonly ArchitectureNodeId[]
  platform: LabPlatform
}

export default function ArchitectureMap({ nodes, newNodes, platform }: ArchitectureMapProps) {
  const computeKind = nodes.includes('k8s') ? 'k8s' : nodes.includes('scaleSet') ? 'scaleSet' : nodes.includes('vm') ? 'vm' : undefined
  const present = new Set<MapNodeId>(
    nodes.flatMap((id): MapNodeId[] => {
      if (id === 'network') return []
      if (id === 'vm' || id === 'scaleSet' || id === 'k8s') return id === computeKind ? ['compute'] : []
      return [id]
    }),
  )
  const isNew = (id: MapNodeId) => (id === 'compute'
    ? Boolean(computeKind && newNodes.includes(computeKind))
    : newNodes.includes(id))
  const edges = edgesFor(present)
  const hasNetwork = nodes.includes('network')

  return (
    <svg className={styles.archMap} viewBox="0 0 1000 560" role="img" aria-label="Architecture you have built so far">
      <defs>
        <marker id="arch-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" />
        </marker>
      </defs>

      {hasNetwork ? (
        <g className={`${styles.archRegion} ${newNodes.includes('network') ? styles.archNew : ''}`}>
          <rect x="500" y="110" width="480" height="350" rx="12" />
          <text x="516" y="132">US region · private network 10.0.0.0/16</text>
        </g>
      ) : null}

      {edges.map((edge) => (
        <g key={`${edge.from}-${edge.to}`}>
          <path className={`${styles.archEdge} ${edge.dashed ? styles.archEdgeDashed : ''}`} d={edge.path} markerEnd="url(#arch-arrow)" />
          {edge.traffic ? (
            <circle className={styles.archPacket} r="4.5">
              <animateMotion dur="2.4s" repeatCount="indefinite" path={edge.path} />
            </circle>
          ) : null}
        </g>
      ))}

      {[...present].map((id) => {
        const { x, y } = positions[id]
        const label = labels[id === 'compute' ? computeKind ?? 'vm' : id]
        const wide = id === 'euRegion'
        return (
          <g className={`${styles.archNode} ${isNew(id) ? styles.archNew : ''}`} key={id}>
            <rect x={x} y={y} width={wide ? 480 : W} height={H} rx="8" />
            <text className={styles.archTitle} x={x + 10} y={y + 24}>{forPlatform(label.title, platform)}</text>
            <text className={styles.archDetail} x={x + 10} y={y + 42}>{forPlatform(label.detail, platform)}</text>
            {isNew(id) ? <text className={styles.archBadge} x={x + (wide ? 470 : W - 8)} y={y + 16} textAnchor="end">NEW</text> : null}
          </g>
        )
      })}

      {edges.map((edge) => (edge.label && edge.labelAt ? (
        <text className={styles.archEdgeLabel} key={`${edge.from}-${edge.to}-label`} x={edge.labelAt[0]} y={edge.labelAt[1]}>{edge.label}</text>
      ) : null))}
    </svg>
  )
}
