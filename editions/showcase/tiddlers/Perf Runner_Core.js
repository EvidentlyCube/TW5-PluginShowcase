/*\
title: Perf Runner/Core
type: application/javascript
module-type: global

Core for performance checker

\*/
(function () {

	/*jslint node: false, browser: true */
	"use strict";

	if ($tw.node) {
		return;
	}

	const runTest = async name => {
		const $percent = document.querySelector('.perf--modal .percent');
		const widget = $tw.rootWidget;
		const test = require(name);

		let runs = 0;
		const totalRuns = test.cases.length * test.batches;

		const results = [];
		$percent.innerText = `Calculating batch size`;
		const batchSize = await determineBatchSizes(test.cases, widget)

		for (const testCase of test.cases) {
			let totalCaseTime = 0;
			const allBatchTimes = [];

			for (let i = 0; i < test.batches; i++) {
				const timeTaken = await runCase(testCase.run, batchSize, widget);

				allBatchTimes.push(timeTaken);
				totalCaseTime += timeTaken;
				runs++;

				$percent.innerText = `${(100 * runs / totalRuns).toFixed(2)}% (${testCase.name})`;
			}

			const runCount = test.batches * batchSize;

			totalCaseTime = totalCaseTime || 1;

			results.push({
				name: testCase.name,
				total: totalCaseTime,
				perRun: totalCaseTime / runCount,
				batches: allBatchTimes,
				worstBatch: allBatchTimes.reduce((prev, next) => Math.max(prev, next)),
				bestBatch: allBatchTimes.reduce((prev, next) => Math.min(prev, next)),
				runCount: runCount
			});
		}

		return results;
	}

	const determineBatchSizes = async (cases, widget) => {
		const allBatchSizes = [];

		for (const testCase of cases) {
			let caseBatchSize = 10;

			for (let i = 0; i < 100; i++) {
				const timeTaken = await runCase(testCase.run, caseBatchSize, widget);

				console.log(caseBatchSize, timeTaken);

				if (timeTaken < 500) {
					// Batch is too fast, let's increase its size and try again
					if (timeTaken <= 2) {
						caseBatchSize *= 10;
					} else if (timeTaken < 500) {
						caseBatchSize = caseBatchSize * (550 / timeTaken) | 0;
					}
					continue;
				}

				allBatchSizes.push(caseBatchSize);
				break;
			}
		}

		return allBatchSizes.reduce((prev, next) => Math.min(prev, next));
	}

	const runCase = async (action, batchSize, widget) => {
		const now = performance.now();
		action(batchSize, widget);
		const timeTaken = performance.now() - now;

		return new Promise(resolve => {
			setTimeout(() => resolve(timeTaken));
		});
	}

	exports.PerfRunner = {
		async startTest(name) {
			const dm = $tw.utils.domMaker;

			const $modal = dm('div', {
				class: 'perf--modal',
				children: [
					dm('div', { class: 'perf--spinner' }),
					dm('strong', { class: 'perf--text', text: "Measuring performance:" }),
					dm('span', { class: 'perf--text', text: name }),
					dm('span', { class: 'perf--text percent', text: "0.00%" }),
				]
			});

			document.body.appendChild($modal);
			try {
				const results = await runTest(name);
				console.log(results);

				const outputRows = [];

				const maxNameLength = results.map(result => result.name.length).reduce((prev, next) => Math.max(prev, next));
				const bestTime = results.map(result => result.perRun).reduce((prev, next) => Math.min(prev, next));

				outputRows.push("## Average times");
				results.forEach(result => {
					console.log(result.name.padEnd(maxNameLength + 2));
					outputRows.push(`${result.name.padEnd(maxNameLength + 2)} ${result.perRun.toFixed(6)}ms (+${(100 * result.perRun / bestTime - 100).toFixed(2)}%)`);
				});

				outputRows.push("");
				outputRows.push("Run details:");

				results.forEach(result => {
					outputRows.push("");
					outputRows.push(`# ${result.name}:`);
					outputRows.push(`Total runs: ${result.runCount}`);
					outputRows.push(`Total time taken: ${result.total.toFixed(4)}ms`);
					outputRows.push(`Time per run: ${result.perRun.toFixed(6)}ms`);
					outputRows.push(`Batch times [ms]: `);
					result.batches.forEach(batch => outputRows.push(` - ${batch.toFixed(4)}`))
				});

				$tw.wiki.addTiddler(new $tw.Tiddler({
					title: `$:/temp/Performance/${name}`,
					text: outputRows.join("\n")
				}))

			} catch (e) {
				$tw.wiki.addTiddler(new $tw.Tiddler({
					title: `$:/temp/Performance/${name}`,
					text: "Error occurred when running the test: " + String(e)
				}))
			}

			document.body.removeChild($modal);
		}
	}

})();
