# SOL — GEN20 Domain Language

SOL is the command language and execution environment of GEN20. It gives the platform one shared command surface for systems, actions and filesystem operations.

The current implementation is **Bash-native**: Bash remains the real shell and execution engine. SOL adds domain-expression discovery, dispatch, command completion and a growing GEN20 vocabulary. It does not replace Linux commands or remove native Bash syntax.

## Start

```bash
chmod +x sol/gen
./sol/gen
```

The interactive prompt is `gen>`. Use `help` for the short grammar, or:

```bash
gen> sol esti
gen> sol index
gen> sol menu
```

## Language surface

The current command form is:

```text
<noun> <rima> [arguments...]
<noun> [arguments...]
<native Bash command>
```

Examples:

```bash
gen> god status
gen> moon list
gen> astra pullcubo Hello gen20.net
gen> find . -type f -name '*.php' | grep api
```

- A **noun** selects a system or action.
- A **rima** selects the operation.
- Arguments are passed to the selected operation.
- `esti` is the conventional default expression for inspecting a system.
- An underscore in a filename/function name separates language words: `astra_pullcubo` maps to `astra pullcubo`.
- Tab completion discovers available nouns and expressions. Native Bash completion remains available.
- Enter executes. Ctrl-D exits the interactive shell.

## Resolution and execution

The dispatcher resolves an expression in this order:

1. `<noun>_<rima>.sh` — execute the matching action script.
2. `<noun>.sh` containing `<noun>_<rima>()` — load the file and call the function.
3. `<noun>.sh` — resolve a noun-only command.
4. Native Bash command — pass the command to Bash/Linux.
5. Otherwise, return command-not-found.

Expression files are loaded on demand and cached for the current shell. System files should be **source-only**: define functions and helpers, but do not perform operational work merely because the file is sourced. Keep execution inside the selected expression.

## Filesystem conventions

SOL discovers command files from the active SOL tree:

- `sol/systems/` — system-level command surfaces and grouped functions.
- `sol/acta/` — standalone actions, including multiword actions such as `astra_pullcubo.sh`.
- `sol/rima/` — language verbs and shared expression behavior.
- `sol/prothesis/` — language prefixes and expression preparation.

Nested command files are supported within the resolver's search depth. The filesystem is the command catalogue: no separate manual registration is required for ordinary expressions.

## Main system vocabulary

Examples from the current tree:

| System | Expressions |
|---|---|
| `sol` | `esti`, `status`, `index`, `menu`, `help` |
| `god` | `esti`, `start`, `stop`, `restart`, `status` |
| `moon` | `list`, `fs`, `db`, `nginx`, `dns`, `ssl`, `domain`, `localhost`, `tor` |
| `astra` | `esti`, `list`, `tree`, `migrate`, `pullcubo`, `pushcubo`, `pullroot`, `pushroot`, `pullapp`, `pushapp` |
| `kronos` | `esti`, `start`, `status`, `run`, `init` |
| `mars` | `esti`, `start`, `status`, `run`, `install` |
| `opus` | `esti`, `neo`, `sose`, `install`, `list`, `scan`, `monitor` |

Use `sol index` and `sol menu` for the live command view. The table above is an orientation, not a replacement for filesystem discovery.

## Non-interactive execution

The same expressions can be called from scripts, services and other processes:

```bash
gen god status
gen astra pullcubo Hello gen20.net
gen -c 'find . -type f | sort'
```

`gen -c` evaluates a Bash command string. Treat it as a trusted local-shell interface, not as a safe way to execute untrusted input.

## Native Bash compatibility

SOL deliberately preserves the normal Bash environment:

- Linux utilities and shell built-ins.
- Pipes, redirects and command chaining.
- Variables, functions, loops and aliases.
- Native command completion and shell history.

History is stored in `~/.gen_history`, unless `GEN_HISTORY` overrides it.

## Design rules

- Systems own their domain behavior; the dispatcher stays generic.
- Prefer one expression per function or action file, with clear noun/verb names.
- Keep source-time loading free of side effects.
- Keep files small and focused; prefer DRY code without hiding useful behavior.
- Reuse existing implementations where appropriate; inspect `sol/old/` before rebuilding retired behavior.
- Preserve native Bash as an escape hatch.

## Current boundary and next language layer

SOL currently provides a filesystem-backed command language over Bash. It is not yet a fully independent parser/runtime. The next steps are to formalize the grammar and argument model, unify command metadata and indexing, improve structured errors and tests, and expose the same validated command interface to external clients such as Moon through GOD messaging.

The intended architecture is one SOL executor with multiple clients: terminal, Moon UI and automation. Clients submit a command; SOL resolves and executes it. GOD is the authenticated transport and policy boundary, not a second command interpreter.
