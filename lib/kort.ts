export interface Snippet { file: string; lang: string; code: string }
export interface Step {
  title: string
  text: string[]
  snippets?: Snippet[]
}

export const KORT = {
  title: 'kort : déploiement GitOps sur Kubernetes',
  intro: "kort est un raccourcisseur d'URL avec comptage de clics asynchrone (API FastAPI, worker, Redis, PostgreSQL). Je l'ai pris comme terrain de jeu pour apprendre à conteneuriser, déployer, exposer, observer puis durcir une application sur Kubernetes. Le code et les manifestes vivent dans deux dépôts séparés, et le tout est déployé sur mon cluster k3s par ArgoCD. Voici comment j'ai procédé, et ce que j'en retire.",
  tech: ['Kubernetes (k3s)', 'ArgoCD', 'Helm', 'Kustomize', 'sealed-secrets', 'Traefik', 'Prometheus', 'FastAPI', 'Redis', 'PostgreSQL', 'Docker'],
  repos: [
    { label: 'Code (kort-URL-shorter)', href: 'https://github.com/kim-tsr/kort-URL-shorter' },
    { label: 'Manifestes (kort-k3s-deployment)', href: 'https://github.com/kim-tsr/kort-k3s-deployment' },
  ],
  components: [
    ['api', 'sans état, reçoit HTTP', 'TCP 8000', 'Deployment'],
    ['web', 'statique (nginx)', 'TCP 80', 'Deployment'],
    ['worker', 'consomme le stream Redis', 'aucun port', 'Deployment'],
    ['postgres', 'avec état', 'TCP 5432', 'StatefulSet'],
    ['redis', 'broker / stream', 'TCP 6379', 'Deployment'],
    ['cleaner', 'tâche périodique', 'aucun port', 'CronJob'],
  ] as const,
  steps: [
    {
      title: "Conteneuriser avant de déployer",
      text: [
        "J'ai commencé par faire tourner kort en local avec Docker, juste pour comprendre comment les composants se parlent avant de toucher à Kubernetes. Les images sont poussées sur Docker Hub : je n'ai aucune donnée confidentielle, le code est public, et n'importe qui peut ainsi tester l'application sur son propre cluster. Une registry privée n'apportait rien ici.",
        "Les Dockerfiles sont en multi-stage, avec les couches qui bougent le moins en haut pour que le cache ne soit invalidé qu'à partir de ce qui change. Je lance l'application avec un utilisateur non-root et j'installe les dépendances avec --no-cache-dir pour alléger l'image. Au final : trois images python:3.12-slim (api, worker, cleaner) et une image nginx pour la page statique.",
      ],
      snippets: [{ file: 'api/Dockerfile', lang: 'dockerfile', code: `FROM python:3.12-slim

RUN addgroup --system app && adduser --system --group app
WORKDIR /app

# dépendances d'abord : couche mise en cache tant que requirements.txt ne bouge pas
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app
USER app

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]` }],
    },
    {
      title: "Un premier déploiement qui marche, sans chercher mieux",
      text: [
        "Premiers manifestes volontairement basiques : un Deployment par composant (un StatefulSet pour Postgres) avec son Service, et un seul replica partout. Je ne cherchais ni la résilience ni la performance, seulement une base qui tourne sur le cluster et sur laquelle itérer.",
      ],
    },
    {
      title: "Comprendre ce dont chaque composant a besoin",
      text: [
        "Avant d'améliorer quoi que ce soit, j'ai posé à plat le contrat de chaque composant : avec ou sans état, port d'écoute, dépendances (c'est le tableau plus haut). Ça m'a guidé pour les choix d'objets : le cleaner devient un CronJob horaire, et le worker, qui ne reçoit aucun trafic, rejoint un consumer group Redis, ce qui permet d'ajouter des replicas sans qu'un clic soit compté deux fois.",
        "Pour fixer les requests et les limits, j'ai mesuré au lieu de deviner, avec kubectl top pod --containers, puis refait les mesures sous charge. Dans mon cas l'API tourne autour de 50 Mi, Postgres 57 Mi, Redis 11 Mi, le worker 24 Mi.",
      ],
      snippets: [{ file: 'worker/worker.py', lang: 'python', code: `def ensure_group():
    """Crée le consumer group s'il n'existe pas (mkstream crée aussi le stream).
    BUSYGROUP = il existe déjà : ce n'est pas une erreur."""
    try:
        rdb.xgroup_create(STREAM, GROUP, id="0", mkstream=True)
    except redis.ResponseError as e:
        if "BUSYGROUP" not in str(e):
            raise

# HOSTNAME = nom du pod : un nom de consommateur unique et stable par replica
CONSUMER = os.environ.get("HOSTNAME", socket.gethostname())` }],
    },
    {
      title: "Des probes qui ne tuent pas un pod pour rien",
      text: [
        "J'ai ajouté les trois probes (startup, liveness, readiness) et choisi le QoS de chaque pod selon sa criticité. Le point qui m'a fait réfléchir : si Postgres tombe, /readyz de l'API renvoie 503. Il est normal de la retirer du Service, mais redémarrer le pod ne réparerait rien puisque c'est la base qui est morte. D'où deux endpoints distincts : /healthz ne touche à aucune dépendance et sert à la liveness, /readyz vérifie Postgres et Redis.",
        "J'ai aussi réparti les replicas de l'API sur les nœuds avec un topologySpreadConstraints.",
      ],
      snippets: [{ file: 'base/api/deployment.yaml', lang: 'yaml', code: `resources:
  requests: { cpu: 10m, memory: 50Mi }
  limits:   { memory: 100Mi }
livenessProbe:            # le process répond-il ? (aucune dépendance)
  httpGet: { path: /healthz, port: api }
  periodSeconds: 2
readinessProbe:           # postgres + redis joignables ? sinon 503, retrait du Service
  httpGet: { path: /readyz, port: api }
  periodSeconds: 5
  timeoutSeconds: 5
startupProbe:
  httpGet: { path: /healthz, port: api }
  failureThreshold: 30
topologySpreadConstraints:
  - maxSkew: 1
    topologyKey: kubernetes.io/hostname
    whenUnsatisfiable: DoNotSchedule` }],
    },
    {
      title: "Exposer kort sans abîmer ses URLs courtes",
      text: [
        "Je voulais envoyer /api vers l'API et tout le reste vers le front, mais une URL courte comme /uufxqf doit aussi arriver à l'API pour être redirigée. Préfixer les slugs par /api aurait cassé l'idée même d'un raccourcisseur : l'URL courte est la valeur métier, l'infra ne doit pas la déformer.",
        "J'ai donc utilisé un IngressRoute Traefik plutôt qu'un Ingress, parce qu'il sait matcher une regex : les slugs font toujours 6 caractères alphanumériques. Pour retirer le préfixe /api avant l'API, j'ai préféré un Middleware du cluster plutôt qu'une modification de FastAPI, l'objectif étant d'utiliser les briques de k3s.",
      ],
      snippets: [{ file: 'base/network/ingress.yaml', lang: 'yaml', code: `routes:
  - match: PathPrefix(\`/api\`)
    priority: 30
    middlewares: [{ name: strip-api }]   # /api/links -> /links
    services: [{ name: api, port: 8000 }]

  - match: PathRegexp(\`^/[a-z0-9]{6}$\`)   # le slug court, tel quel, vers l'API
    priority: 20
    services: [{ name: api, port: 8000 }]

  - match: PathPrefix(\`/\`)
    priority: 1
    services: [{ name: web, port: 80 }]` }],
    },
    {
      title: "Ranger les manifestes avec Kustomize",
      text: [
        "J'ai séparé base et overlays/prod : la base décrit l'application, l'overlay ne fait que fixer les tags d'images. J'ai aussi remplacé le ConfigMap par un configMapGenerator. Le nom du ConfigMap porte alors un hash du contenu : dès qu'une valeur change, un nouveau ConfigMap est créé et les Deployments redémarrent avec les nouvelles valeurs, au lieu de garder l'ancienne sans que personne ne s'en aperçoive.",
      ],
      snippets: [{ file: 'overlays/prod/kustomization.yaml', lang: 'yaml', code: `resources:
  - ../../base
namespace: kort

images:
  - name: kimtsr/kort-api
    newTag: "1.0"
  - name: kimtsr/kort-worker
    newTag: "1.0"
  # idem cleaner et web` }],
    },
    {
      title: "Passer en GitOps avec ArgoCD",
      text: [
        "Git devient la source de vérité : je pousse mes manifestes et le cluster les applique, sans kubectl apply à la main. Avec selfHeal, si je fais une mauvaise manip du genre kubectl scale deploy/api --replicas=10, ArgoCD voit l'écart avec Git et le corrige.",
        "Restait le problème des secrets : ArgoCD doit les lire depuis le dépôt, mais je ne veux pas d'un mot de passe en clair dans un dépôt public. J'ai utilisé sealed-secrets : la clé privée reste dans le cluster, je chiffre avec la clé publique, et seul le cluster sait déchiffrer. Le secret chiffré peut donc vivre dans Git.",
      ],
      snippets: [
        { file: 'argocd/apps/kort.yaml', lang: 'yaml', code: `kind: Application
metadata: { name: kort, namespace: argocd }
spec:
  source:
    repoURL: https://github.com/kim-tsr/kort-k3s-deployment
    targetRevision: master
    path: overlays/prod
  destination:
    server: https://kubernetes.default.svc
    namespace: kort
  syncPolicy:
    automated: { prune: true, selfHeal: true }
    syncOptions: [CreateNamespace=true]` },
        { file: 'base/config/sealed-secret.yaml', lang: 'yaml', code: `kind: SealedSecret
metadata: { name: kort-secret, namespace: kort }
spec:
  encryptedData:
    POSTGRES_PASSWORD: Ag...   # chiffré avec la clé publique du cluster` },
      ],
    },
    {
      title: "Observabilité : là où j'en suis",
      text: [
        "Pour garder la liste de tout ce que j'installe via Helm, j'ai choisi un pattern app-of-apps : une Application racine pointe sur le dossier argocd/apps, qui contient un fichier par composant externe (sealed-secrets, kube-prometheus-stack, et à venir Loki, OpenTelemetry, cert-manager).",
        "kube-prometheus-stack est déployé, avec un ServiceMonitor qui scrape /metrics sur l'API. Ça me donne les indicateurs RED : Rate, Errors, Duration. C'est la partie encore en cours.",
      ],
      snippets: [{ file: 'base/api/prometheus.yaml', lang: 'yaml', code: `kind: ServiceMonitor
metadata: { name: kort-api, namespace: kort }
spec:
  selector:
    matchLabels: { app: api }
  endpoints:
    - port: api
      path: /metrics
      interval: 30s` }],
    },
  ] as Step[],
  retex: {
    learned: [
      "Mesurer avant de fixer requests et limits : les valeurs au hasard faussent l'ordonnancement et le QoS.",
      "Une probe n'est pas un test de santé générique : chacune répond à une décision différente (redémarrer, retirer du trafic, attendre).",
      "Le GitOps rend le drift visible : une manip manuelle est détectée puis annulée au lieu de s'accumuler.",
      "Le hash du ConfigMap généré règle un piège classique : changer une valeur sans que les pods ne la voient.",
    ],
    next: [
      "Finir l'observabilité : Loki, OpenTelemetry, cert-manager (TLS) et des alertes sur les métriques RED.",
      "Sortir les migrations de schéma du démarrage de l'API (init_schema au startup) vers un Job ou un init container.",
      "Ne plus référencer :latest dans base/ : les tags ne sont fixés que dans l'overlay prod.",
      "Durcissement : NetworkPolicy, RBAC et Pod Security Standards (prochaine étape du lab).",
    ],
  },
}
