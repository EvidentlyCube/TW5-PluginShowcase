export async function repeatUntilNotNull(attempts, callback, message) {
	while (attempts-- > 0) {
		const result = await callback();

		if (result) {
			return result;
		}
	}

	throw new Error(
		message
			? `Repeat-Until has failed: ${message}`
			: `Repeat-Until has failed.`
	);
}