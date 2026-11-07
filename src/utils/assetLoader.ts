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

for (const [fullPath, resolvedUrl] of Object.entries(globPhotoModules)) {
  const match = fullPath.match(/photo_(\d+)_/);
  if (match) {
    const id = Number(match[1]);
    const normalized =
      typeof resolvedUrl === 'string' && resolvedUrl.startsWith('/public/')
        ? resolvedUrl.replace(/^\/public/, '')
        : resolvedUrl;
    photoUrlById[id] = normalized;
  }
}

export function getPhotoUrl(photoId: number): string {
  if (photoUrlById[photoId]) {
    return photoUrlById[photoId];
  }
  return `/assets/aistudio/photo_${photoId}.jpg`;
}

export function getLoadedPhotoCount(): number {
  const count = Object.keys(photoUrlById).length;
  return count > 0 ? count : 183;
}

export function getRawTelegramExportText(): string | null {
  const entries = Object.values(globTextModules);
  return entries.length > 0 ? entries[0] : null;
}
