// components/VideoPanel.jsx
import React, { useState, useEffect } from 'react';
import './VideoPanel.css';

const VideoPanel = () => {
    const [videos, setVideos] = useState([]);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            // 🔹 ΔΙΟΡΘΩΣΗ: type='video' ή type='youtube'
            const query = `SELECT * FROM ${publicdb}.links WHERE type IN ('video') ORDER BY sort ASC`;
            const encodedQuery = encodeURIComponent(query);
            const response = await fetch(`/api/v1/maria/fa?folder=${encodedQuery}`);
            const result = await response.json();

            console.log('API Response:', result);

            if (result.success && result.data && result.data.length > 0) {
                const processedVideos = result.data.map(video => ({
                    ...video,
                    displayTitle: video.title || `Video ${video.id}`,
                    embedUrl: getEmbedUrl(video.url, video.type),
                    thumbnail: getThumbnailFromUrl(video.url, video.type)
                }));
                setVideos(processedVideos);
                if (processedVideos.length > 0) {
                    setCurrentVideo(processedVideos[0]);
                }
            } else {
                console.log('No videos found');
                setVideos([]);
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Network error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // 🔹 ΔΙΟΡΘΩΣΗ: Υποστήριξη και για 'video' και για 'youtube'
    const getEmbedUrl = (url, type) => {
        // Normalize type
        const normalizedType = type === 'video' ? 'youtube' : type;

        switch(normalizedType) {
            case 'youtube':
                const youtubeId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?#]+)/)?.[1];
                return youtubeId ? `https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0&modestbranding=1` : url;
            case 'vimeo':
                const vimeoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
                return vimeoId ? `https://player.vimeo.com/video/${vimeoId}?autoplay=0` : url;
            case 'dailymotion':
                const dmId = url.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/)?.[1];
                return dmId ? `https://www.dailymotion.com/embed/video/${dmId}` : url;
            case 'twitch':
                const twitchChannel = url.match(/twitch\.tv\/(\w+)/)?.[1];
                return twitchChannel ? `https://player.twitch.tv/?channel=${twitchChannel}&parent=${window.location.hostname}` : url;
            default:
                return url;
        }
    };

    // 🔹 ΔΙΟΡΘΩΣΗ: Υποστήριξη και για 'video' και για 'youtube'
    const getThumbnailFromUrl = (url, type) => {
        // Normalize type
        const normalizedType = type === 'video' ? 'youtube' : type;

        switch(normalizedType) {
            case 'youtube':
                const youtubeId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?#]+)/)?.[1];
                if (youtubeId) {
                    return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
                }
                return '/assets/video-placeholder.jpg';
            case 'vimeo':
                return '/assets/vimeo-placeholder.jpg';
            default:
                return '/assets/video-placeholder.jpg';
        }
    };

    const handleVideoSelect = (index) => {
        setActiveIndex(index);
        setCurrentVideo(videos[index]);
    };

    const nextVideo = () => {
        const nextIndex = (activeIndex + 1) % videos.length;
        handleVideoSelect(nextIndex);
    };

    const prevVideo = () => {
        const prevIndex = (activeIndex - 1 + videos.length) % videos.length;
        handleVideoSelect(prevIndex);
    };

    if (loading) return (
        <div className="video-panel-loading">
            <div className="loading-spinner"></div>
            <p>Φόρτωση βίντεο...</p>
        </div>
    );

    if (error) return (
        <div className="video-panel-error">
            <p>⚠️ {error}</p>
        </div>
    );

    if (videos.length === 0) return (
        <div className="video-panel-empty">
            <p>📹 Δεν υπάρχουν διαθέσιμα βίντεο</p>
        </div>
    );

    return (
        <div className="video-panel-container">
            <div className="video-panel-hero">
                <div className="video-main">
                    {currentVideo && (
                        <div className="video-wrapper">
                            <iframe
                                src={currentVideo.embedUrl}
                                title={currentVideo.displayTitle}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="video-iframe"
                            />
                            <div className="video-info">
                                <h2>{currentVideo.displayTitle}</h2>
                            </div>
                        </div>
                    )}

                    <div className="video-nav">
                        <button className="nav-btn prev-btn" onClick={prevVideo}>
                            ❮
                        </button>
                        <button className="nav-btn next-btn" onClick={nextVideo}>
                            ❯
                        </button>
                    </div>
                </div>

                <div className="video-thumbnails">
                    {videos.map((video, idx) => (
                        <div
                            key={video.id}
                            className={`thumbnail-item ${idx === activeIndex ? 'active' : ''}`}
                            onClick={() => handleVideoSelect(idx)}
                        >
                            <img
                                src={video.thumbnail}
                                alt={video.displayTitle}
                                className="thumbnail-img"
                                onError={(e) => {
                                    e.target.src = '/assets/video-placeholder.jpg';
                                }}
                            />
                            <div className="thumbnail-overlay">
                                <span className="play-icon">▶</span>
                            </div>
                            <div className="thumbnail-title">{video.displayTitle}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default VideoPanel;