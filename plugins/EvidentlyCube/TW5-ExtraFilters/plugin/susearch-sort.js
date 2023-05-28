/*\
title: $:/plugins/EvidentlyCube/ExtraOperators/susearch-sort.js
type: application/javascript
module-type: filteroperator

Smart sorting of search results

\*/
(function(require){

	/*jslint node: true, browser: true */
	/*global $tw: false */
	"use strict";

	const common = require('$:/plugins/EvidentlyCube/ExtraOperators/common.js');

	exports['susearch-sort'] = function(source, operator) {
		const query = operator.operand || '';
		const suffixes = (operator.suffixes || []);
		const optionFlags = suffixes[1] || [];
		const options = {
			field: (suffixes[0] || [])[0] || 'title',
			textOnly: optionFlags.indexOf('raw-strip') !== -1
		};

		const records = [];

		source(function(tiddler, title) {
			records.push(tiddler ? tiddler.fields : {title: title});
		});

		return susearchSort(records, query, options).map(record => record.title);
	};

	function susearchSort(records, query, options) {
		const sanitizedQuery = query.replace(/\s+/g, ' ').trim();
		const words = sanitizedQuery.split(' ').filter(word => word);
		const simplifiedWords = sanitizedQuery.replace(common.SIMPLIFY_REGEXP, '').split(' ').filter(word => word);

		if (words.length === 0) {
			return textSort(records, options.field);

		} else if (words.length === 1) {
			return sortInternal(records, sanitizedQuery, [], [], options);

		} else {
			return sortInternal(records, sanitizedQuery, words, simplifiedWords, options);
		}
	};

	function textSort(records, sortField) {
		return records.concat().sort(function (left, right) {
			if (!left[sortField] && !right[sortField]) {
				return 0;
			} else if (!left[sortField]) {
				return 1;
			} else if (!right[sortField]) {
				return -1;
			}

			return left[sortField].localeCompare(right[sortField], { numeric: true, sensitivity: "base" });
		});
	}

	function sortInternal(records, query, words, simplifiedWords, options) {
		const fullQueryRegexps = [query, common.getRegexpsForPhrase(query)];
		const wordsRegexps = words.map(word => [word, common.getRegexpsForPhrase(word)]);
		const simplifiedWordsRegexps = simplifiedWords.map(word => [word, common.getRegexpsForPhrase(word)]);
		const scores = records.map(record => getScore(record, options, fullQueryRegexps, wordsRegexps, simplifiedWordsRegexps));

		scores.sort(recordsSortCallback);

		return scores.map(x => x[4]);
	}

	function recordsSortCallback(left, right) {
		if (left[0][0] !== right[0][0]) {
			return right[0][0] - left[0][0];

		} else if (left[0][1] !== right[0][1]) {
			return right[0][1] - left[0][1];

		} else if (left[0][2] !== right[0][2]) {
			return left[0][2] - right[0][2];

		} else if (left[1].length !== right[1].length) {
			return right[1].length - left[1].length;

		} else {
			for (let i = 0; i < left[1].length; i++) {
				if (left[1][i][0] !== right[1][i][0]) {
					return right[1][i][0] - left[1][i][0];

				} else if (left[1][i][1] !== right[1][i][1]) {
					return right[1][i][1] - left[1][i][1];
				}
			}
		}

		if (left[2].length !== right[2].length) {
			return right[2].length - left[2].length;

		} else {
			for (let i = 0; i < left[2].length; i++) {
				if (left[2][i][0] !== right[2][i][0]) {
					return right[2][i][0] - left[2][i][0];

				} else if (left[2][i][1] !== right[2][i][1]) {
					return right[2][i][1] - left[2][i][1];
				}
			}
		}

		for (let i = 0; i < left[3].length; i++) {
			const score = left[3][i].localeCompare(right[3][i], { numeric: true, sensitivity: "base" });
			if (score !== 0) {
				return score;
			}
		}

		return 0;
	}

	function getScore(record, options, fullQueryRegexp, wordsRegexps, simplifiedWordsRegexps) {
		const rawField = record[options.field] || '';
		const field = prepareField(rawField, options);
		const simplifiedField = field.replace(common.SIMPLIFY_REGEXP, '');
		const fullQueryScore = getRegexpScore(field, fullQueryRegexp[0], fullQueryRegexp[1]);
		const wordScores = wordsRegexps
			.map(r => getRegexpScore(field, r[0], r[1]))
			.filter(x => x)
			.sort(wordSortCallback);
		const simplifiedWordScores = simplifiedWordsRegexps
			.map(r => getRegexpScore(simplifiedField, r[0], r[1]))
			.filter(x => x)
			.sort(wordSortCallback);

		return [
			fullQueryScore || [-1, -1, Number.MAX_SAFE_INTEGER], // Full query score match type
			wordScores, // Word scores
			simplifiedWordScores, // Word scores
			[field.toLowerCase(), field, rawField.toLowerCase(), rawField], // Field
			record // Record
		];
	}

	function wordSortCallback(left, right) {
		if (left[0] !== right[0]) {
			return right[0] - left[0];

		} else if (left[1] !== right[1]) {
			return right[1] - left[1];

		} else {
			return left[2] - right[2];
		}
	}

	function getRegexpScore(text, query, regexps) {
		for (let i = 0; i < regexps.length; i++) {
			const matches = regexpCount(text, regexps[i]);
			if (matches === 0) {
				continue;
			}

			return [
				regexps.length - i,
				matches * 10000
				+ regexpCount(text, regexps[regexps.length - 1]),
				text.toLowerCase().indexOf(query.toLowerCase())
			];
		}

		return null;
	}

	function regexpCount(text, regexp) {
		const matches = text.match(regexp);

		return matches ? matches.length : 0;
	}

	function prepareField(field, options) {
		if (options.textOnly) {
			return common.TEXT_ONLY_REGEXPS.reduce((field, [regexp, replace]) => field.replace(regexp, replace), field).trim();
		}
		return field;
	}

})(typeof global !== 'undefined' ? global.testRequire : require);
