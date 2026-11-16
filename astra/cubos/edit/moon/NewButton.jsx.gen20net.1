import { useRef, useState } from 'react';

const API_BASE = '/api/v1/maria';
const escapeSql = (s = '') => String(s).replace(/'/g, "''");

export default function NewButton({
                                      postid,
                                      row = 'content',
                                      lang = 'el',
                                      afterBlockId,
                                  }) {
    const buttonRef = useRef();
    const [creating, setCreating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [newContent, setNewContent] = useState('');

    const publicdb = 'gen_' + window.location.hostname.replace(/\./g, '');

    const insertNewBlock = async () => {
        const text = newContent.trim();
        if (!text || !postid) return;

        setSaving(true);
        setError(null);
        try {
            const sql = `
        INSERT INTO ${publicdb}.post_block (postid, ${row}_${lang})
        VALUES (${Number(postid)}, '${escapeSql(text)}')
      `;
            const res = await fetch(`${API_BASE}/q?key=maria`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sql }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            await res.json();

            setCreating(false);
            setNewContent('');
        } catch (err) {
            console.error('Failed to insert block:', err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const cancel = () => {
        setCreating(false);
        setNewContent('');
        setError(null);
    };

    return (
        <div ref={buttonRef} className="new-block">
            {!creating ? (
                <button type="button" className="new-block__trigger" onClick={() => setCreating(true)}>
                    ➕ New
                </button>
            ) : (
                <div className="new-block__editor">
          <textarea
              className="new-block__textarea"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="New block content..."
              rows={3}
          />
                    {error && <p className="new-block__error">Error: {error}</p>}
                    <div className="new-block__actions">
                        <button
                            type="button"
                            className="new-block__btn new-block__btn--primary"
                            onClick={insertNewBlock}
                            disabled={saving || !newContent.trim()}
                        >
                            {saving ? '… Saving' : '✅ Insert'}
                        </button>
                        <button
                            type="button"
                            className="new-block__btn"
                            onClick={cancel}
                            disabled={saving}
                        >
                            ❌ Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}