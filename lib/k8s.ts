/**
 * Mini-client Kubernetes pour les labs sandbox éphémères (Phase 4).
 *
 * Hypothèses :
 * - Cluster k3s avec un ServiceAccount dédié (cf. supabase/k3s/rbac.yaml)
 * - Auth via bearer token (`K8S_SA_TOKEN`) sur l'API REST native (`K8S_API_URL`)
 * - Un Ingress wildcard `*.{K8S_SANDBOX_HOST}` route vers le Service du pod
 * - Une NetworkPolicy au niveau du namespace bloque l'egress sauf DNS
 *
 * Pas de SDK (`@kubernetes/client-node` est lourd et casse en edge runtime).
 * On parle directement à l'API REST avec fetch.
 */

const API_URL   = process.env.K8S_API_URL ?? ''
const SA_TOKEN  = process.env.K8S_SA_TOKEN ?? ''
const NAMESPACE = process.env.K8S_NAMESPACE ?? 'devsecops-labs'
const SANDBOX_HOST = process.env.K8S_SANDBOX_HOST ?? ''
const INSECURE  = process.env.K8S_INSECURE === 'true'

/** Mapping lab slug → image OCI. À étendre quand on ajoute des labs. */
const LAB_IMAGES: Record<string, string> = {
  'hardening-ssh': process.env.K8S_LAB_IMAGE_HARDENING_SSH
    ?? 'ghcr.io/devsecops/lab-hardening-ssh:latest',
  'linux-01-systemd-hardening': process.env.K8S_LAB_IMAGE_LINUX_SYSTEMD
    ?? 'ghcr.io/devsecops/lab-linux-systemd:latest',
  'containers-from-scratch': process.env.K8S_LAB_IMAGE_CONTAINERS
    ?? 'ghcr.io/devsecops/lab-containers:latest',
}

/**
 * Sous-chemins de /etc que chaque lab doit pouvoir écrire malgré le rootfs RO.
 * On ne monte JAMAIS une tmpfs sur /etc entier (ça masquerait passwd/nsswitch/…),
 * seulement les sous-dossiers déclarés par le lab. Chaque entrée devient un
 * emptyDir tmpfs dédié. Les labs absents de la map n'ont aucun /etc writable.
 */
const LAB_WRITABLE_ETC: Record<string, string[]> = {
  'hardening-ssh': ['/etc/ssh'],
  'linux-01-systemd-hardening': ['/etc/systemd'],
  'containers-from-scratch': [],
}

const TTYD_PORT = 7681
const DEFAULT_TTL_SECONDS = 1800 // 30 min

export interface LabPodSpec {
  slug: string
  sessionId: string
  userId: string
  ttlSeconds?: number
}

export interface LabPodResult {
  podName: string
  serviceName: string
  sandboxUrl: string
  expiresAt: Date
}

export function isK8sConfigured(): boolean {
  return Boolean(API_URL && SA_TOKEN && SANDBOX_HOST)
}

export function getLabImage(slug: string): string | null {
  return LAB_IMAGES[slug] ?? null
}

interface K8sFetchInit {
  method?: 'GET' | 'POST' | 'DELETE'
  body?: unknown
}

async function k8s<T>(path: string, init: K8sFetchInit = {}): Promise<T> {
  if (!isK8sConfigured()) throw new Error('k8s_not_configured')

  const url = `${API_URL.replace(/\/$/, '')}${path}`
  const headers: Record<string, string> = {
    Authorization: `Bearer ${SA_TOKEN}`,
    Accept: 'application/json',
  }
  if (init.body) headers['Content-Type'] = 'application/json'

  const fetchOpts: RequestInit & { dispatcher?: unknown } = {
    method: init.method ?? 'GET',
    headers,
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: 'no-store',
  }

  // Self-signed k3s : on accepte si l'opérateur l'a explicitement choisi.
  if (INSECURE) {
    try {
      const { Agent } = await import('undici')
      fetchOpts.dispatcher = new Agent({ connect: { rejectUnauthorized: false } })
    } catch {
      // undici pas dispo (edge runtime) — ignore
    }
  }

  const res = await fetch(url, fetchOpts)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`k8s_${res.status}: ${text.slice(0, 300)}`)
  }
  return (await res.json()) as T
}

