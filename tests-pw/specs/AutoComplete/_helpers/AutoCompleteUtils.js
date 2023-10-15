import { expect } from "playwright/test";
import { TiddlerStore } from "../../../common/core/TiddlerStore";
import { test } from "./AutoCompleteTest";
import { getBoundingBoxDistance } from "../../../common/utils/BoundingBoxUtils";
import { repeatUntilNotNull } from "../../../common/utils/FlowUtils";


export class AutoCompleteUtils {
	/**
	 * @param {TiddlerStore} store
	 */
	constructor(store) {
		this.store = store;
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

	async updateTrigger(triggerId, change) {
		const fields = {};
		for (const [key, value] of Object.entries(change)) {
			switch (key) {
				case 'autoTriggerInput':
					fields['auto-trigger-input'] = value ? '1' : '0';
					break;
				case 'autoTriggerTextArea':
					fields['auto-trigger-textarea'] = value ? '1' : '0';
					break;
				case 'trigger':
					fields['trigger'] = value;
					break;
				default:
					throw new Error(`Failed to update trigger because it contains a change '${key}' that is not recognized.`);
			}
		}

		await this.store.updateTiddler(`$:/EvidentlyCube/Trigger/${triggerId}`, fields);
	}

	/**
	 * Hacky way to determine that the Auto Complete dialog appears more or less where it should.
	 * Because we don't have a guaranteed way to get caret's position on the screen, nor want to hardcode numbers to protect
	 * the assertion from design changes we get creative.
	 *
	 * The assumption is that with the caret near the start of the input, the AC Dialog will appear near the input's
	 * top-left corner.
	 * Then we check that triggering the completion a little further to the right will also cause the dialog to appear
	 * a little further to the right.
	 * This should work for all except the smallest inputs.
	 *
	 * @param {string} trigger
	 * @param {import("playwright/test").Locator} dialogSourceLocator
	 * @param {import("playwright/test").Locator} autoCompleteDialogLocator
	 * @param {import("playwright/test").Locator|null} inputLocator
	 */
	async assertDialogPosition(trigger, dialogSourceLocator, autoCompleteDialogLocator, inputLocator = null) {
		const ALLOWED_AXIS_DISTANCE = 64;
		const textInputs = [
			`${trigger}`,
			`ww ${trigger}`,
			`ww ww ${trigger}`,
			`ww ww ww ${trigger}`,
		];

		inputLocator = inputLocator || dialogSourceLocator;

		await test.step("Assert dialog position", async () => {
			const textAreaBounds = await test.step('Retrieve source BBox', async () => dialogSourceLocator.boundingBox());

			expect(textAreaBounds, "Expected dialog source bounding box to be retrieved").not.toBeFalsy();

			let lastBoundingBox = textAreaBounds;
			for (let i = 0; i < textInputs.length; i++) {
				const input = textInputs[i];
				const boundingBox = await test.step(`Retrieve dialog BBox for input #${i} '${input}'`, async() => {
					// Code Mirror needs a click to gain focus
					await dialogSourceLocator.click();
					await dialogSourceLocator.press('Control+A');
					await dialogSourceLocator.press('Delete');
					await dialogSourceLocator.pressSequentially(input);

					return autoCompleteDialogLocator.boundingBox();
				});

				expect(boundingBox, "Expected auto complete bounding box to be retrieved").not.toBeFalsy();

				await test.step(`Assert distance of input #${i} '${input}' from previous input is less than ${ALLOWED_AXIS_DISTANCE} in each dimension`, async () => {
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