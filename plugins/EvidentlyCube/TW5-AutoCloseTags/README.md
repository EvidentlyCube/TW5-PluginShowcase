# Auto Close Tags [TiddlyWiki5 Plugin]

This plugin will automatically close HTML tags when typing. Please note it does not work with Code mirror!

* Works with `<$widgets>`.
* Does not trigger for `<<macroCalls>>`.
* Does not trigger for `<self-closed/>` tags.
* Does not trigger for empty `<>` tags.
* Does not trigger for elements: `<br>`, `<input>`, `<hr>` and `<img>`

It's not smart enough to know if you're currently typing inside a filter, but all it takes is hitting undo to remove the inserted closing tag when it happens to be overzealous.

## Demo:

See the demo [here](https://evidentlycube.github.io/TW5-PluginShowcase/#Auto%20Close%20Tags).

## Installation:

Drag [this link](https://evidentlycube.github.io/TW5-PluginShowcase/#%24%3A%2Fplugins%2FEvidentlyCube%2FAutoCloseTags) into your TiddlyWiki 5 page/tab.