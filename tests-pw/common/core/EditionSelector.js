import { resolve } from 'path';
import { expect } from 'playwright/test';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const docsPath = resolve(__dirname, '..', '..', '..', 'docs');
// Windows requires adding a slash at the start, while Linux already has it baked in
const crossPlatformDocsPath = docsPath.replace(/^\/+/, '');

export class EditionSelector {
	constructor(page) {
		this.page = page;
	}

	tw522 = async page => this.#goto(page, '', '5.2.2');
	tw522CodeMirror = async page => this.#goto(page, '-cm', '5.2.2-CodeMirror');
	tw530 = async page => this.#goto(page, '-530', '5.3.0');
	tw530CodeMirror = async page => this.#goto(page, '-530-cm', '5.3.0-CodeMirror');
	tw531 = async page => this.#goto(page, '-531', '5.3.1');
	tw531CodeMirror = async page => this.#goto(page, '-531-cm', '5.3.1-CodeMirror');
	tw537 = async page => this.#goto(page, '-537', '5.3.7');
	tw537CodeMirror = async page => this.#goto(page, '-537-cm', '5.3.7-CodeMirror');

	initByName = async (name, page) => {
		if (typeof this[name] !== 'function') {
			throw new Error(`Unsupported edition '${name}'`);
		}

		await this[name](page);
	}

	#goto = async (page, suffix, expectedVersion) => {
		page = page ?? this.page;

		await page.goto(`file:///${crossPlatformDocsPath}/index${suffix}.html`);
		await expect(page).toHaveTitle(/Evidently Cube TiddlyWiki5 Plugin Showcase/);
		await expect(page.locator('[data-test-id="tw-edition"]')).toHaveText(expectedVersion, { timeout: 300 });
	};

	static getEditions(codeMirrorFilter) {
		return [
			codeMirrorFilter !== true ? 'tw522' : null,
			codeMirrorFilter !== false ? 'tw522CodeMirror' : null,
			codeMirrorFilter !== true ? 'tw530' : null,
			codeMirrorFilter !== false ? 'tw530CodeMirror' : null,
			codeMirrorFilter !== true ? 'tw531' : null,
			codeMirrorFilter !== false ? 'tw531CodeMirror' : null,
			codeMirrorFilter !== true ? 'tw537' : null,
			codeMirrorFilter !== false ? 'tw537CodeMirror' : null,
		].filter(x => x);
	}
}