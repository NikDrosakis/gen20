import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../ThemeContext';

const Audioplayer = ({ tracks = [] }) => {
    const { theme } = useTheme();
    const audioRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState('0:00');
    const [duration, setDuration] = useState('0:00');

    const currentTrack = tracks[currentIndex];

    // Apply theme as CSS variables on root
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--primary', theme.primary);
        root.style.setProperty('--player-bg', theme.background);
        root.style.setProperty('--player-text', theme.text);
        root.style.setProperty('--progress-bg', theme.progressBg);
    }, [theme]);

    const formatTime = (secs) => {
        if (isNaN(secs)) return '0:00';
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const loadSong = (index) => {
        setCurrentIndex(index);
        setProgress(0);
    };

    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (!audio || !currentTrack) return;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const nextSong = () => {
        if (!tracks.length) return;
        const next = (currentIndex + 1) % tracks.length;
        setCurrentIndex(next);
        setIsPlaying(true);
    };

    const prevSong = () => {
        if (!tracks.length) return;
        const prev = (currentIndex - 1 + tracks.length) % tracks.length;
        setCurrentIndex(prev);
        setIsPlaying(true);
    };

    const selectSong = (index) => {
        setCurrentIndex(index);
        setIsPlaying(true);
    };

    const handleTimeUpdate = () => {
        const audio = audioRef.current;
        if (!audio) return;
        const pct = (audio.currentTime / (audio.duration || 1)) * 100;
        setProgress(pct);
        setCurrentTime(formatTime(audio.currentTime));
    };

    const handleLoadedMetadata = () => {
        const audio = audioRef.current;
        if (audio) setDuration(formatTime(audio.duration));
    };

    const handleSeek = (e) => {
        const audio = audioRef.current;
        if (!audio) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        audio.currentTime = pct * audio.duration;
    };

    // Play/pause side-effect when track or isPlaying changes
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentTrack) return;
        if (isPlaying) {
            audio.play().catch(() => setIsPlaying(false));
        } else {
            audio.pause();
        }
    }, [currentIndex, isPlaying, currentTrack]);

    return (
        <div className="audio-player-cubo">
            <div className="player-header">
                <h3>{currentTrack ? currentTrack.title : 'Select a Song'}</h3>
            </div>

            {currentTrack && (
                <audio
                    ref={audioRef}
                    src={currentTrack.src}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={nextSong}
                />
            )}

            <div className="controls">
                <button onClick={prevSong} aria-label="Previous">&#10094;</button>
                <button onClick={togglePlayPause} aria-label="Play/Pause">
                    {isPlaying ? '⏸️' : '▶️'}
                </button>
                <button onClick={nextSong} aria-label="Next">&#10095;</button>
            </div>

            <div className="time-row">
                <span>{currentTime}</span>
                <div className="progress-container" onClick={handleSeek}>
                    <div className="progress-bar" style={{ width: `${progress}%` }} />
                </div>
                <span>{duration}</span>
            </div>

            <div className="playlist">
                <ul>
                    {tracks.map((track, i) => (
                        <li
                            key={track.title}
                            className={i === currentIndex ? 'active' : ''}
                            onClick={() => selectSong(i)}
                        >
                            {track.title}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Audioplayer;