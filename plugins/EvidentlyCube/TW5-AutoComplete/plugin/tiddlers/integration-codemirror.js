/*\
title: $:/plugins/EvidentlyCube/AutoComplete/integration-codemirror.js
type: application/javascript
module-type: library

Autocompletion integration for Simple text editor

\*/
(function () {

	exports.patch = function(completionAPI, monkeypatch) {
		var editCodeMirrorWidget = require('$:/plugins/tiddlywiki/codemirror/edit-codemirror.js')['edit-codemirror'];

		var selectionStart = -1;
		var activeCm = null;
		var activeDocument = null;
		var triggerLength = -1;

		editCodeMirrorWidget.prototype.render = monkeypatch.sequence(editCodeMirrorWidget.prototype.render, widgetRender);

		function widgetRender() {
			this.engine.cm.on('keydown', handleKeydown.bind(this));
			this.engine.cm.on('blur', handleBlur.bind(this));
			this.engine.cm.on('change', handleEngineInput.bind(this));
			this.engine.cm.on('cursorActivity', handleCursorActivity.bind(this));
		}

		function handleKeydown(cm, event) {
			if (completionAPI.isActive) {
				switch(event.key) {
					case "ArrowUp":
					case "ArrowDown":
						completionAPI.changeSelection(event.key === "ArrowUp" ? -1 : 1);
						event.stopImmediatePropagation();
						event.preventDefault();
						break;

					case "Enter":
						const option = completionAPI.getSelected();

						if (option) {
							insertSelection(option);
						} else {
							completionAPI.finishCompletion();
						}

						event.stopImmediatePropagation();
						event.preventDefault();
						break;
					default:
						if (completionAPI.isManualTrigger(event)) {
							// Prevent codemirror-autocomplete from triggering while this one is visible
							event.stopImmediatePropagation();
							event.preventDefault();
						}
						break;
					}

			} else if (completionAPI.isManualTrigger(event)) {
				var triggerData = completionAPI.getMatchingTrigger("", "", function (length) {
					const caret = cm.getCursor();
					const start = {
						line: caret.line,
						ch: Math.max(0, caret.ch - length)
					};

					return cm.getRange(start, caret);
				});

				if (triggerData) {
					startCompletion(triggerData, cm, { editedTiddler: this.editTitle });
					// Prevent codemirror-autocomplete from triggering
					event.preventDefault();
					event.stopImmediatePropagation();
				}
			}
		}

		function startCompletion(triggerData, cm, options) {
			activeCm = cm;
			activeDocument = cm.getInputField().ownerDocument;

			activeDocument.addEventListener('mousedown', handleDocumentMouseDownCapture, true);

			triggerLength = triggerData.trigger.length;
			selectionStart = cm.getCursor();
			completionAPI.startCompletion(triggerData, getCaretCoordinates(cm, selectionStart), {
				onFinish: handleFinishCompletion,
				windowID: cm.getInputField().ownerDocument._ecAcWindowID,
				editedTiddler: options.editedTiddler || ''
			});
		}

		function handleDocumentMouseDownCapture(event) {
			const target = event.target;
			if (
				!completionAPI.isActive
				|| !activeCm
				|| !target
				|| !target.classList.contains('ec_ac-link')
			) {
				return;
			}

			const value = target.getAttribute('data-value');

			completionAPI.setSelectionByValue(value);
			insertSelection(completionAPI.getSelected());
			event.preventDefault();
			event.stopImmediatePropagation();
		}

		function handleFinishCompletion() {
			activeDocument.removeEventListener('keydown', handleDocumentMouseDownCapture, true);

			activeCm = null;
			activeDocument = null;
		}

		function handleEngineInput(cm, operation) {
			const data = getOperationData(cm, operation);

			if (!completionAPI.isActive && data !== null && data !== "") {
				selectionStart = cm.getCursor();

				var triggerData = completionAPI.getMatchingTrigger(data, "TEXTAREA", function (length) {
					const caret = cm.getCursor();
					const start = {
						line: caret.line,
						ch: Math.max(0, caret.ch - length)
					};

					return cm.getRange(start, caret);
				});

				if (triggerData) {
					activeCm = cm;
					startCompletion(triggerData, cm, { editedTiddler: this.editTitle });
				}
			}
		}

		function getOperationData(cm, operation) {
			if (!operation || !operation.text || operation.text.length !== 1 || operation.origin !== "+input") {
				return "";
			}

			const inputText = operation.text[0];

			const autoCloseBracketsConf = cm.getOption('autoCloseBrackets');
			if (autoCloseBracketsConf) {
				// Special handling if autoCloseBrackets plugin is enabled
				const pairs = autoCloseBracketsConf.pairs || "()[]{}''\"\"";
				const index = pairs.indexOf(inputText);

				// If a configured pair was input then let's act as if only the first character was inserted
				if (index !== -1 && index % 2 === 0) {
					return inputText.substring(0, 1);
				}
			}

			return inputText;
		}

		function handleBlur() {
			if (completionAPI.isActive) {
				completionAPI.finishCompletion();
			}
		}

		function handleCursorActivity(cm) {
			if (!completionAPI.isActive || !cm.hasFocus()) {
				return;
			}
			const cursor = cm.getCursor();

			if (cursor.line < selectionStart.line || cursor.ch < selectionStart.ch) {
				completionAPI.finishCompletion();
			} else {
				completionAPI.updateQuery(cm.getRange(selectionStart, cursor));
			}
		}

		function insertSelection(value) {
			const completed = completionAPI.getCompletedTemplate(value);
			const sliceStart = {
				line: selectionStart.line,
				ch: selectionStart.ch - triggerLength
			};
			const sliceEnd = activeCm.getCursor();

			activeCm.replaceRange(completed.text, sliceStart, sliceEnd);
			activeCm.setCursor({
				line: selectionStart.line,
				ch: selectionStart.ch - triggerLength + completed.caretIndex
			});
			completionAPI.finishCompletion();
		}

		function getCaretCoordinates(cm, caretPos) {
			const coords = cm.charCoords(caretPos);

			return {
				left: coords.left,
				top: coords.bottom
			}
		}
	}
})();
