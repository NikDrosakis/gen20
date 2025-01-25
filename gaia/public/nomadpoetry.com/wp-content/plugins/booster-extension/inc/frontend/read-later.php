<?php
/**
* Read Later Posts
*
* @package Booster Extension
*/
function booster_extention_get_post_by_title( $title ) {
    $args  = array(
        'post_type'      => 'page',
        'post_status'    => 'publish',
        'posts_per_page' => 1,
        'title'          => $title,
    );
    $query = new WP_Query( $args );
    if ( $query->have_posts() ) {
        $query->the_post();
        $post = get_post();
        wp_reset_postdata();
        return $post;
    }
    return false;
}
add_action('wp_ajax_booster_extension_read_later_post_ajax', 'booster_extension_read_later_post_ajax_callback');
add_action('wp_ajax_nopriv_booster_extension_read_later_post_ajax', 'booster_extension_read_later_post_ajax_callback');
if (!function_exists('booster_extension_read_later_post_ajax_callback')) :

    // Read Later posts
    function booster_extension_read_later_post_ajax_callback(){
            
        if ( isset( $_POST['_wpnonce'] ) && wp_verify_nonce( wp_unslash( $_POST['_wpnonce'] ), 'be_ajax_nonce' ) && isset( $_POST['pid'] ) && absint( $_POST['pid'] ) ) {

            $post_id = absint( $_POST['pid'] );
            $AddRemove = esc_html( $_POST['AddRemove'] );
            $pined_posts = get_option('twp_pined_posts');
            
            
            if( $AddRemove == 'add' ){

                if( empty( $pined_posts ) ){
                    $pined_posts = array();
                    update_option( 'twp_pined_posts', $pined_posts);
                }

                set_transient( 'twp-posts-' . absint( $post_id ), $post_id, HOUR_IN_SECONDS * 24 );

                $transient_name = 'twp-posts-' . absint( $post_id );
                if ( ! in_array( $transient_name,  $pined_posts ) ) {
                    $pined_posts[] = $transient_name;
                    update_option( 'twp_pined_posts', $pined_posts );
                }

            }else{

                delete_transient( 'twp-posts-' . absint( $post_id ) );
            }

        }
        die();
    }

endif;

add_shortcode('be-pp', 'booster_extension_add_read_later_post_html');

if( !function_exists( 'booster_extension_add_read_later_post_html' ) ):

    // Read Later Post html
    function booster_extension_add_read_later_post_html($id){

        ob_start();
        $pin_posts = booster_extension_add_read_later_posts_lists();
        $class = in_array( get_the_ID(),$pin_posts ); ?>

        <a data-ui-tooltip="<?php echo esc_attr('Read it Later','booster-extension'); ?>" pid="booster-favourite-<?php the_ID(); ?>" class="booster-favourite-post <?php if( $class ){ echo 'booster-favourite-selected'; } ?> booster-favourite-<?php the_ID(); ?>" post-id="<?php the_ID(); ?>" href="javascript:void(0)">
            <?php booster_extension_the_theme_svg('bookmark'); ?>
        </a>
    
        <?php

        $html = ob_get_contents();
        ob_get_clean();
        return $html;

    }

endif;

if( !function_exists( 'booster_extension_add_read_later_posts_ids' ) ):

    // Read Later Posts Ids
    function booster_extension_add_read_later_posts_ids(){

        $pined_posts = get_option('twp_pined_posts');
        $posts_ids = array();
        if( empty( $pined_posts ) ){ $pined_posts = array(); }

        foreach( $pined_posts as $key => $id ){

            if( get_transient($id) ){
                $posts_ids[] =  get_transient($id).'<br>';
            }else{
                unset( $pined_posts[$key] );
            }

        }
        update_option( 'twp_pined_posts', $pined_posts);
        return $posts_ids;
    }

endif;

if( !function_exists( 'booster_extension_add_read_later_posts_lists' ) ):

    // Show Read Later
    function booster_extension_add_read_later_posts_lists(){
        
        $posts_ids = booster_extension_add_read_later_posts_ids();
        return $posts_ids;
        
    }

endif;


