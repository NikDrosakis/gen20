# Gaia — PHP Core and Application Services

Gaia is the PHP application/core layer of Gen20. It provides shared classes and traits used by the platform's web-facing, API, CLI, domain-management, and reusable-component functionality.

This guide describes the code currently visible in `gaia/` on the repository's `main` branch. It is a developer orientation, not a guarantee that every feature is enabled in production. Verify the deployed revision, environment configuration, and Nginx/PHP-FPM setup before making operational changes.

## 1. Responsibilities

The codebase brings together several related responsibilities:

- **Shared PHP core** — common state, configuration, request context, database access, and error handling.
- **Application/web routing** — the `Core\\Gen` class and related traits render page layouts and route selected site requests.
- **API handling** — the `Core\\API` class handles API/XHR/Cubo-style requests through the common core.
- **CLI integration** — `Core\\Cli` is invoked by the repository's `cli/com/gaia/index.php` entry point.
- **Domain management** — traits support domain filesystem, database, host and SSL-related operations.
- **Reusable Cubos** — public/admin component functionality is represented in core traits and Cubo classes.
- **Integrations** — the Composer configuration includes libraries for HTTP requests, templates, YAML, Solr, WebSockets, WordPress and other integrations.

The exact behaviour available to a request depends on its entry point, server configuration, database state, and which traits/methods are called.

## 2. Main directories and files

| Path | Role |
|---|---|
| `composer.json` | PHP version constraint, dependencies, PSR-4 autoload mappings, and PHPUnit development dependency. |
| `core/Gaia.php` | Abstract base class. Loads shared configuration/helpers and initialises common services/state before delegating to the subclass request handler. |
| `core/Gen.php` | Web/UI-oriented class; composes traits for routing, templates, metadata, domains, actions, Cubos and related behaviour. |
| `core/API.php` | API-oriented class; handles API, XHR and Cubo request paths. |
| `core/Cli.php` | CLI-oriented class, used by the CLI PHP entry point. |
| `core/traits/` | Shared feature traits, including action, domain, host, filesystem, database, template, media, WebSocket, metadata and Cubo-related capabilities. |
| `core/cubo/` | Namespaced reusable PHP component classes. |
| `apiv1/` | API v1 entry point and related API code. |
| `public/` | PHP-rendered domain/site roots referenced by the domain-aware routing/configuration. |
| `vendor/` | Composer-managed dependencies; generated locally and normally not edited by hand. |
| `tests/` | PHPUnit test namespace is configured in Composer; confirm which tests are present before relying on coverage. |

The repository also contains domain- and application-specific directories such as `vivalibro/`; consult the actual tree before assuming all modules live under `core/`.

## 3. Runtime and dependencies

The current `composer.json` declares **PHP `^8.2.26`** and uses Composer PSR-4 autoloading. It maps the `Core\\` namespace to `core/`, with additional mappings for traits, Cubos, Vivalibro, and API v1.

Dependencies declared in Composer include libraries for Markdown parsing and templating (Parsedown, Pug, Twig), YAML, HTTP requests (Guzzle), WebSocket client connections (Ratchet Pawl), Solr, WordPress, and Twitter OAuth. This list comes from `composer.json`; it does not mean each integration is enabled in every request.

### Install/update PHP dependencies

Run these from the Gaia directory in a development checkout:

```bash
cd /var/www/gs/gaia
composer install
```

Use `composer install` to install dependencies from the lock file when one is present. Use `composer update` only when intentionally changing dependency versions and reviewing the resulting lock-file diff. Do not run dependency updates on production as a routine troubleshooting step.

Confirm the PHP version and Composer state:

```bash
php -v
composer --version
composer validate
```

If Composer validation reports that a lock file is absent or inconsistent, resolve that deliberately; do not assume the dependency graph is reproducible until `composer.lock` and the installation process have been checked.

## 4. How the main classes relate

- `Core\\Gaia` is the shared abstract base and initialises common configuration, data access, and request context.
- `Core\\Gen` extends Gaia for selected web/UI routes and composes many feature traits.
- `Core\\API` extends Gaia for API-style, XHR and Cubo request handling.
- `Core\\Cli` extends Gaia for commands dispatched by the Gen20 CLI.
- Traits under `core/traits/` group reusable capabilities so multiple entry-point classes can compose them.

This is a source-level overview. For a particular request, follow the real entry point and the method that handles the relevant request type; do not assume every trait is used by every class.

## 5. Entry points

### API v1

