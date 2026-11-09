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

export const GProvider = ({ children }) => {
    const [G, setG] = useState(() =>
        typeof window !== 'undefined' ? window.G ?? null : null
    );

    const [loading, setLoading] = useState(!G);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (window.G) {
            setG(window.G);
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        const loadConfig = async () => {
            try {
                const res = await fetch('/api/v1/local', {
                    signal: controller.signal
                });

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }

                const result = await res.json();

                if (!result?.data || typeof result.data !== 'object') {
                    throw new Error('Malformed response: missing data');
                }

                window.G = result.data;
                setG(result.data);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Failed to load setup data:', err);
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
