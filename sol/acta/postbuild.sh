#!/bin/bash
# sol/acta/postbuild.sh — post-build SEO artifacts for a moon domain.
# Εκτελείται από το rima/build.sh μετά από επιτυχημένο yarn build.
# Παράγει (από το content table με status=2):
#   - sitemap.xml / rss.xml / feed.xml / robots.txt
#   - og meta tags (social-share) → injected στο dist/index.html
#
# Usage: postbuild <domain> [maria_db]

postbuild() {
    local domain="${1:-}"
    local maria="${2:-}"
    [[ -z $domain ]] && { printf 'Usage: postbuild <domain> [maria_db]\n' >&2; return 1; }
    domain="${domain#moon/}"

    # Repo root (το .env ορίζει SOL_ROOT=/var/www/gs/sol — το επαναφέρουμε)
    local REPO_ROOT="${SOL_ROOT:-$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd -P)}"

    local env_file="$REPO_ROOT/.env"
    if [[ -f $env_file ]]; then
        set -a
        # shellcheck source=/dev/null
        source "$env_file"
        set +a
    fi
    SOL_ROOT="$REPO_ROOT"

    local DB_USER="${DB_USER:-root}"
    local DB_PASS="${DB_PASS:-}"
    local DB_HOST="${DB_HOST:-localhost}"
    local DB_ADMIN="${DB_ADMIN:-gen_admin}"

    # Resolve maria db name από gen_admin.domain (αν δεν δόθηκε)
    if [[ -z $maria ]] && command -v mariadb >/dev/null 2>&1; then
        maria=$(mariadb -N -B -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" -D "$DB_ADMIN" \
            -e "SELECT IFNULL(maria,'') FROM domain WHERE name='$domain' LIMIT 1;" 2>/dev/null)
    fi
    [[ -n $maria && $maria != NULL ]] || maria="gen_${domain//[.-]/}"

    local dist_dir="$SOL_ROOT/moon/$domain/dist"
    [[ -d $dist_dir ]] || { printf '❌ dist not found: %s\n' "$dist_dir" >&2; return 1; }

    # scheme: onion/localhost → http, αλλιώς https
    local scheme="https"
    [[ $domain == *.onion || $domain == localhost* ]] && scheme="http"
    local base="$scheme://$domain"

    xml_esc() {
        sed -e 's/&/\&amp;/g' -e 's/</\&lt;/g' -e 's/>/\&gt;/g' -e 's/"/\&quot;/g' -e "s/'/\&apos;/g"
    }
    strip_html() {
        sed -e 's/<[^>]*>//g'
    }
    img_url() {
        local im="$1"
        [[ -z $im ]] && { printf '%s/assets/default-og.jpg' "$base"; return; }
        [[ $im == http* ]] && { printf '%s' "$im"; return; }
        printf '%s/media/%s' "$base" "$im"
    }

    # ------------------------------------------------------------
    # Fetch posts/pages (status=2) + classification name
    # ------------------------------------------------------------
    local rows=""
    if command -v mariadb >/dev/null 2>&1; then
        rows=$(mariadb -N -B -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" -D "$maria" \
            -e "SELECT CONCAT_WS(CHAR(1), c.name, c.title, IFNULL(c.excerpt,''), IFNULL(c.description,''), IFNULL(c.img,''), c.type, IFNULL(c.published,''), IFNULL(ct.name,''))
                FROM content c
                LEFT JOIN classification ct ON c.classificationid = ct.id
                WHERE c.status=2 AND c.type IN ('post','page')
                ORDER BY c.published DESC, c.id DESC;" 2>/dev/null)
    fi

    local posts=()
    local pages=()
    if [[ -n $rows ]]; then
        while IFS=$'\x01' read -r name title excerpt description img type published cat; do
            [[ -n $name ]] || continue
            local loc
            if [[ $type == page ]]; then
                loc="/$name"
            else
                loc="/${cat:-post}/$name"
            fi
            local entry="$name|$title|$excerpt|$description|$img|$published|$loc"
            [[ $type == page ]] && pages+=("$entry") || posts+=("$entry")
        done <<< "$rows"
    fi

    local today
    today=$(date +%F)

    # ------------------------------------------------------------
    # 1. sitemap.xml
    # ------------------------------------------------------------
    {
        printf '<?xml version="1.0" encoding="UTF-8"?>\n'
        printf '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        printf '  <url><loc>%s/</loc><lastmod>%s</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>\n' "$base" "$today"

        local e name title excerpt description img published loc lm
        for e in "${posts[@]}"; do
            IFS='|' read -r name title excerpt description img published loc <<< "$e"
            lm="${published%% *}"
            [[ -z $lm ]] && lm="$today"
            printf '  <url><loc>%s%s</loc><lastmod>%s</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n' "$base" "$loc" "$lm"
        done

        for e in "${pages[@]}"; do
            IFS='|' read -r name title excerpt description img published loc <<< "$e"
            lm="${published%% *}"
            [[ -z $lm ]] && lm="$today"
            printf '  <url><loc>%s%s</loc><lastmod>%s</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n' "$base" "$loc" "$lm"
        done

        printf '</urlset>\n'
    } > "$dist_dir/sitemap.xml"

    # ------------------------------------------------------------
    # 2. rss.xml / feed.xml
    # ------------------------------------------------------------
    {
        printf '<?xml version="1.0" encoding="UTF-8"?>\n'
        printf '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n'
        printf '  <channel>\n'
        printf '    <title>%s</title>\n' "$(printf '%s' "$domain" | xml_esc)"
        printf '    <link>%s</link>\n' "$base"
        printf '    <description>%s</description>\n' "$(printf '%s' "$domain" | xml_esc)"
        printf '    <atom:link href="%s/rss.xml" rel="self" type="application/rss+xml" />\n' "$base"
        printf '    <lastBuildDate>%s</lastBuildDate>\n' "$(date -R)"

        local i=0 t x
        for e in "${posts[@]}"; do
            [[ $i -ge 20 ]] && break
            IFS='|' read -r name title excerpt description img published loc <<< "$e"
            t=$(printf '%s' "${title:-$name}" | xml_esc)
            x=$(printf '%s' "${excerpt:-${description:-}}" | xml_esc)
            printf '    <item>\n'
            printf '      <title><![CDATA[%s]]></title>\n' "$t"
            printf '      <link>%s%s</link>\n' "$base" "$loc"
            printf '      <guid isPermaLink="true">%s%s</guid>\n' "$base" "$loc"
            printf '      <description><![CDATA[%s]]></description>\n' "$x"
            if [[ -n $img ]]; then
                printf '      <enclosure url="%s" type="image/jpeg" />\n' "$(img_url "$img")"
            fi
            printf '      <pubDate>%s</pubDate>\n' "$(date -d "$published" -R 2>/dev/null || date -R)"
            printf '    </item>\n'
            i=$((i+1))
        done

        printf '  </channel>\n'
        printf '</rss>\n'
    } > "$dist_dir/rss.xml"
    cp "$dist_dir/rss.xml" "$dist_dir/feed.xml"

    # ------------------------------------------------------------
    # 3. robots.txt
    # ------------------------------------------------------------
    cat > "$dist_dir/robots.txt" <<EOF
User-agent: *
Allow: /
Sitemap: $base/sitemap.xml

Disallow: /api/
Disallow: /admin/
Disallow: /login
Disallow: /signup

Crawl-delay: 1
Host: $base
EOF

    # ------------------------------------------------------------
    # 4. og meta tags → injected στο dist/index.html
    # ------------------------------------------------------------
    local og_title="" og_desc="" og_img
    og_img="$base/assets/default-og.jpg"
    if command -v mariadb >/dev/null 2>&1; then
        og_title=$(mariadb -N -B -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" -D "$maria" \
            -e "SELECT val FROM settings WHERE name='title' LIMIT 1;" 2>/dev/null)
        og_desc=$(mariadb -N -B -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" -D "$maria" \
            -e "SELECT val FROM settings WHERE name='seodescription' LIMIT 1;" 2>/dev/null)
    fi
    [[ -n $og_title && $og_title != NULL ]] || og_title="$domain"
    [[ -n $og_desc && $og_desc != NULL ]] || og_desc=""
    og_desc=$(printf '%s' "$og_desc" | strip_html | cut -c1-160)

    if [[ -f "$dist_dir/index.html" ]]; then
        local og_title_e og_desc_e og_block
        og_title_e=$(printf '%s' "$og_title" | xml_esc)
        og_desc_e=$(printf '%s' "$og_desc" | xml_esc)
        og_block="  <meta property=\"og:title\" content=\"$og_title_e\" />
  <meta property=\"og:description\" content=\"$og_desc_e\" />
  <meta property=\"og:image\" content=\"$og_img\" />
  <meta property=\"og:url\" content=\"$base/\" />
  <meta property=\"og:type\" content=\"website\" />
  <meta name=\"twitter:card\" content=\"summary_large_image\" />"
        python3 - "$dist_dir/index.html" "$og_block" <<'PYEOF'
import sys
html_path, block = sys.argv[1], sys.argv[2]
html = open(html_path).read()
html = html.replace("</head>", block + "\n  </head>", 1)
open(html_path, "w").write(html)
PYEOF
        rm -f "$dist_dir/headify.config.js"
    fi

    printf '✅ postbuild: %s → sitemap.xml, rss.xml, feed.xml, robots.txt, og meta (%d posts, %d pages)\n' \
        "$domain" "${#posts[@]}" "${#pages[@]}"
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    postbuild "$@"
fi
