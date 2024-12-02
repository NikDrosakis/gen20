<?php
namespace Core;

trait SEO {
    protected string $xml;
    protected int $refresh_time = 5;
    private float $priority;
    protected $xmls=['rss','atom','sitemap'];
    protected $rData;
    protected $langs;

protected function seoPosts(){
return $this->db->fa("SELECT post.title,post.subtitle,post.uri,post.excerpt,post.modified,tax.name as taxname from post left join tax on tax.id=post.taxid  WHERE post.status=2");
}

protected function seoUsers(){
return $this->db->fa("SELECT user.name,user.bio,user.modified,user.fullname,user.url from user");
}

protected function buildMeta(){
return '
       <meta http-equiv="Content-type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="copyright" content="Nik Drosakis">
    <meta name="googlebot" content="all">
    <meta http-equiv="name" content="value">
    <meta name="ROBOTS" CONTENT="NOARCHIVE">
    <meta name="google" content="notranslate">
    <meta name="robots" content="noindex">
';
}

protected function getSEOData($contentType, $contentId) {
    $query = "SELECT seo_priority, seo_description FROM seo_metadata WHERE content_type = :type AND content_id = :id";
    $stmt = $this->db->fa($query);

    // Return default if no custom SEO data exists
    if (!$seoData) {
        return ['seo_priority' => 0.5, 'seo_description' => null];
    }
    return $seoData;
}
    /**
     * Generate an XML sitemap.
     */
    protected function sitemap(): string {
        $sitemap = '<?xml version="1.0" encoding="UTF-8"?>';
        $sitemap .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ';
        $sitemap .= 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ';
        $sitemap .= 'xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">';

        // Root URL
        $sitemap .= '<url><loc>' . htmlspecialchars(SITE_URL, ENT_XML1, 'UTF-8') . '</loc>';
        $sitemap .= '<lastmod>' . date('Y-m-d\TH:i:s\Z') . '</lastmod>';
        $sitemap .= '<changefreq>daily</changefreq>';
        $sitemap .= '<priority>1.0</priority></url>';

        // Posts
        foreach ($this->seoPosts() as $post) {
            $sitemap .= '<url><loc>' . htmlspecialchars($post["uri"], ENT_XML1, 'UTF-8') . '</loc>';
            $sitemap .= '<lastmod>' . date('Y-m-d\TH:i:s\Z', $post["modified"]) . '</lastmod>';
            $sitemap .= '<changefreq>daily</changefreq>';
            $sitemap .= '<priority>' . $post['seopriority'] . '</priority></url>';
        }

        // Users
        foreach ($this->seoUsers() as $user) {
            $sitemap .= '<url><loc>' . htmlspecialchars($user["url"], ENT_XML1, 'UTF-8') . '</loc>';
            $sitemap .= '<lastmod>' . date('Y-m-d\TH:i:s\Z', $user["modified"]) . '</lastmod>';
            $sitemap .= '<changefreq>daily</changefreq>';
            $sitemap .= '<priority>' . $user['seopriority'] . '</priority></url>';
        }

        $sitemap .= '</urlset>';
        return $sitemap;
    }

