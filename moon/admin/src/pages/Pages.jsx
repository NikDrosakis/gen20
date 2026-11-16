// Pages.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMessaging } from '../MessagingContext';
import CubosAvailable from './CubosAvailable.jsx';
import CubosInstalled from './CubosInstalled.jsx';
import ParamsForm from './ParamsForm';
import { getSchema, normalizeParams, UNIT_SCHEMAS } from './unitSchema';
import './Pages.css';

const currentDomain = window.location.hostname;
const API_BASE = window.location.origin;
const MANIFEST_KEY = `moon_manifest:${currentDomain}`;
const MANIFEST_URL = `${API_BASE}/data/${currentDomain}/moon_manifest.json`;

const MY_USER_ID = 'gen20.net:1';
const SOL_USER_ID = 'sol:1';
const DEFAULT_PARAMS = {
    contentOne: { id: 1 },
    contentLoop: { classificationid: 1 },
};

const makeCid = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);

async function fetchJson(url) {
    try {
        const r = await fetch(url, { cache: 'no-cache' });
        if (!r.ok) return null;
        return await r.json();
    } catch {
        return null;
    }
}


function isValidCubo(cubo) {
    return cubo && cubo.name && !cubo.name.includes('.') && !cubo.name.startsWith('.');
}

async function loadManifest() {
    try {
        const raw = localStorage.getItem(MANIFEST_KEY);
        if (raw) return JSON.parse(raw);
    } catch {
        /* ignore */
    }
    return fetchJson(MANIFEST_URL);
}

// ---------- Default units ----------
const DEFAULT_UNITS = Object.entries(UNIT_SCHEMAS)
    .filter(([, s]) => s.source === 'default')
    .map(([type, s]) => ({
        type,
        label: s.label,
        defaults: Object.fromEntries(s.fields.map((f) => [f.key, f.default])),
    }));

// manifest item -> { kind, name, params }
const itemToUnit = (item) => {
    if (typeof item === 'string') return { kind: 'cubo', name: item, params: null };
    if (item?.cubo !== undefined) {
        if (typeof item.cubo === 'string') return { kind: 'cubo', name: item.cubo, params: null };
        const [name, params] = Object.entries(item.cubo)[0] || [];
        return { kind: 'cubo', name, params };
    }
    if (item?.contentOne) return { kind: 'contentOne', name: 'contentOne', params: item.contentOne };
    if (item?.contentLoop) return { kind: 'contentLoop', name: 'contentLoop', params: item.contentLoop };
    return null;
};

// { kind, name, params } -> manifest item
const unitToItem = ({ kind, name, params }) => {
    if (kind === 'cubo') {
        return params ? { cubo: { [name]: params } } : { cubo: name };
    }
    const defaults = DEFAULT_UNITS.find((u) => u.type === kind)?.defaults ?? {};
    return { [kind]: params ?? defaults };
};

const unitLabel = (item) => {
    const u = itemToUnit(item);
    if (!u) return '?';
    if (u.kind === 'cubo') return u.name;
    return u.kind === 'contentOne' ? 'ContentOne' : 'ContentLoop';
};

