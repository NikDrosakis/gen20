<?php 
$newsmash_hs_other_story 		= get_theme_mod( 'newsmash_hs_other_story', '1');
if($newsmash_hs_other_story=='1'):
get_template_part('template-parts/section','other-story'); 
endif; 
?>
</div></div>
<footer class="dt_footer footer-dark">
	<div class="dt-container-md">
		<?php 
			// Footer Widget
			do_action('newsmash_footer_widget');
			
			// Footer Copyright
			do_action('newsmash_footer_bottom'); 
		?>
	</div>
</footer>
<?php 
wp_footer(); ?>
</body>
</html>
