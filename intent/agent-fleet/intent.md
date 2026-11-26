# Voice-controlled agent fleet

Owner: user (not a programmer; does not read code, avoids the terminal). Goal: manage a fleet of 5-10 different AI coding agents (Claude, Codex, Pi, Gemini CLI and others) entirely by voice. The user talks to one voice agent (Claude); an orchestrator (Orca) owns tasks, delegation and statuses and runs the executor agents in isolated worktrees; workers' questions come back to the user as spoken questions and are answered by voice. The typical work is developing agents, built through an autonomous development process (intent, spec, plan, executor with an independent critic, one check command, human merge).

Success means: the user gives a task by voice, hears progress and questions by voice, and receives a verified result without opening a terminal or reading code. Chosen bridge: a custom MCP connector over Tailscale Funnel (replaces the Google Sheet queue). Rejected: Multica (too desktop-oriented, built for reading by eye, slow).
