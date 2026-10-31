// hooks/usePackages.js
//
// State + handlers για το Packages Mode (Cubo tree).
//
// Δεν ξέρει για:
//   - URL / router  (το active file έρχεται ως activeFileKey prop)
//   - file selection / editor  (καλεί onOpenFile callback)
//   - cubos save panel  (καλεί loadCubosList για refresh μετά από mutation)
//
// Endpoints (php.txt / EndpointΧρήση.txt):
//   - getCubosWithFiles       (POST)  → όλα τα cubos + files τους
//   - getCuboFiles            (POST)  → files ενός cubo (refresh)
//   - copyComponentToCubos    (POST)  → drag file → άλλο cubo (νέο row)
//   - moveComponentToCubos    (POST)  → Ctrl+drag file → άλλο cubo (αλλαγή cubosid)
//   - copyComponentToDomain   (POST)  → drag file → domain (install)
//   - removeComponentFromCubos(POST)  → context menu "Remove from cubo"
//   - updateCuboColor         (POST)  → αλλαγή χρώματος cubo (UI)
//   - listCubosWithCounts     (GET)   → λίστα cubos για dropdown/rail
//
// Όλα τα endpoints χτυπάνε /api/v1/local/<endpoint>.

import { useState, useEffect, useCallback, useMemo } from 'react';

/* ------------------------------------------------------------------ */
/*  API helper (αντίγραφο της σύμβασης του useFileSelection)          */
/* ------------------------------------------------------------------ */

