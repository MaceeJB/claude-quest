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

## Team engagement features

Two lightweight, **non-competitive** features encourage the team without a leaderboard:

- **Share my progress** — a "📣 Share" button (home top bar) and a "📣 Share my progress" button
  (results screen) copy a friendly, ready-made status to paste into Slack/Teams, e.g.
  *"🚀 Just finished Day 7 (Auto Memory) of Claude Quest — on a 5-day streak 🔥 (7/19 days done).
  My AI floor is rising. Play along: …"*. It's opt-in, names no one but the sharer, and needs **no
  backend** — it works the moment you deploy.
- **Team progress bar** — a cooperative "🤝 Team progress" panel on the home screen showing the
  whole team's **combined** lessons completed and how many teammates played today. No ranking, no
  individual call-outs — just shared momentum. This one reads aggregate stats from Supabase, so it
  needs the one-time setup below. **Until you run that SQL, the panel simply stays hidden** (the app
  degrades gracefully), so the Share button works regardless.

### Enabling the team progress bar (one-time Supabase setup)

Only **signed-in (synced)** teammates count toward the totals — local-only players aren't stored in
the cloud, so encourage the team to sign in with their email (the magic-link flow above).

In the Supabase **SQL Editor**, run this once. It creates a function that returns **only aggregates**
(counts and a sum — never names or individual rows), so it's safe to expose to the app's public key:

First, a small table to track **excused absences** (people who are out, so they aren't required to
play on those days):

```sql
create table if not exists public.excused (
  id          bigint generated always as identity primary key,
  player_name text not null,
  from_date   date not null,
  to_date     date not null
);
alter table public.excused enable row level security;  -- no public policies: only the
-- security-definer team_stats() function (and you, in the SQL editor) can read it.
```

Then the stats function. The **team streak** is a "we all showed up" streak: it counts consecutive
active days (weekdays, with the holidays bridged) on which **every eligible teammate** completed a day.
"Eligible" means the person has started the quest (`startDate` on or before that day) and is **not**
excused that day. Completions include replays, since the app records every completion in `activeDays`.

```sql
create or replace function public.team_stats(p_today text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_players int; v_lessons int; v_played_today int;
  v_today date := p_today::date;
  v_holidays date[] := array['2026-06-19','2026-07-03']::date[]; -- match REST_HOLIDAYS in app.js
  v_streak int := 0; cur date;
  v_eligible int; v_played int; v_min_start date; v_guard int := 0;
begin
  select count(*) into v_players from public.progress;

  select coalesce(sum(done.cnt), 0) into v_lessons
  from public.progress p
  left join lateral (
    select count(*) as cnt from jsonb_each(coalesce(p.data->'days', '{}'::jsonb)) e
    where (e.value->>'completed') = 'true'
  ) done on true;

  select coalesce(sum(case when data->>'lastCompletedDate' = p_today then 1 else 0 end), 0)
  into v_played_today from public.progress;

  select min((data->>'startDate')::date) into v_min_start
  from public.progress where data->>'startDate' is not null;

  -- team streak: consecutive active days where EVERY eligible teammate played
  cur := v_today;
  loop
    v_guard := v_guard + 1;
    exit when v_guard > 400 or v_min_start is null or cur < v_min_start;
    if extract(dow from cur)::int in (0,6) or cur = any(v_holidays) then
      cur := cur - 1; continue;                          -- bridge weekends/holidays
    end if;
    select count(*) into v_eligible
    from public.progress p
    where (p.data->>'startDate') is not null and (p.data->>'startDate')::date <= cur
      and not exists (select 1 from public.excused x
        where lower(x.player_name) = lower(p.player_name) and cur between x.from_date and x.to_date);
    if v_eligible = 0 then cur := cur - 1; continue; end if; -- nobody eligible: bridge the day
    select count(*) into v_played
    from public.progress p
    where (p.data->>'startDate') is not null and (p.data->>'startDate')::date <= cur
      and not exists (select 1 from public.excused x
        where lower(x.player_name) = lower(p.player_name) and cur between x.from_date and x.to_date)
      and exists (select 1 from jsonb_array_elements_text(coalesce(p.data->'activeDays','[]'::jsonb)) ad
        where ad::date = cur);
    if v_played >= v_eligible then
      v_streak := v_streak + 1; cur := cur - 1; continue;  -- everyone eligible played
    elsif cur = v_today then
      cur := cur - 1; continue;                            -- today not fully done yet: don't break
    else
      exit;                                                -- an eligible teammate missed: streak ends
    end if;
  end loop;

  return json_build_object('players', v_players, 'lessons', v_lessons,
                           'played_today', v_played_today, 'team_streak', v_streak);
end;
$$;

grant execute on function public.team_stats(text) to anon, authenticated;
```

