// @ts-check
import { test } from './_helpers/AutoCompleteTest';
import { EditionSelector } from '../../common/core/EditionSelector';

import { expect } from 'playwright/test';

EditionSelector.getEditions(undefined).forEach(edition => {
	test.describe(`Auto Complete-> Common (${edition})`, async () => {
		test('General auto complete broad check', async ({ page, selectEdition, store, ui, pluginUi, pluginUtils, fixtures }) => {
			await selectEdition.initByName(edition);
			await pluginUtils.initTriggers(fixtures.triggerSearchInTitle);

			const {autoCompleteWindow} = pluginUi;
			const {searchInput} = ui.sidebar;

			await test.step("Use auto completion on sidebar search", async () => {
				await searchInput.pressSequentially("[[1");
				await expect(autoCompleteWindow.self, "Expected the auto complete window to appear").toBeVisible();
				await expect(autoCompleteWindow.links, "Expected completion to display expected number of results").toHaveCount(pluginUtils.defaultDisplayedResults);
				await expect(autoCompleteWindow.selectedLink, "Expected only a single link to be selected").toHaveCount(1);
				await expect(autoCompleteWindow.bottomDotsLi, "Expected bottom dots to appear to signify more results").toBeVisible();

				const selectedText = await autoCompleteWindow.selectedLink.textContent();
				await searchInput.press('Enter');
				await expect(searchInput).toHaveValue(`[[${selectedText}]]`);
				await expect(searchInput, "Expected focus to not be lost on completion").toBeFocused();

				const [caretStart, caretEnd] = await searchInput.evaluate(input => [input.selectionStart, input.selectionEnd]);
				expect(caretStart, "Expected caret position to not be a selection").toEqual(caretEnd);
				expect(caretStart, "Expected caret to be placed after the closing bracket").toEqual(4 + selectedText.length);
			});
		});
	})
})
