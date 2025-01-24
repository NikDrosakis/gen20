<?php
function newsmash_typography_customize( $wp_customize ) {
$selective_refresh = isset( $wp_customize->selective_refresh ) ? 'postMessage' : 'refresh';	

	$wp_customize->add_panel(
		'newsmash_typography_options', array(
			'priority' => 38,
			'title' => esc_html__( 'Typography', 'newsmash' ),
		)
	);	
	
	/*=========================================
	NewsMash Typography
	=========================================*/
	$wp_customize->add_section(
        'newsmash_typography_options',
        array(
        	'priority'      => 1,
            'title' 		=> __('Body Typography','newsmash'),
			'panel'  		=> 'newsmash_typography_options',
		)
    );
	
	 /**
     * Font Family
     */
	
	$wp_customize->add_setting( 'newsmash_body_font_family_option', array(
      'capability'        => 'edit_theme_options',
      'default'           => '',
      'transport'         => 'postMessage',
      'sanitize_callback' => 'newsmash_sanitize_select',
    ) );

    $wp_customize->add_control(
        new WP_Customize_Control(
                $wp_customize, 'newsmash_body_font_family_option', array(
            'label'       => __( 'Font Family', 'newsmash' ),
            'section'     => 'newsmash_typography_options',
            'type'        =>  'select',
            'priority'    => 1,
            'choices'     =>  array(
                ''   =>  __( 'Default', 'newsmash' ),
                ),
            )
        )
    );
	
	// Body Font Size // 
	if ( class_exists( 'NewsMash_Customizer_Range_Control' ) ) {
		$wp_customize->add_setting(
			'newsmash_body_font_size_option',
			array(
				'capability'     	=> 'edit_theme_options',
				'sanitize_callback' => 'newsmash_sanitize_range_value',
				'transport'         => 'postMessage',
			)
		);
		$wp_customize->add_control( 
		new NewsMash_Customizer_Range_Control( $wp_customize, 'newsmash_body_font_size_option', 
			array(
				'label'      => __( 'Size', 'newsmash' ),
				'section'  => 'newsmash_typography_options',
				'priority'      => 2,
				 'media_query'   => true,
                'input_attr'    => array(
                    'mobile'  => array(
                        'min'           => 1,
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
	
	// Body Font Size // 
	if ( class_exists( 'NewsMash_Customizer_Range_Control' ) ) {
		$wp_customize->add_setting(
			'newsmash_body_line_height_option',
			array(
				'capability'     	=> 'edit_theme_options',
				'sanitize_callback' => 'newsmash_sanitize_range_value',
				'transport'         => 'postMessage',
			)
		);
		$wp_customize->add_control( 
		new NewsMash_Customizer_Range_Control( $wp_customize, 'newsmash_body_line_height_option', 
			array(
				'label'      => __( 'Line Height', 'newsmash' ),
				'section'  => 'newsmash_typography_options',
				'priority'      => 3,
				 'media_query'   => true,
                'input_attr'    => array(
                    'mobile'  => array(
                        'min'           => 0,
                        'max'           => 3,
                        'step'          => 0.1,
                        'default_value' => 1.6,
                    ),
                    'tablet'  => array(
                        'min'           => 0,
                        'max'           => 3,
                        'step'          => 0.1,
                        'default_value' => 1.6,
                    ),
                    'desktop' => array(
                       'min'           => 0,
                        'max'           => 3,
                        'step'          => 0.1,
                        'default_value' => 1.6,
                    ),
				)	
			) ) 
		);
	}
	
	// Body Font Size // 
	if ( class_exists( 'NewsMash_Customizer_Range_Control' ) ) {
		$wp_customize->add_setting(
			'newsmash_body_ltr_space_option',
			array(
                'default'           => '0.1',
				'capability'     	=> 'edit_theme_options',
				'sanitize_callback' => 'newsmash_sanitize_range_value',
				'transport'         => 'postMessage',
			)
		);
		$wp_customize->add_control( 
		new NewsMash_Customizer_Range_Control( $wp_customize, 'newsmash_body_ltr_space_option', 
			array(
				'label'      => __( 'Letter Spacing', 'newsmash' ),
				'section'  => 'newsmash_typography_options',
				'priority'      => 4,
				 'media_query'   => true,
                'input_attr'    => array(
                    'mobile'  => array(
                        'min'           => -10,
                        'max'           => 10,
                        'step'          => 1,
                        'default_value' => 0,
                    ),
                    'tablet'  => array(
                       'min'           => -10,
                        'max'           => 10,
                        'step'          => 1,
                        'default_value' => 0,
                    ),
                    'desktop' => array(
                       'min'           => -10,
                        'max'           => 10,
                        'step'          => 1,
                        'default_value' => 0,
                    ),
				)	
			) ) 
		);
	}
	
	// Body Font weight // 
	 $wp_customize->add_setting( 'newsmash_body_font_weight_option', array(
      'capability'        => 'edit_theme_options',
      'default'           => 'inherit',
      'transport'         => 'postMessage',
      'sanitize_callback' => 'newsmash_sanitize_select',
    ) );

    $wp_customize->add_control(
        new WP_Customize_Control(
                $wp_customize, 'newsmash_body_font_weight_option', array(
            'label'       => __( 'Weight', 'newsmash' ),
            'section'     => 'newsmash_typography_options',
            'type'        =>  'select',
            'priority'    => 5,
            'choices'     =>  array(
                'inherit'   =>  __( 'Default', 'newsmash' ),
                '100'       =>  __( 'Thin: 100', 'newsmash' ),
                '200'       =>  __( 'Light: 200', 'newsmash' ),
                '300'       =>  __( 'Book: 300', 'newsmash' ),
                '400'       =>  __( 'Normal: 400', 'newsmash' ),
                '500'       =>  __( 'Medium: 500', 'newsmash' ),
                '600'       =>  __( 'Semibold: 600', 'newsmash' ),
                '700'       =>  __( 'Bold: 700', 'newsmash' ),
                '800'       =>  __( 'Extra Bold: 800', 'newsmash' ),
                '900'       =>  __( 'Black: 900', 'newsmash' ),
                ),
            )
        )
    );
	
	// Body Font style // 
	 $wp_customize->add_setting( 'newsmash_body_font_style_option', array(
      'capability'        => 'edit_theme_options',
      'default'           => 'inherit',
      'transport'         => 'postMessage',
      'sanitize_callback' => 'newsmash_sanitize_select',
    ) );

    $wp_customize->add_control(
        new WP_Customize_Control(
                $wp_customize, 'newsmash_body_font_style_option', array(
            'label'       => __( 'Font Style', 'newsmash' ),
            'section'     => 'newsmash_typography_options',
            'type'        =>  'select',
            'priority'    => 6,
            'choices'     =>  array(
                'inherit'   =>  __( 'Inherit', 'newsmash' ),
                'normal'       =>  __( 'Normal', 'newsmash' ),
                'italic'       =>  __( 'Italic', 'newsmash' ),
                'oblique'       =>  __( 'oblique', 'newsmash' ),
                ),
            )
        )
    );
	// Body Text Transform // 
	 $wp_customize->add_setting( 'newsmash_body_text_transform_option', array(
      'capability'        => 'edit_theme_options',
      'default'           => 'inherit',
      'transport'         => 'postMessage',
      'sanitize_callback' => 'newsmash_sanitize_select',
    ) );

    $wp_customize->add_control(
        new WP_Customize_Control(
            $wp_customize, 'newsmash_body_text_transform_option', array(
                'label'       => __( 'Transform', 'newsmash' ),
                'section'     => 'newsmash_typography_options',
                'type'        => 'select',
                'priority'    => 7,
                'choices'     => array(
                    'inherit'       =>  __( 'Default', 'newsmash' ),
                    'uppercase'     =>  __( 'Uppercase', 'newsmash' ),
                    'lowercase'     =>  __( 'Lowercase', 'newsmash' ),
                    'capitalize'    =>  __( 'Capitalize', 'newsmash' ),
                ),
            )
        )
    );
	
	// Body Text Decoration // 
	 $wp_customize->add_setting( 'newsmash_body_txt_decoration_option', array(
      'capability'        => 'edit_theme_options',
      'default'           => 'inherit',
      'transport'         => 'postMessage',
      'sanitize_callback' => 'newsmash_sanitize_select',
    ) );

    $wp_customize->add_control(
        new WP_Customize_Control(
            $wp_customize, 'newsmash_body_txt_decoration_option', array(
                'label'       => __( 'Text Decoration', 'newsmash' ),
                'section'     => 'newsmash_typography_options',
                'type'        => 'select',
                'priority'    => 8,
                'choices'     => array(
                    'inherit'       =>  __( 'Inherit', 'newsmash' ),
                    'underline'     =>  __( 'Underline', 'newsmash' ),
                    'overline'     =>  __( 'Overline', 'newsmash' ),
                    'line-through'    =>  __( 'Line Through', 'newsmash' ),
					'none'    =>  __( 'None', 'newsmash' ),
                ),
            )
        )
    );
	
	// Upgrade
	if ( class_exists( 'Desert_Companion_Customize_Upgrade_Control' ) ) {
		$wp_customize->add_setting(
		'newsmash_body_typography_option_upsale', 
		array(
			'capability' => 'edit_theme_options',
			'sanitize_callback' => 'sanitize_text_field',
		));
		
		$wp_customize->add_control( 
			new Desert_Companion_Customize_Upgrade_Control
			($wp_customize, 
				'newsmash_body_typography_option_upsale', 
				array(
					'label'      => __( 'Typography Features', 'newsmash' ),
					'section'    => 'newsmash_typography_options',
					'priority' => 8,
				) 
			) 
		);	
	}
	/*=========================================
	 NewsMash Typography Headings
	=========================================*/
	$wp_customize->add_section(
        'newsmash_headings_typography',
        array(
        	'priority'      => 2,
            'title' 		=> __('Headings (H1-H6) Typography','newsmash'),
			'panel'  		=> 'newsmash_typography_options',
		)
    );
	
	/*=========================================
	 NewsMash Typography H1
	=========================================*/
	for ( $i = 1; $i <= 6; $i++ ) {
	if($i  == '1'){$j=36;}elseif($i  == '2'){$j=32;}elseif($i  == '3'){$j=28;}elseif($i  == '4'){$j=24;}elseif($i  == '5'){$j=20;}else{$j=16;}
	$wp_customize->add_setting(
		'h' . $i . '_typography'
			,array(
			'capability'     	=> 'edit_theme_options',
			'sanitize_callback' => 'newsmash_sanitize_text',
		)
	);

	$wp_customize->add_control(
	'h' . $i . '_typography',
		array(
			'type' => 'hidden',
			'label' => esc_html('H' . $i .' Typography','newsmash'),
			'section' => 'newsmash_headings_typography',
		)
	);
	
	
	$wp_customize->add_setting( 'newsmash_h' . $i . '_font_family_option', array(
      'capability'        => 'edit_theme_options',
      'default'           => '',
      'transport'         => 'postMessage',
      'sanitize_callback' => 'newsmash_sanitize_select',
    ) );

    $wp_customize->add_control(
        new WP_Customize_Control(
                $wp_customize, 'newsmash_h' . $i . '_font_family_option', array(
            'label'       => __( 'Font Family', 'newsmash' ),
            'section'     => 'newsmash_headings_typography',
            'type'        =>  'select',
            'choices'     =>  array(
                ''   =>  __( 'Default', 'newsmash' ),
                ),
            )
        )
    );
	

	// Heading Font Size // 
	if ( class_exists( 'NewsMash_Customizer_Range_Control' ) ) {
		$wp_customize->add_setting(
			'newsmash_h' . $i . '_font_size_option',
			array(
				'capability'     	=> 'edit_theme_options',
				'sanitize_callback' => 'newsmash_sanitize_range_value',
				'transport'         => 'postMessage'
			)
		);
		$wp_customize->add_control( 
		new NewsMash_Customizer_Range_Control( $wp_customize, 'newsmash_h' . $i . '_font_size_option', 
			array(
				'label'      => __( 'Font Size', 'newsmash' ),
				'section'  => 'newsmash_headings_typography',
				'media_query'   => true,
				'input_attr'    => array(
                    'mobile'  => array(
                        'min'           => 1,
                        'max'           => 100,
                        'step'          => 1,
                        'default_value' => $j,
                    ),
                    'tablet'  => array(
                        'min'           => 1,
                        'max'           => 100,
                        'step'          => 1,
                        'default_value' => $j,
                    ),
                    'desktop' => array(
                       'min'           => 1,
                        'max'           => 100,
                        'step'          => 1,
					    'default_value' => $j,
                    ),
				)	
			) ) 
		);
	}
	
	// Heading Font Size // 
	if ( class_exists( 'NewsMash_Customizer_Range_Control' ) ) {
		$wp_customize->add_setting(
			'newsmash_h' . $i . '_line_height_option',
			array(
				'capability'     	=> 'edit_theme_options',
				'sanitize_callback' => 'newsmash_sanitize_range_value',
				'transport'         => 'postMessage',
			)
		);
		$wp_customize->add_control( 
		new NewsMash_Customizer_Range_Control( $wp_customize, 'newsmash_h' . $i . '_line_height_option', 
			array(
				'label'      => __( 'Line Height', 'newsmash' ),
				'section'  => 'newsmash_headings_typography',
				'media_query'   => true,
				'input_attrs' => array(
					'min'    => 0,
					'max'    => 5,
					'step'   => 0.1,
					//'suffix' => 'px', //optional suffix
				),
				 'input_attr'    => array(
                    'mobile'  => array(
                        'min'           => 0,
                        'max'           => 3,
                        'step'          => 0.1,
                        'default_value' => 1.2,
                    ),
                    'tablet'  => array(
                        'min'           => 0,
                        'max'           => 3,
                        'step'          => 0.1,
                        'default_value' => 1.2,
                    ),
                    'desktop' => array(
                       'min'           => 0,
                        'max'           => 3,
                        'step'          => 0.1,
                        'default_value' => 1.2,
                    ),
				)	
			) ) 
		);
		}
	// Heading Letter Spacing // 
	if ( class_exists( 'NewsMash_Customizer_Range_Control' ) ) {
		$wp_customize->add_setting(
			'newsmash_h' . $i . '_ltr_space_option',
			array(
				'capability'     	=> 'edit_theme_options',
				'sanitize_callback' => 'newsmash_sanitize_range_value',
				'transport'         => 'postMessage',
			)
		);
		$wp_customize->add_control( 
		new NewsMash_Customizer_Range_Control( $wp_customize, 'newsmash_h' . $i . '_ltr_space_option', 
			array(
				'label'      => __( 'Letter Spacing', 'newsmash' ),
				'section'  => 'newsmash_headings_typography',
				 'media_query'   => true,
                'input_attr'    => array(
                    'mobile'  => array(
                        'min'           => -10,
                        'max'           => 10,
                        'step'          => 1,
                        'default_value' => 0.1,
                    ),
                    'tablet'  => array(
                       'min'           => -10,
                        'max'           => 10,
                        'step'          => 1,
                        'default_value' => 0.1,
                    ),
                    'desktop' => array(
                       'min'           => -10,
                        'max'           => 10,
                        'step'          => 1,
                        'default_value' => 0.1,
                    ),
				)	
			) ) 
		);
	}
	
	// Heading Font weight // 
	 $wp_customize->add_setting( 'newsmash_h' . $i . '_font_weight_option', array(
		  'capability'        => 'edit_theme_options',
		  'default'           => '700',
		  'transport'         => 'postMessage',
		  'sanitize_callback' => 'newsmash_sanitize_select',
		) );

    $wp_customize->add_control(
        new WP_Customize_Control(
                $wp_customize, 'newsmash_h' . $i . '_font_weight_option', array(
            'label'       => __( 'Font Weight', 'newsmash' ),
            'section'     => 'newsmash_headings_typography',
            'type'        =>  'select',
            'choices'     =>  array(
                'inherit'   =>  __( 'Inherit', 'newsmash' ),
                '100'       =>  __( 'Thin: 100', 'newsmash' ),
                '200'       =>  __( 'Light: 200', 'newsmash' ),
                '300'       =>  __( 'Book: 300', 'newsmash' ),
                '400'       =>  __( 'Normal: 400', 'newsmash' ),
                '500'       =>  __( 'Medium: 500', 'newsmash' ),
                '600'       =>  __( 'Semibold: 600', 'newsmash' ),
                '700'       =>  __( 'Bold: 700', 'newsmash' ),
                '800'       =>  __( 'Extra Bold: 800', 'newsmash' ),
                '900'       =>  __( 'Black: 900', 'newsmash' ),
                ),
            )
        )
    );
	
	// Heading Font style // 
	 $wp_customize->add_setting( 'newsmash_h' . $i . '_font_style_option', array(
      'capability'        => 'edit_theme_options',
      'default'           => 'inherit',
      'transport'         => 'postMessage',
      'sanitize_callback' => 'newsmash_sanitize_select',
    ) );

    $wp_customize->add_control(
        new WP_Customize_Control(
                $wp_customize, 'newsmash_h' . $i . '_font_style_option', array(
            'label'       => __( 'Font Style', 'newsmash' ),
            'section'     => 'newsmash_headings_typography',
            'type'        =>  'select',
            'choices'     =>  array(
                'inherit'   =>  __( 'Inherit', 'newsmash' ),
                'normal'       =>  __( 'Normal', 'newsmash' ),
                'italic'       =>  __( 'Italic', 'newsmash' ),
                'oblique'       =>  __( 'oblique', 'newsmash' ),
                ),
            )
        )
    );
	
	// Heading Text Transform // 
	 $wp_customize->add_setting( 'newsmash_h' . $i . '_text_transform_option', array(
      'capability'        => 'edit_theme_options',
      'default'           => 'inherit',
      'transport'         => 'postMessage',
      'sanitize_callback' => 'newsmash_sanitize_select',
    ) );

    $wp_customize->add_control(
        new WP_Customize_Control(
            $wp_customize, 'newsmash_h' . $i . '_text_transform_option', array(
                'label'       => __( 'Text Transform', 'newsmash' ),
                'section'     => 'newsmash_headings_typography',
                'type'        => 'select',
                'choices'     => array(
                    'inherit'       =>  __( 'Default', 'newsmash' ),
                    'uppercase'     =>  __( 'Uppercase', 'newsmash' ),
                    'lowercase'     =>  __( 'Lowercase', 'newsmash' ),
                    'capitalize'    =>  __( 'Capitalize', 'newsmash' ),
                ),
            )
        )
    );
	
	// Heading Text Decoration // 
	 $wp_customize->add_setting( 'newsmash_h' . $i . '_txt_decoration_option', array(
      'capability'        => 'edit_theme_options',
      'default'           => 'inherit',
      'transport'         => 'postMessage',
      'sanitize_callback' => 'newsmash_sanitize_select',
    ) );

    $wp_customize->add_control(
        new WP_Customize_Control(
            $wp_customize, 'newsmash_h' . $i . '_txt_decoration_option', array(
                'label'       => __( 'Text Decoration', 'newsmash' ),
                'section'     => 'newsmash_headings_typography',
                'type'        => 'select',
                'choices'     => array(
                    'inherit'       =>  __( 'Inherit', 'newsmash' ),
                    'underline'     =>  __( 'Underline', 'newsmash' ),
                    'overline'     =>  __( 'Overline', 'newsmash' ),
                    'line-through'    =>  __( 'Line Through', 'newsmash' ),
					'none'    =>  __( 'None', 'newsmash' ),
                ),
            )
        )
    );
	
	// Upgrade
	if ( class_exists( 'Desert_Companion_Customize_Upgrade_Control' ) ) {
		$wp_customize->add_setting(
		'newsmash_h' . $i . '_typography_option_upsale', 
		array(
			'capability' => 'edit_theme_options',
			'sanitize_callback' => 'sanitize_text_field',
		));
		
		$wp_customize->add_control( 
			new Desert_Companion_Customize_Upgrade_Control
			($wp_customize, 
				'newsmash_h' . $i . '_typography_option_upsale', 
				array(
					'label'      => __( 'Typography Features', 'newsmash' ),
					'section'    => 'newsmash_headings_typography',
				) 
			) 
		);	
	}
}
}
add_action( 'customize_register', 'newsmash_typography_customize' );