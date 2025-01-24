<?php
/**
 * The template for displaying all single posts.
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/#single-post
 *
 * @package NewsMash
 */

get_header();
$newsmash_shop_pg_sidebar_option = get_theme_mod('newsmash_shop_pg_sidebar_option', 'right_sidebar'); 
?>
<div class="dt-container-md">
	<div class="dt-row">
		<?php if($newsmash_shop_pg_sidebar_option == 'left_sidebar'): get_sidebar('woocommerce'); endif; ?>
		<?php if($newsmash_shop_pg_sidebar_option == 'no_sidebar'): ?>
			<div class="dt-col-lg-12 content-right">
		<?php else: ?>	
			<div id="dt-main" class="dt-col-lg-8 content-right">
		<?php endif; ?>	
			<?php woocommerce_content();  // WooCommerce Content ?>
		</div>
		<?php if($newsmash_shop_pg_sidebar_option == 'right_sidebar'): get_sidebar('woocommerce'); endif; ?>
	</div>
</div>
<?php get_footer(); ?>

