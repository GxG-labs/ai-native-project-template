---
name: feature-builder
description: Use when one loop task contains multiple dependent changes that form a feature.
---

# Feature builder

Break the task into the fewest independently checkable candidates. For each candidate run `build` → `write-checks` → `approve-checks`. After the candidates, run the feature-level acceptance checks from `task.md` on the integrated result. A candidate that fails its gate does not become a dependency for the next one.
