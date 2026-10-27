// pages/Doc.jsx
import React, { useState, useEffect } from 'react';
import './Doc.css';

const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');

const Doc = () => {
    const [docs, setDocs] = useState([]);
    const [filteredDocs, setFilteredDocs] = useState([]);
    const [activeDoc, setActiveDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchDocs = async () => {
            setLoading(true);
            try {
                // Τραβάμε τα άρθρα (προσάρμοσε το classificationid αν χρειάζεται)
                const query = `SELECT id, title, description, name FROM gen_admin.content ORDER BY sort ASC, id ASC`;
                const response = await fetch(`/api/v1/maria/fa?q=${encodeURIComponent(query)}`);
                const result = await response.json();

                if (result.success && result.data) {
                    setDocs(result.data);
                    setFilteredDocs(result.data);
                    if (result.data.length > 0) {
                        setActiveDoc(result.data[0]);
                    }
                }
            } catch (error) {
                console.error('Error fetching docs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDocs();
    }, []);

    // Search handler
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        if (term.trim() === '') {
            setFilteredDocs(docs);
        } else {
            const filtered = docs.filter(doc =>
                doc.title?.toLowerCase().includes(term) ||
                doc.description?.toLowerCase().includes(term)
            );
            setFilteredDocs(filtered);
            // Αν το ενεργό άρθρο δεν είναι στα αποτελέσματα, επέλεξε το πρώτο
            if (filtered.length > 0 && !filtered.find(d => d.id === activeDoc?.id)) {
                setActiveDoc(filtered[0]);
            }
        }
    };

    if (loading) return <div className="doc-loading">Loading Documentation...</div>;

    return (
        <div className="doc-wrapper">
            {/* Top Header with Search */}
            <div className="content-archive-header" style={{ marginBottom: '24px' }}>
                <div className="content-archive-title-section">
                    <h1 className="content-archive-title">📚 Documentation</h1>
                    <div className="content-archive-stats">
                        <span className="stat-badge stat-pages">📄 Total: {filteredDocs.length}</span>
                    </div>
                </div>
                <div className="content-archive-actions">
                    <div className="content-archive-search">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="🔍 Search documentation..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        {searchTerm && (
                            <button
                                className="search-clear"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilteredDocs(docs);
                                }}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Layout */}
            <div className="doc-container">
                {/* Αριστερό Μενού */}
                <aside className="doc-sidebar">
                    <ul className="doc-menu">
                        {filteredDocs.map((doc) => (
                            <li
                                key={doc.id}
                                className={activeDoc?.id === doc.id ? 'active' : ''}
                                onClick={() => setActiveDoc(doc)}
                            >
                                {doc.title}
                            </li>
                        ))}
                    </ul>
                    {filteredDocs.length === 0 && (
                        <p style={{ padding: '10px', color: '#64748b', fontSize: '14px' }}>
                            No results found.
                        </p>
                    )}
                </aside>

                {/* Δεξιά Περιεχόμενο */}
                <main className="doc-content">
                    {activeDoc ? (
                        <>
                            <h1>{activeDoc.title}</h1>
                            <div
                                className="doc-body"
                                dangerouslySetInnerHTML={{ __html: activeDoc.description }}
                            />
                        </>
                    ) : (
                        <p>Select a topic from the menu to start reading.</p>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Doc;