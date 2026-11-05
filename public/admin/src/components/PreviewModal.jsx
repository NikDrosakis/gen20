// components/PreviewModal.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function PreviewModal({ filePath, domain, onClose }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [iframeHtml, setIframeHtml] = useState('');

    useEffect(() => {
        if (!filePath) return;

        setLoading(true);
        setError(null);

        // 1. Fetch το περιεχόμενο του αρχείου
        fetch(`/api/v1/local/readFile?path=${encodeURIComponent(domain + '/' + filePath)}`)
            .then(r => r.json())
            .then(json => {
                if (!json.success) {
                    throw new Error(json.error || 'Failed to read file');
                }

                const code = json.data.content;

                // 2. Babel transform
                const Babel = window.Babel;
                if (!Babel) {
                    throw new Error('@babel/standalone not loaded');
                }

                let transformed;
                try {
                    transformed = Babel.transform(code, {
                        presets: ['react', 'env'],
                        filename: filePath,
                        plugins: [
                            // Wrap export default → window.__component__
                            ({ types: t }) => ({
                                visitor: {
                                    ExportDefaultDeclaration(path) {
                                        const declaration = path.node.declaration;
                                        path.replaceWith(
                                            t.assignmentExpression(
                                                '=',
                                                t.memberExpression(
                                                    t.identifier('window'),
                                                    t.identifier('__component__')
                                                ),
                                                declaration
                                            )
                                        );
                                    }
                                }
                            })
                        ]
                    }).code;
                } catch (babelErr) {
                    throw new Error('Babel error: ' + babelErr.message);
                }

                // 3. Φτιάξε το iframe HTML
                const html = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8" />
                        <script src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
                        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
                        <style>
                            body { font-family: sans-serif; padding: 20px; }
                        </style>
                    </head>
                    <body>
                        <div id="root"></div>
                        <script>
                            try {
                                ${transformed}
                                const Component = window.__component__;
                                if (Component) {
                                    const root = ReactDOM.createRoot(document.getElementById('root'));
                                    root.render(React.createElement(Component));
                                } else {
                                    document.getElementById('root').innerHTML = '<p style="color:red">No component exported</p>';
                                }
                            } catch (e) {
                                document.getElementById('root').innerHTML = '<pre style="color:red">Error: ' + e.message + '</pre>';
                            }
                        <\/script>
                    </body>
                    </html>
                `;

                setIframeHtml(html);
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [filePath, domain]);

    return createPortal(
        <div
            onClick={onClose}
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.7)', zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: '#fff', borderRadius: 8,
                    width: '90%', maxWidth: 1200, height: '80vh',
                    display: 'flex', flexDirection: 'column',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '12px 16px', borderBottom: '1px solid #eee',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <h3 style={{ margin: 0, fontSize: 16 }}>
                        👁️ Preview: <code>{filePath}</code>
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'red', color: '#fff', border: 'none',
                            borderRadius: '50%', width: 30, height: 30,
                            cursor: 'pointer', fontWeight: 'bold'
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                    {loading && (
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: '#fafafa'
                        }}>
                            <p>⏳ Loading preview...</p>
                        </div>
                    )}
                    {error && (
                        <div style={{
                            padding: 20, color: '#e74c3c',
                            background: '#fee2e2', margin: 20, borderRadius: 8
                        }}>
                            <strong>❌ Preview Error:</strong>
                            <pre style={{ whiteSpace: 'pre-wrap', marginTop: 10 }}>{error}</pre>
                        </div>
                    )}
                    {!loading && !error && iframeHtml && (
                        <iframe
                            srcDoc={iframeHtml}
                            title="Component Preview"
                            style={{
                                width: '100%', height: '100%', border: 'none'
                            }}
                            sandbox="allow-scripts"
                        />
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}