**Managing absences.** When someone is out, add a row to `excused` (the `player_name` must match the
name they sign in with — `select player_name from public.progress order by player_name;` shows the
exact names). Example:

```sql
insert into public.excused (player_name, from_date, to_date) values
  ('Andreas',  '2026-06-08', '2026-06-14'),
  ('Kimberly', '2026-06-15', '2026-06-21'),
  ('Gail',     '2026-06-15', '2026-06-21');
```

When they're back, delete their row(s): `delete from public.excused where player_name = 'Andreas';`.
To turn the whole panel off, `drop function public.team_stats(text);` and the app hides it.

### Resetting the team for a new cohort

The team progress bar reflects every signed-in account's saved progress. Before a fresh cohort
starts, clear out any test/old data so the numbers are accurate. In the Supabase **SQL Editor**:

```sql
delete from public.progress;       -- removes all saved progress (synced accounts)
select count(*) from public.progress;  -- should return 0
```

This resets **everyone**, including your own synced account, and the 🤝 Team progress panel stays
hidden until real teammates sign in and complete a lesson. Local-only ("just play on this device")
progress isn't stored here, so it was never part of the team totals. ⚠️ This is permanent — only run
it *before* a cohort begins, never mid-exercise.

## Owner-only "Preview all days"

The **Preview all days** content-review button (top-right of the home screen) is shown **only to the
owner**, so teammates don't see or use it. "Owner" means the player whose name matches `OWNER_NAME`
in `app.js` (currently `"Macee"`), or any device flagged by running `CCQ.owner()` in the browser
console. Use `CCQ.notOwner()` to turn it back off. The console review commands (`CCQ.previewAll()`,
`CCQ.previewOff()`, `CCQ.preview(n)`) still work regardless, as a maintainer backdoor.

## Shipping updates (always-latest versioning)

The team always gets the newest build automatically — no "hard refresh" needed. `index.html`
contains a tiny **version loader** that, on every visit, reads `version.json` fresh (with
`cache: no-store`, so it's never cached) and then injects `styles.css`, `curriculum.js`, and
`app.js` tagged with that version. Because the version string changes, browsers fetch the new files
instead of stale cached ones.

**To ship an update:**

1. Make your code change (`curriculum.js`, `app.js`, and/or `styles.css`).
2. Change the `"v"` value in **`version.json`** to anything new (e.g. bump `2026-06-03a` →
   `2026-06-03b`).
3. Commit and push. Returning visitors pick it up on their **next page load** — usually within a
   minute or two of GitHub Pages rebuilding.

That single `version.json` bump is the only "remember to do this" step. (If `version.json` ever
fails to load, the loader falls back to loading the assets un-versioned so the app still runs.)

## Files

| File | Purpose |
| --- | --- |
| `index.html` | App shell, screens, and the version loader |
| `version.json` | Single source of the current build version (bump `"v"` to ship an update) |
| `styles.css` | Theme, layout, badge/streak visuals |
| `app.js` | Game logic: state, scoring, streaks, gating, achievements, and cross-device sync |
| `curriculum.js` | All 19 days of lessons, quizzes, and challenges |

## Reviewing the content (for maintainers)

Days 2–19 normally unlock one per calendar day, which makes it hard to review
everything at once. Two tools help:

- **Preview all days** — a button in the top-right of the home screen (shown **only to
  the owner**; see "Owner-only Preview all days" above). Click it to unlock every day
  immediately; each one opens in **review mode** (read the lesson, take the quiz, see
  the hands-on tasks) with **no points awarded and no effect on any streak**. Click
  again ("Preview: ON") to turn it off. It only affects your own view. (Console
  equivalents work for any maintainer regardless of the button: `CCQ.previewAll()`,
  `CCQ.previewOff()`, and `CCQ.preview(n)` to jump to one day.)
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
