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

function parseNetworkError(err: unknown): string {
  if (!(err instanceof Error)) return "An unexpected error occurred.";

  if (
    err.message.includes("Failed to fetch") ||
    err.message.includes("NetworkError") ||
    err.message.includes("ERR_INTERNET_DISCONNECTED") ||
    err.message.includes("ERR_NETWORK")
  ) {
    return "No internet connection. Please check your network and try again.";
  }

  if (err.message.includes("ERR_CONNECTION_REFUSED")) {
    return "Cannot reach the server. Please try again in a moment.";
  }

  if (err.message.includes("timeout") || err.message.includes("AbortError")) {
    return "Request timed out. Please try again.";
  }

  return err.message;
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
        setError(parseNetworkError(err));
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
