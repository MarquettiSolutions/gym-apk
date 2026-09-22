import RNBlobUtil from 'react-native-blob-util';

export const THUMBNAILS_DIR = `${RNBlobUtil.fs.dirs.DocumentDir}/exercise-thumbnails`;
export const VIDEOS_DIR = `${RNBlobUtil.fs.dirs.DocumentDir}/exercise-videos`;

export async function ensureDir(dir: string): Promise<void> {
  const alreadyExists = await RNBlobUtil.fs.exists(dir);
  if (!alreadyExists) {
    await RNBlobUtil.fs.mkdir(dir);
  }
}

async function downloadToFile(
  url: string,
  path: string,
  headers?: Record<string, string>,
): Promise<void> {
  await RNBlobUtil.config({ path }).fetch('GET', url, headers);
}

export function thumbnailLocalPath(exerciseId: string): string {
  return `${THUMBNAILS_DIR}/${exerciseId}.jpg`;
}

// `extension` es parametrizable porque no todos los proveedores de video
// sirven el mismo formato: ExerciseDB sirve GIF, no mp4 (ver
// `videoCache.ts`) — el default `mp4` queda para cuando se sume un proveedor
// de video real.
export function videoLocalPath(
  exerciseId: string,
  extension: string = 'mp4',
): string {
  return `${VIDEOS_DIR}/${exerciseId}.${extension}`;
}

export async function cacheThumbnail(
  exerciseId: string,
  remoteUrl: string,
): Promise<string> {
  await ensureDir(THUMBNAILS_DIR);
  const path = thumbnailLocalPath(exerciseId);
  await downloadToFile(remoteUrl, path);
  return path;
}

export interface CacheVideoOptions {
  extension?: string;
  headers?: Record<string, string>;
}

export async function cacheVideo(
  exerciseId: string,
  remoteUrl: string,
  options: CacheVideoOptions = {},
): Promise<string> {
  await ensureDir(VIDEOS_DIR);
  const path = videoLocalPath(exerciseId, options.extension);
  await downloadToFile(remoteUrl, path, options.headers);
  return path;
}
