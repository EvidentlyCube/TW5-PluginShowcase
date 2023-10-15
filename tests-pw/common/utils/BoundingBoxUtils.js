

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