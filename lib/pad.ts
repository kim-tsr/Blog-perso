import type { Story } from './kort'

export const PAD_REPO = 'https://github.com/kim-tsr/penetrate-and-destroy'

export const PAD: Story = {
  title: 'PenetrateAndDestroy : une plateforme CTF jetable, de bout en bout',
  intro: "PenetrateAndDestroy est une plateforme CTF complète que je peux détruire et reconstruire avec une seule commande, sur un unique hôte Proxmox. Un routeur OPNsense découpe le réseau en sept zones, les services d'infrastructure tournent en LXC, un cluster Kubernetes Talos héberge CTFd (en mode headless), un front Next.js sur mesure et les instances de challenges, une par équipe. Tout est en infrastructure as code, tout est déployé par ArgoCD, et le dépôt est public : aucun secret en clair. Voici comment je l'ai conçue, ce qui m'a coûté du temps, et ce que je referais.",
  tech: ['Proxmox', 'OpenTofu', 'Ansible', 'OPNsense', 'Talos', 'Cluster API', 'ArgoCD', 'Cilium', 'Kyverno', 'SOPS + age', 'NetBird', 'Authentik', 'CTFd', 'Next.js', 'Prometheus'],
  repos: [{ label: 'Dépôt GitHub', href: PAD_REPO }],
  steps: [
    {
      title: 'Le cahier des charges : jetable, reconstructible, public',
      text: [
        "Je voulais une plateforme qu'on puisse reconstruire à l'identique, à tout moment, avec task up, et la supprimer avec task destroy, l'hôte excepté. Cette contrainte a tout dicté : rien ne doit être fait à la main, rien ne doit dériver, et chaque brique doit pouvoir mourir sans emporter les autres.",
        "Quelques décisions de départ. Les services d'infrastructure (bordure, VPN, bastion, identité, supervision) tournent dans des LXC en Docker Compose, hors du cluster, pour survivre à sa reconstruction. OPNsense et Talos restent des VMs. Le front est public, mais les challenges ne sont joignables que par VPN. CTFd sert de moteur de scoring, derrière un front Next.js entièrement sur mesure. Et le dépôt est public, sous licence MIT : un projet perso présenté publiquement, mais une plateforme réellement utilisable.",
        "Tout cela doit tenir sur un hôte de 31 Go de RAM, avec une cible de 17 à 22 Go selon la charge. Ce budget a pesé sur presque chaque choix d'architecture.",
      ],
    },
    {
      title: 'Une seule source de vérité : le contrat',
      text: [
        "Le premier fichier que j'ai écrit n'est pas du code d'infrastructure mais infra/contracts.yaml : IP, CIDR, VLAN, VMID, noms DNS, groupes de l'IdP, client_id OIDC, ports et namespaces, une seule fois. OpenTofu le lit avec yamldecode, Ansible le charge comme variables, et les manifests GitOps en recopient les valeurs avec un commentaire qui renvoie à la clé d'origine. Un script de lint vérifie que les IP clés restent cohérentes.",
        "La règle est stricte : ne jamais inventer une IP ou un nom hors de ce fichier, et s'il manque une valeur, l'ajouter au contrat. Les valeurs propres à mon hôte (URL de l'API Proxmox, accès SSH, IP publique, passerelle) n'y sont pas non plus : elles vivent dans un fichier chiffré, fourni par l'opérateur.",
      ],
      snippets: [{ file: 'conventions', lang: 'hcl', code: `# tofu : le contrat est lu, jamais recopié
locals { c = yamldecode(file("\${path.root}/../../contracts.yaml")) }

# gitops : valeur recopiée dans le manifest, avec sa provenance
nodeName: pve   # contracts: host.node` }],
    },
    {
      title: 'Le réseau : sept zones, tout refusé par défaut',
      text: [
        "Un bridge Proxmox VLAN-aware, sans aucun uplink, n'est routé que par la VM OPNsense. Rien ne peut donc contourner le firewall : il n'y a pas d'autre chemin. Je l'ai découpé en sept zones (management, DMZ, bastion, identité, supervision, production, challenges), avec une politique « deny all » journalisée, et des règles ouvertes une par une.",
        "Les règles ne sont pas posées à la main dans l'interface d'OPNsense : une stack OpenTofu les déclare à partir du contrat. J'ai aussi écrit le split-DNS en déclaratif, pour que les noms publics de la bordure soient résolus en interne vers le bon endroit. Le point qui m'a le plus appris : la matrice de flux se raconte en quelques lignes, mais chaque ligne cache un sens (qui initie la connexion) et un cas limite (l'API Kubernetes n'est ouverte qu'aux workers challenges, de façon asymétrique).",
      ],
      snippets: [{ file: 'matrice de flux (principe)', lang: 'text', code: `Internet            → DMZ          : 443 et ports NetBird uniquement
DMZ (edge)          → PROD         : ingress uniquement
Joueurs (NetBird)   → CHALLENGES   : IP des instances uniquement
Staff (NetBird)     → BASTION      : uniquement
Toutes les zones    → MONITORING   : push seulement
MONITORING          → toutes zones : scrape seulement
CHALLENGES          → *            : refusé (aucune sortie)
tout le reste                      : deny, journalisé` }],
    },
    {
      title: 'LXC pour l\'infra, Talos pour le cluster, et un cluster qui se gère lui-même',
      text: [
        "Pour le cluster, j'ai choisi Talos Linux : immuable, piloté par API, sans SSH ni shell. Pour une plateforme jetable, c'est idéal : pas de dérive de configuration, pas d'OS à durcir. En contrepartie, tout diagnostic passe par talosctl et par le bastion.",
        "Le cycle de vie du cluster est géré par Cluster API, et c'est la décision que je trouve la plus élégante. Un cluster de gestion permanent aurait coûté environ 6 Go de RAM pour piloter un seul cluster, sur un hôte qui n'en a que 31. À la place, un cluster kind éphémère installe Cluster API et crée pad-prod, puis clusterctl move transfère la gestion dans pad-prod lui-même, et kind est supprimé. Les objets Cluster API vivent ensuite dans le dépôt Git, gérés par ArgoCD.",
        "La contrepartie, qui a nécessité du travail : un cluster auto-géré ne peut pas se détruire lui-même. La destruction fait un pivot inverse vers un kind frais, après avoir gelé ArgoCD pour qu'il ne recrée pas les objets en cours de déplacement. Et le bootstrap est reprenable : si le pivot échoue, kind est conservé.",
      ],
      snippets: [{ file: 'bootstrap (principe)', lang: 'bash', code: `kind create cluster                  # cluster de gestion éphémère
clusterctl init ...                  # providers : CAPMOX, CABPT / CACPPT
# création de pad-prod, installation de Cilium
clusterctl move ...                  # pad-prod devient son propre cluster de gestion
kind delete cluster                  # l'échafaudage disparaît` }],
    },
    {
      title: "Un ordre qui n'est pas négociable : task up en treize phases",
      text: [
        "task up enchaîne treize phases idempotentes : on corrige, on relance, et seule la partie manquante bouge. Chaque phase peut se jouer seule, et chacune a son check qui répond OK, KO ou WARN.",
        "L'ordre n'est pas esthétique, il vient des dépendances. Le routeur et ses règles précèdent les LXC, car il faut une passerelle. Les LXC précèdent Authentik, car l'IdP est un LXC. Le cluster vient après l'identité, car ArgoCD s'y raccorde en OIDC. NetBird et Warpgate se configurent par API une fois déployés.",
        "Une dépendance circulaire m'a forcé à déployer les services en deux passes. Les secrets des clients OIDC de NetBird, Warpgate et Grafana sont générés par la stack Authentik de tofu, qui a besoin d'Authentik et de la bordure. La passe 1 déploie donc monitoring, Authentik et la bordure ; ensuite un oidc-sync recopie les secrets, chiffrés et jamais affichés, et la passe 2 déploie Warpgate et NetBird. Les certificats ACME de la bordure sont en DNS-01, pour qu'ils ne dépendent pas de l'existence des backends.",
      ],
      snippets: [{ file: 'Taskfile', lang: 'bash', code: `nix develop
task up                       # phases 0 à 12
task phase:0-prereqs          # ou une phase à la fois
task check:<phase>            # OK / KO / WARN, chaque phase est rejouable
task status
task destroy                  # tout sauf l'hôte (confirmation explicite)
task rebuild                  # destroy puis up, chronométré` }],
    },
    {
      title: 'Des secrets dans un dépôt public : SOPS et age',
      text: [
        "Le dépôt est public, mais il faut que task up reconstruise tout sans coffre externe à déployer avant la plateforme. J'ai donc fait le choix de commiter les secrets, chiffrés : SOPS avec age, deux clés. La clé de l'opérateur lit tout. La clé du cluster ne lit que gitops/**, et sert à ksops dans ArgoCD, de sorte que le cluster ne peut jamais lire les secrets d'infrastructure. Ansible déchiffre via community.sops, OpenTofu via son provider SOPS, et le state OpenTofu est lui-même chiffré par passphrase.",
        "C'est ici que je compare avec kort, où j'avais choisi sealed-secrets. Pour kort, c'était parfait. Pour cette plateforme, c'était incompatible : sealed-secrets lie les secrets à un cluster, alors que celui-ci est reconstruit à chaque fois. External Secrets avec un Vault imposait de déployer un coffre avant tout le reste. La contrainte du projet change la réponse.",
        "Un dépôt public ne se protège pas par vigilance mais par des garde-fous automatiques : un script qui refuse tout fichier de secret non chiffré, gitleaks, et un script qui compare des empreintes sha256 pour détecter une fuite de valeurs propres au site sans republier les motifs interdits. En CI, jamais une vraie clé : une clé éphémère valide seulement la forme. Et un piège que j'ai documenté : l'historique Git conserve les anciens chiffrements, donc après une fuite de clé il faut aussi changer les valeurs.",
      ],
      snippets: [{ file: 'chaîne des secrets (principe)', lang: 'text', code: `clé age opérateur  → tout : secrets/**, infrastructure
clé age cluster    → gitops/** uniquement (ksops dans le repo-server d'ArgoCD)

secrets/<domaine>.sops.yaml       chiffré, commité
secrets/<domaine>.example.yaml    valeurs CHANGEME, documente les clés attendues
secrets/site.sops.yaml            valeurs propres à l'hôte (jamais en clair)` }],
    },
    {
      title: 'GitOps par vagues',
      text: [
        "Après le bootstrap, plus aucun kubectl apply manuel : c'est la règle, et c'est aussi un interdit écrit dans les conventions du dépôt. ArgoCD déroule le contenu de gitops/ par vagues : d'abord les namespaces et les CRD, puis Cilium, cert-manager, Kyverno, ArgoCD lui-même et le stockage, puis Traefik, KEDA et l'autoscaler, puis les bases de données, le stockage objet et le registre, et enfin les applications. Les secrets sont à la vague -8, déchiffrés dans ArgoCD.",
        "L'étape la plus particulière est la vague 5 : le cluster se décrit lui-même. Les objets Cluster API de pad-prod sont une Application ArgoCD parmi les autres. Les vagues garantissent des ordres qui ne se voient qu'à la reconstruction complète : une politique Kyverno ne doit pas être appliquée avant ses CRD, ni un ServiceMonitor avant le CRD de Prometheus.",
      ],
      snippets: [{ file: 'gitops/platform/*', lang: 'yaml', code: `metadata:
  annotations:
    argocd.argoproj.io/sync-wave: "-9"   # Cilium avant tout le reste

# -10 namespaces, CRD Prometheus    -9 Cilium
#  -7 cert-manager  -6 Kyverno       -5 ArgoCD, Proxmox CSI, opérateur MariaDB
#  -3 Traefik, KEDA, autoscaler      -2 Valkey, Garage, Zot
#  -1 Alloy, métriques                5 cluster-prod (le cluster se décrit)
#  10 ApplicationSet : CTFd, front, chall-manager, netbird-sync` }],
    },
    {
      title: 'Des instances de challenges isolées, une par équipe',
      text: [
        "Chaque équipe doit pouvoir lancer sa propre instance d'un challenge, avec quota, durée de vie et nettoyage garanti. Je n'ai pas écrit d'opérateur maison : chall-manager exécute des scénarios Pulumi, et mon scénario générique crée un namespace dédié, un pod, un Service LoadBalancer et une NetworkPolicy à partir du challenge.yml. CTFd Whale supposait un démon Docker, et un cluster par équipe aurait coûté bien trop cher.",
        "Le parcours : le joueur clique sur « Lancer », le plugin pont de CTFd vérifie l'équipe, le quota de 3 instances, le délai de 30 secondes entre deux créations et la pause de l'événement, puis appelle chall-manager. L'instance reçoit une IP du pool Cilium des instances. Un petit contrôleur Go que j'ai écrit, netbird-sync, observe le Service et crée dans NetBird un groupe par équipe, une ressource /32 et une policy qui relie les deux. Le joueur, connecté au VPN, atteint l'instance. Rien n'est exposé à Internet : la zone challenges n'a aucune règle entrante depuis le WAN.",
        "Le choix de conception que je retiens : la sécurité est dans le cluster, pas dans la confiance envers le challenge. Le namespace est en Pod Security Standards restricted, le pod tourne en non-root dans un user namespace avec drop: ALL, et la NetworkPolicy ne laisse entrer que le routing peer NetBird, avec aucune sortie, DNS compris.",
      ],
      snippets: [{ file: 'cycle de vie d’une instance', lang: 'text', code: `Joueur → front (BFF) → CTFd (chall_manager_bridge)   quota 3, cooldown 30 s, pause
       → chall-manager → scénario Pulumi (image OCI depuis Zot)
       → namespace inst-team-N : pod, Service LoadBalancer, NetworkPolicy
Service créé → netbird-sync (finalizer pad.io/netbird-sync)
       → groupe ctf-team-N + ressource /32 + policy dans NetBird
Joueur (VPN) → IP de l'instance via le routing peer
Échéance (janitor, chaque minute) ou DELETE → namespace détruit, policy retirée` }],
    },
    {
      title: 'Se protéger de ses propres joueurs',
      text: [
        "Sur une plateforme de CTF, les utilisateurs sont par définition des attaquants. J'ai donc fait une revue de sécurité en cherchant comment un joueur pourrait abuser de la plateforme, et j'ai traité les constats par lots.",
        "Contre le déni de service : un ResourceQuota et un LimitRange générés par Kyverno sur chaque namespace d'instance (stockage éphémère compris), des plafonds par conteneur, 256 PIDs maximum et 40 pods par nœud côté kubelet, et une limite globale de 90 instances qui lève une erreur 503. Cette limite n'est pas transactionnelle : j'ai gardé une marge de 10 IP pour absorber les courses, et je l'ai écrit dans la documentation plutôt que de le cacher. Contre l'exfiltration par tunnel DNS : plus aucune sortie DNS pour les instances, le DNS limité à cluster.local n'étant qu'un opt-in réservé aux administrateurs.",
        "Contre les images piégées : seules les images du registre interne, référencées par empreinte, sont acceptées, vérifiées par le schéma, par le scénario et par Kyverno ; la vérification des signatures cosign démarre en mode audit tant que la clé est factice, pilotée par un ConfigMap. J'ai aussi limité l'egress de chall-manager à une liste de noms de domaine au lieu de tout le port 443, restreint netbird-sync (par une ValidatingAdmissionPolicy) au seul finalizer des Services d'instance, et fait refuser le démarrage de netbird-sync tant que la policy NetBird « Default » (tous vers tous) existe.",
      ],
      snippets: [{ file: 'images d’instance (règle)', lang: 'text', code: `# schéma challenge.yml, scénario Pulumi et Kyverno exigent la même forme :
registry.pad.internal/ctf/<image>@sha256:<empreinte>

# verify-images : Audit tant que la clé cosign est factice, Enforce ensuite
# (piloté par le ConfigMap pad-image-policy)` }],
    },
    {
      title: 'Un front sur mesure devant CTFd headless',
      text: [
        "CTFd tourne sans interface publique : il n'a aucun formulaire de login (404). Tout passe par un front Next.js avec un BFF. L'inscription et la connexion se font dans Authentik, avec captcha et vérification d'e-mail. Le BFF signe une requête HMAC, avec horodatage et nonce, vers un plugin CTFd que j'ai écrit, qui crée ou met à jour l'utilisateur, synchronise ses rôles depuis les groupes et renvoie un token d'API de 900 secondes. Le navigateur ne voit jamais un token CTFd.",
        "Un détail qu'on ne devine pas : CTFd 3.8 n'authentifie l'en-tête Authorization: Token que sur les requêtes JSON. J'ai écrit 71 tests pytest contre un vrai CTFd 3.8.8 plutôt que contre un mock, justement parce que ce genre de comportement ne se devine pas. Le token est partagé entre replicas via Valkey, avec un verrou pour éviter N appels simultanés au renouvellement.",
        "Côté manager, le portail permet d'importer un challenge par ZIP : validation de la forme, puis nouvelle validation côté CTFd avec protection contre les zip-bombs et le zip-slip, fichiers envoyés dans Garage en sautant ceux qui n'ont pas changé, et création idempotente, masquée par défaut. Le front est testé par 152 tests vitest et 18 parcours Playwright en mode mock.",
      ],
      snippets: [{ file: 'pont SSO (principe)', lang: 'text', code: `POST /api/v1/sso/session      HMAC + horodatage + nonce
  → CTFd crée ou met à jour l'utilisateur, synchronise les rôles (groupes)
  ← token d'API, TTL 900 s
BFF : token mis en cache dans Valkey, verrou de renouvellement
Navigateur : cookie de session chiffré, aucun token CTFd côté client` }],
    },
    {
      title: 'Surveiller : des alertes qui disent quoi faire',
      text: [
        "La supervision est un composant à part entière, pas une couche ajoutée à la fin. VictoriaMetrics, Loki, Tempo et Grafana reçoivent les métriques, les logs et les traces de l'hôte, des LXC, d'OPNsense et du cluster, avec un exporter CTFd maison (utilisateurs, solves, first bloods, instances). Quatre dashboards sont versionnés dans le dépôt.",
        "Toute alerte a un summary, une description et un runbook_url. Il y en a 67, et la CI vérifie qu'il existe un runbook pour chacune : une alerte sans procédure ne passe pas. Et pour savoir si le système d'alerte lui-même est vivant, une règle Watchdog est toujours active, son battement part toutes les 5 minutes vers Uptime Kuma, qui alerte s'il s'arrête (dead-man's switch).",
      ],
      snippets: [{ file: 'monitoring/rules (principe)', lang: 'yaml', code: `- alert: Watchdog
  expr: vector(1)                  # toujours vraie : la preuve que la chaîne vit
  labels: { severity: none }
  annotations:
    summary: "Heartbeat de la chaîne d'alerte"
    runbook_url: <lien vers le runbook>

# Alertmanager → Uptime Kuma toutes les 5 min ; silence = alerte` }],
    },
    {
      title: 'La CI : tout valider sans toucher au serveur',
      text: [
        "Règle de départ, écrite dans les conventions : pas d'action sur le serveur réel pendant le développement. Seulement validate, plan avec des variables factices, lint et build local. La CI porte donc tout le poids de la confiance : tofu validate et plan, ansible-lint en profil production, kubeconform, helm template sur les 11 charts, gitleaks, actionlint, shellcheck, checkov et Trivy bloquants, mkdocs build --strict et un smoke test e2e en docker-compose. Les images sont construites, scannées par Trivy (bloquant), puis seulement poussées et signées avec cosign. Les empreintes sont épinglées, et Renovate maintient les versions.",
        "Rendre checkov et Trivy bloquants a été instructif : il a fallu corriger de vraies choses (retirer npm et corepack de l'image d'exécution du front à cause de CVE dans leurs dépendances embarquées, retirer pip et setuptools des images de challenge, monter des dépendances Go, ajouter des securityContext sur tous les managers CAPI) et justifier par écrit chaque exception qu'on ne pouvait pas corriger. Une exception sans justification n'est pas acceptée.",
      ],
      snippets: [{ file: 'Dockerfile (conventions)', lang: 'dockerfile', code: `FROM <image>@sha256:<empreinte>        # base épinglée par digest
ARG SOURCE_DATE_EPOCH                  # build reproductible
RUN apt-get update \\
 && apt-get install -y --no-install-recommends <paquets>   # pas d'apt-get upgrade
USER 10001                             # non-root
HEALTHCHECK ...` }],
    },
    {
      title: 'Les pièges rencontrés',
      text: [
        "Quelques-uns, tels qu'ils apparaissent dans l'historique des correctifs. Les LXC demandent keyctl et /dev/net/tun pour faire tourner Docker et NetBird, mais l'API Proxmox les réserve à root@pam : tofu crée donc les LXC avec le nesting seul, et Ansible pose le reste. Le VMID du template Talos était défini à deux endroits et entrait en conflit avec la plage des VMIDs : une seule clé dans le contrat, désormais. Kyverno a un PodDisruptionBudget de minAvailable: 1 et non 3, parce qu'il n'y a que 2 workers platform et que la RAM est serrée.",
        "Côté CI : le scan Trivy d'une image exigeait d'extraire l'archive OCI en layout avant, le harnais pytest de CTFd avait besoin de libstdc++ exposée pour une dépendance manylinux (greenlet), le venv de test devait être isolé du PYTHONPATH du devshell Nix, et ansible-lint a une limite de longueur de ligne qui fait échouer une description de tâche trop bavarde. Rien de spectaculaire, mais c'est ce qui occupe vraiment le temps.",
      ],
    },
    {
      title: 'Comment je l’ai construite',
      text: [
        "Le projet est trop large pour une seule suite de tâches linéaire, j'ai donc travaillé par vagues, en pilotant plusieurs agents Claude Code en parallèle sur des worktrees isolés. La vague 0, c'est moi : squelette du dépôt, conventions, flake Nix, Taskfile et surtout le contrat. La vague 1 distribue cinq chantiers indépendants (OpenTofu, Ansible, bootstrap et GitOps, CTFd et ses plugins, front Next.js) qui consomment tous le même contrat. La vague 2 branche l'identité et la supervision et fait une revue de sécurité croisée. La vague 3 écrit la documentation.",
        "Ce qui a fait marcher cette approche : un contrat unique que tous les agents lisent, des conventions écrites que chaque agent doit respecter, une validation automatique qui refuse ce qui n'est pas conforme, et une règle claire sur ce que personne n'a le droit de faire sans confirmation explicite de ma part, c'est-à-dire toute action sur l'hôte réel.",
      ],
    },
    {
      title: "Où j'en suis",
      text: [
        "Tout ce qui peut être validé hors ligne l'est, et les trois workflows de CI sont verts. Le premier déploiement sur le matériel est la prochaine étape. Plusieurs points ne sont validés que sur le papier et à confirmer sur le serveur : l'adoption des objets Cluster API par ArgoCD, les user namespaces sous Talos, les règles DNS L7 de Cilium et les noms de domaine de chall-manager, le rôle network_admin de NetBird, l'import de la configuration OPNsense, les overrides Unbound et, surtout, l'enchaînement complet de task up.",
        "Je ne vais donc pas prétendre que ça marche du premier coup : un système qui se reconstruit en une commande se mérite, et c'est le chronométrage de task rebuild sur le vrai hôte qui dira si la promesse est tenue.",
      ],
    },
  ],
  retex: {
    learned: [
      "Une source de vérité unique (le contrat) évite plus de bugs que n'importe quel test : une IP, un VLAN ou un VMID n'est écrit qu'une fois, et tout le reste le lit.",
      "Penser l'ordre de bootstrap avant d'écrire le code. Les dépendances circulaires (un IdP dans un LXC, des secrets OIDC générés par tofu) n'apparaissent qu'en dessinant le graphe de dépendances, pas en lisant la documentation de chaque outil.",
      "Un dépôt public change la gestion des secrets : tout chiffré, et des garde-fous automatiques à la place de la vigilance. La contrainte « reconstruit à chaque fois » a aussi changé ma réponse par rapport à kort (SOPS ici, sealed-secrets là-bas).",
      "Sur un CTF, les utilisateurs sont les attaquants : la plateforme doit être sûre contre ses propres joueurs (déni de service, tunnel DNS, images piégées, évasions de pod), pas seulement contre l'extérieur.",
      "Écrire les ADR avec les alternatives écartées m'a obligé à justifier chaque brique.",
      "Valider hors ligne va loin, mais pas jusqu'au matériel : lint, plan et tests ne remplacent pas un vrai premier task up. Écrire ce qui n'est pas encore validé, noir sur blanc, évite de se mentir.",
    ],
    next: [
      "Faire le premier déploiement réel, enchaîner task up, puis chronométrer task rebuild pour vérifier la promesse « une commande ».",
      "Confirmer sur le matériel les points validés seulement hors ligne (adoption CAPI par ArgoCD, user namespaces Talos, DNS L7 Cilium, rôle NetBird, import OPNsense).",
      "Tester la matrice de flux avec nmap depuis chaque zone, et valider avec k6 le scaling des pods puis des nœuds ; calibrer le seuil KEDA du front.",
      "Passer verify-images en Enforce avec une vraie clé cosign, et poser les identifiants de pull de Zot sur les nœuds challenges.",
      "Faire lire les clés S3 de CTFd depuis SOPS par le Job garage-init, et collecter les blocages OPNsense dans Loki.",
    ],
  },
}

