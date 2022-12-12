/*\
title: $:/plugins/EvidentlyCube/UniversalDialog/result-store.js
type: application/javascript
module-type: library

Result store for the API

\*/
(function () {

	const STATE_TIDDLER = "$:/temp/UniversalDialog/state";

	/*jslint node: true, browser: true */
	/*global $tw: false */
	"use strict";

	/**
	 * Results are stored in the state filter in the following format:
	 * - Rows are delimited by \n
	 * - Each row consists of ID, TITLE and HINT that is delimited with \t
	 * - ID is one-based to simplify Tiddler code
	 */
	exports.ResultStore = {
		encodeResultRow: function(oneBasedIndex, title, hint) {
			if (title === undefined || title === null) {
				title = "";
			}
			if (hint === undefined || hint === null) {
				hint = "";
			}
			return isNaN(oneBasedIndex) ? 0 : oneBasedIndex
				+ "\t" + title
				+ "\t" + hint;
		},

		storeResults: function(encodedResults) {
			$tw.wiki.setText(STATE_TIDDLER, 'results', null, encodedResults.join("\n"));
			$tw.wiki.setText(STATE_TIDDLER, 'results-count', null, encodedResults.length);
		},

		getStoredResultAt: function(index) {
			const storedResultString = this.getStoredResults();

			if (storedResultString.length === 0) {
				return this.getResultSafe
			}

			const results = storedResultString.split("\n");

			return this.decodeResultRow(results[index]);
		},

		getStoredResults: function() {
			const tiddler = $tw.wiki.getTiddler(STATE_TIDDLER);

			return tiddler ? tiddler.fields.results : '';
		},

		getStoredResultsCount: function() {
			const tiddler = $tw.wiki.getTiddler(STATE_TIDDLER);
			const resultsUnsafe = tiddler ? parseInt(tiddler.fields['results-count']) : 0;

			return isNaN(resultsUnsafe) ? 0 : resultsUnsafe;
		},

		getSelectedIndex: function() {
			const tiddler = $tw.wiki.getTiddler(STATE_TIDDLER);
			const selectedUnsafe = tiddler ? parseInt(tiddler.fields.selected) : 0;

			return isNaN(selectedUnsafe) ? 0 : selectedUnsafe;
		},

		changeSelectedIndex: function(delta) {
			const resultCount = this.getStoredResultsCount();

			if (resultCount === 0) {
				return;
			}

			let newSelected = this.getSelectedIndex() + delta;

			if (newSelected < 1) {
				newSelected += resultCount;
			} else if (newSelected > resultCount) {
				newSelected -= resultCount;
			}

			$tw.wiki.setText(STATE_TIDDLER, 'selected', null, newSelected);
		},

		decodeResultRow: function(row) {
			const bits = typeof row === "string"
				? row.split("\t")
				: [];
			if (bits.length !== 3) {
				return this.getResultSafe(0, '', '');
			}

			const id = parseInt(bits[0]) - 1;
			return this.getResultSafe(id, bits[1], bits[2]);
		},

		getResultSafe: function(index, title, hint) {
			index = parseInt(index);

			return {
				index: isNaN(index) ? 0 : index,
				title: String(title),
				hint: String(hint)
			};
		}
	};
})();
