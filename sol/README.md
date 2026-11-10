# SOL

SOL is the GEN20 domain language and interactive operating environment.

The first foundation keeps Bash as the actual interactive shell. SOL adds a domain-expression dispatcher and completion layer without replacing Linux utilities, Bash syntax, pipes, redirects, variables, functions, loops, aliases, or the user's normal Bash environment.

## Start

```bash
chmod +x sol/gen
./sol/gen
```

The prompt is `gen>`. Type `help` for the initial grammar.

## Initial grammar

```text
<system> esti [args...]
<system> <verb> [args...]
<native Bash command>
```

Examples:

```bash
gen> sol esti
gen> find . -type f -name '*.php' | grep api
gen> opus esti
```

`esti` is the default expression when a system is entered without a verb.

## Expression files

An expression is represented by one file. Its functions use the name of the expression as a prefix:

```bash
# sol/systems/god.sh
god_esti() { ... }
god_start() { ... }
god_stop() { ... }
god_restart() { ... }
```

The file is loaded only when its expression is called. Expression files must define functions only; they must not execute work at source time.

SOL discovers expressions from:

- `sol/systems/`
- `sol/actions/`
- `sol/opus/`

Nested files are supported for system families. No separate menu catalogue or registration call is used.

## Completion

Tab discovers expression names and their verbs from the filesystem and function definitions. If SOL has no completion for a token, Bash's normal completion remains available. The system Bash completion package is loaded when installed.

## Execution model

- Interactive mode is a real Bash shell with the prompt `gen>`.
- Native Bash commands execute natively in the same session.
- Unknown command names are checked against SOL expressions.
- `gen <expression> <verb>` supports direct, non-interactive execution.
- `gen -c '<bash expression>'` executes a Bash command string.
- History is stored in `~/.gen_history` unless `GEN_HISTORY` overrides it.

This is the first language/tool foundation, not the final SOL grammar. Glossary semantics, richer parsing, context-aware composition, and AI assistance are subsequent layers.
