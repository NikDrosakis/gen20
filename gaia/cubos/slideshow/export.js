(function() {

s.db.get({file:G.SITE_ROOT+'widgets/slideshow/get_slides.php'}, function(data) {
        const slidesData = data;

        // Create the HTML structure
        const container = document.createElement('div');
        container.className = 'slideshow-container';
        document.body.appendChild(container);

        slidesData.forEach((slide, index) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'mySlides fade';
            slideDiv.innerHTML = `
                <div class="numbertext">${index + 1} / ${slidesData.length}</div>
                <img src="/media/slideshow/${slide.filename}" style="width:100%">
                <div class="text">${slide.caption}</div>
            `;
            container.appendChild(slideDiv);
        });

        const prev = document.createElement('a');
        prev.className = 'prev';
        prev.innerHTML = '❮';
        prev.onclick = function () {
            plusSlides(-1);
        };
        container.appendChild(prev);

        const next = document.createElement('a');
        next.className = 'next';
        next.innerHTML = '❯';
        next.onclick = function () {
            plusSlides(1);
        };
        container.appendChild(next);

        const dotContainer = document.createElement('div');
        dotContainer.style.textAlign = 'center';
        document.body.appendChild(dotContainer);

        slidesData.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.className = 'dot';
            dot.onclick = function () {
                currentSlide(index + 1);
            };
            dotContainer.appendChild(dot);
        });
        // Add CSS styles
        const style = document.createElement('style');
        style.innerHTML = `
        * {box-sizing: border-box}
        body {font-family: Verdana, sans-serif; margin:0}
        .mySlides {display: none}
        img {vertical-align: middle;}
        .slideshow-container {
            max-width: 1000px;
            position: relative;
            margin: auto;
        }
        .prev, .next {
            cursor: pointer;
            position: absolute;
            top: 50%;
            width: auto;
            padding: 16px;
            margin-top: -22px;
            color: white;
            font-weight: bold;
            font-size: 18px;
            transition: 0.6s ease;
            border-radius: 0 3px 3px 0;
            user-select: none;
        }
        .next { right: 0; border-radius: 3px 0 0 3px; }
        .prev:hover, .next:hover { background-color: rgba(0,0,0,0.8); }
.text {
    color: #f2f2f2; /* White text */
    font-size: 1.4vw;
    padding: 10px 20px;
    position: absolute;
    bottom: 20px;
    width: calc(100% - 40px); /* Adjust width to fit within padding */
    text-align: center;
    font-family: system-ui;
    font-style: italic;
    background-color: rgba(0, 0, 0, 0.6); /* Semi-transparent black background */
    border-radius: 10px; /* Rounded corners */
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.3); /* Subtle shadow for better contrast */
    margin: 0 auto; /* Center the caption */
}
        .numbertext {
            color: #f2f2f2;
            font-size: 12px;
            padding: 8px 12px;
            position: absolute;
            top: 0;
        }
        .dot {
            cursor: pointer;
    height: 16px;
    width: 16px;
    margin: 4px 3px;
            background-color: #bbb;
            border-radius: 50%;
            display: inline-block;
            transition: background-color 0.6s ease;
        }
        .active, .dot:hover { background-color: #717171; }
        .fade {
            animation-name: fade;
            animation-duration: 1.5s;
        }
        @keyframes fade {
            from {opacity: .4} to {opacity: 1}
        }
        @media only screen and (max-width: 300px) {
            .prev, .next,.text {font-size: 16px}
        }
    `;
        document.head.appendChild(style);

        // Add JavaScript functionality
        let slideIndex = 1;
        showSlides(slideIndex);

        function plusSlides(n) {
            showSlides(slideIndex += n);
        }

        function currentSlide(n) {
            showSlides(slideIndex = n);
        }

        function showSlides(n) {
            let i;
            let slides = document.getElementsByClassName("mySlides");
            let dots = document.getElementsByClassName("dot");
            if (n > slides.length) {
                slideIndex = 1
            }
            if (n < 1) {
                slideIndex = slides.length
            }
            for (i = 0; i < slides.length; i++) {
                slides[i].style.display = "none";
            }
            for (i = 0; i < dots.length; i++) {
                dots[i].className = dots[i].className.replace(" active", "");
            }
            slides[slideIndex - 1].style.display = "block";
            dots[slideIndex - 1].className += " active";
        }
        setInterval(() => {
            plusSlides(1);
        }, 10000);
    },'json');
})();
