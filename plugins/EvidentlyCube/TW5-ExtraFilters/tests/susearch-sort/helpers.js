import { it } from 'mocha';
import assert from 'assert';
import { requireTiddlyWikiModule } from '../../../../../tests/common.js';

const filter = requireTiddlyWikiModule('plugins/EvidentlyCube/TW5-ExtraFilters/plugin/susearch-sort.js')['susearch-sort'];

const toTitle = (text, index) => `ID:${index} -- ${text}`;
const toTiddler = (title, text) => ({ fields: { title, text } });

export function runComplexCase(query, expectedTitles, options) {
	it("Title field", () => {
		runCase(
			query,
			'title',
			expectedTitles.map(title => toTiddler(title)),
			expectedTitles,
			options
		);
	});
	it("Title field, reversed input", () => {
		runCase(
			query,
			'title',
			expectedTitles.map(title => toTiddler(title)).reverse(),
			expectedTitles,
			options
		);
	});
	it("Text field", () => {
		runCase(
			query,
			'text',
			expectedTitles.map((title, index) => toTiddler(toTitle(title, index), title)),
			expectedTitles.map(toTitle),
			options
		);
	});
	it("Text field, reversed input", () => {
		runCase(
			query,
			'text',
			expectedTitles.map((title, index) => toTiddler(toTitle(title, index), title)).reverse(),
			expectedTitles.map(toTitle),
			options
		);
	});
}

export function runSort(tiddlers, query, sortField, options) {
	return filter(
		callback => {
			for (const tiddler of tiddlers) {
				callback(tiddler, tiddler.fields.title);
			}
		},
		{
			operand: query,
			suffixes: [
				[sortField],
				options || []
			]
		}
	);
}

export function assertSort(givenTitles, expectedTitles, message) {
	assert.deepStrictEqual(givenTitles, expectedTitles, message);
}


function runCase(query, field, testData, expectedTitles, options) {
	const result = runSort(testData, query, field, options);

	assertSort(result, expectedTitles);
}