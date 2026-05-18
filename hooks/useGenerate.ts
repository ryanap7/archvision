"use client";

import {
  ApiResponse,
  GeneratedImage,
  GenerateRequest,
  GenerationStatus,
} from "@/types";
import { useCallback, useState } from "react";

interface UseGenerateReturn {
  status: GenerationStatus;
  error: string | null;
  result: GeneratedImage | null;
  generate: (req: GenerateRequest) => Promise<GeneratedImage | null>;
  reset: () => void;
}

export function useGenerate(): UseGenerateReturn {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedImage | null>(null);

  const generate = useCallback(
    async (req: GenerateRequest): Promise<GeneratedImage | null> => {
      setStatus("generating");
      setError(null);
      setResult(null);

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req),
        });

        const data: ApiResponse<GeneratedImage> = await res.json();

        if (!data.success) {
          setError(data.error.message);
          setStatus("error");
          return null;
        }

        setResult(data.data);
        setStatus("success");
        return data.data;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Network error. Check your connection.",
        );
        setStatus("error");
        return null;
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setResult(null);
  }, []);

  return { status, error, result, generate, reset };
}
