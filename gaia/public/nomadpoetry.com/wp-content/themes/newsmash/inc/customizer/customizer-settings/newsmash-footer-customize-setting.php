<?php
function newsmash_footer_customize_settings( $wp_customize ) {
$selective_refresh = isset( $wp_customize->selective_refresh ) ? 'postMessage' : 'refresh';
	// Footer Section Panel // 
	$wp_customize->add_panel( 
		'footer_options', 
		array(
			'priority'      => 34,
			'capability'    => 'edit_theme_options',
			'title'			=> __('Footer Options', 'newsmash'),
		) 
	);
	
	/*=========================================
	Footer Widget
	=========================================*/
	$wp_customize->add_section(
        'newsmash_footer_widget',
        array(
            'title' 		=> __('Footer Widget','newsmash'),
			'panel'  		=> 'footer_options',
			'priority'      => 3,
		)
    );
	
	// Heading
	$wp_customize->add_setting(
		'newsmash_footer_widget_head'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
		)
	);

	$wp_customize->add_control(
	'newsmash_footer_widget_head',
		array(
			'type' => 'hidden',
			'label' => __('Footer Widget','newsmash'),
			'section' => 'newsmash_footer_widget',
			'priority'  => 1,
		)
	);
	
	
	// column // 
	$wp_customize->add_setting(
    	'newsmash_footer_widget_column',
    	array(
	        'default'			=> '4',
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_select',
			'priority' => 3,
		)
	);	

	$wp_customize->add_control(
		'newsmash_footer_widget_column',
		array(
		    'label'   		=> __('Select Widget Column','newsmash'),
		    'section' 		=> 'newsmash_footer_widget',
			'type'			=> 'select',
			'choices'        => 
			array(
				'' => __( 'None', 'newsmash' ),
				'1' => __( '1 Column', 'newsmash' ),
				'2' => __( '2 Column', 'newsmash' ),
				'3' => __( '3 Column', 'newsmash' ),
				'4' => __( '4 Column', 'newsmash' )
			) 
		) 
	);
	
	
	/*=========================================
	Footer Copright
	=========================================*/
	$wp_customize->add_section(
        'newsmash_footer_copyright',
        array(
            'title' 		=> __('Footer Copright','newsmash'),
			'panel'  		=> 'footer_options',
			'priority'      => 4,
		)
    );
	
	// Heading
	$wp_customize->add_setting(
		'newsmash_footer_copyright_first_head'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
		)
	);

	$wp_customize->add_control(
	'newsmash_footer_copyright_first_head',
		array(
			'type' => 'hidden',
			'label' => __('Copyright','newsmash'),
			'section' => 'newsmash_footer_copyright',
			'priority'  => 3,
		)
	);
	
	// footer  text // 
	$newsmash_copyright = esc_html__('Copyright &copy; [current_year] [site_title] | Powered by [theme_author]', 'newsmash' );
	$wp_customize->add_setting(
    	'newsmash_footer_copyright_text',
    	array(
			'default' => $newsmash_copyright,
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_html',
		)
	);	

	$wp_customize->add_control( 
		'newsmash_footer_copyright_text',
		array(
		    'label'   		=> __('Copyright','newsmash'),
		    'section'		=> 'newsmash_footer_copyright',
			'type' 			=> 'textarea',
			'priority'      => 4,
		)  
	);	
	
	
	// Heading
	$wp_customize->add_setting(
		'newsmash_footer_copyright_social_head'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
		)
	);

	$wp_customize->add_control(
	'newsmash_footer_copyright_social_head',
		array(
			'type' => 'hidden',
			'label' => __('Social','newsmash'),
			'section' => 'newsmash_footer_copyright',
			'priority'  => 5,
		)
	);
	
	// Hide/Show
	$wp_customize->add_setting( 
		'newsmash_footer_copyright_social_hs' , 
			array(
			'default' => '1',
			'capability'     => 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_footer_copyright_social_hs', 
		array(
			'label'	      => esc_html__( 'Hide/Show ?', 'newsmash' ),
			'section'     => 'newsmash_footer_copyright',
			'type'        => 'checkbox',
			'priority' => 5,
		) 
	);
	
	/**
	 * Customizer Repeater
	 */
		$wp_customize->add_setting( 'newsmash_footer_copyright_social', 
			array(
			 'sanitize_callback' => 'newsmash_repeater_sanitize',
			 'default' => newsmash_get_social_icon_default()
		)
		);
		
		$wp_customize->add_control( 
			new NEWSMASH_Repeater( $wp_customize, 
				'newsmash_footer_copyright_social', 
					array(
						'label'   => esc_html__('Social Icons','newsmash'),
						'priority' => 5,
						'section' => 'newsmash_footer_copyright',
						'customizer_repeater_icon_control' => true,
						'customizer_repeater_link_control' => true,
					) 
				) 
			);
	
	/*=========================================
	Scroller
	=========================================*/
	// Heading
	$wp_customize->add_setting(
		'newsmash_scroller_option'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
		)
	);

	$wp_customize->add_control(
	'newsmash_scroller_option',
		array(
			'type' => 'hidden',
			'label' => __('Top Scroller','newsmash'),
			'section' => 'newsmash_footer_copyright',
			'priority' => 5,
		)
	);
	
	// Hide/show
	$wp_customize->add_setting( 
		'newsmash_hs_scroller_option' , 
			array(
			'default' => '1',
			'sanitize_callback' => 'newsmash_sanitize_checkbox',
			'capability' => 'edit_theme_options',
		) 
	);
	
	$wp_customize->add_control(
	'newsmash_hs_scroller_option', 
		array(
			'label'	      => esc_html__( 'Hide / Show Scroller', 'newsmash' ),
			'section'     => 'newsmash_footer_copyright',
			'type'        => 'checkbox',
			'priority' => 5,
		) 
	);
	
	// Scroller text // 
	$wp_customize->add_setting(
    	'newsmash_scroller_text',
    	array(
			'default' => esc_html__( 'Back to Top', 'newsmash' ),
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_html',
			'transport'         => $selective_refresh,
		)
	);	

	$wp_customize->add_control( 
		'newsmash_scroller_text',
		array(
		    'label'   		=> __('Scroller text','newsmash'),
		    'section'		=> 'newsmash_footer_copyright',
			'type' 			=> 'text',
			'priority'      => 5,
		)  
	);	
}
add_action( 'customize_register', 'newsmash_footer_customize_settings' );