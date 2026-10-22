# GEN20 Platform Architecture and Upgrade Guide

**Status:** Architecture baseline and upgrade specification  
**Scope:** React/Vite domain frontends, Gaia PHP API/core, domain provisioning, shared components, Skeleton/layout composition, MariaDB schemas, admin dashboard, batch synchronization, and plugin lifecycle.

> **Evidence rule:** This document separates (1) behaviour described by the platform maintainer, (2) facts observed in the current GitHub repository, and (3) proposed target behaviour. A proposal is not evidence that the feature already exists. Verify production configuration before executing operational steps.

## 1. Executive summary

GEN20 is transitioning from a legacy PHP/Cubos architecture toward a React/Vite frontend backed by Gaia (PHP API/core). Six domains are minimally functional, but the platform is not yet consistently upgradeable because shared UI components and templates lack an explicit central lifecycle.

The goal is not to rewrite the platform. It is to make it understandable and safely evolvable by establishing:

1. One documented path for domain provisioning.
2. A central component catalogue and explicit component versions.
3. A versioned, reusable Skeleton layout model for drag-and-drop composition.
4. A defined relationship between shared platform schemas and per-domain MariaDB schemas.
5. An admin UI that calls canonical backend operations rather than duplicating business logic.
6. Repeatable, observable batch synchronization and plugin installation/update processes.
7. Tests, release gates, and rollback procedures.

### Current architectural direction

- **React + Vite:** primary UI and domain frontend direction, according to the maintainer.
- **Gaia PHP API/core:** central backend and command execution boundary.
- **CLI:** operational entry point; uses shell scripts for OS-level tasks and PHP API/traits for application-level operations.
- **Domain traits:** reusable PHP implementation for domain-related operations.
- **MariaDB:** central administration data plus per-domain schemas/databases.
- **Legacy Cubos:** transitional PHP modular structure; migrate capabilities incrementally, not by deleting it wholesale.
- **Ermis (Node.js):** integrated for a limited set of capabilities, including the currently useful synchronization path.
- **God and Mars:** functional subsystems, but not yet treated as fully integrated platform paths.

## 2. Repository evidence and verification limits

The public GitHub repository is useful evidence, but it must not be confused with the production server filesystem.

The current repository contains cli/com/domain/, gaia/apiv1/, gaia/core/traits/, gaia/cubos/, ermis/, and public/. The file gaia/apiv1/index.php defines the request domain, loads Composer autoloading, and instantiates Core API. The file gaia/core/Cli.php composes traits including Domain, DomainZone, DomainFS, DomainSSL, DomainDB, and DomainHost. The Ermis entry point creates an Express HTTPS server and initializes its WebSocket server.

**Important discrepancy to resolve:** in the inspected GitHub main tree, top-level public/ exposes a README but the maintainer-described public/admin/src/pages/Setup.jsx and the six Vite domain source trees were not visible. The repository README also describes a React build convention under public/<domain>/build, while the current work is described as React/Vite. Before documenting exact file ownership or writing code against those paths, compare main with the actual server checkout and identify ignored, untracked, or separately deployed files. Do not assume a path exists in GitHub merely because it exists on the server.

The SQL files supplied in Library are reference snapshots:
- gen_admin.sql: central administration database snapshot.
- gen_aaa.sql: proposed/core domain schema snapshot.
- gen_gen20net.sql and gen20_nikimourtzicom.sql: domain schema/data snapshots.

Treat them as schema evidence, not automatically as migration scripts. Their sizes and included historical data make direct production import unsafe without a controlled migration plan. Do not copy credential values found in historical dumps into documentation or code.

## 3. System boundaries and ownership

The rule for every feature is: **one canonical implementation, multiple clients**.

