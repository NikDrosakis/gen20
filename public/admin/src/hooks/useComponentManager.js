// hooks/useComponentManager.js
import { useState, useMemo, useEffect, useCallback } from 'react';

export function useComponentManager() {
    /* ---------------- state ---------------- */
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [expanded, setExpanded] = useState({});
    const [dragged, setDragged] = useState(null);
    const [dropTarget, setDropTarget] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [contextMenu, setContextMenu] = useState(null);
    const [modal, setModal] = useState(null);

    /* ---------------- selection & similarity ---------------- */
    const [selected, setSelected] = useState(null);
    const [targetMeta, setTargetMeta] = useState(null);
    const [similar, setSimilar] = useState([]);
    const [simLoading, setSimLoading] = useState(false);
    const [highlighted, setHighlighted] = useState({});

    /* ---------------- multi-select ---------------- */
    const [multiSelected, setMultiSelected] = useState(new Set());
    const [lastClickedPath, setLastClickedPath] = useState(null);

    /* ---------------- cubos ---------------- */
    const [cubosList, setCubosList] = useState([]);
    const [cubosChoice, setCubosChoice] = useState('');
    const [newTitle, setNewTitle] = useState('');
    const [newName, setNewName] = useState('');
    const [newVersion, setNewVersion] = useState('');
    const [saving, setSaving] = useState(false);

    /* ---------------- cubo mode ---------------- */
    const [cubosWithFiles, setCubosWithFiles] = useState([]);
    const [cuboLoading, setCuboLoading] = useState(false);
    const [cuboError, setCuboError] = useState('');
    const [cuboExpanded, setCuboExpanded] = useState({});

    /* ---------------- edit drawer ---------------- */
    const [editing, setEditing] = useState(null);
    const [editContent, setEditContent] = useState('');

    /* ---------------- helpers ---------------- */
    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const apiPath = (displayPath) => {
        if (!displayPath) return displayPath;
        const parts = displayPath.split('/');
        if (parts.length === 1) return `${parts[0]}/src`;
        return `${parts[0]}/src/${parts.slice(1).join('/')}`;
    };

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
            if (method === 'GET') {
                return result?.data?.data ?? result?.data ?? result;
            }
            return result?.data || result;
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    /* ---------------- patchTreeColors ---------------- */
    const patchTreeColors = useCallback((updates) => {
        setData(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            const applyToNode = (node, pathParts, domain) => {
                if (!node?.children) return;
                for (const [key, child] of Object.entries(node.children)) {
                    const currentPath = pathParts.length ? `${pathParts.join('/')}/${key}` : key;
                    const displayPath = `${domain}/${currentPath}`;
                    if (child.children) {
                        applyToNode(child, [...pathParts, key], domain);
                    } else if (updates[displayPath]) {
                        Object.assign(child, updates[displayPath]);
                    }
                }
            };
            for (const [domain, domainNode] of Object.entries(next)) {
                applyToNode(domainNode, [], domain);
            }
            return next;
        });
    }, []);

    /* ---------------- loaders ---------------- */
    const loadComponents = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/v1/local/getComponentFiles');
            const result = await response.json();
            const payload = result?.data || result;
            if (payload.success && payload.data) {
                setData(payload.data);

                // ✅ Auto-expand ΟΛΑ τα paths (domains + folders)
                // Δομή: { admin: { path, children }, 'gen20.net': {...} }
                // Expanded keys: 'admin', 'admin/components',
                //                'admin/components/layout', ...
                const initialExpanded = {};
                const walk = (node, path = '') => {
                    if (!node?.children) return;
                    for (const [key, child] of Object.entries(node.children)) {
                        const currentPath = path ? `${path}/${key}` : key;
                        if (child.children) {
                            // Πάντα βάλε το path του φακέλου
                            initialExpanded[currentPath] = true;
                            walk(child, currentPath);
                        }
                    }
                };
                for (const [domain, node] of Object.entries(payload.data)) {
                    // Domain level: το domain ως key
                    initialExpanded[domain] = true;
                    walk(node, domain);
                }
                setExpanded(initialExpanded);
            } else {
                setError(payload.error || 'Failed to load components');
            }
        } catch (err) {
            setError('Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadCubosList = useCallback(async () => {
        const list = await callApi('listCubos', null, 'GET');
        setCubosList(Array.isArray(list) ? list : []);
    }, []);

    const loadCubosWithFiles = useCallback(async (opts = {}) => {
        setCuboLoading(true);
        setCuboError('');
        try {
            const r = await callApi('getCubosWithFiles', opts);
            if (r?.success) {
                setCubosWithFiles(r.data || []);
                const initialExpanded = {};
                (r.data || []).forEach(c => {
                    // Default: expanded αν έχει λίγα files
                    if (c.files_count <= 5) initialExpanded[`cubo:${c.id}`] = true;
                });
                setCuboExpanded(prev => ({ ...initialExpanded, ...prev }));
            } else {
                setCuboError(r?.error || 'Failed to load cubos');
            }
        } catch (err) {
            setCuboError('Error: ' + err.message);
        } finally {
            setCuboLoading(false);
        }
    }, []);

    /* ---------------- initial load ---------------- */
    useEffect(() => {
        loadComponents();
        loadCubosList();
    }, [loadComponents, loadCubosList]);

    /* ---------------- toggles ---------------- */
    const toggleFolder = useCallback((path) => {
        setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
    }, []);

    const toggleCuboFolder = useCallback((cuboId) => {
        const key = `cubo:${cuboId}`;
        setCuboExpanded(prev => ({ ...prev, [key]: !prev[key] }));
    }, []);

    /* ---------------- select file ---------------- */
    const selectFile = useCallback(async (domain, path, name) => {
        setSelected({ domain, path, name });
        setHighlighted({ [path]: true });
        setEditing(null);

        const parts = path.split('/');
        setExpanded(prev => {
            const next = { ...prev };
            for (let i = 1; i <= parts.length; i++) {
                next[parts.slice(0, i).join('/')] = true;
            }
            return next;
        });

        setSimLoading(true);

        const meta = await callApi('getFileMeta', { path });
        if (!meta.success) {
            showNotification(meta.error || 'Meta failed', 'error');
            setSimLoading(false);
            return;
        }
        setTargetMeta(meta.data);

        const sim = await callApi('findSimilarComponents', { path, threshold: 0.55 });
        if (sim.success) {
            const list = sim.data.candidates || [];
            setSimilar(list);
            const marks = { [path]: true };
            list.forEach(c => {
                if (c.similarity >= 0.75 || c.name_match) marks[c.path] = true;
            });
            setHighlighted(marks);
        } else {
            setSimilar([]);
        }
        setSimLoading(false);
    }, []);

    /* ---------------- multi-select click ---------------- */
    const getAllFilePaths = useCallback(() => {
        const paths = [];
        const collect = (node, path = '', domain = '') => {
            if (!node.children) return;
            for (const [key, child] of Object.entries(node.children)) {
                const currentPath = path ? `${path}/${key}` : key;
                if (child.children) {
                    collect(child, currentPath, domain);
                } else {
                    paths.push(`${domain}/${currentPath}`);
                }
            }
        };
        for (const [domain, node] of Object.entries(data)) {
            collect(node, '', domain);
        }
        return paths;
    }, [data]);

    const handleFileClick = useCallback((e, domain, path, name) => {
        const fullPath = `${domain}/${path}`;

        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setMultiSelected(prev => {
                const next = new Set(prev);
                if (next.has(fullPath)) next.delete(fullPath);
                else next.add(fullPath);
                return next;
            });
            setLastClickedPath(fullPath);
            return;
        }

        if (e.shiftKey && lastClickedPath) {
            e.preventDefault();
            const allPaths = getAllFilePaths();
            const start = allPaths.indexOf(lastClickedPath);
            const end = allPaths.indexOf(fullPath);
            if (start !== -1 && end !== -1) {
                const range = allPaths.slice(Math.min(start, end), Math.max(start, end) + 1);
                setMultiSelected(prev => new Set([...prev, ...range]));
            }
            return;
        }

        setMultiSelected(new Set([fullPath]));
        setLastClickedPath(fullPath);
        selectFile(domain, path, name);
    }, [lastClickedPath, getAllFilePaths, selectFile]);

    /* ---------------- open editor ---------------- */
    const openEditor = useCallback(async (path) => {
        const meta = await callApi('getFileMeta', { path });
        if (!meta.success) return showNotification(meta.error, 'error');
        setEditing({ path, filetype: meta.data.filetype });
        setEditContent(meta.data.content);
    }, []);

    /* ---------------- suggestions ---------------- */
    const suggestedTitle = useMemo(() => {
        if (targetMeta?.component?.cubos_title) return targetMeta.component.cubos_title;
        if (!selected?.name) return '';
        return selected.name.replace(/\.[^.]+$/, '');
    }, [selected, targetMeta]);

    const suggestedName = useMemo(() => {
        if (targetMeta?.component?.cubos_folder) return targetMeta.component.cubos_folder;
        if (!selected?.name) return '';
        return selected.name
            .replace(/\.[^.]+$/, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }, [selected, targetMeta]);

    const suggestedVersion = useMemo(() => {
        const now = new Date();
        const yy = String(now.getFullYear()).slice(-1);
        const pad = (n) => String(n).padStart(2, '0');
        return `${yy}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
    }, []);

    /* ---------------- save handlers ---------------- */
    const handleSaveOne = async (path) => {
        if (!cubosChoice) return showNotification('Διάλεξε cubos', 'error');
        setSaving(true);

        const body = { path };
        if (cubosChoice === 'new') {
            const name = (newName || suggestedName).trim();
            const title = (newTitle || suggestedTitle).trim() || name;
            if (!name) {
                setSaving(false);
                return showNotification('Το name είναι υποχρεωτικό', 'error');
            }
            body.name = name;
            body.title = title;
            body.version = (newVersion || suggestedVersion).trim();
        } else {
            body.cubos_id = Number(cubosChoice);
        }

        const r = await callApi('saveToCubos', body);
        setSaving(false);

        if (r.success) {
            showNotification(`✅ → ${r.cubos_title || r.cubos_name} (${r.cubos_folder})`);

            patchTreeColors({
                [path]: {
                    color: r.cubos_color || '#808080',
                    cubos_name: r.cubos_name,
                    cubos_title: r.cubos_title,
                },
            });

            await loadCubosList();
            if (r.cubosid) setCubosChoice(String(r.cubosid));
            setNewName('');
            setNewTitle('');
            setNewVersion('');

            const meta = await callApi('getFileMeta', { path });
            if (meta?.success) setTargetMeta(meta.data);
        } else {
            showNotification('❌ ' + r.error, 'error');
        }
    };

    const handleSaveAllHighlighted = async () => {
        if (!cubosChoice) return showNotification('Διάλεξε cubos', 'error');
        const paths = Object.keys(highlighted).filter(p => highlighted[p]);
        if (!paths.length) return showNotification('Δεν υπάρχουν highlighted', 'error');

        setSaving(true);
        const body = { paths };
        if (cubosChoice === 'new') {
            const name = (newName || suggestedName).trim();
            const title = (newTitle || suggestedTitle).trim() || name;
            if (!name) {
                setSaving(false);
                return showNotification('Το name είναι υποχρεωτικό', 'error');
            }
            body.name = name;
            body.title = title;
            body.version = (newVersion || suggestedVersion).trim();
        } else {
            body.cubos_id = Number(cubosChoice);
        }

        const r = await callApi('saveManyToCubos', body);
        setSaving(false);

        if (r.success) {
            showNotification(`✅ ${paths.length} αρχεία → cubos #${r.cubosid}`);

            const color = r.cubos_color || '#808080';
            const updates = {};
            paths.forEach(p => {
                updates[p] = {
                    color,
                    cubos_name: r.cubos_name,
                    cubos_title: r.cubos_title,
                };
            });
            patchTreeColors(updates);

            await loadCubosList();
            if (r.cubosid) setCubosChoice(String(r.cubosid));
            setNewName('');
            setNewTitle('');
            setNewVersion('');

            if (selected?.path) {
                const meta = await callApi('getFileMeta', { path: selected.path });
                if (meta?.success) setTargetMeta(meta.data);
            }
        } else {
            showNotification('❌ ' + r.error, 'error');
        }
    };

    const handleSaveOneToCubos = async (path, cubosId) => {
        setSaving(true);
        const r = await callApi('saveToCubos', { path, cubos_id: Number(cubosId) });
        setSaving(false);

        if (r.success) {
            showNotification(`✅ → ${r.cubos_title || r.cubos_name} (${r.cubos_folder})`);

            patchTreeColors({
                [path]: {
                    color: r.cubos_color || '#808080',
                    cubos_name: r.cubos_name,
                    cubos_title: r.cubos_title,
                },
            });

            await loadCubosList();
            if (selected?.path === path) {
                const meta = await callApi('getFileMeta', { path });
                if (meta?.success) setTargetMeta(meta.data);
            }
        } else {
            showNotification('❌ ' + r.error, 'error');
        }
    };

    const handleSaveSelectedToCubos = async () => {
        if (!cubosChoice) return showNotification('Διάλεξε cubos', 'error');
        const paths = Array.from(multiSelected);
        if (!paths.length) return;

        setSaving(true);
        const body = { paths };
        if (cubosChoice === 'new') {
            const name = (newName || suggestedName).trim();
            const title = (newTitle || suggestedTitle).trim() || name;
            if (!name) {
                setSaving(false);
                return showNotification('Το name είναι υποχρεωτικό', 'error');
            }
            body.name = name;
            body.title = title;
            body.version = (newVersion || suggestedVersion).trim();
        } else {
            body.cubos_id = Number(cubosChoice);
        }

        const r = await callApi('saveManyToCubos', body);
        setSaving(false);

        if (r.success) {
            showNotification(`✅ ${paths.length} αρχεία → cubos #${r.cubosid}`);

            const color = r.cubos_color || '#808080';
            const updates = {};
            paths.forEach(p => {
                updates[p] = {
                    color,
                    cubos_name: r.cubos_name,
                    cubos_title: r.cubos_title,
                };
            });
            patchTreeColors(updates);

            await loadCubosList();
            if (r.cubosid) setCubosChoice(String(r.cubosid));
            setNewName('');
            setNewTitle('');
            setNewVersion('');
            setMultiSelected(new Set());
        } else {
            showNotification('❌ ' + r.error, 'error');
        }
    };

    /* ---------------- drag & drop ---------------- */
    const handleDragStart = (e, domain, path, filename) => {
        const payload = { domain, path, filename, type: 'file' };
        e.dataTransfer.effectAllowed = 'copyMove';
        e.dataTransfer.setData('application/json', JSON.stringify(payload));
        setDragged(payload);
    };

    const handleDragOver = (e, targetPath) => {
        e.preventDefault();
        if (!dragged) return;
        e.dataTransfer.dropEffect = dragged.domain === targetPath.split('/')[0] ? 'move' : 'copy';
        setDropTarget(targetPath);
    };

    const handleDragLeave = () => setDropTarget(null);

    const handleDrop = async (e, targetDomain, targetPath) => {
        e.preventDefault();
        setDropTarget(null);
        const raw = e.dataTransfer.getData('application/json');
        if (!raw) return;
        const payload = JSON.parse(raw);
        const mode = payload.domain === targetDomain ? 'move' : 'copy';
        if (mode === 'move' && payload.path === targetPath) { setDragged(null); return; }
        try {
            const response = await fetch('/api/v1/local/moveFile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    source: apiPath(payload.path),
                    target: apiPath(targetPath),
                    mode,
                }),
            });
            const result = await response.json();
            const d = result?.data || result;
            if (d.success) {
                showNotification(`${mode === 'move' ? 'Μετακίνηση' : 'Αντιγραφή'} επιτυχής: ${d.filename}`);
                await loadComponents();
            } else {
                showNotification(d.error || 'Σφάλμα', 'error');
            }
        } catch (err) {
            showNotification('Σφάλμα δικτύου: ' + err.message, 'error');
        } finally {
            setDragged(null);
        }
    };

    /* ---------------- cubo drag & drop ---------------- */
    const handleDropOnCubo = async (e, targetCuboId, sourcePath, sourceDomain) => {
        e.preventDefault();
        e.stopPropagation();
        if (!dragged) return;

        const isMove = e.ctrlKey || e.metaKey;
        const action = isMove ? 'moveComponentToCubos' : 'copyComponentToCubos';

        try {
            const r = await callApi(action, {
                source_path: sourcePath || dragged.path,
                source_domain: sourceDomain || dragged.domain,
                target_cubosid: targetCuboId,
            });
            if (r.success) {
                showNotification(`✅ ${isMove ? 'Μετακίνηση' : 'Αντιγραφή'} → cubos #${targetCuboId}`);
                await loadCubosWithFiles();
            } else {
                showNotification('❌ ' + (r.error || 'Failed'), 'error');
            }
        } catch (err) {
            showNotification('❌ ' + err.message, 'error');
        } finally {
            setDragged(null);
        }
    };

    const handleDropOnDomain = async (e, targetDomain) => {
        e.preventDefault();
        e.stopPropagation();
        if (!dragged) return;
        try {
            const r = await callApi('copyComponentToDomain', {
                source_path: dragged.path,
                target_domain: targetDomain,
            });
            if (r.success) {
                showNotification(`✅ Install → ${targetDomain}/${r.target_path}`);
                await loadComponents();
                await loadCubosWithFiles();
            } else {
                showNotification('❌ ' + (r.error || 'Failed'), 'error');
            }
        } catch (err) {
            showNotification('❌ ' + err.message, 'error');
        } finally {
            setDragged(null);
        }
    };

    /* ---------------- filter ---------------- */
    const filterTree = (node, term) => {
        if (!term) return node;
        if (!node.children) return null;
        const lowerTerm = term.toLowerCase();
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
        return hasMatch ? { ...node, children: filteredChildren } : null;
    };

    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        const result = {};
        const lowerTerm = searchTerm.toLowerCase();
        for (const [domain, domainData] of Object.entries(data)) {
            const domainMatch = domain.toLowerCase().includes(lowerTerm) ||
                domainData.path?.toLowerCase().includes(lowerTerm);
            const filtered = filterTree(domainData, searchTerm);
            if (domainMatch || filtered) result[domain] = filtered || domainData;
        }
        return result;
    }, [data, searchTerm]);

    const filteredCubos = useMemo(() => {
        if (!searchTerm) return cubosWithFiles;
        const lowerTerm = searchTerm.toLowerCase();
        return cubosWithFiles
            .map(c => {
                const cuboMatch =
                    c.name?.toLowerCase().includes(lowerTerm) ||
                    c.title?.toLowerCase().includes(lowerTerm);
                const matchingFiles = (c.files || []).filter(f =>
                    f.name?.toLowerCase().includes(lowerTerm) ||
                    f.path?.toLowerCase().includes(lowerTerm)
                );
                if (cuboMatch) return c;
                if (matchingFiles.length) return { ...c, files: matchingFiles };
                return null;
            })
            .filter(Boolean);
    }, [cubosWithFiles, searchTerm]);

    /* ---------------- CRUD ---------------- */
    const handleDelete = async (path) => {
        if (!confirm(`Σίγουρα να διαγράψεις το "${path}";`)) return;
        const result = await callApi('deleteItem', { path: apiPath(path) });
        if (result.success) {
            showNotification('🗑️ Διαγράφηκε');
            await loadComponents();
        } else {
            showNotification('❌ ' + (result.error || 'Failed'), 'error');
        }
    };

    const handleCreateFolder = async (parentDisplay, name) => {
        const result = await callApi('createFolderInDomain', { parent: apiPath(parentDisplay), name });
        if (result.success) {
            showNotification(`📁 Δημιουργήθηκε: ${name}`);
            await loadComponents();
        } else {
            showNotification('❌ ' + (result.error || 'Failed'), 'error');
        }
    };

    const handleCreateFile = async (parentDisplay, name) => {
        const result = await callApi('createFile', { parent: apiPath(parentDisplay), name, content: '' });
        if (result.success) {
            showNotification(`📄 Δημιουργήθηκε: ${name}`);
            await loadComponents();
        } else {
            showNotification('❌ ' + (result.error || 'Failed'), 'error');
        }
    };

    const handleRename = async (displayPath, newName) => {
        const result = await callApi('renameItem', { path: apiPath(displayPath), newName });
        if (result.success) {
            showNotification(`✏️ Μετονομάστηκε: ${newName}`);
            await loadComponents();
        } else {
            showNotification('❌ ' + (result.error || 'Failed'), 'error');
        }
    };

    const handleModalSubmit = (type, parent, target, value) => {
        if (!value) {
            showNotification('❌ Παρακαλώ δώσε όνομα', 'error');
            return;
        }
        if (type === 'file') handleCreateFile(parent, value);
        else if (type === 'folder') handleCreateFolder(parent, value);
        else if (type === 'rename') handleRename(target.path, value);
        setModal(null);
    };

    /* ---------------- context menu ---------------- */
    const handleContextMenu = (e, target) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, target });
    };

    const buildContextMenu = () => {
        if (!contextMenu) return [];
        const { target } = contextMenu;

        if (target.isFile) {
            return [
                { icon: '✏️', label: 'Edit', onClick: () => openEditor(target.path) },
                { icon: '🔍', label: 'Compare', onClick: () => selectFile(target.domain, target.path, target.name) },
                ...(cubosList.length > 0
                    ? [{
                        icon: '💾',
                        label: 'Save to cubos',
                        submenu: [
                            ...cubosList.map(c => ({
                                icon: '●',
                                label: c.title && c.title !== c.name ? `${c.name} — ${c.title}` : c.name,
                                color: c.color,
                                onClick: () => handleSaveOneToCubos(target.path, c.id),
                            })),
                            { separator: true },
                            {
                                icon: '➕',
                                label: 'New cubos...',
                                onClick: () => {
                                    setCubosChoice('new');
                                    showNotification('Συμπλήρωσε name/title στο panel');
                                },
                            },
                        ],
                    }]
                    : []),
                { icon: '📋', label: 'Copy path', onClick: () => { navigator.clipboard.writeText(target.path); showNotification('Path copied'); } },
                { separator: true },
                { icon: '🗑️', label: 'Delete', danger: true, onClick: () => handleDelete(target.path) },
            ];
        }

        return [
            { icon: '📄', label: 'New File', onClick: () => setModal({ type: 'file', parent: target.path }) },
            { icon: '📁', label: 'New Folder', onClick: () => setModal({ type: 'folder', parent: target.path }) },
            { separator: true },
            { icon: '✏️', label: 'Rename', onClick: () => setModal({ type: 'rename', target, value: target.name }) },
            { separator: true },
            { icon: '🗑️', label: 'Delete', danger: true, onClick: () => handleDelete(target.path) },
        ];
    };

    /* ---------------- edit save ---------------- */
    const handleEditSave = async (path, content) => {
        const r = await callApi('saveFSContent', { path, content });
        if (r.success) {
            showNotification('✅ Αποθηκεύτηκε');
            setEditContent(content);
            if (selected?.path === path) {
                const meta = await callApi('getFileMeta', { path });
                if (meta?.success) setTargetMeta(meta.data);
            }
        } else {
            showNotification('❌ ' + r.error, 'error');
        }
        return r;
    };

    /* ---------------- return ---------------- */
    return {
        // state
        data, filteredData, loading, error,
        searchTerm, setSearchTerm,
        expanded, toggleFolder,
        dragged, dropTarget,
        notification, contextMenu, setContextMenu,
        modal, setModal,
        selected, targetMeta, similar, simLoading, highlighted, setHighlighted,
        multiSelected, setMultiSelected,
        cubosList, cubosChoice, setCubosChoice,
        newTitle, setNewTitle, newName, setNewName,
        newVersion, setNewVersion, saving,
        cubosWithFiles, filteredCubos, cuboLoading, cuboError, cuboExpanded,
        toggleCuboFolder,
        editing, editContent, setEditing,

        // suggestions
        suggestedTitle, suggestedName, suggestedVersion,

        // handlers
        loadComponents, loadCubosList, loadCubosWithFiles,
        selectFile, handleFileClick, openEditor,
        handleSaveOne, handleSaveAllHighlighted, handleSaveOneToCubos, handleSaveSelectedToCubos,
        handleDragStart, handleDragOver, handleDragLeave, handleDrop,
        handleDropOnCubo, handleDropOnDomain,
        handleDelete, handleCreateFile, handleCreateFolder, handleRename, handleModalSubmit,
        handleContextMenu, buildContextMenu,
        handleEditSave,
        patchTreeColors,
        showNotification,
        callApi,
    };
}