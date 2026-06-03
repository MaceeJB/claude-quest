/* Claude Quest — curriculum data.
 * Defined as a plain global so the app works from file:// and from GitHub Pages
 * without any fetch/CORS. Each day: { day, title, section, lesson[], quiz[], challenge[] }.
 * quiz[].answer is the 0-based index of the correct option.
 *
 * challenge[] items are objects: { text, link }, where `link` points at the
 * official Claude Code docs page for that task ("Learn how →"). The final item of
 * each day has capstone:true — it carries ONE real project forward across all 18
 * days, so players build something real while they learn.
 */
var DOC = "https://code.claude.com/docs/en/";
window.CURRICULUM = [
  {
    day: 1,
    title: "Installation & Your First Session",
    section: "Getting Started",
    lesson: [
      { heading: "What Claude Code is — and why operators use it", body: "Claude Code is an AI assistant that works right inside your computer's terminal: it can read files, run commands, edit documents and spreadsheets, and automate repetitive work. You don't write code — you describe what you want in plain English, like briefing a sharp teammate. For an operator that means jobs like cleaning up a messy export, summarizing a folder of reports, renaming files in bulk, or running a routine check can be handed off and finished in seconds." },
      { heading: "Installing it (and the one Windows detail that matters)", body: "There are three ways to install. A <b>native install</b> (a one-line curl/irm script) is recommended because it <b>auto-updates in the background</b> — you stay on the latest version without thinking about it. <b>Homebrew</b> and package managers (<code>winget</code>, <code>apt</code>, <code>dnf</code>) also work but need <b>manual updates</b>. One detail on Windows: installing <b>Git for Windows</b> lets Claude Code use the Bash shell; without it, it falls back to PowerShell. Either is fine, but Bash matches most examples you'll find online." },
      { heading: "Starting your first session", body: "Type <code>claude</code> inside a project folder to open an interactive session. The first time, you log in (a Claude subscription, Console account, or a cloud provider such as Bedrock or Vertex AI), and your login is remembered after that. As it starts, Claude automatically loads any <code>CLAUDE.md</code> files and its own <b>auto memory</b> — saved notes about your project — so it begins already knowing your context instead of from a blank slate." },
      { heading: "How you actually talk to it", body: "You work in plain language, one request at a time — no special syntax. Try things like 'summarize the files in this folder', 'turn this CSV into a clean table', or 'find every document that mentions the Q3 budget'. Claude works in a loop: it looks around, takes an action, then checks its own result. Crucially, it asks for your approval before changing anything, so you are always in control of what happens." },
      { heading: "Running a one-off task (no session)", body: "When you just want a single job done and don't need a back-and-forth, use <code>claude -p \"your task\"</code>. It runs that one task and exits immediately — ideal for scripts, scheduled jobs, and automated checks. For example, <code>claude -p \"summarize today's log file and flag anything unusual\"</code> could run every morning on its own, with no session to babysit." },
      { heading: "You don't need to be an engineer", body: "The real skill here isn't coding — it's describing what you want clearly and verifying the result is right. That plays directly to an operator's strengths. Over the next 18 days you'll build genuine fluency one topic at a time, and your hands-on <b>Capstone</b> project gives you a real thing to practice on. Today, the only goal is to get it installed and say hello." }
    ],
    quiz: [
      { q: "Which install method auto-updates Claude Code in the background?", options: ["Homebrew", "Native install (curl/irm)", "winget", "apt"], answer: 1, explanation: "Native installs auto-update; Homebrew and package managers need manual updates." },
      { q: "You want to analyze a log file inside a shell script, no interactive session. Which command?", options: ["claude", "claude --continue", "claude -p \"analyze this log\"", "/init"], answer: 2, explanation: "The -p flag runs a one-off task without a session — ideal for scripts and CI." },
      { q: "On Windows, what makes Claude Code use Bash instead of PowerShell?", options: ["Nothing — it always uses PowerShell", "Installing Git for Windows", "Running as administrator", "Setting SHELL=bash only"], answer: 1, explanation: "Git for Windows ships Bash, which Claude Code will prefer when present." },
      { q: "What happens at the very start of a session?", options: ["Nothing loads until you prompt", "CLAUDE.md files and auto memory load", "All MCP tools fully load into context", "It clears previous memory"], answer: 1, explanation: "CLAUDE.md and auto memory load on launch so Claude starts with project context." }
    ],
    challenge: [
      { text: "Launch Claude Code with the <code>claude</code> command and read the welcome screen.", link: DOC + "quickstart" },
      { text: "Run a one-off task with <code>claude -p \"summarize the files in this folder\"</code> and watch it exit without a session.", link: DOC + "headless" },
      { text: "Confirm which shell Claude Code is using by asking it to run <code>echo $SHELL</code> (or check the welcome screen).", link: DOC + "setup" },
      { text: "<b>Project 1 kickoff &mdash; Learn something new:</b> pick a subject you're curious about (a hobby, a tool, a topic at work). Make an empty folder, run <code>claude</code> inside it, and <b>you choose what to build</b> over the next 5 days: a <b>study guide</b>, a set of <b>flashcards</b>, a <b>self-quiz</b>, a <b>glossary</b>, or a <b>learning roadmap</b>. To start, ask Claude to scaffold a <code>learning-plan.md</code> that breaks your subject into about 5 subtopics.", link: DOC + "quickstart", capstone: true }
    ]
  },
  {
    day: 2,
    title: "The Agentic Loop & How Claude Works",
    section: "Getting Started",
    lesson: [
      { heading: "Why understanding the loop makes you better at this", body: "Claude isn't a vending machine that spits out an answer — it works the way a careful teammate does: it looks around, does something, then checks whether it worked. Once you can see those steps happening, you stop micromanaging and start directing, which is exactly the skill that makes an operator effective with any assistant." },
      { heading: "Gather → Act → Verify", body: "Every task moves through three phases: <b>gather</b> context (read the files, search for what's relevant), <b>act</b> (make the edit, run the command), and <b>verify</b> (check the result against what you asked for). There's no hidden 'compile' or 'build' step in the loop itself — just these three, repeating and blending as the work goes." },
      { heading: "It checks its own work", body: "The verify phase is what separates this from a one-shot answer. After making a change, Claude re-reads the file, runs the check, or compares the output — and if something's off, it loops back and tries again. You can strengthen this by telling it how to know it's done (more on that on Day 14)." },
      { heading: "You're part of the loop — jump in anytime", body: "If Claude heads in the wrong direction, press <code>Esc</code> to stop it mid-action. Your conversation is <b>not</b> lost — you simply type a correction and it adjusts from there. Press <code>Esc Esc</code> to rewind to an earlier checkpoint if you want to back up further." },
      { heading: "Correcting it is a conversation, not a reset", body: "Say Claude proposes a fix and you realize the real problem is elsewhere — just tell it, in plain words, like 'no, the issue is in how sessions time out.' It reads your correction and changes its next step. You keep all the context you've built up; nothing starts over." },
      { heading: "What's in the 'conversation' it remembers", body: "Claude's working memory holds your chat history, the files it has read, command outputs, your CLAUDE.md and saved notes, and any loaded skills. As that fills up, it automatically tidies older material so it stays sharp — a topic you'll dig into on Day 15." }
    ],
    quiz: [
      { q: "Which is NOT one of the three phases of the agentic loop?", options: ["Gather context", "Take action", "Verify results", "Compile to binary"], answer: 3, explanation: "The loop is gather → act → verify; there is no compile phase." },
      { q: "Claude proposes a fix and you say 'no, the bug is in session handling.' What happens?", options: ["A new session starts and context is lost", "Claude reads your correction and adjusts its next step", "You must run /clear first", "History is permanently lost"], answer: 1, explanation: "The loop is conversational — interrupt and redirect any time without losing context." },
      { q: "How do you stop Claude mid-action without losing the conversation?", options: ["Close the terminal", "Press Esc", "Run /stop", "Ctrl+C twice"], answer: 1, explanation: "Esc cancels the running action and keeps your conversation intact." }
    ],
    challenge: [
      { text: "Give Claude a small multi-step task and watch it gather → act → verify.", link: DOC + "common-workflows" },
      { text: "While it's working, press <code>Esc</code> to interrupt, then type a redirection and continue.", link: DOC + "interactive-mode" },
      { text: "Try <code>Esc Esc</code> to open the rewind menu and look at your checkpoints.", link: DOC + "interactive-mode" },
      { text: "<b>Project 1 &mdash; day 2:</b> describe the first piece of your learning kit in plain English (e.g. 'write a one-page overview of my subject plus a glossary of key terms') and watch the gather → act → verify loop build it end-to-end.", link: DOC + "common-workflows", capstone: true }
    ]
  },
  {
    day: 3,
    title: "Reading, Editing & Permissions",
    section: "Core Interaction",
    lesson: [
      { heading: "Why you can relax about letting it touch your files", body: "The biggest worry for a new operator is 'what if it changes something it shouldn't?' Claude Code is built so that, by default, nothing happens to your files without your say-so — and anything it does change can be undone. Knowing that lets you experiment freely." },
      { heading: "It asks before it changes anything", body: "In the standard (default) mode, when Claude wants to edit a file it <b>stops and asks first</b>. You can approve that one change, or approve it for the rest of the session so it stops asking for similar edits. It can always read files freely; it's changes that need your nod." },
      { heading: "Undo is built in", body: "Right before editing a file, Claude quietly takes a snapshot of it. If you don't like the result, press <code>Esc</code> twice or run <code>/rewind</code> to roll back to how things were. That safety net is always there, even several steps later." },
      { heading: "Three speeds, one shortcut", body: "Press <code>Shift+Tab</code> to cycle through three modes: <b>default</b> (asks for each action), <b>auto-accept edits</b> (stops asking for routine edits), and <b>plan mode</b> (read-only — it can look but not touch). Pick the speed that matches how risky the work is." },
      { heading: "What auto-accept actually auto-approves", body: "Auto-accept edits speeds you up by approving file edits and <b>safe</b> housekeeping commands — making folders, moving and copying files (<code>mkdir</code>, <code>mv</code>, <code>cp</code>). It still pauses for anything genuinely risky, so you're not handing over the keys entirely." },
      { heading: "Setting your own guardrails: allow / ask / deny", body: "You can write rules that say always-allow, always-ask, or always-deny for specific commands. <b>Deny always wins</b> and even removes that tool from Claude's reach. The everyday win: allowlist a command you run constantly (like your test command) so Claude stops asking about it." }
    ],
    quiz: [
      { q: "In default mode, Claude wants to edit a file. What happens?", options: ["It edits immediately", "It asks; you can approve once or for the session", "It can read but never edit", "You must switch modes first"], answer: 1, explanation: "Default mode prompts for edits; approval can apply for the rest of the session." },
      { q: "Your settings have \"deny\": [\"Bash(rm *)\"]. The result?", options: ["Bash is fully disabled", "Bash works except commands starting with 'rm '", "The tool stays available but rm is blocked at runtime", "B and C are both true"], answer: 3, explanation: "A scoped deny leaves Bash available and blocks only matching calls." },
      { q: "How do you cycle between permission modes without leaving the REPL?", options: ["Tab", "Shift+Tab", "Ctrl+M", "/mode"], answer: 1, explanation: "Shift+Tab cycles default → auto-accept edits → plan mode." },
      { q: "Before editing a file, Claude…", options: ["Deletes the original", "Snapshots it so you can revert", "Commits to git automatically", "Asks you to back it up"], answer: 1, explanation: "The snapshot powers /rewind and Esc-Esc undo." }
    ],
    challenge: [
      { text: "Press <code>Shift+Tab</code> a few times and watch the mode indicator cycle.", link: DOC + "permission-modes" },
      { text: "Ask Claude to make a small edit, approve it, then press <code>Esc Esc</code> and try /rewind to undo it.", link: DOC + "interactive-mode" },
      { text: "Run <code>/permissions</code> and add an allow rule for a command you trust (e.g. your test command).", link: DOC + "permissions" },
      { text: "<b>Project 1 &mdash; day 3:</b> have Claude expand your hardest subtopic into a deeper explainer, review the diff before approving, then add an allow-rule for a command you'll reuse.", link: DOC + "permissions", capstone: true }
    ]
  },
  {
    day: 4,
    title: "Essential Slash Commands (Part 1)",
    section: "Core Interaction",
    lesson: [
      { heading: "Quick controls you type with a slash", body: "Slash commands are shortcuts you type right in the chat to control the session — no menus, no mouse. Type <code>/</code> on its own to see the whole list (they're not case-sensitive), and <code>/help</code> for a guided overview. You'll use a handful constantly." },
      { heading: "/clear — a fresh desk between jobs", body: "When you finish one thing and start something unrelated, run <code>/clear</code>. It wipes the working context so leftover details from the last task don't muddle the new one. Think of it as clearing your desk before the next project — it also keeps Claude fast and focused." },
      { heading: "/resume — pick up where you left off", body: "Closed your terminal yesterday mid-task? <code>/resume</code> reopens a previous session with its history intact, so you continue the conversation instead of re-explaining everything." },
      { heading: "/memory — see and edit what Claude knows", body: "<code>/memory</code> opens the project's standing notes — your <code>CLAUDE.md</code> and Claude's own saved notes — so you can read or tweak what it remembers about your work. (Those two are the focus of Days 6 and 7.)" },
      { heading: "/model and /effort — dial cost vs. depth", body: "<code>/model</code> switches which model you're using (such as sonnet, opus, or haiku), and <code>/effort</code> trades how hard Claude thinks against speed and cost. Use a lighter touch for simple chores, more depth for thorny problems." },
      { heading: "/permissions — manage what needs approval", body: "<code>/permissions</code> shows every allow/ask/deny rule and lets you change them on the spot — the cleanest way to stop being asked about commands you trust." }
    ],
    quiz: [
      { q: "You finish a feature and want to start an unrelated bug fix. Run first:", options: ["/resume", "/clear", "/memory", "Esc"], answer: 1, explanation: "/clear resets context so old work doesn't clutter the new task." },
      { q: "Which command lists and lets you modify tool approval rules?", options: ["/init", "/permissions", "/mcp", "/model"], answer: 1, explanation: "/permissions shows all allow/ask/deny rules and lets you change them." },
      { q: "How do you reopen a previous session?", options: ["/clear", "/resume", "/branch", "/reset"], answer: 1, explanation: "/resume lets you pick and reopen an earlier session." }
    ],
    challenge: [
      { text: "Type <code>/</code> and skim the full command list; open <code>/help</code>.", link: DOC + "slash-commands" },
      { text: "Run <code>/clear</code> between two unrelated tasks and notice the fresh context.", link: DOC + "slash-commands" },
      { text: "Try <code>/model</code> to see which models you can switch to.", link: DOC + "slash-commands" },
      { text: "<b>Project 1 &mdash; day 4:</b> turn your notes into <b>flashcards</b> or a <b>10-question self-quiz</b>, running <code>/clear</code> between subtopics so each one starts from clean context.", link: DOC + "slash-commands", capstone: true }
    ]
  },
  {
    day: 5,
    title: "Slash Commands (Part 2) & Planning",
    section: "Core Interaction",
    lesson: [
      { heading: "The commands that shine on bigger jobs", body: "Day 4 covered the everyday commands; these come out when a task gets longer or trickier. They help you plan before acting, keep the session tidy, experiment safely, and set a clear finish line." },
      { heading: "/plan and /context — look before you leap", body: "<code>/plan</code> drops Claude into read-only plan mode so it can study the problem and propose an approach without changing anything. <code>/context</code> shows you what's currently filling its working memory, so you can tell when it's time to trim." },
      { heading: "/compact — summarize without losing the thread", body: "When a session gets long, <code>/compact</code> condenses the history to free up room. Add a focus — <code>/compact focus on the API changes</code> — and the details you care about survive the summary while the noise gets dropped." },
      { heading: "/rename and /branch — organize and experiment", body: "<code>/rename</code> gives a session a memorable name so it's easy to find with <code>/resume</code>. <code>/branch</code> (also called <code>/fork-session</code>) copies your current conversation into a brand-new, independent session — perfect for trying a risky idea while leaving your original work untouched." },
      { heading: "/goal — set a finish line Claude keeps checking", body: "<code>/goal</code> lets you state a completion condition, like 'all the tests pass' or 'the page loads with no errors.' Claude re-checks it after every turn and keeps working until it's actually met — instead of stopping when things merely look done." },
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
      { text: "<b>Project 1 &mdash; day 5:</b> set a <code>/goal</code> for your learning kit (e.g. 'covers all 5 subtopics, fits on one page, and has a 10-question quiz') and let Claude iterate until it's met.", link: DOC + "goal", capstone: true }
    ]
  },
  {
    day: 6,
    title: "CLAUDE.md — Project Memory",
    section: "Persistent Context",
    lesson: [
      { heading: "Give your project a standing brief", body: "CLAUDE.md is a plain text (markdown) file that Claude reads at the start of <b>every</b> session — like a briefing note you'd hand a new contractor. You write it once; Claude treats it as helpful background, not unbreakable law. It's the single biggest lever for getting consistent results." },
      { heading: "What's worth putting in it", body: "The things you'd otherwise re-explain every time: how to run or build the project, the conventions you follow, how the pieces fit together, and any common workflows. For a non-code project that might be 'reports live in /monthly, always keep the summary under one page.'" },
      { heading: "Four places it can live", body: "<b>Project</b> (<code>./CLAUDE.md</code>, shared with your team via git), <b>User</b> (<code>~/.claude/CLAUDE.md</code>, applies to all your own projects), <b>Local</b> (<code>./CLAUDE.local.md</code>, just for you on this project), and an org-wide managed policy set by your company." },
      { heading: "Team rules vs. personal notes", body: "A workflow the whole team should follow goes in the committed <code>./CLAUDE.md</code> so it loads for everyone. Anything personal or private — local credentials, your own reminders — goes in <code>./CLAUDE.local.md</code>, which you add to <code>.gitignore</code> so it never gets shared." },
      { heading: "How loading works", body: "Claude looks up the folder tree and loads the CLAUDE.md files it finds. A CLAUDE.md tucked inside a subfolder loads <b>on demand</b> — only when Claude starts working with files in that folder — so deep detail doesn't weigh down every session." },
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
      { text: "<b>Project 1 finale 🎉:</b> write a <code>CLAUDE.md</code> for your learning kit &mdash; its structure and how you like to study &mdash; then start a fresh session and confirm Claude already knows them. Your first project is complete!", link: DOC + "memory", capstone: true }
    ]
  },
  {
    day: 7,
    title: "Auto Memory — Claude's Own Notes",
    section: "Persistent Context",
    lesson: [
      { heading: "Claude keeps its own notebook", body: "Auto memory is Claude writing down what it learns about your project so it doesn't start from zero next time — and you don't have to maintain it. This is different from CLAUDE.md, which <b>you</b> write; auto memory is what <b>Claude</b> chooses to remember on its own." },
      { heading: "What it bothers to remember", body: "Useful, durable things: how to run the project, a tricky gotcha it figured out, recurring patterns, and your style habits. It's selective on purpose — it only saves what's genuinely worth keeping, not every passing detail." },
      { heading: "Where the notes live", body: "Each project gets its own folder at <code>~/.claude/projects/&lt;project&gt;/memory/</code>. A nice detail for teams: if you use multiple git worktrees of the same repository, they all <b>share one memory directory</b>, so insights carry across them." },
      { heading: "Only the top of the notebook loads", body: "At session start, Claude loads just the first 200 lines (about 25KB) of its <code>MEMORY.md</code> index. Deeper detail sits in separate topic files that load only when relevant — that's how months of accumulated notes never slow down your startup." },
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
      { text: "<b>Project 2 kickoff &mdash; Build a work helper:</b> start a new folder for a small tool that takes a repetitive task off your plate (a weekly-report generator, a CSV cleaner, a meeting-prep brief…). Build its first feature, then run <code>/memory</code> and see what Claude chose to remember about it.", link: DOC + "memory", capstone: true }
    ]
  },
  {
    day: 8,
    title: "Skills — Reusable Workflows",
    section: "Advanced Features",
    lesson: [
      { heading: "Teach Claude your repeatable routines", body: "A skill is a saved, reusable workflow — a set of instructions (and sometimes reference material) Claude can follow on demand. If you find yourself explaining the same multi-step procedure over and over, that's a skill waiting to happen." },
      { heading: "What a skill actually is", body: "It's a small folder with a <code>SKILL.md</code> file inside <code>.claude/skills/</code>, giving it a name and a description of when to use it. Claude applies the right skill automatically when your request matches, or you can run it yourself by typing <code>/the-skill-name</code>." },
      { heading: "A concrete example", body: "Say you keep pasting the same 'here's how we onboard a new client' checklist into chat. Save it once as <code>.claude/skills/onboard-client/SKILL.md</code> and from then on Claude just knows the procedure — no more copy-paste." },
      { heading: "They load only when needed", body: "Unlike CLAUDE.md, which loads every single session, a skill loads <b>on demand</b> — only when it's relevant. That means you can keep long, detailed reference material in skills without it costing you anything until the moment you use it." },
      { heading: "Make a skill manual-only", body: "If you want a skill to run <b>only</b> when you ask for it (never auto-triggered), set <code>disable-model-invocation: true</code> in its frontmatter. Good for sensitive or destructive procedures you want to fire deliberately." },
      { heading: "Commands are skills too", body: "Slash commands and skills are two sides of the same coin: both <code>.claude/commands/deploy.md</code> and <code>.claude/skills/deploy/SKILL.md</code> create a <code>/deploy</code> command. Pick whichever layout fits how you like to organize things." }
    ],
    quiz: [
      { q: "You keep pasting the same monthly-report procedure into chat. Best fix?", options: ["Add it to CLAUDE.md", "Create a skill at .claude/skills/monthly-report/SKILL.md", "Keep pasting it", "Put it in auto memory"], answer: 1, explanation: "Skills are made for repeatable workflows — Claude applies them or you run /monthly-report." },
      { q: "Which frontmatter field stops a skill from auto-triggering?", options: ["manual: true", "disable-model-invocation: true", "invoke-only: true", "requires-approval: true"], answer: 1, explanation: "disable-model-invocation: true makes it run only when you invoke it." },
      { q: "A key benefit of skills over CLAUDE.md is that they…", options: ["Load every session", "Load on demand, saving context", "Can't be invoked manually", "Are stored in git history only"], answer: 1, explanation: "On-demand loading keeps long reference material out of context until needed." }
    ],
    challenge: [
      { text: "Type <code>/</code> and look for skills already available in your setup.", link: DOC + "skills" },
      { text: "Create a tiny skill at <code>.claude/skills/hello/SKILL.md</code> with a name and description.", link: DOC + "skills" },
      { text: "Invoke it with <code>/hello</code> and confirm Claude follows it.", link: DOC + "skills" },
      { text: "<b>Project 2 &mdash; day 2:</b> turn your helper's core repetitive step into a skill, then invoke it on real work.", link: DOC + "skills", capstone: true }
    ]
  },
  {
    day: 9,
    title: "Subagents — Specialized Assistants",
    section: "Advanced Features",
    lesson: [
      { heading: "Hand the heavy lifting to a specialist", body: "A subagent is a helper Claude can spin up for a specific job — comb through a big folder of documents, fact-check a draft, research a topic — that works on its own and reports back. Think of it as Claude delegating to a focused assistant instead of doing everything in one crowded conversation." },
      { heading: "Each one works in its own space", body: "A subagent runs in its <b>own</b> context window, with its own instructions, its own set of tools, and its own permissions. It tackles the task independently of your main chat." },
      { heading: "Why that protects you", body: "Big, messy jobs — like reading through hundreds of files — would normally flood your main conversation and slow Claude down. Because a subagent's work stays in its own space, your main conversation stays clean and focused on what you care about." },
      { heading: "It reports back a summary", body: "When a subagent finishes, it doesn't dump its entire transcript on you — it returns a tidy <b>summary</b> of what it found or did. You get the conclusion without the clutter." },
      { heading: "Build your own", body: "Beyond the built-ins (like Explore and Plan), you can define custom subagents as markdown files in <code>.claude/agents/</code>, each with a name, a description, a <code>tools</code> field listing the limited set of tools it may use, and its own instructions. For example, a 'fact-checker' that can only read and search — never edit." }
    ],
    quiz: [
      { q: "You need to comb through a big folder of documents, which would fill your main context. Best approach?", options: ["Do it inline and /compact later", "Use a subagent so the research stays isolated", "Open a manual second session", "Skip it"], answer: 1, explanation: "Subagents run in isolated contexts, keeping your main conversation clean." },
      { q: "Where do you define a custom 'fact-checker' subagent limited to reading and searching?", options: [".claude/skills/ with restrict-tools", ".claude/agents/ with a tools field", "CLAUDE.md with subagent-config", "Only via /agents interactively"], answer: 1, explanation: "Custom subagents live in .claude/agents/; the tools field limits their tools to read-only." },
      { q: "When a subagent finishes, it returns…", options: ["Its full raw transcript into your context", "A summary of its work", "Nothing — you must ask", "A new session you must resume"], answer: 1, explanation: "Subagents report back a concise summary, protecting your main context." }
    ],
    challenge: [
      { text: "Ask Claude to use the Explore subagent to map an unfamiliar folder of files.", link: DOC + "sub-agents" },
      { text: "Notice how the subagent's searching doesn't flood your main conversation.", link: DOC + "sub-agents" },
      { text: "Sketch a custom read-only subagent file in <code>.claude/agents/</code> with a restricted <code>tools</code> list.", link: DOC + "sub-agents" },
      { text: "<b>Project 2 &mdash; day 3:</b> ask a subagent to explore your growing helper and summarize how its parts fit together.", link: DOC + "sub-agents", capstone: true }
    ]
  },
  {
    day: 10,
    title: "Working with Documents, PDFs & Spreadsheets",
    section: "Everyday Work",
    lesson: [
      { heading: "Your files are the workspace", body: "Most knowledge work is really file work — reports, spreadsheets, PDFs, notes, exports. Claude Code lives right where those files are, so instead of opening five apps and copy-pasting between them, you point it at a folder and describe the outcome you want: 'pull the totals out of these invoices,' 'turn this messy export into a clean table,' 'summarize everything in /research into one page.'" },
      { heading: "Reading PDFs, images, and docs", body: "Type <code>@</code> and a file path — like <code>@reports/q3-budget.pdf</code> — to make Claude read that exact file before it answers. You can also drag a file into the terminal or paste an image (a screenshot of a chart, a scanned page) straight in. Claude reads the contents as context, so you can ask 'what changed between these two versions?' or 'extract the figures from page 3.'" },
      { heading: "CSV is the friendliest spreadsheet format", body: "Claude works best with spreadsheets when they're saved as <b>CSV</b> (plain-text rows and columns). From Excel or Google Sheets, just 'Save As' or 'Download as' CSV. Once it's a CSV, Claude can clean it, re-sort it, find duplicates, fill gaps, total columns, and explain anomalies — then you open the result back in your spreadsheet app." },
      { heading: "Turning messy into tidy", body: "The everyday superpower is cleanup: inconsistent dates, stray blank rows, names typed five different ways, numbers stored as text. Describe the mess and the target — 'standardize every date to YYYY-MM-DD, drop empty rows, and flag any row missing an amount' — and Claude does the tedious pass for you, showing what it changed." },
      { heading: "Bulk operations across a folder", body: "Claude shines when the same small task repeats across many files: 'rename every file in this folder to <code>YYYY-MM-DD-client.pdf</code>,' 'add a summary line to the top of each report,' 'find every document that mentions the Q3 budget.' What would be an hour of clicking becomes one clear instruction." },
      { heading: "Always give it a way to check itself", body: "When you hand off a bulk cleanup, include a rule Claude can verify against — 'every row must have a valid date and a non-empty amount,' 'the summary must fit on one page.' That turns 'looks done' into 'provably done,' and means you're reviewing a result instead of hunting for mistakes." }
    ],
    quiz: [
      { q: "What's the friendliest format for Claude to work with a spreadsheet?", options: ["A locked .xlsx with macros", "A CSV export of the sheet", "A screenshot of the spreadsheet", "A PDF print-out"], answer: 1, explanation: "CSV is plain-text rows and columns — Claude can clean, sort, total, and de-duplicate it directly." },
      { q: "A PDF report has figures you need Claude to use. Best move?", options: ["Retype the numbers into the prompt", "Reference it with @reports/file.pdf and ask Claude to extract them", "Describe the PDF from memory", "Email the PDF to yourself first"], answer: 1, explanation: "Referencing the file with @ lets Claude read it directly and pull out the figures." },
      { q: "You're about to let Claude bulk-clean a 2,000-row export. What makes that safe?", options: ["Hoping it gets it right", "Giving it a checkable rule, like 'every row needs a valid date and amount'", "Doing it one row at a time yourself", "Turning off permissions"], answer: 1, explanation: "A verifiable rule turns 'looks done' into 'provably done' and keeps you reviewing, not hunting." }
    ],
    challenge: [
      { text: "Reference a real PDF or document with <code>@path/to/file</code> and ask Claude to summarize it.", link: DOC + "common-workflows" },
      { text: "Export a messy spreadsheet to CSV and ask Claude to clean it (standardize dates, drop blanks).", link: DOC + "common-workflows" },
      { text: "Ask Claude to find every file in a folder that mentions a specific topic.", link: DOC + "common-workflows" },
      { text: "<b>Project 2 &mdash; day 4:</b> point your helper at a real document, PDF, or spreadsheet &mdash; clean it or extract its key figures &mdash; and give Claude a checkable rule (e.g. 'every row has a valid date') so the result is verifiable.", link: DOC + "common-workflows", capstone: true }
    ]
  },
  {
    day: 11,
    title: "Connecting Your Everyday Apps",
    section: "Everyday Work",
    lesson: [
      { heading: "Plug Claude into the tools you already use", body: "So far Claude has worked with files on your computer. <b>MCP</b> (Model Context Protocol) is the open standard that lets it also reach the apps where your work actually lives — Google Drive, Notion, Slack, your calendar, email, ticketing systems, and many more. It's the difference between Claude working with your files and Claude working across your whole day." },
      { heading: "Why this is the payoff for an operator", body: "Once connected, Claude can pull live information and take action where it belongs: 'summarize the new docs added to our Drive folder this week,' 'pull my unread messages and draft replies,' 'find the open items assigned to me and list them.' No more copy-pasting between tabs to give Claude what it needs." },
      { heading: "Three scopes (who can see the connection)", body: "<b>Local</b> (default, saved in <code>~/.claude.json</code>, private to you on this project), <b>Project</b> (<code>.mcp.json</code>, shared with the team via git so everyone gets the same connections), and <b>User</b> (applies across all your own projects, private). If the same app is configured in more than one place, Local wins." },
      { heading: "How connections are made (transports)", body: "Most everyday apps connect over <b>HTTP</b> — the recommended option for an online service like Drive or Notion. <b>Stdio</b> is for a tool running as a program directly on your own machine. (There's also WebSocket, and an older SSE option being retired — you'll rarely touch those.)" },
      { heading: "Adding one (or just asking IT)", body: "A connection is added with <code>claude mcp add --transport http &lt;name&gt; &lt;url&gt;</code>; adding <code>--scope project</code> writes it to <code>.mcp.json</code> so your whole team shares it. <code>claude mcp list</code> shows what's configured. In practice, your team lead or IT often sets these up once and shares the <code>.mcp.json</code>, so everyone is connected without doing the setup themselves." },
      { heading: "Checking and signing in", body: "Type <code>/mcp</code> while working to see which apps are connected and to handle any sign-in (most services pop up a normal login the first time). It's also where you confirm a connection is healthy if something isn't responding." }
    ],
    quiz: [
      { q: "What does connecting an app via MCP let Claude do?", options: ["Make Claude run faster", "Reach apps like Drive, Notion, Slack, and your calendar to pull info and take action", "Replace your CLAUDE.md", "Only read local files"], answer: 1, explanation: "MCP connects Claude to outside services so it can work where your information actually lives." },
      { q: "You want your whole team to share the same app connections. Which scope?", options: ["Local (~/.claude.json)", "Project (.mcp.json, shared via git)", "User scope", "It can't be shared"], answer: 1, explanation: "Project scope writes to .mcp.json, which is committed so every teammate gets the same connections." },
      { q: "Which in-session command shows connected apps and handles sign-in?", options: ["/permissions", "/mcp", "/context", "/agents"], answer: 1, explanation: "/mcp shows connection status and walks you through any authentication." }
    ],
    challenge: [
      { text: "Run <code>/mcp</code> (or <code>claude mcp list</code>) to see which apps are already connected for you.", link: DOC + "mcp" },
      { text: "Read about one connector you'd actually use day-to-day (e.g. Google Drive, Notion, or Slack).", link: DOC + "mcp" },
      { text: "If you have one connected, ask Claude to do a real task with it (e.g. 'summarize the latest doc in this folder').", link: DOC + "mcp" },
      { text: "<b>Project 2 &mdash; day 5:</b> connect one everyday app to Claude (or ask IT which is available) so your helper can pull real data in or post a result out &mdash; then have Claude do one real task through the connection.", link: DOC + "mcp", capstone: true }
    ]
  },
  {
    day: 12,
    title: "Keyboard Shortcuts & Productivity",
    section: "Productivity",
    lesson: [
      { heading: "A few keys that save a lot of time", body: "You don't need to memorize a hundred shortcuts — a small core handful covers almost everything and quickly becomes muscle memory. Learning them is the difference between fighting the tool and flowing with it." },
      { heading: "The core five", body: "<code>Esc</code> stops Claude mid-action; <code>Esc Esc</code> opens the rewind menu; <code>Shift+Tab</code> cycles permission modes; <code>Tab</code> completes commands and arguments as you type; and <code>&uarr;</code> recalls your previous prompts." },
      { heading: "Esc is your safety brake", body: "If you see Claude doing something you didn't intend, hit <code>Esc</code> immediately. It cancels the current action <b>without</b> throwing away your conversation — far better than closing the terminal and losing everything." },
      { heading: "Esc Esc to travel back", body: "Pressing <code>Esc</code> twice opens the rewind menu, letting you restore an earlier checkpoint in the session. It's the 'undo' for the whole conversation, not just the last file." },
      { heading: "Make the keys yours", body: "Edit <code>~/.claude/keybindings.json</code> to rebind keys across all your projects — add chord bindings (like <code>Ctrl+K Ctrl+M</code>) or change which key submits. Prefer Vi-style editing? Set <code>terminalMode: vim</code>." },
      { heading: "Inside your editor", body: "The VS Code and JetBrains integrations have their own shortcut schemes, and Claude in Chrome has browser shortcuts — so the muscle memory carries over wherever you work." }
    ],
    quiz: [
      { q: "A long command is running and it's wrong. Stop it without losing history:", options: ["Close the terminal", "Press Esc", "Run /stop", "Wait, then /clear"], answer: 1, explanation: "Esc cancels immediately and preserves the conversation." },
      { q: "Which file customizes keyboard shortcuts across all projects?", options: [".claude/settings.json", "~/.claude/keybindings.json", ".claude/keybindings.json", "~/.claude/settings.json"], answer: 1, explanation: "~/.claude/keybindings.json holds your global keybindings." },
      { q: "What does Esc Esc do?", options: ["Quit Claude Code", "Open the rewind menu", "Clear context", "Switch model"], answer: 1, explanation: "Esc Esc opens rewind so you can restore an earlier checkpoint." }
    ],
    challenge: [
      { text: "Practice <code>Tab</code> completion on a slash command.", link: DOC + "interactive-mode" },
      { text: "Press <code>↑</code> to recall a previous prompt.", link: DOC + "interactive-mode" },
      { text: "Open <code>~/.claude/keybindings.json</code> and read what's rebindable (the /keybindings-help skill can guide you).", link: DOC + "keybindings" },
      { text: "<b>Project 2 finale 🎉:</b> add your helper's finishing touches fast, using mostly keyboard shortcuts — <code>Tab</code> to complete, <code>↑</code> to recall, <code>Shift+Tab</code> for modes — then run it end to end on real work. Your helper is done!", link: DOC + "interactive-mode", capstone: true }
    ]
  },
  {
    day: 13,
    title: "Permission Modes in Depth",
    section: "Best Practices",
    lesson: [
      { heading: "Choose how much it checks with you", body: "Permission modes let you dial the friction up or down to match the task. Doing something delicate? Keep it cautious. Cranking through safe, repetitive edits? Loosen it up. The art is matching the mode to the risk." },
      { heading: "Default mode, with precise allowlists", body: "Default mode prompts the first time it uses each tool, then auto-approves that tool for the rest of the session. The precise approach for 'auto-approve the conversion script I run constantly but still ask before deleting files' is default mode <b>plus</b> an allow rule in settings.json like <code>Bash(python convert.py *)</code> — that one command stops prompting while everything risky still does." },
      { heading: "Auto-accept edits", body: "This mode auto-approves file edits and <b>safe</b> housekeeping commands — <code>mkdir</code>, <code>touch</code>, <code>mv</code>, <code>cp</code> — while still stopping to ask about genuinely risky things like deleting files or downloading from the internet. Great for a flurry of routine changes, like cleaning and renaming a folder of reports." },
      { heading: "Plan mode (read-only)", body: "When you want to explore with <b>zero</b> chance of accidental changes, plan mode is the answer: Claude can read files and run read-only commands (like listing a folder or searching its contents) but cannot edit anything or run side-effecting commands." },
      { heading: "Auto mode (for longer unattended runs)", body: "A research-preview mode that uses a background classifier to auto-approve routine work while blocking scope creep and high-risk actions. It's aimed at longer stretches where you can't sit and approve every step." }
    ],
    quiz: [
      { q: "You want a script you run constantly auto-approved, but still be asked before files are deleted. Best setup?", options: ["Default mode + an allowlist rule in settings.json", "Auto-accept edits mode", "Plan mode", "Auto mode"], answer: 0, explanation: "Default mode plus an allow rule like Bash(python convert.py *) auto-approves that one command while everything risky still prompts." },
      { q: "Best mode to explore a folder of files with zero risk of changes?", options: ["Default", "Auto-accept edits", "Plan mode", "Auto mode"], answer: 2, explanation: "Plan mode is read-only — read files and run safe commands, no edits." },
      { q: "Auto-accept edits will auto-approve which of these without asking?", options: ["Downloading a file from the internet", "Deleting files", "Making and moving folders (mkdir / mv / cp)", "Sending an email"], answer: 2, explanation: "It auto-approves file edits and safe housekeeping commands, still prompting for risky ones." }
    ],
    challenge: [
      { text: "Enter plan mode (<code>Shift+Tab</code> to it) and try to make Claude edit — watch it stay read-only.", link: DOC + "permission-modes" },
      { text: "Add two allow rules with <code>/permissions</code> for commands you trust.", link: DOC + "permissions" },
      { text: "Switch to auto-accept edits for a small safe task and feel the difference.", link: DOC + "permission-modes" },
      { text: "<b>Project 3 kickoff &mdash; Automate &amp; ship it:</b> pick a routine you want to automate end to end. Explore it in plan mode first (no edits), then switch to auto-accept edits to implement a small, safe first change.", link: DOC + "permission-modes", capstone: true }
    ]
  },
  {
    day: 14,
    title: "Effective Prompting & Scoping",
    section: "Best Practices",
    lesson: [
      { heading: "The real skill is writing a good brief", body: "Claude is only as good as the instructions you give it — and this is precisely where operators have an edge over the tool itself. A clear, specific request beats a vague one every time, and learning to write them is the highest-leverage habit in this whole course." },
      { heading: "Be specific", body: "Instead of 'clean up this report,' say what's wrong, where to look, and what 'done' means: 'in <code>@reports/q3.csv</code>, the dates are in three different formats and some amounts are blank — standardize every date to YYYY-MM-DD and flag any row missing an amount.' The more precise the brief, the better the result." },
      { heading: "Tell it how to check itself", body: "Give Claude a way to know it succeeded — a rule every row must satisfy, an example of the right output, a total that should match, or a length limit. Without that, Claude stops when the work merely 'looks done' and <b>you</b> become the one who has to catch the mistakes." },
      { heading: "Explore before building", body: "When you're pointing Claude at a folder or document you don't know well, don't let it dive straight in. Have it explore and propose a plan first (plan mode) — reviewing the plan catches wrong turns before any work happens." },
      { heading: "Point at the right things", body: "Type <code>@</code> and a path — like <code>@reports/q3-summary.md</code> — to make Claude read that exact file before it responds. You can also paste images, screenshots, and PDFs straight in; Claude reads them as context." },
      { heading: "Break big jobs into steps", body: "For anything complex, lay it out as numbered steps. Small, ordered pieces are easier for Claude to get right — and easier for you to verify — than one giant request." }
    ],
    quiz: [
      { q: "Which request most reliably produces the cleaned report you want?", options: ["Clean up this spreadsheet", "In @reports/q3.csv, standardize every date to YYYY-MM-DD, drop blank rows, and flag any row missing an amount", "Make the report look nice", "Fix the data"], answer: 1, explanation: "Naming the file, the exact changes, and a checkable rule gives Claude a goal and verification criteria." },
      { q: "Claude will work in a folder of files you don't know well. Best first step?", options: ["Let it start changing things immediately", "Have it explore and propose a plan first (plan mode)", "Give an incomplete description", "Over-specify everything"], answer: 1, explanation: "Explore in plan mode, review the plan, then proceed — better results on unfamiliar material." },
      { q: "What does typing @reports/q3-summary.md in a prompt do?", options: ["Nothing special", "Tells Claude to read that file before responding", "Deletes the file", "Emails the file"], answer: 1, explanation: "@path references a file so Claude reads it as context first." }
    ],
    challenge: [
      { text: "Rewrite a vague request you'd normally type into a specific one with a file reference and a 'done' condition.", link: DOC + "best-practices" },
      { text: "Give Claude an explicit checkable rule to satisfy (e.g. 'every row has a valid date') and have it verify against it.", link: DOC + "best-practices" },
      { text: "Use <code>@file</code> to point Claude at a specific document or spreadsheet before asking a question.", link: DOC + "common-workflows" },
      { text: "<b>Project 3 &mdash; day 2:</b> write one tightly-scoped prompt for your automation's next step — what's needed, which file, and a 'done' rule — and let Claude satisfy it.", link: DOC + "best-practices", capstone: true }
    ]
  },
  {
    day: 15,
    title: "Context Management & Compaction",
    section: "Best Practices",
    lesson: [
      { heading: "Context is the resource to protect", body: "Everything Claude is juggling — your conversation, the files it's read, command outputs, its memory — lives in a limited working space called context. As it fills up, quality quietly drops, so managing it is a real skill, not an afterthought." },
      { heading: "It tidies up on its own", body: "When space runs low, Claude auto-compacts: first it clears out old tool outputs, then, if needed, it summarizes earlier conversation. This happens automatically to keep things running — but you can steer it." },
      { heading: "See what's using the space", body: "Run <code>/context</code> mid-session to see exactly what's taking up room. It's the diagnostic that tells you whether to trim, summarize, or just start fresh." },
      { heading: "Shape it deliberately", body: "<code>/compact focus on the report formatting</code> condenses history while protecting the details you name. And when you switch to something completely unrelated, <code>/clear</code> resets the whole context so old work can't interfere." },
      { heading: "When MCP tools eat your space", body: "If <code>/context</code> shows a pile of MCP tool definitions hogging room even though you haven't used them, tool search is likely turned off. Tool search defers those tool schemas until they're actually needed, instead of loading them all upfront." },
      { heading: "Nothing is ever lost", body: "Even after auto-compaction, your full history is saved locally — so you can still <code>/rewind</code> to any earlier point. Compaction frees working space; it doesn't erase your trail." }
    ],
    quiz: [
      { q: "Context is full and you're about to start a totally different task. Do what?", options: ["Keep going; auto-compaction handles it", "Close the terminal", "/clear to reset context", "/compact only"], answer: 2, explanation: "/clear resets context between unrelated tasks so old work doesn't interfere." },
      { q: "/context shows MCP tool definitions eating space though you haven't used them. What's likely off?", options: ["Auto memory", "Tool search (MCP tools deferred by default)", "Hooks", "Skills"], answer: 1, explanation: "Tool search defers MCP tool schemas until needed; if disabled, they all load upfront." },
      { q: "After auto-compaction, can you still rewind to an earlier point?", options: ["No, it's gone", "Yes — history is saved locally", "Only within 5 minutes", "Only if you ran /compact"], answer: 1, explanation: "Checkpoints persist locally, so /rewind still works after compaction." }
    ],
    challenge: [
      { text: "Run <code>/context</code> mid-session and identify the biggest consumers.", link: DOC + "slash-commands" },
      { text: "Try <code>/compact focus on …</code> with a focus relevant to your task.", link: DOC + "slash-commands" },
      { text: "Practice <code>/clear</code> when switching to an unrelated task and feel the speed-up.", link: DOC + "slash-commands" },
      { text: "<b>Project 3 &mdash; day 3:</b> during a long building session, run <code>/context</code>, then <code>/compact focus on …</code> to keep Claude sharp and finish the next piece without starting over.", link: DOC + "slash-commands", capstone: true }
    ]
  },
  {
    day: 16,
    title: "Collaboration & Team Best Practices",
    section: "Best Practices",
    lesson: [
      { heading: "One shared setup for the whole team", body: "Everything you've configured — project notes, rules, automations — can be shared so your whole team works from the same playbook. That consistency is what turns Claude Code from a personal tool into a team capability." },
      { heading: "Share the right things via git", body: "Commit <code>CLAUDE.md</code> and your shared <b>skills</b> so everyone gets the same setup automatically. A workflow the whole team should follow belongs in the committed <code>./CLAUDE.md</code> — it loads for every teammate on the project." },
      { heading: "Keep personal things personal", body: "Machine-specific or private preferences don't belong in shared files. Put them in <code>CLAUDE.local.md</code> (gitignored) or your own <code>~/.claude/settings.json</code> so they apply only to you." },
      { heading: "Work in parallel without collisions", body: "Each teammate runs their own session on their own branch (or git worktree), so two people's edits never step on each other. Everyone moves fast independently." },
      { heading: "Review with fresh eyes", body: "The strongest quality check is to have one session do the work and a <b>separate, fresh</b> context review it — run <code>/code-review</code> on your recent changes. A reviewer without the original assumptions catches far more, whether it's reviewing a document or a spreadsheet cleanup." },
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
      { text: "<b>Project 3 &mdash; day 4:</b> get your automation ready to share &mdash; commit your <code>CLAUDE.md</code> and config to git, then run <code>/code-review</code> on your latest changes in a fresh session.", link: DOC + "best-practices", capstone: true }
    ]
  },
  {
    day: 17,
    title: "Plan Mode & the Exploration Workflow",
    section: "Workflows",
    lesson: [
      { heading: "Measure twice, cut once", body: "Plan mode is the discipline of looking before leaping: Claude studies the problem and proposes an approach <b>before</b> touching anything. For changes of any real size, the few minutes of planning save far more in avoided wrong turns." },
      { heading: "How to enter it", body: "Press <code>Shift+Tab</code> until you reach plan mode (or set <code>defaultMode: plan</code> to start there). In this mode Claude can read files and run read-only commands, but it cannot edit or run anything that changes your system." },
      { heading: "The four phases", body: "The workflow is: <b>explore</b> in plan mode &rarr; ask Claude for a detailed <b>plan</b> &rarr; exit plan mode and <b>implement</b> &rarr; let Claude <b>verify</b> by running tests or a build. Each step builds on the last." },
      { heading: "Edit the plan yourself", body: "The plan isn't take-it-or-leave-it. Press <code>Ctrl+G</code> to open it in your text editor, adjust anything you'd do differently, and then let Claude proceed from your revised version." },
      { heading: "When it's worth it (and when it isn't)", body: "Reach for plan mode on jobs that touch many files or unfamiliar territory — like reorganizing a reports folder where the file names, an index, and a summary all have to stay in sync. Skip it for trivial work: fixing one typo or renaming a single file is pure overhead to plan." }
    ],
    quiz: [
      { q: "Reorganizing a reports folder touches file names, an index, and a summary at once. Recommended workflow?", options: ["Start changing things directly in default mode", "Plan mode to explore + plan, then proceed", "Run /init for a plan", "Do it one file at a time by hand"], answer: 1, explanation: "Explore and plan in plan mode, then proceed — best when a change touches many files." },
      { q: "How do you open a plan in your text editor before Claude proceeds?", options: ["/edit", "Ctrl+E", "Ctrl+G", "/open-plan"], answer: 2, explanation: "Ctrl+G opens the plan in your editor for direct edits." },
      { q: "Plan mode is poor value for which task?", options: ["A change across many files", "Unfamiliar material you don't know well", "Fixing a single typo", "Restructuring a whole folder"], answer: 2, explanation: "Planning is overhead for trivial, single-file changes." }
    ],
    challenge: [
      { text: "Enter plan mode and have Claude produce a plan for a small multi-step change.", link: DOC + "permission-modes" },
      { text: "Press <code>Ctrl+G</code> to open and tweak the plan in your editor.", link: DOC + "interactive-mode" },
      { text: "Exit plan mode, let Claude implement, and confirm it verifies with tests or a build.", link: DOC + "common-workflows" },
      { text: "<b>Project 3 &mdash; day 5:</b> pick a finishing feature that touches several files, have Claude plan it in plan mode, tweak the plan, then implement and verify.", link: DOC + "common-workflows", capstone: true }
    ]
  },
  {
    day: 18,
    title: "Running Claude Autonomously",
    section: "Workflows",
    lesson: [
      { heading: "From assistant to automation", body: "This is where everything pays off. Up to now you've worked <b>with</b> Claude in a session; today you learn to set it loose on a task with no session at all — so routine work can run on a schedule, in a script, or as part of a pipeline, without you sitting there." },
      { heading: "One-off mode: claude -p", body: "<code>claude -p \"your task\"</code> runs a single task and exits — no interactive session. It's built for scripts and scheduled jobs. For example, a scheduled <code>claude -p \"summarize yesterday's notes in /journal and flag anything urgent\"</code> could land a morning brief in your inbox before you sit down, every day, on its own." },
      { heading: "Get results a program can read", body: "When a script or spreadsheet needs to act on Claude's output, add <code>--output-format json</code> (or <code>stream-json</code>). Instead of prose, you get structured data a program can parse — essential when running the same task across many documents at once." },
      { heading: "Parallel and background work", body: "Use git worktrees so several isolated runs don't collide. Within a session, <code>/background</code> detaches it to keep running while you do other things — check on it later with <code>/tasks</code> or reconnect." },
      { heading: "Permissions when no one's watching", body: "For unattended runs, <code>--permission-mode auto</code> leans on background safety checks. <code>--permission-mode bypassPermissions</code> skips prompts entirely (except for root/home deletions) and should only ever be used in isolated, throwaway environments." },
      { heading: "You made it — now keep one habit", body: "Eighteen days done. The goal was never to memorize everything, but to build real fluency — and you have. Pick the one feature that earns its place in your daily workflow and make it stick. That's graduation." }
    ],
    quiz: [
      { q: "You want a daily brief that summarizes yesterday's notes automatically. Right approach?", options: ["Start an interactive session each morning and wait", "A scheduled claude -p \"summarize yesterday's notes and flag anything urgent\"", "Auto mode in a terminal", "Do it by hand each day"], answer: 1, explanation: "Non-interactive -p mode is built for scheduled jobs, scripts, and automation." },
      { q: "Running the same task non-interactively over 50 documents, you want structured output. Add:", options: ["--verbose", "--output-format json", "--streaming", "--results"], answer: 1, explanation: "--output-format json (or stream-json) makes results parseable in scripts." },
      { q: "How do you keep a session running after detaching your terminal?", options: ["/clear", "/background, then check /tasks", "/resume", "Close the terminal"], answer: 1, explanation: "/background detaches the session; /tasks lets you check on it." }
    ],
    challenge: [
      { text: "Run a real one-off task with <code>claude -p \"…\"</code> and observe it finish without a session.", link: DOC + "headless" },
      { text: "Add <code>--output-format json</code> and inspect the structured result.", link: DOC + "cli-reference" },
      { text: "Reflect: you've finished all 18 days — pick one feature to make part of your daily workflow.", link: DOC + "best-practices" },
      { text: "<b>Project 3 finale 🎉🎓:</b> automate one real task with <code>claude -p \"…\"</code> (e.g. generate a summary or run a routine check), then choose the Claude Code habit you'll keep using. All three projects shipped &mdash; congratulations!", link: DOC + "headless", capstone: true }
    ]
  }
];

/* Four multi-day Capstone projects. Each spans a block of days; the final day of
 * each block is a celebration. app.js maps a day to its project with projectForDay(n).
 * Edit these freely — change the themes, taglines, or block lengths (just keep the
 * start/end day numbers contiguous and within 1..18). */
window.PROJECTS = [
  { id: 1, emoji: "📘", title: "Learn something new", tagline: "Pick a subject you're curious about and have Claude build you a personal learning kit.", start: 1,  end: 6  },
  { id: 2, emoji: "🛠️", title: "Build a work helper", tagline: "Create a small tool — connected to your real apps and data — that takes a repetitive task off your plate.", start: 7,  end: 12 },
  { id: 3, emoji: "🚀", title: "Automate & ship it", tagline: "Plan it, automate it end to end, put it in git, and hand it to your team.", start: 13, end: 18 }
];
