<?php
function newsmash_slider_customize_setting( $wp_customize ) {
$selective_refresh = isset( $wp_customize->selective_refresh ) ? 'postMessage' : 'refresh';
	/*=========================================
	Slider Section Panel
	=========================================*/
	$wp_customize->add_panel(
		'newsmash_frontpage_options', array(
			'priority' => 32,
			'title' => esc_html__( 'Theme Frontpage', 'newsmash' ),
		)
	);
	
	$wp_customize->add_section(
		'slider_options', array(
			'title' => esc_html__( 'Slider Section', 'newsmash' ),
			'panel' => 'newsmash_frontpage_options',
			'priority' => 1,
		)
	);
	
	/*=========================================
	Slider Setting
	=========================================*/
	$wp_customize->add_setting(
		'slider_setting_head'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority' => 4,
		)
	);

	$wp_customize->add_control(
	'slider_setting_head',
		array(
			'type' => 'hidden',
			'label' => __('Slider Setting','newsmash'),
			'section' => 'slider_options',
		)
	);
	
	// Hide / Show
	$wp_customize->add_setting( 
		'newsmash_hs_slider' , 
			array(
			'default' => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 4,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_slider', 
		array(
			'label'	      => esc_html__( 'Hide/Show?', 'newsmash' ),
			'section'     => 'slider_options',
			'type'        => 'checkbox'
		) 
	);
	
	//  Slider Position
	$wp_customize->add_setting( 
		'newsmash_slider_position' , 
			array(
			'default' => 'left',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_select',
			'priority' => 4,
		) 
	);

	$wp_customize->add_control(
	'newsmash_slider_position' , 
		array(
			'label'          => __( 'Slider Position', 'newsmash' ),
			'section'        => 'slider_options',
			'type'           => 'select',
			'choices'        => 
			array(
				'left' 	=> __( 'Left', 'newsmash' ),
				'right' 	=> __( 'Right', 'newsmash' ),
			) 
		) 
	);
	
	
	
	/*=========================================
	Slider Content Left
	=========================================*/
	$wp_customize->add_setting(
		'slider_options_head'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority' => 4,
		)
	);

	$wp_customize->add_control(
	'slider_options_head',
		array(
			'type' => 'hidden',
			'label' => __('Slider Content Left','newsmash'),
			'section' => 'slider_options',
		)
	);
	 
	// Display Slider
	$wp_customize->add_setting( 
		'newsmash_display_slider' , 
			array(
			'default' => 'front_post',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_select',
			'priority' => 1,
		) 
	);

	$wp_customize->add_control(
	'newsmash_display_slider' , 
		array(
			'label'          => __( 'Display Slider on', 'newsmash' ),
			'section'        => 'slider_options',
			'type'           => 'select',
			'choices'        => 
			array(
				'front' 	=> __( 'Front Page', 'newsmash' ),
				'post' 	=> __( 'Post Page', 'newsmash' ),
				'front_post' 	=> __( 'Front & Post Page', 'newsmash' ),
			) 
		) 
	);
	
	// Slider Type
	$wp_customize->add_setting( 
		'newsmash_slider_type' , 
			array(
			'default' => 'lg',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_select',
			'priority' => 1,
		) 
	);

	$wp_customize->add_control(
	'newsmash_slider_type' , 
		array(
			'label'          => __( 'Slider Size', 'newsmash' ),
			'section'        => 'slider_options',
			'type'           => 'select',
			'choices'        => 
			array(
				'lg' 	=> __( 'Large', 'newsmash' ),
				'md' 	=> __( 'Medium', 'newsmash' ),
				'xl' 	=> __( 'Extra Large', 'newsmash' ),
			) 
		) 
	);
	
	
	// Select Blog Category
	$wp_customize->add_setting(
    'newsmash_slider_cat',
		array(
		'default'	      => '0',	
		'capability' => 'edit_theme_options',
		'priority' => 4,
		'sanitize_callback' => 'absint',
		)
	);	
	$wp_customize->add_control( new Newsmash_Post_Category_Control( $wp_customize, 
	'newsmash_slider_cat', 
		array(
		'label'   => __('Select Category','newsmash'),
		'description'   => __('Posts to be shown on slider section','newsmash'),
		'section' => 'slider_options',
		) 
	) );	
	
	// Hide / Show
	$wp_customize->add_setting( 
		'newsmash_hs_slider_title' , 
			array(
			'default' => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 2,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_slider_title', 
		array(
			'label'	      => esc_html__( 'Hide/Show Title?', 'newsmash' ),
			'section'     => 'slider_options',
			'type'        => 'checkbox'
		) 
	);
	
	// Hide / Show
	$wp_customize->add_setting( 
		'newsmash_hs_slider_cat_meta' , 
			array(
			'default' => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 2,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_slider_cat_meta', 
		array(
			'label'	      => esc_html__( 'Hide/Show Category?', 'newsmash' ),
			'section'     => 'slider_options',
			'type'        => 'checkbox'
		) 
	);
	
	// Hide / Show
	$wp_customize->add_setting( 
		'newsmash_hs_slider_auth_meta' , 
			array(
			'default' => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 2,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_slider_auth_meta', 
		array(
			'label'	      => esc_html__( 'Hide/Show Author?', 'newsmash' ),
			'section'     => 'slider_options',
			'type'        => 'checkbox'
		) 
	);
	
	// Hide / Show
	$wp_customize->add_setting( 
		'newsmash_hs_slider_date_meta' , 
			array(
			'default' => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 2,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_slider_date_meta', 
		array(
			'label'	      => esc_html__( 'Hide/Show Date?', 'newsmash' ),
			'section'     => 'slider_options',
			'type'        => 'checkbox'
		) 
	);
	
	// Hide / Show
	$wp_customize->add_setting( 
		'newsmash_hs_slider_comment_meta' , 
			array(
			'default' => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 2,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_slider_comment_meta', 
		array(
			'label'	      => esc_html__( 'Hide/Show Comment?', 'newsmash' ),
			'section'     => 'slider_options',
			'type'        => 'checkbox'
		) 
	);
	
	// Hide / Show
	$wp_customize->add_setting( 
		'newsmash_hs_slider_views_meta' , 
			array(
			'default' => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 2,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_slider_views_meta', 
		array(
			'label'	      => esc_html__( 'Hide/Show Views?', 'newsmash' ),
			'section'     => 'slider_options',
			'type'        => 'checkbox'
		) 
	);
	
	// No. of Slides
	if ( class_exists( 'NewsMash_Customizer_Range_Control' ) ) {
		$wp_customize->add_setting(
			'newsmash_num_slides',
			array(
				'default' => '6',
				'capability'     	=> 'edit_theme_options',
				'sanitize_callback' => 'newsmash_sanitize_range_value',
				'priority' => 11,
			)
		);
		$wp_customize->add_control( 
		new NewsMash_Customizer_Range_Control( $wp_customize, 'newsmash_num_slides', 
			array(
				'label'      => __( 'Number of Slides', 'newsmash' ),
				'section'  => 'slider_options',
				 'media_query'   => false,
					'input_attr'    => array(
						'desktop' => array(
							'min'           => 1,
							'max'           => 100,
							'step'          => 1,
							'default_value' => 6,
						),
					),
			) ) 
		);
	}
	

	
	/*=========================================
	Slider Content Right
	=========================================*/
	$wp_customize->add_setting(
		'slider_right_options_head'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority' => 12,
		)
	);

	$wp_customize->add_control(
	'slider_right_options_head',
		array(
			'type' => 'hidden',
			'label' => __('Slider Content Right','newsmash'),
			'section' => 'slider_options',
		)
	);
	
	// Hide / Show
	$wp_customize->add_setting( 
		'newsmash_hs_slider_right' , 
			array(
			'default' => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 12,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_slider_right', 
		array(
			'label'	      => esc_html__( 'Hide/Show Tab Post?', 'newsmash' ),
			'section'     => 'slider_options',
			'type'        => 'checkbox'
		) 
	);

	
	// Select Blog Category
	$wp_customize->add_setting(
    'newsmash_tabfirst_cat',
		array(
		'default'	      => '0',	
		'capability' => 'edit_theme_options',
		'sanitize_callback' => 'absint',
		'priority' => 12,
		)
	);	
	$wp_customize->add_control( new Newsmash_Post_Category_Control( $wp_customize, 
	'newsmash_tabfirst_cat', 
		array(
		'label'   => __('Select Category For Left','newsmash'),
		'description'   => __('Posts to be shown on Left','newsmash'),
		'section' => 'slider_options',
		) 
	) );
	
	// Select Blog Category
	$wp_customize->add_setting(
    'newsmash_tabsecond_cat',
		array(
		'default'	      => '0',	
		'capability' => 'edit_theme_options',
		'sanitize_callback' => 'absint',
		'priority' => 12,
		)
	);	
	$wp_customize->add_control( new Newsmash_Post_Category_Control( $wp_customize, 
	'newsmash_tabsecond_cat', 
		array(
		'label'   => __('Select Category For Right','newsmash'),
		'description'   => __('Posts to be shown on Right','newsmash'),
		'section' => 'slider_options',
		) 
	) );
	
	// Hide / Show
	$wp_customize->add_setting( 
		'newsmash_hs_slider_tab_title' , 
			array(
			'default' => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 12,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_slider_tab_title', 
		array(
			'label'	      => esc_html__( 'Hide/Show Title?', 'newsmash' ),
			'section'     => 'slider_options',
			'type'        => 'checkbox'
		) 
	);
	
	// Hide / Show
	$wp_customize->add_setting( 
		'newsmash_hs_slider_tab_cat_meta' , 
			array(
			'default' => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 12,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_slider_tab_cat_meta', 
		array(
			'label'	      => esc_html__( 'Hide/Show Category?', 'newsmash' ),
			'section'     => 'slider_options',
			'type'        => 'checkbox'
		) 
	);
	
	// Hide / Show
	$wp_customize->add_setting( 
		'newsmash_hs_slider_tab_date_meta' , 
			array(
			'default' => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 12,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_slider_tab_date_meta', 
		array(
			'label'	      => esc_html__( 'Hide/Show Date?', 'newsmash' ),
			'section'     => 'slider_options',
			'type'        => 'checkbox'
		) 
	);
	
	// Hide / Show
	$wp_customize->add_setting( 
		'newsmash_hs_slider_tab_author_meta' , 
			array(
			'default' => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 12,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_slider_tab_author_meta', 
		array(
			'label'	      => esc_html__( 'Hide/Show Author?', 'newsmash' ),
			'section'     => 'slider_options',
			'type'        => 'checkbox'
		) 
	);
	
	// No. of Slides
	if ( class_exists( 'NewsMash_Customizer_Range_Control' ) ) {
		$wp_customize->add_setting(
			'newsmash_num_slides_tab',
			array(
				'default' => '3',
				'capability'     	=> 'edit_theme_options',
				'sanitize_callback' => 'newsmash_sanitize_range_value',
				'priority' => 11,
			)
		);
		$wp_customize->add_control( 
		new NewsMash_Customizer_Range_Control( $wp_customize, 'newsmash_num_slides_tab', 
			array(
				'label'      => __( 'Number of Post in Tab', 'newsmash' ),
				'section'  => 'slider_options',
				 'media_query'   => false,
					'input_attr'    => array(
						'desktop' => array(
							'min'           => 1,
							'max'           => 10,
							'step'          => 1,
							'default_value' => 3,
						),
					),
			) ) 
		);
	}
	
	
	/*=========================================
	Slider Background
	=========================================*/
	$wp_customize->add_setting(
		'slider_option_bg_head'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority' => 12,
		)
	);

	$wp_customize->add_control(
	'slider_option_bg_head',
		array(
			'type' => 'hidden',
			'label' => __('Background','newsmash'),
			'section' => 'slider_options',
		)
	);
	
	//  Image // 
    $wp_customize->add_setting( 
    	'newsmash_slider_bg_img' , 
    	array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_url',	
			'priority' => 12,
		) 
	);
	
	$wp_customize->add_control( new WP_Customize_Image_Control( $wp_customize , 'newsmash_slider_bg_img' ,
		array(
			'label'          => esc_html__( 'Background Image', 'newsmash'),
			'section'        => 'slider_options',
		) 
	));
	
	// Upgrade
	if ( class_exists( 'Desert_Companion_Customize_Upgrade_Control' ) ) {
		$wp_customize->add_setting(
		'newsmash_slider_option_upsale', 
		array(
			'capability' => 'edit_theme_options',
			'sanitize_callback' => 'sanitize_text_field',
			'priority' => 12,
		));
		
		$wp_customize->add_control( 
			new Desert_Companion_Customize_Upgrade_Control
			($wp_customize, 
				'newsmash_slider_option_upsale', 
				array(
					'label'      => __( 'Slider Styles', 'newsmash' ),
					'section'    => 'slider_options'
				) 
			) 
		);	
	}
	
}
add_action( 'customize_register', 'newsmash_slider_customize_setting' );