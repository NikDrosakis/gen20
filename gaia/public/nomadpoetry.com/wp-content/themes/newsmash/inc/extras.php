<?php
/*=========================================
NewsMash Featured Link
=========================================*/
if ( ! function_exists( 'newsmash_site_featured_link' ) ) :
function newsmash_site_featured_link() {
	 if (is_front_page() || is_home()) {
		$newsmash_display_featured_link = get_theme_mod( 'newsmash_display_featured_link', 'front_post');
		$newsmash_hs_featured_link 		= get_theme_mod( 'newsmash_hs_featured_link', '1');
		if($newsmash_hs_featured_link=='1'):
			if (is_home() && ($newsmash_display_featured_link=='post' || $newsmash_display_featured_link=='front_post')):
				get_template_part('template-parts/section','featured-link'); 
			elseif (is_front_page() && ($newsmash_display_featured_link=='front' || $newsmash_display_featured_link=='front_post')):
				get_template_part('template-parts/section','featured-link'); 
			endif;
		endif;
	 }
	} 
endif;
add_action( 'newsmash_site_front_main2', 'newsmash_site_featured_link' );

/*=========================================
NewsMash Footer Widget
=========================================*/
if ( ! function_exists( 'newsmash_footer_widget' ) ) :
function newsmash_footer_widget() {
	$newsmash_footer_widget_column	= get_theme_mod('newsmash_footer_widget_column','4'); 
		if ($newsmash_footer_widget_column == '4') {
			$column = '3';
		} elseif ($newsmash_footer_widget_column == '3') {
			$column = '4';
		} elseif ($newsmash_footer_widget_column == '2') {
			$column = '6';
		} else{
			$column = '12';
		}
	if($newsmash_footer_widget_column !==''): 
	?>
	<div class="dt_footer-widgets">
		<div class="dt-row dt-g-lg-5 dt-g-5">
			<?php if ( is_active_sidebar( 'newsmash-footer-widget-1' ) ) : ?>
				<div class="dt-col-lg-<?php echo esc_attr($column); ?> dt-col-sm-6 dt-col-12">
					<?php dynamic_sidebar( 'newsmash-footer-widget-1'); ?>
				</div>
			<?php endif; ?>
			
			<?php if ( is_active_sidebar( 'newsmash-footer-widget-2' ) ) : ?>
				<div class="dt-col-lg-<?php echo esc_attr($column); ?> dt-col-sm-6 dt-col-12">
					<?php dynamic_sidebar( 'newsmash-footer-widget-2'); ?>
				</div>
			<?php endif; ?>
			
			<?php if ( is_active_sidebar( 'newsmash-footer-widget-3' ) ) : ?>
				<div class="dt-col-lg-<?php echo esc_attr($column); ?> dt-col-sm-6 dt-col-12">
					<?php dynamic_sidebar( 'newsmash-footer-widget-3'); ?>
				</div>
			<?php endif; ?>
			
			<?php if ( is_active_sidebar( 'newsmash-footer-widget-4' ) ) : ?>
				<div class="dt-col-lg-<?php echo esc_attr($column); ?> dt-col-sm-6 dt-col-12">
					<?php dynamic_sidebar( 'newsmash-footer-widget-4'); ?>
				</div>
			<?php endif; ?>
		</div>
	</div>
	<?php 
	endif; } 
endif;
add_action( 'newsmash_footer_widget', 'newsmash_footer_widget' );


/*=========================================
NewsMash Footer Bottom
=========================================*/
if ( ! function_exists( 'newsmash_footer_bottom' ) ) :
function newsmash_footer_bottom() {
	?>
	<div class="dt_footer-inner">
		<div class="dt-row dt-align-items-center dt-gy-4">
			<div class="dt-col-md-4 dt-text-md-left dt-text-center">
				<?php do_action('newsmash_footer_copyright_data'); ?>
			</div>
			<div class="dt-col-md-4 dt-text-center">
				<?php do_action('newsmash_footer_copyright_social'); ?>
			</div>
			<div class="dt-col-md-4 dt-text-md-right dt-text-center">
				<?php do_action('newsmash_top_scroller'); ?>
			</div>
		</div>
	</div>
	<?php
	} 
endif;
add_action( 'newsmash_footer_bottom', 'newsmash_footer_bottom' );

