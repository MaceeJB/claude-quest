# Claude Quest

A small, zero-dependency game that teaches your team **Claude Code** in ~15 minutes a day.
One curated topic per day for 19 days (18 core lessons plus a bonus), beginner → advanced. You score points for quiz
answers and hands-on practice, and earn a streak bonus for showing up every day.

No build step, no server, no dependencies — it's plain HTML/CSS/JS.

## How it works

Each day has three steps (~15 min total):

1. **Lesson** — a few short cards on one Claude Code topic.
2. **Quiz** — multiple-choice questions. 10 pts for a first-try correct answer, 5 pts if you get it after a miss.
3. **Hands-on** — honor-system "try it in Claude Code" tasks, 5 pts each.

Your day total is multiplied by a **streak bonus** (`×1.0` up to `×1.9` for a 10+ day streak),
so daily play compounds. Miss an active day and the streak resets — but a **streak freeze** (one per
week) automatically forgives a single missed day, and your longest streak is always kept.

**Weekends and team holidays are free days:** the cohort plays on weekdays, so Saturdays, Sundays,
and any dates listed in `REST_HOLIDAYS` (in `app.js`) never count against a streak and don't advance
the daily pace. A player who only ever plays weekdays stays perfectly on schedule. (The defaults are
Juneteenth and the observed July 4th; edit that list for your own calendar.)

**The quest is paced at one lesson a weekday**, anchored to the day each player starts. Teammates can
**work up to 2 days ahead** if they have time, or do **several lessons in a row to catch up** if
they've fallen behind — the daily pace is the center of gravity, not a hard wall. Finished days can
be replayed for review (no points). Earn **badges** for milestones (first day, 3/7/14-day streaks,
flawless quizzes, finishing all 19).

Progress is saved **per player, in your browser** (`localStorage`) by default — private, no account.
Each teammate just picks a player name. Sharing a machine? Use "Switch player".

