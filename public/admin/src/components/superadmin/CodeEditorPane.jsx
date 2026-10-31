// components/superadmin/CodeEditorPane.jsx
//
// VS Code-style editor pane.
//
// Props:
//   path       — display path (π.χ. 'admin/components/Header.jsx')
//   filetype   — 'jsx' | 'js' | 'css' | ...
//   onClose    — () => void
//   onSave     — async (path, content) => { success }
//   callApi    — (endpoint, body, method?) => Promise
//   showNotification — (message, type?) => void
//
// Όλα τα χρώματα έρχονται από CSS variables (--cm-*)
// που ορίζονται στο ComponentManager.css.

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                          */
/* ------------------------------------------------------------------ */

const LANG_MAP = {
    jsx: 'JavaScript React',
    tsx: 'TypeScript React',
    js: 'JavaScript',
    ts: 'TypeScript',
    css: 'CSS',
    scss: 'SCSS',
    json: 'JSON',
    md: 'Markdown',
    html: 'HTML',
    php: 'PHP',
    pug: 'Pug',
};

const getLanguageLabel = (filetype) =>
    LANG_MAP[filetype] || filetype?.toUpperCase() || 'Plain Text';

/* ------------------------------------------------------------------ */
/*  Component                                                        */
/* ------------------------------------------------------------------ */

export default function CodeEditorPane({
                                           path,
                                           filetype,
                                           onClose,
                                           onSave,
                                           callApi,
                                           showNotification,
                                       }) {
    const [content, setContent] = useState('');
    const [originalContent, setOriginalContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const textareaRef = useRef(null);
    const gutterRef = useRef(null);

    const dirty = content !== originalContent;

    /* ─── Load file ─────────────────────────────────────────────── */
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError('');

        (async () => {
            try {
                const meta = await callApi('getFileMeta', { path });
                if (cancelled) return;
                if (meta?.success) {
                    setContent(meta.data.content ?? '');
                    setOriginalContent(meta.data.content ?? '');
                } else {
                    const msg = meta?.error || 'Failed to load file';
                    setError(msg);
                    showNotification?.(msg, 'error');
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message);
                    showNotification?.(err.message, 'error');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [path, callApi, showNotification]);

    /* ─── Save ──────────────────────────────────────────────────── */
    const handleSave = useCallback(async () => {
        if (!dirty || saving) return;
        setSaving(true);
        try {
            const r = await onSave(path, content);
            if (r?.success) setOriginalContent(content);
        } finally {
            setSaving(false);
        }
    }, [dirty, saving, onSave, path, content]);

    /* ─── Close with dirty guard ────────────────────────────────── */
    const handleClose = useCallback(() => {
        if (dirty && !window.confirm('Discard unsaved changes?')) return;
        onClose();
    }, [dirty, onClose]);

    /* ─── Ctrl+S handler ────────────────────────────────────────── */
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [handleSave]);

    /* ─── Tab key inserts \t ────────────────────────────────────── */
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const ta = e.currentTarget;
            const start = ta.selectionStart;
            const end = ta.selectionEnd;

            const next = content.slice(0, start) + '\t' + content.slice(end);
            setContent(next);

            requestAnimationFrame(() => {
                ta.selectionStart = ta.selectionEnd = start + 1;
            });
        }
    }, [content]);

    /* ─── Sync gutter scroll with textarea scroll ───────────────── */
    const handleScroll = useCallback((e) => {
        if (gutterRef.current) {
            gutterRef.current.scrollTop = e.currentTarget.scrollTop;
        }
    }, []);

    /* ─── Line numbers ──────────────────────────────────────────── */
    const lineCount = useMemo(
        () => (content ? content.split('\n').length : 1),
        [content]
    );

    const lineNumbers = useMemo(() => {
        const arr = [];
        for (let i = 1; i <= lineCount; i++) arr.push(i);
        return arr;
    }, [lineCount]);

    /* ─── Render ────────────────────────────────────────────────── */
    return (
        <div className="cm-editor">
            {/* ─── Editor title bar (VS Code) ──────────────────── */}
            <div className="cm-editor-titlebar">
                <span className="cm-editor-tab active">
                    {dirty && <span className="cm-dirty-dot" title="Unsaved changes">●</span>}
                    <span className="cm-editor-tab-name">
                        {path.split('/').pop()}
                    </span>
                    <span className="cm-editor-tab-path">{path}</span>
                </span>

                <div className="cm-editor-actions">
                    <button
                        className={`cm-btn-save ${dirty ? 'dirty' : ''}`}
                        onClick={handleSave}
                        disabled={!dirty || saving}
                        title="Save (Ctrl+S)"
                    >
                        {saving ? '…' : '💾 Save'}
                    </button>
                    <button
                        className="cm-btn-close"
                        onClick={handleClose}
                        title="Close editor"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* ─── Editor body: gutter + textarea ──────────────── */}
            <div className="cm-editor-body">
                {loading ? (
                    <div className="cm-editor-loading">
                        <div className="cm-spinner"/>
                        <span>Loading {path.split('/').pop()}…</span>
                    </div>
                ) : error ? (
                    <div className="cm-editor-error">⚠️ {error}</div>
                ) : (
                    <div className="cm-editor-scroll">
                        <div className="cm-editor-gutter" aria-hidden="true">
                            {lineNumbers.map((n) => (
                                <div key={n} className="cm-editor-line-number">{n}</div>
                            ))}
                        </div>
                        <textarea
                            ref={textareaRef}
                            className="cm-editor-textarea"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onKeyDown={handleKeyDown}
                            spellCheck={false}
                            autoCapitalize="off"
                            autoCorrect="off"
                            wrap="off"
                        />
                    </div>
                )}
            </div>

            {/* ─── Status bar (VS Code) ────────────────────────── */}
            <div className="cm-editor-statusbar">
                <div className="cm-statusbar-left">
                    <span className="cm-statusbar-item">🌿 {path.split('/')[0]}</span>
                    <span className="cm-statusbar-item">
                        {getLanguageLabel(filetype)}
                    </span>
                </div>
                <div className="cm-statusbar-right">
                    <span className="cm-statusbar-item">
                        Ln {lineCount}, Col —
                    </span>
                    <span className="cm-statusbar-item">
                        {content.length} chars
                    </span>
                    <span className="cm-statusbar-item">
                        UTF-8
                    </span>
                    <span className="cm-statusbar-item">
                        {dirty ? '● Modified' : '✓ Saved'}
                    </span>
                </div>
            </div>
        </div>
    );
}