# RampSpec Documentation Implementation Plan

## Purpose

This plan delivers the complete public product, integration, protocol, security, operator, self-hosting, contributor, governance, and funding documentation described in `RAMPSPEC_FULL_PROJECT_DOCUMENTATION.md`. Documentation is a tested product surface, not a final cleanup task.

The docs repository consumes tagged OpenAPI, JSON Schema, contract specifications, bindings, and deployment manifests. It must not contain runtime business logic, private credentials, unverified deployment claims, or manually edited copies of generated interfaces.

The site architecture follows the verified `veridatum-labs/docs` repository at commit `2b28ef4b341eb0f2febb2ac0388929b11882c676`: Mintlify 4, root-level MDX pages and content directories, `docs.json` navigation and presentation, npm with `package-lock.json`, static export to `out/`, and Vercel deployment. This later repository direction supersedes the Docusaurus and `pnpm` choice in section 13.1 of `RAMPSPEC_FULL_PROJECT_DOCUMENTATION.md` for `rampspec-docs` only. RampSpec retains stricter generated-reference, executable-example, accessibility, versioning, and release-evidence controls required by its product specification.

## Execution Rules

- Complete one bounded guide, reference surface, example, or documentation control per phase.
- Give every MDX page `title` and `description` frontmatter, a direct opening definition, narrowly named sections, exact examples or tables where useful, safety or privacy constraints, implementation status, and related-page links.
- Store every command and configuration example as a real file under `examples/` and execute or validate it in CI.
- Import generated references from tagged runtime releases and fail CI on drift or missing operations, schema IDs, or contract methods.
- Keep `next` separate from immutable supported release versions and preserve archives while supported reports exist.
- Distinguish planned, implemented, locally checked, testnet deployed, pubnet deployed, externally reviewed, and adopted claims.
- Keep `introduction.mdx`, `getting-started.mdx`, and `roadmap.mdx` synchronized with actual repository and deployment status; do not let roadmap language substitute for implementation evidence.
- Register every authored or generated page in `docs.json`; fail CI on orphaned pages, duplicate navigation entries, or navigation paths that do not resolve.
- Refresh drift-prone SEP, Anchor Platform, SCF, and Drips facts before publication or application use.
- Use conformance result, verified run, and evidence report; never imply official SDF certification or legal/regulatory approval.

## Target Repository Structure

```text
rampspec-docs/
  api-reference/
    endpoints.mdx
    errors.mdx
    authentication.mdx
    pagination.mdx
    events.mdx
  architecture/
    overview.mdx
    trust-boundaries.mdx
    data-model.mdx
    workflow-lifecycle.mdx
    privacy-model.mdx
    repository-ownership.mdx
  assets/
    diagrams/
    images/
  contracts/
    overview.mdx
    evidence-registry.mdx
    web-auth-fixture.mdx
    policy-account-fixture.mdx
    deployments.mdx
  funding/
  generated/
    openapi/
    schemas/
    contract-specs/
  governance/
  guides/
    anchor-platform/
    ci/
    evidence/
    getting-started/
    runners/
    scenarios/
    sep/
  operations/
    incidents/
  reference/
    configuration.mdx
    report-format.mdx
    scenario-language.mdx
    contract-storage.mdx
    release-manifest.mdx
  sdk/
    overview.mdx
    api-client.mdx
    report-verifier.mdx
    runner-sdk.mdx
    schema-helpers.mdx
    webhook-verification.mdx
    contract-bindings.mdx
  security/
  examples/
  scripts/
    extract-mintlify-export.mjs
  introduction.mdx
  getting-started.mdx
  roadmap.mdx
  docs.json
  package.json
  package-lock.json
  tsconfig.json
  vercel.json
```

The root pages provide the short entry path used by the reference repository. Content directories keep detailed material grouped by reader intent. Generated artifacts remain isolated under `generated/`, while authored API, contract, SDK, and reference pages explain how to use those artifacts without duplicating their definitions.

## Phase 01 - Repository and Governance Foundation

**Outcome:** An independent docs repository is ready for contribution. Repository visibility follows the organization owner's current GitHub policy.

**Parts:** Add Apache-2.0, README, code of conduct, security policy, contribution guide, maintainers, issue/PR templates, ownership boundary, and docs release policy.

**Depends on:** RampSpec name and organization confirmation.

**Exit check:** New contributors can identify scope, review ownership, security reporting, and local setup.

