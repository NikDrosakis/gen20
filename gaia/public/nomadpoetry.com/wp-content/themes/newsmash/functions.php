<?php
/**
 * NewsMash functions and definitions
 *
 * @link    https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package NewsMash
 */
 
if ( ! function_exists( 'newsmash_theme_setup' ) ) :
function newsmash_theme_setup() {
	
	/*
	 * Make theme available for translation.
	 * Translations can be filed in the /languages/ directory.
	 * If you're building a theme based on NewsMash, use a find and replace
	 * to change 'NewsMash' to the name of your theme in all the template files.
	 */
	load_theme_textdomain( 'newsmash' );
	
	// Add default posts and comments RSS feed links to head.
	add_theme_support( 'automatic-feed-links' );
	
	/*
	 * Let WordPress manage the document title.
	 * By adding theme support, we declare that this theme does not use a
	 * hard-coded <title> tag in the document head, and expect WordPress to
	 * provide it for us.
	 */
	add_theme_support( 'title-tag' );
	
	add_theme_support( 'custom-header' );
	
	add_theme_support( 'post-formats', array( 'gallery', 'quote', 'video', 'aside', 'image', 'link', 'audio', 'status', 'chat' ) );
	
	/*
	 * Enable support for Post Thumbnails on posts and pages.
	 *
	 * @link https://developer.wordpress.org/themes/functionality/featured-images-post-thumbnails/
	 */
	add_theme_support( 'post-thumbnails' );
	
	// This theme uses wp_nav_menu() in one location.
	register_nav_menus( array(
		'primary_menu' => esc_html__( 'Primary Menu', 'newsmash' )
	) );
	
	//Add selective refresh for sidebar widget
	add_theme_support( 'customize-selective-refresh-widgets' );
	
	// woocommerce support
	add_theme_support( 'woocommerce' );
	
	/**
	 * Add support for core custom logo.
	 *
	 * @link https://codex.wordpress.org/Theme_Logo
	 */
	add_theme_support('custom-logo');
	
	/**
	 * Custom background support.
	 */
	add_theme_support( 'custom-background', apply_filters( 'newsmash_custom_background_args', array(
		'default-color' => 'ffffff',
		'default-image' => '',
	) ) );
	
	/*
	 * Switch default core markup for search form, comment form, and comments
	 * to output valid HTML5.
	 */
	add_theme_support( 'html5', array(
		'search-form',
		'comment-form',
		'comment-list',
		'gallery',
		'caption',
	) );
	
	/**
	 * Set default content width.
	 */
	if ( ! isset( $content_width ) ) {
		$content_width = 800;
	}	
}
endif;
add_action( 'after_setup_theme', 'newsmash_theme_setup' );


/**
 * Register widget area.
 *
 * @link https://developer.wordpress.org/themes/functionality/sidebars/#registering-a-sidebar
 */

function newsmash_widgets_init() {	
	if ( class_exists( 'WooCommerce' ) ) {
		register_sidebar( array(
			'name' => __( 'WooCommerce Widget Area', 'newsmash' ),
			'id' => 'newsmash-woocommerce-sidebar',
			'description' => __( 'This Widget area for WooCommerce Widget', 'newsmash' ),
			'before_widget' => '<aside id="%1$s" class="widget rounded %2$s">',
			'after_widget' => '</aside>',
			'before_title' => '<div class="widget-header"><h4 class="widget-title">',
			'after_title' => '</h4></div>',
		) );
	}
	
	register_sidebar( array(
		'name' => __( 'Sidebar Widget Area', 'newsmash' ),
		'id' => 'newsmash-sidebar-primary',
		'description' => __( 'The Primary Widget Area', 'newsmash' ),
		'before_widget' => '<aside id="%1$s" class="widget rounded %2$s">',
		'after_widget' => '</aside>',
		'before_title' => '<div class="widget-header"><h4 class="widget-title">',
		'after_title' => '</h4></div>',
	) );
	
	$newsmash_footer_widget_column = get_theme_mod('newsmash_footer_widget_column','4');
	for ($i=1; $i<=$newsmash_footer_widget_column; $i++) {
		register_sidebar( array(
			'name' => __( 'Footer  ', 'newsmash' )  . $i,
			'id' => 'newsmash-footer-widget-' . $i,
			'description' => __( 'The Footer Widget Area', 'newsmash' )  . $i,
			'before_widget' => '<aside id="%1$s" class="widget %2$s">',
			'after_widget' => '</aside>',
			'before_title' => '<div class="widget-header"><h4 class="widget-title">',
			'after_title' => '</h4></div>',
		) );
	}
}
add_action( 'widgets_init', 'newsmash_widgets_init' );

/**
 * Enqueue scripts and styles.
 */
