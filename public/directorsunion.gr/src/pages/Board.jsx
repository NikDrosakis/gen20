
/* pages/Board.jsx */
import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './Board.css';

const publicdb = 'gen_' + window.location.hostname.replace(/\./g, '');

const Board = () => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('board');
    const [boardMembers, setBoardMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Διοικητικό Συμβούλιο: φόρτωση από τον πίνακα user
    useEffect(() => {
        const fetchBoardMembers = async () => {
            setLoading(true);
            setError('');

            try {
                const query = `
                    SELECT
                        u.id,
                        u.fullname,
                        u.title,
                        u.img
                    FROM ${publicdb}.\`user\` AS u
                    WHERE u.classificationid = 5
                      AND u.display = 1
                    ORDER BY u.id ASC
                `;

                const response = await fetch(
                    `/api/v1/maria/fa?folder=${encodeURIComponent(query)}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }

                const result = await response.json();

                if (!result.success || !Array.isArray(result.data)) {
                    throw new Error(
                        result.error || 'Αποτυχία φόρτωσης μελών.'
                    );
                }

                setBoardMembers(result.data);
            } catch (err) {
                console.error('Error fetching board members:', err);
                setError('Δεν ήταν δυνατή η φόρτωση του Διοικητικού Συμβουλίου.');
                setBoardMembers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBoardMembers();
    }, []);

    // Ιδρυτικά Μέλη
    const foundingMembers = [
        {
            name: 'Κώστας Φέρρης',
            role: 'Επίτιμος Πρόεδρος & Ιδρυτικό Μέλος'
        },
        {
            name: 'Κώστας Σταματόπουλος',
            role: 'Ιδρυτικό Μέλος'
        },
        {
            name: 'Στρατούλα Θεοδωράτου',
            role: 'Ιδρυτικό Μέλος'
        },
        {
            name: 'Γιάννης Κατωμερής',
            role: 'Ιδρυτικό Μέλος'
        },
        {
            name: 'Σήφης Στάμου',
            role: 'Ιδρυτικό Μέλος'
        },
        {
            name: 'Λεωνίδας Βαρδαρός',
            role: 'Ιδρυτικό Μέλος'
        },
        {
            name: 'Γκαίη Αγγελή',
            role: 'Ιδρυτικό Μέλος'
        },
        {
            name: 'Στέφανος Χατζημιχαηλίδης',
            role: 'Ιδρυτικό Μέλος'
        },
        {
            name: 'Στέφανος Μονδέλο',
            role: 'Ιδρυτικό Μέλος'
        }
    ];

    return (
        <div className={`board-page ${theme}`}>
            <div className="board-container">
                <div className="container">

                    {/* Tabs Navigation */}
                    <div className="board-tabs">
                        <button
                            className={`tab-btn ${
                                activeTab === 'board' ? 'active' : ''
                            }`}
                            onClick={() => setActiveTab('board')}
                        >
                            Διοικητικό Συμβούλιο
                        </button>

                        <button
                            className={`tab-btn ${
                                activeTab === 'founding' ? 'active' : ''
                            }`}
                            onClick={() => setActiveTab('founding')}
                        >
                            Ιδρυτικά Μέλη
                        </button>
                    </div>

                    {/* Board Tab */}
                    {activeTab === 'board' && (
                        <div className="board-tab">
                            <div className="board-note">
                                <p>
                                    Προσωρινή Διοίκηση (από 11 Ιουνίου 2024)
                                    — Εννιαμελές Διοικητικό Συμβούλιο
                                </p>
                            </div>

                            {loading ? (
                                <p>Φόρτωση μελών...</p>
                            ) : error ? (
                                <p role="alert">{error}</p>
                            ) : boardMembers.length === 0 ? (
                                <p>
                                    Δεν βρέθηκαν μέλη για το Διοικητικό
                                    Συμβούλιο.
                                </p>
                            ) : (
                                <div className="board-grid">
                                    {boardMembers.map((member) => (
                                        <div
                                            key={member.id}
                                            className="board-card"
                                        >
                                            <div className="board-avatar">
                                                {member.img ? (
                                                    <img
                                                        src={`/media/${member.img.replace(/^\/+/, '')}`}
                                                        alt={member.fullname || ''}
                                                    />
                                                ) : (
                                                    <span className="avatar-icon">
            🎬
        </span>
                                                )}
                                            </div>

                                            <div className="board-details">
                                                <h3>{member.fullname}</h3>
                                                <span className="board-position">
                                                    {member.title === 'Πρόεδρος'
                                                        ? 'Πρόεδρος (από 11/06/2024)'
                                                        : member.title}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Founding Members Tab */}
                    {activeTab === 'founding' && (
                        <div className="founding-tab">
                            <div className="founding-intro">
                                <p>
                                    Η <strong>Ιδρυτική Συνέλευση</strong>{' '}
                                    πραγματοποιήθηκε στις{' '}
                                    <strong>5 Νοεμβρίου 2022</strong>.
                                    Τα ιδρυτικά μέλη αποτελούν τον πυρήνα
                                    της Ένωσης και συνεχίζουν να υπηρετούν
                                    το όραμά της.
                                </p>
                            </div>

                            <div className="founding-grid">
                                {foundingMembers.map((member, index) => (
                                    <div
                                        key={index}
                                        className="founding-card"
                                    >
                                        <div className="founding-icon">
                                            🎬
                                        </div>

                                        <div className="founding-info">
                                            <h4>{member.name}</h4>
                                            <span className="founding-role">
                                                {member.role}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Board;
