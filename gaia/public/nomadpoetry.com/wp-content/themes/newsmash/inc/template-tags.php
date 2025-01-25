<?php
/**
 * Custom template tags for this theme.
 *
 * Eventually, some of the functionality here could be replaced by core features.
 *
 * @package NewsMash
 */

/**
 * Theme Page Header Title
*/
function newsmash_theme_page_header_title(){
	if( is_archive() )
	{
		echo '<h1>';
		if ( is_day() ) :
		/* translators: %1$s %2$s: date */	
		  printf( esc_html__( '%1$s %2$s', 'newsmash' ), esc_html__('Archives','newsmash'), get_the_date() );  
        elseif ( is_month() ) :
		/* translators: %1$s %2$s: month */	
		  printf( esc_html__( '%1$s %2$s', 'newsmash' ), esc_html__('Archives','newsmash'), get_the_date( 'F Y' ) );
        elseif ( is_year() ) :
		/* translators: %1$s %2$s: year */	
		  printf( esc_html__( '%1$s %2$s', 'newsmash' ), esc_html__('Archives','newsmash'), get_the_date( 'Y' ) );
		elseif( is_author() ):
		/* translators: %1$s %2$s: author */	
			printf( esc_html__( '%1$s %2$s', 'newsmash' ), esc_html__('All posts by','newsmash'), get_the_author() );
        elseif( is_category() ):
		/* translators: %1$s %2$s: category */	
			printf( esc_html__( '%1$s %2$s', 'newsmash' ), esc_html__('Category','newsmash'), single_cat_title( '', false ) );
		elseif( is_tag() ):
		/* translators: %1$s %2$s: tag */	
			printf( esc_html__( '%1$s %2$s', 'newsmash' ), esc_html__('Tag','newsmash'), single_tag_title( '', false ) );
		elseif( class_exists( 'WooCommerce' ) && is_shop() ):
		/* translators: %1$s %2$s: WooCommerce */	
			printf( esc_html__( '%1$s %2$s', 'newsmash' ), esc_html__('Shop','newsmash'), single_tag_title( '', false ));
        elseif( is_archive() ): 
		the_archive_title( '<h1>', '</h1>' ); 
		endif;
		echo '</h1>';
	}
	elseif( is_404() )
	{
		echo '<h1>';
		/* translators: %1$s: 404 */	
		printf( esc_html__( '%1$s ', 'newsmash' ) , esc_html__('404','newsmash') );
		echo '</h1>';
	}
	elseif( is_search() )
	{
		echo '<h1>';
		/* translators: %1$s %2$s: search */
		printf( esc_html__( '%1$s %2$s', 'newsmash' ), esc_html__('Search results for','newsmash'), get_search_query() );
		echo '</h1>';
	}
	else
	{
		echo '<h1>'.esc_html( get_the_title() ).'</h1>';
	}
}


/**
 * Theme Breadcrumbs Url
*/
function newsmash_page_url() {
	$page_url = 'http';
	if ( key_exists("HTTPS", $_SERVER) && ( $_SERVER["HTTPS"] == "on" ) ){
		$page_url .= "s";
	}
	$page_url .= "://";
	if ($_SERVER["SERVER_PORT"] != "80") {
		$page_url .= $_SERVER["SERVER_NAME"].":".$_SERVER["SERVER_PORT"].$_SERVER["REQUEST_URI"];
	} else {
		$page_url .= $_SERVER["SERVER_NAME"].$_SERVER["REQUEST_URI"];
 }
 return $page_url;
}


