/*\
title: $:/plugins/EvidentlyCube/Discloser/publish-tracker.js
type: application/javascript
module-type: startup

Tracks when collections need to be updated and stores
their list in $:/plugins/EvidentlyCube/Discloser/pending-refresh
\*/

(function(){

/*jslint node: false, browser: true */
/*global $tw: false */
"use strict";

// Export name and synchronous status
exports.name = "evidentlycube-discloser-publish-tracker";
exports.before = ["startup"];
exports.synchronous = true;

const PENDING_REFRESH_TITLE = "$:/plugins/EvidentlyCube/Discloser/pending-refresh";

exports.startup = function() {
	if ($tw.node) {
		return;
	}

	const dirtyCollections = new Set();

	$tw.wiki.addEventListener("change", onChange);
	loadStoredDirtyCollections();

	function loadStoredDirtyCollections() {
		const tiddler = $tw.wiki.getTiddler(PENDING_REFRESH_TITLE);
		if (tiddler && tiddler.fields.list) {
			$tw.utils.each(tiddler.fields.list, function(title) {
				dirtyCollections.add(title);
			});
		}
	}

	function onChange() {
		const indexer = $tw.wiki.getIndexer('DiscloserIndex');

		if (indexer.touchedCollections.size > 0) {
			let dirty = false;
			for (const collectionTitle of indexer.touchedCollections) {
				if (!dirtyCollections.has(collectionTitle)) {
					dirty = true;
					dirtyCollections.add(collectionTitle);
				}
			}

			if (dirty) {
				storeDirtyCollections();
			}

			indexer.touchedCollections.clear();
		}
	}

	function storeDirtyCollections() {
		$tw.wiki.addTiddler(new $tw.Tiddler({
			title: PENDING_REFRESH_TITLE,
			list: Array.from(dirtyCollections).join(" ")
		}));
	}
};

})();
