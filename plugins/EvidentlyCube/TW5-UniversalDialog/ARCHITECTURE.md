# Universal Dialog Architecture

* Rulesets with steps define ways you can generate results
   * Each ruleset has a prefix which triggers it - it can be a single character or a sequence of multiple characters
   * Each ruleset has multiple steps which are executed one by one and their results are appended.
   * Each ruleset defines an action that is triggered when an option is selected
