"""Reject an unfinished task before a copied run starts."""

from pathlib import Path
import re
import sys


task = Path(__file__).with_name("task.md").read_text()
required = (
    "Owner:",
    "## Desired result",
    "## Scope",
    "Permitted paths or components:",
    "Do not change:",
    "Decision requiring a person:",
    "## Acceptance criteria",
    "## Starting evidence",
)
errors = [f"missing {item}" for item in required if item not in task]
if re.search(r"<[^>]+>", task):
    errors.append("replace every <placeholder> in task.md")
if not re.search(r"^Status: `(accepted|in_progress)`$", task, re.MULTILINE):
    errors.append("set task status to `accepted` or `in_progress`")
rows = [line for line in task.splitlines() if line.startswith("| ")]
if len(rows) < 3 or any(len(row.split("|")) != 5 for row in rows):
    errors.append("add at least one three-column acceptance criterion")
if errors:
    print("Preflight failed:\n- " + "\n- ".join(errors), file=sys.stderr)
    sys.exit(1)
print("Preflight passed: task.md is ready for the loop")
