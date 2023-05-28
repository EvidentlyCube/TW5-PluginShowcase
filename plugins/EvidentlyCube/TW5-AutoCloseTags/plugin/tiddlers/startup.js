const { Closer } = require('./closer');

/*\
title: $:/plugins/EvidentlyCube/AutoCloseTags/widget.js
type: application/javascript
module-type: startup

\*/
(function () {

	/*jslint node: true, browser: true */
	/*global $tw: false */
	"use strict";

	exports.name = "evidentlycube-autoclose";
	exports.platforms = ["browser"];
	exports.before = ["render"];
	exports.synchronous = true;

	exports.startup = function () {
		const editTextWidget = require('$:/core/modules/widgets/edit-text.js')['edit-text'];

		const oldRender = editTextWidget.prototype.render;

		editTextWidget.prototype.render = function() {
			const result = oldRender.apply(this, arguments);

			this.engine._closer = new Closer(this, this.engine.domNode);

			return result
		};
	};
})();
