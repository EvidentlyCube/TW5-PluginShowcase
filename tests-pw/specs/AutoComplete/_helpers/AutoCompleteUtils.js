import { TiddlerStore } from "../../../common/core/TiddlerStore";


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
				case 'autoTriggerTextarea':
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
}