# Roadmap

Note that the below ideas and known bugs may or may not be implemented/fixed. The purpose of this
is for me to not lose track of things.

# Ideas
* Allow defining "Post-insert Suffix Gobbler Filter", a filter which returns a list of suffixes that will be removed
	after the insertion if they occur right after the insertion point; eg for use with `codemirror-closebrackets` to
	remove auto-inserted `]]` after inserting a tiddler.


# Known Bugs
* When using with `tiddlywiki/codemirror-autocomplete` it triggers both auto completions