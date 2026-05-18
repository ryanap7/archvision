"use client";

import { GeneratedImage } from "@/types";
import { useState } from "react";
import { GalleryCard } from "./GalleryCard";
import { ImageModal } from "./ImageModal";

interface GalleryGridProps {
  images: GeneratedImage[];
  isLoading: boolean;
  error: string | null;
  onDelete: (id: string) => void;
  onRegenerate: (image: GeneratedImage) => void;
}

export function GalleryGrid({
  images,
  isLoading,
  error,
  onDelete,
  onRegenerate,
}: GalleryGridProps) {
  const [expandedImage, setExpandedImage] = useState<GeneratedImage | null>(
    null,
  );

  if (isLoading) {
    return (
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="skeleton mb-4 break-inside-avoid rounded-2xl"
            style={{
              height: `${[280, 380, 240, 320, 260, 400, 300, 350][i % 8]}px`,
            }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
        <span className="text-2xl text-[#c9a84c40]">⚠</span>
        <p className="text-sm text-[#6a4a4a]">Failed to load gallery</p>
        <p className="text-xs text-[#3a2a2a]">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
        {images.map((image, i) => (
          <div
            key={image.id}
            className="mb-4 break-inside-avoid animate-fade-up"
            style={{
              animationDelay: `${Math.min(i * 40, 300)}ms`,
              opacity: 0,
              animationFillMode: "forwards",
            }}
          >
            <GalleryCard
              image={image}
              priority={i === 0}
              onDelete={onDelete}
              onRegenerate={onRegenerate}
              onExpand={setExpandedImage}
            />
          </div>
        ))}
      </div>

      <ImageModal
        image={expandedImage}
        onClose={() => setExpandedImage(null)}
        onRegenerate={(img) => {
          onRegenerate(img);
          setExpandedImage(null);
        }}
      />
    </>
  );
}
