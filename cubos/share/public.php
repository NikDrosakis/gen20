<style>
    .cubo-share-container {
        text-align: center;
        background: #f9f9f9;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }

    .platform-buttons {
        display: flex;
        justify-content: space-around;
        margin-top: 20px;
    }

    .share-btn {
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        color: #fff;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .share-btn.facebook { background-color: #3b5998; }
    .share-btn.twitter { background-color: #1da1f2; }
    .share-btn.instagram { background-color: #e4405f; }
    .share-btn.tiktok { background-color: #010101; }

    .share-btn i {
        font-size: 20px;
    }

    .share-status {
        margin-top: 20px;
        font-size: 14px;
        color: #333;
    }

</style>
<div class="cubo-share-container">
    <h2>Share this Content</h2>
    <div class="platform-buttons">
        <button class="share-btn facebook" onclick="shareContent('facebook')">
            <i class="fab fa-facebook-f"></i> Facebook
        </button>
        <button class="share-btn twitter" onclick="shareContent('twitter')">
            <i class="fab fa-twitter"></i> Twitter
        </button>
        <button class="share-btn instagram" onclick="shareContent('instagram')">
            <i class="fab fa-instagram"></i> Instagram
        </button>
        <button class="share-btn tiktok" onclick="shareContent('tiktok')">
            <i class="fab fa-tiktok"></i> TikTok
        </button>
    </div>
    <div id="share-status" class="share-status"></div>
</div>

<script>
    function shareContent(platform) {
        document.getElementById('share-status').innerText = `Sharing to ${platform}...`;

        // Make an AJAX request to the server (using Fetch API)
        fetch(`/api/share?platform=${platform}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: {
                    message: "Check out this amazing content!",
                    link: "https://example.com",
                    image_url: "https://example.com/image.jpg",
                    video_url: "https://example.com/video.mp4"
                }
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('share-status').innerText = `Successfully shared to ${platform}!`;
            } else {
                document.getElementById('share-status').innerText = `Failed to share to ${platform}: ${data.error}`;
            }
        })
        .catch(error => {
            document.getElementById('share-status').innerText = `Error sharing to ${platform}: ${error.message}`;
        });
    }

</script>