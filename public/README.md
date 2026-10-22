# Public — Domain Frontends and Site Roots

The repository's top-level `public/` directory contains domain-specific frontend projects. The current domain-host generation code references React build output under `public/<domain>/build`; the repository also has a separate PHP site-root convention under `gaia/public/<domain>`.

This README covers the **top-level `public/` tree**. It describes the known layout and workflow, not a verified build of every domain. Inspect the selected domain folder's own `package.json`, scripts, and source before running build commands.

## 1. Purpose

The directory is used to keep separate domain frontends within the Gen20 repository while allowing shared platform services and domain management to live elsewhere.

Typical responsibilities include:

- Domain-specific React UI and assets.
- Frontend source code and static resources.
- Per-domain JavaScript dependencies and build configuration.
- Generated production assets in a build directory, where the domain uses the React build convention.

Not every folder in `public/` should be assumed to be a React application. Confirm the contents and scripts of each domain before installing or building it.

## 2. How it relates to Gen20

At a high level:

- **Nginx** serves a domain and routes it to the configured document root.
- **React domains** are configured by the inspected `Core\\Traits\\DomainHost` code to use `public/<domain>/build`.
- **Shared PHP/core capabilities** live under `gaia/`; the PHP-domain configuration inspected in the repository points to `gaia/public/<domain>`, not the top-level `public/` directory.
- **CLI provisioning helpers** include scripts that create a React application under `public/<domain>`. Confirm the actual generated folder and installed package manager before relying on a setup script.

The exact relationship between each domain and its deployment configuration should be documented per domain.

## 3. Expected domain project structure

A React application created with Create React App commonly has a structure similar to this:

```text
public/
  <domain>/
    package.json
    public/
    src/
    build/          # generated production output; may be ignored by Git
    README.md       # optional domain-specific notes
```

This is a **reference structure**, not a claim that every current domain has these exact files. Use the actual domain's `package.json` and repository tree as the source of truth.

## 4. Working with a domain

From the repository root, select the domain folder and inspect its scripts:

```bash
cd /var/www/gs
ls public
cd public/<domain>
cat package.json
```

Replace `<domain>` with an actual directory name. Do not run these literal placeholder commands unchanged.

If the domain's `package.json` confirms that it uses Create React App, typical commands are:

```bash
# Run from public/<domain>
yarn install
yarn start
yarn build
```

Use the package manager and scripts declared by that specific project. If it uses npm, Vite, or a custom build system, follow that project's scripts instead. Do not create a root-level `package.json` or install dependencies at `public/` unless the repository architecture explicitly calls for it.

### Development vs production

- **Development:** run the project's documented development script and use non-production API endpoints/configuration.
- **Build:** generate static production assets using the script declared in `package.json`.
- **Deploy:** confirm that Nginx points to the expected build output, check file ownership/permissions, and test the domain before considering the release complete.

The React host generator currently references `public/<domain>/build`. If a domain produces output somewhere else (for example, Vite's default `dist/`), its build and Nginx configuration must be aligned intentionally.

## 5. Shared APIs and assets

A domain frontend may call Gen20 APIs or load shared assets, but the exact endpoints, authentication flow, CORS policy, and environment variables are domain-specific and should be documented in each project's README.

For every domain, record:

- Public URL and intended audience.
- Frontend framework and package manager.
- Development/build/test scripts.
- Required environment-variable **names** (never secret values).
- API base URL and expected authentication/session model.
- Build output directory and Nginx document root.
- Deployment and rollback procedure.
- Known domain-specific integrations and dependencies.

Avoid hard-coding production API URLs when the project supports environment-specific configuration.

## 6. Checks before a build or deployment

1. Confirm the repository branch and working tree.
2. Read the selected domain's README and `package.json`.
3. Confirm the supported Node.js and package-manager versions.
4. Install dependencies using the project's lock file and package manager.
5. Run the available lint/test/build scripts.
6. Check that the generated output directory matches the Nginx document root.
7. Deploy to a test domain or staging environment when possible.
8. Verify routing, static assets, API requests, browser console, and server logs.
9. Keep the previous build/configuration available for rollback.

Do not assume that a successful frontend build verifies API compatibility or production routing.

## 7. Troubleshooting

- **Build script missing:** inspect the selected domain's `package.json`; this directory may not be a React app or may use another toolchain.
- **Blank page after deployment:** check browser console, asset paths, public/base URL settings, and whether Nginx serves the correct build directory.
- **404 on refresh:** check Nginx SPA fallback/routing rules for that domain.
- **API requests fail:** check API base URL, CORS response, authentication, and the relevant backend logs.
- **Stale UI:** verify which checkout/build directory Nginx serves and rebuild the correct domain.
- **Permission errors:** use narrowly scoped ownership/permissions; avoid recursive blanket `chmod +x` changes.
- **Wrong build directory:** compare the framework's actual output with the React host configuration, which currently references `build`.

## 8. Current documentation gaps

- [ ] Inventory the actual domain folders and identify which are React, PHP, WordPress, or other applications.
- [ ] Add one README per domain with its real scripts and environment configuration.
- [ ] Document the API endpoints used by each frontend.
- [ ] Verify the Node.js/package-manager versions and build output for each project.
- [ ] Document Nginx routing, SPA fallback, asset caching, and rollback per domain.
- [ ] Confirm which build outputs are generated and whether they are tracked or ignored.

---

**Rule of thumb:** `public/<domain>` is a domain-level frontend project, not a single shared React application. Always use that domain's own configuration as the source of truth.
