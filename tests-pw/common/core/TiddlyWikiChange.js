export class TiddlyWikiChange {
	/**
	 * @param {import("@playwright/test").Page} page
	 */
	constructor(page) {
		this.page = page;
	}

	async wait(callback) {
		return new Promise(resolve => {
			callback().then(() => {
				setTimeout(() => {
					// There used to be a fancy mechanism for detecting when TW sends change
					// event but due to race conditions it didn't always work correctly
					// so for now we just wait
					resolve();
				}, 100);
			})
		})
	}

	forPage(page) {
		return new TiddlyWikiChange(page);
	}
}