const assert = require('assert');
const filter = require('../../plugin/susearch-sort')['susearch-sort'];

const toTitle = (text, index) => `ID:${index} -- ${text}`;
const toTiddler = (title, text) => ({fields: {title, text}});
const helpers = {
	runComplexCase(query, expectedTitles, options) {
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
	},

	runSort(tiddlers, query, sortField, options) {
		return filter(
			callback =>{
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
	},

	assertSort(givenTitles, expectedTitles, message) {
		assert.deepStrictEqual(givenTitles, expectedTitles, message);
	}
}

function runCase(query, field, testData, expectedTitles, options) {
	const result = helpers.runSort(testData, query, field, options);

	helpers.assertSort(result, expectedTitles);
}

exports.helpers = helpers;