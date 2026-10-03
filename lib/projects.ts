export interface Project {
  id: string
  title: string
  description: string
  tech: string[]
  slug?: string
  featured?: boolean
}

export const PROJECTS: Project[] = [
  {
    id: 'kort',
    title: 'kort : déploiement GitOps sur Kubernetes',
    slug: 'kort',
    description: "Un raccourcisseur d'URL (API, worker, Redis, PostgreSQL) conteneurisé puis déployé sur mon cluster k3s. Le code et les manifestes vivent dans deux dépôts séparés. Le déploiement suit le pattern app-of-apps d'ArgoCD, avec les secrets chiffrés par sealed-secrets.",
    tech: ['Kubernetes', 'ArgoCD', 'Helm', 'sealed-secrets', 'FastAPI', 'Redis', 'PostgreSQL'],
    featured: true,
  },
  {
    id: 'pipeline-slsa',
    title: 'Pipeline DevSecOps visant SLSA niveau 2',
    description: "Sécurisation de bout en bout de deux applications (Next.js et Flask) sur une instance GitLab CE auto-hébergée. Chaque push passe par la détection de secrets, l'analyse statique, l'analyse des Dockerfile, la génération d'un SBOM, le scan de vulnérabilités et un scan dynamique. Les images sont signées avec cosign, référencées par digest, puis déployées en staging et en production.",
    tech: ['GitLab CI', 'Gitleaks', 'Semgrep', 'Hadolint', 'Syft', 'Grype', 'Trivy', 'OWASP ZAP', 'Sigstore/cosign', 'Docker Compose'],
    featured: true,
  },
  {
    id: 'infra-multi-sites',
    title: "Infrastructure d'entreprise multi-sites",
    description: "Conception d'une infrastructure complète : un datacenter avec 3 contrôleurs de domaine, un cluster Kubernetes et un bastion, un siège avec sa flotte de postes, et 3 agences. Les sites sont reliés en VPN hub-and-spoke, et les accès distants sont authentifiés par LDAP.",
    tech: ['Active Directory', 'pfSense (HA/CARP)', 'OpenVPN', 'FRR (OSPF)', 'Kubernetes', 'LDAP'],
  },
  {
    id: 'audits',
    title: 'Audits de sécurité',
    description: "Un audit d'infrastructure selon le référentiel ITAF, avec synthèse exécutive, constats et plan de remédiation pour un COMEX. Un audit de groupe d'une entreprise MedTech fictive : 8 constats, rapport, présentation et soutenance.",
    tech: ['ITAF', 'ISO 27001', 'ISO 27002', 'RGPD'],
  },
  {
    id: 'classifieur-prompts',
    title: 'Classifieur de prompts malveillants',
    description: "Projet d'école en cours : un modèle qui détecte les prompts dangereux avant qu'ils n'atteignent un LLM. Il cible l'injection de prompt, le jailbreak et le contenu nocif, avec un support du français.",
    tech: ['Python', 'Machine learning', 'Sécurité des LLM'],
  },
  {
    id: 'recherche-offensive',
    title: 'Recherche offensive et CTI',
    description: "Une présentation sur la technique BYOVD (Bring Your Own Vulnerable Driver) préparée pour leHack, avec un guide technique. Une présentation sur les groupes APT iraniens cartographiés avec MITRE ATT&CK. Des épreuves de reverse en CTF, dont un binaire à machine virtuelle maison avec protections anti-debug.",
    tech: ['MITRE ATT&CK', 'Reverse engineering', 'Exegol', 'Burp Suite'],
  },
  {
    id: 'detection-intrusion',
    title: 'Détection d\'intrusion réseau en temps réel',
    description: "Travail de recherche au laboratoire de l'EPITA sur des modèles de classification en flux, capables de repérer une intrusion pendant que le trafic passe.",
    tech: ['Python', 'Machine learning en flux', 'Analyse de trafic réseau'],
  },
  {
    id: 'clone-twitter',
    title: 'Clone de Twitter en Domain-Driven Design',
    description: "Un réseau social découpé selon le Domain-Driven Design, avec une base de données choisie pour chaque usage, une file de messages et un déploiement sur Kubernetes.",
    tech: ['MongoDB', 'Redis', 'Neo4j', 'Elasticsearch', 'Kubernetes'],
  },
  {
    id: 'pcbwalker',
    title: 'PCBWalker : robot quadrupède',
    description: "Projet en cours : un robot à 4 pattes avec cinématique inverse et suivi vidéo, sur Raspberry Pi Zero 2W, avec un châssis en PCB sur mesure.",
    tech: ['Raspberry Pi', 'Arduino', 'Électronique', 'Conception de PCB'],
  },
]
