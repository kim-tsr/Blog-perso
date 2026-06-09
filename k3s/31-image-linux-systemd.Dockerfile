# dev.sec.ops — Image lab "linux-01-systemd-hardening"
# Build :  docker build -t ghcr.io/devsecops/lab-linux-systemd:latest -f 31-image-linux-systemd.Dockerfile .
# Push  :  docker push ghcr.io/devsecops/lab-linux-systemd:latest
#
# Le lab consiste à écrire des units systemd et à mesurer leur exposition.
# On NE fait PAS tourner systemd comme PID 1 (impossible sous le rootfs RO +
# no-privilege du sandbox). À la place on utilise l'analyse OFFLINE :
#   systemd-analyze security --offline=true /etc/systemd/system/mon-service.service
# (supporté depuis systemd 247 — bookworm embarque 252).
#
# Rootfs read-only au runtime : les writes vont dans les tmpfs montés par
# lib/k8s.ts (/tmp /home/labuser /var/run + /etc/systemd pour ce lab).
FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
      systemd \
      vim \
      less \
      ca-certificates \
      iproute2 \
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
  dev.sec.ops — Sandbox lab "Durcir un service systemd"
  30 minutes, environnement éphémère et isolé.

  - Écris une unit dans /etc/systemd/system/ (tmpfs writable)
  - Analyse-la SANS manager (le sandbox ne lance pas systemd) :
      systemd-analyze security --offline=true \
        --root=/ /etc/systemd/system/mon-service.service
  - Itère : ajoute ProtectSystem=strict, NoNewPrivileges=true,
    PrivateTmp=true… puis relance l'analyse et regarde le score baisser.
═══════════════════════════════════════════════════════════════
EOF

EXPOSE 7681
CMD ["/usr/local/bin/ttyd", "-p", "7681", "-W", "-t", "fontSize=14", "-t", "theme={\"background\":\"#07070c\"}", "bash", "-l"]
