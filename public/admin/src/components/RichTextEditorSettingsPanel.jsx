// components/RichTextEditorSettingsPanel.jsx
import React, { useEffect, useRef, useState } from 'react';

const RichTextEditorSettingsPanel = ({
                                         initialData = {},
                                         onSave,
                                         onClose,
                                     }) => {
    const panelRef = useRef(null);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const [rows, setRows] = useState([]);

    // ✅ Μετατροπή του GContent σε rows
    useEffect(() => {
        const data = initialData || {};
        const initialRows = Object.entries(data).map(([key, val]) => ({
            key,
            val: typeof val === 'string' ? val : JSON.stringify(val),
        }));
        if (initialRows.length === 0) {
            initialRows.push({ key: '', val: '' });
        }
        setRows(initialRows);
    }, [initialData]);

    // Drag-to-move
    const dragRef = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });

    const handleHeaderMouseDown = (e) => {
        e.preventDefault();
        dragRef.current = {
            dragging: true,
            startX: e.clientX,
            startY: e.clientY,
            origX: pos.left,
            origY: pos.top,
        };
        const onMove = (ev) => {
            const d = dragRef.current;
            if (!d.dragging) return;
            const dx = ev.clientX - d.startX;
            const dy = ev.clientY - d.startY;
            setPos({
                left: Math.max(0, Math.min(d.origX + dx, window.innerWidth - 460)),
                top: Math.max(0, Math.min(d.origY + dy, window.innerHeight - 400)),
            });
        };
        const onUp = () => {
            dragRef.current.dragging = false;
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    };

    const updateRow = (i, patch) => {
        setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r));
    };

    const addRow = () => {
        setRows((prev) => [...prev, { key: '', val: '' }]);
    };

    const removeRow = (i) => {
        setRows((prev) => prev.filter((_, idx) => idx !== i));
    };

    const handleSave = () => {
        const obj = {};
        rows.forEach(({ key, val }) => {
            const k = (key || '').trim();
            if (!k) return;
            // ✅ Προσπάθησε JSON parse, αλλιώς string
            let parsed = val;
            if (typeof val === 'string' && val.trim() !== '') {
                try {
                    parsed = JSON.parse(val);
                } catch {
                    parsed = val;
                }
            }
            obj[k] = parsed;
        });
        onSave(obj);
        onClose();
    };

    return (
        <div
            ref={panelRef}
            className="rte-floating-panel rte-settings-panel"
            style={{
                position: 'fixed',
                top: pos.top,
                left: pos.left,
                width: 460,
                maxHeight: '80vh',
                zIndex: 999999,
            }}
        >
            <div
                className="rte-floating-header"
                style={{ cursor: 'move' }}
                onMouseDown={handleHeaderMouseDown}
            >
                <strong>⚙️ Content Settings</strong>
                <span className="rte-floating-sub">GContent variables</span>
                <button
                    type="button"
                    className="rte-floating-close"
                    onClick={onClose}
                >
                    ✕
                </button>
            </div>

            <div className="rte-floating-body">
                <div className="rte-settings-hint">
                    Key / Value ζεύγη — αποθηκεύονται στο <code>content.json.GContent</code>
                </div>

                <div className="rte-settings-rows">
                    {rows.map((row, i) => (
                        <div className="rte-settings-row" key={i}>
                            <input
                                type="text"
                                className="rte-settings-key"
                                placeholder="key"
                                value={row.key}
                                onChange={(e) => updateRow(i, { key: e.target.value })}
                            />
                            <span className="rte-settings-eq">=</span>
                            <input
                                type="text"
                                className="rte-settings-val"
                                placeholder="value"
                                value={row.val}
                                onChange={(e) => updateRow(i, { val: e.target.value })}
                            />
                            <button
                                type="button"
                                className="rte-settings-remove"
                                onClick={() => removeRow(i)}
                                title="Διαγραφή"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>

                <div className="rte-settings-actions">
                    <button
                        type="button"
                        className="rte-global-btn"
                        onClick={addRow}
                    >
                        + Add
                    </button>
                    <button
                        type="button"
                        className="rte-global-btn rte-global-btn-primary"
                        onClick={handleSave}
                    >
                        💾 Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RichTextEditorSettingsPanel;