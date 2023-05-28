const assert = require('assert');
const filter = require('../../plugin/susearch')['susearch'];

const toTitle = (text, index) => `ID:${index} -- ${text}`;
const toTiddler = (title, text) => ({fields: {title, text}});
const helpers = {
	runComplexCase(query, expectedTitles, notExpectedTitles, options, prefix) {
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
	},

	runSearch(tiddlers, query, searchField, options, prefix) {
		return filter(
			callback =>{
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
	},

	assertResults(givenTitles, expectedTitles, message) {
		assert.deepStrictEqual(givenTitles.concat().sort(), expectedTitles.concat().sort(), message);
	}
}

function runCase(query, field, testData, expectedTitles, options, prefix) {
	const result = helpers.runSearch(testData, query, field, options, prefix);

	helpers.assertResults(result, expectedTitles);
}

exports.helpers = helpers;