| Concern | Canonical owner | Other layers must do |
|---|---|---|
| Domain setup workflow | Gaia API and domain traits, invoked through the CLI/API boundary | Validate input, present progress, display errors; do not reimplement provisioning |
| OS-level operations (DNS, TLS, web server, filesystem) | Explicit CLI shell commands or a dedicated privileged worker | Call an allow-listed operation and report result |
| Domain metadata and database mapping | Central admin store and Gaia domain/database services | Read/write through defined API operations |
| Domain-specific content | That domain's database, using the agreed content schema | Use the domain's configured API/database context |
| Shared component definitions | Versioned component catalogue in source control | Consume pinned releases; do not maintain independent copies |
| Layout composition | Skeleton schema and layout editor | Persist validated layout documents, not arbitrary executable source |
| Runtime rendering | Shared renderer/runtime contract | Render only components registered and compatible with the layout |
| Plugin lifecycle | Plugin manifest/registry and Gaia orchestration | Request install/update/enable/disable; do not install files ad hoc |
| Batch synchronization | One orchestration path with job IDs, logs and retry semantics | Submit jobs and inspect their status |
| Admin dashboard | React/Vite UI | Call documented APIs; no direct database access or privileged shell execution |

### Request and operation flow

~~~text
Admin UI (React/Vite)
  -> authenticated Gaia API request
    -> validation + authorization
      -> domain/application trait or service
        -> MariaDB transaction and/or allow-listed CLI operation
          -> structured result + audit record
  -> UI renders status and actionable errors
~~~

The CLI can invoke application operations directly when that is the established command path. It must not create a second implementation of the same operation. Shell commands are appropriate for host-level tasks; PHP API/traits are appropriate for application-level orchestration. Commands that cross the boundary need explicit arguments, exit codes, timeouts, and logs.

## 4. Domain provisioning: one workflow

The domain setup process currently spans the /setup assets/scripts, cli/com/domain, gaia/apiv1/index.php, domain traits, ermis/index.js synchronization behaviour, and the admin setup UI described by the maintainer. This distributed history is why the contract needs to be explicit.

### Target workflow

1. **Validate request:** canonical domain name, domain type, requested database identifier, owner/contact details, selected template and environment. Reject malformed hostnames and unsafe filesystem/database identifiers.
2. **Plan / dry run:** calculate intended folders, DNS/TLS/host changes, database actions, and initial component/template versions. Show a plan before destructive or privileged actions.
3. **Provision filesystem:** create only expected directories with least-privilege ownership and permissions.
4. **Configure host and TLS:** invoke named, allow-listed operations. Do not concatenate untrusted user input into shell commands or configuration files.
5. **Provision database:** create or map the domain database, apply versioned migrations, create least-privilege credentials, and record schema version.
6. **Initialize domain:** seed only required records and record installed platform, component, template, and plugin versions.
7. **Synchronize assets/configuration:** use the batch/sync mechanism with a job ID and per-target result.
8. **Verify:** check health, API access, frontend assets, routing, database connectivity, and expected initial content.
9. **Commit status:** mark the domain active only after required checks pass. On failure, preserve diagnostic logs and either roll back safely or mark setup incomplete.
10. **Audit:** record actor, timestamp, target domain, operation, versions, result, and correlation/job ID. Never log passwords or tokens.

### UI and CLI contract

Setup.jsx should collect data, call the API, display the plan, show step-by-step status, and offer safe retry/recovery. The CLI should call the same canonical operation where possible. If a CLI command runs a shell script, that script needs a documented contract and must not silently duplicate PHP-side logic.

Each domain operation should document:
- stable operation name and API/CLI entry point;
- required/optional arguments and validation;
- permissions required;
- side effects and idempotency behaviour;
- timeout and exit/result codes;
- log location and correlation ID;
- rollback/recovery behaviour;
- tests and verification command.

## 5. Shared components: catalogue, versions, distribution

### Problem to solve

Components are moving from the old PHP Cubos structure into domain-specific React/Vite trees, while some components remain admin-only. If a shared component is copied into several domains, the platform cannot reliably know which copy is canonical or whether an update is safe.

### Target rules

1. **One canonical source per reusable component.** Domain folders may contain domain-specific composition/configuration, not untracked copies of shared implementation.
2. **Stable component identity.** Each component has a permanent ID independent of display name or file path.
3. **Explicit semantic version.** Use MAJOR.MINOR.PATCH:
   - MAJOR: breaking props, slots, behaviour, or layout-schema change.
   - MINOR: backward-compatible capability.
   - PATCH: backward-compatible bug fix.
