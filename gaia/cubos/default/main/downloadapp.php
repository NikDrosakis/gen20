<style>
    .download-app {
        text-align: center;
        padding: 20px;
        background-color: #f8f8f8; /* Light background */
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .download-app h3 {
        font-size: 1.8em;
        margin-bottom: 15px;
        color: #333;
    }

    .download-app p {
        font-size: 1.2em;
        margin-bottom: 20px;
    }

    .download-button {
        display: inline-block;
        padding: 12px 20px;
        background-color: #4285f4; /* Google blue */
        color: white;
        text-decoration: none;
        border-radius: 5px;
        transition: background-color 0.3s ease;
    }

    .download-button:hover {
        background-color: #357ae8; /* Darker blue on hover */
    }

    .qr-code {
        margin-top: 20px;
        width: 150px; 
        height: 150px;
    }

    @media (max-width: 600px) { /* Responsive styles */
        .download-app h3 {
            font-size: 1.5em;
        }

        .download-app p {
            font-size: 1em;
        }

        .qr-code {
            width: 120px;
            height: 120px;
        }
    }
</style>

<div class="download-app">
    <h3>Download Our App & Start Scanning!</h3>
    <p>Organize your library with ease. Our app helps you quickly catalog your books by scanning their ISBN barcodes.</p>
    <a href="https://play.google.com/store/apps/details?id=your.app.id" target="_blank" class="download-button">Download on Google Play</a>
    <img src="qr-code.png" alt="QR code for app download" class="qr-code"> </div>
	