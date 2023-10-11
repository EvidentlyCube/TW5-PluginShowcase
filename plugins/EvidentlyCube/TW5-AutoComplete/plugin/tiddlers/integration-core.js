/*\
title: $:/plugins/EvidentlyCube/AutoComplete/integration-core.js
type: application/javascript
module-type: library

Autocompletion integration for Simple text editor

\*/
(function () {

	exports.patch = function(completionAPI, monkeypatch) {
		var editTextWidget = require('$:/core/modules/widgets/edit-text.js')['edit-text'];
		var simpleEngine = require('$:/core/modules/editor/engines/simple.js').SimpleEngine;
		var framedEngine = require('$:/core/modules/editor/engines/framed.js').FramedEngine;
		var getBaseCaretCoordinates = require('$:/plugins/EvidentlyCube/AutoComplete/textarea-caret-position.js').getCaretCoordinates;

		var selectionStart = -1;
		var activeDom = null;
		var activeDocument_keyHook = null;
		var activeDocument_mouseHook = null;
		var triggerLength = -1;

		// Needed to be able to detect main TW window in the mechanism that prevents
		// Auto Complete from opening in multiple windows
		document._ecAcWindowID = "";

		editTextWidget.prototype.render = monkeypatch.sequence(editTextWidget.prototype.render, widgetRender);
		editTextWidget.prototype.handleKeydownEvent = monkeypatch.preventable(editTextWidget.prototype.handleKeydownEvent, handleWidgetKeydown);
		simpleEngine.prototype.handleInputEvent = monkeypatch.preventable(simpleEngine.prototype.handleInputEvent, handleEngineInput);
		framedEngine.prototype.handleInputEvent = monkeypatch.preventable(framedEngine.prototype.handleInputEvent, handleEngineInput);

		function widgetRender() {
			this.engine.domNode.addEventListener('blur', handleBlur);
			this.engine.domNode.addEventListener('keyup', handleKeyup);

			// We need to be able to detect this even for inputs
			if (!this.editShowToolbar) {
				$tw.utils.addEventListeners(this.engine.domNode, [
					{ name: 'keydown', handlerObject: this, handlerMethod: 'handleKeydownEvent' }
				]);
			}
		}

		function handleWidgetKeydown(event) {
			if (completionAPI.isActive) {
				switch(event.key) {
					case "ArrowUp":
					case "ArrowDown":
						completionAPI.changeSelection(event.key === "ArrowUp" ? -1 : 1);
						event.stopImmediatePropagation();
						event.preventDefault();
						return false;
					}

			} else if (completionAPI.isManualTrigger(event)) {
				var triggerData = completionAPI.getMatchingTrigger("", event.target.tagName, function (length) {
					return event.target.value.substr(event.target.selectionStart - length, length);
				});

				if (triggerData) {
					startCompletion(triggerData, event.target, this.editTitle);
				}
			}
		}

		function startCompletion(triggerData, dom, editedTiddler) {
			// Special handling to avoid confirm to close draft when editing in framed editor
			activeDocument_keyHook = dom.ownerDocument;
			activeDocument_mouseHook = activeDocument_keyHook.defaultView.top.document;

			// Iframed editor compatibility: Prevent escape from asking to close the tiddler if completion is active
			// Streams Plugin compatibility: Handle enter on root to circumvent new stream being created
			activeDocument_keyHook.addEventListener('keydown', handleDocumentKeydownCapture, true);
			activeDocument_mouseHook.addEventListener('mousedown', handleDocumentMouseDownCapture, true);

			activeDom = dom;
			triggerLength = triggerData.trigger.length;
			selectionStart = dom.selectionStart;
			completionAPI.startCompletion(triggerData, getCaretCoordinates(dom, selectionStart), {
				onFinish: handleFinishCompletion,
				windowID: dom.ownerDocument.defaultView.top.document._ecAcWindowID,
				editedTiddler: editedTiddler
			});
		}

		function handleFinishCompletion() {
			activeDocument_keyHook.removeEventListener('keydown', handleDocumentKeydownCapture, true);
			activeDocument_mouseHook.removeEventListener('mousedown', handleDocumentMouseDownCapture, true);

			activeDom = null;
			activeDocument_keyHook = null;
			activeDocument_mouseHook = null;
		}

		function handleDocumentMouseDownCapture(event) {
			const target = event.target;
			if (!completionAPI.isActive || !target || !target.classList.contains('ec_ac-link')) {
				return;
			}

			const value = target.getAttribute('data-value');

			completionAPI.setSelectionByValue(value);
			insertSelection(completionAPI.getSelected());
			event.preventDefault();
			event.stopImmediatePropagation();
		}

		function handleDocumentKeydownCapture(event) {
			if (!completionAPI.isActive) {
				return;
			}
			switch(event.key) {
				case 'Escape':
					completionAPI.finishCompletion();
					event.stopImmediatePropagation();
					event.preventDefault()
					break;

				case 'Enter':
					if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
						const option = completionAPI.getSelected();

						if (option) {
							insertSelection(option);
						} else {
							completionAPI.finishCompletion();
						}

						event.stopImmediatePropagation();
						event.preventDefault();
					}
					break;
			}
		}

		function handleEngineInput(event) {
			if (!completionAPI.isActive && event.data !== null && event.data !== "") {
				var triggerData = completionAPI.getMatchingTrigger(event.data, event.target.tagName, function (length) {
					return event.target.value.substr(event.target.selectionStart - length, length);
				});

				if (triggerData) {
					activeDom = event.target;
					startCompletion(triggerData, event.target, this.widget.editTitle);
				}
			}
		}

		function handleBlur(event) {
			if (completionAPI.isActive) {
				completionAPI.finishCompletion();
			}
		}

		function handleKeyup(event) {
			if (!completionAPI.isActive) {
				return;
			} else if (!activeDom) {
				completionAPI.finishCompletion();
				return;
			}

			if (activeDom.selectionStart < selectionStart) {
				completionAPI.finishCompletion();
			} else {
				completionAPI.updateQuery(activeDom.value.substring(selectionStart, activeDom.selectionStart));
			}
		}

		function insertSelection(value) {
			const completed = completionAPI.getCompletedTemplate(value);
			const sliceStart = selectionStart - triggerLength;
			const sliceEnd = activeDom.selectionStart;

			if (activeDom.getRootNode().execCommand) {
				activeDom.selectionStart = sliceStart;
				activeDom.selectionEnd = sliceEnd;
				activeDom.getRootNode().execCommand("insertText", false, completed.text);

			} else {
				activeDom.value = activeDom.value.substr(0, sliceStart)
					+ completed.text
					+ activeDom.value.substr(sliceEnd);
			}

			activeDom.selectionStart = activeDom.selectionEnd = selectionStart - triggerLength + completed.caretIndex;
			completionAPI.finishCompletion();
		}

		function getCaretCoordinates() {
			const baseCoords = activeDom.getBoundingClientRect();
			const domDocument = activeDom.getRootNode();
			const domWindow = domDocument.defaultView;
			const caretCoords = getBaseCaretCoordinates(activeDom, selectionStart);
			const domScroll = {left: -activeDom.scrollLeft, top: -activeDom.scrollTop};
			const containingIframe = getContainingIframe(activeDom);
			const iframeCoords = getIframeOffset(containingIframe);
			const parentWindowCoords = containingIframe
				? {left: containingIframe.ownerDocument.defaultView.scrollX, top: containingIframe.ownerDocument.defaultView.scrollY}
				: {left: 0, top: 0};

			const totalCoords = sumCoords([baseCoords, caretCoords, iframeCoords, parentWindowCoords, domScroll]);

			return {
				left: totalCoords.left + domWindow.scrollX,
				top:  totalCoords.top  + domWindow.scrollY + caretCoords.height
			}
		}

		function sumCoords(coords) {
			const totalCoords = {left: 0, top: 0};
			for(const coord of coords) {
				totalCoords.left += coord.left;
				totalCoords.top += coord.top;
			}

			return totalCoords;
		}

		function getContainingIframe(dom) {
			const root = dom.getRootNode();

			if (root !== document) {
				const parentDocument = root.defaultView.parent.document;
				const iframes = parentDocument.querySelectorAll('iframe');
				for (var i = 0; i < iframes.length; i++) {
					const iframe = iframes[i];

					if (iframe.contentDocument !== root) {
						continue;
					}

					return iframe;;
				}
			}

			return null;
		}

		function getIframeOffset(containingIframe) {
			return containingIframe
				? containingIframe.getBoundingClientRect()
				: {top: 0, left: 0};
		}
	}
})();
