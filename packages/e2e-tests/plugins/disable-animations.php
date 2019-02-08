<?php
/**
 * Plugin Name: Gutenberg Test Plugin, Disables the CSS animations
 * Plugin URI: https://github.com/WordPress/gutenberg
 * Author: Gutenberg Team
 *
 * @package gutenberg-test-disable-animations
 */

/**
 * Enqueue CSS stylesheet disabling animations.
 */
function enqueue_disable_animations_stylesheet() {
	$custom_css = '* { animation-duration: 1ms !important; }';
	wp_add_inline_style( 'wp-components', $custom_css );
}

add_action( 'enqueue_block_editor_assets', 'enqueue_disable_animations_stylesheet' );
