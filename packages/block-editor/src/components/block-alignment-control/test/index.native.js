/**
 * External dependencies
 */
import { render, fireEvent } from 'test/helpers';

/**
 * Internal dependencies
 */
import BlockAlignmentUI from '../ui';

it( 'should call onChange with undefined when the control is already active', () => {
	const onChangeMock = jest.fn();
	const screen = render(
		<BlockAlignmentUI value="right" onChange={ onChangeMock } />
	);
	const alignButton = screen.getByA11yLabel( 'Align' );
	fireEvent.press( alignButton );
	const rightAlignmentButton = screen.getByA11yLabel( 'Align right' );
	fireEvent.press( rightAlignmentButton );

	expect( onChangeMock ).toHaveBeenCalledTimes( 1 );
	expect( onChangeMock ).toHaveBeenCalledWith( undefined );
} );

it( 'should call onChange with alignment value when the control is inactive', () => {
	const onChangeMock = jest.fn();
	const screen = render(
		<BlockAlignmentUI value="left" onChange={ onChangeMock } />
	);
	const alignButton = screen.getByA11yLabel( 'Align' );
	fireEvent.press( alignButton );
	const centerAlignmentButton = screen.getByA11yLabel( 'Align center' );
	fireEvent.press( centerAlignmentButton );

	expect( onChangeMock ).toHaveBeenCalledTimes( 1 );
	expect( onChangeMock ).toHaveBeenCalledWith( 'center' );
} );
