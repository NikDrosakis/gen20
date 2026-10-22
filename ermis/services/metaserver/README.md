# 🔮 MetaServer Service

**Dynamic SEO & Router Generation Service for the Ermis Ecosystem**

---

# 📋 Table of Contents

- Overview
- Features
- Architecture
- Configuration
- API Endpoints
- WebSocket Integration
- Router Generation
- Domain Management
- Integration with React/Vite
- Real-time Updates
- Performance Optimization
- Troubleshooting
- Logging & Monitoring

---

# 🌟 Overview

MetaServer is a core infrastructure service of the **Ermis Ecosystem**, responsible for dynamic SEO metadata injection and automatic route generation for React/Vite applications.

Unlike traditional SSR solutions, MetaServer works as a lightweight middleware that dynamically injects metadata into Single Page Applications while also generating client-side routing information from centralized configuration files.

The service is implemented as an **Express.js microservice** with an integrated **WebSocket server**, allowing connected applications to receive instant updates whenever routes, domains, or metadata change.

---

## Primary Responsibilities

- Dynamic SEO metadata injection
- Automatic React Router generation
- Domain-aware configuration management
- WebSocket event broadcasting
- AI-assisted route generation
- Configuration hot reload
- Multi-project support

---

# ✨ Features

## Dynamic SEO

- Runtime `<title>` generation
- Meta description injection
- OpenGraph metadata
- Twitter Cards
- Canonical URLs
- Structured JSON-LD support
- Dynamic robots directives

---

## Router Generator

- Automatic React Router creation
- Nested route support
- Lazy-loaded components
- Dynamic imports
- Protected routes
- Parameterized routes
- Sitemap generation

---

## Multi Domain Support

- Multiple websites
- Shared configuration
- Per-domain metadata
- Domain aliases
- Language-aware routing

---

## WebSocket

- Live configuration updates
- Route synchronization
- Metadata broadcasting
- Cache invalidation
- Connected client management

---

## AI Integration

Supports DeepSeek AI for:

- Route suggestions
- SEO optimization
- Metadata generation
- Missing page detection
- Automatic descriptions

---

## Developer Experience

- Hot reload
- File watching
- Zero restart configuration updates
- JSON-based configuration
- Debug logging

---

