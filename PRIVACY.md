# Privacy Boundary (public release)

This repository is a **public skill**. Nothing user-specific may live here.

## Never commit

- Raw chat logs, raw user feedback, internal handoff documents.
- Private prompts, project names, project files, URLs, local machine paths,
  usernames.
- Tokens, API keys, cookies, credentials of any kind.
- Eval outputs that embed private inputs.

## Preference learning

- Session-only by default. Cross-session persistence requires explicit consent.
- Persistence writes only whitelisted numeric weights through
  `scripts/preferences.mjs` (keys like `material.glass`, `palette.dark_cyan`).
- Raw feedback is never stored anywhere; only the derived weight deltas.
- Preferences re-rank recommendations only — they never auto-select for the
  user and never rewrite the public SKILL.md.
- `forget` and `reset` must actually delete data, not tombstone it.

## History

If sensitive material was ever committed, local history must be rewritten and
the owner must approve any remote force-push after a recoverable bundle backup.
