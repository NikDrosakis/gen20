<?php
function newsmash_prebuilt_pg_customize_setting( $wp_customize ) {
$selective_refresh = isset( $wp_customize->selective_refresh ) ? 'postMessage' : 'refresh';
	/*=========================================
	NewsMash Page Templates
	=========================================*/
	$wp_customize->add_panel(
		'newsmash_pages_options', array(
			'priority' => 33,
			'title' => esc_html__( 'Theme Prebuilt Pages', 'newsmash' ),
		)
	);
	
	/*=========================================
	404 Page
	=========================================*/
	$wp_customize->add_section(
		'404_pg_options', array(
			'title' => esc_html__( '404 Page', 'newsmash' ),
			'priority' => 4,
			'panel' => 'newsmash_pages_options',
		)
	);
	
	/*=========================================
	404 Page
	=========================================*/
	$wp_customize->add_setting(
		'newsmash_pg_404_head_options'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority' => 1,
		)
	);

	$wp_customize->add_control(
	'newsmash_pg_404_head_options',
		array(
			'type' => 'hidden',
			'label' => __('404 Page','newsmash'),
			'section' => '404_pg_options',
		)
	);
	
	//  Title // 
	$wp_customize->add_setting(
    	'newsmash_pg_404_ttl',
    	array(
	        'default'			=> __('404 Not Found','newsmash'),
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_html',
			'priority' => 3,
		)
	);	
	
	$wp_customize->add_control( 
		'newsmash_pg_404_ttl',
		array(
		    'label'   => __('Title','newsmash'),
		    'section' => '404_pg_options',
			'type'           => 'text',
		)  
	);
	
	//  Description // 
	$wp_customize->add_setting(
    	'newsmash_pg_404_text',
    	array(
	        'default'			=> __('Oops, the page you are looking for does not exist.','newsmash'),
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_html',
			'priority' => 3,
		)
	);	
	
	$wp_customize->add_control( 
		'newsmash_pg_404_text',
		array(
		    'label'   => __('Description','newsmash'),
		    'section' => '404_pg_options',
			'type'           => 'text',
		)  
	);
	
	//  Button Label // 
	$wp_customize->add_setting(
    	'newsmash_pg_404_btn_lbl',
    	array(
	        'default'			=> __('Go Back Home','newsmash'),
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_html',
			'transport'         => $selective_refresh,
			'priority' => 4,
		)
	);	
	
	$wp_customize->add_control( 
		'newsmash_pg_404_btn_lbl',
		array(
		    'label'   => __('Button Label','newsmash'),
		    'section' => '404_pg_options',
			'type'           => 'text',
		)  
	);
	
	
	//  Link // 
	$wp_customize->add_setting(
    	'newsmash_pg_404_btn_link',
    	array(
	        'default'			=> esc_url( home_url( '/' )),
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_url',
			'priority' => 4,
		)
	);	
	
	$wp_customize->add_control( 
		'newsmash_pg_404_btn_link',
		array(
		    'label'   => __('Link','newsmash'),
		    'section' => '404_pg_options',
			'type'           => 'text',
		)  
	);
	
	
	
	/*=========================================
	Single Page
	=========================================*/
	$wp_customize->add_section(
		'single_pg_options', array(
			'title' => esc_html__( 'Single Page', 'newsmash' ),
			'priority' => 4,
			'panel' => 'newsmash_pages_options',
		)
	);
	
	/*=========================================
	Single Page Author
	=========================================*/
	$wp_customize->add_setting(
		'newsmash_pg_single_head_options'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority' => 1,
		)
	);

	$wp_customize->add_control(
	'newsmash_pg_single_head_options',
		array(
			'type' => 'hidden',
			'label' => __('Single Page','newsmash'),
			'section' => 'single_pg_options',
		)
	);
	
	// Hide/Show
	$wp_customize->add_setting(
		'newsmash_hs_single_author_option'
			,array(
			'default'     	=> '1',
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 1,
		)
	);

	$wp_customize->add_control(
	'newsmash_hs_single_author_option',
		array(
			'type' => 'checkbox',
			'label' => __('Hide/Show Single Post Author?','newsmash'),
			'section' => 'single_pg_options',
		)
	);
	
	// Hide/Show
	$wp_customize->add_setting(
		'newsmash_hs_single_post_nav'
			,array(
			'default'     	=> '1',
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 1,
		)
	);

	$wp_customize->add_control(
	'newsmash_hs_single_post_nav',
		array(
			'type' => 'checkbox',
			'label' => __('Hide/Show Single Post Navigation?','newsmash'),
			'section' => 'single_pg_options',
		)
	);
	
	/*=========================================
	Related Post
	=========================================*/
	$wp_customize->add_setting(
		'newsmash_pg_single_related_post_head_options'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority' => 1,
		)
	);

	$wp_customize->add_control(
	'newsmash_pg_single_related_post_head_options',
		array(
			'type' => 'hidden',
			'label' => __('Related Post','newsmash'),
			'section' => 'single_pg_options',
		)
	);
	
	// Hide/Show
	$wp_customize->add_setting(
		'newsmash_hs_single_related_post'
			,array(
			'default'     	=> '1',
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 1,
		)
	);

	$wp_customize->add_control(
	'newsmash_hs_single_related_post',
		array(
			'type' => 'checkbox',
			'label' => __('Hide/Show Related Post?','newsmash'),
			'section' => 'single_pg_options',
		)
	);
	
	//  Title // 
	$wp_customize->add_setting(
    	'newsmash_related_post_ttl',
    	array(
	        'default'			=> __('Related Posts','newsmash'),
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_html',
			'priority' => 3,
		)
	);	
	
	$wp_customize->add_control( 
		'newsmash_related_post_ttl',
		array(
		    'label'   => __('Title','newsmash'),
		    'section' => 'single_pg_options',
			'type'           => 'text',
		)  
	);
}
add_action( 'customize_register', 'newsmash_prebuilt_pg_customize_setting' );