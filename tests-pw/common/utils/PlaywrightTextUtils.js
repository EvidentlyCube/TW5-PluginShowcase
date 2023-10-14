

/**
 * Extract Text Content from a locator or return an empty string if it doesn't exist.
 *
 * The returned text content will be trimmed, unless the second argument is set to false.
 *
 * @param {import("playwright/test").Locator} locator
 * @param {boolean} returnRaw
 */
export async function getTextContent(locator, returnRaw = false) {
	try {
		const text = (await locator.textContent()) ?? "";

		return returnRaw
			? text
			: text.trim();

	} catch (e) {
		return "";
	}
}