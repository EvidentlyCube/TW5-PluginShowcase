
import cliSelect from 'cli-select';
import figures from 'figures';
import chalk from 'chalk';
import nodemon from 'nodemon';

import { TiddlyWiki as TW522 } from 'tiddlywiki';
import { TiddlyWiki as TW530 } from 'tw530';
import { TiddlyWiki as TW531 } from 'tw531';

const TW_VERSIONS = {
	'5.2.2': TW522,
	'5.3.0': TW530,
	'5.3.1': TW531,
};

process.env.TIDDLYWIKI_PLUGIN_PATH = 'plugins';

validateWorkingDirectory();
run();

function validateWorkingDirectory() {
	const scriptDir = import.meta.url.replace(/file:\/+/g, '').replace(/\\/g, '/').replace(/\/?develop\.js$/, '');
	const cwd = process.cwd().replace(/\\/g, '/').replace(/\/$/, '');

	console.log(cwd);
	console.log(scriptDir);

	if (scriptDir === cwd) {
		console.log(chalk.red("Script must be run from project's root directory, not scripts/ subdirectory!"));
		process.exit(1);
	}
}

async function customCliSelect(values) {
	return cliSelect({
		values,
		selected: figures.radioOn,
		unselected: figures.radioOff,
		cleanup: false,
		valueRenderer: (value, selected) => {
			if (selected) {
				return chalk.green.underline(value);
			}

			return value;
		}
	});
}

async function run() {
	const version = await selectTiddlywikiVersion(process.argv);
	const isCodeMirror = await enableCodeMirror(process.argv);
	const isWatch = await enableWatch(process.argv);

	if (isWatch) {
		let restartCounter = 1;
		const script = 'scripts/develop.js';
		const scriptArguments = [
			'--version', version,
			isCodeMirror ? '--codemirror' : '--no-codemirror',
			'--no-watch'
		].filter(x => x);

		console.log(chalk.green(`Starting nodemon: ${script} ${scriptArguments.join(' ')}`))
		nodemon({
			exec: 'node',
			script: script,
			args: scriptArguments,
			env: {
				// Required for plugins to load
				TIDDLYWIKI_PLUGIN_PATH: 'plugins'
			},
			watch: [
				"plugins"
			],
			ext: 'tid,meta,css,js,html,info,md',
			cwd: process.cwd()
		});

		nodemon.on('start', function () {
			console.clear();
			console.log(chalk.green(`EXECUTING ${script} ${scriptArguments.join(' ')}`))
		}).on('quit', function () {
			console.log('App has quit');
			process.exit();
		}).on('restart', function (files) {
			console.log('App restarted due to: ', files);
		});
	} else {
		console.log(chalk.green(`Starting Tiddlywiki ${version}${isCodeMirror ? 'with CodeMirror' : ''}`));
		const $tw = TW_VERSIONS[version]();

		$tw.boot.argv = [
			isCodeMirror ? "editions/develop-codemirror" : "editions/develop",
			"--verbose",
			"--server", '55505',
			"$:/core/save/all", "text/plain", "text/html"
		];

		$tw.boot.boot();
	}
}

async function enableWatch(args) {
	if (args.includes('--watch') || args.includes('-w')) {
		return true;
	} else if (args.includes('--no-watch')) {
		return false;
	}

	return (await customCliSelect({
		yes: "Enable watch",
		no: "Disable watch",
	})).id === 'yes';
}

async function selectTiddlywikiVersion(args) {
	const versionArgIndex = Math.max(args.indexOf('--version'), args.indexOf('-v'));

	if (versionArgIndex !== -1 && args.length > versionArgIndex + 1) {
		const argVersion = args[versionArgIndex + 1];

		if (TW_VERSIONS[argVersion]) {
			return argVersion;
		} else {
			console.log(chalk.red(`Invalid version "${argVersion}" provided.`))
		}
	} else if (versionArgIndex !== -1) {
		console.log(chalk.red(`Missing value for the version argument.`))
	}

	return (await customCliSelect(Object.keys(TW_VERSIONS))).value;
}

async function enableCodeMirror(args) {
	if (args.includes('--codemirror')) {
		return true;
	} else if (args.includes('--no-codemirror')) {
		return false;
	}

	return (await customCliSelect({
		yes: "With CodeMirror",
		no: "Without CodeMirror",
	})).id === 'yes';
}