<?php
/**
 * The template for displaying 404 pages (not found).
 *
 * @link https://codex.wordpress.org/Creating_an_Error_404_Page
 *
 * @package NewsMash
 */

get_header();
$newsmash_pg_404_ttl		= get_theme_mod('newsmash_pg_404_ttl','404 Not Found');
$newsmash_pg_404_text		= get_theme_mod('newsmash_pg_404_text','Oops, the page you are looking for does not exist.');
$newsmash_pg_404_btn_lbl	= get_theme_mod('newsmash_pg_404_btn_lbl','Go Back Home');
$newsmash_pg_404_btn_link	= get_theme_mod('newsmash_pg_404_btn_link',esc_url( home_url( '/' )));
?>
<div class="spacer" data-height="70"></div>
<section class="not-found dt-d-flex dt-align-items-center dt-px-5 dt-py-5">
	<div class="dt-container dt-text-center">
		<div class="dt-row">
			<div class="dt-col-lg-12">
				<?php if ( ! empty($newsmash_pg_404_ttl) ) : ?>	
					<h2 class="dt-mb-3 dt-mt-0 text-secondary"><?php echo wp_kses_post($newsmash_pg_404_ttl); ?></h2>
				<?php endif; ?> 
				
				<?php if ( ! empty($newsmash_pg_404_text) ) : ?>	
					<p class="dt-mb-4"><?php echo wp_kses_post($newsmash_pg_404_text); ?></p>
				<?php endif; ?> 
				
				<?php if ( ! empty($newsmash_pg_404_btn_lbl) ) : ?>	
					<a href="<?php echo esc_url($newsmash_pg_404_btn_link); ?>" class="dt-btn dt-btn-primary" data-title="<?php echo esc_attr($newsmash_pg_404_btn_lbl); ?>"><?php echo wp_kses_post($newsmash_pg_404_btn_lbl); ?></a>
				<?php endif; ?> 
			</div>
		</div>
	</div>
</section>
<div class="spacer" data-height="40"></div>
<?php get_footer(); ?>
