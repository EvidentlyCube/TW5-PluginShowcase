
import { resolve, dirname } from 'path';
import { readFileSync } from 'fs';
import { isWindows } from '../../../common/utils/OsUtils';

const filename = import.meta.url.replace(/^file:\/+/, isWindows() ? '' : '/');
const fixturesDir = resolve(dirname(filename));

export class AutoCompleteFixtures {
	get triggerSearchInTitle() {
		const json = readFileSync(resolve(fixturesDir, 'trigger-searchInTitle.json'), 'utf-8');

		return JSON.parse(json);
	}

	get tiddlerEditInput() {
		const json = readFileSync(resolve(fixturesDir, 'tiddler-edit-input.json'), 'utf-8');

		return JSON.parse(json);
	}

	get tiddlerEditTextArea() {
		const json = readFileSync(resolve(fixturesDir, 'tiddler-edit-textarea.json'), 'utf-8');

		return JSON.parse(json);
	}
}