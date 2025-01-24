<?php 
/**
Template Name: Frontpage
*/

get_header();
$newsmash_front_pg_sidebar_option = get_theme_mod('newsmash_front_pg_sidebar_option', 'right_sidebar');
?>
<main id="content" class="content">
<div class="dt-container-md">
	<div class="dt-row">
		<?php if($newsmash_front_pg_sidebar_option == 'left_sidebar'): get_sidebar(); endif; ?>
		<?php if($newsmash_front_pg_sidebar_option == 'no_sidebar'): ?>
			<div class="dt-col-lg-12 content-right">
		<?php else: ?>	
			<div id="dt-main" class="dt-col-lg-8 content-right">
		<?php endif; ?>	
			<?php get_template_part('template-parts/section','latest-post-list'); ?>	
		</div>
		<?php if($newsmash_front_pg_sidebar_option == 'right_sidebar'): get_sidebar(); endif; ?>
	</div>
	<?php if(!is_customize_preview() && is_user_logged_in()): ?>
		<div class="page_edit_link"><?php newsmash_edit_post_link(); ?></div>
	<?php endif; ?>
</div>
</main>
<?php		
get_footer(); ?>