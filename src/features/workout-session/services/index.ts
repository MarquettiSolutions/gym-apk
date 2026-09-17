import { repositories } from '../../../db/client';
import { createWorkoutSessionService } from './workoutSessionService';

export * from './workoutSessionService';
export * from './restNotifications';

// Instancia única sobre la DB real de la app, igual que `plansService`.
export const workoutSessionService = createWorkoutSessionService(repositories);
