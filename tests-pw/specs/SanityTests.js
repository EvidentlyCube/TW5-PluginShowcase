// @ts-check
import { test } from '../common/core/Test';
import { EditionSelector } from '../common/core/EditionSelector';

EditionSelector.getEditions().forEach(edition => {
	test.describe(`Sanity (${edition})`, async () => {
		test('Each edition loads correctly', async ({ page, selectEdition }) => {
			await selectEdition.initByName(edition, page);
		});
	})
})