function broadcastManifest(manifest) {
    try {
        const bc = new BroadcastChannel(`moon_manifest:${currentDomain}`);
        bc.postMessage({ type: 'update', manifest });
        bc.close();
    } catch {}
}
// ---------- Component ----------
export default function Pages({ pageId, lockedPageId }) {
    const [postOptions, setPostOptions] = useState([]);
    const [classificationOptions, setClassificationOptions] = useState([]);
    const [optionsLoading, setOptionsLoading] = useState(true);

    const { send } = useMessaging();

    const [manifest, setManifest] = useState(null);
    const [selectedPageKey, setSelectedPageKey] = useState(lockedPageId ?? pageId ?? null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [availableCubos, setAvailableCubos] = useState([]);
    const [loadingAvailable, setLoadingAvailable] = useState(true);

    const [installedCubos, setInstalledCubos] = useState([]);
    const [loadingInstalled, setLoadingInstalled] = useState(true);
    const [editing, setEditing] = useState(null);

    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState(null);

    const [creating, setCreating] = useState(false);
    // 1) Manifest
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await loadManifest();
                if (cancelled) return;
                if (!data?.pages) throw new Error('moon_manifest.json missing or invalid');
                setManifest(data);
                const keys = Object.keys(data.pages);
                setSelectedPageKey((prev) => (prev && data.pages[prev] ? prev : keys[0] ?? null));
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    // 2) Available (astra)
    useEffect(() => {
        let cancelled = false;
        setLoadingAvailable(true);
        fetchJson(`${API_BASE}/data/astralist.json`).then((data) => {
            if (cancelled) return;
            setAvailableCubos((data?.cubos || []).filter(isValidCubo));
            setLoadingAvailable(false);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    // 3) Installed (moon)
    useEffect(() => {
        let cancelled = false;
        setLoadingInstalled(true);
        fetchJson(`${API_BASE}/data/${currentDomain}/moonlist.json`).then((data) => {
            if (cancelled) return;
            setInstalledCubos((data?.cubos || []).filter(isValidCubo));
            setLoadingInstalled(false);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    // Options για dropdowns (posts, classifications)
    useEffect(() => {
        let cancelled = false;
        const publicdb = 'gen_' + currentDomain.replace(/\./g, '');

        const loadOptions = async () => {
            setOptionsLoading(true);
            try {
                const [postsRes, classesRes] = await Promise.all([
                    fetchJson(
                        `${API_BASE}/api/v1/maria/fa?key=${encodeURIComponent(
                            `SELECT id, title FROM ${publicdb}.content ORDER BY title ASC`
                        )}`
                    ),
                    fetchJson(
                        `${API_BASE}/api/v1/maria/fa?key=${encodeURIComponent(
                            `SELECT id, name FROM ${publicdb}.classification ORDER BY name ASC`
                        )}`
                    ),
                ]);

                if (cancelled) return;

                const postsRows = Array.isArray(postsRes) ? postsRes : postsRes?.rows ?? postsRes?.data ?? [];
                const classesRows = Array.isArray(classesRes) ? classesRes : classesRes?.rows ?? classesRes?.data ?? [];

                setPostOptions(
                    postsRows.map((r) => ({ value: Number(r.id), label: r.title || `#${r.id}` }))
                );
                setClassificationOptions(
                    classesRows.map((r) => ({ value: Number(r.id), label: r.name || `#${r.id}` }))
                );
            } catch (err) {
                console.error('options fetch error:', err);
            } finally {
                if (!cancelled) setOptionsLoading(false);
            }
        };

        loadOptions();
        return () => {
            cancelled = true;
        };
    }, []);
    // Pages (κρατάμε και τα raw items για render)
    const pages = useMemo(() => {
        if (!manifest?.pages) return [];
        return Object.entries(manifest.pages).map(([key, page]) => ({
            key,
            name: page.title || page.label || key,
            raw: {
                h: Array.isArray(page.h) ? page.h : [],
                sl: Array.isArray(page.sl) ? page.sl : [],
                m: Array.isArray(page.m) ? page.m : [],
                sr: Array.isArray(page.sr) ? page.sr : [],
                f: Array.isArray(page.f) ? page.f : [],
            },
        }));
    }, [manifest]);

    const selectedPage = pages.find((p) => p.key === selectedPageKey) || pages[0];

    // ---------- Create New Page ----------
    const handleCreatePage = useCallback(() => {
        const raw = window.prompt(
            'Νέα σελίδα — key (π.χ. "contact" ή "docs/faq"):'
        );
        if (!raw) return;

        const key = raw
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9/_-]/g, '');

        if (!key) return alert('Μη έγκυρο key');
        if (manifest?.pages?.[key]) return alert(`Υπάρχει ήδη σελίδα "${key}"`);

        const title = window.prompt('Τίτλος σελίδας:', key) ?? key;

        setManifest((prev) => {
            if (!prev?.pages) return prev;
            const next = structuredClone(prev);
            next.pages[key] = {
                title,
                m: [],
            };
            next.generated = Date.now();
            try {
                localStorage.setItem(MANIFEST_KEY, JSON.stringify(next));
                broadcastManifest(next);
            } catch {}
            return next;
        });

        setSelectedPageKey(key);
    }, [manifest]);
    // ---------- Drag & Drop ----------
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        e.currentTarget.classList.add('drag-over');
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.currentTarget.classList.remove('drag-over');
    }, []);

    const handleDropOnArea = useCallback(
        (e, pageKey, area) => {
            e.preventDefault();
            e.currentTarget.classList.remove('drag-over');
            const raw = e.dataTransfer.getData('text/plain');
            if (!raw) return;

            let data;
            try {
                data = JSON.parse(raw);
            } catch {
                return;
            }

            const isCubo = data.source === 'moon';
            const isDefault = data.source === 'default';
            if (!isCubo && !isDefault) return;

            const kind = isCubo ? 'cubo' : data.kind;
            const name = isCubo ? data.name : data.kind;
            const params = normalizeParams(kind, data.params);

            // (προαιρετικά) command προς Sol — χωρίς early return
            try {
                const commandMsg = isCubo
                    ? `skeleton_dress --domain ${currentDomain} --page ${pageKey} --area ${area} --cubo ${name}`
                    : `skeleton_dress --domain ${currentDomain} --page ${pageKey} --area ${area} --type ${kind} --params '${JSON.stringify(params || {})}'`;

                const cid = makeCid(MY_USER_ID, SOL_USER_ID);
                const sent = send({
                    system: 'sol',
                    type: 'message',
                    cid,
                    to: SOL_USER_ID,
                    cast: 'one',
                    c: commandMsg,
                });
                if (!sent) console.warn('WS not connected — optimistic only');
            } catch (err) {
                console.warn('sol command failed:', err);
            }

            // Optimistic update — ΠΑΝΤΑ εκτελείται
            setManifest((prev) => {
                try {
                    if (!prev?.pages?.[pageKey]) return prev;
                    const next = structuredClone(prev);
                    const arr = next.pages[pageKey][area] || [];
                    next.pages[pageKey][area] = [...arr, unitToItem({ kind, name, params })];
                    next.generated = Date.now();
                    localStorage.setItem(MANIFEST_KEY, JSON.stringify(next));
                    broadcastManifest(next);
                    return next;
                } catch (err) {
                    console.error('[drop updater]', err);
                    return prev;
                }
            });
        },
        [send]
    );

    const handleInstall = useCallback(
        (cubo) => {
            const commandMsg = `install_cubo --domain ${currentDomain} --cubo ${cubo.name}`;
            const cid = makeCid(MY_USER_ID, SOL_USER_ID);
            const sent = send({
                system: 'sol',
                type: 'message',
                cid,
                to: SOL_USER_ID,
                cast: 'one',
                c: commandMsg,
            });

            if (!sent) {
                alert('WebSocket δεν είναι συνδεδεμένο!');
                return;
            }

            setInstalledCubos((prev) => {
                if (prev.find((c) => c.name === cubo.name)) return prev;
                return [{ ...cubo, status: 'installed' }, ...prev];
            });
        },
        [send]
    );

    const handleDropOnInstalled = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        const raw = e.dataTransfer.getData('text/plain');
        if (!raw) return;
        try {
            const data = JSON.parse(raw);
            if (data.source === 'astra') handleInstall(data);
        } catch (err) {
            console.error('Invalid drop on installed:', err);
        }
    };

    const removeItem = useCallback(
        (pageKey, area, index) => {
            const item = manifest?.pages?.[pageKey]?.[area]?.[index];
            if (!item) return;

            const unit = itemToUnit(item);

            // Command προς Sol — αφαίρεση από το manifest του server
            const commandMsg = unit?.kind === 'cubo'
                ? `skeleton_undress --domain ${currentDomain} --page ${pageKey} --area ${area} --index ${index}`
                : `skeleton_undress --domain ${currentDomain} --page ${pageKey} --area ${area} --index ${index}`;

            const cid = makeCid(MY_USER_ID, SOL_USER_ID);
            const sent = send({
                system: 'sol',
                type: 'message',
                cid,
                to: SOL_USER_ID,
                cast: 'one',
                c: commandMsg,
            });

            if (!sent) {
                alert('WebSocket δεν είναι συνδεδεμένο!');
                return;
            }

            // Optimistic update
            setManifest((prev) => {
                if (!prev?.pages?.[pageKey]?.[area]) return prev;
                const next = structuredClone(prev);
                const arr = next.pages[pageKey][area];
                if (index < 0 || index >= arr.length) return prev;
                arr.splice(index, 1);
                next.generated = Date.now();
                try {
                    localStorage.setItem(MANIFEST_KEY, JSON.stringify(next));
                    broadcastManifest(next);
                } catch {}
                return next;
            });
        },
        [manifest, send]
    );


    // SAVE → server, μετά sync localStorage + broadcast
    const handleSaveChanges = useCallback(async () => {
        if (!manifest) return;
        setSaving(true);
        setSaveMsg(null);

        // Στέλνουμε χωρίς το client-side generated — το βάζει ο server
        const { generated, ...payloadManifest } = manifest;

        try {
            const res = await fetch('/api/v1/local/setMoonManifest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ domain: currentDomain, manifest: payloadManifest }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) {
                throw new Error(json.error || `HTTP ${res.status}`);
            }

            // Ο server επέστρεψε νέο generated — ευθυγράμμισε το τοπικό state
            const savedManifest = { ...payloadManifest, generated: json.generated ?? Date.now() };
            setManifest(savedManifest);
            try {
                localStorage.setItem(MANIFEST_KEY, JSON.stringify(savedManifest));
                broadcastManifest(savedManifest);
            } catch {}

            setSaveMsg('✅ Αποθηκεύτηκε' + (json.backup ? ` (backup: ${json.backup})` : ''));
        } catch (err) {
            setSaveMsg('❌ ' + err.message);
        } finally {
            setSaving(false);
        }
    }, [manifest]);

// DROP → σβήνει το local cache και επαναφέρει από server
    const handleDropChanges = useCallback(async () => {
        if (!window.confirm('Να απορριφθούν οι τοπικές αλλαγές και να επαναφορτωθεί από τον server;')) {
            return;
        }
        setSaveMsg(null);
        try {
            localStorage.removeItem(MANIFEST_KEY);
        } catch {}

        try {
            const fresh = await fetchJson(MANIFEST_URL);
            if (!fresh?.pages) throw new Error('Invalid manifest from server');
            setManifest(fresh);
            try {
                localStorage.setItem(MANIFEST_KEY, JSON.stringify(fresh));
                broadcastManifest(fresh);
            } catch {}
            setSaveMsg('↩️ Επαναφορά από server');
        } catch (err) {
            setSaveMsg('❌ ' + err.message);
        }
    }, []);


    // ---------- updateParams ----------
    const updateParams = useCallback(
        (pageKey, area, index, nextParams) => {
            setManifest((prev) => {
                if (!prev?.pages?.[pageKey]?.[area]?.[index]) return prev;
                const next = structuredClone(prev);
                const item = next.pages[pageKey][area][index];
                const unit = itemToUnit(item);
                if (!unit) return prev;
                next.pages[pageKey][area][index] = unitToItem({
                    ...unit,
                    params: normalizeParams(unit.kind, { ...unit.params, ...nextParams }),
                });
                next.generated = Date.now();
                try {
                    localStorage.setItem(MANIFEST_KEY, JSON.stringify(next));
                    broadcastManifest(next);
                } catch {}
                return next;
            });
        },
        []
    );


    if (loading) return <div className="loading-state">Loading layout manager…</div>;
    if (error) return <div className="loading-state">Error: {error}</div>;
    if (!selectedPage) return <div className="loading-state">No pages found in manifest.</div>;

    // ---------- Render ----------
    const renderAreaContent = (items, areaKey) =>
        items.length ? (
            items.map((item, i) => {
                const unit = itemToUnit(item);
                const schema = unit ? getSchema(unit.kind) : null;
                const isEditable = !!schema; // contentOne/contentLoop/team/... έχουν schema
                const isEditing =
                    editing?.pageKey === selectedPage.key &&
                    editing?.area === areaKey &&
                    editing?.index === i;

                return (
                    <div key={`${areaKey}-${i}`} className="area-cubo-box">
                        <div className="area-cubo-box__header">
                            <span className="area-cubo__label">{unitLabel(item)}</span>

                            {isEditable && (
                                <button
                                    type="button"
                                    className="area-cubo__params-btn"
                                    title="Edit parameters"
                                    onClick={() =>
                                        setEditing(
                                            isEditing
                                                ? null
                                                : { pageKey: selectedPage.key, area: areaKey, index: i }
                                        )
                                    }
                                >
                                    {isEditing ? '▾' : '⚙'}
                                </button>
                            )}

                            <button
                                type="button"
                                className="area-cubo__remove"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeItem(selectedPage.key, areaKey, i);
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {isEditing && isEditable && (
                            <div className="area-cubo-box__params">
                                <ParamsForm
                                    kind={unit.kind}
                                    params={unit.params}
                                    options={{
                                        contentOne: { id: postOptions },
                                        contentLoop: { classificationid: classificationOptions },
                                    }}
                                    loading={optionsLoading}
                                    onChange={(nextParams) =>
                                        updateParams(selectedPage.key, areaKey, i, nextParams)
                                    }
                                />
                            </div>
                        )}
                    </div>
                );
            })
        ) : (
            <span className="area-empty">Drop cubos here ({areaKey.toUpperCase()})</span>
        );

    return (
        <div className="page-admin2-container">
            <CubosAvailable
                cubos={availableCubos}
                loading={loadingAvailable}
                onInstall={handleInstall}
            />

            <div className="center-panel">
                <div className="page-content-box">
                    <div className="page-header">
                        <h3>
                            {selectedPage.name} <span className="page-key">#{selectedPage.key}</span>
                        </h3>

                        {/* Default units panel */}


                            <div className="default-units-panel__grid">
                                {DEFAULT_UNITS.map((u) => (
                                    <div
                                        key={u.type}
                                        className="default-unit"
                                        draggable
                                        onDragStart={(e) => {
                                            const data = {
                                                kind: u.type,
                                                name: u.type,
                                                params: u.defaults,
                                                source: 'default',
                                            };
                                            e.dataTransfer.setData('text/plain', JSON.stringify(data));
                                            e.dataTransfer.effectAllowed = 'copyMove';
                                        }}
                                    >
                                        <div className="default-unit__label">{u.label}</div>
                                        <div className="default-unit__type">.{u.type}</div>
                                    </div>
                                ))}
                            </div>
                       

                        <div className="header-actions">
                            <button className="new-page-btn" type="button" onClick={handleCreatePage}>
                                ➕ New page
                            </button>
                            <button className="clear-btn" type="button">Clear</button>
                            <button
                                type="button"
                                className="save-btn"
                                onClick={handleSaveChanges}
                                disabled={saving}
                            >
                                {saving ? '… Saving' : '💾 Save changes'}
                            </button>
                            <button
                                type="button"
                                className="drop-btn"
                                onClick={handleDropChanges}
                                disabled={saving}
                            >
                                ↩️ Drop changes
                            </button>
                        </div>
                    </div>
                    {saveMsg && <div className="save-msg">{saveMsg}</div>}

                    <div className="page-areas">
                        {/* Header area με tabs ως navigator */}
                        <div
                            className="area header-area"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDropOnArea(e, selectedPage.key, 'h')}
                        >
                        <div className="area-label">Header (H) — Navigator</div>

                            <div className="page-tabs">
                                {pages.map((page) => (
                                    <button
                                        key={page.key}
                                        className={`page-tab ${selectedPageKey === page.key ? 'active' : ''}`}
                                        onClick={() => setSelectedPageKey(page.key)}
                                    >
                                        {page.name} <span className="page-tab__key">#{page.key}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="area-content">{renderAreaContent(selectedPage.raw.h, 'h')}</div>
                        </div>

                        <div className="area-row">
                            <div
                                className="area"
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDropOnArea(e, selectedPage.key, 'sl')}
                            >
                                <div className="area-label">Sidebar Left (SL)</div>
                                <div className="area-content">{renderAreaContent(selectedPage.raw.sl, 'sl')}</div>
                            </div>

                            <div
                                className="area main-area"
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDropOnArea(e, selectedPage.key, 'm')}
                            >
                                <div className="area-label">Main (M)</div>
                                <div className="area-content">{renderAreaContent(selectedPage.raw.m, 'm')}</div>
                            </div>

                            <div
                                className="area"
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDropOnArea(e, selectedPage.key, 'sr')}
                            >
                                <div className="area-label">Sidebar Right (SR)</div>
                                <div className="area-content">{renderAreaContent(selectedPage.raw.sr, 'sr')}</div>
                            </div>
                        </div>

                        <div
                            className="area footer-area"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDropOnArea(e, selectedPage.key, 'f')}
                        >
                            <div className="area-label">Footer (F)</div>
                            <div className="area-content">{renderAreaContent(selectedPage.raw.f, 'f')}</div>
                        </div>
                    </div>
                </div>
            </div>

            <CubosInstalled
                cubos={installedCubos}
                loading={loadingInstalled}
                onDrop={handleDropOnInstalled}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            />
        </div>
    );
}