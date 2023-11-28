import assert from 'assert';
import { requireTiddlyWikiModule } from '../../../../../tests/common.js';
import { it } from 'mocha';

const filter = requireTiddlyWikiModule('plugins/EvidentlyCube/TW5-ExtraFilters/plugin/susearch.js')['susearch'];

const toTitle = (text, index) => `ID:${index} -- ${text}`;
const toTiddler = (title, text) => ({ fields: { title, text } });
export function runComplexCase(query, expectedTitles, notExpectedTitles, options, prefix) {
	const all = expectedTitles.concat(notExpectedTitles);
	it("Title field", () => {
		runCase(
			query,
			'title',
			all.map(title => toTiddler(title)),
			expectedTitles,
			options,
			prefix
		);
	});
	it("Text field", () => {
		runCase(
			query,
			'text',
			all.map((title, index) => toTiddler(toTitle(title, index), title)),
			expectedTitles.map(toTitle),
			options,
			prefix
		);
	});
}

export function runSearch(tiddlers, query, searchField, options, prefix) {
	return filter(
		callback => {
			for (const tiddler of tiddlers) {
				callback(tiddler, tiddler.fields.title);
			}
		},
		{
			operand: query,
			suffixes: [
				[searchField],
				options || []
			],
			prefix: prefix || ''
		}
	);
}

export function assertResults(givenTitles, expectedTitles, message) {
	assert.deepStrictEqual(givenTitles.concat().sort(), expectedTitles.concat().sort(), message);
}

function runCase(query, field, testData, expectedTitles, options, prefix) {
	const result = runSearch(testData, query, field, options, prefix);

	assertResults(result, expectedTitles);
}