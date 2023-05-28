/*\
title: $:/plugins/EvidentlyCube/ExtraOperators/susearch-mark.js
type: application/javascript
module-type: filteroperator

Smart sorting of search results

\*/
(function (require) {
	/*jslint node: true, browser: true */
	/*global $tw: false */
	"use strict";

	const common = require('$:/plugins/EvidentlyCube/ExtraOperators/common.js');

	exports['susearch-mark'] = function (source, operator, opts) {
		const query = operator.operand || '';
		const suffixes = (operator.suffixes || []);
		const optionFlags = suffixes[0] || [];
		const options = {
			mode: extractMode(optionFlags),
			wiki: opts.wiki,
			template: operator.operands[1] || '<mark>$1</mark>'
		};

		const fullRegexp = prepareFullRegexp(query);
		const titles = [];

		source(function (tiddler, title) {
			titles.push(mark(title, fullRegexp, options));
		});

		return titles;
	};

	function mark(title, fullRegexp, options) {
		switch (options.mode) {
			case 'default':
				return doFullRegexpReplace(title, fullRegexp, options.template);

			case 'raw-strip':
				return doFullRegexpReplace(rawStrip(title), fullRegexp, options.template);

			case 'wikify-strip':
				return doFullRegexpReplace(
					wikify(title, options.wiki, false).textContent,
					fullRegexp,
					options.template
				);

			case 'wikify-safe':
				return wikifySafe(title, fullRegexp, options, false);
		}
	}

	function doFullRegexpReplace(title, fullRegexp, template) {
		return fullRegexp
			? title.replace(fullRegexp, template)
			: title;
	}

	function prepareFullRegexp(query) {
		const sanitizedQuery = query.replace(/\s+/g, ' ').trim().toLowerCase();
		const words = sanitizedQuery.split(' ').filter(word => word);
		const simplifiedWords = sanitizedQuery.replace(common.SIMPLIFY_REGEXP, '').split(' ').filter(word => word);

		if (sanitizedQuery === '') {
			return null;
		}

		const regexpPieces = [$tw.utils.escapeRegExp(sanitizedQuery)];
		regexpPieces.push(...words.map(word => $tw.utils.escapeRegExp(word)));
		regexpPieces.push(...simplifiedWords.map(word => $tw.utils.escapeRegExp(word)));

		return new RegExp('(' + regexpPieces.join("|").replace(/ /g, '\\s+') + ')', 'gi');
	}

	function wikify(text, wiki, isInline) {
		const parser = wiki.parseText("text/vnd.tiddlywiki", text, {parseAsInline: isInline });
		const container = $tw.fakeDocument.createElement("div");
		const widget = wiki.makeWidget(parser, {
			document: $tw.fakeDocument,
			parentWidget: $tw.rootWidget
		});
		widget.render(container, null);

		return container;
	}

	function rawStrip(field) {
		return common.TEXT_ONLY_REGEXPS.reduce((field, [regexp, replace]) => field.replace(regexp, replace), field);
	}

	function extractMode(optionFlags) {
		switch (optionFlags.join(',')) {
			case 'raw-strip': return 'raw-strip';
			case 'wikify-strip': return 'wikify-strip';
			case 'wikify-safe': return 'wikify-safe';
			default: return 'default';
		}
	}

	function wikifySafe(text, fullRegexp, options, isInline) {
		const wikifiedText = wikify(text, options.wiki, isInline).innerHTML;
		const tokens = [];

		const protectedText = wikifiedText.replace(/<[^>]+>/g, function(token) {
			tokens.push(token);
			return "\u001D";
		});
		const replacedText = doFullRegexpReplace(protectedText, fullRegexp, options.template);

		return replacedText.replace(/\u001D/g, function() {
			return tokens.shift();
		});
	}

})(typeof global !== 'undefined' ? global.testRequire : require);
