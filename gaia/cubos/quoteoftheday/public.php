<style>
      /* Main Container */
            .quote-container {
                background: #ffffff;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                text-align: center;
                position: relative;
            }

            .quote {
                font-size: 1.2em;
                line-height: 1.4;
                color: #555;
                margin-bottom: 1em;
            }

            .author {
                font-size: 1em;
                font-style: italic;
                color: #777;
            }

            .quote-btn {
                margin-top: 15px;
                padding: 8px 16px;
                font-size: 0.9em;
                color: #fff;
                background-color: #007BFF;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                transition: background-color 0.3s ease;
            }

            .quote-btn:hover {
                background-color: #0056b3;
            }

            /* Reveal Text */
            .more-quote {
                display: none;
                margin-top: 15px;
                font-size: 0.95em;
                line-height: 1.5;
                color: #333;
                text-align: justify;
            }

            /* Responsive adjustments */
            @media (max-width: 600px) {
                .quote {
                    font-size: 1.1em;
                }

                .quote-btn {
                    padding: 6px 12px;
                    font-size: 0.85em;
                }
            }
        </style>

    <div class="quote-container">
        <p class="quote">"To be, or not to be, that is the question."</p>
        <p class="author">— William Shakespeare</p>
        <button class="quote-btn" onclick="toggleQuote()">Reveal More</button>
        <div class="more-quote" id="moreQuote">
            <p>This famous quote from *Hamlet* encapsulates the existential dilemma and the profound exploration of human existence. Shakespeare's words continue to inspire and resonate centuries later.</p>
        </div>
    </div>

    <script>
        // Toggle hidden quote paragraph
        function toggleQuote() {
            var moreQuote = document.getElementById("moreQuote");
            if (moreQuote.style.display === "none" || moreQuote.style.display === "") {
                moreQuote.style.display = "block";
            } else {
                moreQuote.style.display = "none";
            }
        }
    </script>
