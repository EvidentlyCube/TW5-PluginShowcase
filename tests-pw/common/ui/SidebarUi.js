export class SidebarUi {
	/**
	 * @param {import("@playwright/test").Page} page
	 */
	constructor(page) {
		this.page = page;
	}

	get searchInput() {
		return this.page.locator('.tc-sidebar-search input');
	}

}