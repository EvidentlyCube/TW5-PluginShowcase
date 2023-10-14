import { expect } from "playwright/test";
import { SidebarUi } from "./SidebarUi";
import { EditTiddlerUi } from "./EditTiddlerUi";

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

	async getTiddlerEdit(title) {
		const ui = new EditTiddlerUi(this.page, title);

		await expect(ui.self, `Expected to find editor frame found for tiddler "${title}"`).toBeVisible()

		return ui;
	}

	get sidebar() {
		return new SidebarUi(this.page);
	}

}