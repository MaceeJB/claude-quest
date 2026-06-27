/* Claude Quest. Curriculum data.
 * Defined as a plain global so the app works from file:// and from GitHub Pages
 * without any fetch/CORS. Each day: { day, title, section, lesson[], quiz[], challenge[] }.
 * quiz[].answer is the 0-based index of the correct option.
 *
 * challenge[] items are objects: { text, link }, where `link` points at the
 * official Claude Code docs page for that task ("Learn how →"). The final item of
 * each day has capstone:true. It carries ONE real project forward across all 18
 * days, so players build something real while they learn.
 */
var DOC = "https://code.claude.com/docs/en/";
window.CURRICULUM = [
  {
    day: 1,
    title: "Installation & Your First Session",
    section: "Getting Started",
    lesson: [
      { heading: "What Claude Code is, and why operators use it", body: "Claude Code is an AI assistant that works right on your computer: it can read files, run commands, edit documents and spreadsheets, and automate repetitive work. You don't write code, you describe what you want in plain English, like briefing a sharp teammate. Most of us will use the <b>desktop app</b> (a normal application window); it also runs in the terminal, and the skills are identical either way. For an operator that means jobs like cleaning up a messy export, summarizing a folder of reports, renaming files in bulk, or running a routine check can be handed off and finished in seconds." },
      { heading: "Desktop app or terminal: which should you use?", body: "Both run the <b>same Claude with the same features</b>, so the choice is really about how you like to work. The <b>desktop app</b> is the friendly default: a normal application window with a visual workspace, no commands to memorize, review changes in a <b>diff viewer</b> before approving, drag files in, paste screenshots, and keep several sessions side by side. For most of our team, that's the right home. Reach for the <b>terminal</b> when you already live on the command line, or when you want to <b>script and automate</b> Claude, running it inside a shell script or on a schedule (you'll see that on Day 18). Short version: <b>desktop for hands-on daily work, terminal for automation and power-user setups</b>, and you can always switch later." },
      { heading: "Installing it (the easy way)", body: "The simplest path is the <b>desktop app</b>: download the installer from the Claude Code site, run it, and open the app, it updates itself in the background, so you're always on the latest version. <i>Terminal alternative:</i> a <b>native install</b> (a one-line curl/irm script) also auto-updates, while <b>Homebrew</b> and package managers (<code>winget</code>, <code>apt</code>, <code>dnf</code>) work but need manual updates. One Windows note for terminal users only: installing <b>Git for Windows</b> lets it use the Bash shell instead of PowerShell, the desktop app needs no such setup." },
      { heading: "Starting your first session", body: "In the desktop app, open the <b>Code</b> tab, click <b>New session</b>, and just start typing, no setup needed. The folder Claude is working in shows at the top of the window, next to your session name. Want it working somewhere specific? Just ask: 'create a folder called claude-quest in my Documents and work in there.' <i>Terminal:</i> type <code>claude</code> inside a project folder instead. The first time, you log in (a Claude subscription, Console account, or a cloud provider such as Bedrock or Vertex AI), and your login is remembered after that. As it starts, Claude automatically loads any <code>CLAUDE.md</code> files and its own <b>auto memory</b>, saved notes about your project. So it begins already knowing your context instead of from a blank slate." },
      { heading: "How you actually talk to it", body: "You work in plain language, one request at a time. No special syntax. Try things like 'summarize the files in this folder', 'turn this CSV into a clean table', or 'find every document that mentions the Q3 budget'. Claude works in a loop: it looks around, takes an action, then checks its own result. Crucially, it asks for your approval before changing anything, so you are always in control of what happens." },
      { heading: "Running a one-off task (no session)", body: "When you just want a single job done with no back-and-forth, the terminal has a one-off mode: <code>claude -p \"your task\"</code> runs that one task and exits. Ideal for scripts and scheduled jobs. <i>This headless mode is a CLI/SDK feature; in the desktop app you'd just type the request normally, or set up a scheduled <b>Routine</b> for recurring jobs (more on automation on Day 18).</i> For example, <code>claude -p \"summarize today's log file and flag anything unusual\"</code> could run every morning on its own." },
      { heading: "You don't need to be an engineer", body: "The real skill here isn't coding. It's describing what you want clearly and verifying the result is right. That plays directly to an operator's strengths. Over the next few weeks you'll build genuine fluency one topic at a time, and your hands-on weekly <b>Sprint</b> gives you a real thing to practice on. Today, the only goal is to get it installed and say hello." }
    ],
    quiz: [
      { q: "Most of the team will use the desktop app. How do you start working there?", options: ["Type claude in a terminal", "Open the Code tab, click New session, and start typing", "Run an install script first", "Email IT for access"], answer: 1, explanation: "Code tab, New session, type your request. The working folder shows at the top of the window, and you can ask Claude to create or switch folders." },
      { q: "You want to run a single task from a script with no interactive session. Which is built for that?", options: ["claude", "claude --continue", "claude -p \"analyze this log\"", "/init"], answer: 2, explanation: "The -p flag is the terminal/CLI one-off mode. Ideal for scripts and scheduled jobs." },
      { q: "Which is true about the desktop app vs. the terminal?", options: ["They teach completely different skills", "The skills are the same; only how you launch and click differs", "The desktop app can't edit files", "The terminal is required for slash commands"], answer: 1, explanation: "Same Claude, same features. The desktop app and terminal differ mainly in how you start and navigate." },
      { q: "What happens at the very start of a session?", options: ["Nothing loads until you prompt", "CLAUDE.md files and auto memory load", "All MCP tools fully load into context", "It clears previous memory"], answer: 1, explanation: "CLAUDE.md and auto memory load on launch so Claude starts with project context." }
    ],
    challenge: [
      { text: "Open the Claude desktop app, go to the <b>Code</b> tab, click <b>New session</b> (left sidebar), and send your first message. Notice the folder name at the top of the window, next to your session name; that's where Claude is working. (Terminal users: run <code>claude</code> inside a folder instead.)", link: DOC + "desktop-quickstart" },
      { text: "Send your first plain-English request, e.g. 'what files are in this folder and what are they?', and watch how Claude looks around before answering.", link: DOC + "quickstart" },
      { text: "Try a hands-off one-off: in the desktop app just type 'summarize the files in this folder'. (Terminal: <code>claude -p \"summarize the files in this folder\"</code> runs it and exits.)", link: DOC + "headless" },
      { text: "<b>Week 1 Sprint kickoff, Learn something new:</b> pick a subject you're curious about (a hobby, a tool, a topic at work). Start a fresh session and ask Claude to create an empty folder for it and work in there (terminal: make the folder and run <code>claude</code> inside it), and <b>you choose what to build</b> over the next 5 days: a <b>study guide</b>, a set of <b>flashcards</b>, a <b>self-quiz</b>, a <b>glossary</b>, or a <b>learning roadmap</b>. To start, ask Claude to scaffold a <code>learning-plan.md</code> that breaks your subject into about 5 subtopics.", link: DOC + "quickstart", capstone: true }
    ]
  },
  {
    day: 2,
    title: "The Agentic Loop & How Claude Works",
    section: "Getting Started",
    lesson: [
      { heading: "Why understanding the loop makes you better at this", body: "Claude isn't a vending machine that spits out an answer. It works the way a careful teammate does: it looks around, does something, then checks whether it worked. Once you can see those steps happening, you stop micromanaging and start directing, which is exactly the skill that makes an operator effective with any assistant." },
      { heading: "Gather → Act → Verify", body: "Every task moves through three phases: <b>gather</b> context (read the files, search for what's relevant), <b>act</b> (make the edit, run the command), and <b>verify</b> (check the result against what you asked for). There's no hidden 'compile' or 'build' step in the loop itself. Just these three, repeating and blending as the work goes." },
      { heading: "It checks its own work", body: "The verify phase is what separates this from a one-shot answer. After making a change, Claude re-reads the file, runs the check, or compares the output. And if something's off, it loops back and tries again. You can strengthen this by telling it how to know it's done (more on that on Day 14)." },
      { heading: "You're part of the loop: jump in anytime", body: "If Claude heads in the wrong direction, stop it mid-action, click the <b>stop button</b> in the desktop app, or press <code>Esc</code> in the terminal. Your conversation is <b>not</b> lost. You simply type a correction and it adjusts from there. To back up further to an earlier checkpoint, run <code>/rewind</code> (terminal: <code>Esc Esc</code> opens it too)." },
      { heading: "Correcting it is a conversation, not a reset", body: "Say Claude proposes a fix and you realize the real problem is elsewhere. Just tell it, in plain words, like 'no, the issue is in how sessions time out.' It reads your correction and changes its next step. You keep all the context you've built up; nothing starts over." },
      { heading: "What's in the 'conversation' it remembers", body: "Claude's working memory holds your chat history, the files it has read, command outputs, your CLAUDE.md and saved notes, and any loaded skills. As that fills up, it automatically tidies older material so it stays sharp, a topic you'll dig into on Day 15." }
    ],
    quiz: [
      { q: "Which is NOT one of the three phases of the agentic loop?", options: ["Gather context", "Take action", "Verify results", "Compile to binary"], answer: 3, explanation: "The loop is gather → act → verify; there is no compile phase." },
      { q: "Claude proposes a fix and you say 'no, the bug is in session handling.' What happens?", options: ["A new session starts and context is lost", "Claude reads your correction and adjusts its next step", "You must run /clear first", "History is permanently lost"], answer: 1, explanation: "The loop is conversational. Interrupt and redirect any time without losing context." },
      { q: "How do you stop Claude mid-action without losing the conversation?", options: ["Close the app", "Click the stop button (or press Esc in the terminal)", "Run /stop", "Ctrl+C twice"], answer: 1, explanation: "The stop button, Esc in the terminal, cancels the running action and keeps your conversation intact." }
    ],
    challenge: [
      { text: "Give Claude a small multi-step task and watch it gather → act → verify.", link: DOC + "common-workflows" },
      { text: "While it's working, click the <b>stop button</b> (or press <code>Esc</code> in the terminal) to interrupt, then type a redirection and continue.", link: DOC + "interactive-mode" },
      { text: "Run <code>/rewind</code> (terminal: <code>Esc Esc</code>) to open the rewind menu and look at your checkpoints.", link: DOC + "interactive-mode" },
      { text: "<b>Week 1 Sprint, Day 2:</b> describe the first piece of your learning kit in plain English (e.g. 'write a one-page overview of my subject plus a glossary of key terms') and watch the gather → act → verify loop build it end-to-end.", link: DOC + "common-workflows", capstone: true }
    ]
  },
  {
    day: 3,
    title: "Reading, Editing & Permissions",
    section: "Core Interaction",
    lesson: [
      { heading: "Why you can relax about letting it touch your files", body: "The biggest worry for a new operator is 'what if it changes something it shouldn't?' Claude Code is built so that, by default, nothing happens to your files without your say-so. And anything it does change can be undone. Knowing that lets you experiment freely." },
      { heading: "It asks before it changes anything", body: "In the standard (default) mode, when Claude wants to edit a file it <b>stops and asks first</b>. You can approve that one change, or approve it for the rest of the session so it stops asking for similar edits. It can always read files freely; it's changes that need your nod." },
      { heading: "Undo is built in", body: "Right before editing a file, Claude quietly takes a snapshot of it. If you don't like the result, run <code>/rewind</code> (terminal: press <code>Esc</code> twice) to roll back to how things were. That safety net is always there, even several steps later." },
      { heading: "Three speeds, one switch", body: "There are three modes: <b>default</b> (asks for each action), <b>auto-accept edits</b> (stops asking for routine edits), and <b>plan mode</b> (read-only, it can look but not touch). In the desktop app, the <b>mode selector</b> is the button at the bottom-left of the message box; it shows the mode you're in right now (such as <b>Accept edits</b>), and clicking it lets you switch. In the terminal, press <code>Shift+Tab</code> to cycle them. Choose the speed that matches how risky the work is." },
      { heading: "What auto-accept actually auto-approves", body: "Auto-accept edits speeds you up by approving file edits and <b>safe</b> housekeeping commands: making folders, moving and copying files (<code>mkdir</code>, <code>mv</code>, <code>cp</code>). It still pauses for anything genuinely risky, so you're not handing over the keys entirely." },
      { heading: "Setting your own guardrails: allow / ask / deny", body: "You can write rules that say always-allow, always-ask, or always-deny for specific commands. <b>Deny always wins</b> and even removes that tool from Claude's reach. The everyday win: allowlist a command you run constantly (like your test command) so Claude stops asking about it." }
    ],
    quiz: [
      { q: "In default mode, Claude wants to edit a file. What happens?", options: ["It edits immediately", "It asks; you can approve once or for the session", "It can read but never edit", "You must switch modes first"], answer: 1, explanation: "Default mode prompts for edits; approval can apply for the rest of the session." },
      { q: "Your settings have \"deny\": [\"Bash(rm *)\"]. The result?", options: ["Bash is fully disabled", "Bash works except commands starting with 'rm '", "The tool stays available but rm is blocked at runtime", "B and C are both true"], answer: 3, explanation: "A scoped deny leaves Bash available and blocks only matching calls." },
      { q: "How do you switch permission modes?", options: ["The mode button at the bottom-left of the message box (or Shift+Tab in the terminal)", "Press Tab", "Run /quit", "You can't change them"], answer: 0, explanation: "The desktop mode button sits at the bottom-left of the message box and shows the current mode; the terminal cycles default → auto-accept edits → plan mode with Shift+Tab." },
      { q: "Before editing a file, Claude…", options: ["Deletes the original", "Snapshots it so you can revert", "Commits to git automatically", "Asks you to back it up"], answer: 1, explanation: "The snapshot powers /rewind (Esc Esc in the terminal)." }
    ],
    challenge: [
      { text: "Switch modes with the <b>mode selector</b> (desktop: the button at the bottom-left of the message box) or <code>Shift+Tab</code> (terminal) and watch the label change.", link: DOC + "permission-modes" },
      { text: "Ask Claude to make a small edit, approve it, then run <code>/rewind</code> (terminal: <code>Esc Esc</code>) to undo it.", link: DOC + "interactive-mode" },
      { text: "Run <code>/permissions</code> and add an allow rule for a command you trust (e.g. your test command).", link: DOC + "permissions" },
      { text: "<b>Week 1 Sprint, Day 3:</b> have Claude expand your hardest subtopic into a deeper explainer, review the diff before approving, then add an allow-rule for a command you'll reuse.", link: DOC + "permissions", capstone: true }
    ]
  },
  {
    day: 4,
    title: "Essential Slash Commands (Part 1)",
    section: "Core Interaction",
    lesson: [
      { heading: "Quick controls you type with a slash", body: "Slash commands are shortcuts you type right in the chat to control the session. No menus, no mouse. Type <code>/</code> on its own to see the whole list (they're not case-sensitive), and <code>/help</code> for a guided overview. You'll use a handful constantly." },
      { heading: "/clear: a fresh desk between jobs", body: "When you finish one thing and start something unrelated, run <code>/clear</code>. It wipes the working context so leftover details from the last task don't muddle the new one. Think of it as clearing your desk before the next project, it also keeps Claude fast and focused." },
      { heading: "/resume: pick up where you left off", body: "Closed Claude yesterday mid-task? <code>/resume</code> reopens a previous session with its history intact, so you continue the conversation instead of re-explaining everything." },
      { heading: "/memory: see and edit what Claude knows", body: "<code>/memory</code> opens the project's standing notes, your <code>CLAUDE.md</code> and Claude's own saved notes. So you can read or tweak what it remembers about your work. (Those two are the focus of Days 6 and 7.)" },
      { heading: "/model and /effort: dial cost vs. depth", body: "<code>/model</code> switches which model you're using (such as opus, sonnet, or haiku), and <code>/effort</code> trades how hard Claude thinks against speed and cost. Use a lighter touch for simple chores, more depth for thorny problems." },
      { heading: "Meet Fable 5, the newest model", body: "Anthropic released <b>Fable 5</b> in June 2026 as the most capable model they'd ever shipped, especially strong on long, complex work: it plans its approach, checks its own progress against the goal, and refines as it goes. <b>One catch:</b> as of mid-June 2026 Fable 5 is <b>temporarily unavailable</b>. A U.S. government export-control directive led Anthropic to pause it for all users while things get worked out, so you won't see it in <code>/model</code> for now. In the meantime <b>Opus</b> is the strongest model on hand, and a lighter model (Sonnet or Haiku) is the smart, cheaper pick for quick chores. When Fable returns, it's the one to reach for on big multi-step jobs like a full audit or a messy multi-file cleanup." },
      { heading: "/permissions: manage what needs approval", body: "<code>/permissions</code> shows every allow/ask/deny rule and lets you change them on the spot, the cleanest way to stop being asked about commands you trust." }
    ],
    quiz: [
      { q: "You finish a feature and want to start an unrelated bug fix. Run first:", options: ["/resume", "/clear", "/memory", "Esc"], answer: 1, explanation: "/clear resets context so old work doesn't clutter the new task." },
      { q: "Which command lists and lets you modify tool approval rules?", options: ["/init", "/permissions", "/mcp", "/model"], answer: 1, explanation: "/permissions shows all allow/ask/deny rules and lets you change them." },
      { q: "How do you reopen a previous session?", options: ["/clear", "/resume", "/branch", "/reset"], answer: 1, explanation: "/resume lets you pick and reopen an earlier session." },
      { q: "Fable 5, when it's available, is the strongest choice for which kind of work?", options: ["Quick one-line chores", "Long, complex multi-step jobs like a full audit", "Only writing code", "It's always the wrong choice"], answer: 1, explanation: "Fable 5's lead grows with task length and complexity. (It's temporarily paused as of mid-June 2026 under a government directive, so Opus is the strongest model on hand until it returns.)" }
    ],
    challenge: [
      { text: "Type <code>/</code> and skim the full command list; open <code>/help</code>.", link: DOC + "slash-commands" },
      { text: "Run <code>/clear</code> between two unrelated tasks and notice the fresh context.", link: DOC + "slash-commands" },
      { text: "Try <code>/model</code> to see which models you can switch to. (Fable 5 is paused for now, so expect to see Opus, Sonnet, and Haiku.)", link: DOC + "slash-commands" },
      { text: "<b>Week 1 Sprint, Day 4:</b> turn your notes into <b>flashcards</b> or a <b>10-question self-quiz</b>, running <code>/clear</code> between subtopics so each one starts from clean context.", link: DOC + "slash-commands", capstone: true }
    ]
  },
  {
    day: 5,
    title: "Slash Commands (Part 2) & Planning",
    section: "Core Interaction",
    lesson: [
      { heading: "The commands that shine on bigger jobs", body: "Day 4 covered the everyday commands; these come out when a task gets longer or trickier. They help you plan before acting, keep the session tidy, experiment safely, and set a clear finish line." },
      { heading: "/plan and /context: look before you leap", body: "<code>/plan</code> drops Claude into read-only plan mode so it can study the problem and propose an approach without changing anything. <code>/context</code> shows you what's currently filling its working memory, so you can tell when it's time to trim." },
      { heading: "/compact: summarize without losing the thread", body: "When a session gets long, <code>/compact</code> condenses the history to free up room. Add a focus (<code>/compact focus on the API changes</code>) and the details you care about survive the summary while the noise gets dropped." },
      { heading: "/rename and /branch: organize and experiment", body: "<code>/rename</code> gives a session a memorable name so it's easy to find with <code>/resume</code>. <code>/branch</code> (also called <code>/fork-session</code>) copies your current conversation into a brand-new, independent session, perfect for trying a risky idea while leaving your original work untouched." },
      { heading: "/goal: set a finish line Claude keeps checking", body: "<code>/goal</code> lets you state a completion condition, like 'all the tests pass' or 'the page loads with no errors.' Claude re-checks it after every turn and keeps working until it's actually met, instead of stopping when things merely look done." },
      { heading: "/agents, /background, /code-review", body: "<code>/agents</code> manages specialized helpers (Day 9), <code>/background</code> detaches a session to keep running while you do other things, and <code>/code-review</code> reviews your recent changes with fresh eyes in a clean context." }
    ],
    quiz: [
      { q: "Mid-refactor, you want to try an experimental approach without losing current work. Best command?", options: ["/clear", "/branch (or /fork-session)", "/plan", "/background"], answer: 1, explanation: "/branch copies your conversation into a new independent session, leaving the original intact." },
      { q: "You want Claude to keep iterating until all tests pass, re-checking each turn. Use:", options: ["/goal", "/code-review", "/compact", "/plan"], answer: 0, explanation: "/goal sets a completion condition Claude verifies after every turn." },
      { q: "Which command focuses a summary on a specific area when compacting?", options: ["/clear", "/compact focus on …", "/context", "/rename"], answer: 1, explanation: "/compact accepts a focus so the important details survive summarization." }
    ],
    challenge: [
      { text: "Run <code>/context</code> and see what's taking up space in your window.", link: DOC + "slash-commands" },
      { text: "Name your current session with <code>/rename</code>.", link: DOC + "slash-commands" },
      { text: "Set a <code>/goal</code> like 'all tests pass' on a small task and watch Claude re-check it.", link: DOC + "goal" },
      { text: "<b>Week 1 Sprint, Day 5:</b> set a <code>/goal</code> for your learning kit (e.g. 'covers all 5 subtopics, fits on one page, and has a 10-question quiz') and let Claude iterate until it's met.", link: DOC + "goal", capstone: true }
    ]
  },
  {
    day: 6,
    title: "CLAUDE.md — Project Memory",
    section: "Persistent Context",
    lesson: [
      { heading: "Give your project a standing brief", body: "CLAUDE.md is a plain text (markdown) file that Claude reads at the start of <b>every</b> session, like a briefing note you'd hand a new contractor. You write it once; Claude treats it as helpful background, not unbreakable law. It's the single biggest lever for getting consistent results." },
      { heading: "What's worth putting in it", body: "The things you'd otherwise re-explain every time: how to run or build the project, the conventions you follow, how the pieces fit together, and any common workflows. For a non-code project that might be 'reports live in /monthly, always keep the summary under one page.'" },
      { heading: "Four places it can live", body: "<b>Project</b> (<code>./CLAUDE.md</code>, shared with your team via git), <b>User</b> (<code>~/.claude/CLAUDE.md</code>, applies to all your own projects), <b>Local</b> (<code>./CLAUDE.local.md</code>, just for you on this project), and an org-wide managed policy set by your company." },
      { heading: "Team rules vs. personal notes", body: "A workflow the whole team should follow goes in the committed <code>./CLAUDE.md</code> so it loads for everyone. Anything personal or private (local credentials, your own reminders) goes in <code>./CLAUDE.local.md</code>, which you add to <code>.gitignore</code> so it never gets shared." },
      { heading: "How loading works", body: "Claude looks up the folder tree and loads the CLAUDE.md files it finds. A CLAUDE.md tucked inside a subfolder loads <b>on demand</b>, only when Claude starts working with files in that folder, so deep detail doesn't weigh down every session." },
      { heading: "Pull in other files with @", body: "Keep things modular by importing: a line like <code>@docs/style-guide.md</code> inside CLAUDE.md pulls that file in at session start. Handy for sharing one set of notes across several projects." }
    ],
    quiz: [
      { q: "You want personal, project-specific notes (like local DB creds) kept out of git. Where?", options: ["./CLAUDE.md", "./CLAUDE.local.md (gitignored)", "~/.claude/CLAUDE.md", ".claude/rules/"], answer: 1, explanation: "CLAUDE.local.md is for personal project notes; gitignore it so it isn't committed." },
      { q: "How do you import another file into CLAUDE.md?", options: ["#include path", "@path/to/file", "import('path')", "<<path>>"], answer: 1, explanation: "@path/to/file imports additional files, loaded at session start." },
      { q: "A team workflow everyone should follow belongs in…", options: ["~/.claude/CLAUDE.md", "./CLAUDE.md committed to git", "auto memory", "a hook"], answer: 1, explanation: "Project CLAUDE.md is shared via version control and loads for every teammate." },
      { q: "When does a nested subdirectory CLAUDE.md load?", options: ["Never", "Always at session start", "On demand when Claude reads files in that directory", "Only via @import"], answer: 2, explanation: "Nested CLAUDE.md loads on demand as Claude works in that directory." }
    ],
    challenge: [
      { text: "Create or open a project <code>CLAUDE.md</code> and add one build command and one coding standard.", link: DOC + "memory" },
      { text: "Add an <code>@import</code> line pulling in another notes file.", link: DOC + "memory" },
      { text: "Start a fresh session and confirm Claude already knows your build command.", link: DOC + "memory" },
      { text: "<b>Week 1 Sprint finale:</b> write a <code>CLAUDE.md</code> for your learning kit, its structure and how you like to study, then start a fresh session and confirm Claude already knows them. Your first sprint is complete!", link: DOC + "memory", capstone: true }
    ]
  },
  {
    day: 7,
    title: "Auto Memory — Claude's Own Notes",
    section: "Persistent Context",
    lesson: [
      { heading: "Claude keeps its own notebook", body: "Auto memory is Claude writing down what it learns about your project so it doesn't start from zero next time. And you don't have to maintain it. This is different from CLAUDE.md, which <b>you</b> write; auto memory is what <b>Claude</b> chooses to remember on its own." },
      { heading: "What it bothers to remember", body: "Useful, durable things: how to run the project, a tricky gotcha it figured out, recurring patterns, and your style habits. It's selective on purpose. It only saves what's genuinely worth keeping, not every passing detail." },
      { heading: "Where the notes live", body: "Each project gets its own folder at <code>~/.claude/projects/&lt;project&gt;/memory/</code>. A nice detail for teams: if you use multiple git worktrees of the same repository, they all <b>share one memory directory</b>, so insights carry across them." },
      { heading: "Only the top of the notebook loads", body: "At session start, Claude loads just the first 200 lines (about 25KB) of its <code>MEMORY.md</code> index. Deeper detail sits in separate topic files that load only when relevant. That's how months of accumulated notes never slow down your startup." },
      { heading: "You stay in charge of it", body: "Run <code>/memory</code> anytime to see what's been saved, edit it, or open the folder. Want it off entirely? Toggle it from <code>/memory</code> or set <code>autoMemoryEnabled: false</code> in your settings." }
    ],
    quiz: [
      { q: "After a month away, how much auto memory loads at session start?", options: ["All of it", "First 200 lines of MEMORY.md (or 25KB)", "Only topic files you name", "None until you run /memory"], answer: 1, explanation: "Only the top of MEMORY.md loads; detail in topic files loads on demand." },
      { q: "Which command lets you view and edit saved auto memory?", options: ["/context", "/memory", "/clear", "claude --show-memory"], answer: 1, explanation: "/memory lists memory files, toggles auto memory, and opens the folder." },
      { q: "Two git worktrees of the same repo…", options: ["Each get separate memory", "Share one memory directory", "Can't use auto memory", "Merge memory on commit"], answer: 1, explanation: "Worktrees of the same repo share a single memory directory." }
    ],
    challenge: [
      { text: "Run <code>/memory</code> and look at what Claude has saved (or the empty folder if new).", link: DOC + "memory" },
      { text: "Tell Claude a project fact worth remembering and confirm it offers to save it.", link: DOC + "memory" },
      { text: "Open <code>MEMORY.md</code> and read how Claude structures its index vs. topic files.", link: DOC + "memory" },
      { text: "<b>Week 2 Sprint kickoff, Build a work helper:</b> start a new folder for a small tool that takes a repetitive task off your plate (a weekly-report generator, a CSV cleaner, a meeting-prep brief…). Build its first feature, then run <code>/memory</code> and see what Claude chose to remember about it.", link: DOC + "memory", capstone: true }
    ]
  },
  {
    day: 8,
    title: "Skills — Reusable Workflows",
    section: "Advanced Features",
    lesson: [
      { heading: "Teach Claude your repeatable routines", body: "A skill is a saved, reusable workflow, a set of instructions (and sometimes reference material) Claude can follow on demand. If you find yourself explaining the same multi-step procedure over and over, that's a skill waiting to happen." },
      { heading: "What a skill actually is", body: "It's a small folder with a <code>SKILL.md</code> file inside <code>.claude/skills/</code>, giving it a name and a description of when to use it. Claude applies the right skill automatically when your request matches, or you can run it yourself by typing <code>/the-skill-name</code>." },
      { heading: "A concrete example", body: "Say you keep pasting the same 'here's how we onboard a new client' checklist into chat. Save it once as <code>.claude/skills/onboard-client/SKILL.md</code> and from then on Claude just knows the procedure. No more copy-paste." },
      { heading: "They load only when needed", body: "Unlike CLAUDE.md, which loads every single session, a skill loads <b>on demand</b>, only when it's relevant. That means you can keep long, detailed reference material in skills without it costing you anything until the moment you use it." },
      { heading: "Make a skill manual-only", body: "If you want a skill to run <b>only</b> when you ask for it (never auto-triggered), set <code>disable-model-invocation: true</code> in its frontmatter. Good for sensitive or destructive procedures you want to fire deliberately." },
      { heading: "Commands are skills too", body: "Slash commands and skills are two sides of the same coin: both <code>.claude/commands/deploy.md</code> and <code>.claude/skills/deploy/SKILL.md</code> create a <code>/deploy</code> command. Pick whichever layout fits how you like to organize things." }
    ],
    quiz: [
      { q: "You keep pasting the same monthly-report procedure into chat. Best fix?", options: ["Add it to CLAUDE.md", "Create a skill at .claude/skills/monthly-report/SKILL.md", "Keep pasting it", "Put it in auto memory"], answer: 1, explanation: "Skills are made for repeatable workflows. Claude applies them or you run /monthly-report." },
      { q: "Which frontmatter field stops a skill from auto-triggering?", options: ["manual: true", "disable-model-invocation: true", "invoke-only: true", "requires-approval: true"], answer: 1, explanation: "disable-model-invocation: true makes it run only when you invoke it." },
      { q: "A key benefit of skills over CLAUDE.md is that they…", options: ["Load every session", "Load on demand, saving context", "Can't be invoked manually", "Are stored in git history only"], answer: 1, explanation: "On-demand loading keeps long reference material out of context until needed." }
    ],
    challenge: [
      { text: "Type <code>/</code> and look for skills already available in your setup.", link: DOC + "skills" },
      { text: "Create a tiny skill at <code>.claude/skills/hello/SKILL.md</code> with a name and description.", link: DOC + "skills" },
      { text: "Invoke it with <code>/hello</code> and confirm Claude follows it.", link: DOC + "skills" },
      { text: "<b>Week 2 Sprint, Day 2:</b> turn your helper's core repetitive step into a skill, then invoke it on real work.", link: DOC + "skills", capstone: true }
    ]
  },
  {
    day: 9,
    title: "Subagents — Specialized Assistants",
    section: "Advanced Features",
    lesson: [
      { heading: "Hand the heavy lifting to a specialist", body: "A subagent is a helper Claude can spin up for a specific job (comb through a big folder of documents, fact-check a draft, research a topic) that works on its own and reports back. Think of it as Claude delegating to a focused assistant instead of doing everything in one crowded conversation." },
      { heading: "Each one works in its own space", body: "A subagent runs in its <b>own</b> context window, with its own instructions, its own set of tools, and its own permissions. It tackles the task independently of your main chat." },
      { heading: "Why that protects you", body: "Big, messy jobs, like reading through hundreds of files, would normally flood your main conversation and slow Claude down. Because a subagent's work stays in its own space, your main conversation stays clean and focused on what you care about." },
      { heading: "It reports back a summary", body: "When a subagent finishes, it doesn't dump its entire transcript on you. It returns a tidy <b>summary</b> of what it found or did. You get the conclusion without the clutter." },
      { heading: "Build your own", body: "Beyond the built-ins (like Explore and Plan), you can define custom subagents as markdown files in <code>.claude/agents/</code>, each with a name, a description, a <code>tools</code> field listing the limited set of tools it may use, and its own instructions. For example, a 'fact-checker' that can only read and search, never edit." }
    ],
    quiz: [
      { q: "You need to comb through a big folder of documents, which would fill your main context. Best approach?", options: ["Do it inline and /compact later", "Use a subagent so the research stays isolated", "Open a manual second session", "Skip it"], answer: 1, explanation: "Subagents run in isolated contexts, keeping your main conversation clean." },
      { q: "Where do you define a custom 'fact-checker' subagent limited to reading and searching?", options: [".claude/skills/ with restrict-tools", ".claude/agents/ with a tools field", "CLAUDE.md with subagent-config", "Only via /agents interactively"], answer: 1, explanation: "Custom subagents live in .claude/agents/; the tools field limits their tools to read-only." },
      { q: "When a subagent finishes, it returns…", options: ["Its full raw transcript into your context", "A summary of its work", "Nothing. You must ask", "A new session you must resume"], answer: 1, explanation: "Subagents report back a concise summary, protecting your main context." }
    ],
    challenge: [
      { text: "Ask Claude to use the Explore subagent to map an unfamiliar folder of files.", link: DOC + "sub-agents" },
      { text: "Notice how the subagent's searching doesn't flood your main conversation.", link: DOC + "sub-agents" },
      { text: "Sketch a custom read-only subagent file in <code>.claude/agents/</code> with a restricted <code>tools</code> list.", link: DOC + "sub-agents" },
      { text: "<b>Week 2 Sprint, Day 3:</b> ask a subagent to explore your growing helper and summarize how its parts fit together.", link: DOC + "sub-agents", capstone: true }
    ]
  },
  {
    day: 10,
    title: "Working with Documents, PDFs & Spreadsheets",
    section: "Everyday Work",
    lesson: [
      { heading: "Your files are the workspace", body: "Most knowledge work is really file work: reports, spreadsheets, PDFs, notes, exports. Claude Code lives right where those files are, so instead of opening five apps and copy-pasting between them, you point it at a folder and describe the outcome you want: 'pull the totals out of these invoices,' 'turn this messy export into a clean table,' 'summarize everything in /research into one page.'" },
      { heading: "Reading PDFs, images, and docs", body: "Type <code>@</code> and a file path, like <code>@reports/q3-budget.pdf</code>, to make Claude read that exact file before it answers. You can also drag a file straight into the Claude window (or terminal) or paste an image (a screenshot of a chart, a scanned page) right in. Claude reads the contents as context, so you can ask 'what changed between these two versions?' or 'extract the figures from page 3.'" },
      { heading: "CSV is the friendliest spreadsheet format", body: "Claude works best with spreadsheets when they're saved as <b>CSV</b> (plain-text rows and columns). From Excel or Google Sheets, just 'Save As' or 'Download as' CSV. Once it's a CSV, Claude can clean it, re-sort it, find duplicates, fill gaps, total columns, and explain anomalies. Then you open the result back in your spreadsheet app." },
      { heading: "Turning messy into tidy", body: "The everyday superpower is cleanup: inconsistent dates, stray blank rows, names typed five different ways, numbers stored as text. Describe the mess and the target, 'standardize every date to YYYY-MM-DD, drop empty rows, and flag any row missing an amount', and Claude does the tedious pass for you, showing what it changed." },
      { heading: "Bulk operations across a folder", body: "Claude shines when the same small task repeats across many files: 'rename every file in this folder to <code>YYYY-MM-DD-client.pdf</code>,' 'add a summary line to the top of each report,' 'find every document that mentions the Q3 budget.' What would be an hour of clicking becomes one clear instruction." },
      { heading: "Always give it a way to check itself", body: "When you hand off a bulk cleanup, include a rule Claude can verify against: 'every row must have a valid date and a non-empty amount,' 'the summary must fit on one page.' That turns 'looks done' into 'provably done,' and means you're reviewing a result instead of hunting for mistakes." }
    ],
    quiz: [
      { q: "What's the friendliest format for Claude to work with a spreadsheet?", options: ["A locked .xlsx with macros", "A CSV export of the sheet", "A screenshot of the spreadsheet", "A PDF print-out"], answer: 1, explanation: "CSV is plain-text rows and columns. Claude can clean, sort, total, and de-duplicate it directly." },
      { q: "A PDF report has figures you need Claude to use. Best move?", options: ["Retype the numbers into the prompt", "Reference it with @reports/file.pdf and ask Claude to extract them", "Describe the PDF from memory", "Email the PDF to yourself first"], answer: 1, explanation: "Referencing the file with @ lets Claude read it directly and pull out the figures." },
      { q: "You're about to let Claude bulk-clean a 2,000-row export. What makes that safe?", options: ["Hoping it gets it right", "Giving it a checkable rule, like 'every row needs a valid date and amount'", "Doing it one row at a time yourself", "Turning off permissions"], answer: 1, explanation: "A verifiable rule turns 'looks done' into 'provably done' and keeps you reviewing, not hunting." }
    ],
    challenge: [
      { text: "Reference a real PDF or document with <code>@path/to/file</code> and ask Claude to summarize it.", link: DOC + "common-workflows" },
      { text: "Export a messy spreadsheet to CSV and ask Claude to clean it (standardize dates, drop blanks).", link: DOC + "common-workflows" },
      { text: "Ask Claude to find every file in a folder that mentions a specific topic.", link: DOC + "common-workflows" },
      { text: "<b>Week 2 Sprint, Day 4:</b> point your helper at a real document, PDF, or spreadsheet, clean it or extract its key figures, and give Claude a checkable rule (e.g. 'every row has a valid date') so the result is verifiable.", link: DOC + "common-workflows", capstone: true }
    ]
  },
  {
    day: 11,
    title: "Connecting Your Everyday Apps",
    section: "Everyday Work",
    lesson: [
      { heading: "Plug Claude into the tools you already use", body: "So far Claude has worked with files on your computer. <b>MCP</b> (Model Context Protocol) is the open standard that lets it also reach the apps where your work actually lives: Google Drive, Notion, Slack, your calendar, email, ticketing systems, and many more. It's the difference between Claude working with your files and Claude working across your whole day." },
      { heading: "Why this is the payoff for an operator", body: "Once connected, Claude can pull live information and take action where it belongs: 'summarize the new docs added to our Drive folder this week,' 'pull my unread messages and draft replies,' 'find the open items assigned to me and list them.' No more copy-pasting between tabs to give Claude what it needs." },
      { heading: "Three scopes (who can see the connection)", body: "<b>Local</b> (default, saved in <code>~/.claude.json</code>, private to you on this project), <b>Project</b> (<code>.mcp.json</code>, shared with the team via git so everyone gets the same connections), and <b>User</b> (applies across all your own projects, private). If the same app is configured in more than one place, Local wins." },
      { heading: "How connections are made (transports)", body: "Most everyday apps connect over <b>HTTP</b>, the recommended option for an online service like Drive or Notion. <b>Stdio</b> is for a tool running as a program directly on your own machine. (There's also WebSocket, and an older SSE option being retired, you'll rarely touch those.)" },
      { heading: "Adding one (or just asking IT)", body: "In the desktop app you add connections through the <b>connector settings</b>, a UI with no commands to type. <i>Terminal:</i> <code>claude mcp add --transport http &lt;name&gt; &lt;url&gt;</code>, with <code>--scope project</code> to write it to <code>.mcp.json</code> so your whole team shares it; <code>claude mcp list</code> shows what's configured. In practice, your team lead or IT often sets these up once and shares the <code>.mcp.json</code>, so everyone is connected without doing the setup themselves." },
      { heading: "Checking and signing in", body: "Type <code>/mcp</code> while working to see which apps are connected and to handle any sign-in (most services pop up a normal login the first time). It's also where you confirm a connection is healthy if something isn't responding." }
    ],
    quiz: [
      { q: "What does connecting an app via MCP let Claude do?", options: ["Make Claude run faster", "Reach apps like Drive, Notion, Slack, and your calendar to pull info and take action", "Replace your CLAUDE.md", "Only read local files"], answer: 1, explanation: "MCP connects Claude to outside services so it can work where your information actually lives." },
      { q: "You want your whole team to share the same app connections. Which scope?", options: ["Local (~/.claude.json)", "Project (.mcp.json, shared via git)", "User scope", "It can't be shared"], answer: 1, explanation: "Project scope writes to .mcp.json, which is committed so every teammate gets the same connections." },
      { q: "Which in-session command shows connected apps and handles sign-in?", options: ["/permissions", "/mcp", "/context", "/agents"], answer: 1, explanation: "/mcp shows connection status and walks you through any authentication." }
    ],
    challenge: [
      { text: "Run <code>/mcp</code> (or open <b>connector settings</b> in the desktop app) to see which apps are already connected for you.", link: DOC + "mcp" },
      { text: "Read about one connector you'd actually use day-to-day (e.g. Google Drive, Notion, or Slack).", link: DOC + "mcp" },
      { text: "If you have one connected, ask Claude to do a real task with it (e.g. 'summarize the latest doc in this folder').", link: DOC + "mcp" },
      { text: "<b>Week 2 Sprint, Day 5:</b> connect one everyday app to Claude (or ask IT which is available) so your helper can pull real data in or post a result out, then have Claude do one real task through the connection.", link: DOC + "mcp", capstone: true }
    ]
  },
  {
    day: 12,
    title: "Keyboard Shortcuts & Productivity",
    section: "Productivity",
    lesson: [
      { heading: "A few moves that save a lot of time", body: "You don't need to memorize a hundred shortcuts. A small core handful covers almost everything and quickly becomes muscle memory. Learning them is the difference between fighting the tool and flowing with it." },
      { heading: "The core moves", body: "<b>Stop</b> a running action (the stop button, or <code>Esc</code> in the terminal); <b>rewind</b> to a checkpoint (<code>/rewind</code>, or <code>Esc Esc</code>); <b>switch modes</b> (the mode selector, or <code>Shift+Tab</code>). In the terminal you also get <code>Tab</code> to complete commands and <code>&uarr;</code> to recall previous prompts." },
      { heading: "Stop is your safety brake", body: "If you see Claude doing something you didn't intend, hit the <b>stop button</b> (or <code>Esc</code> in the terminal) immediately. It cancels the current action <b>without</b> throwing away your conversation, far better than closing the app and losing everything." },
      { heading: "Rewind to travel back", body: "Run <code>/rewind</code> (or press <code>Esc</code> twice in the terminal) to open the rewind menu and restore an earlier checkpoint in the session. It's the 'undo' for the whole conversation, not just the last file." },
      { heading: "The desktop workspace", body: "The desktop app adds things the terminal can't: <b>drag and drop</b> files straight into chat, <b>paste images</b> (Ctrl/Cmd+V) like screenshots, a built-in <b>diff viewer</b> to eyeball every change before you approve it, an <b>integrated terminal</b> (Ctrl+`), and a <b>file editor</b> right beside the chat." },
      { heading: "Run several at once", body: "The desktop <b>sidebar</b> lets you keep <b>parallel sessions</b> going side by side. Each works in its own isolated copy of your project, so a long job can run in one while you start another. (The VS Code, JetBrains, and Chrome integrations carry the same muscle memory wherever you work; terminal power users can also rebind keys in <code>~/.claude/keybindings.json</code>.)" }
    ],
    quiz: [
      { q: "A long action is running and it's wrong. Stop it without losing history:", options: ["Close the app", "Click the stop button (or press Esc in the terminal)", "Run /stop", "Wait, then /clear"], answer: 1, explanation: "The stop button, Esc in the terminal, cancels immediately and preserves the conversation." },
      { q: "In the desktop app, how can you review every change before approving it?", options: ["You can't. It edits silently", "The built-in diff viewer", "Only by reopening files in Excel", "Run /diff in a browser"], answer: 1, explanation: "The desktop app's diff viewer shows exactly what changed before you approve." },
      { q: "What opens the rewind menu?", options: ["/clear", "/rewind (or Esc Esc in the terminal)", "/quit", "Ctrl+C"], answer: 1, explanation: "/rewind, or Esc Esc in the terminal, restores an earlier checkpoint." }
    ],
    challenge: [
      { text: "Drag a file straight into the chat (desktop) and ask Claude about it. Or in the terminal, practice <code>Tab</code> completion on a slash command.", link: DOC + "interactive-mode" },
      { text: "Open the <b>diff viewer</b> on a change before approving it (desktop), or press <code>↑</code> to recall a previous prompt (terminal).", link: DOC + "interactive-mode" },
      { text: "Try running two things at once: start a second session in the sidebar (desktop) while the first works. (Terminal power users: explore <code>~/.claude/keybindings.json</code>.)", link: DOC + "keybindings" },
      { text: "<b>Week 2 Sprint finale:</b> add your helper's finishing touches fast, moving with the desktop workspace (drag-drop files, the diff viewer to approve changes, the mode selector), then run it end to end on real work. Your helper is done.", link: DOC + "interactive-mode", capstone: true }
    ]
  },
  {
    day: 13,
    title: "Permission Modes in Depth",
    section: "Best Practices",
    lesson: [
      { heading: "Choose how much it checks with you", body: "Permission modes let you dial the friction up or down to match the task. Doing something delicate? Keep it cautious. Cranking through safe, repetitive edits? Loosen it up. The art is matching the mode to the risk." },
      { heading: "Default mode, with precise allowlists", body: "Default mode prompts the first time it uses each tool, then auto-approves that tool for the rest of the session. The precise approach for 'auto-approve the conversion script I run constantly but still ask before deleting files' is default mode <b>plus</b> an allow rule in settings.json like <code>Bash(python convert.py *)</code>. That one command stops prompting while everything risky still does." },
      { heading: "Auto-accept edits", body: "This mode auto-approves file edits and <b>safe</b> housekeeping commands (<code>mkdir</code>, <code>touch</code>, <code>mv</code>, <code>cp</code>) while still stopping to ask about genuinely risky things like deleting files or downloading from the internet. Great for a flurry of routine changes, like cleaning and renaming a folder of reports." },
      { heading: "Plan mode (read-only)", body: "When you want to explore with <b>zero</b> chance of accidental changes, plan mode is the answer: Claude can read files and run read-only commands (like listing a folder or searching its contents) but cannot edit anything or run side-effecting commands." },
      { heading: "Auto mode (for longer unattended runs)", body: "A research-preview mode that uses a background classifier to auto-approve routine work while blocking scope creep and high-risk actions. It's aimed at longer stretches where you can't sit and approve every step." }
    ],
    quiz: [
      { q: "You want a script you run constantly auto-approved, but still be asked before files are deleted. Best setup?", options: ["Default mode + an allowlist rule in settings.json", "Auto-accept edits mode", "Plan mode", "Auto mode"], answer: 0, explanation: "Default mode plus an allow rule like Bash(python convert.py *) auto-approves that one command while everything risky still prompts." },
      { q: "Best mode to explore a folder of files with zero risk of changes?", options: ["Default", "Auto-accept edits", "Plan mode", "Auto mode"], answer: 2, explanation: "Plan mode is read-only. Read files and run safe commands, no edits." },
      { q: "Auto-accept edits will auto-approve which of these without asking?", options: ["Downloading a file from the internet", "Deleting files", "Making and moving folders (mkdir / mv / cp)", "Sending an email"], answer: 2, explanation: "It auto-approves file edits and safe housekeeping commands, still prompting for risky ones." }
    ],
    challenge: [
      { text: "Enter plan mode (the mode selector, or <code>Shift+Tab</code> in the terminal) and try to make Claude edit. Watch it stay read-only.", link: DOC + "permission-modes" },
      { text: "Add two allow rules with <code>/permissions</code> for commands you trust.", link: DOC + "permissions" },
      { text: "Switch to auto-accept edits for a small safe task and feel the difference.", link: DOC + "permission-modes" },
      { text: "<b>Week 3 Sprint kickoff, Automate &amp; ship it:</b> pick a routine you want to automate end to end. Explore it in plan mode first (no edits), then switch to auto-accept edits to implement a small, safe first change.", link: DOC + "permission-modes", capstone: true }
    ]
  },
  {
    day: 14,
    title: "Effective Prompting & Scoping",
    section: "Best Practices",
    lesson: [
      { heading: "The real skill is writing a good brief", body: "Claude is only as good as the instructions you give it, and this is precisely where operators have an edge over the tool itself. A clear, specific request beats a vague one every time, and learning to write them is the highest-leverage habit in this whole course." },
      { heading: "Be specific", body: "Instead of 'clean up this report,' say what's wrong, where to look, and what 'done' means: 'in <code>@reports/q3.csv</code>, the dates are in three different formats and some amounts are blank. Standardize every date to YYYY-MM-DD and flag any row missing an amount.' The more precise the brief, the better the result." },
      { heading: "Tell it how to check itself", body: "Give Claude a way to know it succeeded. A rule every row must satisfy, an example of the right output, a total that should match, or a length limit. Without that, Claude stops when the work merely 'looks done' and <b>you</b> become the one who has to catch the mistakes." },
      { heading: "Explore before building", body: "When you're pointing Claude at a folder or document you don't know well, don't let it dive straight in. Have it explore and propose a plan first (plan mode). Reviewing the plan catches wrong turns before any work happens." },
      { heading: "Point at the right things", body: "Type <code>@</code> and a path, like <code>@reports/q3-summary.md</code>, to make Claude read that exact file before it responds. You can also paste images, screenshots, and PDFs straight in; Claude reads them as context." },
      { heading: "Break big jobs into steps", body: "For anything complex, lay it out as numbered steps. Small, ordered pieces are easier for Claude to get right, and easier for you to verify, than one giant request." }
    ],
    quiz: [
      { q: "Which request most reliably produces the cleaned report you want?", options: ["Clean up this spreadsheet", "In @reports/q3.csv, standardize every date to YYYY-MM-DD, drop blank rows, and flag any row missing an amount", "Make the report look nice", "Fix the data"], answer: 1, explanation: "Naming the file, the exact changes, and a checkable rule gives Claude a goal and verification criteria." },
      { q: "Claude will work in a folder of files you don't know well. Best first step?", options: ["Let it start changing things immediately", "Have it explore and propose a plan first (plan mode)", "Give an incomplete description", "Over-specify everything"], answer: 1, explanation: "Explore in plan mode, review the plan, then proceed. Better results on unfamiliar material." },
      { q: "What does typing @reports/q3-summary.md in a prompt do?", options: ["Nothing special", "Tells Claude to read that file before responding", "Deletes the file", "Emails the file"], answer: 1, explanation: "@path references a file so Claude reads it as context first." }
    ],
    challenge: [
      { text: "Rewrite a vague request you'd normally type into a specific one with a file reference and a 'done' condition.", link: DOC + "best-practices" },
      { text: "Give Claude an explicit checkable rule to satisfy (e.g. 'every row has a valid date') and have it verify against it.", link: DOC + "best-practices" },
      { text: "Use <code>@file</code> to point Claude at a specific document or spreadsheet before asking a question.", link: DOC + "common-workflows" },
      { text: "<b>Week 3 Sprint, Day 2:</b> write one tightly-scoped prompt for your automation's next step (what's needed, which file, and a 'done' rule), and let Claude satisfy it.", link: DOC + "best-practices", capstone: true }
    ]
  },
  {
    day: 15,
    title: "Context Management & Compaction",
    section: "Best Practices",
    lesson: [
      { heading: "Context is the resource to protect", body: "Everything Claude is juggling (your conversation, the files it's read, command outputs, its memory) lives in a limited working space called context. As it fills up, quality quietly drops, so managing it is a real skill, not an afterthought." },
      { heading: "It tidies up on its own", body: "When space runs low, Claude auto-compacts: first it clears out old tool outputs, then, if needed, it summarizes earlier conversation. This happens automatically to keep things running, but you can steer it." },
      { heading: "See what's using the space", body: "Run <code>/context</code> mid-session to see exactly what's taking up room. It's the diagnostic that tells you whether to trim, summarize, or just start fresh." },
      { heading: "Shape it deliberately", body: "<code>/compact focus on the report formatting</code> condenses history while protecting the details you name. And when you switch to something completely unrelated, <code>/clear</code> resets the whole context so old work can't interfere." },
      { heading: "When MCP tools eat your space", body: "If <code>/context</code> shows a pile of MCP tool definitions hogging room even though you haven't used them, tool search is likely turned off. Tool search defers those tool schemas until they're actually needed, instead of loading them all upfront." },
      { heading: "Nothing is ever lost", body: "Even after auto-compaction, your full history is saved locally, so you can still <code>/rewind</code> to any earlier point. Compaction frees working space; it doesn't erase your trail." }
    ],
    quiz: [
      { q: "Context is full and you're about to start a totally different task. Do what?", options: ["Keep going; auto-compaction handles it", "Close the app", "/clear to reset context", "/compact only"], answer: 2, explanation: "/clear resets context between unrelated tasks so old work doesn't interfere." },
      { q: "/context shows MCP tool definitions eating space though you haven't used them. What's likely off?", options: ["Auto memory", "Tool search (MCP tools deferred by default)", "Hooks", "Skills"], answer: 1, explanation: "Tool search defers MCP tool schemas until needed; if disabled, they all load upfront." },
      { q: "After auto-compaction, can you still rewind to an earlier point?", options: ["No, it's gone", "Yes. History is saved locally", "Only within 5 minutes", "Only if you ran /compact"], answer: 1, explanation: "Checkpoints persist locally, so /rewind still works after compaction." }
    ],
    challenge: [
      { text: "Run <code>/context</code> mid-session and identify the biggest consumers.", link: DOC + "slash-commands" },
      { text: "Try <code>/compact focus on …</code> with a focus relevant to your task.", link: DOC + "slash-commands" },
      { text: "Practice <code>/clear</code> when switching to an unrelated task and feel the speed-up.", link: DOC + "slash-commands" },
      { text: "<b>Week 3 Sprint, Day 3:</b> during a long building session, run <code>/context</code>, then <code>/compact focus on …</code> to keep Claude sharp and finish the next piece without starting over.", link: DOC + "slash-commands", capstone: true }
    ]
  },
  {
    day: 16,
    title: "Collaboration & Team Best Practices",
    section: "Best Practices",
    lesson: [
      { heading: "One shared setup for the whole team", body: "Everything you've configured (project notes, rules, automations) can be shared so your whole team works from the same playbook. That consistency is what turns Claude Code from a personal tool into a team capability." },
      { heading: "Share the right things via git", body: "Commit <code>CLAUDE.md</code> and your shared <b>skills</b> so everyone gets the same setup automatically. A workflow the whole team should follow belongs in the committed <code>./CLAUDE.md</code>. It loads for every teammate on the project." },
      { heading: "Keep personal things personal", body: "Machine-specific or private preferences don't belong in shared files. Put them in <code>CLAUDE.local.md</code> (gitignored) or your own <code>~/.claude/settings.json</code> so they apply only to you." },
      { heading: "Work in parallel without collisions", body: "Each teammate runs their own session on their own branch (or git worktree), so two people's edits never step on each other. Everyone moves fast independently." },
      { heading: "Review with fresh eyes", body: "The strongest quality check is to have one session do the work and a <b>separate, fresh</b> context review it. Run <code>/code-review</code> on your recent changes. A reviewer without the original assumptions catches far more, whether it's reviewing a document or a spreadsheet cleanup." },
      { heading: "Hand off cleanly", body: "Name sessions descriptively with <code>/rename</code> and share rewind points so a teammate can pick up your context without a long explanation." }
    ],
    quiz: [
      { q: "A report-writing workflow the whole team should follow belongs where?", options: ["~/.claude/CLAUDE.md", "./CLAUDE.md committed to git", "a skill nobody shares", "MEMORY.md"], answer: 1, explanation: "Project CLAUDE.md is shared via version control and loads for everyone on the project." },
      { q: "Best way to review freshly produced work without bias?", options: ["The same session reviews itself", "A fresh session/subagent reviews the recent changes", "Skip review", "Only manual review"], answer: 1, explanation: "A fresh context (or /code-review) reviews without the original session's assumptions." },
      { q: "Where do personal, machine-specific preferences belong?", options: ["./CLAUDE.md (committed)", "CLAUDE.local.md or ~/.claude/settings.json", "the project README", ".mcp.json"], answer: 1, explanation: "Personal settings stay local/user-scoped, not in shared project files." }
    ],
    challenge: [
      { text: "Add one team convention to your project <code>CLAUDE.md</code> and commit it.", link: DOC + "memory" },
      { text: "Run <code>/code-review</code> on your recent changes in a fresh session.", link: DOC + "slash-commands" },
      { text: "Use <code>/rename</code> to give your session a descriptive, handoff-friendly name.", link: DOC + "slash-commands" },
      { text: "<b>Week 3 Sprint, Day 4:</b> get your automation ready to share, commit your <code>CLAUDE.md</code> and config to git, then run <code>/code-review</code> on your latest changes in a fresh session.", link: DOC + "best-practices", capstone: true }
    ]
  },
  {
    day: 17,
    title: "Plan Mode & the Exploration Workflow",
    section: "Workflows",
    lesson: [
      { heading: "Measure twice, cut once", body: "Plan mode is the discipline of looking before leaping: Claude studies the problem and proposes an approach <b>before</b> touching anything. For changes of any real size, the few minutes of planning save far more in avoided wrong turns." },
      { heading: "How to enter it", body: "Switch to plan mode with the <b>mode selector</b> (desktop) or by pressing <code>Shift+Tab</code> (terminal). Or set <code>defaultMode: plan</code> to start there. In this mode Claude can read files and run read-only commands, but it cannot edit or run anything that changes your system." },
      { heading: "The four phases", body: "The workflow is: <b>explore</b> in plan mode &rarr; ask Claude for a detailed <b>plan</b> &rarr; exit plan mode and <b>implement</b> &rarr; let Claude <b>verify</b> by running tests or a build. Each step builds on the last." },
      { heading: "Edit the plan yourself", body: "The plan isn't take-it-or-leave-it. Read it over and tell Claude what you'd do differently, or edit it directly (in the terminal, <code>Ctrl+G</code> opens it in your text editor), then let Claude proceed from your revised version." },
      { heading: "When it's worth it (and when it isn't)", body: "Reach for plan mode on jobs that touch many files or unfamiliar territory, like reorganizing a reports folder where the file names, an index, and a summary all have to stay in sync. Skip it for trivial work: fixing one typo or renaming a single file is pure overhead to plan." }
    ],
    quiz: [
      { q: "Reorganizing a reports folder touches file names, an index, and a summary at once. Recommended workflow?", options: ["Start changing things directly in default mode", "Plan mode to explore + plan, then proceed", "Run /init for a plan", "Do it one file at a time by hand"], answer: 1, explanation: "Explore and plan in plan mode, then proceed. Best when a change touches many files." },
      { q: "Before Claude proceeds, the plan is…", options: ["Locked, take it or leave it", "Yours to edit or revise first", "Deleted automatically", "Hidden from you"], answer: 1, explanation: "You can revise the plan before implementing. In the terminal, Ctrl+G opens it in your editor." },
      { q: "Plan mode is poor value for which task?", options: ["A change across many files", "Unfamiliar material you don't know well", "Fixing a single typo", "Restructuring a whole folder"], answer: 2, explanation: "Planning is overhead for trivial, single-file changes." }
    ],
    challenge: [
      { text: "Enter plan mode and have Claude produce a plan for a small multi-step change.", link: DOC + "permission-modes" },
      { text: "Review the plan and tweak anything you'd do differently (in the terminal, <code>Ctrl+G</code> opens it in your editor).", link: DOC + "interactive-mode" },
      { text: "Exit plan mode, let Claude implement, and confirm it verifies with tests or a build.", link: DOC + "common-workflows" },
      { text: "<b>Week 3 Sprint, Day 5:</b> pick a finishing feature that touches several files, have Claude plan it in plan mode, tweak the plan, then implement and verify.", link: DOC + "common-workflows", capstone: true }
    ]
  },
  {
    day: 18,
    title: "Running Claude Autonomously",
    section: "Workflows",
    lesson: [
      { heading: "From assistant to automation", body: "This is where everything pays off. Up to now you've worked <b>with</b> Claude in a session; today you learn to set it loose on a task with no session at all. So routine work can run on a schedule, in a script, or as part of a pipeline, without you sitting there." },
      { heading: "Two ways to schedule it", body: "In the desktop app, the way to run a job on a schedule is a <b>Routine</b>. Set one up with <code>/schedule</code> and Claude runs the task for you (in the cloud) without you sitting there. <i>Terminal/CLI:</i> <code>claude -p \"your task\"</code> runs a single task and exits, built for scripts and scheduled jobs. Either way, a job like 'summarize yesterday's notes in /journal and flag anything urgent' could land a morning brief before you sit down, every day, on its own." },
      { heading: "Get results a program can read", body: "When a script or spreadsheet needs to act on Claude's output, the CLI lets you add <code>--output-format json</code> (or <code>stream-json</code>). Instead of prose, you get structured data a program can parse, essential when running the same task across many documents at once. <i>(This is a CLI/SDK feature.)</i>" },
      { heading: "Parallel and background work", body: "The desktop app's <b>sidebar</b> runs several sessions in parallel, each in its own isolated copy of the project (the CLI uses git worktrees for the same effect) so runs don't collide. Within a session, <code>/background</code> detaches it to keep running while you do other things. Check on it later with <code>/tasks</code> or reconnect." },
      { heading: "Permissions when no one's watching", body: "For unattended runs, <code>--permission-mode auto</code> leans on background safety checks. <code>--permission-mode bypassPermissions</code> skips prompts entirely (except for root/home deletions) and should only ever be used in isolated, throwaway environments." },
      { heading: "You made it, now keep one habit", body: "Eighteen days done. The goal was never to memorize everything, but to build real fluency, and you have. Pick the one feature that earns its place in your daily workflow and make it stick. That's graduation." }
    ],
    quiz: [
      { q: "You want a daily brief that summarizes yesterday's notes automatically. Right approach?", options: ["Start an interactive session each morning and wait", "Schedule it, a desktop Routine (/schedule) or a CLI claude -p job", "Leave Claude running overnight", "Do it by hand each day"], answer: 1, explanation: "Schedule the task: a desktop Routine via /schedule, or claude -p for CLI/scripts, both run it hands-off." },
      { q: "Running the same task over 50 documents from a script, you want structured output. The CLI flag to add:", options: ["--verbose", "--output-format json", "--streaming", "--results"], answer: 1, explanation: "--output-format json (or stream-json) makes results parseable. A CLI/SDK feature." },
      { q: "How do you keep a session running in the background while you step away?", options: ["/clear", "/background, then check /tasks", "/resume", "Close the app"], answer: 1, explanation: "/background detaches the session so it keeps running; /tasks lets you check on it." }
    ],
    challenge: [
      { text: "Set up a hands-off task: a desktop <b>Routine</b> via <code>/schedule</code>, or a terminal <code>claude -p \"…\"</code> that finishes without a session.", link: DOC + "headless" },
      { text: "(Terminal/CLI) Add <code>--output-format json</code> to a <code>claude -p</code> run and inspect the structured result.", link: DOC + "cli-reference" },
      { text: "Reflect: you've finished all 18 days. Pick one feature to make part of your daily workflow.", link: DOC + "best-practices" },
      { text: "<b>Week 3 Sprint finale:</b> automate one real task, a desktop <b>Routine</b> (<code>/schedule</code>) or a terminal <code>claude -p \"…\"</code> (e.g. generate a summary or run a routine check), then choose the Claude Code habit you'll keep using. All three sprints shipped. Congratulations!", link: DOC + "headless", capstone: true }
    ]
  },
  {
    day: 19,
    title: "Bonus: Doing More with /goal",
    section: "Bonus Round",
    lesson: [
      { heading: "A victory lap, from the AI Daily Brief", body: "You graduated on Day 18. Consider this a bonus round. It's inspired by an episode of <b>The AI Daily Brief</b> with Nathaniel Whittemore, 'How to use /goal to do more with AI.' You met <code>/goal</code> briefly back on Day 5; here's the deeper idea, because it's one of the highest-leverage ways to get Claude to do more in a single go." },
      { heading: "From turn-taking to a finish line", body: "Normally you work turn by turn: ask &rarr; wait &rarr; check &rarr; ask again. <code>/goal</code> flips that. You state a completion condition <b>once</b>, and Claude keeps working across many turns until that condition is actually met. As the episode puts it: you set the destination, the agent navigates, and you come back when it's done." },
      { heading: "What a goal actually is", body: "A goal is a clear, checkable <b>finish line</b>, not just a task. You type <code>/goal</code> and then the condition that means 'done', e.g. <code>/goal every row in the export has a valid date and a non-blank amount, and the summary fits on one page</code>. Claude re-checks that condition after each turn and won't stop until it's satisfied (or you stop it)." },
      { heading: "It's not just for code", body: "The episode's big point: <code>/goal</code> shines on everyday knowledge work, not only coding. Think <b>audits</b> ('every vendor has a renewal date and an owner'), <b>research</b> ('a one-page brief on each competitor with a source link'), <b>vendor reviews</b>, and <b>market landscapes</b>, anywhere the AI needs a clear finish line and evidence it actually got there." },
      { heading: "What makes a good goal (and a bad one)", body: "Good goals are specific and verifiable: 'all figures reconcile to the totals tab; no blank cells in column D.' Bad goals are vague ('make this better') or boundless ('redo everything'). Claude can't tell when those are done, so it stops when the work merely <i>looks</i> finished. The whole skill is naming the test it has to pass." },
      { heading: "Keep an eye on the meters", body: "Because a goal can run for a while, Claude tracks <b>elapsed time, turns, and tokens</b> as it goes. Glance at those to see how hard it's working, and stop it if a goal turns out too broad. For a big job, pair this with plan mode (Day 17): plan first, then set the goal, then let it run to the finish line." }
    ],
    quiz: [
      { q: "What does /goal do that a normal prompt doesn't?", options: ["Switches the model", "Sets a completion condition Claude works toward across many turns until it's met", "Deletes your context", "Connects an outside app"], answer: 1, explanation: "/goal gives Claude a finish line it re-checks every turn, so it keeps working until the condition is satisfied." },
      { q: "Which is the strongest /goal for an operator?", options: ["Make this spreadsheet better", "Clean everything up", "Every row has a valid date and a non-blank amount, and totals reconcile to the summary tab", "Do your best"], answer: 2, explanation: "A good goal is specific and verifiable. Claude can actually test whether it's done." },
      { q: "The AI Daily Brief episode's key point about /goal was that it's…", options: ["Only useful for writing code", "Useful well beyond coding: audits, research, vendor reviews, market landscapes", "A replacement for CLAUDE.md", "A way to turn off permissions"], answer: 1, explanation: "The episode stressed /goal's value for knowledge work that needs a clear finish line and evidence of completion." }
    ],
    challenge: [
      { text: "Pick a real task with a clear 'done' and set it with <code>/goal</code>, e.g. <code>/goal every row in @export.csv has a valid date and a non-blank amount</code>, then let Claude work until it's met.", link: DOC + "goal" },
      { text: "Watch the meters (time, turns, tokens) as it runs, and stop it if the goal turns out too broad.", link: DOC + "goal" },
      { text: "Try a non-coding goal from your real work, an audit, a research brief, or a vendor review, with a finish line that includes evidence (e.g. 'each item has a source link').", link: DOC + "goal" },
      { text: "Listen to the episode that inspired this bonus, 'How to use /goal to do more with AI' on The AI Daily Brief, and steal one idea for your own work.", link: "https://pod.link/1680633614" }
    ]
  }
];

