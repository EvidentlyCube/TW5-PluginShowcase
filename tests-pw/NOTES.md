# Note 001:

TiddlyWiki will not update $edit widget if it has focus even when the edited field changed.
That's expected behavior, to avoid the widget from updating while typing in it.
This is a bit of a bummer for our tests which involve things being open in another window,
so as a solution we force blur on the inputs.