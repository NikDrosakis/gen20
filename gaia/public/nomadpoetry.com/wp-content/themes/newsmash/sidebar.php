<?php
/**
 * The sidebar containing the main widget area
 *
 * @link    https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package NewsMash
 */
if ( ! is_active_sidebar( 'newsmash-sidebar-primary' ) ) {	return; } ?>
<div id="dt-sidebar" class="dt-col-lg-4 sidebar-right">
	<div class="dt_sidebar is_sticky">
		<?php dynamic_sidebar('newsmash-sidebar-primary'); ?>
	</div>
</div>