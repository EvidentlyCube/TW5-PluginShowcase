/*\
title: $:/plugins/EvidentlyCube/Discloser/publish-route.js
type: application/javascript
module-type: route

Published files
POST /plugins/evidently-cube/discloser/publish

\*/
(function() {

	/*jslint node: true, browser: true */
	/*global $tw: false */
	"use strict";

	exports.method = "POST";

	exports.path = /^\/plugins\/evidently-cube\/discloser\/publish$/;

	exports.handler = function(request,response,state) {
		const data = safeJsonParse(state.data, []);
		const timestamp = Date.now();
		const affectedDiscloserTiddlers = $tw.EvidentlyCubeDiscloser_PublishCollections(data.collections || []);
		state.sendResponse(200,{"Content-Type": "application/json"},JSON.stringify({
			timestamp: timestamp,
			affectedDiscloserTiddlers:  affectedDiscloserTiddlers
		}),"utf8");
	};

	function safeJsonParse(jsonText, defReturn) {
		try {
			return JSON.parse(jsonText);
		} catch (e) {
			return defReturn;
		}
	}

}());
