// components/CodeEditorPane.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';

import { javascript } from '@codemirror/lang-javascript';
import { css as cssLang } from '@codemirror/lang-css';
import { json as jsonLang } from '@codemirror/lang-json';
import { markdown as markdownLang } from '@codemirror/lang-markdown';
import { html as htmlLang } from '@codemirror/lang-html';
import { php as phpLang } from '@codemirror/lang-php';

const LANG_LABEL = {
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

const getLanguageExtension = (filetype) => {
    switch (filetype) {
        case 'jsx': return javascript({ jsx: true });
        case 'tsx': return javascript({ jsx: true, typescript: true });
        case 'js':  return javascript();
        case 'ts':  return javascript({ typescript: true });
        case 'css': return cssLang();
        case 'scss': return cssLang();
        case 'json': return jsonLang();
        case 'md': return markdownLang();
        case 'html': return htmlLang();
        case 'php': return phpLang();
        case 'pug': return htmlLang(); // fallback
        default: return [];
    }
};

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

    const dirty = content !== originalContent;

    /* Load file */
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

    /* Save */
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

    /* Close */
    const handleClose = useCallback(() => {
        if (dirty && !window.confirm('Discard unsaved changes?')) return;
        onClose();
    }, [dirty, onClose]);

    /* Ctrl+S */
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

    /* Language extension */
    const extensions = useMemo(() => {
        const ext = getLanguageExtension(filetype);
        return Array.isArray(ext) ? ext : [ext];
    }, [filetype]);

    /* Render */
    return (
        <div className="cm-editor">
            {/* Title bar */}
            <div className="cm-editor-titlebar">
                <span className="cm-editor-tab active">
                    {dirty && <span className="cm-dirty-dot">●</span>}
                    <span className="cm-editor-tab-name">{path.split('/').pop()}</span>
                    <span className="cm-editor-tab-path"> — {path}</span>
                </span>
                <div className="cm-editor-actions">
                    <button
                        className={`cm-btn-save ${dirty ? 'dirty' : ''}`}
                        onClick={handleSave}
                        disabled={!dirty || saving}
                    >
                        {saving ? '…' : '💾 Save'}
                    </button>
                    <button className="cm-btn-close" onClick={handleClose}>✕</button>
                </div>
            </div>

            {/* Body */}
            <div className="cm-editor-body">
                {loading ? (
                    <div className="cm-editor-loading">
                        <div className="cm-spinner" />
                        <span>Loading {path.split('/').pop()}…</span>
                    </div>
                ) : error ? (
                    <div className="cm-editor-error">⚠️ {error}</div>
                ) : (
                    <CodeMirror
                        value={content}
                        height="100%"
                        theme={oneDark}
                        extensions={extensions}
                        onChange={(val) => setContent(val)}
                        basicSetup={{
                            lineNumbers: true,
                            foldGutter: true,
                            highlightActiveLine: true,
                            bracketMatching: true,
                            closeBrackets: true,
                            autocompletion: true,
                            indentOnInput: true,
                            tabSize: 2,
                        }}
                        style={{ fontSize: 13, height: '100%' }}
                    />
                )}
            </div>

            {/* Status bar */}
            <div className="cm-editor-statusbar">
                <div className="cm-statusbar-left">
                    <span className="cm-statusbar-item">🌿 {path.split('/')[0]}</span>
                    <span className="cm-statusbar-item">
                        {LANG_LABEL[filetype] || filetype?.toUpperCase() || 'TEXT'}
                    </span>
                </div>
                <div className="cm-statusbar-right">
                    <span className="cm-statusbar-item">{content.length} chars</span>
                    <span className="cm-statusbar-item">{dirty ? '● Modified' : '✓ Saved'}</span>
                </div>
            </div>
        </div>
    );
}