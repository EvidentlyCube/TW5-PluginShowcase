// @ts-check
import { sep, resolve } from 'path';
import { expect } from 'playwright/test';

const docsPath = resolve(`${process.cwd()}${sep}docs${sep}`);
// Windows requires adding a slash at the start, while Linux already has it baked in
const crossPlatformDocsPath = docsPath.replace(/^\/+/, '');

/**
 * @typedef {object} EditionEntry
 * @property {string} suffix Suffix to add to the `index.html` file
 * @property {string} version Version used for asserting the correct file was loaded
 * @property {boolean} hasCodeMirror Whether this version includes code mirror
 */

/**
 * @type {Object.<string, EditionEntry>}
 */
const SUPPORTED_EDITIONS = {
	tw522: getEdition('', '5.2.2', false),
	tw522CodeMirror: getEdition('-cm', '5.2.2-CodeMirror', true),
	tw530: getEdition('-530', '5.3.0', false),
	tw530CodeMirror: getEdition('-530-cm', '5.3.0-CodeMirror', true),
	tw531: getEdition('-531', '5.3.1', false),
	tw531CodeMirror: getEdition('-531-cm', '5.3.1-CodeMirror', true),
};

/**
 * Selects and initializes a specific version of Tiddly Wiki for testing
 */
export class EditionSelector {
	/**
	 * @param {import('playwright-core').Page} page
	 */
	constructor(page) {
		this.page = page;
	}

	/**
	 * Initializes the given TiddlyWiki edition
	 *
	 * @param {string} editionName
	 * @param {import('playwright-core').Page} [page]
	 * @return {Promise<void>}
	 */
	initByName = async (editionName, page = undefined) => {
		const edition = SUPPORTED_EDITIONS[editionName];

		if (!edition) {
			throw new Error(`Unsupported edition '${editionName}'`);
		}

		await this.#init(page, edition.suffix, edition.version);
	}

	/**
	 * @param {import('playwright-core').Page|undefined} page
	 * @param {string} suffix
	 * @param {string} expectedVersion
	 */
	#init = async (page, suffix, expectedVersion) => {
		page = page ?? this.page;

		await page.goto(`file:///${crossPlatformDocsPath}/index${suffix}.html`);
		await expect(page).toHaveTitle(/Evidently Cube TiddlyWiki5 Plugin Showcase/);
		await expect(page.locator('[data-test-id="tw-edition"]')).toHaveText(expectedVersion, {timeout: 300});
	};

	/**
	 * Returns a list of TW editions that can be passed to `initByName`.
	 *
	 * @param {boolean|undefined} codeMirrorFilter If set to true or false will respectively return editions that
	 * include Code Mirror or ones that don't. When undefined/left empty it returns all editions.
	 *
	 * @returns {string[]}
	 */
	static getEditions(codeMirrorFilter = undefined) {
		return Object.keys(SUPPORTED_EDITIONS)
			.filter(id => {
				const edition = SUPPORTED_EDITIONS[id];

				return codeMirrorFilter === undefined || edition.hasCodeMirror === codeMirrorFilter
			});
	}
}

/**
 * Utility to build a list of supported editions.
 *
 * @param {string} suffix
 * @param {string} version
 * @param {boolean} hasCodeMirror
 *
 * @returns {EditionEntry}
 */
function getEdition(suffix, version, hasCodeMirror) {
	return {suffix, version, hasCodeMirror};
}