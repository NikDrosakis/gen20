<?php
/*
* Plugin Name: Themeinwp Import Companion
* Plugin URI: https://www.themeinwp.com/themeinwp-import-companion/
* Description: The plugin simply store data to import.
* Version: 1.0.8
* Author: ThemeInWP
* Author URI: https://www.themeinwp.com/
* License: GNU General Public License v2 or later
* License URI: http://www.gnu.org/licenses/gpl-2.0.html
* Tested up to: 6.1
* Requires PHP: 5.5
* Text Domain: themeinwp-import-companion
*/


// Block direct access to the main plugin file.
defined( 'ABSPATH' ) or die( 'No script kiddies please!' );

$upload_dir = wp_upload_dir();

class Themeinwp_Import_Companion {

    private $before_import;

    public function __construct() {

        add_action( 'plugins_loaded', array( $this, 'load_textdomain' ) );
        add_action( 'plugins_loaded', array( $this, 'admin_notice' ) );
        add_action( 'init', array( $this, 'filters' ),40 );
        add_action( 'plugins_loaded', array( $this, 'before_import' ) );
        add_action( 'dik/after_import', array( $this, 'after_import' ) );
        add_action( 'admin_notices',array( $this,'TWPIC_rate_notice' ) );
        add_action( 'switch_theme', array( $this, 'twpic_notice_clear_cache' ) );
        add_action( 'admin_init', array( $this, 'TWPIC_ignore_notice' ) );

    }

    public function filters(){

        $import_compatible = apply_filters('themeinwp_enable_demo_import_compatiblity',false);

        if($import_compatible ){

            add_filter( 'demo_import_kit_primary_cat', array( $this, 'primary_category' ) );
            add_filter( 'demo_import_kit_secondary_cat', array( $this, 'secondary_category' ) );
            add_filter( 'demo_import_kit_import_files', array( $this, 'import_files' ) );
            add_filter( 'demo_import_kit_upgrade_pro', array( $this, 'upgrade_pro' ) );
        }
    }

    /**
     * Load the plugin textdomain.
     */
    public function load_textdomain() {
        load_plugin_textdomain( 'themeinwp-import-companion', false, plugin_basename( dirname( __FILE__ ) ) . '/languages' );
        // Add a small file to invite users rate the plugin
        $twpIC_upload_dir    = wp_upload_dir();
        $twpIC_file_path     = str_replace('\\' ,'/', $twpIC_upload_dir['basedir']) . "/TWPIC.txt";
        if(!file_exists($twpIC_file_path)){
            $handle = fopen($twpIC_file_path, "w");
            if($handle){
                fwrite($handle, "1");
            }
        }

    }

    public function admin_notice() {
        
        if( !class_exists( 'Demo_Import_Kit_Class' ) ){

            if( is_multisite() ){

              add_action( 'network_admin_notices',array( $this,'admin_notiece_render' ) );

            } else {

              add_action( 'admin_notices',array( $this,'admin_notiece_render' ) );
            }
        }

    }

    public static function admin_notiece_render(){

            ?>
        <div class="updated notice is-dismissible">

            <h3><?php esc_html_e('Themeinwp Import Companion','themeinwp-import-companion'); ?></h3>

            <strong><p><?php esc_html_e('Please install Demo Import Kit Plugin.','themeinwp-import-companion'); ?></p></strong>

        </div>

    <?php
    }

    public function upgrade_pro() {

        if( $this->before_import && isset( $this->before_import->upgrade_pro ) && $this->before_import->upgrade_pro ){
            return  $upgrade_pro = $this->before_import->upgrade_pro;
        }
        return false;

    }
    
    public function before_import() {

        $template   = get_template();

        $response = wp_remote_get('https://raw.githubusercontent.com/themeinwp/demo-content/main/'.esc_attr( $template ).'/demo-content.json' );

        // Only execute if our config is loaded properly
        if ( is_array( $response ) && ! is_wp_error( $response ) && ( 200 === wp_remote_retrieve_response_code( $response ) ) ) {

            $before_import = wp_remote_retrieve_body( $response );
            $before_import = json_decode($before_import);
            $this->before_import = $before_import;
        }
    }

    public function primary_category() {

        if( $this->before_import && isset( $this->before_import->primary_category ) && $this->before_import->primary_category ){
            return $this->before_import->primary_category;
        }
        return false;
    }

    public function secondary_category() {

        if( $this->before_import && isset( $this->before_import->secondary_category ) && $this->before_import->secondary_category ){
            return $this->before_import->secondary_category;
        }
        return false;
    }

    public function import_files() {

        if( $this->before_import && isset( $this->before_import->import_files ) && $this->before_import->import_files ){
                return $this->before_import->import_files;
        }
        return false;   
    }


