// components/ContentComment.jsx
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import './ContentComment.css';

export default function ContentComment({ contentType = 'content', contentId, lang = 'en' }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check login status
    useEffect(() => {
        const genName = Cookies.get('GENNAME');
        const genUid = Cookies.get('GENUID');
        if (genName && genUid) {
            setIsLoggedIn(true);
            setUser({
                id: genUid,
                name: genName,
                img: Cookies.get('GENIMG') || null
            });
        }
    }, []);

    // Load comments
    useEffect(() => {
        if (contentId) {
            fetchComments();
        }
    }, [contentId]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const query = `SELECT 
                c.id,
                c.userid,
                c.content,
                c.reply_id,
                c.created,
                u.name as user_name,
                u.firstname as user_firstname,
                u.lastname as user_lastname,
                u.img as user_img
            FROM gen_nikimourtzicom.comment c
            LEFT JOIN gen_nikimourtzicom.user u ON c.userid = u.id
            WHERE c.type = '${contentType}' 
            AND c.typeid = ${contentId}
            AND c.status = 1
            ORDER BY c.created ASC`;

            const response = await fetch(`/api/v1/maria/fa?query=${encodeURIComponent(query)}`);
            const data = await response.json();

            let commentsData = [];
            if (data.success && data.data) {
                commentsData = Array.isArray(data.data) ? data.data : [];
            } else if (Array.isArray(data)) {
                commentsData = data;
            }

            // Organize comments with replies
            const organizedComments = organizeComments(commentsData);
            setComments(organizedComments);
        } catch (err) {
            console.error('Error fetching comments:', err);
        } finally {
            setLoading(false);
        }
    };

    const organizeComments = (commentsData) => {
        const mainComments = commentsData.filter(c => !c.reply_id || c.reply_id === 0);
        const replies = commentsData.filter(c => c.reply_id && c.reply_id > 0);

        return mainComments.map(main => ({
            ...main,
            replies: replies.filter(r => r.reply_id === main.id)
        }));
    };

    const getUserName = (comment) => {
        if (comment.user_firstname || comment.user_lastname) {
            return `${comment.user_firstname || ''} ${comment.user_lastname || ''}`.trim();
        }
        return comment.user_name || `User ${comment.userid}`;
    };

    const getUserAvatar = (comment) => {
        if (comment.user_img) return comment.user_img;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserName(comment))}&background=3b82f6&color=fff`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return lang === 'el' ? 'Πρόσφατα' : 'Recent';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return lang === 'el' ? 'Μόλις τώρα' : 'Just now';
        if (diffMins < 60) return `${diffMins} ${lang === 'el' ? 'λεπτά πριν' : 'minutes ago'}`;
        if (diffHours < 24) return `${diffHours} ${lang === 'el' ? 'ώρες πριν' : 'hours ago'}`;
        if (diffDays < 7) return `${diffDays} ${lang === 'el' ? 'ημέρες πριν' : 'days ago'}`;

        return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'el-GR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleSubmitComment = async () => {
        if (!isLoggedIn) {
            alert(lang === 'el' ? 'Πρέπει να συνδεθείτε για να σχολιάσετε' : 'Please login to comment');
            return;
        }

        if (!newComment.trim()) {
            alert(lang === 'el' ? 'Παρακαλώ γράψτε ένα σχόλιο' : 'Please write a comment');
            return;
        }

        setSubmitting(true);

        try {
            const userId = Cookies.get('GENUID');
            const query = `INSERT INTO gen_nikimourtzicom.comment (userid, type, typeid, content, reply_id) 
                          VALUES (${userId}, '${contentType}', ${contentId}, '${encodeURIComponent(newComment)}', ${replyTo || 0})`;

            const response = await fetch(`/api/v1/maria/q?query=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (data.success) {
                setNewComment('');
                setReplyTo(null);
                fetchComments();
            } else {
                alert(lang === 'el' ? 'Σφάλμα κατά την αποστολή' : 'Error posting comment');
            }
        } catch (err) {
            console.error('Error posting comment:', err);
            alert(lang === 'el' ? 'Σφάλμα δικτύου' : 'Network error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = (commentId, userName) => {
        setReplyTo(commentId);
        setNewComment(`@${userName} `);
        document.getElementById('comment-input')?.focus();
    };

    const cancelReply = () => {
        setReplyTo(null);
        setNewComment('');
    };

    const getCommentCount = () => {
        const total = comments.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0);
        return total;
    };
    const getImageSrc = (img) => {
        if (!img) return "/assets/hero.png";
        if (img.startsWith("http")) return img;
        return `/media/${img}`;
    };
    if (loading) {
        return (
            <div className="comments-loading">
                <div className="loading-spinner"></div>
                <p>{lang === 'el' ? 'Φόρτωση σχολίων...' : 'Loading comments...'}</p>
            </div>
        );
    }

    return (
        <div className="comments-section">
            <div className="comments-header">
                <h3>
                    {lang === 'el' ? 'Σχόλια' : 'Comments'}
                    <span className="comment-count">{getCommentCount()}</span>
                </h3>
            </div>

            {/* Comment Form */}
            <div className="comment-form-container">
                <div className="comment-form">
                    <div className="comment-avatar">
                        {isLoggedIn && user?.img ? (
                            <img src={getImageSrc(user.img)} alt={user?.name} />
                        ) : (
                            <div className="avatar-placeholder">👤</div>
                        )}
                    </div>
                    <div className="comment-input-wrapper">
                        {replyTo && (
                            <div className="reply-badge">
                                {lang === 'el' ? 'Απάντηση σε:' : 'Replying to:'}
                                <button onClick={cancelReply} className="cancel-reply">
                                    ✕ {lang === 'el' ? 'Ακύρωση' : 'Cancel'}
                                </button>
                            </div>
                        )}
                        <textarea
                            id="comment-input"
                            className="comment-input"
                            rows="3"
                            placeholder={isLoggedIn
                                ? (lang === 'el' ? 'Γράψτε το σχόλιό σας...' : 'Write your comment...')
                                : (lang === 'el' ? 'Συνδεθείτε για να σχολιάσετε' : 'Login to comment')
                            }
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            disabled={!isLoggedIn || submitting}
                        />
                        <button
                            className="submit-comment"
                            onClick={handleSubmitComment}
                            disabled={!isLoggedIn || submitting || !newComment.trim()}
                        >
                            {submitting
                                ? (lang === 'el' ? 'Αποστολή...' : 'Sending...')
                                : (lang === 'el' ? 'Δημοσίευση' : 'Post Comment')
                            }
                        </button>
                    </div>
                </div>
            </div>

            {/* Comments List */}
            {comments.length === 0 ? (
                <div className="no-comments">
                    <p>{lang === 'el' ? 'Δεν υπάρχουν σχόλια ακόμα. Γίνε ο πρώτος!' : 'No comments yet. Be the first!'}</p>
                </div>
            ) : (
                <div className="comments-list">
                    {comments.map((comment) => (
                        <div key={comment.id} className="comment-thread">
                            {/* Main Comment */}
                            <div className="comment-item">
                                <div className="comment-avatar">
                                    <img src={getUserAvatar(comment)} alt={getUserName(comment)} />
                                </div>
                                <div className="comment-content">
                                    <div className="comment-header">
                                        <span className="comment-author">{getUserName(comment)}</span>
                                        <span className="comment-date">{formatDate(comment.created)}</span>
                                    </div>
                                    <div className="comment-text">{decodeURIComponent(comment.content)}</div>
                                    <div className="comment-actions">
                                        <button
                                            className="reply-btn"
                                            onClick={() => handleReply(comment.id, getUserName(comment))}
                                            disabled={!isLoggedIn}
                                        >
                                            💬 {lang === 'el' ? 'Απάντηση' : 'Reply'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                                <div className="replies-section">
                                    {comment.replies.map((reply) => (
                                        <div key={reply.id} className="comment-item reply">
                                            <div className="comment-avatar">
                                                <img src={getUserAvatar(reply)} alt={getUserName(reply)} />
                                            </div>
                                            <div className="comment-content">
                                                <div className="comment-header">
                                                    <span className="comment-author">{getUserName(reply)}</span>
                                                    <span className="comment-date">{formatDate(reply.created)}</span>
                                                </div>
                                                <div className="comment-text">{decodeURIComponent(reply.content)}</div>
                                                <div className="comment-actions">
                                                    <button
                                                        className="reply-btn"
                                                        onClick={() => handleReply(comment.id, getUserName(reply))}
                                                        disabled={!isLoggedIn}
                                                    >
                                                        💬 {lang === 'el' ? 'Απάντηση' : 'Reply'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}