/*\
title: $:/plugins/EvidentlyCube/MiddleClickActions/middle-click-actions.js
type: application/javascript
module-type: widget

\*/


(function() {

	/*jslint node: true, browser: true */
	/*global $tw: false */
	"use strict";

	var Widget = require("$:/core/modules/widgets/widget.js").widget;

	var MiddleClickActionsWidget = function(parseTreeNode,options) {
		this.initialise(parseTreeNode,options);
	};

	/*
	Inherit from the base widget class
	*/
	MiddleClickActionsWidget.prototype = new Widget();


	/*
	Render this widget into the DOM
	*/
	MiddleClickActionsWidget.prototype.render = function(parent,nextSibling) {
		var self = this;
		this.parentDomNode = parent;
		this.computeAttributes();
		this.execute();
		parent.addEventListener("mousedown",function (event) {
			if (event.button === 1) {
				event.preventDefault();
				event.stopPropagation();
				self.invokeActions(self, event);
			}
		},false)
		this.renderChildren(parent,nextSibling);
	};

	MiddleClickActionsWidget.prototype.allowActionPropagation = function() {
		return false;
	};

	exports["middle-click-actions"] = MiddleClickActionsWidget;

})();