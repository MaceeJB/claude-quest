# Contributing to Claude Code Quest

This app's content lives in plain files — **you don't need to be a developer** to
improve it. The most common change is editing a lesson, quiz, or challenge, and all
of that lives in one file: **`curriculum.js`**.

This guide explains how to make a change safely and get it live for the team.

## The big picture

- The app is a static website hosted on **GitHub Pages**.
- When a change lands on the `main` branch on GitHub, the live site rebuilds
  automatically (usually within a minute).
- Nothing you do locally affects the team until you **push** it to GitHub.

So you can edit and preview freely on your own machine with zero risk.

## Editing the content

All 18 days live in `curriculum.js` as a list of objects. Each day looks like this:

```js
{
  day: 1,
  title: "Installation & Your First Session",
  section: "Getting Started",
  lesson:    [ { heading: "...", body: "..." } ],
  quiz:      [ { q: "...", options: ["...", "..."], answer: 0, explanation: "..." } ],
  challenge: [ "Try this in Claude Code..." ]
}
```

Tips:
- `answer` is the **0-based** index of the correct option (so `0` = the first option).
- `body`, `explanation`, and `challenge` text may contain simple HTML like `<code>...</code>`.
- To add a whole new day, copy an existing day object, bump the `day` number, and
  fill in the content.

To preview your edit, just open `index.html` in your browser. (Tip: in your browser
settings, allow local storage so your test progress saves.)

## Proposing a change (the team-friendly way)

If you want your change reviewed before it goes live, use a **branch + pull request**.
This keeps `main` (the live version) safe while your idea gets a look.

```bash
# 1. Get the latest version
git pull

# 2. Make a branch for your change (name it whatever describes the change)
git checkout -b fix-day9-typo

# 3. ...edit curriculum.js in your editor, then preview index.html...

# 4. Save your change to git history
git add curriculum.js
git commit -m "Fix typo in Day 9 lesson"

# 5. Send it up to GitHub
git push -u origin fix-day9-typo
```

Then go to the repo on github.com — it'll offer a button to **open a pull request**.
A maintainer reviews it and merges it. Once merged into `main`, the live site updates.

## Pushing directly (for maintainers)

If you maintain the project and want a change live immediately, you can commit
straight to `main`:

```bash
git pull
# ...make your edits...
git add curriculum.js
git commit -m "Add Day 19: Custom output styles"
git push
```

GitHub Pages rebuilds automatically. Give it about a minute, then refresh the site.

## Undo / safety net

Git keeps a full history, so mistakes are recoverable:

- See recent changes: `git log --oneline`
- Discard un-committed edits to a file: `git checkout -- curriculum.js`
- Roll the whole project back to an earlier commit: ask a maintainer (or Claude Code)
  to help with `git revert` — it undoes a change while keeping history intact.

When in doubt, make a branch (step 2 above) instead of editing `main` directly.
