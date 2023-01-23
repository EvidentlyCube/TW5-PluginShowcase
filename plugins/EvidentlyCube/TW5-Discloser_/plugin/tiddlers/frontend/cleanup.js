/*\
title: $:/plugins/EvidentlyCube/Discloser/cleanup.js
type: application/javascript
module-type: startup

Cleans up dangling links when a collection is deleted
\*/

(function(){

/*jslint node: false, browser: true */
/*global $tw: false */
"use strict";

// Export name and synchronous status
exports.name = "evidentlycube-discloser-cleanup";
exports.after = ["windows"];
exports.synchronous = true;

exports.startup = function() {
	if ($tw.node) {
		return;
	}

	// Avoid risking infinite loops and stuff
	var isBusy = false;

	$tw.hooks.addHook("th-deleting-tiddler", function(tiddler) {
		if (
			isBusy
			|| !tiddler // Sanity check
			|| !tiddler.fields.tags
			|| tiddler.fields.tags.indexOf('$:/tags/EC/Discloser/Collection') === -1 // Make sure we're deleting a collection
		) {
			return;
		}

		isBusy = true;

		var deletedCollectionTitle = tiddler.fields.title;

		// Rename tiddler names in Discloser collections
		var links =  $tw.wiki.filterTiddlers("[all[tiddlers]tag[$:/tags/EC/Discloser/Link]]");
		for (let i = 0; i < links.length; i++) {
			var linkTiddler = $tw.wiki.getTiddler(links[i]);

			if (linkTiddler.fields.collection === deletedCollectionTitle) {
				$tw.wiki.deleteTiddler(linkTiddler.fields.title);
			}
		}

		isBusy = false;
	});
};

})();