/**
 * Theme Breadcrumbs
*/
if( !function_exists('newsmash_page_header_breadcrumbs') ):
	function newsmash_page_header_breadcrumbs() { 	
		global $post;
		$homeLink = home_url();
								
			if (is_home() || is_front_page()) :
				echo '<li class="breadcrumb-item"><a href="'.$homeLink.'">'.__('Home','newsmash').'</a></li>';
	            echo '<li class="breadcrumb-item active">'; echo single_post_title(); echo '</li>';
			else:
				echo '<li class="breadcrumb-item"><a href="'.$homeLink.'">'.__('Home','newsmash').'</a></li>';
				if ( is_category() ) {
				    echo '<li class="breadcrumb-item active"><a href="'. newsmash_page_url() .'">' . __('Archive by category','newsmash').' "' . single_cat_title('', false) . '"</a></li>';
				} elseif ( is_day() ) {
					echo '<li class="breadcrumb-item active"><a href="'. get_year_link(get_the_time('Y')) . '">'. get_the_time('Y') .'</a>';
					echo '<li class="breadcrumb-item active"><a href="'. get_month_link(get_the_time('Y'),get_the_time('m')) .'">'. get_the_time('F') .'</a>';
					echo '<li class="breadcrumb-item active"><a href="'. newsmash_page_url() .'">'. get_the_time('d') .'</a></li>';
				} elseif ( is_month() ) {
					echo '<li class="breadcrumb-item active"><a href="' . get_year_link(get_the_time('Y')) . '">' . get_the_time('Y') . '</a>';
					echo '<li class="breadcrumb-item active"><a href="'. newsmash_page_url() .'">'. get_the_time('F') .'</a></li>';
				} elseif ( is_year() ) {
				    echo '<li class="breadcrumb-item active"><a href="'. newsmash_page_url() .'">'. get_the_time('Y') .'</a></li>';
				} elseif ( is_single() && !is_attachment() && is_page('single-product') ) {					
				if ( get_post_type() != 'post' ) {
					$cat = get_the_category(); 
					$cat = $cat[0];
					echo '<li class="breadcrumb-item">';
					echo get_category_parents($cat, TRUE, '');
					echo '</li>';
					echo '<li class="breadcrumb-item active"><a href="' . newsmash_page_url() . '">'. get_the_title() .'</a></li>';
				} }  
					elseif ( is_page() && $post->post_parent ) {
				    $parent_id  = $post->post_parent;
					$breadcrumbs = array();
					while ($parent_id) {
						$page = get_page($parent_id);
						$breadcrumbs[] = '<li class="breadcrumb-item active"><a href="' . get_permalink($page->ID) . '">' . get_the_title($page->ID) . '</a>';
					$parent_id  = $page->post_parent;
					}
					$breadcrumbs = array_reverse($breadcrumbs);
					foreach ($breadcrumbs as $crumb) echo $crumb;
					    echo '<li class="breadcrumb-item active"><a href="' . newsmash_page_url() . '">'. get_the_title() .'</a></li>';
                    }
					elseif( is_search() )
					{
					    echo '<li class="breadcrumb-item active"><a href="' . newsmash_page_url() . '">'. get_search_query() .'</a></li>';
					}
					elseif( is_404() )
					{
						echo '<li class="breadcrumb-item active"><a href="' . newsmash_page_url() . '">'.__('Error 404','newsmash').'</a></li>';
					}
					else { 
					    echo '<li class="breadcrumb-item active"><a href="' . newsmash_page_url() . '">'. get_the_title() .'</a></li>';
					}
				endif;
        }
endif;


// NewsMash Excerpt Read More
if ( ! function_exists( 'newsmash_execerpt_btn' ) ) :
function newsmash_execerpt_btn() {
	$newsmash_show_post_btn		= get_theme_mod('newsmash_show_post_btn'); 
	$newsmash_read_btn_txt		= get_theme_mod('newsmash_read_btn_txt','Read more'); 
	if ( $newsmash_show_post_btn == '1' ) { 
	?>
	<a href="<?php echo esc_url(get_the_permalink()); ?>" class="dt-btn dt-btn-secondary" data-title="<?php echo wp_kses_post($newsmash_read_btn_txt); ?>"><?php echo wp_kses_post($newsmash_read_btn_txt); ?></a>
<?php } 
	} 
endif;

// NewsMash excerpt length
function newsmash_site_excerpt_length( $length ) {
	 $newsmash_post_excerpt_length= get_theme_mod('newsmash_post_excerpt_length','30'); 
    if( $newsmash_post_excerpt_length == 1000 ) {
        return 9999;
    }
    return esc_html( $newsmash_post_excerpt_length );
}
add_filter( 'excerpt_length', 'newsmash_site_excerpt_length', 999 );



// NewsMash excerpt more
function newsmash_site_excerpt_more( $more ) {
	return get_theme_mod('newsmash_blog_excerpt_more','&hellip;');;
}
add_filter( 'excerpt_more', 'newsmash_site_excerpt_more' );


/*=========================================
Register Google fonts for NewsMash.
=========================================*/
function newsmash_google_fonts_url() {
	
    $font_families = array('Josefin+Sans:wght@400;500;600;700&family=Source+Serif+Pro:wght@400;600;700');

	$fonts_url = add_query_arg( array(
		'family' => implode( '&family=', $font_families ),
		'display' => 'swap',
	), 'https://fonts.googleapis.com/css2' );

	require_once get_theme_file_path( 'inc/wptt-webfont-loader.php' );

	return wptt_get_webfont_url( esc_url_raw( $fonts_url ) );
}

function newsmash_google_fonts_scripts_styles() {
    wp_enqueue_style( 'newsmash-google-fonts', newsmash_google_fonts_url(), array(), null );
}
add_action( 'wp_enqueue_scripts', 'newsmash_google_fonts_scripts_styles' );


