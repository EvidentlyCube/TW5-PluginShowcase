# Advanced Performance [TiddlyWiki5 Plugin]

Expand TiddlyWiki's performance instrumentation and make its results available directly in your wiki, without having to use developer console of the browser.

After installing this plugin and enabling performance instrumentation (Control Panel -> Settings -> Performance Instrumentation) you'll see a ne widget sticked to the bottom of the page with various measurements. You can also click Show details to open a window with refresh and filter logs. Feel free to click it right now.

## Tips

* Absolute gains are important. Optimizing **100ms** and **1ms** filter by 10% results in 10ms and 0.1ms improvement, respectively. The former is clearly better.
	* But if the 1ms filter runs a hundred times per refresh it'll also net you **10ms** improvement.
* Keep in mind that some filters (notably `backlinks[]`) take a lot of time the first time they run, after which they are super fast. This makes **Total longest execution** imperfect without additional context.
* Keep in mind you can move your mouse over **Total time (last 10)** to see the last 10 execution times for a filter.

## How to Use

* Install the plugin
* Enable //Performance Instrumentation// (Control Panel -> Settings -> Performance Instrumentation)
* Save wiki
* Refresh the page

The bottom widget will now be available and advanced instrumentation will happen. The functionality of this plugin can be easily toggled off by disabling //Performance Instrumentation// and refreshing the page.

## Demo:

See the demo [here](https://evidentlycube.github.io/TW5-PluginShowcase/#Advanced%20Performance).

## Installation:

Drag [this link](https://evidentlycube.github.io/TW5-PluginShowcase/#%24%3A%2Fplugins%2FEvidentlyCube%2FAdvancedPerformance) into your TiddlyWiki 5 page/tab.