    /**
     * Generate an ATOM feed.
     */
    protected function atom(): string {
        $atom = '<?xml version="1.0" encoding="UTF-8"?>';
        $atom .= '<feed xmlns="http://www.w3.org/2005/Atom">';
        $atom .= '<title>' . htmlspecialchars($this->G['is']["title"], ENT_XML1, 'UTF-8') . ' Feed</title>';
        $atom .= '<subtitle>This is subtitle Feed</subtitle>';
        $atom .= '<link href="' . htmlspecialchars(SITE_URL . '/feed/', ENT_XML1, 'UTF-8') . '" rel="self" />';
        $atom .= '<link href="' . htmlspecialchars(SITE_URL, ENT_XML1, 'UTF-8') . '" />';
        $atom .= '<id>urn:uuid:60a76c80-d399-11d9-b91C-0003939e0af6</id>';
        $atom .= '<updated>' . date('Y-m-d\TH:i:s\Z') . '</updated>';

        // Posts
        foreach ($this->seoPosts() as $post) {
            $atom .= '<entry>';
            $atom .= '<title>' . htmlspecialchars($post["title"], ENT_XML1, 'UTF-8') . '</title>';
            $atom .= '<link href="' . htmlspecialchars(SITE_URL . $post["uri"], ENT_XML1, 'UTF-8') . '" />';
            $atom .= '<updated>' . date('Y-m-d\TH:i:s\Z', $post["modified"]) . '</updated>';
            $atom .= '<summary>' . htmlspecialchars($post["excerpt"], ENT_XML1, 'UTF-8') . '</summary>';
            $atom .= '<content type="xhtml" xml:lang="el">';
            $atom .= '<div xmlns="http://www.w3.org/1999/xhtml">' . htmlspecialchars(json_decode($post["taxname"], true), ENT_XML1, 'UTF-8') . '</div>';
            $atom .= '</content></entry>';
        }

        // Users
        foreach ($this->seoUsers() as $user) {
            $atom .= '<entry>';
            $atom .= '<title>' . htmlspecialchars($user["name"], ENT_XML1, 'UTF-8') . '</title>';
            $atom .= '<link href="' . htmlspecialchars(SITE_URL . $user["uri"], ENT_XML1, 'UTF-8') . '" />';
            $atom .= '<updated>' . date('Y-m-d\TH:i:s\Z', $user["modified"]) . '</updated>';
            $atom .= '<summary>' . htmlspecialchars($user["fullname"], ENT_XML1, 'UTF-8') . '</summary>';
            $atom .= '<content type="xhtml" xml:lang="el"></content></entry>';
        }

        $atom .= '</feed>';
        return $atom;
    }

    /**
     * Generate an RSS feed.
     */
    protected function rss(): string {
        $rss = '<?xml version="1.0" encoding="UTF-8"?>';
        $rss .= '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">';
        $rss .= '<channel>';
        $rss .= '<title>' . htmlspecialchars($this->G['is']["title"], ENT_XML1, 'UTF-8') . '</title>';
        $rss .= '<link>' . htmlspecialchars(SITE_URL, ENT_XML1, 'UTF-8') . '</link>';
        $rss .= '<description>' . htmlspecialchars($this->G['is']["description"], ENT_XML1, 'UTF-8') . '</description>';

        // Posts
        foreach ($this->seoPosts() as $post) {
            $rss .= '<item>';
            $rss .= '<title>' . htmlspecialchars($post["title"], ENT_XML1, 'UTF-8') . '</title>';
            $rss .= '<link>' . htmlspecialchars(SITE_URL . $post["uri"], ENT_XML1, 'UTF-8') . '</link>';
            $rss .= '<description>' . htmlspecialchars($post["excerpt"], ENT_XML1, 'UTF-8') . '</description>';
            $rss .= '</item>';
        }

        // Users
        foreach ($this->seoUsers() as $user) {
            $rss .= '<item>';
            $rss .= '<title>' . htmlspecialchars($user["name"], ENT_XML1, 'UTF-8') . '</title>';
            $rss .= '<link>' . htmlspecialchars(SITE_URL . $user["uri"], ENT_XML1, 'UTF-8') . '</link>';
            $rss .= '<description>' . htmlspecialchars($user["bio"], ENT_XML1, 'UTF-8') . '</description>';
            $rss .= '</item>';
        }

        $rss .= '<atom:link href="' . htmlspecialchars(SITE_URL . 'rss.xml', ENT_XML1, 'UTF-8') . '" rel="self" type="application/rss+xml" />';
        $rss .= '</channel></rss>';

        return $rss;
    }

    /**
     * Create XML file for sitemap, atom, or RSS.
     */
    protected function create_xml(string $file): void {
        $xmlContent = $this->$file();
        file_put_contents(SITE_ROOT . $file . '.xml', $xmlContent);
        chmod(SITE_ROOT . $file . '.xml', 0777);
    }

    /**
     * Clean up data for XML encoding.
     */
    protected function clean(string $data): string {
        return str_replace('&', '-', $data);
    }
}
