

export function getBoundingBoxDistance(leftBB, rightBB) {
	return {
		x: Math.abs(rightBB.x - leftBB.x),
		y: Math.abs(rightBB.y - leftBB.y),
	};
}