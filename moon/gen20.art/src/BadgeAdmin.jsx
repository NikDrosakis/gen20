// BadgeAdmin.jsx — admin panel (GPM + CouchDB/MariaDB CRUD)
import React, { useEffect, useState } from 'react';
import './Badge.css';

const API = '/api/admin/badges'; // gen20 admin proxy endpoint

const emptyRow = () => ({
    level: '', title: '', icon: '🏆', description: '', domain: '*', sort_order: 0, active: 1,
});

export default function BadgeAdmin() {
    const [rows, setRows] = useState([]);
    const [draft, setDraft] = useState(emptyRow());
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    const load = async () => {
        setLoading(true); setErr(null);
        try {
            const res = await fetch(API);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setRows(await res.json());
        } catch (e) { setErr(e.message); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const save = async () => {
        if (!draft.level || !draft.title) return;
        setLoading(true); setErr(null);
        try {
            const res = await fetch(API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(draft),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setDraft(emptyRow());
            await load();
        } catch (e) { setErr(e.message); }
        finally { setLoading(false); }
    };

    const remove = async (id) => {
        if (!window.confirm('Διαγραφή badge;')) return;
        setLoading(true); setErr(null);
        try {
            const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            await load();
        } catch (e) { setErr(e.message); }
        finally { setLoading(false); }
    };

    const update = (id, patch) =>
        setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));

    return (
        <div className="badge-admin">
            <h3>Badge Admin</h3>
            {err && <p style={{ color: '#e74c3c' }}>Σφάλμα: {err}</p>}

            <table>
                <thead>
                <tr>
                    <th>Level</th><th>Title</th><th>Icon</th>
                    <th>Description</th><th>Domain</th><th>Order</th><th>Active</th><th></th>
                </tr>
                </thead>
                <tbody>
                {rows.map((r) => (
                    <tr key={r.id}>
                        <td><input type="number" value={r.level}
                                   onChange={(e) => update(r.id, { level: +e.target.value })} /></td>
                        <td><input type="text" value={r.title}
                                   onChange={(e) => update(r.id, { title: e.target.value })} /></td>
                        <td><input type="text" value={r.icon}
                                   onChange={(e) => update(r.id, { icon: e.target.value })} /></td>
                        <td><input type="text" value={r.description}
                                   onChange={(e) => update(r.id, { description: e.target.value })} /></td>
                        <td><input type="text" value={r.domain}
                                   onChange={(e) => update(r.id, { domain: e.target.value })} /></td>
                        <td><input type="number" value={r.sort_order}
                                   onChange={(e) => update(r.id, { sort_order: +e.target.value })} /></td>
                        <td style={{ textAlign: 'center' }}>
                            <input type="checkbox" checked={!!r.active}
                                   onChange={(e) => update(r.id, { active: e.target.checked ? 1 : 0 })} />
                        </td>
                        <td className="row-actions">
                            <button onClick={() => remove(r.id)} className="danger">Διαγραφή</button>
                        </td>
                    </tr>
                ))}
                {rows.length === 0 && !loading && (
                    <tr><td colSpan={8} style={{ color: '#888' }}>Καμία εγγραφή.</td></tr>
                )}
                </tbody>
            </table>

            <h4 style={{ marginTop: 24 }}>Προσθήκη νέου badge</h4>
            <table>
                <tbody>
                <tr>
                    <td><input type="number" placeholder="Level" value={draft.level}
                               onChange={(e) => setDraft({ ...draft, level: +e.target.value })} /></td>
                    <td><input type="text" placeholder="Title" value={draft.title}
                               onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></td>
                    <td><input type="text" placeholder="Icon" value={draft.icon}
                               onChange={(e) => setDraft({ ...draft, icon: e.target.value })} /></td>
                    <td><input type="text" placeholder="Description" value={draft.description}
                               onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></td>
                    <td><input type="text" placeholder="Domain (*)" value={draft.domain}
                               onChange={(e) => setDraft({ ...draft, domain: e.target.value })} /></td>
                    <td><button onClick={save} disabled={loading}>Αποθήκευση</button></td>
                </tr>
                </tbody>
            </table>
        </div>
    );
}