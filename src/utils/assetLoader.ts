// Uses literal import.meta.glob so Vite's static AST plugin replaces it with the resolved asset map at bundle time.

let globPhotoModules: Record<string, string> = {};
let globTextModules: Record<string, string> = {};

try {
  globPhotoModules = import.meta.glob('/public/assets/aistudio/*.jpg', {
    eager: true,
    query: '?url',
    import: 'default',
  }) as Record<string, string>;

  globTextModules = import.meta.glob('/public/assets/aistudio/*.txt', {
    eager: true,
    query: '?raw',
    import: 'default',
  }) as Record<string, string>;
} catch {
  // Fallback when executed outside Vite (e.g. Node unit tests)
}

const photoUrlById: Record<number, string> = {};
const realShelfPhotoUrlById: Record<number, string> = {};

for (const [fullPath, resolvedUrl] of Object.entries(globPhotoModules)) {
  const normalized =
    typeof resolvedUrl === 'string' && resolvedUrl.startsWith('/public/')
      ? resolvedUrl.replace(/^\/public/, '')
      : resolvedUrl;

  if (fullPath.includes('2026-11-08')) {
    const shelfMatch = fullPath.match(/photo_(\d+)_2026-11-08/);
    if (shelfMatch) {
      realShelfPhotoUrlById[Number(shelfMatch[1])] = normalized;
    }
    continue;
  }

  const match = fullPath.match(/photo_(\d+)_/);
  if (match) {
    const id = Number(match[1]);
    photoUrlById[id] = normalized;
  }
}

export function getPhotoUrl(photoId: number): string {
  if (photoUrlById[photoId]) {
    return photoUrlById[photoId];
  }
  return `/assets/aistudio/photo_${photoId}.jpg`;
}

export function getRealShelfPhotoUrl(shelfPhotoId: number): string {
  if (realShelfPhotoUrlById[shelfPhotoId]) {
    return realShelfPhotoUrlById[shelfPhotoId];
  }
  return `/assets/aistudio/photo_${shelfPhotoId}_2026-11-08.jpg`;
}

export function getLoadedPhotoCount(): number {
  const count = Object.keys(photoUrlById).length;
  return count > 0 ? count : 183;
}

export function getRawTelegramExportText(): string | null {
  const entries = Object.values(globTextModules);
  return entries.length > 0 ? entries[0] : null;
}
