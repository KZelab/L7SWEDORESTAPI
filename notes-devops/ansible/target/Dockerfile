# A stand-in for a freshly installed server: SSH, Python, and nothing else.
FROM debian:12-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    openssh-server python3 python3-apt sudo procps \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir -p /run/sshd \
  && useradd --create-home --shell /bin/bash ansible \
  && echo 'ansible:ansible' | chpasswd \
  && echo 'ansible ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/ansible

EXPOSE 22 80
CMD ["/usr/sbin/sshd", "-D", "-e"]
