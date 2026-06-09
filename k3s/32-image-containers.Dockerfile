# dev.sec.ops — Image lab "containers-from-scratch"
# Build :  docker build -t ghcr.io/devsecops/lab-containers:latest -f 32-image-containers.Dockerfile .
# Push  :  docker push ghcr.io/devsecops/lab-containers:latest
#
# ⚠️ LIMITE IMPORTANTE — à lire avant d'activer ce lab en sandbox :
# Créer des namespaces (unshare --pid --net --mount) exige CAP_SYS_ADMIN, que le
# podSpec hardened de lib/k8s.ts NE donne PAS (drop ALL, no privilege escalation).
# Tel quel, ce sandbox est un mode "exploration" : lire /proc, /sys/fs/cgroup,
# lsns, nsenter sur soi-même, inspecter — mais PAS créer de namespaces.
# Pour rendre le lab pleinement interactif il faudrait relâcher le securityContext
# (add CAP_SYS_ADMIN) — décision sécurité à assumer côté opérateur.
#
# Rootfs read-only au runtime : writes dans les tmpfs montés par lib/k8s.ts.
FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
      util-linux \
      procps \
      iproute2 \
      vim \
      less \
      ca-certificates \
      curl \
    && rm -rf /var/lib/apt/lists/*

# ttyd : binaire statique téléchargé depuis le release officiel.
ARG TTYD_VERSION=1.7.7
RUN curl -fsSL -o /usr/local/bin/ttyd \
      "https://github.com/tsl0922/ttyd/releases/download/${TTYD_VERSION}/ttyd.x86_64" \
    && chmod +x /usr/local/bin/ttyd

RUN useradd -m -s /bin/bash labuser

COPY <<'EOF' /etc/motd
═══════════════════════════════════════════════════════════════
  dev.sec.ops — Sandbox lab "Containers from scratch"
  Mode exploration (le sandbox n'a pas CAP_SYS_ADMIN).

  - Inspecte les namespaces du process courant : lsns, ls -l /proc/self/ns
  - Explore la hiérarchie cgroups v2 : cat /sys/fs/cgroup/cgroup.controllers
  - Lis /proc/1/status, compare les caps : grep Cap /proc/self/status
  - La création de namespaces (unshare --pid --net) échouera : c'est
    précisément la démonstration du rôle de CAP_SYS_ADMIN. Suis le lab
    sur une VM root pour la partie interactive.
═══════════════════════════════════════════════════════════════
EOF

EXPOSE 7681
CMD ["/usr/local/bin/ttyd", "-p", "7681", "-W", "-t", "fontSize=14", "-t", "theme={\"background\":\"#07070c\"}", "bash", "-l"]