    function after_import( ) {

        $template   = get_template();

        $response = wp_remote_get('https://raw.githubusercontent.com/themeinwp/demo-content/main/'.esc_attr( $template ).'/after-import.json' );

        // Only execute if our config is loaded properly
        if ( is_array( $response ) && ! is_wp_error( $response ) && ( 200 === wp_remote_retrieve_response_code( $response ) ) ) {

            $after_import = wp_remote_retrieve_body( $response );
            $after_import = json_decode($after_import);

            if( isset( $after_import->menus ) ){
                
                $menu_array = array();

                foreach( $after_import->menus as $key => $value ){

                    $menu   = get_term_by('name', $value, 'nav_menu');
                    if( isset( $menu->term_id ) ){
                        $menu_array[$key] = $menu->term_id;
                    }

                }

                set_theme_mod( 'nav_menu_locations' , 
                    $menu_array
                );
            }
            
            if( isset( $after_import->home ) && $after_import->home ){
                $front_page_id = get_page_by_title( $after_import->home );
                update_option( 'show_on_front', 'page' );
                update_option( 'page_on_front', $front_page_id->ID );
            }
        }
        
    }

    // Add admin notice to rate theme
    function TWPIC_rate_notice(){
        $TWPIC_upload_dir = wp_upload_dir();
        $TWPIC_file_path = str_replace('\\' ,'/', $TWPIC_upload_dir['basedir']) . "/TWPIC.txt";
        $twp_active_theme = wp_get_theme();
        $twp_active_theme_text_domain =  esc_html( $twp_active_theme->get( 'TextDomain' ) );
        $twp_active_theme_text_name =  esc_html( $twp_active_theme->get( 'Name' ) );
        $twp_active_theme_author = esc_html( $twp_active_theme->get( 'Author' ) );
        $TWPIC_new_URI = $_SERVER['REQUEST_URI'];
        $TWPIC_new_URI = add_query_arg('TWPIC_rate', "0", $TWPIC_new_URI);
        if(strpos($twp_active_theme_text_name, ' Pro') !== false){
            return;
        }
        if (strtolower($twp_active_theme_author) !== 'themeinwp') {
            return;

        }

        if(file_exists($TWPIC_file_path)){
            $content = file_get_contents($TWPIC_file_path);
            // Return in case the file contains 0
            if($content != "1"){
                return;
            }
        }else{
            // Return in case the file does not exist
            return;
        }

        ?>
        <div class="updated notice is-dismissible TWPIC-top-main-msg">
            <h3><?php _e('Awesome!', 'themeinwp-import-companion'); ?></h3>
            <p>
                <?php
                global $current_user;
                $user_id = $current_user->ID;
                printf(
                /* Translators: %1$s current user display name. */
                    esc_html__(
                        'Howdy, %1$s! How was your experience with %2$s WordPress Theme?', 'themeinwp-import-companion'
                    ),
                    '<strong>' . esc_html($current_user->display_name) . '</strong>',
                    '<strong>' . $twp_active_theme_text_name . '</strong>',
                );
                ?>
            </p>
            <p>
                <?php _e('We are always happy to get feedback from our valued customers so that we can continue to improve our product and service.', 'themeinwp-import-companion'); ?>
            </p>
            <p>
                <?php _e('If you could spare two minutes of your time to write a review, we would be really grateful and very happy to read it.', 'themeinwp-import-companion'); ?>
            </p>
            <div style="font-size:14px;margin-top: 15px;margin-bottom: 15px;">
                <a class="button button-primary" target="_blank"
                   href="https://wordpress.org/support/theme/<?php echo $twp_active_theme_text_domain; ?>/reviews/?filter=5">
                    <?php _e('Ok, you deserved it', 'themeinwp-import-companion'); ?></a>
                <form method="post" action="" style="display:inline">
                    <input type="hidden" name="dont_show_rate" value=""/>
                    <a class="button button-secondary"
                       href="<?php echo esc_url($TWPIC_new_URI); ?>"><?php _e('I already did', 'themeinwp-import-companion'); ?></a>
                    <a class="button button-secondary" href="<?php echo esc_url($TWPIC_new_URI); ?>"><?php _e('Please don\'t show this again', 'themeinwp-import-companion'); ?></a>

                </form>
            </div>

        </div> 
    <?php
    }

    // Hide rating msg box if the user clicked on the button to hide it
    public function TWPIC_ignore_notice(){

        if(isset($_GET['TWPIC_rate']) && $_GET['TWPIC_rate'] == "0"){

            $TWPIC_upload_dir = wp_upload_dir();
            $TWPIC_file_path  = str_replace('\\' ,'/', $TWPIC_upload_dir['basedir']) . "/TWPIC.txt";
            $handle = fopen($TWPIC_file_path, "w");
            if($handle){
                fwrite($handle, "0");
            }
        }
    }

    public function twpic_notice_clear_cache(){

        $TWPIC_upload_dir = wp_upload_dir();
        $TWPIC_file_path  = str_replace('\\' ,'/', $TWPIC_upload_dir['basedir']) . "/TWPIC.txt";

        $handle = fopen($TWPIC_file_path, "w");
        if($handle){
            fwrite($handle, "1");
        }

    }
}

$GLOBALS[ 'themeinwp_import_companion_global' ] = new Themeinwp_Import_Companion();