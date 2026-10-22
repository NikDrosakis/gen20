// components/Latest.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Latest.css';

const Latest = ({ classification = 'publications', limit = 8 }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');

    useEffect(() => {
        fetchLatestPosts();
    }, [classification]);

    const fetchLatestPosts = async () => {
        setLoading(true);
        try {
            const query = `SELECT
                               c.id,
                               c.name,
                               c.img,
                               c.title,
                               c.excerpt,
                               c.published,
                               u.name as author_name,
                               u.firstname as author_firstname,
                               u.lastname as author_lastname
                           FROM ${publicdb}.content c
                                    LEFT JOIN ${publicdb}.user u ON c.userid = u.id
                           WHERE c.type = 'post'
                           ORDER BY c.published DESC, c.id DESC
                               LIMIT ${limit}`;

            const response = await fetch(`/api/v1/maria/fa?query=${encodeURIComponent(query)}`);
            const data = await response.json();

            let postsData = [];
            if (data?.success && data?.data && Array.isArray(data.data)) {
                postsData = data.data;
            }

            setPosts(postsData);
        } catch (err) {
            console.error('Error fetching latest posts:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date)) return '';
            return date.toLocaleDateString('el-GR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch (e) {
            return '';
        }
    };

    const getImageSrc = (img) => {
        if (!img) return null;
        if (img.startsWith('http://') || img.startsWith('https://')) {
            return img;
        }
        return `/media/${img}`;
    };

    if (loading) {
        return (
            <div className="latest-container">
                <div className="latest-header">
                    <h2>📰 Τελευταίες Ανακοινώσεις</h2>
                </div>
                <div className="latest-loading">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="latest-skeleton">
                            <div className="skeleton-line"></div>
                            <div className="skeleton-line short"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="latest-container">
                <div className="latest-header">
                    <h2>📰 Τελευταίες Ανακοινώσεις</h2>
                </div>
                <div className="latest-error">
                    <p>Σφάλμα φόρτωσης ανακοινώσεων</p>
                </div>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="latest-container">
                <div className="latest-header">
                    <h2>📰 Τελευταίες Ανακοινώσεις</h2>
                </div>
                <div className="latest-empty">
                    <p>Δεν υπάρχουν ανακοινώσεις</p>
                </div>
            </div>
        );
    }

    return (
        <div className="latest-container">
            <div className="latest-header">
                <h2>📰 Τελευταίες Ανακοινώσεις</h2>
                <Link to="/publications" className="latest-view-all">
                    Όλες οι ανακοινώσεις →
                </Link>
            </div>

            <div className="latest-list">
                {posts.map((post) => (
                    <div key={post.id} className="latest-item">
                        {/* ✅ Thumbnail αντί για αριθμό */}
                        <div className="latest-thumbnail">
                            {post.img ? (
                                <img
                                    src={getImageSrc(post.img)}
                                    alt={post.title || 'Thumbnail'}
                                    className="latest-thumb-img"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = '<span class="latest-thumb-fallback">📄</span>';
                                    }}
                                />
                            ) : (
                                <span className="latest-thumb-fallback">📄</span>
                            )}
                        </div>
                        <div className="latest-content">
                            <Link to={`/post/${post.name}`} className="latest-title">
                                {post.title || 'Untitled'}
                            </Link>
                            <div className="latest-meta">
                                <span className="latest-date">{formatDate(post.published)}</span>
                                <span className="latest-author">
                                    {post.author_firstname || post.author_lastname
                                        ? `${post.author_firstname || ''} ${post.author_lastname || ''}`.trim()
                                        : post.author_name || ''}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Latest;