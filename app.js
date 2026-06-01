/* Claude Code Quest — game logic (vanilla JS, no dependencies). */
(function () {
  "use strict";

  var CURRICULUM = window.CURRICULUM || [];
  var TOTAL_DAYS = CURRICULUM.length;
  var POINTS_FIRST_TRY = 10;
  var POINTS_AFTER_MISS = 5;
  var POINTS_CHALLENGE = 5;

  var BADGES = [
    { id: "first_day", emoji: "🌱", name: "First Steps", desc: "Complete day 1", test: function (s) { return completedCount(s) >= 1; } },
    { id: "streak_3", emoji: "🔥", name: "On a Roll", desc: "3-day streak", test: function (s) { return s.longestStreak >= 3; } },
    { id: "streak_7", emoji: "⚡", name: "Week Warrior", desc: "7-day streak", test: function (s) { return s.longestStreak >= 7; } },
    { id: "streak_14", emoji: "🏆", name: "Unstoppable", desc: "14-day streak", test: function (s) { return s.longestStreak >= 14; } },
    { id: "perfect_day", emoji: "🎯", name: "Sharpshooter", desc: "A flawless quiz", test: function (s) { return s.perfectCount >= 1; } },
    { id: "perfect_5", emoji: "💎", name: "Quiz Master", desc: "5 flawless quizzes", test: function (s) { return s.perfectCount >= 5; } },
    { id: "all_18", emoji: "🥋", name: "Black Belt", desc: "Finish all 18 days", test: function (s) { return completedCount(s) >= TOTAL_DAYS; } }
  ];

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

  // ---- state ----
  var profile = null;   // current player name
  var state = null;     // current player state

  function blankState(name) {
    return { name: name, totalPoints: 0, currentStreak: 0, longestStreak: 0,
      lastCompletedDate: null, perfectCount: 0, days: {}, badges: {} };
  }
  function key(name) { return "ccq:" + name; }
  function load(name) {
    try { var raw = localStorage.getItem(key(name)); if (raw) return JSON.parse(raw); } catch (e) {}
    return blankState(name);
  }
  function save() { localStorage.setItem(key(profile), JSON.stringify(state)); }

  function completedCount(s) { return Object.keys(s.days).filter(function (k) { return s.days[k].completed; }).length; }
  function nextDayNumber(s) { return Math.min(completedCount(s) + 1, TOTAL_DAYS); }
  function playedToday(s) { return s.lastCompletedDate === today(); }
  function availableToday(s) { return !playedToday(s) && completedCount(s) < TOTAL_DAYS; }

  // If a day was missed, the live streak is broken — reconcile on load.
  function reconcileStreak() {
    if (state.lastCompletedDate && state.lastCompletedDate !== today() && state.lastCompletedDate !== addDays(today(), -1)) {
      if (state.currentStreak !== 0) { state.currentStreak = 0; save(); }
    }
  }

  // ---- session (one day in progress) ----
  var session = null; // { day, replay, qIndex, quizPoints, missedThisQ, perfect, checks[] }

  // ---- DOM helpers ----
  function $(id) { return document.getElementById(id); }
  function show(screenId) {
    ["screen-profile", "screen-home", "screen-lesson", "screen-quiz", "screen-challenge", "screen-results"]
      .forEach(function (s) { $(s).classList.toggle("hidden", s !== screenId); });
    window.scrollTo(0, 0);
  }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

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

  // ================= HOME =================
  function renderHome() {
    $("home-player").textContent = "👤 " + profile;
    $("stat-points").textContent = state.totalPoints;
    $("stat-streak").textContent = state.currentStreak;
    $("stat-longest").textContent = state.longestStreak;
    $("stat-progress").textContent = completedCount(state) + "/" + TOTAL_DAYS;
    $("streak-flame").classList.toggle("lit", state.currentStreak > 0);

    renderCTA();
    renderGrid();
    renderBadges();
  }

  function renderCTA() {
    var cta = $("today-cta");
    cta.innerHTML = "";
    var done = completedCount(state);
    if (done >= TOTAL_DAYS) {
      cta.appendChild(el("h2", null, "🎊 You finished the quest!"));
      cta.appendChild(el("p", "muted", "All 18 days complete. Replay any day to review, and keep using what you learned."));
      return;
    }
    if (availableToday(state)) {
      var n = nextDayNumber(state);
      var d = CURRICULUM[n - 1];
      cta.appendChild(el("div", "step-label", "Today's lesson"));
      cta.appendChild(el("h2", null, "Day " + n + ": " + d.title));
      cta.appendChild(el("p", "muted", d.lesson.length + " quick cards · " + d.quiz.length + " questions · " + d.challenge.length + " hands-on tasks — about 15 minutes."));
      var btn = el("button", "btn btn-primary", "Start Day " + n + " →");
      btn.onclick = function () { beginDay(n, false); };
      cta.appendChild(btn);
    } else {
      cta.appendChild(el("h2", null, "✅ Nice work today!"));
      var streakMsg = state.currentStreak > 1
        ? "You're on a " + state.currentStreak + "-day streak. Come back tomorrow to keep it alive!"
        : "Come back tomorrow for the next day and start building a streak.";
      cta.appendChild(el("p", "muted", streakMsg));
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
    if (state.lastCompletedDate === addDays(t, -1)) state.currentStreak += 1;
    else state.currentStreak = 1;
    state.longestStreak = Math.max(state.longestStreak, state.currentStreak);

    var multiplier = 1 + Math.min(state.currentStreak - 1, 9) * 0.1;
    var streakBonus = Math.round(base * multiplier) - base;
    var dayScore = base + streakBonus;

    state.totalPoints += dayScore;
    state.lastCompletedDate = t;
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
  // Fun, non-coder productivity tips for Claude (chat, cowork, or code).
  var TIPS = [
    "Paste a messy email thread and ask “what do I actually need to do here?” to get a clean action list.",
    "Before a meeting, drop in your notes and ask Claude for three sharp questions to bring.",
    "Turn a wall of text into a to-do list: “give me this as a checklist I can actually follow.”",
    "After any plan, ask “what am I missing?” — Claude is great at catching the obvious gap.",
    "Stuck on a blank page? Ask for “five rough first drafts, one sentence each” and pick a direction.",
    "Feed Claude a screenshot and ask it to pull the numbers or dates into a clean table.",
    "End a request with “explain it like I'm new to this” to skip the jargon.",
    "Before sending an important message, ask Claude to “play devil's advocate.”",
    "Save the prompts you reuse in a notes file so you're not rewriting instructions every day.",
    "After a long chat, ask “summarize the decisions we made” so you have a paper trail.",
    "Paste something you wrote and ask Claude to match your tone on the next draft.",
    "Batch your small questions into one message — it's faster than asking one at a time."
  ];

  function showResults(r) {
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
    // per-day "Suggest an improvement" link → pre-filled GitHub issue
    var d = CURRICULUM[session.day - 1];
    var repo = "https://github.com/MaceeJB/claude-code-quest";
    var title = "Day " + d.day + " (" + d.title + "): suggestion";
    var body = "**Day " + d.day + " — " + d.title + "**\n\n" +
      "What would you improve? (lesson, quiz, a hands-on task, the capstone, or anything else)\n\n";
    $("results-suggest").href = repo + "/issues/new?title=" + encodeURIComponent(title) + "&body=" + encodeURIComponent(body);

    // fun productivity tip in a purple bubble
    $("results-tip-text").textContent = TIPS[Math.floor(Math.random() * TIPS.length)];

    $("results-home").onclick = function () { renderHome(); show("screen-home"); };
    show("screen-results");
  }

  // ================= WIRE-UP =================
  function init() {
    initProfile();
    setupQuizNav();
    Array.prototype.forEach.call(document.querySelectorAll(".back-home"), function (b) {
      b.onclick = function () { renderHome(); show("screen-home"); };
    });
    $("switch-profile").onclick = function () {
      $("profile-existing").textContent = "";
      $("profile-name").value = "";
      $("profile-name").focus();
      show("screen-profile");
    };
    show("screen-profile");
  }

  // expose a tiny debug surface for verification (set a fake date, reset)
  window.CCQ = {
    setDate: function (s) { localStorage.setItem("ccq:debugDate", s); },
    clearDate: function () { localStorage.removeItem("ccq:debugDate"); },
    state: function () { return state; },
    today: today
  };

  document.addEventListener("DOMContentLoaded", init);
})();
