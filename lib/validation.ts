import { ASPECT_RATIOS, STYLE_PRESETS } from "@/types";
import { z } from "zod";

export const generateRequestSchema = z.object({
  prompt: z
    .string()
    .min(3, "Prompt is too short (minimum 3 characters)")
    .max(500, "Prompt is too long (maximum 500 characters)")
    .trim(),
  style: z.enum(STYLE_PRESETS, {
    error: `Invalid style. Must be one of: ${STYLE_PRESETS.join(", ")}`,
  }),
  aspectRatio: z.enum(ASPECT_RATIOS, {
    error: `Invalid aspect ratio. Must be one of: ${ASPECT_RATIOS.join(", ")}`,
  }),
  sourceImageId: z.string().uuid().optional(),
});

export type ValidatedRequest = z.infer<typeof generateRequestSchema>;

export interface ValidationSuccess {
  success: true;
  data: ValidatedRequest;
}

export interface ValidationFailure {
  success: false;
  error: string;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

export function validateGenerateRequest(body: unknown): ValidationResult {
  const result = generateRequestSchema.safeParse(body);

  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  return { success: true, data: result.data };
}
