# Gen20 UI Manual

**Status:** Structure proposal; screen inventory not yet verified.

## Purpose

Provide task-oriented instructions for people using Gen20. The manual should be built from actual routes and screens in the application, not inferred from proposed architecture.

## Page template

Each screen guide should include:

1. **Purpose** — what the screen is for.
2. **Access** — navigation path and required permission.
3. **Prerequisites** — required configuration or records.
4. **Controls** — fields, buttons, filters, actions, and validation rules.
5. **Procedure** — numbered steps for common tasks.
6. **Expected result** — what should happen after the action.
7. **Errors and recovery** — common errors and safe troubleshooting.
8. **Related material** — plugin, API operation, technical guide, and related procedures.
9. **Version** — platform/plugin version verified against.

## Contextual help metadata

Where available, associate each guide with stable identifiers:

- plugin ID;
- screen ID;
- frontend route;
- component ID;
- relevant API operation IDs;
- locale;
- minimum/maximum supported version;
- audience and permission level.

Do not rely on a display label alone as a permanent identifier; labels may be translated or renamed.

## Screenshots

- Capture screenshots from a real, non-sensitive environment.
- Remove personal information, tokens, internal credentials, and customer data.
- Use numbered callouts only when they improve clarity.
- Record which application/plugin version the screenshot represents.
- Re-capture screenshots after meaningful UI changes.

## Acceptance checklist

- The route and screen exist in the inspected source or running application.
- Steps have been followed successfully in a test environment.
- Permission requirements are confirmed.
- Error handling and expected results are documented.
- Links to related API or technical documentation resolve.
- No secrets or sensitive user data are present.

## Initial inventory

The actual screen list is **not yet documented**. Next, inspect frontend route definitions, navigation/menu configuration, and plugin manifests. Create one guide per meaningful workflow or screen group, rather than one file for every small component.
