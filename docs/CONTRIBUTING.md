# How to contribute

Contributions are awesome. You're awesome.

## Testing

We write Unit Tests for the code we can, and we write them in Jest. Consistency is important to maintainability so please, add Unit Tests that use Jest.

## Submitting changes

Please send a [GitHub Pull Request](https://github.com/psyked/github-jira-integration/pull/new/master) with a clear list of what you've done (read more about [pull requests](http://help.github.com/pull-requests/)). We can always use more test coverage. Please follow our coding conventions (below) and make sure all of your commits are atomic (one feature per commit).

Always write a clear log message for your commits. One-line messages are fine for small changes, but bigger changes should look like this:

    $ git commit -m "A brief summary of the commit
    > 
    > A paragraph describing what changed and its impact."

## Coding conventions

Start reading our code and you'll get the hang of it. We optimize for readability, and we use autoformatting for everything we possibly can:

  * Tabs vs. Spaces, arguments over formatting are dumb. We use ESLint, with configuration files, to do formatting.
  * This is open source software. Consider the people who will read your code, and make it look nice for them. It's sort of like driving a car: Perhaps you love doing donuts when you're alone, but with passengers the goal is to make the ride as smooth as possible.
