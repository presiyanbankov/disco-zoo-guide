import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ProgressContext } from "./ProgressProvider";

// Regression fixtures explicitly model an existing visitor with all current guides visible.
export function renderWithFullProgress(children: ReactNode): string {
  return renderToStaticMarkup(<ProgressContext.Provider value={{ preferences: { maxEarthRegionId: "mountain", maxSpaceRegionId: "moon", showTimeless: false }, save: () => {}, openSettings: () => {} }}>{children}</ProgressContext.Provider>);
}
