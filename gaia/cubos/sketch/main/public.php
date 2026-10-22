<?php
/*$videoWebPath = $this->SITE_URL . 'media/sketch_video/';
$videoLocalPath = $this->MEDIA_ROOT . 'sketch_video';
$imgWebPath = $this->SITE_URL . 'media/sketch_img/';
$imgLocalPath = $this->MEDIA_ROOT . 'sketch_img';

// Scan both directories
$videoFiles = scandir($videoLocalPath);
$imageFiles = scandir($imgLocalPath);

// Filter video files
$videoFiles = array_filter($videoFiles, fn($file) => preg_match('/\.mp4$/i', $file));

// Filter image files
$imageFiles = array_filter($imageFiles, fn($file) => preg_match('/\.(jpg|jpeg|png|gif)$/i', $file));

// Create an associative array: [baseName => [type => video|image, src => url]]
$thumbnails = [];

// Add videos
foreach ($videoFiles as $file) {
    $baseName = pathinfo($file, PATHINFO_FILENAME);
    $thumbnails[$baseName]['video'] = $videoWebPath . $file;
}

// Add images
foreach ($imageFiles as $file) {
    $baseName = pathinfo($file, PATHINFO_FILENAME);
    $thumbnails[$baseName]['image'] = $imgWebPath . $file;
}*/
$thumbnails = $this->getSketchThumbnails();
?>

<style>
    /* Ensure viewport scaling */
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

      .button, .slider, .toggle {
        width: 100%;
        font-size: 1.1rem;
      }

      .container, .video-wrapper {
        padding: 1rem;
        width: 100%;
        box-sizing: border-box;
      }
    }
input[type=file]{
width: 167px;
}
#volume{
width: 150px;
}
.thumb-img {
    width: 190px;
    object-fit: cover;
    border-radius: 4px;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
}
.thumb-flag {
    position: absolute;
    top: 4px;
    right: 6px;
    background: rgba(0,0,0,0.6);
    color: #fff;
    font-size: 14px;
    padding: 2px 6px;
    border-radius: 3px;
}
.thumb-block {
    position: relative;
    display: inline-block;
    margin: 6px;
    width: 140px;
    text-align: center;
}

.thumb-img, video {
    width: 100%;
    border-radius: 4px;
    box-shadow: 0 0 3px rgba(0,0,0,0.3);
}

.thumb-label {
    color: #ccc;
    font-size: 13px;
    margin-top: 4px;
    height: 40px;
    word-wrap: break-word;
    overflow-wrap: break-word;
}
#sketchForm{
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    background-color: #f9f9f9;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    margin: 20px auto;
    width: 200px;
    float: left;
}
    .custom-video {
      width: 100%;
      max-width: 70vw;
      display: block;
    }

    .video-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #111;
      padding: 10px;
      width: 100%;
      max-width: 70vw;
      color: white;
      font-family: sans-serif;
      font-size: 14px;
    }

    .video-controls button,
    .video-controls select {
      background: #222;
      color: white;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
    }

    .video-controls input[type=range] {
      accent-color: red;
      cursor: pointer;
    }

.video-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
                  height: 80%;
    box-sizing: border-box;
}

.video-wrapper {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
}

video {
    width: 100%;
    height: 80%;
    object-fit: contain;
}
.selected-thumb {
    border: 2px solid red;
    box-sizing: border-box;
}
</style>
<!-- Credit Section -->
<div style="position: fixed; bottom: 10px; left: 10px; font-size: 18px; color: white; background-color: rgba(0, 0, 0, 0.5); padding: 5px 10px; border-radius: 5px;">
  Special Credit: idea, inspiration, designs by Giorgos Kolios
</div>

<form id="sketchForm">
  <input type="file" name="file" accept="image/*">
  <div id="selectedPreview" style="margin: 10px 0; text-align: center;"></div>
  <input type="hidden" name="selected_image" id="selected_image">
<label for="pen_color">Pen Color:</label>
<input type="color" name="pen_color" id="pen_color" value="#000000"><br>

<label for="bg_color">Background Color:</label>
<input type="color" name="bg_color" id="bg_color" value="#ffffff"><br>