/**
 * Adds custom classes to the array of body classes.
 *
 * @param array $classes Classes for the body element.
 * @return array
 */
function newsmash_body_classes( $classes ) {
	// Adds a class of group-blog to blogs with more than 1 published author.
	if ( is_multi_author() ) {
		$classes[] = 'group-blog';
	}

	// Adds a class of hfeed to non-singular pages.
	if ( ! is_singular() ) {
		$classes[] = 'hfeed';
	}
	
	$newsmash_dark_mode=get_theme_mod('newsmash_dark_mode');
	if($newsmash_dark_mode == 'dark'){
		$classes[]='dark'; 
	}
		
	$newsmash_hs_hdr_sticky	=	get_theme_mod('newsmash_hs_hdr_sticky','1');
	if($newsmash_hs_hdr_sticky == "1"){
		$classes[]='sticky-header'; 
	}
	
	$sticky_sidebar_hs	=	get_theme_mod('sticky_sidebar_hs','1');	
	if($sticky_sidebar_hs == "1"){
		$classes[]='sticky-sidebar'; 
	}
	
	$classes[]='btn--effect-one';

	return $classes;
}
add_filter( 'body_class', 'newsmash_body_classes' );

function newsmash_post_classes( $classes ) {
	if ( is_single() ) : 
		$classes[]='single-post'; 
	endif;
	return $classes;
}
add_filter( 'post_class', 'newsmash_post_classes' );

/**
 * Returns posts.
 */
if (!function_exists('newsmash_get_posts')):
    function newsmash_get_posts($number_posts, $post_category = '0')
    {

        $ins_args = array(
            'post_type' => 'post',
            'posts_per_page' => absint($number_posts),
            'post_status' => 'publish',
            'orderby' => 'date',
            'order' => 'DESC',
            'ignore_sticky_posts' => true
        );

        $post_category = isset($post_category) ? $post_category : '0';
        if (absint($post_category) > 0) {
            $ins_args['cat'] = absint($post_category);
        }

        $got_posts = new WP_Query($ins_args);

        return $got_posts;
    }

endif;


if ( ! function_exists( 'wp_body_open' ) ) {
	/**
	 * Backward compatibility for wp_body_open hook.
	 *
	 * @since 0.1
	 */
	function wp_body_open() {
		do_action( 'wp_body_open' );
	}
}

if (!function_exists('newsmash_str_replace_assoc')) {

    /**
     * newsmash_str_replace_assoc
     * @param  array $replace
     * @param  array $subject
     * @return array
     */
    function newsmash_str_replace_assoc(array $replace, $subject) {
        return str_replace(array_keys($replace), array_values($replace), $subject);
    }
}

/*=========================================
NewsMash Switcher Dark Button
=========================================*/
function newsmash_switcher_dark_button()
{
	$newsmash_hs_dark_option = get_theme_mod('newsmash_hs_dark_option','1');
	if($newsmash_hs_dark_option =='1')
	{
?>		
<div class="dt_switcherdarkbtn">
        <div class="dt_switcherdarkbtn-left"></div>
        <div class="dt_switcherdarkbtn-inner"></div>
    </div>
<?php 	
}}
add_action('wp_head','newsmash_switcher_dark_button',999);	


/*=========================================
NewsMash Site Preloader
=========================================*/
if ( ! function_exists( 'newsmash_site_preloader' ) ) :
function newsmash_site_preloader() {
	$newsmash_hs_preloader_option 	= get_theme_mod( 'newsmash_hs_preloader_option','1'); 
	if($newsmash_hs_preloader_option == '1') { 
	?>
		 <div id="dt_preloader" class="dt_preloader">
			<div class="dt_preloader-inner">
				<div class="dt_preloader-handle">
					<button type="button" class="dt_preloader-close site--close"></button>
					<div class="dt_preloader-animation">
						<div class="dt_preloader-object one"></div>
						<div class="dt_preloader-object two"></div>
						<div class="dt_preloader-object three"></div>
						<div class="dt_preloader-object four"></div>
					</div>
				</div>
			</div>
		</div>
	<?php }
	} 
endif;
add_action( 'newsmash_site_preloader', 'newsmash_site_preloader' );



/*=========================================
NewsMash Site Header
=========================================*/
if ( ! function_exists( 'newsmash_site_main_header' ) ) :
function newsmash_site_main_header() {
	get_template_part('template-parts/site','header');
} 
endif;
add_action( 'newsmash_site_main_header', 'newsmash_site_main_header' );



