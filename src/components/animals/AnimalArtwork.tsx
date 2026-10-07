import Image from "next/image";

/** Approved game icons remain at their original 32x23 pixels on disk. */
export function AnimalArtwork({ name, imagePath, transitionName }: { id: string; name: string; imagePath?: string; transitionName?: string }) {
  if (!imagePath) {
    return <span className="animal-art-fallback" style={{ viewTransitionName: transitionName }} role="img" aria-label={`${name} artwork unavailable`}>{name.slice(0, 1)}</span>;
  }
  return <Image className="animal-sprite animal-game-icon" style={{ viewTransitionName: transitionName }} src={imagePath} alt={name} width={32} height={23} unoptimized />;
}
