import chalk from 'chalk';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import enquirer from 'enquirer';
const execPromise = promisify(exec);

run();

const empty = x => x;

async function run() {
	const tests = await getTestsList();

	const test = await selectTest(tests);

	while (true) {
		await runTest(test);
		const  prompt = new enquirer.BooleanPrompt({
			message:  'Rerun the test?',
			initial: true
		  });

		  const answer = await prompt.run();

		  if (!answer) {
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
	const prompt = new enquirer.AutoComplete({
		message: 'Pick test to run',
		limit: 10,
		choices: tests.map(test => ({ name: test.fullName, value: test.id }))
	});

	const result = await prompt.run();

	return tests.find(test => test.id === result);
}

async function runTest(test) {
	return new Promise((resolve, reject) => {
		const safeTitle = test.titlePath.map(title => escapeRegex(title)).join(".+");
		const pwArgs = ['playwright', 'test', '-g', `/${safeTitle}/i`, '--reporter=line', '--', `tests-pw/${test.file}`];
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

		pw.on('exit', function (code) {
			resolve();
		});
	});
}

function escapeRegex(string) {
    return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}