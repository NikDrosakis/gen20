<?php
/**
 * Base Widget Class
 */
class Newsmash_Widget_Base extends WP_Widget
{
    /**
     * @var Array of string
     */
    public $text_fields = array();

    /**
     * @var Array of string
     */
    public $url_fields = array();
    /**
     * @var Array of string
     */
    public $text_areas = array();
    /**
     * @var Array of string
     */
    public $checkboxes = array();
    /**
     * @var Array of string
     */
    public $select_fields = array();

    /**
     * @var form instance object
     */
    public $form_instance = '';

    /**
     * Register widget with WordPress.
     */
    function __construct($id, $name, $args = array(), $controls = array())
    {
        parent::__construct(
            $id, // Base ID
            $name, // Name
            $args, // Args
            $controls
        );
    }

    /**
     * Function to quick create form input field
     *
     * @param string $field widget field name
     * @param string $label
     * @param string $note field note to appear below
     */
    public function newsmash_generate_text_input($field, $label, $value, $type = 'text', $note = '', $class = '')
    {
        $instance = isset($this->form_instance[$field]) ? $this->form_instance[$field] : $value;
        ?>
        <p>
            <label for="<?php echo esc_attr($this->get_field_id($field)); ?>">
                <?php echo esc_html($label); ?>
            </label>
            <input class="widefat <?php echo $class; ?>"
                   id="<?php echo esc_attr($this->get_field_id($field)); ?>"
                   name="<?php echo esc_attr($this->get_field_name($field)); ?>"
                   type="<?php echo esc_attr($type); ?>"
                   value="<?php echo esc_attr($instance); ?>"/>
            <?php if (!empty($note)): ?>
                <small><?php echo esc_html($note); ?></small>
            <?php endif; ?>
        </p>
        <?php
    }

    /**
     * Function to quick create form input field
     *
     * @param string $field widget field name
     * @param string $label
     * @param string $note field note to appear below
     */
    public function newsmash_generate_textarea($field, $label, $note = '')
    {
        $instance = isset($this->form_instance[$field]) ? $this->form_instance[$field] : '';
        ?>
        <p>
            <label for="<?php echo esc_attr($instance); ?>">
                <?php echo esc_html($label); ?>
            </label>
            <textarea class="widefat"
                      id="<?php echo esc_attr($instance); ?>"
                      name="<?php echo esc_attr($instance); ?>"><?php echo esc_html($instance); ?></textarea>
            <?php if (!empty($note)): ?>
                <small><?php echo esc_html($note); ?></small>
            <?php endif; ?>
        </p>
        <?php
    }

    /**
     * Generate checkbox input
     *
     * @param string $field widget field name
     * @param string $label
     * @param string $note field note to appear below
     * @param Object $instance widget instance
     * @param Array_A $elements
     */
    public function newsmash_generate_checkbox_input($field, $label, $elements, $note = '')
    {
        $instance = isset($this->form_instance[$field]) ? $this->form_instance[$field] : true;
        ?>
        <div class="newsmash-multiple-check-form">
            <p>
                <label for="<?php echo esc_attr($this->get_field_id($field)); ?>">
                    <?php echo esc_html($label); ?>
                </label>
            </p>
            <ul>
                <?php foreach ($elements as $key => $elem) : ?>
                    <li>
                        <input type="checkbox" value="<?php echo esc_attr($key); ?>"
                               id="<?php echo esc_attr($instance . '-' . $elem); ?>"
                               name="<?php echo esc_attr($instance); ?>[]" <?php checked(is_array($instance) && in_array($key, $instance)); ?> />
                        <label for="<?php echo esc_attr($instance . '-' . $elem); ?>">
                            <?php echo esc_html(ucfirst($elem)); ?>
                        </label>
                    </li>
                <?php endforeach; ?>
            </ul>
            <?php if (!empty($note)): ?>
                <p>
                    <small><?php echo esc_html($note); ?></small>
                </p>
            <?php endif; ?>
        </div>
        <?php
    }

    /**
     * Generate select input
     *
     * @param string $field widget field name
     * @param string $label
     * @param string $note field note to appear below
     * @param Array_A $elements
     */
    public function newsmash_generate_select_options($field, $label, $elements, $note = '')
    {
        $instance = isset($this->form_instance[$field]) ? $this->form_instance[$field] : $label;
        ?>
        <p>
            <label for="<?php echo esc_attr($this->get_field_id($field)); ?>">
                <?php echo esc_html($label); ?>
            </label>
            <select class="widefat" id="<?php echo esc_attr($this->get_field_id($field)); ?>"
                    name="<?php echo esc_attr($this->get_field_name($field)); ?>" style="width:100%;">
                <?php foreach ($elements as $key => $elem) : ?>
                    <option value="<?php echo esc_attr($key); ?>" <?php selected($instance, $key); ?>><?php echo ucfirst($elem); ?></option>
                    </li>
                <?php endforeach; ?>
            </select>
            <?php if (!empty($note)): ?>
                <small><?php echo esc_html($note); ?></small>
            <?php endif; ?>
        </p>
        <?php
    }


