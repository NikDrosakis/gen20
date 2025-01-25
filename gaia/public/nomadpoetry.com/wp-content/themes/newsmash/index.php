<?php
/**
 * The main template file.
 *
 * This is the most generic template file in a WordPress theme
 * and one of the two required files for a theme (the other being style.css).
 * It is used to display a page when nothing more specific matches a query.
 * E.g., it puts together the home page when no home.php file exists.
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package newsmash
 */

get_header(); 
$newsmash_blog_pg_sidebar_option = get_theme_mod('newsmash_blog_pg_sidebar_option', 'right_sidebar');
$newsmash_archives_post_layout 		= get_theme_mod('newsmash_archives_post_layout', 'list');
$newsmash_archives_post_layout_list = $newsmash_archives_post_layout == 'list' ? 'padding-30 rounded bordered dt-posts-module' : 'padding-no dt-posts-module';
$newsmash_archives_post_layouts_row = ( $newsmash_archives_post_layout == 'list' || $newsmash_archives_post_layout == 'grid' ) ? 'dt-row dt-g-4 listgrid dt-posts' : 'dt-row-no dt-posts';

?>
<div class="dt-container-md">
	<div class="dt-row">
		<?php if($newsmash_blog_pg_sidebar_option == 'left_sidebar'): get_sidebar(); endif; ?>
		<?php if($newsmash_blog_pg_sidebar_option == 'no_sidebar'): ?>
			<div class="dt-col-lg-12 content-right">
		<?php else: ?>	
			<div id="dt-main" class="dt-col-lg-8 content-right">
		<?php endif; ?>	
			<div class="<?php echo esc_attr($newsmash_archives_post_layout_list) ?>">
				<div class="<?php echo esc_attr($newsmash_archives_post_layouts_row) ?>">
					<?php if( have_posts() ): ?>
					<?php 
					// Start the loop.
					while( have_posts() ) : the_post(); ?>
						<?php if($newsmash_archives_post_layout=='grid'): ?>
							<div class="dt-col-sm-6">
								<?php get_template_part('template-parts/content','page'); ?>
							</div>
						<?php	
							elseif($newsmash_archives_post_layout=='list'):
								get_template_part('template-parts/content','page-list'); 
							elseif($newsmash_archives_post_layout=='minimal'):
								get_template_part('template-parts/content','page-minimal');	
							elseif($newsmash_archives_post_layout=='classic'):
								get_template_part('template-parts/content','page-classic');	
							endif;	
						?>
					<?php endwhile; // End the loop. ?>

					<?php // If no content, include the "No posts found" template.
						else: 
						get_template_part('template-parts/content','none'); 
					endif; ?>		
				</div>
				<?php do_action('newsmash_post_pagination'); ?>	
			</div>
		</div>
		<?php if($newsmash_blog_pg_sidebar_option == 'right_sidebar'): get_sidebar(); endif; ?>
	</div>
</div>
<?php get_footer(); ?>
