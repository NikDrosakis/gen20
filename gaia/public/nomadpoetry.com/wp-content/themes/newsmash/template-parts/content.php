<?php
/**
 * Template part for displaying posts.
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package NewsMash
 */

?>
<article id="post-<?php the_ID(); ?>" <?php post_class('post post-list clearfix'); ?>>
	<div class="inner">
		<?php
			if ( is_single() ) {
				the_title( '<h5 class="post-title">', '</h5>' );
			} else {
				the_title( '<h5 class="post-title"><a href="' . esc_url( get_permalink() ) . '" rel="bookmark">', '</a></h5>' );
			}
		?>
		
		<?php
			the_content( sprintf(
				/* translators: %s: Name of current post. */
				wp_kses( __( 'Continue reading %s <span class="meta-nav">&rarr;</span>', 'newsmash' ), array( 'span' => array( 'class' => array() ) ) ),
				the_title( '<span class="screen-reader-text">"', '"</span>', false )
			) );

			wp_link_pages( array(
				'before' => '<div class="page-links">' . esc_html__( 'Pages:', 'newsmash' ),
				'after'  => '</div>',
			) );
		?>
	</div><!-- .entry-content -->
</article><!-- #post-## -->
