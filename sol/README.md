# SOL — GEN20 Domain Language

SOL is the native command language and interactive operating environment of GEN20. It extends Bash with a filesystem-discovered domain expression system: commands are formed from a **noun (system)** and a **verb (expression)**, while native Bash and Linux commands remain available in the same shell. SOL does not replace Bash; it gives the GEN20 platform a unified command surface.

## 1. Start

From the GEN20 repository root:

```bash
chmod +x sol/gen.sh
./sol/gen.sh
```

The interactive prompt is:

```text
gen>
```

To execute an expression directly, without entering interactive mode:

```bash
./sol/gen.sh god status
./sol/gen.sh moon list
./sol/gen.sh sol index
```

To execute a Bash command string:

```bash
./sol/gen.sh -c 'find . -type f | grep php'
```

Type `help` inside SOL for the built-in help.

## 2. Language grammar

SOL uses a compact expression grammar:

```text
<system> esti [args...]
<system> <verb> [args...]
<native Bash command>
```

Examples:

```bash
gen> god esti
gen> god status
gen> moon domain example.com
gen> astra indexcubo
gen> gaia local this
gen> find . -type f -name '*.php' | grep api
```

### Noun and verb resolution

A command such as:

```bash
astra pushcubo hello gen20.net
```

is resolved through the filesystem.

SOL first searches for:

```text
astra_pushcubo.sh
```

If that file does not exist, it searches for:

```text
astra.sh
```

and looks for the function:

```bash
astra_pushcubo() {
    ...
}
```

The supported expression forms are:

| Form | Resolution |
|---|---|
| `noun verb args` | `noun_verb.sh` |
| `noun verb args` | `noun.sh` containing `noun_verb()` |
| `noun args` | `noun.sh` containing `noun()` or a standalone script |
| Native command | Executed through Bash/Linux |

The `esti` expression is an explicit system information/help expression. A bare system name does not automatically execute its `esti` function.

### Search directories

The resolver searches these directories, in order:

1. `$SOL_ROOT/acta`
2. `$SOL_ROOT/systems`
3. `$SOL_ROOT/rima`
4. `$SOL_ROOT/prothesis`
5. The corresponding directories under `$SOL_DIR`

It searches directly inside each directory and one level deeper.

`SOL_ROOT` is the parent directory of `sol/`. `SOL_DIR` is the SOL installation directory itself.

### Directory glossary

| Directory | Meaning | Responsibility |
|---|---|---|
| `__sol/` | SOL engine | Resolution, dispatch, loading, completion and help |
| `systems/` | Systems | Domain-level functions and system operations |
| `acta/` | Actions | Executable operations and scripts |
| `rima/` | Verbs | Reusable operational functions |
| `prothesis/` | Protheses | General-purpose shell helpers |

## 4. Command glossary

The following table describes commands found in the inspected source files. The output column identifies the observable result, not an assumption that every operation has been successfully executed.

### SOL and system commands

