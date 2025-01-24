/**
 * File customizer.js.
 *
 * Theme Customizer enhancements for a better user experience.
 *
 * Contains handlers to make Theme Customizer preview reload changes asynchronously.
 */

( function( $ ) {

	/**
     * Outputs custom css for responsive controls
     * @param  {[string]} setting customizer setting
     * @param  {[string]} css_selector
     * @param  {[array]} css_prop css property to write
     * @param  {String} ext css value extension eg: px, in
     * @return {[string]} css output
     */
    function range_live_media_load( setting, css_selector, css_prop, ext = '' ) {
        wp.customize(
            setting, function( value ) {
                'use strict';
                value.bind(
                    function( to ){
                        var values          = JSON.parse( to );
                        var desktop_value   = JSON.parse( values.desktop );
                        var tablet_value    = JSON.parse( values.tablet );
                        var mobile_value    = JSON.parse( values.mobile );

                        var class_name      = 'customizer-' + setting;
                        var css_class       = $( '.' + class_name );
                        var selector_name   = css_selector;
                        var property_name   = css_prop;

                        var desktop_css     = '';
                        var tablet_css      = '';
                        var mobile_css      = '';

                        if ( property_name.length == 1 ) {
                            var desktop_css     = property_name[0] + ': ' + desktop_value + ext + ';';
                            var tablet_css      = property_name[0] + ': ' + tablet_value + ext + ';';
                            var mobile_css      = property_name[0] + ': ' + mobile_value + ext + ';';
                        } else if ( property_name.length == 2 ) {
                            var desktop_css     = property_name[0] + ': ' + desktop_value + ext + ';';
                            var desktop_css     = desktop_css + property_name[1] + ': ' + desktop_value + ext + ';';

                            var tablet_css      = property_name[0] + ': ' + tablet_value + ext + ';';
                            var tablet_css      = tablet_css + property_name[1] + ': ' + tablet_value + ext + ';';

                            var mobile_css      = property_name[0] + ': ' + mobile_value + ext + ';';
                            var mobile_css      = mobile_css + property_name[1] + ': ' + mobile_value + ext + ';';
                        }

                        var head_append     = '<style class="' + class_name + '">@media (min-width: 320px){ ' + selector_name + ' { ' + mobile_css + ' } } @media (min-width: 720px){ ' + selector_name + ' { ' + tablet_css + ' } } @media (min-width: 960px){ ' + selector_name + ' { ' + desktop_css + ' } }</style>';

                        if ( css_class.length ) {
                            css_class.replaceWith( head_append );
                        } else {
                            $( "head" ).append( head_append );
                        }
                    }
                );
            }
        );
    }
	// Site title and description.
	wp.customize( 'blogname', function( value ) {
		value.bind( function( to ) {
			$( 'body header .site--logo .site--title' ).text( to );
		} );
	} );
	wp.customize( 'blogdescription', function( value ) {
		value.bind( function( to ) {
			$( 'body header .site--logo .site--description' ).text( to );
		} );
	} );

	// Header text color.
	wp.customize( 'header_textcolor', function( value ) {
		value.bind( function( to ) {
			if ( 'blank' === to ) {
				$( 'body header .site--logo .site--title, body header .site--logo .site--description' ).css( {
					'clip': 'rect(1px, 1px, 1px, 1px)',
					'position': 'absolute'
				} );
			} else {
				$( 'body header .site--logo .site--title, body header .site--logo .site--description' ).css( {
					'clip': 'auto',
					'position': 'relative'
				} );
				$( 'body header .site--logo .site--title, body header .site--logo .site--description' ).css( {
					'color': to
				} );
			}
		} );
	} );
	
	$(document).ready(function ($) {
        $('input[data-input-type]').on('input change', function () {
            var val = $(this).val();
            $(this).prev('.cs-range-value').html(val);
            $(this).val(val);
        });
    })
	
	/**
	 * sidebar_wid_ttl_size
	 */
	range_live_media_load( 'sidebar_wid_ttl_size', '.sidebar .widget .widget-title', [ 'font-size' ], 'px' );
	
	/**
	 * hdr_logo_size
	 */
	range_live_media_load( 'hdr_logo_size', '.site--logo img', [ 'max-width' ], 'px !important' );
	
	/**
	 * hdr_site_title_size
	 */
	range_live_media_load( 'hdr_site_title_size', '.site--logo .site--title', [ 'font-size' ], 'px !important' );
	
	/**
	 * hdr_site_desc_size
	 */
	range_live_media_load( 'hdr_site_desc_size', '.site--logo .site--description', [ 'font-size' ], 'px !important' );
	
	//newsmash_hdr_left_ttl
	wp.customize(
		'newsmash_hdr_left_ttl', function( value ) {
			value.bind(
				function( newval ) {
					$( '.dt_header .dt_header-topbar .dt-news-headline .dt-news-heading' ).text( newval );
				}
			);
		}
	);
	
	//newsmash_hdr_top_ads_title
	wp.customize(
		'newsmash_hdr_top_ads_title', function( value ) {
			value.bind(
				function( newval ) {
					$( '.dt_header .dt_header-topbar .dt-address span' ).text( newval );
				}
			);
		}
	);
	
	//newsmash_hdr_btn_lbl
	wp.customize(
		'newsmash_hdr_btn_lbl', function( value ) {
			value.bind(
				function( newval ) {
					$( '.dt_header .dt_navbar-button-item .dt-btn' ).text( newval );
				}
			);
		}
	);
	
	//newsmash_latest_post_ttl
	wp.customize(
		'newsmash_latest_post_ttl', function( value ) {
			value.bind(
				function( newval ) {
					$( '.latest-post-hm .section-title' ).text( newval );
				}
			);
		}
	);
	
	
	//newsmash_scroller_text
	wp.customize(
		'newsmash_scroller_text', function( value ) {
			value.bind(
				function( newval ) {
					$( '.dt_footer-inner #return-to-top' ).text( newval );
				}
			);
		}
	);
	
	//newsmash_other_story_ttl
	wp.customize(
		'newsmash_other_story_ttl', function( value ) {
			value.bind(
				function( newval ) {
					$( '.other-story-hm .section-header .section-title' ).text( newval );
				}
			);
		}
	);
	
	//newsmash_top_tags_ttl
	wp.customize(
		'newsmash_top_tags_ttl', function( value ) {
			value.bind(
				function( newval ) {
					$( '.toptags .title' ).text( newval );
				}
			);
		}
	);
	
	/**
	 * Container Width
	 */
	wp.customize( 'newsmash_site_container_width', function( value ) {
		
		value.bind( function( newsmash_site_container_width ) {
			var class_name      = 'newsmash_site_container_width'; // Used as id in gfont link
			var css_class       = $( '.' + class_name );			
			
			if (newsmash_site_container_width >= 768 && newsmash_site_container_width < 2000){
				var head_append     = '<style class="' + class_name + '">.dt-container-md,.dt__slider-main .owl-dots{ max-width: ' + newsmash_site_container_width + 'px;}</style>';
			}

			if ( css_class.length ) {
				css_class.replaceWith( head_append );
			} else {
				$( 'head' ).append( head_append );
			}
			
		});
		
	} );
	
	/**
	 * Breadcrumb Typography
	 */
	range_live_media_load( 'newsmash_breadcrumb_title_size', '.page-header h1', [ 'font-size' ], 'px' );
	range_live_media_load( 'newsmash_breadcrumb_content_size', '.page-header .breadcrumb li', [ 'font-size' ], 'px' );
	
	
	/**
	 * Sidebar width.
	 */
	wp.customize( 'newsmash_sidebar_width', function( value ) {		
            'use strict';
            value.bind(
                function( to ){
                    var class_name      = 'customizer-sidebar-width'; // Used as id in gfont link
                    var css_class       = $( '.' + class_name );

                    var sidebar_width   = to;
                    var content_width   = ( 100 - to );

                    var head_append     = '<style class="' + class_name + '">@media (min-width: 992px){#dt-sidebar { max-width: ' + sidebar_width + '%;flex-basis: ' + sidebar_width + '%; } #dt-main { max-width: ' + content_width + '%;flex-basis: ' + content_width + '%; }}</style>';

                    if ( css_class.length ) {
                        css_class.replaceWith( head_append );
                    } else {
                        $( 'head' ).append( head_append );
                    }
                }
            );
        }
    );
	
	
	/**
	 * newsmash_widget_ttl_size
	 */
	range_live_media_load( 'newsmash_widget_ttl_size', '.widget-title', [ 'font-size' ], 'px' );
	
	
	/**
	 * Body font size
	 */
	
	range_live_media_load( 'newsmash_body_font_size_option', 'body', [ 'font-size' ], 'px' );
	
	/**
	 * Body Letter Spacing
	 */
	
	range_live_media_load( 'newsmash_body_ltr_space_option', 'body', [ 'letter-spacing' ], 'px' );
	
	
	/**
	 * newsmash_body_line_height
	 */
	range_live_media_load( 'newsmash_body_line_height_option', 'body', [ 'line-height' ] );
	
	/**
	 * H1 font size
	 */
	range_live_media_load( 'newsmash_h1_font_size_option', 'h1', [ 'font-size' ], 'px' );
	
	/**
	 * H1 line height
	 */
	range_live_media_load( 'newsmash_h1_line_height_option', 'h1', [ 'line-height' ] );
	
	/**
	 * H1 Letter Spacing
	 */
	 
	range_live_media_load( 'newsmash_h1_ltr_space_option', 'h1', [ 'letter-spacing' ], 'px' );
	
	
	
	/**
	 * H2 font size
	 */
	range_live_media_load( 'newsmash_h2_font_size_option', 'h2', [ 'font-size' ], 'px' );
	
	/**
	 * H2 line height
	 */
	range_live_media_load( 'newsmash_h2_line_height_option', 'h2', [ 'line-height' ]);
	
	/**
	 * H2 Letter Spacing
	 */
	
	range_live_media_load( 'newsmash_h2_ltr_space_option', 'h2', [ 'letter-spacing' ], 'px' );
	
	/**
	 * H3 font size
	 */
	range_live_media_load( 'newsmash_h3_font_size_option', 'h3', [ 'font-size' ], 'px' );
	
	/**
	 * H3 line height
	 */
	range_live_media_load( 'newsmash_h3_line_height_option', 'h3', [ 'line-height' ]);
	
	/**
	 * H3 Letter Spacing
	 */
	
	range_live_media_load( 'newsmash_h3_ltr_space_option', 'h3', [ 'letter-spacing' ], 'px' );
	
	/**
	 * H4 font size
	 */
	range_live_media_load( 'newsmash_h4_font_size_option', 'h4', [ 'font-size' ], 'px' );
	
	/**
	 * H4 line height
	 */
	range_live_media_load( 'newsmash_h4_line_height_option', 'h4', [ 'line-height' ]);
	
	/**
	 * H4 Letter Spacing
	 */
	
		range_live_media_load( 'newsmash_h4_ltr_space_option', 'h4', [ 'letter-spacing' ], 'px' );
	
	/**
	 * H5 font size
	 */
	range_live_media_load( 'newsmash_h5_font_size_option', 'h5', [ 'font-size' ], 'px' );
	
	/**
	 * H5 line height
	 */
	range_live_media_load( 'newsmash_h5_line_height_option', 'h5', [ 'line-height' ]);
	
	/**
	 * H5 Letter Spacing
	 */
	
	range_live_media_load( 'newsmash_h5_ltr_space_option', 'h5', [ 'letter-spacing' ], 'px' );

	/**
	 * H6 font size
	 */
	range_live_media_load( 'newsmash_h6_font_size_option', 'h6', [ 'font-size' ], 'px' );
	
	/**
	 * H6 line height
	 */
	range_live_media_load( 'newsmash_h6_line_height_option', 'h6', [ 'line-height' ]);
	
	/**
	 * H6 Letter Spacing
	 */
	
	range_live_media_load( 'newsmash_h6_ltr_space_option', 'h6', [ 'letter-spacing' ], 'px' );
	
} )( jQuery );