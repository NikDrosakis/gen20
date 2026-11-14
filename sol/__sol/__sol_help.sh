
# --------------------------------------------------
# HELP
# --------------------------------------------------

__sol_help() {
    cat <<'SOLHELP'
SOL language environment

  <system> esti [args...]      inspect a system
  <system> <verb> [args...]    execute a system expression
  <native Bash command>       execute Bash/Linux directly

Examples:

  god esti
  gaia esti
  moon esti
  preflight run
  preflight latest
  preflight history
  find . -type f -name '*.php' | grep api
  opus neo

Tab completes SOL expressions and falls back to native Bash completion.
Enter executes. Ctrl-D exits.

Native Bash syntax remains available.
SOLHELP
}