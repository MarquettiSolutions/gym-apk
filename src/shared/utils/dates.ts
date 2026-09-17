export function nowIso(): string {
  return new Date().toISOString();
}

// Medianoche local de hoy, en ISO-8601 UTC — se usa para acotar "sesión
// empezada hoy" al resolver el entrenamiento del día (spec 5.3) sin resumir
// por error una sesión sin terminar de una semana anterior.
export function startOfTodayIso(): string {
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).toISOString();
}
