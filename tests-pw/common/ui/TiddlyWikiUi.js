import { SidebarUi } from "./SidebarUi";

export class TiddlyWikiUi {
	/**
	 * @param {import("@playwright/test").Page} page
	 */
	constructor(page) {
		this.page = page;
	}

	forPage(page) {
		return new TiddlyWikiUi(page);
	}

	get sidebar() {
		return new SidebarUi(this.page);
	}

}