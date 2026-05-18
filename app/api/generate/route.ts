import { errorResponse, successResponse } from "@/lib/api";
import { db } from "@/lib/db";
import { generateImage, PollinationsError } from "@/lib/pollinations";
import { saveImageToDisk } from "@/lib/storage";
import { validateGenerateRequest } from "@/lib/validation";
import { GeneratedImage } from "@/types";
import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";

export const maxDuration = 60;

const POLLINATIONS_ERROR_MAP = {
  TIMEOUT: "AI_API_TIMEOUT",
  INVALID_PROMPT: "INVALID_PROMPT",
  API_ERROR: "AI_API_ERROR",
  EMPTY_RESPONSE: "AI_API_ERROR",
} as const;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse(req, "VALIDATION_ERROR", "Invalid JSON body", 400);
  }

  const validation = validateGenerateRequest(body);
  if (!validation.success) {
    return errorResponse(req, "VALIDATION_ERROR", validation.error, 400);
  }

  const { prompt, style, aspectRatio } = validation.data;

  let result: Awaited<ReturnType<typeof generateImage>>;
  try {
    result = await generateImage(prompt, style, aspectRatio);
  } catch (err) {
    if (err instanceof PollinationsError) {
      return errorResponse(
        req,
        POLLINATIONS_ERROR_MAP[err.code],
        err.message,
        502,
      );
    }
    console.error("[generate] Unexpected error:", err);
    return errorResponse(
      req,
      "INTERNAL_ERROR",
      "An unexpected error occurred",
      500,
    );
  }

  const id = uuidv4();
  let imageUrl: string;
  try {
    imageUrl = await saveImageToDisk(id, result.imageBuffer);
  } catch (err) {
    console.error("[generate] Storage error:", err);
    return errorResponse(
      req,
      "STORAGE_ERROR",
      "Failed to save image. Please try again.",
      500,
    );
  }

  const image: GeneratedImage = {
    id,
    prompt,
    revisedPrompt: result.finalPrompt,
    imageUrl,
    style,
    aspectRatio,
    createdAt: new Date().toISOString(),
    width: result.width,
    height: result.height,
  };

  try {
    db.saveImage(image);
  } catch (err) {
    console.error("[generate] DB error:", err);
  }

  return successResponse(image, "Image generated successfully", 201);
}
