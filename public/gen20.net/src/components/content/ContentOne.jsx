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

export default function ContentOne({ name: propName }) {
    const { name: routeName } = useParams();
    const name = propName || routeName;
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [language] = useState('el');

    useEffect(() => {
        if (name) {
            fetchContent(name);
        }
    }, [name]);

    const getAuthorName = (post) => {
        if (post.author_firstname || post.author_lastname) {
            return `${post.author_firstname || ''} ${post.author_lastname || ''}`.trim();
        }
        return post.author_name || `Συγγραφέας ${post.userid}`;
    };

    const fetchContent = async (slug) => {
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
                c.published,
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
            WHERE c.name = '${slug}' `;

            const response = await fetch(`/api/v1/maria/f?q=${encodeURIComponent(query)}`);
            const data = await response.json();

            let contentData = null;
            if (data.success && data.data) {
                contentData = data.data;
            }

            if (contentData && contentData.id) {
                const authorName = getAuthorName(contentData);

                const safeContent = {
                    id: contentData.id,
                    name: contentData.name,
                    title: contentData.title || "",
                    excerpt: contentData.excerpt || "",
                    description: contentData.description || "",
                    classificationid: contentData.classificationid || 1,
                    category: contentData.category_title || "",
                    published: contentData.published,
                    liking: contentData.liking || 0,
                    author: authorName,
                    author_id: contentData.userid,
                    author_img: contentData.author_img,
                    img: contentData.img || null,
                    view_count: contentData.view_count || 0,
                    status: contentData.status
                };
                setContent(safeContent);
                if (safeContent.classificationid) {
                    fetchRelatedPosts(safeContent.classificationid, contentData.id);
                }
            } else {
                setError("Το άρθρο δεν βρέθηκε");
            }
        } catch (err) {
            console.error("Σφάλμα φόρτωσης:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedPosts = async (classificationid, currentId) => {
        try {
            const query = `SELECT
                c.id,
                c.title,
                c.excerpt,
                c.img,
                c.name,
                u.img as author_img,
                c.published,
                ct.title as category_title
            FROM ${publicdb}.content c
            LEFT JOIN ${publicdb}.classification ct ON c.classificationid = ct.id
            LEFT JOIN ${publicdb}.user u ON c.userid = u.id
            WHERE c.classificationid = ${classificationid}
            AND c.id != ${currentId}
            AND c.type = 'post'
            LIMIT 3`;

            const response = await fetch(`/api/v1/maria/fa?folder=${encodeURIComponent(query)}`);
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
            console.error("Σφάλμα φόρτωσης σχετικών άρθρων:", err);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Πρόσφατα";
        try {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString('el-GR', options);
        } catch (e) {
            return "Πρόσφατα";
        }
    };

    const currentTitle = content?.title;
    const currentDescription = content?.description;
    const currentExcerpt = content?.excerpt;
    const currentCategory = content?.category;
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    if (loading) {
        return (
            <div className="content-one-container">
                <div className="loading-spinner">
                    <p>Φόρτωση...</p>
                </div>
            </div>
        );
    }

    if (error || !content) {
        return (
            <div className="content-one-container">
                <div className="error-message">
                    <h2>Το άρθρο δεν βρέθηκε</h2>
                    <button onClick={() => navigate(-1)} className="back-link">
                        ← Επιστροφή
                    </button>
                </div>
            </div>
        );
    }
    const getImageSrc = (img) => {
        if (!img) return '/assets/default-image.jpg';
        if (img.startsWith('http://') || img.startsWith('https://')) {
            return img;
        }
        return `/media/${img}`;
    };
    return (
        <>
            <Helmet prioritizeSeoTags={true}>
                <title>{currentTitle} | Ένωση Σκηνοθετών Δημιουργών</title>
                <meta name="description" content={(currentExcerpt || currentDescription || '').substring(0, 160)}/>

                <meta property="og:type" content="article"/>
                <meta property="og:url" content={currentUrl}/>
                <meta property="og:title" content={currentTitle}/>
                <meta property="og:description" content={(currentExcerpt || currentDescription || '').substring(0, 160)}/>
                <meta property="og:image" content={content.img ? `/media/${content.img}` : "/assets/default-og.jpg"}/>
                <meta property="og:image:alt" content={currentTitle}/>
                <meta property="og:site_name" content="Ένωση Σκηνοθετών Δημιουργών"/>
                <meta property="og:locale" content="el_GR"/>

                <meta property="article:published_time" content={content.published}/>
                <meta property="article:author" content={content.author}/>
                <meta property="article:section" content={currentCategory}/>

                <meta name="twitter:card" content="summary_large_image"/>
                <meta name="twitter:title" content={currentTitle}/>
                <meta name="twitter:description" content={(currentExcerpt || currentDescription || '').substring(0, 160)}/>

                <link rel="canonical" href={currentUrl}/>
            </Helmet>

            <div className="content-one-container">
                <article className="single-article">
                    {/* Breadcrumbs */}
                    <div className="breadcrumbs">
                        <Link to="/">Αρχική</Link>
                        <span className="separator">/</span>
                        <Link to="/">Ιστολόγιο</Link>
                        <span className="separator">/</span>
                        <span className="current">{currentTitle}</span>
                    </div>

                    {/* Back to Blog Button */}
                    <div className="back-to-blog-top">
                        <button onClick={() => navigate(-1)} className="back-link">
                            ← Επιστροφή
                        </button>
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
                                            src={content?.author_img ? `/media/${content.author_img}` : '/assets/default-avatar.png'}
                                            alt={content.author}
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
                                    <span className="meta-date">📅 {formatDate(content.published)}</span>
                                    <span className="meta-read">
                                        📖 {Math.ceil((currentDescription?.length || 0) / 1000) || 5} λεπτά ανάγνωσης
                                    </span>
                                    <span className="meta-views">
                                        👁️ {content.view_count?.toLocaleString()} προβολές
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
                                />
                            </div>

                            {/* Like Button */}
                            <LikeButton
                                contentId={content?.id}
                                initialLikes={content?.liking || 0}
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
                        />
                    </div>

                    {/* Navigation back to blog */}
                    <div className="post-navigation">
                        <button onClick={() => navigate(-1)} className="back-link">
                            ← Επιστροφή
                        </button>
                    </div>

                    {/* Related Posts */}
                    {relatedPosts && relatedPosts.length > 0 && (
                        <div className="related-posts">
                            <h3 className="related-title">
                                📖 Σχετικά
                            </h3>
                            <div className="related-grid">
                                {relatedPosts.map((post) => (
                                    <Link to={`/post/${post.name}`} key={post.id} className="related-card">
                                        {post?.img && (
                                            <div className="related-image">
                                                <img src={`/media/${post.img}`} alt={post.title} />
                                            </div>
                                        )}
                                        <div className="related-content">
                                            <span className="related-category">
                                                {post?.category_title || "Άρθρο"}
                                            </span>
                                            <h4>{post?.title}</h4>
                                            <p>{post?.excerpt?.substring(0, 80) || "Διαβάστε αυτό το άρθρο..."}</p>
                                            <span className="read-more">
                                                Διαβάστε περισσότερα →
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