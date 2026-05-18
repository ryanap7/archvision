"use client";

import { cn } from "@/lib/utils";
import { GeneratedImage } from "@/types";
import { Download, Expand, RefreshCw, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const STYLE_LABELS: Record<string, string> = {
  photorealistic: "Photo",
  "architectural-sketch": "Sketch",
  watercolor: "Watercolor",
  "3d-render": "3D",
  blueprint: "Blueprint",
  minimalist: "Minimal",
};

interface GalleryCardProps {
  image: GeneratedImage;
  priority?: boolean;
  onDelete: (id: string) => void;
  onRegenerate: (image: GeneratedImage) => void;
  onExpand: (image: GeneratedImage) => void;
}

export function GalleryCard({
  image,
  priority = false,
  onDelete,
  onRegenerate,
  onExpand,
}: GalleryCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleDelete = () => {
    if (isDeleting) return;
    setIsDeleting(true);
    onDelete(image.id);
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = image.imageUrl;
    a.download = `archvision-${image.id.slice(0, 8)}.png`;
    a.click();
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#0f0f0f] transition-all duration-500",
        "hover:border-[#c9a84c30] hover:shadow-2xl",
        isDeleting && "opacity-0 scale-95 pointer-events-none",
      )}
      style={{
        transition:
          "opacity 0.3s, transform 0.3s, border-color 0.3s, box-shadow 0.3s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div
        className="relative cursor-pointer overflow-hidden"
        style={{ aspectRatio: image.aspectRatio.replace(":", "/") }}
        onClick={() => onExpand(image)}
      >
        {imageError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0f0f0f] text-[#3a3a3a]">
            <span className="text-xl">⚠</span>
            <span className="text-[10px] tracking-wider">Unavailable</span>
          </div>
        ) : (
          <Image
            src={image.imageUrl}
            alt={image.prompt}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            loading={priority ? "eager" : "lazy"}
            priority={priority}
          />
        )}

        {/* Hover overlay */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-300",
            hovered ? "bg-black/50" : "bg-transparent",
          )}
        >
          <Expand
            className={cn(
              "h-6 w-6 text-white transition-all duration-300",
              hovered ? "opacity-100 scale-100" : "opacity-0 scale-75",
            )}
          />
        </div>

        {/* Style badge */}
        <div className="absolute top-3 left-3">
          <span
            className="rounded-full px-2.5 py-1 text-[9px] font-medium tracking-widest uppercase text-[#c9a84c]"
            style={{
              background: "rgba(8,8,8,0.85)",
              backdropFilter: "blur(8px)",
              border: "1px solid #c9a84c20",
            }}
          >
            {STYLE_LABELS[image.style] ?? image.style}
          </span>
        </div>
      </div>

      {/* Info + Actions */}
      <div
        className={cn(
          "flex flex-col gap-2 p-3 transition-all duration-300",
          hovered ? "opacity-100" : "opacity-70",
        )}
      >
        <p
          className="text-[11px] leading-relaxed text-[#6a6055] line-clamp-2"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {image.prompt}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-[9px] tracking-widest uppercase text-[#2a2520]">
            {new Date(image.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onRegenerate(image)}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[9px] tracking-widest uppercase text-[#4a4035] transition-all hover:text-[#c9a84c]"
              aria-label="Regenerate"
            >
              <RefreshCw className="h-2.5 w-2.5" />
              <span>Regen</span>
            </button>

            <button
              onClick={handleDownload}
              className="rounded-lg p-1.5 text-[#2a2520] transition-all hover:text-[#c9a84c]"
              aria-label="Download"
            >
              <Download className="h-3 w-3" />
            </button>

            <button
              onClick={handleDelete}
              className="rounded-lg p-1.5 text-[#2a2520] transition-all hover:text-red-500"
              aria-label="Delete"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
