// @ts-check

import test from "playwright/test";

/**
 * Calls a function that contains page interactions that should lead to a new page being open.
 * It then returns the newly opened page.
 *
 * @param {import("playwright/test").Page} page
 * @param {function():Promise<void>} interactionCallback
 * @returns {Promise<import("playwright/test").Page>}
 */
export async function getNewPage(page, interactionCallback) {
	return await test.step('Attempting to extract new page that is supposed to open', async () => {
		const waitForPagePromise = page.context().waitForEvent('page');

		await interactionCallback();

		const newPage = await waitForPagePromise;
		await newPage.waitForLoadState();

		return newPage;
	});
}