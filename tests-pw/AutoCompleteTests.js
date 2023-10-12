import { TiddlerStore } from './common/core/TiddlerStore';

export const AutoCompleteTests = {
	/**
	 * @param {import('@playwright/test').Page} page
	 */
	async initEnvironment(page) {
		await TiddlerStore.deleteTiddlersByTag(page, '$:/tags/EC/AutoComplete/Trigger');
		await TiddlerStore.loadFixture(page, 'AutoComplete/trigger.json')
	},

	/**
	 * @param {import('@playwright/test').Page} page
	 */
	async addTrigger(page, ) {

	}
}