/*\
title: $:/plugins/EvidentlyCube/Discloser/publish-hook-web.js
type: application/javascript
module-type: startup

Tracks for publish message and sends it to the backend.

\*/

(function () {

	/*jslint node: false, browser: true */
	/*global $tw: false */
	"use strict";

	// Export name and synchronous status
	exports.name = "evidentlycube-discloser-publish-hook-web";
	exports.after = ["startup"];
	exports.synchronous = true;

	const PENDING_REFRESH_TITLE = "$:/plugins/EvidentlyCube/Discloser/pending-refresh";

	exports.startup = function () {
		if ($tw.node) {
			return;
		}

		$tw.rootWidget.addEventListener('ec-discloser-publish', function () {
			const tiddler = $tw.wiki.getTiddler(PENDING_REFRESH_TITLE);

			if (!tiddler || !tiddler.fields.list || tiddler.fields.list.length === 0) {
				return;
			}

			updateTiddlerFields(PENDING_REFRESH_TITLE, {busy: 1});

			fetch("/plugins/evidently-cube/discloser/publish", {
				method: 'POST',
				headers: {
					"X-Requested-With": "TiddlyWiki",
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					collections: tiddler.fields.list
				})
			}).then(function(response) {
				return response.json();

			}).then(function(response) {
				const timestamp = response.timestamp;
				$tw.utils.each(response.affectedDiscloserTiddlers, function(title) {
					updateTiddlerFields(title, {'last-publish-at': timestamp});
				});
				$tw.wiki.addTiddler(new $tw.Tiddler($tw.wiki.getTiddler(PENDING_REFRESH_TITLE), {busy: null}));

			}).catch(function(response) {
				$tw.wiki.addTiddler(new $tw.Tiddler($tw.wiki.getTiddler(PENDING_REFRESH_TITLE), {busy: 1}));
				console.log(response);
			})
		});
	};

	function updateTiddlerFields(tiddlerTitle, updatedFields) {
		$tw.wiki.addTiddler(new $tw.Tiddler($tw.wiki.getTiddler(tiddlerTitle), updatedFields));

	}

})();
