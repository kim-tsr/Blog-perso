# dev.sec.ops — Sandbox éphémère (k3s)

Setup minimal pour héberger les labs sandbox sur un cluster k3s Hetzner.

## Architecture

```
Vercel (Next.js)
   │ HTTPS + Bearer token
   ▼
k3s API (https://k3s.example.com:6443)
   │ POST /api/v1/namespaces/devsecops-labs/pods
   ▼
Pod éphémère (lab-hardening-ssh-…)
   - rootfs read-only + tmpfs
   - activeDeadlineSeconds=1800 (auto-kill)
   - NetworkPolicy egress=deny + DNS only
   │
   ▼ Service ClusterIP → Ingress
{session}.sandbox.dev-sec-ops.com   ←  iframe browser user
```

## Prérequis

- k3s ≥ 1.28 sur un nœud Hetzner avec IP publique
- **CNI compatible NetworkPolicy** (Calico/Cilium — Flannel par défaut ne supporte PAS NetworkPolicy)
- Domaine `*.sandbox.dev-sec-ops.com` pointant vers l'IP du node
- cert-manager + Let's Encrypt configurés pour wildcard cert
- Traefik (embarqué k3s) OK comme Ingress controller

## Install

```bash
# 1. Namespace + RBAC
kubectl apply -f 00-namespace.yaml
kubectl apply -f 10-rbac.yaml

# 2. NetworkPolicy (vérifier CNI ≠ flannel !)
kubectl apply -f 20-networkpolicy.yaml

# 3. Build + push des images lab (une par lab sandboxable)
docker build -t ghcr.io/devsecops/lab-hardening-ssh:latest  -f 30-image-hardening-ssh.Dockerfile .
docker build -t ghcr.io/devsecops/lab-linux-systemd:latest  -f 31-image-linux-systemd.Dockerfile .
docker build -t ghcr.io/devsecops/lab-containers:latest     -f 32-image-containers.Dockerfile .
docker push ghcr.io/devsecops/lab-hardening-ssh:latest
docker push ghcr.io/devsecops/lab-linux-systemd:latest
docker push ghcr.io/devsecops/lab-containers:latest

# 4. Récupérer le token du SA pour Next.js
kubectl -n devsecops-labs get secret devsecops-sandbox-controller-token \
  -o jsonpath='{.data.token}' | base64 -d
```

## Env vars à mettre sur Vercel

| Variable | Valeur | Notes |
|---|---|---|
| `K8S_API_URL` | `https://k3s.example.com:6443` | API server publique du k3s |
| `K8S_SA_TOKEN` | `<token du step 4>` | Bearer token, JWT long-lived |
| `K8S_NAMESPACE` | `devsecops-labs` | Hardcodé en défaut |
| `K8S_SANDBOX_HOST` | `sandbox.dev-sec-ops.com` | Base host pour Ingress wildcard |
| `K8S_INSECURE` | `true` (optionnel) | À activer SEULEMENT si le k3s a un cert auto-signé |
| `K8S_LAB_IMAGE_HARDENING_SSH` | `ghcr.io/devsecops/lab-hardening-ssh:latest` | Override image du lab hardening-ssh |
| `K8S_LAB_IMAGE_LINUX_SYSTEMD` | `ghcr.io/devsecops/lab-linux-systemd:latest` | Override image du lab linux-01-systemd-hardening |
| `K8S_LAB_IMAGE_CONTAINERS` | `ghcr.io/devsecops/lab-containers:latest` | Override image du lab containers-from-scratch |

> ⚠️ Les images doivent être **build + push** (step 3) avant qu'un lab soit
> lançable. Sinon le pod reste `Pending`/`Failed` : l'UI affiche un écran
> « Provisioning » puis un timeout propre (~75 s) avec bouton « Réessayer ».
>
> ⚠️ `containers-from-scratch` n'est qu'un mode *exploration* sous le podSpec
> hardened (pas de `CAP_SYS_ADMIN` → `unshare` échoue). Le rendre pleinement
> interactif suppose de relâcher le `securityContext` — décision sécurité.

## Vérification

```bash
# Pods/services/ingresses créés par le controller
kubectl -n devsecops-labs get pods,svc,ingress

# Logs pour debug
kubectl -n devsecops-labs logs <pod>

# Tester qu'un pod ne peut PAS sortir
kubectl -n devsecops-labs exec <pod> -- curl -m 5 https://example.com
# → doit timeout (NetworkPolicy egress deny)

# Tester que la DNS marche
kubectl -n devsecops-labs exec <pod> -- nslookup kubernetes.default
# → doit résoudre
```

## Garbage collect

- `activeDeadlineSeconds` côté Pod : auto-kill après 1800s, peu importe ce que fait le client web.
- Le cron Postgres `lab_sessions_expire` marque les sessions DB comme `expired` toutes les 2 min.
- Si un pod est laissé tourner alors que la DB est marquée terminée, c'est récupérable manuellement :
  ```bash
  kubectl -n devsecops-labs delete pods -l app=devsecops-lab \
    --field-selector status.phase!=Pending
  ```

## Étendre à d'autres labs

1. Ajouter `sandboxable: true` dans le frontmatter MDX du lab
2. Construire une image OCI dérivée (sshd? docker? whatever the lab needs)
3. Push sur le registry
4. Mapper dans `lib/k8s.ts` :
   ```ts
   const LAB_IMAGES: Record<string, string> = {
     'hardening-ssh': '…',
     'mon-nouveau-lab': process.env.K8S_LAB_IMAGE_MON_NOUVEAU_LAB ?? '…',
   }
   ```
   Si le lab doit écrire dans `/etc` malgré le rootfs RO, déclarer les
   sous-dossiers writable (jamais `/etc` entier) dans `LAB_WRITABLE_ETC` :
   ```ts
   const LAB_WRITABLE_ETC: Record<string, string[]> = {
     'mon-nouveau-lab': ['/etc/mon-service'],
   }
   ```
5. Ajouter la variable correspondante dans `.env.example`
