# Field Propagator [TiddlyWiki5 Plugin]

Propagates a value of a field upwards, through tiddler parents. It was developed to allow marking tiddlers as public/private, and to propagate the information up its parents if the parent has any public children, which was then displayed in a custom table of contents.

Field parent is used to determine tiddler's parent, rather than tags.

Currently it only really supports yes/no field propagation (eg. whether the parent has any visible children).

## How to Use

Every tree root must have the following fields defined:

 * `propagator-base` - name of the field which is propagated, eg. visible
 * `propagator-propagated` - name of the field in parents to indicate children's base field value, eg. has-visible-children.
 * `propagator-preferred-value` - the value that has most priority. By default the propagated field will be populated with the value of the last child, but if any child has this value, it'll take priority and will be used instead.

## Demo:

See the demo [here](https://evidentlycube.github.io/TW5-PluginShowcase/#Field%20Propagator).

## Installation:

Drag [this link](https://evidentlycube.github.io/TW5-PluginShowcase/#%24%3A%2Fplugins%2FEvidentlyCube%2FFieldPropagator) into your TiddlyWiki 5 page/tab.