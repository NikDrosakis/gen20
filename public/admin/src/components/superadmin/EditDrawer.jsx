import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { html } from '@codemirror/lang-html';
import { php } from '@codemirror/lang-php';

const getLang = (filetype) => {
    switch ((filetype || '').toLowerCase()) {
        case 'js':
        case 'jsx':
        case 'ts':
        case 'tsx': return javascript({ jsx: true, typescript: filetype.startsWith('ts') });
        case 'css':
        case 'scss': return css();
        case 'json': return json();
        case 'html': return html();
        case 'php': return php();
        default: return [];
    }
};

const EditDrawer = ({ editing, initialContent, onSave, onClose }) => {
    const [localContent, setLocalContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        setLocalContent(initialContent || '');
        setDirty(false);
    }, [editing?.path, initialContent]);

    if (!editing) return null;

    const handleSave = async () => {
        setSaving(true);
        const r = await onSave(editing.path, localContent);
        setSaving(false);
        if (r.success) setDirty(false);
    };

    return (
        <div
            style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                zIndex: 100001, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'white', width: 'min(1200px, 95vw)',
                    height: 'min(850px, 90vh)', borderRadius: 12,
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{
                    padding: '12px 16px', borderBottom: '1px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', gap: 12,
                }}>
                    <strong style={{ fontFamily: 'monospace' }}>{editing.path}</strong>
                    {dirty && <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>● Unsaved</span>}
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: '#64748b' }}>
                        {localContent.split('\n').length} γραμμές
                    </span>
                    <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18 }}>✕</button>
                </div>

                <div style={{ flex: 1, overflow: 'auto' }}>
                    <CodeMirror
                        value={localContent}
                        height="100%"
                        extensions={[getLang(editing.filetype)]}
                        onChange={(value) => {
                            setLocalContent(value);
                            setDirty(true);
                        }}
                        theme="light"
                        basicSetup={{
                            lineNumbers: true,
                            foldGutter: true,
                            highlightActiveLine: true,
                        }}
                    />
                </div>

                <div style={{
                    padding: '12px 16px', borderTop: '1px solid #e2e8f0',
                    display: 'flex', gap: 8, justifyContent: 'flex-end',
                }}>
                    <button onClick={onClose} style={{
                        padding: '8px 16px', border: '1px solid #e2e8f0',
                        background: 'white', borderRadius: 6, cursor: 'pointer',
                    }}>Cancel</button>
                    <button onClick={handleSave} disabled={saving || !dirty} style={{
                        padding: '8px 16px', border: 'none',
                        background: dirty ? '#3b82f6' : '#cbd5e1',
                        color: 'white', borderRadius: 6,
                        cursor: dirty && !saving ? 'pointer' : 'not-allowed',
                    }}>{saving ? 'Saving...' : 'Save'}</button>
                </div>
            </div>
        </div>
    );
};

export default EditDrawer;