4. **Immutable published versions.** Once name@version is released, do not edit its contents. Publish a new version.
5. **Explicit compatibility.** Record supported React/runtime version, component contract version, and required dependencies.
6. **Pin by default.** Domains and templates record an exact component version. Upgrades are deliberate, reviewable operations, not an implicit “copy latest”.
7. **Separate source from build output.** Generated Vite output is an artifact, not canonical source. Record the build tool and output directory per domain.
8. **No dynamic arbitrary code from database content.** Database records describe component identity, props, slots and layout. They must not become an unrestricted code-execution mechanism.

### Proposed component manifest

This is a proposed contract, not a claim that the current code already implements it:

~~~json
{
  "id": "gen20.card",
  "name": "Card",
  "version": "1.2.0",
  "kind": "ui",
  "entry": "./src/Card.tsx",
  "contractVersion": 1,
  "propsSchema": "./props.schema.json",
  "slots": ["header", "default", "footer"],
  "dependencies": [],
  "compatibility": {
    "react": "supported-range",
    "gen20Runtime": "^1.0.0"
  },
  "visibility": ["domain", "admin"],
  "status": "stable"
}
~~~

Use the actual language and package conventions of the repository once its Vite tree is verified. The example illustrates metadata, not a required TypeScript conversion.

### Component lifecycle

~~~text
Draft -> Validated -> Tested -> Released -> Available in registry
                                        -> Pinned by template/domain
                                        -> Upgrade plan -> Validated -> Applied
~~~

A release must pass schema validation, unit tests, rendering tests, accessibility/basic interaction checks where applicable, and compatibility checks against at least one reference layout. Deprecated components remain readable/renderable for a documented compatibility window; deletion happens only after usage has been inventoried and migrated.

## 6. Skeleton: drag-and-drop layout composition

Skeleton must be treated as a **versioned layout document and rendering contract**, not merely a visual editor embedded in the admin application. This keeps layouts portable, reusable, reviewable in Git, and upgradeable independently of the editor UI.

### Core concepts

- **Layout:** named composition with its own ID and version.
- **Node:** one component instance in a layout.
- **Component reference:** stable component ID plus exact version or an explicit compatibility range.
- **Props:** validated JSON data; no arbitrary executable code.
- **Slots/children:** named insertion points for nested components.
- **Area/region:** named layout area such as header, main, sidebar or footer.
- **Domain binding:** optional domain-specific configuration; keep it separate from shared layout structure.
- **Editor metadata:** drag handles, selected node, panel state and temporary editor IDs. This is UI state and should not be mixed with published layout data.

### Proposed layout document

~~~json
{
  "schemaVersion": 1,
  "layout": {
    "id": "site.home",
    "version": "1.0.0",
    "title": "Home",
    "areas": {
      "main": [
        {
          "nodeId": "hero-01",
          "component": {
            "id": "gen20.hero",
            "version": "1.0.0"
          },
          "props": {
            "title": "Welcome"
          },
          "slots": {}
        },
        {
          "nodeId": "cards-01",
          "component": {
            "id": "gen20.card-grid",
            "version": "1.1.0"
          },
          "props": {
            "columns": 3
          },
          "slots": {
            "items": []
          }
        }
      ]
    }
  }
}
~~~

This is illustrative. Define the actual schema and renderer only after inspecting the current Skeleton/editor code and existing saved layouts.

### Editor requirements

- Drag-and-drop must preserve stable node IDs and support move, insert, duplicate, delete, undo/redo, and keyboard-accessible alternatives.
- Drop targets must validate whether a component is allowed in the target area/slot.
- The component panel must read from the registry and display version, status, compatibility, and allowed slots.
- Save must validate the complete document against the schema and verify that referenced components exist.
- Preview must use the same rendering contract as published output.
- Publish must create an immutable layout version; editing a published layout creates a draft/new version.
- A layout must not silently change when a component release is published. Upgrading component references is an explicit migration.
- Missing or incompatible components must produce a clear diagnostic. Do not silently drop nodes.
- Store editor-only state separately from the portable layout definition.

### Layout and component upgrades

