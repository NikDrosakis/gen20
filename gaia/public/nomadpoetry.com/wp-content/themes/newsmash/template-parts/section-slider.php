<?php 
$newsmash_slider_position		= get_theme_mod('newsmash_slider_position','left') == 'left' ? '': 'dt-flex-row-reverse'; 
$newsmash_slider_type			= get_theme_mod('newsmash_slider_type','lg');
$newsmash_slider_cat			= get_theme_mod('newsmash_slider_cat','0');
$newsmash_num_slides			= get_theme_mod('newsmash_num_slides','6');
$newsmash_slider_posts			= newsmash_get_posts($newsmash_num_slides, $newsmash_slider_cat);
$newsmash_hs_slider_title		= get_theme_mod('newsmash_hs_slider_title','1');
$newsmash_hs_slider_cat_meta	= get_theme_mod('newsmash_hs_slider_cat_meta','1');
$newsmash_hs_slider_auth_meta	= get_theme_mod('newsmash_hs_slider_auth_meta','1');
$newsmash_hs_slider_date_meta	= get_theme_mod('newsmash_hs_slider_date_meta','1');
$newsmash_hs_slider_comment_meta= get_theme_mod('newsmash_hs_slider_comment_meta','1');
$newsmash_hs_slider_views_meta	= get_theme_mod('newsmash_hs_slider_views_meta','1');
$newsmash_hs_slider_right		= get_theme_mod('newsmash_hs_slider_right','1');
$newsmash_slider_option_before	= get_theme_mod('newsmash_slider_option_before');
$newsmash_slider_option_after	= get_theme_mod('newsmash_slider_option_after');
$newsmash_slider_bg_img			= get_theme_mod('newsmash_slider_bg_img');
$newsmash_slider_right_type		= get_theme_mod('newsmash_slider_right_type','style-1');
?>	
<section id="mainfeatured_section" class="mainfeatured_section <?php echo esc_attr($newsmash_slider_right_type); ?>" <?php if(!empty($newsmash_slider_bg_img)): ?> style="background-image: url(<?php echo esc_url($newsmash_slider_bg_img); ?>);"<?php endif; ?>>
	<div class="dt-container-md">
		<div class="dt-row <?php echo esc_attr($newsmash_slider_position);?>">
			<div class="dt-col-lg-<?php if($newsmash_hs_slider_right=='1'): esc_attr_e('8','newsmash'); else: esc_attr_e('12','newsmash'); endif; ?>">
			
				<div class="post-carousel-mainfeatured post-carousel-lg post-carousel-column1" data-slick='{"slidesToShow": 1, "slidesToScroll": 1}'>
					<?php
					if ($newsmash_slider_posts->have_posts()) :
						while ($newsmash_slider_posts->have_posts()) : $newsmash_slider_posts->the_post();

						global $post;
					?>
						<div class="post featured-post-<?php echo esc_attr($newsmash_slider_type); ?>">
							<div class="details rounded clearfix">
								<?php if($newsmash_hs_slider_cat_meta=='1'): ?>	
									<?php newsmash_getpost_categories(); ?>
								<?php endif; ?>
								<?php     
									if($newsmash_hs_slider_title=='1'):
										newsmash_common_post_title('h2','post-title');
									endif;									
								?> 	
								<ul class="meta list-inline dt-mt-0 dt-mb-0 dt-mt-3">
									<?php if($newsmash_hs_slider_auth_meta=='1'): ?>
										<li class="list-inline-item"><i class="far fa-user"></i> <?php esc_html_e('By','newsmash');?> <a href="<?php echo esc_url(get_author_posts_url( get_the_author_meta( 'ID' ) ));?>" title="Posts by David" rel="author"><?php esc_html(the_author()); ?></a></li>
									<?php endif; ?>	
									
									<?php if($newsmash_hs_slider_date_meta=='1'): ?>
										<li class="list-inline-item"><i class="far fa-calendar-alt"></i> <?php echo esc_html(get_the_date( 'F j, Y' )); ?></li>
									<?php endif; ?>	
									
									<?php if($newsmash_hs_slider_comment_meta=='1'): ?>
										<li class="list-inline-item"><i class="far fa-comments"></i> <?php echo esc_html(get_comments_number($post->ID)); ?> <?php esc_html_e('Comments','newsmash'); ?> </li>
									<?php endif; ?>	
									
									<?php if($newsmash_hs_slider_views_meta=='1'): ?>
										<li class="list-inline-item"><i class="far fa-eye"></i> <?php echo wp_kses_post(newsmash_get_post_view()); ?></li>
									<?php endif; newsmash_edit_post_link();  ?>	
								</ul>	
							</div>
							<a href="<?php echo esc_url(get_permalink()); ?>">
								<div class="thumb rounded">
									<?php if ( has_post_thumbnail() ) : ?>
									<div class="inner data-bg-image" data-bg-image="<?php echo esc_url(get_the_post_thumbnail_url()); ?>"></div>
									<?php else: ?>
									<div class="inner"></div>
									<?php endif; ?>
								</div>
							</a>
						</div>
					<?php endwhile;endif;wp_reset_postdata(); ?>
				</div>
			</div>
			<?php if($newsmash_hs_slider_right=='1'): ?>	
			<div class="dt-col-lg-4">
				<?php do_action('newsmash_site_slider_right'); ?>
			</div>
			<?php endif; ?>
		</div>
	</div>
</section>