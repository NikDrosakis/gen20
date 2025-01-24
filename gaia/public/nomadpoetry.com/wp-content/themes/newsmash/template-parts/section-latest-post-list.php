<?php  
$newsmash_latest_post_ttl			= get_theme_mod('newsmash_latest_post_ttl','Latest Post');
$newsmash_latest_post_cat			= get_theme_mod('newsmash_latest_post_cat','0');
$newsmash_num_latest_post			= get_theme_mod('newsmash_num_latest_post','100');
$newsmash_latest_post_posts			= newsmash_get_posts($newsmash_num_latest_post, $newsmash_latest_post_cat);
$newsmash_hs_latest_post_title		= get_theme_mod('newsmash_hs_latest_post_title','1');
$newsmash_hs_latest_post_tag_meta	= get_theme_mod('newsmash_hs_latest_post_tag_meta','1');
$newsmash_hs_latest_post_auth_meta	= get_theme_mod('newsmash_hs_latest_post_auth_meta','1');
$newsmash_hs_latest_post_date_meta	= get_theme_mod('newsmash_hs_latest_post_date_meta','1');
$newsmash_hs_latest_post_comment_meta	= get_theme_mod('newsmash_hs_latest_post_comment_meta','1');
$newsmash_hs_latest_post_content_meta= get_theme_mod('newsmash_hs_latest_post_content_meta','1');
$newsmash_hs_latest_post_social_share= get_theme_mod('newsmash_hs_latest_post_social_share');
$newsmash_latest_post_rm_type= get_theme_mod('newsmash_latest_post_rm_type','style-2');
$newsmash_latest_post_rm_lbl= get_theme_mod('newsmash_latest_post_rm_lbl','Continue reading');
$newsmash_latest_post_option_before	= get_theme_mod('newsmash_latest_post_option_before');
$newsmash_latest_post_option_after	= get_theme_mod('newsmash_latest_post_option_after');
$newsmash_post_pagination_lm_btn = get_theme_mod('newsmash_post_pagination_lm_btn', 'Load More');
if(!empty($newsmash_latest_post_option_before)): echo do_shortcode($newsmash_latest_post_option_before); endif;
?>	
<div class="spacer" data-height="50"></div>
<?php if ( ! empty( $newsmash_latest_post_ttl ) ) : ?>
	<div class="section-header latest-post-hm">
		<h4 class="section-title"><?php echo wp_kses_post($newsmash_latest_post_ttl); ?></h4>
	</div>
<?php endif; ?>
<div class="padding-30 rounded bordered dt-posts-module">
	<div class="dt-row dt-posts" data-col="6" data-btnname="<?php echo esc_attr($newsmash_post_pagination_lm_btn); ?>">	
			<?php 
				if ($newsmash_latest_post_posts->have_posts()) :
				while ($newsmash_latest_post_posts->have_posts()) : $newsmash_latest_post_posts->the_post();
				global $post;
			?>
			<?php get_template_part('template-parts/content','page-list'); ?>
		<?php endwhile; endif; wp_reset_postdata(); ?>
	</div>
	<!-- load more button data-col="6" -->
</div>
<?php if(!empty($newsmash_latest_post_option_after)): echo do_shortcode($newsmash_latest_post_option_after); endif; ?>