// ContentOne.jsx
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import ShareToolbox from "./ShareToolbox";
import "./ContentOne.css";
import { Helmet } from 'react-helmet-async';
import Cookies from 'js-cookie';
import LikeButton from "./LikeButton";
import ContentComment from "./ContentComment";
import { useG } from "./GContext";

const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');

// ============================================================
// Fallbacks — αν το G δεν έχει τα κλειδιά
// ============================================================
const FALLBACK = {
    site_name: typeof window !== 'undefined' ? window.location.hostname : 'Site',
    routes: {
        home: '/',
        blog: '/post',
        post: '/blog',
        contact: '/contact',
    },
    assets: {
        hero: '/assets/hero.png',
        avatar: '/assets/default-avatar.png',
    },
    media: {
        blog: '/media/blog',
        default_og: '/default-og-image.jpg',
    },
    i18n: {
        loading: 'Loading...',
        not_found_title: 'Article Not Found',
        back_to_blog: '← Back to Blog',
        back_to_articles: 'Back to all articles',
        home: 'Home',
        blog: 'Blog',
        article: 'Article',
        read_more: 'Read more →',
        related_title: '📖 You might also like',
        min_read: 'min read',
        views: 'views',
        recent: 'Recent',
    },
};

export default function ContentOne({
                                       initialContent,
                                       allPosts = [],
                                       lang = 'el',
                                       name: nameProp,
                                   }) {
    const { name: nameFromParams } = useParams();
    const name = nameProp || nameFromParams;

    const { G } = useG();

    // ✅ Site config από G (με fallback)
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

    const t = (key) => {
        const langPack = G?.i18n?.[lang] || G?.i18n || {};
        return langPack[key] || FALLBACK.i18n[key] || key;
    };

    // --------------------------------------------------
    // State
    // --------------------------------------------------
    const [content, setContent] = useState(initialContent || null);
    const [loading, setLoading] = useState(!initialContent);
    const [error, setError] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [language, setLanguage] = useState(lang || Cookies.get('lang') || 'en');

    useEffect(() => {
        Cookies.set('lang', language, { path: '/' });
    }, [language]);

    // --------------------------------------------------
    // FETCH CONTENT
    // --------------------------------------------------
    const fetchContent = async (contentName) => {
        setLoading(true);
        setError(null);

        try {
            const query = `SELECT
                               c.id,
                               c.name,
                               c.title,
                               c.excerpt,
                               c.description,
                               c.classificationid,
                               c.userid,
                               c.img,
                               c.created,
                               c.view_count,
                               c.status,
                               c.liking,
                               u.name as author_name,
                               u.firstname as author_firstname,
                               u.lastname as author_lastname,
                               u.img as author_img,
                               ct.title as category_title
                           FROM ${publicdb}.content c
                                    LEFT JOIN ${publicdb}.user u ON c.userid = u.id
                                    LEFT JOIN ${publicdb}.classification ct ON c.classificationid = ct.id
                           WHERE c.name = '${contentName.replace(/'/g, "''")}' `;

            const response = await fetch(`/api/v1/maria/f?q=${encodeURIComponent(query)}`);
            const data = await response.json();

            let contentData = null;
            if (data.success && data.data) {
                contentData = data.data;
            }

            if (contentData && contentData.id) {
                const authorName = contentData.author_firstname || contentData.author_lastname
                    ? `${contentData.author_firstname || ''} ${contentData.author_lastname || ''}`.trim()
                    : contentData.author_name || `Author ${contentData.userid}`;

                const safeContent = {
                    id: contentData.id,
                    name: contentData.name,
                    title: contentData.title || "",
                    excerpt: contentData.excerpt || "",
                    description: contentData.description || "",
                    classificationid: contentData.classificationid || 1,
                    category: contentData.category_title || "",
                    created: contentData.created,
                    liking: contentData.liking,
                    author: authorName,
                    author_id: contentData.userid,
                    author_img: contentData.author_img,
                    img: contentData.img || null,
                    view_count: contentData.view_count || 0,
                    status: contentData.status
                };

                setContent(safeContent);

                if (safeContent.classificationid) {
                    fetchRelatedPosts(safeContent.classificationid, contentName);
                }
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

    // --------------------------------------------------
    // FETCH RELATED POSTS
    // --------------------------------------------------
    const fetchRelatedPosts = async (classificationid, currentName) => {
        if (allPosts && allPosts.length > 0) {
            const related = allPosts
                .filter(p => p?.classificationid === classificationid && p?.name !== currentName)
                .slice(0, 3);
            if (related.length > 0) {
                setRelatedPosts(related);
                return;
            }
        }

        try {
            const query = `SELECT
                               c.id,
                               c.name,
                               c.title,
                               c.excerpt,
                               c.img,
                               u.img as author_img,
                               c.created,
                               ct.title as category_title
                           FROM ${publicdb}.content c
                                    LEFT JOIN ${publicdb}.classification ct ON c.classificationid = ct.id
                                    LEFT JOIN ${publicdb}.user u ON c.userid = u.id
                           WHERE c.classificationid = ${classificationid}
                             AND c.name != '${currentName.replace(/'/g, "''")}'
                             AND c.status = 1
                           AND c.type='post'
                               LIMIT 3`;

            const response = await fetch(`/api/v1/maria/fa?query=${encodeURIComponent(query)}`);
            if (response.ok) {
                const data = await response.json();
                let posts = [];
                if (data.success && data.data) {
                    posts = data.data;
                } else if (Array.isArray(data)) {
                    posts = data;
                }
                setRelatedPosts(posts);
            }
        } catch (err) {
            console.error("[ContentOne] related posts error:", err);
        }
    };

    // --------------------------------------------------
    // EFFECT
    // --------------------------------------------------
    useEffect(() => {
        if (!initialContent && name) {
            fetchContent(name);
        } else if (initialContent) {
            if (initialContent.classificationid) {
                fetchRelatedPosts(initialContent.classificationid, initialContent.id);
            }
            setLoading(false);
        } else {
            setError("No content identifier provided");
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [name, initialContent]);

    // --------------------------------------------------
    // Helpers
    // --------------------------------------------------
    // Αφαιρέθηκε το getPostTitle (χρησιμοποιούσε title_en)

    const formatDate = (dateString) => {
        if (!dateString) return t('recent');
        try {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(
                language === 'en' ? 'en-US' : 'el-GR',
                options
            );
        } catch (e) {
            return t('recent');
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
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    // --------------------------------------------------
    // LOADING
    // --------------------------------------------------
    if (loading) {
        return (
            <div className="content-one-container">
                <div className="loading-spinner">
                    <small>{t('loading')}</small>
                </div>
            </div>
        );
    }

    // --------------------------------------------------
    // ERROR
    // --------------------------------------------------
    if (error || !content) {
        return (
            <div className="content-one-container">
                <div className="error-message">
                    <h2>{t('not_found_title')}</h2>
                    <p style={{ color: '#888', fontSize: '0.9rem' }}>{error}</p>
                    <Link to={routes.blog} className="back-link">
                        {t('back_to_blog')}
                    </Link>
                </div>
            </div>
        );
    }

    // --------------------------------------------------
    // RENDER
    // --------------------------------------------------
    return (
        <>
            <Helmet prioritizeSeoTags={true}>
                <title>{currentTitle} | {siteName}</title>
                <meta name="description" content={(currentExcerpt || currentDescription || '').substring(0, 160)} />

                <meta property="og:type" content="article" />
                <meta property="og:url" content={currentUrl} />
                <meta property="og:title" content={currentTitle} />
                <meta property="og:description" content={(currentExcerpt || currentDescription || '').substring(0, 160)} />
                <meta property="og:image" content={content.img ? getImageSrc(content.img) : defaultOgImage} />
                <meta property="og:image:alt" content={currentTitle} />
                <meta property="og:image:width" content="968" />
                <meta property="og:image:height" content="504" />
                <meta property="og:site_name" content={siteName} />
                <meta property="og:locale" content={language === 'en' ? 'en_US' : 'el_GR'} />
                <meta property="og:locale:alternate" content={language === 'en' ? 'el_GR' : 'en_US'} />

                <meta property="article:published_time" content={content.created} />
                <meta property="article:author" content={content.author} />
                <meta property="article:section" content={currentCategory} />

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content={currentUrl} />
                <meta name="twitter:title" content={currentTitle} />
                <meta name="twitter:description" content={(currentExcerpt || currentDescription || '').substring(0, 160)} />
                <meta name="twitter:image" content={content.img ? getImageSrc(content.img) : defaultOgImage} />

                <link rel="canonical" href={currentUrl} />
            </Helmet>

            <div className="content-one-container">
                <article className="single-article">

                    {/* Language Switcher */}
                    <div className="language-switcher">
                        <button
                            className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                            onClick={() => setLanguage('en')}
                        >
                            🇬🇧 English
                        </button>
                        <button
                            className={`lang-btn ${language === 'el' ? 'active' : ''}`}
                            onClick={() => setLanguage('el')}
                        >
                            🇬🇷 Ελληνικά
                        </button>
                    </div>

                    {/* Breadcrumbs */}
                    <div className="breadcrumbs">
                        <Link to={routes.home}>{t('home')}</Link>
                        <span className="separator">/</span>
                        <Link to={routes.blog}>{t('blog')}</Link>
                        <span className="separator">/</span>
                        <span className="current">{currentTitle}</span>
                    </div>

                    {/* Back to Blog */}
                    <div className="back-to-blog-top">
                        <Link to={routes.blog} className="back-link">
                            {t('back_to_articles')}
                        </Link>
                    </div>

                    {/* Hero Section */}
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
                                            src={content?.author_img ? getImageSrc(content.author_img) : assets.avatar}
                                            alt={currentTitle}
                                            onError={(e) => {
                                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"%3E%3Ccircle cx="12" cy="8" r="4"%3E%3C/circle%3E%3Cpath d="M5 20v-2a7 7 0 0 1 14 0v2"%3E%3C/path%3E%3C/svg%3E';
                                                e.target.onerror = null;
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
                                        📖 {Math.ceil((currentDescription?.length || 0) / 1000) || 5} {t('min_read')}
                                    </span>
                                    <span className="meta-views">
                                        👁️ {content.view_count?.toLocaleString()} {t('views')}
                                    </span>
                                </div>
                            </div>

                            <div className="article-share-section">
                                <ShareToolbox
                                    url={currentUrl}
                                    title={currentTitle}
                                    description={(currentExcerpt || currentDescription || '').substring(0, 200)}
                                    image={content.img}
                                    lang={language}
                                />
                            </div>

                            <LikeButton
                                contentId={content?.id}
                                initialLikes={content?.liking || 0}
                                lang={language}
                            />

                            {currentExcerpt && (
                                <div className="article-excerpt">
                                    <p>{currentExcerpt}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Article Body */}
                    <div className="article-body">
                        {typeof currentDescription === 'string' && currentDescription.includes('<') ? (
                            <div dangerouslySetInnerHTML={{ __html: currentDescription }} />
                        ) : (
                            <p>{currentDescription}</p>
                        )}

                        <ContentComment
                            contentType="content"
                            contentId={content?.id}
                            lang={language}
                        />
                    </div>

                    {/* Back to Blog */}
                    <div className="post-navigation">
                        <Link to={routes.blog} className="back-to-blog">
                            {t('back_to_articles')}
                        </Link>
                    </div>

                    {/* Related Posts */}
                    {relatedPosts && relatedPosts.length > 0 && (
                        <div className="related-posts">
                            <h3 className="related-title">
                                {t('related_title')}
                            </h3>
                            <div className="related-grid">
                                {relatedPosts.map((post) => (
                                    <Link
                                        to={`${routes.post}/${post?.name}`}
                                        key={post?.id}
                                        className="related-card"
                                    >
                                        {post?.img && (
                                            <div className="related-image">
                                                <img
                                                    src={getImageSrc(post.img)}
                                                    alt={post?.title}
                                                />
                                            </div>
                                        )}
                                        <div className="related-content">
                                            <span className="related-category">
                                                {post?.category_title || t('article')}
                                            </span>
                                            <h4>{post?.title}</h4>
                                            <p>
                                                {(post?.excerpt || t('read_more'))?.substring(0, 80)}...
                                            </p>
                                            <span className="read-more">
                                                {t('read_more')}
                                            </span>
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