<?php
function newsmash_top_tags_customize_setting( $wp_customize ) {
$selective_refresh = isset( $wp_customize->selective_refresh ) ? 'postMessage' : 'refresh';
	/*=========================================
	Top Tags Section Panel
	=========================================*/
	$wp_customize->add_section(
		'top_tags_options', array(
			'title' => esc_html__( 'Top Tags Section', 'newsmash' ),
			'panel' => 'newsmash_frontpage_options',
			'priority' => 1,
		)
	);
	
	/*=========================================
	Top Tags Setting
	=========================================*/
	$wp_customize->add_setting(
		'top_tags_setting_head'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority' => 4,
		)
	);

	$wp_customize->add_control(
	'top_tags_setting_head',
		array(
			'type' => 'hidden',
			'label' => __('Top Tags Setting','newsmash'),
			'section' => 'top_tags_options',
		)
	);
	
	// Hide / Show
	$wp_customize->add_setting( 
		'newsmash_hs_top_tags' , 
			array(
			'default'     => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 4,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_top_tags', 
		array(
			'label'	      => esc_html__( 'Hide/Show?', 'newsmash' ),
			'section'     => 'top_tags_options',
			'type'        => 'checkbox'
		) 
	);
	
	// Display Top Tags
	$wp_customize->add_setting( 
		'newsmash_display_top_tags' , 
			array(
			'default' => 'front_post',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_select',
			'priority' => 4,
		) 
	);

	$wp_customize->add_control(
	'newsmash_display_top_tags' , 
		array(
			'label'          => __( 'Display Top Tags on', 'newsmash' ),
			'section'        => 'top_tags_options',
			'type'           => 'select',
			'choices'        => 
			array(
				'front' 	=> __( 'Front Page', 'newsmash' ),
				'post' 	=> __( 'Post Page', 'newsmash' ),
				'front_post' 	=> __( 'Front & Post Page', 'newsmash' ),
			) 
		) 
	);
	
	
	//  Title // 
	$wp_customize->add_setting(
    	'newsmash_top_tags_ttl',
    	array(
	        'default'			=> __('Top Tags','newsmash'),
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_html',
			'transport'         => $selective_refresh,
			'priority' => 3,
		)
	);	
	
	$wp_customize->add_control( 
		'newsmash_top_tags_ttl',
		array(
		    'label'   => __('Title','newsmash'),
		    'section' => 'top_tags_options',
			'type'           => 'text',
		)  
	);
	
	// Upgrade
	if ( class_exists( 'Desert_Companion_Customize_Upgrade_Control' ) ) {
		$wp_customize->add_setting(
		'newsmash_top_tags_upsale', 
		array(
			'capability' => 'edit_theme_options',
			'sanitize_callback' => 'sanitize_text_field',
			'priority' => 3,
		));
		
		$wp_customize->add_control( 
			new Desert_Companion_Customize_Upgrade_Control
			($wp_customize, 
				'newsmash_top_tags_upsale', 
				array(
					'label'      => __( 'Top Tags Styles', 'newsmash' ),
					'section'    => 'top_tags_options'
				) 
			) 
		);	
	}
}
add_action( 'customize_register', 'newsmash_top_tags_customize_setting' );