// src/pages/NotFound.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NotFound = ({ data, lang, path }) => {
    const navigate = useNavigate();

    return (
        <div className="not-found-container" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div className="not-found-content" style={{
                textAlign: 'center',
                padding: '2rem',
                backgroundColor: 'white',
                borderRadius: '10px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                maxWidth: '500px',
                margin: '2rem'
            }}>
                <div className="error-code" style={{
                    fontSize: '120px',
                    fontWeight: 'bold',
                    color: '#764ba2',
                    marginBottom: '1rem',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                }}>
                    404
                </div>

                <div className="error-message" style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                    color: '#333'
                }}>
                    Page Not Found
                </div>

                <div className="error-description" style={{
                    fontSize: '16px',
                    color: '#666',
                    marginBottom: '2rem',
                    lineHeight: '1.5'
                }}>
                    {lang === 'el' ? (
                        <>
                            Η σελίδα που αναζητάτε δεν βρέθηκε.<br />
                            Η διαδρομή: <strong>{path || window.location.pathname}</strong> δεν υπάρχει.
                        </>
                    ) : (
                        <>
                            The page you are looking for was not found.<br />
                            The path: <strong>{path || window.location.pathname}</strong> does not exist.
                        </>
                    )}
                </div>

                <div className="error-actions" style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'background-color 0.3s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#5a67d8'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
                    >
                        {lang === 'el' ? '◀ Πίσω' : '◀ Go Back'}
                    </button>

                    <Link to="/">
                        <button style={{
                            padding: '10px 20px',
                            backgroundColor: '#48bb78',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'background-color 0.3s'
                        }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#38a169'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#48bb78'}>
                            {lang === 'el' ? '🏠 Αρχική Σελίδα' : '🏠 Home Page'}
                        </button>
                    </Link>
                </div>

                {data && data.length > 0 && (
                    <div className="suggestions" style={{
                        marginTop: '2rem',
                        padding: '1rem',
                        backgroundColor: '#f7fafc',
                        borderRadius: '5px',
                        textAlign: 'left'
                    }}>
                        <h4 style={{ color: '#4a5568', marginBottom: '0.5rem', fontSize: '14px' }}>
                            {lang === 'el' ? '💡 Προτεινόμενες σελίδες:' : '💡 Suggested pages:'}
                        </h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            <li><Link to="/" style={{ color: '#4299e1', textDecoration: 'none', fontSize: '14px' }}>Home</Link></li>
                            <li><Link to="/about" style={{ color: '#4299e1', textDecoration: 'none', fontSize: '14px' }}>About</Link></li>
                            <li><Link to="/contact" style={{ color: '#4299e1', textDecoration: 'none', fontSize: '14px' }}>Contact</Link></li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotFound;