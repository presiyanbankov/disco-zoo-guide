import hqArtwork from "./hqArtwork.json";

interface DisplayArtwork {
  src: string;
  width: number;
  height: number;
  isHq: boolean;
}

const reviewedArtwork: Readonly<Record<string, Omit<DisplayArtwork, "isHq"> & { originalFallback?: boolean }>> = hqArtwork;

/** Display-only lookup; canonical animal imagePath values remain unchanged. */
export function getAnimalDisplayArtwork(imagePath?: string, failedPath?: string): DisplayArtwork | null {
  if (!imagePath || failedPath === imagePath) return null;
  const hq = reviewedArtwork[imagePath];
  if (hq && failedPath !== hq.src) return { src: hq.src, width: hq.width, height: hq.height, isHq: true };
  // Restored artwork replaces an initial-only SVG, not a canonical game sprite.
  // On failure use the existing accessible unavailable state without a 404.
  if (hq?.originalFallback === false) return null;
  return { src: imagePath, width: 32, height: 23, isHq: false };
}
