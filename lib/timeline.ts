export interface TimelineLink { label: string; href: string; external?: boolean }
export interface TimelineItem {
  title: string
  text: string
  tags?: string[]
  youtube?: string
  links?: TimelineLink[]
}
export interface TimelinePhase { phase: string; subtitle: string; items: TimelineItem[] }

export const TIMELINE: TimelinePhase[] = [
  {
    phase: 'Prépa EPITA',
    subtitle: 'Mes premiers projets en C# et en C',
    items: [
      {
        title: 'Un jeu vidéo en C# sur Unity',
        text: "Mon premier gros projet à l'EPITA : un jeu vidéo développé en C# avec Unity. Le trailer montre ce que ça donne.",
        tags: ['C#', 'Unity'],
        youtube: 'jqJ0tCDtftE',
        links: [{ label: 'Voir sur YouTube', href: 'https://www.youtube.com/watch?v=jqJ0tCDtftE', external: true }],
      },
      {
        title: "Un OCR en C",
        text: "Un projet de reconnaissance optique de caractères programmé en C : de l'image brute jusqu'au texte reconnu, avec la rigueur que demande le C sur la mémoire et les structures de données.",
        tags: ['C'],
      },
    ],
  },
  {
    phase: 'ING1',
    subtitle: 'Un shell en C et la recherche',
    items: [
      {
        title: '42sh : un shell en C',
        text: "Réimplémentation d'un shell Unix en C : lecture et analyse de la ligne de commande, exécution des processus, redirections et gestion de l'environnement.",
        tags: ['C', 'Unix'],
      },
      {
        title: "Détection d'intrusion réseau en temps réel",
        text: "Assistant chercheur au laboratoire de l'EPITA : travail sur des modèles de classification en flux, capables de repérer une intrusion pendant que le trafic passe.",
        tags: ['Python', 'Machine learning en flux', 'Trafic réseau'],
        links: [{ label: 'Fiche projet', href: '/projets#detection-intrusion' }],
      },
    ],
  },
  {
    phase: 'Majeure SecDevOps',
    subtitle: 'Infrastructure, audit et JECT',
    items: [
      {
        title: "Création de l'antenne JECT de Rennes",
        text: "À la Junior-Entreprise JECT, j'ai créé l'antenne de Rennes : monter l'équipe, structurer l'activité et poser les bases pour décrocher des missions.",
        links: [{ label: 'ject.fr', href: 'https://ject.fr', external: true }],
      },
      {
        title: 'Assistant YAKA',
        text: "Assistant (Yet Another Kind of Assistant) sur les cours de Java, C++ et JavaScript en cycle ingénieur : encadrement des étudiants et aide à la compréhension des notions.",
        tags: ['Java', 'C++', 'JavaScript'],
      },
      {
        title: "Infrastructure d'entreprise multi-sites",
        text: "Conception d'une infrastructure complète : un datacenter (3 contrôleurs de domaine, cluster Kubernetes, bastion), un siège avec sa flotte de postes et 3 agences, reliés en VPN hub-and-spoke avec des accès distants authentifiés par LDAP.",
        tags: ['Active Directory', 'pfSense', 'OpenVPN', 'FRR (OSPF)', 'Kubernetes'],
        links: [{ label: 'Fiche projet', href: '/projets#infra-multi-sites' }],
      },
      {
        title: "Audit d'infrastructure",
        text: "Un audit d'infrastructure selon le référentiel ITAF, avec synthèse exécutive, constats et plan de remédiation pour un COMEX, et un audit de groupe d'une entreprise MedTech fictive : 8 constats, rapport, présentation et soutenance.",
        tags: ['ITAF', 'ISO 27001', 'RGPD'],
        links: [{ label: 'Fiche projet', href: '/projets#audits' }],
      },
      {
        title: "Création de l'offre de prestations cyber",
        text: "Toujours à la JECT, j'ai conçu une offre de 6 prestations de cybersécurité, de la définition du contenu de chaque prestation à sa présentation aux clients.",
        links: [{ label: 'ject.fr/prestations', href: 'https://ject.fr/prestations', external: true }],
      },
      {
        title: 'Clone de Twitter en Domain-Driven Design',
        text: "Un réseau social découpé selon le Domain-Driven Design : une base de données choisie pour chaque usage, une file de messages et un déploiement sur Kubernetes.",
        tags: ['DDD', 'MongoDB', 'Redis', 'Neo4j', 'Elasticsearch', 'Kubernetes'],
        links: [{ label: 'Fiche projet', href: '/projets#clone-twitter' }],
      },
    ],
  },
  {
    phase: 'Bac+5',
    subtitle: 'Cette année : Kubernetes, sécurité des LLM et transmission',
    items: [
      {
        title: 'kort : déploiement GitOps sur Kubernetes',
        text: "Un raccourcisseur d'URL conteneurisé puis déployé sur mon cluster k3s avec Kustomize, ArgoCD, sealed-secrets et Prometheus. Je raconte ce que j'ai fait, mes choix et mon retour d'expérience.",
        tags: ['Kubernetes', 'ArgoCD', 'Kustomize', 'Prometheus'],
        links: [{ label: 'Lire le retour d’expérience', href: '/projets/kort' }],
      },
      {
        title: 'PenetrateAndDestroy : une plateforme CTF jetable',
        text: "Une plateforme CTF complète que je détruis et reconstruis avec une seule commande, sur un hôte Proxmox : réseau en sept zones derrière OPNsense, cluster Talos géré par Cluster API et ArgoCD, SSO, VPN, instances de challenges isolées par équipe, front sur mesure et supervision. Tout en infrastructure as code, avec les secrets chiffrés dans un dépôt public. Déployée de bout en bout sur mon serveur, puis arrêtée.",
        tags: ['Proxmox', 'OpenTofu', 'Talos', 'ArgoCD', 'Cilium', 'SOPS'],
        links: [
          { label: 'Lire le retour d\u2019expérience', href: '/projets/penetrate-and-destroy' },
          { label: 'Documentation', href: '/projets/penetrate-and-destroy/documentation' },
          { label: 'Dépôt GitHub', href: 'https://github.com/kim-tsr/penetrate-and-destroy', external: true },
        ],
      },
      {
        title: 'Classifieur de prompts malveillants',
        text: "Un modèle qui détecte les prompts dangereux (injection, jailbreak, détournement, exfiltration) avant qu'ils n'atteignent un LLM : mmBERT-base fine-tuné sur 1,1 million de prompts, 0,96 de macro-F1, publié sur Hugging Face. Mon retour d'expérience raconte la v1, un faux résultat à 0,2 de F1 et le bug derrière, puis le passage à l'échelle.",
        tags: ['Python', 'Transformers', 'Hugging Face', 'Sécurité des LLM'],
        links: [
          { label: 'Lire le retour d\u2019expérience', href: '/projets/classifieur-prompts' },
          { label: 'Modèle sur Hugging Face', href: 'https://huggingface.co/Kim-tsr/redflag-mmbert-base-s1', external: true },
          { label: 'Notebook Kaggle', href: 'https://www.kaggle.com/code/majeee/notebooke9e1aadf49', external: true },
        ],
      },
      {
        title: 'ACU : review, responsable et encadrant des Piscines',
        text: "Depuis juillet 2026, membre des ACU (Assistants C/Unix) : je relis les sujets, j'encadre les Piscines C/Unix et SQL et je maintiens un projet en C avec toute sa chaîne CI/CD (testsuite automatisée, build et déploiement via Nix).",
        tags: ['C', 'Unix', 'CI/CD', 'Nix'],
      },
    ],
  },
]
