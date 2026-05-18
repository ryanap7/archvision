import { GeneratedImage } from "@/types";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "gallery.json");
const WRITE_DEBOUNCE_MS = 100;

interface DbSchema {
  images: GeneratedImage[];
}

let memoryStore: DbSchema = { images: [] };
let initialized = false;
let writeTimer: ReturnType<typeof setTimeout> | null = null;

function ensureDataDir(): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadFromDisk(): DbSchema {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.images)) return { images: [] };
    return parsed as DbSchema;
  } catch {
    return { images: [] };
  }
}

function scheduleDiskWrite(): void {
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(() => {
    ensureDataDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryStore, null, 2), "utf-8");
  }, WRITE_DEBOUNCE_MS);
}

function getStore(): DbSchema {
  if (!initialized) {
    memoryStore = loadFromDisk();
    initialized = true;
  }
  return memoryStore;
}

export const db = {
  getAllImages(): GeneratedImage[] {
    return [...getStore().images].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  getImageById(id: string): GeneratedImage | undefined {
    return getStore().images.find((img) => img.id === id);
  },

  saveImage(image: GeneratedImage): GeneratedImage {
    const store = getStore();
    store.images.push(image);
    scheduleDiskWrite();
    return image;
  },

  deleteImage(id: string): boolean {
    const store = getStore();
    const before = store.images.length;
    store.images = store.images.filter((img) => img.id !== id);
    if (store.images.length === before) return false;
    scheduleDiskWrite();
    return true;
  },
};
