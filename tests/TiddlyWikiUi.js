import { PageUtils } from "./PageUtils";

export const TiddlyWikiUi = {
	/**
	 * @param {import("@playwright/test").Page} page
	 * @param {string} tag
	 */
	async newTiddler_click(page) {
		const oldTitles = await PageUtils.getAttributesFromSelector(page, '.tc-tiddler-edit-frame', 'data-tiddler-title');
		await page.click('[class^="tc-btn-%24%3A%2Fcore%2Fui%2FButtons%2Fnew-tiddler"]');
		const newTitles = await PageUtils.getAttributesFromSelector(page, '.tc-tiddler-edit-frame', 'data-tiddler-title');
		console.log(oldTitles);
		console.log(newTitles);
	}
}