function podSpec(spec: LabPodSpec, image: string, ttl: number): Record<string, unknown> {
  const name = `lab-${spec.slug.replace(/[^a-z0-9-]/g, '-')}-${spec.sessionId.slice(0, 8)}`
  const labels = {
    app: 'devsecops-lab',
    'devsecops.io/session': spec.sessionId,
    'devsecops.io/user':    spec.userId,
    'devsecops.io/lab':     spec.slug,
  }

  // tmpfs de base, communs à tous les labs (rootfs RO).
  const baseMounts = [
    { name: 'tmp',  mountPath: '/tmp' },
    { name: 'home', mountPath: '/home/labuser' },
    { name: 'run',  mountPath: '/var/run' },
  ]
  const baseVolumes = [
    { name: 'tmp',  emptyDir: { medium: 'Memory', sizeLimit: '32Mi' } },
    { name: 'home', emptyDir: { medium: 'Memory', sizeLimit: '64Mi' } },
    { name: 'run',  emptyDir: { medium: 'Memory', sizeLimit: '8Mi'  } },
  ]

  // tmpfs spécifiques au lab : uniquement des sous-dossiers de /etc déclarés,
  // jamais /etc entier (sinon passwd/nsswitch/… seraient masqués).
  const etcPaths = LAB_WRITABLE_ETC[spec.slug] ?? []
  const etcMounts = etcPaths.map((p, i) => ({ name: `etc-${i}`, mountPath: p }))
  const etcVolumes = etcPaths.map((_, i) => ({
    name: `etc-${i}`,
    emptyDir: { medium: 'Memory', sizeLimit: '16Mi' },
  }))

  return {
    apiVersion: 'v1',
    kind: 'Pod',
    metadata: { name, namespace: NAMESPACE, labels },
    spec: {
      restartPolicy: 'Never',
      automountServiceAccountToken: false,
      activeDeadlineSeconds: ttl,
      terminationGracePeriodSeconds: 5,
      enableServiceLinks: false,
      securityContext: {
        runAsNonRoot: false,
        seccompProfile: { type: 'RuntimeDefault' },
      },
      containers: [{
        name: 'lab',
        image,
        imagePullPolicy: 'IfNotPresent',
        ports: [{ containerPort: TTYD_PORT, name: 'ttyd' }],
        resources: {
          requests: { cpu: '100m', memory: '128Mi', 'ephemeral-storage': '256Mi' },
          limits:   { cpu: '500m', memory: '256Mi', 'ephemeral-storage': '512Mi' },
        },
        securityContext: {
          readOnlyRootFilesystem: true,
          allowPrivilegeEscalation: false,
          capabilities: { drop: ['ALL'], add: ['CHOWN','SETUID','SETGID'] },
        },
        volumeMounts: [...baseMounts, ...etcMounts],
      }],
      volumes: [...baseVolumes, ...etcVolumes],
    },
  }
}

function serviceSpec(podName: string, sessionId: string): Record<string, unknown> {
  return {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: podName,
      namespace: NAMESPACE,
      labels: { app: 'devsecops-lab', 'devsecops.io/session': sessionId },
    },
    spec: {
      type: 'ClusterIP',
      selector: { 'devsecops.io/session': sessionId },
      ports: [{ port: 80, targetPort: TTYD_PORT, name: 'http' }],
    },
  }
}

function ingressSpec(podName: string, sessionId: string): Record<string, unknown> {
  return {
    apiVersion: 'networking.k8s.io/v1',
    kind: 'Ingress',
    metadata: {
      name: podName,
      namespace: NAMESPACE,
      labels: { app: 'devsecops-lab', 'devsecops.io/session': sessionId },
      annotations: {
        'traefik.ingress.kubernetes.io/router.entrypoints': 'websecure',
        'traefik.ingress.kubernetes.io/router.tls': 'true',
      },
    },
    spec: {
      rules: [{
        host: `${sessionId.slice(0, 8)}.${SANDBOX_HOST}`,
        http: { paths: [{
          path: '/',
          pathType: 'Prefix',
          backend: { service: { name: podName, port: { number: 80 } } },
        }]},
      }],
      tls: [{ hosts: [`${sessionId.slice(0, 8)}.${SANDBOX_HOST}`] }],
    },
  }
}

export async function createLabPod(input: LabPodSpec): Promise<LabPodResult> {
  const image = getLabImage(input.slug)
  if (!image) throw new Error(`lab_image_missing:${input.slug}`)

  const ttl = input.ttlSeconds ?? DEFAULT_TTL_SECONDS
  const pod = podSpec(input, image, ttl)
  const podName = (pod.metadata as { name: string }).name

  await k8s(`/api/v1/namespaces/${NAMESPACE}/pods`, { method: 'POST', body: pod })
  await k8s(`/api/v1/namespaces/${NAMESPACE}/services`, {
    method: 'POST', body: serviceSpec(podName, input.sessionId),
  })
  await k8s(`/apis/networking.k8s.io/v1/namespaces/${NAMESPACE}/ingresses`, {
    method: 'POST', body: ingressSpec(podName, input.sessionId),
  })

  return {
    podName,
    serviceName: podName,
    sandboxUrl: `https://${input.sessionId.slice(0, 8)}.${SANDBOX_HOST}`,
    expiresAt: new Date(Date.now() + ttl * 1000),
  }
}

export async function deleteLabResources(podName: string): Promise<void> {
  const opts = { method: 'DELETE' as const }
  // best-effort, on ignore les 404
  await Promise.allSettled([
    k8s(`/apis/networking.k8s.io/v1/namespaces/${NAMESPACE}/ingresses/${podName}`, opts),
    k8s(`/api/v1/namespaces/${NAMESPACE}/services/${podName}`, opts),
    k8s(`/api/v1/namespaces/${NAMESPACE}/pods/${podName}`, opts),
  ])
}

export type PodPhase = 'Pending' | 'Running' | 'Succeeded' | 'Failed' | 'Unknown'

interface PodStatusResponse {
  status?: { phase?: PodPhase }
}

export async function getPodPhase(podName: string): Promise<PodPhase> {
  try {
    const res = await k8s<PodStatusResponse>(
      `/api/v1/namespaces/${NAMESPACE}/pods/${podName}`,
    )
    return res.status?.phase ?? 'Unknown'
  } catch {
    return 'Unknown'
  }
}
