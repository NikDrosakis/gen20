// pages/Board.jsx
import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './Board.css';

const Board = () => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('board');

    // Διοικητικό Συμβούλιο
    const boardMembers = [
        {
            id: 1,
            name: "Κώστας Φέρρης",
            position: "Επίτιμος Πρόεδρος"
        },
        {
            id: 2,
            name: "Κώστας Σταματόπουλος",
            position: "Πρόεδρος (από 11/06/2024)"
        },
        {
            id: 3,
            name: "Στρατούλα Θεοδωράτου",
            position: "Αντιπρόεδρος"
        },
        {
            id: 4,
            name: "Γιάννης Κατωμερής",
            position: "Γραμματέας"
        },
        {
            id: 5,
            name: "Σήφης Στάμου",
            position: "Μέλος"
        },
        {
            id: 6,
            name: "Λεωνίδας Βαρδαρός",
            position: "Μέλος"
        },
        {
            id: 7,
            name: "Γκαίη Αγγελή",
            position: "Μέλος"
        },
        {
            id: 8,
            name: "Στέφανος Χατζημιχαηλίδης",
            position: "Μέλος"
        },
        {
            id: 9,
            name: "Στέφανος Μονδέλο",
            position: "Μέλος"
        }
    ];

    // Ιδρυτικά Μέλη
    const foundingMembers = [
        { name: "Κώστας Φέρρης", role: "Επίτιμος Πρόεδρος & Ιδρυτικό Μέλος" },
        { name: "Κώστας Σταματόπουλος", role: "Ιδρυτικό Μέλος" },
        { name: "Στρατούλα Θεοδωράτου", role: "Ιδρυτικό Μέλος" },
        { name: "Γιάννης Κατωμερής", role: "Ιδρυτικό Μέλος" },
        { name: "Σήφης Στάμου", role: "Ιδρυτικό Μέλος" },
        { name: "Λεωνίδας Βαρδαρός", role: "Ιδρυτικό Μέλος" },
        { name: "Γκαίη Αγγελή", role: "Ιδρυτικό Μέλος" },
        { name: "Στέφανος Χατζημιχαηλίδης", role: "Ιδρυτικό Μέλος" },
        { name: "Στέφανος Μονδέλο", role: "Ιδρυτικό Μέλος" }
    ];

    return (
        <div className={`board-page ${theme}`}>
            <div className="board-container">
                <div className="container">
                    {/* Tabs Navigation */}
                    <div className="board-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'board' ? 'active' : ''}`}
                            onClick={() => setActiveTab('board')}
                        >
                            Διοικητικό Συμβούλιο
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'founding' ? 'active' : ''}`}
                            onClick={() => setActiveTab('founding')}
                        >
                            Ιδρυτικά Μέλη
                        </button>
                    </div>

                    {/* Board Tab */}
                    {activeTab === 'board' && (
                        <div className="board-tab">
                            <div className="board-note">
                                <p>Προσωρινή Διοίκηση (από 11 Ιουνίου 2024) — Εννιαμελές Διοικητικό Συμβούλιο</p>
                            </div>
                            <div className="board-grid">
                                {boardMembers.map(member => (
                                    <div key={member.id} className="board-card">
                                        <div className="board-avatar">
                                            <span className="avatar-icon">🎬</span>
                                        </div>
                                        <div className="board-details">
                                            <h3>{member.name}</h3>
                                            <span className="board-position">{member.position}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Founding Members Tab */}
                    {activeTab === 'founding' && (
                        <div className="founding-tab">
                            <div className="founding-intro">
                                <p>Η <strong>Ιδρυτική Συνέλευση</strong> πραγματοποιήθηκε στις <strong>5 Νοεμβρίου 2022</strong>. Τα ιδρυτικά μέλη αποτελούν τον πυρήνα της Ένωσης και συνεχίζουν να υπηρετούν το όραμά της.</p>
                            </div>
                            <div className="founding-grid">
                                {foundingMembers.map((member, index) => (
                                    <div key={index} className="founding-card">
                                        <div className="founding-icon">🎬</div>
                                        <div className="founding-info">
                                            <h4>{member.name}</h4>
                                            <span className="founding-role">{member.role}</span>
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