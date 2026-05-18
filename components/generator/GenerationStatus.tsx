"use client";

import { cn } from "@/lib/utils";
import { GeneratedImage, GenerationStatus } from "@/types";
import { AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";
import Image from "next/image";

interface GenerationStatusProps {
  status: GenerationStatus;
  error: string | null;
  result: GeneratedImage | null;
}

export function GenerationStatusDisplay({
  status,
  error,
  result,
}: GenerationStatusProps) {
  if (status === "idle") return null;

  if (status === "generating") {
    return (
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-8">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border border-[#c9a84c20] animate-ping" />
          <div className="absolute inset-2 rounded-full border border-[#c9a84c40] animate-pulse" />
          <div
            className="absolute inset-3.5 rounded-full bg-[#c9a84c]"
            style={{ animation: "pulse 2s infinite" }}
          />
        </div>
        <div className="text-center">
          <p
            className="text-sm font-light tracking-wide text-[#c8c0b4]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Rendering your vision
          </p>
          <p className="mt-1.5 text-[10px] tracking-wider text-[#3a3530]">
            10 – 30 seconds · please wait
          </p>
        </div>
        <div className="flex items-center gap-2 text-[9px] tracking-widest uppercase text-[#2a2520]">
          <Clock className="h-3 w-3" />
          <span>Pollinations.ai</span>
        </div>
      </div>
    );
  }

  if (status === "error" && error) {
    const isTimeout =
      error.toLowerCase().includes("timeout") ||
      error.toLowerCase().includes("timed out");
    const isInvalidPrompt = error.toLowerCase().includes("rejected");

    return (
      <div
        className={cn(
          "flex flex-col gap-3 rounded-2xl border p-5",
          isTimeout
            ? "border-[#3a2510] bg-[#1a0e08]"
            : isInvalidPrompt
              ? "border-[#3a3010] bg-[#1a1808]"
              : "border-[#3a1010] bg-[#1a0808]",
        )}
      >
        <div className="flex items-start gap-3">
          {isTimeout ? (
            <Clock className="h-4 w-4 text-[#c9641c] mt-0.5 shrink-0" />
          ) : isInvalidPrompt ? (
            <AlertTriangle className="h-4 w-4 text-[#c9a84c] mt-0.5 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 text-[#c94040] mt-0.5 shrink-0" />
          )}
          <div className="flex flex-col gap-1">
            <p
              className={cn(
                "text-xs font-medium tracking-wide",
                isTimeout
                  ? "text-[#c9641c]"
                  : isInvalidPrompt
                    ? "text-[#c9a84c]"
                    : "text-[#c94040]",
              )}
            >
              {isTimeout
                ? "Request Timed Out"
                : isInvalidPrompt
                  ? "Prompt Rejected"
                  : "Generation Failed"}
            </p>
            <p className="text-[11px] leading-relaxed text-[#4a3530]">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "success" && result) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-[#1a2a1a] bg-[#0a120a] p-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-[#4a9a4a]" />
          <span className="text-[10px] tracking-widest uppercase text-[#4a9a4a]">
            Saved to gallery
          </span>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-[#1a2a1a]">
          <Image
            src={result.imageUrl}
            alt={result.prompt}
            width={result.width}
            height={result.height}
            className="w-full object-cover"
            style={{ maxHeight: "200px", objectFit: "cover" }}
          />
        </div>
      </div>
    );
  }

  return null;
}
