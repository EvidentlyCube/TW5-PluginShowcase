// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 * @type {import('@playwright/test').PlaywrightTestConfig}
 */
export default defineConfig({
	testDir: './tests-pw',

	// Maximum time
	timeout: 30 * 1000,
	expect: {
		// Default expect timeout
		timeout: 5000
	},
	fullyParallel: true,

	forbidOnly: !!process.env.CI,

	// Do not retry failing tests, there should never be any race conditions in TW
	retries: 0,

	// Single worker for now
	workers: 1,

	reporter: 'html',

	use: {
		actionTimeout: 2000,

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: 'on-first-retry',
		screenshot: 'only-on-failure'
	},

	projects: [
		{
			name: 'sanity',
			fullyParallel: true,
            testMatch: /SanityTests\.js/,
			use: {
				...devices['Desktop Chrome'],
			},
		},
		{
			name: 'chromium',
			dependencies: ['sanity'],
			use: {
				...devices['Desktop Chrome'],
			},
		}
	],
});