/*=========================================
NewsMash Footer Copyright
=========================================*/
if ( ! function_exists( 'newsmash_footer_copyright_data' ) ) :
function newsmash_footer_copyright_data() {
	$newsmash_footer_copyright_text = get_theme_mod('newsmash_footer_copyright_text','Copyright &copy; [current_year] [site_title] | Powered by [theme_author]');
	?>
	<?php if(!empty($newsmash_footer_copyright_text)): 
			$newsmash_copyright_allowed_tags = array(
				'[current_year]' => date_i18n('Y'),
				'[site_title]'   => get_bloginfo('name'),
				'[theme_author]' => sprintf(__('<a href="#">Desert Themes</a>', 'newsmash')),
			);
	?>
		 <span class="copyright">
			<?php
				echo apply_filters('newsmash_footer_copyright', wp_kses_post(newsmash_str_replace_assoc($newsmash_copyright_allowed_tags, $newsmash_footer_copyright_text)));
			?>
         </span>
<?php endif;
	} 
endif;
add_action( 'newsmash_footer_copyright_data', 'newsmash_footer_copyright_data' );


/*=========================================
NewsMash Footer Copyright Social
=========================================*/
if ( ! function_exists( 'newsmash_footer_copyright_social' ) ) :
function newsmash_footer_copyright_social() {
	$newsmash_footer_copyright_social_hs 	= get_theme_mod( 'newsmash_footer_copyright_social_hs','1'); 
	$newsmash_footer_copyright_social 		= get_theme_mod( 'newsmash_footer_copyright_social',newsmash_get_social_icon_default());
	if($newsmash_footer_copyright_social_hs=='1'): ?>
		<div class="widget widget_social">
			<?php
				$newsmash_footer_copyright_social = json_decode($newsmash_footer_copyright_social);
				if( $newsmash_footer_copyright_social!='' )
				{
				foreach($newsmash_footer_copyright_social as $item){	
				$social_icon = ! empty( $item->icon_value ) ? apply_filters( 'newsmash_translate_single_string', $item->icon_value, 'Footer Social' ) : '';	
				$social_link = ! empty( $item->link ) ? apply_filters( 'newsmash_translate_single_string', $item->link, 'Footer Social' ) : '';
			?>
				<a href="<?php echo esc_url( $social_link ); ?>"><i class="<?php echo esc_attr( $social_icon ); ?>"></i></a>
			<?php }} ?>
		</div>
	<?php endif;
	} 
endif;
add_action( 'newsmash_footer_copyright_social', 'newsmash_footer_copyright_social' );

/*=========================================
NewsMash Scroller
=========================================*/
if ( ! function_exists( 'newsmash_top_scroller' ) ) :
function newsmash_top_scroller() {
	$newsmash_hs_scroller_option	=	get_theme_mod('newsmash_hs_scroller_option','1');
	$newsmash_scroller_text			=	get_theme_mod('newsmash_scroller_text','Back to Top');
?>		
	<?php if ($newsmash_hs_scroller_option == '1' && !empty($newsmash_scroller_text)) { ?>
		<a href="#" id="return-to-top" class="float-md-end"><i class="fas fa-angle-up"></i><?php echo wp_kses_post( $newsmash_scroller_text ); ?></a>
	<?php }
	} 
endif;
add_action( 'newsmash_top_scroller', 'newsmash_top_scroller' );

function newsmash_get_post_view() {
    $count = get_post_meta( get_the_ID(), 'post_views_count', true );
	if(!empty($count)):
		return "$count views";
	else:
		return "0 views";
	endif;	
}

function newsmash_set_post_view() {
    $key = 'post_views_count';
    $post_id = get_the_ID();
    $count = (int) get_post_meta( $post_id, $key, true );
    $count++;
    update_post_meta( $post_id, $key, $count );
}
function newsmash_posts_column_views( $columns ) {
    $columns['post_views'] = 'Views';
    return $columns;
}
function newsmash_posts_custom_column_views( $column ) {
    if ( $column === 'post_views') {
        echo newsmash_get_post_view();
    }
}
add_filter( 'manage_posts_columns', 'newsmash_posts_column_views' );
add_action( 'manage_posts_custom_column', 'newsmash_posts_custom_column_views' );




