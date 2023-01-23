/*\
title: $:/plugins/EvidentlyCube/Discloser/rename-hook.js
type: application/javascript
module-type: startup

Ensures renamed tiddlers will have their names updated in Discloser links
\*/

(function(){

/*jslint node: false, browser: true */
/*global $tw: false */
"use strict";

// Export name and synchronous status
exports.name = "evidentlycube-discloser-rename-hook";
exports.after = ["windows"];
exports.synchronous = true;

exports.startup = function() {
	if ($tw.node) {
		return;
	}

	// Avoid risking infinite loops and stuff
	var isBusy = false;

	$tw.hooks.addHook("th-saving-tiddler", function(newTiddler, oldTiddler) {
		if (
			isBusy
			|| !oldTiddler // Not a rename
			|| !newTiddler // Redundant but let's keep it
			|| !oldTiddler.fields['draft.of'] // Was not a draft originally
			|| newTiddler.fields['draft.of'] // Sanity check
			|| newTiddler.fields['title'] === oldTiddler.fields['draft.of'] // Not a rename
		) {
			return newTiddler;
		}

		isBusy = true;

		var newTitle = newTiddler.fields.title;
		var oldTitle = oldTiddler.fields['draft.of'];

		// Rename tiddler names in Discloser collections
		var links =  $tw.wiki.filterTiddlers("[all[tiddlers]tag[$:/tags/EC/Discloser/Link]]");
		for (let i = 0; i < links.length; i++) {
			var linkTiddler = $tw.wiki.getTiddler(links[i]);

			if (linkTiddler.fields.tiddler === oldTitle) {
				$tw.wiki.addTiddler(new $tw.Tiddler(linkTiddler, {tiddler: newTitle}));
			}
		}

		isBusy = false;

		return newTiddler;
	});
};

})();
