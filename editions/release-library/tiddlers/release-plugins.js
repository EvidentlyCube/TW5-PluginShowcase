/*\
title: release-plugins.js
type: application/javascript
module-type: command

Command to create a release build of each plugin
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.info = {
	name: "release-plugins",
	synchronous: true
};

var Command = function(params,commander,callback) {
	this.params = params;
	this.commander = commander;
	this.callback = callback;
};

Command.prototype.execute = function() {
	if(this.params.length < 1) {
		return "Plugin list filter missing";
	} else if (this.params.length < 2) {
		return "Plugins directory not given";
	}
	const self = this,
		fs = require("fs"),
		path = require("path"),
		filter = this.params[0],
		pluginsDir = path.resolve(this.params[1]),
		skinnyList = [];

	try {
		fs.accessSync(pluginsDir, fs.constants.R_OK);
	} catch (e) {
		return `Cannot read plugins directory '${pluginsDir}'`;
	}
	const pluginTitles = self.commander.wiki.filterTiddlers(filter);

	const titleToPathMap = new Map();
	$tw.utils.each(fs.readdirSync(pluginsDir), function(file) {
		const pluginInfoPath = `${pluginsDir}${path.sep}${file}${path.sep}plugin${path.sep}plugin.info`;
		try {
			const pluginInfoTest = fs.readFileSync(pluginInfoPath, {encoding: "utf-8"});
			const json = JSON.parse(pluginInfoTest);

			titleToPathMap.set(json.title, `${pluginsDir}${path.sep}${file}`);
		} catch (e) {}
	});
	$tw.utils.each(pluginTitles, function(pluginTitle) {
		const plugin = self.commander.wiki.getTiddler(pluginTitle);
		const pluginPath = titleToPathMap.get(pluginTitle);

		if (!pluginPath) {
			console.error(`Failed to find path for plugin '${pluginTitle}'`);
			return;
		}

		const releasePath = `${pluginPath}${path.sep}releases${path.sep}${self.slugify(plugin.fields.name)}.v${plugin.fields.version}.json`;

		$tw.utils.createFileDirectories(releasePath);
		fs.writeFileSync(releasePath,JSON.stringify(plugin),"utf8");
		console.log(`Released plugin version ${releasePath}`);
	});
	return null;
};

Command.prototype.slugify = function(name) {
	return name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
}

exports.Command = Command;

})();
