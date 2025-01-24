<?php
/**
 * Template part for displaying author Meta
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package NewsMash
 */

$newsmash_author_data 		= get_the_author_meta( 'description' );
$newsmash_active_author_id  = get_the_author_meta( 'ID' );
$newsmash_active_user_id    = is_user_logged_in() ? wp_get_current_user()->ID : false;
?>
<div class="about-author padding-30 rounded">
	<div class="thumb">
		<?php echo get_avatar( get_the_author_meta('ID'), 200); ?>
	</div>
	<div class="details">
		<h4 class="name"><?php the_author_link(); ?></h4>
		<?php 
			if ( '' === $newsmash_author_data ) {
				if ( $newsmash_active_user_id && $newsmash_active_author_id === $newsmash_active_user_id ) {

					// Translators: %1$s: <a> tag. %2$s: </a>.
					printf( wp_kses_post( __( 'You haven&rsquo;t entered your Biographical Information yet. %1$sEdit your Profile%2$s now.', 'newsmash' ) ), '<a href="' . esc_url( get_edit_user_link( $newsmash_active_user_id ) ) . '">', '</a>' );
				}
			}else{
				echo wp_kses_post( $newsmash_author_data ); 
			}
		?>
	</div>
</div>