# 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────┐
│                  MetaServer Service                  │
│              (Ermis Core Component)                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐      ┌────────────────────────┐    │
│  │ HTTP Server  │      │ WebSocket Server       │    │
│  │  Express.js  │      │ ws                     │    │
│  └──────┬───────┘      └──────────┬─────────────┘    │
│         │                         │                  │
│         └────────────┬────────────┘                  │
│                      │                               │
│          ┌───────────▼──────────────┐                │
│          │     MetaServer Engine    │                │
│          ├──────────────────────────┤                │
│          │ Domain Loader            │                │
│          │ Cache Manager            │                │
│          │ Router Generator         │                │
│          │ Meta Injector            │                │
│          │ File Watcher             │                │
│          │ AI Route Generator       │                │
│          └───────────┬──────────────┘                │
│                      │                               │
│        ┌─────────────▼─────────────┐                 │
│        │ Configuration Files       │                 │
│        │ Domains                   │                 │
│        │ Routes                    │                 │
│        │ Metadata                  │                 │
│        └───────────────────────────┘                 │
└─────────────────────────────────────────────────────┘
```

---

# ⚙️ Configuration

Example configuration:

```json
{
  "server": {
    "port": 8090,
    "host": "0.0.0.0"
  },
  "watch": true,
  "cache": true,
  "websocket": true,
  "domains": "./domains",
  "routes": "./routes"
}
```

---

## Domain Configuration

```json
{
  "domain": "gen20.dev",
  "title": "GEN20",
  "description": "AI Platform",
  "language": "en",
  "defaultRoute": "/"
}
```

---

# 🌐 API Endpoints

## Health

```
GET /health
```

Returns service status.

---

## Domains

```
GET /domains
```

Returns all loaded domains.

---

## Routes

```
GET /routes
```

Returns generated routes.

---

## Metadata

```
GET /meta/:domain/:path
```

Returns metadata for a specific page.

---

## Reload

```
POST /reload
```

Reloads configuration files.

---

## Cache

```
DELETE /cache
```

Clears internal cache.

---

# 🔌 WebSocket Integration

Clients connect to:

```
ws://localhost:8090
```

Supported events:

| Event | Description |
|--------|-------------|
| route:update | Routes regenerated |
| meta:update | Metadata updated |
| domain:update | Domain configuration changed |
| cache:clear | Cache invalidated |
| reload | Configuration reloaded |

Example:

```javascript
socket.on("meta:update", data => {
    console.log(data);
});
```

---

# 🛣️ Router Generation

Routes can be generated from JSON definitions.

Example:

```json
[
  {
    "path": "/",
    "component": "Home"
  },
  {
    "path": "/about",
    "component": "About"
  }
]
```

Generated React Router:

```jsx
<Route path="/" element={<Home />} />
<Route path="/about" element={<About />} />
```

Supports:

- Nested routes
- Dynamic parameters
- Wildcards
- Authentication
- Lazy loading

---

# 🌍 Domain Management

Each domain maintains independent:

- Metadata
- Routes
- Assets
- Sitemap
- Robots
- OpenGraph configuration

Example:

```
gen20.dev
gen20.net
gen20.eu
```

can all share the same MetaServer instance while exposing different metadata and routing behavior.

---

# ⚛️ Integration with React/Vite

Typical startup flow:

```
Vite Dev Server
        │
        ▼
React Application
        │
        ▼
MetaServer
        │
        ▼
Inject Metadata
        │
        ▼
Generate Routes
```

Example fetch:

```javascript
const meta = await fetch("/meta/gen20.dev/about")
    .then(r => r.json());
```

---

# ⚡ Real-time Updates

When a configuration file changes:

```
JSON modified
      │
      ▼
File Watcher
      │
      ▼
Reload Cache
      │
      ▼
Regenerate Routes
      │
      ▼
Broadcast WebSocket Event
      │
      ▼
React Refresh
```

No service restart is required.

---

# 🚀 Performance Optimization

MetaServer includes:

- In-memory caching
- Incremental reloads
- Route precompilation
- Metadata caching
- Domain lookup optimization
- WebSocket batching
- Lazy parsing
- Automatic cache invalidation

---

# 🛠️ Troubleshooting

## Routes not updating

- Verify File Watcher is enabled.
- Check configuration paths.
- Reload manually.

---

## Missing metadata

- Confirm domain exists.
- Validate JSON syntax.
- Clear cache.

---

## WebSocket disconnected

- Verify port availability.
- Check firewall.
- Inspect browser console.

---

## Invalid routes

- Validate JSON.
- Ensure component names exist.
- Check nested route definitions.

---

# 📊 Logging & Monitoring

MetaServer provides structured logging for:

- HTTP requests
- WebSocket connections
- Route generation
- Cache operations
- File changes
- Domain loading
- Errors
- Performance metrics

Example log:

```text
[INFO] Domain loaded: gen20.dev
[INFO] Generated 148 routes
[INFO] Cache rebuilt
[INFO] WebSocket clients: 12
[INFO] Metadata updated: /about
```

---

# 🔮 Summary

MetaServer is the centralized SEO and routing engine of the **Ermis Ecosystem**, providing:

- Dynamic SEO metadata
- Automatic React Router generation
- Multi-domain management
- WebSocket live synchronization
- AI-assisted routing
- Hot configuration reload
- High-performance caching
- Zero-downtime updates

Designed as a lightweight microservice, MetaServer enables modern React/Vite applications to remain fully dynamic while maintaining excellent SEO, centralized configuration, and real-time synchronization across the ecosystem.