function newsmash_scripts() {
	
	/**
	 * Styles.
	 */
	// Slick	
	wp_enqueue_style('slick',get_template_directory_uri().'/assets/vendors/css/slick.css');
	
	// Font Awesome
	wp_enqueue_style('all-css',get_template_directory_uri().'/assets/vendors/css/all.min.css');
	
	// Animate
	wp_enqueue_style('animate',get_template_directory_uri().'/assets/vendors/css/animate.min.css');
	
	// NewsMash Core
	wp_enqueue_style('newsmash-core',get_template_directory_uri().'/assets/css/core.css');

	// NewsMash Theme
	wp_enqueue_style('newsmash-theme', get_template_directory_uri() . '/assets/css/themes.css');
	
	// NewsMash WooCommerce
	wp_enqueue_style('newsmash-woocommerce',get_template_directory_uri().'/assets/css/woo-styles.css');
	
	// NewsMash Dark
	wp_enqueue_style('newsmash-dark',get_template_directory_uri().'/assets/css/dark.css');
	
	// NewsMash Responsive
	wp_enqueue_style('newsmash-responsive',get_template_directory_uri().'/assets/css/responsive.css');
	
	// NewsMash Style
	wp_enqueue_style( 'newsmash-style', get_stylesheet_uri() );
	
	// Scripts
	wp_enqueue_script( 'jquery' );
	
	// Owl Crousel
	wp_enqueue_script('slick', get_template_directory_uri() . '/assets/vendors/js/slick.min.js', array('jquery'), true);
	
	// NewsMash Theme
	wp_enqueue_script('newsmash-theme', get_template_directory_uri() . '/assets/js/theme.js', array('jquery'), false, true);

	// NewsMash custom
	wp_enqueue_script('newsmash-custom-js', get_template_directory_uri() . '/assets/js/custom.js', array('jquery'), false, true);

	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}
}
add_action( 'wp_enqueue_scripts', 'newsmash_scripts' );


/**
 * Enqueue admin scripts and styles.
 */
function newsmash_admin_enqueue_scripts(){
	wp_enqueue_style('newsmash-admin-style', get_template_directory_uri() . '/inc/admin/assets/css/admin.css');
	wp_enqueue_script( 'newsmash-admin-script', get_template_directory_uri() . '/inc/admin/assets/js/newsmash-admin-script.js', array( 'jquery' ), '', true );
    wp_localize_script( 'newsmash-admin-script', 'newsmash_ajax_object',
        array( 'ajax_url' => admin_url( 'admin-ajax.php' ) )
    );
}
add_action( 'admin_enqueue_scripts', 'newsmash_admin_enqueue_scripts' );

