<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * Functions.
 *
 * @package Booster Extension
**/

/**
 * Booster Extension SVG Icon helper functions
 *
 * @package WordPress
 * @subpackage Booster Extension
 * @since 1.0.0
 */
if ( ! function_exists( 'booster_extension_the_theme_svg' ) ):
    /**
     * Output and Get Theme SVG.
     * Output and get the SVG markup for an icon in the Booster_Extension_SVG_Icons class.
     *
     * @param string $svg_name The name of the icon.
     * @param string $group The group the icon belongs to.
     * @param string $color Color code.
     */
    function booster_extension_the_theme_svg( $svg_name, $return = false ) {

        if( $return ){

            return booster_extension_get_theme_svg( $svg_name ); //phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped in booster_extension_get_theme_svg();.

        }else{

            echo booster_extension_get_theme_svg( $svg_name ); //phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped in booster_extension_get_theme_svg();.
            
        }
    }

endif;

if ( ! function_exists( 'booster_extension_get_theme_svg' ) ):

    /**
     * Get information about the SVG icon.
     *
     * @param string $svg_name The name of the icon.
     * @param string $group The group the icon belongs to.
     * @param string $color Color code.
     */
    function booster_extension_get_theme_svg( $svg_name ) {

        // Make sure that only our allowed tags and attributes are included.
        $svg = wp_kses(
            Booster_Extension_SVG_Icons::get_svg( $svg_name ),
            array(
                'svg'     => array(
                    'class'       => true,
                    'xmlns'       => true,
                    'width'       => true,
                    'height'      => true,
                    'viewbox'     => true,
                    'aria-hidden' => true,
                    'role'        => true,
                    'focusable'   => true,
                ),
                'path'    => array(
                    'fill'      => true,
                    'fill-rule' => true,
                    'd'         => true,
                    'transform' => true,
                ),
                'polygon' => array(
                    'fill'      => true,
                    'fill-rule' => true,
                    'points'    => true,
                    'transform' => true,
                    'focusable' => true,
                ),
            )
        );
        if ( ! $svg ) {
            return false;
        }
        return $svg;

    }

endif;

if( ! function_exists( 'booster_remove_element' ) ):

    // Remove Element
    function booster_remove_element( $array,$value ) {
         foreach ( array_keys( $array, $value ) as $key ) {
            unset( $array[$key] );
         }  
        return $array;
    }

endif;

if( ! function_exists( 'booster_extension_get_ip_address' )):

    // Get IP Address
    function booster_extension_get_ip_address(){
        if( getenv( 'HTTP_CLIENT_IP' ) ){
            $ip_address = getenv( 'HTTP_CLIENT_IP' );
        }elseif( getenv( 'HTTP_X_FORWARDED_FOR' ) ){
            $ip_address = getenv('HTTP_X_FORWARDED_FOR' );
        }elseif( getenv( 'HTTP_X_FORWARDED' ) ){
            $ip_address = getenv( 'HTTP_X_FORWARDED' );
        }elseif( getenv( 'HTTP_FORWARDED_FOR' ) ){
            $ip_address = getenv( 'HTTP_FORWARDED_FOR' );
        }elseif( getenv( 'HTTP_FORWARDED' ) ){
            $ip_address = getenv( 'HTTP_FORWARDED' );
        }else{
            $ip_address = $_SERVER['REMOTE_ADDR'];
        }
        
        return $ip_address;
    }
endif;

if( ! function_exists( 'booster_extension_can_act' ) ) :

    // Return Ipaddress
    function booster_extension_can_act( $post_ID ,$action_type ) {
        if( empty( $post_ID ) ){
            return false;
        }
        if( $action_type == 'twp-post-dislike' ){
            $like_ip_list = ( $ip = get_post_meta( $post_ID, 'twp_be_ip_address_lists_dislike', true ) ) ? $ip  : array();
            if( ( $like_ip_list == '' ) || ( is_array( $like_ip_list ) && ! in_array( booster_extension_get_ip_address(), $like_ip_list ) ) ){
                return true;
            }
        }
        if( $action_type == 'twp-post-like' ){
            $like_ip_list = ( $ip = get_post_meta( $post_ID, 'twp_be_ip_address_lists_like', true ) ) ? $ip  : array();
            if( ( $like_ip_list == '' ) || ( is_array( $like_ip_list ) && ! in_array( booster_extension_get_ip_address(), $like_ip_list ) ) ){
                return true;
            }
        }
        if( $action_type == 'be-react-1' ){
            $like_ip_list = ( $ip = get_post_meta( $post_ID, 'twp_be_ip_address_react_1', true ) ) ? $ip  : array();
            if( ( empty( $like_ip_list ) ) || ( is_array( $like_ip_list ) && ! in_array( booster_extension_get_ip_address(), $like_ip_list ) ) ){
                return true;
            }
        }
        if( $action_type == 'be-react-2' ){
            $like_ip_list = ( $ip = get_post_meta( $post_ID, 'twp_be_ip_address_react_2', true ) ) ? $ip  : array();
            if( ( $like_ip_list == '' ) || ( is_array( $like_ip_list ) && ! in_array( booster_extension_get_ip_address(), $like_ip_list ) ) ){
                return true;
            }
        }
        if( $action_type == 'be-react-3' ){
            $like_ip_list = ( $ip = get_post_meta( $post_ID, 'twp_be_ip_address_react_3', true ) ) ? $ip  : array();
            if( ( $like_ip_list == '' ) || ( is_array( $like_ip_list ) && ! in_array( booster_extension_get_ip_address(), $like_ip_list ) ) ){
                return true;
            }
        }
        if( $action_type == 'be-react-4' ){
            $like_ip_list = ( $ip = get_post_meta( $post_ID, 'twp_be_ip_address_react_4', true ) ) ? $ip  : array();
            if( ( $like_ip_list == '' ) || ( is_array( $like_ip_list ) && ! in_array( booster_extension_get_ip_address(), $like_ip_list ) ) ){
                return true;
            }
        }
        if( $action_type == 'be-react-5' ){
            $like_ip_list = ( $ip = get_post_meta( $post_ID, 'twp_be_ip_address_react_5', true ) ) ? $ip  : array();
            if( ( $like_ip_list == '' ) || ( is_array( $like_ip_list ) && ! in_array( booster_extension_get_ip_address(), $like_ip_list ) ) ){
                return true;
            }
        }
        if( $action_type == 'be-react-6' ){
            $like_ip_list = ( $ip = get_post_meta( $post_ID, 'twp_be_ip_address_react_6', true ) ) ? $ip  : array();
            if( ( $like_ip_list == '' ) || ( is_array( $like_ip_list ) && ! in_array( booster_extension_get_ip_address(), $like_ip_list ) ) ){
                return true;
            }
        }
        return false;
    }
endif;