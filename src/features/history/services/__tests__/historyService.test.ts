import { eq } from 'drizzle-orm';
import { createRepositories } from '../../../../db/repositories';
import { createTestDb } from '../../../../db/repositories/testDb';
import { workoutSessions } from '../../../../db/schema';
import { createHistoryService } from '../historyService';

async function setup() {
  const db = createTestDb();
  const repositories = createRepositories(db);
  const service = createHistoryService(repositories);
  const user = await repositories.users.getOrCreateLocalUser();
  await repositories.exercises.insertMany([
    { id: 'ex-1', name: 'Push Up' },
    { id: 'ex-2', name: 'Squat' },
  ]);
  return { service, repositories, db, user };
}

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

// La racha se calcula por día de calendario, y `finish()` siempre usa la
// hora actual — para simular sesiones completadas en días anteriores hay
// que pisar `finishedAt` directo en la DB de test.
async function completeSessionOnDay(
  db: ReturnType<typeof createTestDb>,
  repositories: ReturnType<typeof createRepositories>,
  userId: string,
  dayId: string,
  daysAgo: number,
) {
  const session = await repositories.workoutSessions.create({
    userId,
    planDayId: dayId,
  });
  await repositories.workoutSessions.finish(session.id, 'completed');
  await db
    .update(workoutSessions)
    .set({ finishedAt: isoDaysAgo(daysAgo) })
    .where(eq(workoutSessions.id, session.id));
  return session;
}

describe('historyService', () => {
  it('listSessions arma el resumen de cada sesión con el nombre del día y las series completadas', async () => {
    const { service, repositories, user } = await setup();
    const plan = await repositories.plans.create({
      userId: user.id,
      name: 'Fuerza',
    });
    const day = await repositories.planDays.create({
      planId: plan.id,
      weekday: 1,
      label: 'Día A',
    });
    const session = await repositories.workoutSessions.create({
      userId: user.id,
      planDayId: day.id,
    });
    await repositories.workoutSessions.addSet({
      sessionId: session.id,
      exerciseId: 'ex-1',
      setNumber: 1,
      repsDone: 8,
      weightDone: 40,
      completedAt: isoDaysAgo(0),
    });
    await repositories.workoutSessions.addSet({
      sessionId: session.id,
      exerciseId: 'ex-1',
      setNumber: 2,
      skipped: true,
      completedAt: null,
    });

    const [summary] = await service.listSessions(user.id);

    expect(summary?.dayLabel).toBe('Día A');
    expect(summary?.totalSets).toBe(2);
    expect(summary?.completedSets).toBe(1);
  });

  it('listSessions no rompe si el día/plan de origen ya fue borrado', async () => {
    const { service, repositories, user } = await setup();
    const plan = await repositories.plans.create({
      userId: user.id,
      name: 'Fuerza',
    });
    const day = await repositories.planDays.create({
      planId: plan.id,
      weekday: 1,
    });
    const session = await repositories.workoutSessions.create({
      userId: user.id,
      planDayId: day.id,
    });
    await repositories.planDays.remove(day.id);

    const [summary] = await service.listSessions(user.id);

    expect(summary?.session.id).toBe(session.id);
    expect(summary?.dayLabel).toBeNull();
  });

  it('getSessionDetail agrupa las series por ejercicio quedándose con la fila más reciente de cada serie', async () => {
    const { service, repositories, user } = await setup();
    const plan = await repositories.plans.create({
      userId: user.id,
      name: 'Fuerza',
    });
    const day = await repositories.planDays.create({
      planId: plan.id,
      weekday: 1,
    });
    const session = await repositories.workoutSessions.create({
      userId: user.id,
      planDayId: day.id,
    });
    await repositories.workoutSessions.addSet({
      sessionId: session.id,
      exerciseId: 'ex-1',
      setNumber: 1,
      repsDone: 8,
      weightDone: 40,
      completedAt: isoDaysAgo(0),
    });
    await repositories.workoutSessions.addSet({
      sessionId: session.id,
      exerciseId: 'ex-1',
      setNumber: 1,
      repsDone: 10,
      weightDone: 45,
      completedAt: isoDaysAgo(0),
    });

    const detail = await service.getSessionDetail(session.id);

    expect(detail.exercises).toHaveLength(1);
    expect(detail.exercises[0]?.sets).toHaveLength(1);
    expect(detail.exercises[0]?.sets[0]?.weightDone).toBe(45);
  });

  it('getExerciseProgress devuelve los puntos con peso/reps ordenados de más antiguo a más reciente', async () => {
    const { service, repositories, user } = await setup();
    const plan = await repositories.plans.create({
      userId: user.id,
      name: 'Fuerza',
    });
    const day = await repositories.planDays.create({
      planId: plan.id,
      weekday: 1,
    });
    const session = await repositories.workoutSessions.create({
      userId: user.id,
      planDayId: day.id,
    });
    await repositories.workoutSessions.addSet({
      sessionId: session.id,
      exerciseId: 'ex-1',
      setNumber: 1,
      repsDone: 8,
      weightDone: 40,
      completedAt: '2026-01-01T00:00:00.000Z',
    });
    await repositories.workoutSessions.addSet({
      sessionId: session.id,
      exerciseId: 'ex-1',
      setNumber: 1,
      repsDone: 10,
      weightDone: 45,
      completedAt: '2026-02-01T00:00:00.000Z',
    });

    const progress = await service.getExerciseProgress(user.id, 'ex-1');

    expect(progress.points.map(p => p.weightDone)).toEqual([40, 45]);
  });

  it('getStreak cuenta días consecutivos entrenados hasta hoy', async () => {
    const { service, repositories, db, user } = await setup();
    const plan = await repositories.plans.create({
      userId: user.id,
      name: 'Fuerza',
    });
    const day = await repositories.planDays.create({
      planId: plan.id,
      weekday: 1,
    });
    for (const daysAgo of [0, 1, 2]) {
      await completeSessionOnDay(db, repositories, user.id, day.id, daysAgo);
    }

    const streak = await service.getStreak(user.id);

    expect(streak.days).toBe(3);
  });

  it('getStreak corta la racha si hay un día sin entrenar en el medio', async () => {
    const { service, repositories, db, user } = await setup();
    const plan = await repositories.plans.create({
      userId: user.id,
      name: 'Fuerza',
    });
    const day = await repositories.planDays.create({
      planId: plan.id,
      weekday: 1,
    });
    await completeSessionOnDay(db, repositories, user.id, day.id, 0);
    await completeSessionOnDay(db, repositories, user.id, day.id, 2);

    const streak = await service.getStreak(user.id);

    expect(streak.days).toBe(1);
  });

  it('getStreak no corta la racha si todavía no se entrenó hoy pero sí ayer', async () => {
    const { service, repositories, db, user } = await setup();
    const plan = await repositories.plans.create({
      userId: user.id,
      name: 'Fuerza',
    });
    const day = await repositories.planDays.create({
      planId: plan.id,
      weekday: 1,
    });
    await completeSessionOnDay(db, repositories, user.id, day.id, 1);
    await completeSessionOnDay(db, repositories, user.id, day.id, 2);

    const streak = await service.getStreak(user.id);

    expect(streak.days).toBe(2);
  });

  it('getStreak devuelve 0 si nunca se completó una sesión', async () => {
    const { service, user } = await setup();

    const streak = await service.getStreak(user.id);

    expect(streak.days).toBe(0);
  });
});
