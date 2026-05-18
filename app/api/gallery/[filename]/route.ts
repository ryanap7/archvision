import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;

  if (
    !filename.endsWith(".png") ||
    filename.includes("..") ||
    filename.includes("/")
  ) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filepath = path.join(process.cwd(), "public", "generated", filename);

  if (!fs.existsSync(filepath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const buffer = fs.readFileSync(filepath);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
