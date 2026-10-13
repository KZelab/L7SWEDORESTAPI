FROM jenkins/jenkins:lts-jdk21

USER root

# Node.js, copied from the official Node image so the version matches the
# one used everywhere else in the project.
COPY --from=node:22-bookworm-slim /usr/local/bin/node /usr/local/bin/node
COPY --from=node:22-bookworm-slim /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
  && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# System libraries Chromium needs, so the browser tests can run in Jenkins.
RUN npx --yes playwright@1.64.0 install-deps chromium \
  && rm -rf /var/lib/apt/lists/* /root/.npm

USER jenkins

# Skip the setup wizard. The plugins and the admin user are defined in code.
ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false"
ENV CASC_JENKINS_CONFIG=/usr/share/jenkins/ref/casc.yaml

COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

COPY casc.yaml /usr/share/jenkins/ref/casc.yaml