if (!function_exists('newsmash_getpost_categories')) :
    function newsmash_getpost_categories($separator = '&nbsp',$class = '')
    {

        // Hide category and tag text for pages.
        if ('post' === get_post_type()) {

            global $post;
            ?>
            <div class="category-badge <?php echo esc_attr($class); ?>">
            <?php $post_categories = get_the_category($post->ID);
            if ($post_categories) {
                $output = '';
                foreach ($post_categories as $post_category) {
					$t_id = $post_category->term_id;
                    $color_id = "category_color_" . $t_id;

                    // retrieve the existing value(s) for this meta field. This returns an array
                    $term_meta = get_option($color_id);
                    $output .= '<a href="' . esc_url(get_category_link($post_category)) . '" alt="' . esc_attr(sprintf(__('View all posts in %s', 'newsmash'), $post_category->name)) . '"> 
                                 ' . esc_html($post_category->name) . '
                             </a>';
                }
                $output .= '';
                echo $output;

            }
            ?>
        </div>
        <?php }
    }
endif;

if ( ! class_exists( 'NEWSMASH_POST_CAT_META' ) ) {

class NEWSMASH_POST_CAT_META {

  public function __construct() {
    //
  }
 
 /*
  * Initialize the class and start calling our hooks and filters
  * @since 1.0.0
 */
 public function init() {
   add_action( 'category_add_form_fields', array ( $this, 'add_category_image' ), 10, 2 );
   add_action( 'created_category', array ( $this, 'save_category_image' ), 10, 2 );
   add_action( 'category_edit_form_fields', array ( $this, 'update_category_image' ), 10, 2 );
   add_action( 'edited_category', array ( $this, 'updated_category_image' ), 10, 2 );
   add_action( 'admin_enqueue_scripts', array( $this, 'load_media' ) );
   add_action( 'admin_footer', array ( $this, 'add_script' ) );
 }

public function load_media() {
 wp_enqueue_media();
}
 
 /*
  * Add a form field in the new category page
  * @since 1.0.0
 */
 public function add_category_image ( $taxonomy ) { ?>
   <div class="form-field term-group">
     <label for="category-image-id"><?php _e('Image', 'newsmash'); ?></label>
     <input type="hidden" id="category-image-id" name="category-image-id" class="custom_media_url" value="">
     <div id="category-image-wrapper"></div>
     <p>
       <input type="button" class="button button-secondary ct_tax_media_button" id="ct_tax_media_button" name="ct_tax_media_button" value="<?php _e( 'Add Image', 'newsmash' ); ?>" />
       <input type="button" class="button button-secondary ct_tax_media_remove" id="ct_tax_media_remove" name="ct_tax_media_remove" value="<?php _e( 'Remove Image', 'newsmash' ); ?>" />
    </p>
   </div>
   <div class="form-field">
		<label for="newsmash_cat_article_lbl"><?php _e( 'Article Label', 'newsmash' ); ?></label>
		<input type="text" name="newsmash_cat_article_lbl" id="newsmash_cat_article_lbl" value="">
	</div>
 <?php
 }
 
 /*
  * Save the form field
  * @since 1.0.0
 */
 public function save_category_image ( $term_id, $tt_id ) {
   if( isset( $_POST['category-image-id'] ) && '' !== $_POST['category-image-id'] ){
     $image = $_POST['category-image-id'];
     add_term_meta( $term_id, 'category-image-id', $image, true );
   }
   
   if( isset( $_POST['newsmash_cat_article_lbl'] ) && '' !== $_POST['newsmash_cat_article_lbl'] ){
     $newsmash_cat_article_lbl = $_POST['newsmash_cat_article_lbl'];
     add_term_meta( $term_id, 'newsmash_cat_article_lbl', $newsmash_cat_article_lbl, true );
   }
   
   if( isset( $_POST['newsmash_course_cat_url'] ) && '' !== $_POST['newsmash_course_cat_url'] ){
     $newsmash_course_cat_url = $_POST['newsmash_course_cat_url'];
     add_term_meta( $term_id, 'newsmash_course_cat_url', $newsmash_course_cat_url, true );
   }
 }
 
 /*
  * Edit the form field
  * @since 1.0.0
 */
 public function update_category_image ( $term, $taxonomy ) { ?>
   <tr class="form-field term-group-wrap">
     <th scope="row">
       <label for="category-image-id"><?php _e( 'Image', 'newsmash' ); ?></label>
     </th>
     <td>
       <?php $image_id = get_term_meta ( $term -> term_id, 'category-image-id', true ); ?>
       <input type="hidden" id="category-image-id" name="category-image-id" value="<?php echo $image_id; ?>">
       <div id="category-image-wrapper">
         <?php if ( $image_id ) { ?>
           <?php echo wp_get_attachment_image ( $image_id, 'thumbnail' ); ?>
         <?php } ?>
       </div>
       <p>
         <input type="button" class="button button-secondary ct_tax_media_button" id="ct_tax_media_button" name="ct_tax_media_button" value="<?php _e( 'Add Image', 'newsmash' ); ?>" />
         <input type="button" class="button button-secondary ct_tax_media_remove" id="ct_tax_media_remove" name="ct_tax_media_remove" value="<?php _e( 'Remove Image', 'newsmash' ); ?>" />
       </p>
     </td>
   </tr>
   
	 <?php $newsmash_cat_article_lbl = get_term_meta ( $term -> term_id, 'newsmash_cat_article_lbl', true ); ?>
	<tr class="form-field">
	<th scope="row" valign="top"><label for="newsmash_cat_article_lbl"><?php _e( 'Article Label', 'newsmash' ); ?></label></th>
		<td>
			<input type="text" name="newsmash_cat_article_lbl" id="newsmash_cat_article_lbl" value="<?php echo esc_attr( $newsmash_cat_article_lbl ) ? esc_attr( $newsmash_cat_article_lbl ) : ''; ?>">
		</td>
	</tr>
 <?php
 }

/*
 * Update the form field value
 * @since 0.1
 */
 public function updated_category_image ( $term_id, $tt_id ) {
   if( isset( $_POST['category-image-id'] ) && '' !== $_POST['category-image-id'] ){
     $image = $_POST['category-image-id'];
     update_term_meta ( $term_id, 'category-image-id', $image );
   } else {
     update_term_meta ( $term_id, 'category-image-id', '' );
   }
   
   if( isset( $_POST['newsmash_cat_article_lbl'] ) && '' !== $_POST['newsmash_cat_article_lbl'] ){
     $image = $_POST['newsmash_cat_article_lbl'];
     update_term_meta ( $term_id, 'newsmash_cat_article_lbl', $image );
   } else {
     update_term_meta ( $term_id, 'newsmash_cat_article_lbl', '' );
   }
 
 }

/*
 * Add script
 * @since 1.0.0
 */
 public function add_script() { 
	wp_enqueue_script('newsmash-category-image', get_template_directory_uri() . '/inc/customizer/assets/js/category.js', array('jquery'), true);
 }

  }
 
$NEWSMASH_POST_CAT_META = new NEWSMASH_POST_CAT_META();
$NEWSMASH_POST_CAT_META -> init();
 
}


