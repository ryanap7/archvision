import { successResponse } from "@/lib/api";
import { db } from "@/lib/db";

export async function GET() {
  const images = db.getAllImages();
  return successResponse(images, `${images.length} images found`);
}
