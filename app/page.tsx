"use client";

import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { GenerationStatusDisplay } from "@/components/generator/GenerationStatus";
import { GeneratorForm } from "@/components/generator/GeneratorForm";
import { useGallery } from "@/hooks/useGallery";
import { useGenerate } from "@/hooks/useGenerate";
import { cn } from "@/lib/utils";
import { GeneratedImage, GenerateRequest } from "@/types";
import { Building2, Plus, Sparkles, X } from "lucide-react";
import { useCallback, useState } from "react";

export default function Home() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [prefill, setPrefill] = useState<
    Pick<GeneratedImage, "prompt" | "style" | "aspectRatio"> | undefined
  >();
  const [sourceImageId, setSourceImageId] = useState<string | undefined>();

  const {
    images,
    isLoading,
    error: galleryError,
    addImage,
    removeImage,
  } = useGallery();
  const { status, error: genError, result, generate, reset } = useGenerate();

  const handleGenerate = useCallback(
    async (req: GenerateRequest) => {
      reset();
      const generated = await generate(req);
      if (generated) {
        if (sourceImageId) {
          await removeImage(sourceImageId);
          setSourceImageId(undefined);
        }
        addImage(generated);
      }
    },
    [generate, addImage, removeImage, reset, sourceImageId],
  );

  const handleRegenerate = useCallback(
    (image: GeneratedImage) => {
      setSourceImageId(image.id);
      setPrefill({
        prompt: image.prompt,
        style: image.style,
        aspectRatio: image.aspectRatio,
      });
      reset();
      setPanelOpen(true);
    },
    [reset],
  );

  const openFresh = useCallback(() => {
    setPrefill(undefined);
    reset();
    setPanelOpen(true);
  }, [reset]);

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-40 border-b border-[#ffffff08]"
        style={{ background: "rgba(8,8,8,0.92)", backdropFilter: "blur(24px)" }}
      >
        <div className="mx-auto flex max-w-400 items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{
                background: "linear-gradient(135deg, #c9a84c, #8b6914)",
              }}
            >
              <Building2 className="h-4 w-4 text-black" />
            </div>
            <div className="flex flex-col">
              <span
                className="text-sm font-semibold text-[#e8e0d4]"
                style={{ fontFamily: "Georgia, serif", letterSpacing: "0.2em" }}
              >
                ARCHVISION
              </span>
              <span className="text-[9px] tracking-[0.25em] uppercase text-[#3a3530]">
                AI Architecture Studio
              </span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            {images.length > 0 && (
              <span className="text-[11px] tracking-widest uppercase text-[#3a3530]">
                {images.length} {images.length === 1 ? "work" : "works"}
              </span>
            )}
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[#c9a84c] animate-pulse" />
              <span className="text-[10px] tracking-widest uppercase text-[#3a3530]">
                Live
              </span>
            </div>
            <button
              onClick={openFresh}
              className={cn(
                "flex items-center gap-2 rounded-lg px-5 py-2.5 text-[11px] font-semibold tracking-widest uppercase transition-all duration-300",
                panelOpen
                  ? "border border-[#2a2a2a] text-[#4a4a4a]"
                  : "text-black hover:opacity-90 hover:scale-[1.02]",
              )}
              style={
                !panelOpen
                  ? { background: "linear-gradient(135deg, #c9a84c, #8b6914)" }
                  : {}
              }
            >
              <Plus className="h-3.5 w-3.5" />
              Generate
            </button>
          </div>
        </div>
      </header>

      {/* Gallery */}
      <main className="mx-auto max-w-400 px-6 pt-24 pb-12">
        {images.length === 0 && !isLoading ? (
          <div className="flex min-h-[80vh] flex-col items-center justify-center gap-8 text-center">
            <div className="flex flex-col items-center gap-5">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[#1e1e1e]"
                style={{ background: "linear-gradient(135deg, #111, #0a0a0a)" }}
              >
                <Sparkles className="h-8 w-8 text-[#c9a84c]" />
              </div>
              <div>
                <h1
                  className="text-4xl font-light tracking-wide text-[#e8e0d4]"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Your studio awaits
                </h1>
                <p className="mt-3 text-sm tracking-wider text-[#3a3530]">
                  Generate architectural visions — photorealistic, sketched,
                  rendered
                </p>
              </div>
            </div>
            <button
              onClick={openFresh}
              className="rounded-xl px-8 py-4 text-[11px] font-semibold tracking-[0.25em] uppercase text-black transition-all duration-300 hover:opacity-90 hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, #c9a84c, #8b6914)",
              }}
            >
              Create first work
            </button>
          </div>
        ) : (
          <GalleryGrid
            images={images}
            isLoading={isLoading}
            error={galleryError}
            onDelete={removeImage}
            onRegenerate={handleRegenerate}
          />
        )}
      </main>

      {/* Slide-in Panel */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(4,4,4,0.5)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setPanelOpen(false)}
          />

          {/* Panel */}
          <div
            className="animate-slide-in relative flex h-full w-full max-w-105 flex-col overflow-y-auto border-l"
            style={{ background: "#0f0f0f", borderColor: "#ffffff12" }}
          >
            {/* Panel Header */}
            <div
              className="flex items-center justify-between border-b px-6 py-5"
              style={{ borderColor: "#ffffff08" }}
            >
              <div>
                <p className="text-[9px] tracking-[0.35em] uppercase text-[#c9a84c]">
                  Studio
                </p>
                <h2
                  className="mt-1 text-xl font-light text-[#e8e0d4]"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {prefill ? "Refine & Regenerate" : "New Generation"}
                </h2>
              </div>
              <button
                onClick={() => setPanelOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2a2a2a] text-[#6a6a6a] transition-all hover:border-[#c9a84c50] hover:text-[#c9a84c]"
                aria-label="Close panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex flex-1 flex-col gap-6 p-6">
              <GeneratorForm
                onSubmit={handleGenerate}
                isGenerating={status === "generating"}
                prefill={prefill}
              />

              {status !== "idle" && (
                <GenerationStatusDisplay
                  status={status}
                  error={genError}
                  result={result}
                />
              )}

              {/* Tips */}
              <div
                className="rounded-xl border p-4"
                style={{ borderColor: "#ffffff08", background: "#0a0a0a" }}
              >
                <p className="mb-3 text-[9px] tracking-[0.3em] uppercase text-[#3a3530]">
                  Craft your prompt
                </p>
                <ul className="space-y-2.5">
                  {[
                    "Material: concrete, glass, timber, corten steel",
                    "Lighting: golden hour, overcast, dramatic dusk",
                    "Scale: intimate, monumental, human-scale",
                    "Setting: coastal cliff, urban canyon, alpine forest",
                  ].map((tip) => (
                    <li
                      key={tip}
                      className="flex items-start gap-2.5 text-[11px] text-[#4a4540]"
                    >
                      <span className="mt-0.5 shrink-0 text-[#c9a84c60]">
                        —
                      </span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