export const PAD_STATS = [
  ['1 commande', 'task up / task destroy'],
  ['13', 'phases rejouables, chacune avec son check'],
  ['7', 'zones réseau, deny all journalisé'],
  ['6', 'LXC de services ; OPNsense et Talos en VMs'],
  ['18', 'composants synchronisés par ArgoCD'],
  ['67', 'alertes, chacune avec son runbook'],
  ['14', 'ADR, alternatives écartées comprises'],
  ['143', 'pages de documentation (MkDocs, build strict)'],
] as const

export const PAD_ZONES = {
  head: ['VLAN', 'Zone', 'CIDR', 'Contenu'],
  rows: [
    ['10', 'MGMT', '10.20.10.0/24', 'administration OPNsense, API Proxmox'],
    ['20', 'DMZ', '10.20.20.0/24', 'LXC edge (Traefik + CrowdSec), LXC NetBird'],
    ['30', 'BASTION', '10.20.30.0/24', 'LXC Warpgate'],
    ['40', 'IDENTITY', '10.20.40.0/24', 'LXC Authentik'],
    ['50', 'MONITORING', '10.20.50.0/24', 'VictoriaMetrics, Loki, Tempo, Grafana, Alertmanager, Uptime Kuma'],
    ['60', 'PROD', '10.20.60.0/24', 'Talos : control plane, workers platform, pool LB de l’ingress'],
    ['70', 'CHALLENGES', '10.20.70.0/24', 'workers challenges, routing peer NetBird, pool LB des instances'],
  ],
}
