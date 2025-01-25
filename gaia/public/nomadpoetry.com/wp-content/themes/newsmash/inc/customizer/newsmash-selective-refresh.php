<?php
function newsmash_site_selective_partials( $wp_customize ){
	// newsmash_hdr_left_ttl
	$wp_customize->selective_refresh->add_partial( 'newsmash_hdr_left_ttl', array(
		'selector'            => '.dt_header .dt_header-topbar .dt-news-headline .dt-news-heading',
		'settings'            => 'newsmash_hdr_left_ttl',
		'render_callback'  => 'newsmash_hdr_left_ttl_render_callback',
	) );
	
	// newsmash_hdr_left_text
	$wp_customize->selective_refresh->add_partial( 'newsmash_hdr_left_text', array(
		'selector'            => '.dt_header .dt_header-topbar .dt-news-headline .dt_heading_inner',
		'settings'            => 'newsmash_hdr_left_text',
		'render_callback'  => 'newsmash_hdr_left_text_render_callback',
	) );

	// newsmash_hdr_top_ads_title
	$wp_customize->selective_refresh->add_partial( 'newsmash_hdr_top_ads_title', array(
		'selector'            => '.dt_header .dt_header-topbar .dt-address span',
		'settings'            => 'newsmash_hdr_top_ads_title',
		'render_callback'  => 'newsmash_hdr_top_ads_title_render_callback',
	) );
	
	// newsmash_hdr_btn_lbl
	$wp_customize->selective_refresh->add_partial( 'newsmash_hdr_btn_lbl', array(
		'selector'            => '.dt_header .dt_navbar-button-item .dt-btn',
		'settings'            => 'newsmash_hdr_btn_lbl',
		'render_callback'  => 'newsmash_hdr_btn_lbl_render_callback',
	) );
	
	// newsmash_latest_post_ttl
	$wp_customize->selective_refresh->add_partial( 'newsmash_latest_post_ttl', array(
		'selector'            => '.latest-post-hm .section-title',
		'settings'            => 'newsmash_latest_post_ttl',
		'render_callback'  => 'newsmash_latest_post_ttl_render_callback',
	) );
	
	// newsmash_footer_copyright_text
	$wp_customize->selective_refresh->add_partial( 'newsmash_footer_copyright_text', array(
		'selector'            => '.dt_footer-inner .copyright',
		'settings'            => 'newsmash_footer_copyright_text',
		'render_callback'  => 'newsmash_footer_copyright_text_render_callback',
	) );
	
	// newsmash_scroller_text
	$wp_customize->selective_refresh->add_partial( 'newsmash_scroller_text', array(
		'selector'            => '.dt_footer-inner #return-to-top',
		'settings'            => 'newsmash_scroller_text',
		'render_callback'  => 'newsmash_scroller_text_render_callback',
	) );
	
	// newsmash_other_story_ttl
	$wp_customize->selective_refresh->add_partial( 'newsmash_other_story_ttl', array(
		'selector'            => '.other-story-hm .section-header .section-title',
		'settings'            => 'newsmash_other_story_ttl',
		'render_callback'  => 'newsmash_other_story_ttl_render_callback',
	) );
	
	// newsmash_top_tags_ttl
	$wp_customize->selective_refresh->add_partial( 'newsmash_top_tags_ttl', array(
		'selector'            => '.toptags title',
		'settings'            => 'newsmash_top_tags_ttl',
		'render_callback'  => 'newsmash_top_tags_ttl_render_callback',
	) );
	
	}
add_action( 'customize_register', 'newsmash_site_selective_partials' );