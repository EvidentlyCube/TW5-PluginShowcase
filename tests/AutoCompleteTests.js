import { expect } from '@playwright/test';
import { TiddlerStore } from './TiddlerStore';

const path = require('path')

const sep = path.sep;
const docsPath = path.resolve(`${__dirname}${sep}..${sep}docs${sep}`);
const indexHtmlPath = `${docsPath}${sep}index.html`;
const indexHtmlUrl = `file://${indexHtmlPath}`;

export const AutoCompleteTests = {
	/**
	 * @param {import('@playwright/test').Page} page
	 */
	async initEnvironment(page) {
		await page.goto(indexHtmlUrl);
		await expect(page).toHaveTitle(/Evidently Cube TiddlyWiki5 Plugin Showcase/);
		await TiddlerStore.deleteTiddlersByTag(page, '$:/tags/EC/AutoComplete/Trigger');
		await TiddlerStore.loadFixture(page, 'AutoComplete/trigger.json')
	},

	/**
	 * @param {import('@playwright/test').Page} page
	 */
	async addTrigger(page, ) {

	}
}