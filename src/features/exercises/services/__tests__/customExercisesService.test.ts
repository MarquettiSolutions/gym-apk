import { createCustomExercise } from '../customExercisesService';
import { createRepositories } from '../../../../db/repositories';
import { createTestDb } from '../../../../db/repositories/testDb';

async function setup() {
  const db = createTestDb();
  const repositories = createRepositories(db);
  const user = await repositories.users.getOrCreateLocalUser();
  return { repositories, user };
}

describe('createCustomExercise', () => {
  it('crea el ejercicio marcado como custom, sin copiar media si no se eligió ninguna', async () => {
    const { repositories, user } = await setup();
    const copyThumbnail = jest.fn();
    const copyVideo = jest.fn();

    const created = await createCustomExercise(
      repositories,
      user.id,
      {
        name: 'Flexiones diamante',
        muscleGroup: 'pecho',
        equipment: null,
        thumbnailUri: null,
        videoUri: null,
      },
      { copyThumbnail, copyVideo },
    );

    expect(created.name).toBe('Flexiones diamante');
    expect(created.isCustom).toBe(true);
    expect(created.createdByUserId).toBe(user.id);
    expect(created.thumbnailLocalPath).toBeNull();
    expect(created.videoLocalPath).toBeNull();
    expect(copyThumbnail).not.toHaveBeenCalled();
    expect(copyVideo).not.toHaveBeenCalled();
  });

  it('copia la foto y el video elegidos y persiste sus paths locales', async () => {
    const { repositories, user } = await setup();
    const copyThumbnail = jest.fn(async () => '/local/thumb.jpg');
    const copyVideo = jest.fn(async () => '/local/video.mp4');

    const created = await createCustomExercise(
      repositories,
      user.id,
      {
        name: 'Sentadilla búlgara',
        muscleGroup: null,
        equipment: 'mancuernas',
        thumbnailUri: 'content://media/photo1',
        videoUri: 'content://media/video1',
      },
      { copyThumbnail, copyVideo },
    );

    expect(copyThumbnail).toHaveBeenCalledWith(
      created.id,
      'content://media/photo1',
    );
    expect(copyVideo).toHaveBeenCalledWith(
      created.id,
      'content://media/video1',
    );
    expect(created.thumbnailLocalPath).toBe('/local/thumb.jpg');
    expect(created.videoLocalPath).toBe('/local/video.mp4');
    expect(created.videoCachedAt).toBeTruthy();
  });
});
