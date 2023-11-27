/*\
title: $:/plugins/EvidentlyCube/ExtraOperators/timestamp-manip.js
type: application/javascript
module-type: filteroperator

Smart search

\*/
(function (require) {

	/*jslint node: true, browser: true */
	/*global $tw: false */
	"use strict";

	function parseManipulation(date, operator, operand) {
		switch(operator) {
			case 'second':
				date.setSeconds(date.getSeconds() + parseInt(operand));
				break;
			case 'set-second':
				date.setSeconds(parseInt(operand));
				break;
			case 'minute':
				date.setMinutes(date.getMinutes() + parseInt(operand));
				break;
			case 'set-minute':
				date.setMinutes(parseInt(operand));
				break;
			case 'hour':
				date.setHours(date.getHours() + parseInt(operand));
				break;
			case 'set-hour':
				date.setHours(parseInt(operand));
				break;
			case 'day':
				date.setDays(date.getDays() + parseInt(operand));
				break;
			case 'set-day':
				date.setDays(parseInt(operand));
				break;
			case 'month':
				date.setMonth(date.getMonth() + parseInt(operand));
				break;
			case 'set-month':
				date.setMonth(parseInt(operand));
				break;
			case 'year':
				date.setFullYear(date.getFullYear() + parseInt(operand));
				break;
			case 'set-year':
				date.setFullYear(parseInt(operand));
				break;
			case 'set-weekday':
				date.setDays(date.getDay() - parseInt(operand));
				break;
		}
	}

	exports['timestamp-manip'] = function (source, operator) {
		const output = [];

		console.log(operator);

		source(function (tiddler, title) {
			if (operator.operands.length !== 2) {
				output.push(title);
				return;
			}

		});

		return output;
	};
})(typeof global !== 'undefined' ? global.testRequire : require);
