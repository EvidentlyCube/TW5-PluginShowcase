const assert = require('assert');
const filter = require('../../plugin/focus-on')['focus-on'];

const helpers = {
	runComplexCase(operands, given, then, options, message) {
		given = !Array.isArray(given) ? [given] : given;
		then = !Array.isArray(then) ? [then] : then;

		const result = helpers.runFocusOn(
			given.map(title => ({fields: {title}})),
			operands,
			options
		);

		helpers.assertResults(result, then, message);
	},

	runFocusOn(tiddlers, operands, options) {
		options = options || [];
		operands = Array.isArray(operands) ? operands : [operands];

		return filter(
			callback =>{
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
				wiki: global.$tw.wiki
			}
		);
	},

	assertResults(givenTitles, expectedTitles, message) {
		assert.deepStrictEqual(expectedTitles.concat().sort(), givenTitles.concat().sort(), message);
	}
}

exports.helpers = helpers;