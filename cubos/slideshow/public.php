    <style>
    * {box-sizing: border-box}
    body {font-family: Verdana, sans-serif; margin:0}
    .mySlides {display: none}
    img {vertical-align: middle;}
    /* Slideshow container */
    .slideshow-container {
        position: relative;
        margin: auto;
    }
    /* Next & previous buttons */
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
    /* Position the "next button" to the right */
    .next {
        right: 0;
        border-radius: 3px 0 0 3px;
    }
    /* On hover, add a black background color with a little bit see-through */
    .prev:hover, .next:hover {
        background-color: rgba(0,0,0,0.8);
    }
    /* Caption text */
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
    /* Number text (1/3 etc) */
    .numbertext {
        color: #f2f2f2;
        font-size: 12px;
        padding: 8px 12px;
        position: absolute;
        top: 0;
    }
    /* The dots/bullets/indicators */
    .dot {
        cursor: pointer;
        height: 8px;
        width: 8px;
        margin: 4px 3px;
        background-color: #bbb;
        border-radius: 50%;
        display: inline-block;
        transition: background-color 0.6s ease;
    }

    .active, .dot:hover {
        background-color: #717171;
    }
    /* Fading animation */
    .fade {
        animation-name: fade;
        animation-duration: 1.5s;
    }

    @keyframes fade {
        from {opacity: .4}
        to {opacity: 1}
    }

    @media only screen and (max-width: 300px) {
        .prev, .next,.text {font-size: 16px}
    }
</style>

<div class="slideshow-container">
    <?php
    // Fetch slides from the database
    //V0
    $slides = $this->db->fa("SELECT * FROM cubo_slideshow ORDER BY sort DESC");
    //xecho($slides);
    //this in the V1 SCHEMA taken from the endpoint /widget/slideshow/fetch_slides
    ?>
    <?php for($i=0;$i<count($slides);$i++){ ?>
    <div class="mySlides fade">
        <div class="numbertext"><?=$i+1?> / <?=count($slides)?></div>
        <img src="/media/<?=$slides[$i]['name']?>" style="width:100%">
        <div class="text"><?=$slides[$i]['caption']?></div>
    </div>
    <?php } ?>
    <a class="prev" onclick="plusSlides(-1)">❮</a>
    <a class="next" onclick="plusSlides(1)">❯</a>
</div>
<br>

<div style="text-align:center">
    <?php for($i=0;$i<count($slides);$i++){ ?>
    <span class="dot" onclick="currentSlide(<?=$i+1?>)"></span>
    <?php } ?>
</div>

<script>
    var slideIndex = 1;

    document.addEventListener('DOMContentLoaded', function () {
        showSlides(slideIndex);
    });


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
    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex-1].style.display = "block";
    dots[slideIndex-1].className += " active";
}
setInterval(() => {
    plusSlides(1);
}, 10000);
</script>