/*\
title: $:/plugins/EvidentlyCube/Permaviews/permaviews-post-story.js
type: application/javascript
module-type: startup

Hooks the module
\*/

(function () {

	/*jslint node: false, browser: true */
	/*global $tw: false */
	"use strict";

	// Export name and synchronous status
	exports.name = "evidentlycube-permaviews-post-story";
	exports.platforms = ["browser"];
	exports.after = ["story"];
	exports.synchronous = true;

	exports.startup = function () {
		require('$:/plugins/EvidentlyCube/Permaviews/permaviews.js').checkHash(null);
	};

})();
