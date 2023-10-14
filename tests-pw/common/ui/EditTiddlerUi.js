export class EditTiddlerUi {
	/**
	 * @param {import("@playwright/test").Page} page
	 * @param {string} page
	 */
	constructor(page, title) {
		this.page = page;
		this.title = title;
	}

	get #selfPrefix() {
		return `.tc-tiddler-edit-frame[data-tiddler-title="Draft of 'New Tiddler'"]`;
	}

	get self() {
		return this.page.locator(this.#selfPrefix);
	}

	get unframedBodyTextArea() {
		return this.self.locator('.tc-edit-texteditor-body');
	}
}