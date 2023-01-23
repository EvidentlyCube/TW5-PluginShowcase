/*\
title: $:/plugins/EvidentlyCube/Discloser/common.js
type: application/javascript
module-type: library

Module for doing the actual publishing

\*/


(function() {

	/*jslint node: true, browser: true */
	/*global $tw: false */
	"use strict";

	exports.filterTiddlersWithVars = function(filter, variables, source) {
		return $tw.wiki.filterTiddlers(filter, exports.getVariableWidget(variables), source);
	}

	exports.getVariableWidget = function(variables) {
		return {
			getVariable: function (name) {
				if (typeof variables[name] !== undefined) {
					return variables[name];
				}
				return "";
			}
		};
	}
})();