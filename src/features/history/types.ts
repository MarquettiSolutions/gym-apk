import type {
  bodyWeightLogs,
  exercises,
  workoutSessions,
  workoutSessionSets,
} from '../../db/schema';

export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type WorkoutSessionSet = typeof workoutSessionSets.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type BodyWeightLog = typeof bodyWeightLogs.$inferSelect;

// Resumen de una sesión pasada para la lista del historial (spec 5.4).
// `dayLabel` es null si el día/plan de origen ya se borró (spec 4.4:
// `plan_day_id` es nullable justamente para sobrevivir a ese borrado).
export interface SessionSummary {
  session: WorkoutSession;
  dayLabel: string | null;
  totalSets: number;
  completedSets: number;
}

// Serie (no salteada) dentro del detalle de una sesión pasada, agrupada por
// ejercicio en el orden en que aparecieron durante la sesión.
export interface SessionDetailExercise {
  exercise: Exercise;
  sets: WorkoutSessionSet[];
}

export interface SessionHistoryDetail {
  session: WorkoutSession;
  dayLabel: string | null;
  exercises: SessionDetailExercise[];
}

// Punto de datos para el gráfico simple de progreso por ejercicio.
export interface ProgressPoint {
  date: string;
  weightDone: number | null;
  weightUnit: string;
  repsDone: number | null;
}

export interface ExerciseProgress {
  exercise: Exercise;
  points: ProgressPoint[];
}

export interface StreakInfo {
  days: number;
}

export type BodyWeightRangeFilter = 'week' | 'month' | 'all';
