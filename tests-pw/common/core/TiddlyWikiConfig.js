import fs from 'fs';
import {sep, resolve} from 'path';
import { TiddlerStore } from './TiddlerStore';

export class TiddlyWikiConfig {
	/**
	 * @param {import("@playwright/test").Page} page
	 * @param {TiddlerStore} store
	 */
	constructor(page, store) {
		this.page = page;
		this.store = store;
	}

	forPage(page) {
		return new TiddlyWikiConfig(page, this.store.forPage(page));
	}

	async useFramedEditor(bool) {
		this.store.updateTiddler('$:/config/TextEditor/EnableToolbar', {text: bool ? 'yes' : 'no'}, true);
	}
}