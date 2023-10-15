import { expect } from "playwright/test";


export async function getDialogs(page, callback, onDialog = true) {
	let dialogs = [];
	const internalDialogHandler = dialog => {
		dialogs.push(dialog.message());

		if (typeof onDialog === 'function') {
			onDialog(dialog);
		} else if (dialog) {
			dialog.accept();
		} else {
			dialog.dismiss();
		}
	};

	page.on('dialog', internalDialogHandler);
	await callback();
	page.off('dialog', internalDialogHandler);

	return dialogs;
}