## Phase 02 - Mintlify Toolchain

**Outcome:** The Mintlify documentation site installs and builds through the same toolchain shape as the reference repository.

**Parts:** Create a private `rampspec-docs` npm package; scaffold Mintlify 4 and `adm-zip` as development dependencies; use npm and `package-lock.json`; configure strict TypeScript with ES2022, ESNext modules, Bundler resolution, no emit, and skipped library checks; add `mintlify dev`, `mintlify broken-links`, and static export commands.

**Depends on:** Phase 01.

**Exit check:** `npm ci`, TypeScript validation, `npm run lint`, and `npm run build` pass from a clean checkout and the lock file.

## Phase 03 - Documentation Quality CI

**Outcome:** Pull requests fail on broken documentation.

**Parts:** Add `mintlify broken-links`, static export, frontmatter, `docs.json` schema, navigation completeness, internal/external links, spelling, formatting, accessibility, code-snippet, generated-reference, schema-reference, and contract-method checks.

**Depends on:** Phase 02.

**Exit check:** Seeded broken links, operations, schemas, methods, and snippets are detected.

## Phase 04 - Mintlify Presentation, Search, and Deployment

**Outcome:** Documentation changes are reviewable and content is findable without leaking user data.

**Parts:** Configure `docs.json` with the Maple theme, sidenav layout, bordered sidebar items, default topbar, no rounding, Space Grotesk headings, Inter body text, the reference cyan color set, shared light/dark logo from `assets/images/`, diagrams from `assets/diagrams/`, favicon, GitHub link, View App CTA, footer social, search analytics, RampSpec synonyms, page/group boosts, robots/sitemap, and canonical URLs. Add `mintlify export --output export.zip`, a guarded `adm-zip` extraction script that requires the ZIP, recreates `out/`, extracts the site, removes the ZIP, and fails visibly; add `vercel.json` with `npm run build`, PR previews, and preview expiration.

**Depends on:** Phase 03.

**Exit check:** The exported `out/` site, Vercel preview, tab/sidebar navigation, search indexing, keyboard search, assets, and privacy settings pass.

## Phase 05 - Information Architecture

**Outcome:** All documented audiences have a predictable path.

**Parts:** Create root `introduction.mdx`, `getting-started.mdx`, and `roadmap.mdx`; add top-level architecture, contracts, SDK, guides, API reference, reference, security, operations, governance, funding, assets, generated, examples, and scripts directories; organize `docs.json` into Documentation, SDK, Guides, and API Reference tabs with small named groups and explicit ordered page lists.

**Depends on:** Phase 02.

**Exit check:** Every MDX page has valid title/description frontmatter, appears exactly once in navigation unless intentionally hidden, and works at desktop and mobile sizes with no orphan section.

## Phase 06 - Product Introduction

**Outcome:** Readers understand RampSpec's purpose and audience.

**Parts:** Make `introduction.mdx` the concise documentation map: define the product, show a real architecture diagram, explain the end-to-end numbered flow, list key capabilities, publish an honest current/planned/deployed scope table, and link directly to getting started, roadmap, architecture, guides, contracts, SDK, and API reference.

**Depends on:** Phase 05.

**Exit check:** The introduction maps capabilities to anchor, wallet, QA, security, release, auditor, and contributor users, and every status label is backed by a release or deployment record.

## Phase 07 - Boundaries and Terminology

**Outcome:** Product claims remain precise.

**Parts:** Define conformance result, evidence report, verified run, rule classifications, gate, score, suite lock, target, runner, and evidence; document all non-goals and certification/legal/privacy disclaimers.

**Depends on:** Phase 06.

**Exit check:** Legal/product review confirms no SDF certification, compliance, audit, custody, or partner-adoption overclaim.

## Phase 08 - Architecture Overview

**Outcome:** Readers can understand components and data movement.

**Parts:** Publish system and run-sequence diagrams, public/control/data planes, runner models, workflow lifecycle, evidence path, and external dependencies.

**Depends on:** Phase 05 and accepted architecture decisions.

**Exit check:** Diagrams match released service names and tested execution order.

## Phase 09 - Four-Repository Ownership Model

**Outcome:** Contribution and interface ownership are unambiguous.

**Parts:** Document what frontend, backend, contracts, and docs own/must not own; source-of-truth rules; generated-artifact flow; issue routing; and release responsibility.

**Depends on:** Phase 08.

**Exit check:** Every major artifact has exactly one authoritative repository.

