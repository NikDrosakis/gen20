import React, { useEffect, useRef, useState } from 'react';
import DB from '../contexts/DB';

export default function EditButton({ uri, row, editable, lang = 'el', blockId }) {
    const buttonRef = useRef();
    const [editing, setEditing] = useState(false);
    const [originalHTML, setOriginalHTML] = useState('');
    const getTargetElement = () => {
        if (blockId) {
            return document.getElementById(`block-${blockId}`);
        }
        // fallback: previous sibling as backup
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
        const escaped = content.replace(/'/g, "\\'");
        console.log(blockId)
        console.log(escaped)
        if (blockId && content) {
            await DB.updateBlockContent(blockId,escaped,row, lang);
        }
        setEditing(false);
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
                    <button className="bare" onClick={save}>💾 Save</button>
                    <button className="bare" onClick={cancel}>❌ Cancel</button>
                </>
            )}
        </div>
    );
}
