// components/media/PasteImage.jsx
import React, { useState, useRef, useEffect } from 'react';
import "./PasteImage.css";

const PasteImage = ({ onSelectMedia }) => {
    const [pasteImage, setPasteImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    // Listen for paste events globally
    useEffect(() => {
        const handlePaste = (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (const item of items) {
                if (item.type.startsWith('image/')) {
                    const file = item.getAsFile();
                    handleImageFile(file);
                    break;
                }
            }
        };

        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, []);

    const handleImageFile = (file) => {
        if (file.size > 10 * 1024 * 1024) {
            setError('Το αρχείο είναι πολύ μεγάλο (max 10MB)');
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError('Παρακαλώ επιλέξτε μια εικόνα');
            return;
        }

        setError('');
        setPasteImage(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        const timestamp = new Date().getTime();
        const extension = file.type.split('/')[1] || 'png';
        setFileName(`paste-${timestamp}.${extension}`);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageFile(file);
        } else {
            setError('Παρακαλώ επιλέξτε μια εικόνα');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageFile(file);
        } else {
            setError('Παρακαλώ ρίξτε μια εικόνα');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleUpload = async () => {
        if (!pasteImage) {
            setError('Δεν υπάρχει εικόνα για αποθήκευση');
            return;
        }

        if (!fileName) {
            setError('Παρακαλώ δώστε όνομα αρχείου');
            return;
        }

        setIsUploading(true);
        setError('');
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('upload_image', pasteImage, fileName);
            const domain = window.location.hostname;
            const savedFolder = localStorage.getItem('current_media_folder') || '';
            const folder = savedFolder || `/var/www/gs/media/${domain}`;
            formData.append('domain', domain);
            formData.append('folder', savedFolder);

            const response = await fetch('/api/v1/local/uploadFile', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
console.log(result);
            if (result.success) {
                setUploadProgress(100);

                // Στείλε το αποτέλεσμα στον parent
                if (onSelectMedia) {
                    onSelectMedia(result.data || result);
                }
                window.dispatchEvent(new CustomEvent('mediaUploaded'));

                // ΜΗΝ κάνεις reset αμέσως - άφησε την εικόνα να φαίνεται
                // Απλά άλλαξε το μήνυμα σε επιτυχία
                setError('');

                // Reset μετά από 3 δευτερόλεπτα (αρκετός χρόνος να δει ο χρήστης)
                setTimeout(() => {
                    resetForm();
                }, 3000);
            } else {
                setError(result.error || 'Αποτυχία αποθήκευσης');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setError('Σφάλμα δικτύου: ' + error.message);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };
    const resetForm = () => {
        setPasteImage(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setFileName('');
        setUploadProgress(0);
        setError('');
    };

    return (
        <div className="pasteimage-container">
            <div className="pasteimage-header">
                <h3>📋 Επικόλληση Εικόνας</h3>
                <p>Πατήστε <strong>Ctrl+V</strong> ή <strong>⌘+V</strong> για επικόλληση από το clipboard</p>
            </div>

            {/* Drop / Paste Zone */}
            <div
                className={`pasteimage-zone ${previewUrl ? 'has-image' : ''} ${isDragOver ? 'drag-over' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !previewUrl && fileInputRef.current?.click()}
            >
                {!previewUrl ? (
                    <div className="pasteimage-placeholder">
                        <span className="pasteimage-icon">🖼️</span>
                        <p>Κάντε κλικ για επιλογή αρχείου</p>
                        <p className="pasteimage-shortcut">ή πατήστε Ctrl+V για επικόλληση</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                    </div>
                ) : (
                    <div className="pasteimage-preview">
                        <img src={previewUrl} alt="Pasted image preview" />
                        <button
                            className="pasteimage-remove"
                            onClick={(e) => {
                                e.stopPropagation();
                                resetForm();
                            }}
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>

            {/* Filename input */}
            {previewUrl && (
                <div className="pasteimage-filename">
                    <input
                        type="text"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        className="pasteimage-input"
                        placeholder="Όνομα αρχείου"
                    />
                </div>
            )}

            {/* Upload progress */}
            {isUploading && (
                <div className="pasteimage-progress">
                    <div className="pasteimage-progress-bar">
                        <div
                            className="pasteimage-progress-fill"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                    <span>{uploadProgress}%</span>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="pasteimage-error">
                    ⚠️ {error}
                </div>
            )}

            {/* Action buttons */}
            {previewUrl && !isUploading && (
                <div className="pasteimage-toolbar">
                    <button
                        className="btn-paste-upload"
                        onClick={handleUpload}
                        disabled={!fileName}
                    >
                        💾 Αποθήκευση
                    </button>
                    <button
                        className="btn-paste-cancel"
                        onClick={resetForm}
                    >
                        Ακύρωση
                    </button>
                </div>
            )}

            <div className="pasteimage-footer">
                <small>Υποστηρίζονται: JPG, PNG, GIF, WEBP • Max 10MB</small>
            </div>
        </div>
    );
};

export default PasteImage;