/* Four multi-day Capstone projects. Each spans a block of days; the final day of
 * each block is a celebration. app.js maps a day to its project with projectForDay(n).
 * Edit these freely. Change the themes, taglines, or block lengths (just keep the
 * start/end day numbers contiguous and within 1..18). */
window.PROJECTS = [
  { id: 1, emoji: "📘", title: "Week 1 Sprint", tagline: "Pick a subject you're curious about and have Claude build you a personal learning kit.", start: 1,  end: 6  },
  { id: 2, emoji: "🛠️", title: "Week 2 Sprint", tagline: "Create a small tool, connected to your real apps and data, that takes a repetitive task off your plate.", start: 7,  end: 12 },
  { id: 3, emoji: "🚀", title: "Week 3 Sprint", tagline: "Plan it, automate it end to end, put it in git, and hand it to your team.", start: 13, end: 18 }
];

/* "Go deeper" flashcards. Shown AFTER a day is completed, as an optional,
 * interactive reveal-style round (think recall practice, not the step-1 cards).
 * Finishing a day's round awards a small one-time bonus (POINTS_DEEPDIVE in app.js)
 * and counts toward the "Curious Mind" badge. Keyed by day number; a day with no
 * entry simply won't show the Go-deeper option. Each card: { q, a } where q is a
 * prompt the teammate thinks about, then clicks to reveal the deeper answer (a).
 * `a` may contain simple HTML (e.g. <code>, <b>, <i>). */
