import React, { useEffect, useRef, useState } from 'react';
import DB from '../contexts/DB';

export default function EditButton({ uri, row, editable, lang = 'el', blockId }) {
    const buttonRef = useRef();
    const [editing, setEditing] = useState(false);
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

        if (blockId && content) {
            const updateQuery = `
                UPDATE gen_gen20net.post_block
                SET ${row}_${lang}='${content}'
                WHERE id = '${blockId}'                                `;
            const update = await DB.maria("q", updateQuery);
            if (update) {
                setEditing(false);
            }
        }
    }

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
                    <button className="bare" onClick={save}>💾 Save</button>
                    <button className="bare" onClick={cancel}>❌ Cancel</button>
                </>
            )}
        </div>
    );
}
