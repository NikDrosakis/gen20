import React, { useRef, useState, forwardRef, useEffect, useImperativeHandle } from "react";

const VideoPlayer = forwardRef(({ currentVideo, currentPoster }, ref) => {
    const videoRef = useRef(null);

    // Forward internal videoRef to parent ref
    useImperativeHandle(ref, () => videoRef.current);

    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
            setPlaying(true);
        } else {
            videoRef.current.pause();
            setPlaying(false);
        }
    };

    const onTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const onLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const changeSeek = (e) => {
        if (!videoRef.current) return;
        const time = parseFloat(e.target.value);
        videoRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const changeVolume = (e) => {
        if (!videoRef.current) return;
        const vol = parseFloat(e.target.value);
        videoRef.current.volume = vol;
        setVolume(vol);
        setMuted(vol === 0);
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !videoRef.current.muted;
        setMuted(videoRef.current.muted);
        setVolume(videoRef.current.muted ? 0 : videoRef.current.volume);
    };

    const changePlaybackRate = (e) => {
        if (!videoRef.current) return;
        const rate = parseFloat(e.target.value);
        videoRef.current.playbackRate = rate;
        setPlaybackRate(rate);
    };

    const downloadVideo = () => {
        if (!currentVideo) return;
        const link = document.createElement("a");
        link.href = currentVideo;
        link.download = currentVideo.split("/").pop() || "video.mp4";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
            if (videoRef.current) {
                // Autoplay
                videoRef.current.play().catch(() => {});
                setPlaying(true);

                // Sync state με το video element
                setVolume(videoRef.current.volume);
                setMuted(videoRef.current.muted);
                setCurrentTime(videoRef.current.currentTime);
                setDuration(videoRef.current.duration || 0);
                setPlaybackRate(videoRef.current.playbackRate || 1);
            }
    }, [currentVideo]);

    return (
        <>
            <div className="video-container">
                <div style={{width: '100%', height: '520px', overflow: 'hidden'}}>
                    <video
                        style={{width: '100%', height: '100%', objectFit: 'cover'}}
                        id="main-video"
                        className="custom-video"
                        ref={videoRef}
                        poster={currentPoster}
                        onTimeUpdate={onTimeUpdate}
                        onLoadedMetadata={onLoadedMetadata}
                        src={currentVideo}
                        loop
                        controls
                        playsInline
                        autoPlay
                    >
                        <source src={currentVideo} type="video/mp4"/>
                        Your browser does not support the video tag.
                    </video>
                </div>
                <div className="video-controls">
                    <button onClick={togglePlay}>{playing ? "⏸️" : "▶️"}</button>
                    <span>{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        value={currentTime}
                        min={0}
                        max={duration || 0}
                        step={0.1}
                        onChange={changeSeek}
                    />
                    <span>{formatTime(duration)}</span>
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={volume}
                        onChange={changeVolume}
                    />
                    <button onClick={toggleMute}>{muted ? "🔇" : "🔊"}</button>
                    <select value={playbackRate} onChange={changePlaybackRate}>
                        <option value={0.5}>0.5x</option>
                        <option value={1}>1x</option>
                        <option value={1.5}>1.5x</option>
                        <option value={2}>2x</option>
                    </select>
                    <button onClick={() => videoRef.current?.requestFullscreen()}>⛶</button>

                    <div className="share-buttons" style={{marginLeft: 'auto', display: 'flex', gap: '8px'}}>
                        <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.origin}${currentVideo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Share on Facebook"
                        >📘</a>
                        <a
                            href={`https://twitter.com/intent/tweet?url=${window.location.origin}${currentVideo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Share on Twitter"
                        >🐦</a>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}${currentVideo}`);
                                alert("📋 Link copied!");
                            }}
                            title="Copy link"
                        >📋
                        </button>
                        <button
                            onClick={() => {
                                alert("To share on TikTok or Instagram, download the video and upload it via the app.");
                            }}
                            title="TikTok / Instagram"
                        >🎥
                        </button>
                        <button onClick={downloadVideo} title="Download">⬇️</button>
                    </div>


                </div>
            </div>

            <style>{`
            .share-buttons a {
  transition: transform 0.2s;
}

.share-buttons a:hover {
  transform: scale(1.2);
}
        .video-container {
          flex: 3;
          padding: 10px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          box-shadow: 0 0 12px rgba(0, 0, 0, 0.2);
        }

        .custom-video {
          width: 100%;
          height: auto;
          max-height: 70vh;
          border-radius: 10px;          
          margin-bottom: 10px;
          box-shadow: 0 0 12px rgb(179 168 168);
        }

        .video-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          user-select: none;
        }

        .video-controls button,
        .video-controls select,
        .video-controls input[type="range"] {
          cursor: pointer;
        }

        input[type="range"] {
          flex-grow: 1;
          margin: 0 10px;
        }

        input[type="range"]:last-of-type {
          width: 80px;
          flex-grow: 0;
          margin: 0 0 0 10px;
        }
      `}</style>
        </>
    );
});
export default VideoPlayer;