/**
 * NewsMash Post Title
 */
if (!function_exists('newsmash_common_post_title')):
    function newsmash_common_post_title($tag,$class)
    {
        if ( is_single() ) :
							
		the_title('<'.$tag.' class="'.$class.'">', '</'.$tag.'>' );
		
		else:
		
		the_title( sprintf( '<'.$tag.' class="'.$class.'"><a href="%s" rel="bookmark">', esc_url( get_permalink() ) ), '</a></'.$tag.'>' );
		
		endif;
    }
add_action('newsmash_common_post_title','newsmash_common_post_title');	
endif;

/**
 * NewsMash Post Author
 */
if (!function_exists('newsmash_common_post_author')):
    function newsmash_common_post_author()
    {
		$user = wp_get_current_user(); ?>
		<li class="list-inline-item"><a href="<?php echo esc_url(get_author_posts_url( get_the_author_meta( 'ID' ) ));?>"><img src="<?php echo esc_url( get_avatar_url( $user->ID ) ); ?>" width="32" height="32" class="author" alt="<?php esc_attr(the_author()); ?>"/><?php esc_html(the_author()); ?></a></li>
   <?php }
add_action('newsmash_common_post_author','newsmash_common_post_author');	
endif;


/**
 * NewsMash Post Date
 */
if (!function_exists('newsmash_common_post_date')):
    function newsmash_common_post_date()
    {
	?>
		<li class="list-inline-item"><i class="far fa-calendar-alt"></i> <?php echo esc_html(get_the_date( 'F j, Y' )); ?></li>
   <?php }
