/*\
title: $:/plugins/EvidentlyCube/TaskList/monkeypatch.js
type: application/javascript
module-type: startup

Fixes SelectWidget classes not updating when the dynamic class source has changed,
only triggers for versions pre 5.2.4
Fixes issue #6986
\*/

(function(){

/*jslint node: false, browser: true */
/*global $tw: false */
"use strict";

// Export name and synchronous status
exports.name = "evidentlycube-tasklist-cleanup";
exports.after = ["windows"];
exports.synchronous = true;

exports.startup = function() {
	var version = $tw.version.split('.');
	if ($tw.node || version[0] > 5 || version[1] > 2 || version[1] > 3) {
		return;
	}

	var selectWidget = require("$:/core/modules/widgets/select.js");
	var originalRefresh = selectWidget.select.prototype.refresh;
	selectWidget.select.prototype.refresh = function(changedTiddlers) {
		if(this.computeAttributes().class) {
			this.selectClass = this.getAttribute("class");
			this.getSelectDomNode().setAttribute("class",this.selectClass);
		}

		originalRefresh.call(this, changedTiddlers);
	}
};

})();
