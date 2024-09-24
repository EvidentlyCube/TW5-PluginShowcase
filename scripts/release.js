import { TiddlyWiki as TW522 } from 'tiddlywiki';
import { TiddlyWiki as TW530 } from 'tw530';
import { TiddlyWiki as TW531 } from 'tw531';

process.env.TIDDLYWIKI_PLUGIN_PATH = 'plugins';

releaseShowcase(TW522, 'release', 'index.html');
releaseShowcase(TW522, 'release-codemirror', 'index-cm.html/');
releaseShowcase(TW530, 'release', 'index-530.html');
releaseShowcase(TW530, 'release-codemirror', 'index-530-cm.html');
releaseShowcase(TW531, 'release', 'index-531.html');
releaseShowcase(TW531, 'release-codemirror', 'index-531-cm.html');
releaseLibrary();

function releaseShowcase(twBinary, release, path) {
	var $tw = twBinary();

	// Pass the command line arguments to the boot kernel
	$tw.boot.argv = [
		`editions/${release}`, "--verbose", "--output",
		`docs/`,
		"--rendertiddler", "$:/core/save/all", path, "text/plain"
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