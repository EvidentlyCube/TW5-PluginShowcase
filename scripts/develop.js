var TiddlyWiki = require("tiddlywiki").TiddlyWiki;

process.env.TIDDLYWIKI_PLUGIN_PATH = 'plugins';

var $tw = TiddlyWiki();

	// Pass the command line arguments to the boot kernel
$tw.boot.argv = [
	"editions/develop", "--verbose",
	"--listen",
	"port=55505"
];

$tw.boot.boot();