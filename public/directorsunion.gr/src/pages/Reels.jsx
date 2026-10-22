// /pages/Reels.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
    FaHeart,
    FaComment,
    FaShare,
    FaPlay,
    FaPause,
    FaVolumeUp,
    FaVolumeMute,
    FaEllipsisH,
    FaMusic,
    FaInstagram
} from 'react-icons/fa';
import './Reels.css';

const Reels = () => {
    const { theme } = useTheme();
    const [reels, setReels] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [playingStates, setPlayingStates] = useState({});
    const [mutedStates, setMutedStates] = useState({});
    const videoRefs = useRef({});

    // Sample reels data - αυτά θα έρχονται από API
    const sampleReels = [
        {
            id: 1,
            videoUrl: "/videos/reel1.mp4",
            coverImage: "/images/reel1-cover.jpg",
            user: {
                name: "Κώστας Σταματόπουλος",
                avatar: "/images/avatar1.jpg",
                role: "Πρόεδρος ΔΣ"
            },
            likes: 1234,
            comments: 89,
            shares: 45,
            description: "Μήνυμα από τον Πρόεδρο της Ένωσης για τη νέα σεζόν",
            music: "Original Audio",
            createdAt: "2026-05-20"
        },
        {
            id: 2,
            videoUrl: "/videos/reel2.mp4",
            coverImage: "/images/reel2-cover.jpg",
            user: {
                name: "Στρατούλα Θεοδωράτου",
                avatar: "/images/avatar2.jpg",
                role: "Αντιπρόεδρος"
            },
            likes: 2345,
            comments: 156,
            shares: 78,
            description: "Η δύναμη της συλλογικότητας - Μήνυμα αλληλεγγύης",
            music: "Original Audio",
            createdAt: "2026-05-18"
        },
        {
            id: 3,
            videoUrl: "/videos/reel3.mp4",
            coverImage: "/images/reel3-cover.jpg",
            user: {
                name: "Γιάννης Κατωμερής",
                avatar: "/images/avatar3.jpg",
                role: "Γραμματέας"
            },
            likes: 3456,
            comments: 234,
            shares: 123,
            description: "Ανοιχτή πρόσκληση σε νέα μέλη",
            music: "Original Audio",
            createdAt: "2026-05-15"
        },
        {
            id: 4,
            videoUrl: "/videos/reel4.mp4",
            coverImage: "/images/reel4-cover.jpg",
            user: {
                name: "Κώστας Φέρρης",
                avatar: "/images/avatar4.jpg",
                role: "Επίτιμος Πρόεδρος"
            },
            likes: 5678,
            comments: 345,
            shares: 234,
            description: "Η σημασία της Ένωσης για τον κλάδο μας",
            music: "Original Audio",
            createdAt: "2026-05-10"
        }
    ];

    useEffect(() => {
        // Προσομοίωση fetch από API
        setTimeout(() => {
            setReels(sampleReels);
            setLoading(false);

            // Initialize playing states - first reel playing by default
            const initialPlaying = {};
            const initialMuted = {};
            sampleReels.forEach(reel => {
                initialPlaying[reel.id] = false;
                initialMuted[reel.id] = true; // Muted by default for autoplay policies
            });
            initialPlaying[sampleReels[0].id] = true;
            setPlayingStates(initialPlaying);
            setMutedStates(initialMuted);
        }, 1000);
    }, []);

    // Handle scroll for infinite scroll and visibility detection
    useEffect(() => {
        const handleScroll = () => {
            const videoElements = document.querySelectorAll('.reel-video');
            const windowHeight = window.innerHeight;

            Object.keys(videoRefs.current).forEach((id) => {
                const videoElement = videoRefs.current[id];
                if (videoElement) {
                    const rect = videoElement.getBoundingClientRect();
                    const isVisible = rect.top >= 0 && rect.bottom <= windowHeight;

                    if (isVisible && playingStates[id] === false) {
                        // Play video when it comes into view
                        handlePlay(id);
                    } else if (!isVisible && playingStates[id] === true) {
                        // Pause video when it goes out of view
                        handlePause(id);
                    }
                }
            });
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [playingStates]);

    const handlePlay = (id) => {
        setPlayingStates(prev => ({ ...prev, [id]: true }));
        const video = videoRefs.current[id];
        if (video) {
            video.play().catch(e => console.log('Play error:', e));
        }
    };

    const handlePause = (id) => {
        setPlayingStates(prev => ({ ...prev, [id]: false }));
        const video = videoRefs.current[id];
        if (video) {
            video.pause();
        }
    };

    const handleTogglePlay = (id) => {
        if (playingStates[id]) {
            handlePause(id);
        } else {
            handlePlay(id);
        }
    };

    const handleToggleMute = (id) => {
        setMutedStates(prev => ({ ...prev, [id]: !prev[id] }));
        const video = videoRefs.current[id];
        if (video) {
            video.muted = !mutedStates[id];
        }
    };

    const handleLike = (id) => {
        setReels(prev => prev.map(reel =>
            reel.id === id
                ? { ...reel, likes: reel.likes + 1, liked: true }
                : reel
        ));
    };

    const handleShare = async (reel) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: reel.description,
                    text: `Δες αυτό το reel από την Ένωση Σκηνοθετών Δημιουργών: ${reel.description}`,
                    url: window.location.href
                });
            } catch (error) {
                console.log('Share cancelled:', error);
            }
        } else {
            // Fallback - copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    const handleVideoEnded = (id, index) => {
        // Auto-play next reel when current ends
        if (index < reels.length - 1) {
            setCurrentIndex(index + 1);
            handlePlay(reels[index + 1].id);
        }
    };

    if (loading) {
        return (
            <div className={`reels-loading ${theme}`}>
                <div className="reels-spinner"></div>
                <p>Φόρτωση reels...</p>
            </div>
        );
    }

    return (
        <div className={`reels-container ${theme}`}>
            <div className="reels-header">
                <h1>Reels</h1>
                <p>Σύντομα βίντεο από την Ένωση Σκηνοθετών Δημιουργών</p>
            </div>

            <div className="reels-feed">
                {reels.map((reel, index) => (
                    <div key={reel.id} className="reel-wrapper">
                        <div className="reel-container">
                            {/* Video Player */}
                            <div className="reel-video-container">
                                <video
                                    ref={el => videoRefs.current[reel.id] = el}
                                    src={reel.videoUrl}
                                    poster={reel.coverImage}
                                    className="reel-video"
                                    loop={false}
                                    playsInline
                                    muted={mutedStates[reel.id]}
                                    onClick={() => handleTogglePlay(reel.id)}
                                    onEnded={() => handleVideoEnded(reel.id, index)}
                                />

                                {/* Play/Pause Overlay */}
                                {!playingStates[reel.id] && (
                                    <div className="play-overlay" onClick={() => handleTogglePlay(reel.id)}>
                                        <FaPlay className="play-icon" />
                                    </div>
                                )}

                                {/* Volume Control */}
                                <button
                                    className="volume-control"
                                    onClick={() => handleToggleMute(reel.id)}
                                >
                                    {mutedStates[reel.id] ? <FaVolumeMute /> : <FaVolumeUp />}
                                </button>
                            </div>

                            {/* Side Actions */}
                            <div className="reel-actions">
                                <button
                                    className={`action-btn like-btn ${reel.liked ? 'liked' : ''}`}
                                    onClick={() => handleLike(reel.id)}
                                >
                                    <FaHeart />
                                    <span>{reel.likes}</span>
                                </button>

                                <button className="action-btn">
                                    <FaComment />
                                    <span>{reel.comments}</span>
                                </button>

                                <button className="action-btn" onClick={() => handleShare(reel)}>
                                    <FaShare />
                                    <span>{reel.shares}</span>
                                </button>

                                <button className="action-btn">
                                    <FaEllipsisH />
                                </button>
                            </div>

                            {/* Info Section */}
                            <div className="reel-info">
                                <div className="reel-user">
                                    <img src={reel.user.avatar} alt={reel.user.name} className="user-avatar" />
                                    <div className="user-info">
                                        <span className="user-name">{reel.user.name}</span>
                                        <span className="user-role">{reel.user.role}</span>
                                    </div>
                                </div>

                                <div className="reel-description">
                                    <p>{reel.description}</p>
                                </div>

                                <div className="reel-music">
                                    <FaMusic />
                                    <span>{reel.music}</span>
                                </div>

                                <div className="reel-timestamp">
                                    {new Date(reel.createdAt).toLocaleDateString('el-GR')}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Instagram Link */}
            <div className="reels-footer">
                <a
                    href="https://www.instagram.com/directorsunion"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="instagram-link"
                >
                    <FaInstagram />
                    Ακολουθήστε μας στο Instagram για περισσότερα Reels
                </a>
            </div>
        </div>
    );
};

export default Reels;