/*=========================================
NewsMash Header Image
=========================================*/
if ( ! function_exists( 'newsmash_wp_hdr_image' ) ) :
function newsmash_wp_hdr_image() {
	if ( get_header_image() ) : 
	$header_image = get_header_image(); ?>
	<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="custom-header" id="custom-header" rel="home">
		<img src="<?php echo esc_url($header_image); ?>" width="<?php echo esc_attr( get_custom_header()->width ); ?>" height="<?php echo esc_attr( get_custom_header()->height ); ?>" alt="<?php echo esc_attr(get_bloginfo( 'title' )); ?>">
	</a>
<?php endif;
	} 
endif;
add_action( 'newsmash_wp_hdr_image', 'newsmash_wp_hdr_image' );


/*=========================================
NewsMash Header Left Text
=========================================*/
if ( ! function_exists( 'newsmash_header_left_text' ) ) :
function newsmash_header_left_text() {
	$newsmash_hs_hdr_left_text 	= get_theme_mod( 'newsmash_hs_hdr_left_text','1'); 
	$newsmash_hdr_left_ttl  	= get_theme_mod( 'newsmash_hdr_left_ttl','<i class="fas fa-fire-alt"></i> Trending News:');
	$newsmash_hdr_left_text_cat = get_theme_mod( 'newsmash_hdr_left_text_cat','0');
	$newsmash_hdr_left_text_posts= newsmash_get_posts(100, $newsmash_hdr_left_text_cat);
	if($newsmash_hs_hdr_left_text=='1'): ?>
		<div class="widget dt-news-headline">
			<?php if(!empty($newsmash_hdr_left_ttl)): ?>
				<strong class="dt-news-heading"><?php echo wp_kses_post($newsmash_hdr_left_ttl); ?></strong>
			<?php endif; ?>
			<span class="dt_heading dt_heading_2">
				<span class="dt_heading_inner">
					<?php
						if ($newsmash_hdr_left_text_posts->have_posts()) :
						$i=0;
						while ($newsmash_hdr_left_text_posts->have_posts()) : $newsmash_hdr_left_text_posts->the_post();
						global $post;
						$i=$i+1;
						if($i=='1'):
							newsmash_common_post_title('b','is_on'); 
						else:
							newsmash_common_post_title('b',''); 
						endif;
						endwhile;endif;wp_reset_postdata();
					?>
				</span>
			</span>
		</div>
	<?php endif;
} 
endif;
add_action( 'newsmash_header_left_text', 'newsmash_header_left_text' );


/*=========================================
NewsMash Header Address
=========================================*/
if ( ! function_exists( 'newsmash_header_address' ) ) :
function newsmash_header_address() {
	$newsmash_hs_hdr_top_ads 	= get_theme_mod( 'newsmash_hs_hdr_top_ads','1'); 
	$newsmash_hdr_top_ads_icon= get_theme_mod( 'newsmash_hdr_top_ads_icon','fas fa-map-marker-alt'); 
	$newsmash_hdr_top_ads_title = get_theme_mod( 'newsmash_hdr_top_ads_title','Chicago 12, Melborne City, USA');
	$newsmash_hdr_top_ads_link = get_theme_mod( 'newsmash_hdr_top_ads_link');
	if($newsmash_hs_hdr_top_ads=='1'): ?>
		<div class="widget dt-address">
			<?php if(!empty($newsmash_hdr_top_ads_icon)): ?>
				<i class="<?php echo esc_attr($newsmash_hdr_top_ads_icon); ?>"></i>
			<?php endif; ?>
			
			<?php if(!empty($newsmash_hdr_top_ads_title)): ?>
				<?php if(!empty($newsmash_hdr_top_ads_link)): ?>
					<span><a href="<?php echo esc_url($newsmash_hdr_top_ads_link); ?>"><?php echo wp_kses_post($newsmash_hdr_top_ads_title); ?></a></span>
				<?php else: ?>
					<span><?php echo wp_kses_post($newsmash_hdr_top_ads_title); ?></span>
				<?php endif; ?>
			<?php endif; ?>
		</div>
	<?php endif;
} 
endif;
add_action( 'newsmash_header_address', 'newsmash_header_address' );


/*=========================================
NewsMash Date
=========================================*/
if ( ! function_exists( 'newsmash_header_date' ) ) :
function newsmash_header_date() {
	$newsmash_hs_hdr_date 		= get_theme_mod( 'newsmash_hs_hdr_date','1'); 
	$newsmash_hdr_date_display 	= get_theme_mod( 'newsmash_hdr_date_display','theme');
	if($newsmash_hs_hdr_date=='1'): ?>
		<div class="widget dt-current-date">
			<span>
				<i class="fas fa-calendar-alt"></i> 
				<?php 
					if($newsmash_hdr_date_display=='theme'): 
						echo date_i18n('D. M jS, Y ', strtotime(current_time("Y-m-d"))); 
					else:
						echo date_i18n( get_option( 'date_format' ) ); 
					endif; 
				?>
			</span>
		</div>
	<?php endif;
} 
endif;
add_action( 'newsmash_header_date', 'newsmash_header_date' );

