// components/RichTextEditorGlobalTools.jsx
import React, { useMemo, useRef, useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { html as htmlLang } from '@codemirror/lang-html';
import { json as jsonLang } from '@codemirror/lang-json';
import { css as cssLang } from '@codemirror/lang-css';
import RichTextEditorSettingsPanel from './RichTextEditorSettingsPanel';   // ✅ ΝΕΟ

const CODE_MIRROR_SETUP = {
    lineNumbers: true,
    foldGutter: true,
    highlightActiveLine: true,
    bracketMatching: true,
    closeBrackets: true,
    autocompletion: true,
    indentOnInput: true,
    tabSize: 2,
};

const RichTextEditorGlobalTools = ({
                                       mode,
                                       onModeChange,
                                       htmlContent,
                                       onHtmlChange,
                                       jsonData,
                                       onJsonDataChange,
                                       jsonError,
                                       customCss,
                                       onCssChange,
                                       onRender,
                                       renderedContent,
                                       onCleanHtml,
                                       gContent = {},              // ✅ ΝΕΟ
                                       onSettingsSave,             // ✅ ΝΕΟ
                                   }) => {
    const htmlExtensions = useMemo(() => [htmlLang()], []);
    const jsonExtensions = useMemo(() => [jsonLang()], []);
    const cssExtensions  = useMemo(() => [cssLang()], []);

    const [openPanel, setOpenPanel] = useState(null);
    const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
    const tabsRef = useRef(null);

    const togglePanel = (key, e) => {
        if (openPanel === key) {
            setOpenPanel(null);
            return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        const PANEL_W = 520;
        const PANEL_H = 400;
        let left = rect.left;
        let top = rect.top - PANEL_H - 8;
        if (top < 8) top = rect.bottom + 8;
        left = Math.max(8, Math.min(left, window.innerWidth - PANEL_W - 8));
        setPanelPos({ top, left });
        setOpenPanel(key);
    };

    useEffect(() => {
        if (!openPanel) return;
        const onKey = (e) => { if (e.key === 'Escape') setOpenPanel(null); };
        const onClick = (e) => {
            if (tabsRef.current && !tabsRef.current.contains(e.target) &&
                !e.target.closest('.rte-floating-panel')) {
                setOpenPanel(null);
            }
        };
        document.addEventListener('keydown', onKey);
        document.addEventListener('mousedown', onClick);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('mousedown', onClick);
        };
    }, [openPanel]);

    const tab = (key, label, title) => (
        <button
            type="button"
            className={`rte-global-tab ${mode === key ? 'active' : ''}`}
            onClick={() => { onModeChange(key); setOpenPanel(null); }}
            title={title}
        >
            {label}
        </button>
    );

    const panelBtn = (key, label, title) => (
        <button
            type="button"
            className={`rte-global-tab ${openPanel === key ? 'active' : ''}`}
            onClick={(e) => togglePanel(key, e)}
            title={title}
        >
            {label}
        </button>
    );

    return (
        <div className="rte-global-tools" ref={tabsRef}>
            <div className="rte-global-tabs">
                {tab('visual', '📝 Visual', 'Visual editor')}
                {tab('html',   '💻 HTML',   'Edit raw HTML')}
                {panelBtn('json',     '🔄 JSON',     'JSON Data (content.json)')}
                {panelBtn('css',      '🎨 CSS',      'Custom CSS (content.css)')}
                {panelBtn('settings', '⚙️ Settings', 'GContent variables')}
            </div>

            {/* HTML mode */}
            {mode === 'html' && (
                <div className="rte-global-panel">
                    <div className="rte-global-row">
                        <button
                            type="button"
                            className="rte-global-btn"
                            onClick={onCleanHtml}
                            title="Clean HTML"
                        >
                            🧹 Clean
                        </button>
                        <span className="rte-global-hint" style={{ margin: 0 }}>
                            HTML mode — auto-formatted
                        </span>
                    </div>
                    <div className="rte-global-codemirror">
                        <CodeMirror
                            value={htmlContent || ''}
                            height="380px"
                            theme={oneDark}
                            extensions={htmlExtensions}
                            onChange={(val) => onHtmlChange(val)}
                            basicSetup={CODE_MIRROR_SETUP}
                            style={{ fontSize: 13 }}
                        />
                    </div>
                </div>
            )}

            {/* JSON panel */}
            {openPanel === 'json' && (
                <div
                    className="rte-floating-panel"
                    style={{
                        position: 'fixed',
                        top: panelPos.top,
                        left: panelPos.left,
                        width: 520,
                        maxHeight: '80vh',
                        zIndex: 999997,
                    }}
                >
                    <div className="rte-floating-header">
                        <strong>🔄 JSON Data</strong>
                        <span className="rte-floating-sub">content.json</span>
                        <button
                            type="button"
                            className="rte-floating-close"
                            onClick={() => setOpenPanel(null)}
                        >
                            ✕
                        </button>
                    </div>
                    <div className="rte-floating-body">
                        <div className="rte-global-codemirror">
                            <CodeMirror
                                value={typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData || {}, null, 2)}
                                height="240px"
                                theme={oneDark}
                                extensions={jsonExtensions}
                                onChange={(val) => onJsonDataChange(val)}
                                basicSetup={CODE_MIRROR_SETUP}
                                style={{ fontSize: 13 }}
                            />
                        </div>

                        {jsonError && (
                            <div className="rte-global-error">⚠️ {jsonError}</div>
                        )}

                        <button
                            type="button"
                            className="rte-global-btn rte-global-btn-primary"
                            onClick={onRender}
                        >
                            ▶ Render Template
                        </button>

                        {renderedContent && (
                            <div className="rte-global-rendered">
                                <div className="rte-global-label">Rendered Output:</div>
                                <div
                                    className="rte-global-rendered-box"
                                    dangerouslySetInnerHTML={{ __html: renderedContent }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* CSS panel */}
            {openPanel === 'css' && (
                <div
                    className="rte-floating-panel"
                    style={{
                        position: 'fixed',
                        top: panelPos.top,
                        left: panelPos.left,
                        width: 520,
                        maxHeight: '80vh',
                        zIndex: 999997,
                    }}
                >
                    <div className="rte-floating-header">
                        <strong>🎨 Custom CSS</strong>
                        <span className="rte-floating-sub">content.css</span>
                        <button
                            type="button"
                            className="rte-floating-close"
                            onClick={() => setOpenPanel(null)}
                        >
                            ✕
                        </button>
                    </div>
                    <div className="rte-floating-body">
                        <div className="rte-global-codemirror">
                            <CodeMirror
                                value={customCss || ''}
                                height="320px"
                                theme={oneDark}
                                extensions={cssExtensions}
                                onChange={(val) => onCssChange?.(val)}
                                basicSetup={CODE_MIRROR_SETUP}
                                style={{ fontSize: 13 }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Settings panel */}
            {openPanel === 'settings' && (
                <RichTextEditorSettingsPanel
                    initialData={gContent}
                    onSave={onSettingsSave}
                    onClose={() => setOpenPanel(null)}
                />
            )}
        </div>
    );
};

export default RichTextEditorGlobalTools;