add_action('newsmash_common_post_date','newsmash_common_post_date');	
endif;


/**
 * NewsMash post-format select type of icons
 */
if (!function_exists('newsmash_post_format_icon_type')):
    function newsmash_post_format_icon_type()
    {
        $format = get_post_format() ? : 'standard';

        if ( $format == 'aside' ) : ?>
			<i class="far fa-file-text"></i>
		<?php elseif ( $format == 'gallery' ) : ?>
			<i class="far fa-images"></i>
		<?php elseif ( $format == 'link' ) : ?>
			<i class="fas fa-link"></i>
		<?php elseif ( $format == 'image' ) : ?>
			<i class="far fa-image"></i>
		<?php elseif ( $format == 'quote' ) : ?>
			<i class="fas fa-quote-left"></i>
		<?php elseif ( $format == 'video' ) : ?>
			<i class="fas fa-video"></i>
		<?php elseif ( $format == 'audio' ) : ?>
				<i class="fas fa-headphones-simple"></i>
		<?php elseif ( $format == 'status' ) : ?>
			<i class="fab fa-rocketchat"></i>
		<?php elseif ( $format == 'chat' ) : ?>
			<i class="far fa-comment"></i>
		<?php endif;
    }
add_action('newsmash_post_format_icon_type','newsmash_post_format_icon_type');	
endif;


/**
 * NewsMash post-format Image Video
 */
if (!function_exists('newsmash_post_format_image_video')):
    function newsmash_post_format_image_video()
    {
        $format = get_post_format() ? : 'standard';
		global $post;
		
        if ( $format == 'video' || $format == 'audio' ) : 
			$media = get_media_embedded_in_content( 
						apply_filters( 'the_content', get_the_content() )
					);
					
			if(!empty($media)): ?>
				<div class="inner">
					<?php echo $media['0']; ?>
				</div>
			<?php endif;	
			
		 elseif ( $format == 'gallery' ) :
			
			global $post;
			
				$gallery = get_post_gallery( $post, false );
				if( ! empty($gallery) && has_block('gallery', $post->post_content)){ //if gallery was found
				  //strangely, IDs are served as a STRING (at least in WP 4.5)
				  if( !is_array($gallery['ids']) ) $gallery['ids'] = explode(',', $gallery['ids']); ?>
				  <div class="post-gallery">
					 <?php  foreach( $gallery['ids'] as $order => &$image_attachment_id ){ ?>
						<div class="item"><img width="1600" height="1067" src="<?php echo wp_get_attachment_image_src($image_attachment_id, 'full')[0]; ?>" class="attachment-full size-full" alt="" /></div>
					 <?php  } ?>			  
				  </div>
			<?php } 
			// if there is not a gallery block do this
			else { ?>
				<a href="<?php echo esc_url(get_permalink()); ?>">
					<div class="inner">
						<?php the_post_thumbnail(); ?>
					</div>
				</a>
		<?php }
	
				
		 else: ?>
				<a href="<?php echo esc_url(get_permalink()); ?>">
					<div class="inner">
						<?php the_post_thumbnail(); ?>
					</div>
				</a>
		<?php endif;
    }
endif;
add_action( 'newsmash_post_format_image_video', 'newsmash_post_format_image_video' );



/**
 * NewsMash post-format Image Video content
 */
if (!function_exists('newsmash_post_format_content')):
    function newsmash_post_format_content()
    {
        $format = get_post_format() ? : 'standard';

        if ( $format == 'video' || $format == 'audio' || $format == 'gallery' ) :
			the_excerpt();
		elseif ( $format == 'quote' ) :
			?>
			<blockquote><?php the_excerpt(); ?></blockquote>
		<?php elseif ( $format == 'link' ) : ?>
			<div class="post-linking">
				<?php
					$post_link = get_the_permalink();
					if ( preg_match('/<a (.+?)>/', get_the_content(), $match) ) {
						$link = array();
						foreach ( wp_kses_hair($match[1], array('https','http')) as $attr) {
							$link[$attr['name']] = $attr['value'];
						}
						$post_link = $link['href'];
						echo '<a href="'.$post_link.'">'.$post_link.'</a>';
					}
				?>
			</div>
			<?php

		else : 
			
			$newsmash_enable_post_excerpt= get_theme_mod('newsmash_enable_post_excerpt','1');
			if($newsmash_enable_post_excerpt == '1'):
				global $post;
				the_excerpt();
				if ( function_exists( 'newsmash_execerpt_btn' ) ) : newsmash_execerpt_btn(); endif; 
			else:	
				the_content(
					sprintf( 
						__( 'Read More', 'newsmash' ), 
						'<span class="screen-reader-text">  '.esc_html(get_the_title()).'</span>' 
					)
				);
			endif;		
			
		 endif;
    }
