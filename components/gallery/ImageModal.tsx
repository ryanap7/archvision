"use client";

import { GeneratedImage } from "@/types";
import { Download, RefreshCw, X } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

interface ImageModalProps {
  image: GeneratedImage | null;
  onClose: () => void;
  onRegenerate: (image: GeneratedImage) => void;
}

export function ImageModal({ image, onClose, onRegenerate }: ImageModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!image) return null;

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = image.imageUrl;
    a.download = `archvision-${image.id.slice(0, 8)}.png`;
    a.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(4,4,4,0.95)", backdropFilter: "blur(20px)" }}
      onClick={onClose}
    >
      <div
        className="animate-fade-up relative flex max-h-[90vh] max-w-5xl w-full flex-col overflow-hidden rounded-2xl border border-[#1e1e1e]"
        style={{ background: "#0c0c0c" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1a1a1a] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="text-[9px] tracking-[0.3em] uppercase text-[#c9a84c]">
              {image.style}
            </span>
            <span className="text-[#2a2520]">·</span>
            <span className="text-[9px] tracking-widest text-[#3a3530]">
              {image.width} × {image.height}
            </span>
            <span className="text-[#2a2520]">·</span>
            <span className="text-[9px] tracking-widest text-[#3a3530]">
              {image.aspectRatio}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#1e1e1e] text-[#3a3530] transition-all hover:border-[#c9a84c30] hover:text-[#c9a84c]"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Image */}
        <div className="relative flex-1 min-h-0 overflow-hidden bg-[#080808]">
          <Image
            src={image.imageUrl}
            alt={image.prompt}
            width={image.width}
            height={image.height}
            className="max-h-[65vh] w-full object-contain"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 border-t border-[#1a1a1a] px-5 py-4">
          <p
            className="flex-1 text-[11px] leading-relaxed text-[#4a4035] line-clamp-1"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {image.prompt}
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => {
                onRegenerate(image);
                onClose();
              }}
              className="flex items-center gap-1.5 rounded-xl border border-[#c9a84c30] px-3 py-2 text-[10px] tracking-widest uppercase text-[#c9a84c] transition-all hover:bg-[#c9a84c10]"
            >
              <RefreshCw className="h-3 w-3" />
              Regenerate
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-xl border border-[#1e1e1e] px-3 py-2 text-[10px] tracking-widest uppercase text-[#4a4035] transition-all hover:border-[#2a2a2a] hover:text-[#6a6055]"
            >
              <Download className="h-3 w-3" />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
