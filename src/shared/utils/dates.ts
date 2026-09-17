export function nowIso(): string {
  return new Date().toISOString();
}

// Fecha corta tipo "12 ene" para ejes de gráfico y listas compactas.
export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
  });
}

// Fecha + hora tipo "12 ene 2026, 18:30" para filas de historial.
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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
