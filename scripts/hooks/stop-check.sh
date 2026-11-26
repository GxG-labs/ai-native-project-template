#!/usr/bin/env bash
# Stop hook: when code or tests have uncommitted changes, run the project check.
# Exit 2 keeps the agent working and passes the failure output back to it.
set -uo pipefail

input=$(cat)
[[ "$(jq -r '.stop_hook_active // false' <<<"$input")" == "true" ]] && exit 0

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
changes=$(git status --porcelain -- src tests package.json package-lock.json tsconfig.json 2>/dev/null)
[[ -n "$changes" ]] || exit 0

if ! output=$(npm test 2>&1); then
  {
    echo "Stop blocked: 'npm test' fails on the uncommitted changes. Fix the failure, or report it to the user if it is outside this task."
    echo
    tail -n 40 <<<"$output"
  } >&2
  exit 2
fi

exit 0
