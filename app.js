/* Claude Quest — game logic (vanilla JS, no dependencies). */
(function () {
  "use strict";

  var CURRICULUM = window.CURRICULUM || [];
  var TOTAL_DAYS = CURRICULUM.length;
  // Attach optional "Go deeper" flashcards (window.DEEP_DIVE, keyed by day number).
  if (window.DEEP_DIVE) {
    CURRICULUM.forEach(function (d) {
      if (!d.deepDive && window.DEEP_DIVE[d.day]) d.deepDive = window.DEEP_DIVE[d.day];
    });
  }
  var POINTS_FIRST_TRY = 10;
  var POINTS_AFTER_MISS = 5;
  var POINTS_CHALLENGE = 5;
  var POINTS_DEEPDIVE = 10; // one-time bonus for finishing a day's "Go deeper" round

  // ===== Cross-device sync (Supabase) =====
  // These two values are PUBLIC and safe to ship in the page — the Row Level
  // Security policies in Supabase are what actually protect each player's data.
  // To point this at a different Supabase project, change these three lines.
  var SUPABASE_URL = "https://ezcrydamiplzywppvhri.supabase.co";
  var SUPABASE_KEY = "sb_publishable_RUaWCuxx1_VZ0rGsVfBQgw_qB-zmAC1";
  var REDIRECT_URL = "https://maceejb.github.io/claude-quest/";

  var sb = null;        // Supabase client (stays null if the library didn't load)
  var authUser = null;  // signed-in user, or null for local-only play
  try {
    if (window.supabase && window.supabase.createClient) {
      sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
  } catch (e) { sb = null; }

  var BADGES = [
    { id: "first_day", emoji: "🌱", name: "First Steps", desc: "Complete day 1", test: function (s) { return completedCount(s) >= 1; } },
    { id: "streak_3", emoji: "🔥", name: "On a Roll", desc: "3-day streak", test: function (s) { return s.longestStreak >= 3; } },
    { id: "streak_7", emoji: "⚡", name: "Week Warrior", desc: "7-day streak", test: function (s) { return s.longestStreak >= 7; } },
    { id: "streak_14", emoji: "🏆", name: "Unstoppable", desc: "14-day streak", test: function (s) { return s.longestStreak >= 14; } },
    { id: "perfect_day", emoji: "🎯", name: "Sharpshooter", desc: "A flawless quiz", test: function (s) { return s.perfectCount >= 1; } },
    { id: "perfect_5", emoji: "💎", name: "Quiz Master", desc: "5 flawless quizzes", test: function (s) { return s.perfectCount >= 5; } },
    { id: "all_18", emoji: "🥋", name: "Black Belt", desc: "Finish all 19 days", test: function (s) { return completedCount(s) >= TOTAL_DAYS; } },
    { id: "deep_5", emoji: "🔭", name: "Curious Mind", desc: "Go deeper on 5 days", test: function (s) { return deepDiveCount(s) >= 5; } }
  ];

  // How many completed days the player has finished the "Go deeper" round on.
  function deepDiveCount(s) {
    var n = 0;
    for (var k in s.days) { if (s.days[k] && s.days[k].deepDiveDone) n++; }
    return n;
  }

  // ===== Multi-day Capstone projects =====
  // Defined in curriculum.js (window.PROJECTS); this is a safe fallback so the app
  // still runs if that block is missing. Each project covers a contiguous block of
  // days; the final day of a block is its celebration.
  var PROJECTS = window.PROJECTS || [
    { id: 1, emoji: "📘", title: "Learn something new", tagline: "Have Claude build you a personal learning kit.", start: 1,  end: 6  },
    { id: 2, emoji: "🛠️", title: "Build a work helper", tagline: "Create a small tool — connected to your real apps and data — that takes a repetitive task off your plate.", start: 7,  end: 12 },
    { id: 3, emoji: "🚀", title: "Automate & ship it",  tagline: "Plan it, automate it end to end, put it in git, and hand it to your team.", start: 13, end: 18 }
  ];
  // The project a given day belongs to, plus where the day sits within it.
  function projectForDay(n) {
    for (var i = 0; i < PROJECTS.length; i++) {
      var p = PROJECTS[i];
      if (n >= p.start && n <= p.end) {
        return { project: p, index: n - p.start + 1, of: p.end - p.start + 1,
          isFirst: n === p.start, isLast: n === p.end };
      }
    }
    return null;
  }

  // ---- date helpers (overridable for testing via localStorage 'ccq:debugDate') ----
  function fmt(d) {
    var y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }
  function today() { return localStorage.getItem("ccq:debugDate") || fmt(new Date()); }
  function addDays(str, n) {
    var p = str.split("-").map(Number);
    var dt = new Date(p[0], p[1] - 1, p[2]);
    dt.setDate(dt.getDate() + n);
    return fmt(dt);
  }
  // Whole calendar days from date string a to b (b - a). Negative if b is before a.
  function daysBetween(a, b) {
    var pa = a.split("-").map(Number), pb = b.split("-").map(Number);
    var da = new Date(pa[0], pa[1] - 1, pa[2]), db = new Date(pb[0], pb[1] - 1, pb[2]);
    return Math.round((db - da) / 86400000);
  }
  function dayOfWeek(str) { // 0 = Sun … 6 = Sat
    var p = str.split("-").map(Number);
    return new Date(p[0], p[1] - 1, p[2]).getDay();
  }
  // ---- rest days ----
  // The course is a weekday cohort: weekends never count against a streak and are
  // skipped when measuring pace. REST_HOLIDAYS lists extra weekdays the whole team
  // is off, so they behave like weekends too (no missed-day penalty, not counted in
  // the daily pace). Add or remove dates here as the team's calendar changes.
  var REST_HOLIDAYS = ["2026-06-19", "2026-07-03"]; // Juneteenth, observed July 4th
  function isRestDay(str) {
    var d = dayOfWeek(str);
    if (d === 0 || d === 6) return true; // Sat / Sun
    return REST_HOLIDAYS.indexOf(str) !== -1;
  }
  // The most recent active (non-rest) day strictly before `str`.
  function prevActiveDay(str) {
    var cur = addDays(str, -1);
    while (isRestDay(cur)) cur = addDays(cur, -1);
    return cur;
  }
  // The next active (non-rest) day strictly after `str`.
  function nextActiveDay(str) {
    var cur = addDays(str, 1);
    while (isRestDay(cur)) cur = addDays(cur, 1);
    return cur;
  }
  // Active days in the inclusive range start…end (0 if end is before start).
  function activeDaysInclusive(start, end) {
    if (daysBetween(start, end) < 0) return 0;
    var n = 0, cur = start;
    while (true) {
      if (!isRestDay(cur)) n++;
      if (cur === end) break;
      cur = addDays(cur, 1);
    }
    return n;
  }
  // Active days strictly between a and b (exclusive of both). 0 when adjacent/inverted.
  function activeDaysBetweenExclusive(a, b) {
    if (daysBetween(a, b) <= 1) return 0;
    var n = 0, cur = addDays(a, 1);
    while (cur !== b) {
      if (!isRestDay(cur)) n++;
      cur = addDays(cur, 1);
    }
    return n;
  }

  // ---- pacing ----
  // The course is paced at one lesson per *active* day (weekdays minus team
  // holidays), anchored to the day each player first completed a lesson
  // (state.startDate). Teammates may run up to LEAD_DAYS ahead of that pace, and
  // may do several lessons in one sitting to catch up if they've fallen behind. A
  // weekly "streak freeze" forgives one missed active day so a single skip doesn't
  // reset a long streak.
  var LEAD_DAYS = 2;        // how far ahead of the daily pace you may work
  var FREEZE_COOLDOWN = 7;  // a streak freeze refills this many days after use

  // ---- the finish line ----
  // The whole quest builds toward an in-person event; the home screen shows a
  // live countdown to it. Change the date/name here if the event moves.
  var EVENT_DATE = "2026-07-07";              // first day of the in-person event
  var EVENT_NAME = "Ops SLT AI Bunker";

  // ---- state ----
  var profile = null;   // current player name
  var state = null;     // current player state
  var previewMode = false; // when on (via CCQ.previewAll), every day tile opens in review mode for content review
  var lastResults = null;  // last payload passed to showResults, so "Go deeper" can return to it
  var ddIndex = 0, ddRevealed = false; // "Go deeper" flashcard position + reveal state

  function blankState(name) {
    return { name: name, totalPoints: 0, currentStreak: 0, longestStreak: 0,
      lastCompletedDate: null, startDate: null, freezeUsedDate: null,
      perfectCount: 0, days: {}, badges: {}, verdictsUsed: [] };
  }
  function key(name) { return "ccq:" + name; }
  // Backfill fields added after a player's state was first saved, so existing
  // players aren't suddenly mis-paced or locked out by a new pacing rule.
  function normalize(s) {
    if (s.freezeUsedDate === undefined) s.freezeUsedDate = null;
    if (s.startDate === undefined) {
      var done = completedCount(s);
      // Treat existing players as exactly on-pace today so nothing locks behind them.
      s.startDate = done > 0 ? addDays(today(), -(done - 1)) : null;
    }
    return s;
  }
  function load(name) {
    try { var raw = localStorage.getItem(key(name)); if (raw) return normalize(JSON.parse(raw)); } catch (e) {}
    return blankState(name);
  }
  function save() {
    try { localStorage.setItem(key(profile), JSON.stringify(state)); } catch (e) {}
    saveCloud();
  }

  // ---- cloud sync helpers (no-ops when not signed in) ----
  var cloudSaveTimer = null;
  function saveCloud() {
    if (!sb || !authUser || !state) return;
    clearTimeout(cloudSaveTimer);
    cloudSaveTimer = setTimeout(function () {
      sb.from("progress").upsert({
        user_id: authUser.id,
        player_name: state.name,
        data: state,
        updated_at: new Date().toISOString()
      }).then(function (res) {
        if (res && res.error) console.warn("Cloud save failed:", res.error.message);
      });
    }, 700);
  }
  function fetchCloud() {
    return sb.from("progress").select("data").eq("user_id", authUser.id).maybeSingle()
      .then(function (res) {
        if (res.error) { console.warn("Cloud load failed:", res.error.message); return null; }
        return res.data ? res.data.data : null;
      });
  }
  function deriveName(user) {
    return (user && user.email) ? user.email.split("@")[0] : "Player";
  }

  function completedCount(s) { return Object.keys(s.days).filter(function (k) { return s.days[k].completed; }).length; }
  function nextDayNumber(s) { return Math.min(completedCount(s) + 1, TOTAL_DAYS); }
  function playedToday(s) { return s.lastCompletedDate === today(); }

  // The lesson number this player "should" be on at one-per-active-day, measured
  // from the day they started. Weekends and team holidays don't advance the pace,
  // so a player who only ever plays weekdays stays exactly on schedule. Before
  // their first lesson, that's day 1.
  function scheduledDay(s) {
    if (!s.startDate) return 1;
    return Math.min(Math.max(1, activeDaysInclusive(s.startDate, today())), TOTAL_DAYS);
  }
  // The furthest day currently unlocked: today's paced lesson plus the lead window.
  function maxUnlockedDay(s) { return Math.min(scheduledDay(s) + LEAD_DAYS, TOTAL_DAYS); }
  // You can play the next sequential day if it's within the unlocked window. This
  // naturally allows several lessons in one sitting (to catch up or work a little
  // ahead) while capping how far ahead of the daily pace anyone can get.
  function availableToday(s) {
    return completedCount(s) < TOTAL_DAYS && nextDayNumber(s) <= maxUnlockedDay(s);
  }
  // How many more lessons can be started right now (0 when caught up / capped).
  function unlockedAhead(s) { return Math.max(0, maxUnlockedDay(s) - completedCount(s)); }

  // ---- streak freeze ----
  // One freeze is available unless one was used within the last FREEZE_COOLDOWN days.
  function freezeAvailable(s) {
    return !s.freezeUsedDate || daysBetween(s.freezeUsedDate, today()) >= FREEZE_COOLDOWN;
  }
  function daysUntilFreezeRefill(s) {
    if (freezeAvailable(s)) return 0;
    return Math.max(0, FREEZE_COOLDOWN - daysBetween(s.freezeUsedDate, today()));
  }

  // Reconcile the live streak on load. Weekends and team holidays are free, so the
  // streak only breaks when an *active* day passes unplayed. A single missed active
  // day is automatically covered by a streak freeze (if one is available); a longer
  // gap breaks it.
  function reconcileStreak() {
    var last = state.lastCompletedDate;
    if (!last) return;
    var t = today();
    if (last === t) return;
    var missed = activeDaysBetweenExclusive(last, t); // active days skipped since last play
    if (missed === 0) return;                          // no weekday passed → streak alive
    if (missed === 1 && state.currentStreak > 0 && freezeAvailable(state)) {
      // Spend a freeze: treat the last active day as covered so the chain holds.
      state.freezeUsedDate = t;
      state.lastCompletedDate = prevActiveDay(t);
      state.freezeJustUsed = true; // surfaced once on the home screen
      save();
    } else if (state.currentStreak !== 0) {
      state.currentStreak = 0; save();
    }
  }

  // ---- session (one day in progress) ----
  var session = null; // { day, replay, qIndex, quizPoints, missedThisQ, perfect, checks[] }

  // ---- DOM helpers ----
  function $(id) { return document.getElementById(id); }
  function show(screenId) {
    ["screen-profile", "screen-home", "screen-lesson", "screen-quiz", "screen-challenge", "screen-results", "screen-deepdive"]
      .forEach(function (s) { $(s).classList.toggle("hidden", s !== screenId); });
    window.scrollTo(0, 0);
  }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  // Copy text to clipboard with a graceful fallback, and flash the button.
  function copyToClipboard(text, btn, restoreLabel) {
    function done() { btn.textContent = "Copied! ✓"; btn.classList.add("copied"); setTimeout(function () { btn.textContent = restoreLabel; btn.classList.remove("copied"); }, 2200); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", "");
      ta.style.position = "absolute"; ta.style.left = "-9999px";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) {}
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done, fallback); }
    else { fallback(); }
  }

  // ================= PROFILE =================
  function initProfile() {
    var last = localStorage.getItem("ccq:lastProfile");
    if (last) {
      $("profile-name").value = last;
      $("profile-existing").textContent = 'Welcome back! Press start to continue as "' + last + '", or type a new name.';
    }
    $("profile-start").onclick = startProfile;
    $("profile-name").addEventListener("keydown", function (e) { if (e.key === "Enter") startProfile(); });
  }
  function startProfile() {
    var name = ($("profile-name").value || "").trim();
    if (!name) { $("profile-name").focus(); return; }
    profile = name;
    localStorage.setItem("ccq:lastProfile", name);
    state = load(name);
    reconcileStreak();
    renderHome();
    show("screen-home");
  }

  // ================= AUTH (cross-device sync) =================
  function initAuth() {
    if (!sb) return; // library missing → app runs in local-only mode
    $("auth-box").classList.remove("hidden");
    $("profile-start").className = "btn btn-ghost"; // sign-in becomes the primary path
    $("auth-send").onclick = sendLink;
    $("auth-email").addEventListener("keydown", function (e) { if (e.key === "Enter") sendLink(); });

    // Returning from a magic-link email? Show a brief note while the session settles.
    if (location.hash.indexOf("access_token") !== -1) $("auth-msg").textContent = "Signing you in…";

    sb.auth.onAuthStateChange(function (event, sessionObj) {
      if (event === "SIGNED_IN" && sessionObj && sessionObj.user) {
        if (!authUser) enterSignedIn(sessionObj.user);
      } else if (event === "SIGNED_OUT") {
        authUser = null;
      }
    });
    // Restore an existing session on this device (so signed-in users skip the gate).
    sb.auth.getSession().then(function (res) {
      var sess = res && res.data ? res.data.session : null;
      if (sess && sess.user && !authUser) enterSignedIn(sess.user);
    });
  }

  function sendLink() {
    var email = ($("auth-email").value || "").trim();
    if (!email || email.indexOf("@") === -1) { $("auth-email").focus(); return; }
    $("auth-msg").textContent = "Sending…";
    $("auth-send").disabled = true;
    sb.auth.signInWithOtp({ email: email, options: { emailRedirectTo: REDIRECT_URL } })
      .then(function (res) {
        $("auth-send").disabled = false;
        $("auth-msg").textContent = res.error
          ? "Couldn't send the link: " + res.error.message
          : "Check your inbox — click the link in the email to sign in. (You can close this tab.)";
      });
  }

  // Sign-in succeeded: load this player's cloud progress, importing any local
  // progress on this device the first time the account is used.
  function enterSignedIn(user) {
    authUser = user;
    $("auth-msg").textContent = "";
    fetchCloud().then(function (cloud) {
      if (cloud) {
        state = cloud;
        profile = state.name || deriveName(user);
      } else {
        var localName = localStorage.getItem("ccq:lastProfile");
        if (localName) { profile = localName; state = load(localName); }
        else { profile = deriveName(user); state = blankState(profile); }
        state.name = profile;
      }
      if (!state.verdictsUsed) state.verdictsUsed = [];
      localStorage.setItem("ccq:lastProfile", profile);
      reconcileStreak();
      saveCloud(); // ensure the account has a row from now on
      renderHome();
      show("screen-home");
    });
  }

  function signOut() {
    if (sb) sb.auth.signOut();
    authUser = null; profile = null; state = null;
    $("profile-existing").textContent = "";
    $("auth-msg").textContent = "";
    show("screen-profile");
  }

  // ================= HOME =================
  function renderHome() {
    var signedIn = !!authUser;
    $("home-player").textContent = "👤 " + profile + (signedIn ? " · ☁️ synced" : "");
    $("sign-out").classList.toggle("hidden", !signedIn);
    $("switch-profile").classList.toggle("hidden", signedIn);
    $("stat-points").textContent = state.totalPoints;
    $("stat-streak").textContent = state.currentStreak;
    $("stat-longest").textContent = state.longestStreak;
    $("stat-progress").textContent = completedCount(state) + "/" + TOTAL_DAYS;
    $("streak-flame").classList.toggle("lit", state.currentStreak > 0);

    var pv = $("preview-toggle");
    if (pv) {
      pv.textContent = previewMode ? "Preview: ON" : "Preview all days";
      pv.classList.toggle("active", previewMode);
    }

    renderCountdown();
    renderCTA();
    renderProjects();
    renderGrid();
    renderBadges();
  }

  // Live countdown to the in-person event. Hidden once the event has clearly passed.
  function renderCountdown() {
    var box = $("bunker-countdown");
    if (!box) return;
    var left = daysBetween(today(), EVENT_DATE); // calendar days until the event
    box.innerHTML = "";
    box.classList.remove("is-soon", "is-today", "hidden");

    if (left > 1) {
      if (left <= 7) box.classList.add("is-soon"); // final week glow
      box.appendChild(el("span", "bunker-num", left));
      var unit = el("span", "bunker-text", "");
      unit.innerHTML = "days until the <strong>" + EVENT_NAME + "</strong> &mdash; keep leveling up!";
      box.appendChild(unit);
    } else if (left === 1) {
      box.classList.add("is-soon");
      var t1 = el("span", "bunker-text", "");
      t1.innerHTML = "🚀 <strong>Tomorrow:</strong> the " + EVENT_NAME + ". You've trained for this!";
      box.appendChild(t1);
    } else if (left >= -3) {
      // event day, or assume it runs a few days after
      box.classList.add("is-today");
      var t0 = el("span", "bunker-text", "");
      t0.innerHTML = left === 0
        ? "🎉 Today's the day &mdash; welcome to the <strong>" + EVENT_NAME + "</strong>!"
        : "🎉 The <strong>" + EVENT_NAME + "</strong> is happening now. Go get 'em!";
      box.appendChild(t0);
    } else {
      box.classList.add("hidden"); // event has passed
    }
  }

  function renderProjects() {
    var tracker = $("project-tracker");
    if (!tracker) return;
    tracker.innerHTML = "";
    var nextN = nextDayNumber(state);
    var allDone = completedCount(state) >= TOTAL_DAYS;
    PROJECTS.forEach(function (p) {
      var span = p.end - p.start + 1;
      var doneInBlock = 0;
      for (var n = p.start; n <= p.end; n++) {
        var rec = state.days[n];
        if (rec && rec.completed) doneInBlock++;
      }
      var status;
      if (doneInBlock >= span) status = "done";
      else if (!allDone && nextN >= p.start && nextN <= p.end) status = "active";
      else if (doneInBlock > 0) status = "active"; // partially done (e.g. via preview)
      else status = "upcoming";

      var card = el("div", "project-card " + status);
      card.appendChild(el("div", "pc-emoji", p.emoji));
      var body = el("div", "pc-body");
      var title = el("div", "pc-title"); title.textContent = "Project " + p.id + ": " + p.title;
      body.appendChild(title);
      var tag = el("div", "pc-tag"); tag.textContent = p.tagline;
      body.appendChild(tag);
      var bar = el("div", "pc-bar");
      var fill = el("div", "pc-fill");
      fill.style.width = (doneInBlock / span * 100) + "%";
      bar.appendChild(fill);
      body.appendChild(bar);
      var meta = el("div", "pc-meta");
      meta.textContent = (status === "done" ? "✓ Complete" : doneInBlock + " / " + span + " days")
        + " · Days " + p.start + "–" + p.end;
      body.appendChild(meta);
      card.appendChild(body);
      tracker.appendChild(card);
    });
  }

  function renderCTA() {
    var cta = $("today-cta");
    cta.innerHTML = "";

    // One-time notice when a freeze rescued the streak since the last visit.
    if (state.freezeJustUsed) {
      cta.appendChild(el("div", "freeze-note",
        "❄️ A streak freeze saved your " + state.currentStreak + "-day streak — one missed day is on us."));
      delete state.freezeJustUsed; save();
    }

    var done = completedCount(state);
    if (done >= TOTAL_DAYS) {
      cta.appendChild(el("h2", null, "🎊 You finished the quest!"));
      cta.appendChild(el("p", "muted", "All 19 days complete. Replay any day to review, and keep using what you learned."));
      return;
    }

    var n = nextDayNumber(state);
    var sched = scheduledDay(state);
    if (availableToday(state)) {
      var d = CURRICULUM[n - 1];
      var ahead = n > sched, behind = n < sched;
      cta.appendChild(el("div", "step-label", ahead ? "Working ahead" : (behind ? "Catch up" : "Today's lesson")));
      cta.appendChild(el("h2", null, "Day " + n + ": " + d.title));
      cta.appendChild(el("p", "muted", d.lesson.length + " quick cards · " + d.quiz.length + " questions · " + d.challenge.length + " hands-on tasks — about 15 minutes."));
      var btn = el("button", "btn btn-primary", "Start Day " + n + " →");
      btn.onclick = function () { beginDay(n, false); };
      cta.appendChild(btn);
      if (ahead) cta.appendChild(el("p", "cta-hint muted small",
        "You're ahead of the daily pace — nice momentum. One lesson a day makes it stick best, but a little extra is welcome."));
      else if (behind) cta.appendChild(el("p", "cta-hint muted small",
        "A little behind? No problem — you can do a few in a row to catch back up to today."));
    } else {
      cta.appendChild(el("h2", null, "✅ You're all set for today!"));
      var lead = done - sched; // how many days ahead of pace
      // "tomorrow" unless the next lesson day lands after a weekend/holiday.
      var soon = nextActiveDay(today()) === addDays(today(), 1) ? "tomorrow" : "your next weekday";
      var msg = lead >= LEAD_DAYS
        ? "You're " + LEAD_DAYS + " days ahead — as far as the pace allows. Come back " + soon + " to keep going and protect your streak."
        : (state.currentStreak > 1
          ? "You're on a " + state.currentStreak + "-day streak. Come back " + soon + " to keep it alive! Weekends are free — they won't break it."
          : "Come back " + soon + " for the next lesson and start building a streak.");
      cta.appendChild(el("p", "muted", msg));
    }

    // Streak-freeze status (only once a streak or a used freeze exists).
    if (state.currentStreak > 0 || state.freezeUsedDate) {
      var fz = el("p", "freeze-status muted small");
      if (freezeAvailable(state)) {
        fz.textContent = "❄️ Streak freeze ready — one missed day won't break your streak.";
      } else {
        var dleft = daysUntilFreezeRefill(state);
        fz.textContent = "❄️ Streak freeze used — refills in " + dleft + " day" + (dleft === 1 ? "" : "s") + ".";
      }
      cta.appendChild(fz);
    }
  }

  function renderGrid() {
    var grid = $("day-grid");
    grid.innerHTML = "";
    var next = nextDayNumber(state);
    CURRICULUM.forEach(function (d) {
      var rec = state.days[d.day];
      var tile = el("div", "day-tile");
      var status;
      if (rec && rec.completed) status = "done";
      else if (d.day === next && availableToday(state)) status = "available";
      else status = "locked";
      tile.classList.add(status);
      tile.appendChild(el("div", "dnum", "Day " + d.day));
      tile.appendChild(el("div", "dtitle", d.title));
      tile.appendChild(el("div", "dsection", d.section + (rec && rec.completed ? " · " + rec.score + " pts" : "")));
      if (status === "done") tile.onclick = function () { beginDay(d.day, true); };
      else if (status === "available") tile.onclick = function () { beginDay(d.day, false); };
      else if (previewMode) { tile.classList.remove("locked"); tile.classList.add("available"); tile.title = "Preview (review mode — no points)"; tile.onclick = function () { beginDay(d.day, true); }; }
      else tile.title = d.day === next ? "Come back tomorrow to unlock this day." : "Complete earlier days first.";
      grid.appendChild(tile);
    });
  }

  function renderBadges() {
    var shelf = $("badge-shelf");
    shelf.innerHTML = "";
    BADGES.forEach(function (b) {
      var earned = !!state.badges[b.id];
      var card = el("div", "badge" + (earned ? " earned" : ""));
      card.appendChild(el("div", "emoji", b.emoji));
      card.appendChild(el("div", "bname", b.name));
      card.appendChild(el("div", "bdesc", earned ? b.desc : "Locked"));
      shelf.appendChild(card);
    });
  }

  // ================= DAY SESSION =================
  function beginDay(dayNum, replay) {
    session = { day: dayNum, replay: replay, qIndex: 0, quizPoints: 0, missedThisQ: false, perfect: true, checks: [] };
    renderLesson();
    show("screen-lesson");
  }

  function renderLesson() {
    var d = CURRICULUM[session.day - 1];
    $("lesson-daytag").textContent = "Day " + d.day + (session.replay ? " · review" : "");
    $("lesson-title").textContent = d.title;
    var box = $("lesson-cards");
    box.innerHTML = "";
    d.lesson.forEach(function (c) {
      var card = el("div", "lesson-card");
      card.appendChild(el("h3", null, c.heading));
      card.appendChild(el("p", null, c.body));
      box.appendChild(card);
    });
    $("lesson-next").onclick = function () { session.qIndex = 0; session.quizPoints = 0; session.perfect = true; renderQuestion(); show("screen-quiz"); };
  }

  function renderQuestion() {
    var d = CURRICULUM[session.day - 1];
    var q = d.quiz[session.qIndex];
    session.missedThisQ = false;
    $("quiz-daytag").textContent = "Day " + d.day + (session.replay ? " · review" : "");
    $("quiz-counter").textContent = "Question " + (session.qIndex + 1) + " of " + d.quiz.length;
    $("quiz-bar").style.width = (session.qIndex / d.quiz.length * 100) + "%";
    $("quiz-question").textContent = q.q;
    $("quiz-feedback").className = "feedback hidden";
    $("quiz-next").classList.add("hidden");

    var opts = $("quiz-options");
    opts.innerHTML = "";
    q.options.forEach(function (text, i) {
      var btn = el("button", "option", text);
      btn.onclick = function () { answer(i, btn, q); };
      opts.appendChild(btn);
    });
  }

  function answer(i, btn, q) {
    if (btn.classList.contains("correct") || btn.classList.contains("disabled")) return;
    if (i === q.answer) {
      btn.classList.add("correct");
      var pts = session.missedThisQ ? POINTS_AFTER_MISS : POINTS_FIRST_TRY;
      session.quizPoints += pts;
      Array.prototype.forEach.call($("quiz-options").children, function (c) { c.classList.add("disabled"); c.onclick = null; });
      var fb = $("quiz-feedback");
      fb.className = "feedback good";
      fb.innerHTML = '<span class="verdict">Correct! +' + pts + ' pts</span><br>' + q.explanation;
      $("quiz-next").classList.remove("hidden");
    } else {
      btn.classList.add("wrong", "disabled");
      btn.onclick = null;
      session.missedThisQ = true;
      session.perfect = false;
      var fb2 = $("quiz-feedback");
      fb2.className = "feedback bad";
      fb2.innerHTML = '<span class="verdict">Not quite — try again.</span>';
    }
  }

  function setupQuizNav() {
    $("quiz-next").onclick = function () {
      var d = CURRICULUM[session.day - 1];
      session.qIndex++;
      if (session.qIndex < d.quiz.length) { renderQuestion(); }
      else { renderChallenge(); show("screen-challenge"); }
    };
  }

  function renderChallenge() {
    var d = CURRICULUM[session.day - 1];
    $("challenge-daytag").textContent = "Day " + d.day + (session.replay ? " · review" : "");

    var banner = $("challenge-project");
    var pf = projectForDay(d.day);
    if (banner) {
      if (pf) {
        var p = pf.project;
        var phase = pf.isFirst ? "Kicking off" : (pf.isLast ? "Finale" : "Continuing");
        banner.innerHTML = "";
        var em = el("span", "pb-emoji"); em.textContent = p.emoji;
        var txt = el("span", "pb-text");
        var strong = document.createElement("b");
        strong.textContent = "Project " + p.id + ": " + p.title;
        txt.appendChild(strong);
        txt.appendChild(document.createTextNode(" — " + phase + " · day " + pf.index + " of " + pf.of));
        banner.appendChild(em);
        banner.appendChild(txt);
        banner.classList.remove("hidden");
      } else {
        banner.classList.add("hidden");
      }
    }

    var list = $("challenge-list");
    list.innerHTML = "";
    session.checks = d.challenge.map(function () { return false; });
    d.challenge.forEach(function (item, i) {
      // items may be a plain string (legacy) or { text, link, capstone }
      var text = typeof item === "string" ? item : item.text;
      var link = typeof item === "string" ? null : item.link;
      var isCap = typeof item === "object" && item.capstone;

      var row = el("div", "challenge-item" + (isCap ? " capstone" : ""));
      var main = el("label", "ci-main");
      var cb = el("input"); cb.type = "checkbox";
      cb.onchange = function () { session.checks[i] = cb.checked; row.classList.toggle("checked", cb.checked); };
      main.appendChild(cb);
      if (isCap) main.appendChild(el("span", "cap-badge", "Capstone"));
      main.appendChild(el("span", "ci-text", text));
      row.appendChild(main);

      if (link) {
        var a = el("a", "ci-link", "Learn how &rarr;");
        a.href = link;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        row.appendChild(a);
      }
      list.appendChild(row);
    });
    $("challenge-finish").onclick = finishDay;
  }

  function finishDay() {
    var d = CURRICULUM[session.day - 1];
    var challengePoints = session.checks.filter(Boolean).length * POINTS_CHALLENGE;
    var base = session.quizPoints + challengePoints;

    if (session.replay) {
      showResults({ replay: true, quiz: session.quizPoints, challenge: challengePoints });
      return;
    }

    // advance streak for a real (first-time) completion
    var t = today();
    if (!state.startDate) state.startDate = t; // anchor this player's daily pace
    var last = state.lastCompletedDate;
    if (last === t) {
      // already showed up today (extra lesson worked ahead / caught up) — streak unchanged
    } else if (!last) {
      state.currentStreak = 1;
    } else {
      // count only active (non-weekend, non-holiday) days skipped since last play
      var missed = activeDaysBetweenExclusive(last, t);
      if (missed === 0) {
        state.currentStreak += 1;            // consecutive active day (weekends bridged)
      } else if (missed === 1 && state.currentStreak > 0 && freezeAvailable(state)) {
        state.freezeUsedDate = t;            // a freeze covers the one missed active day
        state.currentStreak += 1;
      } else {
        state.currentStreak = 1;             // streak broke — start fresh
      }
    }
    state.longestStreak = Math.max(state.longestStreak, state.currentStreak);

    var multiplier = 1 + Math.min(state.currentStreak - 1, 9) * 0.1;
    var streakBonus = Math.round(base * multiplier) - base;
    var dayScore = base + streakBonus;

    var verdict = chooseVerdict(computeAccuracy(session.quizPoints, d.quiz.length), true);

    state.totalPoints += dayScore;
    state.lastCompletedDate = t;
    if (session.perfect) state.perfectCount += 1;
    state.days[d.day] = { completed: true, score: dayScore, perfect: session.perfect, date: t, verdict: verdict };

    var newBadges = evaluateBadges();
    save();

    showResults({ replay: false, quiz: session.quizPoints, challenge: challengePoints,
      multiplier: multiplier, streakBonus: streakBonus, total: dayScore,
      perfect: session.perfect, streak: state.currentStreak, newBadges: newBadges, verdict: verdict });
  }

  function evaluateBadges() {
    var earned = [];
    BADGES.forEach(function (b) {
      if (!state.badges[b.id] && b.test(state)) { state.badges[b.id] = true; earned.push(b); }
    });
    return earned;
  }

  // ================= RESULTS =================
  // Fun, non-coder productivity tips, each tagged with the Claude surface
  // (Chat, Cowork, or Code) where it works best.
  var TIPS = [
    { surface: "Chat", text: "Paste a messy email thread and ask “what do I actually need to do here?” for a clean action list." },
    { surface: "Chat", text: "Before a meeting, drop in your notes and ask Claude for three sharp questions to bring." },
    { surface: "Chat", text: "Stuck on a blank page? Ask for “five rough first drafts, one sentence each” and pick a direction." },
    { surface: "Chat", text: "Before sending an important message, ask Claude to “play devil's advocate.”" },
    { surface: "Chat", text: "Feed Claude a screenshot and ask it to pull the numbers or dates into a clean table." },
    { surface: "Cowork", text: "Kicking off a project? Ask Claude to break it into a step-by-step plan, then work the steps together." },
    { surface: "Cowork", text: "After mapping out a plan, ask “what am I missing?” — Claude is great at catching the obvious gap." },
    { surface: "Cowork", text: "At the end of a work session, ask Claude to summarize the decisions you made so you have a paper trail." },
    { surface: "Cowork", text: "Hand Claude a folder of reports and ask for a one-page summary you can forward to your boss." },
    { surface: "Code", text: "Save the instructions you repeat into a CLAUDE.md file so Claude remembers them every session." },
    { surface: "Code", text: "Ask Claude Code to rename or reorganize a messy folder of files in one go — then review before approving." },
    { surface: "Code", text: "Run a one-off chore with <code>claude -p \"clean up this CSV\"</code> without starting a whole session." }
  ];

  // "If your quiz performance was a famous astronaut..." — graded on first-try
  // accuracy and tied to the team's "future-focused" motto (reaching for the stars).
  // Kept playful and kind; even the bottom tier is encouraging, not a roast.
  // Each pick links to a "learn more" page. Roster is generous so teammates with
  // the same score still get different astronauts.
  var WIKI = "https://en.wikipedia.org/wiki/";
  var ASTRONAUTS = [
    { min: 1.00, picks: [
      { text: "🌕 Neil Armstrong — one giant leap; you stuck the landing flawlessly.", link: WIKI + "Neil_Armstrong" },
      { text: "🚀 Yuri Gagarin — first human in space; you reached orbit first.", link: WIKI + "Yuri_Gagarin" },
      { text: "🌑 Buzz Aldrin — second on the Moon, first-rate performance.", link: WIKI + "Buzz_Aldrin" },
      { text: "🛰️ Valentina Tereshkova — first woman in space; trailblazing and flawless.", link: WIKI + "Valentina_Tereshkova" },
      { text: "👩‍🚀 Sally Ride — first American woman in space; you broke right through.", link: WIKI + "Sally_Ride" },
      { text: "🌌 John Glenn — first American to orbit Earth; a textbook mission.", link: WIKI + "John_Glenn" } ] },
    { min: 0.75, picks: [
      { text: "🎸 Chris Hadfield — commanded the ISS (and a guitar); smooth and near-perfect.", link: WIKI + "Chris_Hadfield" },
      { text: "🧑‍🚀 Jim Lovell — a steady hand on Apollo; almost flawless.", link: WIKI + "Jim_Lovell" },
      { text: "🌠 Mae Jemison — first Black woman in space; soaring, just shy of perfect.", link: WIKI + "Mae_Jemison" },
      { text: "🚀 Alan Shepard — first American in space; strong launch, tiny wobble.", link: WIKI + "Alan_Shepard" },
      { text: "🛰️ Scott Kelly — a year in orbit; reliable and nearly spotless.", link: WIKI + "Scott_Kelly_(astronaut)" } ] },
    { min: 0.50, picks: [
      { text: "🧑‍🚀 Peggy Whitson — record time in orbit; steady, dependable progress.", link: WIKI + "Peggy_Whitson" },
      { text: "🌍 Michael Collins — kept the command module steady; solid middle of the mission.", link: WIKI + "Michael_Collins_(astronaut)" },
      { text: "🛰️ Tim Peake — a solid mission, halfway to the stars.", link: WIKI + "Tim_Peake" },
      { text: "👩‍🚀 Eileen Collins — first woman to command a shuttle; steady at the helm.", link: WIKI + "Eileen_Collins" },
      { text: "🌑 Gene Cernan — last to walk the Moon; covered good ground.", link: WIKI + "Gene_Cernan" } ] },
    { min: 0.25, picks: [
      { text: "🪐 Jack Swigert — Apollo 13 improviser; not the plan, but you adapted.", link: WIKI + "Jack_Swigert" },
      { text: "🌑 Fred Haise — brought it home against the odds; chart the retry.", link: WIKI + "Fred_Haise" },
      { text: "🛰️ Gordon Cooper — drifted a bit, then recovered the mission.", link: WIKI + "Gordon_Cooper" },
      { text: "🧑‍🚀 Wally Schirra — a few system checks left; run it again.", link: WIKI + "Wally_Schirra" } ] },
    { min: 0.00, picks: [
      { text: "🚀 Gus Grissom — overcame a sunk capsule to fly again; bounce back.", link: WIKI + "Gus_Grissom" },
      { text: "🌙 Ken Mattingly — bumped from Apollo 13, then saved the day from the ground. Your turn comes next.", link: WIKI + "Ken_Mattingly" },
      { text: "🛰️ Story Musgrave — started over many times, flew six missions; persistence pays.", link: WIKI + "Story_Musgrave" },
      { text: "🧑‍🚀 Deke Slayton — grounded for years, then finally flew. Patience and a retry.", link: WIKI + "Deke_Slayton" } ] }
  ];
  function computeAccuracy(quizPoints, nQ) {
    if (nQ <= 0) return 0;
    var firstTry = quizPoints / POINTS_AFTER_MISS - nQ; // pts = 10a + 5b, N=a+b → a = pts/5 - N
    return Math.max(0, Math.min(1, firstTry / nQ));
  }
  function pickTier(ratio) {
    for (var i = 0; i < ASTRONAUTS.length; i++) { if (ratio >= ASTRONAUTS[i].min) return ASTRONAUTS[i]; }
    return ASTRONAUTS[ASTRONAUTS.length - 1];
  }
  // Stable per-name hash so two players almost never collide on the same astronaut.
  function nameHash(str) {
    var h = 0; str = str || "";
    for (var i = 0; i < str.length; i++) { h = (h * 31 + str.charCodeAt(i)) >>> 0; }
    return h;
  }
  // Choose an astronaut for this player from the right tier, skipping any they've
  // already had (until the whole roster is used). Seeded by name so identical
  // scores still diverge across teammates. record=true persists the pick.
  // Returns the astronaut object { text, link }.
  function chooseVerdict(ratio, record) {
    var pool = pickTier(ratio).picks;
    if (!state.verdictsUsed) state.verdictsUsed = [];
    var used = state.verdictsUsed;
    var avail = pool.filter(function (p) { return used.indexOf(p.text) === -1; });
    if (!avail.length) avail = pool.slice(); // whole tier seen → allow reuse
    var pick = avail[nameHash(profile) % avail.length];
    if (record) used.push(pick.text);
    return pick;
  }

  function showResults(r) {
    lastResults = r;
    $("results-emoji").innerHTML = r.replay ? "📖" : (r.perfect ? "🎯" : "🎉");
    $("results-title").textContent = r.replay ? "Review complete" : "Day complete!";
    var bd = $("results-breakdown");
    bd.innerHTML = "";
    function row(label, val, cls) { var x = el("div", "row" + (cls ? " " + cls : "")); x.appendChild(el("span", null, label)); x.appendChild(el("span", null, val)); bd.appendChild(x); }

    if (r.replay) {
      row("Quiz (review)", r.quiz + " pts");
      row("Hands-on (review)", r.challenge + " pts");
      row("Points earned", "0 — review mode", "total");
    } else {
      row("Quiz", "+" + r.quiz);
      row("Hands-on challenge", "+" + r.challenge);
      row("Streak bonus (×" + r.multiplier.toFixed(1) + ", " + r.streak + "-day)", "+" + r.streakBonus);
      row("Day total", "+" + r.total + " pts", "total");
    }

    var badgeBox = $("results-badges");
    badgeBox.innerHTML = "";
    if (!r.replay && r.newBadges && r.newBadges.length) {
      badgeBox.appendChild(el("div", "step-label", "New badge" + (r.newBadges.length > 1 ? "s" : "") + " unlocked!"));
      r.newBadges.forEach(function (b) { badgeBox.appendChild(el("span", "results-badge", b.emoji + " " + b.name)); });
    }
    // "If your quiz performance was a famous astronaut..." verdict.
    // Use the astronaut chosen at completion (stable on replay); fall back for legacy days.
    var d = CURRICULUM[session.day - 1];
    var accuracy = computeAccuracy(r.quiz, d.quiz.length);
    var verdict;
    if (!r.replay && r.verdict) verdict = r.verdict;
    else {
      var rec0 = state.days[d.day];
      verdict = (rec0 && rec0.verdict) ? rec0.verdict : chooseVerdict(accuracy, false);
    }
    var learnLink = verdict.link
      ? "<a class=\"sv-link\" href=\"" + verdict.link + "\" target=\"_blank\" rel=\"noopener noreferrer\">Learn about this astronaut →</a>"
      : "";
    $("results-singer").innerHTML = "<span class=\"sv-label\">If your quiz was a famous astronaut…</span>" +
      "<span class=\"sv-text\">" + verdict.text + "</span>" + learnLink +
      "<button id=\"singer-copy\" class=\"btn btn-ghost small sv-copy\">Copy my astronaut</button>";
    $("singer-copy").onclick = function () { copyToClipboard(verdict.text, $("singer-copy"), "Copy my astronaut"); };

    // Project-complete celebration — shown only when you finish the last day of a
    // project block for real (not on replay).
    var proj = $("results-project");
    if (proj) {
      var pf = projectForDay(d.day);
      if (!r.replay && pf && pf.isLast) {
        var p = pf.project;
        proj.innerHTML = "";
        proj.appendChild(el("div", "rp-emoji", p.emoji + " 🎉"));
        var h = el("div", "rp-title"); h.textContent = "Project " + p.id + " complete: " + p.title;
        proj.appendChild(h);
        var sub = el("div", "rp-sub"); sub.textContent = p.tagline;
        proj.appendChild(sub);
        var nextP = PROJECTS[p.id]; // ids are 1-based, so index p.id is the next project
        var teaser = el("div", "rp-next");
        teaser.textContent = nextP
          ? "Up next → Project " + nextP.id + ": " + nextP.title
          : "🎓 All four projects shipped — you're a Claude Code black belt!";
        proj.appendChild(teaser);
        proj.classList.remove("hidden");
      } else {
        proj.classList.add("hidden");
      }
    }

    var feedbackEmail = "MaceeJB@gmail.com";
    var subject = "Claude Quest — Day " + d.day + " (" + d.title + "): feedback";
    var body = "Day " + d.day + " — " + d.title + "\n\n" +
      "What would you improve? (lesson, quiz, a hands-on task, the capstone, or anything else)\n\n";
    $("results-suggest").href = "mailto:" + feedbackEmail +
      "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);

    // fun productivity tip in a purple bubble, tagged with its Claude surface
    var tip = TIPS[Math.floor(Math.random() * TIPS.length)];
    $("results-tip-surface").textContent = tip.surface;
    $("results-tip-surface").className = "tip-surface surface-" + tip.surface.toLowerCase();
    $("results-tip-text").innerHTML = tip.text;

    // "Go deeper" — optional interactive flashcards on today's topic (small bonus).
    var ddBox = $("results-deepdive");
    if (ddBox) {
      ddBox.innerHTML = "";
      var ddRec = state.days[d.day];
      var ddCards = d.deepDive || [];
      if (ddCards.length) {
        var ddDone = !!(ddRec && ddRec.deepDiveDone);
        var ddBtn = el("button", "btn dd-cta " + (ddDone ? "btn-ghost" : "btn-primary"));
        ddBtn.innerHTML = ddDone
          ? "🔭 Revisit the deeper dive"
          : "🔭 Go deeper on today's topic <span class=\"dd-pts\">+" + POINTS_DEEPDIVE + " pts</span>";
        ddBtn.onclick = openDeepDive;
        ddBox.appendChild(ddBtn);
        if (ddDone) ddBox.appendChild(el("div", "dd-earned muted small", "✓ Bonus already earned"));
      }
    }

    $("results-home").onclick = function () { renderHome(); show("screen-home"); };
    show("screen-results");
  }

  // ================= GO DEEPER (optional flashcards) =================
  function openDeepDive() { ddIndex = 0; ddRevealed = false; renderDeepDive(); show("screen-deepdive"); }

  function renderDeepDive() {
    var d = CURRICULUM[session.day - 1];
    var cards = d.deepDive || [];
    $("dd-daytag").textContent = "Day " + d.day + " · go deeper";
    var body = $("dd-body"); body.innerHTML = "";
    var action = $("dd-action");
    if (ddIndex >= cards.length) { renderDeepDiveSummary(); return; }
    $("dd-counter").textContent = "Card " + (ddIndex + 1) + " of " + cards.length;
    var card = cards[ddIndex];
    body.appendChild(el("div", "dd-q", card.q));
    if (ddRevealed) body.appendChild(el("div", "dd-a", card.a));
    if (!ddRevealed) {
      action.textContent = "Reveal answer →";
      action.onclick = function () { ddRevealed = true; renderDeepDive(); };
    } else if (ddIndex < cards.length - 1) {
      action.textContent = "Next card →";
      action.onclick = function () { ddIndex++; ddRevealed = false; renderDeepDive(); };
    } else {
      action.textContent = "Finish (+" + POINTS_DEEPDIVE + " pts) →";
      action.onclick = function () { ddIndex++; renderDeepDive(); };
    }
  }

  function renderDeepDiveSummary() {
    var d = CURRICULUM[session.day - 1];
    var rec = state.days[d.day];
    $("dd-counter").textContent = "";
    var body = $("dd-body"); body.innerHTML = "";
    var awardedNow = false, newB = [];
    if (!previewMode && rec && rec.completed && !rec.deepDiveDone) {
      rec.deepDiveDone = true;
      state.totalPoints += POINTS_DEEPDIVE;
      newB = evaluateBadges();
      save();
      awardedNow = true;
    }
    var head = el("div", "dd-summary");
    if (awardedNow) head.innerHTML = "🎉 <b>+" + POINTS_DEEPDIVE + " points</b> for going deeper on today's topic!";
    else if (rec && rec.deepDiveDone) head.innerHTML = "✓ You already earned this day's bonus — nice review!";
    else head.innerHTML = "Preview mode — no points awarded.";
    body.appendChild(head);
    if (newB.length) {
      var bb = el("div", "results-badges");
      bb.appendChild(el("div", "step-label", "New badge" + (newB.length > 1 ? "s" : "") + " unlocked!"));
      newB.forEach(function (b) { bb.appendChild(el("span", "results-badge", b.emoji + " " + b.name)); });
      body.appendChild(bb);
    }
    var action = $("dd-action");
    action.textContent = "Back to home →";
    action.onclick = function () { renderHome(); show("screen-home"); };
  }

  // ================= WIRE-UP =================
  function init() {
    initProfile();
    initAuth();
    setupQuizNav();
    Array.prototype.forEach.call(document.querySelectorAll(".back-home"), function (b) {
      b.onclick = function () { renderHome(); show("screen-home"); };
    });
    Array.prototype.forEach.call(document.querySelectorAll(".back-results"), function (b) {
      b.onclick = function () { if (lastResults) showResults(lastResults); else { renderHome(); show("screen-home"); } };
    });
    $("switch-profile").onclick = function () {
      $("profile-existing").textContent = "";
      $("profile-name").value = "";
      $("profile-name").focus();
      show("screen-profile");
    };
    $("preview-toggle").onclick = function () {
      previewMode = !previewMode;
      if (state) renderHome();
    };
    $("sign-out").onclick = signOut;
    show("screen-profile");
  }

  // expose a tiny debug surface for verification (set a fake date, reset)
  window.CCQ = {
    setDate: function (s) { localStorage.setItem("ccq:debugDate", s); },
    clearDate: function () { localStorage.removeItem("ccq:debugDate"); },
    state: function () { return state; },
    today: today,
    // Content review: unlock every day tile (opens in review mode — no points/streak changes).
    previewAll: function () { previewMode = true; if (state) { renderHome(); show("screen-home"); } return "Preview ON — every day tile is now clickable (review mode). Run CCQ.previewOff() to restore."; },
    previewOff: function () { previewMode = false; if (state) renderHome(); return "Preview OFF."; },
    // Jump straight into one day in review mode, e.g. CCQ.preview(7).
    preview: function (n) { if (!state) return "Pick a player first."; if (n < 1 || n > TOTAL_DAYS) return "Day must be 1–" + TOTAL_DAYS + "."; beginDay(n, true); return "Previewing day " + n + " (review mode)."; }
  };

  document.addEventListener("DOMContentLoaded", init);
})();
