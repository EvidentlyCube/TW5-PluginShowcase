import assert from 'assert';
import { $tw, requireTiddlyWikiModule } from '../../../../../tests/common.js';

const filter = requireTiddlyWikiModule('plugins/EvidentlyCube/TW5-ExtraFilters/plugin/focus-on.js')['focus-on'];

export function runComplexCase(operands, given, then, options, message) {
	given = !Array.isArray(given) ? [given] : given;
	then = !Array.isArray(then) ? [then] : then;

	const result = runFocusOn(
		given.map(title => ({ fields: { title } })),
		operands,
		options
	);

	assertResults(result, then, message);
}

export function runFocusOn(tiddlers, operands, options) {
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