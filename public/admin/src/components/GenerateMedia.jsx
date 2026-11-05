// components/GenerateMedia.jsx
import React, { useState, useEffect } from 'react';
import "./GenerateMedia.css";
const GenerateMedia = ({ onSelectMedia }) => {
    const [prompt, setPrompt] = useState('');
    const [generating, setGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [error, setError] = useState('');
    const [currentFolder, setCurrentFolder] = useState('');

    useEffect(() => {
        const sync = () => setCurrentFolder(localStorage.getItem('current_media_folder') || '');
        sync();
        window.addEventListener('folderChanged', sync);
        window.addEventListener('storage', sync);
        return () => {
            window.removeEventListener('folderChanged', sync);
            window.removeEventListener('storage', sync);
        };
    }, []);
    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a description');
            return;
        }

        setGenerating(true);
        setError('');
        setGeneratedImage(null);

        try {
            const targetFolder = currentFolder || localStorage.getItem('current_media_folder');

            const response = await fetch('/api/v1/local/generateImg', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt.trim(),
                    folder: targetFolder
                })
            });

            const result = await response.json();
            const data = result?.data || result;

            if (data.success !== false && data.image_url) {
                setGeneratedImage(data.image_url);
                // ✅ Το image είναι ΗΔΗ στο media library
                window.dispatchEvent(new CustomEvent('mediaUploaded'));
            } else {
                setError(data.error || 'Failed to generate');
            }
        } catch (error) {
            setError('Failed to generate: ' + error.message);
        } finally {
            setGenerating(false);
        }
    };
    const handleImport = async () => {
        // Απλά ενημέρωσε το MediaManager — το image είναι ήδη στο δίσκο
        window.dispatchEvent(new CustomEvent('mediaUploaded'));
        alert('✅ Image already saved to media library');
    };
    return (
        <div className="generate-container">
            <div className="generate-header">
                <div className="integration-icon">✨</div>
                <h3>AI Image Generation</h3>
                <p>Generate images using Stable Diffusion AI</p>
            </div>

            <div className="generate-form">
                <textarea
                    placeholder="Describe the image you want to generate..."
                    rows={3}
                    className="generate-input"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={generating}
                />
                <button
                    className="btn-generate"
                    onClick={handleGenerate}
                    disabled={generating || !prompt.trim()}
                >
                    {generating ? '✨ Generating...' : '🎨 Generate Image'}
                </button>
            </div>

            {error && (
                <div className="generate-error">
                    ⚠️ {error}
                </div>
            )}

            {generating && (
                <div className="generate-loading">
                    <div className="spinner"></div>
                    <p>Generating your image... This may take up to 30 seconds.</p>
                </div>
            )}

            {generatedImage && !generating && (
                <div className="generate-result">
                    <h4>Generated Image:</h4>
                    <div className="generated-image-container">
                        <img
                            src={generatedImage}
                            alt="Generated"
                            className="generated-image"
                            onError={(e) => {
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="2.5"%3E%3C/circle%3E%3Cpath d="M21 15l-5-4-3 3-4-4-6 6"%3E%3C/path%3E%3C/svg%3E';
                            }}
                        />
                    </div>
                    <div className="generate-actions">
                        <button className="btn-import" onClick={handleImport}>
                            📥 Import to Media Library
                        </button>
                        <button className="btn-regenerate" onClick={handleGenerate}>
                            🔄 Regenerate
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GenerateMedia;