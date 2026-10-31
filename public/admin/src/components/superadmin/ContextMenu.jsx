// components/superadmin/ContextMenu.jsx
import React, { useEffect, useRef, useState } from 'react';

const ContextMenu = ({ x, y, onClose, items }) => {
    const menuRef = useRef(null);
    const [openSubmenu, setOpenSubmenu] = useState(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEsc);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    const adjustedX = Math.min(x, window.innerWidth - 240);
    const adjustedY = Math.min(y, window.innerHeight - (items.length * 40 + 20));

    const handleItemClick = (item) => {
        if (item.disabled || item.separator) return;
        if (item.submenu) return; // τα submenu δεν κλείνουν το μενού με click
        if (typeof item.onClick === 'function') item.onClick();
        onClose();
    };

    return (
        <div
            ref={menuRef}
            className="context-menu"
            style={{
                position: 'fixed',
                top: adjustedY,
                left: adjustedX,
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                padding: '4px',
                zIndex: 999999,
                minWidth: '220px',
                fontSize: '13px',
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {items.map((item, idx) => {
                if (item.separator) {
                    return (
                        <div
                            key={idx}
                            style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }}
                        />
                    );
                }

                // ── Submenu item ──
                if (item.submenu) {
                    const isOpen = openSubmenu === idx;
                    return (
                        <div
                            key={idx}
                            style={{ position: 'relative' }}
                            onMouseEnter={() => setOpenSubmenu(idx)}
                            onMouseLeave={() => setOpenSubmenu(null)}
                        >
                            <button
                                disabled={item.disabled}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: 'none',
                                    background: isOpen ? '#f1f5f9' : 'transparent',
                                    textAlign: 'left',
                                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                                    borderRadius: '4px',
                                    color: item.danger ? '#dc2626' : '#1e293b',
                                    opacity: item.disabled ? 0.4 : 1,
                                    fontSize: '13px',
                                }}
                            >
                                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                                <span style={{ flex: 1 }}>{item.label}</span>
                                <span style={{ fontSize: '10px', opacity: 0.6 }}>▸</span>
                            </button>

                            {isOpen && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: '100%',
                                        marginLeft: 2,
                                        background: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                        padding: '4px',
                                        minWidth: '200px',
                                        zIndex: 1000000,
                                        maxHeight: '60vh',
                                        overflowY: 'auto',
                                    }}
                                >
                                    {item.submenu.map((sub, subIdx) => {
                                        if (sub.separator) {
                                            return (
                                                <div
                                                    key={subIdx}
                                                    style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }}
                                                />
                                            );
                                        }
                                        return (
                                            <button
                                                key={subIdx}
                                                onClick={() => {
                                                    if (typeof sub.onClick === 'function') sub.onClick();
                                                    onClose();
                                                }}
                                                disabled={sub.disabled}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    border: 'none',
                                                    background: 'transparent',
                                                    textAlign: 'left',
                                                    cursor: sub.disabled ? 'not-allowed' : 'pointer',
                                                    borderRadius: '4px',
                                                    color: sub.danger ? '#dc2626' : '#1e293b',
                                                    opacity: sub.disabled ? 0.4 : 1,
                                                    fontSize: '13px',
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!sub.disabled) {
                                                        e.currentTarget.style.background = sub.danger ? '#fee2e2' : '#f1f5f9';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'transparent';
                                                }}
                                            >
                                                <span style={{ fontSize: '16px' }}>{sub.icon}</span>
                                                <span>{sub.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                }

                // ── Απλό item ──
                return (
                    <button
                        key={idx}
                        onClick={() => handleItemClick(item)}
                        disabled={item.disabled}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            width: '100%',
                            padding: '8px 12px',
                            border: 'none',
                            background: 'transparent',
                            textAlign: 'left',
                            cursor: item.disabled ? 'not-allowed' : 'pointer',
                            borderRadius: '4px',
                            color: item.danger ? '#dc2626' : '#1e293b',
                            opacity: item.disabled ? 0.4 : 1,
                            fontSize: '13px',
                        }}
                        onMouseEnter={(e) => {
                            if (!item.disabled) {
                                e.currentTarget.style.background = item.danger ? '#fee2e2' : '#f1f5f9';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <span style={{ fontSize: '16px' }}>{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default ContextMenu;