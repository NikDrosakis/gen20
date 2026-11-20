# GEN20
### Technology in the service of human expression.
### Gen is Poetry, poetry is Gennesis

**GEN20 is an independent, modular platform for building, managing and connecting digital experiences.**

It brings together a custom PHP core, distributed services, command-line tooling, AI capabilities and reusable frontend components into one evolving ecosystem.

The project is built around a simple principle:

> Technology should serve people. It should expand what they can create, understand and share.

🌐 **Website:** https://gen20.net
💻 **Repository:** https://github.com/NikDrosakis/gen20

---

## The Platform

GEN20 is a modular environment rather than a collection of disconnected applications. Each subsystem has a single, clearly bounded responsibility and communicates with the others through defined interfaces (HTTP, WebSocket, native protocols and a shared filesystem).

### Core Systems

| System | Responsibility | Technology | Port |
|---|---|---|---|
| **GAIA** | Core platform, application logic and APIs | PHP 8.2 | via Nginx `/api/v1` |
| **GOD** | High-performance API gateway and realtime messaging hub | Go (Gin) | `3008` |
| **KRONOS** | AI generation and model services | Python / FastAPI | `3006` |
| **MARS** | Native high-performance operations | C++ | — |
| **SOL** | Command-line interface, daemon and system operations | Bash (`gen`) | — |
| **MOON** | Frontend sites and reusable components | React / Vite | `5173` (dev) |
| **ASTRA** | Cubo storage, templates and scaffolding | — | — |

Supporting services: **MariaDB**, **Redis**, **CouchDB**.

The systems operate independently while communicating through defined service channels.

---

## Messaging & Authentication

Realtime messaging is centralized in **GOD** through an authenticated WebSocket layer:

- Connections authenticate with a server-minted token.
- Chat messages are persisted before broadcast.
- A SOL bridge relays install / build / status commands to the daemon.

Cross-domain identity is derived from an authenticated session token.

---

## SOL — System Command Interface

SOL is the GEN20 command-line environment, installed as the `gen` command:

```bash
gen [command]
```

- **gen.sh** — main entry point
- **gen-daemon** / **gen-daemonctl.sh** — daemon management
- **acta/** — operational scripts (filesystem, services)
- **rima/** — provisioning and bootstrap scripts (`bigbang.sh`)
- **__sol/** — on-demand dispatch of cubos/acta
- **systems/** — per-system command modules

Administration is performed through SOL; cubos and acta are loaded on demand rather than sourced at startup.

---

## MOON — Frontend Sites

MOON hosts one Vite/React application per site, each built to a `dist/` folder and served by Nginx:

| Site | Directory |
|---|---|
| Public | `moon/gen20.net` |
| Admin | `moon/admin` |
| Localhost dashboard | `moon/localhost` |
| Other domains | `moon/gen20.gr`, `moon/gen20.art`, `moon/gen20.dev`, `moon/anticultura.com`, `moon/directorsunion.gr`, `moon/nikimourtzi.com`, `moon/poetabook.com` |

`moon/localhost` is served by Nginx through `conf.d/localhost.conf` and acts as the local entry point to the platform.

---

## Design Principles

1. **Modular by design** — independent services with clearly separated responsibilities.
2. **Direct communication** — services talk through APIs, WebSockets and native protocols, avoiding unnecessary layers.
3. **Performance where it matters** — each service uses the technology that fits its workload (PHP application logic, Go and C++ operations).
4. **AI as infrastructure** — AI is a processing and generation capability, not an isolated feature.
5. **Reusable components** — CUBOS provides reusable frontend elements and content-driven interfaces.
6. **Human-oriented technology** — the purpose is useful tools for people, communities and creative work.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| Operating System | Debian GNU/Linux |
| Backend | PHP 8.2, Go, Python, C++ |
| APIs | FastAPI, Gin, custom PHP APIs |
| Frontend | React, JavaScript, Vite |
| Database | MariaDB |
| Document store | CouchDB |
| Cache / queue | Redis |
| Communication | WebSockets, HTTP |
| Infrastructure | Linux, Nginx, systemd |
| AI / ML | Python-based AI services and language models |
| CLI | Bash (SOL) |

---

## Repository Structure

```text
gen20/
├── astra/           # Cubo storage & templates
├── data/            # Runtime data and logs (gitignored)
├── gaia/            # PHP core platform + API
├── god/             # Go API gateway + messaging hub
├── kronos/          # Python/FastAPI AI services
├── mars/            # Native C++ operations
├── media/           # Media storage (gitignored)
├── moon/            # React/Vite frontend sites
├── sol/             # SOL CLI and daemon (gen)
├── .github/         # CI workflows
└── README.md
```

CUBOS live throughout the subsystems (`god/cubos`, `gaia/core/cubos`, `astra/cubos`) as the platform's modular unit of functionality.

---

## CI / CD

GitHub Actions workflows live in `.github/workflows/`:

- `moon.yml` — installs and builds each MOON site (`moon/admin`, `moon/gen20.net`, `moon/localhost`).
- `god.yml`, `kronos.yml`, `gaia.yml`, `mars.yml` — build/check the respective services.

---

## Development Status

<kbd>Active Development</kbd>

GEN20 is an evolving platform. Its architecture is established, while individual services and operational interfaces continue to be developed, tested and integrated.

Current engineering priorities include:

- Consolidating SOL as the primary CLI and daemon.
- Standardizing service communication and command execution.
- Improving system observability and operational logging.
- Strengthening security and repository hygiene.
- Expanding the reusable CUBOS component ecosystem.
- Validating end-to-end platform workflows.

**Status:** Experimental / Active Development

---

## Security

GEN20 is under active development. Do not assume that development configurations are suitable for public production deployment.

- Never commit API keys, passwords, access tokens or session cookies.
- Store credentials outside the repository (`.env` is gitignored).
- Restrict access to operational logs and internal system data.
- Review configuration and service permissions before deployment.

If you discover a security issue, please report it privately rather than publishing sensitive details.

---

## Philosophy

GEN20 takes its name from a generation and its possibility.

It is an independent technological and creative initiative exploring the relationship between software, artificial intelligence, culture and human expression.

We build infrastructure, tools and experiences with the conviction that technology is meaningful only when it contributes something to human life.

**GEN20 — Technology is a means. Humanity is the purpose.**
