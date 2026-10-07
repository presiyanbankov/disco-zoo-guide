"use client";

import Image from "next/image";
import { useState } from "react";
import { getAnimalDisplayArtwork } from "./animalArtworkPresentation";

export function AnimalArtwork({ name, imagePath, transitionName, context = "collection" }: { id: string; name: string; imagePath?: string; transitionName?: string; context?: "collection" | "detail" }) {
  const [failedPath, setFailedPath] = useState<string>();
  const artwork = getAnimalDisplayArtwork(imagePath, failedPath);
  if (!artwork) {
    return <span className="animal-art-fallback" style={{ viewTransitionName: transitionName }} role="img" aria-label={`${name} artwork unavailable`}>{name.slice(0, 1)}</span>;
  }
  return <Image className={`animal-sprite animal-game-icon${artwork.isHq ? " animal-hq-icon" : ""}`} data-art-context={context} data-art-source={artwork.isHq ? "hq" : "original"} style={{ viewTransitionName: transitionName }} src={artwork.src} alt={name} width={artwork.width} height={artwork.height} onError={() => setFailedPath(artwork.src)} unoptimized />;
}
