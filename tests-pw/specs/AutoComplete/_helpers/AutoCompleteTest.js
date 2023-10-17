// @ts-check
import * as base from '@playwright/test';
import { baseTestFixtures } from '../../../common/core/BaseTest';
import { AutoCompleteFixtures } from '../_fixtures/AutoCompleteFixtures';
import { AutoCompleteUi } from '../_ui/AutoCompleteUi';
import { AutoCompleteUtils } from './AutoCompleteUtils';

// --------------------
//     NOTES.md#002
// --------------------

/**
 * @typedef {import('../../../common/core/BaseTest').TiddlyWikiTestFixtures} TiddlyWikiTestFixtures
 * @typedef {object} AutoCompleteTest
 * @property {AutoCompleteFixtures} fixtures
 * @property {AutoCompleteUi} pluginUi
 * @property {AutoCompleteUtils} pluginUtils
 */

/** @type {base.Fixtures<AutoCompleteTest & TiddlyWikiTestFixtures, {}, base.PlaywrightTestArgs, base.PlaywrightWorkerArgs>} */
const autoCompleteTestFixtures = {
	...baseTestFixtures,

	// eslint-disable-next-line no-empty-pattern
	fixtures: async ({}, use) => {
		await use(new AutoCompleteFixtures());
	},

	pluginUi: async ({page}, use) => {
		await use(new AutoCompleteUi(page));
	},

	pluginUtils: async ({store}, use) => {
		await use(new AutoCompleteUtils(store.page, store));
	}
};

export const autoCompleteTest = base.test.extend(autoCompleteTestFixtures);
