# Claude Code Quest

A small, zero-dependency game that teaches your team **Claude Code** in ~15 minutes a day.
One curated topic per day for 18 days, beginner → advanced. You score points for quiz
answers and hands-on practice, and earn a streak bonus for showing up every day.

No build step, no server, no dependencies — it's plain HTML/CSS/JS.

## How it works

Each day has three steps (~15 min total):

1. **Lesson** — a few short cards on one Claude Code topic.
2. **Quiz** — multiple-choice questions. 10 pts for a first-try correct answer, 5 pts if you get it after a miss.
3. **Hands-on** — honor-system "try it in Claude Code" tasks, 5 pts each.

Your day total is multiplied by a **streak bonus** (`×1.0` up to `×1.9` for a 10+ day streak),
so daily play compounds. Miss a day and the streak resets — your longest streak is kept.

**One new day unlocks each calendar day.** Finished days can be replayed for review (no points).
Earn **badges** for milestones (first day, 3/7/14-day streaks, flawless quizzes, finishing all 18).

Progress is saved **per player, in your browser** (`localStorage`) — private, no account, no backend.
Each teammate just picks a player name. Sharing a machine? Use "Switch player".

## Run it locally

Open `index.html` in any modern browser. That's it.

## Deploy for the team (GitHub Pages)

This repo is a static site, so GitHub Pages serves it directly from the default branch:

1. Push this folder to a GitHub repo.
2. In the repo: **Settings → Pages → Build and deployment → Deploy from a branch**, select `main` and `/ (root)`.
3. Share the URL: `https://<your-username>.github.io/claude-code-quest/`.

Everyone visits the URL and starts their own streak.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | App shell and screens |
| `styles.css` | Theme, layout, badge/streak visuals |
| `app.js` | Game logic: state, scoring, streaks, gating, achievements |
| `curriculum.js` | All 18 days of lessons, quizzes, and challenges |

## Customizing the content

Edit `curriculum.js`. Each day is an object:

```js
{
  day: 1,
  title: "Installation & Your First Session",
  section: "Getting Started",
  lesson:    [ { heading: "...", body: "..." } ],
  quiz:      [ { q: "...", options: ["...","..."], answer: 0, explanation: "..." } ],
  challenge: [
    { text: "Try this in Claude Code...", link: DOC + "quickstart" },
    { text: "Capstone step that builds the running project...", link: DOC + "quickstart", capstone: true }
  ]
}
```

`answer` is the 0-based index of the correct option. `body` and a challenge item's `text` may
contain simple HTML (e.g. `<code>...</code>`).

Each `challenge` item is an object:
- `text` — the hands-on instruction.
- `link` — a "Learn how →" URL shown under the task (the `DOC` constant at the top of
  `curriculum.js` is the Claude Code docs base, so `DOC + "skills"` → the Skills page).
- `capstone: true` — marks the one task per day that advances a single real project across
  all 18 days. It renders with a gold "Capstone" badge.

(Plain strings still work as challenge items too, for backward compatibility.) Add more days by
appending more objects.
