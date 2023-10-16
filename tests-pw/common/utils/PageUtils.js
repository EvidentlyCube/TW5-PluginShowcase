import test from "playwright/test";

export async function getNewPage(page, callback) {
	return await test.step('Attempting to extract new page that is supposed to open', async () => {
		const waitForPagePromise = page.context().waitForEvent('page');

		await callback();

		const newPage = await waitForPagePromise;
		await newPage.waitForLoadState();

		return newPage;
	});
}