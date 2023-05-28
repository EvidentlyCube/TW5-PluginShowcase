/*\
title: $:/plugins/EvidentlyCube/ExtraOperators/focus-on.js
type: application/javascript
module-type: filteroperator

Extract part of text focusing on the first occurrence

\*/
(function (require) {
	/*jslint node: true, browser: true */
	/*global $tw: false */
	"use strict";

	exports['focus-on'] = function (source, operator, opts) {
		const operands = operator.operands || [];
		const suffixes = (operator.suffixes || []);
		const flags = suffixes[0] || [];
		const options = {
			match: operands[0] || '',
			prefixLength: extractInteger(operands[1], 20),
			focusLength: extractInteger(operands[2], 128),
			ellipsis: extractString(operands[3], '...'),
			isRegexp: flags.includes('regexp'),
			isCaseSensitive: flags.includes('casesensitive'),
			htmlMode: extractHtmlMode(flags),
			wiki: opts.wiki,
			template: operator.operands[1] || '<mark>$1</mark>'
		};

		const titles = [];

		source(function (tiddler, title) {
			titles.push(focusOn(title, options));
		});

		return titles;
	};

	function focusOn(title, options) {
		const matchIndex = getFirstMatchIndex(title, options.match, options);
		const startIndex = getStartIndex(title, matchIndex, options);
		const endIndex = getEndIndex(title, matchIndex, options);

		return (startIndex > 0 ? options.ellipsis : '')
			+ title.substring(startIndex, endIndex)
			+ (endIndex < title.length ? options.ellipsis : '');
	}

	function getFirstMatchIndex(title, match, options) {
		if (options.isRegexp) {
			try {
				return Math.max(0, title.search(new RegExp(match, options.isCaseSensitive ? '' : 'i')));
			} catch (e) {
				// Handle invalid regular expressions
				return 0;
			}
		}

		if (!options.isCaseSensitive) {
			title = title.toLocaleLowerCase();
			match = match.toLocaleLowerCase();
		}

		return Math.max(0, title.indexOf(match));
	}

	function getStartIndex(title, matchIndex, options) {
		const baseIndex = Math.max(0, matchIndex - options.prefixLength);
		if (options.htmlMode === 'ignore-html') {
			return baseIndex;
		}

		const openTagIndex = title.indexOf('<', baseIndex);
		const closeTagIndex = title.indexOf('>', baseIndex);
		const openTagPrevIndex = title.lastIndexOf('<', baseIndex);
		const closeTagPrevIndex = title.lastIndexOf('>', baseIndex);

		if (isInsideHtmlTag(openTagPrevIndex, openTagIndex, closeTagPrevIndex, closeTagIndex)) {
			return options.htmlMode === 'strip-html'
				? closeTagIndex + 1
				: openTagPrevIndex;
		}

		return baseIndex;
	}

	function getEndIndex(title, matchIndex, options) {
		const baseIndex = Math.min(title.length, matchIndex + options.focusLength);;
		if (options.htmlMode === 'ignore-html') {
			return baseIndex;
		}

		const openTagIndex = title.indexOf('<', baseIndex);
		const closeTagIndex = title.indexOf('>', baseIndex);
		const openTagPrevIndex = title.lastIndexOf('<', baseIndex);
		const closeTagPrevIndex = title.lastIndexOf('>', baseIndex);

		if (isInsideHtmlTag(openTagPrevIndex, openTagIndex, closeTagPrevIndex, closeTagIndex)) {
			return options.htmlMode === 'strip-html'
				? openTagPrevIndex
				: closeTagIndex + 1;
		}

		return baseIndex;
	}

	function isInsideHtmlTag(leftOpenTagIndex, rightOpenTagIndex, leftCloseTagIndex, rightCloseTagIndex) {
		if (rightOpenTagIndex !== -1 && rightCloseTagIndex !== -1) {
			if (rightCloseTagIndex < rightOpenTagIndex && leftOpenTagIndex !== -1) {
				return true;
			}
		}
		if (leftOpenTagIndex !== -1 && leftCloseTagIndex !== -1) {
			if (leftOpenTagIndex > leftCloseTagIndex && rightCloseTagIndex !== -1) {
				return true;
			}
		}

		return false;
	}


	function extractHtmlMode(flags) {
		if (flags.includes('ignore-html')) {
			return 'ignore-html';
		} else if (flags.includes('strip-html')) {
			return 'strip-html';
		} else {
			return 'expand-html';
		}
	}

	function extractInteger(value, defaultValue) {
		if (value === undefined) {
			return defaultValue;
		}

		const intValue = parseInt(value);
		if (Number.isNaN(intValue)) {
			return defaultValue;
		}

		return Math.max(0, Math.min(9999, intValue));
	}

	function extractString(value, defaultValue) {
		if (value === undefined) {
			return defaultValue;
		}

		return String(value);
	}
})(typeof global !== 'undefined' ? global.testRequire : require);
