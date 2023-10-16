export class ViewTiddlerUi {
	/**
	 * @param {import("@playwright/test").Page} page
	 * @param {string} page
	 */
	constructor(page, title) {
		this.page = page;
		this.title = title;
	}

	get #selfPrefix() {
		return `.tc-tiddler-view-frame[data-tiddler-title="${this.title}"]`;
	}

	get self() {
		return this.page.locator(this.#selfPrefix);
	}

	get bodyDiv() {
		return this.self.locator('.tc-tiddler-body');
	}

	get closeButton() {
		return this.self.locator('.tc-titlebar button[class*="close"]');
	}

	get editButton() {
		return this.self.locator('.tc-titlebar button[class*="edit"]');
	}

	get moreActionsButton() {
		return this.self.locator('.tc-titlebar button[class*="more-tiddler-actions"]');
	}

	get openInNewWindowButton() {
		return this.self.locator('.tc-titlebar button[class*="open-window"]');
	}

}