| Command | File | What it does | What it produces |
|---|---|---|---|
| `sol esti` | `systems/sol.sh` | Shows SOL environment | Version, root, expressions |
| `sol about` | `systems/sol.sh` | Describes SOL | Description |
| `sol help` | `systems/sol.sh` | Shows grammar and help | Help text |
| `sol status` | `systems/sol.sh` | Shows environment status | Version, Bash, system count |
| `sol index` | `systems/sol.sh` | Lists discovered system functions | Expression table |
| `sol menu` | `systems/sol.sh` | Lists discovered entities | System/subject table |
| `gaia <args>` | `systems/gaia.sh` | Passes arguments to GAIA PHP CLI | GAIA command output |
| `god esti` | `systems/god.sh` | Describes GOD | Description |
| `god start` | `systems/god.sh` | Starts GOD | Running process |
| `god stop` | `systems/god.sh` | Stops GOD | Stopped process |
| `god restart` | `systems/god.sh` | Stops and starts GOD | Restarted process |
| `god status` | `systems/god.sh` | Checks process and port | Status/log |
| `god list` | `systems/god.sh` | Lists GOD cubos | Directory list |
| `astra esti` | `systems/astra.sh` | Shows ASTRA help | Help text |
| `astra root` | `systems/astra.sh` | Shows ASTRA root | Directory path |
| `astra list` | `systems/astra.sh` | Lists packages | Directory list |
| `astra tree` | `systems/astra.sh` | Shows package tree | Directory tree |
| `moon esti` | `systems/moon.sh` | Shows MOON help | Help text |
| `moon localhost [port]` | `systems/moon.sh` | Creates localhost environment | Filesystem, DB/Nginx configuration |
| `moon domain <name> [template]` | `systems/moon.sh` | Creates a domain | Filesystem, DB, Nginx, DNS/SSL attempts |
| `moon tor [template]` | `systems/moon.sh` | Creates a Tor hidden service | `.onion` address |
| `moon ssl <domain>` | `systems/moon.sh` | Configures SSL | Certificate/Nginx changes |
| `moon dns <domain>` | `systems/moon.sh` | Creates DNS zone | Zone file |
| `moon nginx <domain> [port]` | `systems/moon.sh` | Creates Nginx configuration | `.conf` file |
| `moon db <domain>` | `systems/moon.sh` | Creates domain database | MariaDB database |
| `moon fs <domain> [template]` | `systems/moon.sh` | Creates domain filesystem | Vite project |
| `moon list` | `systems/moon.sh` | Lists domains | Directory list |
| `mars esti` | `systems/mars.sh` | Describes MARS | Description |
| `mars build` | `systems/mars.sh` | Compiles MARS | Native executable |
| `mars start` | `systems/mars.sh` | Starts MARS | Running process |
| `mars stop` | `systems/mars.sh` | Stops MARS | Stopped process |
| `mars restart` | `systems/mars.sh` | Stops, builds and starts MARS | Restarted process |
| `mars status` | `systems/mars.sh` | Checks MARS process | Status |
| `mars clean` | `systems/mars.sh` | Cleans build artifacts | Clean build directory |
| `mars info` | `systems/mars.sh` | Runs Makefile information target | Build information |
| `mars list` | `systems/mars.sh` | Lists MARS cubos | Directory list |
| `kronos esti` | `systems/kronos.sh` | Describes KRONOS | Description |
| `kronos start` | `systems/kronos.sh` | Starts KRONOS API | Running API |
| `kronos stop` | `systems/kronos.sh` | Stops KRONOS | Stopped process |
| `kronos restart` | `systems/kronos.sh` | Restarts KRONOS | Restarted API |
| `kronos status` | `systems/kronos.sh` | Checks process and API | Status/health |
| `kronos service <name> new` | `systems/kronos.sh` | Creates a service | Python service files |
| `kronos service <name> delete` | `systems/kronos.sh` | Deletes a service | Removed service files |
| `kronos list` | `systems/kronos.sh` | Lists KRONOS cubos | Directory list |
| `kronos ping` | `systems/kronos.sh` | Sends a GOD WebSocket message | Message response |
| `kronos ask "<question>"` | `systems/kronos.sh` | Sends a question to KRONOS | WebSocket response |
| `bigbang verify` | `systems/bigbang.sh` | Checks required tools | Installed/missing report |
| `bigbang start` | `acta/bigbang_start.sh` | Installs base Debian infrastructure | System packages and runtimes |

### ASTRA actions

| Command | File | What it does | What it produces |
|---|---|---|---|
| `astra migrate` | `acta/astra_migrate.sh` | Migrates Hello cubos | `astra/hello/manifest.json` |
| `astra indexcubo` | `acta/astra_indexcubo.sh` | Indexes shared ASTRA cubos | `data/astralist.json` |
| `astra pushcubo <name> [domain]` | `acta/astra_pushcubo.sh` | Copies/syncs cubo to systems | Updated system cubos |
| `astra pullcubo <name> [domain]` | `acta/astra_pullcubo.sh` | Collects cubo from systems | `astra/cubos/<name>/` |
| `astra pushapp <domain> <app>` | `acta/astra_pushapp.sh` | Copies ASTRA app into domain | `moon/<domain>/src/apps/` |
| `astra pullapp <domain> <app>` | `acta/astra_pullapp.sh` | Collects domain app files | `astra/apps/<app>/` |
| `astra pushroot <domain>` | `acta/astra_pushroot.sh` | Copies ASTRA root files to domain | `moon/<domain>/src/` |
| `astra pullroot <domain> --files ...` | `acta/astra_pullroot.sh` | Collects selected domain files | `astra/root/` |

### MOON actions

| Command | File | What it does | What it produces |
|---|---|---|---|
| `moon indexcubo <domain>` | `acta/moon_indexcubo.sh` | Indexes domain cubos | `data/<domain>/moonlist.json` |

### Build, diagnostics and shell helpers

| Command | File | What it does | What it produces |
|---|---|---|---|
| `build <domain>` | `rima/build.sh` | Runs Vite build, retries missing packages | `moon/<domain>/dist/` |
| `preflight run` | `rima/preflight.sh` | Collects system diagnostics | GEN20 log report |
| `preflight latest` | `rima/preflight.sh` | Shows latest preflight report | Report text |
| `preflight history` | `rima/preflight.sh` | Lists preflight executions | Log references |
| `ad <name\|path>` | `prothesis/ad.sh` | Jumps to a directory | Changes current directory |
| `per <file> -- <command> [args...]` | `prothesis/per.sh` | Saves command output | Output file |
| `ws send <message> --to <user>` | `acta/ws.sh` | Sends a WebSocket message | Remote message |
| `ws interactive --to <user>` | `acta/ws.sh` | Opens interactive messaging | Live WebSocket session |
| `ws test` | `acta/ws.sh` | Sends test message to `god:1` | Test response |
| `websocket` | `acta/websocket.sh` | Publishes system status continuously | GOD WebSocket status events |
| `ws_init` | `acta/ws_init.sh` | Opens a WebSocket client | Interactive connection |
| `onion list` | `acta/onion_list.sh` | Lists Tor hidden services | Onion/port table |
| `todo vres` | `acta/todo_vres.sh` | Searches TODO/FIXME/HACK | Matching source lines |
| `user permit <path>` | `acta/user_permit.sh` | Changes permissions and ownership recursively | Filesystem permission changes |
| `user test` | `acta/user_test.sh` | Runs a simple test action | Test message |
| `opus installation` | `acta/opus_installation.sh` | Updates GOD aggregator and builds | Updated aggregator and GOD binary |
| `repo push <message>` | `acta/repo_push.sh` | Commits and pushes repository changes | Git commit and remote push |
| `backup todo` | `acta/backup_todo.sh` | Backs up databases and filesystem | ZIP backup / GDrive upload |

