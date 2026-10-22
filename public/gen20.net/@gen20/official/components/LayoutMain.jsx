import React, { useEffect, useState } from "react";

const LayoutMain = () => {
    const [html, setHtml] = useState("");
    const cuboURL = import REACT_APP_HTTP_CUBO;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadCubo = async () => {
            try {
                const res = await fetch(`${cuboURL}index.php?cubo=default&file=layout.php`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();   // πάρε το JSON ολόκληρο
                if (!json.success) throw new Error('API returned failure');
                const htmlString = json.data;     // απόσπασε το HTML από το πεδίο data
                setHtml(htmlString);

                if (process.env.NODE_ENV === 'development') {
                    console.log('Loaded layout HTML:', htmlString.slice(0, 100) + '...');
                }
            } catch (err) {
                console.error('Failed to load layout:', err);
                setError(err.message || 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        loadCubo();
    }, [cuboURL]);

    if (loading) return <div>Loading layout...</div>;
    if (error) return <div>Error loading layout: {error}</div>;

    return (
        <div dangerouslySetInnerHTML={{ __html: html }} />
    );
};

export default LayoutMain;
