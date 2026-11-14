import React, {
    createContext,
    useContext,
    useState,
    useEffect
} from 'react';

const GContext = createContext({
    G: null,
    setG: () => {}
});

export const useG = () => useContext(GContext);

// helper: δέχεται είτε { data: {...} } είτε σκέτο {...}
const unwrap = (json) => {
    if (json && typeof json === 'object' && !Array.isArray(json)) {
        if (json.data && typeof json.data === 'object' && !Array.isArray(json.data)) {
            return json.data;          // wrapped
        }
        return json;                   // plain cv object
    }
    throw new Error('Malformed GContext.json');
};

export const GProvider = ({ children }) => {
    const [G, setG] = useState(() =>
        typeof window !== 'undefined' ? window.G ?? null : null
    );

    const [loading, setLoading] = useState(!G);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.G) {
            setG(window.G);
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        const loadConfig = async () => {
            try {
                const res = await fetch(`/data/admin/GContext.json`, {
                    signal: controller.signal,
                    cache: 'no-cache'
                });

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }

                // diagnostics: αν ο server σερβίρει HTML αντί για JSON
                const ct = res.headers.get('content-type') || '';
                if (!ct.includes('json')) {
                    const text = await res.text();
                    throw new Error(
                        `Expected JSON but got "${ct || 'unknown'}" (first 60 chars: ${text.slice(0, 60)})`
                    );
                }

                const json = await res.json();
                const data = unwrap(json);   // ✅ δέχεται και τα δύο σχήματα

                if (typeof window !== 'undefined') window.G = data;
                setG(data);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Failed to load GContext:', err);
                    setError(err.message || 'Unknown error');
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        loadConfig();

        return () => controller.abort();
    }, []);

    if (loading) return <div>Loading configuration...</div>;
    if (error) return <div>Error loading configuration: {error}</div>;

    return (
        <GContext.Provider value={{ G, setG }}>
            {children}
        </GContext.Provider>
    );
};