import type { Repositories } from '../../../db/repositories';
import {
  copyCustomThumbnail,
  copyCustomVideo,
} from '../../../catalog/customMedia';
import { nowIso } from '../../../shared/utils/dates';
import type { CreateCustomExerciseInput, Exercise } from '../types';

export interface CustomExerciseMediaDeps {
  copyThumbnail: (exerciseId: string, uri: string) => Promise<string>;
  copyVideo: (exerciseId: string, uri: string) => Promise<string>;
}

const defaultDeps: CustomExerciseMediaDeps = {
  copyThumbnail: copyCustomThumbnail,
  copyVideo: copyCustomVideo,
};

export async function createCustomExercise(
  repositories: Repositories,
  userId: string,
  input: CreateCustomExerciseInput,
  deps: CustomExerciseMediaDeps = defaultDeps,
): Promise<Exercise> {
  const created = await repositories.exercises.insertOne({
    name: input.name,
    muscleGroup: input.muscleGroup,
    equipment: input.equipment,
    isCustom: true,
    createdByUserId: userId,
  });

  if (input.thumbnailUri) {
    const path = await deps.copyThumbnail(created.id, input.thumbnailUri);
    await repositories.exercises.updateThumbnailLocalPath(created.id, path);
  }
  if (input.videoUri) {
    const path = await deps.copyVideo(created.id, input.videoUri);
    await repositories.exercises.updateVideoLocalPath(
      created.id,
      path,
      nowIso(),
    );
  }

  return (await repositories.exercises.getById(created.id)) ?? created;
}
