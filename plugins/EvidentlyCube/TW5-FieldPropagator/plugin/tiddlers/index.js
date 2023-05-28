/*\
title: $:/plugins/EvidentlyCube/FieldPropagator/index.js
type: application/javascript
module-type: indexer

\*/

(function () {

	/*jslint node: true, browser: true */
	/*global modules: false */
	"use strict";

	var isRebuilding = false;

	function PropagatorIndexer(wiki) {
		this.wiki = wiki;
	}

	PropagatorIndexer.prototype.init = function () {
		this.index = null;

		this.childrenMap = new Map();
		this.parents = null;
		this.trackedFields = null;
		this.queuedToRebuild = [];
	}

	PropagatorIndexer.prototype.rebuild = function () {
		var self = this;
		this.parents = $tw.wiki.getTiddlersWithTag("$:/tags/Propagator");
		this.trackedFields = [];
		this.childrenMap.clear();

		$tw.wiki.forEachTiddler(function (title, tiddler) {
			if (tiddler.isDraft()) {
				return;
			}

			var parent = tiddler.fields.parent;
			if (parent) {
				if (!self.childrenMap.has(parent)) {
					self.childrenMap.set(parent, new Set());
				}
				self.childrenMap.get(parent).add(tiddler.fields.title);
			}
		});

		this.parents.forEach(function (title) {
			var parent = $tw.wiki.getTiddler(title);
			var baseField = parent.fields['propagator-base'];

			if (baseField && self.trackedFields.indexOf(baseField) === -1) {
				self.trackedFields.push(baseField);
			}
		});

		this.queuedToRebuild = this.parents.concat();
		this.rebuildRoots();
	}

	PropagatorIndexer.prototype.update = function (updateDescriptor) {
		if (isRebuilding) {
			return;
		}

		// Ignore shadow tiddlers and drafts
		if (updateDescriptor.old.shadow || updateDescriptor.new.shadow) {
			return;
		} else if (
			(updateDescriptor.old.tiddler && updateDescriptor.old.tiddler.isDraft())
			|| (updateDescriptor.new.tiddler && updateDescriptor.new.tiddler.isDraft())
		) {
			return;
		}

		this.removeFromIndex(updateDescriptor.old.tiddler);
		this.addToIndex(updateDescriptor.new.tiddler);

		if (updateDescriptor.old.exists !== updateDescriptor.new.exists) {
			this.queueRoot(this.findRoot(updateDescriptor.old.tiddler));
			this.queueRoot(this.findRoot(updateDescriptor.new.tiddler));
		} else if (updateDescriptor.old.parent !== updateDescriptor.new.parent) {
			this.queueRoot(this.findRoot(updateDescriptor.old.tiddler));
			this.queueRoot(this.findRoot(updateDescriptor.new.tiddler));
		} else {
			const isChanged = this.trackedFields.find(function (field) {
				return updateDescriptor.old.tiddler.fields[field] !== updateDescriptor.new.tiddler.fields[field];
			});

			if (isChanged) {
				this.queueRoot(this.findRoot(updateDescriptor.new.tiddler));
			}
		}
	}

	PropagatorIndexer.prototype.removeFromIndex = function (tiddler) {
		if (!tiddler || !tiddler.fields.parent) {
			return;
		}

		var index = this.childrenMap.get(tiddler.fields.parent);
		if (index) {
			index.delete(tiddler.fields.title);
		}
	}

	PropagatorIndexer.prototype.addToIndex = function (tiddler) {
		if (!tiddler || !tiddler.fields.parent) {
			return;
		}

		var index = this.childrenMap.get(tiddler.fields.parent);
		if (!index) {
			index = new Set();
			this.childrenMap.set(tiddler.fields.parent, index);
		}
		index.add(tiddler.fields.title);
	}

	PropagatorIndexer.prototype.queueRoot = function (root) {
		if (root && this.queuedToRebuild.indexOf(root.fields.title) === -1) {
			if (this.queuedToRebuild.length === 0) {
				setTimeout(this.rebuildRoots.bind(this), 1);
			}

			this.queuedToRebuild.push(root.fields.title);
		}
	}

	PropagatorIndexer.prototype.rebuildRoots = function () {
		var self = this;
		isRebuilding = true;

		try {
			this.queuedToRebuild.forEach(function (root) {
				self.rebuildRoot($tw.wiki.getTiddler(root));
			});
		} finally {
			isRebuilding = false;
			this.queuedToRebuild.length = 0;
		}
	}

	PropagatorIndexer.prototype.rebuildRoot = function (root) {
		const baseField = root.fields["propagator-base"];
		const propagatedField = root.fields["propagator-propagated"];
		const preferredValue = root.fields["propagator-preferred-value"];
		const saveQueue = new Map();

		if (baseField === 'title' || propagatedField === 'title') {
			return;
		}

		var index = this.childrenMap.get(root.fields.title);
		if (index) {
			Array.from(index.values()).forEach(childTitle => this.updateChild($tw.wiki.getTiddler(childTitle), baseField, propagatedField, preferredValue, saveQueue));
		}

		Array.from(saveQueue.values()).forEach(tiddler => {
			$tw.wiki.addTiddler(tiddler);
		})
	}

	PropagatorIndexer.prototype.updateChild = function (tiddler, baseField, propagatedField, preferredValue, saveQueue) {
		let targetValue = undefined;

		var index = this.childrenMap.get(tiddler.fields.title);
		if (index) {
			Array.from(index.values()).forEach(childTitle => {
				let result = this.updateChild($tw.wiki.getTiddler(childTitle), baseField, propagatedField, preferredValue, saveQueue);

				if (targetValue === undefined) {
					targetValue = result;
				} else if (result === preferredValue) {
					targetValue = result;
				}
			});
		}

		// Update this tiddler's propagated field based on children's value
		if (targetValue !== tiddler.fields[propagatedField]) {
			console.log(`Updating ${tiddler.fields.title} setting to ${targetValue}`);
			const update = {};
			update[propagatedField] = targetValue;

			const newTiddler = new $tw.Tiddler(saveQueue.get(tiddler.fields.title) || tiddler, update);
			saveQueue.set(tiddler.fields.title, newTiddler);
		}

		// Get the current tiddler's base field's value and use it if there is no propagated value
		// Or the current value is the preferred one (otherwise we'd only look at the ends of
		// the tree for values, rather than whole branches
		const baseValue = tiddler.fields[baseField];
		if (targetValue === undefined || baseValue === preferredValue) {
			return baseValue;
		}

		return targetValue;
	}

	PropagatorIndexer.prototype.findRoot = function (tiddler) {
		if (tiddler && tiddler.isDraft()) {
			return undefined;
		}

		while (tiddler) {
			if (tiddler.hasTag('$:/tags/Propagator')) {
				return tiddler;
			}

			tiddler = $tw.wiki.getTiddler(tiddler.fields.parent);
		}

		return undefined;
	}

	exports.PropagatorIndexer = PropagatorIndexer;
})();