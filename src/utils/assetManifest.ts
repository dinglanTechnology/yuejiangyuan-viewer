import rawManifest from "./manifest.json";

export interface FolderAssets {
  folder: string;
  title?: string;
  panoramas?: string[];
  images?: string[];
  videos?: string[];
}

export interface AssetManifest {
  baseUrl?: string;
  folders: FolderAssets[];
}

export interface IndexedAssets {
  byTitlePanos: Record<string, string[]>;
  byTitleImages: Record<string, string[]>;
  byTitleVideos: Record<string, string[]>;
  titles: string[];
}

function withBase(urlOrPath: string, base?: string): string {
  if (!urlOrPath) return urlOrPath;
  if (/^https?:\/\//i.test(urlOrPath)) return urlOrPath;
  const b = (base || "").replace(/\/$/, "");
  const p = urlOrPath.replace(/^\//, "");
  return b ? `${b}/${p}` : `/${p}`;
}

export function indexManifest(): IndexedAssets {
  const manifest = rawManifest as AssetManifest;
  const base = manifest.baseUrl || "";
  const byTitlePanos: Record<string, string[]> = {};
  const byTitleImages: Record<string, string[]> = {};
  const byTitleVideos: Record<string, string[]> = {};
  const titles: string[] = [];

  for (const f of manifest.folders || []) {
    const title = f.title || f.folder;
    titles.push(title);
    if (f.panoramas?.length) byTitlePanos[title] = f.panoramas.map((p) => withBase(p, base));
    if (f.images?.length) byTitleImages[title] = f.images.map((p) => withBase(p, base));
    if (f.videos?.length) byTitleVideos[title] = f.videos.map((p) => withBase(p, base));
  }

  return { byTitlePanos, byTitleImages, byTitleVideos, titles };
}

export function getFilenameStem(url: string): string {
  try {
    const u = new URL(url, "http://dummy");
    const path = u.pathname;
    const baseEncoded = path.split("/").pop() || "";
    const base = safeDecode(baseEncoded);
    const dot = base.lastIndexOf(".");
    return dot > 0 ? base.slice(0, dot) : base;
  } catch {
    const baseEncoded = url.split("/").pop() || "";
    const base = safeDecode(baseEncoded);
    const dot = base.lastIndexOf(".");
    return dot > 0 ? base.slice(0, dot) : base;
  }
}

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}


