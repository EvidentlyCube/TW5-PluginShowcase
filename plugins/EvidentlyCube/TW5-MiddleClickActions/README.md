# Middle Click Actions [TiddlyWiki5 Plugin]

Allows invoking an action when middle click is pressed on an element.

Initially developed as a way to close open tabs with middle click
(an extension to [[BJ/StoryTabs|http://bjtools.tiddlyspot.com/]] plugin).

## How to use:

Use it as you'd use action widgets normally:

```
<$button>
<$middle-click-actions>
<$action-sendmessage $message="tm-new-tiddler"/>
</$middle-click-actions>
Do nothing on Click but create new draft on Middle Click.
</$button>
```

* `<$middle-click-actions/>` widget must be a direct child of the widget/UI element that you want to react to the middle click, since it attaches itself to its parent and listens on clicks on there.
* The widget does not need to be the first child.
* Any actions defined inside this widget will be protected from being invoked by any parent widget

## Demo:

See the demo [here](https://evidentlycube.github.io/TW5-PluginShowcase/#Middle%20Click%20Actions).

## Installation:

Drag [this link](https://evidentlycube.github.io/TW5-PluginShowcase/#%24%3A%2Fplugins%2FEvidentlyCube%2FMiddleClickActions) into your TiddlyWiki 5 page/tab.