// #name: Like
// #cubo: social
// #title: a custom like button
// #description:
// #version: 0.0.1
// #author: Nicolas
import { useState, useEffect } from 'react';
import './LikeButton.css';

export default function LikeButton({ contentId, initialLikes = 0, lang = 'en' }) {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(initialLikes);
    const [isLoading, setIsLoading] = useState(false);

    // Φόρτωση saved like status από localStorage
    useEffect(() => {
        if (contentId) {
            const savedLike = localStorage.getItem(`liked_${contentId}`);
            if (savedLike === 'true') {
                setLiked(true);
            } else {
                setLiked(false);
            }
            setLikeCount(initialLikes);
        }
    }, [contentId, initialLikes]);

    const handleLike = async () => {
        if (isLoading) return;

        setIsLoading(true);

        const newLikedState = !liked;
        const newLikeCount = newLikedState ? likeCount + 1 : likeCount - 1;

        // Update UI immediately
        setLiked(newLikedState);
        setLikeCount(newLikeCount);

        // Save to localStorage
        if (newLikedState) {
            localStorage.setItem(`liked_${contentId}`, 'true');
        } else {
            localStorage.removeItem(`liked_${contentId}`);
        }

        // Update database
        try {
            const response = await fetch(`/api/v1/maria/q?query=UPDATE gen_nikimourtzicom.content SET liking = ${newLikeCount} WHERE id = ${contentId}`);
            if (!response.ok) {
                // Rollback if failed
                setLiked(!newLikedState);
                setLikeCount(likeCount);
                if (!newLikedState) {
                    localStorage.setItem(`liked_${contentId}`, 'true');
                } else {
                    localStorage.removeItem(`liked_${contentId}`);
                }
            }
        } catch (err) {
            console.error('Error updating like:', err);
            // Rollback on error
            setLiked(!newLikedState);
            setLikeCount(likeCount);
            if (!newLikedState) {
                localStorage.setItem(`liked_${contentId}`, 'true');
            } else {
                localStorage.removeItem(`liked_${contentId}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getText = () => {
        if (liked) return lang === 'el' ? 'Αφαίρεση like' : 'Unlike';
        return lang === 'el' ? 'Μου αρέσει' : 'Like';
    };

    return (
            <button
                className={`like-btn ${liked ? 'liked' : ''} ${isLoading ? 'loading' : ''}`}
                onClick={handleLike}
                disabled={isLoading}
            >
                <span className="like-icon">
                    {liked ? '❤️' : '🤍'}
                </span>
                <span className="like-text">{getText()}</span>
                {likeCount > 0 && (
                    <span className="like-count">{likeCount}</span>
                )}
            </button>
    );
}