# Go To Tiddler Shortcut [TiddlyWiki5 Plugin]

A very powerful quick search/goto mechanism that you access in a fraction of a second fully through the keyboard!

 * Access the Goto modal with a configurable keyboard shortcut (defaults to `Ctrl+Shift+P`)
 * Customize the search:
	* By default it will skip drafts, tiddlers starting with `$:/` and ones with a field `goto-ignore`
	* Prefix the search with `*` to look in titles AND text
	* Prefix the search with `!` to look in all non-shadow tiddlers (and combine with the wildcard: `!*`)
	* Prefix the search with `>` to look in all regular and shadow tiddlers (and combine with the wildcard: `>*`)
	* Input a filter to search directly for it
 * Configure the template either by overriding the shadow tiddler or providing your own template tiddler
 * Full keyboard navigation (not customizable):
	* `Arrow Up` and `Arrow Down` navigate through the results list
	* `Enter` opens the selected tiddler
	* `Page Up` and `Page Down` navigate through one page of the results list
	* `Ctrl+Home` and `Ctrl+End` go directly to the start/end of the results list
	* `Escape` and `Ctr+Shift+P` closes the dialog
 * You can also select the tiddlers with a mouse

## Available customizations:

 * Provide your own filters for the results
 * Decide if the results are cleared between openings of the modal or not
 * Use your own template for a result row

## Demo:

See the demo [here](https://evidentlycube.github.io/TW5-PluginShowcase/#Go%20To%20Shortcut).

## Installation:

Drag [this link](https://evidentlycube.github.io/TW5-PluginShowcase/#%24%3A%2Fplugins%2FEvidentlyCube%2FGoToShortcut) into your TiddlyWiki 5 page/tab.