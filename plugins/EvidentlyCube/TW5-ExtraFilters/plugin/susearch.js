/*\
title: $:/plugins/EvidentlyCube/ExtraOperators/susearch.js
type: application/javascript
module-type: filteroperator

Smart search

\*/
(function (require) {

	/*jslint node: true, browser: true */
	/*global $tw: false */
	"use strict";

	const common = require('$:/plugins/EvidentlyCube/ExtraOperators/common.js');

	exports.susearch = function (source, operator) {
		const query = operator.operand || '';
		const suffixes = (operator.suffixes || []);
		const optionFlags = suffixes[1] || [];
		const isInverted = operator.prefix === '!';
		const options = {
			field: (suffixes[0] || [])[0] || 'title',
			textOnly: optionFlags.indexOf('raw-strip') !== -1,
			allWords: optionFlags.indexOf('some-words') === -1,
			ordered: optionFlags.indexOf('ordered') !== -1
		};

		const sanitizedQuery = query.replace(/\s+/g, ' ').trim().toLowerCase();
		const words = sanitizedQuery.split(' ').filter(word => word);
		const simplifiedWords = sanitizedQuery.replace(common.SIMPLIFY_REGEXP, '').split(' ').filter(word => word);

		const titles = [];

		const wordsRegexp = wordsToRegexp(words, options);
		const simplifiedWordsRegexp = wordsToRegexp(simplifiedWords, options);

		if (wordsRegexp && simplifiedWordsRegexp) {
			source(function (tiddler, title) {
				if (susearchRegexp(tiddler ? tiddler.fields : { title: title }, options, wordsRegexp, simplifiedWordsRegexp) !== isInverted) {
					titles.push(title);
				}
			});

		} else {
			source(function (tiddler, title) {
				if (susearch(tiddler ? tiddler.fields : { title: title }, options, words, simplifiedWords) !== isInverted) {
					titles.push(title);
				}
			});
		}

		return titles;
	};

	function susearch(record, options, words, simplifiedWords) {
		if (words.length === 0) {
			return true;
		}

		const field = prepareField(record[options.field] || '', options).toLowerCase();
		const simplifiedField = field.replace(common.SIMPLIFY_REGEXP, '');

		let wordCount = 0;
		for (const word of words) {
			if (field.indexOf(word) !== -1) {
				wordCount++;

				if (!options.allWords || wordCount === words.length) {
					return true;
				}

			} else if (options.allWords) {
				break;
			}
		}

		wordCount = 0;
		for (const word of simplifiedWords) {
			if (simplifiedField.indexOf(word) !== -1) {
				wordCount++;

				if (!options.allWords || wordCount === words.length) {
					return true;
				}

			} else if (options.allWords) {
				break;
			}
		}

		return false;
	}

	function susearchRegexp(record, options, wordsRegexp, simplifiedWordsRegexp) {
		const field = prepareField(record[options.field] || '', options).toLowerCase();
		const simplifiedField = field.replace(common.SIMPLIFY_REGEXP, '');

		return wordsRegexp.test(field) || simplifiedWordsRegexp.test(simplifiedField);
	}

	function prepareField(field, options) {
		if (options.textOnly) {
			return common.TEXT_ONLY_REGEXPS.reduce((field, [regexp, replace]) => field.replace(regexp, replace), field);
		}
		return field;
	}

	function wordsToRegexp(words, options) {
		if (options.ordered) {
			return new RegExp(words.map(word => $tw.utils.escapeRegExp(word)).join("[\\s\\S]*"))
		}

		return null;
	}

})(typeof global !== 'undefined' ? global.testRequire : require);
