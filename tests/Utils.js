import { expect } from '@playwright/test';

const path = require('path')

const sep = path.sep;
const docsPath = path.resolve(`${__dirname}${sep}..${sep}docs${sep}`);
const indexHtmlPath = `${docsPath}${sep}index.html`;
const indexHtmlUrl = `file://${indexHtmlPath}`;

export const Utils = {
	async openTW(page) {
		await page.goto(indexHtmlUrl);
		await expect(page).toHaveTitle(/Evidently Cube TiddlyWiki5 Plugin Showcase/);
	}

}