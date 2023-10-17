// @ts-check

/**
 * Returns the distances between top-left corners of two bounding boxes.
 * @param {BoundingBox} leftBB
 * @param {BoundingBox} rightBB
 * @returns {{x: number, y: number, distance: number}}
 */
export function getBoundingBoxDistance(leftBB, rightBB) {
	return {
		x: Math.abs(rightBB.x - leftBB.x),
		y: Math.abs(rightBB.y - leftBB.y),
		distance: Math.sqrt(
			Math.abs(rightBB.x - leftBB.x) ** 2
			+ Math.abs(rightBB.y - leftBB.y) ** 2
		)
	};
}