const assert = require('assert');
const { runComplexCase, runSort, assertSort } = require('./helpers').helpers;

describe('susearch-sort empty query', () => {
	runComplexCase('', ['a', 'b', 'test']);
});

describe('susearch-sort Single Phrase', () => {
	describe('Prefer earlier to later', () => {
		runComplexCase('test', ['test', '  test']);
	});
	describe('Prefer full match to partial match', () => {
		runComplexCase('test', ['test', 'testing']);
	});
	describe('Prefer partial match to mid-word match', () => {
		runComplexCase('test', ['testing', 'untest']);
	});
	describe('Prefer more matches over fewer match', () => {
		runComplexCase('test', ['some test test', 'some test']);
	});
	describe('Prefer earlier match to later match', () => {
		runComplexCase('test', ['four test', 'sevennn test']);
	});
	describe('Complex scenario', () => {
		runComplexCase('test', [
			'test',
			'testing',
			'space test',
			'space testing',
			'space untesting'
		]);
	});
	describe('Sort alphabetically if query is empty', () => {
		runComplexCase('', ['a', 'b', 'c', 'd']);
	});
	describe('Sort alphabetically if all else is equal', () => {
		runComplexCase('test', ['a', 'b', 'c', 'd']);
	});
	describe('Upper and lower case are equal unless the words are equal in which case lowercase first', () => {
		runComplexCase('test', ['a', 'B', 'c', 'd', 'D']);
	});
});
describe('Multi word', () => {
	describe('More matches is preferred', () => {
		runComplexCase('foo bar baz', ['foobarbaz', 'barbaz', 'bazbar', 'foobar']);
	});
	describe('Exact match is preferred', () => {
		runComplexCase('duck ate pizza', ['My duck ate pizza but she is fine', 'Duck pizza ate']);
	});
	describe('Word order in query does not matter, word score matters', () => {
		runComplexCase('foo bar baz', ['baz', 'the bar', 'some fooing']);
	});
	describe('Words consisting of only special characters will also match', () => {
		runComplexCase('$@$', ['$@$', 'text with $@$', 'abc']);
	});
	describe('Full Match > match with special chars > match without special chars', () => {
		runComplexCase("foo b@r $", ['foo b@r $', 'b@r', 'test with $', 'aa', 'bb']);
	});
	describe('Words ignore special characters', () => {
		runComplexCase("'foo'$# @#@&bar)", ['foo bar is the best baz', 'aaa', 'zzz']);
	});
});
describe('susearch-sort raw-strip flag', () => {
	describe('HTML Tags -> Include by default', () => {
		runComplexCase('test', ['Z <a href="test">', 'A']);
	});
	describe('HTML Tags -> Exclude in `raw-strip`', () => {
		runComplexCase('test', ['A', 'Z <a href="test">'], ['raw-strip']);
	});
	describe('Macro invocations -> Include by default', () => {
		runComplexCase('test', ['Z <<test>>', 'A']);
	});
	describe('Macro Invocations -> Exclude in `raw-strip`', () => {
		runComplexCase('test', ['A', 'Z <<test>>'], ['raw-strip']);
	});
	describe('Filter invocations -> Include by default', () => {
		runComplexCase('test', ['Z {{{test}}}', 'A']);
	});
	describe('Filter Invocations -> Exclude in `raw-strip`', () => {
		runComplexCase('test', ['A', 'Z {{{test}}}'], ['raw-strip']);
	});
	describe('Transclusions -> Include by default', () => {
		runComplexCase('test', ['Z {{test}}', 'A']);
	});
	describe('Transclusions -> Exclude in `raw-strip`', () => {
		runComplexCase('test', ['A', 'Z {{test}}'], ['raw-strip']);
	});
	describe('Images -> Include by default', () => {
		runComplexCase('test', ['Z [img class="test" [test.jpg]]', 'A']);
	});
	describe('Images -> Exclude in `raw-strip`', () => {
		runComplexCase('test', ['A', 'Z [img class="test" [test.jpg]]'], ['raw-strip']);
	});
	const MACRO_DEF_MULTILINE_N = "\\define a(a b c)\ntest\n\\end\nB";
	const MACRO_DEF_MULTILINE_RN = "\\define bbb(a b c)\r\ntest\r\n\\end\r\nC";
	const MACRO_DEF_SINGLELINE = "\\define ccccc(a b c) test\r\nD";
	describe('Macro Definitions -> Include by default', () => {
		runComplexCase('test', [
			MACRO_DEF_MULTILINE_N,
			MACRO_DEF_MULTILINE_RN,
			MACRO_DEF_SINGLELINE,
			"\nA"
		]);
	});
	describe('Macro Definitions -> Exclude in `raw-strip`', () => {
		runComplexCase('test', [
			"\nA",
			MACRO_DEF_MULTILINE_N,
			MACRO_DEF_MULTILINE_RN,
			MACRO_DEF_SINGLELINE
		], ['raw-strip']);
	});
	describe('Arbitrary Pragmas at the start -> Include by default', () => {
		runComplexCase('test', ["\\test\r\nb", "\\bb test\r\nb", 'A']);
	});
	describe('Arbitrary Pragmas at the start -> Exclude in `raw-strip`', () => {
		runComplexCase('test', ['A', "\\bb test\r\nb", "\\test\r\nb"], ['raw-strip']);
	});
	describe('Styles -> Include by default', () => {
		runComplexCase('test', ["@@.test\nb", 'A']);
	});
	describe('Styles -> Exclude in `raw-strip`', () => {
		runComplexCase('test', ['A', "@@.test\nb"], ['raw-strip']);
	});
	describe('Typed blocks -> Include by default', () => {
		runComplexCase('test', ["$$$application/test\nb", 'A']);
	});
	describe('Typed blocks -> Exclude in `raw-strip`', () => {
		runComplexCase('test', ['A', "$$$application/test\nb"], ['raw-strip']);
	});
	describe('Manual link target -> Include by default', () => {
		runComplexCase('test', ['[[test|else]]', "[[Content|test]] b", 'A']);
	});
	describe('Manual link target -> Exclude in `raw-strip`', () => {
		runComplexCase('test', ['[[test|else]]', 'A', "[[Content|test]] b"], ['raw-strip']);
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
	const VERY_LATE_TEST = ' '.repeat(5000) + 'test';
	describe('Big check -> Include by default', () => {
		runComplexCase('test', [ALL_IN_ONE, VERY_LATE_TEST]);
	});
	describe('Typed blocks -> Exclude in `raw-strip`', () => {
		runComplexCase('test', [VERY_LATE_TEST, ALL_IN_ONE], ['raw-strip']);
	});
});
describe('susearch-sort special cases', () => {
	const toTiddlers = titles => titles.map(title => ({ fields: { title: title } }));

	it("Empty source gives empty results", () => {
		const results = runSort([], '', 'title');
		assert.deepStrictEqual(results, []);
	});
	it("Missing field is not sorted", () => {
		const results = runSort(toTiddlers(['c', 'b', 'a']), '', 'missing field');
		assertSort(results, ['c', 'b', 'a']);
	});
});