window.DEEP_DIVE = {
  1: [
    { q: "You set up the desktop app on one computer and the terminal on another. Does your work move between them automatically?", a: "Your <b>sign-in</b> follows your account, but <b>sessions don't sync</b> between the desktop app and the terminal. They're independent. Pick one main workspace per project; the files on disk are the shared source of truth." },
    { q: "Why does Claude load your CLAUDE.md and auto-memory before you've typed anything?", a: "So it starts with your project's context (conventions, how to run things, past gotchas) instead of a blank slate. It's the difference between briefing a brand-new contractor and one who already knows the project." },
    { q: "A teammate is nervous they'll 'break something' by letting Claude touch their files. What do you tell them?", a: "By default Claude <b>asks before it changes anything</b>, and every edit can be undone with <code>/rewind</code>. It reads freely but needs your nod to change. So experimenting is safe." },
    { q: "What's the best first task to try on day one?", a: "Point Claude at a folder you know and ask it to <i>describe</i> what's there: 'what files are in here and what's each for?' It's read-only, builds trust, and shows how it gathers context before acting." },
    { q: "Why does describing the outcome clearly matter more than knowing commands?", a: "Claude handles the 'how'; your job is a clear 'what' and checking the result. A sharp, specific request beats any command knowledge, which is exactly an operator's strength." }
  ],
  2: [
    { q: "You hit the stop button mid-task, give a correction, and Claude carries on. Why didn't you lose your place?", a: "The loop is <b>conversational</b>. Stopping cancels the current <i>action</i>, not the conversation. Everything you've built up (files read, decisions made) stays, so your correction just steers the next step." },
    { q: "How is the 'verify' phase different from just trusting the output?", a: "In verify, Claude re-reads the file, runs the check, or compares against your criteria, and loops back if it's wrong. Giving it a way to check ('every row has a date') turns 'looks done' into 'provably done.'" },
    { q: "Claude is heading down the wrong path on a long task. Cheapest way to fix it?", a: "Stop it immediately (stop button / <code>Esc</code>) and type the correction. Don't let it finish a wrong path. The conversation is preserved, so you lose seconds, not your work." },
    { q: "Why give Claude a way to know it's done, instead of just describing the task?", a: "The verify phase is only as good as its target. 'Done = all rows have a date and amount' lets Claude self-check; without it, it stops at 'looks done' and the checking falls to you." },
    { q: "What's actually filling Claude's 'working memory' during a task?", a: "Your chat, the files it has read, command outputs, your CLAUDE.md and saved notes, and any loaded skills. As it fills, Claude tidies older material, which is why context management (Day 15) matters." }
  ],
  3: [
    { q: "When would you allowlist one command versus switching to auto-accept edits mode?", a: "<b>Allowlist</b> a single trusted command (like your test script) when you want everything else to still prompt. <b>Auto-accept edits</b> loosens approvals broadly for a flurry of routine edits. Allowlist = surgical; auto-accept = a mode for a work session." },
    { q: "Why is a 'deny' rule safer than simply not using a tool?", a: "A <b>deny</b> rule removes the tool from Claude's reach entirely and always wins over allow/ask. So even a confused model can't call it. Not configuring a tool isn't the same as actively blocking it." },
    { q: "What does pressing the mode selector (or Shift+Tab) actually change?", a: "It cycles three speeds: <b>default</b> (asks each action), <b>auto-accept edits</b> (routine edits flow), and <b>plan mode</b> (read-only). You're dialing how much Claude checks with you to match the risk." },
    { q: "Auto-accept edits is on. Will Claude delete a file or download from the web without asking?", a: "No. Auto-accept covers edits and <b>safe</b> housekeeping (mkdir, mv, cp) but still pauses for genuinely risky things like deletes or downloads. It speeds the routine, not the dangerous." },
    { q: "What's the everyday payoff of an allow rule?", a: "Allowlist a command you run constantly (like your test or convert script) and Claude stops asking about it, cutting the approval taps to near zero while everything else still prompts." }
  ],
  4: [
    { q: "You've been on one task an hour, then start something unrelated but skip /clear. What's the risk?", a: "Leftover context from the old task can bleed into the new one: wrong assumptions, slower replies. <code>/clear</code> wipes the working context so the new task starts clean and fast." },
    { q: "What's the difference between /clear and /resume?", a: "<code>/clear</code> throws away the current context to start fresh <i>now</i>; <code>/resume</code> reopens a <i>previous</i> session with its history intact. Opposite directions. One forgets, one remembers." },
    { q: "You can't remember a command's exact name. Fastest way to find it?", a: "Type <code>/</code> on its own to see the full list (they're not case-sensitive), or <code>/help</code> for a guided overview. You rarely need to memorize. Just browse." },
    { q: "When should you reach for /model or /effort?", a: "Use a lighter model or lower effort for simple chores (faster, cheaper), and more depth for thorny problems. <b>Fable 5</b> is the top pick for long, complex jobs once it's back (it's temporarily paused as of mid-June 2026; <b>Opus</b> is the strongest available in the meantime). Match the horsepower to the task instead of always running at full power." },
    { q: "Quickest way to stop being asked about a command you trust?", a: "<code>/permissions</code>. It shows every allow/ask/deny rule and lets you add an allow for that command on the spot." }
  ],
  5: [
    { q: "When is /branch (fork-session) better than just being careful?", a: "When you want to try a risky or experimental approach without endangering current work. <code>/branch</code> copies the conversation into an independent session, so the original is untouched no matter how the experiment goes." },
    { q: "How does /goal change when Claude decides it's 'done'?", a: "Without a goal, Claude stops when work <i>looks</i> finished. <code>/goal</code> gives it a condition it re-checks every turn (e.g. 'all tests pass'), so it keeps going until the condition is actually met. (Day 19 dives deeper.)" },
    { q: "A session has gotten long and sluggish but you still need its thread. /clear or /compact?", a: "<code>/compact</code>. It condenses history to free space while keeping the thread. Add a focus (<code>/compact focus on the budget numbers</code>) so the details you care about survive." },
    { q: "What does /plan let Claude do that default mode doesn't?", a: "It drops Claude into <b>read-only</b> plan mode to study the problem and propose an approach <i>without changing anything</i>, so you review the plan before any work happens." },
    { q: "What does /code-review give you that re-reading your own work doesn't?", a: "It reviews recent changes in a <b>fresh, clean context</b>, no original assumptions, so it catches things the session that made them would gloss over." }
  ],
  6: [
    { q: "A workflow should apply to the whole team. Which file, and why does that matter?", a: "The committed <code>./CLAUDE.md</code>. It's shared via git, so it loads for every teammate automatically. Personal notes go in <code>./CLAUDE.local.md</code> (gitignored) so they stay yours." },
    { q: "Why put deep detail in a nested subfolder's CLAUDE.md instead of the main one?", a: "A nested CLAUDE.md loads <b>on demand</b>, only when Claude works in that folder, so heavy detail doesn't weigh down every session. The root CLAUDE.md loads every time, so keep it lean." },
    { q: "What's worth putting in a CLAUDE.md for a non-code project?", a: "Anything you'd re-explain each time: 'reports live in /monthly', 'keep summaries under one page', naming conventions, how the pieces fit. It's a standing brief, not code." },
    { q: "What does an <code>@docs/style-guide.md</code> line inside CLAUDE.md do?", a: "It imports that file at session start, so you can keep notes modular and reuse one set across projects instead of copy-pasting." },
    { q: "How should you think of CLAUDE.md, rules or guidance?", a: "Guidance. Claude treats it as helpful background, not unbreakable law. It's the single biggest lever for consistent results, but you still steer with each request." }
  ],
  7: [
    { q: "What's the practical difference between CLAUDE.md and auto memory?", a: "<b>You</b> write CLAUDE.md (your standing brief); <b>Claude</b> writes auto memory on its own as it learns the project. One is your instructions, the other is its accumulated notes." },
    { q: "After months of work, why doesn't auto memory slow down your startup?", a: "Only the top ~200 lines of <code>MEMORY.md</code> load at start; deeper detail sits in topic files that load only when relevant. The index stays small no matter how much accumulates." },
    { q: "How do you see, or correct, what Claude has remembered?", a: "Run <code>/memory</code> anytime to view, edit, or open the memory folder. You stay in charge; you can also toggle auto memory off there." },
    { q: "Two git worktrees of the same repo, separate memory or shared?", a: "<b>Shared</b>. Worktrees of the same repository use one memory directory, so insights carry across them instead of being relearned." },
    { q: "What kind of thing does auto memory actually choose to save?", a: "Durable, useful stuff: how to run the project, a tricky gotcha it solved, recurring patterns, your style habits. It's selective on purpose, not a log of every detail." }
  ],
  8: [
    { q: "When is a skill the right home for something, versus CLAUDE.md?", a: "Use a <b>skill</b> for a repeatable multi-step procedure you only sometimes need. It loads on demand, so long reference material costs nothing until used. CLAUDE.md is for always-on context that should load every session." },
    { q: "Why might you set disable-model-invocation: true on a skill?", a: "So it runs <b>only</b> when you explicitly type its command, never auto-triggered. Good for sensitive or destructive procedures you want to fire deliberately, not have Claude reach for on its own." },
    { q: "You keep pasting the same onboarding checklist into chat. Better home for it?", a: "Save it once as a <b>skill</b> (<code>.claude/skills/onboard-client/SKILL.md</code>). From then on Claude applies it when relevant, or you run <code>/onboard-client</code>. No more copy-paste." },
    { q: "How do skills and slash commands relate?", a: "They're two sides of one coin. Both <code>.claude/commands/deploy.md</code> and <code>.claude/skills/deploy/SKILL.md</code> create a <code>/deploy</code>. Pick whichever layout you like." },
    { q: "Why can a skill hold long reference material without slowing you down?", a: "Skills load <b>on demand</b>, only when relevant, unlike CLAUDE.md, which loads every session. So detailed playbooks cost nothing until you actually use them." }
  ],
  9: [
    { q: "Why does combing through 200 files with a subagent keep your main chat sharp?", a: "The subagent works in its <b>own</b> context window and returns just a summary, so all that file-reading never floods your main conversation. You get the conclusion without the clutter." },
    { q: "Why limit a custom subagent's tools to read and search only?", a: "It guarantees the subagent <i>can't</i> change anything, perfect for a fact-checker or reviewer. Restricting tools is a safety boundary, not just tidiness." },
    { q: "Which built-in subagents can you use right away?", a: "<b>Explore</b> (map an unfamiliar folder) and <b>Plan</b> (think through an approach) are built in. Just ask Claude to use them. You can also define custom ones in <code>.claude/agents/</code>." },
    { q: "Where does a custom subagent live, and what makes it specialized?", a: "A markdown file in <code>.claude/agents/</code> with a name, description, its own instructions, and a <code>tools</code> list that limits what it can do (e.g. a fact-checker that can only read and search)." },
    { q: "Why doesn't a subagent dump its whole transcript on you?", a: "It works in its own context and returns a tidy <b>summary</b> of what it found or did. You get the conclusion, your main chat stays uncluttered." }
  ],
  10: [
    { q: "Why is CSV the friendliest spreadsheet format for Claude?", a: "CSV is plain-text rows and columns, so Claude can directly clean, sort, total, and de-duplicate it. A locked .xlsx with macros or a screenshot is far harder to work with reliably. Save/download as CSV first." },
    { q: "Before a 2,000-row bulk cleanup, what one thing makes it safe to hand off?", a: "A <b>checkable rule</b>: 'every row must have a valid date and a non-empty amount.' It turns 'looks done' into 'provably done,' so you review a verified result instead of hunting for mistakes." },
    { q: "How do you make Claude read a specific PDF before answering?", a: "Reference it with <code>@</code> and the path, <code>@reports/q3-budget.pdf</code>, or drag it into the window / paste a screenshot. Claude reads the contents as context." },
    { q: "What's the 'everyday superpower' for messy data?", a: "Cleanup: describe the mess and the target ('standardize every date to YYYY-MM-DD, drop empty rows, flag rows missing an amount') and Claude does the tedious pass, showing what it changed." },
    { q: "When does Claude shine most on file work?", a: "When the same small task repeats across many files: 'rename every file to YYYY-MM-DD-client.pdf', 'add a summary line to each report.' An hour of clicking becomes one instruction." }
  ],
  11: [
    { q: "Your whole team should share the same app connections. Which MCP scope?", a: "<b>Project</b> scope. It writes to <code>.mcp.json</code>, committed via git, so every teammate gets the same connectors. Local scope stays private to you; if both define the same app, Local wins." },
    { q: "What does connecting an app via MCP actually unlock?", a: "Claude can reach where your work lives (Drive, Notion, Slack, calendar) to <i>pull live info and take action</i>, not just read local files. It's the jump from working with your files to working across your whole day." },
    { q: "Most everyday apps connect over which transport, and why?", a: "<b>HTTP</b>. It's the recommended option for online services like Drive or Notion. <b>Stdio</b> is for a tool running as a program on your own machine; you'll rarely touch the others." },
    { q: "Where do you check if a connected app is signed in and healthy?", a: "Type <code>/mcp</code> while working. It shows which apps are connected, handles sign-in, and is where you confirm a connection if something isn't responding." },
    { q: "Do you have to set up connectors yourself?", a: "Often not. A team lead or IT can configure them once at <b>Project</b> scope and share the <code>.mcp.json</code> via git, so everyone is connected without doing the setup." }
  ],
  12: [
    { q: "Name two desktop-app features the terminal can't give you.", a: "Examples: the <b>diff viewer</b> (eyeball every change before approving), <b>drag-and-drop</b> files into chat, image paste, the file editor beside the chat, and <b>parallel sessions</b> in the sidebar, each in its own isolated copy of the project." },
    { q: "Why run two sessions in the sidebar at once?", a: "A long job can run in one while you start another. Each works in an isolated copy of your project, so they don't collide. It's how you parallelize without stepping on your own work." },
    { q: "The diff viewer: what does it save you from?", a: "From approving changes blind. It shows exactly what changed before you accept, so you review a clear before/after instead of trusting that the edit was right." },
    { q: "You need to compare two versions of a document. Desktop move?", a: "Drag both into the chat (or <code>@</code>-reference them) and ask 'what changed between these?' Paste screenshots too; Claude reads them as context." },
    { q: "Fastest way to repeat a prompt you typed earlier (terminal)?", a: "Press <code>&uarr;</code> to recall previous prompts, and <code>Tab</code> to complete commands as you type. Small keys, big time savings over retyping." }
  ],
  13: [
    { q: "You want one script auto-approved but still be asked before deletes. Which setup, and why not auto-accept edits?", a: "<b>Default mode + an allow rule</b> like <code>Bash(python convert.py *)</code>, only that command stops prompting, everything risky still asks. Auto-accept edits would loosen approvals far more broadly than you want." },
    { q: "Why explore an unfamiliar folder in plan mode first?", a: "Plan mode is <b>read-only</b>, zero chance of accidental changes while you and Claude figure out the lay of the land. You switch to an editing mode only once you know what you're doing." },
    { q: "You want to explore with zero chance of changes. Which mode?", a: "<b>Plan mode</b>. Claude can read files and run read-only commands (listing, searching) but cannot edit or run anything that changes your system." },
    { q: "What is 'auto mode' for?", a: "Longer <b>unattended</b> runs. A classifier auto-approves routine work while blocking scope creep and high-risk actions, so you don't have to approve every step of a long job." },
    { q: "Default mode auto-approves a tool after the first use. What does that mean in practice?", a: "The first time Claude uses a given tool you approve it; after that it stops asking for <i>that</i> tool this session. Pair it with allow rules for surgical control." }
  ],
  14: [
    { q: "Turn 'clean up this report' into a brief Claude can nail. What did you add?", a: "Name the file, the exact changes, and a 'done' rule: 'In <code>@reports/q3.csv</code>, standardize dates to YYYY-MM-DD, drop blank rows, and flag any row missing an amount.' Specificity plus a checkable finish line." },
    { q: "Why is 'tell it how to check itself' the highest-leverage prompting habit?", a: "Without a success criterion, Claude stops at 'looks done' and <i>you</i> become the error-catcher. With one (a rule, an example, a matching total), it self-verifies and you review a finished result." },
    { q: "Working in a folder you don't know well. What's the safe first step?", a: "Have Claude <b>explore and propose a plan first</b> (plan mode). Reviewing the plan catches wrong turns before any work happens, especially on unfamiliar material." },
    { q: "Why break a big job into numbered steps?", a: "Small, ordered pieces are easier for Claude to get right and easier for <i>you</i> to verify than one giant request. Complexity hides mistakes; structure surfaces them." },
    { q: "What can you paste straight into a prompt as context?", a: "Files (via <code>@path</code>), images, screenshots, and PDFs. Claude reads them all as context, so point it at the real thing instead of describing it from memory." }
  ],
  15: [
    { q: "/context shows MCP tool definitions eating space you never used. What's the fix?", a: "Turn on <b>tool search</b>. It defers MCP tool schemas until they're actually needed instead of loading them all upfront, reclaiming the context they were silently consuming." },
    { q: "After auto-compaction, is your earlier history gone?", a: "No. Compaction frees <i>working</i> space, but your full history is saved locally, so you can still <code>/rewind</code> to any earlier checkpoint. It declutters; it doesn't erase." },
    { q: "You're switching to a totally unrelated task. /compact or /clear?", a: "<code>/clear</code>, a full reset so old work can't interfere. <code>/compact</code> is for when you want to <i>keep</i> the thread but free space; switching tasks calls for a clean slate." },
    { q: "What does Claude do on its own when space runs low?", a: "It auto-compacts: first clearing old tool outputs, then summarizing earlier conversation if needed. You can steer it with <code>/compact focus on …</code> to protect what matters." },
    { q: "First thing to run when responses feel sluggish or off?", a: "<code>/context</code>. It shows exactly what's filling the window, so you can decide whether to trim, compact, or start fresh." }
  ],
  16: [
    { q: "Why have a separate, fresh session review work instead of the one that made it?", a: "A fresh context (or <code>/code-review</code>) doesn't carry the original session's assumptions, so it catches far more. The same blind spots that hid the issue won't hide it again." },
    { q: "What belongs in committed CLAUDE.md versus your personal settings?", a: "Team workflows everyone should follow → committed <code>./CLAUDE.md</code>. Machine-specific or private preferences → <code>CLAUDE.local.md</code> (gitignored) or <code>~/.claude/settings.json</code>. Shared vs. personal." },
    { q: "How do two teammates work the same project without stepping on each other?", a: "Each runs their own session on their own branch or git worktree (the desktop sidebar manages these), so edits never collide and everyone moves fast independently." },
    { q: "What makes a handoff to a teammate smooth?", a: "Name sessions descriptively with <code>/rename</code> and share rewind points, so they can pick up your context without a long explanation." },
    { q: "Which two things are most worth committing to share a setup?", a: "Your <code>CLAUDE.md</code> and shared <b>skills</b>. Commit them and every teammate gets the same playbook automatically on the project." }
  ],
  17: [
    { q: "Name a job worth planning first and one that isn't.", a: "<b>Worth it:</b> reorganizing a reports folder where filenames, an index, and a summary must stay in sync (many files / unfamiliar). <b>Not worth it:</b> fixing one typo. Planning is pure overhead for trivial, single-file changes." },
    { q: "The plan Claude proposes isn't quite right. What's your move?", a: "Edit it before implementing. Tell Claude what you'd do differently, or revise the plan directly (in the terminal, <code>Ctrl+G</code> opens it in your editor). Then it proceeds from <i>your</i> version." },
    { q: "What are the four phases of the plan-mode workflow?", a: "<b>Explore</b> in plan mode → ask for a detailed <b>plan</b> → exit and <b>implement</b> → let Claude <b>verify</b> with tests or a build. Each step builds on the last." },
    { q: "How do you start in plan mode every time without thinking about it?", a: "Set <code>defaultMode: plan</code>. Sessions begin read-only, so you always explore and plan before anything can change." },
    { q: "Why review the plan before letting Claude implement?", a: "Catching a wrong turn on paper costs minutes; catching it after Claude has edited many files costs far more. The plan is the cheapest place to fix direction." }
  ],
  18: [
    { q: "You want a daily brief generated automatically. Desktop versus terminal. What do you reach for?", a: "Desktop: a scheduled <b>Routine</b> via <code>/schedule</code> (runs in the cloud). Terminal/CLI: <code>claude -p \"…\"</code> on a schedule. Both run the task hands-off; pick the one matching your workflow." },
    { q: "When is bypassPermissions mode ever appropriate?", a: "Only in an <b>isolated, throwaway environment</b>. It skips prompts entirely (except root/home deletions). Never on real work or your main machine; it removes the safety net on purpose for sandboxed automation." },
    { q: "Running the same task across 50 documents from a script. How do you get usable output?", a: "Add <code>--output-format json</code> (a CLI/SDK feature) so each result is structured data a program can parse, instead of prose. Essential for batch jobs." },
    { q: "How do you keep a session working after you detach the terminal?", a: "<code>/background</code> detaches it so it keeps running; check on it later with <code>/tasks</code> or reconnect. The desktop sidebar manages parallel sessions visually." },
    { q: "What's the safer permission choice for an unattended run?", a: "<code>--permission-mode auto</code> leans on background safety checks to auto-approve routine work while blocking risky actions, far safer than bypassing permissions entirely." }
  ],
  19: [
    { q: "Turn 'make this audit better' into a real /goal. What makes yours work?", a: "Name a verifiable finish line, e.g. <code>/goal every vendor has a renewal date and an owner, and each flagged risk has a one-line mitigation</code>. Claude can <i>test</i> that. It can't test 'better.'" },
    { q: "Your /goal has been running a while. How do you tell if it's productive or stuck?", a: "Glance at the <b>meters</b>: elapsed time, turns, tokens. If they climb without progress toward the condition, the goal is probably too broad; stop it and tighten the finish line." },
    { q: "What does /goal change about the normal turn-by-turn rhythm?", a: "It flips ask→wait→check→repeat into 'set the condition once, Claude works across many turns until it's met.' You set the destination; it navigates." },
    { q: "Give a strong non-coding goal for a research task.", a: "<code>/goal a one-page brief on each of our five competitors, each with a pricing summary and a source link</code>. Specific scope plus evidence ('source link') it can verify." },
    { q: "Pair /goal with which Day 17 habit for a big job?", a: "<b>Plan mode</b>. Plan the approach first, then set the goal, then let it run to the finish line. Planning scopes the work; the goal holds it to a verifiable end." }
  ]
};

