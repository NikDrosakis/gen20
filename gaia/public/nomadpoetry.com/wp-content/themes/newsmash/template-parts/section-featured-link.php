<section class="hero-carousel popular-categories dt-mt-6">
	<div class="dt-container-fluid">
		<div class="dt-row">
			<div class="dt-col-12 popular-categories-carousel post-carousel">
				<?php
					$categories = get_categories( array(
						'orderby' => 'name',
						'order'   => 'ASC'
					) );
					foreach( $categories as $category ) {
						 $thumbnail_id = get_term_meta( $category->term_id, 'category-image-id', true );
						 $image = wp_get_attachment_url( $thumbnail_id );
						 $newsmash_cat_article_lbl = get_term_meta( $category->term_id, 'newsmash_cat_article_lbl', true );
				?>
					<div class="post featured-post-md">
						<div class="details clearfix">
							<h4 class="post-title"><a href="<?php echo esc_url(get_category_link($category->term_id)); ?>"><?php echo esc_html($category->name ); ?></a></h4>
							
							<p class="post-number dt-mt-2"><?php echo esc_html($category->count); ?> &nbsp;<span class="dot small"></span> <?php echo esc_html($newsmash_cat_article_lbl ); ?></p>
						</div>
						<a href="<?php echo esc_url(get_category_link($category->term_id)); ?>">
							<div class="thumb">
								<div class="overlay decoration-border"></div>
								<?php if ( $image ) : ?>
									<div class="inner data-bg-image" data-bg-image="<?php echo esc_url($image); ?>"></div>
								<?php else: ?>
									<div class="inner"></div>
								<?php endif; ?>
							</div>
						</a>
					</div>
				<?php } ?>
			</div>
		</div>
	</div>
</section>