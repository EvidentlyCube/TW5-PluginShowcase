// @ts-check

import Os from 'os'

/**
 * @returns {boolean} True if the current OS is Windows
 */
export function isWindows() {
	return Os.platform() === 'win32'
}