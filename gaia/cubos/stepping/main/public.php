<?php
// Load the number of cards from the configuration file
$config = json_decode(file_get_contents('cubo_config.json'), true);
$numCards = $config['num_cards'] ?? 5; // Default to 5 if not set
?>

    <style>
           .cubo-container {
                    position: relative;
                    overflow: hidden;
                }
                .cubo {
                    display: flex;
                    transition: transform 0.5s ease;
                    width: 100%; /* Ensures only one card width is shown */
                }
                .cubo-card {
                    min-width: 100%; /* Each card takes full container width */
                    padding: 20px;
                    text-align: center;
                    background-color: #fff;
                    border-radius: 8px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                }
                .cubo-card h3 {
                    margin-bottom: 10px;
                }
                .cubo-card p {
                    color: #666;
                }
                .nav-arrow {
                    position: absolute;
                    top: 50%;
                    width: 30px;
                    height: 30px;
                    background-color: #333;
                    color: #fff;
                    font-size: 24px;
                    text-align: center;
                    line-height: 30px;
                    cursor: pointer;
                    user-select: none;
                    border-radius: 50%;
                    transform: translateY(-50%);
                    z-index: 10;
                }
                .nav-arrow:hover {
                    background-color: #555;
                }
                .nav-left {
                    left: 10px;
                }
                .nav-right {
                    right: 10px;
                }
            </style>
        </head>
        <body>

        <div class="cubo-container">
            <div class="cubo" id="cubo">
                <?php for ($i = 1; $i <= $numCards; $i++): ?>
                    <div class="cubo-card">
                        <h3>Card <?= $i ?></h3>
                        <p>This is card number <?= $i ?>. Replace this content with your custom content for each step.</p>
                    </div>
                <?php endfor; ?>
            </div>
            <div class="nav-arrow nav-left" onclick="navigate(-1)">&#10094;</div>
            <div class="nav-arrow nav-right" onclick="navigate(1)">&#10095;</div>
        </div>

        <script>
            let currentIndex = 0;

            function navigate(direction) {
                const cubo = document.getElementById('cubo');
                const totalCards = document.querySelectorAll('.cubo-card').length;

                // Update the current index
                currentIndex = (currentIndex + direction + totalCards) % totalCards;

                // Move the cubo to show the current card
                cubo.style.transform = `translateX(-${currentIndex * 100}%)`;
            }
        </script>