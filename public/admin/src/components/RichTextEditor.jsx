/*
#name: RichTextEditor
#title: Rich Text Editor with HTML, CSS, and JSON Template Support
#description: A full-featured rich text editor with visual editing, HTML mode, CSS customization, and Handlebars JSON template rendering. Supports bilingual content and custom CSS injection.
#author: Niki Mourtzi
#version: 2.0.0
#type: component
#library: editor
#independent: true
#standalone: true
#compatible_areas: m
#dependencies: react, handlebars
#methods:
#   - execCommand(): Executes document.execCommand for formatting
#   - formatBlock(): Applies block formatting (H2, H3, etc.)
#   - insertHtml(): Inserts HTML at cursor position
#   - handleImageUpload(): Prompts for image URL and inserts image
#   - handleLink(): Prompts for URL and creates hyperlink
#   - cleanHtml(): Removes unwanted span styles and cleans HTML
#   - formatHtml(): Formats HTML code for readability
#   - processContent(): Renders Handlebars templates with JSON data
#   - renderHandlebarsTemplate(): Compiles and renders Handlebars templates
#   - applyCustomCss(): Injects custom CSS into document head
#   - saveCursorPosition(): Saves current cursor position
#   - restoreCursorPosition(): Restores cursor position
#   - insertVariable(): Inserts Handlebars variable syntax
#   - insertLoop(): Inserts Handlebars loop syntax
#   - toggleJsonMode(): Toggles JSON template editor mode
#   - toggleHtmlMode(): Toggles HTML source code mode
#   - toggleCssPanel(): Toggles custom CSS panel
#   - togglePreview(): Toggles preview mode
#handlebars_helpers:
#   - eq: Equality comparison helper
#   - lang: Language-specific field helper
#   - ifCond: Conditional comparison helper
#   - formatDate: Date formatting helper
*/
import { useState, useRef, useEffect } from 'react';
import Handlebars from 'handlebars';
import "./RichTextEditor.css";

// Register Handlebars helpers
Handlebars.registerHelper('eq', function(a, b) {
    return a === b;
});

Handlebars.registerHelper('lang', function(field, options) {
    const lang = options.data.root._lang || 'en';
    const value = this[`${field}_${lang}`] || this[field];
    return new Handlebars.SafeString(value || '');
});

Handlebars.registerHelper('ifCond', function(v1, operator, v2, options) {
    switch (operator) {
        case '==': return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===': return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=': return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==': return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<': return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=': return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>': return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=': return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        default: return options.inverse(this);
    }
});

Handlebars.registerHelper('formatDate', function(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString();
});