/*=========================================
NewsMash Social Icon
=========================================*/
if ( ! function_exists( 'newsmash_site_social' ) ) :
function newsmash_site_social() {
	// Social 
	$newsmash_hs_hdr_social 	= get_theme_mod( 'newsmash_hs_hdr_social','1'); 
	$newsmash_hdr_social 		= get_theme_mod( 'newsmash_hdr_social',newsmash_get_social_icon_default());
	if($newsmash_hs_hdr_social=='1'): ?>
		<div class="widget widget_social">
			<?php
				$newsmash_hdr_social = json_decode($newsmash_hdr_social);
				if( $newsmash_hdr_social!='' )
				{
				foreach($newsmash_hdr_social as $item){	
				$social_icon = ! empty( $item->icon_value ) ? apply_filters( 'newsmash_translate_single_string', $item->icon_value, 'Header section' ) : '';	
				$social_link = ! empty( $item->link ) ? apply_filters( 'newsmash_translate_single_string', $item->link, 'Header section' ) : '';
			?>
				<a href="<?php echo esc_url( $social_link ); ?>"><i class="<?php echo esc_attr( $social_icon ); ?>"></i></a>
			<?php }} ?>
		</div>
	<?php endif;
} 
endif;
add_action( 'newsmash_site_social', 'newsmash_site_social' );

/*=========================================
NewsMash Site Header
=========================================*/
if ( ! function_exists( 'newsmash_site_header' ) ) :
function newsmash_site_header() {
$newsmash_hs_hdr 	= get_theme_mod( 'newsmash_hs_hdr','1');
if($newsmash_hs_hdr == '1') { 
?>
	<div class="dt-container-md">
		<div class="dt-row">
			<div class="dt-col-lg-7 dt-col-12">
				<div class="dt_header-wrap left">
					<?php  do_action('newsmash_header_date'); ?>
					<?php  do_action('newsmash_header_left_text'); ?>
				</div>
			</div>
			<div class="dt-col-lg-5 dt-col-12">
				<div class="dt_header-wrap right">
					<?php do_action('newsmash_hdr_account'); ?>
					<?php  do_action('newsmash_header_address'); ?>
				</div>
			</div>
		</div>
	</div>
	<?php }
	} 
endif;
add_action( 'newsmash_site_header', 'newsmash_site_header' );



/*=========================================
NewsMash Site Navigation
=========================================*/
if ( ! function_exists( 'newsmash_site_header_navigation' ) ) :
function newsmash_site_header_navigation() {
	wp_nav_menu( 
		array(  
			'theme_location' => 'primary_menu',
			'container'  => '',
			'menu_class' => 'dt_navbar-mainmenu',
			'fallback_cb' => 'newsmash_fallback_page_menu',
			'walker' => new WP_Bootstrap_Navwalker()
			 ) 
		);
	} 
endif;
add_action( 'newsmash_site_header_navigation', 'newsmash_site_header_navigation' );


/*=========================================
NewsMash Header Button
=========================================*/
if ( ! function_exists( 'newsmash_header_button' ) ) :
function newsmash_header_button() {
	$newsmash_hs_hdr_btn 		= get_theme_mod( 'newsmash_hs_hdr_btn','1'); 
	$newsmash_hdr_btn_lbl 		= get_theme_mod( 'newsmash_hdr_btn_lbl','Get Started'); 
	$newsmash_hdr_btn_link 		= get_theme_mod( 'newsmash_hdr_btn_link','#'); 
	$newsmash_hdr_btn_target 		= get_theme_mod( 'newsmash_hdr_btn_target');
	if($newsmash_hdr_btn_target=='1'): $target='target=_blank'; else: $target=''; endif; 
	if($newsmash_hs_hdr_btn=='1'  && !empty($newsmash_hdr_btn_lbl)):	
?>
	<li class="dt_navbar-button-item">
		<a href="<?php echo esc_url($newsmash_hdr_btn_link); ?>" <?php echo esc_attr($target); ?> class="dt-btn dt-btn-primary" data-title="<?php echo wp_kses_post($newsmash_hdr_btn_lbl); ?>"><?php echo wp_kses_post($newsmash_hdr_btn_lbl); ?></a>
	</li>
<?php endif;
	} 
endif;
add_action( 'newsmash_header_button', 'newsmash_header_button' );


