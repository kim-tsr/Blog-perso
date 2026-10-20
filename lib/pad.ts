import type { Story } from './kort'

export const PAD_REPO = 'https://github.com/kim-tsr/penetrate-and-destroy'
// Documentation MkDocs archivée en statique dans public/pad-docs (le lab n'est plus en ligne).
export const PAD_DOCS_PAGE = '/projets/penetrate-and-destroy/documentation'
export const PAD_DOCS_HOME = '/pad-docs/index.html'

export const PAD: Story = {
  title: 'PenetrateAndDestroy : une plateforme CTF jetable, de bout en bout',
  intro: "PenetrateAndDestroy est une plateforme CTF complète que je peux détruire et reconstruire avec une seule commande, sur un unique hôte Proxmox. Un routeur OPNsense découpe le réseau en sept zones, les services d'infrastructure tournent en LXC, un cluster Kubernetes Talos héberge CTFd (en mode headless), un front Next.js sur mesure et les instances de challenges, une par équipe. Tout est en infrastructure as code, tout est déployé par ArgoCD, et le dépôt est public : aucun secret en clair. Je l'ai conçue, validée hors ligne, puis déployée pour de vrai sur mon serveur, avant d'arrêter le lab. Voici comment je l'ai construite, ce que le premier déploiement m'a appris, et ce que je referais.",
  tech: ['Proxmox', 'OpenTofu', 'Ansible', 'OPNsense', 'Talos', 'Cluster API', 'ArgoCD', 'Cilium', 'Kyverno', 'SOPS + age', 'NetBird', 'Authentik', 'CTFd', 'Next.js', 'Prometheus'],
  repos: [
    { label: 'Dépôt GitHub', href: PAD_REPO },
    { label: 'Documentation (archive)', href: PAD_DOCS_PAGE },
  ],
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
      title: 'Le premier déploiement réel : quatre jours face au matériel',
      text: [
        "La plateforme était validée hors ligne. Je l'ai ensuite déployée de bout en bout sur l'hôte réel, phase par phase, avec une règle stricte : chaque correctif est fait dans le dépôt public, commité, documenté dans le guide, puis récupéré dans mon dépôt privé, celui qui porte les valeurs de mon site. Jamais de rustine directement sur le serveur. En quatre jours : 225 commits, dont 116 correctifs, et un tableau de dépannage passé à 40 entrées, chacune avec le symptôme exact et sa cause.",
        "J'ai piloté ce déploiement avec un agent Claude Code. Il exécutait les phases, lisait les journaux, cherchait la cause et proposait le correctif. Les garde-fous ont joué leur rôle : l'agent n'a jamais pu affaiblir seul un réglage de sécurité de l'hôte (la liste d'IP autorisées de l'API Proxmox, par exemple). Il me donnait la commande exacte, je la lançais en connaissance de cause, et un contrôle était ajouté à la phase 0 pour que ce prérequis soit vérifié aux déploiements suivants.",
        "Le plus instructif, c'est que presque aucun de ces problèmes n'était visible hors ligne. Ils naissent de la rencontre entre des choix individuellement corrects : le durcissement de l'hôte, une politique « deny by default » partout, un budget de RAM serré, des versions récentes d'outils qui changent leurs valeurs par défaut.",
      ],
      snippets: [{ file: 'git log (déploiement)', lang: 'text', code: `225 commits en 4 jours, dont 116 correctifs
  edge, ansible, composants     10 chacun
  opnsense                       9
  gitops, cluster                7
  ctfd                           6
  kyverno, argocd, netbird...    5

guide de déploiement : 40 entrées de dépannage
  symptôme exact (message d'erreur) -> cause -> correctif` }],
    },
    {
      title: 'Le durcissement de l’hôte contre la plateforme',
      text: [
        "Les premiers blocages venaient de mon propre hôte, durci avant le projet. L'API Proxmox n'acceptait que le VPN : le cloud controller du cluster recevait un « connection reset » et les nœuds restaient non initialisés. OpenSSH 10 pénalise les connexions répétées d'une même source (PerSourcePenalties) : Ansible, qui rebondit par l'hôte vers six LXC, se faisait refuser. Il a fallu multiplexer le rebond SSH. Et le pont des zones, filtré par br_netfilter, croisait le SNAT du VPN Tailscale : les réponses perdaient leur traduction. Une règle notrack sur les trames pontées l'a réglé.",
        "La leçon : le durcissement d'un hôte fait partie des prérequis d'une plateforme, au même titre que ses ports. Chacun de ces points est devenu un contrôle de la phase 0, qui échoue avant de toucher quoi que ce soit.",
      ],
    },
    {
      title: '« Deny by default » : il faut ouvrir les deux côtés',
      text: [
        "Chaque namespace de la plateforme démarre en default-deny Cilium. Sur le papier, c'est la bonne posture. En vrai, elle a produit une série de pannes silencieuses, toutes du même type : un flux autorisé d'un seul côté. Le repo-server d'ArgoCD s'est coupé lui-même de Git en appliquant la politique de son propre namespace, et ne pouvait plus se réparer. cert-manager ne joignait pas Let's Encrypt. L'API server ne joignait pas les webhooks de mariadb-operator, cert-manager et KEDA, si bien que la base de CTFd n'était jamais créée. Le front sortait vers Valkey, mais le namespace de Valkey ne le laissait pas entrer.",
        "Le piège le plus subtil vient de Cilium. Une NetworkPolicy Kubernetes en ipBlock ne couvre pas les IP des nœuds : Cilium les classe en entités (kube-apiserver, host, remote-node). La règle « autoriser le CIDR de la zone sur 6443 » ne laissait donc jamais passer l'API server, et netbird-sync tournait en boucle sans pouvoir synchroniser ses caches. La réponse est une CiliumNetworkPolicy en toEntities. J'ai aussi fait passer Git par SSH sur le port 443, plutôt que d'ouvrir le 22 en sortie : les zones n'ont d'egress Internet qu'en 80 et 443.",
      ],
      snippets: [{ file: 'apiserver-egress.yaml', lang: 'yaml', code: `# Cilium ne compare pas les IP des nœuds aux ipBlock :
# l'API server se déclare comme une entité.
apiVersion: cilium.io/v2
kind: CiliumNetworkPolicy
metadata:
  name: apiserver-egress
spec:
  endpointSelector: {}
  egress:
    - toEntities: [kube-apiserver]` }],
    },
    {
      title: 'Le budget de RAM, et le jour où l’hôte s’est figé',
      text: [
        "Le budget de 31 Go s'est révélé faux sur un point : le control plane. Avec 122 CRD installées par la plateforme (Cluster API, Kyverno, Cilium, cert-manager, MariaDB, KEDA...), kube-apiserver montait à 1,9 Go. À 2,5 Go, le nœud saturait et l'API tombait en plein déploiement. Il est passé à 4 Go, et les workers de 3,5 à 4,5 Go : les requests de la plateforme ne tenaient pas.",
        "Puis l'hôte s'est figé. Un rolling update des workers créait une VM de plus avant de supprimer l'ancienne, pendant que le cache ZFS gardait 4 Go : le noyau est entré en récupération mémoire et s'est bloqué (rcu_preempt detected stalls). Plus de SSH, plus de VPN, plus de site. Il a fallu un redémarrage matériel par la console IPMI de l'hébergeur. Les correctifs : cache ZFS à 2 Go, remplacement des nœuds sans surge (maxSurge: 0), et surtout un contrôle de phase 0 qui calcule le pic (pool challenges au maximum, cache et réserve compris) et échoue s'il dépasse la RAM.",
        "Retirer la surge a créé deux interblocages, à résoudre l'un après l'autre. Avec deux workers seulement, un PodDisruptionBudget empêchait de vider un nœud, faute de place pour le second réplica : j'ai ajouté un délai de drain. Et le contrôleur CAPMOX, celui qui crée les VM, restait lui-même en attente de place sur le seul worker restant : les contrôleurs Cluster API sont désormais en priorité system-cluster-critical.",
      ],
      snippets: [{ file: 'check 0-prereqs (principe)', lang: 'bash', code: `# pic = invités (pool challenges au maximum) + ARC ZFS + réserve
need=$(yq '.router.memory_mb, .services[].memory_mb,
  .kubernetes.control_plane.memory_mb,
  .kubernetes.pools.platform.memory_mb * .kubernetes.pools.platform.replicas,
  .kubernetes.pools.challenges.memory_mb * .kubernetes.pools.challenges.max' \\
  contracts.yaml | awk '{s+=$1} END {print s}')
peak=$((need + arc_mb + 2048))
(( host_mb < peak )) && fail "pic \${peak} Mio > RAM de l'hôte"` }],
    },
    {
      title: 'Une régression Talos, lue dans le code source',
      text: [
        "Après le redémarrage de l'hôte, le control plane est revenu sans adresse IP. CAPMOX injecte l'IP statique de chaque nœud par un ISO cloud-init, qu'il éjecte une fois la machine prête. Normalement, Talos garde alors en cache la dernière configuration réseau. Mais Talos 1.11.3 contient une régression : sans l'ISO, il écrase ce cache par une configuration vide. Je l'ai confirmé en lisant le code des deux projets, puis l'issue correspondante, corrigée en 1.11.4.",
        "La reprise a été la meilleure démonstration du projet. Plutôt que de réparer le nœud à la main, j'ai monté Talos en 1.11.6 dans le contrat, détruit le cluster cassé avec une tâche dédiée, et relancé les phases 3, 9 et 10 : nouveau template, nouveau cluster, pivot, ArgoCD. Les LXC, le routeur et l'identité n'ont pas bougé.",
      ],
    },
    {
      title: 'Le SSO, ou les valeurs par défaut qui changent',
      text: [
        "La chaîne d'identité a cassé à plusieurs endroits, souvent à cause d'une version récente. Authentik 2026 ajoute une liste des flux autorisés par fournisseur OAuth : laissée vide par tofu, elle refusait toute connexion, sur tous les services. Son mapping e-mail renvoie toujours email_verified à false, et Warpgate refuse alors de rattacher le compte. Je l'ai remplacé par un mapping qui ne marque l'adresse vérifiée que lorsque c'est vrai : comptes à privilèges, attribués par un administrateur. Les joueurs inscrits seuls restent à false.",
        "D'autres pièges tenaient au protocole. NetBird attend un hash bcrypt du mot de passe de son propriétaire, pas le mot de passe en clair. Warpgate lie son cookie de session à son nom d'hôte : ouvert par son IP, il connecte, puis renvoie au formulaire sans aucune erreur. Et le WAF CrowdSec lisait le gRPC binaire de NetBird comme une attaque : chaque appel de netbird up recevait un 403, et ces 403 en rafale ont fait bannir ma propre IP pour quatre heures. Les flux gRPC et WebSocket passent désormais par une chaîne sans WAF, qui applique toujours les bans d'IP.",
      ],
      snippets: [{ file: 'stacks/30-authentik/oidc.tf', lang: 'hcl', code: `resource "authentik_provider_oauth2" "client" {
  # ...
  # Authentik 2026 : vide = aucun flux permis
  grant_types = ["authorization_code", "refresh_token"]
}

# email_verified : vrai seulement quand c'est vrai
staff    = ["ctf-managers", "ctf-admins", "infra-admins"]
verified = user.attributes.get("email_verified", False)
        or user.groups.filter(name__in=staff).exists()` }],
    },
    {
      title: 'Converger pour de bon : quand ArgoCD voit des écarts imaginaires',
      text: [
        "Dernier chantier : obtenir les 28 Applications ArgoCD en Synced et Healthy, et non « à peu près synchronisées ». Une dizaine restaient OutOfSync alors que tout fonctionnait. Avec l'apply côté serveur, ArgoCD possède en bloc les listes et structures atomiques : une valeur par défaut ajoutée par l'API server ou par un webhook y apparaît comme un écart, et ArgoCD resynchronise sans fin. C'était le cas des volumeClaimTemplates des StatefulSets, d'un champ generate: false d'une CR MariaDB, d'un namespace ajouté par un webhook, ou de labels: {} rendus par un chart et jamais stockés.",
        "La règle que j'ai retenue : d'abord écrire la valeur explicitement dans le manifeste, et ne recourir à ignoreDifferences que lorsque le chart ne permet pas de la fixer. Et le dernier nœud challenges a révélé un dernier détail : NodeRestriction interdit à un nœud de modifier ses taints après son enregistrement. Le taint du pool se pose donc au démarrage du kubelet, pas après coup par Talos.",
      ],
    },
    {
      title: 'Le résultat',
      text: [
        "La phase 12 a fini à 11 contrôles sur 11 : front, Authentik, NetBird et la page de statut en HTTPS public, découverte OIDC, nœuds prêts, cluster Cluster API provisionné, 28 Applications ArgoCD synchronisées et saines, isolation de la zone challenges vérifiée, supervision active. Le SSO fonctionnait sur NetBird et sur Warpgate, avec second facteur pour les comptes à privilèges.",
        "Côté challenges, une image signée par la CI a été copiée dans le registre interne Zot sous la même empreinte, puis tirée par un nœud du pool challenges avec les identifiants posés par une nouvelle tâche, task zot:pull-auth. Le conteneur a démarré sous les contraintes d'une instance de joueur : user namespace, système de fichiers en lecture seule, aucune capacité, quotas imposés par Kyverno. Je n'ai pas eu le temps de faire un lancement d'instance complet depuis l'interface du joueur avant l'arrêt du lab : c'est le maillon que je n'ai pas vu tourner de bout en bout.",
      ],
    },
    {
      title: 'Le lab aujourd’hui',
      text: [
        "Le lab est arrêté et ne sera pas remis en ligne pour les visiteurs : aucune des URL de la plateforme ne répond. C'était l'esprit du projet dès le départ : une plateforme jetable, qu'on reconstruit quand on en a besoin. Ce qui reste, c'est le dépôt public, qui contient tout le nécessaire pour la redéployer sur un autre hôte, avec tous les correctifs de ce déploiement.",
        "Reste aussi la documentation : 145 pages MkDocs écrites avec le code, puis corrigées pendant le déploiement (guide en treize phases, quarante entrées de dépannage, fiches des composants, quatorze ADR, trente-deux runbooks). Je l'ai archivée en version statique sur ce site, consultable sans aucune dépendance au lab.",
      ],
    },
    {
      title: 'Conclusion',
      text: [
        "Ce projet m'a appris la différence entre une infrastructure valide et une infrastructure qui tourne. Tout passait en CI avant le premier task up : tofu plan, ansible-lint, kubeconform, les tests. Il a pourtant fallu 116 correctifs pour que la plateforme tourne sur du vrai matériel, et aucun n'était un bug qu'un test hors ligne aurait trouvé. Ce sont des interactions : entre un durcissement et un pont réseau, entre une politique de sécurité et un webhook, entre un budget de RAM et une stratégie de mise à jour, entre une version récente et une valeur par défaut.",
        "Ce que je garde surtout, c'est la méthode qui a rendu ces 116 correctifs supportables : une source de vérité unique, des phases idempotentes qu'on relance sans crainte, un contrôle automatique pour chaque prérequis découvert, et une documentation tenue à jour à chaque correctif, au point qu'un autre opérateur tomberait aujourd'hui sur la bonne réponse dans le tableau de dépannage. La promesse « une commande » n'est pas magique. Elle tient parce que chaque panne rencontrée est devenue un contrôle, une valeur du contrat ou une ligne de documentation.",
      ],
    },
  ],
  retex: {
    learned: [
      "Une source de vérité unique (le contrat) évite plus de bugs que n'importe quel test : une IP, un VLAN ou un VMID n'est écrit qu'une fois, et tout le reste le lit. Au déploiement, changer la taille d'un nœud ou la version de Talos s'est résumé à une valeur du contrat.",
      "Une infrastructure valide n'est pas une infrastructure qui tourne. Tout passait en CI, et il a fallu 116 correctifs sur le matériel : des interactions entre des choix corrects, qu'aucun test hors ligne ne voit.",
      "« Deny by default » se paie : chaque flux s'ouvre des deux côtés, webhooks et API server compris, et Cilium ne traite pas les IP des nœuds comme des CIDR. Une panne silencieuse sur deux venait de là.",
      "Un budget de RAM se calcule au pic, pas en régime établi : surge des mises à jour, autoscaler au maximum, cache ZFS. Le dépasser ne donne pas une erreur propre, mais un hôte figé.",
      "Les valeurs par défaut changent avec les versions (Authentik, Talos, Warpgate) : épingler les versions ne suffit pas, il faut écrire explicitement ce qu'on attend.",
      "Chaque panne doit laisser une trace utile : un contrôle de phase, une valeur du contrat ou une ligne de dépannage. C'est ce qui rend la promesse « une commande » tenable dans la durée.",
      "Un dépôt public change la gestion des secrets : tout chiffré, des garde-fous automatiques à la place de la vigilance, et un dépôt privé séparé pour les valeurs du site, réaligné automatiquement après chaque correctif.",
    ],
    next: [
      "Lancer une instance de challenge de bout en bout depuis l'interface du joueur, le seul maillon que je n'ai pas vu tourner avant l'arrêt.",
      "Chronométrer un task rebuild complet sur un hôte propre, maintenant que tous les correctifs sont dans le dépôt.",
      "Tester la matrice de flux avec nmap depuis chaque zone, et valider avec k6 le scaling des pods puis des nœuds.",
      "Passer la vérification des images en Enforce avec une vraie clé cosign, et protéger la branche main du dépôt public.",
      "Prévoir plus de 32 Go de RAM, ou un deuxième hôte : la marge au pic est de 644 Mio, ce qui laisse peu de place à l'imprévu.",
    ],
  },
}

export const PAD_STATS = [
  ['1 commande', 'task up / task destroy'],
  ['13', 'phases rejouables, chacune avec son check'],
  ['7', 'zones réseau, deny all journalisé'],
  ['6', 'LXC de services ; OPNsense et Talos en VMs'],
  ['28', 'Applications ArgoCD, toutes Synced et Healthy'],
  ['67', 'alertes, chacune avec son runbook'],
  ['116', 'correctifs en 4 jours de déploiement réel'],
  ['145', 'pages de documentation, archivées sur ce site'],
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
