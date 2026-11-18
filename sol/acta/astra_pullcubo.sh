#!/bin/bash
# astra_scancubo.sh — σαρώνει τα .jsx των cubos και γράφει params στο astralist.json
#
# Χρήση:
#   source astra_scancubo.sh && astra_scancubo [cubo ...] [--dry]
#   ./astra_scancubo.sh [cubo ...] [--dry]
#
# Απαιτεί: awk, jq, sha1sum

# ── Default paths ──
SOL_ROOT="${SOL_ROOT:-/var/www/gs}"
ASTRA_DIR="${ASTRA_DIR:-$SOL_ROOT/astra}"
CUBOS_DIR="${CUBOS_DIR:-$ASTRA_DIR/cubos}"
ASTRALIST="${ASTRALIST:-$SOL_ROOT/data/astralist.json}"

# ── Scanner για .jsx (awk) ──
_scan_jsx_params() {
    local file="$1"
    awk '
    function trim(x) { gsub(/^[ \t]+|[ \t]+$/, "", x); return x }

    function emit(item,   i,c,d,q,eq,k,v,def) {
        item = trim(item)
        if (item == "" || substr(item,1,3) == "...") return
        d=0; q=""; eq=0
        for (i=1; i<=length(item); i++) {
            c = substr(item,i,1)
            if (q != "") { if (c == "\\") i++; else if (c == q) q=""; continue }
            if (c == "\047" || c == "\"" || c == "`") { q=c; continue }
            if (c == "{" || c == "[" || c == "(") d++
            else if (c == "}" || c == "]" || c == ")") d--
            else if (c == "=" && d == 0) { eq=i; break }
        }
        if (eq) { k=trim(substr(item,1,eq-1)); v=trim(substr(item,eq+1)) }
        else { k=item; v="" }
        sub(/[ ]*:.*/, "", k)

        # Infer type
        if (v == "") def = "text"
        else if (v == "true" || v == "false") def = "checkbox:" v
        else if (v ~ /^-?[0-9]+(\.[0-9]+)?$/) def = "number:" v
        else if (substr(v,1,1) == "\047" || substr(v,1,1) == "\"" || substr(v,1,1) == "`") def = "text:" v
        else if (substr(v,1,1) == "{") def = "object"
        else if (substr(v,1,1) == "[") def = "list"
        else def = "text"

        print k "\t" def
    }

    BEGIN { RS="\001" }
    {
        s = $0
        gsub(/\r/, "", s)
        gsub(/\n[ \t]*\/\/[^\n]*/, "\n", s)
        gsub(/\n/, " ", s)

        p = 0
        if (match(s, /export[ ]+default[ ]+(async[ ]+)?function[ ]*[A-Za-z0-9_]*[ ]*\(/)) {
            p = RSTART + RLENGTH - 1
        } else if (match(s, /export[ ]+default[ ]+\(/)) {
            p = RSTART + RLENGTH - 1
        } else if (match(s, /export[ ]+function[ ]+[A-Z][A-Za-z0-9_]*[ ]*\(/)) {
            p = RSTART + RLENGTH - 1
        }
        if (!p) exit

        i = p + 1
        while (substr(s,i,1) == " ") i++
        if (substr(s,i,1) != "{") exit

        depth = 0
        item = ""
        q = ""
        for (i=i+1; i<=length(s); i++) {
            c = substr(s,i,1)
            if (q != "") {
                item = item c
                if (c == "\\") { i++; item = item substr(s,i,1) }
                else if (c == q) q = ""
                continue
            }
            if (c == "\047" || c == "\"" || c == "`") { q=c; item=item c; continue }
            if (c == "{" || c == "[" || c == "(") depth++
            if (c == "}" || c == "]" || c == ")") {
                if (depth == 0) break
                depth--
            }
            if (c == "," && depth == 0) { emit(item); item=""; continue }
            item = item c
        }
        emit(item)
    }
    ' "$file" | jq -R -s '
        split("\n") | map(select(length > 0)) | map(
            split("\t") |
            {key: .[0], def: (.[1] // "text")} |
            . as $x |
            if ($x.def | startswith("checkbox:")) then
                {($x.key): {type: "checkbox", default: ($x.def | sub("checkbox:"; "") | . == "true")}}
            elif ($x.def | startswith("number:")) then
                {($x.key): {type: "number", default: ($x.def | sub("number:"; "") | tonumber)}}
            elif ($x.def | startswith("text:")) then
                {($x.key): {type: "text", default: ($x.def | sub("text:"; "") | gsub("^[\047\042`]|[\047\042`]$"; ""))}}
            elif $x.def == "object" then
                {($x.key): {type: "object", default: {}}}
            elif $x.def == "list" then
                {($x.key): {type: "list", default: []}}
            else
                {($x.key): {type: "text", required: true}}
            end
        ) | add // {}
    '
}

# ── Κύρια συνάρτηση ──
astra_scancubo() {
    local dry=0
    local only=()
    local a
    for a in "$@"; do
        case $a in
            --dry) dry=1 ;;
            -*) ;;
            *) only+=("$a") ;;
        esac
    done

    if [[ ! -f "$ASTRALIST" ]]; then
        echo "❌ ASTRALIST not found: $ASTRALIST" >&2
        return 1
    fi
    if [[ ! -d "$CUBOS_DIR" ]]; then
        echo "❌ CUBOS_DIR not found: $CUBOS_DIR" >&2
        return 1
    fi

    local reg
    reg=$(cat "$ASTRALIST") || { echo "❌ Cannot read $ASTRALIST" >&2; return 1; }

    local total=0 changed=0
    local d n f main params hash old_hash old_ver new_ver note np

    for d in "$CUBOS_DIR"/*/; do
        n=$(basename "$d")
        if (( ${#only[@]} )); then
            [[ " ${only[*]} " == *" $n "* ]] || continue
        fi
        total=$((total+1))

        # Βρες το κύριο .jsx
        main=""
        for f in "$d$n.jsx" "$d"*.jsx; do
            [[ -f "$f" ]] && { main="$f"; break; }
        done

        # Hash φακέλου
        hash=$(cd "$d" && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha1sum | sha1sum | cut -c1-12)

        # Παλιά κατάσταση
        old_hash=$(jq -r --arg n "$n" '.cubos[] | select(.name==$n) | .hash // ""' <<<"$reg")
        old_ver=$(jq -r --arg n "$n" '.cubos[] | select(.name==$n) | .version // "1.0"' <<<"$reg")
        new_ver="$old_ver"
        note="ok"

        if [[ -n "$old_hash" && "$old_hash" != "$hash" ]]; then
            new_ver=$(awk -v v="$old_ver" 'BEGIN{printf "%.1f", v+0.1}')
            note="changed"
            changed=$((changed+1))
        fi

        # Scan params
        if [[ -n "$main" ]]; then
            params=$(_scan_jsx_params "$main")
        else
            params="null"
            note="no jsx (params untouched)"
        fi

        # Ενημέρωση astralist.json
        reg=$(jq --arg n "$n" --arg h "$hash" --arg v "$new_ver" --argjson p "$params" '
            if (.cubos | map(.name) | index($n)) != null then
                .cubos = (.cubos | map(
                    if .name == $n then
                        . + {hash: $h, version: $v}
                        + (if $p != null then {params: $p} else {} end)
                    else . end
                ))
            else
                .cubos += [{name: $n, hash: $h, version: $v, params: ($p // {})}]
            end
        ' <<<"$reg")

        np=$(jq -r --arg n "$n" '.cubos[] | select(.name==$n) | .params // {} | length' <<<"$reg")
        printf '✓ %-18s %2s params  v%-4s %s\n' "$n" "$np" "$new_ver" "$note"
    done

    if (( dry )); then
        echo "($total cubos, $changed changed, dry: δεν γράφτηκε τίποτα)"
        return 0
    fi

    # Ατομική εγγραφή
    printf '%s\n' "$reg" | jq . > "$ASTRALIST.tmp" && mv "$ASTRALIST.tmp" "$ASTRALIST"
    echo "($total cubos, $changed changed -> $ASTRALIST)"
}

# ── Αν τρέχει αυτόνομα (όχι με source), κάλεσε τη συνάρτηση ──
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    astra_scancubo "$@"
    exit $?
fi