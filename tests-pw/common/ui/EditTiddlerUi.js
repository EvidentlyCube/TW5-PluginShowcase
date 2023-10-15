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

	get framedBodyTextArea() {
		return this.self.frameLocator('iframe.tc-edit-texteditor-body').locator('textarea:not([hidden])');
	}

	get codeMirrorInputDiv() {
		return this.self.locator('.CodeMirror-code');
	}
}