    public function newsmash_generate_image_upload($field, $label, $value, $note = '', $class = '')
    {
        $instance = isset($this->form_instance[$field]) ? $this->form_instance[$field] : '';
        ?>
        <div>
            <label for="<?php echo esc_attr($this->get_field_id($field)); ?>">
                <?php echo $label; ?>
            </label>
            <p></p>
            <div class="image-preview-wrap">
                <div class="image-preview">
                    <?php if (!empty($instance)) :
                        $image_attributes = wp_get_attachment_image_src($instance);
                        if ($image_attributes):
                            ?>

                            <img src="<?php echo esc_attr($image_attributes[0]); ?>" alt=""/>
                        <?php endif; ?>
                    <?php endif; ?>
                </div><!-- .image-preview -->

                <input type="hidden" class="img" name="<?php echo esc_attr($this->get_field_name($field)); ?>"
                       id="<?php echo esc_attr($this->get_field_id($field)); ?>"
                       value="<?php echo esc_attr($instance); ?>"/>
                <input type="button" class="select-img button button-primary"
                       value="<?php esc_attr_e('Upload', 'newsmash'); ?>"
                       data-uploader_title="<?php esc_attr_e('Select Image', 'newsmash'); ?>"
                       data-uploader_button_text="<?php esc_attr_e('Choose Image', 'newsmash'); ?>"/>
                <?php
                $image_status = false;
                if (!empty($instance)) {
                    $image_status = true;
                }
                $remove_button_style = 'display:none;';
                if (true === $image_status) {
                    $remove_button_style = 'display:inline-block;';
                }
                ?>
                <input type="button" value="<?php echo _x('X', 'Remove', 'newsmash'); ?>"
                       class="button button-secondary btn-image-remove"
                       style="<?php echo esc_attr($remove_button_style); ?>"/>


            </div>
        </div><!-- .image-preview-wrap -->

        <?php
    }
    
    public function newsmash_generate_checkbox_options($field, $label, $elements, $note = '')
    {
        $instance = isset($this->form_instance[$field]) ? $this->form_instance[$field] : $label;
        ?>
        <p>
            <label for="<?php echo esc_attr($this->get_field_id($field)); ?>">
                <?php echo esc_html($label); ?>
            </label>
            <?php foreach ($elements as $key => $elem) : ?>
            <input type="radio" id="<?php echo esc_attr($this->get_field_id($field).'-'.$key ); ?>" name="<?php echo esc_attr($this->get_field_name($field)); ?>" value="<?php echo esc_attr($key); ?>" <?php checked($count_per_row == esc_attr($key), true); ?>>
                  <label for="<?php echo esc_attr($this->get_field_id($field). '-'.$key); ?>" class="input-label"><?php echo ucfirst($elem); ?></label>&nbsp
                <?php endforeach; ?>
            <?php if (!empty($note)): ?>
                <small><?php echo esc_html($note); ?></small>
            <?php endif; ?>
        </p>
        <?php
    }


    /**
     * Sanitize widget form values as they are saved.
     *
     * @see WP_Widget::update()
     *
     * @param array $new_instance Values just sent to be saved.
     * @param array $old_instance Previously saved values from database.
     *
     * @return array Updated safe values to be saved.
     */
    public function update($new_instance, $old_instance)
    {
        $instance = array();
        $instance = $this->newsmash_sanitize_data($instance, $new_instance);
        return $instance;
    }

    public function newsmash_sanitize_data($instance, $new_instance)
    {
        if (is_array($this->text_fields)) {
            // update the text fields values
            foreach ($this->text_fields as $field) {
                $instance = array_merge($instance, $this->newsmash_update_text($field, $new_instance));
            }
        }

        if (is_array($this->url_fields)) {
            // update the text fields values
            foreach ($this->url_fields as $field) {
                $instance = array_merge($instance, $this->newsmash_update_url($field, $new_instance));
            }
        }

        if (is_array($this->text_areas)) {
            //update the textarea_values
            foreach ($this->text_areas as $field) {
                $instance = array_merge($instance, $this->newsmash_update_textarea($field, $new_instance));
            }
        }
        if (is_array($this->checkboxes)) {
            // update the checkbox fields values
            foreach ($this->checkboxes as $field) {
                $instance = array_merge($instance, $this->newsmash_update_checkbox($field, $new_instance));
            }
        }
        if (is_array($this->select_fields)) {
            // update the select fields values
            foreach ($this->select_fields as $field) {
                $instance = array_merge($instance, $this->newsmash_update_select($field, $new_instance));
            }
        }
        return $instance;
    }