/**
 * A function used to programmatically create a post in WordPress. The slug, author ID, and title
 * are defined within the context of the function.
 *
 * @returns -1 if the post was never created, -2 if a post with the same title exists, or the ID
 *          of the post if successful.
 */
function booster_extension_create_post() {

    // Initialize the page ID to -1. This indicates no action has been taken.
    $post_id = -1;

    // Setup the author, slug, and title for the post
    $author_id = 1;
    $slug = 'be-pin-posts';
    $title = 'Pin Posts';
    $has_title = booster_extention_get_post_by_title( $title );

    // If the page doesn't already exist, then create it
    if( empty( $has_title ) ){

        // Set the post ID so that we know the post was created successfully
        $post_id = wp_insert_post(
            array(
                'comment_status'    =>  'closed',
                'ping_status'       =>  'closed',
                'post_author'       =>  $author_id,
                'post_name'     =>  $slug,
                'post_title'        =>  $title,
                'post_content'        =>  '[be-booster-favourites]',
                'post_status'       =>  'publish',
                'post_type'     =>  'page'
            )
        );

    }

} 
add_filter( 'after_setup_theme', 'booster_extension_create_post' );

add_shortcode('be-booster-favourites', 'booster_extension_add_read_later_post_render');

if( !function_exists( 'booster_extension_add_read_later_post_render' ) ):

    // Read Later Posts Ids
    function booster_extension_add_read_later_post_render(){

        ob_start();
        
        do_action('booster_extension_before_read_later_post');

        $ed_content = apply_filters( 'booster_extension_ed_content', 1 );

        $pin_posts = booster_extension_add_read_later_posts_lists();
        $pin_posts_query = new WP_Query( array('post_type' => 'post', 'post__in' => $pin_posts ) );
        if( $pin_posts ){ ?>

            <div class="be-read-letter-posts">

                <?php
                if ( $pin_posts_query->have_posts() ) : ?>

                    <div class="be-read-letter-posts">
                        <?php
                        while( $pin_posts_query->have_posts() ):
                            $pin_posts_query->the_post();
                            
                            do_action('booster_extension_read_later_post_content');
                            if( $ed_content ){ ?>

                                <div class="be-read-letter-items">
                                    <article>
                                        
                                        <?php
                                        $featured_image = wp_get_attachment_image_src( get_post_thumbnail_id( get_the_ID() ), 'medium_large' );
                                        $featured_image = isset( $featured_image[0] ) ? $featured_image[0] : ''; ?>

                                        <?php if( $featured_image ){ ?>
                                            <a href="<?php the_permalink(); ?>">
                                                <img src="<?php echo esc_url( $featured_image ); ?>" alt="<?php the_title_attribute(); ?>" title="<?php the_title_attribute(); ?>">
                                            </a>

                                        <?php } ?>

                                        <h3 class="entry-title">
                                            <a href="<?php the_permalink(); ?>">
                                                <?php the_title(); ?>
                                            </a>

                                            <?php echo do_shortcode('[be-pp]'); ?>

                                        </h3>

                                        <div class="entry-content">

                                            <?php
                                            if( has_excerpt() ){

                                                the_excerpt();

                                            }else{

                                                echo '<p>';
                                                echo esc_html( wp_trim_words( get_the_content(),25,'...' ) );
                                                echo '</p>';
                                            } ?>

                                        </div>

                                    </article>
                                </div>

                            <?php } ?>

                        <?php endwhile; ?>
                    </div>
                    
                    <?php 
                    wp_reset_postdata();
                endif; ?>
            </div>
            
        <?php
        }else{ ?>
            <p><?php esc_html_e( 'It seems there is not any post added into Read Later list.', 'booster-extension' ); ?></p>
        <?php
        }

        do_action('booster_extension_after_read_later_post');

        $html = ob_get_contents();
        ob_get_clean();
        return $html;
    }

endif;

function booster_extension_get_read_letter_page_id() {

    $title = 'Pin Posts';
    $has_title = booster_extention_get_post_by_title( $title );

    // If the page doesn't already exist, then create it
    if( $has_title && isset( $has_title->post_content ) && $has_title->post_content  == '[be-booster-favourites]' ){

        return isset( $has_title->ID ) ?  $has_title->ID : '';

    }

    return false;

}