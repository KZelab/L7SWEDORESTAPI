# Stage 1 - build the React front end into static files
FROM node:22-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2 - compile the Express back end from TypeScript to JavaScript
FROM node:22-alpine AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# Stage 3 - the image that actually ships
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app

# Production dependencies only. No compiler, no test tools.
# npm is removed afterwards because the running app never needs it, and
# every package left in the image is one more thing to patch.
COPY server/package*.json ./
RUN npm ci --omit=dev \
  && npm cache clean --force \
  && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

COPY --from=server-build /app/server/dist ./dist
COPY --from=client-build /app/client/dist ./public

ARG APP_VERSION=dev
ENV APP_VERSION=$APP_VERSION
ENV PORT=3000
EXPOSE 3000

# Do not run the application as root.
USER node

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "dist/server.js"]