/*=========================================
NewsMash Site Search
=========================================*/
if ( ! function_exists( 'newsmash_site_main_search' ) ) :
function newsmash_site_main_search() {
	$newsmash_hs_hdr_search 	= get_theme_mod( 'newsmash_hs_hdr_search','1'); 
	$newsmash_search_result 	= get_theme_mod( 'newsmash_search_result','post');
	if($newsmash_hs_hdr_search=='1'):	
?>
<li class="dt_navbar-search-item">
	<button class="dt_navbar-search-toggle"><svg class="icon"><use xlink:href="<?php echo esc_url(get_template_directory_uri()); ?>/assets/icons/icons.svg#search-icon"></use></svg></button>
	<div class="dt_search search--header">
		<form method="get" class="dt_search-form" action="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="<?php esc_attr_e( 'search again', 'newsmash' ); ?>">
			<label for="dt_search-form-1">
				 <?php if($newsmash_search_result=='product' && class_exists('WooCommerce')):	?>
					<input type="hidden" name="post_type" value="product" />
				 <?php endif; ?>
				<span class="screen-reader-text"><?php esc_html_e( 'Search for:', 'newsmash' ); ?></span>
				<input type="search" id="dt_search-form-1" class="dt_search-field" placeholder="<?php esc_attr_e( 'search Here', 'newsmash' ); ?>" value="" name="s" />
			</label>
			<button type="submit" class="dt_search-submit search-submit"><i class="fas fa-search" aria-hidden="true"></i></button>
		</form>
		<button type="button" class="dt_search-close"><i class="fas fa-long-arrow-alt-up" aria-hidden="true"></i></button>
	</div>
</li>
<?php endif;
	} 
endif;
add_action( 'newsmash_site_main_search', 'newsmash_site_main_search' );



/*=========================================
NewsMash WooCommerce Cart
=========================================*/
if ( ! function_exists( 'newsmash_woo_cart' ) ) :
function newsmash_woo_cart() {
	$newsmash_hs_hdr_cart 	= get_theme_mod( 'newsmash_hs_hdr_cart','1'); 
	if($newsmash_hs_hdr_cart=='1' && class_exists( 'WooCommerce' )):	
	?>
	<li class="dt_navbar-cart-item">
		<a href="javascript:void(0);" class="dt_navbar-cart-icon">
			<span class="cart_icon">
				<svg class="icon"><use xlink:href="<?php echo esc_url(get_template_directory_uri()); ?>/assets/icons/icons.svg#cart-icon"></use></svg>
			</span>
			<?php 
				$count = WC()->cart->cart_contents_count;
				
				if ( $count > 0 ) {
				?>
					 <strong class="cart_count"><?php echo esc_html( $count ); ?></strong>
				<?php 
				}
				else {
					?>
					<strong class="cart_count"><?php  esc_html_e('0','newsmash'); ?></strong>
					<?php 
				}
			?>
		</a>
		<div class="dt_navbar-shopcart">
			<?php get_template_part('woocommerce/cart/mini','cart'); ?>      
		</div>
	</li>
	<?php endif; 
	} 
endif;
add_action( 'newsmash_woo_cart', 'newsmash_woo_cart' );


 /**
 * Add WooCommerce Cart Icon With Cart Count (https://isabelcastillo.com/woocommerce-cart-icon-count-theme-header)
 */
function newsmash_woo_add_to_cart_fragment( $fragments ) {
	
    ob_start();
    $count = WC()->cart->cart_contents_count; 
    ?> 
	<?php 
			$count = WC()->cart->cart_contents_count;
			
			if ( $count > 0 ) {
			?>
				 <strong class="cart_count"><?php echo esc_html( $count ); ?></strong>
			<?php 
			}
			else {
				?>
				<strong class="cart_count"><?php esc_html_e('0','newsmash'); ?></strong>
				<?php 
			}
	?>
	<?php
 
    $fragments['.cart_count'] = ob_get_clean();
     
    return $fragments;
}
add_filter( 'woocommerce_add_to_cart_fragments', 'newsmash_woo_add_to_cart_fragment' );


/*=========================================
NewsMash My Account
=========================================*/
if ( ! function_exists( 'newsmash_hdr_account' ) ) {
	function newsmash_hdr_account() {	
		$newsmash_hs_hdr_account 		= get_theme_mod( 'newsmash_hs_hdr_account','1');
		if($newsmash_hs_hdr_account=='1'  && class_exists( 'woocommerce' )): ?>
			<div class="widget dt-user-login">
				<?php if(is_user_logged_in()): ?>
					<a href="<?php echo esc_url(wp_logout_url( home_url())); ?>" class="dt_user_btn"><i class="fas fa-user-alt"></i></a>
				<?php else: ?>
					<a href="<?php echo esc_url(wp_login_url( home_url())); ?>" class="dt_user_btn"><i class="fas fa-user-alt"></i></a>
				<?php endif; ?>
			</div>
		<?php endif;
	}
}
add_action( 'newsmash_hdr_account', 'newsmash_hdr_account' );


