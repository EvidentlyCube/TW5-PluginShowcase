// @ts-check

/**
 * Runs page interactions (or whatever you put into callback), handles all dialogs that execute during that time
 * and then returns the handled dialogs.
 *
 * @param {import("playwright/test").Page} page Page which should handle the dialogs
 * @param {function():Promise<void>} pageInteractionsCallback Function to call to invoke page interactions
 * @param {boolean|function(import("playwright/test").Dialog): void} onDialog Default option to chose in the dialog
 * (if it's bool) or a callback that will handle the dialog.
 *
 * @returns {Promise<import("playwright/test").Dialog[]>}
 */
export async function getDialogs(page, pageInteractionsCallback, onDialog = true) {
	let dialogs = [];
	/**
	 * @param {import("playwright/test").Dialog} dialog
	 */
	const internalDialogHandler = dialog => {
		dialogs.push(dialog);

		if (typeof onDialog === 'function') {
			onDialog(dialog);
		} else if (dialog) {
			dialog.accept();
		} else {
			dialog.dismiss();
		}
	};

	page.on('dialog', internalDialogHandler);
	await pageInteractionsCallback();
	page.off('dialog', internalDialogHandler);

	return dialogs;
}