## Phase 10 - Compatibility and Release Manifest

**Outcome:** Compatible product components can be selected without guesswork.

**Parts:** Document frontend/backend/API/schema/contract/docs compatibility, breaking-change windows, migration notes, release manifest fields, and verification procedure.

**Depends on:** Phase 09 and tagged runtime foundation releases.

**Exit check:** A machine-validated example manifest references real released artifact shapes.

## Phase 11 - Generated OpenAPI Reference

**Outcome:** HTTP API documentation comes from the backend release.

**Parts:** Automate tagged `openapi.json` import, render operations/models/auth/errors/pagination/idempotency/SSE links, record source release/commit, and open generated-diff pull requests.

**Depends on:** Backend OpenAPI release.

**Exit check:** CI fails if a referenced operation is removed or the generated tree is manually altered.

## Phase 12 - Generated JSON Schema Reference

**Outcome:** Rule, scenario, suite lock, event, and report schemas are browsable and exact.

**Parts:** Import tagged schemas, render identifiers/versions/examples, link compatibility and migration notes, record source commit, and validate all examples.

**Depends on:** Backend schema release.

**Exit check:** Every schema ID resolves and every included document validates.

## Phase 13 - Generated Contract Reference

**Outcome:** On-chain interfaces and addresses come from tagged contract artifacts.

**Parts:** Import specs, bindings, WASM hashes, manifests, methods/types/errors/events, test-only labels, source release, and network verification timestamps.

**Depends on:** Contracts foundation release.

**Exit check:** CI detects missing methods, unknown code hashes, altered manifests, and generated drift.

## Phase 14 - Standards Baseline

**Outcome:** Supported SEP versions and statuses are transparent.

**Parts:** Publish SEP-1/6/9/10/12/24/31/34/38/45 snapshot status/version/commit, upstream sources, coverage, draft/FCP labels, and refresh procedure.

**Depends on:** Backend spec snapshot release.

**Exit check:** Every normative reference resolves to the exact pinned upstream commit and section.

## Phase 15 - Rule Classification and Review

**Outcome:** Readers can distinguish upstream requirements from RampSpec policy.

**Parts:** Explain MUST, SHOULD, SECURITY, INTEROP, POLICY, EXPERIMENTAL; severity rationale; acceptance requirements; protocol-maintainer review; disputes; and advisory process.

**Depends on:** Phase 14.

**Exit check:** Examples never label non-normative failures as SEP violations.

## Phase 16 - Spec Synchronization Guide

**Outcome:** Maintainers can update a rule pack reproducibly.

**Parts:** Document import, commit/content hash, generated diff, changed/deprecated/removed requirements, migration notes, fixture/report updates, approval, and binding of old reports.

**Depends on:** Phases 12, 14-15.

**Exit check:** A rehearsal update produces the documented review artifacts.

## Phase 17 - Test Modes and Network Safety

**Outcome:** Users select discovery, contract, journey, interactive, adversarial, regression, monitor, or evidence mode safely.

**Parts:** Explain mutations, authorization, runner needs, credentials, outputs, testnet default, passive pubnet, active pubnet gates, costs, and evidence labels.

**Depends on:** Backend policy release.

**Exit check:** No mode description implies mock success is live-network proof.

## Phase 18 - Organization and Project Getting Started

**Outcome:** A new user creates a tenant and project with correct roles.

**Parts:** Add tested UI/API/CLI paths, Owner/Admin/Maintainer/Runner/Auditor/Viewer behavior, invitations, service accounts, and least privilege.

**Depends on:** Released frontend/backend identity features.

**Exit check:** Commands and screenshots match the tagged product release.

## Phase 19 - Target Onboarding and Ownership

**Outcome:** A user registers and verifies a safe testnet target.

**Parts:** Cover domain/network/assets/corridors/SEPs, discovery, DNS TXT and well-known proof, expiry/renewal, runner choice, secret references, and policy.

**Depends on:** Released target APIs and UI.

**Exit check:** Both verification methods are tested against a controlled target.

## Phase 20 - First SEP-1 Run

**Outcome:** A clean environment reaches an independently verified signed report.

**Parts:** Provide exact setup, target discovery, suite lock, run, wait, report download, hash/signature verification, result interpretation, teardown, and troubleshooting commands.

**Depends on:** Phases 11-12 and runtime SEP-1/report releases.

**Exit check:** CI or a fresh-environment job executes the guide end to end.

