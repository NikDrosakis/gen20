// /pages/Radio.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
    FaPlay,
    FaPause,
    FaVolumeUp,
    FaVolumeMute,
    FaMicrophone,
    FaHeadphones,
    FaPodcast,
    FaCalendarAlt,
    FaClock,
    FaUsers,
    FaHeart,
    FaShareAlt,
    FaDownload
} from 'react-icons/fa';
import './Radio.css';

const Radio = () => {
    const { theme } = useTheme();
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(80);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState('0:00');
    const [duration, setDuration] = useState('0:00');
    const audioRef = useRef(null);

    // Ραδιοφωνικό πρόγραμμα
    const schedule = [
        { time: "09:00 - 11:00", show: "Πρωινή Εκπομπή", host: "Νίκος Δημητρίου", genre: "Ενημέρωση" },
        { time: "11:00 - 13:00", show: "Σκηνοθετώντας τον Λόγο", host: "Μαρία Αντωνίου", genre: "Συζήτηση" },
        { time: "13:00 - 15:00", show: "Μουσικές Διαδρομές", host: "Γιώργος Νικολαΐδης", genre: "Μουσική" },
        { time: "15:00 - 17:00", show: "Από το Σενάριο στη Σκηνή", host: "Ελένη Βλάχου", genre: "Θέατρο" },
        { time: "17:00 - 19:00", show: "Κινηματογραφικές Ακτίνες", host: "Αντώνης Παπαδόπουλος", genre: "Κινηματογράφος" },
        { time: "19:00 - 21:00", show: "Δημιουργική Ανταλλαγή", host: "Σοφία Παπαδοπούλου", genre: "Συνέντευξη" },
        { time: "21:00 - 23:00", show: "Νυχτερινές Συχνότητες", host: "Πέτρος Αλεξίου", genre: "Ηχητικά Δρώμενα" }
    ];

    // Πρόσφατα επεισόδια / Podcasts
    const recentEpisodes = [
        {
            id: 1,
            title: "Η λογοκρισία στις τέχνες - Ανοιχτή συζήτηση",
            host: "Κώστας Σταματόπουλος",
            date: "25 Απριλίου 2026",
            duration: "1:23:45",
            image: "/images/podcast1.jpg",
            plays: 1247
        },
        {
            id: 2,
            title: "Δικαιώματα σκηνοθετών στην ψηφιακή εποχή",
            host: "Στρατούλα Θεοδωράτου",
            date: "18 Απριλίου 2026",
            duration: "52:30",
            image: "/images/podcast2.jpg",
            plays: 892
        },
        {
            id: 3,
            title: "Η Ένωση αγωνίζεται - Ανασκόπηση 2025",
            host: "Γιάννης Κατωμερής",
            date: "10 Απριλίου 2026",
            duration: "1:45:20",
            image: "/images/podcast3.jpg",
            plays: 2156
        },
        {
            id: 4,
            title: "Συνέντευξη με τον Κώστα Φέρρη",
            host: "Σήφης Στάμου",
            date: "3 Απριλίου 2026",
            duration: "1:15:00",
            image: "/images/podcast4.jpg",
            plays: 3421
        }
    ];

    // Προτεινόμενες μουσικές / playlist
    const playlist = [
        { title: "Εισαγωγή - Ραδιοφωνικό Σήμα", artist: "Ένωση Σκηνοθετών", duration: "0:45" },
        { title: "Δημιουργία και Αντίσταση", artist: "Συλλογικό Έργο", duration: "4:30" },
        { title: "Ο Λόγος του Σκηνοθέτη", artist: "Πολιτιστική Ομάδα", duration: "3:15" },
        { title: "Ενωμένοι Δημιουργοί", artist: "Ραδιοφωνική Παραγωγή", duration: "5:20" }
    ];

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume / 100;
        }
    }, [volume, isMuted]);

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
        // Εδώ θα συνδεθείς με το πραγματικό ραδιοφωνικό stream
        if (!isPlaying) {
            // audioRef.current.play();
        } else {
            // audioRef.current.pause();
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseInt(e.target.value);
        setVolume(newVolume);
        setIsMuted(false);
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    return (
        <div className={`radio-page ${theme}`}>
            {/* Hero Section */}
            <section className="radio-hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="radio-logo">
                            <FaHeadphones />
                            <h1>Ραδιόφωνο της Ένωσης</h1>
                        </div>
                        <p className="hero-tagline">
                            Η φωνή των δημιουργών στον αέρα
                        </p>
                        <p className="hero-description">
                            24/7 ραδιοφωνική μετάδοση με εκπομπές, μουσική, συνεντεύξεις και αγωνιστικά μηνύματα.
                            Η τέχνη αντιστέκεται, η δημιουργία δεν σταματά.
                        </p>
                    </div>
                </div>
            </section>

            {/* Live Radio Player */}
            <section className="player-section">
                <div className="container">
                    <div className="player-container">
                        <div className="player-header">
                            <div className="live-badge">
                                <span className="live-dot"></span>
                                LIVE
                            </div>
                            <h2>Ζωντανή Μετάδοση</h2>
                        </div>

                        <div className="player-controls">
                            <button onClick={togglePlay} className="play-btn">
                                {isPlaying ? <FaPause /> : <FaPlay />}
                            </button>

                            <div className="player-info">
                                <div className="now-playing">
                                    <span className="label">Παίζει τώρα:</span>
                                    <span className="track">Πρωινή Εκπομπή - Νίκος Δημητρίου</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress" style={{ width: '45%' }}></div>
                                </div>
                                <div className="time-info">
                                    <span>{currentTime}</span>
                                    <span>{duration}</span>
                                </div>
                            </div>

                            <div className="volume-control">
                                <button onClick={toggleMute} className="volume-btn">
                                    {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="volume-slider"
                                />
                            </div>
                        </div>

                        <audio ref={audioRef} src="/radio-stream.mp3" />
                    </div>
                </div>
            </section>

            {/* Schedule Section */}
            <section className="schedule-section">
                <div className="container">
                    <div className="section-header">
                        <FaCalendarAlt />
                        <h2>Ραδιοφωνικό Πρόγραμμα</h2>
                    </div>
                    <div className="schedule-grid">
                        {schedule.map((item, index) => (
                            <div key={index} className="schedule-card">
                                <div className="schedule-time">{item.time}</div>
                                <div className="schedule-info">
                                    <h3>{item.show}</h3>
                                    <p className="schedule-host">
                                        <FaMicrophone /> {item.host}
                                    </p>
                                    <span className="schedule-genre">{item.genre}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Recent Episodes / Podcasts */}
            <section className="podcast-section">
                <div className="container">
                    <div className="section-header">
                        <FaPodcast />
                        <h2>Πρόσφατα Επεισόδια</h2>
                    </div>
                    <div className="podcast-grid">
                        {recentEpisodes.map(episode => (
                            <div key={episode.id} className="podcast-card">
                                <div className="podcast-image">
                                    <img src={episode.image} alt={episode.title} />
                                    <div className="podcast-overlay">
                                        <button className="listen-btn">
                                            <FaPlay /> Ακούστε
                                        </button>
                                    </div>
                                </div>
                                <div className="podcast-info">
                                    <h3>{episode.title}</h3>
                                    <div className="podcast-meta">
                                        <span><FaMicrophone /> {episode.host}</span>
                                        <span><FaCalendarAlt /> {episode.date}</span>
                                        <span><FaClock /> {episode.duration}</span>
                                        <span><FaUsers /> {episode.plays} ακροάσεις</span>
                                    </div>
                                    <div className="podcast-actions">
                                        <button className="action-btn"><FaHeart /> Αρέσει</button>
                                        <button className="action-btn"><FaShareAlt /> Κοινοποίηση</button>
                                        <button className="action-btn"><FaDownload /> Λήψη</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Playlist Section */}
            <section className="playlist-section">
                <div className="container">
                    <div className="section-header">
                        <FaHeadphones />
                        <h2>Προτεινόμενη Λίστα</h2>
                    </div>
                    <div className="playlist">
                        {playlist.map((track, index) => (
                            <div key={index} className="playlist-item">
                                <div className="playlist-number">{index + 1}</div>
                                <div className="playlist-info">
                                    <h4>{track.title}</h4>
                                    <p>{track.artist}</p>
                                </div>
                                <div className="playlist-duration">{track.duration}</div>
                                <button className="playlist-play">
                                    <FaPlay />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="radio-cta">
                <div className="container">
                    <div className="cta-content">
                        <h2>Θέλεις να συμμετάσχεις;</h2>
                        <p>
                            Έχεις ιδέα για εκπομπή; Θέλεις να φιλοξενηθείς ή να προωθήσεις τη δουλειά σου;
                            Το Ραδιόφωνο της Ένωσης είναι ανοιχτό σε όλους τους δημιουργούς.
                        </p>
                        <div className="cta-buttons">
                            <button className="btn-primary">Πρότεινε Εκπομπή</button>
                            <button className="btn-secondary">Στείλε Μήνυμα</button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Radio;