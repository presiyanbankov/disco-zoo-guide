import type { DisplayStrategy } from "../gridPresentation";

// Test-only arbitrary layout fixture. Never imported by real guide pages.
export const DEV_MOCK_STRATEGY = {
  animalId: "__DEV_LAYOUT_ONLY__",
  steps: [
    { step: 1, cell: { row: 2, col: 2 } },
    { step: 2, cell: { row: 0, col: 3 } },
    { step: 3, cell: { row: 3, col: 0 } },
    { step: 4, cell: { row: 1, col: 1 } },
    { step: 5, cell: { row: 4, col: 4 } },
    { step: 6, cell: { row: 0, col: 0 } },
    { step: 7, cell: { row: 3, col: 3 } },
    { step: 8, cell: { row: 4, col: 1 } },
  ],
} as const satisfies DisplayStrategy;

