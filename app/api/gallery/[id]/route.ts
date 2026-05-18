import { errorResponse, successResponse } from "@/lib/api";
import { db } from "@/lib/db";
import { deleteImageFromDisk } from "@/lib/storage";
import { NextRequest } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const image = db.getImageById(id);
  if (!image) {
    return errorResponse(req, "NOT_FOUND", "Image not found", 404);
  }

  await deleteImageFromDisk(image.imageUrl);
  db.deleteImage(id);

  return successResponse({ id }, "Image deleted successfully");
}
