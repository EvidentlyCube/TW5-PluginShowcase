import { before } from 'mocha';
import { $tw } from './common.js';

before(function () {
	this.timeout(30000);

	return new Promise(resolve => {
		process.env.TIDDLYWIKI_PLUGIN_PATH = 'plugins';

		$tw.boot.argv = [
			"editions/mocha"
		];

		$tw.boot.boot(() => resolve());
	});
});