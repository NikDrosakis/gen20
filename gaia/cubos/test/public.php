<style>
        /* Star container */
        .stars {
    display: flex;
    justify-content: center;
            align-items: center;
            direction: rtl; /* Right-to-left for better clicking experience */
        }

        /* Hide the radio inputs */
        .stars input {
    display: none;
}

        /* Style for each star label */
        .stars label {
    font-size: 2rem; /* Size of the stars */
            color: #ccc; /* Default star color */
            cursor: pointer;
            transition: color 0.2s;
        }

        /* Change the color of the stars when checked */
        .stars input:checked ~ label {
    color: #ffcc00; /* Star color when selected */
}

        /* Change color on hover, keeping selected stars active */
        .stars label:hover,
        .stars label:hover ~ label {
    color: #ffcc00; /* Hover color */
}

        /* Ensure checked stars stay highlighted when hovering over lower stars */
        .stars input:checked ~ label:hover,
        .stars input:checked ~ label:hover ~ label,
        .stars input:checked ~ label:hover ~ input ~ label {
    color: #ffcc00;
}
    </style>

    <div class="stars">
        <input type="radio" id="star5" name="rating" value="5"><label for="star5" title="5 stars">★</label>
        <input type="radio" id="star4" name="rating" value="4"><label for="star4" title="4 stars">★</label>
        <input type="radio" id="star3" name="rating" value="3"><label for="star3" title="3 stars">★</label>
        <input type="radio" id="star2" name="rating" value="2"><label for="star2" title="2 stars">★</label>
        <input type="radio" id="star1" name="rating" value="1"><label for="star1" title="1 star">★</label>
    </div>