Players who want their progress to **follow them across devices** (laptop one day, phone the next)
can instead **sign in with their email**. See [Cross-device sync](#cross-device-sync-supabase) below.

## Run it locally

Open `index.html` in any modern browser. That's it.

## Deploy for the team (GitHub Pages)

This repo is a static site, so GitHub Pages serves it directly from the default branch:

1. Push this folder to a GitHub repo.
2. In the repo: **Settings → Pages → Build and deployment → Deploy from a branch**, select `main` and `/ (root)`.
3. Share the URL: `https://<your-username>.github.io/claude-quest/`.

Everyone visits the URL and starts their own streak.

## Cross-device sync (Supabase)

By default the game stores progress in each browser's `localStorage`, so it can't follow a
player from one device to another. The optional **email sign-in** fixes that: a teammate enters
their email, clicks a one-time "magic link" we email them, and from then on their points, streak,
and badges sync to every device they sign in on. There's still **no password** to manage and
**no server for you to run** — a free hosted Supabase project does the storage and login.

### How it works

- The page loads the Supabase JS client from a CDN (`<script>` tag in `index.html`) and creates a
  client using two **public** values near the top of `app.js`: `SUPABASE_URL` and `SUPABASE_KEY`.
- Login uses Supabase's passwordless **magic link** (`signInWithOtp`). After clicking the email
  link, the player lands back on the app already signed in and stays signed in on that device.
- Each player's whole state object is stored as one row in a `progress` table, keyed to their
  account id. **Row Level Security (RLS)** policies guarantee each person can only read/write
  their own row — which is why the public key is safe to ship in the page.
- `localStorage` is still used as an offline cache, and the first time someone signs in, any
  progress already in that browser is **auto-imported** into their account so nothing is lost.
- If the Supabase script ever fails to load, the app silently falls back to **local-only** mode —
  the "Just play on this device" path always works.

### Pointing it at a different Supabase project

If you ever need to move this to a new Supabase project (new owner, new org, etc.):

1. Create a project at [supabase.com](https://supabase.com), then in the **SQL Editor** run:

   ```sql
   create table if not exists public.progress (
     user_id uuid primary key references auth.users(id) on delete cascade,
     player_name text,
     data jsonb not null default '{}'::jsonb,
     updated_at timestamptz not null default now()
   );

   alter table public.progress enable row level security;

   create policy "read own progress"   on public.progress
     for select using (auth.uid() = user_id);
   create policy "insert own progress" on public.progress
     for insert with check (auth.uid() = user_id);
   create policy "update own progress" on public.progress
     for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
   ```

2. In **Authentication → URL Configuration**, set the **Site URL** and add a **Redirect URL**
   matching where the app is hosted (e.g. `https://maceejb.github.io/claude-quest/`). Magic-link
   emails bounce to the wrong place without this.
3. In **Project Settings → API Keys**, copy the **Project URL** and the **publishable key**
   (`sb_publishable_…`, labeled "safe to share publicly"). Paste them into the `SUPABASE_URL`,
   `SUPABASE_KEY`, and `REDIRECT_URL` constants at the top of `app.js`, then commit and push.

> ⚠️ Only the **publishable** key belongs in the code. Never commit the **secret** key or the
> database password — the app doesn't need them, and the RLS policies above are what actually
> protect player data.

> ℹ️ Supabase's built-in email sender has a modest rate limit on the free tier and its messages
> sometimes land in spam. That's fine for a team signing in over a few days; if a whole team signs
> up within the same few minutes, tell them to check their junk folder if the link is slow.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | App shell and screens |
| `styles.css` | Theme, layout, badge/streak visuals |
| `app.js` | Game logic: state, scoring, streaks, gating, achievements, and cross-device sync |
| `curriculum.js` | All 19 days of lessons, quizzes, and challenges |

## Reviewing the content (for maintainers)

Days 2–19 normally unlock one per calendar day, which makes it hard to review
everything at once. Two tools help:

- **Preview all days** — a button in the top-right of the home screen. Click it to
  unlock every day immediately; each one opens in **review mode** (read the lesson,
  take the quiz, see the hands-on tasks) with **no points awarded and no effect on
  any streak**. Click again ("Preview: ON") to turn it off. This is safe to use on
  the live site — it only affects your own view. (Console equivalents also exist:
  `CCQ.previewAll()`, `CCQ.previewOff()`, and `CCQ.preview(n)` to jump to one day.)
- **Suggest an improvement** — at the bottom of each day's results screen there's a
  "💡 Suggest an improvement for this day" link that opens a pre-filled email (to the
  address set in `app.js`, currently `MaceeJB@gmail.com`) with the day number already
  in the subject. No GitHub account needed — participants just hit send.

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
- `capstone: true` — marks the one task per day that advances the player's current **Capstone
  project**. It renders with a gold "Capstone" badge.

(Plain strings still work as challenge items too, for backward compatibility.) Add more days by
appending more objects.

### Capstone projects (`window.PROJECTS`)

The first 18 days are grouped into **three multi-day Capstone projects** (6 + 6 + 6 days), defined as
`window.PROJECTS` at the bottom of `curriculum.js`. Project 1 ("Learn something new") lets each
player pick a subject and have Claude build them a learning kit; Project 2 ("Build a work helper")
builds a real tool connected to their apps and data; Project 3 ("Automate & ship it") automates it
end to end and puts it in git. Each project is one object:

```js
{ id: 1, emoji: "📘", title: "Learn something new", tagline: "…", start: 1, end: 6 }
```

`start`/`end` are inclusive day numbers; the **last day of each block is its finale** (shown with a
🎉 celebration on the results screen). Edit the themes, taglines, or block lengths freely — just
keep the day ranges contiguous and covering 1…18. The app surfaces these in three places: a
**Projects tracker** on the home screen, a **banner** on each day's hands-on screen, and the
**project-complete celebration** on finale days. The capstone `text` of each day should tell a
coherent story across its block (kickoff → middle days → finale).

**Day 19 is a standalone bonus lesson** (on the `/goal` command, inspired by an AI Daily Brief
episode) that sits *outside* the three projects — it has no capstone task and no project banner, so
the projects cleanly cover days 1…18 while the quest itself runs 19 days. Adding more bonus days
works the same way: append a day object with no `capstone: true` item and leave it out of
`window.PROJECTS`.