## Phase 21 - CI Gate Quickstart

**Outcome:** A repository can enforce RampSpec results in CI.

**Parts:** Add service-account setup, minimal scopes, target/suite mapping, CLI invocation, stable exit codes, baseline policy, secrets, report retention, and failure diagnosis.

**Depends on:** Backend CLI and report verifier release.

**Exit check:** A passing fixture passes and a seeded high regression blocks the example workflow.

## Phase 22 - Anchor Platform Reference Environment

**Outcome:** Contributors can start the controlled Anchor Platform integration.

**Parts:** Provide pinned Docker Compose, quick-run laboratory, business server, event callbacks, assets, synthetic customers, Stellar testnet accounts, health checks, and teardown.

**Depends on:** Backend reference environment release.

**Exit check:** A clean environment reaches healthy services using synthetic data only.

## Phase 23 - Anchor Platform Integration Guide

**Outcome:** Anchor teams can connect an existing deployment safely.

**Parts:** Document supported release policy, callback/event setup, target/assets, secret references, local runner, network access, discovery, and first locked suite.

**Depends on:** Phase 22.

**Exit check:** Integration steps are validated against the pinned reference deployment.

## Phase 24 - Anchor Platform Troubleshooting and Upgrades

**Outcome:** Common component failures and version changes are diagnosable.

**Parts:** Map findings to platform server/business server/callback/ledger/browser components; add logs without secrets; document upgrade regression checklist and compatibility policy.

**Depends on:** Phase 23 and reference reports.

**Exit check:** Seeded reference defects resolve through the documented paths.

## Phase 25 - SEP-1 Guide

**Outcome:** Discovery coverage, configuration, evidence, and remediation are complete.

**Parts:** Cover purpose/status, TOML/headers/CORS/size/fields/URLs/accounts/assets/coherence, safe modes, fixtures, common findings, exclusions, and upstream links.

**Depends on:** Phases 14-16 and backend SEP-1 release.

**Exit check:** All snippets and finding links validate against the released rule pack.

## Phase 26 - SEP-10 Guide

**Outcome:** Classic, muxed, memo, threshold, and client-domain auth tests are reproducible.

**Parts:** Cover challenge safety, signatures, replay/expiry, JWT claims, fixtures, destructive boundaries, findings, remediation, and upstream references.

**Depends on:** Backend SEP-10 release.

**Exit check:** Success and adversarial example commands pass against controlled services.

## Phase 27 - SEP-45 Guide

**Outcome:** Draft contract-account authentication coverage is accurately documented.

**Parts:** Cover discovery, authorization entries, `web_auth_verify`, sub-invocations, footprint, nonce/signatures/token, fixture contracts, classic comparison, draft labels, and exclusions.

**Depends on:** Backend SEP-45 and contracts fixture releases.

**Exit check:** Local and testnet examples decode and verify the expected authorization evidence.

## Phase 28 - SEP-9 Synthetic Data Guide

**Outcome:** Teams can use safe schema-valid identity fixtures.

**Parts:** Cover field formats/encodings, person/organization generators, controlled destinations, test markers, prohibited data, files, redaction classes, retention, and customization review.

**Depends on:** Backend SEP-9 release.

**Exit check:** Fixture examples validate and prohibited examples are rejected in CI.

## Phase 29 - SEP-12 Guide

**Outcome:** Customer query, update, file, status, callback, memo isolation, and deletion behavior is complete.

**Parts:** Document auth, JSON/form/multipart, lifecycle states, shared accounts, idempotency, deprecated behavior, teardown, evidence, findings, and remediation.

**Depends on:** Backend SEP-12 release.

**Exit check:** Synthetic lifecycle and deletion examples run against the controlled reference.

## Phase 30 - SEP-6 Deposit Guide

**Outcome:** Same-asset and cross-asset deposit testing is reproducible.

**Parts:** Cover info/method discovery, auth, KYC, initiation, quote links, amounts/fees/assets/account/memo, states, ledger correlation, boundaries, errors, and evidence.

**Depends on:** Backend SEP-6 deposit release.

**Exit check:** Controlled testnet same-asset and cross-asset examples pass.

## Phase 31 - SEP-6 Withdrawal and History Guide

**Outcome:** Withdrawal, history, refunds, and deprecated interactive behavior are clear.

**Parts:** Document payment instructions, duplicate/late behavior, transaction/history schemas, status/refund semantics, quote expiry, ledger matching, findings, and remediation.

