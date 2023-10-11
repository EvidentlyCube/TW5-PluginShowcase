import {TiddlyWiki as TW522} from 'tiddlywiki';
import {TiddlyWiki as TW530} from 'tw530';
import {TiddlyWiki as TW531} from 'tw531';

process.env.TIDDLYWIKI_PLUGIN_PATH = 'plugins';

releaseShowcase(TW522, 'release', '');
releaseShowcase(TW522, 'release-codemirror', '522-cm/');
releaseShowcase(TW530, 'release', '530/');
releaseShowcase(TW530, 'release-codemirror', '530-cm/');
releaseShowcase(TW531, 'release', '531/');
releaseShowcase(TW531, 'release-codemirror', '531-cm/');
releaseLibrary();

function releaseShowcase(twBinary, release, path) {
	var $tw = twBinary();

	// Pass the command line arguments to the boot kernel
	$tw.boot.argv = [
		`editions/${release}`, "--verbose", "--output",
		`docs/${path}`,
		"--build", "release"
	];

	// Boot the TW5 app
	$tw.boot.boot();
}

function releaseLibrary() {
	var $tw = TW522();

	// Pass the command line arguments to the boot kernel
	$tw.boot.argv = [
		"editions/release-library", "--verbose", "--output",
		"docs/",
		"--build", "library"
	];

	// Boot the TW5 app
	$tw.boot.boot();
}