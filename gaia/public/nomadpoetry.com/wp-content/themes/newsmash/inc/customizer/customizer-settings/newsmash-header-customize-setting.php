<?php
function newsmash_header_customize_settings( $wp_customize ) {
$selective_refresh = isset( $wp_customize->selective_refresh ) ? 'postMessage' : 'refresh';
	/*=========================================
	Header Settings Panel
	=========================================*/
	$wp_customize->add_panel( 
		'header_options', 
		array(
			'priority'      => 2,
			'capability'    => 'edit_theme_options',
			'title'			=> __('Header Options', 'newsmash'),
		) 
	);
	
	/*=========================================
	NewsMash Site Identity
	=========================================*/
	$wp_customize->add_section(
        'title_tagline',
        array(
        	'priority'      => 1,
            'title' 		=> __('Site Identity','newsmash'),
			'panel'  		=> 'header_options',
		)
    );
	
	// Logo Width // 
	if ( class_exists( 'NewsMash_Customizer_Range_Control' ) ) {
		$wp_customize->add_setting(
			'hdr_logo_size',
			array(
				'default'			=> '150',
				'capability'     	=> 'edit_theme_options',
				'sanitize_callback' => 'newsmash_sanitize_range_value',
				'transport'         => 'postMessage',
			)
		);
		$wp_customize->add_control( 
		new NewsMash_Customizer_Range_Control( $wp_customize, 'hdr_logo_size', 
			array(
				'label'      => __( 'Logo Size', 'newsmash' ),
				'section'  => 'title_tagline',
				 'media_query'   => true,
					'input_attr'    => array(
						'mobile'  => array(
							'min'           => 0,
							'max'           => 500,
							'step'          => 1,
							'default_value' => 150,
						),
						'tablet'  => array(
							'min'           => 0,
							'max'           => 500,
							'step'          => 1,
							'default_value' => 150,
						),
						'desktop' => array(
							'min'           => 0,
							'max'           => 500,
							'step'          => 1,
							'default_value' => 150,
						),
					),
			) ) 
		);
	}
	
	
	// Site Title Size // 
	if ( class_exists( 'NewsMash_Customizer_Range_Control' ) ) {
		$wp_customize->add_setting(
			'hdr_site_title_size',
			array(
				'default'			=> '55',
				'capability'     	=> 'edit_theme_options',
				'sanitize_callback' => 'newsmash_sanitize_range_value',
				'transport'         => 'postMessage',
			)
		);
		$wp_customize->add_control( 
		new NewsMash_Customizer_Range_Control( $wp_customize, 'hdr_site_title_size', 
			array(
				'label'      => __( 'Site Title Size', 'newsmash' ),
				'section'  => 'title_tagline',
				 'media_query'   => true,
					'input_attr'    => array(
						'mobile'  => array(
							'min'           => 0,
							'max'           => 100,
							'step'          => 1,
							'default_value' => 55,
						),
						'tablet'  => array(
							'min'           => 0,
							'max'           => 100,
							'step'          => 1,
							'default_value' => 55,
						),
						'desktop' => array(
							'min'           => 0,
							'max'           => 100,
							'step'          => 1,
							'default_value' => 55,
						),
					),
			) ) 
		);
	}
	
	// Site Tagline Size // 
	if ( class_exists( 'NewsMash_Customizer_Range_Control' ) ) {
		$wp_customize->add_setting(
			'hdr_site_desc_size',
			array(
				'default'			=> '16',
				'capability'     	=> 'edit_theme_options',
				'sanitize_callback' => 'newsmash_sanitize_range_value',
				'transport'         => 'postMessage',
			)
		);
		$wp_customize->add_control( 
		new NewsMash_Customizer_Range_Control( $wp_customize, 'hdr_site_desc_size', 
			array(
				'label'      => __( 'Site Tagline Size', 'newsmash' ),
				'section'  => 'title_tagline',
				 'media_query'   => true,
					'input_attr'    => array(
						'mobile'  => array(
							'min'           => 0,
							'max'           => 50,
							'step'          => 1,
							'default_value' => 16,
						),
						'tablet'  => array(
							'min'           => 0,
							'max'           => 50,
							'step'          => 1,
							'default_value' => 16,
						),
						'desktop' => array(
							'min'           => 0,
							'max'           => 50,
							'step'          => 1,
							'default_value' => 16,
						),
					),
			) ) 
		);
	}
	
	
	// Hide / Show
	$wp_customize->add_setting( 
		'newsmash_title_tagline_seo' , 
			array(
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 2,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_title_tagline_seo', 
		array(
			'label'	      => esc_html__( 'Enable Hidden Title (h1 missing SEO issue)', 'newsmash' ),
			'section'     => 'title_tagline',
			'type'        => 'checkbox'
		) 
	);	
	
	
	/*=========================================
	Top Header
	=========================================*/
	$wp_customize->add_section(
        'newsmash_top_header',
        array(
        	'priority'      => 2,
            'title' 		=> __('Top Header','newsmash'),
			'panel'  		=> 'header_options',
		)
    );	
	
	/*=========================================
	Global Setting
	=========================================*/
	$wp_customize->add_setting(
		'newsmash_hdr_top'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority' => 3,
		)
	);

	$wp_customize->add_control(
	'newsmash_hdr_top',
		array(
			'type' => 'hidden',
			'label' => __('Global Setting','newsmash'),
			'section' => 'newsmash_top_header',
		)
	);
	
	// Hide / Show
	$wp_customize->add_setting( 
		'newsmash_hs_hdr' , 
			array(
			'default' => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 2,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_hdr', 
		array(
			'label'	      => esc_html__( 'Hide/Show ?', 'newsmash' ),
			'section'     => 'newsmash_top_header',
			'type'        => 'checkbox'
		) 
	);	
	
	/*=========================================
	Date
	=========================================*/
	$wp_customize->add_setting(
		'newsmash_hdr_date'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority' => 3,
		)
	);

	$wp_customize->add_control(
	'newsmash_hdr_date',
		array(
			'type' => 'hidden',
			'label' => __('Date','newsmash'),
			'section' => 'newsmash_top_header',
		)
	);
	
	// Hide / Show
	$wp_customize->add_setting( 
		'newsmash_hs_hdr_date' , 
			array(
			'default' => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 2,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_hdr_date', 
		array(
			'label'	      => esc_html__( 'Hide/Show ?', 'newsmash' ),
			'section'     => 'newsmash_top_header',
			'type'        => 'checkbox'
		) 
	);	
	
	
	// Type
	$wp_customize->add_setting( 
		'newsmash_hdr_date_display' , 
			array(
			'default' => 'theme',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_select',
			'priority' => 2,
		) 
	);

	$wp_customize->add_control(
	'newsmash_hdr_date_display' , 
		array(
			'label'          => __( 'Date Display Type', 'newsmash' ),
			'section'        => 'newsmash_top_header',
			'type'           => 'select',
			'choices'        => 
			array(
				'theme' 	=> __( 'Theme Default', 'newsmash' ),
				'wp' 	=> __( 'WordPress', 'newsmash' )
			) 
		) 
	);
	
	/*=========================================
	Text
	=========================================*/
	$wp_customize->add_setting(
		'NewsMash_hdr_left_text_head'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority' => 24,
		)
	);

	$wp_customize->add_control(
	'NewsMash_hdr_left_text_head',
		array(
			'type' => 'hidden',
			'label' => __('Left Text','newsmash'),
			'section' => 'newsmash_top_header',
		)
	);
	
	
	$wp_customize->add_setting( 
		'newsmash_hs_hdr_left_text' , 
			array(
			'default' => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 24,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_hdr_left_text', 
		array(
			'label'	      => esc_html__( 'Hide/Show ?', 'newsmash' ),
			'section'     => 'newsmash_top_header',
			'type'        => 'checkbox'
		) 
	);
	
	//  title // 
	$wp_customize->add_setting(
    	'newsmash_hdr_left_ttl',
    	array(
	        'default'			=> __('<i class="fas fa-fire-alt"></i> Trending News:','newsmash'),
			'sanitize_callback' => 'newsmash_sanitize_html',
			'capability' => 'edit_theme_options',
			'transport'         => $selective_refresh,
			'priority' => 24,
		)
	);	

	$wp_customize->add_control( 
		'newsmash_hdr_left_ttl',
		array(
		    'label'   		=> __('Title','newsmash'),
		    'section' 		=> 'newsmash_top_header',
			'type'		 =>	'text'
		)  
	);
	
	// Select Blog Category
	$wp_customize->add_setting(
    'newsmash_hdr_left_text_cat',
		array(
		'default'	      => '0',	
		'capability' => 'edit_theme_options',
		'sanitize_callback' => 'absint',
		'priority' => 24,
		)
	);	
	$wp_customize->add_control( new Newsmash_Post_Category_Control( $wp_customize, 
	'newsmash_hdr_left_text_cat', 
		array(
		'label'   => __('Select Category','newsmash'),
		'description'   => __('Posts Title to be shown on Header Text','newsmash'),
		'section' => 'newsmash_top_header',
		) 
	) );
	
	
	/*=========================================
	Header Account
	=========================================*/	
	$wp_customize->add_setting(
		'newsmash_hdr_account'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority' => 24,
		)
	);

	$wp_customize->add_control(
	'newsmash_hdr_account',
		array(
			'type' => 'hidden',
			'label' => __('My Account','newsmash'),
			'section' => 'newsmash_top_header',
		)
	);
	
	
	$wp_customize->add_setting( 
		'newsmash_hs_hdr_account' , 
			array(
			'default' => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 24,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_hdr_account', 
		array(
			'label'	      => esc_html__( 'Hide/Show ?', 'newsmash' ),
			'section'     => 'newsmash_top_header',
			'type'        => 'checkbox'
		) 
	);	
	
	/*=========================================
	Address
	=========================================*/
	$wp_customize->add_setting(
		'newsmash_hdr_top_ads'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority' => 16,
		)
	);

	$wp_customize->add_control(
	'newsmash_hdr_top_ads',
		array(
			'type' => 'hidden',
			'label' => __('Address','newsmash'),
			'section' => 'newsmash_top_header',
			
		)
	);
	$wp_customize->add_setting( 
		'newsmash_hs_hdr_top_ads', 
			array(
			'default' => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 17,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_hdr_top_ads', 
		array(
			'label'	      => esc_html__( 'Hide/Show ?', 'newsmash' ),
			'section'     => 'newsmash_top_header',
			'type'        => 'checkbox'
		) 
	);	
	// icon // 
	$wp_customize->add_setting( 
		'newsmash_hdr_top_ads_icon', 
			array(
			'default' => 'fas fa-map-marker-alt',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_html',
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hdr_top_ads_icon', 
		array(
			'label'	      => esc_html__( 'Icon', 'newsmash' ),
			'section'     => 'newsmash_top_header',
			'type'        => 'text'
		) 
	);	
	
	// title // 
	$wp_customize->add_setting(
    	'newsmash_hdr_top_ads_title',
    	array(
	        'default'			=> __('Chicago 12, Melborne City, USA','newsmash'),
			'sanitize_callback' => 'newsmash_sanitize_html',
			'transport'         => $selective_refresh,
			'capability' => 'edit_theme_options',
			'priority' => 18,
		)
	);	

	$wp_customize->add_control( 
		'newsmash_hdr_top_ads_title',
		array(
		    'label'   		=> __('Title','newsmash'),
		    'section' 		=> 'newsmash_top_header',
			'type'		 =>	'text'
		)  
	);
	
	// Link // 
	$wp_customize->add_setting(
    	'newsmash_hdr_top_ads_link',
    	array(
			'sanitize_callback' => 'newsmash_sanitize_url',
			'capability' => 'edit_theme_options',
			'priority' => 19,
		)
	);	

	$wp_customize->add_control( 
		'newsmash_hdr_top_ads_link',
		array(
		    'label'   		=> __('Link','newsmash'),
		    'section' 		=> 'newsmash_top_header',
			'type'		 =>	'text'
		)  
	);
		
	
	/*=========================================
	Social
	=========================================*/
	$wp_customize->add_setting(
		'NewsMash_hdr_social_head'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority' => 24,
		)
	);

	$wp_customize->add_control(
	'NewsMash_hdr_social_head',
		array(
			'type' => 'hidden',
			'label' => __('Social Icons','newsmash'),
			'section' => 'newsmash_top_header',
		)
	);
	
	
	$wp_customize->add_setting( 
		'newsmash_hs_hdr_social' , 
			array(
			'default' => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 25,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_hdr_social', 
		array(
			'label'	      => esc_html__( 'Hide/Show ?', 'newsmash' ),
			'section'     => 'newsmash_top_header',
			'type'        => 'checkbox'
		) 
	);
	
	/**
	 * Customizer Repeater
	 */
		$wp_customize->add_setting( 'newsmash_hdr_social', 
			array(
			 'sanitize_callback' => 'newsmash_repeater_sanitize',
			 'priority' => 26,
			 'default' => newsmash_get_social_icon_default()
		)
		);
		
		$wp_customize->add_control( 
			new NEWSMASH_Repeater( $wp_customize, 
				'newsmash_hdr_social', 
					array(
						'label'   => esc_html__('Social Icons','newsmash'),
						'section' => 'newsmash_top_header',
						'customizer_repeater_icon_control' => true,
						'customizer_repeater_link_control' => true,
					) 
				) 
			);
	
	// Upgrade
	if ( class_exists( 'Desert_Companion_Customize_Upgrade_Control' ) ) {
		$wp_customize->add_setting(
		'newsmash_social_option_upsale', 
		array(
			'capability' => 'edit_theme_options',
			'sanitize_callback' => 'sanitize_text_field',
			'priority' => 26,
		));
		
		$wp_customize->add_control( 
			new Desert_Companion_Customize_Upgrade_Control
			($wp_customize, 
				'newsmash_social_option_upsale', 
				array(
					'label'      => __( 'Icons', 'newsmash' ),
					'section'    => 'newsmash_top_header'
				) 
			) 
		);
	}
	
	/*=========================================
	Header Navigation
	=========================================*/	
	$wp_customize->add_section(
        'newsmash_hdr_nav',
        array(
        	'priority'      => 4,
            'title' 		=> __('Navigation Bar','newsmash'),
			'panel'  		=> 'header_options',
		)
    );
	
	
	/*=========================================
	Header Cart
	=========================================*/	
	$wp_customize->add_setting(
		'newsmash_hdr_cart'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority' => 1,
		)
	);

	$wp_customize->add_control(
	'newsmash_hdr_cart',
		array(
			'type' => 'hidden',
			'label' => __('WooCommerce Cart','newsmash'),
			'section' => 'newsmash_hdr_nav',
		)
	);
	
	
	$wp_customize->add_setting( 
		'newsmash_hs_hdr_cart' , 
			array(
			'default' => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 2,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_hdr_cart', 
		array(
			'label'	      => esc_html__( 'Hide/Show ?', 'newsmash' ),
			'section'     => 'newsmash_hdr_nav',
			'type'        => 'checkbox'
		) 
	);	
	
	
	
	
	/*=========================================
	Header Search
	=========================================*/	
	$wp_customize->add_setting(
		'newsmash_hdr_search'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority' => 3,
		)
	);

	$wp_customize->add_control(
	'newsmash_hdr_search',
		array(
			'type' => 'hidden',
			'label' => __('Site Search','newsmash'),
			'section' => 'newsmash_hdr_nav',
		)
	);
	$wp_customize->add_setting( 
		'newsmash_hs_hdr_search' , 
			array(
			'default' => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 4,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_hdr_search', 
		array(
			'label'	      => esc_html__( 'Hide/Show ?', 'newsmash' ),
			'section'     => 'newsmash_hdr_nav',
			'type'        => 'checkbox'
		) 
	);	
	
	/*=========================================
	Header Button
	=========================================*/	
	$wp_customize->add_setting(
		'newsmash_hdr_button'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority' => 7,
		)
	);

	$wp_customize->add_control(
	'newsmash_hdr_button',
		array(
			'type' => 'hidden',
			'label' => __('Button','newsmash'),
			'section' => 'newsmash_hdr_nav',
		)
	);
	

	$wp_customize->add_setting(
		'newsmash_hs_hdr_btn' , 
			array(
			'default' => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 8,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_hdr_btn', 
		array(
			'label'	      => esc_html__( 'Hide/Show ?', 'newsmash' ),
			'section'     => 'newsmash_hdr_nav',
			'type'        => 'checkbox'
		) 
	);
	
	// Button Label // 
	$wp_customize->add_setting(
    	'newsmash_hdr_btn_lbl',
    	array(
	        'default'			=> __('Get Started','newsmash'),
			'sanitize_callback' => 'newsmash_sanitize_html',
			'capability' => 'edit_theme_options',
			'transport'         => $selective_refresh,
			'priority' => 9,
		)
	);	

	$wp_customize->add_control( 
		'newsmash_hdr_btn_lbl',
		array(
		    'label'   		=> __('Button Label','newsmash'),
		    'section' 		=> 'newsmash_hdr_nav',
			'type'		 =>	'text'
		)  
	);
	
	// Button Link // 
	$wp_customize->add_setting(
    	'newsmash_hdr_btn_link',
    	array(
			'default'			=> '#',
			'sanitize_callback' => 'newsmash_sanitize_url',
			'capability' => 'edit_theme_options',
			'priority' => 10,
		)
	);	

	$wp_customize->add_control( 
		'newsmash_hdr_btn_link',
		array(
		    'label'   		=> __('Button Link','newsmash'),
		    'section' 		=> 'newsmash_hdr_nav',
			'type'		 =>	'text'
		)  
	);
	
	
	// Open New Tab
	$wp_customize->add_setting( 
		'newsmash_hdr_btn_target' , 
			array(
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 11,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hdr_btn_target', 
		array(
			'label'	      => esc_html__( 'Open in New Tab ?', 'newsmash' ),
			'section'     => 'newsmash_hdr_nav',
			'type'        => 'checkbox'
		) 
	);	
	
	/*=========================================
	Sticky Header
	=========================================*/	
	$wp_customize->add_section(
        'newsmash_sticky_header_set',
        array(
        	'priority'      => 4,
            'title' 		=> __('Header Sticky','newsmash'),
			'panel'  		=> 'header_options',
		)
    );
	
	// Heading
	$wp_customize->add_setting(
		'newsmash_hdr_sticky'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
			'priority' => 1,
		)
	);

	$wp_customize->add_control(
	'newsmash_hdr_sticky',
		array(
			'type' => 'hidden',
			'label' => __('Sticky Header','newsmash'),
			'section' => 'newsmash_sticky_header_set',
		)
	);
	$wp_customize->add_setting( 
		'newsmash_hs_hdr_sticky' , 
			array(
			'default' => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'priority' => 2,
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_hdr_sticky', 
		array(
			'label'	      => esc_html__( 'Hide/Show ?', 'newsmash' ),
			'section'     => 'newsmash_sticky_header_set',
			'type'        => 'checkbox'
		) 
	);	
}
add_action( 'customize_register', 'newsmash_header_customize_settings' );

