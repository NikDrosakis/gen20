<?php
/**
 * NewsMash Customizer Class
 *
 * @package NewsMash
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

 if ( ! class_exists( 'NewsMash_Customizer' ) ) :

	class NewsMash_Customizer {

		// Constructor customizer
		public function __construct() {
			add_action( 'customize_register',array( $this, 'newsmash_customizer_register' ) );
			add_action( 'customize_register',array( $this, 'newsmash_customizer_sainitization_selective_refresh' ) );
			add_action( 'customize_register',array( $this, 'newsmash_customizer_control' ) );
			add_action( 'customize_preview_init',array( $this, 'newsmash_customize_preview_js' ) );
			add_action( 'customize_controls_enqueue_scripts',array( $this, 'newsmash_controls_scripts' ) );
			add_action( 'after_setup_theme',array( $this, 'newsmash_customizer_settings' ) );
		}
		
		/**
		 * Add postMessage support for site title and description for the Theme Customizer.
		 *
		 * @param WP_Customize_Manager $wp_customize Theme Customizer object.
		 */
		public function newsmash_customizer_register( $wp_customize ) {
			
			$wp_customize->get_setting( 'blogname' )->transport         = 'postMessage';
			$wp_customize->get_setting( 'blogdescription' )->transport  = 'postMessage';
			$wp_customize->get_setting( 'header_textcolor' )->transport = 'postMessage';
			$wp_customize->get_setting( 'background_color' )->transport = 'postMessage';
			$wp_customize->get_setting('custom_logo')->transport = 'refresh';
		}
		
		// Register custom controls
		public function newsmash_customizer_control( $wp_customize ) {
			
			$newsmash_control_dir =  NEWSMASH_THEME_INC_DIR . '/customizer/controls';
			
			// Load custom control classes.
			$wp_customize->register_control_type( 'NewsMash_Customizer_Range_Control' );
			require $newsmash_control_dir . '/code/newsmash-slider-control.php';
			require $newsmash_control_dir . '/code/newsmash-category-dropdown-control.php';
			require $newsmash_control_dir . '/code/editor/class/class-newsmash-page-editor.php';

		}
		
		
		// Customizer Controls
		public function newsmash_controls_scripts() {
			// Customizer Core.
			wp_enqueue_script( 'newsmash-customizer-controls-toggle-js', NEWSMASH_THEME_INC_URI . '/customizer/controls/js/newsmash-toggle-control.js', array(), NEWSMASH_THEME_VERSION, true );

			// Customizer Controls.
			wp_enqueue_script( 'newsmash-customizer-controls-js', NEWSMASH_THEME_INC_URI . '/customizer/controls/js/newsmash-customizer-control.js', array( 'newsmash-customizer-controls-toggle-js' ), NEWSMASH_THEME_VERSION, true );
		}
		
		// selective refresh.
		public function newsmash_customizer_sainitization_selective_refresh() {

			require NEWSMASH_THEME_INC_DIR . '/customizer/sanitization.php';
			
		}

		// Theme Customizer preview reload changes asynchronously.
		public function newsmash_customize_preview_js() {
			wp_enqueue_script( 'newsmash-customizer', NEWSMASH_THEME_INC_URI . '/customizer/assets/js/customizer-preview.js', array( 'customize-preview' ), NEWSMASH_THEME_VERSION, true );
		}

		// Include customizer settings.
		public function newsmash_customizer_settings() {	
			  // Recommended Plugin
			  require NEWSMASH_THEME_INC_DIR . '/customizer/customizer-plugin-notice/newsmash-notify-plugin.php';
			
			  // Upsale
			  require NEWSMASH_THEME_INC_DIR . '/customizer/controls/code/upgrade/class-customize.php';
			
			  $newsmash_customize_dir =  NEWSMASH_THEME_INC_DIR . '/customizer/customizer-settings';
			  require $newsmash_customize_dir . '/newsmash-header-customize-setting.php';
			  require $newsmash_customize_dir . '/newsmash-footer-customize-setting.php';
			  require $newsmash_customize_dir . '/newsmash-top-tags-customize-setting.php';
			  require $newsmash_customize_dir . '/newsmash-slider-customize-setting.php';
			  require $newsmash_customize_dir . '/newsmash-featured-link-customize-setting.php';
			  require $newsmash_customize_dir . '/newsmash-latest-post-customize-setting.php';
			  require $newsmash_customize_dir . '/newsmash-other-story-customize-setting.php';
			  require $newsmash_customize_dir . '/newsmash-theme-customize-setting.php';
			  require $newsmash_customize_dir . '/newsmash-prebuilt-page-customize-setting.php';
			  require $newsmash_customize_dir . '/newsmash-typography-customize-setting.php';
			  require NEWSMASH_THEME_INC_DIR . '/customizer/newsmash-selective-partial.php';
			  require NEWSMASH_THEME_INC_DIR . '/customizer/newsmash-selective-refresh.php';
		}

	}
endif;
new NewsMash_Customizer();