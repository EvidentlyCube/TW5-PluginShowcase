
import { resolve, dirname, sep } from 'path';
import { readFileSync } from 'fs';

const filename = import.meta.url.replace(/^file:\/+/, '');
const fixturesDir = resolve(dirname(filename));

export class AutoCompleteFixtures {
	get triggerSearchInTitle() {
		const json = readFileSync(resolve(fixturesDir, 'trigger-searchInTitle.json'), 'utf-8');

		return JSON.parse(json);
	}
}