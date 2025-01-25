<?php  do_action('newsmash_site_preloader'); ?>	
<?php  do_action('newsmash_wp_hdr_image'); ?>
<?php 
$newsmash_hs_hdr 		= get_theme_mod( 'newsmash_hs_hdr','1');
$newsmash_hs_hdr_sticky = get_theme_mod( 'newsmash_hs_hdr_sticky','1');
?>
<header id="dt_header" class="dt_header header--one menu__active-one">
	<div class="dt_header-inner">
		<?php if($newsmash_hs_hdr == '1') {  ?>
			<div class="dt_header-topbar dt-d-lg-block dt-d-none">
				<?php do_action('newsmash_site_header'); ?>
			</div>
		<?php } ?>
		<div class="dt_header-navwrapper">
			<div class="dt_header-navwrapperinner">
				<!--=== / Start: DT_Navbar / === -->
				<div class="dt_navbar dt-d-none dt-d-lg-block">
					<div class="dt_navbar-wrapper">
						<div class="dt-container-md">
							<div class="dt-row">
								<div class="dt-col dt-my-auto">
									<?php do_action('newsmash_site_social'); ?>
								</div>
								<div class="dt-col dt-my-auto">
									<div class="site--logo">
										<?php do_action('newsmash_site_logo'); ?>
									</div>
								</div>
								<div class="dt-col dt-my-auto">
									<div class="dt_navbar-right">
										<ul class="dt_navbar-list-right">
											<?php do_action('newsmash_woo_cart'); ?>
											<?php do_action('newsmash_site_main_search'); ?>
											<?php do_action('newsmash_header_button'); ?>
										</ul>
									</div>
								</div>                                        
							</div>
							<div class="dt-row">
								<div class="dt-col-12">
									<div class="dt_navbar-menu <?php if($newsmash_hs_hdr_sticky=='1'): esc_attr_e('is--sticky','newsmash'); endif; ?>">
										<nav class="dt_navbar-nav">
											<?php do_action('newsmash_site_header_navigation'); ?>
										</nav>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<!--=== / End: DT_Navbar / === -->
				<!--=== / Start: DT_Mobile Menu / === -->
				<div class="dt_mobilenav dt-d-lg-none <?php if($newsmash_hs_hdr_sticky=='1'): esc_attr_e('is--sticky','newsmash'); endif; ?>">
					<?php if($newsmash_hs_hdr == '1') {  ?>
						<div class="dt_mobilenav-topbar">
							<button type="button" class="dt_mobilenav-topbar-toggle"><i class="fas fa-angle-double-down" aria-hidden="true"></i></button>
							<div class="dt_mobilenav-topbar-content">
								<div class="dt_header-topbar">
									<?php do_action('newsmash_site_header'); ?>
								</div>
							</div>
						</div>
					<?php } ?>	
					<div class="dt-container-md">
						<div class="dt-row">
							<div class="dt-col-12">
								<div class="dt_mobilenav-menu">
									<div class="dt_mobilenav-toggles">
										<div class="dt_mobilenav-mainmenu">
											<button type="button" class="hamburger dt_mobilenav-mainmenu-toggle">
												<span></span>
												<span></span>
												<span></span>
											</button>
											<nav class="dt_mobilenav-mainmenu-content">
												<div class="dt_header-closemenu off--layer"></div>
												<div class="dt_mobilenav-mainmenu-inner">
													<button type="button" class="dt_header-closemenu site--close"></button>
													<?php do_action('newsmash_site_header_navigation'); ?>
												</div>
											</nav>
										</div>
									</div>
									<div class="dt_mobilenav-logo">
										<div class="site--logo">
											<?php do_action('newsmash_site_logo'); ?>
										</div>
									</div>
									<div class="dt_mobilenav-right">
										<div class="dt_navbar-right">
											<ul class="dt_navbar-list-right">
												<?php do_action('newsmash_site_main_search'); ?>
												<?php do_action('newsmash_header_button'); ?>
											</ul>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<!--=== / End: DT_Mobile Menu / === -->
			</div>
		</div>
	</div>
</header>