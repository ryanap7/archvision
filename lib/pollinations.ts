import { AspectRatio, StylePreset } from "@/types";

const POLLINATIONS_BASE = "https://image.pollinations.ai/prompt";
const REQUEST_TIMEOUT_MS = 45_000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2_000;
const MIN_IMAGE_BYTES = 1_000;

const ASPECT_RATIO_DIMENSIONS: Record<
  AspectRatio,
  { width: number; height: number }
> = {
  "1:1": { width: 1024, height: 1024 },
  "16:9": { width: 1280, height: 720 },
  "4:3": { width: 1024, height: 768 },
  "3:4": { width: 768, height: 1024 },
};

const STYLE_MODIFIERS: Record<StylePreset, string> = {
  photorealistic:
    "photorealistic, ultra-detailed, professional architectural photography, 8k resolution, natural lighting",
  "architectural-sketch":
    "hand-drawn architectural sketch, pencil lines, technical drawing style, hatching, white background",
  watercolor:
    "watercolor painting, soft edges, transparent washes, artistic, architectural illustration",
  "3d-render":
    "3D architectural render, Lumion style, clean materials, dramatic lighting, high quality visualization",
  blueprint:
    "technical blueprint style, white lines on dark blue background, architectural drawing, precise, engineering",
  minimalist:
    "minimalist architecture, clean lines, white and gray tones, simple geometric forms, Scandinavian design",
};

export interface PollinationsResult {
  imageBuffer: Buffer;
  width: number;
  height: number;
  finalPrompt: string;
}

export class PollinationsError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "TIMEOUT"
      | "INVALID_PROMPT"
      | "API_ERROR"
      | "EMPTY_RESPONSE",
  ) {
    super(message);
    this.name = "PollinationsError";
  }
}

function buildPrompt(userPrompt: string, style: StylePreset): string {
  return `${userPrompt}, ${STYLE_MODIFIERS[style]}, architecture, building design`;
}

function buildUrl(prompt: string, width: number, height: number): string {
  const seed = Math.floor(Math.random() * 1_000_000);
  return `${POLLINATIONS_BASE}/${encodeURIComponent(prompt)}?width=${width}&height=${height}&nologo=true&seed=${seed}`;
}

async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new PollinationsError(
        `Request timed out after ${timeoutMs / 1000}s. Please try again.`,
        "TIMEOUT",
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateImage(
  userPrompt: string,
  style: StylePreset,
  aspectRatio: AspectRatio,
): Promise<PollinationsResult> {
  const finalPrompt = buildPrompt(userPrompt, style);
  const { width, height } = ASPECT_RATIO_DIMENSIONS[aspectRatio];
  const url = buildUrl(finalPrompt, width, height);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) await sleep(RETRY_DELAY_MS * attempt);

    try {
      const response = await fetchWithTimeout(url, REQUEST_TIMEOUT_MS);

      if (response.status === 400 || response.status === 422) {
        throw new PollinationsError(
          "Your prompt was rejected. Try rephrasing or removing specific terms.",
          "INVALID_PROMPT",
        );
      }

      if (!response.ok) {
        throw new PollinationsError(
          `Unexpected response status: ${response.status}`,
          "API_ERROR",
        );
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.startsWith("image/")) {
        throw new PollinationsError(
          "Unexpected response format from AI. Please try again.",
          "EMPTY_RESPONSE",
        );
      }

      const imageBuffer = Buffer.from(await response.arrayBuffer());

      if (imageBuffer.length < MIN_IMAGE_BYTES) {
        throw new PollinationsError(
          "AI returned an empty image. Please try a different prompt.",
          "EMPTY_RESPONSE",
        );
      }

      return { imageBuffer, width, height, finalPrompt };
    } catch (err) {
      if (err instanceof PollinationsError && err.code === "INVALID_PROMPT")
        throw err;

      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt < MAX_RETRIES) {
        console.warn(
          `[Pollinations] Attempt ${attempt + 1} failed:`,
          lastError.message,
        );
      }
    }
  }

  if (lastError instanceof PollinationsError) throw lastError;
  throw new PollinationsError(
    `Failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message ?? "Unknown error"}`,
    "API_ERROR",
  );
}
