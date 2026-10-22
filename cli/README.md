# Gen20 CLI

**Static review and operator guide for the Bash-based Gen20 CLI.**

This document describes the CLI scripts currently visible in the repository's `main` branch. The review was performed against tracked source files on GitHub; commands were **not executed on the production server**, and this is not a runtime or penetration test. Confirm the deployed copy before relying on any command or path.

> **Important security finding:** the reviewed CLI source contains hard-coded credentials for database/cache or other service access. The values are intentionally not reproduced here. Treat any credential committed to Git as exposed: rotate it, remove it from source, and load replacement values from protected environment configuration. Removing a secret from the latest file does not remove it from Git history.

## 1. Layout and entry points

| Path | Observed purpose |
|---|---|
| `cli/gen` | Main command dispatcher. Expected invocation: `gen <command> [arguments...]`. |
| `cli/utils.sh` | Shared Bash helpers, logging, service checks, database helpers, argument parsing, and completion. |
| `cli/gend` | Starts/stops/checks the separate daemon process. |
| `cli/gen-daemon` | Background supervisor and file watcher for selected Gaia directories. |
| `cli/com/<group>/*.sh` | Grouped command scripts (for example, `gaia`, `god`, `kronos`, `ermis`, `mars`, `ws`, and `git`). |
| `cli/com/gaia/index.php` | PHP entry point that loads Gaia's Composer autoloader and dispatches to `Core\\Cli`. |
| `cli/bin/` | Additional executable helper scripts. |
| `cli/bg/` | Background scripts launched by the daemon when executable. |

The scripts currently use absolute paths rooted at `/var/www/gs`. This means they are not yet portable to a different checkout location without configuration or code changes.

## 2. Command interface

The main dispatcher is implemented in `cli/gen`. The command list below reflects commands visible in the current source, not a guarantee that each command succeeds on every host.

### General and system commands

| Command | Source-level behaviour / caution |
|---|---|
| `gen help` | Lists grouped command scripts found under `cli/com/`. It is not a complete reference for every built-in command. |
| `gen <group> <script> [args...]` | Dispatches to a script under `cli/com/<group>/`. Review the script before using it with production services. |
| `gen all <script>` | Attempts to run a matching script across command-group directories. |
| `gen tree` | Displays a shallow directory tree for the configured project root. |
| `gen ports` | Lists listening TCP/UDP ports using `netstat`. |
| `gen top`, `gen performance` | Shows process or basic host performance information. |
| `gen log <file>` | Follows a file under the configured log directory. |
| `gen domain:nginx`, `gen domain:ssl` | Lists Nginx server names or Let's Encrypt certificate directories. |
| `gen php:lint <file>` | Runs PHP syntax checking. |
| `gen composer <args...>` | Runs Composer in the Gaia directory as the configured system user. |
| `gen magento <args...>` | Invokes the Magento CLI wrapper. |
| `gen test <args...>` / `gen phpunit <args...>` | Invokes PHPUnit through Composer. Verify the current Composer configuration first. |
| `gen maria:dump`, `gen maria:compare <db1> <db2>` | Database dump/compare helpers. Backups may contain sensitive data and need protected storage. |
| `gen sql <query>`, `gen db <database> ...` | Executes SQL. These are high-risk administrative operations and should not be exposed to untrusted callers. |
| `gen redis`, `gen arango`, `gen elastic` | Connects to auxiliary data services. Credentials and endpoints must be supplied securely. |
| `gen start|stop|restart|reload|status <unit>` | Calls `systemctl` with the supplied action and unit name. Validate arguments and privileges before use. |
| `gen permissions` | Changes ownership and recursively adds executable permissions under the project root. **Do not use as a routine fix**; its broad permission changes may be unsafe. |
| `gen kill` | Calls a helper script intended to terminate processes. Inspect the target-selection logic before use. |

Some commands depend on host utilities such as `mariadb`, `mysqldump`, `jq`, `netstat`, `tree`, `curl`, `systemctl`, and language runtimes. Verify dependencies on the target host.

### Grouped commands

The grouped command dispatcher points to scripts in `cli/com/<group>/`. Source currently includes scripts for service status/start operations, WebSocket checks, Git push, and other management tasks. Use `gen help` to inspect the scripts present in the checkout, then read a script before executing it.

Example syntax (not a production-safety endorsement):

```bash
gen help
gen gaia status
gen god status
gen kronos status
gend status
```

The current source has inconsistent helper paths and service checks across scripts. For example, some scripts source `cli/utils.sh`, while others expect a separate helper file under `cli/lib/`. Confirm each script's dependencies before assuming it is runnable.

## 3. Daemon behaviour

`gend` is a separate process controller with `start`, `stop`, `restart`, and `status` actions. It writes a PID file under `cli/` and logs under `log/`.

