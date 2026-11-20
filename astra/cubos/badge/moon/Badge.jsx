import { useState, useCallback } from 'react';
import "./Badge.css";

const defaultBadges = [
    { level: 1, title: 'Newcomer', icon: '🏆', description: 'Welcome to the journey! This badge marks your first step.' },
    { level: 2, title: 'Explorer', icon: '🌍', description: 'You have completed your first goal!' },
    { level: 3, title: 'Achiever', icon: '⭐', description: 'Consistency is your superpower.' },
    { level: 4, title: 'Challenger', icon: '🔥', description: 'You push beyond your limits.' },
    { level: 5, title: 'Expert', icon: '🎯', description: 'Halfway there — sharp and focused.' },
    { level: 6, title: 'Mentor', icon: '🧭', description: 'You help others find their way.' },
    { level: 7, title: 'Champion', icon: '🥇', description: 'A true competitor.' },
    { level: 8, title: 'Master', icon: '👑', description: 'Skill refined through dedication.' },
    { level: 9, title: 'Legend', icon: '💎', description: 'Rare and unforgettable.' },
    { level: 10, title: 'Grandmaster', icon: '🌟', description: 'The pinnacle of the journey.' },
];

const Badge = ({ badges = defaultBadges }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const totalBadges = badges.length;

    const navigateBadge = useCallback((direction) => {
        setCurrentIndex((prev) => (prev + direction + totalBadges) % totalBadges);
    }, [totalBadges]);

    if (!totalBadges) return null;

    return (
        <>
            <div className="badge-cubo-container">
                <div
                    className="badge-cubo"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {badges.map((badge) => (
                        <div className="badge-card" key={badge.level}>
                            <div className="badge-icon">{badge.icon}</div>
                            <h4>Level {badge.level} - {badge.title}</h4>
                            <p>{badge.description}</p>
                        </div>
                    ))}
                </div>

                <div
                    className="badge-nav nav-left"
                    onClick={() => navigateBadge(-1)}
                    role="button"
                    aria-label="Previous badge"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && navigateBadge(-1)}
                >
                    &#10094;
                </div>
                <div
                    className="badge-nav nav-right"
                    onClick={() => navigateBadge(1)}
                    role="button"
                    aria-label="Next badge"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && navigateBadge(1)}
                >
                    &#10095;
                </div>
            </div>
        </>
    );
};

export default Badge;