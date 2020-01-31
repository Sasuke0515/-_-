/**
 * External dependencies
 */
import { mount } from 'enzyme';

/**
 * WordPress dependencies
 */
import { Notice } from '@wordpress/components';

/**
 * Internal dependencies
 */
import ContrastChecker from '../';

describe( 'ContrastChecker', () => {
	const backgroundColor = '#ffffff';
	const textColor = '#000000';
	const isLargeText = true;
	const fallbackBackgroundColor = '#fff';
	const fallbackTextColor = '#000';
	const sameShade = '#666';
	const colorWithTransparency = 'rgba(102,102,102,0.5)';

	test( 'should render null when no colors are provided', () => {
		expect( mount( <ContrastChecker /> ).html() ).toBeNull();
	} );

	test( 'should render null when the colors meet AA WCAG guidelines.', () => {
		const wrapper = mount(
			<ContrastChecker
				backgroundColor={ backgroundColor }
				textColor={ textColor }
				isLargeText={ isLargeText }
				fallbackBackgroundColor={ fallbackBackgroundColor }
				fallbackTextColor={ fallbackTextColor }
			/>
		);

		expect( wrapper.html() ).toBeNull();
	} );

	test( 'should render component when the colors do not meet AA WCAG guidelines.', () => {
		const wrapper = mount(
			<ContrastChecker
				backgroundColor={ sameShade }
				textColor={ sameShade }
				isLargeText={ isLargeText }
				fallbackBackgroundColor={ fallbackBackgroundColor }
				fallbackTextColor={ fallbackTextColor }
			/>
		);

		expect(
			wrapper
				.find( Notice )
				.children()
				.text()
		).toBe(
			'This color combination may be hard for people to read. Try using a brighter background color and/or a darker text color.'
		);
	} );

	test( 'should render render null if background color contains a transparency', () => {
		const wrapper = mount(
			<ContrastChecker
				backgroundColor={ colorWithTransparency }
				textColor={ sameShade }
				isLargeText={ isLargeText }
				fallbackBackgroundColor={ fallbackBackgroundColor }
				fallbackTextColor={ fallbackTextColor }
			/>
		);

		expect( wrapper.html() ).toBeNull();
	} );

	test( 'should render render null if text color contains a transparency', () => {
		const wrapper = mount(
			<ContrastChecker
				backgroundColor={ sameShade }
				textColor={ colorWithTransparency }
				isLargeText={ isLargeText }
				fallbackBackgroundColor={ fallbackBackgroundColor }
				fallbackTextColor={ fallbackTextColor }
			/>
		);

		expect( wrapper.html() ).toBeNull();
	} );

	test( 'should render different message matching snapshot when background color has less brightness than text color.', () => {
		const darkerShade = '#555';

		const wrapper = mount(
			<ContrastChecker
				backgroundColor={ darkerShade }
				textColor={ sameShade }
				isLargeText={ ! isLargeText }
				fallbackBackgroundColor={ fallbackBackgroundColor }
				fallbackTextColor={ fallbackTextColor }
			/>
		);

		expect(
			wrapper
				.find( Notice )
				.children()
				.text()
		).toBe(
			'This color combination may be hard for people to read. Try using a darker background color and/or a brighter text color.'
		);
	} );

	test( 'should take into consideration wherever text is large or not', () => {
		const wrapperSmallText = mount(
			<ContrastChecker backgroundColor="#C44B4B" textColor="#000000" isLargeText={ false } />
		);

		expect(
			wrapperSmallText
				.find( Notice )
				.children()
				.text()
		).toBe(
			'This color combination may be hard for people to read. Try using a brighter background color and/or a darker text color.'
		);

		const wrapperLargeText = mount(
			<ContrastChecker backgroundColor="#C44B4B" textColor="#000000" isLargeText={ true } />
		);

		expect( wrapperLargeText.html() ).toBeNull();
	} );

	test( 'should take into consideration the font size passed', () => {
		const wrapperSmallFontSize = mount(
			<ContrastChecker backgroundColor="#C44B4B" textColor="#000000" fontSize={ 23 } />
		);

		expect(
			wrapperSmallFontSize
				.find( Notice )
				.children()
				.text()
		).toBe(
			'This color combination may be hard for people to read. Try using a brighter background color and/or a darker text color.'
		);

		const wrapperLargeText = mount(
			<ContrastChecker backgroundColor="#C44B4B" textColor="#000000" fontSize={ 24 } />
		);

		expect( wrapperLargeText.html() ).toBeNull();
	} );

	test( 'should use isLargeText to make decisions if both isLargeText and fontSize props are passed', () => {
		const wrapper = mount(
			<ContrastChecker
				backgroundColor="#C44B4B"
				textColor="#000000"
				fontSize={ 23 }
				isLargeText={ true }
			/>
		);

		expect( wrapper.html() ).toBeNull();

		const wrapperNoLargeText = mount(
			<ContrastChecker
				backgroundColor="#C44B4B"
				textColor="#000000"
				fontSize={ 24 }
				isLargeText={ false }
			/>
		);

		expect(
			wrapperNoLargeText
				.find( Notice )
				.children()
				.text()
		).toBe(
			'This color combination may be hard for people to read. Try using a brighter background color and/or a darker text color.'
		);
	} );

	test( 'should render null when the colors meet AA WCAG guidelines, with only fallback colors.', () => {
		const wrapper = mount(
			<ContrastChecker
				isLargeText={ isLargeText }
				fallbackBackgroundColor={ fallbackBackgroundColor }
				fallbackTextColor={ fallbackTextColor }
			/>
		);

		expect( wrapper.html() ).toBeNull();
	} );

	test( 'should render messages when the textColor is valid, but the fallback backgroundColor conflicts.', () => {
		const wrapper = mount(
			<ContrastChecker textColor={ textColor } fallbackBackgroundColor={ textColor } />
		);

		expect(
			wrapper
				.find( Notice )
				.children()
				.text()
		).toBe(
			'This color combination may be hard for people to read. Try using a brighter background color and/or a darker text color.'
		);
	} );
} );
