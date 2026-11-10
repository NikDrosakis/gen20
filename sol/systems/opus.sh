# OPUS — Cubos discovery, inspection and composition preview. Read-only.
opus_about(){ printf '%s\n' 'OPUS | Cubos discovery, inspection and composition'; }
opus_root(){ printf '%s\n' "${OPUS_CUBOS:-${SOL_ROOT:-.}/moon/admin/src/cubos}"; }
opus_neo(){
  local root; root=$(opus_root)
  printf 'OPUS DISCOVERY\nroot: %s\n' "$root"
  [[ -d $root ]] || { printf 'Cubos directory not found.\n'; return 1; }
  find "$root" -type f \( -name manifest.json -o -name package.json -o -name '*.cubo.json' \) -print | sort
}
opus_inspect(){
  local target=${1:-} root
  [[ -n $target ]] || { printf 'Usage: opus inspect <path>\n' >&2; return 2; }
  root=$(opus_root)
  [[ -f $target ]] || target=$root/$target
  [[ -f $target ]] || { printf 'OPUS: not found: %s\n' "$target" >&2; return 1; }
  printf 'INSPECT: %s\n' "$target"
  case "$target" in
    *.json) if command -v jq >/dev/null; then jq . "$target"; else cat "$target"; fi ;;
    *) sed -n '1,160p' "$target" ;;
  esac
}
opus_compose(){
  local root; root=$(opus_root)
  printf 'COMPOSITION PREVIEW\nCubos root: %s\n' "$root"
  printf 'Read-only: no files will be changed.\n'
  [[ -d $root ]] || { printf 'Cubos directory not found.\n'; return 1; }
  find "$root" -type f \( -name manifest.json -o -name '*.cubo.json' \) -print | sort |
    while IFS= read -r f; do printf '  + %s\n' "${f#"$root"/}"; done
  printf 'Next: dependency resolution and ASTRA package plan.\n'
}
opus_help(){ printf 'OPUS: neo | inspect <path> | compose\n'; }
opus_esti(){ opus_help; }
