var TiddlyWiki = require("tiddlywiki").TiddlyWiki;

process.env.TIDDLYWIKI_PLUGIN_PATH = 'plugins';

releaseShowcase('release');
releaseShowcase('release-codemirror');
releaseLibrary();

function releaseShowcase(version) {
	var $tw = TiddlyWiki();

	// Pass the command line arguments to the boot kernel
	$tw.boot.argv = [
		`editions/${version}`, "--verbose", "--output",
		"docs/",
		"--build", "release"
	];

	// Boot the TW5 app
	$tw.boot.boot();
}

function releaseLibrary() {
	var $tw = TiddlyWiki();

	// Pass the command line arguments to the boot kernel
	$tw.boot.argv = [
		"editions/release-library", "--verbose", "--output",
		"docs/",
		"--build", "library"
	];

	// Boot the TW5 app
	$tw.boot.boot();
}