endif;
add_action( 'newsmash_post_format_content', 'newsmash_post_format_content' );



if ( ! function_exists( 'newsmash_post_sharing' ) ) { 
	function newsmash_post_sharing() {	
	
	global $post; ?>
	
	<div class="social-share dt-mr-auto">
		<button class="toggle-button fas fa-share-nodes"></button>
		<ul class="icons list-unstyled list-inline dt-mb-0">
			<?php $facebook_link = 'https://www.facebook.com/sharer/sharer.php?u='.esc_url( get_the_permalink() ); ?>
			<li class="list-inline-item"><a href="<?php echo esc_url ( $facebook_link ); ?>"><i class="fab fa-facebook-f"></i></a></li>
			
			<?php $twitter_link = 'https://twitter.com/intent/tweet?url='. esc_url( get_the_permalink() ); ?>
			<li class="list-inline-item"><a href="<?php echo esc_url ( $twitter_link ); ?>"><i class="fab fa-twitter"></i></a></li>
			
			<?php $linkedin_link = 'http://www.linkedin.com/shareArticle?url='.esc_url( get_the_permalink() ).'&amp;title='.get_the_title(); ?>
			<li class="list-inline-item"><a href="<?php echo esc_url( $linkedin_link ); ?>"><i class="fab fa-linkedin-in"></i></a></li>
			
			<?php $pinterest_link = 'https://pinterest.com/pin/create/button/?url='.esc_url( get_the_permalink() ).'&amp;media='.esc_url( wp_get_attachment_url( get_post_thumbnail_id($post->ID)) ).'&amp;description='.get_the_title(); ?>
			<li class="list-inline-item"><a href="<?php echo esc_url( $pinterest_link ); ?>"><i class="fab fa-pinterest"></i></a></li>
			
			<?php $whatsapp_link = 'https://api.whatsapp.com/send?text=*'. get_the_title() .'*\n'. esc_html( get_the_excerpt() ) .'\n'. esc_url( get_the_permalink() ); ?>
			<li class="list-inline-item"><a href="<?php echo esc_url( $whatsapp_link ); ?>"><i class="fab fa-whatsapp"></i></a></li>
			
			<?php $tumblr_link = 'http://www.tumblr.com/share/link?url='. urlencode( esc_url(get_permalink()) ) .'&amp;name='.urlencode( get_the_title() ).'&amp;description='.urlencode( wp_trim_words( get_the_excerpt(), 50 ) ); ?>
			<li class="list-inline-item"><a href="<?php echo esc_url( $tumblr_link ); ?>"><i class="fab fa-tumblr"></i></a></li>
			
			<?php $reddit_link = 'http://reddit.com/submit?url='. esc_url( get_the_permalink() ) .'&amp;title='.get_the_title(); ?>
			<li class="list-inline-item"><a href="<?php echo esc_url( $reddit_link ); ?>"><i class="fab fa-reddit"></i></a></li>
		</ul>
	</div>	
	<?php
	}
}	



/**
 * Top Tags
 */
