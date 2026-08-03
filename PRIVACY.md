# Privacy and Publishing Policy

This repository is intended for public, reusable material. Working context
belongs outside the repository.

## Never publish

- chat transcripts or raw feedback;
- internal handoff documents;
- prompts tied to a private project or person;
- local usernames, home directories, or machine-specific absolute paths;
- API keys, tokens, cookies, credentials, or private URLs;
- generated eval outputs that include private input text.

## Publish safely

- Convert feedback into a general rule in your own words.
- Use fictional product names and `example.com` in examples.
- Use relative paths or explicit CLI arguments in scripts.
- Keep eval workspaces outside version control.
- Review `git diff --cached` before every public commit.
- Run `npm test` before publishing.

## Removal limits

Deleting a file removes it from the current tree, not from existing Git
history or forks. If sensitive content has already been pushed, assess the
content first, rotate any exposed credentials immediately, then rewrite remote
history only with repository-owner approval and a coordinated force push.
