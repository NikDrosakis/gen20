# SOL Step 2 — SUN integration

This package reconstructs the uncommitted Step 2 design. It is not a byte-for-byte
recovery of the original uncommitted Git blobs.

Copy `systems/*.sh` into the existing `sol/systems/` directory. The existing
`sol/gen` runtime already discovers system files and dispatches `<system>_<verb>`
functions. Source `sun.sh` after SOL runtime initialization, then run `sun` or
`sun esti` from the SOL prompt.

Three zones: STATUS, `gen>` command line, AVAILABLE. `subject_menu()` dynamically
builds the glossary from discovered system files and their `*_about` functions.
No hardcoded registry, database, SQLite, Redis, Python or Node dependency.

OPUS supports `neo` discovery, `inspect <path>`, and `compose` preview. Preview
is read-only. Installation and mutation are deliberately not included in Step 2.

Each adapter is function-only and compact. Add a new `<name>.sh` file and define
`<name>_about`, `<name>_esti`, and its verbs. SUN discovers it automatically.
