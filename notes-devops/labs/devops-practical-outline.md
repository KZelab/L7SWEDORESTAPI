# ACCA7023 Practical: CI/CD Pipeline for a Notes Application

Status: design outline for review. No code has been written yet.

## 1. Decisions taken so far

| Topic | Decision |
|---|---|
| Application | React front end, Express back end, simple notes app |
| Azure target | Azure Container Apps |
| Infrastructure | Resource group pre-created for the module; no Terraform |
| Jenkins | Undecided: possibly instead of GitHub Actions, options compared in section 6 |
| Ansible | Undecided: options compared in section 7 |
| Format | Markdown |

## 2. Mapping to the module specification

The indicative content for ACCA7023 names specific topics. The practical should touch each one, or you should consciously decide to leave it out.

| Indicative content | Where it appears in the practical | Covered? |
|---|---|---|
| Agile process (Scrum) | Issues as user stories, board, short sprints, feature delivered through the pipeline | Yes |
| User stories and story mapping | Students write stories for the notes app before building | Yes |
| Continuous Integration (Jenkins) | Section 6 | Depends on decision |
| Configuration management (Ansible, Puppet) | Section 7 | Depends on decision |
| Continuous Delivery and Git branching | Trunk-based or GitHub Flow with protected main, pull requests | Yes |
| Continuous Monitoring and Testing | Test pyramid (section 4), post-deployment smoke test, Azure Log Analytics | Yes |
| Continuous Deployment (Ansible, Terraform) | GitHub Actions or Jenkins deploying to Container Apps; Terraform omitted by choice | Partly |
| Cohesion vs coupling | Repository interface in the back end, thin route handlers | Yes |
| Design patterns (Singleton, Factory) | Store factory and single configuration object in the back end | Yes |

Terraform is the one named topic dropped by your decision. It is worth deciding whether that is acceptable for a Level 7 module, or whether a short demonstration (not a student task) would cover it.

## 3. Application design

The application is deliberately small so that the pipeline is the subject, not the app.

**Features (user stories):**

1. As a user, I can create a note with a title and body.
2. As a user, I can see a list of my notes.
3. As a user, I can edit a note.
4. As a user, I can delete a note.
5. As an operator, I can call a health endpoint to see whether the service is alive.

**Back end (Express, Node 20 LTS):**

- REST API: `GET /api/notes`, `POST /api/notes`, `PUT /api/notes/:id`, `DELETE /api/notes/:id`, `GET /api/health`.
- A `NoteRepository` interface with an in-memory implementation, created by a factory. This gives real, honest uses of the Factory pattern and of low coupling, and lets unit tests swap the store.
- A single configuration module (Singleton in effect) reading environment variables.
- Persistence: in-memory only. Container Apps replicas have ephemeral storage, so real persistence would need a database or Azure Files, which is out of scope. State this openly to students as a known limitation and a possible extension.

**Front end (React with Vite):**

- One page with a form and a list, using `fetch` against `/api/notes`.
- Built to static files and served by Express in production.

**Packaging decision:** one container image, built with a multi-stage Dockerfile (build the React app, copy the output into the Express image). This is simpler than two containers plus a reverse proxy, and it keeps the Container Apps deployment to a single app. The trade-off is that the front end and back end deploy together; mention this in the evaluation discussion.

## 4. Testing strategy

The module is about critically evaluating practices, so each test type should have a stated purpose and a stated cost.

| Layer | Tool | What it proves | Runs in pipeline |
|---|---|---|---|
| Static analysis | ESLint, Prettier check | Style and obvious defects | Every push |
| Unit (back end) | Vitest | Repository and validation logic in isolation | Every push |
| Unit and component (front end) | Vitest, React Testing Library | Components render and behave correctly with a mocked API | Every push |
| API integration | Vitest with Supertest | Routes, status codes and JSON shapes against the real Express app | Every push |
| GUI end to end | Playwright | A user can create, edit and delete a note in a real browser | Every pull request |
| Accessibility | `@axe-core/playwright` inside Playwright | No automatically detectable WCAG violations | Every pull request |
| Dependency audit | `npm audit` | Known vulnerable packages | Every pull request |
| Container image scan | Trivy | Known vulnerabilities in the built image | Before publish |
| Post-deployment smoke test | Playwright or `curl` against the live URL | The deployed revision actually works | After each deployment |
| Coverage gate | Vitest coverage thresholds | Coverage does not silently fall | Every pull request |

