// @ts-check
import { test } from './_helpers/AutoCompleteTest';
import { EditionSelector } from '../../common/core/EditionSelector';

import { expect } from 'playwright/test';
import { getNewPage } from '../../common/utils/PageUtils';

EditionSelector.getEditions(false).forEach(edition => {
	test(`${edition} -> Auto Complete -> Simple Editor -> Broad test`, async ({ page, selectEdition, store, ui, pluginUi, pluginUtils, fixtures, twConfig }) => {
		await selectEdition.initByName(edition);
		await pluginUtils.initTriggers(fixtures.triggerSearchInTitle);
		await twConfig.useFramedEditor(false);

		const { autoCompleteWindow } = pluginUi;
		const { unframedBodyTextArea } = await ui.sidebar.doCreateNewTiddler();

		await test.step("Auto trigger completion", async () => {
			await unframedBodyTextArea.pressSequentially("[[1");
			await expect(autoCompleteWindow.self, "Expected the auto complete dialog to appear").toBeVisible();
		});

		await test.step("Dismiss completion dialog on escape", async () => {
			await unframedBodyTextArea.fill('');
			await unframedBodyTextArea.pressSequentially("[[1");
			await page.keyboard.press('Escape');
			await expect(autoCompleteWindow.self, "Expected the auto complete dialog to be closed").not.toBeVisible();
		});

		await test.step("Dismiss completion dialog when trigger is erased", async () => {
			await unframedBodyTextArea.fill('');
			await unframedBodyTextArea.pressSequentially("[[1");
			await page.keyboard.press('Backspace');
			await expect(autoCompleteWindow.self, "Expected the auto complete dialog to be closed").not.toBeVisible();
		});

		await test.step("Dismiss completion dialog caret moved behind trigger", async () => {
			await unframedBodyTextArea.fill('');
			await unframedBodyTextArea.pressSequentially("[[1");
			await page.keyboard.press('ArrowLeft');
			await expect(autoCompleteWindow.self, "Expected the auto complete dialog to be closed").not.toBeVisible();
		});

		await test.step("Manually trigger completion", async () => {
			await unframedBodyTextArea.fill('');
			await unframedBodyTextArea.pressSequentially("[[1");
			await page.keyboard.press('Escape');
			await page.keyboard.press('Control+Space');
			await expect(autoCompleteWindow.self, "Expected the auto complete dialog to appear").toBeVisible();
		});

		await test.step("Insert completion - with enter", async () => {
			await unframedBodyTextArea.fill('');
			await unframedBodyTextArea.pressSequentially("[[1");

			const selectedText = (await autoCompleteWindow.selectedLink.textContent()).trim();

			await page.keyboard.press('Enter');
			await expect(unframedBodyTextArea).toHaveValue(`[[${selectedText}]]`);
			await expect(unframedBodyTextArea, "Expected focus to not be lost on completion").toBeFocused();

			await test.step("Validate caret position", async () => {
				const [caretStart, caretEnd] = await unframedBodyTextArea.evaluate(input => [input.selectionStart, input.selectionEnd]);
				expect(caretStart, "Expected caret position to not be a selection").toEqual(caretEnd);
				expect(caretStart, "Expected caret to be placed after the closing bracket").toEqual(4 + selectedText.length);
			});
		});

		await test.step("Insert completion - with mouse", async () => {
			await unframedBodyTextArea.fill('');
			await unframedBodyTextArea.pressSequentially("[[1");

			const selectedText = (await autoCompleteWindow.selectedLink.textContent()).trim();

			await autoCompleteWindow.selectedLink.click();
			await expect(unframedBodyTextArea).toHaveValue(`[[${selectedText}]]`);
			await expect(unframedBodyTextArea, "Expected focus to not be lost on completion").toBeFocused();

			await test.step("Validate caret position", async () => {
				const [caretStart, caretEnd] = await unframedBodyTextArea.evaluate(input => [input.selectionStart, input.selectionEnd]);
				expect(caretStart, "Expected caret position to not be a selection").toEqual(caretEnd);
				expect(caretStart, "Expected caret to be placed after the closing bracket").toEqual(4 + selectedText.length);
			});
		});

		await test.step("Insert completion - with mouse, different result", async () => {
			await unframedBodyTextArea.fill('');
			await unframedBodyTextArea.pressSequentially("[[1");

			const lastLink = await autoCompleteWindow.links.last();
			const selectedText = (await lastLink.textContent()).trim();

			await page.pause();
			await lastLink.click();
			await expect(unframedBodyTextArea).toHaveValue(`[[${selectedText}]]`);
			await expect(unframedBodyTextArea, "Expected focus to not be lost on completion").toBeFocused();

			await test.step("Validate caret position", async () => {
				const [caretStart, caretEnd] = await unframedBodyTextArea.evaluate(input => [input.selectionStart, input.selectionEnd]);
				expect(caretStart, "Expected caret position to not be a selection").toEqual(caretEnd);
				expect(caretStart, "Expected caret to be placed after the closing bracket").toEqual(4 + selectedText.length);
			});
		});

		await test.step("Navigate completion with keyboard", async () => {
			await unframedBodyTextArea.fill('');
			await unframedBodyTextArea.pressSequentially("[[1");

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

	test(`${edition} -> Auto Complete -> Simple Editor -> Disable Auto Trigger`, async ({ page, selectEdition, store, ui, pluginUi, pluginUtils, fixtures, twConfig }) => {
		await selectEdition.initByName(edition);
		await pluginUtils.initTriggers(fixtures.triggerSearchInTitle);
		await pluginUtils.updateTrigger(1, { autoTriggerTextArea: 0 });
		await twConfig.useFramedEditor(false);

		const { autoCompleteWindow } = pluginUi;
		const { unframedBodyTextArea } = await ui.sidebar.doCreateNewTiddler();

		await test.step("No auto trigger", async () => {
			await unframedBodyTextArea.pressSequentially("[[1");
			await expect(autoCompleteWindow.self, "Expected the dialog to not appear because auto trigger is disabled").not.toBeVisible();
		});

		await test.step("But can still trigger manually", async () => {
			await page.keyboard.press("Control+Space");
			await expect(autoCompleteWindow.self, "Expected the dialog to appear from manual trigger").toBeVisible();
		});
	});

	test(`${edition} -> Auto Complete -> Simple Editor -> Dialog position`, async ({ page, selectEdition, store, ui, pluginUi, pluginUtils, fixtures, twConfig }) => {
		await selectEdition.initByName(edition);
		await pluginUtils.initTriggers(fixtures.triggerSearchInTitle);
		await twConfig.useFramedEditor(false);

		const { autoCompleteWindow } = pluginUi;
		const { unframedBodyTextArea } = await ui.sidebar.doCreateNewTiddler();

		await pluginUtils.assertDialogPosition("[[1", unframedBodyTextArea, autoCompleteWindow.self);
	});

	test(`${edition} -> Auto Complete -> Simple Editor -> New Window`, async ({ page: pagePrimary, selectEdition, store, ui, pluginUi, pluginUtils, fixtures, twConfig }) => {
		await selectEdition.initByName(edition);
		await pluginUtils.initTriggers(fixtures.triggerSearchInTitle);
		await twConfig.useFramedEditor(false);

		const title = await store.loadFixture(fixtures.tiddlerEditTextArea);
		const viewTiddler = await ui.sidebar.doOpenTiddler(title);

		const pageSecondary = await test.step('Open new window', async () => {
			await viewTiddler.moreActionsButton.click();

			return getNewPage(pagePrimary, async () => {
				await viewTiddler.openInNewWindowButton.click();
			});
		});

		const textAreaPrimary = viewTiddler.self.locator('textarea');
		const textAreaSecondary = pageSecondary.locator('textarea');
		const { autoCompleteWindow: autoCompletePrimary } = pluginUi;
		const { autoCompleteWindow: autoCompleteSecondary } = pluginUi.forPage(pageSecondary);

		await test.step("Triggering completion in primary window won't open it in secondary", async () => {
			await textAreaPrimary.pressSequentially('[[1');

			await expect(autoCompletePrimary.self, "Expected dialog to appear in primary window").toBeVisible();
			await expect(autoCompleteSecondary.self, "Expected dialog to not appear in secondary window").not.toBeVisible();

			await pagePrimary.keyboard.press('Escape');
			await textAreaPrimary.blur(); // NOTES.md#001
		});

		await test.step("Triggering completion in secondary window won't open it in primary", async () => {
			await textAreaSecondary.pressSequentially('[[1');

			await expect(autoCompletePrimary.self, "Expected dialog to not appear in primary window").not.toBeVisible();
			await expect(autoCompleteSecondary.self, "Expected dialog to appear in secondary window").toBeVisible();

			await pageSecondary.keyboard.press('Escape');
			await textAreaSecondary.blur(); // NOTES.md#001
		});

		await test.step("Secondary window: Completion with enter works", async () => {
			await textAreaSecondary.fill('');
			await textAreaSecondary.pressSequentially('[[1');

			const selectedText = (await autoCompleteSecondary.selectedLink.textContent()).trim();
			await pageSecondary.keyboard.press('Enter');
			await expect(textAreaPrimary).toHaveValue(`[[${selectedText}]]`);
			await expect(textAreaSecondary).toHaveValue(`[[${selectedText}]]`);
			await expect(textAreaSecondary, "Expected focus to not be lost on completion").toBeFocused();
		});

		await test.step("Secondary window: Completion with enter mouse", async () => {
			await textAreaSecondary.fill('');
			await textAreaSecondary.pressSequentially('[[1');

			const selectedText = (await autoCompleteSecondary.selectedLink.textContent()).trim();
			await autoCompleteSecondary.selectedLink.click();
			await expect(textAreaPrimary).toHaveValue(`[[${selectedText}]]`);
			await expect(textAreaSecondary).toHaveValue(`[[${selectedText}]]`);
			await expect(textAreaSecondary, "Expected focus to not be lost on completion").toBeFocused();
		});

		await test.step("Secondary window: Closing with escape works", async () => {
			await textAreaSecondary.fill('');
			await textAreaSecondary.pressSequentially('[[1');
			await pageSecondary.keyboard.press('Escape');

			await expect(autoCompleteSecondary.self, "Expected completion dialog to disappear").not.toBeVisible();
		});

		await pageSecondary.pause();
		await pluginUtils.forPage(pageSecondary).assertDialogPosition('[[1', textAreaSecondary, autoCompleteSecondary.self);
	});
});
