// @ts-check
import { test } from './_helpers/AutoCompleteTest';
import { EditionSelector } from '../../common/core/EditionSelector';

import { expect } from 'playwright/test';

EditionSelector.getEditions(true).forEach(edition => {
	test(`${edition} -> Auto Complete -> Code Mirror -> Broad test`, async ({ page, selectEdition, store, ui, pluginUi, pluginUtils, fixtures, twConfig }) => {
		await selectEdition.initByName(edition);
		await pluginUtils.initTriggers(fixtures.triggerSearchInTitle);
		await twConfig.useFramedEditor(true);

		const { autoCompleteWindow } = pluginUi;
		const { codeMirrorInputDiv } = await ui.sidebar.doCreateNewTiddler();

		await test.step("Auto trigger completion", async () => {
			await codeMirrorInputDiv.click();
			await codeMirrorInputDiv.pressSequentially("[[1");
			await expect(autoCompleteWindow.self, "Expected the auto complete dialog to appear").toBeVisible();
		});

		await test.step("Dismiss completion dialog on escape", async () => {
			await codeMirrorInputDiv.click();
			await codeMirrorInputDiv.press('Control+A');
			await codeMirrorInputDiv.press('Delete');
			await codeMirrorInputDiv.pressSequentially("[[1");
			await page.keyboard.press('Escape');
			await expect(autoCompleteWindow.self, "Expected the auto complete dialog to be closed").not.toBeVisible();
		});

		await test.step("Dismiss completion dialog when trigger is erased", async () => {
			await codeMirrorInputDiv.click();
			await codeMirrorInputDiv.press('Control+A');
			await codeMirrorInputDiv.press('Delete');
			await codeMirrorInputDiv.pressSequentially("[[1");
			await page.keyboard.press('Backspace');
			await expect(autoCompleteWindow.self, "Expected the auto complete dialog to be closed").not.toBeVisible();
		});

		await test.step("Dismiss completion dialog caret moved behind trigger", async () => {
			await codeMirrorInputDiv.click();
			await codeMirrorInputDiv.press('Control+A');
			await codeMirrorInputDiv.press('Delete');
			await codeMirrorInputDiv.pressSequentially("[[1");
			await page.keyboard.press('ArrowLeft');
			await expect(autoCompleteWindow.self, "Expected the auto complete dialog to be closed").not.toBeVisible();
		});

		await test.step("Manually trigger completion", async () => {
			await codeMirrorInputDiv.click();
			await codeMirrorInputDiv.press('Control+A');
			await codeMirrorInputDiv.press('Delete');
			await codeMirrorInputDiv.pressSequentially("[[1");
			await page.keyboard.press('Escape');
			await page.keyboard.press('Control+Space');
			await expect(autoCompleteWindow.self, "Expected the auto complete dialog to appear").toBeVisible();
		});

		await test.step("Insert completion - with enter", async () => {
			await codeMirrorInputDiv.click();
			await codeMirrorInputDiv.press('Control+A');
			await codeMirrorInputDiv.press('Delete');
			await codeMirrorInputDiv.pressSequentially("[[1");

			const selectedText = (await autoCompleteWindow.selectedLink.textContent()).trim();

			await page.keyboard.press('Enter');
			await expect(codeMirrorInputDiv).toContainText(`[[${selectedText}]]`);

			await test.step("Validate caret position & focus (by using input)", async () => {
				await codeMirrorInputDiv.press('x');
				await expect(codeMirrorInputDiv, "'x' should have been typed at the end").toContainText(`[[${selectedText}]]x`);
			});
		});

		await test.step("Insert completion - with mouse", async () => {
			await codeMirrorInputDiv.press('Control+A');
			await codeMirrorInputDiv.press('Delete');
			await codeMirrorInputDiv.pressSequentially("[[1");

			const selectedText = (await autoCompleteWindow.selectedLink.textContent()).trim();

			await autoCompleteWindow.selectedLink.click();
			await expect(codeMirrorInputDiv).toContainText(`[[${selectedText}]]`);

			await test.step("Validate caret position & focus (by using input)", async () => {
				await codeMirrorInputDiv.press('x');
				await expect(codeMirrorInputDiv, "'x' should have been typed at the end").toContainText(`[[${selectedText}]]x`);
			});
		});

		await test.step("Insert completion - with mouse, different result", async () => {
			await codeMirrorInputDiv.press('Control+A');
			await codeMirrorInputDiv.press('Delete');
			await codeMirrorInputDiv.pressSequentially("[[1");

			const lastLink = await autoCompleteWindow.links.last();
			const selectedText = (await lastLink.textContent()).trim();

			await page.pause();
			await lastLink.click();
			await expect(codeMirrorInputDiv).toContainText(`[[${selectedText}]]`);

			await test.step("Validate caret position & focus (by using input)", async () => {
				await codeMirrorInputDiv.press('x');
				await expect(codeMirrorInputDiv, "'x' should have been typed at the end").toContainText(`[[${selectedText}]]x`);
			});
		});

		await test.step("Navigate completion with keyboard", async () => {
			await codeMirrorInputDiv.press('Control+A');
			await codeMirrorInputDiv.press('Delete');
			await codeMirrorInputDiv.pressSequentially("[[1");

			await test.step('Navigate down', async () => {
				await page.keyboard.press('ArrowDown');
				await expect(autoCompleteWindow.selectedLink, "Expected selection text").toHaveText(await autoCompleteWindow.links.nth(1).textContent());
			});

			await test.step('Navigate back up', async () => {
				await page.keyboard.press('ArrowUp');
				await expect(autoCompleteWindow.selectedLink, "Expected selection text").toHaveText(await autoCompleteWindow.links.nth(0).textContent());
			});

			await test.step('Navigate down so it scrolls', async () => {
				await expect(autoCompleteWindow.bottomDotsLi, "Sanity check: bottom dots are only visible when we can scroll").toBeVisible();
				const oldSecondLineText = await autoCompleteWindow.links.nth(1).textContent();
				await page.keyboard.press('ArrowDown');
				await page.keyboard.press('ArrowDown');
				await page.keyboard.press('ArrowDown');
				await page.keyboard.press('ArrowDown');
				await expect(autoCompleteWindow.bottomDotsLi, "Expected bottom dots to still be visible").toBeVisible();
				await expect(autoCompleteWindow.topDotsLi, "Expected top dots to appear when scrolled down").toBeVisible();
				await expect(
					autoCompleteWindow.links.nth(0),
					"Expected contents to scroll so that the first row has the text of what used to be the second row "
				).toHaveText(oldSecondLineText);
			});

			await test.step('Navigate up so it overflows to the bottom', async () => {
				// Return to the top
				await page.keyboard.press('Escape');
				await page.keyboard.press('Control+Space');

				const oldFirstLineText = await autoCompleteWindow.links.nth(0).textContent();
				const oldEighthLineText = await autoCompleteWindow.links.nth(7).textContent();

				await page.keyboard.press('ArrowUp');
				await expect(autoCompleteWindow.bottomDotsLi, "Expected bottom dots to not be visible at the bottom of the list").not.toBeVisible();
				await expect(autoCompleteWindow.topDotsLi, "Expected top dots to appear when at the bottom of the list").toBeVisible();
				await expect(autoCompleteWindow.self, "Expected no line to have text from the top of the list").not.toHaveText(oldFirstLineText);
				await expect(autoCompleteWindow.self, "Expected no line to have text from the top of the list").not.toHaveText(oldEighthLineText);
			});
		});
	});

	test(`${edition} -> Auto Complete -> Code Mirror -> Disable Auto Trigger`, async ({ page, selectEdition, store, ui, pluginUi, pluginUtils, fixtures, twConfig }) => {
		await selectEdition.initByName(edition);
		await pluginUtils.initTriggers(fixtures.triggerSearchInTitle);
		await pluginUtils.updateTrigger(1, {autoTriggerTextArea: 0});
		await twConfig.useFramedEditor(true);

		const { autoCompleteWindow } = pluginUi;
		const { codeMirrorInputDiv } = await ui.sidebar.doCreateNewTiddler();

		await test.step("No auto trigger", async () => {
			await codeMirrorInputDiv.click("[[1");
			await codeMirrorInputDiv.pressSequentially("[[1");
			await expect(autoCompleteWindow.self, "Expected the dialog to not appear because auto trigger is disabled").not.toBeVisible();
		});

		await test.step("But can still trigger manually", async () => {
			await page.keyboard.press("Control+Space");
			await expect(autoCompleteWindow.self, "Expected the dialog to appear from manual trigger").toBeVisible();
		});
	});

	test(`${edition} -> Auto Complete -> Code Mirror -> Dialog position`, async ({ page, selectEdition, store, ui, pluginUi, pluginUtils, fixtures, twConfig }) => {
		await selectEdition.initByName(edition);
		await pluginUtils.initTriggers(fixtures.triggerSearchInTitle);
		await twConfig.useFramedEditor(true);

		const { autoCompleteWindow } = pluginUi;
		const { codeMirrorInputDiv } = await ui.sidebar.doCreateNewTiddler();

		await pluginUtils.assertDialogPosition("[[1", codeMirrorInputDiv, autoCompleteWindow.self);

		codeMirrorInputDiv.press('Control+A');
		codeMirrorInputDiv.press('Delete');

		await test.step("Scroll screen vertically", async () => {
			await page.evaluate(() => window.scrollTo(0, 128));
		});

		await pluginUtils.assertDialogPosition("[[1", codeMirrorInputDiv, autoCompleteWindow.self);
	});
});