/**
 * Enqueue User Custom styles.
 */
 if( ! function_exists( 'newsmash_user_custom_style' ) ):
    function newsmash_user_custom_style() {

		$newsmash_print_style = '';
		
		 /*=========================================
		 NewsMash Page Title
		=========================================*/
		 $newsmash_print_style   .=  newsmash_customizer_value( 'newsmash_breadcrumb_title_size', '.page-header h1', array( 'font-size' ), array( 30, 30, 30 ), 'px' );
		  $newsmash_print_style   .=  newsmash_customizer_value( 'newsmash_breadcrumb_content_size', '.page-header .breadcrumb li', array( 'font-size' ), array( 15, 15, 15 ), 'px' );
		
		
	
		 /*=========================================
		 NewsMash Logo Size
		=========================================*/
		$newsmash_print_style   .= newsmash_customizer_value( 'hdr_logo_size', '.site--logo img', array( 'max-width' ), array( 150, 150, 150 ), 'px !important' );
		$newsmash_print_style   .= newsmash_customizer_value( 'hdr_site_title_size', '.site--logo .site--title', array( 'font-size' ), array( 55, 55, 55 ), 'px !important' );
		$newsmash_print_style   .= newsmash_customizer_value( 'hdr_site_desc_size', '.site--logo .site--description', array( 'font-size' ), array( 16, 16, 16 ), 'px !important' );
		
		$newsmash_site_container_width 			 = get_theme_mod('newsmash_site_container_width','1340');
			if($newsmash_site_container_width >=768 && $newsmash_site_container_width <=2000){
				$newsmash_print_style .=".dt-container-md,.dt__slider-main .owl-dots {
						max-width: " .esc_attr($newsmash_site_container_width). "px;
					}\n";
			}
					
		/**
		 *  Sidebar Width
		 */
		$newsmash_sidebar_width = get_theme_mod('newsmash_sidebar_width',33);
		if($newsmash_sidebar_width !== '') { 
			$newsmash_primary_width   = absint( 100 - $newsmash_sidebar_width );
				$newsmash_print_style .="	@media (min-width: 992px) {#dt-main {
					max-width:" .esc_attr($newsmash_primary_width). "%;
					flex-basis:" .esc_attr($newsmash_primary_width). "%;
				}\n";
				$newsmash_print_style .="#dt-sidebar {
					max-width:" .esc_attr($newsmash_sidebar_width). "%;
					flex-basis:" .esc_attr($newsmash_sidebar_width). "%;
				}}\n";
        }
		$newsmash_print_style   .= newsmash_customizer_value( 'newsmash_widget_ttl_size', '.widget-title', array( 'font-size' ), array( 24, 24, 24 ), 'px' );
		
		/**
		 *  Typography Body
		 */
		 $newsmash_body_font_weight_option	 	 = get_theme_mod('newsmash_body_font_weight_option','inherit');
		 $newsmash_body_text_transform_option	 = get_theme_mod('newsmash_body_text_transform_option','inherit');
		 $newsmash_body_font_style_option	 	 = get_theme_mod('newsmash_body_font_style_option','inherit');
		 $newsmash_body_txt_decoration_option	 = get_theme_mod('newsmash_body_txt_decoration_option','none');
		
		 $newsmash_print_style   .= newsmash_customizer_value( 'newsmash_body_font_size_option', 'body', array( 'font-size' ), array( 16, 16, 16 ), 'px' );
		 $newsmash_print_style   .= newsmash_customizer_value( 'newsmash_body_line_height_option', 'body', array( 'line-height' ), array( 1.6, 1.6, 1.6 ) );
		 $newsmash_print_style   .= newsmash_customizer_value( 'newsmash_body_ltr_space_option', 'body', array( 'letter-spacing' ), array( 0, 0, 0 ), 'px' );	 
		
		/**
		 *  Typography Heading
		 */
		 for ( $i = 1; $i <= 6; $i++ ) {
			 $newsmash_heading_font_weight_option	 	= get_theme_mod('newsmash_h' . $i . '_font_weight_option','700');
			 $newsmash_heading_text_transform_option 	= get_theme_mod('newsmash_h' . $i . '_text_transform_option','inherit');
			 $newsmash_heading_font_style_option	 	= get_theme_mod('newsmash_h' . $i . '_font_style_option','inherit');
			 $newsmash_heading_txt_decoration_option	= get_theme_mod('newsmash_h' . $i . '_txt_decoration_option','inherit');
			 
			 $newsmash_print_style   .= newsmash_customizer_value( 'newsmash_h' . $i . '_font_size_option', 'h' . $i .'', array( 'font-size' ), array( 36, 36, 36 ), 'px' );
			 $newsmash_print_style   .= newsmash_customizer_value( 'newsmash_h' . $i . '_line_height_option', 'h' . $i . '', array( 'line-height' ), array( 1.2, 1.2, 1.2 ) );
			 $newsmash_print_style   .= newsmash_customizer_value( 'newsmash_h' . $i . '_ltr_space_option', 'h' . $i . '', array( 'letter-spacing' ), array( 0, 0, 0 ), 'px' );
		 }
		
		
		/*=========================================
		Post Format 
		=========================================*/
		$newsmash_hs_latest_post_format_icon			= get_theme_mod('newsmash_hs_latest_post_format_icon','1');
		if($newsmash_hs_latest_post_format_icon !=='1'):
			 $newsmash_print_style .=".post .post-format, .post .post-format-sm{ 
				    display: none;
			}\n";
		endif;
		
		/*=========================================
		Mainfeatured Section
		=========================================*/
		$newsmash_slider_bg_img			= get_theme_mod('newsmash_slider_bg_img');
		if(!empty($newsmash_slider_bg_img)):
			 $newsmash_print_style .=".mainfeatured_section {
				background-repeat: no-repeat;
				background-size: cover;
				background-position: center;
				padding-bottom: 30px;
				padding-top: 30px;
				background-color: rgba(18,16,38,0.6);
				background-blend-mode: overlay;
				z-index: 0;
			}
			.mainfeatured_section .post-tabs {
				background-color: #fff;
			}\n";
		endif;
        wp_add_inline_style( 'newsmash-style', $newsmash_print_style );
    }
endif;
add_action( 'wp_enqueue_scripts', 'newsmash_user_custom_style' );


/**
 * Define Constants
 */
 
$newsmash_theme = wp_get_theme();
define( 'NEWSMASH_THEME_VERSION', $newsmash_theme->get( 'Version' ) );

// Root path/URI.
define( 'NEWSMASH_THEME_DIR', get_template_directory() );
define( 'NEWSMASH_THEME_URI', get_template_directory_uri() );

// Root path/URI.
define( 'NEWSMASH_THEME_INC_DIR', NEWSMASH_THEME_DIR . '/inc');
define( 'NEWSMASH_THEME_INC_URI', NEWSMASH_THEME_URI . '/inc');


/**
 * Implement the Custom Header feature.
 */
require_once get_template_directory() . '/inc/custom-header.php';

/**
 * Custom template tags for this theme.
 */
require_once get_template_directory() . '/inc/template-tags.php';
require_once get_template_directory() . '/inc/extras.php';

/**
 * Customizer additions.
 */
 require_once get_template_directory() . '/inc/customizer/newsmash-customizer.php';
 require get_template_directory() . '/inc/customizer/controls/code/customizer-repeater/inc/customizer.php';
 
/**
 * Nav Walker for Bootstrap Dropdown Menu.
 */
require_once get_template_directory() . '/inc/class-wp-bootstrap-navwalker.php';

/**
 * Widget
 */
require( get_template_directory() . '/inc/widgets/widgets-init.php');

/**
 * Control Style
 */

require NEWSMASH_THEME_INC_DIR . '/customizer/controls/code/control-function/style-functions.php';


/**
 * Getting Started
 */
require NEWSMASH_THEME_INC_DIR . '/admin/getting-started.php';