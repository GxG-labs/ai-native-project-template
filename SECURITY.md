# Security

This project is private by default and GitHub-ready when intentionally prepared for publication.

Security rules:

- Do not commit secrets, API keys, tokens, passwords, private keys, or session files.
- Use `.env.example` to document required environment variables.
- Keep real environment files local and ignored by Git.
- Treat local databases, raw exports, and client files as sensitive unless explicitly classified otherwise.
- Before publishing, review `.gitignore`, `PRIVACY.md`, `artifacts/`, `data/`, `references/`, and `tmp/`.

