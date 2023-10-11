/*\
title: $:/plugins/EvidentlyCube/AutoComplete/completion-api.js
type: application/javascript
module-type: library

API for the modal

\*/
(function () {

	const DATA_TIDDLER_NAME = "$:/temp/AutoComplete/completion-data";

	/*jslint node: true, browser: true */
	/*global $tw: false */
	"use strict";

	var OPTIONS_TIDDLERS = [
		'$:/config/shortcuts/EC-AutoComplete',
		'$:/config/shortcuts-linux/EC-AutoComplete',
		'$:/config/shortcuts-not-linux/EC-AutoComplete',
		'$:/config/shortcuts-mac/EC-AutoComplete',
		'$:/config/shortcuts-not-mac/EC-AutoComplete',
		'$:/config/shortcuts-windows/EC-AutoComplete',
		'$:/config/shortcuts-not-windows/EC-AutoComplete',
	];

	function EC_AutoComplete() {
		this.isActive = false;
		this.activeState = {
			trigger: null,
			lastQuery: null,
			selectedResult: -1,
			results: [],
			options: {}
		}
		this.options = {
			triggers: [],
			triggerTiddlers: []
		}

		this._loadOptions();
		this._updateTriggerList(this._getTriggerTiddlerList());

		document.addEventListener('keydown', this._handleGlobalKeydownCapture.bind(this), true);
		$tw.wiki.addEventListener("change", this._handleChange.bind(this));
	};

	EC_AutoComplete.prototype._handleGlobalKeydownCapture = function (event) {
		if (this.isActive && event.key === "Escape") {
			this.finishCompletion();
			event.stopImmediatePropagation();
			event.preventDefault();
		}
	};

	EC_AutoComplete.prototype.getMatchingTrigger = function (lastCharacter, inputType, getFragmentCallback) {
		var ignoreType = lastCharacter === null || lastCharacter === "";

		for (let i = 0; i < this.options.triggers.length; i++) {
			var triggerData = this.options.triggers[i];

			if (!ignoreType && !triggerData.autoTriggerInput && inputType === 'INPUT') {
				continue;

			} else if (!ignoreType && !triggerData.autoTriggerTextArea && inputType === 'TEXTAREA') {
				continue;

			} else if (lastCharacter && triggerData.triggerLastCharacter !== lastCharacter) {
				continue;
			}

			const fragment = getFragmentCallback(triggerData.trigger.length);
			if (fragment !== triggerData.trigger) {
				continue;
			}

			return triggerData;
		}

		return null;
	}

	EC_AutoComplete.prototype.startCompletion = function (trigger, position, options) {
		this.isActive = true;
		this.activeState.trigger = trigger;
		this.activeState.lastQuery = null;
		this.activeState.selectedResult = 0;
		this.activeState.results = [];
		this.activeState.options = options || {};

		this.updateQuery("");

		const newStyle = `left: ${position.left.toFixed(4)}px; top: ${position.top.toFixed(4)}px`;

		$tw.wiki.setText(DATA_TIDDLER_NAME, 'show', null, "1");
		$tw.wiki.setText(DATA_TIDDLER_NAME, 'style', null, newStyle);
		$tw.wiki.setText(DATA_TIDDLER_NAME, 'display-filter', null, trigger.displayFilter);
		$tw.wiki.setText(DATA_TIDDLER_NAME, 'edited-tiddler', null, options.editedTiddler || '');
		if (typeof options.windowID !== "undefined") {
			$tw.wiki.setText(DATA_TIDDLER_NAME, 'show-window', null, options.windowID);
		} else {
			$tw.wiki.setText(DATA_TIDDLER_NAME, 'show-window', null, "-1");
		}
	};

	EC_AutoComplete.prototype.finishCompletion = function () {
		if (this.activeState.options.onFinish) {
			this.activeState.options.onFinish();
		}

		this.isActive = false;
		this.activeState.trigger = null;
		this.activeState.lastQuery = null;
		this.activeState.selectedResult = -1;
		this.activeState.results = [];

		$tw.wiki.setText(DATA_TIDDLER_NAME, 'show', null, "0");
	};

	EC_AutoComplete.prototype.updateQuery = function (query) {
		if (query === this.activeState.lastQuery) {
			return;
		}

		this.activeState.lastQuery = query;
		this.activeState.selectedResult = 0;

		const results = $tw.wiki.filterTiddlers(this.activeState.trigger.filter, getVariableFauxWidget({
			editedTiddler: this.activeState.options.editedTiddler || '',
			query
		}));

		this.activeState.results = results;
		$tw.wiki.setText(DATA_TIDDLER_NAME, 'list', null, this.activeState.results);
		$tw.wiki.setText(DATA_TIDDLER_NAME, 'index', null, 1);
	};

	EC_AutoComplete.prototype.changeSelection = function (delta) {
		this.activeState.selectedResult += delta

		if (this.activeState.selectedResult < 0) {
			this.activeState.selectedResult = this.activeState.results.length - 1;
		} else if (this.activeState.selectedResult >= this.activeState.results.length) {
			this.activeState.selectedResult = 0;
		}

		$tw.wiki.setText(DATA_TIDDLER_NAME, 'index', null, this.activeState.selectedResult + 1);
	};

	EC_AutoComplete.prototype.getCompletedTemplate = function (option) {
		const withReplacedOption = this.activeState.trigger.insertTemplate.replace(/\$option\$/g, option);
		const caretTokenIndex = withReplacedOption.indexOf("$caret$");
		const withRemovedCaret = withReplacedOption.replace(/\$caret\$/g, '');
		return {
			text: withRemovedCaret,
			caretIndex: caretTokenIndex !== -1
				? caretTokenIndex
				: withRemovedCaret.length
		};
	}

	EC_AutoComplete.prototype.getSelected = function () {
		const selectedResult = this.activeState.results[this.activeState.selectedResult] || "";

		return selectedResult
			? $tw.wiki.filterTiddlers(this.activeState.trigger.transformFilter,getVariableFauxWidget({ currentTiddler: selectedResult}))
			: "";
	};

	EC_AutoComplete.prototype.setSelectionByValue = function(value) {
		const index = this.activeState.results.indexOf(value);

		if (index !== -1) {
			this.activeState.selectedResult = index;
		}
	}

	EC_AutoComplete.prototype.getClicked = function (event) {
		if (event.target && event.target.classList.contains('ec_ac-link')) {
			return event.target.innerText;
		}

		return null;
	};

	EC_AutoComplete.prototype.isManualTrigger = function (event) {
		return $tw.keyboardManager.checkKeyDescriptors(event, this.options.manualTriggerKeyInfo);
	}

	EC_AutoComplete.prototype._handleChange = function (changedTiddlers) {
		if ($tw.utils.hopArray(changedTiddlers, OPTIONS_TIDDLERS)) {
			this._loadOptions();
		}

		const newTriggerTiddlerList = this._getTriggerTiddlerList();

		if (
			$tw.utils.hopArray(changedTiddlers, newTriggerTiddlerList)
			|| $tw.utils.hopArray(changedTiddlers, this.options.triggerTiddlers)
		) {
			this._updateTriggerList(newTriggerTiddlerList);
		}
	};

	EC_AutoComplete.prototype._loadOptions = function () {
		this.options.manualTriggerKeyInfo = $tw.keyboardManager.parseKeyDescriptors('((EC-AutoComplete))', { wiki: this.wiki });
	}

	EC_AutoComplete.prototype._getTriggerTiddlerList = function () {
		return $tw.wiki.getTiddlersWithTag("$:/tags/EC/AutoComplete/Trigger");
	};

	EC_AutoComplete.prototype._updateTriggerList = function (tiddlerList) {
		this.options.triggers = [];
		this.options.triggerTiddlers = tiddlerList;

		for (var i = 0; i < tiddlerList.length; i++) {
			var title = tiddlerList[i],
				tiddlerFields = $tw.wiki.getTiddler(title).fields,
				trigger = tiddlerFields.trigger,
				filter = tiddlerFields.filter,
				insertTemplate = tiddlerFields.template;

			if (!filter || !insertTemplate || !trigger) {
				continue;
			}

			this.options.triggers.push({
				filter: tiddlerFields.filter,
				displayFilter: tiddlerFields['display-filter'],
				transformFilter: tiddlerFields['transform-filter'] || "[<currentTiddler>]",
				trigger: trigger,
				triggerLastCharacter: trigger.charAt(trigger.length - 1),
				insertTemplate: insertTemplate,
				autoTriggerInput: tiddlerFields['auto-trigger-input'],
				autoTriggerTextArea: tiddlerFields['auto-trigger-textarea'],
			});
		}
	};

	function getVariableFauxWidget(keyValues) {
		if ($tw.rootWidget.makeFakeWidgetWithVariables) {
			return $tw.rootWidget.makeFakeWidgetWithVariables(keyValues);
		}

		// Backwards compatibility for pre 5.3.0 versions
		return {
			getVariable: function (name) {
				if (typeof keyValues[name] !== 'undefined') {
					return keyValues[name];
				}

				return "";
			}
		}
	}

	exports.EC_AutoComplete = EC_AutoComplete;
})();