"The other kind of tests" in your notes: I have read this as integration, accessibility, security scanning and smoke tests. Performance tests (k6) are a possible extra, but I would leave them out to keep the scope manageable. Tell me if you meant something specific.

## 5. Pipeline design (tool-neutral)

```
Pull request:
  lint -> unit tests -> integration tests -> build -> Playwright e2e -> docker build -> Trivy scan

Merge to main:
  (all of the above) -> push image -> deploy new revision to Container Apps -> smoke test -> report
```

**Image registry:** GitHub Container Registry (public package) is free and Container Apps can pull from it without credentials. Azure Container Registry (Basic tier) is the more conventional Azure answer but costs money and needs role assignments in the resource group. Recommendation: GHCR for the module, with ACR discussed as the production choice.

**Azure authentication from CI:** OpenID Connect federation is the modern approach (no stored secrets), but it needs an app registration and federated credential, which many university tenants restrict. The fallback is a service principal secret scoped to the module resource group only. This must be checked with whoever administers the module's Azure subscription before the design is fixed.

**Deployment strategy:** Container Apps creates a new revision on each deployment, which supports a simple lesson in rollback (re-activate the previous revision) and, optionally, blue/green traffic splitting.

## 6. Jenkins versus GitHub Actions

You said Jenkins might replace Actions, and that both need consideration. Here is the comparison, followed by three concrete options.

| Factor | GitHub Actions | Jenkins |
|---|---|---|
| Hosting | Managed by GitHub | Students or you must host it (Docker on a laptop, a VM) |
| Setup effort | Minutes | Substantial: install, plugins, credentials, agents |
| Pipeline as code | YAML in `.github/workflows` | `Jenkinsfile` (Groovy declarative syntax) |
| Named in the module spec | No | Yes ("Continuous Integration (e.g. Jenkins)") |
| Industry relevance | Very high for new projects | High in established enterprises |
| Reach from the internet | Native to GitHub | Needs webhooks, a public URL or polling |
| Failure modes worth teaching | Few | Many (plugin conflicts, agent config), which is instructive but time-consuming |

**Option A: GitHub Actions only.** Fastest and most reliable for a cohort. Weakest match to the specification wording.

**Option B: Jenkins only.** Best match to the wording. Highest risk: hosting, webhooks from GitHub to a locally run Jenkins, and student environment variation. Would need a lab dedicated to standing Jenkins up in Docker.

**Option C: Both, with a clear division (my recommendation).** GitHub Actions is the primary pipeline through to deployment. Jenkins runs the same CI stages from a `Jenkinsfile` in a Docker container on the lab machine, as a comparison lab, and the assessment asks students to evaluate the two. This directly supports the "critically evaluate tools" learning outcome and costs one lab session, not the whole practical.

Your call on A, B or C. If Option C, decide whether Jenkins is a student task or a lecturer demonstration.

## 7. Ansible: what it would actually do

With Container Apps as the target and no Terraform, Ansible has no obvious job, and it is worth being honest about that rather than adding it for its own sake. There are three credible uses:

| Option | What Ansible does | Verdict |
|---|---|---|
| 1. Deployment step | A playbook using the `azure.azcollection` collection creates or updates the Container App revision, replacing an `az containerapp update` command | Genuine, small, and shows idempotency; needs the Azure collection and credentials in CI |
| 2. Configure the Jenkins host | A playbook installs Docker and starts Jenkins with pinned plugins on a machine | Genuine configuration management, but only if Jenkins is chosen and there is a host to configure (for example the lab machine or a VM you create) |
| 3. Leave it out or demonstrate | Lecturer-led demo of a playbook against a local container | Least effort, weakest coverage |

