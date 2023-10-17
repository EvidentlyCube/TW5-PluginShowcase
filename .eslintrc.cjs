module.exports = {
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:@typescript-eslint/strict'],
	plugins: ['@typescript-eslint'],

	rules: {
		'indent': ['error', 'tab', {
			SwitchCase: 1
		}],
	},
	globals: {
		"$tw": true,
		"window": true,
		"process": true,
	}

};