**Depends on:** Backend SEP-6 withdrawal release.

**Exit check:** Success and negative example suites execute from stored files.

## Phase 32 - SEP-24 Interactive Guide

**Outcome:** Hosted deposit/withdrawal browser journeys can be configured and diagnosed.

**Parts:** Cover isolated browser, origins, popup/iframe, mobile/desktop, locale, return URL, cancellation/timeout, token safety, screenshots/traces, callback/API/ledger correlation, and sensitive steps.

**Depends on:** Backend SEP-24 release.

**Exit check:** Deposit and withdrawal examples pass in the controlled Playwright environment.

## Phase 33 - SEP-38 Guide

**Outcome:** Indicative and firm quote coverage is transparent.

**Parts:** Cover assets/pairs, prices/price/quote endpoints, buy/sell semantics, precision/rounding/fees/total, delivery methods/country, expiry/linkage, invalid amounts, draft status, and remediation.

**Depends on:** Backend SEP-38 release.

**Exit check:** Example requests and invalid corpus match the released draft rule pack.

## Phase 34 - SEP-31 Corridor Guide

**Outcome:** Receive-side cross-border journeys and customer separation are reproducible.

**Parts:** Cover sending auth, receive discovery, sending/receiving customers, quotes, transaction/callback/payment/status, ledger match, local-runner pairing, refunds, and evidence.

**Depends on:** Backend SEP-31 release.

**Exit check:** A controlled SEP-31 plus SEP-38 testnet journey completes from the guide.

## Phase 35 - SEP-31 Negative-Path Guide

**Outcome:** Corridor failures have explicit test and remediation procedures.

**Parts:** Cover duplicate callback, invalid auth/customer, quote expiry, underpayment, overpayment, late payment, invalid transition, timeout, retry, and refund cases.

**Depends on:** Phase 34.

**Exit check:** Every documented negative example produces its expected stable finding.

## Phase 36 - Optional SEP-34 Guide

**Outcome:** Wallet attribution coverage is opt-in and correctly status-labeled.

**Parts:** Document JWS fields, fixtures, rules, upstream snapshot, enablement, release-blocking default, findings, and reasons not to treat it as active coverage.

**Depends on:** Backend SEP-34 release.

**Exit check:** Valid/invalid examples pass and default suites omit the pack.

## Phase 37 - Scenario Language Reference

**Outcome:** Every supported declarative construct is documented exactly.

**Parts:** Cover metadata, networks, requirements, parameters, fixtures, steps, dependencies, conditionals, matrices, retries, cleanup, policy, secret references, and forbidden constructs.

**Depends on:** Generated scenario schema.

**Exit check:** Every YAML fragment validates and no example contains arbitrary code or unrestricted destinations.

## Phase 38 - Scenario Cookbook

**Outcome:** Maintainers can adapt complete working scenario patterns.

**Parts:** Add SEP-1, SEP-10, SEP-45, SEP-12, SEP-6, SEP-24, SEP-31/38, regression, monitor, evidence, cleanup, and policy examples as executable files.

**Depends on:** Phases 25-37.

**Exit check:** CI compiles all examples to deterministic lock hashes.

## Phase 39 - Public Runner Architecture and Hardening

**Outcome:** Operators understand hosted sandbox controls and limitations.

**Parts:** Document non-root/read-only runtime, capabilities/quotas, egress/DNS protection, metadata/private ranges, credentials, profiles, upload, teardown, signed images, and abuse response.

**Depends on:** Backend public-runner release and security tests.

**Exit check:** Guide maps each documented control to test evidence or marks it planned.

## Phase 40 - Local Runner Installation

**Outcome:** Private staging can be tested through an outbound-only runner.

**Parts:** Cover install, registration token, mTLS identity, organization/project/target binding, allowlists, capabilities, heartbeat, health, versions, upgrades, and revocation.

**Depends on:** Backend local-runner release.

**Exit check:** A clean private-network lab registers, runs, rotates, and revokes successfully.

## Phase 41 - Local Secrets, Vault, and Air-Gapped Operation

**Outcome:** Customers can keep credentials and raw traffic local.

**Parts:** Document provider interface, Vault example, local signing, local redaction, encrypted upload, offline execution/export/import, backup, and unsupported limitations.

**Depends on:** Phase 40 and backend provider release.

**Exit check:** Tested capture confirms no secret value leaves the example runner.

