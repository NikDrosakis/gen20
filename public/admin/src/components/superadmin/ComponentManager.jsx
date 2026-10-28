// components/superadmin/ComponentManager.jsx
import React, { useState, useMemo } from 'react';
import './ComponentManager.css';

// Mock δεδομένα (αντί για το filesystem prop, βάζουμε τη δομή που φαίνεται στην εικόνα)
const defaultData = {
    "gen20.net": {
        path: "public/gen20.net",
        children: {
            "src": {
                children: {
                    "components": {
                        children: {
                            "Hero.jsx": { type: 'file' },
                            "Hero.css": { type: 'file' },
                            "Subscribe.jsx": { type: 'file' },
                            "Subscribe.css": { type: 'file' }
                        }
                    }
                }
            }
        }
    },
    "directorsunion.gr": {
        path: "public/directorsunion.gr",
        children: {
            "src": {
                children: {
                    "components": {
                        children: {
                            "Hero.jsx": { type: 'file' },
                            "Subscribe.jsx": { type: 'file' },
                            "Subscribe.css": { type: 'file' }
                        }
                    }
                }
            }
        }
    },
    "gen20.art": {
        path: "public/gen20.art",
        children: {
            "src": {
                children: {
                    "components": {
                        children: {
                            "Hero.jsx": { type: 'file' },
                            "Subscribe.jsx": { type: 'file' },
                            "Subscribe.css": { type: 'file' }
                        }
                    }
                }
            }
        }
    }
};

const ComponentManager = ({ data = defaultData }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expanded, setExpanded] = useState({
        "gen20.net": true,
        "directorsunion.gr": true,
        "gen20.art": true,
        // Ανοίγουμε και τα src/components για να φαίνονται τα αρχεία από την αρχή
        "gen20.net/src": true,
        "gen20.net/src/components": true,
        "directorsunion.gr/src": true,
        "directorsunion.gr/src/components": true,
        "gen20.art/src": true,
        "gen20.art/src/components": true,
    });

    const toggleFolder = (path) => {
        setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
    };

    // Αναδρομική συνάρτηση για το φιλτράρισμα του δέντρου
    // Αναδρομική συνάρτηση για το φιλτράρισμα του δέντρου
    const filterTree = (node, term) => {
        if (!term) return node;

        const lowerTerm = term.toLowerCase();

        // Αν είναι αρχείο, επιστρέφουμε null (ο γονέας θα αποφασίσει αν θα το κρατήσει)
        if (!node.children) {
            return null;
        }

        const filteredChildren = {};
        let hasMatch = false;

        for (const [key, child] of Object.entries(node.children)) {
            const childMatch = key.toLowerCase().includes(lowerTerm);
            const filteredChild = filterTree(child, term);

            if (childMatch || filteredChild) {
                filteredChildren[key] = childMatch ? child : filteredChild;
                hasMatch = true;
            }
        }

        if (hasMatch) {
            return { ...node, children: filteredChildren };
        }
        return null;
    };

    // Εφαρμογή φίλτρου σε όλα τα domains
    const filteredData = useMemo(() => {
        if (!searchTerm) return data;

        const result = {};
        const lowerTerm = searchTerm.toLowerCase();

        for (const [domain, domainData] of Object.entries(data)) {
            const domainMatch = domain.toLowerCase().includes(lowerTerm) ||
                domainData.path?.toLowerCase().includes(lowerTerm);

            const filtered = filterTree(domainData, searchTerm);

            if (domainMatch || filtered) {
                result[domain] = filtered || domainData;
            }
        }
        return result;
    }, [data, searchTerm]);

    // Αναδρομικό rendering του δέντρου
    const renderTree = (node, path = '', level = 0) => {
        if (!node.children) return null; // Είναι αρχείο, δεν έχει παιδιά

        return (
            <div className="tree-children">
                {Object.entries(node.children).map(([key, child]) => {
                    const currentPath = path ? `${path}/${key}` : key;
                    const isFile = !child.children;
                    const isExpanded =
                        searchTerm.trim() !== '' || expanded[currentPath];

                    return (
                        <div key={currentPath} className="tree-node">
                            {isFile ? (
                                <div className="tree-file" style={{ paddingLeft: `${level * 16 + 24}px` }}>
                                    <span className="file-icon">📄</span>
                                    <span className="file-name">{key}</span>
                                </div>
                            ) : (
                                <>
                                    <div
                                        className="tree-folder"
                                        style={{ paddingLeft: `${level * 16}px` }}
                                        onClick={() => toggleFolder(currentPath)}
                                    >
                                        <span className="arrow-icon">
                                            {isExpanded ? '▼' : '▶'}
                                        </span>
                                        <span className="folder-icon">📁</span>
                                        <span className="folder-name">{key}</span>
                                    </div>
                                    {isExpanded && renderTree(child, currentPath, level + 1)}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="component-manager">
            <div className="component-header">
                <h2>Component Manager</h2>
                <p className="subtitle">GEN20 · SuperAdmin · Cross-domain component registry</p>
            </div>

            <div className="search-container">
                <input
                    type="text"
                    className="component-search-input"
                    placeholder="Αναζήτηση αρχείου, component, CSS, διαδρομής ή domain..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="domains-grid">
                {Object.entries(filteredData).length === 0 ? (
                    <div className="no-results">Δεν βρέθηκαν αποτελέσματα για "{searchTerm}"</div>
                ) : (
                    Object.entries(filteredData).map(([domain, node]) => {
                        const isExpanded = expanded[domain];
                        return (
                            <div key={domain} className="domain-card">
                                <div
                                    className="domain-header"
                                    onClick={() => toggleFolder(domain)}
                                >
                                    <span className="arrow-icon">
                                        {isExpanded ? '▼' : '▶'}
                                    </span>
                                    <h3>{domain}</h3>
                                </div>
                                <div className="domain-path">{node.path}</div>

                                {isExpanded && renderTree(node, domain, 1)}

                                <div className="add-file-action">
                                    + Δημιουργία αρχείου
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ComponentManager;