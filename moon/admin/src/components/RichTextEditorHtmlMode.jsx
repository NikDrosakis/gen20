// components/RichTextEditorHtmlMode.jsx
import React, { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { html as htmlLang } from '@codemirror/lang-html';

/**
 * HTML mode για τον RichTextEditor.
 * Ίδιο look με CodeEditorPane αλλά in-memory (value/onChange).
 */
const RichTextEditorHtmlMode = ({ value, onChange, onCleanHtml }) => {
    const extensions = useMemo(() => [htmlLang()], []);

    return (
        <div className="rte-html-mode">
            {/* Toolbar */}
            <div className="rte-html-mode-toolbar">
                <span className="rte-html-mode-label">💻 HTML Mode</span>
                <button
                    type="button"
                    className="rte-html-mode-btn"
                    onClick={onCleanHtml}
                    title="Clean HTML"
                >
                    🧹 Clean
                </button>
            </div>

            {/* Editor */}
            <div className="rte-html-mode-body">
                <CodeMirror
                    value={value || ''}
                    height="400px"
                    theme={oneDark}
                    extensions={extensions}
                    onChange={(val) => onChange(val)}
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
                    style={{ fontSize: 13 }}
                />
            </div>

            {/* Status */}
            <div className="rte-html-mode-status">
                <span>{(value || '').length} chars</span>
                <span>HTML</span>
            </div>
        </div>
    );
};

export default RichTextEditorHtmlMode;