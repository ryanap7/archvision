"use client";

import { cn } from "@/lib/utils";
import {
  ASPECT_RATIOS,
  AspectRatio,
  GeneratedImage,
  GenerateRequest,
  STYLE_PRESETS,
  StylePreset,
} from "@/types";
import { Loader2, Wand2 } from "lucide-react";
import { useState } from "react";

interface GeneratorFormProps {
  onSubmit: (req: GenerateRequest) => void;
  isGenerating: boolean;
  prefill?: Pick<GeneratedImage, "prompt" | "style" | "aspectRatio">;
}

const STYLE_LABELS: Record<StylePreset, { label: string; sub: string }> = {
  photorealistic: { label: "Photo", sub: "Ultra-realistic" },
  "architectural-sketch": { label: "Sketch", sub: "Hand-drawn" },
  watercolor: { label: "Watercolor", sub: "Artistic wash" },
  "3d-render": { label: "3D Render", sub: "Digital viz" },
  blueprint: { label: "Blueprint", sub: "Technical" },
  minimalist: { label: "Minimal", sub: "Clean form" },
};

const RATIO_LABELS: Record<AspectRatio, { label: string; icon: string }> = {
  "1:1": { label: "Square", icon: "□" },
  "16:9": { label: "Wide", icon: "▬" },
  "4:3": { label: "Standard", icon: "▭" },
  "3:4": { label: "Portrait", icon: "▯" },
};

const SUGGESTIONS = [
  "Brutalist concrete library cantilevered over the sea",
  "Glass pavilion floating above a misty alpine lake",
];

export function GeneratorForm({
  onSubmit,
  isGenerating,
  prefill,
}: GeneratorFormProps) {
  const [prompt, setPrompt] = useState(prefill?.prompt ?? "");
  const [style, setStyle] = useState<StylePreset>(
    prefill?.style ?? "photorealistic",
  );
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(
    prefill?.aspectRatio ?? "16:9",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onSubmit({ prompt: prompt.trim(), style, aspectRatio });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Prompt */}
      <div className="flex flex-col gap-2.5">
        <label className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#6a6055]">
          Describe your vision
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A brutalist concrete tower rising from coastal cliffs at golden hour…"
          maxLength={500}
          rows={4}
          disabled={isGenerating}
          className={cn(
            "w-full resize-none rounded-xl px-4 py-3.5",
            "text-sm leading-relaxed text-[#d8d0c4] placeholder:text-[#3a3530]",
            "border border-[#2a2a2a] bg-[#0a0a0a]",
            "focus:outline-none focus:border-[#c9a84c60] focus:ring-1 focus:ring-[#c9a84c20]",
            "transition-all duration-200 disabled:opacity-40",
          )}
          style={{ fontFamily: "Georgia, serif" }}
        />
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setPrompt(s)}
                disabled={isGenerating}
                className="rounded-full border border-[#2a2a2a] px-3 py-1 text-[10px] text-[#4a4540] transition-all hover:border-[#c9a84c50] hover:text-[#c9a84c] disabled:opacity-30 truncate max-w-42.5"
                title={s}
              >
                {s.length > 24 ? s.slice(0, 24) + "…" : s}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-[#3a3530]">
            {prompt.length}/500
          </span>
        </div>
      </div>

      {/* Style */}
      <div className="flex flex-col gap-2.5">
        <label className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#6a6055]">
          Render style
        </label>
        <div className="grid grid-cols-3 gap-2">
          {STYLE_PRESETS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStyle(s)}
              disabled={isGenerating}
              className={cn(
                "flex flex-col items-start gap-1 rounded-xl border px-3 py-3 text-left transition-all duration-200 disabled:opacity-30",
                style === s
                  ? "border-[#c9a84c60] bg-[#c9a84c0d] text-[#c9a84c]"
                  : "border-[#222] bg-[#0a0a0a] text-[#6a6055] hover:border-[#333] hover:text-[#9a9085]",
              )}
            >
              <span className="text-[12px] font-medium">
                {STYLE_LABELS[s].label}
              </span>
              <span className="text-[10px] opacity-60 leading-tight">
                {STYLE_LABELS[s].sub}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Aspect Ratio */}
      <div className="flex flex-col gap-2.5">
        <label className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#6a6055]">
          Aspect ratio
        </label>
        <div className="flex gap-2">
          {ASPECT_RATIOS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setAspectRatio(r)}
              disabled={isGenerating}
              className={cn(
                "flex flex-1 flex-col items-center gap-1.5 rounded-xl border py-3 transition-all duration-200 disabled:opacity-30",
                aspectRatio === r
                  ? "border-[#c9a84c60] bg-[#c9a84c0d] text-[#c9a84c]"
                  : "border-[#222] bg-[#0a0a0a] text-[#6a6055] hover:border-[#333] hover:text-[#9a9085]",
              )}
            >
              <span className="text-lg leading-none">
                {RATIO_LABELS[r].icon}
              </span>
              <span className="text-[10px] font-medium">
                {RATIO_LABELS[r].label}
              </span>
              <span className="text-[9px] opacity-50">{r}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!prompt.trim() || isGenerating}
        className={cn(
          "flex items-center justify-center gap-2.5 rounded-xl py-4 text-[12px] font-semibold tracking-[0.2em] uppercase transition-all duration-300",
          "disabled:opacity-30 disabled:cursor-not-allowed",
          isGenerating
            ? "border border-[#2a2a2a] bg-transparent text-[#4a4540]"
            : "text-black hover:opacity-90 hover:scale-[1.01] shadow-lg shadow-[#c9a84c20]",
        )}
        style={
          !isGenerating && prompt.trim()
            ? { background: "linear-gradient(135deg, #c9a84c, #a07830)" }
            : {}
        }
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating — 10 to 30s
          </>
        ) : (
          <>
            <Wand2 className="h-4 w-4" />
            {prefill ? "Regenerate" : "Generate"}
          </>
        )}
      </button>
    </form>
  );
}
