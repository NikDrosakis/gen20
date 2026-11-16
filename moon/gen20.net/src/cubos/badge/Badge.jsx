import { useState, useCallback } from 'react';

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

const styles = `
.badge-cubo-container {
    position: relative;
    width: 100%;
    overflow: hidden;
    background-color: #f9f9f9;
    border-radius: 8px;
}

.badge-cubo {
    display: flex;
    transition: transform 0.5s ease;
}

.badge-card {
    min-width: 100%;
    padding: 20px;
    text-align: center;
    border-radius: 8px;
    background-color: #fff;
    box-sizing: border-box;
}

.badge-card h4 {
    margin: 10px 0 6px;
    font-size: 1.1rem;
}

.badge-card p {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.8;
}

.badge-icon {
    font-size: 3rem;
    line-height: 1;
}

.badge-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    font-size: 24px;
    user-select: none;
    padding: 4px 8px;
}

.nav-left {
    left: 10px;
}

.nav-right {
    right: 10px;
}
`;

const Badge = ({ badges = defaultBadges }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const totalBadges = badges.length;

    const navigateBadge = useCallback((direction) => {
        setCurrentIndex((prev) => (prev + direction + totalBadges) % totalBadges);
    }, [totalBadges]);

    if (!totalBadges) return null;

    return (
        <>
            <style>{styles}</style>
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