# Gen20 Architecture Overview

**Status:** Initial draft; most details require verification against the current repository and server.

## 1. Purpose

Gen20 is a platform with a web application and supporting services. This document establishes a place to record the verified architecture without treating previous discussions or intended designs as proof of current implementation.

## 2. Known context

The following items have been discussed in project planning and must be checked against the current source and runtime before being marked verified:

- Repository: `NikDrosakis/gen20`
- Production/server working directory previously referenced: `/var/www/gs`
- PHP is used in parts of the platform.
- React is used for frontend work.
- The platform has discussed reusable UI components, templates, and administrative screens.
- Related systems and project areas include Gaia, Star-sync, Kronos, and an MCP bridge.
- MariaDB and Solr are part of the wider technical context; their exact roles and deployment boundaries must be confirmed.

This list is context, not a complete service inventory.

## 3. Architecture inventory to verify

| Layer | Questions to answer | Evidence to collect |
|---|---|---|
| Web frontend | Which applications, routes, and build outputs exist? | package manifests, router configuration, build scripts |
| PHP/API layer | Which entry points and endpoints are active? | route definitions, controllers, middleware |
| Authentication | How are users and service clients authenticated? | auth middleware, session/token configuration |
| Data stores | Which databases and indexes are used by each module? | migrations, schema files, connection configuration with secrets redacted |
| Plugin system | How are plugins discovered, configured, enabled, and versioned? | plugin registry, manifests, loader code |
| UI components/templates | How are reusable components and templates represented? | component directories, template schemas, admin code |
| Background jobs | Which workers, schedulers, or queues exist? | service definitions, cron entries, worker code |
| Deployment | How are services built, configured, and restarted? | Docker Compose files, systemd units, deployment scripts |
| Observability | How are logs, health, metrics, and errors exposed? | health endpoints, logging configuration, monitoring scripts |
| External integrations | Which APIs and bridges are active? | integration code and redacted configuration examples |

## 4. System boundaries

Do not assume all named projects are deployed as one application. For each subsystem, document:

- ownership and repository path;
- runtime and deployment location;
- public and private interfaces;
- data stores and data ownership;
- authentication and authorization boundary;
- dependency and failure behavior;
- backup and recovery requirements.

## 5. Required diagrams

Create diagrams only after inspecting the implementation:

1. System context diagram.
2. Runtime/deployment diagram.
3. Request flow from browser to API and database.
4. Plugin registration and loading flow.
5. File upload/processing flow, if present.
6. MCP request flow, if the bridge is implemented and configured.

Mermaid diagrams should identify unverified or proposed components explicitly.

## 6. Security requirements for documentation

- Never include real credentials, tokens, private keys, or secret environment values.
- Use redacted examples such as `API_TOKEN=<redacted>`.
- Do not publish internal endpoints or operational details unless the documentation audience is authorized to access them.
- Treat production commands as potentially disruptive and identify backup/rollback steps.
- Distinguish read-only inspection commands from commands that mutate production.

## 7. Next steps

1. Inspect repository root and tracked files.
2. Inspect package manifests, PHP entry points, routes, and plugin registry.
3. Inspect deployment definitions without printing secret values.
4. Record the real service and module inventory.
5. Update this document with verified paths and diagrams.
