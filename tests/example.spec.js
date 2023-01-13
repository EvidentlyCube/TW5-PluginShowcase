// @ts-check
const { test, expect } = require('@playwright/test');
const { AutoCompleteTests } = require('./AutoCompleteTests');
const { TiddlyWikiUi } = require('./TiddlyWikiUi');
const { Utils } = require('./Utils');

test('homepage has title and links to intro page', async ({ page }) => {
	await AutoCompleteTests.initEnvironment(page);
	await TiddlyWikiUi.newTiddler_click(page);

});
