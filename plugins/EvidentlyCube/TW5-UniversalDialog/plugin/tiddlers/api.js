/*\
title: $:/plugins/EvidentlyCube/UniversalDialog/api.js
type: application/javascript
module-type: library

API for the universal dialog

\*/
(function () {
	"use strict";

	const STATE_TIDDLER = "$:/temp/UniversalDialog/state";
	const DEFAULT_ACTION = '<$action-navigate $to=<<title>> $scroll="yes" />'
		+ '<$action-sendmessage $message="tm-ec-ud-action" $param="close" />';

	const TYPE_PREFIX = 'prefix';
	const TYPE_NO_PREFIX = 'noprefix';
	const TYPE_FILTER = 'filter';
	const TYPE_FORCED = 'forced';

	const NavigatorWidget = require('$:/core/modules/widgets/navigator.js').navigator;
	const ResultStore = require('$:/plugins/EvidentlyCube/UniversalDialog/result-store.js').ResultStore;

	function UniversalDialog() {
		this.rulesets = [];
		this.currentRuleset = null;
		this.forcedRuleset = false;
		this.query = "";
		this.option = "";

		$tw.rootWidget.addEventListener('tm-ec-ud-action', this.handleMessage.bind(this));
		document.addEventListener('click', this.handleClickCapture.bind(this), true);
	};

	UniversalDialog.prototype.handleClickCapture = function(e) {
		if (!e.target.closest('.ec_ud-dialog')) {
			$tw.wiki.setText(STATE_TIDDLER, 'is-open', null, undefined);
		}
	}

	UniversalDialog.prototype.handleMessage = function(e) {
		switch (e.param) {
			case 'next-result':
				ResultStore.changeSelectedIndex(1);
				break;
			case 'prev-result':
				ResultStore.changeSelectedIndex(-1);
				break;
			case 'select-option':
				const selectedIndex = e.paramObject.index || ResultStore.getSelectedIndex();
				const result = ResultStore.getStoredResultAt(selectedIndex - 1);
				const widget = findNavigateWidget() || $tw.rootWidget;
				widget.invokeActionString(
					this.currentRuleset.selectAction,
					e.widget,
					e.event,
					{index: result.index, title: result.title}
				);
				if (document.activeElement && document.activeElement.classList.contains('ec_ud-input')) {
					document.activeElement.value = $tw.wiki.getTiddlerText(STATE_TIDDLER);
				}
				break;
			case 'set-query':
				$tw.wiki.setText(STATE_TIDDLER, 'text', null, e.paramObject.query || "");
				this.handleInput(null);
				break;
			case 'force-ruleset':
				this.handleForceRuleset(e);
				break;
			case 'input':
				this.handleInput(e.event);
				break;
			case 'close':
				$tw.wiki.setText(STATE_TIDDLER, 'is-open', null, undefined);
				break;

			case 'backspace':
				if (this.query.length > 0) {
					document.execCommand('delete');
				}
				break;

			case 'clear':
			case 'open':
				this._updateRulesetList(this._getRulesetTiddlerList());

				this.currentRuleset = this.findRuleset("");

				this.query = "";
				this.option = "";
				this.forcedRuleset = false;

				$tw.wiki.setText(STATE_TIDDLER, 'is-open', null, 1);
				$tw.wiki.setText(STATE_TIDDLER, 'text', null, "");
				$tw.wiki.setText(STATE_TIDDLER, 'limit', null, "11");
				$tw.wiki.setText(STATE_TIDDLER, 'selected', null, "1");
				$tw.wiki.setText(STATE_TIDDLER, 'option', null, "");
				$tw.wiki.setText(STATE_TIDDLER, 'hint-forced', null, "");
				this.refreshResults();
				break;
		}
	};

	UniversalDialog.prototype.handleForceRuleset = function(e) {
		const forcedRuleset = this.findRuleset(e.paramObject.ruleset);
		if (forcedRuleset) {
			this.currentRuleset = forcedRuleset;
			this.forcedRuleset = true;

			this.option = e.paramObject.option || "";
			$tw.wiki.setText(STATE_TIDDLER, 'option', null, this.option);
			$tw.wiki.setText(STATE_TIDDLER, 'hint-forced', null, this.currentRuleset.hintForced);
		} else {
			this.forcedRuleset = false;
		}

		const query = e.paramObject.query === undefined || e.paramObject.query === null
			? this.query
			: String(e.paramObject.query);

		$tw.wiki.setText(STATE_TIDDLER, 'text', null, query);

		this.handleInput(null);
	};

	UniversalDialog.prototype.handleInput = function(e) {
		this.query = $tw.wiki.getTiddlerText(STATE_TIDDLER);
		if (!this.forcedRuleset) {
			this.currentRuleset = this.findRuleset(this.query) || this.currentRuleset;
		}

		this.refreshResults();
	};

	UniversalDialog.prototype.refreshResults = function() {
		if (!this.currentRuleset) {
			$tw.wiki.setText(STATE_TIDDLER, 'prefix', null, "");
			return;
		}

		$tw.wiki.setText(STATE_TIDDLER, 'selected', null, "1");
		$tw.wiki.setText(STATE_TIDDLER, 'prefix', null, this.currentRuleset.prefix);
		$tw.wiki.setText(STATE_TIDDLER, 'hint', null, this.currentRuleset.hint);

		const encodedResults = [];
		const resultsSet = new Set();
		const addStepResults = function(results, step) {
			for (const result of results) {
				if (resultsSet.has(result)) {
					continue;
				}

				encodedResults.push(ResultStore.encodeResultRow(encodedResults.length + 1, result, step.hint));
				resultsSet.add(result);
			}
		}
		const baseQuery = this.currentRuleset.isPrefixExcluded
			? this.query.substring(this.currentRuleset.prefix.length)
			: this.query;

		for (const step of this.currentRuleset.steps) {
			if (
				step['condition-filter']
				&& $tw.wiki.filterTiddlers(step['condition-filter'], getVariablesFauxWidget({query: baseQuery, option: this.option})).length === 0
			) {
				continue;
			}
			const query = this._transformQuery(baseQuery, step['query-filter']);

			// Todo add query transform step
			const stepResults = $tw.wiki.filterTiddlers(step['results-filter'] || query, getVariablesFauxWidget({query: query, option: this.option}));

			addStepResults(stepResults, step);
		}

		ResultStore.storeResults(encodedResults);
	};

	UniversalDialog.prototype.findRuleset = function(prefix) {
		prefix = prefix || "";
		for (const ruleset of this.rulesets) {
			const rulesetPrefix = ruleset.prefix || "";

			if (rulesetPrefix === prefix) {
				return ruleset;
			}
		}

		return null;
	}

	UniversalDialog.prototype._transformQuery = function(baseQuery, queryFilter) {
		if (!queryFilter) {
			return baseQuery;
		}

		const result = $tw.wiki.filterTiddlers(queryFilter, getVariablesFauxWidget({query: baseQuery}));

		if ($tw.utils.isArray(result)) {
			return String(result[0]);
		} else {
			return String(result);
		}
	}

	UniversalDialog.prototype._getRulesetTiddlerList = function () {
		return $tw.wiki.getTiddlersWithTag("$:/tags/EC/UniversalDialog/Ruleset");
	};

	UniversalDialog.prototype._getRulesetStepTiddlers = function(rulesetTitle) {
		return $tw.wiki.filterTiddlers(
			"[all[tiddlers]tag[$:/tags/EC/UniversalDialog/Step]!is[draft]field:parent<parent>]",
			getVariablesFauxWidget({parent: rulesetTitle})
		);
	}

	UniversalDialog.prototype._updateRulesetList = function(tiddlerList) {
		this.rulesets.length = 0;

		for (var i = 0; i < tiddlerList.length; i++) {
			var title = tiddlerList[i];
			var tiddlerFields = $tw.wiki.getTiddler(title).fields;
			var prefix = tiddlerFields.prefix || '';
			var type = tiddlerFields['ruleset-type'];

			this.rulesets.push({
				prefix: prefix,
				hint: tiddlerFields.hint || "",
				selectAction: tiddlerFields.actions || DEFAULT_ACTION,
				isPrefixExcluded: this._getRulesetPrefixExcluded(type, prefix),
				isForced: type === TYPE_FORCED,
				steps: this._getRulesetSteps(type, title)
			});
		}
	}

	UniversalDialog.prototype._getRulesetPrefixExcluded = function(type, prefix) {
		if (type === TYPE_PREFIX) {
			return false;
		} else if (type === TYPE_NO_PREFIX || type === TYPE_FORCED) {
			return true;
		} else {
			return prefix === '[';
		}
	};

	UniversalDialog.prototype._getRulesetSteps = function(type, title) {
		if (type === TYPE_FILTER) {
			return [
				{
					'condition-filter': '',
					'query-filter': '',
					'results-filter': '',
					'hint': ''
				}
			];
		} else {
			return this._getRulesetStepTiddlers(title).map(function(title) {
				return $tw.wiki.getTiddler(title).fields;
			});
		}
	}

	function getVariablesFauxWidget(vars) {
		return {
			getVariable: function (name) {
				return vars[name] || "";
			}
		}
	}

	function findNavigateWidget() {
		const widgets = [$tw.rootWidget];
		while (widgets.length > 0) {
			const widget = widgets.shift();

			if (widget instanceof NavigatorWidget) {
				return widget;
			}

			widgets.push.apply(widgets, widget.children);
		}

		return null;
	}

	exports.UniversalDialog = UniversalDialog;
})();
