// @ts-check
import { autoCompleteTest as test } from './_helpers/AutoCompleteTest';
import { EditionSelector } from '../../common/core/EditionSelector';

import { expect } from 'playwright/test';

EditionSelector.getEditions(false).forEach(edition => {
	test(`${edition} -> Auto Complete -> Sidebar Search -> Arrow navigation priority`, async ({ page, selectEdition, store, ui, pluginUi, pluginUtils, fixtures }) => {
		await selectEdition.initByName(edition);
		await pluginUtils.initTriggers(fixtures.triggerSearchInTitle);
		await pluginUtils.updateTrigger(1, {trigger: 'T'});

		const { autoCompleteWindow } = pluginUi;
		const { searchResults, searchInput } = ui.sidebar;

		await test.step("Show results", async () => {
			await searchInput.pressSequentially("Test");
		});

		const initialACOption = await autoCompleteWindow.selectedLink.textContent();

		await test.step("Press arrow down", async () => {
			await page.keyboard.press('ArrowDown');
			await expect(autoCompleteWindow.selectedLink, "Expected Auto Complete to change selected option").not.toHaveText(initialACOption);
			await expect(searchResults.selectedLink, "Expected Search Results to not have selected option yet").not.toBeVisible();
		});

		await test.step("Press arrow up", async () => {
			await page.keyboard.press('ArrowUp');
			await expect(autoCompleteWindow.selectedLink, "Expected Auto Complete to change selected option").toHaveText(initialACOption);
			await expect(searchResults.selectedLink, "Expected Search Results to not have selected option yet").not.toBeVisible();
		});

		await test.step("Cancel auto complete", async () => {
			await page.keyboard.press('Escape');
		});

		await test.step("Press arrow down", async () => {
			await page.keyboard.press('ArrowDown');
			await expect(searchResults.selectedLink, "Expected Search Results to now received input and select the top option").toBeVisible();
		});
	});
});
