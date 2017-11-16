/**
 * Internal dependencies
 */
import { getBlockType } from '../api';
import { applyFilters } from '../hooks';

function BlockEdit( props ) {
	const { name, ...editProps } = props;
	const blockType = getBlockType( name );

	if ( ! blockType ) {
		return null;
	}

	// `edit` and `save` are functions or components describing the markup
	// with which a block is displayed. If `blockType` is valid, assign
	// them preferencially as the render value for the block.
	const Edit = blockType.edit || blockType.save;
	Edit.displayName = 'Edit';

	return applyFilters( 'BlockEdit', <Edit key="edit" { ...editProps } />, props );
}

export default BlockEdit;
