/**
 * Customizer controls toggles
 */
( function( $ ) {

	/* Internal shorthand */
	var api = wp.customize;

	/**
	 * Trigger hooks
	 */
	NEWSMASHControlTrigger = {

	    /**
	     * Trigger a hook.
	     *
	     * @since 1.0.0
	     * @method triggerHook
	     * @param {String} hook The hook to trigger.
	     * @param {Array} args An array of args to pass to the hook.
		 */
	    triggerHook: function( hook, args )
	    {
	    	$( 'body' ).trigger( 'newsmash-control-trigger.' + hook, args );
	    },

	    /**
	     * Add a hook.
	     *
	     * @since 1.0.0
	     * @method addHook
	     * @param {String} hook The hook to add.
	     * @param {Function} callback A function to call when the hook is triggered.
	     */
	    addHook: function( hook, callback )
	    {
	    	$( 'body' ).on( 'newsmash-control-trigger.' + hook, callback );
	    },

	    /**
	     * Remove a hook.
	     *
	     * @since 1.0.0
	     * @method removeHook
	     * @param {String} hook The hook to remove.
	     * @param {Function} callback The callback function to remove.
	     */
	    removeHook: function( hook, callback )
	    {
		    $( 'body' ).off( 'newsmash-control-trigger.' + hook, callback );
	    },
	};

	/**
	 * Helper class that contains data for showing and hiding controls.
	 *
	 */
	NEWSMASHCustomizerToggles = {
		
		/**
		 *  newsmash_enable_post_excerpt
		 */
		'newsmash_enable_post_excerpt' :
		[
			{
				controls: [
					'newsmash_post_excerpt_length',
					'newsmash_blog_excerpt_more',
					'newsmash_show_post_btn',
					'newsmash_read_btn_txt',
				],
				callback: function( newsmash_enable_post_excerpt ) {

					var newsmash_enable_post_excerpt = api( 'newsmash_enable_post_excerpt' ).get();

					if ( '1' == newsmash_enable_post_excerpt ) {
						return true;
					}
					return false;
				}
			}
		],
		
		
		/**
		 *  newsmash_latest_post_rm_type
		 */
		'newsmash_latest_post_rm_type' :
		[
			{
				controls: [
					'newsmash_latest_post_rm_lbl',
				],
				callback: function( newsmash_latest_post_rm_type ) {

					var newsmash_latest_post_rm_type = api( 'newsmash_latest_post_rm_type' ).get();

					if ( 'style-2' == newsmash_latest_post_rm_type ) {
						return true;
					}
					return false;
				}
			}
		]		
	};

} )( jQuery );
