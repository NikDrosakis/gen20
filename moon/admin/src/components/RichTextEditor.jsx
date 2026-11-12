// components/RichTextEditor.jsx
import { useState, useRef, useEffect, useCallback } from 'react';
import Handlebars from 'handlebars';
import RichTextEditorTools from './RichTextEditorTools';
import RichTextEditorBubbleMenu from './RichTextEditorBubbleMenu';
import RichTextEditorGlobalTools from './RichTextEditorGlobalTools';
import RichTextEditorContextMenu from './RichTextEditorContextMenu';
import RichTextEditorImageMenu from './RichTextEditorImageMenu';
import MediaToolbox from './MediaToolbox';
import './RichTextEditor.css';

// ---- Handlebars helpers (global) ----
Handlebars.registerHelper('eq', function (a, b) { return a === b; });
Handlebars.registerHelper('lang', function (field, options) {
    const lang = options.data.root._lang || 'en';
    return new Handlebars.SafeString(this[`${field}_${lang}`] || this[field] || '');
});
Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
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
Handlebars.registerHelper('formatDate', function (date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
});

// ---- Media popup dimensions ----
const MEDIA_POPUP_W = 480;
const MEDIA_POPUP_H = 520;

const RichTextEditor = ({
                            value,
                            onChange,
                            language = 'el',
                            dataSource = null,
                            templateType = 'handlebars',
                            customCss = '',
                            onCssChange,
                            onRender,
                            renderedContent: renderedContentProp = '',
                        }) => {
    const [jsonData, setJsonData] = useState(dataSource || {});
    const [compileError, setCompileError] = useState('');
    const [zoom, setZoom] = useState(100);
    const [contextMenu, setContextMenu] = useState(null);
    const [showMediaToolbox, setShowMediaToolbox] = useState(false);
    const [mediaPopupPos, setMediaPopupPos] = useState({ top: 100, left: 100 });

    // ✅ Image selection + live style state
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageState, setImageState] = useState(null);

    const [mode, setMode] = useState('visual');
    const [htmlContent, setHtmlContent] = useState('');
    const [renderedContent, setRenderedContent] = useState(renderedContentProp);

    const editorRef = useRef(null);
    const previousValueRef = useRef(undefined);
    const popupRef = useRef(null);

    // ✅ Drag state για το media popup
    const dragRef = useRef({
        dragging: false,
        startX: 0,
        startY: 0,
        origX: 0,
        origY: 0,
    });

    // ---- Sync dataSource ----
    useEffect(() => {
        if (dataSource && typeof dataSource === 'object') setJsonData(dataSource);
        else if (typeof dataSource === 'string') {
            try { setJsonData(JSON.parse(dataSource)); }
            catch { setJsonData({}); }
        }
    }, [dataSource]);

    useEffect(() => {
        if (renderedContentProp) setRenderedContent(renderedContentProp);
    }, [renderedContentProp]);

    // ✅ Sync htmlContent όταν αλλάζει το value (initial load / external)
    useEffect(() => {
        if (!editorRef.current) return;
        if (mode === 'html') setHtmlContent(value || '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, mode]);

    // ✅ HTML Beautify
    const beautifyHtml = (html) => {
        if (!html) return '';
        let out = html
            .replace(/></g, '>\n<')
            .replace(/\/>/g, ' />');

        const lines = out.split('\n');
        let indent = 0;
        const result = lines.map((line) => {
            const trimmed = line.trim();
            if (!trimmed) return '';
            if (/^<\//.test(trimmed)) indent = Math.max(0, indent - 1);
            const indented = '  '.repeat(indent) + trimmed;
            if (
                /^<[^/!][^>]*>$/.test(trimmed) &&
                !/<\/[^>]+>$/.test(trimmed) &&
                !/^<(img|br|hr|input|meta|link)/i.test(trimmed)
            ) {
                indent++;
            }
            return indented;
        });

        return result.join('\n');
    };

    // ✅ HTML Minify
    const minifyHtml = (html) => {
        if (!html) return '';
        return html
            .replace(/\n\s*/g, '')
            .replace(/>\s+</g, '><')
            .trim();
    };

    const handleModeChange = (nextMode) => {
        // ✅ Commit HTML → editor (με minify)
        if (mode === 'html' && nextMode !== 'html') {
            if (editorRef.current) {
                const incoming = minifyHtml(htmlContent || '');
                if (editorRef.current.innerHTML !== incoming) {
                    editorRef.current.innerHTML = incoming;
                    previousValueRef.current = incoming;
                    onChange({ target: { value: incoming } });
                }
            }
        }

        // ✅ Φόρτωση τρέχοντος περιεχομένου όταν μπαίνεις σε HTML
        if (nextMode === 'html') {
            const raw = editorRef.current?.innerHTML || value || '';
            setHtmlContent(beautifyHtml(raw));
        }

        setMode(nextMode);
    };

    const renderHandlebarsTemplate = (template, data) => {
        if (!template || !template.trim()) return template || '';
        if (!template.includes('{{') && !template.includes('{{#')) return template;
        try {
            const compiled = Handlebars.compile(template);
            const rendered = compiled({ ...data, _lang: language, _now: new Date().toISOString() });
            setCompileError('');
            return rendered;
        } catch (error) {
            setCompileError(error.message);
            return `<div class="handlebars-error"><strong>Template Error:</strong> ${error.message}</div>`;
        }
    };

    const saveCursorPosition = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || !editorRef.current) return null;
        const range = selection.getRangeAt(0);
        const pre = range.cloneRange();
        pre.selectNodeContents(editorRef.current);
        pre.setEnd(range.startContainer, range.startOffset);
        const start = pre.toString().length;
        return { start, end: start + range.toString().length };
    };

    const restoreCursorPosition = (pos) => {
        if (!pos || !editorRef.current) return;
        const sel = window.getSelection();
        if (!sel) return;
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        let found = false, count = 0;
        const walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
            const node = walker.currentNode;
            const len = (node.textContent || '').length;
            if (count + len >= pos.start) {
                const offset = Math.min(pos.start - count, len);
                range.setStart(node, offset);
                range.setEnd(node, offset);
                range.collapse(true);
                found = true;
                break;
            }
            count += len;
        }
        if (!found) { range.selectNodeContents(editorRef.current); range.collapse(false); }
        sel.removeAllRanges();
        sel.addRange(range);
    };

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;
        if (mode !== 'visual') return;

        const incoming = value || '';
        if (editor.innerHTML === incoming) {
            previousValueRef.current = incoming;
            return;
        }

        const isFocused = document.activeElement === editor;
        const saved = isFocused ? saveCursorPosition() : null;
        editor.innerHTML = incoming;
        if (saved) restoreCursorPosition(saved);
        previousValueRef.current = incoming;
    }, [value, mode]);

    const handleInput = (e) => {
        const content = e.currentTarget.innerHTML;
        previousValueRef.current = content;
        onChange({ target: { value: content } });
    };

    // ---- Commands ----
    const execCommand = useCallback((command, val = null) => {
        const editor = editorRef.current;
        if (!editor) return;
        editor.focus();
        document.execCommand(command, false, val);
        onChange({ target: { value: editor.innerHTML } });
    }, [onChange]);

    const formatBlock = useCallback((tag) => {
        const editor = editorRef.current;
        if (!editor) return;
        editor.focus();
        const normalized =
            tag === 'P' ? '<P>' :
                tag === 'BLOCKQUOTE' ? '<BLOCKQUOTE>' :
                    `<${tag.toUpperCase()}>`;
        document.execCommand('formatBlock', false, normalized);
        onChange({ target: { value: editor.innerHTML } });
    }, [onChange]);

    const setFontSize = useCallback((px) => {
        const editor = editorRef.current;
        if (!editor) return;
        editor.focus();
        document.execCommand('fontSize', false, '7');
        editor.querySelectorAll('font[size="7"]').forEach(el => {
            const span = document.createElement('span');
            span.style.fontSize = px + 'px';
            span.innerHTML = el.innerHTML;
            el.replaceWith(span);
        });
        onChange({ target: { value: editor.innerHTML } });
    }, [onChange]);

    const setFontFamily = useCallback((family) => {
        if (!family) return;
        execCommand('fontName', family);
    }, [execCommand]);

    // ✅ Line height (διάστιχο)
    const handleLineHeight = useCallback((value) => {
        const editor = editorRef.current;
        if (!editor) return;
        editor.focus();

        if (!value) {
            editor.style.lineHeight = '';
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
                let node = sel.getRangeAt(0).startContainer;
                if (node.nodeType === 3) node = node.parentElement;
                while (node && node !== editor) {
                    if (['P','DIV','H1','H2','H3','H4','LI','BLOCKQUOTE'].includes(node.tagName)) {
                        node.style.lineHeight = '';
                        break;
                    }
                    node = node.parentElement;
                }
            }
            onChange({ target: { value: editor.innerHTML } });
            return;
        }

        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            let node = sel.getRangeAt(0).startContainer;
            if (node.nodeType === 3) node = node.parentElement;

            let block = node;
            while (block && block !== editor) {
                if (['P','DIV','H1','H2','H3','H4','LI','BLOCKQUOTE'].includes(block.tagName)) {
                    block.style.lineHeight = value;
                    break;
                }
                block = block.parentElement;
            }

            if (!block || block === editor) {
                editor.style.lineHeight = value;
            }
        } else {
            editor.style.lineHeight = value;
        }

        onChange({ target: { value: editor.innerHTML } });
    }, [onChange]);

    const insertHtml = (html) => {
        const editor = editorRef.current;
        if (!editor) return;
        editor.focus();
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount) return;
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const div = document.createElement('div');
        div.innerHTML = html;
        const frag = document.createDocumentFragment();
        let n;
        while ((n = div.firstChild)) frag.appendChild(n);
        range.insertNode(frag);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
        onChange({ target: { value: editor.innerHTML } });
    };

    const handleLink = () => {
        const url = prompt('Enter URL:', 'https://');
        if (url && url.startsWith('http')) execCommand('createLink', url);
        else if (url) alert('Please enter a valid URL starting with http:// or https://');
    };

    // ============================================================
    // ✅ MEDIA POPUP
    // ============================================================
    const openMediaPopup = useCallback(() => {
        let top = window.innerHeight / 2 - MEDIA_POPUP_H / 2;
        let left = window.innerWidth / 2 - MEDIA_POPUP_W / 2;

        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
            const rect = sel.getRangeAt(0).getBoundingClientRect();
            top = rect.bottom + 8;
            left = rect.left;
        } else if (editorRef.current) {
            const editorRect = editorRef.current.getBoundingClientRect();
            top = editorRect.top + 60;
            left = editorRect.left + 40;
        }

        left = Math.max(8, Math.min(left, window.innerWidth - MEDIA_POPUP_W - 8));
        top = Math.max(8, Math.min(top, window.innerHeight - MEDIA_POPUP_H - 8));

        setMediaPopupPos({ top, left });
        setShowMediaToolbox(true);
    }, []);

    const handleImageUpload = () => openMediaPopup();

    const handleMediaSelect = (media) => {
        const url = media?.url || media?.path || media?.filename || media;
        if (typeof url === 'string' && url) {
            const src = url.startsWith('http') ? url : `/media/${url}`;
            editorRef.current?.focus();
            insertHtml(`<img src="${src}" alt="Image" class="rte-img" />`);
        }
        setShowMediaToolbox(false);
    };

    // ============================================================
    // ✅ DRAG-TO-MOVE για το Media popup
    // ============================================================
    const handlePopupMouseDown = (e) => {
        if (!e.target.closest('.media-toolbox-header')) return;
        if (e.target.closest('.media-toolbox-close')) return;

        e.preventDefault();
        dragRef.current = {
            dragging: true,
            startX: e.clientX,
            startY: e.clientY,
            origX: mediaPopupPos.left,
            origY: mediaPopupPos.top,
        };
        document.addEventListener('mousemove', handlePopupMouseMove);
        document.addEventListener('mouseup', handlePopupMouseUp);
    };

    const handlePopupMouseMove = (e) => {
        const d = dragRef.current;
        if (!d.dragging) return;
        const dx = e.clientX - d.startX;
        const dy = e.clientY - d.startY;
        setMediaPopupPos({
            left: Math.max(0, Math.min(d.origX + dx, window.innerWidth - MEDIA_POPUP_W)),
            top: Math.max(0, Math.min(d.origY + dy, window.innerHeight - MEDIA_POPUP_H)),
        });
    };

    const handlePopupMouseUp = () => {
        dragRef.current.dragging = false;
        document.removeEventListener('mousemove', handlePopupMouseMove);
        document.removeEventListener('mouseup', handlePopupMouseUp);
    };

    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handlePopupMouseMove);
            document.removeEventListener('mouseup', handlePopupMouseUp);
        };
    }, []);

    // ============================================================
    // ✅ IMAGE: state read + handlers
    // ============================================================
    const readImageState = (img) => {
        if (!img) return null;
        const cs = img.style;
        const editor = editorRef.current;
        const editorWidth = editor ? editor.clientWidth : 800;
        const rect = img.getBoundingClientRect();
        const widthPct = editorWidth ? Math.round((rect.width / editorWidth) * 100) : 100;

        return {
            float: cs.float || 'none',
            display: cs.display || 'inline',
            marginTop: parseInt(cs.marginTop) || 0,
            marginBottom: parseInt(cs.marginBottom) || 0,
            marginLeft: parseInt(cs.marginLeft) || 0,
            marginRight: parseInt(cs.marginRight) || 0,
            width: widthPct,
            textAlign: cs.textAlign || 'left',
            verticalAlign: cs.verticalAlign || 'baseline',
        };
    };

    const handleEditorClick = (e) => {
        if (e.target.tagName === 'IMG') {
            setSelectedImage(e.target);
            setImageState(readImageState(e.target));
        } else {
            setSelectedImage(null);
            setImageState(null);
        }
    };

    const handleImageStyleChange = (patch) => {
        if (!selectedImage) return;

        if (patch.float !== undefined) selectedImage.style.float = patch.float;
        if (patch.display !== undefined) selectedImage.style.display = patch.display;

        if (patch.marginTop !== undefined) {
            selectedImage.style.marginTop = typeof patch.marginTop === 'number'
                ? `${patch.marginTop}px` : patch.marginTop;
        }
        if (patch.marginBottom !== undefined) {
            selectedImage.style.marginBottom = typeof patch.marginBottom === 'number'
                ? `${patch.marginBottom}px` : patch.marginBottom;
        }
        if (patch.marginLeft !== undefined) {
            selectedImage.style.marginLeft = typeof patch.marginLeft === 'number'
                ? `${patch.marginLeft}px` : patch.marginLeft;
        }
        if (patch.marginRight !== undefined) {
            selectedImage.style.marginRight = typeof patch.marginRight === 'number'
                ? `${patch.marginRight}px` : patch.marginRight;
        }

        if (patch.textAlign !== undefined) selectedImage.style.textAlign = patch.textAlign;
        if (patch.verticalAlign !== undefined) selectedImage.style.verticalAlign = patch.verticalAlign;
        if (patch.width !== undefined) selectedImage.style.width = `${patch.width}%`;

        setImageState(readImageState(selectedImage));
        onChange({ target: { value: editorRef.current.innerHTML } });
    };

    const handleImageDelete = () => {
        if (!selectedImage) return;
        selectedImage.remove();
        setSelectedImage(null);
        setImageState(null);
        onChange({ target: { value: editorRef.current.innerHTML } });
    };

    // ✅ Drag-to-resize
    const startResize = (e) => {
        if (!selectedImage) return;
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startRect = selectedImage.getBoundingClientRect();
        const editor = editorRef.current;
        const editorWidth = editor.clientWidth;

        const onMove = (ev) => {
            const dx = ev.clientX - startX;
            const newWidthPx = startRect.width + dx;
            const newWidthPct = Math.max(10, Math.min(100, (newWidthPx / editorWidth) * 100));
            selectedImage.style.width = newWidthPct + '%';
            setImageState((prev) => prev ? { ...prev, width: Math.round(newWidthPct) } : prev);
        };

        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            setImageState(readImageState(selectedImage));
            onChange({ target: { value: editorRef.current.innerHTML } });
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    };

    // ✅ Drag-to-move εικόνας
    const startImageDrag = (e) => {
        if (!selectedImage) return;
        if (e.button !== 0) return;
        if (e.target.classList.contains('rte-img-resize-handle')) return;

        e.preventDefault();

        const startX = e.clientX;
        const startY = e.clientY;
        const startRect = selectedImage.getBoundingClientRect();
        let dragging = false;
        let ghost = null;

        const onMove = (ev) => {
            const dx = ev.clientX - startX;
            const dy = ev.clientY - startY;

            if (!dragging && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
                dragging = true;
                ghost = selectedImage.cloneNode(true);
                ghost.style.position = 'fixed';
                ghost.style.pointerEvents = 'none';
                ghost.style.opacity = '0.6';
                ghost.style.zIndex = '1000000';
                ghost.style.width = startRect.width + 'px';
                ghost.style.height = startRect.height + 'px';
                ghost.style.left = startRect.left + 'px';
                ghost.style.top = startRect.top + 'px';
                ghost.style.margin = '0';
                ghost.style.transform = 'none';
                document.body.appendChild(ghost);
                selectedImage.style.opacity = '0.3';
            }

            if (dragging && ghost) {
                ghost.style.left = (startRect.left + dx) + 'px';
                ghost.style.top = (startRect.top + dy) + 'px';
            }
        };

        const onUp = (ev) => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);

            if (ghost) ghost.remove();
            if (selectedImage) selectedImage.style.opacity = '';

            if (!dragging) return;

            const range = document.caretRangeFromPoint
                ? document.caretRangeFromPoint(ev.clientX, ev.clientY)
                : (document.caretPositionFromPoint
                    ? (() => {
                        const p = document.caretPositionFromPoint(ev.clientX, ev.clientY);
                        if (!p) return null;
                        const r = document.createRange();
                        r.setStart(p.offsetNode, p.offset);
                        r.collapse(true);
                        return r;
                    })()
                    : null);

            if (range && editorRef.current && editorRef.current.contains(range.startContainer)) {
                const editor = editorRef.current;
                const img = selectedImage;

                range.deleteContents();
                range.insertNode(img);
                range.collapse(false);

                onChange({ target: { value: editor.innerHTML } });
            }
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    };

    useEffect(() => {
        if (selectedImage) setImageState(readImageState(selectedImage));
        else setImageState(null);
    }, [selectedImage]);

    // ============================================================
    // ✅ Clean HTML / Render / JSON handlers
    // ============================================================
    const cleanHtml = useCallback(() => {
        const editor = editorRef.current;
        if (!editor) return;
        let c = editor.innerHTML;
        c = c.replace(/<span\s+style="[^"]*"><\/span>/g, '')
            .replace(/<span\s+style="[^"]*">/g, '')
            .replace(/<\/span>/g, '')
            .replace(/style="[^"]*font-family[^"]*"/g, '')
            .replace(/style="[^"]*font-size[^"]*"/g, '')
            .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
            .replace(/<p>\s*<\/p>/g, '');
        editor.innerHTML = c;
        onChange({ target: { value: c } });
    }, [onChange]);

    // ✅ Render: template = το τρέχον HTML του editor, data = jsonData
    const handleRender = useCallback(() => {
        const editor = editorRef.current;
        const template = editor?.innerHTML || value || '';
        const out = renderHandlebarsTemplate(template, jsonData);
        setRenderedContent(out);
        if (onRender) onRender(out, template, jsonData);
    }, [jsonData, onRender, value]);

    const handleJsonDataChange = (val) => {
        try {
            const parsed = JSON.parse(val);
            setJsonData(parsed);
            setCompileError('');
        } catch (err) {
            setCompileError('Invalid JSON: ' + err.message);
        }
    };

    // ============================================================
    // ✅ CONTEXT MENU HANDLERS
    // ============================================================
    const handleContextMenu = (e) => {
        const target = e.target;
        if (target.closest('a') || target.closest('img')) return;
        e.preventDefault();

        const sel = window.getSelection();
        const hasSelection =
            sel &&
            !sel.isCollapsed &&
            sel.rangeCount > 0 &&
            editorRef.current?.contains(sel.getRangeAt(0).commonAncestorContainer);

        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            hasSelection: Boolean(hasSelection),
        });
    };

    const handleCut = () => { execCommand('cut'); setContextMenu(null); };
    const handleCopy = () => { execCommand('copy'); setContextMenu(null); };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            const editor = editorRef.current;
            if (!editor) return;
            editor.focus();
            document.execCommand('insertText', false, text);
        } catch (err) {
            console.warn('Clipboard paste not available:', err);
        }
        setContextMenu(null);
    };

    const handleOpenMedia = () => {
        setContextMenu(null);
        openMediaPopup();
    };

    const handleLinkContext = () => {
        setContextMenu(null);
        handleLink();
    };

    const handleClearFormatContext = () => {
        setContextMenu(null);
        execCommand('removeFormat');
    };

    // ============================================================
    // ✅ Resize handle position
    // ============================================================
    const resizeHandlePos = selectedImage
        ? (() => {
            const r = selectedImage.getBoundingClientRect();
            return {
                top: r.bottom - 8,
                left: r.right - 8,
            };
        })()
        : null;

    // ✅ Zoom με Ctrl/Cmd/Alt + wheel (μόνο πάνω στον editor)
    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        const handleWheel = (e) => {
            // Μόνο όταν ο κέρσορας είναι πάνω στον editor
            if (!editor.contains(e.target)) return;

            // Μόνο με Ctrl/Cmd/Alt
            if (!(e.ctrlKey || e.metaKey || e.altKey)) return;

            e.preventDefault();

            // Δέλτα (πάνω = zoom in, κάτω = zoom out)
            const step = 5;
            const direction = e.deltaY < 0 ? 1 : -1;

            setZoom((prev) => {
                const next = prev + direction * step;
                return Math.max(50, Math.min(200, next));
            });
        };

        // passive: false για να μπορούμε preventDefault
        editor.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            editor.removeEventListener('wheel', handleWheel);
        };
    }, []);

    return (
        <div className="rte-root">
            {/* ✅ Global header */}
            <div className="rte-global-header">
                <span className="rte-global-label-title">
                    Content <span className="required">*</span>
                </span>
                <RichTextEditorGlobalTools
                    mode={mode}
                    onModeChange={handleModeChange}
                    htmlContent={htmlContent}
                    onHtmlChange={setHtmlContent}
                    jsonData={jsonData}
                    onJsonDataChange={handleJsonDataChange}
                    jsonError={compileError}
                    customCss={customCss}
                    onCssChange={onCssChange}
                    onRender={handleRender}
                    renderedContent={renderedContent}
                    onCleanHtml={cleanHtml}
                    gContent={jsonData?.GContent || {}}
                    onSettingsSave={(newGContent) => {
                        setJsonData((prev) => ({
                            ...prev,
                            GContent: newGContent,
                        }));
                        // Ενημέρωση parent για save στο content.json
                        if (onRender) {
                            const editor = editorRef.current;
                            const template = editor?.innerHTML || value || '';
                            onRender(renderedContent, template, { ...jsonData, GContent: newGContent });
                        }
                    }}
                />
            </div>

            {/* ✅ Visual mode */}
            {mode === 'visual' && (
                <div className="rte-body">
                    <aside className="rte-sidebar">
                        <RichTextEditorTools
                            onCommand={execCommand}
                            onFormatBlock={formatBlock}
                            onSetLineHeight={handleLineHeight}
                            onCleanHtml={cleanHtml}
                            onSetFontSize={setFontSize}
                            onSetFontFamily={setFontFamily}
                            zoom={zoom}
                            onZoomChange={setZoom}
                        />
                    </aside>

                    <main className="rte-main">
                        <div className="rte-page-scroll">
                            <div
                                className="rte-page"
                                style={{
                                    transform: `scale(${zoom / 100})`,
                                    transformOrigin: 'top center',
                                }}
                            >
                                <div
                                    ref={editorRef}
                                    className={`rte-editor ${language === 'el' ? 'rte-editor-el' : ''}`}
                                    contentEditable="true"
                                    onInput={handleInput}
                                    onClick={handleEditorClick}
                                    onContextMenu={handleContextMenu}
                                    suppressContentEditableWarning
                                    spellCheck={false}
                                />
                            </div>
                        </div>
                    </main>
                </div>
            )}

            {/* ✅ Resize handle */}
            {selectedImage && resizeHandlePos && mode === 'visual' && (
                <div
                    className="rte-img-resize-handle"
                    style={{
                        position: 'fixed',
                        top: resizeHandlePos.top,
                        left: resizeHandlePos.left,
                        width: 16,
                        height: 16,
                        zIndex: 999999,
                        cursor: 'nwse-resize',
                    }}
                    onMouseDown={startResize}
                    title="Drag για αλλαγή μεγέθους"
                />
            )}

            {/* ✅ Image menu */}
            {selectedImage && imageState && (
                <RichTextEditorImageMenu
                    imageEl={selectedImage}
                    imageState={imageState}
                    onChangeStyle={handleImageStyleChange}
                    onDelete={handleImageDelete}
                    onClose={() => { setSelectedImage(null); setImageState(null); }}
                />
            )}

            {/* ✅ Context menu */}
            {contextMenu && (
                <RichTextEditorContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    hasSelection={contextMenu.hasSelection}
                    onClose={() => setContextMenu(null)}
                    onCommand={(cmd) => { execCommand(cmd); setContextMenu(null); }}
                    onOpenMedia={handleOpenMedia}
                    onLink={handleLinkContext}
                    onClearFormat={handleClearFormatContext}
                    onCut={handleCut}
                    onCopy={handleCopy}
                    onPaste={handlePaste}
                />
            )}

            {/* Bubble menu */}
            {mode === 'visual' && (
                <RichTextEditorBubbleMenu
                    editorRef={editorRef}
                    onCommand={execCommand}
                    onLink={handleLink}
                    onImage={handleImageUpload}
                    onComment={() => alert('Comments coming soon')}
                    onClearFormat={() => execCommand('removeFormat')}
                />
            )}

            {/* ✅ MediaToolbox */}
            {showMediaToolbox && (
                <div
                    ref={popupRef}
                    className="rte-media-popup"
                    style={{
                        position: 'fixed',
                        top: mediaPopupPos.top,
                        left: mediaPopupPos.left,
                        width: MEDIA_POPUP_W,
                        height: MEDIA_POPUP_H,
                        zIndex: 999998,
                    }}
                    onMouseDown={handlePopupMouseDown}
                >
                    <MediaToolbox
                        onSelect={handleMediaSelect}
                        onClose={() => setShowMediaToolbox(false)}
                        selectedValue={null}
                    />
                </div>
            )}

            {compileError && mode === 'visual' && (
                <div className="rte-error">⚠️ {compileError}</div>
            )}
        </div>
    );
};

export default RichTextEditor;