export type PlansStackParamList = {
  PlansList: undefined;
  PlanEditor: { planId: string };
  DayEditor: { planId: string; dayId: string };
  ExercisePicker: { planId: string; dayId: string };
};

export type WorkoutSessionStackParamList = {
  TodayWorkout: undefined;
  WorkoutSession: { sessionId: string };
  RestTimer: { seconds: number };
};

export type HistoryStackParamList = {
  HistoryList: undefined;
  SessionDetail: { sessionId: string };
  ExerciseProgress: { exerciseId: string; exerciseName: string };
  BodyWeight: undefined;
};

export type RootTabParamList = {
  TodayWorkout: undefined;
  Plans: undefined;
  Exercises: undefined;
  History: undefined;
  Settings: undefined;
};
