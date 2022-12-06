/*\
title: makelibrary-patch.js
type: application/javascript
module-type: command

Command to patch TW to support loading plugins in subdirectory `/plugin`

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.info = {
	name: "makelibrary-patch",
	synchronous: true
};

var Command = function(params,commander,callback) {
	this.params = params;
	this.commander = commander;
	this.callback = callback;
};

Command.prototype.execute = function() {
	const path = require('path');
	const oldLoadPluginFolder = $tw.loadPluginFolder;
	$tw.loadPluginFolder = function(filepath,excludeRegExp) {
		if (filepath.indexOf('EvidentlyCube') !== -1) {
			arguments[0] += path.sep + "plugin";
		}

		return oldLoadPluginFolder.apply(this, arguments);
	}
	return null;
};

exports.Command = Command;

})();
