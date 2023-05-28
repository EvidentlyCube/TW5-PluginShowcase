/*\
title: $:/plugins/EvidentlyCube/ExtraOperators/common.js
type: application/javascript
module-type: library

Smart sorting of search results

\*/
(function(){

	/*jslint node: true, browser: true */
	/*global $tw: false */
	"use strict";

	exports.TEXT_ONLY_REGEXPS = [
		[/\\define\s+([^(\s]+)\([^\)]*\)(\r?\n(\s|\S)*?\end|.+?(\r?\n|$))/ig, ''], // Macro definitions
		[/^\s*\\(?:\s|\S)+?($|\n([^\\\r\n]))/ig, '$1'], // Arbitrary pragmas at the start
		[/\[img[^\]]*\]\]/ig, ''], // Images
		[/^@@.*?(\r?\n|$)/igm, ''], // Styles
		[/^\$\$\$.*?(\r?\n|$)/igm, ''], // Typed block
		[/\{\{\{[^\}]*\}\}\}/ig, ''], // Filter invocations
		[/\{\{[^\}]*\}\}/ig, ''], // Transclusions
		[/\[\[([^\]]+(?=\|))?\|?[^\]]+\]\]/ig, '$1'], // Links
		[/<<[^>]*>>/ig, ''], // Macro invocations
		[/<\/?[^>]*>/ig, ''], // HTML Tags
		[/''|`|__|\/\/|^!+\s+|~~/mg, '']
	];

	exports.SIMPLIFY_REGEXP = /[^ a-z0-9_-]/ig;

	exports.getRegexpsForPhrase = function(phrase) {
		const escapedPhrase = $tw.utils.escapeRegExp(phrase);

		return [
			new RegExp(`^${escapedPhrase}\\b`, 'gi'),
			new RegExp(`^${escapedPhrase}`, 'gi'),
			new RegExp(`\\b${escapedPhrase}\\b`, 'gi'),
			new RegExp(`\\b${escapedPhrase}`, 'gi'),
			new RegExp(escapedPhrase, 'gi'),
		];
	};

})();
