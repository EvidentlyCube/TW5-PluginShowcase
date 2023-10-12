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
		return this.loadFixtures([fixture]);
	}

	async loadFixtures(fixtures) {
		fixtures = Array.isArray(fixtures) ? fixtures : [fixtures];

		return this.page.evaluate(fixtures => {
			for (const fixture of fixtures) {
				if (!fixture) {
					continue;
				}

				$tw.wiki.addTiddler(new $tw.Tiddler(fixture));
			}
		}, fixtures);
	}
}