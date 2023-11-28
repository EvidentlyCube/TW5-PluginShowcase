import assert from 'assert';
import { $tw, requireTiddlyWikiModule } from '../../../../../tests/common.js';

const filter = requireTiddlyWikiModule('plugins/EvidentlyCube/TW5-ExtraFilters/plugin/susearch-mark.js')['susearch-mark'];

export function runComplexCase(operands, given, then, options, message) {
	given = !Array.isArray(given) ? [given] : given;
	then = !Array.isArray(then) ? [then] : then;

	const result = runMark(
		given.map(title => ({ fields: { title } })),
		operands,
		options
	);

	assertResults(result, then, message);
}

export function runMark(tiddlers, operands, options) {
	options = options || [];
	operands = Array.isArray(operands) ? operands : [operands];

	return filter(
		callback => {
			for (const tiddler of tiddlers) {
				callback(tiddler, tiddler.fields.title);
			}
		},
		{
			operand: operands[0],
			operands,
			suffixes: [options]
		},
		{
			wiki: $tw.wiki
		}
	);
}

export function assertResults(givenTitles, expectedTitles, message) {
	assert.deepStrictEqual(expectedTitles.concat().sort(), givenTitles.concat().sort(), message);
}