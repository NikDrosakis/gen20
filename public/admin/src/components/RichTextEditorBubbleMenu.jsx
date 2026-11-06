// components/RichTextEditorBubbleMenu.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Floating bubble menu πάνω από επιλεγμένο κείμενο.
 *
 * Props:
 *  - editorRef      → ref του contentEditable
 *  - onCommand(cmd, val?) → execCommand (bold, italic, ...)
 *  - onLink()       → άνοιγμα link dialog
 *  - onImage()      → άνοιγμα image dialog / MediaToolbox
 *  - onComment()    → άνοιγμα comment dialog
 *  - onClearFormat()→ removeFormat
 */
const RichTextEditorBubbleMenu = ({
                                      editorRef,
                                      onCommand,
                                      onLink,
                                      onImage,
                                      onComment,
                                      onClearFormat,
                                  }) => {
    const [visible, setVisible] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const menuRef = useRef(null);
    const rafRef = useRef(null);

    const isSelectionInsideEditor = useCallback(() => {
        const editor = editorRef?.current;
        const sel = window.getSelection();
        if (!editor || !sel || sel.rangeCount === 0) return false;
        if (sel.isCollapsed) return false;
        const range = sel.getRangeAt(0);
        if (!editor.contains(range.commonAncestorContainer)) return false;
        return range.toString().trim().length > 0;
    }, [editorRef]);

    const updatePosition = useCallback(() => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) { setVisible(false); return; }
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (!rect || (rect.width === 0 && rect.height === 0)) { setVisible(false); return; }

        let top = rect.top - 52;
        const left = rect.left + rect.width / 2;
        if (top < 8) top = rect.bottom + 8;

        setPos({ top, left });
        setVisible(true);
    }, []);

    const scheduleUpdate = useCallback(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            if (isSelectionInsideEditor()) updatePosition();
            else setVisible(false);
        });
    }, [isSelectionInsideEditor, updatePosition]);

    useEffect(() => {
        const onChange = () => scheduleUpdate();
        const handleMouseUp = () => scheduleUpdate();
        const handleScroll = () => scheduleUpdate();

        document.addEventListener('selectionchange', onChange);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('keyup', onChange);
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleScroll);

        return () => {
            document.removeEventListener('selectionchange', onChange);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('keyup', onChange);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [scheduleUpdate]);

    useEffect(() => {
        const handleMouseDown = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setVisible(false);
        };
        if (visible) document.addEventListener('mousedown', handleMouseDown);
        return () => document.removeEventListener('mousedown', handleMouseDown);
    }, [visible]);

    if (!visible) return null;

    const btn = (label, title, onClick, extraClass = '') => (
        <button
            type="button"
            className={`rte-bubble-btn ${extraClass}`.trim()}
            title={title}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
        >
            {label}
        </button>
    );

    const sep = () => <span className="rte-bubble-sep" />;

    const setBlock = (tag) => {
        const editor = editorRef?.current;
        if (!editor) return;
        editor.focus();
        document.execCommand('formatBlock', false, `<${tag}>`);
    };

    return (
        <div
            ref={menuRef}
            className="rte-bubble-menu"
            style={{
                position: 'fixed',
                top: pos.top,
                left: pos.left,
                transform: 'translateX(-50%)',
                zIndex: 999999,
            }}
            onMouseDown={(e) => e.preventDefault()}
        >
            {btn(<b>B</b>, 'Bold', () => onCommand('bold'))}
            {btn(<i>I</i>, 'Italic', () => onCommand('italic'))}
            {btn(<u>U</u>, 'Underline', () => onCommand('underline'))}
            {btn(<s>S</s>, 'Strikethrough', () => onCommand('strikeThrough'))}

            {sep()}

            {/* ✅ Inline: Link & Image */}
            {btn('🔗', 'Insert link', onLink)}
            {btn('🖼', 'Insert image', onImage)}

            {sep()}

            {btn('🖍', 'Highlight', () => {
                const color = prompt('Highlight color (CSS value):', '#fef08a');
                if (color) onCommand('hiliteColor', color);
            })}
            {btn('💬', 'Comment', onComment || (() => alert('Comments coming soon')))}

            {sep()}

            {/* Block-level shortcuts (χρήσιμα στο bubble) */}
            {btn('H2', 'Heading 2', () => setBlock('H2'))}
            {btn('H3', 'Heading 3', () => setBlock('H3'))}
            {btn('P',  'Paragraph', () => setBlock('P'))}

            {sep()}

            {btn('✖', 'Clear formatting', onClearFormat)}
        </div>
    );
};

export default RichTextEditorBubbleMenu;