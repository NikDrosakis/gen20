<?php
/**
 * The template for displaying all pages.
 *
 * This is the template that displays all pages by default.
 * Please note that this is the WordPress construct of pages
 * and that other 'pages' on your WordPress site may use a
 * different template.
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package newsmash
 */

get_header();
$newsmash_default_pg_sidebar_option= get_theme_mod('newsmash_default_pg_sidebar_option', 'right_sidebar'); 
?>
<div class="dt-container-md">
	<div class="dt-row">
		<?php if($newsmash_default_pg_sidebar_option == 'left_sidebar'): 
				if ( class_exists( 'WooCommerce' ) ) {
					if( is_account_page() || is_cart() || is_checkout() ) {
						get_sidebar('woocommerce'); 
					}else{ 
						get_sidebar(); 
					}	
				}else{ 
					get_sidebar(); 
				}	
		endif; ?>
		<?php if($newsmash_default_pg_sidebar_option == 'no_sidebar'): ?>
			<div class="dt-col-lg-12 content-right">
		<?php else: ?>	
			<div id="dt-main" class="dt-col-lg-8 content-right">
		<?php endif; 
			if( have_posts()) :  the_post();
					
				the_content(); 
				endif;
				
				if( $post->comment_status == 'open' ) { 
					 comments_template( '', true ); // show comments 
				}
			?>
		</div>
		<?php if($newsmash_default_pg_sidebar_option == 'right_sidebar'): 
				if ( class_exists( 'WooCommerce' ) ) {
					if( is_account_page() || is_cart() || is_checkout() ) {
						get_sidebar('woocommerce'); 
					}else{ 
						get_sidebar(); 
					}	
				}else{ 
					get_sidebar(); 
				}	
		endif; ?>
	</div>
</div>
<?php get_footer(); ?>