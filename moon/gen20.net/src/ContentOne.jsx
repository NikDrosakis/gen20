//  /ContentOne.jsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Cookies from "js-cookie";
import { useG } from "./GContext";
import "./ContentOne.css";
const publicdb = "gen_" + window.location.hostname.replace(/\./g, "");

const FALLBACK = {
    site_name: window.location.hostname,
    routes: { home: "/", blog: "/blog", post: "/post", contact: "/contact" },
    assets: { hero: "/assets/hero.png", avatar: "/assets/default-avatar.png" },
    media: { blog: "/media/blog", default_og: "/default-og-image.jpg" },
    i18n: {
        loading: "Loading...",
        not_found_title: "Article Not Found",
        back_to_blog: "← Back to Blog",
        back_to_articles: "Back to all articles",
        home: "Home",
        blog: "Blog",
        article: "Article",
        read_more: "Read more →",
        related_title: "📖 You might also like",
        min_read: "min read",
        views: "views",
        recent: "Recent",
    },
};

const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/'/g, "''");

// Manifest: { "contentOne": { "id": 42, "seo": false } }
// Χωρίς id, το name διαβάζεται από το τελευταίο τμήμα του uri (/post/το-όνομα)
export default function ContentOne({
                                       id,
                                       name: nameProp,
                                       initialContent,
                                       allPosts = [],
                                       lang: langProp,
                                       seo = true,
                                   }) {
    const { pathname } = useLocation();
    const name = nameProp || (id ? null : pathname.split("/").filter(Boolean).pop());
    const firstLevelName = pathname.split("/").filter(Boolean)[0] || "";

    const { G } = useG();

    const siteName = G?.site_name || G?.siteName || FALLBACK.site_name;
    const routes = {
        home: G?.routes?.home || FALLBACK.routes.home,
        blog: G?.routes?.blog || FALLBACK.routes.blog,
        post: G?.routes?.post || FALLBACK.routes.post,
    };
    const assets = {
        hero: G?.assets?.hero || FALLBACK.assets.hero,
        avatar: G?.assets?.avatar || FALLBACK.assets.avatar,
    };
    const mediaBase = G?.media?.blog || FALLBACK.media.blog;
    const defaultOgImage = G?.media?.default_og || FALLBACK.media.default_og;

    const [language, setLanguage] = useState(langProp || G?.lang || Cookies.get("lang") || "el");

    const t = (key) => {
        const langPack = G?.i18n?.[language] || G?.i18n || {};
        return langPack[key] || FALLBACK.i18n[key] || key;
    };

    const [content, setContent] = useState(initialContent || null);
    const [loading, setLoading] = useState(!initialContent);
    const [error, setError] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);

    useEffect(() => {
        Cookies.set("lang", language, { path: "/" });
    }, [language]);

    // --------------------------------------------------
    // FETCH RELATED
    // --------------------------------------------------
    const fetchRelatedPosts = async (classificationid, currentName) => {
        if (allPosts.length > 0) {
            const related = allPosts
                .filter((p) => p?.classificationid === classificationid && p?.name !== currentName)
                .slice(0, 3);
            if (related.length > 0) {
                setRelatedPosts(related);
                return;
            }
        }

        try {
            const query = `SELECT c.id, c.name, c.title, c.excerpt, c.img,
                                  u.img as author_img, c.created, ct.title as category_title
                           FROM ${publicdb}.content c
                                LEFT JOIN ${publicdb}.classification ct ON c.classificationid = ct.id
                                LEFT JOIN ${publicdb}.user u ON c.userid = u.id
                           WHERE c.classificationid = ${parseInt(classificationid, 10)}
                             AND c.name != '${esc(currentName)}'
                             AND c.status = 1
                             AND c.type = 'post'
                           LIMIT 3`;

            const res = await fetch(`/api/v1/maria/fa?query=${encodeURIComponent(query)}`);
            if (!res.ok) return;
            const data = await res.json();
            setRelatedPosts(data.success && data.data ? data.data : Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("[ContentOne] related posts error:", err);
        }
    };

    // --------------------------------------------------
    // FETCH CONTENT (με id ή με name)
    // --------------------------------------------------
    const fetchContent = async () => {
        setLoading(true);
        setError(null);

        try {
            const where = id
                ? `c.id = ${parseInt(id, 10)}`
                : `c.name = '${esc(name)}'`;

            const query = `SELECT c.id, c.name, c.title, c.excerpt, c.description,
                                  c.classificationid, c.userid, c.img, c.created,
                                  c.view_count, c.status, c.liking,
                                  u.name as author_name, u.firstname as author_firstname,
                                  u.lastname as author_lastname, u.img as author_img,
                                  ct.title as category_title
                           FROM ${publicdb}.content c
                                LEFT JOIN ${publicdb}.user u ON c.userid = u.id
                                LEFT JOIN ${publicdb}.classification ct ON c.classificationid = ct.id
                           WHERE ${where}`;

            const res = await fetch(`/api/v1/maria/f?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            const row = data.success && data.data ? data.data : null;

            if (row && row.id) {
                const author =
                    row.author_firstname || row.author_lastname
                        ? `${row.author_firstname || ""} ${row.author_lastname || ""}`.trim()
                        : row.author_name || `Author ${row.userid}`;

                const safe = {
                    id: row.id,
                    name: row.name,
                    title: row.title || "",
                    excerpt: row.excerpt || "",
                    description: row.description || "",
                    classificationid: row.classificationid || 1,
                    category: row.category_title || "",
                    created: row.created,
                    liking: row.liking,
                    author,
                    author_id: row.userid,
                    author_img: row.author_img,
                    img: row.img || null,
                    view_count: row.view_count || 0,
                    status: row.status,
                };

                setContent(safe);
                if (safe.classificationid) fetchRelatedPosts(safe.classificationid, safe.name);
            } else {
                setError("Content not found");
            }
        } catch (err) {
            console.error("[ContentOne] fetch error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initialContent) {
            if (initialContent.classificationid) {
                fetchRelatedPosts(initialContent.classificationid, initialContent.name);
            }
            setLoading(false);
        } else if (id || name) {
            fetchContent();
        } else {
            setError("No content identifier provided");
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, name, initialContent]);

    // --------------------------------------------------
    // Helpers
    // --------------------------------------------------
    const formatDate = (dateString) => {
        if (!dateString) return t("recent");
        try {
            return new Date(dateString).toLocaleDateString(
                language === "en" ? "en-US" : "el-GR",
                { year: "numeric", month: "long", day: "numeric" }
            );
        } catch {
            return t("recent");
        }
    };

    const getImageSrc = (img) => {
        if (!img) return assets.hero;
        if (img.startsWith("http")) return img;
        return `${mediaBase}/${img}`;
    };

    const currentTitle = content?.title;
    const currentDescription = content?.description;
    const currentExcerpt = content?.excerpt;
    const currentCategory = content?.category;
    const currentUrl = window.location.href;
    const metaDesc = (currentExcerpt || currentDescription || "").substring(0, 160);

    // --------------------------------------------------
    // LOADING / ERROR
    // --------------------------------------------------
    if (loading) {
        return (
            <div className="content-one-container">
                <div className="loading-spinner"><small>{t("loading")}</small></div>
            </div>
        );
    }

    if (error || !content) {
        return (
            <div className="content-one-container">
                <div className="error-message">
                    <h2>{t("not_found_title")}</h2>
                    <p style={{ color: "#888", fontSize: "0.9rem" }}>{error}</p>
                    <Link to={routes.blog} className="back-link">{t("back_to_blog")}</Link>
                </div>
            </div>
        );
    }

    // --------------------------------------------------
    // RENDER
    // --------------------------------------------------
    return (
        <>
            {seo && (
                <Helmet prioritizeSeoTags={true}>
                    <title>{currentTitle} | {siteName}</title>
                    <meta name="description" content={metaDesc} />

                    <meta property="og:type" content="article" />
                    <meta property="og:url" content={currentUrl} />
                    <meta property="og:title" content={currentTitle} />
                    <meta property="og:description" content={metaDesc} />
                    <meta property="og:image" content={content.img ? getImageSrc(content.img) : defaultOgImage} />
                    <meta property="og:image:alt" content={currentTitle} />
                    <meta property="og:image:width" content="968" />
                    <meta property="og:image:height" content="504" />
                    <meta property="og:site_name" content={siteName} />
                    <meta property="og:locale" content={language === "en" ? "en_US" : "el_GR"} />
                    <meta property="og:locale:alternate" content={language === "en" ? "el_GR" : "en_US"} />

                    <meta property="article:published_time" content={content.created} />
                    <meta property="article:author" content={content.author} />
                    <meta property="article:section" content={currentCategory} />

                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:url" content={currentUrl} />
                    <meta name="twitter:title" content={currentTitle} />
                    <meta name="twitter:description" content={metaDesc} />
                    <meta name="twitter:image" content={content.img ? getImageSrc(content.img) : defaultOgImage} />

                    <link rel="canonical" href={currentUrl} />
                </Helmet>
            )}

            <div className="content-one-container">
                <article className="single-article">

                    <div className="language-switcher">
                        <button className={`lang-btn ${language === "en" ? "active" : ""}`} onClick={() => setLanguage("en")}>
                            🇬🇧 English
                        </button>
                        <button className={`lang-btn ${language === "el" ? "active" : ""}`} onClick={() => setLanguage("el")}>
                            🇬🇷 Ελληνικά
                        </button>
                    </div>

                    <div className="breadcrumbs">
                        <Link to={routes.home}>{t("home")}</Link>
                        <span className="separator">/</span>
                        <Link to={routes.blog}>{t("blog")}</Link>
                        <span className="separator">/</span>
                        <span className="current">{currentTitle}</span>
                    </div>

                    <div className="back-to-blog-top">
                        <Link
                            to="#"
                            onClick={(e) => { e.preventDefault(); window.history.back(); }}
                            className="back-link"
                        >
                            ← Back to {firstLevelName}
                        </Link>
                    </div>

                    <div className="article-hero-split">
                        {content.img && (
                            <div className="hero-image-left">
                                <img src={getImageSrc(content.img)} alt={currentTitle} />
                            </div>
                        )}
                        <div className="hero-content-right">
                            <div className="article-category">{currentCategory}</div>
                            <h1 className="article-title">{currentTitle}</h1>

                            <div className="article-meta">
                                <div className="meta-author">
                                    <div className="author-avatar-large">
                                        <img
                                            className="user-avatar"
                                            src={content.author_img ? getImageSrc(content.author_img) : assets.avatar}
                                            alt={content.author}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"%3E%3Ccircle cx="12" cy="8" r="4"%3E%3C/circle%3E%3Cpath d="M5 20v-2a7 7 0 0 1 14 0v2"%3E%3C/path%3E%3C/svg%3E';
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <div className="author-name">{content.author}</div>
                                    </div>
                                </div>

                                <div className="meta-stats">
                                    <span className="meta-date">📅 {formatDate(content.created)}</span>
                                    <span className="meta-read">
                                        📖 {Math.ceil((currentDescription?.length || 0) / 1000) || 5} {t("min_read")}
                                    </span>
                                    <span className="meta-views">
                                        👁️ {content.view_count?.toLocaleString()} {t("views")}
                                    </span>
                                </div>
                            </div>
                            {currentExcerpt && (
                                <div className="article-excerpt"><p>{currentExcerpt}</p></div>
                            )}
                        </div>
                    </div>

                    <div className="article-body">
                        {typeof currentDescription === "string" && currentDescription.includes("<") ? (
                            <div dangerouslySetInnerHTML={{ __html: currentDescription }} />
                        ) : (
                            <p>{currentDescription}</p>
                        )}


                    </div>

                    <div className="post-navigation">
                        <Link to={routes.blog} className="back-to-blog">{t("back_to_articles")}</Link>
                    </div>

                    {relatedPosts.length > 0 && (
                        <div className="related-posts">
                            <h3 className="related-title">{t("related_title")}</h3>
                            <div className="related-grid">
                                {relatedPosts.map((post) => (
                                    <Link to={`${routes.post}/${post?.name}`} key={post?.id} className="related-card">
                                        {post?.img && (
                                            <div className="related-image">
                                                <img src={getImageSrc(post.img)} alt={post?.title} />
                                            </div>
                                        )}
                                        <div className="related-content">
                                            <span className="related-category">{post?.category_title || t("article")}</span>
                                            <h4>{post?.title}</h4>
                                            <p>{(post?.excerpt || "").substring(0, 80)}...</p>
                                            <span className="read-more">{t("read_more")}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </article>
            </div>
        </>
    );
}