1. Load the layout and enumerate component references.
2. Check registry availability and compatibility.
3. Generate a migration plan listing every affected node and prop/slot change.
4. Apply transformations to a copy/draft, never directly to the only published version.
5. Run schema validation and rendering tests.
6. Compare old and new previews.
7. Publish the new layout version after approval.
8. Keep the previous version available for rollback.

## 7. Templates and domains

A template is a distributable package of layout definitions, assets, tokens/styles and declared component dependencies. A domain is an installation that selects template versions and may override approved settings.

Keep these concepts separate:

- **Component:** reusable functional/UI unit.
- **Layout/Skeleton:** composition of component instances.
- **Template:** package of layouts, assets, styles and dependency declarations.
- **Domain configuration:** site identity, routing, content settings, feature flags and pinned package versions.
- **Content:** domain-owned records stored in the domain schema; layout describes presentation, not the source of truth for content.

Template releases should declare their component dependencies and compatibility. Installing a template must not overwrite domain content or untracked customizations. Use explicit override files/records and make conflicts visible.

## 8. MariaDB and schema governance

The intended model is one central administrative database plus a separate database/schema for each domain. Confirm exact naming and credential model against production configuration; do not infer database names from hostnames without a canonical mapping.

### Schema roles

- **Central admin database (gen_admin):** platform/domain inventory, administration and orchestration metadata as confirmed by the live schema.
- **Core domain model (gen_aaa):** candidate baseline for the minimal domain schema.
- **Domain schemas (gen_gen20net, gen_nikimourtzicom):** actual domain-specific structure and legacy data, requiring comparison before migration.

### Content model direction

The platform owner describes a move away from the old posts-centric model toward contents, while retaining only the minimum necessary tables. Treat this as a migration direction, not a completed invariant, until all schema snapshots and application queries are compared.

Before changing schemas:
1. Inventory tables, columns, indexes, triggers, foreign keys, views and stored routines.
2. Classify each object as central, common domain-core, domain-specific, legacy, or unknown.
3. Search application code and API routes for every table/column reference.
4. Compare the three schema roles and identify data that would be lost or transformed.
5. Write numbered, reversible migrations; never use a raw historical dump as the normal upgrade path.
6. Back up each database and test restore.
7. Run migration against a copy, verify row counts and key relationships, and test critical domain workflows.
8. Record the applied schema version for each domain.
9. Roll out in stages and retain a recovery path.

Prefer additive migrations first. A destructive removal of legacy post tables or Cubos metadata must wait until all consumers have been identified, data has been migrated, and rollback requirements are met.

### Minimal table policy

Do not add a table merely because a feature needs a record. First determine whether the existing central/domain schema has an appropriate owner and whether a versioned manifest is better stored in source control. Add persistence only when it provides required runtime state, auditability, queryability or transactional guarantees. Document the reason and lifecycle for every new table.

## 9. Admin dashboard

The admin dashboard is the operator console, not a second backend. For each feature, UI responsibilities are usability validation, clear progress, confirmation for consequential actions, and displaying structured API results. Server-side validation and authorization remain mandatory.

Recommended dashboard areas:
- Domains: status, provisioning progress, health, database mapping, pinned template/runtime versions.
- Components: catalogue, released versions, compatibility, usage by domains/layouts, deprecation status.
- Skeleton/layouts: editor, preview, draft/published versions, component validation and migration preview.
- Templates: versions, dependencies, installation and upgrade plan.
- Synchronization: jobs, targets, progress, retries, failed items and logs.
- Plugins: installed/enabled versions, dependencies, updates, compatibility and rollback.
- Platform diagnostics: API health, schema versions, recent deployment and actionable errors.

Avoid exposing raw shell commands, credentials, arbitrary file paths or unrestricted SQL in the UI. Operations requiring elevated privileges should be represented by named server-side actions with authorization and audit logs.

## 10. Batch synchronization

Synchronization should be a managed job, not a fire-and-forget file copy.

Each job should record:
- job ID, requested operation, initiating actor, source version and creation time;
- target domains and selected components/templates/plugins;
- dry-run plan and expected changes;
- per-target status, start/end time, retry count and sanitized error;
- resulting versions/checksums and verification outcome.

