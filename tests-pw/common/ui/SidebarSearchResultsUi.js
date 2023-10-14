
export class SidebarSearchResultsUi {
	/**
	 * @param {import("@playwright/test").Page} page
	 */
	constructor(page) {
		this.page = page;
	}

	get self() {
		return this.page.locator('.tc-search-drop-down');
	}

	get links() {
		return this.self.locator('.tc-menu-list-item a');
	}

	get selectedLink() {
		return this.self.locator('.tc-list-item-selected a');
	}
}