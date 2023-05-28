const assert = require('assert');
const { runComplexCase, runSearch, assertResults } = require('./helpers').helpers;

describe('susearch empty query returns everything', () => {
	runComplexCase('', ['', 'b', 'test'], []);
});

describe('susearch simple cases', () => {
	describe('Match full phrase', () => {
		runComplexCase('much testing', ['much testing', 'this is much testing result'], ['soup']);
	});
	describe('Match all words in any order', () => {
		runComplexCase('much testing', ['much testing', 'testing much', 'testing is too much'], ['much', 'testing', 'soup']);
	});
	describe('Match words partially', () => {
		runComplexCase('much testing', ['mucho atesting', 'atestingo amucho'], ['soup']);
	});
	describe('Match words with special characters and stripping them (query with special chars)', () => {
		runComplexCase("can't it's", ["can't it's", 'cant its', "can't its", "cant it's"], ['soup']);
	});
	describe('Match words with special characters and stripping them (query without special chars)', () => {
		runComplexCase("cant its", ["can't it's", 'cant its', "can't its", "cant it's"], ['soup']);
	});
	describe('Only special characters will also match', () => {
		runComplexCase('$#@', ['$#@', '$#@@#$'], ['$@#']);
	});
	describe('Search is case-insensitive', () => {
		runComplexCase('TEST', ['test', 'TesT', 'TEST'], ['soup']);
	});
});
describe('susearch invert will return non-matching results', () => {
	runComplexCase('Test', ['soup'], ['test'], [], '!');
});
describe('susearch some-words flag', () => {
	describe('Include results even if only one word matches', () => {
		runComplexCase(
			'this iss sparta',
			['this', 'sparta', "iss"],
			['soup'],
			['some-words']
		)
	});
});
describe('susearch ordered flag', () => {
	describe('Include results only if the words are matched in the same order', () => {
		runComplexCase(
			'duck prince',
			['duck prince', 'duck is prince', 'a prince duck duck is the best prince duck'],
			['prince duck', 'duprinceck'],
			['ordered']
		)
	})
})
describe('susearch raw-strip flag', () => {
	const mashup = (text, prefix="a", suffix="b") => {
		const prefixes = ['', "\n", "\r\n", `${prefix}\n`, `${prefix}\r\n`];
		const suffixes = ['', "\n", "\r\n", `\n${suffix}`, `\r\n${suffix}`];
		return prefixes.reduce((all, prefix) => {
			return all.concat(...suffixes.map(suffix => `${prefix}${text}${suffix}`));
		}, [])
	};

	describe('HTML Tags -> Include by default', () => {
		runComplexCase('test', ['test', ...mashup('<a href="test">')], []);
	});
	describe('HTML Tags -> Exclude in `raw-strip`', () => {
		runComplexCase('test', ['test'], mashup('<a href="test">'), ['raw-strip']);
	});
	describe('Macro invocations -> Include by default', () => {
		runComplexCase('test', ['test', ...mashup('<<test>>')], []);
	});
	describe('Macro Invocations -> Exclude in `raw-strip`', () => {
		runComplexCase('test', ['test'], mashup('<<test>>'), ['raw-strip']);
	});
	describe('Filter invocations -> Include by default', () => {
		runComplexCase('test', ['test', ...mashup('{{{test}}}')], []);
	});
	describe('Filter Invocations -> Exclude in `raw-strip`', () => {
		runComplexCase('test', ['test'], mashup('{{{test}}}'), ['raw-strip']);
	});
	describe('Transclusions -> Include by default', () => {
		runComplexCase('test', ['test', ...mashup('{{test}}')], []);
	});
	describe('Transclusions -> Exclude in `raw-strip`', () => {
		runComplexCase('test', ['test'], mashup('{{test}}'), ['raw-strip']);
	});
	describe('Images -> Include by default', () => {
		runComplexCase('test', ['test', ...mashup('[img class="test" [test.jpg]]')], []);
	});
	describe('Images -> Exclude in `raw-strip`', () => {
		runComplexCase('test', ['test'], mashup('[img class="test" [test.jpg]]'), ['raw-strip']);
	});
	const MACRO_DEF_MULTILINE_N = "\\define a(a b c)\ntest\n\\end";
	const MACRO_DEF_MULTILINE_RN = "\\define bbb(a b c)\r\ntest\r\n\\end";
	const MACRO_DEF_SINGLELINE1 = "\\define ccccc(a b c) test";
	describe('Macro Definitions -> Include by default', () => {
		runComplexCase('test', [
			...mashup(MACRO_DEF_MULTILINE_N),
			...mashup(MACRO_DEF_MULTILINE_RN),
			...mashup(MACRO_DEF_SINGLELINE1),
			"test"
		]);
	});
	describe('Macro Definitions -> Exclude in `raw-strip`', () => {
		runComplexCase('test',
			['test'], [
				...mashup(MACRO_DEF_MULTILINE_N),
				...mashup(MACRO_DEF_MULTILINE_RN),
				...mashup(MACRO_DEF_SINGLELINE1),
		], ['raw-strip']);
	});
	describe('Arbitrary Pragmas at the start -> Include by default', () => {
		runComplexCase('test', ['test', ...mashup("\\test", "\n  \r\n")], []);
	});
	describe('Arbitrary Pragmas at the start -> Exclude in `raw-strip`', () => {
		runComplexCase('test', ['test'], mashup("\\test", "\n  \r\n"), ['raw-strip']);
	});
	describe('Styles -> Include by default', () => {
		runComplexCase('test', ['test', ...mashup("@@.test")], []);
	});
	describe('Styles -> Exclude in `raw-strip`', () => {
		runComplexCase('test', ['test'], mashup("@@.test"), ['raw-strip']);
	});
	describe('Typed blocks -> Include by default', () => {
		runComplexCase('test', ["test",...mashup("$$$application/test")]);
	});
	describe('Typed blocks -> Exclude in `raw-strip`', () => {
		runComplexCase('test', ["test"], mashup("$$$application/test"), ['raw-strip']);
	});
	describe('Manual link target -> Include by default', () => {
		runComplexCase('test', [...mashup('[[test|else]]'), ...mashup("[[Content|test]]")], []);
	});
	describe('Manual link target -> Exclude in `raw-strip`', () => {
		runComplexCase('test', mashup('[[test|else]]'), mashup("[[Content|test]] b"), ['raw-strip']);
	});
	const ALL_IN_ONE = `\\test
\\whitespace test
\\define test(a)
test
\\end
\\define test2(test) test

<a href="test">contents</a>
<<test>>
{{test}}
{{{test}}}
@@.test
styled
@@
$$$application/test
content
$$$
[img test=test[test]]
[[link|test]]
[[test]]
`;
	describe('Big check -> Include by default', () => {
		runComplexCase('test', ['test', ALL_IN_ONE]);
	});
	describe('Typed blocks -> Exclude in `raw-strip`', () => {
		runComplexCase('test', ['test'], [ALL_IN_ONE], ['raw-strip']);
	});
});
describe('susearch special cases', () => {
	const toTiddlers = titles => titles.map(title => ({ fields: { title: title } }));

	it("Empty source gives empty results", () => {
		const results = runSearch([], '', 'title');
		assert.deepStrictEqual(results, []);
	});
	it("Empty query gives back all results", () => {
		runComplexCase('', ['test'], [], ['raw-strip']);
	});
	it("Missing field is treated as no value", () => {
		const results = runSearch(toTiddlers(['c', 'b']), 'test', 'missing field');
		assertResults(results, []);
	});
	it("Missing field with no query still returns results", () => {
		const results = runSearch(toTiddlers(['c', 'b']), '', 'missing field');
		assertResults(results, ['c', 'b']);
	});
	describe("Spaces are respected", () => {
		runComplexCase('sand', ['sand', 'sandwich', 'thousand'], ['this and that'], ['raw-strip']);
	});
});