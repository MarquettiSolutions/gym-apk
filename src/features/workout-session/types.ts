import type {
  exercises,
  planDayExercises,
  planDays,
  plans,
  workoutSessions,
  workoutSessionSets,
} from '../../db/schema';

export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type WorkoutSessionSet = typeof workoutSessionSets.$inferSelect;
export type PlanDayExercise = typeof planDayExercises.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;

// Estado del entrenamiento de hoy según haya o no plan activo / día que
// entrenar hoy (spec 5.3 y 7.2: "Home / Entrenamiento de hoy").
export type TodayWorkout =
  | { status: 'no-active-plan' }
  | { status: 'rest-day'; plan: typeof plans.$inferSelect }
  | {
      status: 'ready';
      plan: typeof plans.$inferSelect;
      day: typeof planDays.$inferSelect;
      exercises: Array<{
        planDayExercise: PlanDayExercise;
        exercise: Exercise;
      }>;
      // Sesión sin terminar ya empezada hoy para este día, si existe — se
      // usa solo para decidir si el botón dice "Comenzar" o "Continuar".
      existingSessionId: string | null;
    };

// Estado de una serie dentro de la sesión en curso: `latest` es la fila más
// reciente registrada para ese `setNumber` (append-only — ver
// workoutSessionsRepository), o `null` si todavía no se hizo ni se saltó.
export interface SetProgress {
  setNumber: number;
  latest: WorkoutSessionSet | null;
}

export interface ExerciseProgress {
  planDayExercise: PlanDayExercise;
  exercise: Exercise;
  sets: SetProgress[];
  // Último peso/reps registrados para este ejercicio en cualquier sesión
  // pasada, para pre-cargarlo como sugerencia (spec 5.3).
  suggestion: { repsDone: number | null; weightDone: number | null } | null;
}

export interface SessionDetail {
  session: WorkoutSession;
  day: typeof planDays.$inferSelect;
  exercises: ExerciseProgress[];
}

export interface RecordSetInput {
  repsDone: number | null;
  weightDone: number | null;
  weightUnit: string;
  skipped: boolean;
}
