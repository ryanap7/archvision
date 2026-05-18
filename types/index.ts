export const STYLE_PRESETS = [
  "photorealistic",
  "architectural-sketch",
  "watercolor",
  "3d-render",
  "blueprint",
  "minimalist",
] as const;

export const ASPECT_RATIOS = ["1:1", "16:9", "4:3", "3:4"] as const;

export const ERROR_CODES = [
  "VALIDATION_ERROR",
  "AI_API_TIMEOUT",
  "AI_API_ERROR",
  "INVALID_PROMPT",
  "STORAGE_ERROR",
  "NOT_FOUND",
  "INTERNAL_ERROR",
] as const;

export type StylePreset = (typeof STYLE_PRESETS)[number];
export type AspectRatio = (typeof ASPECT_RATIOS)[number];
export type ErrorCode = (typeof ERROR_CODES)[number];
export type GenerationStatus = "idle" | "generating" | "success" | "error";

export interface GeneratedImage {
  id: string;
  prompt: string;
  revisedPrompt?: string;
  imageUrl: string;
  style: StylePreset;
  aspectRatio: AspectRatio;
  createdAt: string;
  width: number;
  height: number;
}

export interface GenerateRequest {
  prompt: string;
  style: StylePreset;
  aspectRatio: AspectRatio;
  sourceImageId?: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message: string;
}

export interface ApiError {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    timestamp: string;
    path: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type GenerateResponse = ApiSuccess<GeneratedImage>;
export type GalleryResponse = ApiSuccess<GeneratedImage[]>;
export type DeleteResponse = ApiSuccess<{ id: string }>;

export interface GenerationState {
  status: GenerationStatus;
  error?: string;
  result?: GeneratedImage;
}