### Required behaviour

- **Dry run:** show intended changes before applying them.
- **Idempotency:** retrying the same job must not duplicate data or apply a version twice.
- **Ordering:** dependencies are applied before consumers; incompatible targets are skipped with a reason.
- **Atomicity:** use a transaction for database changes where possible; for filesystem/runtime changes, use staging and an atomic switch where feasible.
- **Concurrency control:** prevent two upgrades of the same domain/component from racing.
- **Retry:** retry transient failures with limits; do not endlessly retry invalid configuration or incompatible versions.
- **Verification:** check files, checksums, schema/version records, API health and representative frontend behaviour.
- **Rollback:** retain the prior known-good artifact/configuration and a documented recovery action.
- **Observability:** show per-domain status and a final summary; do not report success when only some targets succeeded.

Ermis can remain the current synchronization implementation if it satisfies these contracts. Do not create a second batch engine before mapping the existing Ermis behaviour and deciding what should be retained.

## 11. Plugin installation and updates

A plugin should have a manifest with stable ID, version, description, entry point, dependencies, platform/API compatibility, required permissions, configuration schema, installation hooks, migration hooks, health check and rollback strategy.

Lifecycle:

~~~text
Discover -> Validate manifest -> Resolve dependencies -> Plan
 -> Install to staging -> Run migrations/checks -> Activate
 -> Verify -> Record version and audit event
~~~

Updates must be explicit and versioned. Do not overwrite plugin files while a running process is using them without a defined activation strategy. A failed activation should preserve the previous version and produce an actionable error. Disable/uninstall must distinguish code removal from data removal; destructive data deletion requires explicit confirmation and backup policy.

## 12. Security and operational safety

The repository and historical SQL snapshots may contain old configuration patterns. Audit them before copying code into the new implementation.

Minimum controls:
- Move database credentials and tokens out of source files and SQL dumps into protected environment/secret configuration.
- Rotate credentials if they were exposed in any public or shared location.
- Replace broad API CORS rules with an explicit origin allow-list appropriate to each environment.
- Use least-privilege database users; avoid root for application connections.
- Validate domains, paths, filenames, plugin IDs and component references on the server.
- Never interpolate untrusted values into shell commands or SQL identifiers.
- Use allow-listed operations for privileged host changes.
- Keep audit logs free of passwords, tokens, cookies and sensitive payloads.
- Separate development, staging and production configuration.
- Require backup/restore validation before schema migrations or domain-wide updates.

## 13. Versioning and release policy

Use separate versions for independent concerns:
- **Platform/API contract:** API compatibility and core behaviour.
- **Component:** each reusable component.
- **Layout/Skeleton schema:** persisted layout document format.
- **Template:** package of layouts/assets/dependencies.
- **Plugin:** installable extension.
- **Domain schema:** migration version applied to each domain database.

A platform release should publish a compatibility matrix:

| Item | Pinned version | Required compatibility | Upgrade action |
|---|---|---|---|
| Gaia API | Recorded release/commit | API contract range | Deploy and smoke test |
| Component runtime | Recorded release | Component contract | Build/test |
| Component | Exact version | Runtime/React range | Migration plan if needed |
| Skeleton schema | Integer schema version | Renderer support | Convert draft and validate |
| Template | Exact version | Component dependencies | Preview and publish |
| Domain schema | Migration number | API version | Backup, migrate, verify |
| Plugin | Exact version | API + dependencies | Stage, activate, health check |

Do not use a single global version number as a substitute for compatibility metadata. Record both immutable source revision and the versions installed on each domain.

## 14. Testing and release gates

A change is not complete merely because Vite builds or PHP syntax passes.

### Required test layers

1. **Static checks:** PHP syntax, JS/TS lint/type checks where configured, manifest/layout schema validation.
2. **Unit tests:** component behaviour, schema validation, migration functions and domain input validation.
3. **Contract tests:** React/Vite clients against Gaia API responses; CLI and API invoke equivalent operations.
4. **Integration tests:** provisioning in a disposable test environment, database migration, component registry lookup, Skeleton render, synchronization and plugin install/update.
5. **Multi-domain tests:** verify isolation and correct routing across all six domains.
6. **Upgrade tests:** previous supported component/template/schema versions can be upgraded or fail with an explicit incompatibility message.
7. **Smoke tests:** login/admin, page rendering, content read/write, routing, asset loading, API health and synchronization status.
8. **Rollback test:** demonstrate recovery from at least one simulated failed release.