## Phase 42 - SDK Overview and Package Status

**Outcome:** The Mintlify SDK tab gives integrators one accurate entry point for released client packages.

**Parts:** Create `sdk/overview.mdx` with install commands, package/version/runtime support, API client, report verifier, runner SDK, schema helpers, webhook utilities, and read-only contract bindings; label each module planned, experimental, or released and link its tagged source.

**Depends on:** Tagged backend and contracts package releases.

**Exit check:** Every install command resolves to a published package and no planned module is presented as available.

## Phase 43 - SDK Usage and Verification Guides

**Outcome:** Browser and Node.js consumers can use the released helpers with safe defaults.

**Parts:** Add narrow MDX pages for API authentication/pagination/problems, canonical report verification, schema validation, webhook signature verification, runner integration, and contract lookup; include typed result/error shapes, browser-versus-server boundaries, compatibility, and executable examples.

**Depends on:** Phase 42 and generated API/schema/contract references.

**Exit check:** TypeScript examples compile against the pinned packages and valid, tampered, unknown-key, failed-webhook, and contract-mismatch cases produce documented results.

## Phase 44 - CLI Reference

**Outcome:** Every command, option, output mode, configuration location, and exit code is documented.

**Parts:** Generate command reference; add login, discover, validate, run, verify, gate, evidence, runner, cancellation, automation, Windows/PowerShell, POSIX, and troubleshooting examples.

**Depends on:** Tagged backend CLI release.

**Exit check:** Help-output drift and executable command examples are checked in CI.

## Phase 45 - GitHub and CI Integration Guide

**Outcome:** Teams can install the GitHub App and enforce a release gate safely.

**Parts:** Cover permissions, installation, mapping, workflow/deployment triggers, checks/annotations, baselines, JUnit/SARIF, service accounts, webhook signatures, secrets, indeterminate results, and removal.

**Depends on:** Backend GitHub integration release.

**Exit check:** Reference repositories demonstrate passing, failing, and platform-error behavior.

## Phase 46 - Webhooks, Schedules, and Notifications

**Outcome:** Continuous monitoring integrations can be configured and operated.

**Parts:** Document recurrence/time zones/DST, pause/trigger/missed runs, webhook signing/rotation/retries/dead letters, notifications, rate limits, payload redaction, and incident links.

**Depends on:** Backend schedule/webhook release.

**Exit check:** Stored examples validate and signed-delivery verification runs in CI.

## Phase 47 - Report Interpretation

**Outcome:** Users can read scope, coverage, results, and limitations correctly.

**Parts:** Explain target/network/suite/spec/runner, classifications/severities/statuses, score versus gate, skipped rules, infrastructure indeterminate, exceptions, timelines, artifacts, retention, baseline comparison, and canonical JSON, HTML, PDF-ready HTML, JUnit, SARIF, redacted HAR, XDR, screenshot, and trace outputs.

**Depends on:** Generated report schema and frontend report release.

**Exit check:** Examples cover passed, failed, blocked, indeterminate, cancelled, and partial coverage.

## Phase 48 - Report Verification and Sharing

**Outcome:** Evidence can be independently verified and shared under explicit privacy modes.

**Parts:** Document RFC 8785, signature exclusion, SHA-256, Ed25519, key rotation, CLI verification, public/partner/private sharing, tamper cases, export derivation, and access expiry.

**Depends on:** Backend verifier release.

**Exit check:** Valid, tampered, unknown-key, rotated-key, and private-report examples pass.

## Phase 49 - Soroban Evidence Guide

**Outcome:** Users can publish, lookup, supersede, and revoke compact report commitments.

**Parts:** Cover consent, privacy/timing leakage, hashes/bitmap/counts/score, attestors, code-hash check, simulation/signing/submission, IDs/events/status, transaction/ledger links, failures, and no-certification limitation.

**Depends on:** Tagged backend publisher and contracts releases.

**Exit check:** Local and testnet example publication verifies against the original canonical report.

## Phase 50 - Contract Administration and Upgrade Guide

**Outcome:** Operators can manage attestors, pause, admin transfer, TTL, and upgrades safely.

**Parts:** Document auth, two-step transfer, read/revoke during pause, maintenance cadence, storage cost, reproducible WASM, schema protection, event reindex, rollback/forward-fix, and manifest update.

**Depends on:** Audited contracts release.

**Exit check:** A testnet rehearsal follows the guide with no undocumented step.

## Phase 51 - Threat Model

