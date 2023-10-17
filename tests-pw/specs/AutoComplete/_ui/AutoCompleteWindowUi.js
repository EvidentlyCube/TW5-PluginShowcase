// @ts-check

export class AutoCompleteWindowUi {
	/**
	 * @param {import("playwright/test").Page} page
	 */
	constructor(page) {
		this.page = page;
	}

	get self() {
		return this.page.locator('.ec_ac-completion');
	}

	get links() {
		return this.page.locator('.ec_ac-completion .ec_ac-link');
	}

	get selectedLink() {
		return this.page.locator('.ec_ac-completion .ec_ac-link.selected');
	}

	get bottomDotsLi() {
		return this.page.locator('.ec_ac-completion .ec_ac-dots-bottom');
	}

	get topDotsLi() {
		return this.page.locator('.ec_ac-completion .ec_ac-dots-top');
	}

	get noResultsLi() {
		return this.page.locator('.ec_ac-completion .label');
	}
}