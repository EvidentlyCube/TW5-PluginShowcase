/*\
title: Perf Check - AllCurrent vs CurrentTiddler
type: application/javascript
tags: $:/tags/PerformanceCheck
module-type: library
description: Compare the performance of filter `[all[current]]` against `[<currentTiddler>]`

Core for performance checker

\*/
(function () {

	/*jslint node: false, browser: true */
	"use strict";

	if ($tw.node) {
		return;
	}

	exports.batches = 10;

	exports.cases = [
		{
			name: 'Using [all[current]]',
			run: function(runs, widget) {
				for (let i = 0; i < runs; i++) {
					$tw.wiki.filterTiddlers("[all[current]]", widget);
				}
			}
		},
		{
			name: 'Using [<currentTiddler>]',
			run: function(runs, widget) {
				for (let i = 0; i < runs; i++) {
					$tw.wiki.filterTiddlers("[<currentTiddler>]", widget);
				}
			}
		},
	]

})();