function newsmash_list_top_tags($taxonomy = 'post_tag', $number = 8)
{
	if (is_front_page() || is_home()) {
		$newsmash_display_top_tags			= get_theme_mod( 'newsmash_display_top_tags', 'front_post');
		if ((is_home() && ($newsmash_display_top_tags=='post' || $newsmash_display_top_tags=='front_post')) || (is_front_page() && ($newsmash_display_top_tags=='front' || $newsmash_display_top_tags=='front_post'))):
			$newsmash_hs_top_tags 				= get_theme_mod('newsmash_hs_top_tags','1');
			$newsmash_top_tags_ttl 				= get_theme_mod('newsmash_top_tags_ttl','Top Tags');
			if($newsmash_hs_top_tags == '1'){
				$top_tags = get_terms(array(
					'taxonomy' => $taxonomy,
					'number' => absint($number),
					'orderby' => 'count',
					'order' => 'DESC',
					'hide_empty' => true,
				));

				$html = '';

				if (isset($top_tags) && !empty($top_tags)):
					$html .= '<section class="toptags"><div class="dt-container-md"><div class="toptags-inner clearfix">';
					if (!empty($newsmash_top_tags_ttl)):
						$html .= '<h6 class="title">';
						$html .= esc_html($newsmash_top_tags_ttl);
						$html .= '</h6>';
					endif;
					$html .= '<ul>';
					foreach ($top_tags as $tax_term):
						$html .= '<li>';
						$html .= '<a href="' . esc_url(get_term_link($tax_term)) . '">';
						$html .= $tax_term->name;
						$html .= '</a>';
						$html .= '</li>';
					endforeach;
					$html .= '</ul></div>';
					$html .= '</div></section>';
				endif;
				echo $html;
			}
		endif;	
	}
}


/**
 * NewsMash Post Pagination
 */
if (!function_exists('newsmash_post_pagination')):
    function newsmash_post_pagination()
    {
        $newsmash_post_pagination_type 	= get_theme_mod('newsmash_post_pagination_type', 'default');
		if(  $newsmash_post_pagination_type == 'next' ):
			 the_posts_navigation();
		else: 
			the_posts_pagination( array(
				'prev_text'          => '<i class="fa fa-angle-double-left"></i>',
				'next_text'          => '<i class="fa fa-angle-double-right"></i>'
			) );
		endif;
    }
endif;
add_action( 'newsmash_post_pagination', 'newsmash_post_pagination' );



if (!function_exists('newsmash_edit_post_link')) :

    function newsmash_edit_post_link()
    {
        global $post;
            edit_post_link(
                sprintf(
                    wp_kses(
                    /* translators: %s: Name of current post. Only visible to screen readers */
                        __('Edit <span class="screen-reader-text">%s</span>', 'newsmash'),
                        array(
                            'span' => array(
                                'class' => array(),
                            ),
                        )
                    ),
                    get_the_title()
                ),
                '<span class="edit-post-link"><i class="fas fa-edit"></i>',
                '</span>'
            );

    } 
endif;


/**
 * Calculate reading time by content length
 *
 * @param string  $text Content to calculate
 * @return int Number of minutes
 * @since  0.1
 */

if ( !function_exists( 'newsmash_read_time' ) ):
	function newsmash_read_time() {
		global $post;
		$content = get_post_field( 'post_content', $post->ID );
		$word_count = str_word_count( strip_tags( $content ) );
		$readingtime = ceil($word_count / 200);

		if ($readingtime == 1) {
		$timer = " minute Read";
		} else {
		$timer = " minutes Read";
		}
		$totalreadingtime = $readingtime . $timer;

		return $totalreadingtime;
	}
endif;

/*
 *
 * Social Icon
 */
function newsmash_get_social_icon_default() {
	return apply_filters(
		'newsmash_get_social_icon_default', json_encode(
				 array(
				array(
					'icon_value'	  =>  esc_html__( 'fab fa-facebook-f', 'newsmash' ),
					'link'	  =>  esc_html__( '#', 'newsmash' ),
					'id'              => 'customizer_repeater_header_social_001',
				),
				array(
					'icon_value'	  =>  esc_html__( 'fab fa-instagram', 'newsmash' ),
					'link'	  =>  esc_html__( '#', 'newsmash' ),
					'id'              => 'customizer_repeater_header_social_002',
				),
				array(
					'icon_value'	  =>  esc_html__( 'fab fa-twitter', 'newsmash' ),
					'link'	  =>  esc_html__( '#', 'newsmash' ),
					'id'              => 'customizer_repeater_header_social_003',
				),
				array(
					'icon_value'	  =>  esc_html__( 'fab fa-tiktok', 'newsmash' ),
					'link'	  =>  esc_html__( '#', 'newsmash' ),
					'id'              => 'customizer_repeater_header_social_005',
				)
			)
		)
	);
}


