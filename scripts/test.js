import chalk from 'chalk';
import { exec } from 'child_process';
import { spawn } from 'cross-spawn';
import { promisify } from 'util';
import enquirer from 'enquirer';
const execPromise = promisify(exec);

run();

const empty = x => x;

async function run() {
	const tests = await getTestsList();

	let selectedTest = await selectTest(tests);

	let lastAnswer = 'Rerun';
	let debugEnabled = false;
	while (true) {
		await runTest(selectedTest, debugEnabled);

		const prompt = new enquirer.Select({
			message: 'Rerun the test?',
			initial: lastAnswer,
			choices: [
				'Rerun',
				'Rerun with debug',
				'Change test',
				'Exit'
			]
		});

		lastAnswer = await prompt.run();

		switch (lastAnswer) {
			case 'Rerun':
				debugEnabled = false;
				continue;
			case 'Rerun with debug':
				debugEnabled = true;
				continue;
			case 'Change test':
				debugEnabled = false;
				selectedTest = await selectTest(tests);
				lastAnswer = 'Rerun';
				continue;
			default:
				process.exit();
				break;
		}
	}
}

async function getTestsList() {
	const { stdout, stderr } = await execPromise('npx playwright test --list --reporter=json');

	if (stderr) {
		console.error(chalk.red(stderr));
		process.exit(1);
	}

	const rawTests = JSON.parse(stdout);

	const allTests = [];

	const extractSpecs = (suite, titlePieces = []) => {
		for (const spec of suite.specs) {
			const project = spec.tests[0].projectName;

			allTests.push({
				id: spec.id,
				file: suite.file,
				project,
				title: spec.title,
				titlePath: [...titlePieces, spec.title],
				fullName: `[${project}] <${suite.file}> ${titlePieces.join(' -> ')} -> ${spec.title}`
			});
		}
	}

	const extractSuites = (suites, titlePieces = []) => {
		if (!suites || suites.length === 0) {
			return;
		}

		for (const suite of suites) {
			const title = suite.title !== suite.file ? suite.title : null;

			extractSpecs(suite, [...titlePieces, title].filter(empty))
			extractSuites(suite.suites, [...titlePieces, title].filter(empty));
		}
	}


	extractSuites(rawTests.suites);

	return allTests;
}

async function selectTest(tests) {
	const inputToMatches = input => {
		return input.split(' ').filter(empty).map(word => new RegExp(escapeRegexp(word), 'gi'));
	};

	const prompt = new enquirer.AutoComplete({
		message: 'Pick test to run',
		limit: 10,
		choices: tests.map(test => ({ name: test.fullName, value: test.id })),
		suggest(typed, choices) {
			if (!typed) {
				return choices;
			}

			const matches = inputToMatches(typed);

			return choices.filter(choice => {
				const missingMatch = matches.findIndex(match => !match.test(choice.message));

				return missingMatch === -1;
			});
		},
		async render() {
			if (this.state.status !== 'pending') {
				return await enquirer.Select.prototype.render.call(this);
			}
			const hl = this.options.highlight || this.styles.complement;

			if (!this.input) {
				return await enquirer.Select.prototype.render.call(this);
			} else {
				const matches = inputToMatches(this.input);
				const style = message => {
					for (const match of matches) {
						message = message.replace(match, str => chalk.underline.red(str));
					}

					return message;
				}

				const choices = this.choices;
				this.choices = choices.map(ch => ({ ...ch, message: style(ch.message) }));
				await enquirer.Select.prototype.render.call(this);
				this.choices = choices;
			}
		  }
	});

	const result = await prompt.run();

	return tests.find(test => test.id === result);
}

async function runTest(test, debugEnabled) {
	return new Promise((resolve, reject) => {
		const safeTitle = test.titlePath.map(title => escapeRegexp(title)).join(".+");
		const pwArgs = [
			'playwright',
			'test',
			'-g', `/${safeTitle}/i`,
			debugEnabled ? '--debug' : '',
			'--reporter=line',
			'--',
			`tests-pw/${test.file}`
		];

		const pw = spawn('npx', pwArgs.concat());

		pwArgs[3] = `"${pwArgs[3].replace(/"/, '\\"')}"`;

		console.log(``);
		console.log(`npx ${pwArgs.join(' ')}`);

		pw.stdout.on('data', function (data) {
			console.log(data.toString());
		});

		pw.stderr.on('data', function (data) {
			console.log(chalk.bgRed.white(data.toString()));
		});

		pw.on('exit', function () {
			resolve();
		});

		pw.on('error', function (e) {
			console.log(e);
		});
	});
}

function escapeRegexp(string) {
	return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}