import { test as baseTest } from '../../../common/core/Test';
import { AutoCompleteFixtures } from '../_fixtures/AutoCompleteFixtures';
import { AutoCompleteUi } from '../_ui/AutoCompleteUi';
import { AutoCompleteUtils } from './AutoCompleteUtils';

export const test = baseTest.extend({
	fixtures: async ({ }, use) => {
		await use(new AutoCompleteFixtures());
	},

	pluginUi: async ({ page }, use) => {
		await use(new AutoCompleteUi(page));
	},

	pluginUtils: async ({ store, ui }, use) => {
		await use(new AutoCompleteUtils(store, ui));
	}
});
