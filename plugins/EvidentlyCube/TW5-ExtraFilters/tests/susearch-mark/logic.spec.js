/* cSpell:disable */

const { runComplexCase } = require('./helpers').helpers;

describe('susearch-mark simple cases', () => {
	it('Mark full phrase', () => {
		runComplexCase('much testing', 'much testing', '<mark>much testing</mark>');
	});
	it('Mark individual words', () => {
		runComplexCase('much testing', 'testing much', '<mark>testing</mark> <mark>much</mark>');
		runComplexCase('much testing', 'too much doing testing here', 'too <mark>much</mark> doing <mark>testing</mark> here');
	});
	it('Mark parts of words', () => {
		runComplexCase('to', 'toad burrito stork', '<mark>to</mark>ad burri<mark>to</mark> s<mark>to</mark>rk');
	});
	it('Mark special characters', () => {
		runComplexCase('$$ @@', '$$ollars mail@@notmail', '<mark>$$</mark>ollars mail<mark>@@</mark>notmail');
	});
	it('Mark normal-special character mix', () => {
		runComplexCase('$ollar$', '$ollar$', '<mark>$ollar$</mark>');
	});
	it('Mark without special characters', () => {
		runComplexCase('$ollar$', 'collars', 'c<mark>ollar</mark>s');
	});
	it('Marking is case-insensitive', () => {
		runComplexCase('TEST', 'test TesT TEST', '<mark>test</mark> <mark>TesT</mark> <mark>TEST</mark>');
	});
});
describe('susearch-mark mode: default', () => {
	it('Marks everywhere indiscriminately', () => {
		runComplexCase(
			'test',
			"\\define test() test\n"
			 + '<test href="test">test</test>',
			"\\define <mark>test</mark>() <mark>test</mark>\n"
			 + '<<mark>test</mark> href="<mark>test</mark>"><mark>test</mark></<mark>test</mark>>'
		);
	});
});
const ALL_IN_ONE = `\\whitespace test
\\define test(a)
test
\\end
\\define test2(test) test

<a href="test-attr">a-test</a>
<<test-macro>>
{{test-transclude}}
{{{test-filter}}}
@@.class-test
styled-test
@@

$$$application/test
content-test
$$$

[img test=test[test]]
[[link-test|test]]
[[test]]
''bold-test''
//italic-test//
__underline-test__
\`code-test\`
~~strikethrough-test~~

! Heading-test

\`\`\`
pre-test
\`\`\`
separate-test`;
describe('susearch-mark mode: raw-strip', () => {
	it('Strips all wikitext and adds the markings', () => {

		const ALL_IN_ONE_MARKED = `
a-<mark>test</mark>



styled-<mark>test</mark>

content-<mark>test</mark>


link-<mark>test</mark>

bold-<mark>test</mark>
italic-<mark>test</mark>
underline-<mark>test</mark>
code-<mark>test</mark>
strikethrough-<mark>test</mark>

Heading-<mark>test</mark>


pre-<mark>test</mark>

separate-<mark>test</mark>`
	runComplexCase(
		'test',
		ALL_IN_ONE,
		ALL_IN_ONE_MARKED,
		['raw-strip']
	);
	});
});
describe('susearch-mark mode: wikify-strip', () => {
	it('Parse wikitext into html, extract just the text and mark it', () => {
		const ALL_IN_ONE_MARKED = `a-<mark>test</mark>


<mark>test</mark>-filter
styled-<mark>test</mark>
content-<mark>test</mark>
<mark>test</mark>
bold-<mark>test</mark>
italic-<mark>test</mark>
underline-<mark>test</mark>
code-<mark>test</mark>
strikethrough-<mark>test</mark>Heading-<mark>test</mark>pre-<mark>test</mark>separate-<mark>test</mark>`
		runComplexCase(
			'test',
			ALL_IN_ONE,
			ALL_IN_ONE_MARKED,
			 ['wikify-strip']
		);
	})
});
describe('susearch-mark mode: wikify-safe', () => {
	it('Wikifies the wikitext and safely adds markings not breaking the HTML', () => {
		const ALL_IN_ONE_MARKED = `<p><a href="test-attr">a-<mark>test</mark></a>


<span><a class="tc-tiddlylink tc-tiddlylink-missing" href="#test-filter"><mark>test</mark>-filter</a></span>
<span class="tc-inline-style  class-test
">styled-<mark>test</mark>
</span></p><pre><code>content-<mark>test</mark></code></pre><p><img class=" tc-image-loading" src="test" title="[link-test">
<a class="tc-tiddlylink tc-tiddlylink-missing" href="#test"><mark>test</mark></a>
<strong>bold-<mark>test</mark></strong>
<em>italic-<mark>test</mark></em>
<u>underline-<mark>test</mark></u>
<code>code-<mark>test</mark></code>
<strike>strikethrough-<mark>test</mark></strike></p><h1 class="">Heading-<mark>test</mark></h1><pre><code>pre-<mark>test</mark></code></pre><p>separate-<mark>test</mark></p>`;

		runComplexCase(
			'test',
			ALL_IN_ONE,
			ALL_IN_ONE_MARKED,
			 ['wikify-safe']
		);
	});
});

describe('susearch-mark special cases', () => {
	const toTiddlers = titles => titles.map(title => ({ fields: { title: title } }));
	it('Empty query makes no changes', () => {
		runComplexCase('', '', '');
		runComplexCase('', 'test', 'test');
		runComplexCase('', 'test with spaces', 'test with spaces');
	});
	it('Customize template', () => {
		runComplexCase(['test', "''$1''"], 'test', "''test''");
	});
});