`apiv1/index.php` defines request-related constants, loads the Composer autoloader, and instantiates `Core\\API`.

### CLI

`cli/com/gaia/index.php` loads Gaia's Composer autoloader and instantiates `Core\\Cli`. Use [`../cli/README.md`](../cli/README.md) for the command interface. The PHP CLI entry point does not replace the Bash dispatcher.

### Web/UI

`Core\\Gen` contains UI-oriented routing/rendering behaviour, including page-head rendering and manifest-driven content in the inspected source. Which class is reached for a domain depends on the Nginx/PHP entry point and request environment.

## 6. Configuration and data dependencies

The base class references shared configuration/helpers and initialises common services, including MariaDB-oriented data access and Redis/APCu wrappers. It also reads platform/domain data such as global settings, page groups, and user groups.

Before debugging a Gaia request, verify:

1. The correct entry point and domain/server variables are being used.
2. Composer autoloading resolves the expected classes.
3. The required configuration files exist in the deployed layout.
4. Database connection settings and expected schemas are available to the service account.
5. Any Redis/APCu or external service dependency used by the selected code path is reachable.
6. Nginx routes the request to the expected PHP-FPM pool and script.

Document environment-variable **names and purpose**, never their secret values.

## 7. Domain and Nginx integration

The inspected `DomainHost` trait generates Nginx configuration for PHP and React domain types. The PHP path points at `gaia/public/<domain>`; the React path points at `public/<domain>/build`.

Treat these as implementation details that must be checked against the actual host configuration. Domain/host operations can write under `/etc/nginx` and reload Nginx, so test generated configuration and retain a rollback copy before running administrative actions.

## 8. Tests and code quality

Composer declares PHPUnit 9 under development dependencies and configures test namespaces. Confirm the actual test files and test bootstrap before assuming a test suite exists or has meaningful coverage.

Suggested checks:

```bash
cd /var/www/gs/gaia
composer validate
```

If PHPUnit is installed and tests are configured:

```bash
composer exec phpunit
```

Run tests in a development environment with non-production configuration. A successful syntax check or dependency validation does not prove that database-backed or HTTP behaviour works.

## 9. Troubleshooting checklist

- **Class not found:** check PSR-4 namespace/path casing and run `composer dump-autoload` in the correct project directory.
- **Missing dependency:** inspect `composer.json`, `composer.lock`, PHP version, and the deployed `vendor/` directory.
- **Wrong domain/template:** inspect the Nginx host config and request environment used to select the domain/system.
- **API returns no expected response:** identify whether the request is API, XHR, or Cubo-style and trace the corresponding handler.
- **Database errors:** verify schema, account privileges, and configuration without exposing passwords.
- **Changes do not appear:** verify the deployed checkout, PHP-FPM logs/opcache behaviour, and whether the request is served by the expected host.

## 10. Recommended documentation to add next

- [ ] A module map for each trait and the classes that use it.
- [ ] A request-flow diagram for PHP pages, API v1, XHR, Cubo requests, and CLI.
- [ ] A list of required configuration files and environment-variable names.
- [ ] Database schema/migration ownership and backup/restore notes.
- [ ] A verified PHPUnit command and description of existing test coverage.
- [ ] Domain provisioning steps, including Nginx validation and rollback.

---

**Gaia is a core Gen20 subsystem.** Keep this README aligned with the actual entry points and runtime configuration as the architecture evolves.

## 11. Trait inventory — `core/traits/`

This section is a source-derived map of the trait files found under `core/traits/` on `main`. Descriptions summarize names, docblocks, and method names; they are not a claim that every method is complete, safe to run, or active in production. A trait can call other traits or depend on database tables, environment values, or external services.

### 11.1 Rendering, metadata and UI

