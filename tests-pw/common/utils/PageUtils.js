// @ts-check

import test from "playwright/test";

/**
 * @typedef {Object} PageConsoleMessage
 * @property {number} pageId
 * @property {import("@playwright/test").ConsoleMessage} [message]
 */

/**
 * Calls a function that contains page interactions that should lead to a new page being open.
 * It then returns the newly opened page.
 *
 * @param {import("playwright/test").Page} sourcePage
 * @param {function():Promise<void>} interactionCallback
 * @returns {Promise<import("playwright/test").Page>}
 */
export async function getNewPage(sourcePage, interactionCallback) {
	return await test.step('Attempting to extract new page that is supposed to open', async () => {
		const waitForPagePromise = sourcePage.context().waitForEvent('page');

		await interactionCallback();

		const newPage = await waitForPagePromise;
		await newPage.waitForLoadState();

		return newPage;
	});
}

/**
 * Calls a function that contains page interactions that should lead to a new page being open.
 * It then returns the newly opened page.
 *
 * @param {import("playwright/test").Page} page
 * @returns {() => PageConsoleMessage[]}
 */
export function pageRegisterConsoleLogger(page) {
	/**
	 * @type {PageConsoleMessage[]}
	 */
	const logs = [{ pageId: 0 }];

	page.on('console', message => {
		logs.push({ pageId: 0, message });
	});

	let pageCounter = 1;
	page.context().on('page', newPage => {
		const pageId = pageCounter++;

		logs.push({ pageId });

		newPage.on('console', message => {
			logs.push({ pageId, message });
		});
	})

	return () => logs;
}