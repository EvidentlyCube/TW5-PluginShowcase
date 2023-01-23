/*\
title: $:/plugins/EvidentlyCube/Discloser/publisher.js
type: application/javascript
module-type: global

Module for doing the actual publishing

\*/
(function() {

	/*jslint node: true, browser: true */
	/*global $tw: false */
	"use strict";

	if (!$tw.node) {
		return;
	}

	const fs = require('fs');
	const filterTiddlersWithVars = require('$:/plugins/EvidentlyCube/Discloser/common.js').filterTiddlersWithVars;

	const process = require('process');

	exports.EvidentlyCubeDiscloser_PublishCollections = function(collectionTitles) {
		const affectedDiscloserTiddlers = new Set();
		const allErrors = [];

		console.log("Publishing", collectionTitles);
		$tw.utils.each(collectionTitles, function(collectionTitle) {
			const {published, errors} = publishCollection(collectionTitle);

			$tw.utils.each(published, function(title) {
				affectedDiscloserTiddlers.add(title);
			})
			allErrors.push(errors);
		});

		console.log(allErrors);
		return Array.from(affectedDiscloserTiddlers);
	}

	function publishCollection(collectionTitle) {
		console.log("Publishing One", collectionTitle);
		const collection = $tw.wiki.getTiddler(collectionTitle);

		const result = {
			published: [],
			errors: [],
			data: []
		};
		if (!collection) {
			result.errors.push(`Failed to find collection '${collectionTitle}'.`);
			return result;

		} else if (!collection.fields.id) {
			result.errors.push(`Collection tiddler '${collectionTitle}' has no ID and couldn't be published.`);
			return result;

		} else if (!collection.fields.tags || collection.fields.tags.indexOf('$:/tags/EC/Discloser/Collection') === -1) {
			result.errors.push(`Collection tiddler '${collectionTitle}' doesn't have the required tag '$:/tags/EC/Discloser/Collection' and couldn't be published.`);
			return result;
		}

		const template = '$:/core/templates/static.tiddler.html';
		const collectionId = collection.fields.id;
		const linkTitles = getValidLinks(collectionTitle);
		const linkToTiddlerMap = generateLinkToTiddlerTitleMap(linkTitles);
		const titleToSlugMap = generateSlugifiedTitleMap(Array.from(linkToTiddlerMap.values()));

		result.published.push(collectionTitle);

		$tw.utils.each(linkTitles, function(linkTitle) {
			const link = $tw.wiki.getTiddler(linkTitle);
			const linkedTiddler = $tw.wiki.getTiddler(link.fields.tiddler);

			if (!linkedTiddler) {
				result.errors.push(`Link '${linkTitle}' link to non-existent tiddler ${link.fields.tiddler}`);
				return;
			}

			result.published.push(linkTitle);

			const slugifiedTitle = titleToSlugMap.get(link.fields.tiddler);
			const finalPath = `output/${collectionId}/${slugifiedTitle}.html`;
			const html = renderTiddler(link.fields.tiddler, template);

			$tw.utils.createFileDirectories(finalPath);
			console.log("writing " + finalPath)
			fs.writeFileSync(finalPath, html, "utf8");
		});

		return result;
	}

	function renderTiddler(title, template) {
		var variables = $tw.utils.extend({}, {currentTiddler: title,storyTiddler: title});
		var parser = $tw.wiki.parseTiddler(template || title);
		var widgetNode = $tw.wiki.makeWidget(parser, {variables: variables});
		var container = $tw.fakeDocument.createElement("div");
		widgetNode.render(container,null);

		return container.innerHTML;
	}

	function getValidLinks(collectionTitle) {
		return filterTiddlersWithVars("[all[tiddlers]tag[$:/tags/EC/Discloser/Link]field:collection<collectionTitle>] :filter[get[tiddler]is[tiddler]]", {
			collectionTitle: collectionTitle
		});
	}

	function generateLinkToTiddlerTitleMap(linkTitles) {
		const map = new Map();

		$tw.utils.each(linkTitles, function(linkTitle) {
			const link = $tw.wiki.getTiddler(linkTitle);

			map.set(linkTitle, link.fields.tiddler);
		});

		return map;
	}

	function generateSlugifiedTitleMap(titles) {
		const usedTitles = new Set();
		const map = new Map();

		$tw.utils.each(titles, function(title) {
			const baseSlugified = slugifyTitle(title);
			let slugified = baseSlugified;
			let counter = 0;

			while (usedTitles.has(slugified)) {
				counter++;
				slugified = `${baseSlugified}-${counter}`;
			}

			map.set(title, slugified);
			usedTitles.add(slugified);
		});

		return map;
	}

	function slugifyTitle(title) {
		return title
			.toLowerCase()
			.replace(/^[^a-z0-9]+/, '')
			.replace(/[^a-z0-9]+$/, '')
			.replace(/[^a-z0-9]+/g, '-');
	}
}());
