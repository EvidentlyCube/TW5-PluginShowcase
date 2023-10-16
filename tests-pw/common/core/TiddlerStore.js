import fs from 'fs';
import {sep, resolve} from 'path';

export class TiddlerStore {
	/**
	 * @param {import("@playwright/test").Page} page
	 */
	constructor(page) {
		this.page = page;
	}

	forPage(page) {
		return new TiddlerStore(page);
	}

	/**
	 * @param {string} tag
	 */
	async deleteTiddlersByTag(tag) {
		await this.page.evaluate(tag => {
			$tw.wiki.getTiddlersWithTag(tag)
				.forEach(title => $tw.wiki.deleteTiddler(title));
		}, tag);
	}

	async loadFixture(fixture) {
		await this.loadFixtures([fixture]);

		return fixture.title;
	}

	async loadFixtures(fixtures) {
		fixtures = Array.isArray(fixtures) ? fixtures : [fixtures];

		this.page.evaluate(fixtures => {
			for (const fixture of fixtures) {
				if (!fixture) {
					continue;
				}

				$tw.wiki.addTiddler(new $tw.Tiddler(fixture));
			}
		}, fixtures);

		return fixtures.map(fixture => fixture.title);
	}

	async updateTiddler(title, fields, allowCreate = false) {
		return this.page.evaluate(({title, fields, allowCreate}) => {
			const tiddler = $tw.wiki.getTiddler(title)
				?? (allowCreate ? new $tw.Tiddler({title}, fields) : false);

			if (!tiddler) {
				throw new Error(`Unable to update tiddler '${title}' because it does not exist`);
			}

			$tw.wiki.addTiddler(new $tw.Tiddler(tiddler, fields));

		}, {title, fields, allowCreate});
	}
}