/* Supplemental guide: always available from the home screen, no unlock or points.
 * For teammates who practiced on a personal device and just got Claude Code on
 * their WORK computer. cards[] render like step-1 lesson cards ({heading, body},
 * body may contain simple HTML). checklist[] renders as a tick-off list whose
 * checked state is saved per player (state.suppChecks) but awards nothing. */
window.SUPPLEMENTAL = {
  title: "Set up Claude Code on your work computer",
  intro: "Many of us practiced on a personal device and just got Claude Code on our work machines. This guide gets you set up the right way — signing in, carrying over the useful bits you built at home, and steering clear of the few things you shouldn't copy across. It lives here permanently; open it whenever you need it.",
  cards: [
    { heading: "What actually carries over (and what doesn't)", body: "The best part — the <b>skills you've built are in your head</b>, and those transfer instantly. The <i>customizations</i> you made (your personal preferences file, any custom commands or skills) are just files, so you can bring those along too. What does <b>not</b> follow you: your logins, your saved sessions, and Claude's auto-memory. None of that syncs automatically; it all stays on the machine where you made it. Treat this as a fresh, clean setup that you season with a few favorite touches." },
    { heading: "Sign in with your WORK account", body: "Open Claude Code on your work computer and sign in when prompted. Use the <b>account your company gave you</b> (a work Claude subscription or your company single sign-on), not your personal one. <b>Never paste a personal API key</b> onto a work machine — that ties your personal billing and account to company equipment. If you're not sure which account or method to use, ask IT; some companies set this up for you automatically." },
    { heading: "Confirm you're on the right account", body: "Once you're in, type <code>/status</code> to see which account is active. If it's the wrong one, run <code>/logout</code> and sign back in with your work account. It's worth a ten-second check now so every bit of your work activity is on the right account from day one." },
    { heading: "Where your personal touches live", body: "Your personal Claude settings sit in a hidden folder called <code>.claude</code> inside your user folder (on Windows, <code>C:\\Users\\you\\.claude</code>). Inside are the things worth keeping: your <b>global <code>CLAUDE.md</code></b> (your preferences for every project) and any <b>custom skills or slash commands</b> you made. You don't have to memorize any of this — you can simply <b>ask Claude</b> to find and copy these for you." },
    { heading: "Bringing your customizations to work", body: "On your <b>personal</b> machine, ask Claude to gather your <code>CLAUDE.md</code> and any custom skills or commands into one folder. Move that folder to your work computer the normal way (OneDrive, email-to-yourself, a USB stick). Then on your <b>work</b> machine, ask Claude to place them into your <code>.claude</code> folder. <b>Review them first</b> and trim anything personal you wouldn't want living on a work device." },
    { heading: "The things you must NOT copy", body: "A short do-not-copy list: your <b>login and credential files</b> (account-specific and secret), anything containing a <b>password, API key, or token</b>, and any <b>personal</b> notes that don't belong on work equipment. It matters in the other direction too — don't move <b>work-confidential</b> material onto a personal machine. When in doubt, leave it out." },
    { heading: "Set up your first work project", body: "In a real project folder, run <code>/init</code>. Claude looks around and writes a starter <code>CLAUDE.md</code> — a short brief of how that project works (its common commands, where things live, the team's conventions) that loads automatically every session. Review it, tidy it, and if it's a shared team project, save it so everyone benefits. A good <code>CLAUDE.md</code> is the single biggest thing that makes Claude feel like it already knows your work." },
    { heading: "Go gently on permissions at first", body: "For your first week on real work, lean on <b>plan mode</b> (the read-only mode — it can look and propose, but not change anything) so you can watch how Claude approaches your actual files. As trust builds, switch to the faster modes, and use <code>/permissions</code> to <b>allow</b> the safe commands you run constantly so you're not clicking approve all day. <b>Deny always wins</b>, so you can hard-block anything you never want run." },
    { heading: "Connecting work tools (Slack, email, Jira…)", body: "Claude can connect to your work tools through <b>connectors</b> (MCP). Two rules: <b>check your company's policy first</b> — some require approval or restrict this entirely — and always keep <b>work accounts to work, personal to personal</b>, never crossed. Each person signs in with their own account, and those logins stay on your machine and are never shared. If you're unsure whether a tool is approved, ask IT or your team lead before connecting it." },
    { heading: "A few habits that pay off", body: "Carry these from practice into the real thing: <b>explore before you change</b> (plan mode for anything non-trivial), <b>give Claude a way to check itself</b> (a test, an expected result, a 'does it match this?'), keep a tidy project <code>CLAUDE.md</code>, and turn any procedure you repeat into a <b>skill</b> you can run with one command. The fundamentals are exactly what you practiced in the quest — you're just pointing them at real work now." }
  ],
  checklist: [
    "Open Claude Code on your work computer and sign in with your work account",
    "Run /status to confirm the right account is active",
    "Copy over your personal CLAUDE.md and any custom skills (review them for anything private first)",
    "Open a real work project, run /init, and review the CLAUDE.md it writes",
    "Start in plan mode for your first few real tasks",
    "Check your company's policy before connecting any work tools (Slack, email, Jira)",
    "Allowlist a couple of safe commands you use constantly with /permissions"
  ]
};
