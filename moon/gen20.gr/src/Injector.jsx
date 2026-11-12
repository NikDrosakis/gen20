import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "./Injector.css";

export default function Injector() {
    const navigate = useNavigate();
    const [datasetLoading, setDatasetLoading] = useState(false);
    // Injection states
    const [url, setUrl] = useState("");
    const [domain, setDomain] = useState("");
    const [type, setType] = useState("");
    const [injectResult, setInjectResult] = useState(null);
    const [injectLoading, setInjectLoading] = useState(false);

    // File manager states
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedID, setSelectedID] = useState("");
    const [domains, setDomains] = useState([]);

    const [editingFile, setEditingFile] = useState(null);
    const [editName, setEditName] = useState("");
    const [editTitle, setEditTitle] = useState("");

    // Bulk upload states
    const [bulkFile, setBulkFile] = useState(null);
    const [bulkDomain, setBulkDomain] = useState("");
    const [bulkLoading, setBulkLoading] = useState(false);

    const uploadBulk = async () => {
        if (!bulkFile || !bulkDomain) {
            alert("Please select a file and enter domain");
            return;
        }

        setBulkLoading(true);
        const formData = new FormData();
        formData.append("file", bulkFile);
        formData.append("domain", bulkDomain);

        try {
            const res = await fetch("/apy/v1/injector/injection-bulk", {
                method: "POST",
                body: formData
            });

            const data = await res.json();
            setInjectResult(data);

            if (res.ok) {
                if (data.files && Array.isArray(data.files)) {
                    for (const file of data.files) {
                        await saveFileToDatabase({
                            name: file.name,
                            title: file.title || file.name,
                            domain: bulkDomain,
                            filename: file.name,
                            file_path: file.path,
                            file_size: file.size,
                            level: 1
                        });
                    }
                }

                loadFiles(selectedID);
                setBulkFile(null);
                setBulkDomain("");
                document.getElementById("bulk-file-input").value = "";
            }
        } catch (err) {
            setInjectResult({ error: err.message });
        }

        setBulkLoading(false);
    };

    const inject = async () => {
        if (!url || !domain || !type) {
            alert("Please fill all fields (url, domain, type)");
            return;
        }

        const payload = { url, domain, type };

        setInjectLoading(true);
        setInjectResult(null);

        try {
            const res = await fetch("/apy/v1/injector/injection", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorData = await res.json();
                setInjectResult({ error: errorData });
            } else {
                const data = await res.json();

                const savedFile = await saveFileToDatabase({
                    name: data.filename || type,
                    title: data.title || url.split('/').pop(),
                    domain: domain,
                    filename: data.filename,
                    file_path: data.file_path,
                    file_size: data.file_size || 0,
                    level: 1
                });

                setInjectResult({ success: data, saved: savedFile });
                loadFiles(selectedID);
                setUrl("");
                setDomain("");
                setType("");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setInjectResult({ error: err.message });
        }

        setInjectLoading(false);
    };

    const loadFiles = async (id = "") => {
        setLoading(true);
        try {
            const url = id
                ? `/api/v1/maria/f?table=select * from gen_gen20gr.c_clinvar where domain='${domain}'`
                : "/api/v1/maria/fa?table=select * from gen_gen20gr.c_clinvar";

            const res = await fetch(url);
            const data = await res.json();
            setFiles(data.data || []);

            const uniqueDomains = [...new Set(data.data.map(f => f.domain))];
            setDomains(uniqueDomains);
        } catch (err) {
            console.error("Error loading files:", err);
        }
        setLoading(false);
    };

    const downloadAll = async (domain = "") => {
        try {
            const url = domain
                ? `/apy/v1/injector/download-all?domain=${domain}`
                : "/apy/v1/injector/download-all";

            const response = await fetch(url);
            const blob = await response.blob();

            const link = document.createElement("a");
            const objectUrl = URL.createObjectURL(blob);
            link.href = objectUrl;
            link.download = domain ? `injected_${domain}.zip` : "injected_all.zip";
            link.click();
            URL.revokeObjectURL(objectUrl);
        } catch (err) {
            console.error("Error downloading:", err);
        }
    };

    const startEditing = (file) => {
        setEditingFile(file.id);
        setEditName(file.name);
        setEditTitle(file.title || "");
    };

    const saveEdit = async (id) => {
        await updateFileMetadata(id, editName, editTitle);
    };

    const downloadFile = async (filePath) => {
        try {
            const response = await fetch(`/apy/v1/injector/download-file?file_path=${encodeURIComponent(filePath)}`);
            const blob = await response.blob();

            const link = document.createElement("a");
            const objectUrl = URL.createObjectURL(blob);
            link.href = objectUrl;
            link.download = filePath.split("/").pop();
            link.click();
            URL.revokeObjectURL(objectUrl);
        } catch (err) {
            console.error("Error downloading file:", err);
        }
    };

    const deleteFile = async (id, fileName) => {
        if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/v1/ins/clinvar/${id}`, {
                method: "DELETE"
            });

            if (response.ok) {
                alert("File deleted successfully");
                loadFiles(selectedID);
            } else {
                alert("Delete failed");
            }
        } catch (err) {
            console.error("Error deleting file:", err);
            alert("Delete failed");
        }
    };

    const deleteAll = async (domain = "") => {
        if (!window.confirm(`Are you sure you want to delete all files${domain ? ` for ${domain}` : ""}?`)) {
            return;
        }

        try {
            const url = domain
                ? `/apy/v1/injector/delete-all?domain=${domain}`
                : "/apy/v1/injector/delete-all";

            const response = await fetch(url, { method: "DELETE" });
            const data = await response.json();
            alert(data.message);
            loadFiles(selectedID);
        } catch (err) {
            console.error("Error deleting:", err);
        }
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    };

    const saveFileToDatabase = async (fileData) => {
        try {
            const response = await fetch("/api/v1/ins/clinvar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: fileData.name,
                    title: fileData.title || fileData.name,
                    domain: fileData.domain,
                    filename: fileData.filename,
                    file_path: fileData.file_path,
                    file_size: fileData.file_size,
                    level: fileData.level || 1,
                    project_id: fileData.project_id || null,
                    released: fileData.released || null
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log("File saved to database:", result);
                loadFiles(selectedID);
                return result;
            }
        } catch (err) {
            console.error("Error saving to database:", err);
        }
        return null;
    };

    const updateFileMetadata = async (id, name, title) => {
        try {
            const response = await fetch(`/api/v1/ins/clinvar/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, title })
            });

            if (response.ok) {
                alert("File metadata updated successfully");
                loadFiles(selectedID);
                setEditingFile(null);
            } else {
                alert("Update failed");
            }
        } catch (err) {
            console.error("Error updating metadata:", err);
            alert("Update failed");
        }
    };

    useEffect(() => {
        loadFiles(selectedID);
    }, [selectedID]);

    return (
        <div className="injector-container">
            {/* INJECTION SECTION */}
            <div className="injector-section">
                <h2>📥 Injection Core</h2>
                <div className="injector-bulk-section">
                    <h3>📦 Bulk Injection (ZIP/TAR.GZ)</h3>
                    <input
                        placeholder="Domain for bulk files"
                        value={bulkDomain}
                        onChange={(e) => setBulkDomain(e.target.value)}
                        className="injector-input"
                    />
                    <input
                        id="bulk-file-input"
                        type="file"
                        accept=".zip,.tar.gz,.tgz"
                        onChange={(e) => setBulkFile(e.target.files[0])}
                        className="injector-file-input"
                    />
                    <button
                        onClick={uploadBulk}
                        disabled={bulkLoading}
                        className="injector-button"
                    >
                        {bulkLoading ? "⏳ Uploading..." : "📤 Upload & Extract"}
                    </button>
                    <div className="injector-note">
                        * Supports ZIP, TAR.GZ files. Will extract all contents automatically.
                    </div>
                </div>
                <div className="injector-injection-form">
                    <input
                        placeholder="URL (e.g., https://example.com/file.js)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="injector-input"
                    />
                    <input
                        placeholder="Domain (e.g., example.com)"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        className="injector-input"
                    />
                    <input
                        placeholder="Type (e.g., script.js or style.css)"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="injector-input"
                    />
                    <button
                        onClick={inject}
                        disabled={injectLoading}
                        className="injector-button"
                    >
                        {injectLoading ? "⏳ Injecting..." : "💉 Inject"}
                    </button>
                </div>

                {injectResult && (
                    <pre className="injector-output">
                        {JSON.stringify(injectResult, null, 2)}
                    </pre>
                )}
            </div>

            {/* FILE MANAGER SECTION */}
            <div className="injector-section">
                <h2>📁 File Manager</h2>

                <div className="injector-controls">
                    <select
                        value={selectedID}
                        onChange={(e) => setSelectedID(e.target.value)}
                        className="injector-select"
                    >
                        <option value="">All Domains</option>
                        {domains.map(domain => (
                            <option key={domain} value={domain}>{domain}</option>
                        ))}
                    </select>

                    <button onClick={() => downloadAll(selectedID)} className="injector-button">
                        📦 Download All ({files.length} files)
                    </button>

                    <button onClick={() => deleteAll(selectedID)} className="injector-danger-button">
                        🗑️ Delete All
                    </button>

                    <button onClick={() => loadFiles(selectedID)} className="injector-button">
                        🔄 Refresh
                    </button>
                </div>

                {loading && <div className="injector-loading">Loading...</div>}

                {!loading && files.length === 0 && (
                    <div className="injector-empty">
                        No files found. Use the injection form above to add files.
                    </div>
                )}

                {!loading && files.length > 0 && (
                    <div className="injector-file-list">
                        <h3>Files ({files.length})</h3>
                        <table className="injector-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Title</th>
                                <th>Domain</th>
                                <th>Filename</th>
                                <th>Size</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {files.map((file) => (
                                <tr key={file.id}>
                                    <td>{file.id}</td>
                                    <td>
                                        {editingFile === file.id ? (
                                            <input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="injector-inline-input"
                                            />
                                        ) : (
                                            file.name
                                        )}
                                    </td>
                                    <td>
                                        {editingFile === file.id ? (
                                            <input
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                className="injector-inline-input"
                                            />
                                        ) : (
                                            file.title || "-"
                                        )}
                                    </td>
                                    <td>{file.domain}</td>
                                    <td>{file.filename || file.name}</td>
                                    <td>{formatSize(file.file_size)}</td>
                                    <td>
                                        {editingFile === file.id ? (
                                            <>
                                                <button onClick={() => saveEdit(file.id)} className="injector-small-button">💾 Save</button>
                                                <button onClick={() => setEditingFile(null)} className="injector-small-danger-button">❌ Cancel</button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => startEditing(file)} className="injector-small-button">✏️ Edit</button>
                                                <button
                                                    onClick={async () => {
                                                        setDatasetLoading(true);
                                                        console.log('Processing dataset for:', file.domain);

                                                        try {
                                                            const response = await fetch('/api/v1/local/xml2Maria', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({
                                                                    xmlPath: `/var/www/gs/kronos/data/injected/ncbi.nlm.nih.gov/${file.filename}`,
                                                                    name: file.domain || 'clinvar',
                                                                    dropExisting: false
                                                                })
                                                            });

                                                            console.log('Response status:', response.status);

                                                            if (!response.ok) {
                                                                const text = await response.text();
                                                                console.error('Error response:', text);
                                                                throw new Error(`HTTP ${response.status}: ${text.substring(0, 200)}`);
                                                            }

                                                            const data = await response.json();
                                                            console.log('Dataset result:', data);

                                                            if (data.success) {
                                                                alert(`✅ Dataset imported successfully!\nTable: ${data.table}\nRecords: ${data.total_records}\nInserted: ${data.inserted}`);
                                                            } else {
                                                                alert(`❌ Error: ${data.error}`);
                                                            }
                                                        } catch (err) {
                                                            console.error('Dataset error:', err);
                                                            alert(`❌ Error: ${err.message}`);
                                                        } finally {
                                                            setDatasetLoading(false);
                                                        }
                                                    }}
                                                    className="injector-small-button"
                                                    disabled={datasetLoading}
                                                >
                                                    {datasetLoading ? '⏳ Processing...' : '📊 Dataset'}
                                                </button>
                                               {datasetLoading && (
                                                    <div className="injector-loading-overlay">
                                                        <div className="injector-loading-spinner"></div>
                                                        <p>Processing XML file. This may take several minutes...</p>
                                                    </div>
                                                )}
                                                <button onClick={() => downloadFile(file.file_path, file.name)} className="injector-small-button">⬇️ Download</button>
                                                <button onClick={() => deleteFile(file.id, file.name)} className="injector-small-danger-button">🗑️ Delete</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}