<label for="pen_width">Pen Width (px):</label>
<input type="number" name="pen_width" id="pen_width" value="2" min="1" max="20"><br>

<div id="loader" style="display:none; text-align:center; margin-top: 10px;">
  <img src="https://i.gifer.com/ZZ5H.gif" alt="Loading..." style="width: 50px; height: 50px;">
</div>
  <button type="submit">Upload Sketch</button>
</form>
<!-- Main container -->
<div style="display: flex; flex-direction: row; height: 100vh;">


<!-- Video player -->
<div class="video-container">
  <video id="main-video" class="custom-video">
    <source id="video-source" src="<?php echo $videoWebPath . $defaultVideo; ?>" type="video/mp4">
    Your browser does not support the video tag.
  </video>

  <div class="video-controls" id="video-controls">
    <button id="playpause">▶️</button>
    <span id="currentTime">0:00</span>
    <input type="range" id="seek" value="0" min="0" max="100" step="0.1">
    <span id="duration">0:00</span>
    <input type="range" id="volume" min="0" max="1" step="0.01" value="1">
    <button id="mute">🔊</button>
    <select id="playbackRate">
      <option value="0.5">0.5x</option>
      <option value="1" selected>1x</option>
      <option value="1.5">1.5x</option>
      <option value="2">2x</option>
    </select>
    <button id="fullscreen">⛶</button>
    <button onclick="downloadVideo()">⬇️</button>
  </div>
</div>


<div class="thumbnails-container">
    <?php foreach ($thumbnails as $name => $types): ?>
        <div class="thumbnail-row">
            <?php if (!empty($types['image'])):
                $imageExt = pathinfo($types['image'], PATHINFO_EXTENSION);
            ?>
                <div class="thumb-block">
                    <div class="thumb-flag">🖼️</div>
                    <img class="thumb-img" src="<?= $types['image'] ?>" alt="Image for <?= htmlspecialchars($name) ?>">
                    <div class="thumb-label"><?= htmlspecialchars($name) ?>.<?= $imageExt ?></div>
                </div>
            <?php endif; ?>

            <?php if (!empty($types['video'])):
                $videoExt = pathinfo($types['video'], PATHINFO_EXTENSION);
            ?>
                <div class="thumb-block" onclick="changeVideo('<?= $types['video'] ?>')">
                    <div class="thumb-flag">🎞️</div>
                    <video width="120" muted poster="<?= $types['image'] ?>">
                        <source src="<?= $types['video'] ?>" type="video/mp4">
                    </video>
                    <div class="thumb-label">
                        <?= htmlspecialchars($name) ?>.<?= $videoExt ?>
                          <span class="delete-icon" style="top: 4px; right: 4px; cursor: pointer; font-size: 18px; color: red;">🗑️</span>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    <?php endforeach; ?>
</div>



</div>




<script>
function changeVideo(videoSrc) {
        const video = document.getElementById('main-video');
        const source = document.getElementById('video-source');
        source.src = videoSrc;
        video.load();
        video.play();
    }
function downloadVideo() {
  const video = document.getElementById('main-video');
  const source = video.querySelector('source');
  const videoSrc = source.src;

  // Extract the actual filename from the URL
  const filename = videoSrc.substring(videoSrc.lastIndexOf('/') + 1);

  const link = document.createElement('a');
  link.href = videoSrc;
  link.download = filename; // Use the same filename
  document.body.appendChild(link); // Required for Firefox
  link.click();
  document.body.removeChild(link);
}
const video = document.getElementById('main-video');
const playpause = document.getElementById('playpause');
const mute = document.getElementById('mute');
const volume = document.getElementById('volume');
const seek = document.getElementById('seek');
const currentTime = document.getElementById('currentTime');
const duration = document.getElementById('duration');
const playbackRate = document.getElementById('playbackRate');
const fullscreen = document.getElementById('fullscreen');

