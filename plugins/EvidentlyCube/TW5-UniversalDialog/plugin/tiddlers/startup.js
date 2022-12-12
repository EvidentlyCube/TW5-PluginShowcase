/*\
title: $:/plugins/EvidentlyCube/UniversalDialog/startup.js
type: application/javascript
module-type: startup

Hooks the module
\*/

(function () {

	/*jslint node: false, browser: true */
	/*global $tw: false */
	"use strict";

	// Export name and synchronous status
	exports.name = "evidentlycube-universal-dialog";
	exports.platforms = ["browser"];
	exports.after = ["startup"];
	exports.before = ["render"];
	exports.synchronous = true;

	exports.startup = function () {
		if ($tw.node) {
			return;
		}

		const UniversalDialog = require('$:/plugins/EvidentlyCube/UniversalDialog/api.js').UniversalDialog;
		new UniversalDialog();
	};

})();
