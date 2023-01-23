/*\
title: $:/plugins/EvidentlyCube/Discloser/index.js
type: application/javascript
module-type: indexer

\*/

(function () {

    /*jslint node: true, browser: true */
    /*global modules: false */
    "use strict";

    if ($tw.node) {
		return;
	}

    function DiscloserIndex(wiki) {
        this.wiki = wiki;
    }

    DiscloserIndex.prototype.init = function () {
        this.index = null;

        this.tiddlerToLinksMap = new Map();
        this.touchedCollections = new Set();
    }

    DiscloserIndex.prototype.rebuild = function () {
        var self = this;
        var links = $tw.wiki.getTiddlersWithTag("$:/discloser/Link");

        this.tiddlerToLinksMap.clear();

        $tw.utils.each(links, function (title) {
            var tiddler = $tw.wiki.getTiddler(title);
            if (!tiddler || tiddler.isDraft() || !tiddler.fields.tiddler) {
                return;
            }

            var links = self.tiddlerToLinksMap.get(tiddler.fields.tiddler) || [];
            links.push(title);
            self.tiddlerToLinksMap.set(tiddler.fields.tiddler, links);
        });
    }

    DiscloserIndex.prototype.update = function (updateDescriptor) {
        const oldTiddler = updateDescriptor.old.tiddler;
        const newTiddler = updateDescriptor.new.tiddler;

        var isOldLink = this.isValidLink(oldTiddler);
        var isNewLink = this.isValidLink(newTiddler);
        if (isOldLink && isNewLink) {
            if (
                oldTiddler.link !== newTiddler.link
                || oldTiddler.fields.collection !== newTiddler.fields.collection
            ) {
                this.linkRemove(oldTiddler);
                this.linkAdd(newTiddler);
            }
        } else if (isOldLink) {
            this.linkRemove(oldTiddler);
        } else if (isNewLink) {
            this.linkAdd(newTiddler);
        }

        this.tryTouchingTiddler(oldTiddler);
        this.tryTouchingTiddler(newTiddler);
    };

    DiscloserIndex.prototype.isValidLink = function(tiddler) {
        return tiddler
            // Must have appropriate link tag
            && tiddler.fields.tags
            && tiddler.fields.tags.indexOf('$:/discloser/Link') !== -1
            // And must link to something (even if this something doesn't exist, it may exist later)
            && tiddler.fields.tiddler;
    }

    DiscloserIndex.prototype.linkRemove = function(tiddler) {
        const linkedTiddler = tiddler.fields.tiddler;
        const links = this.tiddlerToLinksMap.get(linkedTiddler) || [];
        this.fastRemoveFromArray(links, tiddler.fields.title);

        if (links.length === 0) {
            this.tiddlerToLinksMap.delete(linkedTiddler);
        } else {
            this.tiddlerToLinksMap.set(linkedTiddler, links);
        }

        if (tiddler.fields.collection) {
            this.touchedCollections.add(tiddler.fields.collection);
        }
    };

    DiscloserIndex.prototype.linkAdd = function(tiddler) {
        const linkedTiddler = tiddler.fields.tiddler;
        const links = this.tiddlerToLinksMap.get(linkedTiddler) || [];
        links.push(tiddler.fields.title);
        this.tiddlerToLinksMap.set(linkedTiddler, links);

        if (tiddler.fields.collection) {
            this.touchedCollections.add(tiddler.fields.collection);
        }
    };

    DiscloserIndex.prototype.tryTouchingTiddler = function(tiddler) {
        if (!tiddler) {
            return;
        }

        const links = this.tiddlerToLinksMap.get(tiddler.fields.title);
        if (links) {
            for (let i = 0; i < links.length; i++) {
                const linkTiddler = $tw.wiki.getTiddler(tiddler);
                if (linkTiddler && linkTiddler.fields.collection) {
                    this.touchedCollections.add(tiddler.fields.collection);
                }
            }

            console.log(this.touchedCollections);
        }
    }

    DiscloserIndex.prototype.fastRemoveFromArray = function(array, value) {
        const index = array.indexOf(value);
        if (index !== -1) {
            array[index] = array[array.length - 1];
            array.length--;
        }
    }

    exports.DiscloserIndex = DiscloserIndex;
})();