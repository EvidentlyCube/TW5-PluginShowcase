# Auto Complete [TiddlyWiki5 Plugin]

A versatile, customizable and easy to use auto completion plugin for TiddlyWiki.

* Auto complete anything you want:
	* Tiddler titles
	* Field values
	* Any filter result
* Define your own triggers
	* Customize the filter which retrieves the suggestions
	* Customize template used for inserting the selected suggestion
	* Customize how the suggestions are displayed in the completion window
	* Control auto-triggering separately for inputs and text areas
* Clear interface for editing the triggers
* Manually open auto complete with customizable keyboard shortcut

## Plugin compatibility

* The official [CodeMirror](https://tiddlywiki.com/plugins/tiddlywiki/codemirror/) plugin -- Auto Complete triggers automatically, manually and is fully interactive
	* Also with its plugin **CodeMirror Close Brackets**, if your trigger uses one of the characters that gets its mirror auto inserted it will still automatically open Auto Completion on typing
	* Also with its plugin **CodeMirror Autocomplete**, this plugin's dialog will take priority over the CodeMirror one and will prevent both of them from spawning at the same time
 * [Streams](https://saqimtiaz.github.io/streams/) by *saqimtiaz* -- Pressing Enter to Auto Complete won't trigger a new stream insertion
 * [SideEditor](http://sideeditor.tiddlyspot.com/) by *Mat von Twaddle* -- Auto Completion only appears in the currently focused window

# How to use

* After installing head to the Control Panel and open the tab ''Evidently Cube''
* Create a new trigger using the button
	* It will be filled with sensible defaults
	* Customize the trigger to your heart's content
* At any time press <kbd>Ctrl+Space</kbd> right in front of a defined trigger to open the completion window manually
	* Or use a different keyboard shortcut you defined

## Demo:

See the demo [here](https://evidentlycube.github.io/TW5-PluginShowcase/#Auto%20Complete).

## Installation:

Drag [this link](https://evidentlycube.github.io/TW5-PluginShowcase/#%24%3A%2Fplugins%2FEvidentlyCube%2FAutoComplete) into your TiddlyWiki 5 page/tab.
# Screenshots

**Completion in action:**<br>
<a href="images/completion.png?raw=true">
<img src="images/completion.png?raw=true" width="250">
</a>

**Options:**<br>
<a href="images/settings.png?raw=true">
<img src="images/settings.png?raw=true" width="250">
</a>

**Editing triggers:**<br>
<a href="images/trigger.png?raw=true">
<img src="images/trigger.png?raw=true" width="250">
</a>

Work in progress, do not use yet