const RichTextEditor = ({
                            value,
                            onChange,
                            language,
                            dataSource = null,
                            templateType = 'handlebars',
                            customCss = '',
                            onCssChange
                        }) => {
    const [showPreview, setShowPreview] = useState(false);
    const [showHtmlMode, setShowHtmlMode] = useState(false);
    const [showCssPanel, setShowCssPanel] = useState(false);
    const [showJsonMode, setShowJsonMode] = useState(false);
    const [localCustomCss, setLocalCustomCss] = useState(customCss || '');
    const [htmlContent, setHtmlContent] = useState('');
    const [jsonTemplate, setJsonTemplate] = useState('');
    const [jsonData, setJsonData] = useState(dataSource || {});
    const [compileError, setCompileError] = useState('');
    const [renderedContent, setRenderedContent] = useState('');
    const editorRef = useRef(null);
    const htmlTextareaRef = useRef(null);
    const previousValueRef = useRef(value);

    // Update JSON data when dataSource prop changes
    useEffect(() => {
        if (dataSource && typeof dataSource === 'object') {
            setJsonData(dataSource);
        } else if (dataSource && typeof dataSource === 'string') {
            try {
                setJsonData(JSON.parse(dataSource));
            } catch (e) {
                console.error('Error parsing dataSource:', e);
                setJsonData({});
            }
        }
    }, [dataSource]);

    // Load custom CSS from prop
    useEffect(() => {
        if (customCss) {
            setLocalCustomCss(customCss);
            applyCustomCss(customCss);
        }
    }, [customCss]);

    // Apply custom CSS to editor and preview
    const applyCustomCss = (css) => {
        let styleElement = document.getElementById('rich-editor-custom-styles');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'rich-editor-custom-styles';
            document.head.appendChild(styleElement);
        }
        styleElement.textContent = css;
    };

    // Render Handlebars template
    const renderHandlebarsTemplate = (template, data) => {
        if (!template || !template.trim()) {
            return template || '';
        }

        if (!template.includes('{{') && !template.includes('{{#')) {
            return template;
        }

        try {
            const context = {
                ...data,
                _lang: language,
                _now: new Date().toISOString()
            };
            const compiled = Handlebars.compile(template);
            const rendered = compiled(context);
            setCompileError('');
            return rendered;
        } catch (error) {
            setCompileError(error.message);
            console.error('Handlebars error:', error);
            return `<div class="handlebars-error" style="color: red; padding: 12px; border: 1px solid red; border-radius: 8px; margin: 10px;">
                        <strong>Template Error:</strong> ${error.message}
                    </div>`;
        }
    };

    // Process content based on template type
    const processContent = (content) => {
        if ((templateType === 'handlebars' || showJsonMode) && jsonData && Object.keys(jsonData).length > 0) {
            if (content && (content.includes('{{') || content.includes('{{#'))) {
                return renderHandlebarsTemplate(content, jsonData);
            }
        }
        return content;
    };

    // Update displayed content
    useEffect(() => {
        if (!showHtmlMode && !showPreview && !showJsonMode && editorRef.current) {
            const processed = processContent(value || '');
            if (editorRef.current.innerHTML !== processed) {
                const savedRange = saveCursorPosition();
                editorRef.current.innerHTML = processed;
                restoreCursorPosition(savedRange);
            }
        }
    }, [value, jsonData, language, templateType, showHtmlMode, showPreview, showJsonMode]);

    // Update editor content when value prop changes
    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        if (previousValueRef.current !== value && !showHtmlMode && !showJsonMode) {
            const savedRange = saveCursorPosition();
            editor.innerHTML = value || '';
            restoreCursorPosition(savedRange);
            previousValueRef.current = value;
        }

        if (showHtmlMode && htmlContent !== value) {
            setHtmlContent(value || '');
        }
    }, [value, showHtmlMode, showJsonMode]);

    const saveCursorPosition = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return null;

        const range = selection.getRangeAt(0);
        const preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(editorRef.current);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        const start = preSelectionRange.toString().length;

        return { start, end: start + range.toString().length };
    };

    const restoreCursorPosition = (savedPosition) => {
        if (!savedPosition || !editorRef.current) return;

        const selection = window.getSelection();
        if (!selection) return;

        const charIndex = savedPosition.start;
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);

        let found = false;
        let charCount = 0;
        const walker = document.createTreeWalker(
            editorRef.current,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        while (walker.nextNode()) {
            const node = walker.currentNode;
            const nodeText = node.textContent || '';
            const nodeLength = nodeText.length;

            if (charCount + nodeLength >= charIndex) {
                const offset = charIndex - charCount;
                range.setStart(node, Math.min(offset, nodeLength));
                range.setEnd(node, Math.min(offset, nodeLength));
                range.collapse(true);
                found = true;
                break;
            }
            charCount += nodeLength;
        }

        if (!found) {
            range.selectNodeContents(editorRef.current);
            range.collapse(false);
        }

        selection.removeAllRanges();
        selection.addRange(range);
    };

    const handleInput = (e) => {
        if (showJsonMode) return;
        const content = e.currentTarget.innerHTML;
        previousValueRef.current = content;
        onChange({ target: { value: content } });

        if (showHtmlMode) {
            setHtmlContent(content);
        }
    };

    const handleHtmlChange = (e) => {
        const newHtml = e.target.value;
        setHtmlContent(newHtml);
        previousValueRef.current = newHtml;
        onChange({ target: { value: newHtml } });
    };

    const handleCssChange = (e) => {
        const css = e.target.value;
        setLocalCustomCss(css);
        applyCustomCss(css);
        if (onCssChange) {
            onCssChange(css);
        }
    };

    const handleJsonTemplateChange = (e) => {
        setJsonTemplate(e.target.value);
    };

    const handleJsonDataChange = (e) => {
        try {
            const newData = JSON.parse(e.target.value);
            setJsonData(newData);
            setCompileError('');
        } catch (err) {
            setCompileError('Invalid JSON: ' + err.message);
        }
    };

    const toggleJsonMode = () => {
        if (!showJsonMode) {
            const currentHtml = editorRef.current?.innerHTML || value || '';
            setJsonTemplate(currentHtml);
            const rendered = renderHandlebarsTemplate(currentHtml, jsonData);
            setRenderedContent(rendered);
        } else {
            if (renderedContent) {
                onChange({ target: { value: renderedContent } });
                if (editorRef.current) {
                    editorRef.current.innerHTML = renderedContent;
                    previousValueRef.current = renderedContent;
                }
            }
        }
        setShowJsonMode(!showJsonMode);
        setShowHtmlMode(false);
        setShowPreview(false);
        setShowCssPanel(false);
    };

    const updateRenderedContent = () => {
        const rendered = renderHandlebarsTemplate(jsonTemplate, jsonData);
        setRenderedContent(rendered);
        if (!showHtmlMode && !showPreview) {
            if (editorRef.current) {
                editorRef.current.innerHTML = rendered;
                previousValueRef.current = rendered;
                onChange({ target: { value: rendered } });
            }
        }
        onChange({ target: { value: rendered } });
    };

    const toggleHtmlMode = () => {
        if (!showHtmlMode) {
            const currentHtml = editorRef.current?.innerHTML || value || '';
            setHtmlContent(currentHtml);
        } else {
            if (editorRef.current && htmlContent !== editorRef.current.innerHTML) {
                editorRef.current.innerHTML = htmlContent;
                previousValueRef.current = htmlContent;
                onChange({ target: { value: htmlContent } });
            }
        }
        setShowHtmlMode(!showHtmlMode);
        setShowPreview(false);
        setShowCssPanel(false);
        setShowJsonMode(false);
    };

    const toggleCssPanel = () => {
        setShowCssPanel(!showCssPanel);
        setShowPreview(false);
        setShowHtmlMode(false);
        setShowJsonMode(false);
    };

    const execCommand = (command, val = null) => {
        if (showHtmlMode || showJsonMode) return;
        const editor = editorRef.current;
        if (!editor) return;
        editor.focus();
        document.execCommand(command, false, val);
        const content = editor.innerHTML;
        previousValueRef.current = content;
        onChange({ target: { value: content } });
    };

    const formatBlock = (tag) => {
        if (showHtmlMode || showJsonMode) return;
        const editor = editorRef.current;
        if (!editor) return;
        editor.focus();
        document.execCommand('formatBlock', false, tag);
        const content = editor.innerHTML;
        previousValueRef.current = content;
        onChange({ target: { value: content } });
    };

    const insertHtml = (html) => {
        if (showHtmlMode) {
            setHtmlContent(prev => prev + html);
            onChange({ target: { value: htmlContent + html } });
            return;
        }
        if (showJsonMode) {
            setJsonTemplate(prev => prev + html);
            return;
        }

        const editor = editorRef.current;
        if (!editor) return;
        editor.focus();

        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        range.deleteContents();

        const div = document.createElement('div');
        div.innerHTML = html;
        const fragment = document.createDocumentFragment();
        let node;
        while ((node = div.firstChild)) {
            fragment.appendChild(node);
        }

        range.insertNode(fragment);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);

        const content = editor.innerHTML;
        previousValueRef.current = content;
        onChange({ target: { value: content } });
    };

    const handleImageUpload = () => {
        const url = prompt('Enter image URL:', 'https://example.com/image.jpg');
        if (url && url.startsWith('http')) {
            insertHtml(`<img src="${url}" alt="Image" style="max-width:100%; border-radius:8px; margin:1rem 0;" />`);
        } else if (url) {
            alert('Please enter a valid URL starting with http:// or https://');
        }
    };

    const handleLink = () => {
        const url = prompt('Enter URL:', 'https://');
        if (url && url.startsWith('http')) {
            execCommand('createLink', url);
        } else if (url) {
            alert('Please enter a valid URL starting with http:// or https://');
        }
    };

    const cleanHtml = () => {
        if (showHtmlMode) {
            let content = htmlContent;
            content = content.replace(/<span\s+style="[^"]*"><\/span>/g, '');
            content = content.replace(/<span\s+style="[^"]*">/g, '');
            content = content.replace(/<\/span>/g, '');
            content = content.replace(/style="[^"]*font-family[^"]*"/g, '');
            content = content.replace(/style="[^"]*font-size[^"]*"/g, '');
            content = content.replace(/&lt;/g, '<');
            content = content.replace(/&gt;/g, '>');
            content = content.replace(/&amp;/g, '&');
            content = content.replace(/<p>\s*<\/p>/g, '');
            setHtmlContent(content);
            onChange({ target: { value: content } });
            return;
        }

        const editor = editorRef.current;
        if (!editor) return;
        let content = editor.innerHTML;

        content = content.replace(/<span\s+style="[^"]*"><\/span>/g, '');
        content = content.replace(/<span\s+style="[^"]*">/g, '');
        content = content.replace(/<\/span>/g, '');
        content = content.replace(/style="[^"]*font-family[^"]*"/g, '');
        content = content.replace(/style="[^"]*font-size[^"]*"/g, '');
        content = content.replace(/&lt;/g, '<');
        content = content.replace(/&gt;/g, '>');
        content = content.replace(/&amp;/g, '&');
        content = content.replace(/<p>\s*<\/p>/g, '');

        editor.innerHTML = content;
        previousValueRef.current = content;
        onChange({ target: { value: content } });
    };

    const formatHtml = () => {
        if (!showHtmlMode) return;
        try {
            let content = htmlContent;
            content = content.replace(/>\s+</g, '><');
            setHtmlContent(content);
            onChange({ target: { value: content } });
        } catch (e) {
            console.error('Error formatting HTML:', e);
        }
    };

    const insertVariable = (variable) => {
        if (showJsonMode) {
            const varText = `{{${variable}}}`;
            setJsonTemplate(prev => prev + varText);
        }
    };

    const insertLoop = () => {
        if (showJsonMode) {
            const loopText = `{{#each items}}
  <div class="item">
    <h3>{{title}}</h3>
    <p>{{description}}</p>
  </div>
{{/each}}`;
            setJsonTemplate(prev => prev + loopText);
        }
    };

    const toolbarStyles = {
        display: 'flex', gap: '4px', padding: '8px', background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap',
        borderTopLeftRadius: '8px', borderTopRightRadius: '8px'
    };

    const buttonStyles = {
        padding: '6px 10px', background: 'white', border: '1px solid #cbd5e1',
        borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500',
        transition: 'all 0.2s', fontFamily: 'inherit'
    };

    const activeButtonStyles = {
        ...buttonStyles,
        background: '#3b82f6',
        color: 'white',
        borderColor: '#3b82f6'
    };

    const panelStyles = {
        padding: '12px',
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0'
    };

    return (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
            <div style={toolbarStyles}>
                {!showHtmlMode && !showCssPanel && !showJsonMode && (
                    <>
                        <button type="button" onClick={() => execCommand('bold')} style={buttonStyles} title="Bold"><b>B</b></button>
                        <button type="button" onClick={() => execCommand('italic')} style={buttonStyles} title="Italic"><i>I</i></button>
                        <button type="button" onClick={() => execCommand('underline')} style={buttonStyles} title="Underline"><u>U</u></button>
                        <span style={{ width: '1px', background: '#cbd5e1', margin: '0 4px' }}></span>
                        <button type="button" onClick={() => formatBlock('H2')} style={buttonStyles} title="Heading 2">H2</button>
                        <button type="button" onClick={() => formatBlock('H3')} style={buttonStyles} title="Heading 3">H3</button>
                        <span style={{ width: '1px', background: '#cbd5e1', margin: '0 4px' }}></span>
                        <button type="button" onClick={() => execCommand('insertUnorderedList')} style={buttonStyles} title="Bullet List">• UL</button>
                        <button type="button" onClick={() => execCommand('insertOrderedList')} style={buttonStyles} title="Numbered List">1. OL</button>
                        <span style={{ width: '1px', background: '#cbd5e1', margin: '0 4px' }}></span>
                        <button type="button" onClick={() => execCommand('justifyLeft')} style={buttonStyles} title="Align Left">⬅️</button>
                        <button type="button" onClick={() => execCommand('justifyCenter')} style={buttonStyles} title="Align Center">⬌</button>
                        <button type="button" onClick={() => execCommand('justifyRight')} style={buttonStyles} title="Align Right">➡️</button>
                        <span style={{ width: '1px', background: '#cbd5e1', margin: '0 4px' }}></span>
                        <button type="button" onClick={handleLink} style={buttonStyles} title="Add Link">🔗 Link</button>
                        <button type="button" onClick={handleImageUpload} style={buttonStyles} title="Add Image">🖼 Image</button>
                        <button type="button" onClick={() => execCommand('removeFormat')} style={buttonStyles} title="Clear Formatting">✖️ Clear</button>
                        <button type="button" onClick={cleanHtml} style={{ ...buttonStyles, background: '#fef3c7' }} title="Clean HTML">🧹 Clean</button>
                        <div style={{ flex: 1 }}></div>
                    </>
                )}

                {showHtmlMode && (
                    <>
                        <button type="button" onClick={formatHtml} style={buttonStyles} title="Format HTML">✨ Format</button>
                        <button type="button" onClick={cleanHtml} style={{ ...buttonStyles, background: '#fef3c7' }} title="Clean HTML">🧹 Clean</button>
                        <div style={{ flex: 1 }}></div>
                    </>
                )}

                {showJsonMode && (
                    <>
                        <button type="button" onClick={() => insertVariable('personal.name')} style={buttonStyles}>➕ Var</button>
                        <button type="button" onClick={insertLoop} style={buttonStyles}>🔄 Loop</button>
                        <div style={{ flex: 1 }}></div>
                    </>
                )}

                <button
                    type="button"
                    onClick={toggleJsonMode}
                    style={showJsonMode ? activeButtonStyles : buttonStyles}
                    title="JSON Template Mode"
                >
                    🔄 JSON
                </button>

                <button
                    type="button"
                    onClick={toggleCssPanel}
                    style={showCssPanel ? activeButtonStyles : buttonStyles}
                    title="Custom CSS"
                >
                    🎨 CSS
                </button>

                <button
                    type="button"
                    onClick={toggleHtmlMode}
                    style={showHtmlMode ? activeButtonStyles : buttonStyles}
                    title="HTML Mode"
                >
                    {showHtmlMode ? '📝 Visual' : '💻 HTML'}
                </button>

                {!showHtmlMode && !showCssPanel && !showJsonMode && (
                    <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        style={{ ...buttonStyles, background: showPreview ? '#3b82f6' : '#e2e8f0', color: showPreview ? 'white' : '#334155' }}
                        title="Preview"
                    >
                        {showPreview ? '✏️ Edit' : '👁 Preview'}
                    </button>
                )}
            </div>

            {/* JSON Mode Panel */}
            {showJsonMode && (
                <div style={panelStyles}>
                    <div style={{ marginBottom: '12px' }}>
                        <strong>🔄 Handlebars Template Mode</strong>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                            Use <code>{'{{variable}}'}</code> syntax with your JSON data
                        </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', marginBottom: '4px', color: '#475569' }}>Template:</div>
                        <textarea
                            value={jsonTemplate}
                            onChange={handleJsonTemplateChange}
                            style={{
                                width: '100%',
                                padding: '12px',
                                minHeight: '150px',
                                fontFamily: 'monospace',
                                fontSize: '12px',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                background: '#1e1e2e',
                                color: '#e2e8f0',
                                resize: 'vertical'
                            }}
                            placeholder="{{#each items}}<div>{{property}}</div>{{/each}}"
                        />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', marginBottom: '4px', color: '#475569' }}>JSON Data:</div>
                        <textarea
                            value={JSON.stringify(jsonData, null, 2)}
                            onChange={handleJsonDataChange}
                            style={{
                                width: '100%',
                                padding: '12px',
                                minHeight: '200px',
                                fontFamily: 'monospace',
                                fontSize: '12px',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                background: '#1e1e2e',
                                color: '#e2e8f0',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    {compileError && (
                        <div style={{ marginBottom: '12px', padding: '8px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', fontSize: '12px' }}>
                            ⚠️ {compileError}
                        </div>
                    )}

                    <button
                        onClick={updateRenderedContent}
                        style={{
                            padding: '8px 16px',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            marginRight: '8px'
                        }}
                    >
                        ▶ Render Template
                    </button>

                    {renderedContent && (
                        <div style={{ marginTop: '16px' }}>
                            <div style={{ fontSize: '12px', marginBottom: '4px', color: '#475569' }}>Rendered Output:</div>
                            <div style={{
                                padding: '16px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                background: 'white',
                                maxHeight: '250px',
                                overflow: 'auto'
                            }}>
                                <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* CSS Panel */}
            {showCssPanel && (
                <div style={panelStyles}>
                    <div style={{ marginBottom: '12px' }}>
                        <strong>🎨 Custom CSS</strong>
                        <button
                            type="button"
                            onClick={() => applyCustomCss(localCustomCss)}
                            style={{ ...buttonStyles, marginLeft: '8px', padding: '4px 8px' }}
                        >
                            Apply
                        </button>
                    </div>

                    <textarea
                        value={localCustomCss}
                        onChange={handleCssChange}
                        style={{
                            width: '100%',
                            padding: '12px',
                            minHeight: '200px',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            background: '#1e1e2e',
                            color: '#e2e8f0',
                            resize: 'vertical'
                        }}
                        placeholder="/* Enter your custom CSS here */"
                    />

                    <div style={{ marginTop: '12px', padding: '12px', background: 'white', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>Live Preview:</div>
                        <div className="css-preview" style={{ padding: '8px' }}>
                            <div className="card" style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                                <p>This element will reflect your custom CSS if you have .card styles defined.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showHtmlMode ? (
                <textarea
                    ref={htmlTextareaRef}
                    value={htmlContent}
                    onChange={handleHtmlChange}
                    style={{
                        width: '100%',
                        padding: '16px',
                        minHeight: '400px',
                        border: 'none',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        lineHeight: '1.5',
                        outline: 'none',
                        resize: 'vertical',
                        background: '#1e1e2e',
                        color: '#e2e8f0',
                        tabSize: 4
                    }}
                    placeholder="<div>Enter HTML here...</div>"
                    spellCheck={false}
                />
            ) : showPreview ? (
                <div
                    style={{ padding: '16px', minHeight: '400px', maxHeight: '500px', overflow: 'auto', background: 'white', lineHeight: '1.6' }}
                    dangerouslySetInnerHTML={{ __html: processContent(value) || '<em>No content</em>' }}
                />
            ) : showJsonMode ? (
                <div
                    style={{ padding: '16px', minHeight: '400px', background: '#f8fafc', overflow: 'auto' }}
                >
                    {renderedContent ? (
                        <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
                    ) : (
                        <div style={{ color: '#94a3b8', textAlign: 'center', padding: '48px' }}>
                            <p>Enter a template with <code>{'{{variable}}'}</code> syntax and click Render</p>
                            <p style={{ marginTop: '8px' }}>Example: <code>{'<h1>{{personal.name}}</h1>'}</code></p>
                        </div>
                    )}
                </div>
            ) : (
                <div
                    ref={editorRef}
                    contentEditable="true"
                    onInput={handleInput}
                    suppressContentEditableWarning
                    style={{
                        width: '100%',
                        direction: language === 'el' ? 'rtl' : 'ltr',
                        textAlign: language === 'el' ? 'right' : 'left',
                        unicodeBidi: language === 'el' ? 'embed' : 'normal',
                        padding: '16px',
                        minHeight: '200px',
                        border: 'none',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        lineHeight: '1.6',
                        outline: 'none',
                        overflowY: 'auto',
                        background: 'white',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        cursor: 'text'
                    }}
                />
            )}
        </div>
    );
};

export default RichTextEditor;