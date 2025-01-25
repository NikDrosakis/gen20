<?php
/**
Template Name: Fullwidth Page
**/

get_header();
?>
<div class="dt-container-md">
	<div class="dt-row dt-g-5">
		<div class="dt-col-lg-12 dt-col-md-12 dt-col-12">
			<?php 		
				the_post(); the_content(); 
				
				if( $post->comment_status == 'open' ) { 
					 comments_template( '', true ); // show comments 
				}
			?>
		</div>
	</div>
</div>
<?php get_footer(); ?>

