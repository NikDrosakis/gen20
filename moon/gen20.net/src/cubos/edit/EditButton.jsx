import { useEffect, useRef, useState } from 'react';

const escapeSql = (str = '') => String(str).replace(/'/g, "''");

export default function EditButton({ uri, row, editable, lang = 'el', blockId }) {
    const buttonRef = useRef();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [originalHTML, setOriginalHTML] = useState('');

    const getTargetElement = () => {
        if (blockId) {
            return document.querySelector(`[data-block-id="${blockId}"][data-row="${row}"]`);
        }
        return buttonRef.current?.previousElementSibling;
    };

    useEffect(() => {
        const el = getTargetElement();
        if (!el) return;
        if (editing) {
            el.setAttribute('contenteditable', 'true');
            el.focus();
        } else {
            el.removeAttribute('contenteditable');
        }
    }, [editing]);

    const save = async () => {
        const el = getTargetElement();
        if (!el) return;
        const content = el.innerHTML;

        if (!blockId || !content) return;

        setSaving(true);
        try {
            const updateQuery = `
        UPDATE gen_gen20net.post_block
        SET ${row}_${lang}='${escapeSql(content)}'
        WHERE id = '${escapeSql(blockId)}'`;
            const res = await fetch(
                `/api/v1/maria/q?key=${encodeURIComponent(updateQuery)}`
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            await res.json();
            setEditing(false);
        } catch (err) {
            console.error('Error saving block:', err);
        } finally {
            setSaving(false);
        }
    };

    const cancel = () => {
        const el = getTargetElement();
        if (el) el.innerHTML = originalHTML;
        setEditing(false);
    };

    const startEdit = () => {
        const el = getTargetElement();
        if (el) setOriginalHTML(el.innerHTML);
        setEditing(true);
    };

    return (
        <div ref={buttonRef} style={{ marginTop: 4 }}>
            {!editing ? (
                <button className="bare" onClick={startEdit}>✏️ Edit</button>
            ) : (
                <>
                    <button className="bare" onClick={save} disabled={saving}>
                        {saving ? '… Saving' : '💾 Save'}
                    </button>
                    <button className="bare" onClick={cancel} disabled={saving}>❌ Cancel</button>
                </>
            )}
        </div>
    );
}