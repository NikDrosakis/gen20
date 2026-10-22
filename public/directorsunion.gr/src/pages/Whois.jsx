// pages/Whois.jsx
import React, { useState } from 'react';
import ContentOne from '../components/content/ContentOne';
import { useTheme } from '../contexts/ThemeContext';
import './Whois.css';

const Whois = () => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('about');

    // Διοικητικό Συμβούλιο (από την Ιδρυτική Συνέλευση & ανανέωση 2024)
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
            position: "Μέλος Διοικητικού Συμβουλίου"
        },
        {
            id: 6,
            name: "Λεωνίδας Βαρδαρός",
            position: "Μέλος Διοικητικού Συμβουλίου"
        },
        {
            id: 7,
            name: "Γκαίη Αγγελή",
            position: "Μέλος Διοικητικού Συμβουλίου"
        },
        {
            id: 8,
            name: "Στέφανος Χατζημιχαηλίδης",
            position: "Μέλος Διοικητικού Συμβουλίου"
        },
        {
            id: 9,
            name: "Στέφανος Μονδέλο",
            position: "Μέλος Διοικητικού Συμβουλίου"
        }
    ];

    // Ιδρυτικά Μέλη (από την Ιδρυτική Συνέλευση 5 Νοεμβρίου 2022)
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
        <div className={`whois-page ${theme}`}>
            {/* Mission Section */}
            <section className="mission-section">
                <div className="container">
                    <div className="mission-content">
                        <div className="mission-text">
                            <h2>Η Ένωση</h2>
                            <ContentOne name="whois" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Tabs Navigation */}
            <section className="tabs-section">
                <div className="container">
                    <div className="tabs-nav">
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
                        <button
                            className={`tab-btn ${activeTab === 'actions' ? 'active' : ''}`}
                            onClick={() => setActiveTab('actions')}
                        >
                            Δράσεις
                        </button>
                    </div>

                    <div className="tab-content">
                        {/* Board Tab - Διοικητικό Συμβούλιο */}
                        {activeTab === 'board' && (
                            <div>
                                <div className="board-note">
                                    <p><strong>Προσωρινή Διοίκηση (από 11 Ιουνίου 2024)</strong> — Εννιαμελές Διοικητικό Συμβούλιο</p>
                                </div>
                                <div className="board-grid">
                                    {boardMembers.map(member => (
                                        <div key={member.id} className="board-card">
                                            <div className="board-image">
                                                <div className="image-placeholder">
                                                    <span>🎬</span>
                                                </div>
                                            </div>
                                            <div className="board-info">
                                                <h3>{member.name}</h3>
                                                <span className="position">{member.position}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Founding Members Tab */}
                        {activeTab === 'founding' && (
                            <div className="founding-members">
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
            </section>
        </div>
    );
};

export default Whois;