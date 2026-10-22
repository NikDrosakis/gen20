// components/ContentArchive.jsx
import { useState } from "react";
import "./ContentArchive.css";
import { Link } from "react-router-dom";
import LikeButton from "../LikeButton";
import Cookies from 'js-cookie';
const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');
export default function ContentArchive({ posts, featuredPosts, loading, error, searchTerm, lang = 'en' }) {
    const [expandedPost, setExpandedPost] = useState(null);
    const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 9;

    // Get current language from prop or cookie
    const currentLang = lang || Cookies.get('lang') || 'en';
    const isGreek = currentLang === 'el';

    const formatDate = (dateString) => {
        if (!dateString) return isGreek ? "Πρόσφατα" : "Recent";
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(currentLang === 'el' ? 'el-GR' : 'en-US', options);
    };

    // Get author name
    const getAuthorName = (post) => {
        if (post.author_firstname || post.author_lastname) {
            return `${post.author_firstname || ''} ${post.author_lastname || ''}`.trim();
        }
        return post.author_name || (isGreek ? `Συγγραφέας ${post.userid}` : `Author ${post.userid}`);
    };

    // Get category title based on language
    const getCategoryTitle = (post) => {
        if (isGreek) {
            return post.category_title  || post.category_title || `Κατηγορία ${post.classificationid}`;
        }
        return post.category_title_en || post.category_title || `Category ${post.classificationid}`;
    };

    // Get post title based on language
    const getPostTitle = (post) => {
        return isGreek ? (post.title  || post.title_en) : (post.title_en || post.title );
    };

    // Get post excerpt based on language
    const getPostExcerpt = (post) => {
        return isGreek ? (post.excerpt  || post.excerpt_en) : (post.excerpt_en || post.excerpt );
    };

    // Get post description based on language
    const getPostDescription = (post) => {
        return isGreek ? (post.description || post.description_en) : (post.description_en || post.description);
    };

    const toggleBookmark = (postId) => {
        setBookmarkedPosts(prev =>
            prev.includes(postId)
                ? prev.filter(id => id !== postId)
                : [...prev, postId]
        );
    };

    // Pagination
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(posts.length / postsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return (
            <div className="content-archive">
                <div className="archive-loading">
                    <div className="magazine-spinner"></div>
                    <p className="loading-text">
                        {isGreek ? "Φόρτωση ερευνητικών άρθρων..." : "Loading research articles..."}
                    </p>
                </div>
                <div className="skeleton-grid">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="skeleton-card">
                            <div className="skeleton-image"></div>
                            <div className="skeleton-content">
                                <div className="skeleton-title"></div>
                                <div className="skeleton-text"></div>
                                <div className="skeleton-text short"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="content-archive">
                <div className="archive-error">
                    <span className="error-icon">⚠️</span>
                    <h3>{isGreek ? "Αδυναμία φόρτωσης άρθρων" : "Unable to load articles"}</h3>
                    <p>
                        {isGreek
                            ? "Υπήρξε πρόβλημα κατά τη φόρτωση του ερευνητικού περιεχομένου. Παρακαλώ δοκιμάστε ξανά."
                            : "There was a problem fetching the research content. Please try again."}
                    </p>
                    <button onClick={() => window.location.reload()} className="retry-btn">
                        {isGreek ? "Επανάληψη" : "Retry"}
                    </button>
                </div>
            </div>
        );
    }

    if (posts.length === 0 && featuredPosts.length === 0) {
        return (
            <div className="content-archive">
                <div className="archive-empty">
                    <span className="empty-icon">📚</span>
                    <h3>{isGreek ? "Δεν βρέθηκαν άρθρα" : "No articles found"}</h3>
                    {searchTerm ? (
                        <p>
                            {isGreek
                                ? `Δεν υπάρχουν αποτελέσματα για "${searchTerm}". Δοκιμάστε διαφορετικό όρο αναζήτησης.`
                                : `No results matching "${searchTerm}". Try a different search term.`}
                        </p>
                    ) : (
                        <p>
                            {isGreek
                                ? "Επιστρέψτε σύντομα για νέα ερευνητικά άρθρα και πληροφορίες."
                                : "Check back soon for new research articles and insights."}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="content-archive">
            {/* Featured Posts Section */}
            {featuredPosts.length > 0 && currentPage === 1 && (
                <div className="featured-section">
                    {featuredPosts.slice(0, 1).map((post) => (
                        <div key={post.id} className="featured-post">
                            <div className="featured-content">
                                {post.img && (
                                    <div className="featured-image">
                                        <img
                                            src={`/media/blog/${post.img}`}
                                            alt={getPostTitle(post)}
                                        />
                                        <div className="featured-badge">
                                            {isGreek ? "Προτεινόμενο" : "Featured"}
                                        </div>
                                    </div>
                                )}
                                <div className="featured-info">
                                    <span className="featured-category">{getCategoryTitle(post)}</span>
                                    <h2 className="featured-title">{getPostTitle(post)}</h2>
                                    <p className="featured-excerpt">
                                        {getPostExcerpt(post) || (getPostDescription(post)?.substring(0, 200))}
                                    </p>
                                    <div className="featured-meta">
                                        <span>📅 {formatDate(post.created)}</span>
                                        <span>📖 {Math.ceil((getPostDescription(post)?.length || 0) / 1000) || 5} {isGreek ? "λεπτά ανάγνωσης" : "min read"}</span>
                                        <span>👩‍🔬 {getAuthorName(post)}</span>
                                    </div>
                                    <Link to={`/post/${post.name}`} className="read-more-featured">
                                        {isGreek ? "Διαβάστε ολόκληρο το άρθρο →" : "Read full article →"}
                                    </Link>
                                </div>
                            </div>
                            {expandedPost === post.id && (
                                <div className="expanded-content">
                                    <div className="expanded-inner">
                                        <h3>{isGreek ? "Πλήρες Άρθρο" : "Full Article"}</h3>
                                        <div dangerouslySetInnerHTML={{ __html: getPostDescription(post) || '' }} />
                                        <div className="expanded-meta">
                                            <div className="citation">
                                                <strong>{isGreek ? "Παραπομπή:" : "Citation:"}</strong> {getAuthorName(post)} ({new Date(post.created).getFullYear()})
                                            </div>
                                            <div className="share-buttons">
                                                <button className="share-btn">{isGreek ? "📧 Κοινή χρήση" : "📧 Share"}</button>
                                                <button className="share-btn">{isGreek ? "🔖 Παραπομπή" : "🔖 Cite"}</button>
                                                <button className="share-btn">🐦 {isGreek ? "Τιτιβίρισμα" : "Tweet"}</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Second featured post as card */}
                    {featuredPosts.slice(1, 2).map((post) => (
                        <div key={post.id} className="featured-card">
                            <div className="featured-card-image">
                                <img
                                    src={`/media/blog/${post.img}`}
                                    alt={getPostTitle(post)}
                                />
                            </div>
                            <div className="featured-card-content">
                                <span className="featured-category-small">{getCategoryTitle(post)}</span>
                                <h3>{getPostTitle(post)}</h3>
                                <p>{getPostExcerpt(post)?.substring(0, 100) || (getPostDescription(post)?.substring(0, 100))}...</p>
                                <Link to={`/post/${post.name}`} className="read-more-link">
                                    {isGreek ? "Διαβάστε άρθρο →" : "Read article →"}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Regular Posts Grid */}
            {currentPosts.length > 0 && (
                <>
                    <div className="posts-header">
                        <h3 className="section-title">
                            <span className="title-icon">📄</span>
                            {isGreek ? "Πρόσφατα Άρθρα" : "Latest Articles"}
                        </h3>
                        <div className="section-line"></div>
                    </div>

                    <div className="posts-grid">
                        {currentPosts.map((post) => (
                            <article key={post.id} className="post-card">
                                {post.img && (
                                    <div className="post-image">
                                        <img
                                            src={`/media/blog/${post.img}`}
                                            alt={getPostTitle(post)}
                                        />
                                        <span className="post-category-badge">{getCategoryTitle(post)}</span>
                                        <button
                                            className={`post-bookmark ${bookmarkedPosts.includes(post.id) ? 'active' : ''}`}
                                            onClick={() => toggleBookmark(post.id)}
                                            aria-label={isGreek ? "Προσθήκη σελιδοδείκτη" : "Bookmark post"}
                                        >
                                            {bookmarkedPosts.includes(post.id) ? '★' : '☆'}
                                        </button>
                                    </div>
                                )}

                                <div className="post-content">
                                    <div className="post-meta">
                                    <span className="post-date">📅 {formatDate(post.created)}</span>
                                        <span className="post-read-time">📖 {Math.ceil((getPostDescription(post)?.length || 0) / 1000) || 5} {isGreek ? "λεπτά" : "min"}</span>
                                        <span className="post-views">👁️ {post.view_count || 0} {isGreek ? "προβολές" : "views"}</span>
                                    </div>

                                    <h2 className="post-title">{getPostTitle(post)}</h2>

                                    <p className="post-excerpt">
                                        {expandedPost === post.id
                                            ? (getPostDescription(post) || getPostExcerpt(post))
                                            : (getPostExcerpt(post)?.substring(0, 120) + (getPostExcerpt(post)?.length > 120 ? "..." : "")) || (getPostDescription(post)?.substring(0, 120))
                                        }
                                    </p>

                                    <div className="post-footer">
                                        <div className="post-author">
                                            <img className="user-avatar"
                                                src={post?.author_img || '/assets/default-avatar.png'}
                                                alt={getPostTitle(post)}
                                                onError={(e) => {
                                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"%3E%3Ccircle cx="12" cy="8" r="4"%3E%3C/circle%3E%3Cpath d="M5 20v-2a7 7 0 0 1 14 0v2"%3E%3C/path%3E%3C/svg%3E';
                                                    e.target.onerror = null;
                                                }}
                                            />
                                            <span>{getAuthorName(post)}</span>
                                        </div>

                                        <LikeButton
                                            contentId={post?.id}
                                            initialLikes={post?.liking || 0}
                                            lang={currentLang}
                                        />

                                        <Link to={`/post/${post.name}`} className="read-more-link">
                                            {isGreek ? "Διαβάστε περισσότερα →" : "Read more →"}
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </>
            )}

            {/* Trending Tags Section */}
            <div className="trending-tags">
                <div className="tags-title">🔥 {isGreek ? "Δημοφιλή Θέματα" : "Trending Topics"}</div>
                <div className="tags-container">
                    <a href="#" className="tag">{isGreek ? "#Φαρμακογονιδιωματική" : "#Pharmacogenomics"}</a>
                    <a href="#" className="tag">{isGreek ? "#ΙατρικήΑκριβείας" : "#PrecisionMedicine"}</a>
                    <a href="#" className="tag">{isGreek ? "#Βιοπληροφορική" : "#Bioinformatics"}</a>
                    <a href="#" className="tag">{isGreek ? "#ΓενετικόςΚίνδυνος" : "#GeneticRisk"}</a>
                    <a href="#" className="tag">{isGreek ? "#ΜηχανικήΜάθηση" : "#MachineLearning"}</a>
                    <a href="#" className="tag">{isGreek ? "#ΚλινικήΓενετική" : "#ClinicalGenetics"}</a>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="page-btn"
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        ← {isGreek ? "Προηγούμενα" : "Prev"}
                    </button>

                    {[...Array(totalPages).keys()].map(number => (
                        <button
                            key={number + 1}
                            className={`page-btn ${currentPage === number + 1 ? 'active' : ''}`}
                            onClick={() => paginate(number + 1)}
                        >
                            {number + 1}
                        </button>
                    ))}

                    <button
                        className="page-btn"
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        {isGreek ? "Επόμενα →" : "Next →"}
                    </button>
                </div>
            )}

            {/* Footer Note */}
            <div className="archive-footer">
                <p className="footer-note">
                    <span>🔬</span>
                    {isGreek
                        ? "Όλα τα ερευνητικά άρθρα υπόκεινται σε κρίση ομοτίμων και ενημερώνονται τακτικά"
                        : "All research articles are peer-reviewed and updated regularly"}
                    <span>📅</span>
                </p>
            </div>
        </div>
    );
}