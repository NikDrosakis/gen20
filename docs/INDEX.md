# Gen20 Documentation

**Status:** Initial draft  
**Scope:** Gen20 platform and its related services  
**Last reviewed:** 2026-10-22

This directory is the entry point for the Gen20 technical documentation, UI manual, and future Help System.

## Documentation areas

| Area | Purpose | Status |
|---|---|---|
| [Architecture](ARCHITECTURE.md) | System boundaries, components, and data flows | Initial draft; verify against source |
| [Help System plan](HELP-SYSTEM.md) | Database-first help content and contextual search | Proposed design |
| Server operations | Debian host, deployment, services, backups | To be documented from inspection |
| API reference | Actual endpoints, authentication, request/response contracts | To be documented from source |
| UI manual | Screens, routes, controls, and user procedures | To be documented from running UI and source |
| Security | Credentials, permissions, uploads, audit and operational safeguards | To be verified |
| Git workflow | Branches, commits, release and deployment process | To be documented after repository workflow review |

## Documentation rules

1. Mark facts as **verified** only when confirmed from source code, configuration, or a reproducible runtime check.
2. Label planned designs as **proposed**; do not describe them as implemented.
3. Never commit passwords, access tokens, private keys, production secrets, or sensitive user data.
4. Keep instructions version-aware where plugin or API behavior can change.
5. Link UI procedures to the relevant plugin, route, component, and API endpoint when those identifiers are verified.
6. Prefer concise, task-oriented procedures with prerequisites, steps, expected results, and troubleshooting notes.

## Planned documentation workflow

- Inspect the repository and identify modules, plugins, UI routes, API routes, database schemas, and deployment files.
- Build a verified system inventory.
- Document the current system (As-Is).
- Document proposed changes separately (To-Be).
- Build the Help System from structured records and searchable content.
- Add UI guides based on actual screens, not assumed screens.

## Status vocabulary

- **Verified:** confirmed in code/configuration or by a repeatable test.
- **Observed:** seen in a command output or runtime check, but not fully investigated.
- **Proposed:** recommended design, not yet implemented.
- **Unknown:** needs inspection or confirmation.
