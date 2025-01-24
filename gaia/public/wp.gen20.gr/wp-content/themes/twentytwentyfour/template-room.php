<?php
// Template Name: Room Template
get_header();

if (have_posts()) :
    while (have_posts()) : the_post();

        // Retrieve custom field data
        $number_of_guests = get_post_meta(get_the_ID(), 'number_of_guests', true);
        $sleeping_arrangements = get_post_meta(get_the_ID(), 'sleeping_arrangements', true);
        $amenities = get_post_meta(get_the_ID(), 'amenities', true);

        // Display the custom field data
        ?>
        <div>
            <h2><?php the_title(); ?></h2>
            <p>Number of Guests: <?php echo esc_html($number_of_guests); ?></p>
            <p>Sleeping Arrangements: <?php echo esc_html($sleeping_arrangements); ?></p>
            <p>Amenities: <?php echo esc_html($amenities); ?></p>
            <!-- Add more HTML/CSS for the room details -->
        </div>
    <?php

    endwhile;
endif;

get_footer();
