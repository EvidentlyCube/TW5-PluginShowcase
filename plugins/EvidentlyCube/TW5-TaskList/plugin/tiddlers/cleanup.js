/*\
title: $:/plugins/EvidentlyCube/TaskList/cleanup.js
type: application/javascript
module-type: startup

Cleans up data after a TaskList is removed
\*/

(function(){

/*jslint node: false, browser: true */
/*global $tw: false */
"use strict";

// Export name and synchronous status
exports.name = "evidentlycube-tasklist-cleanup";
exports.after = ["windows"];
exports.synchronous = true;

exports.startup = function() {
	if ($tw.node) {
		return;
	}

	var isBusy = false;

	$tw.hooks.addHook("th-saving-tiddler", function(newTiddler, oldTiddler) {
		if (
			!oldTiddler
			|| !oldTiddler.fields.tags
			|| !oldTiddler.fields['draft.of']
			|| !oldTiddler.fields['draft.of'].substr(-5) === '.edit'
			|| oldTiddler.fields.tags.indexOf('TaskList') === -1
			|| newTiddler.fields['draft.of']
			|| isBusy
		) {
			return newTiddler;
		}

		isBusy = true;

		var newTitle = newTiddler.fields.title;
		var oldTitle = oldTiddler.fields['draft.of'];
		var oldEditTitle = newTitle + ".edit";
		var newEditTitle = newTitle + ".edit";
		var fields =  $tw.wiki.filterTiddlers("[all[tiddlers]tag[TaskList/Field]]");
		var items =  $tw.wiki.filterTiddlers("[all[tiddlers]tag[TaskList/Item]]");

		for (let i = 0; i < fields.length; i++) {
			var fieldTiddler = $tw.wiki.getTiddler(fields[i]);

			if (fieldTiddler.fields.parent === oldTitle) {
				$tw.wiki.addTiddler(new $tw.Tiddler(fieldTiddler, {parent: newTitle}));
			} else if (fieldTiddler.fields.parent === oldEditTitle) {
				$tw.wiki.addTiddler(new $tw.Tiddler(fieldTiddler, {parent: newEditTitle}));
			}
		}

		for (let i = 0; i < items.length; i++) {
			var itemTiddler = $tw.wiki.getTiddler(items[i]);

			if (itemTiddler.fields.parent === oldTitle) {
				$tw.wiki.addTiddler(new $tw.Tiddler(itemTiddler, {parent: newTitle}));
			} else if (itemTiddler.fields.parent === oldEditTitle) {
				$tw.wiki.addTiddler(new $tw.Tiddler(itemTiddler, {parent: newEditTitle}));
			}
		}

		isBusy = false;
		return newTiddler;
	});

	$tw.hooks.addHook("th-deleting-tiddler", function(tiddler) {
		if (
			!tiddler
			|| tiddler.fields.tags.indexOf('TaskList') === -1
			|| tiddler.fields.title.substr(-5) === '.edit'
			|| isBusy
		) {
			return;
		}

		isBusy = true;

		var title = tiddler.fields.title;
		var editTitle = title + '.edit';
		var fields =  $tw.wiki.filterTiddlers("[all[tiddlers]tag[TaskList/Field]]");
		var items =  $tw.wiki.filterTiddlers("[all[tiddlers]tag[TaskList/Item]]");

		for (let i = 0; i < fields.length; i++) {
			var fieldTiddler = $tw.wiki.getTiddler(fields[i]);

			if (fieldTiddler.fields.parent === title || fieldTiddler.fields.parent === editTitle) {
				$tw.wiki.deleteTiddler(fieldTiddler.fields.title);
			}
		}

		for (let i = 0; i < items.length; i++) {
			var itemTiddler = $tw.wiki.getTiddler(items[i]);

			if (itemTiddler.fields.parent === title) {
				$tw.wiki.deleteTiddler(itemTiddler.fields.title);
			}
		}

		$tw.wiki.deleteTiddler(editTitle);

		isBusy = false;
	});
};

})();
