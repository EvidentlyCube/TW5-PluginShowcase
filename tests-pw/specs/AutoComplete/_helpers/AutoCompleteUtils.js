// @ts-check
import { expect } from "playwright/test";
import { TiddlerStore } from "../../../common/core/TiddlerStore";
import { autoCompleteTest } from "./AutoCompleteTest";
import { getBoundingBoxDistance } from "../../../common/utils/BoundingBoxUtils";

/**
 * @typedef {object} AutoCompleteTriggerChanges
 * @property {boolean} [autoTriggerInput]
 * @property {boolean} [autoTriggerTextArea]
 * @property {string} [trigger]
 */

export class AutoCompleteUtils {
	/**
	 * @param {import("playwright/test").Page} page
	 * @param {TiddlerStore} store
	 */
	constructor(page, store) {
		this.page = page;
		this.store = store;
	}

	forPage(page) {
		return new AutoCompleteUtils(page, new TiddlerStore(page));
	}

	get defaultDisplayedResults() {
		return 8;
	}

	/**
	 * Clears existing triggers and loads new ones, which are given IDs from 1 in the order they are provided
	 * @param  {...any} triggerTiddlers
	 */
	async initTriggers(...triggerTiddlers) {
		//
		triggerTiddlers.forEach((trigger, index) => trigger.title = `$:/EvidentlyCube/Trigger/${index + 1}`)

		await this.store.deleteTiddlersByTag('$:/tags/EC/AutoComplete/Trigger');
		await this.store.loadFixtures(triggerTiddlers);
	}

	/**
	 * @param {string|number} triggerId
	 * @param {AutoCompleteTriggerChanges} changes
	 */
	async updateTrigger(triggerId, changes) {
		const fields = {};
		if (changes.autoTriggerInput !== undefined) {
			fields['auto-trigger-input'] = changes.autoTriggerInput ? '1' : '0';
		}
		if (changes.autoTriggerTextArea !== undefined) {
			fields['auto-trigger-textarea'] = changes.autoTriggerTextArea ? '1' : '0';
		}
		if (changes.trigger !== undefined) {
			fields['trigger'] = changes.trigger;
		}

		await this.store.updateTiddler(`$:/EvidentlyCube/Trigger/${triggerId}`, fields);
	}

	/**
	 * Hacky way to determine that the Auto Complete dialog appears more or less where it should.
	 * There is no guaranteed way to get caret's position on the screen, nor we want to hardcode numbers to protect
	 * the assertion from design changes. So we have to get creative.
	 *
	 * The assumption is that with the caret near the start of the input, the AC Dialog will appear near the input's
	 * top-left corner.
	 * Then we check that triggering the completion a little further to the right will also cause the dialog to appear
	 * a little further to the right.
	 * This should work for all except the smallest inputs.
	 *
	 * @param {string} trigger
	 * @param {import("playwright/test").Locator} dialogSourceLocator Locator pointing to the HTML element that takes the keyboard input
	 * @param {import("playwright/test").Locator} autoCompleteDialogLocator Locator pointing to the auto complete dialog
	 */
	async assertDialogPosition(trigger, dialogSourceLocator, autoCompleteDialogLocator) {
		const ALLOWED_AXIS_DISTANCE = 64;
		const textInputs = [
			`${trigger}`,
			`ww ${trigger}`,
			`ww ww ${trigger}`,
			`ww ww ww ${trigger}`,
		];

		await autoCompleteTest.step("Assert dialog position", async () => {
			const textAreaBounds = await autoCompleteTest.step('Retrieve source BBox', async () => dialogSourceLocator.boundingBox());

			expect(textAreaBounds, "Expected dialog source bounding box to be retrieved").not.toBeFalsy();

			let lastBoundingBox = textAreaBounds;
			for (let i = 0; i < textInputs.length; i++) {
				const input = textInputs[i];
				const boundingBox = await autoCompleteTest.step(`Retrieve dialog BBox for input #${i} '${input}'`, async () => {
					// Dismiss completion as in some cases it can obscure the input enough for PW to choke
					if (await autoCompleteDialogLocator.isVisible()) {
						await autoCompleteDialogLocator.page().keyboard.press('Escape');
					}

					// Code Mirror needs a click to gain focus
					await dialogSourceLocator.click();
					await dialogSourceLocator.press('Control+A');
					await dialogSourceLocator.press('Delete');
					await dialogSourceLocator.pressSequentially(input);

					return autoCompleteDialogLocator.boundingBox();
				});

				expect(boundingBox, "Expected auto complete bounding box to be retrieved").not.toBeFalsy();

				await autoCompleteTest.step(`Assert distance of input #${i} '${input}' from previous input is less than ${ALLOWED_AXIS_DISTANCE} in each dimension`, async () => {
					const distance = getBoundingBoxDistance(lastBoundingBox, boundingBox);
					expect(distance.x, "Expected X distance to be under the threshold").toBeLessThan(ALLOWED_AXIS_DISTANCE);
					expect(distance.y, "Expected Y distance to be under the threshold").toBeLessThan(ALLOWED_AXIS_DISTANCE);
					expect(distance.x, "Expected X distance to change").toBeGreaterThan(0);
				});

				lastBoundingBox = boundingBox;
			}
		});
	}
}