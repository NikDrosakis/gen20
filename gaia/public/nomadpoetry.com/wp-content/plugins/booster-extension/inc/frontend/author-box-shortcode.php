<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
/**
* Author Box Shortcode
*
* @package Booster Extension
*/
if( ! function_exists( 'booster_extension_authorbox_shortcode_display' ) ):
    function booster_extension_authorbox_shortcode_display($userid){
		$twp_be_settings = get_option( 'twp_be_options_settings' );
		$twp_be_show_author_box = esc_html( $twp_be_settings['twp_be_show_author_box'] );
		if ( $twp_be_show_author_box ){
			$author_img = get_avatar( $userid, 400, '', '', array('class' => 'avatar-img') );
			$author_name = esc_html( get_the_author_meta('display_name', $userid) );
			$author_user_url = esc_url( get_the_author_meta('user_url', $userid) );
			$author_description = esc_html( get_the_author_meta('description', $userid) );
			$author_email = esc_html( get_the_author_meta('user_email', $userid) );
			$author_post_url = esc_url( get_author_posts_url( $userid ) );
			$user_data = get_userdata( $userid );
		    $user_role = $user_data->roles[0];
			$twp_be_show_author_email = esc_html( $twp_be_settings['twp_be_show_author_email'] );
			$twp_be_show_author_url = esc_html( $twp_be_settings['twp_be_show_author_url'] );
			$twp_be_show_author_title = esc_html( $twp_be_settings['twp_be_show_author_title'] );
			$twp_be_show_author_role = esc_html( $twp_be_settings['twp_be_show_author_role'] );
			$twp_be_show_author_alignmrnt = esc_html( $twp_be_settings['twp_be_show_author_alignmrnt'] );
			$twp_be_show_author_image_layout = esc_html( $twp_be_settings['twp_be_show_author_image_layout'] );
			$twp_user_metabox_facebook = get_the_author_meta( 'twp_user_metabox_facebook',$userid );
			$twp_user_metabox_twitter = get_the_author_meta( 'twp_user_metabox_twitter',$userid );
			$twp_user_metabox_instagram = get_the_author_meta( 'twp_user_metabox_instagram',$userid );
			$twp_user_metabox_pinterest = get_the_author_meta( 'twp_user_metabox_pinterest',$userid );
			$twp_user_metabox_linkedin = get_the_author_meta( 'twp_user_metabox_linkedin',$userid );
			$twp_user_metabox_youtube = get_the_author_meta( 'twp_user_metabox_youtube',$userid );
			$twp_user_metabox_vimeo = get_the_author_meta( 'twp_user_metabox_vimeo',$userid );
			$twp_user_metabox_whatsapp = get_the_author_meta( 'twp_user_metabox_whatsapp',$userid );
			$twp_user_metabox_github = get_the_author_meta( 'twp_user_metabox_github',$userid );
			$twp_user_metabox_wordpress = get_the_author_meta( 'twp_user_metabox_wordpress',$userid );
			$twp_user_metabox_foursquare = get_the_author_meta( 'twp_user_metabox_foursquare',$userid );
			$twp_user_metabox_vk = get_the_author_meta( 'twp_user_metabox_vk',$userid );
			$twp_user_metabox_twitch = get_the_author_meta( 'twp_user_metabox_twitch',$userid );
			$twp_user_metabox_tumblr = get_the_author_meta( 'twp_user_metabox_tumblr',$userid );
			$twp_user_metabox_snapchat = get_the_author_meta( 'twp_user_metabox_snapchat',$userid );
			$twp_user_metabox_skype = get_the_author_meta( 'twp_user_metabox_skype',$userid );
			$twp_user_metabox_reddit = get_the_author_meta( 'twp_user_metabox_reddit',$userid );
			$twp_user_metabox_stackoverflow = get_the_author_meta( 'twp_user_metabox_stackoverflow',$userid );
			$twp_user_metabox_xing = get_the_author_meta( 'twp_user_metabox_xing',$userid );
			$twp_user_metabox_delicious = get_the_author_meta( 'twp_user_metabox_delicious',$userid );
			$twp_user_metabox_soundcloud = get_the_author_meta( 'twp_user_metabox_soundcloud',$userid );
			$twp_user_metabox_behance = get_the_author_meta( 'twp_user_metabox_behance',$userid );
			$twp_user_metabox_steam = get_the_author_meta( 'twp_user_metabox_steam',$userid );
			$twp_user_metabox_dribbble = get_the_author_meta( 'twp_user_metabox_dribbble',$userid );
			$twp_user_metabox_blogger = get_the_author_meta( 'twp_user_metabox_blogger',$userid );
			$twp_user_metabox_flickr = get_the_author_meta( 'twp_user_metabox_flickr',$userid );
			$twp_user_metabox_spotify = get_the_author_meta( 'twp_user_metabox_spotify',$userid );
			$twp_user_metabox_rss = get_the_author_meta( 'twp_user_metabox_rss',$userid );
            $be_user_avatar = get_the_author_meta( 'be_user_avatar', $userid );
			?>
            
            <div class="booster-block booster-author-block">
                <div class="be-author-details <?php if (!empty($twp_be_show_author_image_layout)) {
                    echo esc_attr('layout-' . $twp_be_show_author_image_layout);
                }
                if (!empty($twp_be_show_author_alignmrnt)) {
                    echo esc_attr(' align-' . $twp_be_show_author_alignmrnt);
                } ?>">
                    <div class="be-author-wrapper">
                        <div class="booster-row">
                            <div class="booster-column booster-column-two booster-column-mobile">
                                <div class="be-author-image">
                                    <?php if( $be_user_avatar ){ ?>
                                
                                        <img src="<?php echo esc_url( $be_user_avatar ); ?>">
                                    
                                    <?php
                                    }else{
                                        echo wp_kses_post($author_img);
                                    } ?>
                                </div>
                            </div>
                            <div class="booster-column booster-column-eight booster-column-mobile">
                                <div class="author-details">
                                    <?php if ($twp_be_show_author_title) { ?>
                                        <header class="twp-plugin-title twp-author-title">
                                            <h2><?php echo esc_html($twp_be_show_author_title); ?></h2>
                                        </header>
                                    <?php } ?>
                                    <h4 class="be-author-meta be-author-name">
                                        <a href="<?php echo esc_url($author_post_url); ?>" class="booster-url-link">
                                            <?php echo esc_html($author_name); ?>
                                        </a>
                                    </h4>
                                    <?php if ($author_description) { ?>
                                        <div class="be-author-meta be-author-description"><?php echo esc_html($author_description); ?></div>
                                    <?php } ?>
                                    <?php if ($author_email && $twp_be_show_author_email) { ?>
                                        <div class="be-author-meta be-author-email">
                                            <a href="mailto: <?php echo esc_html($author_email); ?>" class="booster-url-link">
                                                <span class="booster-svg-icon booster-svg-envelope"><?php booster_extension_the_theme_svg('envelope'); ?></span><?php echo esc_html($author_email); ?>
                                            </a>
                                        </div>
                                    <?php } ?>
                                    <?php if ($author_user_url && $twp_be_show_author_url) { ?>
                                        <div class="be-author-meta be-author-url">
                                            <a href="<?php echo esc_url($author_user_url); ?>" target="_blank" class="booster-url-link">
                                                <span class="booster-svg-icon booster-svg-sphere"><?php booster_extension_the_theme_svg('sphere'); ?></span><?php echo esc_url($author_user_url); ?>
                                            </a>
                                        </div>
                                    <?php } ?>
                                    <?php if ($user_role && $twp_be_show_author_role) { ?>
                                        <div class="be-author-meta be-author-role">
                                            <span class="booster-svg-icon booster-svg-user">
                                                <?php booster_extension_the_theme_svg('user'); ?>
                                            </span><?php echo esc_html($user_role); ?>
                                        </div>
                                    <?php } ?>
                                </div>
                                <div class="be-author-profiles">
                                    <?php if ($twp_user_metabox_facebook) { ?>
                                        <a target="_blank" class="booster-url-link" href="<?php echo esc_url($twp_user_metabox_facebook); ?>">
                                            <span class="booster-svg-icon booster-svg-facebook">
                                                <?php booster_extension_the_theme_svg('facebook'); ?>
                                            </span>
                                        </a>
                                    <?php } ?>
                                    <?php if ($twp_user_metabox_twitter) { ?>
                                        <a target="_blank" class="booster-url-link" href="<?php echo esc_url($twp_user_metabox_twitter); ?>">
                                            <span class="booster-svg-icon booster-svg-twitter">
                                                <?php booster_extension_the_theme_svg('twitter'); ?>
                                            </span>
                                        </a>
                                    <?php } ?>
                                    <?php if ($twp_user_metabox_instagram) { ?>
                                        <a target="_blank" class="booster-url-link" href="<?php echo esc_url($twp_user_metabox_instagram); ?>">
                                            <span class="booster-svg-icon booster-svg-instagram">
                                                <?php booster_extension_the_theme_svg('instagram'); ?>
                                            </span>
                                        </a>
                                    <?php } ?>
                                    <?php if ($twp_user_metabox_pinterest) { ?>
                                        <a target="_blank" class="booster-url-link" href="<?php echo esc_url($twp_user_metabox_pinterest); ?>">
                                            <span class="booster-svg-icon booster-svg-pinterest">
                                                <?php booster_extension_the_theme_svg('pinterest'); ?>
                                            </span>
                                        </a>
                                    <?php } ?>
                                    <?php if ($twp_user_metabox_linkedin) { ?>
                                        <a target="_blank" class="booster-url-link" href="<?php echo esc_url($twp_user_metabox_linkedin); ?>">
                                            <span class="booster-svg-icon booster-svg-linkedin">
                                                <?php booster_extension_the_theme_svg('linkedin'); ?>
                                            </span>
                                        </a>
                                    <?php } ?>
                                    <?php if ($twp_user_metabox_youtube) { ?>
                                        <a target="_blank" class="booster-url-link" href="<?php echo esc_url($twp_user_metabox_youtube); ?>">
                                            <span class="booster-svg-icon booster-svg-youtube">
                                                <?php booster_extension_the_theme_svg('youtube'); ?>
                                            </span>
                                        </a>
                                    <?php } ?>
                                    <?php if ($twp_user_metabox_vimeo) { ?>
                                        <a target="_blank" class="booster-url-link" href="<?php echo esc_url($twp_user_metabox_vimeo); ?>">
                                            <span class="booster-svg-icon booster-svg-vimeo">
                                                <?php booster_extension_the_theme_svg('vimeo'); ?>
                                            </span>
                                        </a>
                                    <?php } ?>
                                    <?php if ($twp_user_metabox_whatsapp) { ?>
                                        <a target="_blank" class="booster-url-link" href="<?php echo esc_url($twp_user_metabox_whatsapp); ?>">
                                            <span class="booster-svg-icon booster-svg-whatsapp">
                                                <?php booster_extension_the_theme_svg('whatsapp'); ?>
                                            </span>
                                        </a>
                                    <?php } ?>
                                    <?php if ($twp_user_metabox_github) { ?>
                                        <a target="_blank" class="booster-url-link" href="<?php echo esc_url($twp_user_metabox_github); ?>">
                                            <span class="booster-svg-icon booster-svg-github">
                                                <?php booster_extension_the_theme_svg('github'); ?>
                                            </span>
                                        </a>
                                    <?php } ?>
                                    <?php if ($twp_user_metabox_wordpress) { ?>
                                        <a target="_blank" class="booster-url-link" href="<?php echo esc_url($twp_user_metabox_wordpress); ?>">
                                            <span class="booster-svg-icon booster-svg-wordpress">
                                                <?php booster_extension_the_theme_svg('wp'); ?>
                                            </span>
                                        </a>
                                    <?php } ?>
                                    <?php if ($twp_user_metabox_foursquare) { ?>
                                        <a target="_blank" class="booster-url-link"
                                           href="<?php echo esc_url($twp_user_metabox_foursquare); ?>">
                                            <span class="booster-svg-icon booster-svg-foursquare">
                                                <?php booster_extension_the_theme_svg('foursquare'); ?>
                                            </span>
                                        </a>
                                    <?php } ?>
                                    <?php if ($twp_user_metabox_vk) { ?>
                                        <a target="_blank" class="booster-url-link" href="<?php echo esc_url($twp_user_metabox_vk); ?>">
                                            <span class="booster-svg-icon booster-svg-vk">
                                                <?php booster_extension_the_theme_svg('vk'); ?>
                                            </span>
                                        </a>
                                    <?php } ?>
                                    <?php if ($twp_user_metabox_twitch) { ?>
                                        <a target="_blank" class="booster-url-link" href="<?php echo esc_url($twp_user_metabox_twitch); ?>">
                                            <span class="booster-svg-icon booster-svg-twitch">
                                                <?php booster_extension_the_theme_svg('twitch'); ?>
                                            </span>
                                        </a>
                                    <?php } ?>
                                    <?php if ($twp_user_metabox_tumblr) { ?>
                                        <a target="_blank" class="booster-url-link" href="<?php echo esc_url($twp_user_metabox_tumblr); ?>">
                                            <span class="booster-svg-icon booster-svg-tumblr">
                                                <?php booster_extension_the_theme_svg('tumblr'); ?>
                                            </span>
                                        </a>
                                    <?php } ?>
                                    <?php if ($twp_user_metabox_snapchat) { ?>
                                        <a target="_blank" class="booster-url-link" href="<?php echo esc_url($twp_user_metabox_snapchat); ?>">
                                            <span class="booster-svg-icon booster-svg-snapchat">
                                                <?php booster_extension_the_theme_svg('snapchat'); ?>
                                            </span>
                                        </a>
                                    <?php } ?>
                                    <?php if ($twp_user_metabox_skype) { ?>
                                        <a target="_blank" class="booster-url-link" href="<?php echo esc_url($twp_user_metabox_skype); ?>">
                                            <span class="booster-svg-icon booster-svg-skype">
                                                <?php booster_extension_the_theme_svg('skype'); ?>
                                            </span>
                                        </a>
                                    <?php } ?>
                                    <?php if ($twp_user_metabox_reddit) { ?>
                                        <a target="_blank" class="booster-url-link" href="<?php echo esc_url($twp_user_metabox_reddit); ?>">
                                            <span class="booster-svg-icon booster-svg-reddit">
                                                <?php booster_extension_the_theme_svg('reddit'); ?>
                                            </span>
                                        </a>
                                    <?php } ?>
                                    <?php if ($twp_user_metabox_stackoverflow) { ?>
                                        <a target="_blank" class="booster-url-link"
                                           href="<?php echo esc_url($twp_user_metabox_stackoverflow); ?>">
                                            <span class="booster-svg-icon booster-svg-stackoverflow">
                                                <?php booster_extension_the_theme_svg('stackoverflow'); ?>
                                            </span>
                                        </a>
                                    <?php } ?>
                                    <?php if ($twp_user_metabox_xing) { ?>
                                        <a target="_blank" class="booster-url-link" href="<?php echo esc_url($twp_user_metabox_xing); ?>">
                                            <span class="booster-svg-icon booster-svg-xing">
                                                <?php booster_extension_the_theme_svg('xing'); ?>
                                            </span>
                                        </a>
                                    <?php } ?>
                                    <?php if ($twp_user_metabox_delicious) { ?>
                                        <a target="_blank" class="booster-url-link" href="<?php echo esc_url($twp_user_metabox_delicious); ?>">
                                            <span class="booster-svg-icon booster-svg-delicious">
                                                <?php booster_extension_the_theme_svg('delicious'); ?>
                                            </span>
                                        </a>
                                    <?php } ?>
                                    <?php if ($twp_user_metabox_soundcloud) { ?>
                                        <a target="_blank" class="booster-url-link"
                                           href="<?php echo esc_url($twp_user_metabox_soundcloud); ?>">
                                            <span class="booster-svg-icon booster-svg-soundcloud">
                                                <?php booster_extension_the_theme_svg('soundcloud'); ?>
                                            </span>
                                        </a>
                                    <?php } ?>
                                    <?php if ($twp_user_metabox_behance) { ?>
                                        <a target="_blank" class="booster-url-link" href="<?php echo esc_url($twp_user_metabox_behance); ?>">
                                            <span class="booster-svg-icon booster-svg-behance">
                                                <?php booster_extension_the_theme_svg('behance'); ?>
                                            </span>
                                        </a>
                                    <?php } ?>
                                    <?php if ($twp_user_metabox_steam) { ?>
                                        <a target="_blank" class="booster-url-link" href="<?php echo esc_url($twp_user_metabox_steam); ?>">
                                            <span class="booster-svg-icon booster-svg-steam">
                                                <?php booster_extension_the_theme_svg('steam'); ?>
                                            </span>
                                        </a>
                                    <?php } ?>
                                    <?php if ($twp_user_metabox_dribbble) { ?>
                                        <a target="_blank" class="booster-url-link" href="<?php echo esc_url($twp_user_metabox_dribbble); ?>">
                                            <span class="booster-svg-icon booster-svg-dribbble">
                                                <?php booster_extension_the_theme_svg('dribbble'); ?>
                                            </span>
                                        </a>
                                    <?php } ?>
                                    <?php if ($twp_user_metabox_blogger) { ?>
                                        <a target="_blank" class="booster-url-link" href="<?php echo esc_url($twp_user_metabox_blogger); ?>">
                                            <span class="booster-svg-icon booster-svg-blogger">
                                                <?php booster_extension_the_theme_svg('blogger'); ?>
                                            </span>
                                        </a>
                                    <?php } ?>
                                    <?php if ($twp_user_metabox_flickr) { ?>
                                        <a target="_blank" class="booster-url-link" href="<?php echo esc_url($twp_user_metabox_flickr); ?>">
                                            <span class="booster-svg-icon booster-svg-flickr">
                                                <?php booster_extension_the_theme_svg('flickr'); ?>
                                            </span>
                                        </a>
                                    <?php } ?>
                                    <?php if ($twp_user_metabox_spotify) { ?>
                                        <a target="_blank" class="booster-url-link" href="<?php echo esc_url($twp_user_metabox_spotify); ?>">
                                            <span class="booster-svg-icon booster-svg-spotify">
                                                <?php booster_extension_the_theme_svg('spotify'); ?>
                                            </span>
                                        </a>
                                    <?php } ?>
                                    <?php if ($twp_user_metabox_rss) { ?>
                                        <a target="_blank" class="booster-url-link" href="<?php echo esc_url($twp_user_metabox_rss); ?>">
                                            <span class="booster-svg-icon booster-svg-rss">
                                                <?php booster_extension_the_theme_svg('rss'); ?>
                                            </span>
                                        </a>
                                    <?php } ?>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <?php 
		}
	}
endif;
global $post;
if( !empty( $_POST['userid'] ) ){
	$userid = absint( $_POST['userid'] );
}else{
	if( is_single() ){
		$userid = $post->post_author;
	}else{
		$userid = 1;
	}
	
}
booster_extension_authorbox_shortcode_display($userid); ?>
