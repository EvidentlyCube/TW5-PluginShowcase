/*\
title: $:/plugins/EvidentlyCube/Discloser/timestamp.js
type: application/javascript
module-type: filteroperator

Filter operator which extracts timestamp from a date string

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports['ec_d_timestamp'] = function(source,operator,options) {
	var results = [];
	source(function(tiddler,title) {
		if(title) {
			results.push($tw.utils.parseDate(title).getTime().toString());
		}
	});
	return results;
};

})();
