/* Claude Code Quest — curriculum data.
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
      { text: "<b>Capstone kickoff:</b> pick a small, real project you'd actually like (a CLI tool, a webpage, a script you keep meaning to write). Make an empty folder, run <code>claude</code> inside it, and ask Claude to scaffold a starter file.", link: DOC + "quickstart", capstone: true }
    ]
  },
  {
    day: 2,
    title: "The Agentic Loop & How Claude Works",
    section: "Getting Started",
    lesson: [
      { heading: "Gather → Act → Verify", body: "Claude works in a loop: gather context (read files, search code), take action (edit files, run commands), then verify results (run tests, compare output). These phases blend and repeat." },
      { heading: "You're part of the loop", body: "Press <code>Esc</code> to stop Claude mid-action, type a correction to redirect it, or <code>Esc Esc</code> to rewind to an earlier checkpoint. You never lose the conversation by interrupting." },
      { heading: "What fills your context", body: "Conversation history, file contents, command outputs, CLAUDE.md, auto memory, loaded skills, and system instructions. As it fills, Claude compacts older tool outputs and may summarize history." }
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
      { text: "<b>Capstone:</b> describe the first real feature of your project in plain English and let Claude build it end-to-end — watch the gather → act → verify loop run on your own code.", link: DOC + "common-workflows", capstone: true }
    ]
  },
  {
    day: 3,
    title: "Reading, Editing & Permissions",
    section: "Core Interaction",
    lesson: [
      { heading: "Edits are safe by default", body: "In default mode Claude asks before editing a file, and snapshots it first so you can revert with <code>/rewind</code> or by pressing <code>Esc</code> twice." },
      { heading: "Cycle modes with Shift+Tab", body: "Default mode prompts for each tool. Auto-accept edits auto-approves file edits and safe filesystem commands (mkdir, mv, cp). Plan mode is read-only exploration. Press <code>Shift+Tab</code> to cycle." },
      { heading: "Allow / ask / deny rules", body: "Permission rules use allow/ask/deny precedence — deny always wins and removes the tool from Claude's context. Allowlist routine commands like <code>npm test</code> so Claude stops asking." }
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
      { text: "<b>Capstone:</b> have Claude make a real edit to your project, review the diff before approving, then add an allow-rule for the command you run most (your build/test/run command).", link: DOC + "permissions", capstone: true }
    ]
  },
  {
    day: 4,
    title: "Essential Slash Commands (Part 1)",
    section: "Core Interaction",
    lesson: [
      { heading: "Type / to see them all", body: "Slash commands control Claude within a session and are case-insensitive. <code>/help</code> lists them." },
      { heading: "Navigation & context", body: "<code>/resume</code> reopens a previous session, <code>/clear</code> resets context between unrelated tasks, and <code>/memory</code> views and edits CLAUDE.md and auto memory files." },
      { heading: "Model, effort, permissions", body: "<code>/model</code> switches models (sonnet, opus, haiku), <code>/effort</code> trades reasoning depth against cost, and <code>/permissions</code> manages tool approval rules." }
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
      { text: "<b>Capstone:</b> while working on your project, run <code>/clear</code> between two unrelated changes so each one starts from clean context.", link: DOC + "slash-commands", capstone: true }
    ]
  },
  {
    day: 5,
    title: "Slash Commands (Part 2) & Planning",
    section: "Core Interaction",
    lesson: [
      { heading: "Plan & shape context", body: "<code>/plan</code> switches to read-only plan mode, <code>/compact</code> summarizes context (e.g. <code>/compact focus on API changes</code>), and <code>/context</code> shows what's consuming space." },
      { heading: "Session management", body: "<code>/rename</code> names a session for easy resuming, and <code>/branch</code> (a.k.a. <code>/fork-session</code>) copies your history into a new independent session." },
      { heading: "Coordination & goals", body: "<code>/agents</code> manages subagents, <code>/background</code> detaches the session to run in the background, <code>/code-review</code> reviews your diff in a fresh context, and <code>/goal</code> sets a completion condition Claude re-checks every turn." }
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
      { text: "<b>Capstone:</b> set a <code>/goal</code> for your project's next feature (e.g. 'the page loads with no console errors') and let Claude iterate until it's met.", link: DOC + "goal", capstone: true }
    ]
  },
  {
    day: 6,
    title: "CLAUDE.md — Project Memory",
    section: "Persistent Context",
    lesson: [
      { heading: "What it is", body: "CLAUDE.md is a markdown file Claude reads at the start of every session: build commands, coding standards, architecture notes, common workflows. You write it; Claude treats it as advisory context." },
      { heading: "Scopes", body: "Project (<code>./CLAUDE.md</code> or <code>./.claude/CLAUDE.md</code>, shared via git), User (<code>~/.claude/CLAUDE.md</code>, all your projects), Local (<code>./CLAUDE.local.md</code>, personal — gitignore it), and org-wide managed policy." },
      { heading: "Loading & imports", body: "Files auto-load by walking up the directory tree; nested CLAUDE.md loads on demand when Claude reads files there. Use <code>@path/to/file</code> to import other files at session start." }
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
      { text: "<b>Capstone:</b> write a real <code>CLAUDE.md</code> for your project — how to run it, its structure, and one coding standard — then start a fresh session and confirm Claude already knows them.", link: DOC + "memory", capstone: true }
    ]
  },
  {
    day: 7,
    title: "Auto Memory — Claude's Own Notes",
    section: "Persistent Context",
    lesson: [
      { heading: "Self-written memory", body: "Auto memory lets Claude save learnings across sessions without you writing anything — build commands, debugging insights, architecture patterns, your code-style habits. It only saves what's worth remembering." },
      { heading: "Where it lives", body: "Each project gets <code>~/.claude/projects/&lt;project&gt;/memory/</code>. All worktrees of one git repo share a memory directory; outside a repo, the project root is used." },
      { heading: "What loads", body: "Only the first 200 lines (or 25KB) of <code>MEMORY.md</code> load at session start. Claude keeps it concise by moving detail into topic files that load on demand. Toggle with <code>/memory</code> or <code>autoMemoryEnabled: false</code>." }
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
      { text: "<b>Capstone:</b> do a real work session on your project, then run <code>/memory</code> and see what Claude chose to remember about it.", link: DOC + "memory", capstone: true }
    ]
  },
  {
    day: 8,
    title: "Skills — Reusable Workflows",
    section: "Advanced Features",
    lesson: [
      { heading: "What skills are", body: "Skills are directories with a <code>SKILL.md</code> file under <code>.claude/skills/</code> that extend Claude's knowledge and package reusable workflows. Claude applies them automatically when relevant, or you invoke <code>/skill-name</code>." },
      { heading: "Load on demand", body: "Unlike CLAUDE.md (every session), skills load only when needed — so long reference material costs no context until used." },
      { heading: "Commands are skills too", body: "<code>.claude/commands/deploy.md</code> and <code>.claude/skills/deploy/SKILL.md</code> both create <code>/deploy</code>. Set <code>disable-model-invocation: true</code> in frontmatter to make a skill manual-only." }
    ],
    quiz: [
      { q: "You keep pasting the same bug-fix procedure into chat. Best fix?", options: ["Add it to CLAUDE.md", "Create a skill at .claude/skills/fix-bug/SKILL.md", "Keep pasting it", "Put it in auto memory"], answer: 1, explanation: "Skills are made for repeatable workflows — Claude applies them or you run /fix-bug." },
      { q: "Which frontmatter field stops a skill from auto-triggering?", options: ["manual: true", "disable-model-invocation: true", "invoke-only: true", "requires-approval: true"], answer: 1, explanation: "disable-model-invocation: true makes it run only when you invoke it." },
      { q: "A key benefit of skills over CLAUDE.md is that they…", options: ["Load every session", "Load on demand, saving context", "Can't be invoked manually", "Are stored in git history only"], answer: 1, explanation: "On-demand loading keeps long reference material out of context until needed." }
    ],
    challenge: [
      { text: "Type <code>/</code> and look for skills already available in your setup.", link: DOC + "skills" },
      { text: "Create a tiny skill at <code>.claude/skills/hello/SKILL.md</code> with a name and description.", link: DOC + "skills" },
      { text: "Invoke it with <code>/hello</code> and confirm Claude follows it.", link: DOC + "skills" },
      { text: "<b>Capstone:</b> turn a repetitive step in your project (e.g. 'add a new page/component the standard way') into a skill, then invoke it on real work.", link: DOC + "skills", capstone: true }
    ]
  },
  {
    day: 9,
    title: "Subagents — Specialized Assistants",
    section: "Advanced Features",
    lesson: [
      { heading: "Isolated helpers", body: "Subagents run in their own context with their own system prompt, tool access, and permissions. Claude delegates a matching task, the subagent works independently and returns a summary." },
      { heading: "They protect your context", body: "Because each subagent has its own context window, heavy research or exploration doesn't bloat your main conversation." },
      { heading: "Define your own", body: "Add markdown files in <code>.claude/agents/</code> with name, description, a <code>tools</code> field (the subset they may use), and a custom system prompt. Built-ins include Explore, Plan, and others." }
    ],
    quiz: [
      { q: "You need heavy codebase research that would fill your main context. Best approach?", options: ["Do it inline and /compact later", "Use a subagent so research stays isolated", "Open a manual second session", "Skip the research"], answer: 1, explanation: "Subagents run in isolated contexts, keeping your main conversation clean." },
      { q: "Where do you define a custom 'security-auditor' subagent limited to Read and Grep?", options: [".claude/skills/ with restrict-tools", ".claude/agents/ with a tools field", "CLAUDE.md with subagent-config", "Only via /agents interactively"], answer: 1, explanation: "Custom subagents live in .claude/agents/; the tools field limits their tools." },
      { q: "When a subagent finishes, it returns…", options: ["Its full raw transcript into your context", "A summary of its work", "Nothing — you must ask", "A new session you must resume"], answer: 1, explanation: "Subagents report back a concise summary, protecting your main context." }
    ],
    challenge: [
      { text: "Ask Claude to use the Explore subagent to map an unfamiliar part of a codebase.", link: DOC + "sub-agents" },
      { text: "Notice how the subagent's searching doesn't flood your main conversation.", link: DOC + "sub-agents" },
      { text: "Sketch a custom subagent file in <code>.claude/agents/</code> with a restricted <code>tools</code> list.", link: DOC + "sub-agents" },
      { text: "<b>Capstone:</b> ask a subagent to explore your growing project and summarize how its parts fit together.", link: DOC + "sub-agents", capstone: true }
    ]
  },
  {
    day: 10,
    title: "Hooks — Deterministic Automation",
    section: "Advanced Features",
    lesson: [
      { heading: "Always-run shell commands", body: "Hooks are shell commands that fire at lifecycle events — unlike advisory CLAUDE.md, hooks are deterministic and always run. Events include PreToolUse, FileEdited (post-edit), CommandFinished, and Stop." },
      { heading: "Where they live", body: "Configure hooks in <code>.claude/settings.json</code> under a <code>hooks</code> block. They can lint, format, validate, protect files, or notify external systems." },
      { heading: "Blocking actions", body: "A PreToolUse hook can block a tool call: exit code 2 blocks before permission evaluation; 0 allows; JSON output can deny or require a prompt." }
    ],
    quiz: [
      { q: "You want to run the linter after every file edit. Where/how?", options: ["CLAUDE.md directive", ".claude/settings.json FileEdited hook", "A permission rule", "A skill"], answer: 1, explanation: "Hooks in settings.json run shell commands at lifecycle events like FileEdited." },
      { q: "Which exit code in a PreToolUse hook blocks the tool call?", options: ["0", "1", "2", "-1"], answer: 2, explanation: "Exit code 2 blocks the call before permission rules are evaluated." },
      { q: "How do hooks differ from CLAUDE.md instructions?", options: ["Hooks are advisory too", "Hooks are deterministic and always run", "Hooks only run on startup", "Hooks can't run shell commands"], answer: 1, explanation: "CLAUDE.md is advisory; hooks always execute at their event." }
    ],
    challenge: [
      { text: "Open or create <code>.claude/settings.json</code> and look at the <code>hooks</code> structure.", link: DOC + "hooks" },
      { text: "Add a simple post-edit hook that echoes a message or runs your formatter.", link: DOC + "hooks-guide" },
      { text: "Trigger an edit and confirm the hook fires.", link: DOC + "hooks-guide" },
      { text: "<b>Capstone:</b> add a hook that auto-formats (or lints) your project's files after each edit, then make an edit and watch it run.", link: DOC + "hooks-guide", capstone: true }
    ]
  },
  {
    day: 11,
    title: "MCP Servers — External Tools & Data",
    section: "Advanced Features",
    lesson: [
      { heading: "An open integration standard", body: "MCP (Model Context Protocol) lets Claude reach external tools, databases, and APIs — GitHub, Sentry, PostgreSQL, Figma, Notion, Slack, and more." },
      { heading: "Scopes", body: "Local (default, <code>~/.claude.json</code>, this project, private), Project (<code>.mcp.json</code>, shared via git), and User (all your projects, private). Local takes precedence if duplicated." },
      { heading: "Transports & commands", body: "HTTP (remote, recommended), Stdio (local process), WebSocket, and deprecated SSE. Use <code>claude mcp add --transport http &lt;name&gt; &lt;url&gt;</code>, <code>claude mcp list</code>, and <code>/mcp</code> in-session to check status and authenticate." }
    ],
    quiz: [
      { q: "You connect Claude to a local database tool running as a process on your machine. Transport?", options: ["HTTP", "Stdio", "SSE", "WebSocket"], answer: 1, explanation: "Stdio servers are local processes — ideal for tools with direct system access." },
      { q: "claude mcp add --transport http github &lt;url&gt; --scope project saves config where?", options: ["~/.claude.json", ".mcp.json in project root", ".claude/settings.json", "~/.claude/mcp-config"], answer: 1, explanation: "--scope project writes to .mcp.json so the server is shared via git." },
      { q: "Which in-session command checks MCP status and lets you authenticate?", options: ["/permissions", "/mcp", "/context", "/agents"], answer: 1, explanation: "/mcp shows server status and handles authentication." }
    ],
    challenge: [
      { text: "Run <code>/mcp</code> (or <code>claude mcp list</code>) to see any servers already connected.", link: DOC + "mcp" },
      { text: "Read about one MCP server you'd find useful (e.g. GitHub or your database).", link: DOC + "mcp" },
      { text: "If you have one configured, ask Claude to use one of its tools.", link: DOC + "mcp" },
      { text: "<b>Capstone:</b> connect one MCP server that's useful to your project (e.g. GitHub or your database) and have Claude use it on real work.", link: DOC + "mcp", capstone: true }
    ]
  },
  {
    day: 12,
    title: "Keyboard Shortcuts & Productivity",
    section: "Productivity",
    lesson: [
      { heading: "Core shortcuts", body: "<code>Esc</code> stops Claude mid-action, <code>Esc Esc</code> opens the rewind menu, <code>Shift+Tab</code> cycles permission modes, <code>Tab</code> completes commands/arguments, and <code>↑</code> recalls history." },
      { heading: "Customize bindings", body: "Edit <code>~/.claude/keybindings.json</code> to rebind keys, add chord bindings (e.g. <code>Ctrl+K Ctrl+M</code>), or change the submit key." },
      { heading: "Modes & IDEs", body: "Set <code>terminalMode: vim</code> for Vi-style editing. VS Code and JetBrains integrations have their own shortcut schemes; Claude in Chrome has browser shortcuts." }
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
      { text: "<b>Capstone:</b> build your project's next feature using mostly keyboard shortcuts — <code>Tab</code> to complete, <code>↑</code> to recall, <code>Shift+Tab</code> for modes.", link: DOC + "interactive-mode", capstone: true }
    ]
  },
  {
    day: 13,
    title: "Permission Modes in Depth",
    section: "Best Practices",
    lesson: [
      { heading: "Default & auto-accept", body: "Default prompts on first use of each tool, then auto-approves it for the session. Auto-accept edits auto-approves file edits and safe filesystem commands (mkdir, touch, mv, cp) but still prompts for risky commands." },
      { heading: "Plan mode (read-only)", body: "Claude can read files and run read-only commands (ls, grep, git status) but cannot edit or run side-effecting commands — best for exploring before coding." },
      { heading: "Auto mode", body: "A research-preview mode that uses a background classifier to auto-approve routine work while blocking scope escalation and high-risk actions — useful for longer unattended runs." }
    ],
    quiz: [
      { q: "You want npm and git auto-approved but still be prompted for rm/curl. Best setup?", options: ["Default mode + allowlist rules in settings.json", "Auto-accept edits mode", "Plan mode", "Auto mode"], answer: 0, explanation: "Default mode plus allow rules like Bash(npm *) and Bash(git commit *) is the precise approach." },
      { q: "Best mode to explore code with zero risk of edits?", options: ["Default", "Auto-accept edits", "Plan mode", "Auto mode"], answer: 2, explanation: "Plan mode is read-only — read files and run safe commands, no edits." },
      { q: "Auto-accept edits will auto-approve which of these?", options: ["curl downloads", "rm -rf", "mkdir / mv / cp", "git push"], answer: 2, explanation: "It auto-approves file edits and safe filesystem commands, still prompting for risky ones." }
    ],
    challenge: [
      { text: "Enter plan mode (<code>Shift+Tab</code> to it) and try to make Claude edit — watch it stay read-only.", link: DOC + "permission-modes" },
      { text: "Add two allow rules with <code>/permissions</code> for commands you trust.", link: DOC + "permissions" },
      { text: "Switch to auto-accept edits for a small safe task and feel the difference.", link: DOC + "permission-modes" },
      { text: "<b>Capstone:</b> explore your project in plan mode first (no edits), then switch to auto-accept edits to implement a small, safe change.", link: DOC + "permission-modes", capstone: true }
    ]
  },
  {
    day: 14,
    title: "Effective Prompting & Scoping",
    section: "Best Practices",
    lesson: [
      { heading: "Be specific", body: "Instead of 'fix the bug,' say what's broken, where to look, and what done means: 'login breaks on session timeout (blank screen) — check src/auth/sessionManager.ts, write a failing test first, then fix.'" },
      { heading: "Give verification criteria", body: "Provide tests, a build command, screenshots to compare, or example cases. Without checks, Claude stops when work 'looks done' and you become the verifier." },
      { heading: "Reference & break down", body: "Use <code>@src/api/routes.ts</code> to make Claude read a file first; paste images and error text directly. Break complex work into numbered steps." }
    ],
    quiz: [
      { q: "Which prompt most reliably produces a working email validator?", options: ["Write a validateEmail function", "Write validateEmail with test cases: user@example.com→true, invalid→false, user@.com→false; run the tests", "Make the validator good", "Write email validation code"], answer: 1, explanation: "Explicit test cases give Claude a goal and verification criteria." },
      { q: "Claude will implement in a file you've never seen. Best first step?", options: ["Let it code immediately", "Explore and plan first (plan mode)", "Give an incomplete sketch", "Over-specify everything"], answer: 1, explanation: "Explore in plan mode, review the plan, then implement — better results on unfamiliar code." },
      { q: "What does typing @src/api/routes.ts in a prompt do?", options: ["Nothing special", "Tells Claude to read that file before responding", "Deletes the file", "Runs the file"], answer: 1, explanation: "@path references a file so Claude reads it as context first." }
    ],
    challenge: [
      { text: "Rewrite a vague request you'd normally type into a specific one with a file reference and a 'done' condition.", link: DOC + "best-practices" },
      { text: "Give Claude an explicit test case to satisfy and have it run the test.", link: DOC + "best-practices" },
      { text: "Use <code>@file</code> to point Claude at a specific file before asking a question.", link: DOC + "common-workflows" },
      { text: "<b>Capstone:</b> write one tightly-scoped prompt for your project's next feature — what's needed, which file, and a 'done' test — and let Claude satisfy it.", link: DOC + "best-practices", capstone: true }
    ]
  },
  {
    day: 15,
    title: "Context Management & Compaction",
    section: "Best Practices",
    lesson: [
      { heading: "Context is your scarcest resource", body: "It holds conversation, files, outputs, and memory. As it fills, model performance degrades. Claude auto-compacts by clearing old tool outputs, then summarizing history if needed." },
      { heading: "See and shape it", body: "<code>/context</code> shows what's using space. <code>/compact focus on API changes</code> prioritizes what survives. Between unrelated tasks, <code>/clear</code> resets entirely." },
      { heading: "Checkpoints survive", body: "Conversation history is saved locally, so you can <code>/rewind</code> to any earlier point even after auto-compaction." }
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
      { text: "<b>Capstone:</b> during a long building session on your project, run <code>/context</code>, then <code>/compact focus on …</code> to keep Claude sharp without starting over.", link: DOC + "slash-commands", capstone: true }
    ]
  },
  {
    day: 16,
    title: "Collaboration & Team Best Practices",
    section: "Best Practices",
    lesson: [
      { heading: "Share config via git", body: "Commit CLAUDE.md and hooks so the team shares one setup. Personal preferences go in CLAUDE.local.md (gitignored) or ~/.claude/settings.json." },
      { heading: "Parallel, isolated work", body: "Each teammate runs their own session on their own branch (or worktree) so edits don't collide." },
      { heading: "Review with fresh eyes", body: "Have one session write code and a fresh context review it — use <code>/code-review</code>. Name sessions descriptively with <code>/rename</code> and share rewind points to hand off context." }
    ],
    quiz: [
      { q: "A bug-fix workflow the whole team should follow belongs where?", options: ["~/.claude/CLAUDE.md", "./CLAUDE.md committed to git", "a skill nobody shares", "MEMORY.md"], answer: 1, explanation: "Project CLAUDE.md is shared via version control and loads for everyone on the project." },
      { q: "Best way to review freshly written code without bias?", options: ["Same session reviews itself", "A fresh session/subagent reviews the diff", "Skip review", "Only manual review"], answer: 1, explanation: "A fresh context (or /code-review) reviews without the implementer's bias." },
      { q: "Where do personal, machine-specific preferences belong?", options: ["./CLAUDE.md (committed)", "CLAUDE.local.md or ~/.claude/settings.json", "the project README", ".mcp.json"], answer: 1, explanation: "Personal settings stay local/user-scoped, not in shared project files." }
    ],
    challenge: [
      { text: "Add one team convention to your project <code>CLAUDE.md</code> and commit it.", link: DOC + "memory" },
      { text: "Run <code>/code-review</code> on a recent diff in a fresh session.", link: DOC + "slash-commands" },
      { text: "Use <code>/rename</code> to give your session a descriptive, handoff-friendly name.", link: DOC + "slash-commands" },
      { text: "<b>Capstone:</b> commit your project's <code>CLAUDE.md</code> and config to git, then run <code>/code-review</code> on your latest diff in a fresh session.", link: DOC + "best-practices", capstone: true }
    ]
  },
  {
    day: 17,
    title: "Plan Mode & the Exploration Workflow",
    section: "Workflows",
    lesson: [
      { heading: "Enter plan mode", body: "Press <code>Shift+Tab</code> until you reach plan mode (or set <code>defaultMode: plan</code>). Claude can read and run read-only commands but cannot edit." },
      { heading: "Four phases", body: "Explore in plan mode → ask Claude for a detailed plan → exit plan mode and implement → Claude runs tests/build to verify." },
      { heading: "When to use it", body: "Worth it for multi-file changes or unfamiliar code; it's overhead for typos, renames, and single-file fixes. Press <code>Ctrl+G</code> to open the plan in your editor." }
    ],
    quiz: [
      { q: "Adding OAuth touches auth, sessions, and API routes. Recommended workflow?", options: ["Implement directly in default mode", "Plan mode to explore + plan, then implement", "Run /init for a plan", "Use a hook"], answer: 1, explanation: "Explore and plan in plan mode, then implement — best for multi-file changes." },
      { q: "How do you open a plan in your text editor before Claude proceeds?", options: ["/edit", "Ctrl+E", "Ctrl+G", "/open-plan"], answer: 2, explanation: "Ctrl+G opens the plan in your editor for direct edits." },
      { q: "Plan mode is poor value for which task?", options: ["A multi-file refactor", "Unfamiliar architecture", "A single-line typo fix", "Adding a new subsystem"], answer: 2, explanation: "Planning is overhead for trivial, single-file changes." }
    ],
    challenge: [
      { text: "Enter plan mode and have Claude produce a plan for a small multi-step change.", link: DOC + "permission-modes" },
      { text: "Press <code>Ctrl+G</code> to open and tweak the plan in your editor.", link: DOC + "interactive-mode" },
      { text: "Exit plan mode, let Claude implement, and confirm it verifies with tests or a build.", link: DOC + "common-workflows" },
      { text: "<b>Capstone:</b> pick a project feature that touches several files, have Claude plan it in plan mode, tweak the plan, then implement and verify.", link: DOC + "common-workflows", capstone: true }
    ]
  },
  {
    day: 18,
    title: "Running Claude Autonomously",
    section: "Workflows",
    lesson: [
      { heading: "Non-interactive mode", body: "<code>claude -p \"prompt\"</code> runs a one-off task with no session — great for CI, pre-commit hooks, and scripts. Add <code>--output-format json</code> (or stream-json) to parse results programmatically." },
      { heading: "Parallel & background", body: "Use git worktrees so isolated sessions don't collide. <code>/background</code> detaches the current session to keep running; check it with <code>/tasks</code> or reconnect later." },
      { heading: "Unattended permissions", body: "<code>--permission-mode auto</code> uses background safety checks; <code>--permission-mode bypassPermissions</code> (isolated environments only) skips prompts except root/home removals." }
    ],
    quiz: [
      { q: "Integrate Claude into CI to analyze test failures. Right approach?", options: ["Start an interactive session and wait", "claude -p \"analyze these failures and suggest fixes\"", "Auto mode in a terminal", "A scheduled routine"], answer: 1, explanation: "Non-interactive -p mode is built for CI, scripts, and automation." },
      { q: "Running non-interactively over 50 files, you want structured output. Add:", options: ["--verbose", "--output-format json", "--streaming", "--results"], answer: 1, explanation: "--output-format json (or stream-json) makes results parseable in scripts." },
      { q: "How do you keep a session running after detaching your terminal?", options: ["/clear", "/background, then check /tasks", "/resume", "Close the terminal"], answer: 1, explanation: "/background detaches the session; /tasks lets you check on it." }
    ],
    challenge: [
      { text: "Run a real one-off task with <code>claude -p \"…\"</code> and observe it finish without a session.", link: DOC + "headless" },
      { text: "Add <code>--output-format json</code> and inspect the structured result.", link: DOC + "cli-reference" },
      { text: "Reflect: you've finished all 18 days — pick one feature to make part of your daily workflow.", link: DOC + "best-practices" },
      { text: "<b>Capstone graduation:</b> automate one real task on your project with <code>claude -p \"…\"</code> (e.g. generate its README or run a check), then choose the Claude Code habit you'll keep using.", link: DOC + "headless", capstone: true }
    ]
  }
];
