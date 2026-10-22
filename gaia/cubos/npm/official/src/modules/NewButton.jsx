import React, { useRef, useState } from 'react';
import DB from '../contexts/DB';

export default function NewButton({ postid, row = 'content', lang = 'el', afterBlockId }) {
    const buttonRef = useRef();
    const [creating, setCreating] = useState(false);
    const [newContent, setNewContent] = useState('');

    const insertNewBlock = async () => {
        if (!newContent.trim()) return;

        // You can expand this depending on DB method (e.g., ordering logic)
        await DB.insertBlock("post_block",{
            postid: postid,
            [`content_${lang}`]: newContent
        });

        setCreating(false);
        setNewContent('');
    };

    const cancel = () => {
        setCreating(false);
        setNewContent('');
    };

    const startCreating = () => {
        setCreating(true);
    };

    return (
        <div ref={buttonRef} style={{ marginTop: 6 }}>
            {!creating ? (
                <button className="bare" onClick={startCreating}>➕ New</button>
            ) : (
                <div>
                    <textarea
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="New block content..."
                        style={{ width: '100%', minHeight: 60 }}
                    />
                    <div style={{ marginTop: 4 }}>
                        <button className="bare" onClick={insertNewBlock}>✅ Insert</button>
                        <button className="bare" onClick={cancel} style={{ marginLeft: 4 }}>❌ Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}
