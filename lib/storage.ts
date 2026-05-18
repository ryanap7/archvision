import fs from "fs/promises";
import path from "path";

const GENERATED_DIR = path.join(process.cwd(), "public", "generated");

async function ensureGeneratedDir(): Promise<void> {
  await fs.mkdir(GENERATED_DIR, { recursive: true });
}

export async function saveImageToDisk(
  id: string,
  buffer: Buffer,
): Promise<string> {
  await ensureGeneratedDir();
  const filename = `${id}.png`;
  await fs.writeFile(path.join(GENERATED_DIR, filename), buffer);
  return `/api/images/${filename}`;
}

export async function deleteImageFromDisk(imageUrl: string): Promise<void> {
  try {
    await fs.unlink(path.join(GENERATED_DIR, path.basename(imageUrl)));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("[Storage] Failed to delete image:", err);
    }
  }
}