If you choose Jenkins (Option B or C), Option 2 fits naturally and gives Ansible a real purpose. If you choose GitHub Actions only, Option 1 is the honest fit. Please tell me which.

## 8. Agile element

Because this is an Agile module, the delivery process is part of the assessment, not decoration:

- The repository issue tracker holds user stories with acceptance criteria.
- A GitHub Projects board tracks the sprint.
- Every change goes through a branch, a pull request, and a green pipeline before merge; main is protected.
- Students deliver one new feature (for example, note search or pinned notes) as a user story through the full pipeline, with tests, so the pipeline is exercised on real change.
- A short retrospective at the end asks what the pipeline caught and what it missed.

## 9. Proposed repository layout

```
notes-devops/
  .github/
    workflows/
      ci.yml
      deploy.yml
  jenkins/
    Jenkinsfile
    docker-compose.yml
  ansible/
    playbooks/
    inventory/
  client/
    src/
    tests/
    package.json
    vite.config.js
  server/
    src/
      app.js
      config.js
      repositories/
      routes/
    tests/
    package.json
  e2e/
    tests/
    playwright.config.js
  Dockerfile
  .dockerignore
  docs/
    user-stories.md
    pipeline.md
  README.md
```

Folders `jenkins/` and `ansible/` would be included or omitted according to your decisions in sections 6 and 7.

## 10. Suggested lab sequence

Eight labs, to be adjusted to your timetable. Each ends with a working, committed state.

| Lab | Focus | Outcome |
|---|---|---|
| 1 | Agile setup: user stories, board, Git workflow, protected main | Repository, backlog and branching rules in place |
| 2 | The application: back end API and repository pattern | Working API run locally |
| 3 | The front end and unit tests | React UI with component and unit tests passing locally |
| 4 | Integration tests and coverage | Supertest suite, coverage threshold enforced |
| 5 | GUI testing with Playwright, including accessibility | Browser tests passing locally |
| 6 | Containerisation with Docker | Multi-stage image running locally, Trivy scan reviewed |
| 7 | Continuous integration | Actions workflow (and Jenkins comparison if chosen) running all checks on pull requests |
| 8 | Continuous deployment to Azure Container Apps | Merge to main deploys a new revision, smoke test passes, rollback practised |

If Ansible is included, it slots into lab 8 (Option 1) or lab 7 (Option 2).

## 11. Risks and questions that could change the design

1. **Azure permissions.** Can students (or a shared service principal) create Container Apps and assign roles inside the pre-created resource group? Is the Container Apps environment also pre-created, or must each student create one?
2. **Cost and quota.** How many students, and does each get a separate Container App? Container Apps can scale to zero, which keeps cost low.
3. **Naming collisions.** Container App names must be unique within a resource group, so a naming convention (for example `notes-<studentid>`) is needed.
4. **GitHub.** Are students using personal accounts or an organisation? Free Actions minutes are limited on private repositories, so public repositories are advisable.
5. **Lab machines.** Is Docker Desktop permitted and installed? Docker is required for labs 6 to 8 and for Jenkins.
6. **Assessment link.** Which parts of this practical are summatively assessed, and does the assessment expect an evaluation report? This affects how much scaffolding to provide.

## 12. What I need from you to proceed

1. Jenkins: Option A, B or C (section 6), and whether it is a student task or a demonstration.
2. Ansible: which use in section 7, or leave out.
3. Terraform: confirm omission is acceptable, or ask for a demonstration.
4. Answers to any of the questions in section 11 that you already know.
5. Whether the packaging choice (single image serving both front end and back end) suits you.

Once these are settled, the next step would be to build the reference repository so that every lab has been proven to work end to end before students see it.
