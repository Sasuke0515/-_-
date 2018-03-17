/**
 * Internal dependencies
 */
import './style.scss';

/**
 * Renders the more menu item layout.
 *
 * @return {WPElement} More menu item layout.
 */
function MoreMenuItemLayout( { title, icon, isActive, onClick } ) {
	return (
		<button onClick={ onClick } className="edit-post-plugin-more-menu-item__more-menu-item-layout">
			{ title }
		</button>
	);
}

export default MoreMenuItemLayout;
