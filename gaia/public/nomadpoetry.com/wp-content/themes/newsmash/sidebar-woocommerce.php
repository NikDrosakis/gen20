<?php 
/**
 * The sidebar containing the woocommerce widget area
 *
 * @link    https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package NewsMash
 */
 
if ( ! is_active_sidebar( 'newsmash-woocommerce-sidebar' ) ) {	return; } ?>
<div id="dt-sidebar" class="dt-col-lg-4 sidebar-right">
	<div class="dt_sidebar is_sticky">
		<?php dynamic_sidebar('newsmash-woocommerce-sidebar'); ?>
	</div>
</div>