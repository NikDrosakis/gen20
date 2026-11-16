import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ManifestContext = createContext(null);

const host = window.location.hostname;
const URL = `/data/${host}/moon_manifest.json`;
const CACHE_KEY = `moon_manifest:${host}`;

// Module-level cache: αποφεύγει διπλό fetch λόγω StrictMode (dev) ή πολλαπλών mounts
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
            // Αν υπάρχει inflight promise, περίμενέ το (shared across mounts)
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
                console.error("manifest fetch error:", err);
                setError(err.message);
                // Κρατάμε το cached manifest αν υπάρχει — δεν το σβήνουμε
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

    // μετά το useMemo του value, πριν το return
    useEffect(() => {
        // 1) Άλλα tabs
        const onStorage = (e) => {
            if (e.key === CACHE_KEY && e.newValue) {
                try {
                    setManifest(JSON.parse(e.newValue));
                } catch {}
            }
        };
        window.addEventListener('storage', onStorage);

        // 2) Ίδιο tab (admin → public)
        let bc;
        try {
            bc = new BroadcastChannel(`moon_manifest:${host}`);
            bc.onmessage = (ev) => {
                if (ev.data?.type === 'update' && ev.data.manifest) {
                    setManifest(ev.data.manifest);
                }
            };
        } catch {}

        return () => {
            window.removeEventListener('storage', onStorage);
            bc?.close();
        };
    }, []);

    return <ManifestContext.Provider value={value}>{children}</ManifestContext.Provider>;
}

export function useManifest() {
    const ctx = useContext(ManifestContext);
    if (!ctx) {
        throw new Error("useManifest must be used inside <ManifestProvider>");
    }
    return ctx;
}