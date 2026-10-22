// components/ContentArchive.jsx
import { useState } from "react";
import "./ContentArchive.css";
import { Link } from "react-router-dom";

export default function ContentArchive({ posts, featuredPosts, loading, error, searchTerm, onSearch }) {
    const [expandedPost, setExpandedPost] = useState(null);
    const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || '');
    const postsPerPage = 9;
console.log('posts',posts)
    // Υπολογισμός counters
    const totalPosts = posts.filter(p => p.type === 'post' || !p.type).length;
    const totalPages = posts.filter(p => p.type === 'page').length;

    const formatDate = (dateString) => {
        if (!dateString) return "Recent";
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Get author name from joined data
    const getAuthorName = (post) => {
        if (post.author_firstname || post.author_lastname) {
            return `${post.author_firstname || ''} ${post.author_lastname || ''}`.trim();
        }
        return post.author_name || `Author ${post.userid}`;
    };

    // Get category title
    const getCategoryTitle = (post) => {
        return post.category_title || `Category ${post.classificationid}`;
    };

    const toggleBookmark = (postId) => {
        setBookmarkedPosts(prev =>
            prev.includes(postId)
                ? prev.filter(id => id !== postId)
                : [...prev, postId]
        );
    };

    // Search handler
    const handleSearch = (e) => {
        const value = e.target.value;
        setLocalSearchTerm(value);
        if (onSearch) {
            onSearch(value);
        }
    };

    // Pagination
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPagesCount = Math.ceil(posts.length / postsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return (
            <div className="content-archive">
                <div className="archive-loading">
                    <div className="magazine-spinner"></div>
                    <p className="loading-text">Loading research articles...</p>
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
                    <h3>Unable to load articles</h3>
                    <p>There was a problem fetching the research content. Please try again.</p>
                    <button onClick={() => window.location.reload()} className="retry-btn">
                        Retry
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
                    <h3>No articles found</h3>
                    {searchTerm ? (
                        <p>Δεν υπάρχουν αποτελέσματα με τον όρο αναζήτησης "{searchTerm}". Δοκίμασε διαφορετικό όρο.</p>
                    ) : (
                        <p>Check back soon for new research articles and insights.</p>
                    )}
                </div>
            </div>
        );
    }

    const getImageSrc = (img) => {
        if (!img) return "/assets/hero.png";
        if (img.startsWith("http")) return img;
        return `/media/${img}`;
    };

    return (
        <div className="content-archive">
            {/* Header with Counters and Search */}
            <div className="archive-header">
                <div className="archive-search-section">
                    <input
                        type="text"
                        className="archive-search-input"
                        placeholder="🔍 Αναζήτηση κειμένων..."
                        value={localSearchTerm}
                        onChange={handleSearch}
                    />
                    {localSearchTerm && (
                        <button
                            className="archive-search-clear"
                            onClick={() => {
                                setLocalSearchTerm('');
                                if (onSearch) onSearch('');
                            }}
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Featured Posts Section */}
            {featuredPosts.length > 0 && currentPage === 1 && (
                <div className="featured-section">
                    {featuredPosts.slice(0, 1).map((post) => (
                        <div key={post.id} className="featured-post">
                            <div className="featured-content">
                                {post.img && (
                                    <div className="featured-image">
                                        <img
                                            src={getImageSrc(post.img)}
                                            alt={post.title}
                                            onError={(e) => {
                                                e.target.src = "/media/default.png";
                                            }}
                                        />
                                        <div className="featured-badge">Featured</div>
                                    </div>
                                )}
                                <div className="featured-info">
                                <span className="featured-category">{getCategoryTitle(post)}</span>
                                    <h2 className="featured-title">{post.title}</h2>
                                    <p className="featured-excerpt">{post.excerpt || (post.description?.substring(0, 200))}</p>
                                    <div className="featured-meta">
                                        <span>📅 {formatDate(post.created)}</span>
                                        <span>📖 {Math.ceil((post.description?.length || 0) / 1000) || 5} min read</span>
                                        <span>👩‍🔬 {getAuthorName(post)}</span>
                                    </div>
                                    <Link to={`/blog?id=${post.id}`} className="read-more-featured">
                                        Read full article →
                                    </Link>
                                </div>
                            </div>
                            {expandedPost === post.id && (
                                <div className="expanded-content">
                                    <div className="expanded-inner">
                                        <h3>Full Article</h3>
                                        <div dangerouslySetInnerHTML={{ __html: post.description || '' }} />
                                        <div className="expanded-meta">
                                            <div className="citation">
                                                <strong>Citation:</strong> {getAuthorName(post)} ({new Date(post.created).getFullYear()})
                                            </div>
                                            <div className="share-buttons">
                                                <button className="share-btn">📧 Share</button>
                                                <button className="share-btn">🔖 Cite</button>
                                                <button className="share-btn">🐦 Tweet</button>
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
                                <img src={post.img || '/assets/default.jpg'} alt={post.title} />
                            </div>
                            <div className="featured-card-content">
                                <span className="featured-category-small">{getCategoryTitle(post)}</span>
                                <h3>{post.title}</h3>
                                <p>{post.excerpt?.substring(0, 100) || (post.description?.substring(0, 100))}...</p>
                                <Link to={`/blog?id=${post.id}`} className="read-more-link">
                                    Read article →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Regular Posts Grid */}
            {currentPosts.length > 0 && (
                <>
                    <div className="posts-grid">
                        {currentPosts.map((post) => (
                            <article key={post.id} className="post-card">
                                {post.img && (
                                    <div className="post-image">
                                        <img src={getImageSrc(post.img)} alt={post.title} />
                                        <span className="post-category-badge">{getCategoryTitle(post)}</span>
                                        <button
                                            className={`post-bookmark ${bookmarkedPosts.includes(post.id) ? 'active' : ''}`}
                                            onClick={() => toggleBookmark(post.id)}
                                        >
                                            {bookmarkedPosts.includes(post.id) ? '★' : '☆'}
                                        </button>
                                    </div>
                                )}

                                <div className="post-content">
                                    <div className="post-meta">
                                        <span className="post-date">📅 {formatDate(post.created)}</span>
                                        <span className="post-read-time">📖 {Math.ceil((post.description?.length || 0) / 1000) || 5} min</span>
                                        <span className="post-views">👁️ {post.view_count || 0} views</span>
                                    </div>

                                    <h2 className="post-title">{post.title}</h2>

                                    <p className="post-excerpt">
                                        {expandedPost === post.id
                                            ? (post.description || post.excerpt)
                                            : (post.excerpt?.substring(0, 120) + (post.excerpt?.length > 120 ? "..." : "")) || (post.description?.substring(0, 120))
                                        }
                                    </p>

                                    <div className="post-footer">
                                        <div className="post-author">
                                            <div className="author-avatar">👩</div>
                                            <span>{getAuthorName(post)}</span>
                                        </div>

                                        <Link to={`/post/${post.name}`} className="read-more-link">
                                            Διάβασε →
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
                <div className="tags-title">🔥 Επείγοντα Ζητήματα</div>
                <div className="tags-container">
                    <a href="#" className="tag">#Απεργία</a>
                    <a href="#" className="tag">#ΣυλλογήΣύμβαση</a>
                    <a href="#" className="tag">#Σκηνοθεσία</a>
                    <a href="#" className="tag">#Θέατρο</a>
                    <a href="#" className="tag">#κινημαγράφος</a>
                    <a href="#" className="tag">#Φεστιβάλ</a>
                </div>
            </div>

            {/* Pagination */}
            {totalPagesCount > 1 && (
                <div className="pagination">
                    <button
                        className="page-btn"
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        ← Prev
                    </button>

                    {[...Array(totalPagesCount).keys()].map(number => (
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
                        disabled={currentPage === totalPagesCount}
                    >
                        Next →
                    </button>
                </div>
            )}

            {/* Footer Note */}
            <div className="archive-footer">
                <p className="footer-note">
                    <span>🔬</span>
                    Το υλικό ανανεώνεται διαρκώς. Ενημερώστε μας για όποια λάθη.
                    <span>📅</span>
                </p>
            </div>
        </div>
    );
}