## 5. Important generated files

| File | Generator command | Location |
|---|---|---|
| `astralist.json` | `astra indexcubo` | `$SOL_ROOT/data/astralist.json` |
| `moonlist.json` | `moon indexcubo <domain>` | `$SOL_ROOT/data/<domain>/moonlist.json` |
| `gen.txt` | SOL logging / `preflight run` | `$SOL_ROOT/data/gen20.net/gen.txt` |
| `god.txt` | GOD operations | `$SOL_ROOT/data/gen20.net/god.txt` |
| `moon.txt` | MOON operations | `$SOL_ROOT/data/gen20.net/moon.txt` |
| `mars.txt` | MARS operations | `$SOL_ROOT/data/gen20.net/mars.txt` |
| `kronos.txt` | KRONOS operations | `$SOL_ROOT/data/gen20.net/kronos.txt` |

## 6. Runtime and environment

### History

SOL uses Bash history:

```bash
HISTFILE="${GEN_HISTORY:-${HOME}/.gen_history}"
HISTSIZE=5000
HISTFILESIZE=10000
```

Override the history file:

```bash
export GEN_HISTORY="$HOME/.gen20_history"
```

### Logging

The central log defaults to:

```text
$SOL_ROOT/data/gen20.net/gen.txt
```

Override it with:

```bash
export GEN_LOG_FILE="/path/to/gen.txt"
```

### Native Bash

SOL preserves normal Bash functionality:

```bash
ls
cd moon/gen20.net
find . -type f
grep -R "function" gaia/
```

Pipes, redirects, variables, loops, functions and Linux utilities remain available.

### Prompt

The prompt displays the current path relative to `SOL_ROOT`:

```text
gen>
moon/gen20.net gen>
```

### Tab completion

The source contains `_sol_complete()` in `__sol/__sol_complete.sh`. The inspected startup files do not show an explicit `complete -F _sol_complete` registration. Therefore, SOL-specific Tab completion should not be treated as verified in this revision.

## 7. Safety and operational notes

SOL commands are real system operations. They are not merely descriptive aliases.

- `moon domain` can create databases and modify Nginx and DNS configuration.
- `bigbang start` installs operating-system packages and requires root.
- `astra push*` and `astra pull*` copy or replace files. Existing files may be backed up or require confirmation.
- `user permit` recursively changes permissions and ownership.
- `repo push` currently uses `git push -u origin main --force`. This can overwrite remote history.
- `backup todo` contains duplicated backup logic and should be reviewed before use.
- `websocket` is a continuous publisher, not a one-shot command.

Never run an operational expression without understanding its side effects.

## 8. Current implementation notes

The following details are visible in the inspected source and should be treated as maintenance items:

1. `sol/README.md` previously referenced `sol/actions/` and `sol/gen`; the inspected implementation uses `sol/acta/` and `sol/gen.sh`.
2. `systems/bigbang.sh` references `$SOL_ROOT/sol/actions/bigbang_start.sh`, while the inspected script is located at `sol/acta/bigbang_start.sh`. `bigbang install` therefore has a path mismatch.
3. `astra.sh` lists `package` in its help text, but no corresponding `astra_package()` implementation was found in the inspected files.
4. Some system files perform top-level work when sourced, such as creating log directories or loading `.env`. The source-only principle is not consistently enforced yet.
5. The completion function exists, but its registration was not found in the inspected startup path.
6. `sol index` discovers functions in system files; it should not be assumed to be a complete catalogue of every standalone action script.

These are implementation observations, not claims that the corresponding fixes have been applied.

## 9. Source of truth

Repository:

https://github.com/NikDrosakis/gen20/tree/main/sol

Main files:

- [SOL README](https://github.com/NikDrosakis/gen20/blob/main/sol/README.md)
- [Runtime entry point](https://github.com/NikDrosakis/gen20/blob/main/sol/gen.sh)
- [Dispatcher](https://github.com/NikDrosakis/gen20/blob/main/sol/__sol/__sol_dispatch.sh)
- [Expression resolver](https://github.com/NikDrosakis/gen20/blob/main/sol/__sol/__sol_find_expression.sh)
- [Search directories](https://github.com/NikDrosakis/gen20/blob/main/sol/__sol/__sol_search_dirs.sh)
- [SOL system expressions](https://github.com/NikDrosakis/gen20/blob/main/sol/systems/sol.sh)
- [Language rules](https://github.com/NikDrosakis/gen20/blob/main/sol/rules.txt)

**Reviewed source revision:** `179f039f15bf6b1422d2c5379e334f742a9d345b`

---

**SOL — ACTA NON VERBA.**