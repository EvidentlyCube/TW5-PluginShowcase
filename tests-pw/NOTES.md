# Note#001:

TiddlyWiki will not update $edit widget if it has focus even when the edited field changed.
That's expected behavior, to avoid the widget from updating while typing in it.
This is a bit of a bummer for our tests which involve things being open in another window,
so as a solution we force blur on the inputs.

# Note#002:

Playwright fixture support works great when used with TypeScript but is a bit of a hell if
you try to use pure JS. The solution used to have proper code completion in VSCode
was taken from [this comment](https://github.com/microsoft/playwright/issues/7890#issuecomment-1369828521)
by **Andrew Hobson** on Playwright's GitHub issues.