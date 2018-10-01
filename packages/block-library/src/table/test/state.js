/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * WordPress dependencies
 */
import { create } from '@wordpress/rich-text';

/**
 * Internal dependencies
 */
import {
	createTable,
	updateCellContent,
	insertRow,
	deleteRow,
	insertColumn,
	deleteColumn,
} from '../state';

const table = deepFreeze( {
	body: [
		{
			cells: [
				{
					content: create(),
					tag: 'td',
				},
				{
					content: create(),
					tag: 'td',
				},
			],
		},
		{
			cells: [
				{
					content: create(),
					tag: 'td',
				},
				{
					content: create(),
					tag: 'td',
				},
			],
		},
	],
} );

const tableWithContent = deepFreeze( {
	body: [
		{
			cells: [
				{
					content: create(),
					tag: 'td',
				},
				{
					content: create(),
					tag: 'td',
				},
			],
		},
		{
			cells: [
				{
					content: create(),
					tag: 'td',
				},
				{
					content: create( { text: 'test' } ),
					tag: 'td',
				},
			],
		},
	],
} );

describe( 'createTable', () => {
	it( 'should create a table', () => {
		const state = createTable( { rowCount: 2, columnCount: 2 } );

		expect( state ).toEqual( table );
	} );
} );

describe( 'updateCellContent', () => {
	it( 'should update cell content', () => {
		const state = updateCellContent( table, {
			section: 'body',
			rowIndex: 1,
			columnIndex: 1,
			content: create( { text: 'test' } ),
		} );

		expect( state ).toEqual( tableWithContent );
	} );
} );

describe( 'insertRow', () => {
	it( 'should insert row', () => {
		const state = insertRow( tableWithContent, {
			section: 'body',
			rowIndex: 2,
		} );

		const expected = {
			body: [
				{
					cells: [
						{
							content: create(),
							tag: 'td',
						},
						{
							content: create(),
							tag: 'td',
						},
					],
				},
				{
					cells: [
						{
							content: create(),
							tag: 'td',
						},
						{
							content: create( { text: 'test' } ),
							tag: 'td',
						},
					],
				},
				{
					cells: [
						{
							content: create(),
							tag: 'td',
						},
						{
							content: create(),
							tag: 'td',
						},
					],
				},
			],
		};

		expect( state ).toEqual( expected );
	} );
} );

describe( 'insertColumn', () => {
	it( 'should insert column', () => {
		const state = insertColumn( tableWithContent, {
			section: 'body',
			columnIndex: 2,
		} );

		const expected = {
			body: [
				{
					cells: [
						{
							content: create(),
							tag: 'td',
						},
						{
							content: create(),
							tag: 'td',
						},
						{
							content: create(),
							tag: 'td',
						},
					],
				},
				{
					cells: [
						{
							content: create(),
							tag: 'td',
						},
						{
							content: create( { text: 'test' } ),
							tag: 'td',
						},
						{
							content: create(),
							tag: 'td',
						},
					],
				},
			],
		};

		expect( state ).toEqual( expected );
	} );
} );

describe( 'deleteRow', () => {
	it( 'should delete row', () => {
		const state = deleteRow( tableWithContent, {
			section: 'body',
			rowIndex: 0,
		} );

		const expected = {
			body: [
				{
					cells: [
						{
							content: create(),
							tag: 'td',
						},
						{
							content: create( { text: 'test' } ),
							tag: 'td',
						},
					],
				},
			],
		};

		expect( state ).toEqual( expected );
	} );
} );

describe( 'deleteColumn', () => {
	it( 'should delete column', () => {
		const state = deleteColumn( tableWithContent, {
			section: 'body',
			columnIndex: 0,
		} );

		const expected = {
			body: [
				{
					cells: [
						{
							content: create(),
							tag: 'td',
						},
					],
				},
				{
					cells: [
						{
							content: create( { text: 'test' } ),
							tag: 'td',
						},
					],
				},
			],
		};

		expect( state ).toEqual( expected );
	} );

	it( 'should delete all rows when only one column present', () => {
		const tableWithOneColumn = {
			body: [
				{
					cells: [
						{
							content: create(),
							tag: 'td',
						},
					],
				},
				{
					cells: [
						{
							content: create( { text: 'test' } ),
							tag: 'td',
						},
					],
				},
			],
		};
		const state = deleteColumn( tableWithOneColumn, {
			section: 'body',
			columnIndex: 0,
		} );

		const expected = {
			body: [],
		};

		expect( state ).toEqual( expected );
	} );
} );
