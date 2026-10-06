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
