# Issue tracker: Local Markdown

Issues and PRDs for this repo live as markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- The PRD is `.scratch/<feature-slug>/PRD.md`
- Implementation issues are `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`
- QA work goes under `.scratch/qa/<slug>/`
- Triage state is recorded as a `Status:` line near the top of each issue file (see `triage-labels.md` for the role strings)
- Comments and conversation history append to the bottom of the file under a `## Comments` heading

## Reporting

Run `bun run issues:report` to print a Markdown report of implementation issues in `.scratch/**/issues/*.md`.

The report groups issues by `Status:` using the order from `docs/agents/triage-labels.md`, then lists any non-canonical statuses after the canonical triage states. This keeps completed statuses such as `done` visible without changing the canonical triage labels.

Run `bun run qa:report` to print a Markdown list of QA reports under `.scratch/qa/**/REPORT.md` marked with the canonical `needs-triage` status.

## When a skill says "publish to the issue tracker"

Create a new file under `.scratch/<feature-slug>/` (creating the directory if needed).

For QA sessions, create or update files under `.scratch/qa/<slug>/`.

## When a skill says "fetch the relevant ticket"

Read the file at the referenced path. The user will normally pass the path or the issue number directly.
