<style>
 /* Main Container */
        .quote-container {
            background: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            text-align: center;
            position: relative;
        }

        .quote {
            font-size: 1.1em;
            line-height: 1.4;
            color: #555;
            margin-bottom: 1.5em;
        }

        .choices {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .choice-btn {
            padding: 8px 16px;
            font-size: 1em;
            color: #333;
            background-color: #f8f9fa;
            border: 1px solid #ddd;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }

        .choice-btn:hover {
            background-color: #e9ecef;
        }

        .result {
            margin-top: 15px;
            font-size: 0.9em;
            color: #007BFF;
            display: none;
        }

        /* Responsive adjustments */
        @media (max-width: 600px) {
            .quote {
                font-size: 1em;
            }

            .choice-btn {
                padding: 6px 12px;
                font-size: 0.9em;
            }
        }
    </style>

<div class="quote-container">
    <p class="quote">"The only thing we have to fear is fear itself."</p>
    <div class="choices">
        <button class="choice-btn" onclick="checkAnswer('Albert Einstein')">Albert Einstein</button>
        <button class="choice-btn" onclick="checkAnswer('Franklin D. Roosevelt')">Franklin D. Roosevelt</button>
        <button class="choice-btn" onclick="checkAnswer('Winston Churchill')">Winston Churchill</button>
        <button class="choice-btn" onclick="checkAnswer('Martin Luther King Jr.')">Martin Luther King Jr.</button>
    </div>
    <div class="result" id="result"></div>
</div>

<script>
    function checkAnswer(selectedAnswer) {
        const correctAnswer = "Franklin D. Roosevelt";
        const resultDiv = document.getElementById("result");

        if (selectedAnswer === correctAnswer) {
            resultDiv.innerText = "Correct! Franklin D. Roosevelt said this.";
            resultDiv.style.color = "#28a745";  // Green for correct
        } else {
            resultDiv.innerText = `Incorrect. The correct answer is Franklin D. Roosevelt.`;
            resultDiv.style.color = "#dc3545";  // Red for incorrect
        }

        resultDiv.style.display = "block";  // Show result
    }
</script>
