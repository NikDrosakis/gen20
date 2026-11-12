// hooks/useFileSelection.js
import { useState, useMemo, useCallback } from 'react';

/**
 * Shared state for file selection, similarity, cubos save.
 * Used by BOTH Files mode and Packages mode.
 *
 * showNotification + callApi + patchTreeColors are injected from parent.
 * NOTE: No cubos setters here — they live in ComponentManager.
 */
export function useFileSelection({ callApi, showNotification }) {
    const [selected, setSelected] = useState(null);
    const [targetMeta, setTargetMeta] = useState(null);
    const [similar, setSimilar] = useState([]);
    const [simLoading, setSimLoading] = useState(false);
    const [highlighted, setHighlighted] = useState({});
    const [multiSelected, setMultiSelected] = useState(new Set());
    const [lastClickedPath, setLastClickedPath] = useState(null);

    const selectFile = useCallback(async (domain, path, name) => {
        setSelected({ domain, path, name });
        setHighlighted({ [path]: true });

        setSimLoading(true);
        const meta = await callApi('getFileMeta', { path });
        if (!meta?.success) {
            showNotification(meta?.error || 'Meta failed', 'error');
            setSimLoading(false);
            return;
        }
        setTargetMeta(meta.data);

        const sim = await callApi('findSimilarComponents', { path, threshold: 0.55 });
        if (sim?.success) {
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
    }, [callApi, showNotification]);

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

    const toggleHighlight = useCallback((path, checked) => {
        setHighlighted(prev => ({ ...prev, [path]: checked }));
    }, []);

    return {
        selected, setSelected,
        targetMeta, setTargetMeta,
        similar, simLoading,
        highlighted, setHighlighted, toggleHighlight,
        multiSelected, setMultiSelected,
        lastClickedPath, setLastClickedPath,
        selectFile,
        suggestedTitle, suggestedName, suggestedVersion,
    };
}