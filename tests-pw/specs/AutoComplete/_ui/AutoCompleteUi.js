import { AutoCompleteWindowUi } from "./AutoCompleteWindowUi";


export class AutoCompleteUi {
	constructor(page) {
		this.page = page;
	}

	forPage(page) {
		return new AutoCompleteUi(page);
	}

	get autoCompleteWindow() {
		return new AutoCompleteWindowUi(this.page);
	}
}