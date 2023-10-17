// @ts-check


/**
 * Handy function to change certain configuration options in TiddlyWiki without having to pass
 * tiddler names.
 */
export class TiddlyWikiConfig {
	/**
	 * @param {import('playwright/test').Page} page
	 * @param {import('./TiddlerStore').TiddlerStore} store
	 */
	constructor(page, store) {
		this.page = page;
		this.store = store;
	}

	/**
	 * Created a configurator for another page object.
	 * @param {import('playwright/test').Page} page
	 * @returns TiddlyWikiConfig
	 */
	forPage(page) {
		return new TiddlyWikiConfig(page, this.store.forPage(page));
	}

	/**
	 * Controls whether framed editor is used or not.
	 * @param {boolean} bool
	 */
	async useFramedEditor(bool) {
		return this.store.updateTiddler('$:/config/TextEditor/EnableToolbar', {text: bool ? 'yes' : 'no'}, true);
	}

	/**
	 * Controls whether Code Mirror's Auto Close Tags plugin is active
	 * @param {boolean} bool
	 */
	async codeMirrorAutoCloseTags(bool) {
		return this.store.updateTiddler('$:/config/codemirror/autoCloseTags', {text: bool ? 'true' : 'false'}, true);
	}
}