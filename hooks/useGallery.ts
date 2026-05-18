"use client";

import { ApiResponse, GeneratedImage } from "@/types";
import { useCallback, useEffect, useState } from "react";

interface UseGalleryReturn {
  images: GeneratedImage[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addImage: (image: GeneratedImage) => void;
  removeImage: (id: string) => Promise<void>;
}

export function useGallery(): UseGalleryReturn {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGallery = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/gallery", { signal });
      const data: ApiResponse<GeneratedImage[]> = await res.json();

      if (!data.success) throw new Error("Failed to load gallery");

      setImages(data.data);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to load gallery");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchGallery(controller.signal);
    return () => controller.abort();
  }, [fetchGallery]);

  const addImage = useCallback((image: GeneratedImage) => {
    setImages((prev) => [image, ...prev]);
  }, []);

  const removeImage = useCallback(
    async (id: string) => {
      setImages((prev) => prev.filter((img) => img.id !== id));

      try {
        const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
        if (!res.ok) await fetchGallery();
      } catch {
        await fetchGallery();
      }
    },
    [fetchGallery],
  );

  return {
    images,
    isLoading,
    error,
    refresh: fetchGallery,
    addImage,
    removeImage,
  };
}
