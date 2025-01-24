<?php  
$newsmash_other_story_ttl			= get_theme_mod('newsmash_other_story_ttl','Other Story');
$newsmash_other_story_cat			= get_theme_mod('newsmash_other_story_cat','0');
$newsmash_num_other_story			= get_theme_mod('newsmash_num_other_story','6');
$newsmash_other_story_posts			= newsmash_get_posts($newsmash_num_other_story, $newsmash_other_story_cat);
$newsmash_hs_other_story_title		= get_theme_mod('newsmash_hs_other_story_title','1');
$newsmash_hs_other_story_cat_meta	= get_theme_mod('newsmash_hs_other_story_cat_meta','1');
$newsmash_hs_other_story_auth_meta	= get_theme_mod('newsmash_hs_other_story_auth_meta','1');
$newsmash_hs_other_story_date_meta	= get_theme_mod('newsmash_hs_other_story_date_meta','1');
$newsmash_hs_other_story_content_meta= get_theme_mod('newsmash_hs_other_story_content_meta','1');
?>	
<div class="spacer" data-height="50"></div>
<section class="missed missed-hm">
	<div class="dt-container-md">
		<div class="dt-row">
			<div class="dt-col-md-12">
				<div class="padding-30 rounded bordered">
					<div class="section-header other-story-hm">
						<?php if ( ! empty( $newsmash_other_story_ttl ) ) : ?>
							<h4 class="section-title"><?php echo wp_kses_post($newsmash_other_story_ttl); ?></h4>
						<?php endif; ?>
						<div class="slick-arrows-top">
							<button type="button" data-role="none" class="carousel-missed-prev slick-custom-buttons" aria-label="Previous"><i class="fas fa-angle-left"></i></button>
							<button type="button" data-role="none" class="carousel-missed-next slick-custom-buttons" aria-label="Next"><i class="fas fa-angle-right"></i></button>
						</div>
					</div>
			
					<div class="post-carousel-missed post-carousel">
					<?php 
						if ($newsmash_other_story_posts->have_posts()) :
							while ($newsmash_other_story_posts->have_posts()) : $newsmash_other_story_posts->the_post();
							global $post;
					?>
						<div class="post post-over-content">
							<div class="details clearfix">
								<?php if($newsmash_hs_other_story_cat_meta=='1'): ?>	
									<?php newsmash_getpost_categories('',''); ?>
								<?php endif; ?>
								<?php if($newsmash_hs_other_story_title=='1'): ?>
									<h4 class="post-title"><a href="<?php echo esc_url(get_the_permalink()); ?>"><?php echo esc_html(the_title()); ?></a></h4>
								<?php endif; ?> 
								<ul class="meta list-inline dt-mt-0 dt-mb-0">
									<?php if($newsmash_hs_other_story_auth_meta=='1'): ?>
										<li class="list-inline-item"><a href="<?php echo esc_url(get_author_posts_url( get_the_author_meta( 'ID' ) ));?>"><?php esc_html(the_author()); ?></a></li>
									<?php endif; ?>
									
									<?php if($newsmash_hs_other_story_date_meta=='1'): ?>
										<li class="list-inline-item"><?php echo esc_html(get_the_date( 'F j, Y' )); ?></li>
									<?php endif; newsmash_edit_post_link(); ?>
								</ul>
							</div>
							<div class="thumb rounded">
								<a href="<?php echo esc_url(get_permalink()); ?>">
									<div class="inner">						
										<?php if ( has_post_thumbnail() ) { ?>
										<img src="<?php echo esc_url(get_the_post_thumbnail_url()); ?>" alt="<?php echo esc_html(the_title()); ?>" />
										<?php } ?>
									</div>
								</a>
							</div>
						</div>
					<?php endwhile;endif;wp_reset_postdata(); ?>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>