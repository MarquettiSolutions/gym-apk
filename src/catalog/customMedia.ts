import RNBlobUtil from 'react-native-blob-util';
import { THUMBNAILS_DIR, VIDEOS_DIR, ensureDir } from './mediaCache';

function extensionFromUri(uri: string, fallback: string): string {
  const match = /\.([a-zA-Z0-9]+)(?:\?.*)?$/.exec(uri);
  return match ? (match[1] as string).toLowerCase() : fallback;
}

async function copyFromGallery(
  dir: string,
  destPath: string,
  sourceUri: string,
): Promise<string> {
  await ensureDir(dir);
  await RNBlobUtil.fs.cp(sourceUri, destPath);
  return destPath;
}

export async function copyCustomThumbnail(
  exerciseId: string,
  sourceUri: string,
): Promise<string> {
  const extension = extensionFromUri(sourceUri, 'jpg');
  const destPath = `${THUMBNAILS_DIR}/${exerciseId}.${extension}`;
  return copyFromGallery(THUMBNAILS_DIR, destPath, sourceUri);
}

export async function copyCustomVideo(
  exerciseId: string,
  sourceUri: string,
): Promise<string> {
  const extension = extensionFromUri(sourceUri, 'mp4');
  const destPath = `${VIDEOS_DIR}/${exerciseId}.${extension}`;
  return copyFromGallery(VIDEOS_DIR, destPath, sourceUri);
}
