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

GEN20 is designed as a modular environment rather than a collection of disconnected applications.

Its architecture combines a central application core with independent services, communication layers and reusable components.

### Core Architecture

| Component | Responsibility | Technology |
|---|---|---|
| **GAIA** | Core platform, application logic and APIs | PHP 8.2 |
| **GOD** | High-performance API and service gateway | Go |
| **KRONOS** | AI processing, generation and model services | Python / FastAPI |
| **MARS** | Native high-performance operations | C++ |
| **SUN** | Command-line interface and system operations | Bash |
| **CUBOS** | Reusable UI components and content tools | React / JavaScript |
| **ERMIS** | Legacy communication layer, under architectural transition | Node.js |

The components are designed to operate independently while communicating through defined interfaces and service channels.

---

## SUN — System Command Interface

SUN is the new generation of the GEN20 command-line environment.

It provides a unified entry point for system administration, service operations, development utilities and platform maintenance.

```bash
gen [command]
```

Its internal structure separates:

- **gen.sh** — Main command entry point
- **menu.sh** — Interactive command interface
- **exec.sh** — Command execution and dispatch
- **com/** — Platform and service command modules
- **utils/** — System administration utilities
- **bg/** — Background processes and watchers
- **gen-daemon** — Daemon management

SUN is currently under active development. Its command routing, service integration and legacy migration are being consolidated.

---

## Design Principles

### 1. Modular by design
Independent services with clearly separated responsibilities.

### 2. Direct communication
Services communicate through APIs, WebSockets and native protocols, avoiding unnecessary architectural layers.

### 3. Performance where it matters
Different technologies are used according to the requirements of each service, from PHP application logic to Go and C++ operations.

### 4. AI as infrastructure
AI is integrated into the platform as a processing and generation capability, not as an isolated feature.

### 5. Reusable components
CUBOS provides a foundation for reusable frontend elements and content-driven interfaces.

### 6. Human-oriented technology
The purpose of the platform is not technological complexity for its own sake. It is to create useful tools for people, communities and creative work.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| Operating System | Debian GNU/Linux |
| Backend | PHP 8.2, Go, Python, C++ |
| APIs | FastAPI, Gin, custom PHP APIs |
| Frontend | React, JavaScript |
| Database | MariaDB |
| Search | Apache Solr / Elasticsearch |
| Communication | WebSockets, MQTT |
| Infrastructure | Linux, Nginx, Docker |
| AI / ML | Python-based AI services and language models |
| CLI | Bash |

The stack evolves as the platform develops. Not every listed component is currently deployed or production-ready.

---

## Repository Structure

```text
gen20/
├── gaia/           # Core platform
├── god/            # Go API and services
├── kronos/         # AI and processing services
├── mars/           # Native C++ operations
├── sun/            # Command-line environment
├── cubos/          # Reusable UI components
├── .github/        # Repository workflows
└── README.md
```

The repository structure reflects an ongoing architectural transition. Some legacy components and interfaces are being consolidated or replaced.

---

## Development Status

<kbd>Active Development</kbd>

GEN20 is an evolving platform. Its architecture is established, while individual services and operational interfaces continue to be developed, tested and integrated.

Current engineering priorities include:

- Consolidating SUN as the primary CLI.
- Completing the migration from legacy command infrastructure.
- Standardizing service communication and command execution.
- Improving system observability and operational logging.
- Strengthening security and repository hygiene.
- Expanding the reusable CUBOS component ecosystem.
- Validating end-to-end platform workflows.

**Version:** 0.70 development line  
**CLI:** SUN — next-generation interface  
**Status:** Experimental / Active Development

---

## Security

GEN20 is under active development. Do not assume that development configurations are suitable for public production deployment.

- Never commit API keys, passwords, access tokens or session cookies.
- Store credentials outside the repository.
- Restrict access to operational logs and internal system data.
- Review configuration and service permissions before deployment.

If you discover a security issue, please report it privately rather than publishing sensitive details.

---

## Philosophy

GEN20 takes its name from a generation and its possibility.

It is an independent technological and creative initiative exploring the relationship between software, artificial intelligence, culture and human expression.

We build infrastructure, tools and experiences with the conviction that technology is meaningful only when it contributes something to human life.

**GEN20 — Technology is a means. Humanity is the purpose.**

manifest:
filemeta:
@[table.field]: "table.field content (strictly this style) inside <!--  --> or /**  */"
filemeta.script: "filemeta.script"
filemeta.css: "save/update/bundle to filemeta.css starting <style> endofcontent </style>"
filemeta.head: "filemeta.head starting <head> endofcontent </head>"
@cron: "create/update cron"
@filemeta.description: "update filemeta.description"
@filemeta.todo: "update filemeta.todo"
@filemeta.features: "update filemeta.features"
@filemeta.doc: "update filemeta.doc"

    filemetacore:
        @filemetacore.description: "update filemetacore.description"
        @filemetacore.todo: "update filemetacore.todo"
        @filemetacore.features: "update filemetacore.features"
        @filemetacore.doc: "update filemetacore.doc"
    
    format-content:
        readonly: "set not edited"
        img: "set <img>"
        img-icon: "set <img> for icon library"
        img-photo: "set <img> for user photo library"
        img-graph: "set <img> for Graph creation"
        meta: "comma separated words (replace with comma)"
        comma: "comma separated words"
        twig: "set twig editor by Form/Template (replace with pug)"
        pug: "set pug editor by Form/Template"
        sql: "read as sql by Form/Template"
        selectjoin-[table].name: "read from Form as joined with other table"
        selectG-[key]: "read as $this->G[key] (replace with ENUM)"
        auto: "read as primary key (mostly id, not edit) (deprecated, not used, delete it)"
        boolean: "read as checkbox boolean or FALSE/TRUE NO/YES 0/1 (διακόπτης)"
        json: "read and decoded as json"
        exe: "render button for execution, execute straight code (replaced with js, php, the lang executed)"
        loc: "localized textarea used by Lang for translation"
        cron: "varchar in cron format to be executed by Action converted to linux cron or sql event"
    
    folders:
        cubos: "folder with cubos"
        compos: "folder with components"
        main: "admin/folder"
        kronos: null
        ermis: null
        public: null

---

## License

License and distribution terms are subject to the repository's licensing declaration.