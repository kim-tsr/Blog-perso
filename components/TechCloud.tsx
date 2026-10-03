import * as si from 'simple-icons'
import IconCloud, { type CloudIcon } from './IconCloud'

// Technologies qui ont un logo officiel dans simple-icons (les autres restent dans les listes).
const NAMES: [string, string][] = [
  ['GitLab', 'siGitlab'], ['Forgejo', 'siForgejo'], ['Trivy', 'siTrivy'], ['Kubernetes', 'siKubernetes'], ['ArgoCD', 'siArgo'],
  ['Helm', 'siHelm'], ['Docker', 'siDocker'], ['Proxmox', 'siProxmox'], ['Terraform', 'siTerraform'], ['Ansible', 'siAnsible'],
  ['Nix', 'siNixos'], ['Grafana', 'siGrafana'], ['Linux', 'siLinux'], ['Tailscale', 'siTailscale'], ['pfSense', 'siPfsense'],
  ['OpenVPN', 'siOpenvpn'], ['Rust', 'siRust'], ['C', 'siC'], ['C++', 'siCplusplus'], ['Python', 'siPython'],
  ['JavaScript', 'siJavascript'], ['Java', 'siOpenjdk'], ['PostgreSQL', 'siPostgresql'], ['Redis', 'siRedis'], ['MongoDB', 'siMongodb'],
  ['Neo4j', 'siNeo4j'], ['Elasticsearch', 'siElasticsearch'], ['Prometheus', 'siPrometheus'], ['Traefik', 'siTraefikproxy'],
  ['Unity', 'siUnity'], ['Burp Suite', 'siBurpsuite'], ['Bash', 'siGnubash'], ['Zsh', 'siZsh'], ['FastAPI', 'siFastapi'],
  ['OWASP', 'siOwasp'], ['GitHub', 'siGithub'], ['Wireshark', 'siWireshark'], ['OpenTelemetry', 'siOpentelemetry'],
]

function luminance(hex: string) {
  const [r, g, b] = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export default function TechCloud() {
  const icons: CloudIcon[] = []
  const all = si as unknown as Record<string, { title: string; path: string; hex: string } | undefined>
  for (const [title, key] of NAMES) {
    const ic = all[key]
    if (ic) icons.push({ title, path: ic.path, hex: ic.hex, lum: luminance(ic.hex) })
  }
  return <IconCloud icons={icons} />
}
