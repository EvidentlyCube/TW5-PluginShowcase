export const PageUtils = {
	/**
	 * @param {import('@playwright/test').Page} page
	 * @param {string} selector
	 * @param {string} attribute
	 */
	async getAttributesFromSelector(page, selector, attribute) {
		const elements = await page.locator(selector).all();
		const attributes = [];
		for (const element of elements) {
			attributes.push(await element.getAttribute(attribute));
		}

		return attributes;
	}

}