/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

class SidebarErrorBoundary extends Component {
	constructor( props ) {
		super( props );
		this.state = { hasError: false };
	}

	componentDidCatch() {
		this.setState( { hasError: true } );
	}

	render() {
		if ( this.state.hasError ) {
			return <p className="plugin-sidebar-error">
				{ __( 'An error occurred rendering the plugin sidebar.' ) }
			</p>;
		}
		return this.props.children;
	}
}

export default SidebarErrorBoundary;
