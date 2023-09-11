/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { store as blocksStore } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { name as buttonBlockName } from '../button';

const ALLOWED_BLOCKS = [ buttonBlockName ];

const DEFAULT_BLOCK = {
	name: buttonBlockName,
	attributesToCopy: [
		'backgroundColor',
		'border',
		'className',
		'fontFamily',
		'fontSize',
		'gradient',
		'style',
		'textColor',
		'width',
	],
};

function ButtonsEdit( { attributes, className } ) {
	const { fontSize, layout, style } = attributes;
	const blockProps = useBlockProps( {
		className: classnames( className, {
			'has-custom-font-size': fontSize || style?.typography?.fontSize,
		} ),
	} );
	const { preferredStyle, hasButtonVariations } = useSelect( ( select ) => {
		const preferredStyleVariations =
			select( blockEditorStore ).getSettings()
				.__experimentalPreferredStyleVariations;
		const buttonVariations = select( blocksStore ).getBlockVariations(
			buttonBlockName,
			'inserter'
		);
		return {
			preferredStyle:
				preferredStyleVariations?.value?.[ buttonBlockName ],
			hasButtonVariations: buttonVariations.length > 0,
		};
	}, [] );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED_BLOCKS,
		defaultBlock: DEFAULT_BLOCK,
		// This check should be handled by the `Inserter` internally to be consistent across all blocks that use it.
		directInsert: ! hasButtonVariations,
		template: [
			[
				buttonBlockName,
				{ className: preferredStyle && `is-style-${ preferredStyle }` },
			],
		],
		templateInsertUpdatesSelection: true,
		orientation: layout?.orientation ?? 'horizontal',
	} );

	return <div { ...innerBlocksProps } />;
}

export default ButtonsEdit;
