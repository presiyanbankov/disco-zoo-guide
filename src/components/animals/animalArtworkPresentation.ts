import hqArtwork from "./hqArtwork.json";

interface DisplayArtwork {
  src: string;
  width: number;
  height: number;
  isHq: boolean;
}

const reviewedArtwork: Readonly<Record<string, Omit<DisplayArtwork, "isHq">>> = hqArtwork;

/** Display-only lookup; canonical animal imagePath values remain unchanged. */
export function getAnimalDisplayArtwork(imagePath?: string, failedPath?: string): DisplayArtwork | null {
  if (!imagePath || failedPath === imagePath) return null;
  const hq = reviewedArtwork[imagePath];
  if (hq && failedPath !== hq.src) return { ...hq, isHq: true };
  return { src: imagePath, width: 32, height: 23, isHq: false };
}
