// @ts-check
import * as base from '@playwright/test';
import { EditionSelector } from './EditionSelector';
import { TiddlyWikiUi } from '../ui/TiddlyWikiUi';
import { TiddlerStore } from './TiddlerStore';
import { TiddlyWikiConfig } from './TiddlyWikiConfig';

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
	store: async({page}, use) => {
		await use(new TiddlerStore(page));
	},
	twConfig: async({page, store}, use) => {
		await use(new TiddlyWikiConfig(page, store));
	},
    selectEdition: async ({page}, use) => {
        await use(new EditionSelector(page));
    },
    ui: async ({page}, use) => {
        await use(new TiddlyWikiUi(page));
    }
};

export const baseTest = base.test.extend(baseTestFixtures);