The `gen-daemon` script is designed to:

- Start executable scripts in `cli/bg/`.
- Watch configured Gaia source/Cubos directories using `inotifywait`.
- Call Gaia commands when watched files change.
- Check tracked background process IDs on a loop and attempt to restart failed processes.

**This mechanism needs code-level fixes before it should be relied on for unattended production supervision.** The current implementation has fragile process tracking and restart selection, version-update logic that appears incorrect, and forced process termination in the controller. A systemd unit or a dedicated supervisor with explicit service definitions, health checks, graceful shutdown, and bounded restart/backoff would be safer.

The daemon also assumes dependencies including `inotifywait`, `jq`, and `bc`, and it sources the root `.env` file. Protect that file and ensure it contains only trusted shell-compatible assignments: sourcing an environment file executes shell code.

## 4. Git helper warning

The current `cli/com/git/push.sh` script stages broad changes, creates a timestamped release tag, and pushes directly to `origin main` with tags. It also sends a notification to a fixed endpoint.

This workflow is risky for a production repository because it can include unrelated or sensitive files, bypass branch review, and publish directly to `main`. **Prefer an explicit branch + pull request workflow.** Before using the current helper, inspect `git status`, confirm the intended files, check ignored/untracked files, and verify the remote and branch. The helper should be redesigned to accept explicit scope, stop on every failed Git operation, avoid overwriting an existing tag, and never embed credentials or environment-specific notification endpoints.

## 5. Audit findings and priorities

The following are source-level findings, not claims about runtime exploitability.

### P0 — resolve before further production use

1. **Hard-coded credentials:** remove credentials from tracked scripts, rotate the exposed credentials, and use least-privilege accounts loaded from protected environment configuration. Check Git history and logs for prior exposure.
2. **SQL command surface:** restrict who can invoke arbitrary SQL and database dump operations. Avoid root database accounts for routine CLI commands.
3. **Direct push to `main`:** replace the current Git helper with a reviewable branch/pull-request flow; do not automatically stage the whole working tree.
4. **Broad permission changes:** replace recursive `chmod +x` with narrowly scoped, documented ownership and permission rules.

### P1 — reliability and correctness

5. **Command return codes:** the grouped dispatch path appears to return a failure code after launching a script; verify and correct exit-status propagation.
6. **Argument handling:** `parse_args` currently flattens parsed values into a string, and its result is not used by the dispatcher. Preserve argument boundaries with Bash arrays and avoid `eval`.
7. **Daemon lifecycle:** replace `kill -9` with graceful termination and timeout-based escalation; validate PID files and process identity.
8. **Daemon restart logic:** map each PID to its actual script instead of relying on a separate directory listing's ordering; correct version checks and arithmetic.
9. **Path and input validation:** quote all expansions, validate subcommands and service-unit names, and avoid untrusted input in shell or SQL strings.
10. **Inconsistent dependencies:** standardise helper paths, runtime versions, log locations, and service health checks.

### P2 — maintainability

11. Add automated shell linting (for example, ShellCheck) and syntax checks in CI.
12. Add tests for argument parsing, dispatch, exit codes, and daemon lifecycle using mocked commands and temporary directories.
13. Generate command documentation from a maintained command registry or script metadata.
14. Move hard-coded project paths and service ports into validated configuration.
15. Add dry-run modes for destructive or broad operations and document backup/rollback requirements.

## 6. Recommended safe workflow

Before executing a command on a server:

1. Confirm which checkout/branch is deployed and inspect `git status`.
2. Read the target script and all sourced helper files.
3. Check required commands, permissions, and environment variables without printing secret values.
4. Run syntax/lint checks and test with a non-production fixture where possible.
5. Back up affected data/configuration before destructive changes.
6. Record expected output, exit status, and rollback steps.

For local static checks:

```bash
bash -n cli/gen cli/utils.sh cli/gend cli/gen-daemon
```

If ShellCheck is installed:

```bash
shellcheck cli/gen cli/utils.sh cli/gend cli/gen-daemon
```

These commands check syntax/static patterns only; they do not validate production service state or prove that a command is safe.

## 7. Next implementation steps

- [ ] Rotate credentials found in source and remove them from tracked scripts/history as appropriate.
- [ ] Replace unsafe database/cache access with protected configuration and least-privilege accounts.
- [ ] Fix command dispatch and exit-code handling.
- [ ] Refactor daemon process tracking, graceful stop, restart policy, and version updates.
- [ ] Replace direct-to-`main` Git helper with a branch/PR workflow.
- [ ] Add ShellCheck and Bash syntax checks to GitHub Actions.
- [ ] Test against the actual deployed CLI before describing any command as production-ready.

---

**Review boundary:** this guide documents what was visible in the repository's `main` branch during review. It does not certify the server's deployed version, permissions, configuration, or runtime behaviour.
