/*\
title: $:/plugins/EvidentlyCube/AdvancedPerformance/perf.js
type: application/javascript
module-type: startup

Cleans up data after a TaskList is removed
\*/

(function(){

/*jslint node: false, browser: true */
/*global $tw: false */
"use strict";

// Export name and synchronous status
exports.name = "evidentlycube-adv-perf--performance";
exports.before = ["startup"];
exports.synchronous = true;
exports.startup = function() {
	if ($tw.node) {
		return;
	}

	$tw.Performance.prototype.showGreeting = function() {
		this.refreshTimes = {};
		this.refreshTimesHistory = [];
		this.currentRefreshName = "other";

		this.resetRefreshTimes();
	};

	$tw.Performance.prototype.log = function() {
		console.log("Please use the UI instead");
	};

	$tw.Performance.prototype.report = function(name,fn) {
		var self = this;
		if(this.enabled) {
			return function() {
				self.currentRefreshName = name;
				self.refreshTimes[name] = {
					timeTaken: 0,
					filterLogs: {}
				};

				var startTime = $tw.utils.timer(),
					result = fn.apply(this,arguments),
					timeTaken = $tw.utils.timer(startTime);

				self.refreshTimes[name].timeTaken = timeTaken;
				self.currentRefreshName = "other";

				return result;
			};
		} else {
			return fn;
		}
	};

	$tw.Performance.prototype.resetRefreshTimes = function() {
		this.refreshTimes = {
			other: {
				timeTaken: 0,
				filterLogs: {}
			}
		};
	};

	$tw.Performance.prototype.storeRefresh = function(log) {
		this.refreshTimesHistory.push(log);

		if (this.refreshTimesHistory.length > 50) {
			this.refreshTimesHistory.shift();
		}
	}

	$tw.Performance.prototype.measure = function(name,fn) {
		var self = this;
		if(this.enabled) {
			var storeLog = function(name, takenTime, measures) {
				if (self.isInsideFilter) {
					name = `~${name}`;
				}
				if(!(name in measures)) {
					measures[name] = {
						lastUse: 0,
						longestRun: 0,
						shortestRun: Number.MAX_SAFE_INTEGER,
						totalCalls: 0,
						totalTime: 0,
						isSub: self.isInsideFilter,
						times: []
					};
				}
				measures[name].lastUse = Date.now();
				measures[name].totalCalls++;
				measures[name].longestRun = Math.max(takenTime, measures[name].longestRun);
				measures[name].shortestRun = Math.min(takenTime, measures[name].shortestRun);
				measures[name].totalTime += takenTime;
				measures[name].times.push(takenTime);
			};

			return function() {
				var startTime = $tw.utils.timer();
				var isInsideFilter = self.isInsideFilter || false;
				if (!isInsideFilter) {
					self.isInsideFilter = true;
				}
				var result = fn.apply(this,arguments);
				if (!isInsideFilter) {
					self.isInsideFilter = false;
				}
				var takenTime = $tw.utils.timer(startTime);

				storeLog(name, takenTime, self.measures);
				storeLog(name, takenTime, self.refreshTimes[self.currentRefreshName].filterLogs);

				return result;
			};
		} else {
			return fn;
		}
	};
};

})();
