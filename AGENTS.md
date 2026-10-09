## Project ownership rules

The project owner is personally implementing and reviewing the
game-domain and solver logic.

AI agents MAY freely create and modify:

- src/app/**
- src/components/**
- src/styles/**
- public/**
- frontend animation, visual effects and sound infrastructure

AI agents MUST request/restrict changes involving:

- src/types/**
- src/data/**
- src/domain/**

AI agents MUST NOT implement or modify algorithms in:

- src/solver/**

The solver files may expose types/interfaces/stubs required by the UI,
but algorithm implementations belong to the project owner.

Do not generate fake canonical solver results.
Do not silently modify game rules or animal patterns to satisfy UI code.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
