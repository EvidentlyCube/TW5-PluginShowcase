import test, { expect } from "playwright/test";
import { SidebarSearchResultsUi } from "./SidebarSearchResultsUi";
import { EditTiddlerUi } from "./EditTiddlerUi";
import { ViewTiddlerUi } from "./ViewTiddlerUi";
import { sleep } from "../utils/PageUtils";
import { TiddlyWikiUi } from "./TiddlyWikiUi";

export class SidebarUi {
	/**
	 * @param {import("@playwright/test").Page} page
	 * @param {TiddlyWikiUi} ui
	 */
	constructor(page, ui) {
		this.page = page;
		this.ui = ui;
	}

	get searchResults() {
		return new SidebarSearchResultsUi(this.page);
	}

	get titleHeader() {
		return this.page.locator('.tc-site-title');
	}

	get searchInput() {
		return this.page.locator('.tc-sidebar-search input');
	}

	get openTiddlers() {
		return this.page.locator('.tc-tiddler-frame');
	}

	get createNewTiddlerButton() {
		return this.page.locator('.tc-sidebar-header .tc-page-controls button[class*="new-tiddler"]');
	}

	async getOpenTiddlerTitles() {
		return Promise.all(
			(await this.openTiddlers.all()).map(tiddler => tiddler.getAttribute('data-tiddler-title'))
		);
	}

	async doCreateNewTiddler() {
		return await test.step("Action: Create a new tiddler and return its title", async () => {
			const existingTiddlers = await this.getOpenTiddlerTitles();

			await this.ui.waitForChange(async () => {
				await this.createNewTiddlerButton.click();
			});

			const newTiddlers = await this.getOpenTiddlerTitles();
			const newTiddlerTitle = newTiddlers.find(titles => !existingTiddlers.includes(titles));

			if (!newTiddlerTitle) {
				throw new Error(
					`Attempted to create a new tiddler but was unable to retrieve its title.\n`
					+ `Titles before click:\n - ${existingTiddlers.join("\n - ")}\n`
					+ `Titles after click:\n - ${newTiddlers.join("\n - ")}`
				);
			}

			return new EditTiddlerUi(this.page, newTiddlerTitle);
		});
	}

	async doOpenTiddler(title) {
		return await test.step(`Action: Open tiddler titled '${title}'`, async () => {
			const { searchInput, searchResults } = this;
			const { keyboard } = this.page;

			await searchInput.fill(title);
			await keyboard.press('ArrowDown');

			await expect(searchResults.selectedLink, "Expected the first result to be selected").toBeVisible();
			await keyboard.press('Enter');

			const ui = new ViewTiddlerUi(this.page, title);
			await expect(ui.self, "Expected the tiddler to be open now").toBeVisible();

			return ui;
		})
	}
}