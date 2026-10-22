// components/ContentOne.jsx
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import ShareToolbox from "../ShareToolbox";
import "./ContentOne.css";
import { Helmet } from 'react-helmet-async';
import Cookies from 'js-cookie';
import LikeButton from "../LikeButton";
import ContentComment from "./ContentComment";
const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');

export default function ContentOne({ initialContent, allPosts = [], lang = 'el' }) {
    const { name  } = useParams();
    const [content, setContent] = useState(initialContent || null);
    const [loading, setLoading] = useState(!initialContent);
    const [error, setError] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [language, setLanguage] = useState(lang || Cookies.get('lang') || 'en');
    const currentLang = lang || Cookies.get('lang') || 'en';
    const isGreek = currentLang === 'el';

    // Save language to cookie when changed
    useEffect(() => {
        Cookies.set('lang', language, { path: '/' });
    }, [language]);

    useEffect(() => {
        if (!initialContent && name) {
            fetchContent(name);
        } else if (initialContent) {
            if (initialContent.classificationid) {
                fetchRelatedPosts(initialContent.classificationid, initialContent.id);
            }
        }
    }, [name, initialContent]);

    const getAuthorName = (post) => {
        if (post.author_firstname || post.author_lastname) {
            return `${post.author_firstname || ''} ${post.author_lastname || ''}`.trim();
        }
        return post.author_name || (isGreek ? `Συγγραφέας ${post.userid}` : `Author ${post.userid}`);
    };

    const getPostTitle = (post) => {
        return isGreek ? (post.title || post.title_en) : (post.title_en || post.title);
    };

    const fetchContent = async (name) => {
        setLoading(true);
        setError(null);

        try {
            const query = `SELECT
                               c.id,
                               c.title_en,
                               c.title,
                               c.excerpt_en,
                               c.excerpt,
                               c.description_en,
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
                               ct.title_en as category_title_en,
                               ct.title as category_title
                           FROM ${publicdb}.content c
                                    LEFT JOIN ${publicdb}.user u ON c.userid = u.id
                                    LEFT JOIN ${publicdb}.classification ct ON c.classificationid = ct.id
                           WHERE c.name = '${name}' `;


            console.log(query);
            const response = await fetch(`/api/v1/maria/f?q=${encodeURIComponent(query)}`);
            const data = await response.json();

            let contentData = null;
            if (data.success && data.data) {
                    contentData = data.data;
            }

            if (contentData && contentData.id) {
                // Get author name
                const authorName = contentData.author_firstname || contentData.author_lastname
                    ? `${contentData.author_firstname || ''} ${contentData.author_lastname || ''}`.trim()
                    : contentData.author_name || `Author ${contentData.userid}`;

                const safeContent = {
                    id: contentData.id,
                    name: contentData.name,
                    title_en: contentData.title_en || "Untitled Article",
                    title: contentData.title || "",
                    excerpt_en: contentData.excerpt_en || "",
                    excerpt: contentData.excerpt || "",
                    description_en: contentData.description_en || "Content not available",
                    description: contentData.description || "",
                    classificationid: contentData.classificationid || 1,
                    category_en: contentData.category_title_en || `Category ${contentData.classificationid}`,
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
                    fetchRelatedPosts(safeContent.classificationid, name);
                }
            } else {
                setError("Content not found");
            }
        } catch (err) {
            console.error("Error fetching content:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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
                               c.title_en,
                               c.title,
                               c.excerpt_en,
                               c.excerpt,
                               c.img,
                               u.img as author_img,
                               c.created,
                               ct.title_en as category_title_en,
                               ct.title as category_title
                           FROM ${publicdb}.content c
                                    LEFT JOIN ${publicdb}.classification ct ON c.classificationid = ct.id
                                    LEFT JOIN ${publicdb}.user u ON c.userid = u.id
                           WHERE c.classificationid = ${classificationid}
                             AND c.name != ${currentName}
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
            console.error("Error fetching related posts:", err);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return language === 'el' ? "Πρόσφατα" : "Recent";
        try {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(language === 'en' ? 'en-US' : 'el-GR', options);
        } catch (e) {
            return language === 'el' ? "Πρόσφατα" : "Recent";
        }
    };

    // Get current language content
    const currentTitle = language === 'en' ? content?.title_en : (content?.title || content?.title_en);
    const currentDescription = language === 'en' ? content?.description_en : (content?.description || content?.description_en);
    const currentExcerpt = language === 'en' ? content?.excerpt_en : (content?.excerpt || content?.excerpt_en);
    const currentCategory = language === 'en' ? content?.category_en : (content?.category || content?.category_en);

    // Get current URL for sharing
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    if (loading) {
        return (
            <div className="content-one-container">
                <div className="loading-spinner">
                    <p>{language === 'el' ? 'Φόρτωση...' : 'Loading...'}</p>
                </div>
            </div>
        );
    }

    if (error || !content) {
        return (
            <div className="content-one-container">
                <div className="error-message">
                    <h2>{language === 'el' ? 'Άρθρο δεν βρέθηκε' : 'Article Not Found'}</h2>
                    <Link to="/post" className="back-link">
                        {language === 'el' ? '← Επιστροφή στο Blog' : '← Back to Blog'}
                    </Link>
                </div>
            </div>
        );
    }
    const getImageSrc = (img) => {
        if (!img) return "/assets/hero.png";
        if (img.startsWith("http")) return img;
        return `/media/blog/${img}`;
    };
    return (
        <>
            {/* Dynamic OG Tags for Social Sharing */}
            <Helmet prioritizeSeoTags={true}>
                <title>{currentTitle} | GEN20</title>
                <meta name="description" content={(currentExcerpt || currentDescription || '').substring(0, 160)}/>

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="article"/>
                <meta property="og:url" content={currentUrl}/>
                <meta property="og:title" content={currentTitle}/>
                <meta property="og:description"
                      content={(currentExcerpt || currentDescription || '').substring(0, 160)}/>
                <meta property="og:image" content={`https://nikimourtzi.com/media/blog/${content.img}`}/>
                <meta property="og:image:alt" content={currentTitle}/>
                <meta property="og:image:width" content="968"/>
                <meta property="og:image:height" content="504"/>
                <meta property="og:site_name" content="Niki Mourtzi"/>
                <meta property="og:locale" content={language === 'en' ? 'en_US' : 'el_GR'}/>
                <meta property="og:locale:alternate" content={language === 'en' ? 'el_GR' : 'en_US'}/>

                {/* Article Specific */}
                <meta property="article:published_time" content={content.created}/>
                <meta property="article:author" content={content.author}/>
                <meta property="article:section" content={currentCategory}/>

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image"/>
                <meta name="twitter:url" content={currentUrl}/>
                <meta name="twitter:title" content={currentTitle}/>
                <meta name="twitter:description"
                      content={(currentExcerpt || currentDescription || '').substring(0, 160)}/>
                <meta name="twitter:image" content={content.img || "https://gen20.net/default-og-image.jpg"}/>

                {/* Canonical URL */}
                <link rel="canonical" href={currentUrl}/>
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
                        <Link to="/">{language === 'el' ? 'Αρχική' : 'Home'}</Link>
                        <span className="separator">/</span>
                        <Link to="/blog">{language === 'el' ? 'Ιστολόγιο' : 'Blog'}</Link>
                        <span className="separator">/</span>
                        <span className="current">{currentTitle}</span>
                    </div>

                    {/* Back to Blog Button */}
                    <div className="back-to-blog-top">
                        <Link to="/blog" className="back-link">
                            ← {language === 'el' ? 'Επιστροφή σε όλα τα άρθρα' : 'Back to all articles'}
                        </Link>
                    </div>

                    {/* Hero Section */}
                    <div className="article-hero-split">
                        {content.img && (
                            <div className="hero-image-left">
                                <img src={getImageSrc(content.img)} alt={currentTitle}/>
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
                                            src={content?.author_img ? `${getImageSrc(content.author_img)}` : '/assets/default-avatar.png'}
                                            alt={getPostTitle(content)}
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
                                        📖 {Math.ceil((currentDescription?.length || 0) / 1000) || 5}
                                        {language === 'el' ? ' λεπτά ανάγνωσης' : ' min read'}
                                    </span>
                                    <span className="meta-views">
                                        👁️ {content.view_count?.toLocaleString()}
                                        {language === 'el' ? ' προβολές' : ' views'}
                                    </span>
                                </div>
                            </div>

                            {/* Share Toolbox */}
                            <div className="article-share-section">
                                <ShareToolbox
                                    url={currentUrl}
                                    title={currentTitle}
                                    description={(currentExcerpt || currentDescription || '').substring(0, 200)}
                                    image={content.img}
                                    lang={language}
                                />
                            </div>

                            {/* Like Button - Separate Component */}
                            <LikeButton
                                contentId={content?.id}
                                initialLikes={content?.liking || 0}
                                lang={language}
                            />

                            {/* Excerpt */}
                            {currentExcerpt && (
                                <div className="article-excerpt">
                                    <p>{currentExcerpt}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Article Content */}
                    <div className="article-body">
                        {typeof currentDescription === 'string' && currentDescription.includes('<') ? (
                            <div dangerouslySetInnerHTML={{ __html: currentDescription }} />
                        ) : (
                            <p>{currentDescription}</p>
                        )}

                        {/* Comments Section */}
                        <ContentComment
                            contentType="content"
                            contentId={content?.id}
                            lang={language}
                        />
                    </div>

                    {/* Navigation back to blog */}
                    <div className="post-navigation">
                        <Link to="/blog" className="back-to-blog">
                            ← {language === 'el' ? 'Επιστροφή σε όλα τα άρθρα' : 'Back to all articles'}
                        </Link>
                    </div>

                    {/* Related Posts */}
                    {relatedPosts && relatedPosts.length > 0 && (
                        <div className="related-posts">
                            <h3 className="related-title">
                                {language === 'en' ? '📖 You might also like' : '📖 Μπορεί επίσης να σας ενδιαφέρει'}
                            </h3>
                            <div className="related-grid">
                                {relatedPosts.map((post) => (
                                    <Link to={`/blog/${post?.name}`} key={post?.id} className="related-card">
                                        {post?.img && (
                                            <div className="related-image">
                                                <img src={getImageSrc(post.img)} alt={language === 'en' ? post?.title_en : post?.title} />
                                            </div>
                                        )}
                                        <div className="related-content">
                                            <span className="related-category">
                                                {language === 'en'
                                                    ? (post?.category_title_en || "Article")
                                                    : (post?.category_title || post?.category_title_en || "Άρθρο")}
                                            </span>
                                            <h4>{language === 'en' ? (post?.title_en || post?.title) : (post?.title || post?.title_en)}</h4>
                                            <p>{((language === 'en' ? post?.excerpt_en : post?.excerpt) ||
                                                (language === 'en' ? "Read this article..." : "Διαβάστε αυτό το άρθρο..."))?.substring(0, 80)}...</p>
                                            <span className="read-more">
                                                {language === 'en' ? 'Read more →' : 'Διαβάστε περισσότερα →'}
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