<?php
/**
 * Template part for displaying page content in page.php.
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package NewsMash
 */
$newsmash_hs_latest_post_title		= get_theme_mod('newsmash_hs_latest_post_title','1');
$newsmash_hs_latest_post_tag_meta	= get_theme_mod('newsmash_hs_latest_post_tag_meta','1');
$newsmash_hs_latest_post_auth_meta	= get_theme_mod('newsmash_hs_latest_post_auth_meta','1');
$newsmash_hs_latest_post_date_meta	= get_theme_mod('newsmash_hs_latest_post_date_meta','1');
$newsmash_hs_latest_post_comment_meta	= get_theme_mod('newsmash_hs_latest_post_comment_meta','1');
$newsmash_hs_latest_post_content_meta= get_theme_mod('newsmash_hs_latest_post_content_meta','1');
$newsmash_hs_latest_post_social_share= get_theme_mod('newsmash_hs_latest_post_social_share');
$newsmash_hs_latest_post_reading_meta= get_theme_mod('newsmash_hs_latest_post_reading_meta');
$newsmash_latest_post_rm_type= get_theme_mod('newsmash_latest_post_rm_type','style-2');
$newsmash_latest_post_rm_lbl= get_theme_mod('newsmash_latest_post_rm_lbl','Continue reading');
$format = get_post_format() ? : 'standard';
?>
<article class="post post-xl">
	<div class="post-top">
		<ul class="meta list-inline dt-mt-0 dt-mb-0">
			<?php if($newsmash_hs_latest_post_auth_meta=='1'): ?>
				<?php do_action('newsmash_common_post_author'); ?>
			<?php endif; ?>
			<?php if($newsmash_hs_latest_post_date_meta=='1'): ?>
				<li class="list-inline-item"><?php echo esc_html(get_the_date( 'F j, Y' )); ?></li>
			<?php endif; ?>
			<?php if($newsmash_hs_latest_post_comment_meta=='1'): ?>
				<li class="list-inline-item"><i class="far fa-comments"></i> <?php echo esc_html(get_comments_number($post->ID)); ?> <?php esc_html_e('Comments','newsmash'); ?> </li>
			<?php endif; ?>
			<?php if($newsmash_hs_latest_post_reading_meta=='1'): ?>
				<li class="list-inline-item"><i class="fa-solid fa-eye"></i> <?php echo esc_html(newsmash_read_time()); ?></li>
			<?php endif; ?>
			<?php newsmash_edit_post_link(); ?>
		</ul>
		<?php     
			if($newsmash_hs_latest_post_title=='1'):
				newsmash_common_post_title('h5','post-title dt-mb-0 dt-mt-4');
			endif;	
		?>
	</div>
	<?php if ( has_post_thumbnail() || ($format == 'video' || $format == 'audio' || $format == 'gallery') ){ ?>
		<div class="thumb rounded">
			<?php if($newsmash_hs_latest_post_tag_meta=='1'): ?>	
				<?php newsmash_getpost_categories('','position-absolute'); ?>
			<?php endif; ?>
			<?php  if ( $format !== 'standard' ) : ?>
				<span class="post-format">
					<?php do_action('newsmash_post_format_icon_type'); ?>
				</span>
			<?php endif; ?>
			<?php do_action('newsmash_post_format_image_video'); ?>
		</div>
	<?php }  
	if($newsmash_hs_latest_post_content_meta=='1'):		
	?> 
	<div class="details">  <p class="excerpt dt-mb-0"><?php do_action('newsmash_post_format_content'); ?></p></div>
	<?php endif; ?>
	<div class="post-bottom clearfix dt-d-flex dt-align-items-center">
		<?php if($newsmash_hs_latest_post_social_share=='1'): ?>
			<?php newsmash_post_sharing(); ?>
		<?php endif; ?>
		<?php if($newsmash_latest_post_rm_type=='style-1'): ?>
			<div class="more-button float-right">
				<a href="<?php echo esc_url(get_permalink()); ?>"><span class="icon-options"><span></span></span></a>
			</div>
		<?php else: ?>
			<div class="float-right dt-d-none dt-d-md-block">
				<a href="<?php echo esc_url(get_permalink()); ?>" class="more-link"><?php echo wp_kses_post($newsmash_latest_post_rm_lbl); ?> <i class="fas fa-angle-right"></i></a>
			</div>
		<?php endif; ?>
	</div>
</article>	