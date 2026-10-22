<style>
  .playlist {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
        }
        .video-card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            padding: 10px;
            width: 300px;
        }
        iframe {
            width: 100%;
            height: 180px;
            border: none;
        }
    </style>
</head>
<body>
    <h1>English Classical Music Playlist</h1>
    <div id="playlist" class="playlist"></div>

    <script>
        const apiKey = 'YOUR_YOUTUBE_API_KEY'; // Replace with your API key
        const searchQuery = 'English Classical Music';
        const maxResults = 10; // Number of videos to fetch

        async function fetchPlaylist() {
            const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(searchQuery)}&type=video&key=${apiKey}`);
            const data = await response.json();
            displayVideos(data.items);
        }

        function displayVideos(videos) {
            const playlistDiv = document.getElementById('playlist');
            videos.forEach(video => {
                const videoCard = document.createElement('div');
                videoCard.className = 'video-card';
                videoCard.innerHTML = `
                    <h2>${video.snippet.title}</h2>
                    <iframe src="https://www.youtube.com/embed/${video.id.videoId}" allowfullscreen></iframe>
                    <p>${video.snippet.description}</p>
                `;
                playlistDiv.appendChild(videoCard);
            });
        }
        fetchPlaylist();
    </script>