    /**
     * Update and sanitize backend value of the text field
     *
     * @param string $name
     * @param object $new_instance
     * @return object validate new instance
     */
    public function newsmash_update_text($name, $new_instance)
    {
        $instance = array();
        $instance[$name] = (!empty($new_instance[$name])) ? sanitize_text_field($new_instance[$name]) : '';
        return $instance;
    }

    /**
     * Update and sanitize backend value of the text field
     *
     * @param string $name
     * @param object $new_instance
     * @return object validate new instance
     */
    public function newsmash_update_url($name, $new_instance)
    {
        $instance = array();
        $instance[$name] = (!empty($new_instance[$name])) ? esc_url_raw($new_instance[$name]) : '';
        return $instance;
    }

    /**
     * Update and sanitize backend value of the textarea
     *
     * @param string $name
     * @param object $new_instance
     * @return object validate new instance
     */
    public function newsmash_update_textarea($name, $new_instance)
    {
        $instance = array();
        $instance[$name] = (!empty($new_instance[$name])) ? sanitize_textarea_field($new_instance[$name]) : '';
        return $instance;
    }

    /**
     * Update and sanitize backend value of the checkbox field
     *
     * @param string $name
     * @param object $new_instance
     * @return object validate new instance
     */
    public function newsmash_update_checkbox($name, $new_instance)
    {
        $instance = array();
        // make sure any checkbox has been checked
        if (!empty($new_instance[$name])) {
            // if multiple checkboxes has been checked
            if (is_array($new_instance[$name])) {
                // iterate over multiple checkboxes
                foreach ($new_instance[$name] as $key => $value) {
                    $instance[$name][$key] = (!empty($new_instance[$name][$key])) ? esc_attr($value) : '';
                }
            } else {
                $instance[$name] = esc_attr($new_instance[$name]);
            }
        }
        return $instance;
    }

    /**
     * Update and sanitize backend value of the select field
     *
     * @param string $name
     * @param object $new_instance
     * @return object validate new instance
     */
    public function newsmash_update_select($name, $new_instance)
    {
        $instance = array();
        $instance[$name] = (!empty($new_instance[$name])) ? esc_attr($new_instance[$name]) : '';
        return $instance;
    }


}

if (!function_exists('newsmash_get_cat_terms')):
function newsmash_get_cat_terms( $category_id = 0, $taxonomy='category', $default='' ){
    $taxonomy = !empty($taxonomy) ? $taxonomy : 'category';

    if ( $category_id > 0 ) {
            $term = get_term_by('id', absint($category_id), $taxonomy );
            if($term)
                return esc_html($term->name);


    } else {
        $terms = get_terms(array(
            'taxonomy' => $taxonomy,
            'orderby' => 'name',
            'order' => 'ASC',
            'hide_empty' => true,
        ));


        if (isset($terms) && !empty($terms)) {
            foreach ($terms as $term) {
                if( $default != 'first' ){
                    $array['0'] = __('Select Category', 'newsmash');
                }
                $array[$term->term_id] = esc_html($term->name);
            }

            return $array;
        }   
    }
}
endif;





if (!function_exists('newsmash_widget_crousel_column')):
function newsmash_widget_crousel_column( $default='1' ){
	$col = array( "1" => "1", "2" => "2", "3" => "3", "4" => "4");  
return $col;     
}
endif;


/* Theme Widgets*/
require get_template_directory() . '/inc/widgets/posts-slider.php';
require get_template_directory() . '/inc/widgets/popular-post.php';

/* Register site widgets */
if ( ! function_exists( 'newsmash_custom_widgets' ) ) :
    /**
     * Load widgets
     */
    function newsmash_custom_widgets() {
        register_widget( 'newsmash_posts_slider_widget' );
        register_widget( 'newsmash_popular_post_widget');
    }
endif;
add_action( 'widgets_init', 'newsmash_custom_widgets' );



/**
 * newsmash Widgets - Loader.
 *
 * @package newsmash Widget
 * @since 1.0.0
 */

if ( ! class_exists( 'Newsmash_Widgets_Loader' ) ) {

    /**
     * Customizer Initialization
     */
    class Newsmash_Widgets_Loader {

        /**
         * Member Variable
         *
         * @var instance
         */
        private static $instance;

        /**
         *  Initiator
         */
        public static function get_instance() {
            if ( ! isset( self::$instance ) ) {
                self::$instance = new self;
            }
            return self::$instance;
        }

        /**
         *  Constructor
         */
        public function __construct() {


            // Add Widget.

             add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ) );
        }
        
       
            
        function enqueue_admin_scripts() {
             



        }
        
        
    }
}

/**
*  Kicking this off by calling 'get_instance()' method
*/
Newsmash_Widgets_Loader::get_instance();