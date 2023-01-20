
global.testRequire = function (module) {
	switch (module) {
		case '$:/plugins/EvidentlyCube/ExtraOperators/common.js':
			return require('../plugins/EvidentlyCube/TW5-ExtraFilters/plugin/common');
	}
	return {};
};

before(function () {
	return new Promise(resolve => {
		var TiddlyWiki = require("tiddlywiki").TiddlyWiki;

		process.env.TIDDLYWIKI_PLUGIN_PATH = 'plugins';

		global.$tw = TiddlyWiki();
		$tw.boot.argv = [
			"editions/mocha"
		];

		$tw.boot.boot(() => resolve());
	});
});