// components/RichTextEditorImageMenu.jsx
import React, { useEffect, useRef, useState } from 'react';

const RichTextEditorImageMenu = ({
                                     imageEl,
                                     imageState,
                                     onChangeStyle,
                                     onDelete,
                                     onClose,
                                 }) => {
    const menuRef = useRef(null);
    const [pos, setPos] = useState({ top: 0, left: 0 });

    // Θέση κάτω από την εικόνα
    useEffect(() => {
        if (!imageEl) return;
        const update = () => {
            const rect = imageEl.getBoundingClientRect();
            const MENU_H = 44;
            let top = rect.bottom + 8;
            if (top + MENU_H > window.innerHeight) top = rect.top - MENU_H - 8;
            const left = Math.max(8, Math.min(rect.left, window.innerWidth - 420));
            setPos({ top, left });
        };
        update();
        const ro = new ResizeObserver(update);
        ro.observe(imageEl);
        window.addEventListener('scroll', update, true);
        window.addEventListener('resize', update);
        return () => {
            ro.disconnect();
            window.removeEventListener('scroll', update, true);
            window.removeEventListener('resize', update);
        };
    }, [imageEl]);

    // Click έξω → κλείσιμο
    useEffect(() => {
        const handleMouseDown = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target) && e.target !== imageEl) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleMouseDown);
        return () => document.removeEventListener('mousedown', handleMouseDown);
    }, [onClose, imageEl]);

    if (!imageEl || !imageState) return null;

    const s = imageState;

    const btn = (label, title, onClick, active = false, danger = false) => (
        <button
            type="button"
            className={`rte-img-btn ${active ? 'active' : ''} ${danger ? 'danger' : ''}`.trim()}
            title={title}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
        >
            {label}
        </button>
    );

    const sep = () => <span className="rte-img-sep" />;

    // Εικονίδια διάταξης (3 γραμμές)
    const iconAlignLeft = (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="2"  width="14" height="2" rx="0.5"/>
            <rect x="1" y="7"  width="9"  height="2" rx="0.5"/>
            <rect x="1" y="12" width="14" height="2" rx="0.5"/>
        </svg>
    );
    const iconAlignCenter = (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="2"  width="14" height="2" rx="0.5"/>
            <rect x="3.5" y="7"  width="9" height="2" rx="0.5"/>
            <rect x="1" y="12" width="14" height="2" rx="0.5"/>
        </svg>
    );
    const iconAlignRight = (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="2"  width="14" height="2" rx="0.5"/>
            <rect x="6" y="7"  width="9"  height="2" rx="0.5"/>
            <rect x="1" y="12" width="14" height="2" rx="0.5"/>
        </svg>
    );

    return (
        <div
            ref={menuRef}
            className="rte-img-menu"
            style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 999999 }}
            onMouseDown={(e) => e.preventDefault()}
        >
            {/* Wrap modes */}
            {btn('Break', 'Δική του γραμμή (block)',
                () => onChangeStyle({ float: 'none', display: 'block', verticalAlign: 'baseline' }),
                s.float === 'none' && s.display === 'block')}
            {btn('◀ Wrap', 'Float αριστερά — κείμενο τυλίγεται δεξιά',
                () => onChangeStyle({ float: 'left', display: 'inline', verticalAlign: 'middle' }),
                s.float === 'left')}
            {btn('Wrap ▶', 'Float δεξιά — κείμενο τυλίγεται αριστερά',
                () => onChangeStyle({ float: 'right', display: 'inline', verticalAlign: 'middle' }),
                s.float === 'right')}

            {sep()}

            {/* Align (για Break mode) — με εικονίδια 3ων γραμμών */}
            {btn(iconAlignLeft,   'Αριστερά',
                () => onChangeStyle({ textAlign: 'left',   display: 'block', float: 'none', marginLeft: 0, marginRight: 0 }),
                s.textAlign === 'left'   && s.display === 'block')}
            {btn(iconAlignCenter, 'Κέντρο',
                () => onChangeStyle({ textAlign: 'center', display: 'block', float: 'none', marginLeft: 'auto', marginRight: 'auto' }),
                s.textAlign === 'center' && s.display === 'block')}
            {btn(iconAlignRight,  'Δεξιά',
                () => onChangeStyle({ textAlign: 'right',  display: 'block', float: 'none', marginLeft: 'auto', marginRight: 0 }),
                s.textAlign === 'right'  && s.display === 'block')}

            {sep()}

            {btn('🗑 Delete', 'Διαγραφή εικόνας', onDelete, false, true)}
        </div>
    );
};

export default RichTextEditorImageMenu;