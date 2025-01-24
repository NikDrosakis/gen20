<?php
/*
 *  Customizer Notifications
 */
require get_template_directory() . '/inc/customizer/customizer-plugin-notice/newsmash-customizer-notify.php';
$newsmash_config_customizer = array(
    'recommended_plugins' => array( 
        'desert-companion' => array(
            'recommended' => true,
            'description' => sprintf( 
                /* translators: %s: plugin name */
                esc_html__( 'To take full advantage of all the features of this theme. please install and activate %s plugin then use the demo importer and install the Demo according to your need.', 'newsmash' ), '<strong>Desert Companion</strong>' 
            ),
        ),
    ),
	'recommended_actions'       => array(),
	'recommended_actions_title' => esc_html__( 'Recommended Actions', 'newsmash' ),
	'recommended_plugins_title' => esc_html__( 'Recommended Plugin', 'newsmash' ),
	'install_button_label'      => esc_html__( 'Install and Activate', 'newsmash' ),
	'activate_button_label'     => esc_html__( 'Activate', 'newsmash' ),
	'newsmash_deactivate_button_label'   => esc_html__( 'Deactivate', 'newsmash' ),
);
Newsmash_Customizer_Notify::init( apply_filters( 'newsmash_customizer_notify_array', $newsmash_config_customizer ) );