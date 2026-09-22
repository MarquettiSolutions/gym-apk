export type PlansStackParamList = {
  PlansList: undefined;
  PlanEditor: { planId: string };
  DayEditor: { planId: string; dayId: string };
  ExercisePicker: { planId: string; dayId: string };
  ExerciseDetail: { exerciseId: string };
};

export type WorkoutSessionStackParamList = {
  TodayWorkout: undefined;
  WorkoutSession: { sessionId: string };
  RestTimer: { seconds: number };
  ExerciseDetail: { exerciseId: string };
};

export type HistoryStackParamList = {
  HistoryList: undefined;
  SessionDetail: { sessionId: string };
  ExerciseProgress: { exerciseId: string; exerciseName: string };
  BodyWeight: undefined;
};

// Nombres distintos al tab `Exercises` (la pantalla de nivel raíz de este
// stack): React Navigation no permite bien dos rutas anidadas con el mismo
// nombre, ver issue #18.
export type ExercisesStackParamList = {
  ExercisesList: undefined;
  ExerciseDetail: { exerciseId: string };
};

export type RootTabParamList = {
  // Nombre distinto al de WorkoutSessionStackParamList['TodayWorkout'] (la
  // pantalla dentro de ese stack): React Navigation no permite bien dos
  // rutas anidadas con el mismo nombre, ver issue #18.
  TodayTab: undefined;
  Plans: undefined;
  Exercises: undefined;
  History: undefined;
  Settings: undefined;
};