/*=========================================
NewsMash Site Logo
=========================================*/
if ( ! function_exists( 'newsmash_site_logo' ) ) :
function newsmash_site_logo() {
		$newsmash_title_tagline_seo = get_theme_mod( 'newsmash_title_tagline_seo');
		if(has_custom_logo())
			{	
				the_custom_logo();
			}
			else { 
			?>
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="site--title">
				<h1 class="site--title">
					<?php 
						echo esc_html(get_bloginfo('name'));
					?>
				</h1>
			</a>	
		<?php 						
			}
		?>
		<?php if($newsmash_title_tagline_seo=='1'): ?>	
			<h1 class="site--title" style="display: none;">
				<?php 
					echo esc_html(get_bloginfo('name'));
				?>
			</h1>
		<?php
			endif;
			$newsmash_description = get_bloginfo( 'description');
			if ($newsmash_description) : ?>
				<p class="site--description"><?php echo esc_html($newsmash_description); ?></p>
		<?php endif;
	} 
endif;
add_action( 'newsmash_site_logo', 'newsmash_site_logo' );


/*=========================================
NewsMash Slider Right
=========================================*/
if ( ! function_exists( 'newsmash_site_slider_right' ) ) :
function newsmash_site_slider_right() {
	$newsmash_tabfirst_cat			= get_theme_mod('newsmash_tabfirst_cat','0');
	$newsmash_tabsecond_cat			= get_theme_mod('newsmash_tabsecond_cat','0');
	$newsmash_hs_slider_tab_meta	= get_theme_mod('newsmash_hs_slider_tab_meta','1');
	$newsmash_hs_slider_tab_title	= get_theme_mod('newsmash_hs_slider_tab_title','1');
	$newsmash_hs_slider_tab_cat_meta= get_theme_mod('newsmash_hs_slider_tab_cat_meta','1');
	$newsmash_hs_slider_tab_date_meta= get_theme_mod('newsmash_hs_slider_tab_date_meta','1');
	$newsmash_hs_slider_tab_author_meta= get_theme_mod('newsmash_hs_slider_tab_author_meta','1');
	$newsmash_num_slides_tab		= get_theme_mod('newsmash_num_slides_tab','3');
	$newsmash_slider_tab1_posts		= newsmash_get_posts($newsmash_num_slides_tab, $newsmash_tabfirst_cat);
	$newsmash_slider_tab2_posts		= newsmash_get_posts($newsmash_num_slides_tab, $newsmash_tabsecond_cat);	
?>
	 <div class="dt_tabs post-tabs rounded bordered">
		<ul class="tabs" id="postsTab" role="tablist">
			<?php 
				$newsmash_tabfirst_cat = (int) $newsmash_tabfirst_cat;
				$newsmash_tabsecond_cat = (int) $newsmash_tabsecond_cat;
				
				if(!empty($newsmash_tabfirst_cat)):
					$catFirst = str_replace(" ","-", strtolower(get_cat_name( $newsmash_tabfirst_cat )));
					$catSecond = str_replace(" ","-", strtolower(get_cat_name( $newsmash_tabsecond_cat )));
				else:
					$catFirst = esc_html('popular','newsmash');
					$catSecond = esc_html('recent','newsmash');
				endif;
				
				
			?>
			<?php if(!empty($newsmash_tabfirst_cat)):?>
				<li role="presentation"><button aria-controls='<?php echo esc_html($catFirst); ?>' aria-selected="true" class="nav-link active" data-tab="<?php echo esc_html($catFirst); ?>" role="tab" type="button"><?php echo esc_html(get_cat_name( $newsmash_tabfirst_cat )); ?></button></li>
			<?php else: ?>
				<li role="presentation"><button aria-controls='<?php echo esc_html($catFirst); ?>' aria-selected="true" class="nav-link active" data-tab="<?php echo esc_html($catFirst); ?>" role="tab" type="button"><?php esc_html_e('Popular','newsmash'); ?></button></li>
			<?php endif; ?>
			
			<?php if(!empty($newsmash_tabsecond_cat)):?>
				<li role="presentation"><button aria-controls="<?php echo esc_html($catSecond); ?>" aria-selected="false" class="nav-link" data-tab="<?php echo esc_html($catSecond); ?>" role="tab" type="button"><?php echo esc_html(get_cat_name( $newsmash_tabsecond_cat )); ?></button></li>
			<?php else: ?>
				<li role="presentation"><button aria-controls='<?php echo esc_html($catSecond); ?>' aria-selected="true" class="nav-link" data-tab="<?php echo esc_html($catSecond); ?>" role="tab" type="button"><?php esc_html_e('Recent','newsmash'); ?></button></li>
			<?php endif; ?>
		</ul>
		<div class="tab-content" id="postsTabContent">
			<div class="lds-dual-ring"></div>
			<div aria-labelledby="<?php esc_attr_e('popular-tab','newsmash'); ?>" class="tab-pane fade active show" id="<?php echo esc_html($catFirst); ?>" role="tabpanel">
				<?php
				if ($newsmash_slider_tab1_posts->have_posts()) :
					while ($newsmash_slider_tab1_posts->have_posts()) : $newsmash_slider_tab1_posts->the_post();

					global $post;
				?>
					<div class="post post-list-sm circle">
						<?php if ( has_post_thumbnail() ) { ?>
							<div class="thumb circle">
								<a href="#">
									<div class="inner"><img width="60" height="60" src="<?php echo esc_url(get_the_post_thumbnail_url()); ?>" class="wp-post-image" alt="<?php echo esc_attr(the_title()); ?>" /></div>
								</a>
							</div>
						<?php } ?>
						<div class="details clearfix">
							<?php if($newsmash_hs_slider_tab_cat_meta=='1'): ?>	
								<?php newsmash_getpost_categories(); ?>
							<?php endif; ?>	
							<?php     
								if($newsmash_hs_slider_tab_title=='1'):
									newsmash_common_post_title('h6','post-title dt-my-0');
								endif; 
							?> 
							<?php if($newsmash_hs_slider_tab_date_meta=='1'): ?>	
								<ul class="meta list-inline dt-mt-1 dt-mb-0">
									<?php do_action('newsmash_common_post_date'); ?>
								</ul>
							<?php endif; ?>	
						</div>
					</div>
				<?php endwhile;endif;wp_reset_postdata(); ?>
			</div>
			<div aria-labelledby="<?php esc_attr_e('recent-tab','newsmash'); ?>" class="tab-pane fade" id="<?php echo esc_html($catSecond); ?>" role="tabpanel">
				<?php
				if ($newsmash_slider_tab2_posts->have_posts()) :
					while ($newsmash_slider_tab2_posts->have_posts()) : $newsmash_slider_tab2_posts->the_post();

					global $post;
				?>
					<div class="post post-list-sm circle">
						<?php if ( has_post_thumbnail() ) { ?>
							<div class="thumb circle">
								<a href="#">
									<div class="inner"><img width="60" height="60" src="<?php echo esc_url(get_the_post_thumbnail_url()); ?>" class="wp-post-image" alt="<?php echo esc_attr(the_title()); ?>" /></div>
								</a>
							</div>
						<?php } ?>
						<div class="details clearfix">
							<?php if($newsmash_hs_slider_tab_cat_meta=='1'): ?>	
								<?php newsmash_getpost_categories(); ?>
							<?php endif; ?>	
							<?php     
								if($newsmash_hs_slider_tab_title=='1'):
									newsmash_common_post_title('h6','post-title dt-my-0');
								endif; 
							?> 
							<?php if($newsmash_hs_slider_tab_date_meta=='1'): ?>	
								<ul class="meta list-inline dt-mt-1 dt-mb-0">
									<?php do_action('newsmash_common_post_date'); ?>
								</ul>
							<?php endif; ?>	
						</div>
					</div>
				<?php endwhile;endif;wp_reset_postdata(); ?>                                  
			</div>
		</div>
	</div>
	<?php
	} 
endif;
add_action( 'newsmash_site_slider_right', 'newsmash_site_slider_right' );

/*=========================================
NewsMash Slider
=========================================*/
if ( ! function_exists( 'newsmash_site_slider' ) ) :
function newsmash_site_slider() {
	 if (is_front_page() || is_home()) {
		$newsmash_display_slider 		= get_theme_mod( 'newsmash_display_slider', 'front_post');
		$newsmash_hs_slider 		= get_theme_mod( 'newsmash_hs_slider', '1');
		if($newsmash_hs_slider=='1'):
			if (is_home() && ($newsmash_display_slider=='post' || $newsmash_display_slider=='front_post')):
				get_template_part('template-parts/section','slider');
			elseif (is_front_page() && ($newsmash_display_slider=='front' || $newsmash_display_slider=='front_post')):
				get_template_part('template-parts/section','slider');
			endif;
		endif;
	 }
	} 
endif;
add_action( 'newsmash_site_front_main', 'newsmash_site_slider' );
