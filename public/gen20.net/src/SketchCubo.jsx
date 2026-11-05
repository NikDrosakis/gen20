import React, { useEffect, useState, useRef } from 'react';
import VideoPlayer from '../modules/VideoPlayer';

const SketchCubo = () => {
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
       @viewport {
          width: device-width;
          zoom: 1.0;
        }

        @media (max-width: 768px) {
          body {
            font-size: 16px;
            padding: 1rem;
            margin: 0;
          }

          video, img, canvas {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 0 auto;
          }

          .controls {
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
          }
        }

    #sketchForm {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;        
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
        margin: 20px auto;
        width: 200px;
        float: left;
            color: var(--text);
    background: var(--bg2);
        }
        
        #sketchForm input[type="file"] {
          margin-bottom: 10px;
        }

        #selectedPreview {
          margin: 10px 0;
          text-align: center;
        }

#fileInput{
width: 180px;
}

        #pen_color,
        #bg_color {
          margin-bottom: 10px;
          width: 100px;
          height: 30px;
          border: none;
          cursor: pointer;
        }

        #pen_width {
          width: 60px;
          padding: 4px;
          margin-bottom: 10px;
          font-size: 12pt;
          border-radius: 4px;
          border: 1px solid #ccc;
        }

      
        .thumbnails-container {
          flex: 1;
          overflow-y: auto;       
          padding: 10px;
          box-shadow: 0 0 12px rgba(0, 0, 0, 0.2);
        }

        .thumbnail-row {
          display: flex;
          gap: 12px;
          margin-bottom: 15px;
          position: relative;
        }
button{
    color: var(--text);
    background: var(--bg2);
}
        .thumb-block {
          position: relative;
          background: #f0f0f0;
          padding: 6px;
          border-radius: 6px;
          border: 1px solid #ccc;
          user-select: none;
          cursor: default;
          width: 140px;
          text-align: center;
        }

        .thumb-block:hover {
          box-shadow: 0 0 12px #999;
          border-color: #999;
          cursor: pointer;
        }

        .thumb-flag {
          position: absolute;
          top: 4px;
          left: 4px;
          font-size: 18px;
        }

        .thumb-label {
          margin-top: 4px;
          font-size: 11pt;
          font-weight: bold;
          color: #333;
          overflow-wrap: break-word;
          white-space: normal;
        }

        .delete-icon {
          position: absolute;
          top: 4px;
          right: 4px;
          font-size: 18px;
          color: red;
          cursor: pointer;
        }
      `}</style>
        </>
    );
};
export default SketchCubo;