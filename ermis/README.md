# 🔱 Ermis WebSocket Server

**Real-time Communication & Dynamic Meta Routing Service for the Gen20 Ecosystem**

Ermis is the central real-time communication layer of the Gen20 platform.  
It provides WebSocket connectivity, session management, dynamic domain metadata routing, and real-time service communication between Gen20 applications.

---

## 📋 List of Jobs

# GEN20 PLATFORM ERMIS JOBS

# GEN20 PLATFORM ERMIS JOBS

1. HTTP API Gateway & Static Service
    - HTTP administration API (`/health`, `/sessions`, `/admin/*` Express routes)
    - API static resource serving (`express.static("public")`)
    - Request body size control (`express.json()` and `express.urlencoded({limit:'300mb'})`)
    - CORS origin control (`cors({...})` middleware configuration)

2. WebSocket Communication Layer
    - WebSocket connection management (WSServer initialization and HTTP server binding)
    - Real-time WebSocket communication (WebSocket server handling through `./ws/main`)
    - Connection heartbeat monitoring (WebSocket `pingInterval` and connection timeout configuration)

3. Session & Connection Management
    - Client session management (`sessionManager` active sessions handling)
    - Session creation and cleanup (`sessionManager.getActiveSessions()`, `closeSession()`, `cleanup()`)
    - Active connection tracking (`wssInstance.getStats()` and global connection counters)

4. Monitoring & Observability
    - Health status reporting (`GET /health` endpoint)
    - Runtime statistics collection (`getStats()` interval and global counters)
    - Logging (`log()` function and `/var/www/gs/log/ermis.log`)

5. Service Lifecycle Management
    - Graceful shutdown handling (`process.on('SIGTERM')` server termination logic)

6. Runtime Security & Access Control
    - CORS origin restrictions (`cors({...})`)
    - Client origin validation layer
    - Payload size limitation (`express.json()` / `express.urlencoded()`)

7. Dynamic Metadata & Domain Routing
    - Dynamic metadata routing (`GET /meta/:domain/*` route handler)
    - MetaServer integration (`services/metaserver/index.js` dynamic import and `metaHandler`)
    - Multi-domain metadata management (`metaserver.getDomainsList()`)
    - Domain configuration reload (`metaserver.reloadDomains()`)
 