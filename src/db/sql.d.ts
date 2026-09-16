declare module '*.sql' {
  const content: string;
  export default content;
}

// El bundle de migraciones generado por `npm run db:generate` (drizzle-kit,
// driver 'expo') no trae sus propios tipos.
declare module '*/migrations/migrations' {
  const migrations: {
    journal: {
      entries: {
        idx: number;
        when: number;
        tag: string;
        breakpoints: boolean;
      }[];
    };
    migrations: Record<string, string>;
  };
  export default migrations;
}
