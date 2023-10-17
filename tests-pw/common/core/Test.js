import { test as baseTest } from '@playwright/test';
import { EditionSelector } from './EditionSelector';
import { TiddlyWikiUi } from '../ui/TiddlyWikiUi';
import { TiddlerStore } from './TiddlerStore';
import { TiddlyWikiConfig } from './TiddlyWikiConfig';

export const test = baseTest.extend({
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
});