| Trait | Main responsibility | Representative methods |
|---|---|---|
| `Head` | Builds page-head content and loads dynamic head/action configuration. | `renderHead`, `renderPublicHead`, `loadHeadSetup`, `loadDynamicActions` |
| `Meta` | Reads and renders page/subpage metadata. | `getPageMetatags`, `renderMetadata` |
| `Template` | Lists, reads, archives and renders templates using supported template engines. | `listTemplates`, `renderTemplate`, `renderTemplateTwig`, `renderTemplatePug` |
| `Form` | Shared form/table rendering, filters, search, pagination, fields and cron editor UI. | `buildForm`, `buildTable`, `formSearch`, `formPagination`, `renderFormField` |
| `Tree` | Database schema/table metadata and schema-standard comparison/creation helpers. | `getBranches`, `compareWithStandard`, `buildSchema`, `createMaria` |
| `Doc` | Method-oriented documentation and help/menu generation. | `addMethodDoc`, `menuDoc`, `buildDoc` |
| `Bundle` | Bundles PHP, CSS and JavaScript assets and runs bundling steps. | `bundlePHPFile`, `outputBundledCSS`, `outputBundledJS`, `runBundler` |
| `Manifest` | Reads/writes YAML manifests associated with actions, action groups and Cubos; syncs manifest data with DB. | `manifestEditor`, `yamlParseFile`, `yamlUpdateDB`, `manifestFromDB` |
| `CuboYaml` | Creates Cubo definitions from YAML input. | `createYaml2Cubo` |
| `CuboPublic` | Builds public domain UI from page/page-group/Cubo data. | `renderCP`, `pageCP`, `getpagecubo`, `getLinks` |
| `CuboAdmin` | Manages admin Cubos and views, including maintenance and backup operations. | `addCA`, `addViewCA`, `dupViewCA`, `maintainCA`, `backupCA` |
| `CuboAction` | Loads Cubo action configuration, executes actions and can send WebSocket notifications. | `loadConfig`, `executeCuboAction`, `sendWsNotification` |
| `CuboLog` | Retrieves Cubo and system log data. | `getCuboLogs`, `getSystemLogsBuffer` |
| `Filemeta` | Extracts metadata/dependencies from source files and supports file metadata operations. | `extractDependencies`, `extractPHP`, `extractJS`, `insertFile`, `runFilemeta` |
| `PWA` | Provides a helper for syncing data to IndexedDB for offline/PWA use. | `syncToIndexedDB` |
| `SEO` | Generates SEO data and feed/sitemap outputs. | `buildMeta`, `sitemap`, `atom`, `rss` |
| `Lang` | Language/localisation administration and language-schema operations. | `buildNewLangUI`, `buildNewLang`, `dropLang` |
| `Url` | Stores, updates and fetches URL records or external URL data. | `getUrl`, `fetchUrl`, `insertUrl`, `updateUrl`, `deleteUrl` |

### 11.2 Actions, identity and integrations

| Trait | Main responsibility | Representative methods |
|---|---|---|
| `Action` | Action execution/plans, status tracking, route parsing/building and resource dispatch. | `runAction`, `runPlan`, `processActions`, `executeAction`, `scanRoutes` |
| `My` | User/session-oriented helpers, login/logout, role lookup and cookie handling. | `login`, `logout`, `getRoles`, `islogged`, `setCookies` |
| `Share` | Sharing/publishing helpers for social platforms. | `shareTo`, `shareToFacebook`, `shareToTwitter`, `shareToInstagram`, `shareToTikTok` |
| `WS` | WebSocket connection and message lifecycle helpers. | `connectToWebSocket`, `sendMessage`, `handleWebSocketMessage`, `disconnect` |
| `Ermis` | Connects to the Ermis/WebSocket API and queries or tests available routes. | `runningErmis`, `getListErmis`, `testErmisRoutes`, `requestErmis` |
| `Kronos` | Connects to the Kronos service, prepares requests and tests service routes. | `runningGPY`, `getListKronos`, `requestKronos`, `sendRequest` |
| `GSolr` | Solr indexing, search, collection listing and document deletion. | `indexDocument`, `search`, `listCollections`, `deleteDocument` |
| `Arango` | Basic ArangoDB document CRUD and query execution. | `createDocument`, `readDocument`, `updateDocument`, `deleteDocument`, `executeQuery` |
| `Ad` | Advertising/report integrations and ad-unit reporting helpers. | `getReport`, `fetchAdSenseReport`, `fetchAdMobReport`, `getAdUnits` |
| `Metric` | Metric recording helper. | `addMetric` |
| `Taxonomy` | Category/tag and parent-child taxonomy operations. | `cat`, `get_category`, `set_category_insert`, `parents_ofselected_children`, `tree` |
| `Task` | Task/cron-oriented trait file; current source describes planned task levels but exposes no named methods detected by the inventory scan. | No public/protected/private methods detected by the simple method scan |
| `System` | System metrics parsing and collection helpers. | `parseCpuUsage`, `getSystemMetrics`, `parseMemInfo` |
| `Watch` | Filesystem-watch callbacks used by the Gen daemon/CLI workflow. | `cubosFolder`, `coreFolder` |

### 11.3 Domain provisioning and infrastructure

