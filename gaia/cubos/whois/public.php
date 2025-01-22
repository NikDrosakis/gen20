<style>
  .cubo img {
            width: 100%;
            height: auto;
        }

        .cubo .info {
            padding: 1em;
        }

        .cubo h1 {
            font-size: 1.5em;
            margin-bottom: 0.5em;
        }

        .cubo p {
            font-size: 1em;
            line-height: 1.5;
            color: #555;
        }

        /* Trigger Button */
        .trigger-btn {
            display: inline-block;
            padding: 0.5em 1em;
            margin-top: 1em;
            border: none;
            background-color: #4CAF50;
            color: #fff;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }

        .trigger-btn:hover {
            background-color: #45a049;
        }

        /* Hidden Text Styling */
        .more-text {
            display: none;
            margin-top: 1em;
            text-align: justify;
        }

        /* Responsive Design */
        @media (max-width: 600px) {
            .cubo h1 {
                font-size: 1.2em;
            }

            .trigger-btn {
                padding: 0.4em 0.8em;
            }
        }
    </style>


<div class="cubo">
    <img src="https://cdn-test.poetryfoundation.org/cdn-cgi/image/w=2292,q=80/content/images/653f5eeafab7a9895af1eca68e97459c831812c6.jpeg" alt="William Shakespeare">
    <div class="info">
        <h3>William Shakespeare</h3>
        <p><strong>1564-1616</strong></p>
        <button class="trigger-btn" onclick="toggleText()">Read More</button>
        <div class="more-text" id="moreText">
            <p>William Shakespeare was an English playwright, poet, and actor, widely regarded as one of the greatest writers in the English language. His works, including plays like *Hamlet*, *Othello*, and *Macbeth*, have had an unparalleled influence on English literature and drama.</p>
        </div>
    </div>
</div>

<script>
    // Toggle hidden text visibility
    function toggleText() {
        var moreText = document.getElementById("moreText");
        if (moreText.style.display === "none" || moreText.style.display === "") {
            moreText.style.display = "block";
        } else {
            moreText.style.display = "none";
        }
    }
</script>