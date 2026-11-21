import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ManifestContext = createContext(null);

// Admin manifest είναι σταθερό (δεν εξαρτάται από hostname)
const URL = "/data/admin/moon_manifest.json";
const CACHE_KEY = "moon_manifest:admin";

let inflight = null;

function readCache() {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function writeCache(data) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {
        /* quota / private mode — αγνόησέ το */
    }
}

async function fetchManifest(signal) {
    const res = await fetch(URL, { signal, cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

export function ManifestProvider({ children }) {
    const [manifest, setManifest] = useState(() => readCache());
    const [loading, setLoading] = useState(!readCache());
    const [error, setError] = useState(null);

    const load = useCallback(async (signal) => {
        setLoading(true);
        setError(null);
        try {
            if (!inflight) {
                inflight = fetchManifest(signal).finally(() => {
                    inflight = null;
                });
            }
            const data = await inflight;
            setManifest(data);
            writeCache(data);
        } catch (err) {
            if (err.name !== "AbortError") {
                console.error("admin manifest fetch error:", err);
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        load(controller.signal);
        return () => controller.abort();
    }, [load]);

    const refetch = useCallback(() => load(), [load]);

    const value = useMemo(
        () => ({ manifest, loading, error, refetch }),
        [manifest, loading, error, refetch]
    );

    return <ManifestContext.Provider value={value}>{children}</ManifestContext.Provider>;
}

export function useManifest() {
    const ctx = useContext(ManifestContext);
    if (!ctx) {
        throw new Error("useManifest must be used inside <ManifestProvider>");
    }
    return ctx;
}
