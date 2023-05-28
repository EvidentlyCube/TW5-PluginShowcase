/*\
title: $:/plugins/EvidentlyCube/Permaviews/permaviews.js
type: application/javascript
module-type: startup

Hooks the module
\*/

(function () {

	/*jslint node: false, browser: true */
	/*global $tw: false */
	"use strict";

	// Export name and synchronous status
	exports.name = "evidentlycube-permaviews";
	exports.platforms = ["browser"];
	exports.before = ["story"];
	exports.synchronous = true;

	const TEMPLATE_ACTIONS = `
		<$navigator
			story="$:/StoryList"
			history="$:/HistoryList"
			openLinkFromInsideRiver={{$:/config/Navigation/openLinkFromInsideRiver}}
			openLinkFromOutsideRiver={{$:/config/Navigation/openLinkFromOutsideRiver}}
			relinkOnRename={{$:/config/RelinkOnRename}}
		>
		<$action-sendmessage $message="tm-close-all-tiddlers"/>
		%REPLACE%
		</$navigator>
	`;
	const TEMPLATE_NAVIGATE_ACTION =`<$action-navigate $to="""%TITLE%"""/>`

	function getActionsString(filter) {
		const tiddlersToOpen = $tw.wiki.filterTiddlers(filter);
		const openActionsString = tiddlersToOpen.map(function(title) {
			return TEMPLATE_NAVIGATE_ACTION.replace('%TITLE%', title);
		}).join("");

		return TEMPLATE_ACTIONS.replace('%REPLACE%', openActionsString);
	};

	exports.startup = function () {
		window.addEventListener("hashchange", exports.checkHash);
	};

	exports.checkHash = function checkHash(event) {
		const hash = ($tw.utils.getLocationHash() || "").substring(1);

		const tiddlers = $tw.wiki.filterTiddlers("[all[tiddlers]tag[$:/tags/EC/Permaviews/View]!is[draft]has[view-name]]");

		$tw.utils.each(tiddlers, function(title) {
			const tiddler = $tw.wiki.getTiddler(title);

			if (tiddler.fields['view-name'] !== hash) {
				return;
			}

			const actionsString = getActionsString(tiddler.fields.filter);
			$tw.rootWidget.invokeActionString(actionsString, $tw.rootWidget, null);

			if (event) {
				event.stopImmediatePropagation();
			}
			$tw.locationHash = "#" + hash;

			return false;
		});
	}
})();
