// components/RichTextEditorContextMenu.jsx
import React from 'react';
import ContextMenu from './ContextMenu';

/**
 * Right-click context menu για τον RichTextEditor.
 * Εμφανίζεται όταν ο χρήστης κάνει right-click μέσα στον editor.
 */
const RichTextEditorContextMenu = ({
                                       x,
                                       y,
                                       hasSelection,
                                       onClose,
                                       onCommand,
                                       onOpenMedia,
                                       onLink,
                                       onClearFormat,
                                       onCut,
                                       onCopy,
                                       onPaste,
                                   }) => {
    const items = [
        // ✅ ΠΡΩΤΗ επιλογή: Media Toolbox
        {
            icon: '📁',
            label: 'Media Toolbox…',
            onClick: onOpenMedia,
        },
        { separator: true },

        // Inline formatting — ενεργά μόνο αν υπάρχει selection
        {
            icon: '✂️',
            label: 'Cut',
            disabled: !hasSelection,
            onClick: onCut,
        },
        {
            icon: '📋',
            label: 'Copy',
            disabled: !hasSelection,
            onClick: onCopy,
        },
        {
            icon: '📥',
            label: 'Paste',
            onClick: onPaste,
        },
        { separator: true },

        {
            icon: '🔗',
            label: 'Insert link…',
            disabled: !hasSelection,
            onClick: onLink,
        },
        {
            icon: '🖼️',
            label: 'Insert image…',
            onClick: onOpenMedia,
        },
        { separator: true },

        {
            icon: '🔤',
            label: 'Bold',
            disabled: !hasSelection,
            onClick: () => onCommand('bold'),
        },
        {
            icon: '🔤',
            label: 'Italic',
            disabled: !hasSelection,
            onClick: () => onCommand('italic'),
        },
        {
            icon: '🔤',
            label: 'Underline',
            disabled: !hasSelection,
            onClick: () => onCommand('underline'),
        },
        { separator: true },

        {
            icon: '🧹',
            label: 'Clear formatting',
            disabled: !hasSelection,
            onClick: onClearFormat,
        },
    ];

    return <ContextMenu x={x} y={y} items={items} onClose={onClose} />;
};

export default RichTextEditorContextMenu;