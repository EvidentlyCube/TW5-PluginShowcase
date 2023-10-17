// @ts-check

/**
 * @typedef {object} TiddlerStoreFixture
 * @property {string} title
 */

/**
 * Class for interacting with browser's Tiddler storage, much faster than the UI.
 */
export class TiddlerStore {
	/**
	 * @param {import("@playwright/test").Page} page
	 */
	constructor(page) {
		this.page = page;
	}

	/**
	 * Create a store for a different page object
	 * @param {import("playwright-core").Page} page
	 * @returns {TiddlerStore}
	 */
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

	/**
	 * Adds a given fixture as a tiddler. It must be a JS object with at least one field called `title`.
	 *n
	 * @param {TiddlerStoreFixture} fixture
	 * @returns {Promise<string>} Title of the loaded fixture
	 */
	async loadFixture(fixture) {
		if (!fixture) {
			throw new Error("Attempted to load fixture but none was given");

		} else if (typeof fixture !== 'object') {
			throw new Error(`Attempted to load fixture but it was of type '${typeof fixture}' rather than 'object'`);

		} else if (!fixture.title) {
			throw new Error("Attempted to load fixture but it did not have a `title` field");
		}

		await this.loadFixtures([fixture]);

		return fixture.title;
	}

	/**
	 * Adds multiple fixtures as a tiddler. It will graciously handle all errors.
	 *
	 * @see loadFixture
	 * @param {TiddlerStoreFixture[]} fixtures
	 * @returns {Promise<string[]>} Titles of the loaded fixtures.
	 */
	async loadFixtures(fixtures) {
		fixtures = Array.isArray(fixtures) ? fixtures : [fixtures];

		this.page.evaluate(fixtures => {
			for (const fixture of fixtures) {
				if (!fixture || typeof fixture !== 'object' || !fixture.title) {
					continue;
				}

				$tw.wiki.addTiddler(new $tw.Tiddler(fixture));
			}
		}, fixtures);

		return fixtures.map(fixture => fixture.title);
	}

	/**
	 * Updates fields of an existing tiddler, optionally creating it if it doesn't exist.
	 *
	 * @param {string} title
	 * @param {Object.<string, any>} fields
	 * @param {boolean} allowCreate
	 * @returns {Promise<void>}
	 */
	async updateTiddler(title, fields, allowCreate = false) {
		await this.page.evaluate(({title, fields, allowCreate}) => {
			const tiddler = $tw.wiki.getTiddler(title)
				?? (allowCreate ? new $tw.Tiddler({title}, fields) : false);

			if (!tiddler) {
				throw new Error(`Unable to update tiddler '${title}' because it does not exist`);
			}

			$tw.wiki.addTiddler(new $tw.Tiddler(tiddler, fields));

		}, {title, fields, allowCreate});
	}
}