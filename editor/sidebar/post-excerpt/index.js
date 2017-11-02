/**
 * External dependencies
 */
import { connect } from 'react-redux';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { PanelBody } from '@wordpress/components';

/**
 * Internal Dependencies
 */
import PostExcerptForm from '../../post-excerpt';
import { isEditorSidebarPanelOpened } from '../../selectors';
import { toggleSidebarPanel } from '../../actions';

/**
 * Module Constants
 */
const PANEL_NAME = 'post-excerpt';

function PostExcerpt( { isOpened, onTogglePanel } ) {
	return (
		<PanelBody title={ __( 'Excerpt' ) } opened={ isOpened } onToggle={ onTogglePanel }>
			<PostExcerptForm />
		</PanelBody>
	);
}

export default connect(
	( state ) => {
		return {
			isOpened: isEditorSidebarPanelOpened( state, PANEL_NAME ),
		};
	},
	{
		onTogglePanel() {
			return toggleSidebarPanel( PANEL_NAME );
		},
	}
)( PostExcerpt );

