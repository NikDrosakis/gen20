<style>
    .audio-player-cubo {
        width: 100%;
        padding: 20px;
        border-radius: 8px;
        background-color: #f5f5f5;
        text-align: center;
    }

    .player-header h3 {
        margin: 0;
        font-size: 1.2rem;
    }

    .controls {
        margin: 10px 0;
        display: flex;
        justify-content: center;
        gap: 10px;
    }

    button {
        font-size: 1.5rem;
        border: none;
        background: none;
        cursor: pointer;
    }

    .progress-container {
        position: relative;
        width: 100%;
        height: 5px;
        background-color: #ddd;
        border-radius: 5px;
        overflow: hidden;
        margin: 15px 0;
    }

    .progress-bar {
        height: 100%;
        width: 0;
        background-color: #4caf50;
    }

    .playlist ul {
        list-style-type: none;
        padding: 0;
        margin-top: 10px;
    }

    .playlist li {
        cursor: pointer;
        padding: 5px 0;
        color: #333;
    }
    
    .playlist li:hover {
        color: #4caf50;
    }
</style>

<?php
// Replace with your Spotify API credentials
$clientId = 'caac2219a35a466c8aa59c4420d627f1';
$clientSecret = '79cc4a7faddd4fec9379952c6e1325fb';

if(!function_exists('getSpotifyAccessToken')){
function getSpotifyAccessToken($clientId, $clientSecret) {
    $url = 'https://accounts.spotify.com/api/token';
    $headers = [
        'Authorization: Basic ' . base64_encode("$clientId:$clientSecret"),
        'Content-Type: application/x-www-form-urlencoded'
    ];
    $data = ['grant_type' => 'client_credentials'];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true)['access_token'];
}
}

$searchSpotifySong = function($songName, $clientId, $clientSecret) {
    $token = getSpotifyAccessToken($clientId, $clientSecret);
    $url = 'https://api.spotify.com/v1/search?q=' . urlencode($songName) . '&type=track';

    $headers = [
        "Authorization: Bearer $token"
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
};

// Array of songs to search
$songs = [
    "Shape of You",
    "Blinding Lights",
    "Dance Monkey",
    "Someone You Loved",
    "Rockstar",
];
$songLinks = [];
// Loop through each song and get the Spotify link
foreach ($songs as $song) {
    $songData = $searchSpotifySong($song, $clientId, $clientSecret);
    // Check if tracks are returned
    if (!empty($songData['tracks']['items'])) {
        // Get the first track's link
        $songLink = $songData['tracks']['items'][0]['external_urls']['spotify'];
        $songLinks[$song] = $songLink;
    } else {
        $songLinks[$song] = 'Not found';
    }
}


// Output the results
//foreach ($songLinks as $song => $link) {
  //  echo "Song: $song - Link: $link<br>";
//}
?>

<div class="audio-player-cubo">
    <div class="player-header">
        <h3 id="songTitle">Select a Song</h3>
    </div>

    <audio id="audio" controls></audio>

    <div class="controls">
        <button onclick="prevSong()">&#10094;</button>
        <button onclick="togglePlayPause()" id="playPauseBtn">▶️</button>
        <button onclick="nextSong()">&#10095;</button>
    </div>

    <div class="progress-container">
        <div id="progress" class="progress-bar"></div>
    </div>

    <div class="playlist">
        <ul id="songList">
            <?php foreach ($songLinks as $song => $link): ?>
                <li>
                    <a href="#" onclick="selectSong('<?php echo addslashes($song); ?>', '<?php echo $link; ?>'); return false;">
                        <?php echo htmlspecialchars($song); ?>
                    </a>
                </li>
            <?php endforeach; ?>
        </ul>
    </div>
</div>

<?php
$query = "Shape of You"; // Example query
$accessToken = "YOUR_ACCESS_TOKEN"; // Obtain this through Spotify's OAuth process

// Make a request to the Spotify API
$apiUrl = "https://api.spotify.com/v1/search?q=" . urlencode($query) . "&type=track";
$options = [
    "http" => [
        "header" => "Authorization: Bearer $accessToken",
    ],
];
$context = stream_context_create($options);
$response = file_get_contents($apiUrl, false, $context);
$tracks = json_decode($response, true);

// Display the results
if (isset($tracks['tracks']['items']) && count($tracks['tracks']['items']) > 0) {
    foreach ($tracks['tracks']['items'] as $track) {
        $title = htmlspecialchars($track['name']);
        $artist = htmlspecialchars($track['artists'][0]['name']);
        $previewUrl = htmlspecialchars($track['preview_url']);
        $spotifyUrl = htmlspecialchars($track['external_urls']['spotify']);

        echo "Song: $title - Artist: $artist<br>";
        echo "<audio controls><source src='$previewUrl' type='audio/mpeg'>Your browser does not support the audio element.</audio><br>";
        echo "<a href='$spotifyUrl' target='_blank'>Listen on Spotify</a><br><br>";
    }
} else {
    echo "No tracks found.";
}


?>

<script>
    const audio = document.getElementById('audio');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const songTitle = document.getElementById('songTitle');
    const progress = document.getElementById('progress');

    // Playlist array to hold song data
    const playlist = [
        <?php foreach ($songLinks as $song => $link): ?>
            { title: '<?php echo addslashes($song); ?>', src: '<?php echo $link; ?>' },
        <?php endforeach; ?>
    ];

    let currentSongIndex = 0;

    function loadSong(title) {
        const selectedSong = playlist.find(song => song.title === title);
        if (selectedSong) {
            audio.src = selectedSong.src; // Set audio source
            songTitle.innerText = selectedSong.title; // Update song title in player
            audio.load(); // Load the new audio source
        }
    }

    function togglePlayPause() {
        if (audio.paused) {
            audio.play();
            playPauseBtn.innerText = "⏸️";
        } else {
            audio.pause();
            playPauseBtn.innerText = "▶️";
        }
    }

    function nextSong() {
        currentSongIndex = (currentSongIndex + 1) % playlist.length;
        loadSong(playlist[currentSongIndex].title);
        audio.play();
        playPauseBtn.innerText = "⏸️";
    }

    function prevSong() {
        currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
        loadSong(playlist[currentSongIndex].title);
        audio.play();
        playPauseBtn.innerText = "⏸️";
    }

    function selectSong(title, src) {
        loadSong(title); // Load the selected song
        audio.src = src; // Set the audio source directly from the link
        audio.play(); // Play the song
        playPauseBtn.innerText = "⏸️"; // Change button text to pause
    }

    // Update progress bar
    audio.addEventListener('timeupdate', () => {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progress.style.width = `${progressPercent}%`;
    });
</script>
