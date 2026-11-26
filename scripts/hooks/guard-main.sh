#!/usr/bin/env bash
# PreToolUse hook for Bash: blocks commits and pushes on main and pushes to main.
# Exit 2 denies the tool call and shows stderr to the agent.
set -euo pipefail

input=$(cat)
command=$(jq -r '.tool_input.command // ""' <<<"$input")
cwd=$(jq -r '.cwd // ""' <<<"$input")
[[ -n "$cwd" ]] || cwd="${CLAUDE_PROJECT_DIR:-.}"

# Split the command into simple commands and keep only git commit/push ones,
# so text in arguments, heredocs or other commands does not trigger the guard.
git_cmds=$(sed -E 's/(&&|\|\||;|\|)/\n/g' <<<"$command" |
  grep -E '^[[:space:]]*git([[:space:]]|$)' |
  grep -E '[[:space:]](commit|push)([[:space:]]|$)' || true)
[[ -n "$git_cmds" ]] || exit 0

if grep -E '[[:space:]]push([[:space:]]|$)' <<<"$git_cmds" |
   grep -Eq '[[:space:]:+]main([[:space:]]|$)'; then
  echo "Blocked: pushing to main is not allowed. Push a feature branch and open a PR." >&2
  exit 2
fi

branch=$(git -C "$cwd" branch --show-current 2>/dev/null || true)
if [[ "$branch" == "main" ]]; then
  echo "Blocked: current branch is main. Create a feature branch first: git switch -c feat/<change>" >&2
  exit 2
fi

exit 0
