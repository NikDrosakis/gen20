<?php
function newsmash_theme_options_customize( $wp_customize ) {
$selective_refresh = isset( $wp_customize->selective_refresh ) ? 'postMessage' : 'refresh';
	$wp_customize->add_panel(
		'newsmash_theme_options', array(
			'priority' => 31,
			'title' => esc_html__( 'Theme Options', 'newsmash' ),
		)
	);
	
	/*=========================================
	Header Image
	=========================================*/
	$wp_customize->add_section(
		'header_image', array(
			'title' => esc_html__( 'Header Image', 'newsmash' ),
			'priority' => 1,
			'panel' => 'newsmash_theme_options',
		)
	);
	
	/*=========================================
	General Options
	=========================================*/
	$wp_customize->add_section(
		'site_general_options', array(
			'title' => esc_html__( 'General Options', 'newsmash' ),
			'priority' => 1,
			'panel' => 'newsmash_theme_options',
		)
	);
	
	
	/*=========================================
	Preloader
	=========================================*/
	// Heading
	$wp_customize->add_setting(
		'newsmash_preloader_option'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority' => 1,
		)
	);

	$wp_customize->add_control(
	'newsmash_preloader_option',
		array(
			'type' => 'hidden',
			'label' => __('Site Preloader','newsmash'),
			'section' => 'site_general_options',
		)
	);
	
	
	// Hide/ Show
	$wp_customize->add_setting( 
		'newsmash_hs_preloader_option' , 
			array(
			'default' => '1',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'capability' => 'edit_theme_options',
			'priority' => 1,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_preloader_option', 
		array(
			'label'	      => esc_html__( 'Hide / Show Preloader', 'newsmash' ),
			'section'     => 'site_general_options',
			'type'        => 'checkbox'
		) 
	);
	
	
	
	/*=========================================
	NewsMash Container
	=========================================*/
	// Heading
	$wp_customize->add_setting(
		'newsmash_site_container_option'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority' => 6,
		)
	);

	$wp_customize->add_control(
	'newsmash_site_container_option',
		array(
			'type' => 'hidden',
			'label' => __('Site Container','newsmash'),
			'section' => 'site_general_options',
		)
	);
	
	if ( class_exists( 'NewsMash_Customizer_Range_Control' ) ) {
		//container width
		$wp_customize->add_setting(
			'newsmash_site_container_width',
			array(
				'default'			=> '1340',
				'capability'     	=> 'edit_theme_options',
				'sanitize_callback' => 'newsmash_sanitize_range_value',
				'transport'         => 'postMessage',
				'priority'      => 6,
			)
		);
		$wp_customize->add_control( 
		new NewsMash_Customizer_Range_Control( $wp_customize, 'newsmash_site_container_width', 
			array(
				'label'      => __( 'Container Width', 'newsmash' ),
				'section'  => 'site_general_options',
				 'media_query'   => false,
                'input_attr'    => array(
                    'desktop' => array(
                        'min'           => 768,
                        'max'           => 2000,
                        'step'          => 1,
                        'default_value' => 1340,
                    ),
                ),
			) ) 
		);
	}
	
	/*=========================================
	NewsMash Search Result
	=========================================*/
	
	//  Head // 
	$wp_customize->add_setting(
		'newsmash_search_result_head'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority' => 7,
		)
	);

	$wp_customize->add_control(
	'newsmash_search_result_head',
		array(
			'type' => 'hidden',
			'label' => __('Search Result','newsmash'),
			'section' => 'site_general_options',
		)
	);
	
	//  Style
	$wp_customize->add_setting( 
		'newsmash_search_result' , 
			array(
			'default' => 'post',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_select',
			'priority' => 8,
		) 
	);

	$wp_customize->add_control(
	'newsmash_search_result' , 
		array(
			'label'          => __( 'Search Result Page will Show ?', 'newsmash' ),
			'section'        => 'site_general_options',
			'type'           => 'select',
			'choices'        => 
			array(
				'post' 	=> __( 'Posts', 'newsmash' ),
				'product' 	=> __( 'WooCommerce Products', 'newsmash' ),
			) 
		) 
	);
	
	
	/*=========================================
	NewsMash Dark
	=========================================*/
	
	//  Head // 
	$wp_customize->add_setting(
		'newsmash_dark_head'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority' => 7,
		)
	);

	$wp_customize->add_control(
	'newsmash_dark_head',
		array(
			'type' => 'hidden',
			'label' => __('Light/Dark Style','newsmash'),
			'section' => 'site_general_options',
		)
	);
	
	// Hide/ Show
	$wp_customize->add_setting( 
		'newsmash_hs_dark_option' , 
			array(
			'default' => '1',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'capability' => 'edit_theme_options',
			'priority' => 7,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_dark_option', 
		array(
			'label'	      => esc_html__( 'Hide / Show Light & Dark Mode Switcher', 'newsmash' ),
			'section'     => 'site_general_options',
			'type'        => 'checkbox'
		) 
	);
	
	
	//  Style
	$wp_customize->add_setting( 
		'newsmash_dark_mode' , 
			array(
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_select',
			'priority' => 8,
		) 
	);

	$wp_customize->add_control(
	'newsmash_dark_mode' , 
		array(
			'label'          => __( 'Select Light or  Dark Mode ?', 'newsmash' ),
			'section'        => 'site_general_options',
			'type'           => 'select',
			'choices'        => 
			array(
				'' 	=> __( 'Light', 'newsmash' ),
				'dark' 	=> __( 'Dark', 'newsmash' ),
			) 
		) 
	);
	
	/*=========================================
	Breadcrumb  Section
	=========================================*/
	$wp_customize->add_section(
		'newsmash_site_breadcrumb', array(
			'title' => esc_html__( 'Site Breadcrumb', 'newsmash' ),
			'priority' => 12,
			'panel' => 'newsmash_theme_options',
		)
	);
	
	// Heading
	$wp_customize->add_setting(
		'newsmash_site_breadcrumb_option'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority' => 1,
		)
	);

	$wp_customize->add_control(
	'newsmash_site_breadcrumb_option',
		array(
			'type' => 'hidden',
			'label' => __('Settings','newsmash'),
			'section' => 'newsmash_site_breadcrumb',
		)
	);
	
	// Breadcrumb Hide/ Show Setting // 
	$wp_customize->add_setting( 
		'newsmash_hs_site_breadcrumb' , 
			array(
			'default' => '1',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'capability' => 'edit_theme_options',
			'priority' => 2,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_site_breadcrumb', 
		array(
			'label'	      => esc_html__( 'Hide / Show Section', 'newsmash' ),
			'section'     => 'newsmash_site_breadcrumb',
			'type'        => 'checkbox'
		) 
	);
	
	// Breadcrumb Content Section // 
	$wp_customize->add_setting(
		'newsmash_site_breadcrumb_content'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority' => 5,
		)
	);

	$wp_customize->add_control(
	'newsmash_site_breadcrumb_content',
		array(
			'type' => 'hidden',
			'label' => __('Content','newsmash'),
			'section' => 'newsmash_site_breadcrumb',
		)
	);
	
	
	// Type
	$wp_customize->add_setting( 
		'newsmash_breadcrumb_type' , 
			array(
			'default' => 'theme',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_select',
			'priority' => 5,
		) 
	);

	$wp_customize->add_control(
	'newsmash_breadcrumb_type' , 
		array(
			'label'          => __( 'Select Breadcrumb Type', 'newsmash' ),
			'description'          => __( 'You need to install and activate the respected plugin to show their Breadcrumb. Otherwise, your default theme Breadcrumb will appear. If you see error in search console, then we recommend to use plugin Breadcrumb.', 'newsmash' ),
			'section'        => 'newsmash_site_breadcrumb',
			'type'           => 'select',
			'choices'        => 
			array(
				'theme' 	=> __( 'Theme Default 1', 'newsmash' ),
				'theme2' 	=> __( 'Theme Default 2', 'newsmash' ),
				'yoast' 	=> __( 'Yoast Plugin', 'newsmash' ),
				'rankmath' 	=> __( 'Rank Math Plugin', 'newsmash' ),
				'navxt' 	=> __( 'NavXT Plugin', 'newsmash' ),
			) 
		) 
	);
	
	// Typography
	$wp_customize->add_setting(
		'newsmash_breadcrumb_typography'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority'  => 13,
		)
	);

	$wp_customize->add_control(
	'newsmash_breadcrumb_typography',
		array(
			'type' => 'hidden',
			'label' => __('Typography','newsmash'),
			'section' => 'newsmash_site_breadcrumb',
		)
	);
	
	if ( class_exists( 'NewsMash_Customizer_Range_Control' ) ) {
	// Title size // 
	$wp_customize->add_setting(
    	'newsmash_breadcrumb_title_size',
    	array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_range_value',
			'transport'         => 'postMessage',
			'priority'  => 14,
		)
	);
	$wp_customize->add_control( 
	new NewsMash_Customizer_Range_Control( $wp_customize, 'newsmash_breadcrumb_title_size', 
		array(
			'label'      => __( 'Title Font Size', 'newsmash' ),
			'section'  => 'newsmash_site_breadcrumb',
			'media_query'   => true,
			'input_attr'    => array(
				'mobile'  => array(
					'min'           => 0,
					'max'           => 60,
					'step'          => 1,
					'default_value' => 30,
				),
				'tablet'  => array(
					'min'           => 0,
					'max'           => 60,
					'step'          => 1,
					'default_value' => 30,
				),
				'desktop' => array(
					'min'           => 0,
					'max'           => 60,
					'step'          => 1,
					'default_value' => 30,
				),
			),
		) ) 
	);
	// Content size // 
	$wp_customize->add_setting(
    	'newsmash_breadcrumb_content_size',
    	array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_range_value',
			'transport'         => 'postMessage',
			'priority'  => 15,
		)
	);
	$wp_customize->add_control( 
	new NewsMash_Customizer_Range_Control( $wp_customize, 'newsmash_breadcrumb_content_size', 
		array(
			'label'      => __( 'Content Font Size', 'newsmash' ),
			'section'  => 'newsmash_site_breadcrumb',
			'media_query'   => true,
			'input_attr'    => array(
				'mobile'  => array(
					'min'           => 0,
					'max'           => 50,
					'step'          => 1,
					'default_value' => 15,
				),
				'tablet'  => array(
					'min'           => 0,
					'max'           => 50,
					'step'          => 1,
					'default_value' => 15,
				),
				'desktop' => array(
					'min'           => 0,
					'max'           => 50,
					'step'          => 1,
					'default_value' => 15,
				),
			),
		) ) 
	);
	}
	
	
	
	/*=========================================
	NewsMash Sidebar
	=========================================*/
	$wp_customize->add_section(
        'newsmash_sidebar_options',
        array(
        	'priority'      => 8,
            'title' 		=> __('Sidebar Options','newsmash'),
			'panel'  		=> 'newsmash_theme_options',
		)
    );
	
	//  Pages Layout // 
	$wp_customize->add_setting(
		'newsmash_pages_sidebar_option'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority' => 1,
		)
	);

	$wp_customize->add_control(
	'newsmash_pages_sidebar_option',
		array(
			'type' => 'hidden',
			'label' => __('Sidebar Layout','newsmash'),
			'section' => 'newsmash_sidebar_options',
		)
	);
	
	// Frontpage
	$wp_customize->add_setting( 
		'newsmash_front_pg_sidebar_option' , 
			array(
			'default' => 'right_sidebar',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_select',
			'priority' => 2,
		) 
	);

	$wp_customize->add_control(
	'newsmash_front_pg_sidebar_option' , 
		array(
			'label'          => __( 'Frontpage Sidebar Option', 'newsmash' ),
			'section'        => 'newsmash_sidebar_options',
			'type'           => 'select',
			'choices'        => 
			array(
				'left_sidebar' 	=> __( 'Left Sidebar', 'newsmash' ),
				'right_sidebar' 	=> __( 'Right Sidebar', 'newsmash' ),
				'no_sidebar' 	=> __( 'No Sidebar', 'newsmash' ),
			) 
		) 
	);
	
	// Default Page
	$wp_customize->add_setting( 
		'newsmash_default_pg_sidebar_option' , 
			array(
			'default' => 'right_sidebar',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_select',
			'priority' => 2,
		) 
	);

	$wp_customize->add_control(
	'newsmash_default_pg_sidebar_option' , 
		array(
			'label'          => __( 'Default Page Sidebar Option', 'newsmash' ),
			'section'        => 'newsmash_sidebar_options',
			'type'           => 'select',
			'choices'        => 
			array(
				'left_sidebar' 	=> __( 'Left Sidebar', 'newsmash' ),
				'right_sidebar' 	=> __( 'Right Sidebar', 'newsmash' ),
				'no_sidebar' 	=> __( 'No Sidebar', 'newsmash' ),
			) 
		) 
	);
	
	// Archive Page
	$wp_customize->add_setting( 
		'newsmash_archive_pg_sidebar_option' , 
			array(
			'default' => 'right_sidebar',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_select',
			'priority' => 3,
		) 
	);

	$wp_customize->add_control(
	'newsmash_archive_pg_sidebar_option' , 
		array(
			'label'          => __( 'Archive Page Sidebar Option', 'newsmash' ),
			'section'        => 'newsmash_sidebar_options',
			'type'           => 'select',
			'choices'        => 
			array(
				'left_sidebar' 	=> __( 'Left Sidebar', 'newsmash' ),
				'right_sidebar' => __( 'Right Sidebar', 'newsmash' ),
				'no_sidebar' 	=> __( 'No Sidebar', 'newsmash' ),
			) 
		) 
	);
	
	
	// Single Page
	$wp_customize->add_setting( 
		'newsmash_single_pg_sidebar_option' , 
			array(
			'default' => 'right_sidebar',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_select',
			'priority' => 4,
		) 
	);

	$wp_customize->add_control(
	'newsmash_single_pg_sidebar_option' , 
		array(
			'label'          => __( 'Single Page Sidebar Option', 'newsmash' ),
			'section'        => 'newsmash_sidebar_options',
			'type'           => 'select',
			'choices'        => 
			array(
				'left_sidebar' 	=> __( 'Left Sidebar', 'newsmash' ),
				'right_sidebar' => __( 'Right Sidebar', 'newsmash' ),
				'no_sidebar' 	=> __( 'No Sidebar', 'newsmash' ),
			) 
		) 
	);
	
	
	// Blog Page
	$wp_customize->add_setting( 
		'newsmash_blog_pg_sidebar_option' , 
			array(
			'default' => 'right_sidebar',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_select',
			'priority' => 5,
		) 
	);

	$wp_customize->add_control(
	'newsmash_blog_pg_sidebar_option' , 
		array(
			'label'          => __( 'Blog Page Sidebar Option', 'newsmash' ),
			'section'        => 'newsmash_sidebar_options',
			'type'           => 'select',
			'choices'        => 
			array(
				'left_sidebar' 	=> __( 'Left Sidebar', 'newsmash' ),
				'right_sidebar' => __( 'Right Sidebar', 'newsmash' ),
				'no_sidebar' 	=> __( 'No Sidebar', 'newsmash' ),
			) 
		) 
	);
	
	// Search Page
	$wp_customize->add_setting( 
		'newsmash_search_pg_sidebar_option' , 
			array(
			'default' => 'right_sidebar',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_select',
			'priority' => 5,
		) 
	);

	$wp_customize->add_control(
	'newsmash_search_pg_sidebar_option' , 
		array(
			'label'          => __( 'Search Page Sidebar Option', 'newsmash' ),
			'section'        => 'newsmash_sidebar_options',
			'type'           => 'select',
			'choices'        => 
			array(
				'left_sidebar' 	=> __( 'Left Sidebar', 'newsmash' ),
				'right_sidebar' => __( 'Right Sidebar', 'newsmash' ),
				'no_sidebar' 	=> __( 'No Sidebar', 'newsmash' ),
			) 
		) 
	);
	
	
	// WooCommerce Page
	$wp_customize->add_setting( 
		'newsmash_shop_pg_sidebar_option' , 
			array(
			'default' => 'right_sidebar',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_select',
			'priority' => 6,
		) 
	);

	$wp_customize->add_control(
	'newsmash_shop_pg_sidebar_option' , 
		array(
			'label'          => __( 'WooCommerce Page Sidebar Option', 'newsmash' ),
			'section'        => 'newsmash_sidebar_options',
			'type'           => 'select',
			'choices'        => 
			array(
				'left_sidebar' 	=> __( 'Left Sidebar', 'newsmash' ),
				'right_sidebar' => __( 'Right Sidebar', 'newsmash' ),
				'no_sidebar' 	=> __( 'No Sidebar', 'newsmash' ),
			) 
		) 
	);
	
	
	// Widget options
	$wp_customize->add_setting(
		'sidebar_options'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority'  => 6
		)
	);

	$wp_customize->add_control(
	'sidebar_options',
		array(
			'type' => 'hidden',
			'label' => __('Options','newsmash'),
			'section' => 'newsmash_sidebar_options',
		)
	);
	
	
	
	// Sidebar Width 
	if ( class_exists( 'Newsmash_Customizer_Range_Control' ) ) {
		$wp_customize->add_setting(
			'newsmash_sidebar_width',
			array(
				'default'	      => '33',
				'capability'     	=> 'edit_theme_options',
				'sanitize_callback' => 'newsmash_sanitize_range_value',
				'transport'         => 'postMessage',
				'priority'  => 7
			)
		);
		$wp_customize->add_control( 
		new Newsmash_Customizer_Range_Control( $wp_customize, 'newsmash_sidebar_width', 
			array(
				'label'      => __( 'Sidebar Width', 'newsmash' ),
				'section'  => 'newsmash_sidebar_options',
				 'media_query'   => false,
					'input_attr'    => array(
						'desktop' => array(
							'min'           => 25,
							'max'           => 50,
							'step'          => 1,
							'default_value' => 33,
						),
					),
			) ) 
		);
	}
	
	
	// Sticky Sidebar
	$wp_customize->add_setting(
		'sticky_sidebar_options'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority'  => 7
		)
	);

	$wp_customize->add_control(
	'sticky_sidebar_options',
		array(
			'type' => 'hidden',
			'label' => __('Sticky Sidebar','newsmash'),
			'section' => 'newsmash_sidebar_options',
		)
	);
	
	// Hide / Show
	$wp_customize->add_setting(
		'sticky_sidebar_hs'
			,array(
			'default'     	=> '1',
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority'  => 7
		)
	);

	$wp_customize->add_control(
	'sticky_sidebar_hs',
		array(
			'type' => 'checkbox',
			'label' => __('Sticky Sidebar','newsmash'),
			'section' => 'newsmash_sidebar_options',
		)
	);
	
	// Widget Typography
	$wp_customize->add_setting(
		'sidebar_typography'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
		)
	);

	$wp_customize->add_control(
	'sidebar_typography',
		array(
			'type' => 'hidden',
			'label' => __('Typography','newsmash'),
			'section' => 'newsmash_sidebar_options',
			'priority'  => 21,
		)
	);
	
	// Widget Title // 
	if ( class_exists( 'Newsmash_Customizer_Range_Control' ) ) {
		$wp_customize->add_setting(
			'newsmash_widget_ttl_size',
			array(
				'capability'     	=> 'edit_theme_options',
				'sanitize_callback' => 'newsmash_sanitize_range_value',
				'transport'         => 'postMessage'
			)
		);
		$wp_customize->add_control( 
		new Newsmash_Customizer_Range_Control( $wp_customize, 'newsmash_widget_ttl_size', 
			array(
				'label'      => __( 'Widget Title Font Size', 'newsmash' ),
				'section'  => 'newsmash_sidebar_options',
				'priority'  => 22,
				 'media_query'   => true,
                'input_attr'    => array(
                    'mobile'  => array(
                        'min'           => 5,
                        'max'           => 100,
                        'step'          => 1,
                        'default_value' => 24,
                    ),
                    'tablet'  => array(
                        'min'           => 5,
                        'max'           => 100,
                        'step'          => 1,
                        'default_value' => 24,
                    ),
                    'desktop' => array(
                        'min'           => 5,
                        'max'           => 100,
                        'step'          => 1,
                        'default_value' => 24,
                    ),
                ),
			) ) 
		);
	}
	
	/*=========================================
	Blog Options
	=========================================*/
	$wp_customize->add_section(
		'site_blog_options', array(
			'title' => esc_html__( 'Blog Options', 'newsmash' ),
			'priority' => 2,
			'panel' => 'newsmash_theme_options',
		)
	);
	
	/*=========================================
	Excerpt
	=========================================*/
	$wp_customize->add_setting(
		'newsmash_blog_excerpt_options'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority' => 9,
		)
	);

	$wp_customize->add_control(
	'newsmash_blog_excerpt_options',
		array(
			'type' => 'hidden',
			'label' => __('Post Excerpt','newsmash'),
			'section' => 'site_blog_options',
		)
	);
	
	
	// Enable Excerpt
	$wp_customize->add_setting(
		'newsmash_enable_post_excerpt'
			,array(
			'default' => '1',	
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority'      => 9,
		)
	);

	$wp_customize->add_control(
	'newsmash_enable_post_excerpt',
		array(
			'type' => 'checkbox',
			'label' => __('Enable Excerpt','newsmash'),
			'section' => 'site_blog_options',
		)
	);
	
	
	// post Exerpt // 
	if ( class_exists( 'NewsMash_Customizer_Range_Control' ) ) {
		$wp_customize->add_setting(
			'newsmash_post_excerpt_length',
			array(
				'default'     	=> '30',
				'capability'     	=> 'edit_theme_options',
				'sanitize_callback' => 'newsmash_sanitize_range_value',
				'priority'      => 10,
			)
		);
		$wp_customize->add_control( 
		new NewsMash_Customizer_Range_Control( $wp_customize, 'newsmash_post_excerpt_length', 
			array(
				'label'      => __( 'Excerpt Length', 'newsmash' ),
				'section'  => 'site_blog_options',
				 'media_query'   => false,
                'input_attr'    => array(
                    'desktop' => array(
                       'min'           => 0,
                        'max'           => 1000,
                        'step'          => 1,
                        'default_value' => 30,
                    ),
				)	
			) ) 
		);
	}
	
	// excerpt more // 
	$wp_customize->add_setting(
    	'newsmash_blog_excerpt_more',
    	array(
			'default'      => '...',
			'sanitize_callback' => 'sanitize_text_field',
			'capability' => 'edit_theme_options',
			'priority'      => 11,
		)
	);	

	$wp_customize->add_control( 
		'newsmash_blog_excerpt_more',
		array(
		    'label'   => esc_html__('Excerpt More','newsmash'),
		    'section' => 'site_blog_options',
			'type' => 'text',
		)  
	);
	
	
	// Enable Excerpt
	$wp_customize->add_setting(
		'newsmash_show_post_btn'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority'      => 12,
		)
	);

	$wp_customize->add_control(
	'newsmash_show_post_btn',
		array(
			'type' => 'checkbox',
			'label' => __('Enable Read More Button','newsmash'),
			'section' => 'site_blog_options',
		)
	);
	
	// Readmore button
	$wp_customize->add_setting(
		'newsmash_read_btn_txt'
			,array(
			'default' => __('Read more','newsmash'),
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_html',
			'priority'      => 13,
		)
	);

	$wp_customize->add_control(
	'newsmash_read_btn_txt',
		array(
			'type' => 'text',
			'label' => __('Read More Button Text','newsmash'),
			'section' => 'site_blog_options',
		)
	);
	
	
	// Hide / Show
	$wp_customize->add_setting( 
		'newsmash_hs_latest_post_title' , 
			array(
			'default' => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 2,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_latest_post_title', 
		array(
			'label'	      => esc_html__( 'Hide/Show Title?', 'newsmash' ),
			'section'     => 'site_blog_options',
			'type'        => 'checkbox'
		) 
	);
	
	// Hide / Show
	$wp_customize->add_setting( 
		'newsmash_hs_latest_post_tag_meta' , 
			array(
			'default' => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 2,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_latest_post_tag_meta', 
		array(
			'label'	      => esc_html__( 'Hide/Show Tag?', 'newsmash' ),
			'section'     => 'site_blog_options',
			'type'        => 'checkbox'
		) 
	);
	
	// Hide / Show
	$wp_customize->add_setting( 
		'newsmash_hs_latest_post_auth_meta' , 
			array(
			'default' => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 2,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_latest_post_auth_meta', 
		array(
			'label'	      => esc_html__( 'Hide/Show Author?', 'newsmash' ),
			'section'     => 'site_blog_options',
			'type'        => 'checkbox'
		) 
	);
	
	// Hide / Show
	$wp_customize->add_setting( 
		'newsmash_hs_latest_post_date_meta' , 
			array(
			'default' => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 2,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_latest_post_date_meta', 
		array(
			'label'	      => esc_html__( 'Hide/Show Date?', 'newsmash' ),
			'section'     => 'site_blog_options',
			'type'        => 'checkbox'
		) 
	);
	
	// Hide / Show
	$wp_customize->add_setting( 
		'newsmash_hs_latest_post_comment_meta' , 
			array(
			'default' => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 2,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_latest_post_comment_meta', 
		array(
			'label'	      => esc_html__( 'Hide/Show Comment?', 'newsmash' ),
			'section'     => 'site_blog_options',
			'type'        => 'checkbox'
		) 
	);
	
	// Hide / Show
	$wp_customize->add_setting( 
		'newsmash_hs_latest_post_reading_meta' , 
			array(
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 2,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_latest_post_reading_meta', 
		array(
			'label'	      => esc_html__( 'Hide/Show Reading Time?', 'newsmash' ),
			'section'     => 'site_blog_options',
			'type'        => 'checkbox'
		) 
	);
	
	
	// Hide / Show
	$wp_customize->add_setting( 
		'newsmash_hs_latest_post_content_meta' , 
			array(
			'default' => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 2,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_latest_post_content_meta', 
		array(
			'label'	      => esc_html__( 'Hide/Show Content?', 'newsmash' ),
			'section'     => 'site_blog_options',
			'type'        => 'checkbox'
		) 
	);
	
	// Hide / Show
	$wp_customize->add_setting( 
		'newsmash_hs_latest_post_social_share' , 
			array(
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 2,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_latest_post_social_share', 
		array(
			'label'	      => esc_html__( 'Hide/Show Social Share?', 'newsmash' ),
			'section'     => 'site_blog_options',
			'type'        => 'checkbox'
		) 
	);
	
	// Hide / Show
	$wp_customize->add_setting( 
		'newsmash_hs_latest_post_format_icon' , 
			array(
			'default' => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 2,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_latest_post_format_icon', 
		array(
			'label'	      => esc_html__( 'Hide/Show Post Format Icon?', 'newsmash' ),
			'section'     => 'site_blog_options',
			'type'        => 'checkbox'
		) 
	);
	
	// Type
	$wp_customize->add_setting( 
		'newsmash_latest_post_rm_type' , 
			array(
			'default' => 'style-2',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_select',
			'priority' => 2,
		) 
	);

	$wp_customize->add_control(
	'newsmash_latest_post_rm_type' , 
		array(
			'label'          => __( 'Select Read More Type', 'newsmash' ),
			'section'        => 'site_blog_options',
			'type'           => 'select',
			'choices'        => 
			array(
				'style-1' 	=> __( 'Style 1', 'newsmash' ),
				'style-2' 	=> __( 'Style 2', 'newsmash' )
			) 
		) 
	);
	
	//  Read More Label // 
	$wp_customize->add_setting(
    	'newsmash_latest_post_rm_lbl',
    	array(
	        'default'			=> __('Continue reading','newsmash'),
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_html',
			'priority' => 2,
		)
	);	
	
	$wp_customize->add_control( 
		'newsmash_latest_post_rm_lbl',
		array(
		    'label'   => __('Read More Label','newsmash'),
		    'section' => 'site_blog_options',
			'type'           => 'text',
		)  
	);
	
	
	/*=========================================
	Archive Layout
	=========================================*/
	$wp_customize->add_setting(
		'newsmash_archives_layout_options'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority' => 4,
		)
	);

	$wp_customize->add_control(
	'newsmash_archives_layout_options',
		array(
			'type' => 'hidden',
			'label' => __('Archive Layout','newsmash'),
			'section' => 'site_blog_options',
		)
	);
	
	// Type
	$wp_customize->add_setting( 
		'newsmash_archives_post_layout' , 
			array(
			'default' => 'list',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_select',
			'priority' => 4,
		) 
	);

	$wp_customize->add_control(
	'newsmash_archives_post_layout' , 
		array(
			'label'          => __( 'Select Type', 'newsmash' ),
			'section'        => 'site_blog_options',
			'type'           => 'select',
			'choices'        => 
			array(
				'list' 	=> __( 'List', 'newsmash' ),
				'grid' 	=> __( 'Grid', 'newsmash' ),
				'minimal' 	=> __( 'Minimal', 'newsmash' ),
				'classic' 	=> __( 'Classic', 'newsmash' ),
			) 
		) 
	);
	
	
	/*=========================================
	Post Pagination
	=========================================*/
	$wp_customize->add_setting(
		'newsmash_post_pagination_options'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority' => 5,
		)
	);

	$wp_customize->add_control(
	'newsmash_post_pagination_options',
		array(
			'type' => 'hidden',
			'label' => __('Post Pagination','newsmash'),
			'section' => 'site_blog_options',
		)
	);
	
	// Type
	$wp_customize->add_setting( 
		'newsmash_post_pagination_type' , 
			array(
			'default' => 'default',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_select',
			'priority' => 6,
		) 
	);

	$wp_customize->add_control(
	'newsmash_post_pagination_type' , 
		array(
			'label'          => __( 'Select Type', 'newsmash' ),
			'section'        => 'site_blog_options',
			'type'           => 'select',
			'choices'        => 
			array(
				'default' 	=> __( 'Default', 'newsmash' ),
				'next' 	=> __( 'Next / Preview', 'newsmash' )
			) 
		) 
	);
	
	// Upgrade
	if ( class_exists( 'Desert_Companion_Customize_Upgrade_Control' ) ) {
		$wp_customize->add_setting(
		'newsmash_post_pagination_option_upsale', 
		array(
			'capability' => 'edit_theme_options',
			'sanitize_callback' => 'sanitize_text_field',
			'priority' => 6,
		));
		
		$wp_customize->add_control( 
			new Desert_Companion_Customize_Upgrade_Control
			($wp_customize, 
				'newsmash_post_pagination_option_upsale', 
				array(
					'label'      => __( 'Pagination Styles', 'newsmash' ),
					'section'    => 'site_blog_options'
				) 
			) 
		);	
	}
	
	
	/*=========================================
	Colors
	=========================================*/
	$wp_customize->add_section(
		'colors', array(
			'title' => esc_html__( 'Colors', 'newsmash' ),
			'priority' => 12,
			'panel' => 'newsmash_theme_options',
		)
	);
	
	// Upgrade
	if ( class_exists( 'Desert_Companion_Customize_Upgrade_Control' ) ) {
		$wp_customize->add_setting(
		'newsmash_color_option_upsale', 
		array(
			'capability' => 'edit_theme_options',
			'sanitize_callback' => 'sanitize_text_field',
			'priority' => 6,
		));
		
		$wp_customize->add_control( 
			new Desert_Companion_Customize_Upgrade_Control
			($wp_customize, 
				'newsmash_color_option_upsale', 
				array(
					'label'      => __( 'Color Styles', 'newsmash' ),
					'section'    => 'colors'
				) 
			) 
		);	
	}
	
	/*=========================================
	Background Image
	=========================================*/
	$wp_customize->add_section(
		'background_image', array(
			'title' => esc_html__( 'Background Image', 'newsmash' ),
			'priority' => 12,
			'panel' => 'newsmash_theme_options',
		)
	);
	
	// Upgrade
	if ( class_exists( 'Desert_Companion_Customize_Upgrade_Control' ) ) {
		$wp_customize->add_setting(
		'newsmash_background_image_upsale', 
		array(
			'capability' => 'edit_theme_options',
			'sanitize_callback' => 'sanitize_text_field',
			'priority' => 6,
		));
		
		$wp_customize->add_control( 
			new Desert_Companion_Customize_Upgrade_Control
			($wp_customize, 
				'newsmash_background_image_upsale', 
				array(
					'label'      => __( 'Background Styles', 'newsmash' ),
					'section'    => 'background_image'
				) 
			) 
		);	
	}
}
add_action( 'customize_register', 'newsmash_theme_options_customize' );