function formatTime(time) {
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

playpause.onclick = () => {
  if (video.paused) {
    video.play();
    playpause.textContent = '⏸️';
  } else {
    video.pause();
    playpause.textContent = '▶️';
  }
};

mute.onclick = () => {
  video.muted = !video.muted;
  mute.textContent = video.muted ? '🔇' : '🔊';
};

volume.oninput = () => {
  video.volume = volume.value;
};

video.ontimeupdate = () => {
  seek.value = (video.currentTime / video.duration) * 100;
  currentTime.textContent = formatTime(video.currentTime);
};

seek.oninput = () => {
  video.currentTime = (seek.value / 100) * video.duration;
};

video.onloadedmetadata = () => {
  duration.textContent = formatTime(video.duration);
};

playbackRate.onchange = () => {
  video.playbackRate = parseFloat(playbackRate.value);
};

fullscreen.onclick = () => {
  if (video.requestFullscreen) {
    video.requestFullscreen();
  } else if (video.webkitRequestFullscreen) {
    video.webkitRequestFullscreen();
  } else if (video.msRequestFullscreen) {
    video.msRequestFullscreen();
  }
};


document.querySelectorAll('.thumb-block img.thumb-img').forEach(img => {
  img.addEventListener('click', () => {
    // Remove previous selection styles
    document.querySelectorAll('.thumb-block').forEach(block => block.classList.remove('selected-thumb'));
    img.closest('.thumb-block').classList.add('selected-thumb');

    // Store the image path in hidden input
    const selectedPath = img.getAttribute('src');
    document.getElementById('selected_image').value = selectedPath;

    // Show the preview above the form
    const previewContainer = document.getElementById('selectedPreview');
    previewContainer.innerHTML = `
      <div style="display: inline-block; border: 2px dashed #ccc; padding: 6px; max-width: 200px;">
        <img src="${selectedPath}" alt="Selected Preview" style="max-width: 100%; height: auto;">
        <div style="font-size: 12px; color: #777;">Selected from library</div>
      </div>
    `;
  });
});

// Add delete functionality to all delete icons
document.querySelectorAll('.delete-icon').forEach(icon => {
  icon.addEventListener('click', async (e) => {
    e.stopPropagation(); // Prevent image selection

    const block = icon.closest('.thumb-block');
    const img = block.querySelector('img.thumb-img');
    const path = img.getAttribute('src');

    // Optional: Confirm before deletion
    if (!confirm('Delete this image?')) return;

    // Send delete request
    try {
      const res = await fetch('/delete-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server error: ${res.status} - ${errText}`);
      }

      // Remove the thumb from DOM
      block.remove();

      // Optional: Clear preview if it was the selected image
      const selectedPath = document.getElementById('selected_image').value;
      if (selectedPath === path) {
        document.getElementById('selected_image').value = '';
        document.getElementById('selectedPreview').innerHTML = '';
      }

    } catch (err) {
      console.error('Failed to delete image:', err);
      alert('Could not delete image. Check console.');
    }
  });
});



document.getElementById('sketchForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const loader = document.getElementById('loader');
  loader.style.display = 'block';

  const form = e.target;
  const formData = new FormData();

  const fileInput = form.querySelector('input[name="file"]');
  const selectedImage = form.querySelector('input[name="selected_image"]').value;
  const penColor = form.querySelector('input[name="pen_color"]').value;
  const bgColor = form.querySelector('input[name="bg_color"]').value;
  const penWidth = form.querySelector('input[name="pen_width"]').value;

  if (fileInput.files.length > 0) {
    formData.append('file', fileInput.files[0]);
  } else if (selectedImage) {
    formData.append('selected_image', selectedImage);
  } else {
    alert('Please upload or select an image.');
    loader.style.display = 'none';
    return;
  }

  formData.append('pen_color', penColor);
  formData.append('bg_color', bgColor);
  formData.append('pen_width', penWidth);

  try {
    const response = await fetch('https://vivalibro.com/apy/v1/sketch/image', {
      method: 'POST',
      body: formData,
    });
console.log(formData); //ERROR formData is empty
    const result = await response.json();
console.log(result)
    if (!response.ok || result.status !== 'success') {
      alert(result.message || 'Upload failed.');
    } else {
      alert('Sketch uploaded successfully.');
      // Optionally reset form or preview
    }
  } catch (err) {
    alert('Server error: ' + err.message);
  } finally {
    loader.style.display = 'none';
  }
});

</script>