function newsmash_page_menu_args( $args ) {
	if ( ! isset( $args['show_home'] ) )
		$args['show_home'] = true;
	return $args;
}
add_filter( 'wp_page_menu_args', 'newsmash_page_menu_args' );
function newsmash_fallback_page_menu( $args = array() ) {
	$defaults = array('sort_column' => 'menu_order, post_title', 'menu_class' => 'menu', 'echo' => true, 'link_before' => '', 'link_after' => '');
	$args = wp_parse_args( $args, $defaults );
	$args = apply_filters( 'wp_page_menu_args', $args );
	$menu = '';
	$list_args = $args;
	// Show Home in the menu
	if ( ! empty($args['show_home']) ) {
		if ( true === $args['show_home'] || '1' === $args['show_home'] || 1 === $args['show_home'] )
			$text = 'Home';
		else
			$text = $args['show_home'];
		$class = '';
		if ( is_front_page() && !is_paged() )
		{
		$class = 'class="nav-item menu-item active"';
		}
		else
		{
			$class = 'class="nav-item menu-item "';
		}
		$menu .= '<li ' . $class . '><a class="nav-link " href="' . esc_url(home_url( '/' )) . '" title="' . esc_attr($text) . '">' . $args['link_before'] . $text . $args['link_after'] . '</a></li>';
		// If the front page is a page, add it to the exclude list
		if (get_option('show_on_front') == 'page') {
			if ( !empty( $list_args['exclude'] ) ) {
				$list_args['exclude'] .= ',';
			} else {
				$list_args['exclude'] = '';
			}
			$list_args['exclude'] .= get_option('page_on_front');
		}
	}
	$list_args['echo'] = false;
	$list_args['title_li'] = '';
	$list_args['walker'] = new newsmash_walker_page_menu;
	$menu .= str_replace( array( "\r", "\n", "\t" ), '', wp_list_pages($list_args) );
	if ( $menu )
		$menu = '<ul class="'. esc_attr($args['menu_class']) .'">' . $menu . '</ul>';

	$menu = $menu . "\n";
	$menu = apply_filters( 'wp_page_menu', $menu, $args );
	if ( $args['echo'] )
		echo $menu;
	else
		return $menu;
}
class newsmash_walker_page_menu extends Walker_Page{
	function start_lvl( &$output, $depth = 0, $args = array() ) {
		$indent = str_repeat("\t", $depth);
		$output .= "\n$indent<span class='dt_mobilenav-dropdown-toggle'><button type='button' class='fa fa-angle-right' aria-label='Mobile Dropdown Toggle'></button></span><ul class='dropdown-menu default'>\n";
	}
	function start_el( &$output, $page, $depth=0, $args = array(), $current_page = 0 )
	 {
		if ( $depth )
			$indent = str_repeat("\t", $depth);
		else
			$indent = '';

		if($depth === 0)
		{
			$child_class='nav-link';
		}
		else if($depth > 0)
		{
			$child_class='dropdown-item';
		}
		else
		{
			$child_class='';
		}
		extract($args, EXTR_SKIP);
		if($has_children){
			$css_class = array('menu-item page_item dropdown menu-item-has-children', 'page-item-'.$page->ID);
		}else{
			 $css_class = array('menu-item page_item dropdown', 'page-item-'.$page->ID);
		 }
		if ( !empty($current_page) ) {
			$_current_page = get_post( $current_page );
			if ( in_array( $page->ID, $_current_page->ancestors ) )
				$css_class[] = 'current_page_ancestor';
			if ( $page->ID == $current_page )
				$css_class[] = 'nav-item active';
			elseif ( $_current_page && $page->ID == $_current_page->post_parent )
				$css_class[] = 'current_page_parent';
		} elseif ( $page->ID == get_option('page_for_posts') ) {
			$css_class[] = 'current_page_parent';
		}
		$css_class = implode( ' ', apply_filters( 'page_css_class', $css_class, $page, $depth, $args, $current_page ) );
		$output .= $indent . '<li class="nav-item ' . $css_class . '"><a class="' . $child_class . '" href="' . esc_url(get_permalink($page->ID)) . '">' . $link_before . apply_filters( 'the_title', $page->post_title, $page->ID ) . $link_after . '</a>';
		if ( !empty($show_date) ) {
			if ( 'modified' == $show_date )
				$time = $page->post_modified;
			else
				$time = $page->post_date;
			$output .= " " . mysql2date($date_format, $time);
		}
	}
}