**Outcome:** Every trust boundary, threat, control, and failure behavior is public.

**Parts:** Cover browser/API/workflow/runners/target/Stellar/storage/KMS/Soroban/GitHub boundaries and unauthorized scan, SSRF, secret, PII, malicious target/scenario, signing, tamper, tenant, runner, and supply-chain threats.

**Depends on:** Accepted security architecture.

**Exit check:** Independent review maps all documented threats to implemented tests or tracked gaps.

## Phase 52 - Security and Privacy Operations

**Outcome:** Users and operators understand data handling throughout its lifecycle.

**Parts:** Document data classes, synthetic-only policy, prohibited input, secret providers/rotation, local redaction, artifact access/retention/deletion/legal hold, pubnet safety, report sharing, vulnerability reporting, and incident communication.

**Depends on:** Phase 49 and runtime security controls.

**Exit check:** Privacy/security review and prohibited-data examples pass.

## Phase 53 - Deployment and Configuration Reference

**Outcome:** Operators can deploy separated application and worker pools.

**Parts:** Cover CDN/API/WAF, PostgreSQL, Temporal, Redis, object storage, protocol/browser/report/evidence/webhook workers, runner namespace, KMS, telemetry, DNS, environment separation, and every configuration group.

**Depends on:** Backend deployment release.

**Exit check:** Configuration examples validate and contain placeholders rather than credentials.

## Phase 54 - Self-Hosting Guide

**Outcome:** A clean environment can operate released RampSpec components.

**Parts:** Document evaluation Compose, production Helm, infrastructure prerequisites, sizing, TLS/DNS, identity, secret/storage providers, migrations, upgrades, backups, observability, runner isolation, and limitations.

**Depends on:** Backend self-hosting release.

**Exit check:** Fresh-environment exercise reaches a verified SEP-1 report.

## Phase 55 - Observability and Capacity Guide

**Outcome:** Operators can measure platform, target, and network health separately.

**Parts:** Document trace identifiers, privacy filters, metrics/logs/traces, dashboards/alerts, API/run/SSE/schedule/runner/evidence objectives, queue and worker sizing, load tests, and bounded ingestion.

**Depends on:** Backend observability and performance evidence.

**Exit check:** Every stated objective is labeled measured or initial and links to its method.

## Phase 56 - Database, Backup, and Disaster Recovery

**Outcome:** Persistence changes and recovery are executable procedures.

**Parts:** Document migrations, supported upgrade paths, PITR/snapshots, object replication, Temporal history, KMS recovery, infrastructure reconstruction, RPO/RTO targets, restore exercises, and communication.

**Depends on:** Backend migration and DR releases.

**Exit check:** A staging restore exercise follows the guide and records measured outcomes.

## Phase 57 - Incident Runbook Set

**Outcome:** Every required operational incident has an owned procedure.

**Parts:** Publish separate runbooks for API, database, workflow, runner, duplicate journey, pubnet attempt, signing key, secret, redaction, tenant, abuse, callback, Horizon/RPC/network, evidence, spec sync, dependency, GitHub, and regional restore incidents.

**Depends on:** Phases 51-56.

**Exit check:** Each runbook has trigger, impact, containment, recovery, verification, communication, owner, and dated exercise evidence.

## Phase 58 - Contributor Setup by Repository

**Outcome:** Contributors can work within the correct ownership boundary.

**Parts:** Document prerequisites, local setup, focused and full checks, generated artifacts, fixtures, safe networks, commits, pull requests, review expectations, and cross-repository dependency updates for all four repositories.

**Depends on:** Stable setup commands from every repository.

**Exit check:** A fresh contributor validates each repository independently.

## Phase 59 - Rule and Scenario Contribution Guides

**Outcome:** Protocol additions meet the conformance acceptance bar.

**Parts:** Document stable ID, classification/severity, upstream pointer, valid/invalid fixtures, remediation, branch coverage, network/credential declaration, maintainer review, scenario schemas, and lock changes.

**Depends on:** Phases 15-16 and 37-38.

**Exit check:** A sample rule and scenario pass the complete documented review workflow.

## Phase 60 - Release, Versioning, and Backports

**Outcome:** Maintainers can ship compatible independent repositories.

**Parts:** Document semantic versions, API path/schema versions, rule/scenario/report/suite versions, contract hashes, protected branches, review/checks, signed tags, provenance/SBOM, staging, migrations, supported branches, backports, and disclosure releases.

