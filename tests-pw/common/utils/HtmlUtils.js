// @ts-check

/**
 * Return input caret selection start/end values as a 2 element array.
 * If the element does not have the relevant properties it returns 0
 *
 * @param {import("playwright-core").Locator} locator
 * @returns {Promise<{selectionStart: number, selectionEnd: number}>}
 */
export async function getInputSelection(locator) {
	return locator.evaluate(element => {
		return {
			selectionStart: /** @type {any} */ (element).selectionStart ?? 0,
			selectionEnd: /** @type {any} */ (element).selectionEnd ?? 0
		}
	});
}