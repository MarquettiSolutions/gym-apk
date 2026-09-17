export type PlansStackParamList = {
  PlansList: undefined;
  PlanEditor: { planId: string };
  DayEditor: { planId: string; dayId: string };
  ExercisePicker: { planId: string; dayId: string };
};

export type RootTabParamList = {
  TodayWorkout: undefined;
  Plans: undefined;
  Exercises: undefined;
  History: undefined;
  Settings: undefined;
};
