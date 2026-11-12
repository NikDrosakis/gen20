#!/bin/bash
# onion_list.sh — λίστα με όλα τα Tor hidden services
# Χρήση: gen onion list

set -uo pipefail

TORRC="${TORRC:-/etc/tor/torrc}"

if ! command -v tor >/dev/null 2>&1; then
    printf '❌ Tor is not installed\n' >&2
    exit 1
fi

if [[ ! -f $TORRC ]]; then
    printf '❌ torrc not found: %s\n' "$TORRC" >&2
    exit 1
fi

if ! systemctl is-active --quiet tor 2>/dev/null; then
    printf '⚠️  Tor service is not active\n\n'
fi

printf '%-50s %-8s %s\n' ONION PORT SERVICE_DIR
printf '%s\n' '--------------------------------------------------------------------------------'

current_dir=""
count=0

while IFS= read -r line; do
    [[ $line =~ ^[[:space:]]*# ]] && continue
    [[ -z ${line//[[:space:]]/} ]] && continue

    if [[ $line =~ ^[[:space:]]*HiddenServiceDir[[:space:]]+(.+)$ ]]; then
        current_dir="${BASH_REMATCH[1]}"
        current_dir="${current_dir%/}"
        continue
    fi

    if [[ $line =~ ^[[:space:]]*HiddenServicePort[[:space:]]+([0-9]+)[[:space:]]+(.+)$ ]]; then
        local_port="${BASH_REMATCH[1]}"

        if [[ -n $current_dir ]]; then
            onion=""
            if [[ -f "$current_dir/hostname" ]]; then
                onion=$(tr -d '\n\r' < "$current_dir/hostname")
            fi

            if [[ -n $onion ]]; then
                printf '%-50s %-8s %s\n' "$onion" "$local_port" "$current_dir"
            else
                printf '%-50s %-8s %s\n' "(pending)" "$local_port" "$current_dir"
            fi

            count=$((count + 1))
            current_dir=""
        fi
    fi
done < "$TORRC"

printf '%s\n' '--------------------------------------------------------------------------------'
printf 'Total: %d hidden service(s)\n' "$count"