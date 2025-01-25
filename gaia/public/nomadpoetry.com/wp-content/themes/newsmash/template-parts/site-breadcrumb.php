<?php 
$newsmash_display_top_tags		= get_theme_mod( 'newsmash_display_top_tags', 'front_post');
$newsmash_display_slider 		= get_theme_mod( 'newsmash_display_slider', 'front_post');
$newsmash_display_featured_link = get_theme_mod( 'newsmash_display_featured_link', 'front_post');
$newsmash_site_hero				= get_theme_mod( 'newsmash_site_hero', 'front_post');
if (((!is_front_page() && !is_home()) && ($newsmash_display_slider=='post' || $newsmash_display_slider=='front_post')) || ((!is_front_page() && !is_home()) && ($newsmash_display_featured_link=='post' || $newsmash_display_featured_link=='front_post')) || ((!is_front_page() && !is_home()) && ($newsmash_site_hero=='post' || $newsmash_site_hero=='front_post')) || ((!is_front_page() && !is_home()) && ($newsmash_display_top_tags=='post' || $newsmash_display_top_tags=='front_post'))):
$newsmash_hs_site_breadcrumb    = get_theme_mod('newsmash_hs_site_breadcrumb','1');
$newsmash_breadcrumb_bg_img		= get_theme_mod('newsmash_breadcrumb_bg_img',esc_url(get_template_directory_uri() .'/assets/images/background/page_title.jpg'));	
$newsmash_breadcrumb_type    = get_theme_mod('newsmash_breadcrumb_type','theme');
if($newsmash_hs_site_breadcrumb == '1'):	
?>
<section class="page-header dt-py-3">
	<div class="dt-container-md">
		<div class="dt-row">
			<div class="dt-col-12">
				<?php if($newsmash_breadcrumb_type == 'yoast' && (function_exists('yoast_breadcrumb'))): ?> 
					<div class="dt-text-center dt-py-4">	
						<?php yoast_breadcrumb(); ?>
					</div>
				<?php elseif($newsmash_breadcrumb_type == 'rankmath' && (function_exists('rank_math_the_breadcrumbs'))): ?> 
					<div class="dt-text-center dt-py-4">	
						<?php  rank_math_the_breadcrumbs(); ?>	
					</div>	
				<?php elseif($newsmash_breadcrumb_type == 'navxt' && (function_exists('bcn_display'))): ?>
					<div class="dt-text-center dt-py-4">
						<?php bcn_display(); ?>
					</div>	
				<?php elseif($newsmash_breadcrumb_type == 'theme2'): ?>
					<div class="dt-text-left dt-py-0">
						<nav class="breadcrumbs" aria-label="breadcrumb">
							<ol class="breadcrumb dt-justify-content-left dt-mt-0 dt-mb-0">
								<?php newsmash_page_header_breadcrumbs(); ?>
							</ol>
						</nav>
					</div>
				<?php else: ?>
					<div class="dt-text-center dt-py-4">
						<?php
							if(is_home() || is_front_page()) {
								echo '<h1 class="dt-mt-0 dt-mb-2">'; single_post_title(); echo '</h1>';
							} else {
								newsmash_theme_page_header_title();
							} 
						?>
						<nav class="breadcrumbs" aria-label="breadcrumb">
							<ol class="breadcrumb dt-justify-content-center dt-mt-0 dt-mb-0">
								<?php newsmash_page_header_breadcrumbs(); ?>
							</ol>
						</nav>
					</div>	
				<?php endif; ?>	
			</div>
		</div>
	</div>
</section>
<?php endif; endif;?>	