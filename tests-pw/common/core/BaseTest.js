// @ts-check
import * as base from '@playwright/test';
import { EditionSelector } from './EditionSelector';
import { TiddlyWikiUi } from '../ui/TiddlyWikiUi';
import { TiddlerStore } from './TiddlerStore';
import { TiddlyWikiConfig } from './TiddlyWikiConfig';
import { pageRegisterConsoleLogger } from '../utils/PageUtils';

// --------------------
//     NOTES.md#002
// --------------------

/**
 * @typedef {object} TiddlyWikiTestFixtures
 * @property {TiddlerStore} store
 * @property {TiddlyWikiConfig} twConfig
 * @property {EditionSelector} selectEdition
 * @property {TiddlyWikiUi} ui
 */

/** @type {base.Fixtures<TiddlyWikiTestFixtures, {}, base.PlaywrightTestArgs, base.PlaywrightWorkerArgs>} */
export const baseTestFixtures = {
	page: async ({ page }, use, testInfo) => {
		const getConsoleLogs = pageRegisterConsoleLogger(page);

		await use(page);

		if (testInfo.errors.length > 0) {
			await testInfo.attach('Console Logs', {
				body: getConsoleLogs().map(messageToString).join('\n\n'),
				contentType: 'text/plain',
			});
		}
	},
	store: async ({ page }, use) => {
		await use(new TiddlerStore(page));
	},
	twConfig: async ({ page, store }, use) => {
		await use(new TiddlyWikiConfig(page, store));
	},
	selectEdition: async ({ page }, use) => {
		await use(new EditionSelector(page));
	},
	ui: async ({ page }, use) => {
		await use(new TiddlyWikiUi(page));
	}
};

/**
 * @param {import('../utils/PageUtils').PageConsoleMessage} data
 * @returns {string}
 */
function messageToString(data) {
	const { pageId, message } = data;

	if (message) {
		return `<Page#${pageId}> [${message.type()}] ${message.location().url}#${message.location().lineNumber}:${message.location().columnNumber}\n${message.text()}`;
	} else {
		return `<Page#${pageId}> Page Opened`;
	}
}

export const baseTest = base.test.extend(baseTestFixtures);
