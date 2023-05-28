/*\
title: $:/plugins/EvidentlyCube/AutoCloseTags/closer.js
type: application/javascript
module-type: library
\*/

(function () {

	/*jslint node: true, browser: true */
	/*global $tw: false */
	"use strict";

	var Closer = function (editWidget, areaNode) {
		// Only hook for tiddler's body input
		if (editWidget.attributes.field !== 'text') {
			return;
		}

		// About underlying Widget
		this._areaNode = areaNode;
		this._tryToComplete = false;

		// Listen to the Keyboard
		$tw.utils.addEventListeners(this._areaNode, [
			{ name: "keydown", handlerObject: this, handlerMethod: "handleKeyDown" },
			{ name: "input", handlerObject: this, handlerMethod: "handleInput" },
		]);
	};

	function isWhitespace(char) {
		return char === ' ' || char === "\t" || char === "\n" || char === "\r";
	}

	function isTripleQuote(text, curPos) {
		if (curPos < 3) {
			return false;
		}

		return text.charAt(curPos) === '"'
			&& text.charAt(curPos - 1) === '"'
			&& text.charAt(curPos - 2) === '"';
	}

	Closer.prototype.handleKeyDown = function (event) {
		this._tryToComplete = event.keyCode === '>'.charCodeAt(0) || event.key === '>';
	}

	Closer.prototype.handleInput = function (event) {
		var curPos = this._areaNode.selectionStart;  // cursor position
		var inputText = this._areaNode.value;   // text in the area

		if (!this._tryToComplete) {
			return;
		}

		this._tryToComplete = false;

		var isFirstCharacter = true;
		var wasLastWhitespace = false;
		var braceDepth = 1;
		var insideTripleQuote = false;
		var insideSingleQuote = false;
		var insideDoubleQuote = false;
		var startedWithDoubleBrace = false;
		for (var i = curPos - 2; i >= 0; i--) {
			var char = inputText.charAt(i);

			if (isWhitespace(char)) {
				wasLastWhitespace = true;
				// Skip whitespaces
				continue;
			}

			if (insideTripleQuote && !isTripleQuote(inputText, i)) {
				continue;
			} else if (insideDoubleQuote && char !== '"') {
				continue;
			} else if (insideSingleQuote && char !== "'") {
				continue;
			} else if (insideSingleQuote || insideDoubleQuote || insideTripleQuote) {
				insideSingleQuote = false;
				insideDoubleQuote = false;
				insideTripleQuote = false;
				continue;
			}

			if (char === "'") {
				insideSingleQuote = true;
				continue;
			} else if (char === '"') {
				if (isTripleQuote(inputText, i)) {
					insideTripleQuote = true;
					i -= 2;
					continue;
				}

				insideDoubleQuote = true;
				continue;
			}

			if (char === '/' && isFirstCharacter) {
				isFirstCharacter = false;
				// Self-closed tag, skip
				break;
			} else if (char === '/' && i > 0 && inputText.charAt(i - 1) === '<') {
				isFirstCharacter = false;
				// Found some other tag that's being closed, which means we totally should not be closing right now
				break;
			} else if (isFirstCharacter && char === '>') {
				startedWithDoubleBrace = true;
			}

			isFirstCharacter = false;

			if (char === '>') {
				braceDepth++;
			} else if (char === '<') {
				braceDepth--;
			}

			if (braceDepth === 0) {
				var wordLength = inputText.slice(i + 1, curPos).search(/[^$a-zA-Z0-9_]+/);
				var word = inputText.substr(i + 1, wordLength !== -1 ? wordLength : curPos - 1 - 1);
				// Handle closing <<>> structure
				if (i > 0 && inputText.charAt(i - 1) === '<') {
					break;
				} else if (startedWithDoubleBrace && inputText.charAt(i + 1) === '<') {
					break;
				}

				var wordLowercase = word.toLowerCase();
				// Do not trigger for empty tags
				if (word.length === 0) {
					break;
				// void elements don't need to be closed
				} else if (wordLowercase === 'br' || wordLowercase === 'input' || wordLowercase === 'hr' || wordLowercase === 'img') {
					break;
				}

				var toInsert = '</' + word + '>';

				this._areaNode.focus();
				this._areaNode.selectionStart = curPos;
				this._areaNode.selectionEnd = curPos;

				this._areaNode.ownerDocument.execCommand('insertText', false, toInsert);
				this._areaNode.selectionStart = this._areaNode.selectionEnd = curPos;
				break;
			}
		}
	};

	exports.Closer = Closer;

})();


