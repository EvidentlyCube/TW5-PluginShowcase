import tw from 'tiddlywiki';
import { readFileSync } from 'node:fs';

const globalSubRequires = {
	'$:/plugins/EvidentlyCube/ExtraOperators/common.js': "plugins/EvidentlyCube/TW5-ExtraFilters/plugin/common.js"
};

export const $tw = new tw.TiddlyWiki();

export function requireTiddlyWikiModule(path, subRequires = {}) {
	subRequires = {
		...globalSubRequires,
		...subRequires
	};

	const code = readFileSync(path, 'utf-8');

	const _exports = {};

	$tw.utils.evalGlobal(
		code,
		{
			module: {exports: _exports},
			exports: _exports,
			console: console,
			setInterval: setInterval,
			clearInterval: clearInterval,
			setTimeout: setTimeout,
			clearTimeout: clearTimeout,
			Buffer: Buffer,
			$tw: $tw,
			require: function(title) {
				const path = subRequires[title];

				if (!path) {
					throw new Error(`Must define sub-require for '${title}'`);
				}

				return requireTiddlyWikiModule(path, subRequires);
			}
		},
		path
	);

	return _exports;
}