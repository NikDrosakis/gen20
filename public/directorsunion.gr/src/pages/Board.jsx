/* pages/Board.jsx */
import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './Board.css';

const publicdb = 'gen_' + window.location.hostname.replace(/\./g, '');

const Board = () => {
    const { theme } = useTheme();
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

    return (
        <div className={`board-page ${theme}`}>
            <div className="board-container">
                <div className="container">

                    {/* Board Content */}
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

                </div>
            </div>
        </div>
    );
};

export default Board;