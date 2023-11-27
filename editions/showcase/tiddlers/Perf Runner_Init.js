/*\
title: Perf Runner/Init
type: application/javascript
module-type: startup

Core for performance checker

\*/

(function () {

	/*jslint node: false, browser: true */
	"use strict";

	if ($tw.node) {
		return;
	}

	exports.name = "perf-runner-init";
	exports.after = ["startup"];
	exports.synchronous = true;

	exports.startup = function() {
		$tw.rootWidget.addEventListener('perf-check-run', function(e) {
			$tw.PerfRunner.startTest(e.param);
		});
	};
})();
