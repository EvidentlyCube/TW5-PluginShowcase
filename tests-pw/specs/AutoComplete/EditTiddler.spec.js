// @ts-check
import { autoCompleteTest as test} from './_helpers/AutoCompleteTest';
import { EditionSelector } from '../../common/core/EditionSelector';

import { expect } from 'playwright/test';
import { getDialogs } from '../../common/utils/DialogUtils';

EditionSelector.getEditions(false).forEach(edition => {
	test(`${edition} -> Auto Complete -> Edit Tiddler -> Cancel draft popup`, async ({ page, selectEdition, ui, twConfig, pluginUtils, fixtures }) => {
		await selectEdition.initByName(edition);
		await pluginUtils.initTriggers(fixtures.triggerSearchInTitle);
		await twConfig.useFramedEditor(false);

		const { self: editorSelf, unframedBodyTextArea } = await ui.sidebar.doCreateNewTiddler();

		await test.step('Trigger auto complete', async () => {
			await unframedBodyTextArea.pressSequentially('[[1');
		});

		await test.step('Ensure cancel draft dialog does not appear when dismissing completion', async() => {
			const dialogs = await getDialogs(page, async () => {
				await page.keyboard.press('Escape');
			});

			expect(dialogs, "Expected no dialogs to appear when dismissing auto complete").toHaveLength(0);
			await expect(editorSelf, "Expected tiddler editor to be still visible").toBeVisible();
		});
	});
});
