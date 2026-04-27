# ParaBank Playwright framework (TypeScript)

End-to-end and API checks against the public [ParaBank](https://parabank.parasoft.com/parabank) demo. Submission format: **GitHub repository** (replace the placeholder remote in your fork).

## Setup

- Node.js LTS
- Playwright as a testing framework (latest version) with TypeScript
- From the repo root: install dependencies with npm ci (or npm install), then install browsers with npx playwright install --with-deps chromium

## Run

- npm test — headless Chromium
- npm run test:headed — local debugging with a visible browser
- npm run test:ui — Playwright UI mode
- npm run report — open the last Playwright HTML report
- npm run allure:generate — build Allure HTML from `./allure-results` into `./allure-report`
- npm run allure:open — open the generated Allure report (run generate first)

## Reports

Playwright’s HTML report is opened with `npm run report`. For Allure, each run writes raw results under `./allure-results` (see `playwright.config.ts`); CI uploads that folder as the `allure-results` artifact so you can download it and run `npm run allure:generate` locally, then `npm run allure:open`.

Allure **Suites** view (example run: serial core banking steps under `e2e/core-banking.spec.ts` plus `negative/negative.spec.ts` on Chromium):

![Allure report — Suites view, Chromium](docs/images/allure-suites.png)

## Environment

- BASE_URL — application root, default ends with a slash so relative routes resolve under /parabank/ (for example the public demo plus parabank path and trailing slash)
- API_BASE_URL — REST root ending at /services/bank

## Design decisions

- Page objects isolate UI selectors (register, login, overview, transfer, logout) from assertions in specs.
- BankApi wraps Playwright’s request fixture for JSON calls (login, accounts, transfer, balances) so tests stay readable and typed.
- **Registration fixture:** a worker-scoped `registeredUser` fixture (in `tests/fixtures/bankFixture.ts`) registers once per worker, asserts success, logs out, and exposes `username` / `password` / `firstName`. Specs that do not depend on it never hit registration.
- **Core banking E2E:** one serial `describe` with several focused tests (API login → curl createAccount → UI overview → UI transfer → API balance checks → logout). Shared numeric state (customer id, account ids, pre-transfer balances) is carried across steps via `let` bindings in the describe block; each UI step performs its own login because Playwright gives each test a fresh browser context.
- **curl:** generic `execCurlSync` in `src/infra/cmdCommands.ts` runs `curl` via `execFileSync` with no shell, captures status and body. Only **POST createAccount** (new CHECKING) uses it, wired through `CurlCreateAccountClient` / `createCheckingAccountViaCurl`. ParaBank expects **newAccountType as integer 0** for CHECKING (string CHECKING returns 404 on this service build).
- Primary UI login after registration uses an in-page fetch POST to login.htm with credentials included so the JSESSIONID matches what the UI would set; native form submit against the hosted demo was returning a generic error page under automation while the same credentials worked via API and fetch.

## Tradeoffs

- Public shared SUT: data and availability vary; tests use unique short usernames and random address or phone fields to reduce collisions.
- Reporters: Playwright HTML, list, and **allure-playwright** (results under `allure-results`); traces on first retry.
- CI uses a single worker to reduce load on the demo and avoid parallel registrations colliding.

## Assumptions

- curl is available on PATH in CI and locally (standard on GitHub-hosted runners and macOS).
- Chromium-only scope is enough for the assignment; other browsers can be added as extra projects.
- John demo user and account ids used in API-only negatives match the seeded database on the public instance.

## How to scale

- Split specs by domain (registration, transfers, API contracts) and tag them for selective runs.
- Shard in CI with multiple jobs and disjoint test data factories.
- Introduce environment-specific projects in playwright.config for staging versus production-like URLs.
- Grow BankApi with shared response DTOs and optional Zod validation if the suite expands.

## Docker

- Build the image from the Dockerfile in this repo; it extends the official Playwright image, copies the project, runs npm ci, and defaults to npx playwright test with CI set. Mount volumes or pass env vars at run time for different targets.

---

## Infrastructure considerations (prose only)

### Project architecture

Layer UI flows in page objects, keep REST access in a small API client that accepts Playwright’s APIRequestContext, and keep shell-free curl behind `cmdCommands` / the narrow create-account wrapper so “curl only for createAccount” stays obvious in review. Types for Customer and Account live beside the client. The long banking journey is a serial chain of small tests plus a worker-scoped registration fixture, which limits interference on a shared demo; negatives stay in separate specs and remain parallel where the config allows.

### Configuration management

Defaults point at the public ParaBank URLs; overrides use BASE_URL and API_BASE_URL so a fork can aim at another environment without code edits. Keeping the application base URL with a trailing slash matters because Playwright merges relative navigations against that base. Secrets are not required for this public app; a real bank would inject credentials via GitHub Actions secrets and short-lived tokens, never committed files.

### Reporting and debugging

HTML reports and list output give quick CI signal; traces on first retry capture network and DOM when a step flakes. Failures on the hosted demo are often environmental, so artifacts should be retained long enough to compare API responses with UI screenshots. Local reproduction uses headed or UI mode and the same env vars as CI.

### CI implementation

GitHub Actions checks out the repo, installs Node, runs npm ci, installs Chromium with system deps, runs the suite with CI true and a single worker, then uploads **playwright-report** and **allure-results** as artifacts. Branch filters use main or master; extend as needed. Adding Slack or PR comments would plug in after the test step based on pass or fail.

### Dockerization

The provided Dockerfile packages the same install and test path as CI inside the Playwright base image so runs are reproducible on a laptop without local browser installs. For larger pipelines, the same image can be referenced from a matrix job or from Kubernetes Task runners; production promotion would still gate on green tests and promoted configuration, not on the image alone.
