global.testRequire = function(module) {
	switch (module) {
		case '$:/plugins/EvidentlyCube/ExtraOperators/common.js':
			return require('../plugins/EvidentlyCube/TW5-ExtraFilters/plugin/common');
	}
	return {};
};
