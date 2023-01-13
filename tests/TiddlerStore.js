const fs = require('fs');
const path = require('path');
const sep = path.sep;

export const TiddlerStore = {
	/**
	 * @param {import("@playwright/test").Page} page
	 * @param {string} tag
	 */
	async deleteTiddlersByTag(page, tag) {
		await page.evaluate(tag => {
			$tw.wiki.getTiddlersWithTag(tag).forEach(title => $tw.wiki.deleteTiddler(title));
		}, tag);
	},

	async loadFixture(page, fixtureName) {
		const fixturePath = path.resolve(`${__dirname}${sep}fixtures${sep}${fixtureName}`);
		if (!fs.existsSync(fixturePath)) {
			throw new Error(`Failed to find fixture '${fixtureName} (looked at path '${fixturePath}')`);
		}

		const json = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
		return page.evaluate(json => {
			$tw.wiki.addTiddler(new $tw.Tiddler(json));
		}, json);
	}
}