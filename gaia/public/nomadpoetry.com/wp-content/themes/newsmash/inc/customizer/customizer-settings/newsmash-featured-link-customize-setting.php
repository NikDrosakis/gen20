<?php
function newsmash_featured_link_customize_setting( $wp_customize ) {
$selective_refresh = isset( $wp_customize->selective_refresh ) ? 'postMessage' : 'refresh';
	/*=========================================
	Featured Link Section Panel
	=========================================*/
	$wp_customize->add_section(
		'featured_link_options', array(
			'title' => esc_html__( 'Featured Link Section', 'newsmash' ),
			'panel' => 'newsmash_frontpage_options',
			'priority' => 1,
		)
	);
	
	/*=========================================
	Featured Link Setting
	=========================================*/
	$wp_customize->add_setting(
		'featured_link_setting_head'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority' => 4,
		)
	);

	$wp_customize->add_control(
	'featured_link_setting_head',
		array(
			'type' => 'hidden',
			'label' => __('Featured Link Setting','newsmash'),
			'section' => 'featured_link_options',
		)
	);
	
	// Hide / Show
	$wp_customize->add_setting( 
		'newsmash_hs_featured_link' , 
			array(
			'default' => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 4,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_featured_link', 
		array(
			'label'	      => esc_html__( 'Hide/Show?', 'newsmash' ),
			'section'     => 'featured_link_options',
			'type'        => 'checkbox'
		) 
	);
	
	/*=========================================
	Featured Link Content
	=========================================*/
	$wp_customize->add_setting(
		'featured_link_options_head'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority' => 4,
		)
	);

	$wp_customize->add_control(
	'featured_link_options_head',
		array(
			'type' => 'hidden',
			'label' => __('Featured Link Content','newsmash'),
			'section' => 'featured_link_options',
		)
	);
	
	// Display Featured Link
	$wp_customize->add_setting( 
		'newsmash_display_featured_link' , 
			array(
			'default' => 'front_post',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_select',
			'priority' => 1,
		) 
	);

	$wp_customize->add_control(
	'newsmash_display_featured_link' , 
		array(
			'label'          => __( 'Display Featured Link (Post Category) on', 'newsmash' ),
			'section'        => 'featured_link_options',
			'type'           => 'select',
			'choices'        => 
			array(
				'front' 	=> __( 'Front Page', 'newsmash' ),
				'post' 	=> __( 'Post Page', 'newsmash' ),
				'front_post' 	=> __( 'Front & Post Page', 'newsmash' ),
			) 
		) 
	);
	
	// Upgrade
	if ( class_exists( 'Desert_Companion_Customize_Upgrade_Control' ) ) {
		$wp_customize->add_setting(
		'newsmash_featured_link_option_upsale', 
		array(
			'capability' => 'edit_theme_options',
			'sanitize_callback' => 'sanitize_text_field',
			'priority' => 26,
		));
		
		$wp_customize->add_control( 
			new Desert_Companion_Customize_Upgrade_Control
			($wp_customize, 
				'newsmash_featured_link_option_upsale', 
				array(
					'label'      => __( 'Featured Types', 'newsmash' ),
					'section'    => 'featured_link_options'
				) 
			) 
		);
	}
}
add_action( 'customize_register', 'newsmash_featured_link_customize_setting' );