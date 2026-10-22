# Gen20 Help System — Proposed Design

**Status:** Proposed; not implemented or validated against the current plugin architecture.

## 1. Goals

Build one Help System that can serve:

- technical documentation for developers and operators;
- a UI manual for administrators and end users;
- contextual help for the screen or plugin currently in use;
- searchable procedures, troubleshooting guides, and FAQs;
- plugin-contributed help content without custom UI code for every plugin;
- versioned and localized content, with authorization where required.

The system should scale as the platform adds more plugins. Content discovery should depend on both text relevance and context, not just filenames or folders.

## 2. Recommended direction

Use a database-first content registry with a common React presentation layer.

| Component | Proposed responsibility |
|---|---|
| MariaDB | Canonical structured records, relationships, status, locale, versions, and access metadata |
| Solr | Full-text search and ranking, if the existing installation and indexing pipeline are suitable |
| PHP API | Authenticated read/write access using the platform's established API conventions |
| React Help UI | Search, filters, article rendering, contextual help, and navigation |
| Plugin Help Contract | A standard way for plugins to register screens, topics, and documentation links |
| Git | Version control for source code, schema/migrations, API contracts, and any seed/example content |

SQLite may be useful for a local cache, offline bundle, or standalone package. It is not proposed as the canonical central store for a multi-user platform unless deployment requirements indicate otherwise.

## 3. Content model

The following is a conceptual model, not a finalized schema.

### Core entities

- **plugins** — stable plugin identifier, display name, version, lifecycle status.
- **screens** — route or screen identifier, owning plugin, component identifier.
- **documents** — title, content, document type, locale, publication status.
- **document_versions** — revision history and publication metadata.
- **topics/tags** — searchable topics and labels.
- **relations** — links between documents and plugins, screens, components, API operations, or procedures.
- **search records** — indexed text and filterable metadata in Solr.

### Example document types

- `technical`
- `ui-manual`
- `procedure`
- `troubleshooting`
- `faq`
- `api-reference`
- `release-note`

### Content representation

Store content in structured blocks so the UI can render headings, paragraphs, ordered steps, callouts, code snippets, links, images, and tables consistently. JSON is one viable representation for blocks; the final choice should follow the editor and frontend requirements.

Do not duplicate every document's content in multiple stores. Choose one canonical content source in MariaDB; Solr should contain a rebuildable search projection rather than become the source of truth.

## 4. Contextual search

The UI should pass available context with a search request, such as:

- search query;
- active plugin identifier;
- current route or screen identifier;
- language/locale;
- document type filters;
- user role or authorization context, derived server-side.

A proposed ranking strategy:

1. Enforce authorization and publication/version filters first.
2. Match exact title and identifier.
3. Match the active screen and plugin.
4. Rank full-text relevance.
5. Include related procedures and troubleshooting material.
6. Use freshness or popularity only as secondary signals, if appropriate.

The client must not be trusted to decide which documents a user is allowed to read. Authorization must be enforced by the API and search layer.

## 5. Plugin Help Contract

Each plugin should be able to declare or register:

- stable plugin ID and version;
- screen/route IDs;
- help topic IDs;
- supported locales;
- optional component and API references;
- compatibility information.

Registration should validate identifiers and avoid executing arbitrary code or trusting unrestricted plugin-supplied paths. The exact contract format (database records, PHP registration API, manifest, or a combination) must be chosen after inspecting the existing plugin loader.

## 6. Indexing lifecycle

Proposed flow:

1. Create or update a document in the canonical store.
2. Validate its schema, links, locale, status, and authorization metadata.
3. Publish or save it as a draft.
4. Queue or perform an idempotent Solr index update.
5. Record indexing status and errors.
6. Retry failed updates and support full index rebuilds.
7. Remove stale index records when documents are unpublished or deleted.

The system must remain understandable if Solr is temporarily unavailable. Administrative editing and canonical content storage should not depend on a successful search-index update.

## 7. API capabilities to design

Actual endpoint names and response formats are not yet defined. Likely capabilities include:

- search documents with context and filters;
- fetch a document by stable ID;
- fetch contextual help for a screen or plugin;
- list topics for a plugin;
- create/update drafts, subject to permissions;
- publish/unpublish documents;
- rebuild or inspect indexing status, restricted to administrators.

These are requirements, not a claim that these endpoints already exist.

## 8. Security and operational requirements

- Apply role-based access control to editing, publishing, and restricted technical content.
- Sanitize rendered rich content and validate links and uploaded media.
- Do not allow document content to execute scripts.
- Keep credentials and secret configuration out of documentation content.
- Audit publish, unpublish, permission, and deletion actions.
- Define backup, restore, retention, and migration procedures.
- Make index rebuilding repeatable and safe.
- Avoid exposing internal server paths, private routes, or sensitive operational instructions to ordinary users.

## 9. Implementation phases

1. **Discovery:** inspect plugin registry, UI routing, API conventions, authentication, database conventions, and Solr deployment.
2. **Data model:** finalize migrations, relationships, document blocks, locales, and version policy.
3. **Registry/API:** implement read APIs and plugin/screen metadata registration.
4. **Search:** create a rebuildable Solr index and contextual ranking.
5. **React UI:** build search, result filters, article view, and contextual help.
6. **Authoring:** add a controlled editor and review/publish workflow.
7. **Content migration:** import initial verified documentation.
8. **Validation:** test authorization, stale indexes, plugin removal/version changes, localization, backups, and search relevance.

## 10. Decisions still required

- Which existing Solr core/indexing conventions should be reused?
- Which authentication and authorization middleware must the Help API use?
- Does the current plugin system have a manifest or registry that can be extended?
- Should article content use JSON blocks, HTML with a restricted schema, or another editor-compatible format?
- What is the required versioning policy for platform releases and plugin versions?
- Which documentation categories are public, internal, administrator-only, or developer-only?
