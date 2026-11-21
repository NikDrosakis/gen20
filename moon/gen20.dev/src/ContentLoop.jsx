// src/ContentLoop.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./ContentLoop.css";

const publicdb = "gen_" + window.location.hostname.replace(/\./g, "");
const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/'/g, "''");

// ============================================================
// View: καθαρή παρουσίαση, παίρνει έτοιμα δεδομένα
// ============================================================
function ContentLoopView({
                             posts = [],
                             featuredPosts = [],
                             loading,
                             error,
                             searchTerm,
                             onSearch,
                             postBase = "/post",
                             perPage = 9,
                         }) {
    const [bookmarked, setBookmarked] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const formatDate = (d) => {
        if (!d) return "Recent";
        return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    };

    const getAuthorName = (p) => {
        if (p.author_firstname || p.author_lastname) {
            return `${p.author_firstname || ""} ${p.author_lastname || ""}`.trim();
        }
        return p.author_name || `Author ${p.userid}`;
    };

    const getCategoryTitle = (p) => p.category_title || `Category ${p.classificationid}`;

    const getImageSrc = (img) => {
        if (!img) return "/assets/hero.png";
        if (img.startsWith("http")) return img;
        return `/media/${img}`;
    };

    const toggleBookmark = (id) =>
        setBookmarked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    const handleSearch = (value) => {
        setCurrentPage(1);
        onSearch?.(value);
    };

    const last = currentPage * perPage;
    const currentPosts = posts.slice(last - perPage, last);
    const totalPagesCount = Math.ceil(posts.length / perPage);

    if (loading) {
        return (
            <div className="content-archive">
                <div className="archive-loading">
                    <div className="magazine-spinner"></div>
                    <p className="loading-text">Loading...</p>
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
                    <p>There was a problem fetching the content. Please try again.</p>
                    <button onClick={() => window.location.reload()} className="retry-btn">Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="content-archive">
            <div className="archive-header">
                <div className="archive-search-section">
                    <input
                        type="text"
                        className="archive-search-input"
                        placeholder="🔍 Αναζήτηση κειμένων..."
                        value={searchTerm || ""}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    {searchTerm && (
                        <button className="archive-search-clear" onClick={() => handleSearch("")}>✕</button>
                    )}
                </div>
            </div>

            {posts.length === 0 && featuredPosts.length === 0 && (
                <div className="archive-empty">
                    <span className="empty-icon">📚</span>
                    <h3>No articles found</h3>
                    {searchTerm ? (
                        <p>Δεν υπάρχουν αποτελέσματα με τον όρο αναζήτησης "{searchTerm}". Δοκίμασε διαφορετικό όρο.</p>
                    ) : (
                        <p>Check back soon for new articles.</p>
                    )}
                </div>
            )}

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
                                            onError={(e) => { e.target.src = "/media/default.png"; }}
                                        />
                                        <div className="featured-badge">Featured</div>
                                    </div>
                                )}
                                <div className="featured-info">
                                    <span className="featured-category">{getCategoryTitle(post)}</span>
                                    <h2 className="featured-title">{post.title}</h2>
                                    <p className="featured-excerpt">{post.excerpt || post.description?.substring(0, 200)}</p>
                                    <div className="featured-meta">
                                        <span>📅 {formatDate(post.created)}</span>
                                        <span>📖 {Math.ceil((post.description?.length || 0) / 1000) || 5} min read</span>
                                        <span>👩‍🔬 {getAuthorName(post)}</span>
                                    </div>
                                    <Link to={`${postBase}/${post.name}`} className="read-more-featured">
                                        Read full article →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}

                    {featuredPosts.slice(1, 2).map((post) => (
                        <div key={post.id} className="featured-card">
                            <div className="featured-card-image">
                                <img src={getImageSrc(post.img)} alt={post.title} />
                            </div>
                            <div className="featured-card-content">
                                <span className="featured-category-small">{getCategoryTitle(post)}</span>
                                <h3>{post.title}</h3>
                                <p>{(post.excerpt || post.description || "").substring(0, 100)}...</p>
                                <Link to={`${postBase}/${post.name}`} className="read-more-link">Read article →</Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {currentPosts.length > 0 && (
                <div className="posts-grid">
                    {currentPosts.map((post) => (
                        <article key={post.id} className="post-card">
                            {post.img && (
                                <div className="post-image">
                                    <img src={getImageSrc(post.img)} alt={post.title} />
                                    <span className="post-category-badge">{getCategoryTitle(post)}</span>
                                    <button
                                        className={`post-bookmark ${bookmarked.includes(post.id) ? "active" : ""}`}
                                        onClick={() => toggleBookmark(post.id)}
                                    >
                                        {bookmarked.includes(post.id) ? "★" : "☆"}
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
                                    {post.excerpt
                                        ? post.excerpt.substring(0, 120) + (post.excerpt.length > 120 ? "..." : "")
                                        : (post.description || "").replace(/<[^>]+>/g, "").substring(0, 120)}
                                </p>

                                <div className="post-footer">
                                    <div className="post-author">
                                        <div className="author-avatar">👩</div>
                                        <span>{getAuthorName(post)}</span>
                                    </div>
                                    <Link to={`${postBase}/${post.name}`} className="read-more-link">Διάβασε →</Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {totalPagesCount > 1 && (
                <div className="pagination">
                    <button className="page-btn" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                        ← Prev
                    </button>
                    {[...Array(totalPagesCount).keys()].map((n) => (
                        <button
                            key={n + 1}
                            className={`page-btn ${currentPage === n + 1 ? "active" : ""}`}
                            onClick={() => setCurrentPage(n + 1)}
                        >
                            {n + 1}
                        </button>
                    ))}
                    <button className="page-btn" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPagesCount}>
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}

// ============================================================
// Container: φέρνει τα posts. Manifest: { "contentLoop": { "classificationid": 1 } }
// ============================================================
export default function ContentLoop({
                                        classificationid,
                                        name,
                                        limit = 50,
                                        perPage = 9,
                                        postBase = "/post",
                                    }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const ctrl = new AbortController();
        setLoading(true);

        const filters = ["c.status = 1", "c.type = 'post'"];
        if (classificationid) {
            filters.push(`c.classificationid = ${parseInt(classificationid, 10)}`);
        } else if (name) {
            const cn = esc(name);
            filters.push(`c.classificationid = (SELECT id FROM ${publicdb}.classification WHERE name = '${cn}' LIMIT 1)`);
        }
        if (searchTerm) {
            const s = esc(searchTerm);
            filters.push(`(c.title LIKE '%${s}%' OR c.excerpt LIKE '%${s}%')`);
        }

        const query = `SELECT c.id, c.name, c.title, c.excerpt, c.description, c.img, c.created,
                              c.view_count, c.classificationid, c.userid,
                              u.name as author_name, u.firstname as author_firstname,
                              u.lastname as author_lastname, ct.title as category_title
                       FROM ${publicdb}.content c
                            LEFT JOIN ${publicdb}.user u ON c.userid = u.id
                            LEFT JOIN ${publicdb}.classification ct ON c.classificationid = ct.id
                       WHERE ${filters.join(" AND ")}
                       ORDER BY c.created DESC
                       LIMIT ${parseInt(limit, 10) || 50}`;
console.log(query);
        fetch(`/api/v1/maria/fa?key=${encodeURIComponent(query)}`, { signal: ctrl.signal })
            .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
            .then((d) => {
                setPosts(d.success && Array.isArray(d.data) ? d.data : Array.isArray(d) ? d : []);
                setError(false);
            })
            .catch((e) => { if (e.name !== "AbortError") setError(true); })
            .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });

        return () => ctrl.abort();
    }, [classificationid, name, limit, searchTerm]);

    return (
        <ContentLoopView
            posts={posts}
            loading={loading}
            error={error}
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            postBase={postBase}
            perPage={perPage}
        />
    );
}