const callApi = async (endpoint, body, method = 'POST') => {
    try {
        const opts = {
            method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (method !== 'GET') {
            opts.body = JSON.stringify(body || {});
        }
        const response = await fetch(`/api/v1/local/${endpoint}`, opts);
        const result = await response.json();
        // GET → nested { data: { data: [...] } }, POST → { data: X }
        if (method === 'GET') {
            return result?.data?.data ?? result?.data ?? result;
        }
        return result?.data || result;
    } catch (err) {
        return { success: false, error: err.message };
    }
};

/* ------------------------------------------------------------------ */
/*  Hook                                                              */
/* ------------------------------------------------------------------ */

export function usePackages({
                                activeFileKey,        // 'domain/file' ή null — για φιλτράρισμα
                                onOpenFile,           // (domain, path, name) => void
                                showNotification,     // (message, type) => void
                                loadCubosList,        // () => Promise<void>  (refresh dropdown του CubosPanel)
                            } = {}) {
    /* ---------------- state ---------------- */

    // cubos + files (raw από server)
    const [cubosWithFiles, setCubosWithFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // expanded state: { 'cubo:3': true, 'cubo:7': true }
    const [cuboExpanded, setCuboExpanded] = useState({});

    // search (τοπικό στο packages mode — διαφορετικό από files.searchTerm)
    const [searchTerm, setSearchTerm] = useState('');

    // drag state (component-level, όχι filesystem-level)
    // dragged = { type:'component', path, domain, name, sourceCuboId, componentId }
    const [dragged, setDragged] = useState(null);
    // dropTarget = { kind:'cubo', cuboId } | { kind:'domain', domain } | null
    const [dropTarget, setDropTarget] = useState(null);

    // filters (server-side)
    const [filters, setFilters] = useState({
        only_with_files: false,
        domain: null,       // null = όλα
    });

    // cubos rail (domain list για install target) — φορτώνεται on demand
    const [domainRailOpen, setDomainRailOpen] = useState(false);

    // saving flag για drag-drop mutations
    const [busy, setBusy] = useState(false);

    /* ---------------- loaders ---------------- */

    const loadCubosWithFiles = useCallback(
        async (opts = {}) => {
            setLoading(true);
            setError('');
            try {
                const body = {
                    only_with_files: filters.only_with_files,
                    ...(filters.domain ? { domain: filters.domain } : {}),
                    ...opts,
                };
                const r = await callApi('getCubosWithFiles', body);
                // Το endpoint επιστρέφει { success, data }
                const payload = r?.data ?? r;
                if (payload?.success && Array.isArray(payload.data)) {
                    setCubosWithFiles(payload.data);
                    // Default expand: cubos με λίγα files
                    setCuboExpanded((prev) => {
                        const next = { ...prev };
                        payload.data.forEach((c) => {
                            const key = `cubo:${c.id}`;
                            if (!(key in next) && c.files_count <= 5) {
                                next[key] = true;
                            }
                        });
                        return next;
                    });
                } else {
                    setCubosWithFiles([]);
                    setError(payload?.error || 'Failed to load packages');
                }
            } catch (err) {
                setError('Error: ' + err.message);
                setCubosWithFiles([]);
            } finally {
                setLoading(false);
            }
        },
        [filters.only_with_files, filters.domain]
    );

    /* ---------------- initial + filter change ---------------- */

    useEffect(() => {
        loadCubosWithFiles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.only_with_files, filters.domain]);

    /* ---------------- toggles ---------------- */

    const toggleCuboFolder = useCallback((cuboId) => {
        const key = `cubo:${cuboId}`;
        setCuboExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
    }, []);

    const expandAll = useCallback(() => {
        setCuboExpanded((prev) => {
            const next = { ...prev };
            cubosWithFiles.forEach((c) => {
                next[`cubo:${c.id}`] = true;
            });
            return next;
        });
    }, [cubosWithFiles]);

    const collapseAll = useCallback(() => {
        const cleared = {};
        // κρατάμε μόνο ό,τι αφορά το active file (θα ξανα-ανοίξει αυτόματα)
        setCuboExpanded(cleared);
    }, []);

    /* ---------------- filtering (client-side, για το activeFileKey) ---------------- */

    // filter 1: search
    const searchFiltered = useMemo(() => {
        if (!searchTerm.trim()) return cubosWithFiles;
        const lowerTerm = searchTerm.toLowerCase();
        return cubosWithFiles
            .map((c) => {
                const cuboMatch =
                    c.name?.toLowerCase().includes(lowerTerm) ||
                    c.title?.toLowerCase().includes(lowerTerm) ||
                    c.folder?.toLowerCase().includes(lowerTerm);
                const matchingFiles = (c.files || []).filter(
                    (f) =>
                        f.name?.toLowerCase().includes(lowerTerm) ||
                        f.path?.toLowerCase().includes(lowerTerm)
                );
                if (cuboMatch) return c;
                if (matchingFiles.length) return { ...c, files: matchingFiles };
                return null;
            })
            .filter(Boolean);
    }, [cubosWithFiles, searchTerm]);

    // filter 2: activeFileKey → μόνο cubos που περιέχουν το αρχείο
    const filteredCubos = useMemo(() => {
        if (!activeFileKey) return searchFiltered;

        const matches = searchFiltered
            .map((c) => {
                const files = (c.files || []).filter(
                    (f) => `${f.domain}/${f.path}` === activeFileKey
                );
                if (files.length === 0) return null;
                return { ...c, files, _autoExpanded: true };
            })
            .filter(Boolean);

        // Αν το αρχείο δεν βρίσκεται σε κανένα cubo, δείξε όλα (fallback)
        return matches.length > 0 ? matches : searchFiltered;
    }, [searchFiltered, activeFileKey]);

    /* ---------------- drag & drop ---------------- */

    // File μέσα σε cubo → drag start
    const handleComponentDragStart = useCallback((e, file, cubo) => {
        const payload = {
            type: 'component',
            componentId: file.id,
            path: file.path,           // domain-relative: 'components/Header.jsx'
            domain: file.domain,
            name: file.name,
            sourceCuboId: cubo.id,
            sourceCuboName: cubo.name,
        };
        e.dataTransfer.effectAllowed = 'copyMove';
        e.dataTransfer.setData('application/json', JSON.stringify(payload));
        setDragged(payload);
    }, []);

    const handleComponentDragEnd = useCallback(() => {
        setDragged(null);
        setDropTarget(null);
    }, []);

    // Drag πάνω από cubo card
    const handleCuboDragOver = useCallback(
        (e, cuboId) => {
            e.preventDefault();
            if (!dragged || dragged.type !== 'component') return;
            // Ίδιο cubo → no-op
            if (dragged.sourceCuboId === cuboId) {
                e.dataTransfer.dropEffect = 'none';
                setDropTarget(null);
                return;
            }
            // Ctrl/Cmd = move, αλλιώς copy
            const isMove = e.ctrlKey || e.metaKey;
            e.dataTransfer.dropEffect = isMove ? 'move' : 'copy';
            setDropTarget({ kind: 'cubo', cuboId });
        },
        [dragged]
    );

    // Drop σε cubo card
    const handleDropOnCubo = useCallback(
        async (e, targetCubo) => {
            e.preventDefault();
            e.stopPropagation();
            setDropTarget(null);

            const raw = e.dataTransfer.getData('application/json');
            if (!raw) {
                setDragged(null);
                return;
            }

            let payload;
            try {
                payload = JSON.parse(raw);
            } catch {
                setDragged(null);
                return;
            }

            if (payload.type !== 'component') {
                setDragged(null);
                return;
            }

            if (payload.sourceCuboId === targetCubo.id) {
                // no-op
                setDragged(null);
                return;
            }

            const isMove = e.ctrlKey || e.metaKey;
            const endpoint = isMove
                ? 'moveComponentToCubos'
                : 'copyComponentToCubos';

            setBusy(true);
            try {
                const r = await callApi(endpoint, {
                    path: payload.path,
                    source_path: `${payload.domain}/${payload.path}`, // για copy endpoint
                    source_domain: payload.domain,
                    target_cubosid: targetCubo.id,
                });

                if (r?.success) {
                    const action = isMove ? 'Μετακίνηση' : 'Αντιγραφή';
                    const already =
                        r.action === 'already_exists' ||
                        r.action === 'no_change';
                    showNotification?.(
                        already
                            ? `ℹ️ Το component υπάρχει ήδη στο «${targetCubo.name}»`
                            : `✅ ${action} → «${targetCubo.title || targetCubo.name}»`,
                        already ? 'info' : 'success'
                    );

                    await loadCubosWithFiles();
                    await loadCubosList?.();
                } else {
                    showNotification?.(
                        '❌ ' + (r?.error || 'Failed'),
                        'error'
                    );
                }
            } catch (err) {
                showNotification?.('❌ ' + err.message, 'error');
            } finally {
                setBusy(false);
                setDragged(null);
            }
        },
        [showNotification, loadCubosWithFiles, loadCubosList]
    );

    // Drag πάνω από domain (install target)
    const handleDomainDragOver = useCallback(
        (e, domain) => {
            e.preventDefault();
            if (!dragged || dragged.type !== 'component') return;
            if (dragged.domain === domain) {
                e.dataTransfer.dropEffect = 'none';
                return;
            }
            e.dataTransfer.dropEffect = 'copy';
            setDropTarget({ kind: 'domain', domain });
        },
        [dragged]
    );

    // Drop σε domain (install file → domain)
    const handleDropOnDomain = useCallback(
        async (e, targetDomain) => {
            e.preventDefault();
            e.stopPropagation();
            setDropTarget(null);

            const raw = e.dataTransfer.getData('application/json');
            if (!raw) {
                setDragged(null);
                return;
            }

            let payload;
            try {
                payload = JSON.parse(raw);
            } catch {
                setDragged(null);
                return;
            }

            if (payload.type !== 'component') {
                setDragged(null);
                return;
            }

            if (payload.domain === targetDomain) {
                setDragged(null);
                return;
            }

            setBusy(true);
            try {
                // source_path = 'domain/relative' (display path του source component)
                const sourceDisplayPath = `${payload.domain}/${payload.path}`;
                const r = await callApi('copyComponentToDomain', {
                    source_path: sourceDisplayPath,
                    target_domain: targetDomain,
                });

                if (r?.success) {
                    showNotification?.(
                        `✅ Install → ${targetDomain}/${r.target_path}`,
                        'success'
                    );
                    await loadCubosWithFiles();
                    await loadCubosList?.();
                } else {
                    showNotification?.(
                        '❌ ' + (r?.error || 'Failed'),
                        'error'
                    );
                }
            } catch (err) {
                showNotification?.('❌ ' + err.message, 'error');
            } finally {
                setBusy(false);
                setDragged(null);
            }
        },
        [showNotification, loadCubosWithFiles, loadCubosList]
    );

    /* ---------------- context menu actions ---------------- */

    // "Remove from cubo" — διαγράφει το row, ΔΕΝ το φυσικό αρχείο
    const removeFromCubo = useCallback(
        async (file, cubo) => {
            if (
                !window.confirm(
                    `Αφαίρεση «${file.name}» από το cubo «${cubo.title || cubo.name}»;\n(Το αρχείο παραμένει στο filesystem.)`
                )
            ) {
                return false;
            }
            setBusy(true);
            try {
                const r = await callApi('removeComponentFromCubos', {
                    path: `${file.domain}/${file.path}`,
                });
                if (r?.success) {
                    showNotification?.('🗑️ Αφαιρέθηκε από cubo', 'success');
                    await loadCubosWithFiles();
                    await loadCubosList?.();
                    return true;
                }
                showNotification?.('❌ ' + (r?.error || 'Failed'), 'error');
                return false;
            } catch (err) {
                showNotification?.('❌ ' + err.message, 'error');
                return false;
            } finally {
                setBusy(false);
            }
        },
        [showNotification, loadCubosWithFiles, loadCubosList]
    );

    // "Change cubo color" — UI only
    const updateCuboColor = useCallback(
        async (cuboId, color) => {
            if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
                showNotification?.('Μη έγκυρο χρώμα', 'error');
                return false;
            }
            try {
                const r = await callApi('updateCuboColor', {
                    cubos_id: cuboId,
                    color,
                });
                if (r?.success) {
                    // Optimistic update
                    setCubosWithFiles((prev) =>
                        prev.map((c) =>
                            c.id === cuboId ? { ...c, color } : c
                        )
                    );
                    showNotification?.('🎨 Χρώμα ενημερώθηκε', 'success');
                    return true;
                }
                showNotification?.('❌ ' + (r?.error || 'Failed'), 'error');
                return false;
            } catch (err) {
                showNotification?.('❌ ' + err.message, 'error');
                return false;
            }
        },
        [showNotification]
    );

    // "Open file in editor" — καλεί callback του orchestrator
    const openFile = useCallback(
        (file) => {
            if (!file) return;
            onOpenFile?.(file.domain, file.path, file.name);
        },
        [onOpenFile]
    );

    /* ---------------- context menu builder ---------------- */

    // Παρόμοιο contract με files.buildContextMenu — δέχεται handlers ως options.
    // Επιστρέφει items για <ContextMenu>.
    const buildCuboFileContextMenu = useCallback(
        (file, cubo, options = {}) => {
            const {
                onInstallToDomain = null, // (file) => void  — Phase C
            } = options;

            const items = [
                {
                    icon: '✏️',
                    label: 'Open in editor',
                    onClick: () => openFile(file),
                },
                {
                    icon: '📋',
                    label: 'Copy path',
                    onClick: () => {
                        navigator.clipboard.writeText(
                            `${file.domain}/${file.path}`
                        );
                        showNotification?.('Path copied', 'success');
                    },
                },
                { separator: true },
            ];

            if (typeof onInstallToDomain === 'function') {
                items.push({
                    icon: '📥',
                    label: 'Install to domain…',
                    onClick: () => onInstallToDomain(file),
                });
                items.push({ separator: true });
            }

            items.push({
                icon: '🗑️',
                label: 'Remove from cubo',
                danger: true,
                onClick: () => removeFromCubo(file, cubo),
            });

            return items;
        },
        [openFile, removeFromCubo, showNotification]
    );

    /* ---------------- domain rail (install target list) ---------------- */

    const openDomainRail = useCallback(() => setDomainRailOpen(true), []);
    const closeDomainRail = useCallback(() => setDomainRailOpen(false), []);

    /* ---------------- filters API ---------------- */

    const setOnlyWithFiles = useCallback((value) => {
        setFilters((prev) => ({ ...prev, only_with_files: Boolean(value) }));
    }, []);

    const setDomainFilter = useCallback((domain) => {
        setFilters((prev) => ({ ...prev, domain: domain || null }));
    }, []);

    /* ---------------- return ---------------- */

    return {
        // data
        cubosWithFiles,      // raw
        filteredCubos,       // μετά search + activeFileKey
        loading,
        error,

        // search
        searchTerm,
        setSearchTerm,

        // expanded
        cuboExpanded,
        toggleCuboFolder,
        expandAll,
        collapseAll,

        // filters
        filters,
        setOnlyWithFiles,
        setDomainFilter,

        // drag & drop
        dragged,
        dropTarget,
        handleComponentDragStart,
        handleComponentDragEnd,
        handleCuboDragOver,
        handleDropOnCubo,
        handleDomainDragOver,
        handleDropOnDomain,

        // busy
        busy,

        // actions
        openFile,
        removeFromCubo,
        updateCuboColor,
        buildCuboFileContextMenu,

        // domain rail (install target)
        domainRailOpen,
        openDomainRail,
        closeDomainRail,

        // refresh
        loadCubosWithFiles,
    };
}

export default usePackages;