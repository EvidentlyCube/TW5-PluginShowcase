/*\
title: $:/plugins/EvidentlyCube/AutoComplete/completion-window.js
type: application/javascript
module-type: startup

Adds support for auto complete in tiddlers opened in a new window
\*/

(function () {

	/*jslint node: false, browser: true */
	/*global $tw: false */
	"use strict";

	// Export name and synchronous status
	exports.name = "evidentlycube-tiddlercompletion-window";
	exports.platforms = ["browser"];
	exports.after = ["windows"];
	exports.synchronous = true;

	exports.startup = function () {
		const innerListener = $tw.rootWidget.eventListeners['tm-open-window'];
		$tw.rootWidget.addEventListener("tm-open-window", function (event) {
			innerListener(event);

			var title = event.param || event.tiddlerTitle;
			var paramObject = event.paramObject || {};
			var windowID = paramObject.windowID || title;

			const window = $tw.windows[windowID];
			const parser = $tw.wiki.parseTiddler("$:/plugins/EvidentlyCube/AutoComplete/window");
			const widgetNode = $tw.wiki.makeWidget(parser, {
				document: window.document,
				parentWidget: $tw.rootWidget,
				variables: {
					'tv-window-id': windowID
				 }
			});
			const refreshHandler = function (changes) {
				widgetNode.refresh(changes);
			}

			// Used to prevent auto complete opening in all windows
			window.document._ecAcWindowID = windowID;
			$tw.wiki.addEventListener("change", refreshHandler);
			window.addEventListener("beforeunload", function (event) {
				$tw.wiki.removeEventListener("change", refreshHandler);
			}, false);

			widgetNode.render(window.document.body, window.document.body.firstChild);
		});
	};

})();
