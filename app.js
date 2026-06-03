/* Claude Quest — game logic (vanilla JS, no dependencies). */
(function () {
  "use strict";

  var CURRICULUM = window.CURRICULUM || [];
  var TOTAL_DAYS = CURRICULUM.length;
  var POINTS_FIRST_TRY = 10;
  var POINTS_AFTER_MISS = 5;
  var POINTS_CHALLENGE = 5;

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
  var previewMode = false; // when on (via CCQ.previewAll), every day tile opens in review mode for content review

  function blankState(name) {
    return { name: name, totalPoints: 0, currentStreak: 0, longestStreak: 0,
      lastCompletedDate: null, perfectCount: 0, days: {}, badges: {}, verdictsUsed: [] };
  }
  function key(name) { return "ccq:" + name; }
  function load(name) {
    try { var raw = localStorage.getItem(key(name)); if (raw) return JSON.parse(raw); } catch (e) {}
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

    $("results-home").onclick = function () { renderHome(); show("screen-home"); };
    show("screen-results");
  }

  // ================= WIRE-UP =================
  function init() {
    initProfile();
    initAuth();
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
