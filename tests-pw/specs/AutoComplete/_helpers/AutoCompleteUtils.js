export class AutoCompleteUtils {
	constructor(store) {
		this.store = store;
	}

	get defaultDisplayedResults() {
		return 8;
	}

	async initTriggers(...triggers) {
		await this.store.deleteTiddlersByTag('$:/tags/EC/AutoComplete/Trigger');
		await this.store.loadFixtures(triggers);
	}


}