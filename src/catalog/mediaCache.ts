import RNBlobUtil from 'react-native-blob-util';

const THUMBNAILS_DIR = `${RNBlobUtil.fs.dirs.DocumentDir}/exercise-thumbnails`;
const VIDEOS_DIR = `${RNBlobUtil.fs.dirs.DocumentDir}/exercise-videos`;

async function ensureDir(dir: string): Promise<void> {
  const alreadyExists = await RNBlobUtil.fs.exists(dir);
  if (!alreadyExists) {
    await RNBlobUtil.fs.mkdir(dir);
  }
}

async function downloadToFile(url: string, path: string): Promise<void> {
  await RNBlobUtil.config({ path }).fetch('GET', url);
}

export function thumbnailLocalPath(exerciseId: string): string {
  return `${THUMBNAILS_DIR}/${exerciseId}.jpg`;
}

export function videoLocalPath(exerciseId: string): string {
  return `${VIDEOS_DIR}/${exerciseId}.mp4`;
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

export async function cacheVideo(
  exerciseId: string,
  remoteUrl: string,
): Promise<string> {
  await ensureDir(VIDEOS_DIR);
  const path = videoLocalPath(exerciseId);
  await downloadToFile(remoteUrl, path);
  return path;
}
