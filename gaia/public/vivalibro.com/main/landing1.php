    <style>
    .hero {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 2rem;
    }
    .hero-image {
        max-width: 100%;
        height: auto;
        margin-top: 1.5rem;
    }
    .scroll-section, .library-section, .app-section {
        padding: 2rem;
    }
    .image-gallery {
        padding: 2rem;
    }
    .gallery-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
    }
    .gallery-grid img {
        width: 100%;
        height: auto;
        border-radius: 8px;
    }
    footer {
        padding: 1rem;
        text-align: center;
        background-color: #333;
        color: #fff;
    }

        /* Full page hero section */
        .hero {
            background-image: url('https://example.com/hero-library.jpg'); /* Replace with actual image */
            background-size: cover;
            background-position: center;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: white;
            position: relative;
        }

        .hero:before {
            content: "";
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: rgba(0, 0, 0, 0.6);
        }

        .hero h1 {
            font-size: 4rem;
            z-index: 1;
            margin: 0;
            font-family: 'Playfair Display', serif;
        }

        .hero p {
            z-index: 1;
            margin: 20px 0 40px;
            font-size: 1.5rem;
        }

        .hero .btn {
            background-color: #c4a484;
            padding: 15px 40px;
            text-transform: uppercase;
            color: white;
            text-decoration: none;
            font-size: 1.2rem;
            border-radius: 5px;
            transition: background-color 0.3s ease;
            z-index: 1;
        }

        .hero .btn:hover {
            background-color: #ab8b6c;
        }

        /* Scroll Section */
        section {
            padding: 100px 10%;
            text-align: center;
            position: relative;
        }

        section h2 {
            font-size: 3rem;
            font-family: 'Playfair Display', serif;
            color: #3a2e25;
            margin-bottom: 20px;
        }

        section p {
            max-width: 800px;
            margin: 0 auto;
            line-height: 1.8;
            font-size: 1.2rem;
        }

        section img {
            max-width: 100%;
            margin: 30px 0;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        .scroll-section {
            background-color: #fdfcf7;
        }

        .library-section {
            background-color: #ebded1;
        }

        /* Book cataloging app section */
        .app-section {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
        }

        .app-section img {
            width: 45%;
            border-radius: 20px;
        }

        .app-section .app-info {
            width: 50%;
            padding: 30px;
        }

        .app-section .app-info h3 {
            font-size: 2.5rem;
            font-family: 'Playfair Display', serif;
            margin-bottom: 20px;
        }

        .app-section .app-info p {
            font-size: 1.2rem;
            line-height: 1.6;
            color: #4d4035;
        }

        footer {
            background-color: #382c1e;
            color: #fff;
            padding: 20px 0;
            text-align: center;
            font-size: 0.9rem;
        }

        footer a {
            color: #c4a484;
            text-decoration: none;
        }

        /* Smooth scrolling */
        html {
            scroll-behavior: smooth;
        }

        /* Hover effect for image sections */
        section img:hover {
            transform: scale(1.05);
            transition: transform 0.4s ease-in-out;
        }

        /* Gaming retro highlight effect */
        .retro-highlight {
            color: #ffcc00;
            text-shadow: 2px 2px 0px #ff6a00, 4px 4px 0px #d50000;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            header {
                font-size: 2rem;
            }

            .hero h1 {
                font-size: 2.5rem;
            }

            .app-section {
                flex-direction: column;
                text-align: center;
            }

            .app-section img, .app-section .app-info {
                width: 100%;
            }

            section h2 {
                font-size: 2.2rem;
            }
        }
    </style>

    <style>
        body {
            margin: 0;
            font-family: 'Roboto', sans-serif;
            background-color: #faf1e6;
            color: #333;
        }

        /* Header Section */
        header {
            background-color: #3b2b2b;
            color: white;
            padding: 20px;
            text-align: center;
            font-family: 'Playfair Display', serif;
            font-size: 2.5rem;
            letter-spacing: 1px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            width: 100%;
            top: 0;
            z-index: 10;
        }

        /* First Screen (Bistro + Modern combo) */
        .hero {
            background-color: #e9e3d5;
            padding: 150px 20px 100px;
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }

        .hero h1 {
            font-family: 'Playfair Display', serif;
            font-size: 3.5rem;
            color: #382c1e;
            margin-bottom: 20px;
        }

        .hero p {
            max-width: 800px;
            font-size: 1.5rem;
            line-height: 1.8;
            margin-bottom: 40px;
            font-style: italic;
            color: #4a4033;
        }

        .hero .btn {
            background-color: #ab8b6c;
            padding: 15px 40px;
            font-size: 1.2rem;
            text-transform: uppercase;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            transition: background-color 0.3s ease;
        }

        .hero .btn:hover {
            background-color: #8b6a52;
        }

        /* Bistro-Modern Visual Elements */
        .hero::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 300px;
            background: url('https://example.com/bistro-pattern.png') repeat; /* Replace with retro pattern */
            opacity: 0.2;
            z-index: -1;
        }

        /* Subtle animations */
        .hero h1, .hero p, .hero .btn {
            animation: fadeInUp 1s ease forwards;
            opacity: 0;
        }

        .hero h1 {
            animation-delay: 0.2s;
        }

        .hero p {
            animation-delay: 0.5s;
        }

        .hero .btn {
            animation-delay: 0.8s;
        }

        @keyframes fadeInUp {
            0% {
                transform: translateY(30px);
                opacity: 0;
            }
            100% {
                transform: translateY(0);
                opacity: 1;
            }
        }

        /* Content sections */
        section {
            padding: 100px 10%;
            text-align: center;
        }

        section h2 {
            font-size: 2.5rem;
            font-family: 'Playfair Display', serif;
            color: #3a2e25;
            margin-bottom: 20px;
        }

        section p {
            max-width: 800px;
            margin: 0 auto;
            line-height: 1.8;
            font-size: 1.2rem;
            color: #4a4033;
        }

        section img {
            max-width: 100%;
            margin: 30px 0;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        footer {
            background-color: #3b2b2b;
            color: #fff;
            text-align: center;
            padding: 20px;
        }

        footer a {
            color: #c4a484;
            text-decoration: none;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            header {
                font-size: 2rem;
            }

            .hero h1 {
                font-size: 2.5rem;
            }

            .hero p {
                font-size: 1.2rem;
            }
        }
    </style>


    <!-- Header -->
    <header>
        Rediscover Your Hidden Wealth
    </header>

    <!-- Hero Section -->
    <section class="hero">
        <?php include "compos/searchbox.php";?>
		<h1>Rediscover the Hidden Wealth<br/>in Your Library</h1>
        <p>Our app helps you explore and catalog the neglected treasures in your home. Organize your personal library with ease and unveil the value within.</p>

        <a href="#" class="btn">Start Discovering</a>
    </section>

    <!-- Download app  -->
	 <?php include "compos/downloadapp.php";?>
    <!-- About the App Section -->
    <section>
        <h2>How It Works</h2>
        <p>Our app instantly recognizes your books through a fast scanning process, categorizing them effortlessly. Whether your library is large or small, you’ll have your entire collection organized in no time.</p>
        <img src="https://example.com/app-showcase.jpg" alt="App showcase">
    </section>

    <!-- Libraries Showcase -->
    <section style="background-color: #fdfcf7;">
        <h2>From Home Libraries to Grand Public Spaces</h2>
        <p>Our solution caters to all types of libraries. Whether you’re managing a grand collection or a private bookshelf, we help you organize, manage, and appreciate your books with ease.</p>
        <img src="https://example.com/library-inspiration.jpg" alt="Home and Public Libraries">
    </section>

    <!-- Call to Action Section -->
    <section>
        <h2>Ready to Unlock the Hidden Wealth in Your Home?</h2>
        <p>Download our app today and rediscover your collection’s potential.</p>
        <a href="#" class="btn">Download the App</a>
    </section>

    <!-- Footer -->
    <footer>
        &copy; 2024 Rediscover Your Hidden Wealth. All rights reserved. | <a href="#">Privacy Policy</a>
    </footer>
