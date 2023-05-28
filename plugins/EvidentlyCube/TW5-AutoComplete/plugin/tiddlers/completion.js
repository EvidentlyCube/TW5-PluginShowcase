/*\
title: $:/plugins/EvidentlyCube/AutoComplete/completion.js
type: application/javascript
module-type: startup

Hooks the module
\*/

(function () {

	/*jslint node: false, browser: true */
	/*global $tw: false */
	"use strict";

	// Export name and synchronous status
	exports.name = "evidentlycube-tiddlercompletion";
	exports.platforms = ["browser"];
	exports.after = ["startup"];
	exports.before = ["render"];
	exports.synchronous = true;

	exports.startup = function () {
		if ($tw.node) {
			return;
		}

		const monkeypatch = {
			sequence: function(originalMethod, newMethod) {
				return function() {
					const result = originalMethod.apply(this, arguments);

					newMethod.apply(this, arguments);

					return result;
				}
			},
			preventable: function(originalMethod, newMethod) {
				return function() {
					if (newMethod.apply(this, arguments) !== false) {
						return originalMethod.apply(this, arguments);
					}

					return undefined;
				}
			}
		}

		const EC_AutoComplete = require('$:/plugins/EvidentlyCube/AutoComplete/completion-api.js').EC_AutoComplete;
		const completionApi = new EC_AutoComplete();

		require('$:/plugins/EvidentlyCube/AutoComplete/integration-core.js').patch(completionApi, monkeypatch);
		try {
			require('$:/plugins/EvidentlyCube/AutoComplete/integration-codemirror.js').patch(completionApi, monkeypatch);
		} catch (e) {
			// Silently ignore if Code Mirror is not installed
		}

	};

})();
