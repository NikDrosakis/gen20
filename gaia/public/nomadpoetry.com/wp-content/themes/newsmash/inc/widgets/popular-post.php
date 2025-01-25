<?php
if (!class_exists('newsmash_Popular_Post_Widget')) :
    /**
     * Adds newsmash_Popular_Post_Widget widget.
     */
    class newsmash_Popular_Post_Widget extends Newsmash_Widget_Base
    {
        /**
         * Sets up a new widget instance.
         *
         * @since 1.0.0
         */
        function __construct()
        {
            $this->text_fields = array('newsmash-popular-posts-ttl', 'newsmash-count-posts');
            $this->select_fields = array('newsmash-select-cat');

            $widget_ops = array(
                'classname' => 'newsmash_popular_post_widget',
                'description' => __('Displays posts from selected category.', 'newsmash'),
                'customize_selective_refresh' => true,
            );

            parent::__construct('newsmash_popular_post_widget', __('DT: Popular Posts', 'newsmash'), $widget_ops);
        }

        /**
         * Front-end display of widget.
         *
         * @see WP_Widget::widget()
         *
         * @param array $args Widget arguments.
         * @param array $instance Saved values from database.
         */

        public function widget($args, $instance)
        {

            $instance = parent::newsmash_sanitize_data($instance, $instance);


            /** This filter is documented in wp-includes/default-widgets.php */

            $title = apply_filters('widget_title', $instance['newsmash-popular-posts-ttl'], $instance, $this->id_base);
            $category = isset($instance['newsmash-select-cat']) ? $instance['newsmash-select-cat'] : '0';
            $newsmash_count_posts = isset($instance['newsmash-count-posts']) ? $instance['newsmash-count-posts'] : '5';

            // open the widget container
            echo $args['before_widget'];
            ?>
             <!-- bs-posts-sec bs-posts-modul-6 -->
            <div class="latest-post-widget">
                <?php if (!empty($title)): ?>
					<div class="widget-header">
						<h4 class="widget-title"><?php echo esc_html($title); ?></h4>
					</div>
                <?php endif;
                $all_posts = newsmash_get_posts($newsmash_count_posts, $category);
                ?>
                <!-- bs-posts-sec-inner -->
                    <?php
					$newsmash_hs_latest_post_date_meta	= get_theme_mod('newsmash_hs_latest_post_date_meta','1');	
					
                    if ($all_posts->have_posts()) :
						$i=0;
                        while ($all_posts->have_posts()) : $all_posts->the_post();
                            global $post; ?>
                             <div class="post post-list-sm circle">
								<?php if ( has_post_thumbnail() ) : ?>
									<div class="thumb circle">
										<span class="number"><?php  $i++; echo esc_html($i); ?></span>
										<a href="blog<?php echo esc_url(the_permalink()); ?>">
											<div class="inner">
												<img src="<?php echo esc_url(get_the_post_thumbnail_url()); ?>" alt="<?php echo esc_attr(the_title()); ?>" />
											</div>
										</a>
									</div>
								<?php endif; ?>
								<div class="details clearfix">
									<h6 class="post-title dt-my-0"><a href="<?php echo esc_url(the_permalink()); ?>"><?php echo esc_html(the_title()); ?></a></h6>
									<ul class="meta list-inline dt-mt-1 dt-mb-0">
										<?php if($newsmash_hs_latest_post_date_meta=='1'): ?>
											<li class="list-inline-item"><?php echo esc_html(get_the_date( 'F j, Y' )); ?></li>
										<?php endif; ?>
									</ul>
								</div>
							</div>
                              
                    <?php endwhile; ?>
                <?php endif;
                wp_reset_postdata(); ?>
                 <!-- // bs-posts-sec-inner -->
            </div> <!-- // bs-posts-sec block_6 -->
            <?php
            // close the widget container
            echo $args['after_widget'];
        }

        /**
         * Back-end widget form.
         *
         * @see WP_Widget::form()
         *
         * @param array $instance Previously saved values from database.
         */
        public function form($instance)
        {
            $this->form_instance = $instance;
           

            $categories = newsmash_get_cat_terms();
            $newsmash_count_posts = isset($instance['newsmash-count-posts']) ? $instance['newsmash-count-posts'] : '5';
         
          

            if (isset($categories) && !empty($categories)) {
                // generate the text input for the title of the widget. Note that the first parameter matches text_fields array entry
                echo parent::newsmash_generate_text_input('newsmash-popular-posts-ttl', 'Title', 'Popular Posts');
                echo parent::newsmash_generate_select_options('newsmash-select-cat', __('Select Category', 'newsmash'), $categories);

                echo parent::newsmash_generate_text_input('newsmash-count-posts', __('Number of Post to Show', 'newsmash'), $newsmash_count_posts);

               
            }

        }

    }
endif;