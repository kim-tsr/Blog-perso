# dev.sec.ops — Image lab "hardening-ssh"
# Build :  docker build -t ghcr.io/devsecops/lab-hardening-ssh:latest -f 30-image-hardening-ssh.Dockerfile .
# Push  :  docker push ghcr.io/devsecops/lab-hardening-ssh:latest
#
# Image minimaliste : Debian + openssh-server + fail2ban + ssh-audit + ttyd.
# ttyd écoute sur :7681 et lance un shell bash dans le container.
# L'user fait le lab dans ce shell, en root (sandbox isolée).
#
# Rootfs read-only au runtime : tous les writes vont dans des tmpfs mountés
# (/tmp /home/labuser /var/run /etc/ssh) — cf. lib/k8s.ts podSpec.
FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
      openssh-server \
      openssh-client \
      fail2ban \
      ssh-audit \
      sudo \
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

# User labuser : pour faire des sudo dans le lab (avec mot de passe = labuser)
RUN useradd -m -s /bin/bash labuser \
    && echo "labuser:labuser" | chpasswd \
    && echo "labuser ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/labuser

# Banner / message du lab
COPY <<'EOF' /etc/motd
═══════════════════════════════════════════════════════════════
  dev.sec.ops — Sandbox lab "Hardening SSH"
  Tu as 30 minutes. L'environnement est éphémère et isolé
  (no-network, rootfs read-only, NetworkPolicy egress=deny).

  - User : labuser / labuser  (sudo activé)
  - sshd : /etc/ssh/sshd_config (édition libre)
  - Tests : 'ssh-audit localhost' après reload sshd

  Suis le lab dans l'onglet précédent et applique chaque étape ici.
═══════════════════════════════════════════════════════════════
EOF

EXPOSE 7681
CMD ["/usr/local/bin/ttyd", "-p", "7681", "-W", "-t", "fontSize=14", "-t", "theme={\"background\":\"#07070c\"}", "bash", "-l"]