| Trait | Main responsibility | Representative methods |
|---|---|---|
| `Domain` | Higher-level domain lifecycle, synchronisation, provisioning and backup helpers. | `addDomain`, `delDomain`, `syncDom`, `setupDomain`, `domainBackup`, `sysBackup` |
| `DomainFS` | Creates/removes/repairs domain filesystem structure under the Gaia public tree. | `addFS`, `delFS`, `checkfixFS` |
| `DomainDB` | Creates/removes/repairs domain database resources and tables. | `addDomainDB`, `delDomainDB`, `checkfixDomainDB`, `createDomainTables` |
| `DomainHost` | Generates and manages Nginx host configuration for PHP and React domains. | `addHost`, `genPhpConf`, `genReactConf`, `checkfixHost` |
| `DomainSSL` | Let's Encrypt certificate lifecycle and certificate-path repair helpers. | `addSSL`, `renewSSL`, `delSSL`, `getCertExpiry`, `setupCertbot` |
| `DomainZone` | DNS zone lifecycle helpers. | `addZone`, `delZone`, `checkfixZone` |

### 11.4 Class-to-trait composition

The following matrix reflects the `use` declarations inspected in `core/Gen.php`, `core/API.php`, and `core/Cli.php`. It indicates that the class composes a trait, not that every method is used on every request.

| Trait | `Core\\Gen` | `Core\\API` | `Core\\Cli` |
|---|:---:|:---:|:---:|
| `Action` | Yes | Yes | Yes |
| `Arango` | — | — | — |
| `Ad` | — | — | — |
| `Bundle` | — | — | — |
| `CuboAction` | — | — | — |
| `CuboAdmin` | Yes | Yes | Yes |
| `CuboLog` | — | — | — |
| `CuboPublic` | Yes | Yes | Yes |
| `CuboYaml` | — | — | — |
| `Doc` | — | — | Yes |
| `Domain` | — | Yes | Yes |
| `DomainDB` | Yes | — | Yes |
| `DomainFS` | Yes | — | Yes |
| `DomainHost` | Yes | — | Yes |
| `DomainSSL` | — | — | Yes |
| `DomainZone` | Yes | — | Yes |
| `Ermis` | Yes | — | Yes |
| `Filemeta` | Yes | — | Yes |
| `Form` | Yes | Yes | Yes |
| `GSolr` | — | — | — |
| `Head` | Yes | — | Yes |
| `Kronos` | Yes | — | Yes |
| `Lang` | Yes | Yes | Yes |
| `Manifest` | Yes | Yes | Yes |
| `Media` | Yes | Yes | Yes |
| `Meta` | Yes | — | Yes |
| `Metric` | — | — | — |
| `My` | Yes | Yes | Yes |
| `PWA` | — | — | — |
| `SEO` | — | — | — |
| `Share` | — | Yes | — |
| `System` | Yes | — | Yes |
| `Task` | — | — | — |
| `Taxonomy` | — | — | — |
| `Template` | Yes | — | Yes |
| `Tree` | Yes | Yes | Yes |
| `Url` | Yes | — | Yes |
| `Watch` | — | — | Yes |
| `WS` | Yes | — | Yes |

**Important:** `Book` is a class imported from `Core\\Cubo\\Book`, not a trait in `core/traits/`. The `Arango`, `GSolr`, `Bundle`, `Ad`, `PWA`, `SEO`, `Metric`, `Task`, `Taxonomy`, `CuboAction`, `CuboLog`, and `CuboYaml` files were found in the trait directory, but are not listed in the `use` declarations of these three primary classes. They may be used elsewhere or remain standalone/experimental; check call sites before classifying them as unused.

### 11.5 Reading and changing a trait

1. Find the trait file under `core/traits/`.
2. Read its namespace, class/trait-level docblock, method signatures, and any `use OtherTrait` declarations.
3. Search for its method names to identify callers and entry points.
4. Check database tables, environment variables, and service clients used by those methods.
5. Prefer documenting real parameters, return shapes, side effects, and required privileges from the implementation.
6. For methods that alter domains, databases, Nginx, certificates, or files, test in development/staging before invoking them on a live server.

Useful commands from the repository root:

```bash
find gaia/core/traits -maxdepth 1 -type f -name '*.php' -print | sort
grep -RInE '\\btrait[[:space:]]+[A-Za-z_][A-Za-z0-9_]*|function[[:space:]]+' gaia/core/traits
grep -RIn 'TraitMethodName' gaia/core
```

The inventory is a map for navigation, not an API contract. Method signatures, dependencies and class composition should be rechecked when code changes.

