import Os from 'os'

export function isWindows() {
	return Os.platform() === 'win32'
}