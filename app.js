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
  // Only the owner sees the "Preview all days" content-review tool: either the
  // player whose name matches OWNER_NAME, or any device flagged via CCQ.owner().
  var OWNER_NAME = "Macee";
  function isOwner() {
    return (!!profile && profile.toLowerCase() === OWNER_NAME.toLowerCase()) ||
           localStorage.getItem("ccq:owner") === "1";
  }

  // ===== Cross-device sync (Supabase) =====
  // These two values are PUBLIC and safe to ship in the page — the Row Level
  // Security policies in Supabase are what actually protect each player's data.
  // To point this at a different Supabase project, change these three lines.
  var SUPABASE_URL = "https://ezcrydamiplzywppvhri.supabase.co";
  var SUPABASE_KEY = "sb_publishable_RUaWCuxx1_VZ0rGsVfBQgw_qB-zmAC1";
  var REDIRECT_URL = "https://maceejb.github.io/claude-quest/";

  var sb = null;        // Supabase client (stays null if the library didn't load)
  var authUser = null;  // signed-in user, or null for local-only play
  var pendingEmail = null; // email a sign-in code was just sent to (for verifyOtp)
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
    { id: 1, emoji: "📘", title: "Week 1 Sprint", tagline: "Have Claude build you a personal learning kit.", start: 1,  end: 6  },
    { id: 2, emoji: "🛠️", title: "Week 2 Sprint", tagline: "Create a small tool, connected to your real apps and data, that takes a repetitive task off your plate.", start: 7,  end: 12 },
    { id: 3, emoji: "🚀", title: "Week 3 Sprint",  tagline: "Plan it, automate it end to end, put it in git, and hand it to your team.", start: 13, end: 18 }
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
      perfectCount: 0, days: {}, badges: {}, verdictsUsed: [], activeDays: [] };
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
    if (s.activeDays === undefined) {
      // Seed activity dates from existing completions so the team streak has history.
      var set = {};
      for (var k in s.days) { if (s.days[k] && s.days[k].date) set[s.days[k].date] = 1; }
      if (s.lastCompletedDate) set[s.lastCompletedDate] = 1;
      s.activeDays = Object.keys(set);
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
  // Resolves to the saved state, or null when this account genuinely has no row
  // yet (a real new player). REJECTS on a lookup error, so callers can tell a
  // failed fetch apart from "no data" and never overwrite real progress with a blank.
  function fetchCloud() {
    return sb.from("progress").select("data").eq("user_id", authUser.id).maybeSingle()
      .then(function (res) {
        if (res.error) throw new Error(res.error.message || "cloud load failed");
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

  // Minimal single-stroke line icons (Feather-style), rendered with currentColor.
  var ICON_PATHS = {
    flame: '<path d="M12 3c2.5 3 4 5 4 8a4 4 0 0 1-8 0c0-1.5.6-2.6 1.3-3.4.2 1 .8 1.8 1.6 2.1C11 8.4 10.6 6 12 3z"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/>',
    compass: '<circle cx="12" cy="12" r="9"/><polygon points="16.2 7.8 13.4 13.4 7.8 16.2 10.6 10.6 16.2 7.8"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M8.2 13.5 7 22l5-3 5 3-1.2-8.5"/>',
    bookOpen: '<path d="M2 4h6a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H2z"/><path d="M22 4h-6a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5H22z"/>',
    check: '<path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><polyline points="22 4 12 14.5 9 11.5"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    tool: '<path d="M14.5 6.5a5 5 0 0 0 6 6l-7 7a2.1 2.1 0 0 1-3-3l7-7a5 5 0 0 0-6-6l3.2 3.2-1.8 1.8L9.7 5z"/>',
    send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
    bolt: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    gem: '<polygon points="6 3 18 3 22 9 12 22 2 9 6 3"/><line x1="2" y1="9" x2="22" y2="9"/><polyline points="6 3 9 9 12 22 15 9 18 3"/>',
    headphones: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-7h1a2 2 0 0 1 2 2zM3 19a2 2 0 0 0 2 2h1v-7H5a2 2 0 0 0-2 2z"/>',
    sprout: '<path d="M7 20h10"/><path d="M12 20v-9"/><path d="M12 11C12 7 9 6 5 6c0 4 3 5 7 5z"/><path d="M12 13c0-3 2-4 6-4 0 3-3 4-6 4z"/>'
  };
  function icon(name) {
    var p = ICON_PATHS[name]; if (!p) return "";
    return '<svg class="icn" viewBox="0 0 24 24" aria-hidden="true">' + p + '</svg>';
  }
  // Which icon represents each badge / project.
  var BADGE_ICON = { first_day: "sprout", streak_3: "flame", streak_7: "bolt", streak_14: "award", perfect_day: "target", perfect_5: "gem", all_18: "award", deep_5: "compass" };
  function projectIcon(id) { return id === 1 ? "book" : id === 2 ? "tool" : "send"; }

  // Copy text to clipboard with a graceful fallback, and flash the button.
  function copyToClipboard(text, btn, restoreLabel) {
    var original = btn.innerHTML;
    function done() { btn.textContent = "Copied"; btn.classList.add("copied"); setTimeout(function () { btn.innerHTML = original; btn.classList.remove("copied"); }, 2200); }
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
    $("auth-send").onclick = sendCode;
    $("auth-email").addEventListener("keydown", function (e) { if (e.key === "Enter") sendCode(); });
    $("auth-verify").onclick = verifyCode;
    $("auth-code").addEventListener("keydown", function (e) { if (e.key === "Enter") verifyCode(); });

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

  // Email the player a 6-digit sign-in code, then reveal the code-entry box.
  // (A code, not a clickable link, so corporate email scanners can't consume it.)
  function sendCode() {
    var email = ($("auth-email").value || "").trim();
    if (!email || email.indexOf("@") === -1) { $("auth-email").focus(); return; }
    pendingEmail = email;
    $("auth-msg").textContent = "Sending…";
    $("auth-send").disabled = true;
    sb.auth.signInWithOtp({ email: email, options: { emailRedirectTo: REDIRECT_URL } })
      .then(function (res) {
        $("auth-send").disabled = false;
        if (res.error) {
          $("auth-msg").textContent = "Couldn't send the code: " + res.error.message;
        } else {
          $("auth-code-box").classList.remove("hidden");
          $("auth-send").textContent = "Resend code";
          $("auth-msg").textContent = "We emailed a sign-in code to " + email + ". Enter it below.";
          $("auth-code").focus();
        }
      });
  }

  // Verify the typed code. New accounts get a "signup"-type code and existing
  // ones an "email"-type code, so try email first and fall back to signup.
  function verifyCode() {
    var code = ($("auth-code").value || "").replace(/\D/g, "");
    if (code.length < 6) { $("auth-msg").textContent = "Enter the code from the email."; $("auth-code").focus(); return; }
    if (!pendingEmail) { $("auth-msg").textContent = "Request a code first."; return; }
    $("auth-verify").disabled = true;
    $("auth-msg").textContent = "Checking your code…";
    sb.auth.verifyOtp({ email: pendingEmail, token: code, type: "email" })
      .then(function (res) { return res && res.error ? sb.auth.verifyOtp({ email: pendingEmail, token: code, type: "signup" }) : res; })
      .then(function (res) {
        $("auth-verify").disabled = false;
        if (res && res.error) {
          $("auth-msg").textContent = "That code didn't work: " + res.error.message + " — request a new one and try again.";
        } else {
          $("auth-msg").textContent = "";
          if (res && res.data && res.data.user && !authUser) enterSignedIn(res.data.user);
        }
      })
      .catch(function () { $("auth-verify").disabled = false; $("auth-msg").textContent = "Something went wrong checking the code. Request a new one and try again."; });
  }

  // Sign-in succeeded: load this player's cloud progress, importing any local
  // progress on this device the first time the account is used.
  function enterSignedIn(user) {
    authUser = user;
    $("auth-msg").textContent = "";
    loadProfileFromCloud(user, 0);
  }

  // Pull the player's cloud record and land them on the home screen. If the
  // lookup ERRORS (network blip), we retry with backoff and — critically — never
  // fall through to building a blank state and saving it, which would overwrite
  // real progress. saveCloud() runs only after a successful fetch (restored data,
  // or a genuine null meaning a brand-new account with no row yet).
  function loadProfileFromCloud(user, attempt) {
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
    }).catch(function (err) {
      console.warn("Cloud load failed during sign-in (attempt " + attempt + "):", err && err.message);
      if (attempt < 3) {
        $("auth-msg").textContent = "Loading your progress…";
        setTimeout(function () { loadProfileFromCloud(user, attempt + 1); }, 800 * (attempt + 1));
        return;
      }
      // Persistent failure: do NOT overwrite the cloud record. Leave it untouched
      // and let them retry with a refresh (the session is already established, so a
      // reload re-runs this load without re-entering a code).
      authUser = null;
      if ($("auth-verify")) $("auth-verify").disabled = false;
      $("auth-msg").textContent = "You're signed in, but we couldn't reach your saved progress just now. Your data is safe — please refresh the page to try again.";
    });
  }

  function signOut() {
    if (sb) sb.auth.signOut();
    authUser = null; profile = null; state = null; pendingEmail = null;
    $("profile-existing").textContent = "";
    $("auth-msg").textContent = "";
    if ($("auth-code-box")) $("auth-code-box").classList.add("hidden");
    if ($("auth-code")) $("auth-code").value = "";
    if ($("auth-send")) $("auth-send").textContent = "Email me a sign-in code";
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
      var owner = isOwner();
      pv.classList.toggle("hidden", !owner);   // hidden for everyone but the owner
      if (!owner) previewMode = false;          // never leave non-owners in preview mode
      pv.textContent = previewMode ? "Preview: ON" : "Preview all days";
      pv.classList.toggle("active", previewMode);
    }

    renderCountdown();
    renderCTA();
    renderProjects();
    renderGrid();
    renderBadges();
    renderTeamProgress();
  }

  // ---- Sharing & team engagement ----
  // Build a friendly, paste-into-chat status from the player's own progress.
  function buildShareText(opts) {
    var url = REDIRECT_URL;
    var done = completedCount(state);
    var streak = state.currentStreak;
    var head = (opts && opts.day)
      ? "Just finished Day " + opts.day + (opts.dayTitle ? " (" + opts.dayTitle + ")" : "") + " of Claude Quest"
      : "Making progress on Claude Quest";
    var streakBit = streak > 1 ? ", on a " + streak + "-day streak" : "";
    var progressBit = " (" + done + "/" + TOTAL_DAYS + " days done)";
    return head + streakBit + progressBit + ". My AI floor is rising. Play along: " + url;
  }

  // Cooperative team progress — no ranking, just shared momentum. Reads
  // aggregate-only stats from a Supabase function (team_stats); silently hidden
  // if cloud sync isn't available or the function hasn't been set up yet. Only
  // signed-in (synced) teammates contribute to the totals.
  function renderTeamProgress() {
    var box = $("team-progress");
    if (!box) return;
    if (!sb) { box.classList.add("hidden"); return; }
    sb.rpc("team_stats", { p_today: today() }).then(function (res) {
      if (!res || res.error || !res.data) { box.classList.add("hidden"); return; }
      var d = res.data;
      var players = d.players || 0;
      if (players < 1) { box.classList.add("hidden"); return; }
      var lessons = d.lessons || 0;
      var playedToday = d.played_today || 0;
      var max = players * TOTAL_DAYS;
      var pct = max > 0 ? Math.min(100, Math.round(lessons / max * 100)) : 0;
      box.innerHTML = "";
      box.appendChild(el("div", "team-head", icon("users") + " Team progress"));
      var track = el("div", "team-bar");
      var fill = el("div", "team-bar-fill"); fill.style.width = pct + "%";
      track.appendChild(fill);
      box.appendChild(track);
      box.appendChild(el("div", "team-line", "<b>" + lessons + "</b> of " + max + " lessons completed together"));
      var teamStreak = d.team_streak || 0;
      if (teamStreak > 0) {
        box.appendChild(el("div", "team-line", "🔥 <b>" + teamStreak + "-day</b> team streak"));
      }
      box.appendChild(el("div", "team-line muted", playedToday + " of " + players + " teammate" + (players === 1 ? "" : "s") + " played today"));
      box.classList.remove("hidden");
    }, function () { box.classList.add("hidden"); });
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
      unit.innerHTML = "days until the <strong>" + EVENT_NAME + "</strong>";
      box.appendChild(unit);
    } else if (left === 1) {
      box.classList.add("is-soon");
      var t1 = el("span", "bunker-text", "");
      t1.innerHTML = "<strong>Tomorrow:</strong> the " + EVENT_NAME + ".";
      box.appendChild(t1);
    } else if (left >= -3) {
      // event day, or assume it runs a few days after
      box.classList.add("is-today");
      var t0 = el("span", "bunker-text", "");
      t0.innerHTML = left === 0
        ? "Today: the <strong>" + EVENT_NAME + "</strong>."
        : "The <strong>" + EVENT_NAME + "</strong> is happening now.";
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
      card.appendChild(el("div", "pc-emoji", icon(projectIcon(p.id))));
      var body = el("div", "pc-body");
      var title = el("div", "pc-title"); title.textContent = p.title;
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
        "A streak freeze saved your " + state.currentStreak + "-day streak. One missed day is on us."));
      delete state.freezeJustUsed; save();
    }

    var done = completedCount(state);
    if (done >= TOTAL_DAYS) {
      cta.appendChild(el("h2", null, "You finished the quest."));
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
      cta.appendChild(el("p", "muted", d.lesson.length + " cards · " + d.quiz.length + " questions · " + d.challenge.length + " hands-on tasks. About 15 minutes."));
      var btn = el("button", "btn btn-primary", "Start Day " + n);
      btn.onclick = function () { beginDay(n, false); };
      cta.appendChild(btn);
      if (ahead) cta.appendChild(el("p", "cta-hint muted small",
        "You're ahead of the daily pace. One lesson a day makes it stick best, but a little extra is welcome."));
      else if (behind) cta.appendChild(el("p", "cta-hint muted small",
        "A little behind? You can do a few in a row to catch back up to today."));
    } else {
      cta.appendChild(el("h2", null, "You're all set for today."));
      var lead = done - sched; // how many days ahead of pace
      // "tomorrow" unless the next lesson day lands after a weekend/holiday.
      var soon = nextActiveDay(today()) === addDays(today(), 1) ? "tomorrow" : "your next weekday";
      var msg = lead >= LEAD_DAYS
        ? "You're " + LEAD_DAYS + " days ahead, as far as the pace allows. Come back " + soon + " to keep going and protect your streak."
        : (state.currentStreak > 1
          ? "You're on a " + state.currentStreak + "-day streak. Come back " + soon + " to keep it going. Weekends are free; they won't break it."
          : "Come back " + soon + " for the next lesson and start building a streak.");
      cta.appendChild(el("p", "muted", msg));
    }

    // Streak-freeze status (only once a streak or a used freeze exists).
    if (state.currentStreak > 0 || state.freezeUsedDate) {
      var fz = el("p", "freeze-status muted small");
      if (freezeAvailable(state)) {
        fz.textContent = "Streak freeze ready. One missed day won't break your streak.";
      } else {
        var dleft = daysUntilFreezeRefill(state);
        fz.textContent = "Streak freeze used. Refills in " + dleft + " day" + (dleft === 1 ? "" : "s") + ".";
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
      fb2.innerHTML = '<span class="verdict">Not quite. Try again.</span>';
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
        var em = el("span", "pb-emoji", icon(projectIcon(p.id)));
        var txt = el("span", "pb-text");
        var strong = document.createElement("b");
        strong.textContent = p.title;
        txt.appendChild(strong);
        txt.appendChild(document.createTextNode(" · " + phase + " · day " + pf.index + " of " + pf.of));
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
      if (isCap) main.appendChild(el("span", "cap-badge", "Sprint"));
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

  // Register a daily check-in: advance the streak (rest days bridged, one freeze
  // allowed), stamp lastCompletedDate, and record today's date for the team streak.
  // Used by both first-time completions AND replays of already-completed days.
  function registerCheckIn(t) {
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
    state.lastCompletedDate = t;
    if (!state.activeDays) state.activeDays = [];
    if (state.activeDays.indexOf(t) === -1) state.activeDays.push(t); // for the team streak
  }

  function finishDay() {
    var d = CURRICULUM[session.day - 1];
    var challengePoints = session.checks.filter(Boolean).length * POINTS_CHALLENGE;
    var base = session.quizPoints + challengePoints;
    var t = today();

    if (session.replay) {
      // A replay of a genuinely completed day still counts as showing up today
      // (keeps the streak alive + team activity), but earns no points and doesn't
      // change the day's saved record. Preview mode never counts.
      var rec = state.days[d.day];
      if (!previewMode && rec && rec.completed) { registerCheckIn(t); save(); }
      showResults({ replay: true, quiz: session.quizPoints, challenge: challengePoints });
      return;
    }

    // First-time completion: check in (advances streak), then award points.
    registerCheckIn(t);
    var multiplier = 1 + Math.min(state.currentStreak - 1, 9) * 0.1;
    var streakBonus = Math.round(base * multiplier) - base;
    var dayScore = base + streakBonus;

    state.totalPoints += dayScore;
    if (session.perfect) state.perfectCount += 1;
    state.days[d.day] = { completed: true, score: dayScore, perfect: session.perfect, date: t };

    var newBadges = evaluateBadges();
    save();

    showResults({ replay: false, quiz: session.quizPoints, challenge: challengePoints,
      multiplier: multiplier, streakBonus: streakBonus, total: dayScore,
      perfect: session.perfect, streak: state.currentStreak, newBadges: newBadges });
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
    { surface: "Cowork", text: "After mapping out a plan, ask “what am I missing?” Claude is great at catching the obvious gap." },
    { surface: "Cowork", text: "At the end of a work session, ask Claude to summarize the decisions you made so you have a paper trail." },
    { surface: "Cowork", text: "Hand Claude a folder of reports and ask for a one-page summary you can forward to your boss." },
    { surface: "Code", text: "Save the instructions you repeat into a CLAUDE.md file so Claude remembers them every session." },
    { surface: "Code", text: "Ask Claude Code to rename or reorganize a messy folder of files in one go, then review before approving." },
    { surface: "Code", text: "Run a one-off chore with <code>claude -p \"clean up this CSV\"</code> without starting a whole session." }
  ];

  function showResults(r) {
    lastResults = r;
    $("results-emoji").innerHTML = icon(r.replay ? "bookOpen" : (r.perfect ? "target" : "check"));
    $("results-title").textContent = r.replay ? "Review complete" : "Day complete";
    var bd = $("results-breakdown");
    bd.innerHTML = "";
    function row(label, val, cls) { var x = el("div", "row" + (cls ? " " + cls : "")); x.appendChild(el("span", null, label)); x.appendChild(el("span", null, val)); bd.appendChild(x); }

    if (r.replay) {
      row("Quiz (review)", r.quiz + " pts");
      row("Hands-on (review)", r.challenge + " pts");
      row("Points earned", "0, review mode", "total");
    } else {
      row("Quiz", "+" + r.quiz);
      row("Hands-on challenge", "+" + r.challenge);
      row("Streak bonus (×" + r.multiplier.toFixed(1) + ", " + r.streak + "-day)", "+" + r.streakBonus);
      row("Day total", "+" + r.total + " pts", "total");
    }

    var badgeBox = $("results-badges");
    badgeBox.innerHTML = "";
    if (!r.replay && r.newBadges && r.newBadges.length) {
      badgeBox.appendChild(el("div", "step-label", "New badge" + (r.newBadges.length > 1 ? "s" : "") + " unlocked"));
      r.newBadges.forEach(function (b) { badgeBox.appendChild(el("span", "results-badge", b.emoji + " " + b.name)); });
    }
    var d = CURRICULUM[session.day - 1];

    // Project-complete celebration — shown only when you finish the last day of a
    // project block for real (not on replay).
    var proj = $("results-project");
    if (proj) {
      var pf = projectForDay(d.day);
      if (!r.replay && pf && pf.isLast) {
        var p = pf.project;
        proj.innerHTML = "";
        proj.appendChild(el("div", "rp-emoji", icon("award")));
        var h = el("div", "rp-title"); h.textContent = p.title + " complete";
        proj.appendChild(h);
        var sub = el("div", "rp-sub"); sub.textContent = p.tagline;
        proj.appendChild(sub);
        var nextP = PROJECTS[p.id]; // ids are 1-based, so index p.id is the next project
        var teaser = el("div", "rp-next");
        teaser.textContent = nextP
          ? "Up next: " + nextP.title
          : "All three sprints shipped. You're a Claude Code black belt.";
        proj.appendChild(teaser);
        proj.classList.remove("hidden");
      } else {
        proj.classList.add("hidden");
      }
    }

    var feedbackEmail = "MaceeJB@gmail.com";
    var subject = "Claude Quest, Day " + d.day + " (" + d.title + "): feedback";
    var body = "Day " + d.day + ": " + d.title + "\n\n" +
      "What would you improve? (lesson, quiz, a hands-on task, the sprint task, or anything else)\n\n";
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
          ? icon("compass") + " Revisit the deeper dive"
          : icon("compass") + " Go deeper on today's topic <span class=\"dd-pts\">+" + POINTS_DEEPDIVE + " pts</span>";
        ddBtn.onclick = openDeepDive;
        ddBox.appendChild(ddBtn);
        if (ddDone) ddBox.appendChild(el("div", "dd-earned muted small", "✓ Bonus already earned"));
      }
    }

    $("results-share").onclick = function () { copyToClipboard(buildShareText({ day: d.day, dayTitle: d.title }), this, "Share my progress"); };
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
    if (awardedNow) head.innerHTML = "Bonus earned. <b>+" + POINTS_DEEPDIVE + " points</b> for going deeper on today's topic.";
    else if (rec && rec.deepDiveDone) head.innerHTML = "You already earned this day's bonus. Nice review.";
    else head.innerHTML = "Preview mode. No points awarded.";
    body.appendChild(head);
    if (newB.length) {
      var bb = el("div", "results-badges");
      bb.appendChild(el("div", "step-label", "New badge" + (newB.length > 1 ? "s" : "") + " unlocked"));
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
    $("share-progress").onclick = function () {
      if (state) copyToClipboard(buildShareText(null), this, "Share");
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
    preview: function (n) { if (!state) return "Pick a player first."; if (n < 1 || n > TOTAL_DAYS) return "Day must be 1–" + TOTAL_DAYS + "."; beginDay(n, true); return "Previewing day " + n + " (review mode)."; },
    // Flag THIS device as the owner so the "Preview all days" button shows even
    // if you're playing under a different name. CCQ.notOwner() turns it back off.
    owner: function () { localStorage.setItem("ccq:owner", "1"); if (state) renderHome(); return "Owner mode ON for this device — the Preview button is now visible."; },
    notOwner: function () { localStorage.removeItem("ccq:owner"); previewMode = false; if (state) renderHome(); return "Owner mode OFF for this device."; }
  };

  // app.js is injected asynchronously by the version loader, so DOMContentLoaded
  // may already have fired by the time we get here — run init immediately if so.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
