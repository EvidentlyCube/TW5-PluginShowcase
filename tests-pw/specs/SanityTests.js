// @ts-check
import { EditionSelector } from '../common/core/EditionSelector';
import { baseTest as test } from '../common/core/BaseTest';

EditionSelector.getEditions().forEach(edition => {
	test.describe(`Sanity (${edition})`, async () => {
		test('Each edition loads correctly', async ({ page, selectEdition }) => {
			await test.step('Init edition', async() => {
				await selectEdition.initByName(edition, page);
			});
		});
	});
})