### Release checklist

- [ ] Clean working tree and reviewed diff.
- [ ] Backup/restore path confirmed for database changes.
- [ ] Migration tested on a copy of each affected schema class.
- [ ] Component/layout/template manifests validated.
- [ ] Build and tests pass.
- [ ] Dry-run plan reviewed.
- [ ] Staging domain verified.
- [ ] Domain-by-domain rollout and stop condition defined.
- [ ] Rollback command and previous artifacts identified.
- [ ] Version and audit record updated.
- [ ] No credentials or secrets included in commit/logs.

## 15. Six-workstream upgrade roadmap

### Phase 0 — Baseline audit
- Compare GitHub main with the actual server checkout.
- Inventory the six domains, Vite apps, shared components, Skeleton, templates, API routes, CLI commands, traits, Ermis sync, and schema versions.
- Mark each finding as implemented, partial, legacy, proposed, or unknown.
- Capture tests and current known-good versions.

**Exit criterion:** a verified path/file inventory and dependency map exist.

### Phase 1 — Domain setup contract
- Define the canonical domain provisioning API/operation.
- Map CLI commands, shell scripts, PHP traits and Setup UI to that contract.
- Add validation, dry-run, structured progress, idempotency and audit records.
- Document DNS/TLS/filesystem/database side effects.

**Exit criterion:** a test domain can be provisioned and verified using the same canonical operation from UI and CLI.

### Phase 2 — Component catalogue and Skeleton
- Inventory shared versus admin-only versus domain-specific components.
- Choose the canonical source location and manifest format.
- Define component SemVer and compatibility contract.
- Specify and validate the Skeleton layout schema.
- Add a registry view, version pins and usage inventory.
- Prove a component can be released once and consumed by two domains without copying its implementation.

**Exit criterion:** one released component and one versioned layout can be previewed, pinned and upgraded in a test domain.

### Phase 3 — MariaDB schema governance
- Compare gen_admin, gen_aaa, and domain schemas.
- Build a table/column/query dependency inventory, particularly for post versus content/contents.
- Define migrations and schema-version tracking.
- Test a representative domain migration and restore.

**Exit criterion:** schema changes are repeatable, verifiable and recoverable without importing a whole historical dump.

### Phase 4 — Admin dashboard
- Align dashboard screens with the canonical API contracts.
- Add domain/component/layout/template/sync/plugin status.
- Provide clear validation and failure states.
- Remove duplicate business logic from the frontend.

**Exit criterion:** an administrator can inspect and execute documented operations without shell access for routine tasks.

### Phase 5 — Batch synchronization
- Map the current Ermis flow.
- Add job IDs, dry-run, per-domain results, retries, concurrency guards and verification.
- Test partial failure and resume behaviour.

**Exit criterion:** a multi-domain batch reports exactly which targets succeeded, failed or were skipped and can safely resume.

### Phase 6 — Plugin lifecycle and release
- Inventory current plugins and their real install/update paths.
- Add manifests, dependency resolution, staging, health checks and rollback.
- Run end-to-end tests across representative domains.

**Exit criterion:** a plugin can be installed and updated without undocumented manual file copying, with a recoverable failure path.

## 16. Documentation maintenance rules

This document is the architecture baseline; update it when the implementation changes. Keep detailed operational procedures near the code they describe and link them from a docs index.

Every new platform feature should document:
- purpose and owner;
- source-of-truth files and data;
- public API/CLI contract;
- configuration variable names (not secret values);
- dependencies and compatibility;
- schema changes and migration path;
- tests and verification steps;
- deployment and rollback;
- known limitations and follow-up work.

Do not mark a proposed capability as implemented until the code path and test evidence are available. When actual production behaviour differs from this document, record the discrepancy and resolve it explicitly rather than silently rewriting the architecture to match an assumption.
