/*\
title: $:/plugins/EvidentlyCube/AdvancedPerformance/ui.js
type: application/javascript
module-type: startup

Cleans up data after a TaskList is removed
\*/

(function () {

	/*jslint node: false, browser: true */
	/*global $tw: false */
	"use strict";

	// Export name and synchronous status
	exports.name = "evidentlycube-adv-perf--footer";
	exports.after = ["startup", "render"];
	exports.synchronous = true;
	exports.startup = function () {
		if ($tw.node) {
			return;
		}

		var refreshIdCounter = 1;
		var footerText = $tw.wiki.getTiddlerText('$:/config/Performance/Instrumentation') !== "yes"
			? "Performance instrumentation has been enabled, please save your wiki and refresh it to allow collecting data"
			: "";
		var isShowingDetails = false;
		var selectedTab = "ec_ap-tab--refresh-logs";

		var onClickCapture = function(event) {
			switch(event.target.getAttribute('data-ec-ap')) {
				case 'show-details':
					event.stopPropagation();
					event.preventDefault();

					isShowingDetails = true;
					showDetails();
					break;
				case 'clear-data':
					event.stopPropagation();
					event.preventDefault();

					clearPerfData();
					break;
				case 'close':
					event.stopPropagation();
					event.preventDefault();

					isShowingDetails = false;
					showDetails();
					break;

				case 'tab':
					event.stopPropagation();
					event.preventDefault();

					selectedTab = event.target.getAttribute('data-for') || selectedTab;
					refreshTabs();
					break;

				case 'filter-all':
				case 'filter-limit':
					// these are handled in onClick
					break;
			}
		};

		var onClick = function(event) {
			switch(event.target.getAttribute('data-ec-ap')) {
				case 'filter-limit':
					var selectedFilterCount = document.querySelectorAll('input[data-ec-ap="filter-limit"]:checked').length;

					var all = document.querySelector('input[data-ec-ap="filter-all"]');
					if (selectedFilterCount === 0) {
						all.checked = true;
					} else {
						all.checked = false;
					}
					refreshFilterTabs();
					break;
				case 'filter-all':
					var checked = !event.target.checked;
					document.querySelectorAll('input[data-ec-ap="filter-limit"]').forEach(function(checkbox) {
						checkbox.checked = checked;
					})
					refreshFilterTabs();
					break;
			}
		};

		document.querySelector('body').addEventListener('click', onClickCapture, true);
		document.querySelector('body').addEventListener('click', onClick);

		var clearPerfData = function() {
			event.stopPropagation();
			event.preventDefault();

			$tw.perf.measures = {};
			$tw.perf.refreshTimesHistory = [];
			$tw.perf.resetRefreshTimes();

			footerText = "Performance data was cleared, please interact with the wiki to start collecting data";

			showDetails();
			refreshFooter();
		}

		var refreshTabs = function() {
			document.querySelectorAll('.ec_ap-tab-header').forEach(function(element) {
				if (element.getAttribute('data-for') === selectedTab) {
					element.classList.add('selected');
				} else {
					element.classList.remove('selected');
				}
			});
			document.querySelectorAll('#ec_ap-tabs > *').forEach(function(element) {
				if (element.classList.contains(selectedTab)) {
					element.classList.add('selected');
				} else {
					element.classList.remove('selected');
				}
			});
		};

		var getFilteredMeasures = function() {
			var allFilter = document.querySelector('input[data-ec-ap="filter-all"]');
			var checkedBoxes = document.querySelectorAll('input[data-ec-ap="filter-limit"]:checked');

			// If not filtering by refresh then take the global measures
			if (allFilter.checked === true) {
				return $tw.perf.measures;
			}

			// Otherwise we need to construct them
			var ids = new Set();
			var measures = {};

			var storeMeasure = function(name, logs) {
				if(!(name in measures)) {
					measures[name] = JSON.parse(JSON.stringify(logs));
					return;
				}

				measures[name].lastUse = Math.max(measures[name].lastUse, logs);
				measures[name].totalCalls += logs.totalCalls;
				measures[name].longestRun = Math.max(logs.longestRun, measures[name].longestRun);
				measures[name].shortestRun = Math.min(logs.longestRun, measures[name].shortestRun);
				measures[name].totalTime += logs.longestRun;
				measures[name].times.push.apply(measures[name].times, logs.times);
			};

			checkedBoxes.forEach(function(checkbox) {
				ids.add(checkbox.getAttribute('data-id') + ':' + checkbox.getAttribute('data-key'));
			});

			$tw.perf.refreshTimesHistory.forEach(function(measure) {
				$tw.utils.each(measure.refreshTimes, function(refreshTimes, name) {
					var id = measure.id + ':' + name;
					if (!ids.has(id)) {
						return;
					}

					$tw.utils.each(refreshTimes.filterLogs, function(logs, filterName) {
						storeMeasure(filterName, logs);
					});
				});
			});

			return measures;
		}

		var showDetails = function() {
			if (!isShowingDetails) {
				document.querySelector('#ec_ap-wrap').style.display = "none";
				return;
			}

			document.querySelector('#ec_ap-wrap').style.display = "block";

			refreshTabs();

			var dm = $tw.utils.domMaker;

			createTable(
				document.querySelector('#ec_ap--last-refreshes'),
				[
					{name: 'Refresh time', field: 'time'},
					{name: 'Total time', getText: function(m) {
						return Object.values(m.refreshTimes).reduce(function(sum, next) { return sum + next.timeTaken}, 0).toFixed(2) + "ms";
					}},
					{
						name: 'Individual times',
						getText: function(m) {
							return Object.keys(m.refreshTimes).map(function(key) {
								var id = "ec-ap-checkbox--" + key + "-" + m.id;
								var checkbox = dm('input', {attributes: {
									id: id,
									type: 'checkbox',
									'data-id': m.id,
									'data-key': key,
									'data-ec-ap': 'filter-limit'
								}});
								var text = dm('span', {
									text: key + ": " + m.refreshTimes[key].timeTaken.toFixed(2) + "ms"
								});
								text.innerHTML = "&nbsp;" + text.innerHTML + "&nbsp;";

								var filterCount = Object.keys(m.refreshTimes[key].filterLogs).length;
								var text2 = dm('span', {
									class: 'ec_ap-muted',
									text: '(' + filterCount + " filter"+(filterCount !== '1' ? 's' : '')+" executed)"
								});

								return dm('label', {children: [checkbox, text, text2], attributes: {'for': id}}).outerHTML;
							}).join("<br>");
						}
					},
					{
						name: 'Changed tiddlers',
						getText: function(m) {
							return m.changedTiddlerNames.length;
						},
						getTitle: function(m) {
							return m.changedTiddlerNames.join("\n");
						}
					},
					{name: "Temp", getText: function(m) { return m.tempTiddlers; }},
					{name: "State", getText: function(m) { return m.stateTiddlers; }},
					{name: "System", getText: function(m) { return m.systemTiddlers; }},
					{name: "Main", getText: function(m) { return m.mainTiddlers; }},
				],
				$tw.perf.refreshTimesHistory.reverse()
			);

			refreshFilterTabs();
		};

		var refreshFilterTabs = function() {

			var measures = [];
			$tw.utils.each(getFilteredMeasures(), function(measure, filterName) {
				var lastTen = measure.times.slice(-10);
				var timesSorted = measure.times.concat();
				timesSorted.sort();

				var half = Math.floor(timesSorted.length / 2);

				measures.push({
					filterName: filterName
						.replace(/^~?filter:\s*/, '')
						.replace(/</g, '&lt;')
						.replace(/>/g, '&gt;'),
					isSub: measure.isSub,
					lastUse: measure.lastUse,
					longestRun: measure.longestRun,
					shortestRun: measure.shortestRun,
					totalCalls: measure.totalCalls,
					totalTime: measure.totalTime,
					totalTimeLastTen: lastTen.reduce(function(sum, next) { return sum + next; }, 0),
					times: measure.times,
					timesSorted: timesSorted,
					timesLastTen: lastTen,
					average: measure.totalTime / measure.totalCalls,
					median: timesSorted.length % 2
						? timesSorted[half]
						: (timesSorted[half - 1] + timesSorted[half]) / 2
				});
			});

			var recordsToShow = 50;
			var mostUsedFilters = measures.concat().sort(createSortByCallback(['totalCalls', 'lastUse']));
			var singleLongestExecution = measures.concat().sort(createSortByCallback(['longestRun', 'lastUse']));
			var totalLongestExecution = measures.concat().sort(createSortByCallback(['totalTime', 'lastUse']));
			var averageLongest = measures.concat().sort(createSortByCallback(['average', 'lastUse']));
			var medianLongest = measures.concat().sort(createSortByCallback(['median', 'lastUse']));

			var filterNameColumn = {
				name: 'Filter',
				field: 'filterName',
				getText: function (m) {
					if (m.isSub) {
						return `<small><em>Sub-filter: ${m.filterName}</em></small>`;
					} else {
						return m.filterName;
					}
				},
				getTitle: function (m) {
					return m.isSub
						? "This was executed as a sub-filter to another filter. Sub-filter's time is included in the main filter's duration but the duration is not double counted for the 'Refresh logs' tab."
						: '';
				}
			};

			var totalTimeColumn = {
				name: 'Total time (last 10)',
				getText: function(m) { return m.totalTimeLastTen.toFixed(2) + 'ms'; },
				getTitle: function(m) { return m.timesLastTen.map(function(x) { return x.toFixed(2) + 'ms'}).join("\n"); }
			};

			createTable(
				document.querySelector('#ec_ap--most-used'),
				[
					filterNameColumn,
					{name: 'Uses', field: 'totalCalls' },
					{name: 'Total time', getText: function(m) { return m.totalTime.toFixed(2) + 'ms'; }},
					totalTimeColumn,
					{name: 'Longest run', getText: function(m) { return m.longestRun.toFixed(2) + 'ms'; }},
					{name: 'Average time', getText: function(m) { return m.average.toFixed(2) + 'ms'; }},
					{name: 'Median time', getText: function(m) { return m.median.toFixed(2) + 'ms'; }},
				],
				mostUsedFilters.slice(0, recordsToShow)
			);

			createTable(
				document.querySelector('#ec_ap--single-longest'),
				[
					filterNameColumn,
					{name: 'Longest run', getText: function(m) { return m.longestRun.toFixed(2) + 'ms'; }},
					{name: 'Uses', field: 'totalCalls' },
					{name: 'Total time', getText: function(m) { return m.totalTime.toFixed(2) + 'ms'; }},
					totalTimeColumn,
					{name: 'Average time', getText: function(m) { return m.average.toFixed(2) + 'ms'; }},
					{name: 'Median time', getText: function(m) { return m.median.toFixed(2) + 'ms'; }},
				],
				singleLongestExecution.slice(0, recordsToShow)
			);

			createTable(
				document.querySelector('#ec_ap--total-longest'),
				[
					filterNameColumn,
					{name: 'Total time', getText: function(m) { return m.totalTime.toFixed(2) + 'ms'; }},
					{name: 'Uses', field: 'totalCalls' },
					totalTimeColumn,
					{name: 'Longest run', getText: function(m) { return m.longestRun.toFixed(2) + 'ms'; }},
					{name: 'Average time', getText: function(m) { return m.average.toFixed(2) + 'ms'; }},
					{name: 'Median time', getText: function(m) { return m.median.toFixed(2) + 'ms'; }},
				],
				totalLongestExecution.slice(0, recordsToShow)
			);

			createTable(
				document.querySelector('#ec_ap--average'),
				[
					filterNameColumn,
					{name: 'Average time', getText: function(m) { return m.average.toFixed(2) + 'ms'; }},
					{name: 'Uses', field: 'totalCalls' },
					{name: 'Total time', getText: function(m) { return m.totalTime.toFixed(2) + 'ms'; }},
					totalTimeColumn,
					{name: 'Longest run', getText: function(m) { return m.longestRun.toFixed(2) + 'ms'; }},
					{name: 'Median time', getText: function(m) { return m.median.toFixed(2) + 'ms'; }},
				],
				averageLongest.slice(0, recordsToShow)
			);

			createTable(
				document.querySelector('#ec_ap--median'),
				[
					filterNameColumn,
					{name: 'Median time', getText: function(m) { return m.median.toFixed(2) + 'ms'; }},
					{name: 'Uses', field: 'totalCalls' },
					{name: 'Total time', getText: function(m) { return m.totalTime.toFixed(2) + 'ms'; }},
					totalTimeColumn,
					{name: 'Longest run', getText: function(m) { return m.longestRun.toFixed(2) + 'ms'; }},
					{name: 'Average time', getText: function(m) { return m.average.toFixed(2) + 'ms'; }},
				],
				medianLongest.slice(0, recordsToShow)
			);
		};

		var createSortByCallback = function(fields, reverse) {
			var orderMultiplier = reverse ? -1 : 1;

			return function(left, right) {
				for(var i = 0; i < fields.length; i++) {
					var field = fields[i];
					if (left[field] !== right[field]) {
						return (right[field] - left[field]) * orderMultiplier;
					}
				}

				return left.filterName.localeCompare(right.filterName) * orderMultiplier;
			}
		}

		var createTable = function(tableElement, headers, measures) {
			var dm = $tw.utils.domMaker;
			var theadThs = headers.map(function(header) {
				return dm('th', {text: header.name});
			});
			var theadTr = dm("tr", {children: theadThs});
			var tbodyTrs = measures.map(function(measure) {
				var tds = headers.map(function(header) {
					var title = header.getTitle ? header.getTitle(measure) : '';
					var content = dm('span', {
						class: title ? 'ec_ap-annotated' : '',
						innerHTML: header.getText ? header.getText(measure) : measure[header.field],
						attributes: {title: header.getTitle ? header.getTitle(measure) : ''}
					});

					return dm('td', {children: [content]});
				});

				return dm('tr', {children: tds});
			});
			var thead = dm('thead', {children: [theadTr]});
			var tbody = dm('tbody', {children: tbodyTrs});
			var table = dm('table', {children: [thead, tbody]});

			tableElement.innerHTML = table.innerHTML;
		}

		var refreshFooter = function() {
			var hasMeasurements = Object.keys($tw.perf.measures).length > 0;

			if (!hasMeasurements) {
				document.querySelectorAll('#ec_ap-footer > *').forEach(function(element) {
					element.style.display = "none";
				});

				var message = document.querySelector('#ec_ap-message')
				message.style.display = "block";
				message.innerText = footerText;
				return true;
			}

			document.querySelectorAll('#ec_ap-footer > *').forEach(function(element) {
				element.style.display = null;
			});
			document.querySelector('#ec_ap-message').style.display = "none";

			return false;
		}

		$tw.wiki.addEventListener("change", function (changes) {
			if (!document.querySelector('#ec_ap-footer') || refreshFooter()) {
				return;
			}

			var tempTiddlers = 0;
			var systemTiddlers = 0;
			var stateTiddlers = 0;
			var mainTiddlers = 0;
			var totalTiddlers = 0;
			var totalTime = 0;
			var refreshTimes = JSON.parse(JSON.stringify($tw.perf.refreshTimes));
			var refreshHtmls = [];

			$tw.utils.each(changes, function(_, tiddler) {
				if (tiddler.startsWith('$:/temp/')) {
					tempTiddlers++;
				} else if (tiddler.startsWith('$:/state/')) {
					stateTiddlers++;
				} else if (tiddler.startsWith('$:/')) {
					systemTiddlers++;
				} else {
					mainTiddlers++;
				}

				totalTiddlers++;
			});

			$tw.utils.each(refreshTimes, function(data, name) {
				if (name === 'other') {
					// Precalculate other's time taken because it contains all filters that run outside refreshes
					refreshTimes[name].timeTaken = Object.values(data.filterLogs).reduce(function(total, measure) {
						return total + (measure.isSub ? 0 : measure.totalTime);
					}, 0);
				}

				totalTime += data.timeTaken;
				refreshHtmls.push(
					'<span title="'
					+ name +
					'">'
					+ data.timeTaken.toFixed(2)
					+ 'ms</span>'
				);
			});

			var now = new Date();
			var time = now.getHours().toString().padStart(2, "0")
				+ ":"
				+ now.getMinutes().toString().padStart(2, "0")
				+ ":"
				+ now.getSeconds().toString().padStart(2, "0")
				+ "."
				+ (now.getTime() % 1000).toString().padStart(3, "0");

			$tw.perf.storeRefresh({
				id: refreshIdCounter++,
				time: time,
				tempTiddlers: tempTiddlers,
				stateTiddlers: stateTiddlers,
				systemTiddlers: systemTiddlers,
				mainTiddlers: mainTiddlers,
				totalTiddlers: totalTiddlers,
				changedTiddlerNames: Object.keys(changes),
				refreshTimes: refreshTimes
			});

			document.querySelector('#ec_ap-last-refresh').innerText = time;
			document.querySelector('#ec_ap-total-time').innerText = totalTime.toFixed(2) + "ms";
			document.querySelector('#ec_ap-times').innerHTML = '(' + refreshHtmls.join(" | ") + ')';
			document.querySelector('#ec_ap-tiddlers').innerHTML = totalTiddlers;
			document.querySelector('#ec_ap-tiddlers-temp').innerHTML = "Temp=" + tempTiddlers;
			document.querySelector('#ec_ap-tiddlers-state').innerHTML = "State=" + stateTiddlers;
			document.querySelector('#ec_ap-tiddlers-system').innerHTML = "System=" + systemTiddlers;
			document.querySelector('#ec_ap-tiddlers-main').innerHTML = "Main=" + mainTiddlers;

			// Clear current refresh times to avoid outdated `mainRender` polluting our logs
			$tw.perf.resetRefreshTimes();
		});
	};

})();
