import { useEffect, useState, useRef } from 'react';
import VideoPlayer from "@cubos/player/Player";

const Sketch = () => {
    // thumbnails = { baseName: { video: url, image: url } }
    // defaultVideo = string URL of default video to play initially
    const [thumbnails, setThumbnails] = useState({});
    const [error, setError] = useState(null);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [currentPoster, setCurrentPoster] = useState(null);
    const videoRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const baseAPI = import.meta.env.VITE_HTTP_API;
    const baseAPY = import.meta.env.VITE_HTTP_APY;
    const username = 'nikos';
    const password = '130177';
    const basicAuth = 'Basic ' + btoa(`${username}:${password}`);

    useEffect(() => {
        const fetchThumbnails = async () => {
            try {
                const response = await fetch(`${baseAPI}local/getSketchThumbnails`, {
                    headers: {
                        'Authorization': `Basic ${basicAuth}`,
                        'Accept': 'application/json',
                    },
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const res = await response.json();
                const data = res.data;

                setThumbnails(Array.isArray(data) ? data : []);
                setError(null);

                // Initialize currentVideo and currentPoster from first thumbnail
                if (Array.isArray(data) && data.length > 0) {
                    const first = data[0];
                    if (first?.types?.video && first?.types?.image) {
                        setCurrentVideo(first.types.video);
                        setCurrentPoster(first.types.image);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch thumbnails:', err);
                setError('Failed to load thumbnails');
                setThumbnails([]);
            }
        };
        fetchThumbnails();
    }, []);

    const changeVideo = (videoSrc, posterSrc) => {
        setCurrentVideo(videoSrc);
        setCurrentPoster(posterSrc);

        if (!videoRef.current) return;
        const videoEl = videoRef.current;

        setPlaying(false);
        videoEl.pause();
        videoEl.src = videoSrc;
        videoEl.load();

        const playAfterLoad = () => {
            videoEl.play().then(() => setPlaying(true)).catch((err) => {
                console.warn("Autoplay failed:", err);
            });
            videoEl.removeEventListener('loadeddata', playAfterLoad);
        };
        videoEl.addEventListener('loadeddata', playAfterLoad);
    };


    const uploadImgConvert2Video = async (e) => {
        e.preventDefault();

        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'block';

        const form = e.target;
        const formData = new FormData();
        const fileInput = form.querySelector('input[name="file"]');
        const selectedImage = form.querySelector('input[name="selected_image"]');
        const penColor = form.querySelector('input[name="pen_color"]');
        const bgColor = form.querySelector('input[name="bg_color"]');
        const penWidth = form.querySelector('input[name="pen_width"]');


        if (fileInput && fileInput.files.length > 0) {
            formData.append('file', fileInput.files[0]);
        } else if (selectedImage && selectedImage.value) {
            formData.append('selected_image', selectedImage.value);
        } else {
            alert('Please upload or select an image.');
            if (loader) loader.style.display = 'none';
            return;
        }

        formData.append('pen_color', penColor?.value || '#000000');
        formData.append('bg_color', bgColor?.value || '#ffffff');
        formData.append('pen_width', penWidth?.value || '2');

        try {
            const response = await fetch(`${baseAPY}sketch/image`, {
                headers: {
                    'Authorization': basicAuth,
                },
                method: 'POST',
                body: formData,
            });

console.log('respoonse',response);
            if (!response.ok) {
                alert('Upload failed.');
            } else {
                const contentType = response.headers.get('Content-Type') || '';
                if (contentType.includes('application/json')) {
                    const result = await response.json();
                    console.log(result)
                    // handle JSON data
                } else {
                    const blob = await response.blob();
                    const objectUrl = URL.createObjectURL(blob);
                    console.log('Generated video URL:', objectUrl);

// Update the video element dynamically
                    const videoElement = document.getElementById('main-video');
                    if (videoElement) {
                        videoElement.src = objectUrl;
                        videoElement.load();
                        videoElement.play(); // Optional: autoplay
                    }
                }
                form.reset();

            }
        } catch (err) {
            alert('Server error: ' + err.message);
        } finally {
            if (loader) loader.style.display = 'none';
        }


    };

    const changeImagePreview = (imageSrc) => {
        const container = document.getElementById('selectedPreview');
        if (!container) return;

        // Καθαρίζουμε το περιεχόμενο για να δείχνει μόνο μία εικόνα κάθε φορά
        container.innerHTML = '';

        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = 'Selected preview';
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        container.appendChild(img);
    };

    async function deleteFile({ event }) {
        if (event?.stopPropagation) event.stopPropagation();

        const el = event?.target?.closest('.thumb-block');
        if (!el) return alert("Could not find thumbnail block.");

        const img = el.querySelector('img');
        const video = el.querySelector('video source');
        const mediaSrc = img?.src || video?.src;

        if (!mediaSrc) return alert("No media source found.");

        try {
            // Extract pathname and remove leading slash
            const url = new URL(mediaSrc);
            let filepath = decodeURIComponent(
                url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname
            ); // "media/sketch_img/A3 G+K 004.jpg"

            if (filepath.startsWith('media/')) {
                filepath = filepath.slice('media/'.length);
            }
console.log(filepath)
            const confirmed = window.confirm(`Are you sure you want to delete:\n${filepath}?`);
            if (!confirmed) return;

            const res = await fetch(`${baseAPI}local/delSketchFile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': basicAuth,
                },
                body: JSON.stringify({ name: filepath }), // send full path from media root
            });

            const data = await res.json();
            console.log(data);

            if (data.success) {
                if (el && el.isConnected) {
                    el.remove();  // remove directly, safe and clean
                } else {
                    console.warn('Element already removed or not connected to DOM');
                }
            }

        } catch (err) {
            console.error(err);
            alert("Deletion failed. Check console.");
        }
    }



    return (
        <>
            <form id="sketchForm" onSubmit={uploadImgConvert2Video} encType="multipart/form-data">
                <input type="file" name="file" id="fileInput" accept="image/*"/>
                       <div
                    id="selectedPreview"
                    style={{margin: '10px 0', textAlign: 'center'}}
                ></div>

                <input type="hidden" name="selected_image" id="selected_image"/>

                <label htmlFor="pen_color">Pen Color:</label>
                <input
                    type="color"
                    name="pen_color"
                    id="pen_color"
                    defaultValue="#000000"
                />
                <br/>

                <label htmlFor="bg_color">Background Color:</label>
                <input
                    type="color"
                    name="bg_color"
                    id="bg_color"
                    defaultValue="#ffffff"
                />
                <br/>

                <label htmlFor="pen_width">Pen Width (px):</label>
                <input
                    type="number"
                    name="pen_width"
                    id="pen_width"
                    defaultValue={2}
                    min={1}
                    max={20}
                />
                <br/>

                <div
                    id="loader"
                    style={{display: 'none', textAlign: 'center', marginTop: 10}}
                >
                    <img
                        src="https://i.gifer.com/ZZ5H.gif"
                        alt="Loading..."
                        style={{width: 50, height: 50}}
                    />
                </div>

                <button type="submit">Upload Image & Convert to Video</button>
            </form>

            <div style={{display: 'flex', flexDirection: 'row', height: '100vh'}}>
                <VideoPlayer ref={videoRef} currentVideo={currentVideo} currentPoster={currentPoster}/>
                <div className="thumbnails-container">
                    {Array.isArray(thumbnails) && thumbnails.map((item) => {
                        const {name, types} = item; // Βγάζω name και types από το item

                        return (
                            <div className="thumbnail-row" key={name} style={{position: 'relative'}}>

                                {types?.image && (
                                    <div
                                        className="thumb-block"
                                        onClick={() => changeImagePreview(types.image)}
                                        style={{cursor: 'pointer'}}
                                    >
                                        <div className="thumb-flag">🖼️</div>
                                        <img className="thumb-img"  src={`/media/${types.image}`} alt={`Image for ${name}`}/>
                                        <div className="thumb-label">
                                            {name}.{types.image.split('.').pop()}
                                        </div>
                                        <div
                                            className="delete-icon"
                                            style={{
                                                top: 4,
                                                right: 4,
                                                cursor: 'pointer',
                                                fontSize: 18,
                                                color: 'red',
                                                position: 'absolute'
                                            }}
                                            onClick={(e) => deleteFile({event: e})}
                                        >
                                            🗑️
                                        </div>
                                    </div>
                                )}

                                {types?.video && (
                                    <div
                                        className="thumb-block"
                                        onClick={() => changeVideo(types.video, types.image)}
                                        style={{cursor: 'pointer', position: 'relative'}}
                                    >
                                        <div className="thumb-flag">🎞️</div>
                                        <video width="120" muted poster={`/media/${types.image}`}>
                                            <source src={types.video} type="video/mp4"/>
                                        </video>
                                        <div className="thumb-label" style={{position: 'relative'}}>
                                            {name}.{types.video.split('.').pop()}
                                        </div>
                                        <div
                                            className="delete-icon"
                                            style={{
                                                top: 4,
                                                right: 4,
                                                cursor: 'pointer',
                                                fontSize: 18,
                                                color: 'red',
                                                position: 'absolute'
                                            }}
                                            onClick={(e) => deleteFile({event: e})}
                                        >
                                            🗑️
                                        </div>
                                    </div>
                                )}
                            </div>

                        );
                    })}
                </div>
            </div>
            <style>{`
                .sketch {
                display: grid;
                grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
                grid-template-areas:
                "controls player"
                "controls library";
                grid-template-rows: minmax(260px, auto) minmax(180px, auto);
                gap: 16px;
                width: 100%;
                max-width: 100%;
                min-width: 0;
                margin: 0;
                padding: 16px;
                box-sizing: border-box;
                font-family: var(--font-family-sans-serif);
                color: var(--text);
                background: var(--bg);
            }

                .sketch *,
                .sketch *::before,
                .sketch *::after {
                box-sizing: border-box;
                min-width: 0;
            }

                /* BOX 1: Upload and drawing controls */
                .sketch #sketchForm {
                grid-area: controls;
                display: flex;
                flex-direction: column;
                align-items: stretch;
                gap: 12px;
                width: 100%;
                max-width: none;
                min-width: 0;
                margin: 0;
                padding: 20px;
                border: 1px solid var(--border);
                border-radius: 10px;
                background: var(--bg2);
                color: var(--text);
                box-shadow: var(--shadow);
            }

                .sketch #sketchForm label {
                display: block;
                margin-top: 4px;
                color: var(--text);
                font-size: 0.9rem;
            }

                .sketch #sketchForm input[type="file"] {
                display: block;
                width: 100%;
                max-width: 100%;
            }

                .sketch #selectedPreview {
                width: 100%;
                max-width: 100%;
                margin: 10px 0;
                text-align: center;
            }

                .sketch #selectedPreview img {
                display: block;
                width: auto;
                max-width: 100%;
                max-height: 220px;
                height: auto;
                margin: 0 auto;
                object-fit: contain;
            }

                .sketch #fileInput {
                width: 100%;
                max-width: 100%;
            }

                .sketch #pen_color,
                .sketch #bg_color {
                width: 100%;
                max-width: 100%;
                height: 36px;
                margin: 0;
                padding: 2px;
                border: 1px solid var(--border);
                border-radius: 5px;
                background: var(--bg);
                cursor: pointer;
            }

                .sketch #pen_width {
                width: 100%;
                max-width: 100%;
                padding: 7px 9px;
                margin: 0;
                border: 1px solid var(--border);
                border-radius: 5px;
                background: var(--bg);
                color: var(--text);
                font: inherit;
            }

                .sketch #sketchForm button {
                width: 100%;
                max-width: 100%;
                margin: 8px 0 0;
                padding: 11px 14px;
                border: 1px solid var(--primary);
                border-radius: 6px;
                background: var(--primary);
                color: var(--white);
                font: inherit;
                font-weight: 600;
                cursor: pointer;
            }

                .sketch #sketchForm button:hover {
                opacity: 0.9;
            }

                .sketch #loader {
                width: 100%;
                margin-top: 10px;
                text-align: center;
            }

                .sketch #loader img {
                display: block;
                width: 50px;
                height: 50px;
                margin: 0 auto;
            }

                /* Player + media wrapper.
                   display: contents lets the player and library become
                   independent grid areas of the main Sketch layout. */
                .sketch__media-layout {
                display: contents;
            }

                /* BOX 2: Video player */
                .sketch__media-layout > :first-child {
                grid-area: player;
                width: 100%;
                max-width: 100%;
                min-width: 0;
                min-height: 0;
                overflow: hidden;
                border: 1px solid var(--border);
                border-radius: 10px;
                background: var(--bg2);
                box-shadow: var(--shadow);
            }

                .sketch__media-layout > :first-child video,
                .sketch__media-layout > :first-child img,
                .sketch__media-layout > :first-child canvas {
                display: block;
                max-width: 100%;
                height: auto;
                margin: 0 auto;
                object-fit: contain;
            }

                /* BOX 3: Media library */
                .sketch .thumbnails-container {
                grid-area: library;
                display: flex;
                flex-wrap: wrap;
                align-content: flex-start;
                gap: 12px;
                width: 100%;
                max-width: 100%;
                min-width: 0;
                min-height: 180px;
                max-height: 420px;
                overflow: auto;
                padding: 12px;
                border: 1px solid var(--border);
                border-radius: 10px;
                background: var(--bg2);
                box-shadow: var(--shadow);
            }

                .sketch .thumbnail-row {
                display: flex;
                flex-wrap: wrap;
                align-items: flex-start;
                gap: 10px;
                width: auto;
                max-width: 100%;
                min-width: 0;
                margin: 0;
                position: relative;
            }

                .sketch .thumb-block {
                position: relative;
                width: 140px;
                max-width: 100%;
                min-width: 0;
                padding: 6px;
                border: 1px solid var(--border);
                border-radius: 6px;
                background: var(--bg3);
                color: var(--text);
                text-align: center;
                user-select: none;
                cursor: pointer;
                transition: box-shadow 0.2s ease, border-color 0.2s ease;
            }

                .sketch .thumb-block:hover {
                border-color: var(--primary);
                box-shadow: var(--shadow);
            }

                .sketch .thumb-block img,
                .sketch .thumb-block video {
                display: block;
                width: 100%;
                max-width: 100%;
                height: auto;
                margin: 0 auto;
                object-fit: contain;
            }

                .sketch .thumb-flag {
                position: absolute;
                top: 4px;
                left: 4px;
                z-index: 1;
                font-size: 18px;
            }

                .sketch .thumb-label {
                margin-top: 5px;
                color: var(--text);
                font-size: 0.8rem;
                font-weight: 600;
                overflow-wrap: anywhere;
                white-space: normal;
            }

                .sketch .delete-icon {
                position: absolute;
                top: 4px;
                right: 4px;
                z-index: 2;
                color: var(--danger);
                font-size: 18px;
                cursor: pointer;
            }

                /* Tablet */
                @media (max-width: 900px) and (min-width: 601px) {
                .sketch {
                grid-template-columns: minmax(190px, 240px) minmax(0, 1fr);
                gap: 12px;
                padding: 12px;
            }

                .sketch #sketchForm {
                padding: 14px;
            }

                .sketch .thumbnails-container {
                max-height: 340px;
            }
            }

                /* Mobile: three boxes stacked vertically */
                @media (max-width: 600px) {
                .sketch {
                grid-template-columns: minmax(0, 1fr);
                grid-template-areas:
                "controls"
                "player"
                "library";
                grid-template-rows: auto auto minmax(180px, auto);
                gap: 12px;
                padding: 12px;
            }

                .sketch #sketchForm {
                padding: 16px;
            }

                .sketch__media-layout > :first-child {
                min-height: 200px;
            }

                .sketch .thumbnails-container {
                min-height: 160px;
                max-height: 320px;
                padding: 10px;
            }

                .sketch .thumb-block {
                width: min(140px, calc(50% - 6px));
            }
            }

                /* Small mobile */
                @media (max-width: 360px) {
                .sketch {
                padding: 8px;
                gap: 10px;
            }

                .sketch #sketchForm {
                padding: 12px;
            }

                .sketch .thumb-block {
                width: 100%;
            }
            }`}</style>
        </>
    );
};
export default Sketch;