**Depends on:** Phase 10 and repository release automation.

**Exit check:** A coordinated release candidate produces a valid compatibility manifest.

## Phase 61 - Governance and Protocol Advisory Guide

**Outcome:** Decisions, disputes, and maintainership are transparent.

**Parts:** Document public roadmap/ADRs, DCO or contributor-license decision, maintainer areas, protocol advisory membership, interpretation disputes, severity review, client fixtures, deprecations, evidence wording, and conflict handling.

**Depends on:** Project governance approval.

**Exit check:** Decision and dispute examples have named owners and public records.

## Phase 62 - Drips Wave Maintainer Guide

**Outcome:** Each repository can onboard contributors with bounded work.

**Parts:** Document repository readiness, one-outcome issues, scope/out-of-scope, acceptance/tests/security/docs, dependencies, testnet fixtures, assignment/review targets, fair complexity, point-budget checks, and `Closes #...`.

**Depends on:** Phases 58 and 61.

**Exit check:** Candidate issues are converted using current paths and only unblocked work is nominated.

## Phase 63 - Funding Evidence and Claims Policy

**Outcome:** Funding pages separate facts, plans, and outcomes.

**Parts:** Document SCF narrative/track decision process, Anchor Platform integration evidence, pilots, metrics, public deliverables, illustrative budget, refresh dates, and prohibited award/track/adoption/security/mainnet claims.

**Depends on:** Verified runtime and pilot evidence.

**Exit check:** Every claim carries a status and evidence link; current SCF sources are rechecked before submission use.

## Phase 64 - Methodology and Limitations

**Outcome:** Public results are reproducible without overstating software testing.

**Parts:** Publish rule sourcing, fixtures, environments, scoring/gates, exceptions, coverage, false-positive dispute, evidence integrity, threat boundaries, known exclusions, and what results do not prove.

**Depends on:** Production rule/report models and security review.

**Exit check:** Pilot, protocol, security, and product reviewers approve the wording.

## Phase 65 - Production Readiness Checklist

**Outcome:** Launch approval uses verifiable evidence from all four repositories.

**Parts:** Track compatible tags, clean setup, runner isolation, rule fixtures, required testnet journeys, SEP-10/45 adversarial paths, report verification, contract review, tenant/deletion/restore, runbook ownership, pubnet gates, pilots, critical issues, and terminology.

**Depends on:** Phases 10-64.

**Exit check:** Every checkbox links to a released artifact, test run, deployment record, review, or explicit not-applicable decision.

## Phase 66 - Versioned Documentation Release

**Outcome:** Stable docs exactly match a compatible product release.

**Parts:** Freeze stable version, retain `next`, record runtime source releases/commits, archive older supported versions, publish release notes/migrations, validate search/links/examples, and include the product manifest.

**Depends on:** Phase 65 and tagged runtime releases.

**Exit check:** Clean-room setup and all executable examples pass against the documented versions.

## Phase 67 - Pilot Onboarding and Case Studies

**Outcome:** Two pilot teams can use the docs and share permitted measured outcomes.

**Parts:** Create pilot checklist, support/escalation path, structured feedback, defect/time-saved measures, permission records, anonymization choices, and case studies without unsupported adoption claims.

**Depends on:** Phase 66.

**Exit check:** Pilot evidence is permissioned, reproducible where public, and clearly scoped.

## Phase 68 - Post-Launch Documentation Maintenance

**Outcome:** Documentation stays synchronized with protocols and releases.

**Parts:** Schedule SEP/Anchor Platform/funding/Drips refreshes, generated-reference updates, link/accessibility checks, supported-version retirement, example dependency updates, incident lessons, localization based on demand, and ownership rotation.

**Depends on:** Phase 66.

**Exit check:** A recurring calendar, freshness metadata, automated update pull requests, and assigned maintainers are active.

## Documentation Completion Gate

The docs repository is complete for the production release only when all 68 phases are checked; a clean environment can follow the tested setup; the Mintlify export and Vercel preview pass; every MDX page has valid frontmatter and one intentional navigation location; all generated API/schema/contract references match tagged sources; every supported SEP, SDK, CLI, test mode, runner model, report/evidence path, security control, operator procedure, contributor workflow, and release rule is covered; all examples execute or validate in CI; deployed claims have manifests and live verification records; and the language never implies legal compliance, official SDF certification, unaudited security readiness, unproven pubnet success, or undocumented adoption.
