# notes-devops

Reference repository for the ACCA7023 practical: a small notes application
(React and Express, both TypeScript) whose real subject is the pipeline
around it. Students build their own copy by following the sheets in `labs/`.

| Folder | Contents |
|---|---|
| `server/` | Express API, unit and integration tests (Vitest, Supertest) |
| `client/` | React front end, component tests (Vitest, React Testing Library) |
| `e2e/` | Playwright browser and accessibility tests |
| `Dockerfile` | Multi-stage build producing one image for both halves |
| `.github/workflows/` | CI on pull requests, deploy on merge, manual rollback |
| `jenkins/` | Jenkins controller defined as code, and a Jenkinsfile running the same CI stages |
| `ansible/` | Self-contained configuration management demo using containers as servers |
| `infra/` | Staff only: Azure provisioning and teardown for a cohort |
| `labs/` | Generated student lab sheets and their manifest |
| `docs/` | User stories and story map |

## Run it locally

```bash
npm ci --prefix server && npm ci --prefix client
npm run dev --prefix server    # terminal 1, API on port 3000
npm run dev --prefix client    # terminal 2, page on port 5173
```

## Run every check

```bash
(cd server && npm run lint && npm run format:check && npm run typecheck && npm run test:coverage)
(cd client && npm run lint && npm run format:check && npm run test:coverage && npm run build)
npm run build --prefix server
(cd e2e && npm ci && npx playwright install chromium && npx playwright test)
docker build -t notes-devops:local .
```

Notes are held in memory and are lost whenever the process or container is
replaced. That is a stated limitation of the practical, not an oversight.
