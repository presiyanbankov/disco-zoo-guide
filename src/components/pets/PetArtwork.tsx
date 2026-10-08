"use client";
import { useState } from "react";
import Image from "next/image";
import tiles from "./petTiles.json";

type Artwork = { src: string; width: number; height: number };
export function PetArtwork({ name, imagePath }: { name: string; imagePath: string }) {
  const [failedPath, setFailedPath] = useState<string>();
  const tile = (tiles as Record<string, Artwork>)[name.toLowerCase()];
  const artwork = imagePath.endsWith("artwork-pending.svg") ? tile : { src: imagePath, width: 48, height: 48 };
  if (!artwork || failedPath === artwork.src) return <span className="pet-art-placeholder" role="img" aria-label={`${name}: artwork unavailable`}><span aria-hidden="true">?</span></span>;
  return <span className="pet-tile-frame"><Image src={artwork.src} width={artwork.width} height={artwork.height} alt={name} className="pet-artwork" data-pet-art={tile?.src === artwork.src ? "tile" : "image"} unoptimized onError={() => setFailedPath(artwork.src)} /></span>;
}
