# Contributing

1.  Fork the project and clone your fork.

2.  Create a local feature branch: `$ git checkout -b <branch>`

3.  If adding a function `K.foo`, define it in `src/foo.js`, export it from `src/index.js`, and include unit tests in `__tests__/foo.tests.js`.

4.  Make one or more atomic commits. Each commit should have a descriptive commit message. Commit title should be < 50 characters, and body should be wrapped at 80 characters. There are some good resources available on [writing good commit messages](https://chris.beams.io/posts/git-commit/) and [when to make a git commit](https://dev.to/gonedark/when-to-make-a-git-commit).

5.  Run `npm test` and address any errors. Preferably, fix commits in place using `git rebase` or `git commit --amend` to make the changes easier to review and to keep the history tidy.

6.  Push to your fork: `$ git push origin <branch>`

7.  Open a pull request.